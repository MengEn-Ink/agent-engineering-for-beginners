import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readdirSync, statSync } from 'node:fs'
import { join, posix, relative } from 'node:path'
import parseSrcset from 'parse-srcset'
import { parse, parseFragment, Tokenizer } from 'parse5'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'
import valueParser from 'postcss-value-parser'
import { SaxesParser } from 'saxes'
import { parse as parseYaml } from 'yaml'

const hiddenHtmlElements = new Set(['script', 'style', 'template', 'noscript'])
const hiddenMarkdownHtmlElements = new Set([
  ...hiddenHtmlElements,
  'code',
  'pre',
  'svg',
])
const hiddenResourceHtmlElements = new Set(['template'])
const hiddenImageHtmlElements = new Set([...hiddenResourceHtmlElements, 'style'])
const localImageBase = new URL('https://local.invalid/')
const htmlNamespace = 'http://www.w3.org/1999/xhtml'
const svgNamespace = 'http://www.w3.org/2000/svg'
const xlinkNamespace = 'http://www.w3.org/1999/xlink'
const xmlNamespace = 'http://www.w3.org/XML/1998/namespace'
const fetchingLinkRels = new Set([
  'icon', 'manifest', 'mask-icon', 'modulepreload', 'prefetch', 'preload', 'stylesheet',
])
const htmlResourceAttributes = new Map([
  ['audio', ['src']],
  ['embed', ['src']],
  ['iframe', ['src']],
  ['input', ['src']],
  ['object', ['data']],
  ['script', ['src']],
  ['track', ['src']],
  ['video', ['src', 'poster']],
])
const svgResourceHrefElements = new Set([
  'animate',
  'animatemotion',
  'animatetransform',
  'cursor',
  'feimage',
  'filter',
  'lineargradient',
  'mpath',
  'pattern',
  'radialgradient',
  'script',
  'set',
  'textpath',
  'use',
])
const svgXmlResourceHrefElements = new Set([
  'animate',
  'animateMotion',
  'animateTransform',
  'cursor',
  'feImage',
  'filter',
  'image',
  'linearGradient',
  'mpath',
  'pattern',
  'radialGradient',
  'script',
  'set',
  'textPath',
  'use',
])
const cssImageContainerFunctions = new Set(['cross-fade', '-webkit-cross-fade', 'image'])
const cssUnresolvedFunctions = new Set(['attr', 'env', 'var'])
const cssResourceFunctions = new Set([
  ...cssImageContainerFunctions,
  ...cssUnresolvedFunctions,
  'image-set',
  '-webkit-image-set',
  'url',
])
const cssResourceProperties = new Set([
  'background',
  'background-image',
  'border-image',
  'border-image-source',
  'backdrop-filter',
  'clip-path',
  'content',
  'cursor',
  'fill',
  'filter',
  'list-style',
  'list-style-image',
  'marker',
  'marker-end',
  'marker-mid',
  'marker-start',
  'mask',
  'mask-border',
  'mask-border-source',
  'mask-image',
  'offset',
  'offset-path',
  'shape-outside',
  'src',
  'stroke',
  '-webkit-backdrop-filter',
  '-webkit-border-image',
  '-webkit-mask',
  '-webkit-mask-box-image',
  '-webkit-mask-box-image-source',
  '-webkit-mask-image',
])
const svgPresentationResourceAttributes = new Set([
  'clip-path',
  'cursor',
  'fill',
  'filter',
  'marker',
  'marker-end',
  'marker-mid',
  'marker-start',
  'mask',
  'stroke',
])
const svgCssResourceProperties = new Set([
  ...cssResourceProperties,
  ...svgPresentationResourceAttributes,
])
const disallowedSvgResourceElements = new Set([
  'animate',
  'animatecolor',
  'animatemotion',
  'animatetransform',
  'discard',
  'mpath',
  'set',
])
const disallowedSvgXmlResourceElements = new Set([
  'animate',
  'animateColor',
  'animateMotion',
  'animateTransform',
  'discard',
  'mpath',
  'set',
])
const htmlAsciiInsensitiveAttributeValues = new Set([
  'accept', 'accept-charset', 'align', 'alink', 'as', 'axis', 'bgcolor', 'charset', 'checked',
  'clear', 'codetype', 'color', 'compact', 'declare', 'defer', 'dir', 'direction',
  'disabled', 'enctype', 'face', 'frame', 'hreflang', 'http-equiv', 'lang', 'language',
  'link', 'media', 'method', 'multiple', 'nohref', 'noresize', 'noshade', 'nowrap',
  'readonly', 'rel', 'rev', 'rules', 'scope', 'scrolling', 'selected', 'shape', 'target',
  'text', 'type', 'valign', 'valuetype', 'vlink',
])
const vitePressIconMaskVersion = '1.6.4'
const vitePressGenericIconSelector = '[class^=vpi-]:not(.bg),[class*=" vpi-"]:not(.bg),.vp-icon:not(.bg)'
const vitePressExternalIconSelector = ':is(.vp-external-link-icon,.vp-doc a[href*="://"],.vp-doc a[target=_blank]):not(:is(.no-icon,svg a,:has(img,svg))):after'
const vitePressIconConsumers = new Map([
  [`${vitePressGenericIconSelector}\0-webkit-mask`, 'var(--icon) no-repeat'],
  [`${vitePressGenericIconSelector}\0mask`, 'var(--icon) no-repeat'],
  [`${vitePressExternalIconSelector}\0-webkit-mask-image`, 'var(--icon)'],
  [`${vitePressExternalIconSelector}\0mask-image`, 'var(--icon)'],
])
const vitePressIconConsumerHash = 'e6249fce861a48ee63402a01e2218f5f6f9dbde35a5def5a4dee6a1ac57af965'
const validatedResourceCandidates = new WeakSet()
const resourceTraversalAbort = Symbol('resourceTraversalAbort')
let resourceOccurrenceId = 0

function validatedCandidateRecord(value, options, sourcePath) {
  const record = {
    occurrenceId: resourceOccurrenceId += 1,
    value,
    normalized: true,
    decoded: true,
    charged: true,
    sourceKind: options.sourceKind ?? 'css',
    sourcePath,
    base: sourcePath,
    chain: [...(options.resourceVisitedPaths ?? [])],
  }
  validatedResourceCandidates.add(record)
  return record
}

function isValidatedCandidateRecord(candidate) {
  return typeof candidate === 'object'
    && candidate !== null
    && validatedResourceCandidates.has(candidate)
}

