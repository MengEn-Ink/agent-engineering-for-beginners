import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, posix, relative } from 'node:path'
import { parse, parseFragment } from 'parse5'

const hiddenHtmlElements = new Set(['script', 'style', 'template', 'noscript'])
const hiddenMarkdownHtmlElements = new Set([...hiddenHtmlElements, 'code', 'pre'])

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

function hrefsWithin(roots, hiddenElements = hiddenHtmlElements) {
  return elementsWithin(roots, (node) => node.tagName === 'a', hiddenElements)
    .map((node) => attribute(node, 'href') ?? null)
}

function srcsWithin(roots, hiddenElements = hiddenHtmlElements) {
  return elementsWithin(roots, (node) => node.tagName === 'img', hiddenElements)
    .map((node) => attribute(node, 'src'))
    .filter((src) => src !== undefined)
}

function listFiles(root) {
  if (!existsSync(root)) return []
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
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
  for (const absolute of listFiles(root)) {
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
  const document = parse(html)
  const vpDocs = elementsWithin(document.childNodes, (node) => hasClass(node, 'vp-doc'))
  const headings = elementsWithin(vpDocs, (node) => node.tagName === 'h2')
    .map((node) => visibleText(node, new Set(['header-anchor'])).replace(/\s+/gu, ' ').trim())
  const sourceSections = elementsWithin(vpDocs, (node) => hasClass(node, 'project-source-links'))
  const metaSections = elementsWithin(vpDocs, (node) => hasClass(node, 'project-meta'))
  const licenseSections = elementsWithin(metaSections, (node) => node.tagName === 'details')
  return {
    text: vpDocs.map((node) => visibleText(node)).join(' '),
    headings,
    images: srcsWithin(vpDocs),
    sourceHrefs: hrefsWithin(sourceSections),
    licenseHrefs: hrefsWithin(licenseSections),
  }
}

function extractRawHtmlContract(html) {
  const root = parseFragment(html)
  return {
    links: hrefsWithin(root.childNodes, hiddenMarkdownHtmlElements),
    images: srcsWithin(root.childNodes, hiddenMarkdownHtmlElements),
    text: visibleText(root, new Set(), hiddenMarkdownHtmlElements),
  }
}

export function extractProjectMarkdownContract(text, renderer) {
  const source = text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/u, '')
  const tokens = renderer.parse(source, {})
  const headings = []
  const links = []
  const images = []
  const textParts = []

  for (const [index, token] of tokens.entries()) {
    if (token.type === 'heading_open' && token.tag === 'h2' && tokens[index + 1]?.type === 'inline') {
      headings.push(tokens[index + 1].content)
    }
    if (token.type === 'html_block') {
      const raw = extractRawHtmlContract(token.content)
      links.push(...raw.links)
      images.push(...raw.images)
      textParts.push(raw.text)
    }
    if (token.type !== 'inline') continue
    let hiddenInlineDepth = 0
    for (const child of token.children ?? []) {
      if (child.type === 'html_inline') {
        const closingTag = child.content.match(/^<\/([a-z][\w-]*)\s*>$/iu)?.[1]?.toLowerCase()
        if (closingTag && hiddenMarkdownHtmlElements.has(closingTag)) {
          hiddenInlineDepth = Math.max(0, hiddenInlineDepth - 1)
          continue
        }
        const openingTag = child.content.match(/^<([a-z][\w-]*)(?:\s|>|\/)/iu)?.[1]?.toLowerCase()
        if (openingTag && hiddenMarkdownHtmlElements.has(openingTag)) {
          if (!/\/>\s*$/u.test(child.content)) hiddenInlineDepth += 1
          continue
        }
        if (hiddenInlineDepth > 0) continue
        const raw = extractRawHtmlContract(child.content)
        links.push(...raw.links)
        images.push(...raw.images)
        textParts.push(raw.text)
      } else if (hiddenInlineDepth > 0) {
        continue
      } else if (child.type === 'link_open') {
        const href = child.attrGet('href')
        if (href !== null && child.attrGet('class') !== 'header-anchor') links.push(href)
      } else if (child.type === 'image') {
        const src = child.attrGet('src')
        if (src !== null) images.push(src)
      } else if (child.type === 'text') {
        textParts.push(child.content)
      }
    }
  }

  return { headings, links, images, text: textParts.join(' ') }
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
