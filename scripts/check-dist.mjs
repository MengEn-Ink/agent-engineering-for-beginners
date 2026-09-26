import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadProjectCatalog } from './project-catalog.mjs'
import {
  extractCourseHtmlContract,
  extractProjectHtmlContract,
  indexDistFiles,
  isRemoteImageCandidate,
  normalizeCleanCourseHref,
  normalizePublishedOutputPath,
  validatePinnedGithubSourceHref,
} from './publication-contracts.mjs'

const courseStages = [
  '基础认知',
  '核心机制',
  '生产工程',
  '应用模式',
  '项目拆解',
  '综合实战',
]

const publishedCourseRoutes = [
  '/preface',
  '/chapters/01-ai-native',
  '/chapters/02-workflow-agent',
  '/chapters/03-react',
  '/chapters/04-tools-mcp',
  '/frontier/context-engineering',
  '/chapters/05-state-memory',
  '/chapters/06-loop-graph',
  '/chapters/07-multi-agent',
  '/frontier/interoperability-identity',
  '/chapters/08-evaluation',
  '/chapters/09-safety-recovery',
  '/chapters/10-production',
  '/frontier/durable-execution',
  '/frontier/agent-security-evaluation',
  '/chapters/11-research-agent',
  '/chapters/12-service-operations-agent',
  '/chapters/13-coding-agent',
  '/chapters/14-computer-use',
  '/projects/mcp-python-sdk',
  '/projects/aider',
  '/projects/openhands',
  '/projects/agent-benchmarks',
  '/projects/dify',
  '/projects/crewai',
  '/case-study/delivery-agent',
]

const forbiddenCourseMarkers = ['/labs/', '/capstone/', '标记已读', '加入书签']
const siteBase = '/agent-engineering-for-beginners'
const projectCatalog = loadProjectCatalog(new URL('../sources/project-index.yml', import.meta.url))

export const approvedProjectFiles = new Set([
  'projects/index.html',
  'projects/mcp-python-sdk.html',
  'projects/aider.html',
  'projects/openhands.html',
  'projects/agent-benchmarks.html',
  'projects/dify.html',
  'projects/crewai.html',
  'projects/history-autogpt-flowise.html',
])

const coreProjectFiles = new Set([
  'projects/mcp-python-sdk.html',
  'projects/aider.html',
  'projects/openhands.html',
  'projects/agent-benchmarks.html',
  'projects/dify.html',
  'projects/crewai.html',
])
const dissectionProjectFiles = new Set([
  ...coreProjectFiles,
  'projects/history-autogpt-flowise.html',
])
const coreProjectHeadings = [
  '30 秒结论', '为什么选', '版本与边界', '原创建筑图', '唯一纵向调用链',
  '关键源码入口', '一次请求的数据流', '阅读练习', '失败边界', '生产边界',
  '高频面试点', '升级复核', '来源与归因',
]

export function validatePublishedRouteBoundary(relativeFiles) {
  const forbidden = relativeFiles.filter((file) => {
    const normalized = normalizePublishedOutputPath(file)
    return normalized === null
      || /^(?:labs|capstone|superpowers)(?:\.html|\/)/iu.test(normalized)
      || (/^projects(?:\.html|\/)/iu.test(normalized) && !approvedProjectFiles.has(normalized))
  })
  return forbidden.length === 0
    ? []
    : [`构建产物包含未批准项目、实验或综合实战页面：${forbidden.join(', ')}`]
}

export function validateCourseDist(html) {
  const errors = []
  const contract = extractCourseHtmlContract(html)
  const normalizedHrefs = contract.hrefs.map((href) => normalizeCleanCourseHref(href, siteBase))
  const hasEveryRouteOnce = publishedCourseRoutes.every((route) =>
    normalizedHrefs.filter((href) => href === route).length === 1,
  )

  if (
    normalizedHrefs.length !== 26
    || normalizedHrefs.includes(null)
    || new Set(normalizedHrefs).size !== 26
    || !hasEveryRouteOnce
  ) {
    errors.push('课程页必须包含 26 个唯一的公开课程链接')
  }
  if (!contract.courseText.includes('本地进度将在页面加载后显示')) {
    errors.push('课程页缺少 SSR 中性进度文案')
  }
  for (const stage of courseStages) {
    if (!contract.courseText.includes(stage)) errors.push(`课程页缺少阶段：${stage}`)
  }
  for (const marker of forbiddenCourseMarkers) {
    if (contract.pageText.includes(marker)) errors.push(`课程页包含未发布入口或写操作：${marker}`)
  }

  return errors
}

function projectSourceUrl(subject, sourcePath) {
  const encodedPath = sourcePath.split('/').map(encodeURIComponent).join('/')
  return `https://github.com/${subject.canonical_repo}/blob/${subject.pinned_commit}/${encodedPath}`
}

function expectedProjectHrefs(file) {
  const slug = file.slice('projects/'.length, -'.html'.length)
  const page = projectCatalog.pages.find((candidate) =>
    candidate.page_item_id === `project-${slug}`)
  const subjects = page.subjects.map((subjectId) =>
    projectCatalog.subjects.find((candidate) => candidate.id === subjectId))
  return {
    page,
    subjects,
    sources: subjects.flatMap((subject) => subject.entrypoints.map((entry) =>
      projectSourceUrl(subject, entry.path))),
    licenses: subjects.flatMap((subject) => subject.license_sources.map((source) =>
      projectSourceUrl(subject, source.path))),
  }
}

