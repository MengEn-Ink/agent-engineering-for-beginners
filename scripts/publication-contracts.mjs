import { existsSync, lstatSync, readdirSync, statSync } from 'node:fs'
import { join, posix, relative } from 'node:path'
import { parse, parseFragment } from 'parse5'

const hiddenHtmlElements = new Set(['script', 'style', 'template', 'noscript'])
const hiddenMarkdownHtmlElements = new Set([
  ...hiddenHtmlElements,
  'code',
  'pre',
  'svg',
  'publication-hidden',
])
const hiddenImageHtmlElements = new Set(['script', 'style', 'template'])
const hiddenMarkdownImageHtmlElements = new Set([...hiddenImageHtmlElements, 'code', 'pre'])

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

function hrefsWithin(roots, hiddenElements = hiddenHtmlElements) {
  return elementsWithin(roots, (node) => node.tagName === 'a', hiddenElements)
    .map((node) => attribute(node, 'href') ?? null)
}

function parseSrcsetCandidates(srcset) {
  const candidates = []
  let position = 0
  while (position < srcset.length) {
    while (position < srcset.length && /[\s,]/u.test(srcset[position])) position += 1
    if (position >= srcset.length) break

    const isDataUrl = srcset.slice(position, position + 5).toLowerCase() === 'data:'
    const start = position
    while (
      position < srcset.length
      && !/\s/u.test(srcset[position])
      && (isDataUrl || srcset[position] !== ',')
    ) {
      position += 1
    }
    const candidate = srcset.slice(start, position).replace(/,+$/u, '')
    if (candidate !== '') candidates.push(candidate)

    let parentheses = 0
    while (position < srcset.length) {
      const character = srcset[position]
      position += 1
      if (character === '(') parentheses += 1
      else if (character === ')') parentheses = Math.max(0, parentheses - 1)
      else if (character === ',' && parentheses === 0) break
    }
  }
  return candidates
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
  return {
    text: normalizedVisibleText(vpDocs),
    headings,
    images: imageCandidatesWithin(vpDocs),
    hrefs: elementsWithin(vpDocs, (node) =>
      node.tagName === 'a' && !hasClass(node, 'header-anchor'))
      .map((node) => attribute(node, 'href') ?? null),
    sourceHrefs: hrefsWithin(sourceSections),
    licenseHrefs: hrefsWithin(licenseSections),
  }
}

export function extractProjectMarkdownContract(text, renderer) {
  const source = text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/u, '')
  const contentSource = source.replace(
    /<(\/?)\s*(template|code|pre|svg|script|style|noscript)\b[^>]*>/giu,
    (match, closing) => closing === '/'
      ? '</publication-hidden>'
      : /\/\s*>$/u.test(match)
        ? '<publication-hidden></publication-hidden>'
        : '<publication-hidden>',
  )
  const root = parseFragment(renderer.render(contentSource), { scriptingEnabled: false })
  const imageRoot = parseFragment(renderer.render(source), { scriptingEnabled: false })
  const headings = elementsWithin(
    root.childNodes,
    (node) => node.tagName === 'h2',
    hiddenMarkdownHtmlElements,
  ).map((node) => normalizedVisibleText([node], hiddenMarkdownHtmlElements))
  const links = elementsWithin(
    root.childNodes,
    (node) => node.tagName === 'a' && !hasClass(node, 'header-anchor'),
    hiddenMarkdownHtmlElements,
  ).map((node) => normalizeRenderedMarkdownHref(attribute(node, 'href') ?? null))
  return {
    headings,
    links,
    images: imageCandidatesWithin(imageRoot.childNodes, hiddenMarkdownImageHtmlElements),
    text: normalizedVisibleText(root.childNodes, hiddenMarkdownHtmlElements),
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
  return typeof candidate === 'string' && /^(?:https?:)?\/\//iu.test(candidate.trim())
}
