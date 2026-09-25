import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

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
  '/case-study/delivery-agent',
]

const forbiddenCourseMarkers = ['/projects/', '/labs/', '标记已读', '加入书签']

function listFiles(root) {
  if (!existsSync(root)) return []
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

function hrefMatchesRoute(href, route) {
  try {
    const pathname = new URL(href, 'https://example.invalid').pathname.replace(/\/$/u, '')
    return pathname === route || pathname.endsWith(route)
  } catch {
    return false
  }
}

export function validateCourseDist(html) {
  const errors = []
  const courseMarkup = html.match(/<nav class="course-map"[\s\S]*?<\/nav>/u)?.[0] ?? ''
  const hrefs = Array.from(
    courseMarkup.matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1/gu),
    (match) => match[2],
  )
  const hasEveryRouteOnce = publishedCourseRoutes.every((route) =>
    hrefs.filter((href) => hrefMatchesRoute(href, route)).length === 1,
  )

  if (hrefs.length !== 20 || new Set(hrefs).size !== 20 || !hasEveryRouteOnce) {
    errors.push('课程页必须包含 20 个唯一的公开课程链接')
  }
  if (!courseMarkup.includes('本地进度将在页面加载后显示')) {
    errors.push('课程页缺少 SSR 中性进度文案')
  }
  for (const stage of courseStages) {
    if (!courseMarkup.includes(stage)) errors.push(`课程页缺少阶段：${stage}`)
  }
  for (const marker of forbiddenCourseMarkers) {
    if (html.includes(marker)) errors.push(`课程页包含未发布入口或写操作：${marker}`)
  }

  return errors
}

export function validateDist(distPath) {
  if (!existsSync(distPath)) return [`构建产物不存在：${distPath}`]

  const errors = []
  const relativeFiles = listFiles(distPath).map((file) => relative(distPath, file))
  const leaked = relativeFiles.filter((file) => file.split(/[\\/]/).includes('superpowers'))
  if (leaked.length > 0) errors.push(`构建产物泄露 superpowers 页面：${leaked.join(', ')}`)
  if (!relativeFiles.includes('index.html')) errors.push('构建产物缺少 index.html')

  const coursePath = join(distPath, 'course', 'index.html')
  if (!existsSync(coursePath)) {
    errors.push('构建产物缺少 course/index.html')
  } else {
    errors.push(...validateCourseDist(readFileSync(coursePath, 'utf8')))
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
