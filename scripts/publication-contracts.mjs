import { existsSync, lstatSync, readdirSync, statSync } from 'node:fs'
import { join, posix, relative } from 'node:path'
import parseSrcset from 'parse-srcset'
import { parse, parseFragment, Tokenizer } from 'parse5'
import postcss from 'postcss'
import valueParser from 'postcss-value-parser'

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
      if (/\s/u.test(value[index + 1] ?? '')) index += 1
      continue
    }
    decoded += value[index]
  }
  return decoded
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

function imageSetResources(node) {
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
    return functionName === 'url' ? [cssFunctionValue(candidate)] : []
  })
}

function extractCssValueResources(value) {
  const extractNodes = (nodes) => {
    const resources = []
    for (let index = 0; index < nodes.length; index += 1) {
      let node = nodes[index]
      let rawFunctionName = node.type === 'function' ? node.value : null
      if (
        node.type === 'word'
        && node.value.includes('\\')
        && nodes[index + 1]?.type === 'space'
        && nodes[index + 2]?.type === 'function'
      ) {
        rawFunctionName = `${node.value}${nodes[index + 1].value}${nodes[index + 2].value}`
        node = nodes[index + 2]
        index += 2
      }
      if (node.type !== 'function') continue
      const functionName = decodeCssEscapes(rawFunctionName)?.toLowerCase()
      if (functionName === null) {
        resources.push(null)
      } else if (functionName === 'url') {
        resources.push(cssFunctionValue(node))
      } else if (functionName === 'image-set' || functionName === '-webkit-image-set') {
        resources.push(...imageSetResources(node))
      } else {
        resources.push(...extractNodes(node.nodes ?? []))
      }
    }
    return resources
  }
  try {
    return extractNodes(valueParser(value).nodes)
  } catch {
    return [null]
  }
}

function consumeCssIdentifier(value) {
  let position = 0
  while (position < value.length) {
    if (/[-_a-z0-9]/iu.test(value[position])) {
      position += 1
      continue
    }
    if (value[position] !== '\\') break
    position += 1
    if (position >= value.length) return null
    if (/[0-9a-f]/iu.test(value[position])) {
      let digits = 0
      while (digits < 6 && /[0-9a-f]/iu.test(value[position] ?? '')) {
        position += 1
        digits += 1
      }
      if (value[position] === '\r' && value[position + 1] === '\n') position += 2
      else if (/\s/u.test(value[position] ?? '')) position += 1
    } else if (/\r|\n|\f/u.test(value[position])) {
      return null
    } else {
      position += 1
    }
  }
  return { raw: value.slice(0, position), rest: value.slice(position).trim() }
}

export function extractCssResourceCandidates(css) {
  try {
    const root = postcss.parse(css)
    const resources = []
    root.walkDecls((declaration) => {
      resources.push(...extractCssValueResources(declaration.value))
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
      resources.push(target && ['string', 'word'].includes(target.type) ? target.value : null)
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

function resourceCandidatesWithin(roots) {
  const images = imageCandidatesWithin(roots)
  const attributes = browserResourceAttributesWithin(roots)
  const inlineStyles = elementsWithin(
    roots,
    (node) => attribute(node, 'style') !== undefined,
    hiddenResourceHtmlElements,
  ).flatMap((node) => extractCssValueResources(attribute(node, 'style')))
  const styleBlocks = elementsWithin(
    roots,
    (node) => node.tagName === 'style',
    hiddenResourceHtmlElements,
  ).flatMap((node) => extractCssResourceCandidates(visibleText(
    node,
    new Set(),
    hiddenResourceHtmlElements,
  )))
  return { images, resources: [...images, ...attributes, ...inlineStyles, ...styleBlocks] }
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
  const vpDocs = elementsWithin(document.childNodes, (node) => hasClass(node, 'vp-doc'))
  const headings = elementsWithin(vpDocs, (node) => node.tagName === 'h2')
    .map((node) => visibleText(node, new Set(['header-anchor'])).replace(/\s+/gu, ' ').trim())
  const sourceSections = elementsWithin(vpDocs, (node) => hasClass(node, 'project-source-links'))
  const metaSections = elementsWithin(vpDocs, (node) => hasClass(node, 'project-meta'))
  const licenseSections = elementsWithin(metaSections, (node) => node.tagName === 'details')
  const resources = resourceCandidatesWithin(vpDocs)
  return {
    text: normalizedVisibleText(vpDocs),
    headings,
    images: resources.images,
    resources: resources.resources,
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
