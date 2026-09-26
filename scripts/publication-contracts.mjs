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
  'background-image',
  'border-image-source',
  'clip-path',
  'cursor',
  'list-style-image',
  'mask',
  'mask-image',
  'offset-path',
  'shape-outside',
  'src',
  '-webkit-mask',
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
  'animatemotion',
  'animatetransform',
  'discard',
  'mpath',
  'set',
])
const disallowedSvgXmlResourceElements = new Set([
  'animate',
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
  try {
    return parseSrcset(srcset).map((candidate) => candidate.url)
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
      ...parseSrcsetCandidates(attribute(node, 'srcset') ?? ''),
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
  return groups.flatMap((group) => {
    const candidate = group[0]
    if (!candidate) return [null]
    if (candidate.type === 'string' || candidate.type === 'word') {
      return [decodeCssEscapes(candidate.value)]
    }
    const functionName = candidate.type === 'function'
      ? decodeCssEscapes(candidate.value)?.toLowerCase()
      : null
    if (functionName === 'url') return [cssFunctionValue(candidate)]
    if (functionName === null) return [null]
    if (functionName === 'var') {
      return resolveVariable?.(candidate, resolvingVariables) ?? [null]
    }
    if (cssUnresolvedFunctions.has(functionName)) return [null]
    if (functionName === 'image') {
      return imageFunctionResources(candidate, resolveVariable, resolvingVariables)
    }
    return extractCssNodes(
      candidate.nodes ?? [],
      cssImageContainerFunctions.has(functionName),
      resolveVariable,
      resolvingVariables,
    )
  })
}

function imageFunctionResources(node, resolveVariable, resolvingVariables) {
  const strings = (node.nodes ?? [])
    .filter((candidate) => candidate.type === 'string')
    .map((candidate) => decodeCssEscapes(candidate.value))
  return [
    ...strings,
    ...extractCssNodes(node.nodes ?? [], true, resolveVariable, resolvingVariables),
  ]
}

function extractCssNodes(nodes, resourceContext = false, resolveVariable, resolvingVariables) {
  const resources = []
  for (const node of nodes) {
    if (node.type !== 'function') continue
    const functionName = decodeCssEscapes(node.value)?.toLowerCase()
    if (functionName === null) {
      resources.push(null)
    } else if (functionName === 'url') {
      resources.push(cssFunctionValue(node))
    } else if (functionName === 'image-set' || functionName === '-webkit-image-set') {
      resources.push(...imageSetResources(node, resolveVariable, resolvingVariables))
    } else if (functionName === 'image') {
      resources.push(...imageFunctionResources(node, resolveVariable, resolvingVariables))
    } else if (resourceContext && functionName === 'var') {
      resources.push(...(resolveVariable?.(node, resolvingVariables) ?? [null]))
      resources.push(...extractCssNodes(node.nodes ?? [], false))
    } else if (resourceContext && cssUnresolvedFunctions.has(functionName)) {
      resources.push(null)
    } else {
      resources.push(...extractCssNodes(
        node.nodes ?? [],
        resourceContext && cssImageContainerFunctions.has(functionName),
        resolveVariable,
        resolvingVariables,
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
  while (container) {
    if (container.type === 'rule') {
      try {
        let reachable = false
        selectorParser((selectors) => {
          selectors.each((selector) => {
            let hasConservativePseudo = false
            selector.walkPseudos((node) => {
              if ([':has', ':is', ':not', ':where'].includes(node.value.toLowerCase())) {
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
  return false
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

function vitePressIconDefinitionHash(definitions) {
  const tuples = definitions.map((declaration) => {
    const selector = declaration.parent?.type === 'rule'
      ? normalizeSelectorSignature(declaration.parent.selector)
      : null
    const property = normalizeDeclarationProperty(declaration.prop)
    if (selector === null || property !== '--icon') return null
    const atRules = []
    let container = declaration.parent?.parent
    while (container && container.type !== 'root') {
      if (container.type !== 'atrule') return null
      const name = decodeCssEscapes(container.name)
      if (name === null) return null
      atRules.unshift({ name: name.toLowerCase(), params: container.params.trim() })
      container = container.parent
    }
    return { atRules, selector, property, value: declaration.value.trim() }
  })
  if (tuples.some((tuple) => tuple === null)) return null
  tuples.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
  return createHash('sha256').update(JSON.stringify(tuples)).digest('hex')
}

function extractSvgXmlResourceCandidates(svg) {
  if (/<!DOCTYPE/iu.test(svg)) return null
  let depth = 0
  let rootIsSvg = false
  let roots = 0
  const resources = []
  const elements = []
  try {
    const parser = new SaxesParser({ xmlns: true })
    parser.on('opentag', (node) => {
      if (depth === 0) {
        roots += 1
        rootIsSvg = node.uri === svgNamespace && node.local === 'svg'
      }
      depth += 1
      const frame = { isStyle: node.uri === svgNamespace && node.local === 'style', text: '' }
      elements.push(frame)
      if (node.uri !== svgNamespace) return
      if (disallowedSvgXmlResourceElements.has(node.local) || node.local === 'foreignObject') {
        resources.push(null)
      }
      const attributes = Object.values(node.attributes)
      if (attributes.some((candidate) =>
        candidate.uri === xmlNamespace && candidate.local === 'base')) {
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
          resources.push(...extractCssValueResources(candidate.value, true))
        } else if (candidate.local === 'style') {
          resources.push(...embeddedCssResourceCandidates(
            `publication-resource{${candidate.value}}`,
            true,
          ))
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
      if (frame?.isStyle) resources.push(...embeddedCssResourceCandidates(frame.text, true))
      depth -= 1
    })
    parser.write(svg).close()
    return roots === 1 && rootIsSvg && depth === 0 ? resources : null
  } catch {
    return null
  }
}

function decodeSvgDataResource(candidate) {
  const comma = candidate.indexOf(',')
  if (comma < 0) return null
  const metadata = candidate.slice(5, comma).toLowerCase()
  if (!metadata.startsWith('image/svg+xml')) return null
  try {
    return metadata.split(';').includes('base64')
      ? Buffer.from(candidate.slice(comma + 1), 'base64').toString('utf8')
      : decodeURIComponent(candidate.slice(comma + 1))
  } catch {
    return null
  }
}

function isSafeVitePressIconResource(candidate, options, depth = 0) {
  if (depth > 2 || typeof candidate !== 'string') return false
  const value = candidate.trim()
  if (/^blob:/iu.test(value)) return false
  if (/^data:/iu.test(value)) {
    const svg = decodeSvgDataResource(value)
    if (svg === null) return false
    const resources = extractSvgXmlResourceCandidates(svg)
    if (resources === null) return false
    return resources.every((nested) =>
      isSafeVitePressIconResource(nested, options, depth + 1))
  }
  if (isRemoteImageCandidate(value)) return false
  if (depth > 0 && value.startsWith('#')) return true
  if (depth > 0 && !options.distFiles) return false
  if (!options.distFiles || (!value.startsWith('/') && depth === 0)) return true
  try {
    const url = new URL(value, localImageBase)
    const relativePath = url.pathname
      .replace(/^\/agent-engineering-for-beginners\//u, '')
      .replace(/^\//u, '')
    return options.distFiles.has(relativePath)
  } catch {
    return false
  }
}

function exactVitePressIconConsumer(declaration) {
  if (declaration.parent?.type !== 'rule' || declaration.important) return false
  const selector = normalizeSelectorSignature(declaration.parent.selector)
  if (selector === null) return false
  const property = normalizeDeclarationProperty(declaration.prop)
  return property !== null
    && vitePressIconConsumers.get(`${selector}\0${property}`) === declaration.value
}

function vitePressIconMaskPolicyIsValid(options) {
  if (options.vitePressVersion !== vitePressIconMaskVersion) return false
  const definitions = []
  const contractDefinitions = []
  const consumers = []
  for (const css of options.allCss ?? []) {
    let root
    try {
      root = postcss.parse(css)
    } catch {
      return false
    }
    const sheetDefinitions = []
    const sheetConsumers = []
    root.walkDecls((declaration) => {
      const property = normalizeDeclarationProperty(declaration.prop)
      if (property === null) return
      if (property === '--icon') {
        definitions.push(declaration)
        sheetDefinitions.push(declaration)
      }
      const selector = declaration.parent?.type === 'rule'
        ? normalizeSelectorSignature(declaration.parent.selector)
        : null
      if (
        selector !== null
        && (selector === vitePressGenericIconSelector || selector === vitePressExternalIconSelector)
        && ['mask', '-webkit-mask', 'mask-image', '-webkit-mask-image'].includes(property)
      ) {
        consumers.push(declaration)
        sheetConsumers.push(declaration)
      }
    })
    if (sheetConsumers.length > 0) contractDefinitions.push(...sheetDefinitions)
  }
  if (
    consumers.length !== vitePressIconConsumers.size
    || new Set(consumers.map((declaration) =>
      `${normalizeSelectorSignature(declaration.parent.selector)}\0${normalizeDeclarationProperty(declaration.prop)}`)).size
      !== vitePressIconConsumers.size
    || !consumers.every(exactVitePressIconConsumer)
    || vitePressIconDefinitionHash(contractDefinitions) !== options.vitePressIconDefinitionHash
  ) {
    return false
  }
  const safeDefinition = (declaration) => {
    if (declaration.important) return false
    const resources = extractCssValueResources(declaration.value, true)
    return resources.length > 0
      && resources.every((candidate) => isSafeVitePressIconResource(candidate, options))
  }
  if (!definitions.every(safeDefinition)) return false
  return consumers
    .filter((declaration) =>
      normalizeSelectorSignature(declaration.parent.selector) === vitePressExternalIconSelector)
    .every((declaration) => declaration.parent.nodes.some((candidate) =>
      candidate.type === 'decl'
      && normalizeDeclarationProperty(candidate.prop) === '--icon'
      && safeDefinition(candidate)))
}

export function extractCssResourceCandidates(css, options = {}) {
  try {
    const root = postcss.parse(css)
    const resources = []
    const allowVitePressIconMasks = vitePressIconMaskPolicyIsValid(options)
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
      const resourceProperties = options.resourceProperties ?? cssResourceProperties
      const dynamicResourceContext = resourceProperties.has(property)
        && !(allowVitePressIconMasks && exactVitePressIconConsumer(declaration))
        && (
          options.dynamicResources !== 'project'
          || belongsToProjectRule(declaration, projectDocuments)
        )
      resources.push(...extractCssValueResources(
        declaration.value,
        dynamicResourceContext,
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
    return resources
  } catch {
    return [null]
  }
}

function browserResourceAttributesWithin(roots) {
  return elementsWithin(roots, () => true, hiddenResourceHtmlElements).flatMap((node) => {
    const tagName = node.tagName.toLowerCase()
    if (node.namespaceURI === svgNamespace && svgResourceHrefElements.has(tagName)) {
      return (node.attrs ?? [])
        .filter((candidate) => candidate.name === 'href')
        .map((candidate) => candidate.value)
    }
    if (node.namespaceURI !== htmlNamespace) return []
    if (tagName === 'link') {
      const rels = (attribute(node, 'rel') ?? '').toLowerCase().split(/\s+/u)
      return rels.some((rel) => fetchingLinkRels.has(rel))
        ? [attribute(node, 'href') ?? null]
        : []
    }
    return (htmlResourceAttributes.get(tagName) ?? [])
      .map((name) => attribute(node, name))
      .filter((value) => value !== undefined)
  })
}

function cssDefinesVitePressIcon(css) {
  try {
    let definesIcon = false
    postcss.parse(css).walkDecls((declaration) => {
      if (normalizeDeclarationProperty(declaration.prop) === '--icon') definesIcon = true
    })
    return definesIcon
  } catch {
    return true
  }
}

function embeddedCssResourceCandidates(css, svgContext = false) {
  return [
    ...extractCssResourceCandidates(css, {
      resourceProperties: svgContext ? svgCssResourceProperties : cssResourceProperties,
    }),
    ...(cssDefinesVitePressIcon(css) ? [null] : []),
  ]
}

function resourceCandidatesWithin(roots) {
  const images = imageCandidatesWithin(roots)
  const attributes = browserResourceAttributesWithin(roots)
  const svgElements = elementsWithin(
    roots,
    (node) => node.namespaceURI === svgNamespace,
    hiddenResourceHtmlElements,
  )
  const presentationAttributes = svgElements.flatMap((node) => (node.attrs ?? [])
    .filter((candidate) => svgPresentationResourceAttributes.has(candidate.name))
    .flatMap((candidate) => extractCssValueResources(candidate.value, true)))
  const activeSvgResources = svgElements.flatMap((node) => (
    disallowedSvgResourceElements.has(node.tagName.toLowerCase())
    || (node.attrs ?? []).some((candidate) => candidate.name.toLowerCase() === 'xml:base')
      ? [null]
      : []
  ))
  const inlineStyles = elementsWithin(
    roots,
    (node) => attribute(node, 'style') !== undefined,
    hiddenResourceHtmlElements,
  ).flatMap((node) => {
    const css = `publication-resource{${attribute(node, 'style')}}`
    return embeddedCssResourceCandidates(css, node.namespaceURI === svgNamespace)
  })
  const styleBlocks = elementsWithin(
    roots,
    (node) => node.tagName === 'style',
    hiddenResourceHtmlElements,
  ).flatMap((node) => embeddedCssResourceCandidates(visibleText(
    node,
    new Set(),
    hiddenResourceHtmlElements,
  ), node.namespaceURI === svgNamespace))
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

export function extractProjectHtmlContract(html) {
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
  const resources = resourceCandidatesWithin(vpDocs)
  const documentDefinesVitePressIcon = documentElements.some((node) => {
    const style = attribute(node, 'style')
    if (style !== undefined
      && cssDefinesVitePressIcon(`publication-resource{${style}}`)) return true
    return node.tagName === 'style' && cssDefinesVitePressIcon(visibleText(
      node,
      new Set(),
      hiddenResourceHtmlElements,
    ))
  })
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
  return {
    text: normalizedVisibleText(vpDocs),
    headings,
    images: resources.images,
    resources: [
      ...resources.resources,
      ...(documentDefinesVitePressIcon ? [null] : []),
    ],
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
  if (typeof candidate !== 'string' || candidate.trim() === '') return true
  const value = candidate.trim()
  const withoutAsciiControls = value.replace(/[\u0009\u000A\u000C\u000D]/gu, '')
  try {
    const url = new URL(value, localImageBase)
    if (url.protocol === 'data:' || url.protocol === 'blob:') return false
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return true
    return url.origin !== localImageBase.origin
      || /^(?:https?:|\/\/)/iu.test(withoutAsciiControls)
  } catch {
    return true
  }
}