function expectedProjectDocumentHrefs(file) {
  if (file === 'projects/index.html') {
    const page = projectCatalog.pages.find((candidate) => candidate.page_item_id === 'projects-index')
    const projectLinks = projectCatalog.pages.slice(1).map((candidate) =>
      `${siteBase}/projects/${candidate.page_item_id.slice('project-'.length)}`)
    const watchLinks = page.subjects
      .map((subjectId) => projectCatalog.subjects.find((candidate) => candidate.id === subjectId))
      .filter((subject) => subject.catalog_tier === 'watch-only')
      .map((subject) => subject.canonical_url)
    return [
      ...projectLinks,
      ...watchLinks,
      `${siteBase}/frontier/agent-security-evaluation`,
      `${siteBase}/chapters/09-safety-recovery`,
      `${siteBase}/radar/`,
      `${siteBase}/case-study/delivery-agent`,
    ]
  }

  const expected = expectedProjectHrefs(file)
  const metadata = expected.subjects.flatMap((subject) => [
    subject.canonical_url,
    subject.watch_url,
  ])
  const interview = expected.page.interview_question_ids.map((id) => {
    const chapter = id.match(/^iq-(\d{2})-[a-z]$/u)?.[1]
    const route = publishedCourseRoutes.find((candidate) =>
      candidate.startsWith(`/chapters/${chapter}-`))
    return `${siteBase}${route}#${id}`
  })
  return [...metadata, ...expected.licenses, ...expected.sources, ...interview]
}

function exactPinnedHrefs(actual, expected) {
  return actual.length === expected.length
    && new Set(actual).size === actual.length
    && actual.every((href) => expected.some((candidate) =>
      validatePinnedGithubSourceHref(href, candidate)))
}

function exactHrefs(actual, expected) {
  return actual.length === expected.length
    && new Set(actual).size === actual.length
    && actual.every((href) => expected.includes(href))
}

export function validateDist(distPath) {
  if (!existsSync(distPath)) return [`构建产物不存在：${distPath}`]

  const errors = []
  const indexed = indexDistFiles(distPath)
  const relativeFiles = [...indexed.files.keys()]
  errors.push(...indexed.errors)
  const leaked = relativeFiles.filter((file) =>
    file.split(/[\\/]/).some((segment) => segment.toLowerCase() === 'superpowers'))
  if (leaked.length > 0) errors.push(`构建产物泄露 superpowers 页面：${leaked.join(', ')}`)
  errors.push(...validatePublishedRouteBoundary(indexed.rawFiles))
  for (const file of approvedProjectFiles) {
    if (!relativeFiles.includes(file)) errors.push(`构建产物缺少项目页面：${file}`)
  }
  if (!relativeFiles.includes('index.html')) errors.push('构建产物缺少 index.html')

  const coursePath = indexed.files.get('course/index.html')
  if (coursePath === undefined) {
    errors.push('构建产物缺少 course/index.html')
  } else {
    errors.push(...validateCourseDist(readFileSync(coursePath, 'utf8')))
  }

  for (const route of publishedCourseRoutes) {
    const relativeTarget = route.endsWith('/')
      ? `${route.slice(1)}index.html`
      : `${route.slice(1)}.html`
    if (!relativeFiles.includes(relativeTarget)) {
      errors.push(`构建产物缺少公开课程目标：${relativeTarget}`)
    }
  }

  const projectContracts = new Map()
  for (const file of approvedProjectFiles) {
    const projectPath = indexed.files.get(file)
    if (projectPath === undefined) continue
    const contract = extractProjectHtmlContract(readFileSync(projectPath, 'utf8'))
    projectContracts.set(file, contract)
    if (!exactHrefs(contract.hrefs, expectedProjectDocumentHrefs(file))) {
      errors.push(`项目页链接不符合公开契约：${file}`)
    }
  }

  for (const file of dissectionProjectFiles) {
    const contract = projectContracts.get(file)
    if (contract === undefined) continue
    if (!contract.text.includes('固定版本')) errors.push(`项目页缺少固定版本：${file}`)
    if (!contract.text.includes('关键源码入口')) errors.push(`项目页缺少源码入口：${file}`)
    const projectHrefs = [...contract.sourceHrefs, ...contract.licenseHrefs]
    if (projectHrefs.some((href) => /\/blob\/(?:main|master)\//u.test(href))) {
      errors.push(`项目页包含移动分支源码链接：${file}`)
    }
    if (!projectHrefs.some((href) => /\/blob\/[0-9a-f]{40}\//u.test(href))) {
      errors.push(`项目页缺少固定 commit 源码链接：${file}`)
    }
    if (contract.images.some(isRemoteImageCandidate)) {
      errors.push(`项目页包含外链图片：${file}`)
    }
    const expected = expectedProjectHrefs(file)
    if (
      !exactPinnedHrefs(contract.sourceHrefs, expected.sources)
      || !exactPinnedHrefs(contract.licenseHrefs, expected.licenses)
    ) {
      errors.push(`项目页源码与许可链接不符合 catalog：${file}`)
    }
    if (coreProjectFiles.has(file)) {
      if (
        contract.headings.length !== coreProjectHeadings.length
        || contract.headings.some((heading, index) => heading !== coreProjectHeadings[index])
      ) {
        errors.push(`核心项目页章节结构不匹配：${file}`)
      }
      for (const heading of coreProjectHeadings) {
        if (!contract.headings.includes(heading)) errors.push(`核心项目页缺少章节 ${heading}：${file}`)
      }
    }
  }

  return errors
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath && pathToFileURL(invokedPath).href === import.meta.url) {
  const distPath = resolve(process.argv[2] ?? 'docs/.vitepress/dist')
  const errors = validateDist(distPath)
  if (errors.length > 0) {
    for (const error of errors) console.error(`- ${error}`)
    process.exitCode = 1
  } else {
    console.log('dist validation passed')
  }
}