export function readLockedVitePressVersion(lockText) {
  try {
    const lock = parseYaml(lockText)
    const version = lock?.importers?.['.']?.devDependencies?.vitepress?.version
    const match = typeof version === 'string' ? version.match(/^(\d+\.\d+\.\d+)(?:\(|$)/u) : null
    return match && Object.hasOwn(lock?.packages ?? {}, `vitepress@${match[1]}`)
      ? match[1]
      : null
  } catch {
    return null
  }
}

function attribute(node, name) {
  return node.attrs?.find((candidate) => candidate.name === name)?.value
}

function hasClass(node, expected) {
  return (attribute(node, 'class') ?? '').split(/\s+/u).includes(expected)
}

function visitElements(nodes, callback, hidden = false, hiddenElements = hiddenHtmlElements) {
  for (const node of nodes ?? []) {
    const nextHidden = hidden || hiddenElements.has(node.tagName)
    if (!nextHidden && node.tagName) callback(node)
    if (!nextHidden) visitElements(node.childNodes, callback, false, hiddenElements)
  }
}

function elementsWithin(roots, predicate, hiddenElements = hiddenHtmlElements) {
  const matches = []
  visitElements(roots, (node) => {
    if (predicate(node)) matches.push(node)
  }, false, hiddenElements)
  return matches
}

function visibleText(node, ignoredClasses = new Set(), hiddenElements = hiddenHtmlElements) {
  if (hiddenElements.has(node.tagName) || [...ignoredClasses].some((name) => hasClass(node, name))) {
    return ''
  }
  if (node.nodeName === '#text') return node.value ?? ''
  return (node.childNodes ?? [])
    .map((child) => visibleText(child, ignoredClasses, hiddenElements))
    .join(' ')
}

function normalizedVisibleText(nodes, hiddenElements = hiddenHtmlElements) {
  return nodes.map((node) => visibleText(node, new Set(['header-anchor']), hiddenElements))
    .join(' ')
    .replace(/\p{White_Space}+/gu, ' ')
    .trim()
}

function normalizeRenderedMarkdownHref(href) {
  return typeof href === 'string' && href.startsWith('/')
    ? href.replace(/\.html(?=#|$)/u, '')
    : href
}

function htmlTagEvents(html) {
  const events = []
  const handler = {
    onStartTag: (token) => events.push({ type: 'start', name: token.tagName, selfClosing: token.selfClosing }),
    onEndTag: (token) => events.push({ type: 'end', name: token.tagName }),
    onComment: () => {},
    onDoctype: () => {},
    onEof: () => {},
    onCharacter: () => {},
    onNullCharacter: () => {},
    onWhitespaceCharacter: () => {},
  }
  new Tokenizer({ sourceCodeLocationInfo: false }, handler).write(html, true)
  return events
}

function updateHiddenContainerStack(stack, html) {
  for (const event of htmlTagEvents(html)) {
    const name = event.name.toLowerCase()
    if (event.type === 'start' && hiddenMarkdownHtmlElements.has(name) && !event.selfClosing) {
      stack.push(name)
    } else if (event.type === 'end' && hiddenMarkdownHtmlElements.has(name)) {
      const index = stack.lastIndexOf(name)
      if (index >= 0) stack.splice(index)
    }
  }
}

function hrefsWithin(roots, hiddenElements = hiddenHtmlElements) {
  return elementsWithin(roots, (node) => node.tagName === 'a', hiddenElements)
    .map((node) => attribute(node, 'href') ?? null)
}

function parseSrcsetCandidates(srcset) {
  if (
    typeof srcset !== 'string'
    || srcset.trim() === ''
    || !srcset.isWellFormed()
    || /[\u0000-\u001f\u007f]/u.test(srcset)
  ) return [null]
  try {
    const candidates = parseSrcset(srcset).map((candidate) => candidate.url)
    return candidates.length > 0 && candidates.every((candidate) => candidate !== '')
      ? candidates
      : [null]
  } catch {
    return [null]
  }
}

function imageCandidatesWithin(roots, hiddenElements = hiddenImageHtmlElements) {
  return elementsWithin(
    roots,
    (node) => ['img', 'source', 'image'].includes(node.tagName),
    hiddenElements,
  ).flatMap((node) => {
    if (node.tagName === 'image') {
      return (node.attrs ?? [])
        .filter((candidate) => candidate.name === 'href')
        .map((candidate) => candidate.value)
    }
    return [
      ...(attribute(node, 'src') === undefined ? [] : [attribute(node, 'src')]),
      ...(attribute(node, 'srcset') === undefined
        ? []
        : parseSrcsetCandidates(attribute(node, 'srcset'))),
    ]
  })
}

function decodeCssEscapes(value) {
  let decoded = ''
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== '\\') {
      decoded += value[index]
      continue
    }
    index += 1
    if (index >= value.length) return null
    if (value[index] === '\n' || value[index] === '\f') continue
    if (value[index] === '\r') {
      if (value[index + 1] === '\n') index += 1
      continue
    }
    if (/[0-9a-f]/iu.test(value[index])) {
      const start = index
      while (index + 1 < value.length && index - start < 5 && /[0-9a-f]/iu.test(value[index + 1])) {
        index += 1
      }
      const codePoint = Number.parseInt(value.slice(start, index + 1), 16)
      if (codePoint === 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
        return null
      }
      decoded += String.fromCodePoint(codePoint)
      if (value[index + 1] === '\r' && value[index + 2] === '\n') index += 2
      else if (/[ \t\n\f\r]/u.test(value[index + 1] ?? '')) index += 1
      continue
    }
    decoded += value[index]
  }
  return decoded
}

function consumeCssName(value, start = 0) {
  let position = start
  while (position < value.length) {
    if (/[-_a-z0-9]/iu.test(value[position]) || value.codePointAt(position) >= 0x80) {
      position += 1
      continue
    }
    if (value[position] !== '\\') break
    position += 1
    if (position >= value.length || /[\r\n\f]/u.test(value[position])) return null
    if (/[0-9a-f]/iu.test(value[position])) {
      let digits = 0
      while (digits < 6 && /[0-9a-f]/iu.test(value[position] ?? '')) {
        position += 1
        digits += 1
      }
      if (value[position] === '\r' && value[position + 1] === '\n') position += 2
      else if (/[ \t\n\f\r]/u.test(value[position] ?? '')) position += 1
    } else {
      position += 1
    }
  }
  return { raw: value.slice(start, position), end: position }
}

function normalizeCssFunctionIdentifiers(value) {
  let normalized = ''
  let position = 0
  while (position < value.length) {
    if (value[position] === '/' && value[position + 1] === '*') {
      const end = value.indexOf('*/', position + 2)
      if (end < 0) return null
      normalized += value.slice(position, end + 2)
      position = end + 2
      continue
    }
    if (value[position] === '"' || value[position] === "'") {
      const quote = value[position]
      const start = position
      position += 1
      while (position < value.length && value[position] !== quote) {
        if (value[position] === '\\') position += 1
        position += 1
      }
      if (position >= value.length) return null
      position += 1
      normalized += value.slice(start, position)
      continue
    }
    if (/[-_a-z\\]/iu.test(value[position]) || value.codePointAt(position) >= 0x80) {
      const name = consumeCssName(value, position)
      if (!name) return null
      const decoded = decodeCssEscapes(name.raw)
      if (value[name.end] === '(' && decoded === null) return null
      normalized += value[name.end] === '(' && cssResourceFunctions.has(decoded?.toLowerCase())
        ? decoded
        : name.raw
      position = name.end
      continue
    }
    normalized += value[position]
    position += 1
  }
  return normalized
}

function cssFunctionValue(node) {
  const significant = (node.nodes ?? []).filter((child) =>
    child.type !== 'space' && child.type !== 'comment')
  let value
  if (significant.length === 1 && ['string', 'word'].includes(significant[0].type)) {
    value = significant[0].value
  } else {
    value = valueParser.stringify(node.nodes ?? []).trim()
  }
  return decodeCssEscapes(value)
}

function imageSetResources(node, resolveVariable, resolvingVariables) {
  const groups = [[]]
  for (const child of node.nodes ?? []) {
    if (child.type === 'div' && child.value === ',') groups.push([])
    else if (child.type !== 'space' && child.type !== 'comment') groups.at(-1).push(child)
  }
  const resources = []
  for (const group of groups) {
    const candidate = group[0]
    if (!candidate) return [null]
    let extracted
    if (candidate.type === 'string' || candidate.type === 'word') {
      extracted = [decodeCssEscapes(candidate.value)]
    } else {
      const functionName = candidate.type === 'function'
        ? decodeCssEscapes(candidate.value)?.toLowerCase()
        : null
      if (functionName === 'url') extracted = [cssFunctionValue(candidate)]
      else if (functionName === null) extracted = [null]
      else if (functionName === 'var') {
        extracted = resolveVariable?.(candidate, resolvingVariables, true) ?? [null]
      } else if (cssUnresolvedFunctions.has(functionName)) extracted = [null]
      else if (functionName === 'image') {
        extracted = imageFunctionResources(candidate, resolveVariable, resolvingVariables)
      } else {
        extracted = extractCssNodes(
          candidate.nodes ?? [],
          cssImageContainerFunctions.has(functionName),
          resolveVariable,
          resolvingVariables,
          cssImageContainerFunctions.has(functionName),
        )
      }
    }
    if (extracted.includes(resourceTraversalAbort)) return [resourceTraversalAbort]
    resources.push(...extracted)
  }
  return resources
}

function imageFunctionResources(node, resolveVariable, resolvingVariables) {
  const strings = (node.nodes ?? [])
    .filter((candidate) => candidate.type === 'string')
    .map((candidate) => decodeCssEscapes(candidate.value))
  return [
    ...strings,
    ...extractCssNodes(node.nodes ?? [], true, resolveVariable, resolvingVariables, true),
  ]
}

function extractCssNodes(
  nodes,
  resourceContext = false,
  resolveVariable,
  resolvingVariables,
  variableStringsAreResources = false,
) {
  const resources = []
  for (const node of nodes) {
    if (node.type !== 'function') continue
    const functionName = decodeCssEscapes(node.value)?.toLowerCase()
    if (functionName === null) {
      resources.push(null)
    } else if (functionName === 'url') {
      resources.push(cssFunctionValue(node))
    } else if (functionName === 'image-set' || functionName === '-webkit-image-set') {
      const nested = imageSetResources(node, resolveVariable, resolvingVariables)
      if (nested.includes(resourceTraversalAbort)) return [resourceTraversalAbort]
      resources.push(...nested)
    } else if (functionName === 'image') {
      const nested = imageFunctionResources(node, resolveVariable, resolvingVariables)
      if (nested.includes(resourceTraversalAbort)) return [resourceTraversalAbort]
      resources.push(...nested)
    } else if (resourceContext && functionName === 'var') {
      const resolved = resolveVariable?.(
        node,
        resolvingVariables,
        variableStringsAreResources,
      ) ?? [null]
      if (resolved.includes(resourceTraversalAbort)) return [resourceTraversalAbort]
      resources.push(...resolved)
    } else if (resourceContext && cssUnresolvedFunctions.has(functionName)) {
      resources.push(null)
    } else {
      resources.push(...extractCssNodes(
        node.nodes ?? [],
        resourceContext && cssImageContainerFunctions.has(functionName),
        resolveVariable,
        resolvingVariables,
        variableStringsAreResources
          || (resourceContext && cssImageContainerFunctions.has(functionName)),
      ))
    }
  }
  return resources
}

function extractCssValueResources(
  value,
  resourceContext = false,
  resolveVariable,
  resolvingVariables = new Set(),
) {
  try {
    const normalized = normalizeCssFunctionIdentifiers(value)
    return normalized === null
      ? [null]
      : extractCssNodes(
          valueParser(normalized).nodes,
          resourceContext,
          resolveVariable,
          resolvingVariables,
          false,
        )
  } catch {
    return [null]
  }
}

function consumeCssIdentifier(value) {
  const name = consumeCssName(value)
  return name && { raw: name.raw, rest: value.slice(name.end).trim() }
}

function attributeMatchesValue(node, actual, element) {
  if (!node.operator) return true
  if (node.value === undefined) return false
  const defaultInsensitive = node.insensitive === undefined
    && element?.namespaceURI === htmlNamespace
    && htmlAsciiInsensitiveAttributeValues.has(node.attribute.toLowerCase())
  const insensitive = node.insensitive === true || defaultInsensitive
  const value = insensitive ? node.value.toLowerCase() : node.value
  const candidate = insensitive ? actual.toLowerCase() : actual
  if (node.operator === '=') return candidate === value
  if (node.operator === '~=') return candidate.split(/[ \t\n\f\r]+/u).includes(value)
  if (node.operator === '^=') return candidate.startsWith(value)
  if (node.operator === '$=') return candidate.endsWith(value)
  if (node.operator === '*=') return candidate.includes(value)
  if (node.operator === '|=') return candidate === value || candidate.startsWith(`${value}-`)
  return true
}

function documentMatchesAttribute(node, document) {
  if (document.selectorElements) {
    return document.selectorElements.some((element) => {
      const values = [...element.attributeValues]
        .filter(([name]) => element.namespaceURI === htmlNamespace
          ? name.toLowerCase() === node.attribute.toLowerCase()
          : name === node.attribute)
        .flatMap(([, candidates]) => [...candidates])
      return values.some((value) => attributeMatchesValue(node, value, element))
    })
  }
  return [...(document.attributeValues.get(node.attribute) ?? [])]
    .some((value) => attributeMatchesValue(node, value))
}

function belongsToProjectRule(declaration, projectDocuments) {
  let container = declaration.parent
  let sawRule = false
  while (container) {
    if (container.type === 'rule') {
      sawRule = true
      try {
        let reachable = false
        selectorParser((selectors) => {
          selectors.each((selector) => {
            let hasConservativePseudo = false
            selector.walkPseudos((node) => {
              const pseudo = decodeCssEscapes(node.value)?.toLowerCase()
              if (
                pseudo === null
                || (node.nodes?.length ?? 0) > 0
                || [
                  ':has', ':is', ':not', ':nth-child', ':nth-last-child', ':where',
                ].includes(pseudo)
              ) {
                hasConservativePseudo = true
              }
            })
            if (hasConservativePseudo) {
              reachable = true
              return
            }
            const constraints = []
            selector.walkClasses((node) => {
              constraints.push((document) => document.classTokens.has(node.value))
            })
            selector.walkAttributes((node) => {
              constraints.push((document) => documentMatchesAttribute(node, document))
            })
            if (
              constraints.length === 0
              || projectDocuments.some((document) =>
                constraints.every((constraint) => constraint(document)))
            ) {
              reachable = true
            }
          })
        }).processSync(container.selector)
        if (reachable) return true
      } catch {
        return true
      }
    }
    container = container.parent
  }
  return !sawRule
}

function normalizeSelectorSignature(selector) {
  try {
    return selectorParser().processSync(selector, { lossless: false })
  } catch {
    return null
  }
}

function normalizeDeclarationProperty(property) {
  const decoded = decodeCssEscapes(property)
  if (decoded === null) return null
  return decoded.startsWith('--') ? decoded : decoded.toLowerCase()
}

function declarationAtRuleChain(declaration) {
  const atRules = []
  let container = declaration.parent?.parent
  while (container && container.type !== 'root') {
    if (container.type !== 'atrule') return null
    const name = decodeCssEscapes(container.name)
    if (name === null) return null
    atRules.unshift({ name: name.toLowerCase(), params: container.params.trim() })
    container = container.parent
  }
  return atRules
}

function cssSourceRecords(css, options) {
  const configured = options.allCssSources ?? options.allCss ?? []
  const records = configured.map((source) => typeof source === 'string'
    ? { css: source, sourcePath: null }
    : { css: source.css, sourcePath: source.sourcePath ?? null })
  const current = { css, sourcePath: options.sourcePath ?? null }
  if (records.length === 0) return [current]
  if (!records.some((source) =>
    source.css === current.css && source.sourcePath === current.sourcePath)) {
    records.push(current)
  }
  return records
}

function collectCustomPropertyDefinitions(sources) {
  const definitions = new Map()
  for (const source of sources) {
    if (typeof source.css !== 'string') return null
    let root
    try {
      root = postcss.parse(source.css)
    } catch {
      return null
    }
    let invalidProperty = false
    root.walkDecls((declaration) => {
      const property = normalizeDeclarationProperty(declaration.prop)
      if (property === null) {
        invalidProperty = true
        return
      }
      if (!property.startsWith('--')) return
      const entries = definitions.get(property) ?? []
      entries.push({ value: declaration.value, sourcePath: source.sourcePath })
      definitions.set(property, entries)
    })
    if (invalidProperty) return null
  }
  return definitions
}

function parseVarFunction(node) {
  const divider = (node.nodes ?? []).findIndex((candidate) =>
    candidate.type === 'div' && candidate.value === ',')
  const nameNodes = divider < 0 ? (node.nodes ?? []) : node.nodes.slice(0, divider)
  const rawName = valueParser.stringify(nameNodes).trim()
  const consumed = consumeCssName(rawName)
  const name = consumed?.end === rawName.length ? decodeCssEscapes(consumed.raw) : null
  if (name === null || !name.startsWith('--')) return null
  const fallbackNodes = divider < 0 ? null : node.nodes.slice(divider + 1)
  if (fallbackNodes !== null && !fallbackNodes.some((candidate) =>
    candidate.type !== 'space' && candidate.type !== 'comment')) return null
  return { name, fallbackNodes }
}

function extractCustomPropertyNodes(
  nodes,
  resolveVariable,
  resolvingVariables,
  stringsAreResources = false,
) {
  const resources = []
  for (const node of nodes) {
    if (node.type === 'string') {
      if (stringsAreResources) resources.push(decodeCssEscapes(node.value))
      continue
    }
    if (node.type !== 'function') continue
    const functionName = decodeCssEscapes(node.value)?.toLowerCase()
    if (functionName === null) {
      resources.push(null)
    } else if (functionName === 'url') {
      resources.push(cssFunctionValue(node))
    } else if (functionName === 'var') {
      const resolved = resolveVariable?.(node, resolvingVariables, stringsAreResources) ?? [null]
      if (resolved.includes(resourceTraversalAbort)) return [resourceTraversalAbort]
      resources.push(...resolved)
    } else if (functionName === 'env' || functionName === 'attr') {
      resources.push(null)
    } else if (functionName === 'image-set' || functionName === '-webkit-image-set') {
      const nested = imageSetResources(node, resolveVariable, resolvingVariables)
      if (nested.includes(resourceTraversalAbort)) return [resourceTraversalAbort]
      resources.push(...nested)
    } else {
      const nested = extractCustomPropertyNodes(
        node.nodes ?? [],
        resolveVariable,
        resolvingVariables,
        stringsAreResources || cssImageContainerFunctions.has(functionName),
      )
      if (nested.includes(resourceTraversalAbort)) return [resourceTraversalAbort]
      resources.push(...nested)
    }
  }
  return resources
}

function extractCustomPropertyValueResources(
  value,
  resolveVariable,
  resolvingVariables,
  stringsAreResources = false,
) {
  const trimmed = value.trim()
  if (/^(?:initial|inherit|unset|revert|revert-layer)$/u.test(trimmed)) return [null]
  try {
    const normalized = normalizeCssFunctionIdentifiers(value)
    return normalized === null
      ? [null]
      : extractCustomPropertyNodes(
          valueParser(normalized).nodes,
          resolveVariable,
          resolvingVariables,
          stringsAreResources,
        )
  } catch {
    return [null]
  }
}

function vitePressIconDefinitionHash(definitions) {
  const tuples = definitions.map((declaration) => {
    const selector = declaration.parent?.type === 'rule'
      ? normalizeSelectorSignature(declaration.parent.selector)
      : null
    const property = normalizeDeclarationProperty(declaration.prop)
    if (selector === null || property !== '--icon') return null
    const atRules = declarationAtRuleChain(declaration)
    if (atRules === null) return null
    return { atRules, selector, property, value: declaration.value.trim() }
  })
  if (tuples.some((tuple) => tuple === null)) return null
  tuples.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
  return createHash('sha256').update(JSON.stringify(tuples)).digest('hex')
}

function vitePressIconConsumersHash(consumers) {
  const tuples = consumers.map(({ declaration }) => {
    const selector = declaration.parent?.type === 'rule'
      ? normalizeSelectorSignature(declaration.parent.selector)
      : null
    const property = normalizeDeclarationProperty(declaration.prop)
    const atRules = declarationAtRuleChain(declaration)
    if (selector === null || property === null || atRules === null || declaration.important) {
      return null
    }
    return { atRules, selector, property, value: declaration.value.trim() }
  })
  if (tuples.some((tuple) => tuple === null)) return null
  tuples.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
  return createHash('sha256').update(JSON.stringify(tuples)).digest('hex')
}

function extractSvgXmlResourceCandidates(svg, options = {}) {
  if (/<!DOCTYPE/iu.test(svg)) return null
  let depth = 0
  let rootIsSvg = false
  let roots = 0
  const resources = []
  const elements = []
  const embeddedSources = []
  try {
    const parser = new SaxesParser({ xmlns: true })
    parser.on('opentag', (node) => {
      if (depth === 0) {
        roots += 1
        rootIsSvg = node.uri === svgNamespace && node.local === 'svg'
      }
      depth += 1
      const frame = { isStyle: node.uri === svgNamespace && node.local === 'style', text: '' }
      const attributes = Object.values(node.attributes)
      if (attributes.some((candidate) =>
        candidate.uri === xmlNamespace && candidate.local === 'base')) {
        resources.push(null)
      }
      elements.push(frame)
      if (node.uri !== svgNamespace) return
      if (disallowedSvgXmlResourceElements.has(node.local) || node.local === 'foreignObject') {
        resources.push(null)
      }
      if (svgXmlResourceHrefElements.has(node.local)) {
        for (const candidate of attributes.filter((attribute) => attribute.local === 'href')) {
          resources.push(candidate.uri === '' || candidate.uri === xlinkNamespace
            ? candidate.value
            : null)
        }
      }
      for (const candidate of attributes) {
        if (candidate.uri !== '') continue
        if (svgPresentationResourceAttributes.has(candidate.local)) {
          embeddedSources.push(`publication-resource{${candidate.local}:${candidate.value}}`)
        } else if (candidate.local === 'style') {
          embeddedSources.push(`publication-resource{${candidate.value}}`)
        }
      }
    })
    const appendStyleText = (text) => {
      const frame = elements.at(-1)
      if (frame?.isStyle) frame.text += text
    }
    parser.on('text', appendStyleText)
    parser.on('cdata', appendStyleText)
    parser.on('processinginstruction', () => {
      resources.push(null)
    })
    parser.on('closetag', () => {
      const frame = elements.pop()
      if (frame?.isStyle) embeddedSources.push(frame.text)
      depth -= 1
    })
    parser.write(svg).close()
    if (roots !== 1 || !rootIsSvg || depth !== 0) return null
    const nestedSources = embeddedSources.map((css) => ({
      css,
      sourcePath: options.sourcePath ?? null,
    }))
    const nestedOptions = {
      ...options,
      allCss: undefined,
      allCssSources: nestedSources,
      analysisCache: {},
      validateAllDiscoveredResources: true,
    }
    const embeddedResources = nestedSources.flatMap((source) => embeddedCssResourceCandidates(
      source.css,
      true,
      { ...nestedOptions, sourcePath: source.sourcePath },
    ))
    if (embeddedResources.some((candidate) => candidate === null)) resources.push(null)
    return resources
  } catch {
    return null
  }
}

function parseResourceCandidate(candidate, base = localImageBase) {
  if (
    typeof candidate !== 'string'
    || candidate === ''
    || !candidate.isWellFormed()
    || /[\u0000-\u001f\u007f]/u.test(candidate)
  ) return null
  const value = candidate.trim()
  if (value === '') return null
  const explicitScheme = value.match(/^([a-z][a-z0-9+.-]*):/iu)?.[1].toLowerCase() ?? null
  try {
    const url = explicitScheme === null ? new URL(value, base) : new URL(value)
    return { value, canonical: url.href, explicitScheme, url }
  } catch {
    return null
  }
}

function decodeUtf8DataResource(candidate, expectedMediaType) {
  const colon = candidate.indexOf(':')
  const comma = candidate.indexOf(',')
  if (colon < 0 || comma < colon) return null
  const metadata = candidate.slice(colon + 1, comma).split(';').map((part) => part.trim())
  if (metadata.shift()?.toLowerCase() !== expectedMediaType) return null
  let base64 = false
  let charset = null
  for (const parameter of metadata) {
    if (parameter.toLowerCase() === 'base64') {
      if (base64) return null
      base64 = true
      continue
    }
    const match = parameter.match(/^charset=(.+)$/iu)
    if (!match || charset !== null || match[1].toLowerCase() !== 'utf-8') return null
    charset = 'utf-8'
  }
  try {
    const payload = candidate.slice(comma + 1)
    if (!base64) {
      const decoded = decodeURIComponent(payload)
      return Buffer.byteLength(decoded, 'utf8') <= 1_000_000 ? decoded : null
    }
    if (!/^(?:[a-z0-9+/]{4})*(?:[a-z0-9+/]{2}==|[a-z0-9+/]{3}=)?$/iu.test(payload)) {
      return null
    }
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.from(payload, 'base64'))
    return Buffer.byteLength(decoded, 'utf8') <= 1_000_000 ? decoded : null
  } catch {
    return null
  }
}

function decodeSvgDataResource(candidate) {
  return decodeUtf8DataResource(candidate, 'image/svg+xml')
}

function isSvgDataResource(candidate) {
  const colon = candidate.indexOf(':')
  const comma = candidate.indexOf(',')
  if (colon < 0 || comma < colon) return false
  return candidate.slice(colon + 1, comma).split(';', 1)[0].trim().toLowerCase()
    === 'image/svg+xml'
}

function isCssDataResource(candidate) {
  const colon = candidate.indexOf(':')
  const comma = candidate.indexOf(',')
  if (colon < 0 || comma < colon) return false
  return candidate.slice(colon + 1, comma).split(';', 1)[0].trim().toLowerCase() === 'text/css'
}

function localResourcePath(candidate, sourcePath) {
  try {
    const base = new URL(sourcePath ?? '', localImageBase)
    const parsed = parseResourceCandidate(candidate, base)
    if (parsed === null) return null
    const { url } = parsed
    if (url.origin !== localImageBase.origin || url.username !== '' || url.password !== '') {
      return null
    }
    return decodeURIComponent(url.pathname)
      .replace(/^\/agent-engineering-for-beginners\//u, '')
      .replace(/^\//u, '')
  } catch {
    return null
  }
}

function normalizeSafeResourceCandidate(
  candidate,
  options,
  depth = 0,
  sourcePath = null,
  visitedPaths = new Set(),
) {
  if (depth > 2 || typeof candidate !== 'string') return null
  let base
  try {
    base = new URL(sourcePath ?? '', localImageBase)
  } catch {
    return null
  }
  const parsedCandidate = parseResourceCandidate(candidate, base)
  if (parsedCandidate === null) return null
  const resourceBudget = options.resourceBudget ?? { steps: 0, decodedBytes: 0 }
  resourceBudget.steps += 1
  if (resourceBudget.steps > 64) return null
  const traversalOptions = { ...options, resourceBudget }
  const { url } = parsedCandidate
  const value = url.protocol === 'data:' ? parsedCandidate.canonical : parsedCandidate.value
  if (parsedCandidate.value.startsWith('#')) return parsedCandidate.value
  if (parsedCandidate.explicitScheme !== null && parsedCandidate.explicitScheme !== 'data') {
    return null
  }
  if (parsedCandidate.explicitScheme === 'data') {
    if (isSvgDataResource(value)) {
      const svg = decodeSvgDataResource(value)
      if (svg === null) return null
      resourceBudget.decodedBytes += Buffer.byteLength(svg, 'utf8')
      if (resourceBudget.decodedBytes > 1_000_000) return null
      const nestedTraversalOptions = traversalOptions
      const resources = extractSvgXmlResourceCandidates(svg, {
        ...nestedTraversalOptions,
        sourcePath,
        resourceDepth: depth + 1,
        resourceVisitedPaths: visitedPaths,
        skipVitePressPolicy: true,
      })
      if (resources === null || !resources.every((nested) =>
        normalizeSafeResourceCandidate(
          nested,
          nestedTraversalOptions,
          depth + 1,
          sourcePath,
          visitedPaths,
        ) !== null)) return null
      return value
    }
    if (isCssDataResource(value)) {
      const css = decodeUtf8DataResource(value, 'text/css')
      if (css === null) return null
      resourceBudget.decodedBytes += Buffer.byteLength(css, 'utf8')
      if (resourceBudget.decodedBytes > 1_000_000) return null
      const inheritedSources = (options.allCssSources ?? options.allCss ?? []).map((source) =>
        typeof source === 'string'
          ? { css: source, sourcePath: null }
          : { css: source.css, sourcePath: source.sourcePath ?? null })
      const cssSource = { css, sourcePath: value }
      const nestedOptions = {
        ...traversalOptions,
        sourcePath: value,
        allCss: undefined,
        allCssSources: [...inheritedSources, cssSource],
        analysisCache: {},
        resourceDepth: depth + 1,
        resourceVisitedPaths: visitedPaths,
        skipVitePressPolicy: true,
        validateAllDiscoveredResources: true,
      }
      const resources = extractCssResourceCandidates(css, nestedOptions)
      if (resources.some((nested) => nested === null)) return null
      return value
    }
    return value
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (url.origin !== localImageBase.origin) return null
  const relativePath = localResourcePath(value, sourcePath)
  if (relativePath === null) return null
  if (traversalOptions.distFiles && !traversalOptions.distFiles.has(relativePath)) return null
  const svg = traversalOptions.distFileContents?.get(relativePath)
  if (svg === undefined) return `/${relativePath}`
  resourceBudget.decodedBytes += Buffer.byteLength(svg, 'utf8')
  if (visitedPaths.has(relativePath) || resourceBudget.decodedBytes > 1_000_000) return null
  const nestedTraversalOptions = traversalOptions
  const nextVisited = new Set(visitedPaths)
  nextVisited.add(relativePath)
  const resources = extractSvgXmlResourceCandidates(svg, {
    ...nestedTraversalOptions,
    sourcePath: relativePath,
    resourceDepth: depth + 1,
    resourceVisitedPaths: nextVisited,
    skipVitePressPolicy: true,
  })
  if (resources === null || !resources.every((nested) =>
    normalizeSafeResourceCandidate(
      nested,
      nestedTraversalOptions,
      depth + 1,
      relativePath,
      nextVisited,
    ) !== null)) return null
  return `/${relativePath}`
}

function isSafeResourceCandidate(candidate, options, depth = 0, sourcePath = null) {
  return normalizeSafeResourceCandidate(candidate, options, depth, sourcePath) !== null
}

function validateDiscoveredResource(candidate, options, sourcePath) {
  if (isValidatedCandidateRecord(candidate)) return candidate.value
  if (typeof candidate !== 'string') return null
  const value = candidate.trim()
  if (options.validateAllDiscoveredResources) {
    return normalizeSafeResourceCandidate(
      value,
      options,
      options.resourceDepth ?? 0,
      sourcePath,
      options.resourceVisitedPaths ?? new Set(),
    )
  }
  if (isSvgDataResource(value)) {
    return normalizeSafeResourceCandidate(
      value,
      options,
      options.resourceDepth ?? 0,
      sourcePath,
      options.resourceVisitedPaths ?? new Set(),
    ) === null ? null : candidate
  }
  if (isCssDataResource(value)) {
    return normalizeSafeResourceCandidate(
      value,
      options,
      options.resourceDepth ?? 0,
      sourcePath,
      options.resourceVisitedPaths ?? new Set(),
    ) === null ? null : candidate
  }
  const relativePath = localResourcePath(value, sourcePath)
  if (relativePath !== null && options.distFileContents?.has(relativePath)) {
    return normalizeSafeResourceCandidate(
      value,
      options,
      options.resourceDepth ?? 0,
      sourcePath,
      options.resourceVisitedPaths ?? new Set(),
    ) === null ? null : candidate
  }
  return candidate
}

function createCustomPropertyResolver(css, options, sources = cssSourceRecords(css, options)) {
  const cache = options.analysisCache
  const definitions = cache && Object.hasOwn(cache, 'definitions')
    ? cache.definitions
    : collectCustomPropertyDefinitions(sources)
  if (cache) cache.definitions = definitions
  const variableBudgets = new WeakMap()
  const consumeVariableEdge = (resolvingVariables) => {
    const budget = options.resourceBudget
      ?? variableBudgets.get(resolvingVariables)
      ?? { steps: 0, decodedBytes: 0, aborted: false }
    variableBudgets.set(resolvingVariables, budget)
    if (budget.aborted) return null
    budget.variableEdges = (budget.variableEdges ?? 0) + 1
    if (budget.variableEdges > 256) {
      budget.aborted = true
      return null
    }
    return budget
  }
  const validate = (resources, candidateSourcePath) => resources.map((candidate) => {
    if (candidate === resourceTraversalAbort) return resourceTraversalAbort
    if (candidate === null) return null
    if (isValidatedCandidateRecord(candidate)) return candidate
    const normalized = normalizeSafeResourceCandidate(
      candidate,
      options,
      options.resourceDepth ?? 0,
      candidateSourcePath,
      options.resourceVisitedPaths ?? new Set(),
    )
    return normalized === null
      ? null
      : validatedCandidateRecord(normalized, options, candidateSourcePath)
  })
  const resolveDefinitions = (name, resolvingVariables, stringsAreResources) => {
    if (definitions === null || resolvingVariables.has(name)) return [null]
    const possibleDefinitions = definitions.get(name) ?? []
    if (possibleDefinitions.length === 0) return [null]
    const nextResolving = new Set(resolvingVariables)
    nextResolving.add(name)
    const budget = variableBudgets.get(resolvingVariables) ?? options.resourceBudget
    if (budget) variableBudgets.set(nextResolving, budget)
    const resources = []
    for (const definition of possibleDefinitions) {
      if (consumeVariableEdge(nextResolving) === null) return [resourceTraversalAbort]
      const extracted = extractCustomPropertyValueResources(
        definition.value,
        (nested, nestedResolving, nestedStringsAreResources) => resolveAt(
          nested,
          nestedResolving,
          definition.sourcePath,
          nestedStringsAreResources,
        ),
        nextResolving,
        stringsAreResources,
      )
      if (extracted.includes(resourceTraversalAbort)) return [resourceTraversalAbort]
      const validated = validate(extracted, definition.sourcePath)
      if (validated.includes(resourceTraversalAbort)) return [resourceTraversalAbort]
      if (validated.includes(null)) return [null]
      resources.push(...validated)
    }
    return resources
  }
  const resolveAt = (
    node,
    resolvingVariables = new Set(),
    sourcePath = null,
    stringsAreResources = false,
  ) => {
    if (definitions === null) return [null]
    if (consumeVariableEdge(resolvingVariables) === null) return [resourceTraversalAbort]
    const parsed = parseVarFunction(node)
    if (parsed === null || resolvingVariables.has(parsed.name)) return [null]
    const nextResolving = new Set(resolvingVariables)
    nextResolving.add(parsed.name)
    const budget = variableBudgets.get(resolvingVariables) ?? options.resourceBudget
    if (budget) variableBudgets.set(nextResolving, budget)
    const evaluateNodes = (nodes, candidateSourcePath) => validate(
      extractCustomPropertyNodes(
        nodes,
        (nested, nestedResolving, nestedStringsAreResources) => resolveAt(
          nested,
          nestedResolving,
          candidateSourcePath,
          nestedStringsAreResources,
        ),
        nextResolving,
        stringsAreResources,
      ),
      candidateSourcePath,
    )
    const fallbackResources = parsed.fallbackNodes === null
      ? []
      : consumeVariableEdge(nextResolving) === null
        ? [resourceTraversalAbort]
        : evaluateNodes(parsed.fallbackNodes, sourcePath)
    if (fallbackResources.includes(resourceTraversalAbort)) return [resourceTraversalAbort]
    if (fallbackResources.includes(null)) return [null]
    const possibleDefinitions = definitions.get(parsed.name) ?? []
    if (possibleDefinitions.length === 0) {
      return parsed.fallbackNodes === null ? [null] : fallbackResources
    }
    const definitionResources = resolveDefinitions(
      parsed.name,
      resolvingVariables,
      stringsAreResources,
    )
    if (definitionResources.includes(resourceTraversalAbort)) return [resourceTraversalAbort]
    if (definitionResources.includes(null)) return [null]
    return [...definitionResources, ...fallbackResources]
  }
  return {
    definitions,
    forSource: (sourcePath) => (node, resolvingVariables, stringsAreResources) =>
      resolveAt(node, resolvingVariables, sourcePath, stringsAreResources),
    resolveName: (name, sourcePath) => {
      const node = valueParser(`var(${name})`).nodes[0]
      return resolveAt(node, new Set(), sourcePath, true)
    },
  }
}

function exactVitePressIconConsumer(declaration) {
  if (declaration.parent?.type !== 'rule' || declaration.important) return false
  const selector = normalizeSelectorSignature(declaration.parent.selector)
  const atRules = declarationAtRuleChain(declaration)
  if (selector === null || atRules === null || atRules.length !== 0) return false
  const property = normalizeDeclarationProperty(declaration.prop)
  return property !== null
    && vitePressIconConsumers.get(`${selector}\0${property}`) === declaration.value
}

function vitePressIconMaskPolicyIsValid(options, sources, customProperties) {
  const definitions = []
  const consumers = []
  for (const source of sources) {
    let root
    try {
      root = postcss.parse(source.css)
    } catch {
      return false
    }
    root.walkDecls((declaration) => {
      const property = normalizeDeclarationProperty(declaration.prop)
      if (property === null) return
      if (property === '--icon') {
        definitions.push({ declaration, sourcePath: source.sourcePath })
      }
      const selector = declaration.parent?.type === 'rule'
        ? normalizeSelectorSignature(declaration.parent.selector)
        : null
      if (
        selector !== null
        && (selector === vitePressGenericIconSelector || selector === vitePressExternalIconSelector)
        && ['mask', '-webkit-mask', 'mask-image', '-webkit-mask-image'].includes(property)
      ) {
        consumers.push({ declaration, sourcePath: source.sourcePath })
      }
    })
  }
  const present = consumers.length > 0 || definitions.length > 0
  const valid = options.vitePressVersion === vitePressIconMaskVersion
    && (
    consumers.length !== vitePressIconConsumers.size
    || new Set(consumers.map(({ declaration }) =>
      `${normalizeSelectorSignature(declaration.parent.selector)}\0${normalizeDeclarationProperty(declaration.prop)}`)).size
      !== vitePressIconConsumers.size
    || !consumers.every(({ declaration }) => exactVitePressIconConsumer(declaration))
    || vitePressIconConsumersHash(consumers) !== vitePressIconConsumerHash
    || vitePressIconDefinitionHash(definitions.map(({ declaration }) => declaration))
      !== options.vitePressIconDefinitionHash
      ? false
      : true
    )
  if (!valid) return { present, valid: false }
  const safeDefinition = ({ declaration, sourcePath }) => {
    if (declaration.important) return false
    const resources = extractCustomPropertyValueResources(
      declaration.value,
      customProperties.forSource(sourcePath),
      new Set(['--icon']),
    )
    return resources.every((candidate) => isValidatedCandidateRecord(candidate)
      || isSafeResourceCandidate(candidate, options, 0, sourcePath))
  }
  if (!definitions.every(safeDefinition)) return { present, valid: false }
  return {
    present,
    valid: consumers
    .filter(({ declaration }) =>
      normalizeSelectorSignature(declaration.parent.selector) === vitePressExternalIconSelector)
    .every(({ declaration, sourcePath }) => declaration.parent.nodes.some((candidate) =>
      candidate.type === 'decl'
      && normalizeDeclarationProperty(candidate.prop) === '--icon'
      && safeDefinition({ declaration: candidate, sourcePath }))),
  }
}

export function extractCssResourceCandidates(css, options = {}) {
  try {
    const root = postcss.parse(css)
    const resources = []
    const sources = cssSourceRecords(css, options)
    const customProperties = createCustomPropertyResolver(css, options, sources)
    const vitePressIconMaskPolicy = options.skipVitePressPolicy
      ? { present: false, valid: false }
      : options.analysisCache
        && Object.hasOwn(options.analysisCache, 'vitePressIconMaskPolicy')
        ? options.analysisCache.vitePressIconMaskPolicy
        : vitePressIconMaskPolicyIsValid(options, sources, customProperties)
    if (options.analysisCache && !options.skipVitePressPolicy) {
      options.analysisCache.vitePressIconMaskPolicy = vitePressIconMaskPolicy
    }
    if (
      !options.skipVitePressPolicy
      && (options.requireVitePressIconContract || vitePressIconMaskPolicy.present)
      && !vitePressIconMaskPolicy.valid
    ) {
      resources.push(null)
    }
    const projectDocuments = options.projectDocuments
      ?? (options.projectClassTokenSets ?? []).map((classTokens) => ({
        classTokens: new Set(classTokens),
        attributeValues: new Map([['class', new Set(classTokens)]]),
      }))
    if (projectDocuments.length === 0 && options.projectClassTokens) {
      const classTokens = new Set(options.projectClassTokens)
      projectDocuments.push({
        classTokens,
        attributeValues: new Map([['class', new Set(classTokens)]]),
      })
    }
    root.walkDecls((declaration) => {
      const property = normalizeDeclarationProperty(declaration.prop)
      if (property === null) {
        resources.push(null)
        return
      }
      if (property === '--icon') {
        resources.push(...customProperties.resolveName('--icon', options.sourcePath ?? null))
      }
      if (property.startsWith('--')) return
      if (
        options.resourceDeclarations === 'project'
        && !belongsToProjectRule(declaration, projectDocuments)
      ) return
      const resourceProperties = options.resourceProperties ?? cssResourceProperties
      const dynamicResourceContext = resourceProperties.has(property)
        && !(vitePressIconMaskPolicy.valid && exactVitePressIconConsumer(declaration))
        && (
          options.dynamicResources !== 'project'
          || belongsToProjectRule(declaration, projectDocuments)
        )
      resources.push(...extractCssValueResources(
        declaration.value,
        dynamicResourceContext,
        customProperties.forSource(options.sourcePath ?? null),
      ))
    })
    root.walkAtRules((atRule) => {
      const signature = consumeCssIdentifier(
        `${atRule.name}${atRule.raws.afterName ?? ''}${atRule.params}`,
      )
      if (!signature) {
        resources.push(null)
        return
      }
      const atRuleName = decodeCssEscapes(signature.raw)?.toLowerCase()
      if (atRuleName === null) {
        resources.push(null)
        return
      }
      if (atRuleName !== 'import') return
      const parsed = valueParser(signature.rest)
      const urls = []
      parsed.walk((node) => {
        if (node.type === 'function' && node.value.toLowerCase() === 'url') {
          urls.push(cssFunctionValue(node))
          return false
        }
        return undefined
      })
      if (urls.length > 0) {
        resources.push(...urls)
        return
      }
      const target = parsed.nodes.find((node) =>
        node.type !== 'space' && node.type !== 'comment' && node.type !== 'div')
      resources.push(target && ['string', 'word'].includes(target.type)
        ? decodeCssEscapes(target.value)
        : null)
    })
    return resources.map((candidate) =>
      validateDiscoveredResource(candidate, options, options.sourcePath ?? null))
  } catch {
    return [null]
  }
}

function localStylesheetHrefIsValid(href, options) {
  if (!options.distFiles || !options.sourcePath) return true
  try {
    const basePath = `${options.siteBase ?? ''}/${options.sourcePath}`.replace(/\/+/gu, '/')
    const parsed = parseResourceCandidate(href, new URL(basePath, localImageBase))
    if (parsed === null) return false
    const { url } = parsed
    if (url.protocol === 'data:') return true
    if (url.origin !== localImageBase.origin) return true
    const sitePrefix = `${options.siteBase ?? ''}/`.replace(/\/+/gu, '/')
    if (url.search !== '' || url.hash !== '' || !url.pathname.startsWith(sitePrefix)) return false
    const relativePath = decodeURIComponent(url.pathname.slice(sitePrefix.length))
    const canonicalHref = `${sitePrefix}${relativePath}`
    return href === canonicalHref
      && relativePath.toLowerCase().endsWith('.css')
      && options.distFiles.has(relativePath)
  } catch {
    return false
  }
}

function browserResourceAttributesWithin(roots, options = {}) {
  return elementsWithin(roots, () => true, hiddenResourceHtmlElements).flatMap((node) => {
    const tagName = node.tagName.toLowerCase()
    if (node.namespaceURI === svgNamespace && svgResourceHrefElements.has(tagName)) {
      return (node.attrs ?? [])
        .filter((candidate) => candidate.name === 'href')
        .map((candidate) => candidate.value)
    }
    if (node.namespaceURI !== htmlNamespace) return []
    if (tagName === 'base' || ['embed', 'iframe', 'object'].includes(tagName)) return [null]
    if (tagName === 'link') {
      const rels = (attribute(node, 'rel') ?? '').toLowerCase().split(/\s+/u)
      const imageSrcset = attribute(node, 'imagesrcset')
      const href = attribute(node, 'href')
      const responsiveImagePreload = rels.includes('preload')
        && (attribute(node, 'as') ?? '').toLowerCase() === 'image'
        && imageSrcset !== undefined
      const fetchingRels = rels.filter((rel) => fetchingLinkRels.has(rel))
      const srcsetCanReplaceHref = responsiveImagePreload
        && fetchingRels.every((rel) => rel === 'preload')
      const resources = fetchingRels.length > 0
        ? href === undefined
          ? srcsetCanReplaceHref ? [] : [null]
          : [href]
        : []
      if (
        rels.includes('stylesheet')
        && href !== undefined
        && !localStylesheetHrefIsValid(href, options)
      ) resources.push(null)
      if (responsiveImagePreload) resources.push(...parseSrcsetCandidates(imageSrcset))
      return resources
    }
    return (htmlResourceAttributes.get(tagName) ?? [])
      .map((name) => attribute(node, name))
      .filter((value) => value !== undefined)
  })
}

function embeddedCssResourceCandidates(css, svgContext = false, options = {}) {
  return extractCssResourceCandidates(css, {
    ...options,
    resourceProperties: svgContext ? svgCssResourceProperties : cssResourceProperties,
  })
}

function embeddedCssSourcesWithin(roots) {
  const inlineStyles = elementsWithin(
    roots,
    (node) => attribute(node, 'style') !== undefined,
    hiddenResourceHtmlElements,
  ).map((node) => `publication-resource{${attribute(node, 'style')}}`)
  const styleBlocks = elementsWithin(
    roots,
    (node) => node.tagName === 'style',
    hiddenResourceHtmlElements,
  ).map((node) => visibleText(node, new Set(), hiddenResourceHtmlElements))
  return [...inlineStyles, ...styleBlocks]
}

function documentCssResourceCandidatesWithin(roots, documentFacts, cssOptions = {}, cssSources) {
  const sharedOptions = {
    ...cssOptions,
    projectClassTokens: documentFacts.classTokens,
    projectDocuments: [documentFacts],
    ...(cssOptions.allCssSources || cssOptions.allCss
      ? {}
      : { allCss: cssSources }),
  }
  const inlineStyles = elementsWithin(
    roots,
    (node) => attribute(node, 'style') !== undefined,
    hiddenResourceHtmlElements,
  ).flatMap((node) => embeddedCssResourceCandidates(
    `publication-resource{${attribute(node, 'style')}}`,
    node.namespaceURI === svgNamespace,
    {
      ...sharedOptions,
      dynamicResources: undefined,
      resourceDeclarations: undefined,
    },
  ))
  const styleBlocks = elementsWithin(
    roots,
    (node) => node.tagName === 'style',
    hiddenResourceHtmlElements,
  ).flatMap((node) => embeddedCssResourceCandidates(
    visibleText(node, new Set(), hiddenResourceHtmlElements),
    node.namespaceURI === svgNamespace,
    {
      ...sharedOptions,
      dynamicResources: 'project',
      resourceDeclarations: 'project',
    },
  ))
  return [...inlineStyles, ...styleBlocks]
}

function resourceCandidatesWithin(roots, cssOptions = {}, includeCss = true) {
  const images = imageCandidatesWithin(roots)
  const attributes = browserResourceAttributesWithin(roots, cssOptions)
  const svgElements = elementsWithin(
    roots,
    (node) => node.namespaceURI === svgNamespace,
    hiddenResourceHtmlElements,
  )
  const presentationAttributes = svgElements.flatMap((node) => (node.attrs ?? [])
    .filter((candidate) => svgPresentationResourceAttributes.has(candidate.name))
    .flatMap((candidate) => embeddedCssResourceCandidates(
      `publication-resource{${candidate.name}:${candidate.value}}`,
      true,
      { ...cssOptions, dynamicResources: undefined },
    )))
  const activeSvgResources = svgElements.flatMap((node) => (
    disallowedSvgResourceElements.has(node.tagName.toLowerCase())
    || (node.attrs ?? []).some((candidate) => candidate.name.toLowerCase() === 'xml:base')
      ? [null]
      : []
  ))
  const inlineStyles = includeCss ? elementsWithin(
    roots,
    (node) => attribute(node, 'style') !== undefined,
    hiddenResourceHtmlElements,
  ).flatMap((node) => {
    const css = `publication-resource{${attribute(node, 'style')}}`
    return embeddedCssResourceCandidates(
      css,
      node.namespaceURI === svgNamespace,
      { ...cssOptions, dynamicResources: undefined },
    )
  }) : []
  const styleBlocks = includeCss ? elementsWithin(
    roots,
    (node) => node.tagName === 'style',
    hiddenResourceHtmlElements,
  ).flatMap((node) => embeddedCssResourceCandidates(visibleText(
    node,
    new Set(),
    hiddenResourceHtmlElements,
  ), node.namespaceURI === svgNamespace, cssOptions)) : []
  return {
    images,
    resources: [
      ...images,
      ...attributes,
      ...presentationAttributes,
      ...activeSvgResources,
      ...inlineStyles,
      ...styleBlocks,
    ],
  }
}

function listFiles(root) {
  if (!existsSync(root)) return { files: [], errors: [] }
  const files = []
  const errors = []
  for (const entry of readdirSync(root)) {
    const path = join(root, entry)
    const metadata = lstatSync(path)
    if (metadata.isSymbolicLink()) {
      try {
        statSync(path)
        errors.push({ path, kind: 'symlink' })
      } catch {
        errors.push({ path, kind: 'unreadable' })
      }
    } else if (metadata.isDirectory()) {
      const nested = listFiles(path)
      files.push(...nested.files)
      errors.push(...nested.errors)
    } else {
      files.push(path)
    }
  }
  return { files, errors }
}

export function normalizePublishedOutputPath(file) {
  if (
    file.includes('\0')
    || file.startsWith('/')
    || file.startsWith('\\')
    || /^[A-Za-z]:/u.test(file)
  ) {
    return null
  }

  const normalized = posix.normalize(file.replace(/\\/gu, '/'))
  return normalized === '..' || normalized.startsWith('../') ? null : normalized
}

export function indexDistFiles(root) {
  const files = new Map()
  const rawFiles = []
  const errors = []
  const listed = listFiles(root)
  for (const issue of listed.errors) {
    const raw = relative(root, issue.path)
    errors.push(issue.kind === 'unreadable'
      ? `构建产物包含无法读取的文件：${raw}`
      : `构建产物包含符号链接：${raw}`)
  }
  for (const absolute of listed.files) {
    const raw = relative(root, absolute)
    rawFiles.push(raw)
    const normalized = normalizePublishedOutputPath(raw)
    if (normalized === null) continue
    if (files.has(normalized)) {
      errors.push(`构建产物路径规范化后重复：${normalized}`)
      continue
    }
    files.set(normalized, absolute)
  }
  return { files, rawFiles, errors }
}

export function normalizeCleanCourseHref(href, siteBase) {
  if (
    typeof href !== 'string'
    || !href.startsWith('/')
    || href.startsWith('//')
    || href.includes('\\')
  ) {
    return null
  }
  try {
    const url = new URL(href, 'https://course.invalid')
    if (
      url.origin !== 'https://course.invalid'
      || url.search !== ''
      || url.hash !== ''
      || url.pathname !== href
      || !url.pathname.startsWith(`${siteBase}/`)
    ) {
      return null
    }
    const route = url.pathname.slice(siteBase.length)
    return route.endsWith('/') ? null : route
  } catch {
    return null
  }
}

export function extractCourseHtmlContract(html) {
  const document = parse(html)
  const courseMaps = elementsWithin(document.childNodes, (node) => hasClass(node, 'course-map'))
  const vpDocs = elementsWithin(document.childNodes, (node) => hasClass(node, 'vp-doc'))
  const pageRoots = vpDocs.length > 0 ? vpDocs : courseMaps
  return {
    hrefs: hrefsWithin(courseMaps),
    courseText: courseMaps.map((node) => visibleText(node)).join(' '),
    pageText: pageRoots.map((node) => visibleText(node)).join(' '),
  }
}

export function extractProjectHtmlContract(html, options = {}) {
  const document = parse(html, { scriptingEnabled: false })
  const documentElements = elementsWithin(
    document.childNodes,
    () => true,
    hiddenResourceHtmlElements,
  )
  const vpDocs = elementsWithin(document.childNodes, (node) => hasClass(node, 'vp-doc'))
  const headings = elementsWithin(vpDocs, (node) => node.tagName === 'h2')
    .map((node) => visibleText(node, new Set(['header-anchor'])).replace(/\s+/gu, ' ').trim())
  const sourceSections = elementsWithin(vpDocs, (node) => hasClass(node, 'project-source-links'))
  const metaSections = elementsWithin(vpDocs, (node) => hasClass(node, 'project-meta'))
  const licenseSections = elementsWithin(metaSections, (node) => node.tagName === 'details')
  const cssSources = embeddedCssSourcesWithin(document.childNodes)
  const classTokens = new Set(documentElements
    .flatMap((node) => (attribute(node, 'class') ?? '').split(/\s+/u).filter(Boolean)))
  const attributeValues = new Map()
  for (const node of documentElements) {
    for (const { name, value } of node.attrs ?? []) {
      const values = attributeValues.get(name) ?? new Set()
      values.add(value)
      attributeValues.set(name, values)
    }
  }
  const selectorElements = documentElements.map((node) => {
    const elementAttributeValues = new Map()
    for (const { name, value } of node.attrs ?? []) {
      const values = elementAttributeValues.get(name) ?? new Set()
      values.add(value)
      elementAttributeValues.set(name, values)
    }
    return {
      namespaceURI: node.namespaceURI,
      tagName: node.tagName,
      attributeValues: elementAttributeValues,
    }
  })
  const documentFacts = { classTokens, attributeValues, selectorElements }
  const resources = resourceCandidatesWithin(document.childNodes, options.cssOptions, false)
  const cssResources = documentCssResourceCandidatesWithin(
    document.childNodes,
    documentFacts,
    options.cssOptions,
    cssSources,
  )
  const publishedResources = [...resources.resources, ...cssResources]
    .map((candidate) => validateDiscoveredResource(
      candidate,
      {
        ...(options.cssOptions ?? {}),
        resourceBudget: { steps: 0, decodedBytes: 0 },
      },
      options.cssOptions?.sourcePath ?? null,
    ))
  return {
    text: normalizedVisibleText(vpDocs),
    headings,
    images: resources.images,
    resources: publishedResources,
    cssSources,
    classTokens,
    attributeValues,
    selectorElements,
    hrefs: elementsWithin(vpDocs, (node) =>
      node.tagName === 'a' && !hasClass(node, 'header-anchor'))
      .map((node) => attribute(node, 'href') ?? null),
    sourceHrefs: hrefsWithin(sourceSections),
    licenseHrefs: hrefsWithin(licenseSections),
  }
}

export function extractProjectMarkdownContract(text, renderer) {
  const source = text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/u, '')
  const tokens = renderer.parse(source, {})
  const imageRoot = parseFragment(renderer.render(source), { scriptingEnabled: false })
  const resources = resourceCandidatesWithin(imageRoot.childNodes)
  const headings = []
  const links = []
  const textParts = []
  const hiddenStack = []
  let pendingHeading = false

  const collectFragment = (html, includeHeadings = false) => {
    const fragment = parseFragment(html, { scriptingEnabled: false })
    if (includeHeadings) {
      headings.push(...elementsWithin(
        fragment.childNodes,
        (node) => node.tagName === 'h2',
        hiddenMarkdownHtmlElements,
      ).map((node) => normalizedVisibleText([node], hiddenMarkdownHtmlElements)))
    }
    links.push(...elementsWithin(
      fragment.childNodes,
      (node) => node.tagName === 'a' && !hasClass(node, 'header-anchor'),
      hiddenMarkdownHtmlElements,
    ).map((node) => normalizeRenderedMarkdownHref(attribute(node, 'href') ?? null)))
    textParts.push(normalizedVisibleText(fragment.childNodes, hiddenMarkdownHtmlElements))
  }

  for (const token of tokens) {
    if (token.type === 'html_block') {
      if (hiddenStack.length === 0) collectFragment(token.content, true)
      updateHiddenContainerStack(hiddenStack, token.content)
      continue
    }
    if (token.type === 'heading_open') {
      pendingHeading = token.tag === 'h2' && hiddenStack.length === 0
      continue
    }
    if (token.type === 'heading_close') {
      pendingHeading = false
      continue
    }
    if (token.type !== 'inline') continue
    if (hiddenStack.length === 0) {
      const rendered = renderer.renderInline(token.content)
      const fragment = parseFragment(rendered, { scriptingEnabled: false })
      if (pendingHeading) {
        headings.push(normalizedVisibleText(fragment.childNodes, hiddenMarkdownHtmlElements))
      }
      collectFragment(rendered)
    }
    for (const child of token.children ?? []) {
      if (child.type === 'html_inline') updateHiddenContainerStack(hiddenStack, child.content)
    }
  }

  return {
    headings,
    links,
    images: resources.images,
    resources: resources.resources,
    text: textParts.join(' ').replace(/\p{White_Space}+/gu, ' ').trim(),
  }
}

export function validatePinnedGithubSourceHref(href, expectedHref) {
  if (href !== expectedHref) return false
  try {
    const url = new URL(href)
    return url.protocol === 'https:'
      && url.hostname === 'github.com'
      && url.username === ''
      && url.password === ''
      && url.port === ''
      && url.search === ''
      && url.hash === ''
  } catch {
    return false
  }
}

export function isRemoteImageCandidate(candidate) {
  const parsed = parseResourceCandidate(candidate)
  if (parsed === null) return true
  const { url } = parsed
  const value = url.protocol === 'data:' ? parsed.canonical : parsed.value
  if (parsed.explicitScheme === 'data') {
    return isSvgDataResource(value) || isCssDataResource(value)
      ? !isSafeResourceCandidate(value, {}, 0, null)
      : false
  }
  if (parsed.explicitScheme !== null) return true
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return true
  return url.origin !== localImageBase.origin
    || /^(?:https?:|\/\/)/iu.test(parsed.value)
}
