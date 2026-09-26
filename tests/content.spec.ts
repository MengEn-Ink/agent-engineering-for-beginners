import { describe, expect, it } from 'vitest'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'yaml'
import siteConfig from '../docs/.vitepress/config.mts'
import { getContentItem } from '../docs/.vitepress/theme/data/contentRegistry'
import { publishedCourseItems } from '../docs/.vitepress/theme/data/courseMap'
import { interviewQuestions } from '../docs/.vitepress/theme/data/interviewQuestions'
import {
  validateCourseDist,
  validateDist,
  validatePublishedRouteBoundary,
} from '../scripts/check-dist.mjs'

const expandedChapterFiles = [
  'docs/chapters/01-ai-native.md',
  'docs/chapters/02-workflow-agent.md',
  'docs/chapters/03-react.md',
  'docs/chapters/04-tools-mcp.md',
  'docs/chapters/05-state-memory.md',
  'docs/chapters/06-loop-graph.md',
  'docs/chapters/07-multi-agent.md',
  'docs/chapters/08-evaluation.md',
  'docs/chapters/09-safety-recovery.md',
  'docs/chapters/10-production.md',
]

const applicationChapterFiles = [
  'docs/chapters/11-research-agent.md',
  'docs/chapters/12-service-operations-agent.md',
  'docs/chapters/13-coding-agent.md',
  'docs/chapters/14-computer-use.md',
]

const frontierFiles = [
  'docs/frontier/context-engineering.md',
  'docs/frontier/interoperability-identity.md',
  'docs/frontier/durable-execution.md',
  'docs/frontier/agent-security-evaluation.md',
]

const expectedProjectOutputs = [
  'projects/index.html',
  'projects/mcp-python-sdk.html',
  'projects/aider.html',
  'projects/openhands.html',
  'projects/agent-benchmarks.html',
  'projects/dify.html',
  'projects/crewai.html',
  'projects/history-autogpt-flowise.html',
]
const fixtureCoreProjectFiles = new Set(expectedProjectOutputs.slice(1, 7))
const fixtureProjectCatalog = parse(readFileSync('sources/project-index.yml', 'utf8')) as {
  pages: Array<{ page_item_id: string; subjects: string[]; interview_question_ids: string[] }>
  subjects: Array<{
    id: string
    canonical_repo: string
    canonical_url: string
    pinned_commit: string
    watch_url: string
    entrypoints: Array<{ path: string }>
    license_sources: Array<{ path: string }>
  }>
}
const fixtureProjectHeadings = [
  '30 秒结论', '为什么选', '版本与边界', '原创建筑图', '唯一纵向调用链',
  '关键源码入口', '一次请求的数据流', '阅读练习', '失败边界', '生产边界',
  '高频面试点', '升级复核', '来源与归因',
]

function fixtureProjectSourceUrl(subject: (typeof fixtureProjectCatalog.subjects)[number], path: string) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  return `https://github.com/${subject.canonical_repo}/blob/${subject.pinned_commit}/${encodedPath}`
}

function fixtureProjectSections(relative: string) {
  const slug = relative.slice('projects/'.length, -'.html'.length)
  const pageId = slug === 'index' ? 'projects-index' : `project-${slug}`
  const page = fixtureProjectCatalog.pages.find((candidate) => candidate.page_item_id === pageId)!
  const subjects = page.subjects.map((subjectId) =>
    fixtureProjectCatalog.subjects.find((candidate) => candidate.id === subjectId)!)
  const sourceAnchors = subjects.flatMap((subject) => subject.entrypoints.map((entry) =>
    `<a href="${fixtureProjectSourceUrl(subject, entry.path)}">${entry.path}</a>`))
  const licenseAnchors = subjects.flatMap((subject) => subject.license_sources.map((source) =>
    `<a href="${fixtureProjectSourceUrl(subject, source.path)}">${source.path}</a>`))
  const metadataAnchors = subjects.flatMap((subject) => [
    `<a href="${subject.canonical_url}">${subject.canonical_repo}</a>`,
    `<a href="${subject.watch_url}">watch</a>`,
  ])
  const interviewAnchors = page.interview_question_ids.map((id) => {
    const question = interviewQuestions.find((candidate) => candidate.id === id)!
    return `<a href="/agent-engineering-for-beginners${question.path}#${id}">${id}</a>`
  })
  return `<aside class="project-meta">${metadataAnchors.join('')}<details>${licenseAnchors.join('')}</details></aside><ol class="project-source-links">${sourceAnchors.join('')}</ol>${interviewAnchors.join('')}`
}

function fixtureProjectOverview() {
  const pageLinks = fixtureProjectCatalog.pages.slice(1).map((page) => {
    const slug = page.page_item_id.slice('project-'.length)
    return `<a href="/agent-engineering-for-beginners/projects/${slug}">${page.page_item_id}</a>`
  })
  const watchLinks = fixtureProjectCatalog.subjects
    .filter((subject) => !fixtureProjectCatalog.pages.slice(1)
      .some((page) => page.subjects.includes(subject.id)))
    .map((subject) => `<a href="${subject.canonical_url}">${subject.id}</a>`)
  const fixedLinks = [
    '/agent-engineering-for-beginners/frontier/agent-security-evaluation',
    '/agent-engineering-for-beginners/chapters/09-safety-recovery',
    '/agent-engineering-for-beginners/radar/',
    '/agent-engineering-for-beginners/case-study/delivery-agent',
  ].map((href) => `<a href="${href}">${href}</a>`)
  return `<section class="project-overview">开源项目拆解${pageLinks.join('')}${watchLinks.join('')}${fixedLinks.join('')}</section>`
}

function createCompleteDistFixture() {
  const dist = mkdtempSync(join(tmpdir(), 'agent-book-project-dist-'))
  const stages = ['基础认知', '核心机制', '生产工程', '应用模式', '项目拆解', '综合实战']
  const links = publishedCourseItems.map(({ itemId }) => {
    const route = getContentItem(itemId).route
    return `<a href="/agent-engineering-for-beginners${route}">${itemId}</a>`
  })
  writeFileSync(join(dist, 'index.html'), '<h1>public book</h1>')
  mkdirSync(join(dist, 'course'), { recursive: true })
  writeFileSync(
    join(dist, 'course/index.html'),
    `<nav class="course-map">${stages.join('')}本地进度将在页面加载后显示${links.join('')}</nav>`,
  )
  for (const { itemId } of publishedCourseItems) {
    const route = getContentItem(itemId).route
    const target = route.endsWith('/')
      ? join(dist, route, 'index.html')
      : join(dist, `${route}.html`)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, `<h1>${itemId}</h1>`)
  }
  for (const relative of expectedProjectOutputs) {
    const target = join(dist, relative)
    mkdirSync(dirname(target), { recursive: true })
    const isOverview = relative === 'projects/index.html'
    const coreHeadings = fixtureCoreProjectFiles.has(relative)
      ? fixtureProjectHeadings.map((heading) => `<h2>${heading}</h2>`).join('')
      : ''
    writeFileSync(target, isOverview
      ? `<main><div class="vp-doc">${fixtureProjectOverview()}</div></main>`
      : `<main><div class="vp-doc">固定版本 关键源码入口 ${coreHeadings}${fixtureProjectSections(relative)}</div></main>`)
  }
  return dist
}

function contentCharacterCount(markdown: string) {
  return markdown
    .replace(/^---[\s\S]*?---\s*/u, '')
    .replace(/<!--[\s\S]*?-->/gu, '')
    .replace(/\s/gu, '')
    .length
}

function configuredNavigationLinks() {
  type NavEntry = { link?: string; items?: NavEntry[] }
  const themeConfig = siteConfig.themeConfig as {
    nav?: NavEntry[]
    sidebar?: Array<{ items?: NavEntry[] }>
  }
  const entryLinks = (entries: NavEntry[] = []): string[] => entries.flatMap((entry) => [
    ...(entry.link ? [entry.link] : []),
    ...entryLinks(entry.items),
  ])
  return [
    ...entryLinks(themeConfig.nav),
    ...entryLinks(themeConfig.sidebar),
  ]
}

describe('book scaffold', () => {
  it('declares the public title and all ten chapter routes', () => {
    const configPath = 'docs/.vitepress/config.mts'

    expect(existsSync(configPath)).toBe(true)

    const config = readFileSync(configPath, 'utf8')
    const navigationLinks = configuredNavigationLinks()
    expect(config).toContain('别只会和 AI 聊天')

    for (let chapter = 1; chapter <= 10; chapter += 1) {
      expect(navigationLinks.some((link) =>
        link.startsWith(`/chapters/${String(chapter).padStart(2, '0')}-`),
      )).toBe(true)
    }
  })
})

describe('complete handbook scope', () => {
  const requiredModules = [
    '## 本章先回答什么',
    '## 工程上到底发生了什么',
    '## 设计步骤',
    '## 案例与失败边界',
    '## 可复制',
    '## 练习',
    '来源：',
  ]
  const optionalModules = [
    '## 先讲个故事',
    '## 交付型 Agent 连续案例',
    '## 应用切片',
    '## 失败实验',
    '## 方案对比',
    '## 成本与性能',
    '## 实施清单',
    '## 扩展阅读',
  ]

  it('ships fourteen substantive chapters in the approved size ranges', () => {
    let total = 0

    for (const chapter of expandedChapterFiles) {
      expect(existsSync(chapter)).toBe(true)
      const count = contentCharacterCount(readFileSync(chapter, 'utf8'))
      expect(count, chapter).toBeGreaterThanOrEqual(4_700)
      expect(count, chapter).toBeLessThanOrEqual(6_000)
      total += count
    }

    for (const chapter of applicationChapterFiles) {
      expect(existsSync(chapter)).toBe(true)
      const count = contentCharacterCount(readFileSync(chapter, 'utf8'))
      expect(count, chapter).toBeGreaterThanOrEqual(4_500)
      expect(count, chapter).toBeLessThanOrEqual(5_500)
      total += count
    }

    expect(total).toBeGreaterThanOrEqual(65_000)
    expect(total).toBeLessThanOrEqual(82_000)
  })

  it('gives every chapter seven core modules and two topic-driven modules', () => {
    for (const chapter of [...expandedChapterFiles, ...applicationChapterFiles]) {
      expect(existsSync(chapter)).toBe(true)
      const text = readFileSync(chapter, 'utf8')
      for (const module of requiredModules) expect(text, chapter).toContain(module)
      const optionalCount = optionalModules.filter((module) => text.includes(module)).length
      expect(optionalCount, chapter).toBeGreaterThanOrEqual(2)
      expect(text, chapter).toMatch(/<(AgentLoop|SystemStack|DeliveryCase|DecisionLadder|MemoryLayers|EvidencePyramid|RiskMatrix|NativeShift|ToolBoundary|GraphFlow|MultiAgentHandoff|ResearchPipeline|ServiceEscalation|CodingLoop|BrowserEvidence)\s*\/>/)
    }
  })
})

describe('application chapters', () => {
  it('publishes all four application routes', () => {
    const navigationLinks = configuredNavigationLinks()
    for (const route of [
      '/chapters/11-research-agent',
      '/chapters/12-service-operations-agent',
      '/chapters/13-coding-agent',
      '/chapters/14-computer-use',
    ]) {
      expect(navigationLinks).toContain(route)
    }
  })

  it('gives each application chapter two first-party sources', () => {
    const sources = parse(readFileSync('sources/source-index.yml', 'utf8')).sources as Array<{
      grade: string
      impact_chapters: string[]
    }>

    for (const chapter of ['11', '12', '13', '14']) {
      const firstParty = sources.filter(
        (source) => source.grade === 'A' && source.impact_chapters.includes(chapter),
      )
      expect(firstParty.length, `chapter ${chapter}`).toBeGreaterThanOrEqual(2)
    }
  })

  it('states the operating and failure boundaries for every application', () => {
    const boundaries = ['适合做什么', '不适合做什么', '最低权限', '可接受损失', '人工接管', '最终证据']
    for (const chapter of applicationChapterFiles) {
      expect(existsSync(chapter)).toBe(true)
      const text = readFileSync(chapter, 'utf8')
      for (const boundary of boundaries) expect(text, chapter).toContain(boundary)
    }
  })
})

describe('reading theme', () => {
  it('uses quiet light and dark reading tokens', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    expect(style).toContain('--reading-bg: #fcfcfa')
    expect(style).toContain('--reading-text: #202632')
    expect(style).toContain('--reading-bg: #17191d')
    expect(style).toContain('--reading-text: #eceef2')
    expect(style).toContain('color-scheme: dark')
  })

  it('removes the global grid and fixed reading background', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    const bodyRule = style.match(/body\s*\{([\s\S]*?)\}/u)?.[1] ?? ''
    expect(bodyRule).not.toContain('background-image')
    expect(style).not.toContain('background-attachment: fixed')
    expect(style).toContain('.book-hero::before')
  })

  it('sets a readable measure, type rhythm and accessible focus behavior', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    expect(style).toContain('max-width: 720px')
    expect(style).toContain('font-size: 17.5px')
    expect(style).toContain('line-height: 1.9')
    expect(style).toContain('text-wrap: balance')
    expect(style).toContain('text-wrap: pretty')
    expect(style).toContain('scroll-margin-top:')
    expect(style).toContain(':focus-visible')
    expect(style).not.toContain('.VPDoc > div > * {')
  })

  it('handles touch, safe areas and light/dark browser chrome', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    expect(style).toContain('touch-action: manipulation')
    expect(style).toContain('-webkit-tap-highlight-color:')
    expect(style).toContain('env(safe-area-inset-left)')
    expect(style).toContain('env(safe-area-inset-right)')
    expect(config).toContain("media: '(prefers-color-scheme: light)'")
    expect(config).toContain("media: '(prefers-color-scheme: dark)'")
    expect(config).toContain("content: '#fcfcfa'")
    expect(config).toContain("content: '#17191d'")
  })
})

describe('learning components', () => {
  const components = [
    'ChapterLead',
    'CaseThread',
    'PracticeBlock',
    'ChecklistBlock',
    'DecisionLadder',
    'MemoryLayers',
    'EvidencePyramid',
    'RiskMatrix',
  ]

  it('registers every reusable learning component', () => {
    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    for (const component of components) {
      const path = `docs/.vitepress/theme/components/${component}.vue`
      expect(existsSync(path)).toBe(true)
      expect(theme).toContain(`'${component}'`)
    }
  })

  it('uses native disclosure and accessible diagram descriptions', () => {
    expect(readFileSync('docs/.vitepress/theme/components/PracticeBlock.vue', 'utf8')).toContain(
      '<details',
    )
    for (const component of ['DecisionLadder', 'MemoryLayers', 'EvidencePyramid']) {
      const source = readFileSync(`docs/.vitepress/theme/components/${component}.vue`, 'utf8')
      expect(source).toContain('role="img"')
      expect(source).toContain('aria-label=')
    }

    const riskMatrix = readFileSync(
      'docs/.vitepress/theme/components/RiskMatrix.vue',
      'utf8',
    )
    expect(riskMatrix).toContain('<figcaption>')
    expect(riskMatrix).toContain('<table>')
    expect(riskMatrix).not.toContain('role="img"')
  })

  it('styles learning blocks and preserves mobile table scrolling', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    for (const selector of [
      '.chapter-lead',
      '.case-thread',
      '.practice-block',
      '.checklist-block',
      '.learning-diagram',
    ]) {
      expect(style).toContain(selector)
    }
    const tableRule = style.match(/\.VPDoc table\s*\{([\s\S]*?)\}/u)?.[1] ?? ''
    expect(tableRule).toContain('display: block')
    expect(tableRule).toContain('overflow-x: auto')
    expect(tableRule).not.toContain('display: table')
  })

  it('avoids fixed IDs in reusable learning blocks', () => {
    for (const component of ['ChapterLead', 'CaseThread', 'PracticeBlock', 'ChecklistBlock']) {
      const source = readFileSync(`docs/.vitepress/theme/components/${component}.vue`, 'utf8')
      expect(source).not.toMatch(/\sid="[^"]+"/)
      expect(source).toContain('aria-label=')
    }
  })
})

describe('source registry', () => {
  it('records traceable evidence with explicit grades', () => {
    const sourcePath = 'sources/source-index.yml'

    expect(existsSync(sourcePath)).toBe(true)

    const data = parse(readFileSync(sourcePath, 'utf8')) as {
      source_defaults: Record<string, unknown>
      sources: Array<Record<string, unknown>>
    }
    const sources = data.sources.map((source) => ({ ...data.source_defaults, ...source }))
    expect(sources.length).toBeGreaterThanOrEqual(15)

    for (const source of sources) {
      expect(source).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          publisher: expect.any(String),
          url: expect.stringMatching(/^https:\/\//),
          grade: expect.stringMatching(/^[ABC]$/),
          accessed: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          impact_chapters: expect.any(Array),
          note: expect.any(String),
        }),
      )
    }

    const ids = sources.map((source) => source.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual(
      expect.arrayContaining(['anthropic-effective-agents', 'mcp-spec', 'delivery-patterns']),
    )
  })
})

describe('source freshness schema', () => {
  it('normalizes every source with review and lifecycle metadata', () => {
    const data = parse(readFileSync('sources/source-index.yml', 'utf8')) as {
      schema_version?: number
      source_defaults?: Record<string, unknown>
      sources: Array<Record<string, unknown>>
    }
    expect(data.schema_version).toBe(2)
    expect(data.source_defaults).toEqual(
      expect.objectContaining({
        last_verified: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        review_by: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        status: expect.stringMatching(/^(active|watch|deprecated|broken)$/),
        replaced_by: null,
      }),
    )

    for (const raw of data.sources) {
      const source = { ...data.source_defaults, ...raw }
      expect(source.version).toEqual(expect.any(String))
      expect(source.last_verified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(source.review_by).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(['active', 'watch', 'deprecated', 'broken']).toContain(source.status)
      expect(source).toHaveProperty('replaced_by')
      expect(source.impact_chapters).toEqual(expect.any(Array))
    }
  })

  it('tracks the current MCP specification and its version watch page', () => {
    const data = parse(readFileSync('sources/source-index.yml', 'utf8')) as {
      source_defaults: Record<string, unknown>
      sources: Array<Record<string, unknown>>
    }
    const raw = data.sources.find((source) => source.id === 'mcp-spec')
    const source = { ...data.source_defaults, ...raw }
    expect(source.version).toBe('2026-07-28')
    expect(source.url).toBe('https://modelcontextprotocol.io/specification/2026-07-28')
    expect(source.watch_url).toBe('https://modelcontextprotocol.io/specification/')
  })

  it('tracks the manually verified Pydantic AI repository baseline', () => {
    const data = parse(readFileSync('sources/source-index.yml', 'utf8')) as {
      source_defaults: Record<string, unknown>
      sources: Array<Record<string, unknown>>
    }
    const raw = data.sources.find((source) => source.id === 'pydantic-ai-repository')
    const source = { ...data.source_defaults, ...raw }
    expect(source).toEqual(
      expect.objectContaining({
        version: 'rolling',
        last_verified: '2026-09-26',
        review_by: '2026-10-26',
        watch_url: 'https://github.com/pydantic/pydantic-ai/releases/latest',
        note: '人工核验至 Pydantic AI v2.51.0，未改变现有稳定结论；学习类型约束、结构化结果和依赖注入，不把类型安全等同于事实正确。',
      }),
    )
  })

  it('tracks the manually verified Google ADK repository baseline', () => {
    const data = parse(readFileSync('sources/source-index.yml', 'utf8')) as {
      source_defaults: Record<string, unknown>
      sources: Array<Record<string, unknown>>
    }
    const raw = data.sources.find((source) => source.id === 'google-adk-repository')
    const source = { ...data.source_defaults, ...raw }
    expect(source).toEqual(
      expect.objectContaining({
        version: 'rolling',
        last_verified: '2026-09-26',
        review_by: '2026-10-26',
        watch_url: 'https://github.com/google/adk-python/releases/latest',
        note: '人工核验至 Google ADK v2.10.0，未改变现有稳定结论；学习代码优先的 agent 组合、评测与部署接口；效率指标列入下一期 Radar 候选，当前不改正文。',
      }),
    )
  })
})

describe('living handbook frontier', () => {
  const frontierPages = [
    'docs/radar/index.md',
    'docs/radar/2026-09.md',
    'docs/frontier/context-engineering.md',
    'docs/frontier/interoperability-identity.md',
    'docs/frontier/durable-execution.md',
    'docs/frontier/agent-security-evaluation.md',
  ]

  it('publishes the radar and four frontier routes in the site navigation', () => {
    const navigationLinks = configuredNavigationLinks()
    expect(frontierPages.filter((page) => !existsSync(page))).toEqual([])

    for (const route of [
      '/radar/',
      '/radar/2026-09',
      '/frontier/context-engineering',
      '/frontier/interoperability-identity',
      '/frontier/durable-execution',
      '/frontier/agent-security-evaluation',
    ]) {
      expect(navigationLinks).toContain(route)
    }
  })

  it('labels each radar item with status, maturity, impact, decision and evidence', () => {
    const radar = readFileSync('docs/radar/2026-09.md', 'utf8')
    expect(radar.match(/^## \d{4}-\d{2}-\d{2} · /gmu)).toHaveLength(6)
    for (const field of ['状态', '成熟度', '影响章节', '当前决定', 'A级证据']) {
      expect(radar.match(new RegExp(`\\*\\*${field}：\\*\\*`, 'gu'))).toHaveLength(6)
    }
    expect(radar).toContain('watch')
    expect(radar).toContain('adopt')
    expect(radar).toContain('revise')
  })

  it('gives every frontier page stable principles and explicit review boundaries', () => {
    for (const page of frontierPages.slice(2)) {
      const text = readFileSync(page, 'utf8')
      for (const heading of [
        '## 先看稳定原则',
        '## 当前前沿',
        '## 版本与成熟度',
        '## 架构图',
        '## 失败边界',
        '## 影响章节',
        '## 复核计划',
        '## 来源',
      ]) {
        expect(text, page).toContain(heading)
      }
      expect(text, page).toMatch(/\[source:[a-z0-9-]+\]/u)
    }
  })

  it('registers the first-party frontier evidence with versions and impact paths', () => {
    const data = parse(readFileSync('sources/source-index.yml', 'utf8')) as {
      source_defaults: Record<string, unknown>
      sources: Array<Record<string, unknown>>
    }
    const sources = new Map(
      data.sources.map((raw) => {
        const source = { ...data.source_defaults, ...raw }
        return [source.id, source]
      }),
    )

    const requirements = new Map([
      ['mcp-spec', '/frontier/interoperability-identity'],
      ['a2a-spec', '/frontier/interoperability-identity'],
      ['a2a-release', '/frontier/interoperability-identity'],
      ['nist-agentic-ai', '/frontier/agent-security-evaluation'],
      ['nist-agent-hijacking', '/frontier/agent-security-evaluation'],
      ['anthropic-managed-agents', '/frontier/durable-execution'],
      ['anthropic-context-engineering', '/frontier/context-engineering'],
      ['otel-agent-observability', '/frontier/agent-security-evaluation'],
      ['owasp-agentic-top-10', '/frontier/agent-security-evaluation'],
    ])

    for (const [id, impactPath] of requirements) {
      const source = sources.get(id) as Record<string, unknown> | undefined
      expect(source, id).toBeDefined()
      expect(source?.grade, id).toBe('A')
      expect(source?.version, id).toEqual(expect.any(String))
      expect(source?.impact_chapters, id).toContain(impactPath)
    }
    expect(sources.get('a2a-release')?.version).toBe('v1.0.1')
  })

  it('separates MCP tool interoperability from A2A agent interoperability', () => {
    const chapter = readFileSync('docs/chapters/04-tools-mcp.md', 'utf8')
    expect(chapter).toContain('MCP 2026-07-28')
    expect(chapter).toContain('A2A v1.0.1')
    expect(chapter).toContain('工具与上下文')
    expect(chapter).toContain('Agent 与 Agent')
    expect(chapter).toContain('兼容')
    expect(chapter).toContain('[source:a2a-spec]')
  })
})

describe('chapter freshness', () => {
  it('defines review metadata for fourteen chapters and four frontier topics', async () => {
    const dataPath = 'docs/.vitepress/theme/data/chapterMeta.ts'
    expect(existsSync(dataPath)).toBe(true)
    const { chapterMeta } = await import(pathToFileURL(join(process.cwd(), dataPath)).href)

    expect(chapterMeta).toHaveLength(18)
    expect(new Set(chapterMeta.map((item: { itemId: string }) => item.itemId)).size).toBe(18)

    const sourceData = parse(readFileSync('sources/source-index.yml', 'utf8')) as {
      sources: Array<{ id: string }>
    }
    const sourceIds = new Set(sourceData.sources.map((source) => source.id))

    for (const item of chapterMeta) {
      expect(item.itemId).toMatch(/^(chapter|frontier)-/u)
      expect(item.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/u)
      expect(item.reviewBy).toMatch(/^\d{4}-\d{2}-\d{2}$/u)
      expect(new Date(item.lastVerified).toString()).not.toBe('Invalid Date')
      expect(new Date(item.reviewBy).toString()).not.toBe('Invalid Date')
      expect(item.reviewBy >= item.lastVerified).toBe(true)
      expect(['evergreen', 'evolving', 'frontier']).toContain(item.stability)
      expect(item.versions.length).toBeGreaterThan(0)
      expect(item.sourceIds.length).toBeGreaterThan(0)
      expect(item.sourceIds.filter((id: string) => !sourceIds.has(id))).toEqual([])
    }
  })

  it('renders one compact freshness block after every tracked page title', async () => {
    const dataPath = 'docs/.vitepress/theme/data/chapterMeta.ts'
    const { chapterMeta } = await import(pathToFileURL(join(process.cwd(), dataPath)).href)
    const { getContentItem } = await import(
      pathToFileURL(join(process.cwd(), 'docs/.vitepress/theme/data/contentRegistry.ts')).href
    )
    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    const componentPath = 'docs/.vitepress/theme/components/ChapterFreshness.vue'
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')

    expect(existsSync(componentPath)).toBe(true)
    expect(theme).toContain("'ChapterFreshness'")
    expect(style).toContain('.chapter-freshness')

    for (const item of chapterMeta) {
      const markdown = `docs${getContentItem(item.itemId).route}.md`
      expect(existsSync(markdown), markdown).toBe(true)
      const text = readFileSync(markdown, 'utf8')
      const placements = text.match(/<ChapterFreshness\s+item-id="[^"]+"\s*\/>/gu) ?? []
      expect(placements, markdown).toHaveLength(1)
      expect(placements[0], markdown).toContain(`item-id="${item.itemId}"`)
      expect(text.indexOf(placements[0]), markdown).toBeGreaterThan(text.indexOf('\n# '))
    }
  })

  it('uses one item-id freshness marker per tracked page', () => {
    for (const file of [...expandedChapterFiles, ...applicationChapterFiles, ...frontierFiles]) {
      const text = readFileSync(file, 'utf8')
      expect(text.match(/<ChapterFreshness item-id="[^"]+" \/>/gu)).toHaveLength(1)
      expect(text).not.toContain('<ChapterFreshness path=')
    }
  })

  it('shows a neutral SSR label and calculates overdue state after hydration', async () => {
    const component = readFileSync(
      'docs/.vitepress/theme/components/ChapterFreshness.vue',
      'utf8',
    )
    for (const label of ['常青', '持续演进', '前沿观察', '最后核验', '下次复核', '版本关注']) {
      expect(component).toContain(label)
    }
    expect(component).toContain('onMounted')
    expect(component).toContain("ref<'pending' | 'current' | 'overdue'>('pending')")
    expect(component).toContain('按日期复核')
    expect(component).toContain('isReviewOverdue')
    expect(component).toContain('需要复核')
    expect(component).toContain('<time')

    const { isReviewOverdue, reviewDateInTimeZone } = await import(
      pathToFileURL(join(process.cwd(), 'scripts/review-date.mjs')).href
    )
    const afterMidnightInShanghai = new Date('2026-09-24T16:30:00Z')
    expect(reviewDateInTimeZone(afterMidnightInShanghai)).toBe('2026-09-25')
    expect(isReviewOverdue('2026-09-24', afterMidnightInShanghai)).toBe(true)
    expect(isReviewOverdue('2026-09-25', afterMidnightInShanghai)).toBe(false)

    const checker = readFileSync('scripts/check-sources.mjs', 'utf8')
    const metadata = readFileSync('docs/.vitepress/theme/data/chapterMeta.ts', 'utf8')
    expect(checker).toContain("from './review-date.mjs'")
    expect(metadata).toContain("from '../../../../scripts/review-date.mjs'")
  })
})

describe('local reading paths and progress', () => {
  it('defines beginner, engineering and interview paths with valid public routes', async () => {
    const dataPath = 'docs/.vitepress/theme/data/readingPaths.ts'
    expect(existsSync(dataPath)).toBe(true)
    const { readingPaths } = await import(pathToFileURL(join(process.cwd(), dataPath)).href)

    expect(readingPaths.map((path: { id: string }) => path.id)).toEqual([
      'beginner',
      'engineering',
      'interview',
    ])
    expect(readingPaths.find((path: { id: string }) => path.id === 'interview')?.steps.at(-1)?.path)
      .toBe('/appendix/interview-training')
    for (const path of readingPaths) {
      expect(path.title).toEqual(expect.any(String))
      expect(path.summary).toEqual(expect.any(String))
      expect(path.steps.length).toBeGreaterThanOrEqual(8)
      for (const step of path.steps) {
        expect(step.path).toMatch(/^\/(chapters|appendix|projects|case-study)\//u)
        expect(existsSync(`docs${step.path}.md`), step.path).toBe(true)
        expect(step.title).toEqual(expect.any(String))
      }
    }
  })

  it('keeps progress, bookmarks and path selection in guarded browser storage', () => {
    const statePath = 'docs/.vitepress/theme/data/learningState.ts'
    expect(existsSync(statePath)).toBe(true)
    const state = readFileSync(statePath, 'utf8')

    for (const key of [
      'agent-handbook:path',
      'agent-handbook:progress',
      'agent-handbook:bookmarks',
    ]) {
      expect(state).toContain(key)
    }
    expect(state).toContain("typeof window === 'undefined'")
    expect(state).toContain('try {')
    expect(state).not.toContain('fetch(')
  })

  it('never recommends the current page as its own next step', async () => {
    const dataPath = 'docs/.vitepress/theme/data/readingPaths.ts'
    const { findNextReadingStep, readingPathById } = await import(
      pathToFileURL(join(process.cwd(), dataPath)).href
    )
    const path = readingPathById.engineering
    const current = path.steps.at(-1)!.path
    expect(findNextReadingStep(path, current, [])?.path).not.toBe(current)
    expect(findNextReadingStep(path, current, path.steps.slice(0, -1).map((step: { path: string }) => step.path)))
      .toBeUndefined()
  })

  it('publishes an interactive path page and global chapter controls', () => {
    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    const pathsPage = 'docs/paths/index.md'
    const pathsComponent = 'docs/.vitepress/theme/components/ReadingPaths.vue'
    const progressComponent = 'docs/.vitepress/theme/components/ReadingProgress.vue'

    expect(configuredNavigationLinks()).toContain('/paths/')
    expect(existsSync(pathsPage)).toBe(true)
    expect(readFileSync(pathsPage, 'utf8')).toContain('<ReadingPaths />')
    expect(existsSync(pathsComponent)).toBe(true)
    expect(existsSync(progressComponent)).toBe(true)
    expect(theme).toContain("'ReadingPaths'")
    expect(theme).toContain('ReadingProgress')
    expect(theme).toContain("'doc-after'")

    const pathsSource = readFileSync(pathsComponent, 'utf8')
    const progressSource = readFileSync(progressComponent, 'utf8')
    expect(pathsSource).toContain('清除本地记录')
    expect(pathsSource).toContain('window.confirm')
    expect(pathsSource).toContain('aria-pressed')
    expect(progressSource).toContain('标记已读')
    expect(progressSource).toContain('加入书签')
    expect(progressSource).toContain('仅存于当前浏览器')
    expect(progressSource).toContain('aria-label="阅读进度"')
    expect(pathsSource).toContain('<ol class="path-step-list" role="list">')
    expect(pathsSource).toContain('if (saved) announceLearningState()')
    expect(progressSource).toContain('if (saved) announceLearningState()')
  })

  it('styles local controls for touch and narrow screens', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    for (const selector of ['.reading-paths', '.reading-progress', '.path-step', '.reading-action']) {
      expect(style).toContain(selector)
    }
    expect(style).toMatch(/\.reading-action[\s\S]*?min-height:\s*44px/u)
  })
})

describe('interview training mode', () => {
  it('publishes the trainer route without duplicating the question registry', () => {
    const page = 'docs/appendix/interview-training.md'
    const componentPath = 'docs/.vitepress/theme/components/InterviewTrainer.vue'
    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')

    expect(existsSync(page)).toBe(true)
    expect(readFileSync(page, 'utf8')).toContain('<InterviewTrainer />')
    expect(configuredNavigationLinks()).toContain('/appendix/interview-training')
    expect(existsSync(componentPath)).toBe(true)
    expect(theme).toContain("'InterviewTrainer'")

    const component = readFileSync(componentPath, 'utf8')
    expect(component).toContain("import { interviewQuestions }")
    expect(component).not.toContain('function question(')
  })

  it('exposes filters, random draw, answer reveal and local self-assessment', () => {
    const component = readFileSync(
      'docs/.vitepress/theme/components/InterviewTrainer.vue',
      'utf8',
    )
    for (const label of [
      '岗位',
      '难度',
      '主题',
      '随机抽题',
      '先口答，再看答案',
      '不会',
      '模糊',
      '掌握',
      '仅存于当前浏览器',
    ]) {
      expect(component).toContain(label)
    }
    expect(component).toContain('history.replaceState')
    expect(component).toContain('window.location.hash')
    expect(component).toContain('currentQuestion.id')
    expect(component).toContain('aria-pressed')
    expect(component).toContain('window.confirm')
    expect(component).toContain('if (cleared) mastery.value = {}')
  })

  it('keeps the trainer readable and touchable on narrow screens', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    for (const selector of [
      '.interview-trainer',
      '.trainer-filters',
      '.trainer-question',
      '.trainer-mastery',
    ]) {
      expect(style).toContain(selector)
    }
    expect(style).toMatch(/\.trainer-action[\s\S]*?min-height:\s*44px/u)
  })
})

describe('public-boundary validator', () => {
  it('flags local paths, credentials and internal product identifiers', async () => {
    const validatorPath = 'scripts/validate-content.mjs'
    expect(existsSync(validatorPath)).toBe(true)

    const { findForbiddenMarkers } = await import(pathToFileURL(join(process.cwd(), validatorPath)).href)
    const sample = [
      '/Users/example/private-repo',
      'an_sso_session=secret-cookie',
      'E2E_MANAGER_SK=secret',
      'p-yeslxawo3knl99pi1d4c',
    ].join('\n')

    expect(findForbiddenMarkers(sample)).toHaveLength(4)
  })

  it('accepts generalized engineering language', async () => {
    const validatorPath = 'scripts/validate-content.mjs'
    expect(existsSync(validatorPath)).toBe(true)

    const { findForbiddenMarkers } = await import(pathToFileURL(join(process.cwd(), validatorPath)).href)
    const sample = '每次运行使用唯一标识；凭证由执行环境注入；缺少证据时保持失败关闭。'

    expect(findForbiddenMarkers(sample)).toEqual([])
  })

  it('exits non-zero when a public markdown file crosses the boundary', async () => {
    const validatorPath = 'scripts/validate-content.mjs'
    expect(existsSync(validatorPath)).toBe(true)

    const { validateMarkdownFiles } = await import(
      pathToFileURL(join(process.cwd(), validatorPath)).href
    )
    const fixtureDir = mkdtempSync(join(tmpdir(), 'agent-book-validation-'))
    const fixture = join(fixtureDir, 'unsafe.md')
    writeFileSync(fixture, '不要公开 /Users/example/private-repo', 'utf8')

    try {
      expect(validateMarkdownFiles([fixture])).toEqual([
        expect.stringContaining('unsafe.md'),
      ])
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true })
    }
  })
})

describe('public navigation and visual system', () => {
  const publicTargets = [
    'docs/public/mark.svg',
    'docs/preface.md',
    'docs/chapters/01-ai-native.md',
    'docs/chapters/02-workflow-agent.md',
    'docs/chapters/03-react.md',
    'docs/chapters/04-tools-mcp.md',
    'docs/chapters/05-state-memory.md',
    'docs/chapters/06-loop-graph.md',
    'docs/chapters/07-multi-agent.md',
    'docs/chapters/08-evaluation.md',
    'docs/chapters/09-safety-recovery.md',
    'docs/chapters/10-production.md',
    'docs/case-study/delivery-agent.md',
    'docs/appendix/glossary.md',
    'docs/appendix/review-checklist.md',
    'docs/appendix/reading.md',
  ]

  it('keeps every public logo and sidebar target on disk', () => {
    expect(publicTargets.filter((target) => !existsSync(target))).toEqual([])
  })

  it('provides accessible explanatory diagrams', () => {
    const components = ['AgentLoop.vue', 'SystemStack.vue', 'DeliveryCase.vue']

    for (const component of components) {
      const path = `docs/.vitepress/theme/components/${component}`
      expect(existsSync(path)).toBe(true)
      const source = readFileSync(path, 'utf8')
      expect(source).toContain('role="img"')
      expect(source).toContain('aria-label=')
    }
  })

  it('defines the editorial palette and responsive motion rules', () => {
    const stylePath = 'docs/.vitepress/theme/style.css'
    expect(existsSync(stylePath)).toBe(true)
    const style = readFileSync(stylePath, 'utf8')

    for (const token of ['--book-paper', '--book-ink', '--book-lime', '--book-coral']) {
      expect(style).toContain(token)
    }
    expect(style).toContain('@media (max-width: 390px)')
    expect(style).toContain('prefers-reduced-motion: reduce')
  })
})

describe('chapter contracts', () => {
  const chapterFiles = [
    'docs/chapters/01-ai-native.md',
    'docs/chapters/02-workflow-agent.md',
    'docs/chapters/03-react.md',
    'docs/chapters/04-tools-mcp.md',
    'docs/chapters/05-state-memory.md',
    'docs/chapters/06-loop-graph.md',
    'docs/chapters/07-multi-agent.md',
    'docs/chapters/08-evaluation.md',
    'docs/chapters/09-safety-recovery.md',
    'docs/chapters/10-production.md',
  ]

  it('gives every chapter a story, diagram, engineering explanation, pitfalls and quiz', () => {
    for (const chapter of chapterFiles) {
      expect(existsSync(chapter)).toBe(true)
      const text = readFileSync(chapter, 'utf8')
      expect(text.replace(/\s/g, '').length).toBeGreaterThan(900)
      expect(text).toContain('## 先讲个故事')
      expect(text).toMatch(/<(AgentLoop|SystemStack|DeliveryCase|DecisionLadder|MemoryLayers|EvidencePyramid|RiskMatrix|NativeShift|ToolBoundary|GraphFlow|MultiAgentHandoff|ResearchPipeline|ServiceEscalation|CodingLoop|BrowserEvidence)\s*\/>/)
      expect(text).toContain('## 工程上到底发生了什么')
      expect(text).toContain('## 别踩这些坑')
      expect(text).toContain('## 三道小测')
      expect(text).toContain('来源：')
      expect(text).toMatch(/\[source:[a-z0-9-]+\]/)
    }
  })

  it('only cites IDs registered in the source index', () => {
    const sources = parse(readFileSync('sources/source-index.yml', 'utf8')).sources as Array<{
      id: string
    }>
    const sourceIds = new Set(sources.map((source) => source.id))

    for (const chapter of chapterFiles) {
      if (!existsSync(chapter)) continue
      const citations = Array.from(
        readFileSync(chapter, 'utf8').matchAll(/\[source:([a-z0-9-]+)\]/g),
        (match) => match[1],
      )
      expect(citations.length).toBeGreaterThan(0)
      expect(citations.filter((citation) => !sourceIds.has(citation))).toEqual([])
    }
  })

  it('turns the delivery system into a sanitized, evidence-led case study', () => {
    const casePath = 'docs/case-study/delivery-agent.md'
    expect(existsSync(casePath)).toBe(true)
    const text = readFileSync(casePath, 'utf8')

    expect(text.replace(/\s/g, '').length).toBeGreaterThan(1200)
    expect(text).toContain('# 案例：交付型 Agent 的质量门')
    expect(text).toContain('<DeliveryCase />')
    expect(text).toContain('## 系统分层')
    expect(text).toContain('## 失败如何被分类')
    expect(text).toContain('## 公开边界')
    expect(text).not.toContain('delivery-ai-e2e')
  })
})

describe('publish boundary', () => {
  it('excludes project process documents from the VitePress route graph', () => {
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    expect(config).toContain("srcExclude: ['superpowers/**']")
  })

  it('scans all public text and configuration formats', async () => {
    const { collectTextFiles, validatePublishedFiles } = await import(
      pathToFileURL(join(process.cwd(), 'scripts/validate-content.mjs')).href
    )
    const fixtureDir = mkdtempSync(join(tmpdir(), 'agent-book-public-files-'))
    const themeDir = join(fixtureDir, 'docs/.vitepress/theme')
    mkdirSync(themeDir, { recursive: true })
    writeFileSync(join(themeDir, 'unsafe.vue'), '<script>const path = "/Users/private"</script>')
    writeFileSync(join(themeDir, 'safe.css'), ':root { color: navy; }')

    try {
      const files = collectTextFiles(fixtureDir)
      expect(files.map((file: string) => file.split('/').pop())).toEqual(['safe.css', 'unsafe.vue'])
      expect(validatePublishedFiles(fixtureDir)).toEqual([
        expect.stringContaining('unsafe.vue'),
      ])
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true })
    }
  })

  it('fails when process documents leak into a built site', async () => {
    const distCheckPath = 'scripts/check-dist.mjs'
    expect(existsSync(distCheckPath)).toBe(true)
    const { validateDist } = await import(pathToFileURL(join(process.cwd(), distCheckPath)).href)
    const fixtureDir = mkdtempSync(join(tmpdir(), 'agent-book-dist-'))
    mkdirSync(join(fixtureDir, 'superpowers'), { recursive: true })
    writeFileSync(join(fixtureDir, 'index.html'), '<h1>public book</h1>')
    writeFileSync(join(fixtureDir, 'superpowers/plan.html'), '<h1>private plan</h1>')

    try {
      expect(validateDist(fixtureDir)).toContainEqual(expect.stringContaining('superpowers'))
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true })
    }
  })

  it('rejects missing or incomplete no-JavaScript course output', async () => {
    const { validateDist } = await import(
      pathToFileURL(join(process.cwd(), 'scripts/check-dist.mjs')).href
    )
    const fixtureDir = mkdtempSync(join(tmpdir(), 'agent-book-course-dist-'))
    writeFileSync(join(fixtureDir, 'index.html'), '<h1>public book</h1>')

    try {
      expect(validateDist(fixtureDir)).toContain('构建产物缺少 course/index.html')

      mkdirSync(join(fixtureDir, 'course'), { recursive: true })
      writeFileSync(
        join(fixtureDir, 'course/index.html'),
        '<nav class="course-map"><a href="/preface">重复课程</a><a href="/preface">重复课程</a>/projects/ /labs/ /capstone/ 标记已读 加入书签</nav>',
      )

      const errors = validateDist(fixtureDir)
      expect(errors).toContain('课程页必须包含 26 个唯一的公开课程链接')
      expect(errors).toContain('课程页缺少 SSR 中性进度文案')
      for (const stage of ['基础认知', '核心机制', '生产工程', '应用模式', '项目拆解', '综合实战']) {
        expect(errors).toContain(`课程页缺少阶段：${stage}`)
      }
      expect(errors).not.toContain('课程页包含未发布入口或写操作：/projects/')
      for (const forbidden of ['/labs/', '/capstone/', '标记已读', '加入书签']) {
        expect(errors).toContain(`课程页包含未发布入口或写操作：${forbidden}`)
      }

      const stages = ['基础认知', '核心机制', '生产工程', '应用模式', '项目拆解', '综合实战']
      const hostileLinks = publishedCourseItems.map(({ itemId }) => {
        const route = getContentItem(itemId).route
        return `<a href="https://evil.example/not-the-site${route}">${itemId}</a>`
      })
      writeFileSync(
        join(fixtureDir, 'course/index.html'),
        `<nav class="course-map">${stages.join('')}本地进度将在页面加载后显示${hostileLinks.join('')}</nav>`,
      )
      expect(validateDist(fixtureDir)).toContain('课程页必须包含 26 个唯一的公开课程链接')
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true })
    }
  })

  it('requires every published course target and rejects unpublished route artifacts', async () => {
    const { validateDist } = await import(
      pathToFileURL(join(process.cwd(), 'scripts/check-dist.mjs')).href
    )
    const fixtureDir = mkdtempSync(join(tmpdir(), 'agent-book-course-targets-'))
    const stages = ['基础认知', '核心机制', '生产工程', '应用模式', '项目拆解', '综合实战']
    const links = publishedCourseItems.map(({ itemId }) => {
      const route = getContentItem(itemId).route
      return `<a href="/agent-engineering-for-beginners${route}">${itemId}</a>`
    })
    const targetPath = (route: string) => route.endsWith('/')
      ? join(fixtureDir, route, 'index.html')
      : join(fixtureDir, `${route}.html`)

    writeFileSync(join(fixtureDir, 'index.html'), '<h1>public book</h1>')
    mkdirSync(join(fixtureDir, 'course'), { recursive: true })
    writeFileSync(
      join(fixtureDir, 'course/index.html'),
      `<nav class="course-map">${stages.join('')}本地进度将在页面加载后显示${links.join('')}</nav>`,
    )
    for (const { itemId } of publishedCourseItems) {
      if (itemId === 'chapter-14-computer-use') continue
      const path = targetPath(getContentItem(itemId).route)
      mkdirSync(join(path, '..'), { recursive: true })
      writeFileSync(path, `<h1>${itemId}</h1>`)
    }
    for (const path of [
      'projects/index.html', 'projects/example.html', 'labs/index.html', 'labs/example.html',
      'projects.html', 'labs.html', 'capstone/index.html', 'capstone.html',
    ]) {
      const target = join(fixtureDir, path)
      mkdirSync(join(target, '..'), { recursive: true })
      writeFileSync(target, '<h1>not published</h1>')
    }

    try {
      const errors = validateDist(fixtureDir)
      expect(errors).toContain('构建产物缺少公开课程目标：chapters/14-computer-use.html')
      expect(errors).toContainEqual(expect.stringContaining('projects/example.html'))
      expect(errors).toContainEqual(expect.stringContaining('labs/index.html'))
      expect(errors).toContainEqual(expect.stringContaining('labs/example.html'))
      expect(errors).toContainEqual(expect.stringContaining('projects.html'))
      expect(errors).toContainEqual(expect.stringContaining('labs.html'))
      expect(errors).toContainEqual(expect.stringContaining('capstone/index.html'))
      expect(errors).toContainEqual(expect.stringContaining('capstone.html'))
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true })
    }
  })

  it('labels the local delivery source as case reasoning only', () => {
    const sources = parse(readFileSync('sources/source-index.yml', 'utf8')).sources as Array<{
      id: string
      note: string
    }>
    const deliverySource = sources.find((source) => source.id === 'delivery-patterns')

    expect(deliverySource?.note).toContain('案例推演')
    expect(deliverySource?.note).toContain('不能单独支撑外部事实')
  })
})

describe('progressive project publication boundary', () => {
  const approvedProjectOutputs = [
    'projects/index.html',
    'projects/mcp-python-sdk.html',
    'projects/aider.html',
    'projects/openhands.html',
    'projects/agent-benchmarks.html',
    'projects/dify.html',
    'projects/crewai.html',
    'projects/history-autogpt-flowise.html',
  ]

  it('allows any subset of the eight approved project outputs during implementation', () => {
    expect(validatePublishedRouteBoundary([
      'index.html',
      'projects/mcp-python-sdk.html',
      'projects/aider.html',
    ])).toEqual([])
  })

  it('allows every approved project output with POSIX and Windows separators', () => {
    for (const output of approvedProjectOutputs) {
      expect(validatePublishedRouteBoundary([output])).toEqual([])
      expect(validatePublishedRouteBoundary([output.replaceAll('/', '\\')])).toEqual([])
    }
    expect(validatePublishedRouteBoundary(['projects\\aider.html'])).toEqual([])
    expect(validatePublishedRouteBoundary(['./projects/aider.html'])).toEqual([])
  })

  it('still rejects unapproved projects and every lab or capstone output', () => {
    expect(validatePublishedRouteBoundary([
      'projects/unreviewed.html',
      'projects/private/notes.html',
      './projects/unreviewed.html',
      'tmp/../projects/unreviewed.html',
      'projects/../labs/index.html',
      '../projects/aider.html',
      'tmp/../../projects/mcp-python-sdk.html',
      'projects.html',
      'labs/index.html',
      'capstone/index.html',
      'Labs/index.html',
      'Capstone/index.html',
      'Superpowers/plan.html',
      'Projects/unreviewed.html',
      'Projects/aider.html',
      'projects/Aider.html',
    ])).toEqual(expect.arrayContaining([
      expect.stringContaining('projects/unreviewed.html'),
      expect.stringContaining('projects/private/notes.html'),
      expect.stringContaining('./projects/unreviewed.html'),
      expect.stringContaining('tmp/../projects/unreviewed.html'),
      expect.stringContaining('projects/../labs/index.html'),
      expect.stringContaining('../projects/aider.html'),
      expect.stringContaining('tmp/../../projects/mcp-python-sdk.html'),
      expect.stringContaining('projects.html'),
      expect.stringContaining('labs/index.html'),
      expect.stringContaining('capstone/index.html'),
      expect.stringContaining('Labs/index.html'),
      expect.stringContaining('Capstone/index.html'),
      expect.stringContaining('Superpowers/plan.html'),
      expect.stringContaining('Projects/unreviewed.html'),
      expect.stringContaining('Projects/aider.html'),
      expect.stringContaining('projects/Aider.html'),
    ]))
  })

  it('rejects absolute paths, Windows drive paths, and NUL bytes', () => {
    expect(validatePublishedRouteBoundary([
      '/projects/aider.html',
      '\\\\server\\share\\projects\\aider.html',
      'C:\\projects\\aider.html',
      'projects/\0aider.html',
    ])).toEqual(expect.arrayContaining([
      expect.stringContaining('/projects/aider.html'),
      expect.stringContaining('\\\\server\\share\\projects\\aider.html'),
      expect.stringContaining('C:\\projects\\aider.html'),
      expect.stringContaining('projects/\0aider.html'),
    ]))
  })
})

describe('project publication boundary', () => {
  it('returns a structured error for dangling dist symlinks', () => {
    const dist = createCompleteDistFixture()
    try {
      symlinkSync('missing-target.html', join(dist, 'dangling.html'))
      let errors: string[] | undefined
      expect(() => {
        errors = validateDist(dist)
      }).not.toThrow()
      expect(errors).toContain('构建产物包含无法读取的文件：dangling.html')
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('canonicalizes Windows-style approved outputs before every dist check', () => {
    const dist = createCompleteDistFixture()
    try {
      for (const relative of expectedProjectOutputs) {
        renameSync(join(dist, relative), join(dist, relative.replaceAll('/', '\\')))
      }
      expect(validateDist(dist)).toEqual([])
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('rejects output paths that collide after POSIX normalization', () => {
    const dist = createCompleteDistFixture()
    try {
      copyFileSync(
        join(dist, 'projects/aider.html'),
        join(dist, 'projects\\aider.html'),
      )
      expect(validateDist(dist))
        .toContain('构建产物路径规范化后重复：projects/aider.html')
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('requires every approved project output', () => {
    for (const missing of expectedProjectOutputs) {
      const dist = createCompleteDistFixture()
      try {
        rmSync(join(dist, missing))
        expect(validateDist(dist), missing)
          .toContain(`构建产物缺少项目页面：${missing}`)
      } finally {
        rmSync(dist, { recursive: true, force: true })
      }
    }
  })

  it('rejects extra project, lab, and capstone pages', () => {
    const dist = createCompleteDistFixture()
    try {
      for (const relative of ['projects/unreviewed.html', 'labs/index.html', 'capstone/index.html']) {
        mkdirSync(dirname(join(dist, relative)), { recursive: true })
        writeFileSync(join(dist, relative), '<html></html>')
      }
      expect(validateDist(dist)).toEqual(expect.arrayContaining([
        expect.stringContaining('projects/unreviewed.html'),
        expect.stringContaining('labs/index.html'),
        expect.stringContaining('capstone/index.html'),
      ]))
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('requires 26 exact course links and accepts only the eight approved project pages', () => {
    const dist = createCompleteDistFixture()
    try {
      expect(validateDist(dist)).toEqual([])
      const html = readFileSync(join(dist, 'course/index.html'), 'utf8')
      expect(validateCourseDist(html)).toEqual([])
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('ignores comment and script bait instead of treating it as course markup', () => {
    const stages = ['基础认知', '核心机制', '生产工程', '应用模式', '项目拆解', '综合实战']
    const links = publishedCourseItems.map(({ itemId }) => {
      const route = getContentItem(itemId).route
      return `<a href="/agent-engineering-for-beginners${route}">${itemId}</a>`
    })
    const bait = `<nav class="course-map">${stages.join('')}本地进度将在页面加载后显示${links.join('')}</nav>`
    const html = `<!-- ${bait} --><script>${bait}</script><nav class="course-map">真实课程地图</nav>`

    expect(validateCourseDist(html)).toContain('课程页必须包含 26 个唯一的公开课程链接')
    expect(validateCourseDist(html)).toContain('课程页缺少 SSR 中性进度文案')
  })

  it('accepts only clean root-relative exact course URLs', () => {
    const dist = createCompleteDistFixture()
    try {
      const coursePath = join(dist, 'course/index.html')
      const original = readFileSync(coursePath, 'utf8')
      const firstHref = '/agent-engineering-for-beginners/preface'
      const invalidHrefs = [
        `https://mengen-ink.github.io${firstHref}`,
        `//mengen-ink.github.io${firstHref}`,
        `${firstHref}?preview=1`,
        `${firstHref}#iq-01-a`,
        '/agent-engineering-for-beginners/chapters/../preface',
        `${firstHref}/`,
        '/agent-engineering-for-beginners/chapters/01-ai-native',
      ]
      for (const href of invalidHrefs) {
        writeFileSync(coursePath, original.replace(firstHref, href))
        expect(validateDist(dist), href)
          .toContain('课程页必须包含 26 个唯一的公开课程链接')
      }
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('enforces immutable, local, and complete static project output', () => {
    const dist = createCompleteDistFixture()
    try {
      writeFileSync(
        join(dist, 'projects/aider.html'),
        '<main><div class="vp-doc"><ol class="project-source-links"><li><a href="https://github.com/example/project/blob/main/src/index.ts">source</a></li></ol><img src="https://example.com/remote.png"></div></main>',
      )
      expect(validateDist(dist)).toEqual(expect.arrayContaining([
        '项目页缺少固定版本：projects/aider.html',
        '项目页缺少源码入口：projects/aider.html',
        '项目页包含移动分支源码链接：projects/aider.html',
        '项目页缺少固定 commit 源码链接：projects/aider.html',
        '项目页包含外链图片：projects/aider.html',
        '核心项目页缺少章节 30 秒结论：projects/aider.html',
      ]))
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('ignores project contract bait in comments, scripts, templates, and CSS comments', () => {
    const dist = createCompleteDistFixture()
    try {
      const file = join(dist, 'projects/aider.html')
      const original = readFileSync(file, 'utf8')
      const bait = '<img src="https://example.com/remote.png"><a href="https://github.com/example/project/blob/main/fake.ts">bait</a>'
      writeFileSync(
        file,
        original
          .replace(
            '<div class="vp-doc">',
            `<div class="vp-doc"><!-- ${bait} --><script>${bait}</script><template>${bait}</template><style>/* background:url(https://example.com/comment.png) */</style>`,
          )
          .replace('</main>', `</main>${bait}`),
      )
      expect(validateDist(dist)).toEqual([])
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('rejects every remote image candidate in structured project HTML', () => {
    const remoteMarkup = [
      '<img src="//example.com/protocol-relative.png">',
      '<img src="/local.png" srcset="/local-2x.png 2x, https://example.com/srcset.png 3x">',
      '<picture><source srcset="data:image/png;base64,AAAA 1x, //example.com/picture.png 2x"><img src="/local-picture.png"></picture>',
      '<picture><source src="https://example.com/source-src.png"><img src="/local-source-fallback.png"></picture>',
      '<noscript><img src="https://example.com/noscript.png"></noscript>',
      '<svg><image href="//example.com/svg-href.png"></image></svg>',
      '<svg><image xlink:href="https://example.com/svg-xlink.png"></image></svg>',
      '<img srcset="data:image/png;base64,AAAA, https://evil.example/data-comma.png 2x">',
      String.raw`<img src="https:\\evil.example\a.png">`,
      '<img src="h&#x09;t&#x0A;tps://evil.example/control.png">',
      '<img src="http://[">',
    ]

    for (const markup of remoteMarkup) {
      const dist = createCompleteDistFixture()
      try {
        const file = join(dist, 'projects/aider.html')
        writeFileSync(
          file,
          readFileSync(file, 'utf8').replace('<div class="vp-doc">', `<div class="vp-doc">${markup}`),
        )
        expect(validateDist(dist), markup)
          .toContain('项目页包含外链图片：projects/aider.html')
      } finally {
        rmSync(dist, { recursive: true, force: true })
      }
    }
  })

  it('applies the remote resource gate to the project overview', () => {
    const dist = createCompleteDistFixture()
    try {
      const file = join(dist, 'projects/index.html')
      writeFileSync(
        file,
        readFileSync(file, 'utf8').replace(
          '<div class="vp-doc">',
          '<div class="vp-doc"><img src="https://evil.example/overview.png">',
        ),
      )
      expect(validateDist(dist))
        .toContain('项目页包含外链图片：projects/index.html')
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('rejects remote SVG and CSS resources in real project content', () => {
    const remoteMarkup = [
      '<svg><use href="https://evil.example/icons.svg#one"></use></svg>',
      '<svg><use xlink:href="//evil.example/icons.svg#two"></use></svg>',
      '<svg><filter><feImage href="https://evil.example/filter.png"></feImage></filter></svg>',
      '<svg><filter><feImage xlink:href="//evil.example/filter-xlink.png"></feImage></filter></svg>',
      '<svg><script href="https://evil.example/script.js"></script></svg>',
      '<svg><pattern href="https://evil.example/pattern.svg#tile"></pattern></svg>',
      '<svg><linearGradient href="https://evil.example/gradient.svg#linear"></linearGradient></svg>',
      '<svg><radialGradient href="https://evil.example/gradient.svg#radial"></radialGradient></svg>',
      '<svg><filter href="https://evil.example/filter.svg#fx"></filter></svg>',
      '<svg><mpath href="https://evil.example/path.svg#motion"></mpath></svg>',
      '<svg><textPath href="https://evil.example/path.svg#text"></textPath></svg>',
      '<svg><animate href="https://evil.example/target.svg#node"></animate></svg>',
      '<svg><animateMotion href="https://evil.example/target.svg#motion"></animateMotion></svg>',
      '<svg><animateTransform href="https://evil.example/target.svg#transform"></animateTransform></svg>',
      '<svg><set href="https://evil.example/target.svg#set"></set></svg>',
      '<script src="https://evil.example/runtime.js"></script>',
      '<iframe src="//evil.example/frame.html"></iframe>',
      '<link rel="stylesheet" href="https://evil.example/theme.css">',
      '<link rel="preload icon" href="//evil.example/preload.woff2">',
      '<video poster="https://evil.example/poster.png"></video>',
      '<object data="https://evil.example/object.svg"></object>',
      '<embed src="https://evil.example/embed.pdf">',
      '<input src="https://evil.example/input.png">',
      '<audio src="https://evil.example/audio.mp3"></audio>',
      '<video src="https://evil.example/video.mp4"></video>',
      '<track src="https://evil.example/subtitles.vtt">',
      String.raw`<svg><use href="https:\\evil.example\icons.svg#three"></use></svg>`,
      '<pre><img src="https://evil.example/raw-pre.png"></pre>',
      '<code><svg><use href="https://evil.example/raw-code.svg#icon"></use></svg></code>',
      '<div style="background-image:url(//evil.example/inline.png)"></div>',
      '<div style="mask:url(h&#x09;t&#x0A;tps://evil.example/control.svg)"></div>',
      String.raw`<div style="background:u\72l(https://evil.example/escaped-url.png)"></div>`,
      String.raw`<div style="background:url(https\3a //evil.example/escaped-value.png)"></div>`,
      `<div style="background-image:image-set('/local.png' 1x, 'https://evil.example/image-set.png' 2x)"></div>`,
      '<div style="background-image:-webkit-image-set(url(/local.png) 1x, url(//evil.example/webkit.png) 2x)"></div>',
      '<style>.project-overview{background:url(https://evil.example/block.png)}</style>',
      '<style>@import "//evil.example/import.css";</style>',
      '<style>@import url(https://evil.example/import-url.css);</style>',
      String.raw`<style>.escaped{background:u\72l(https://evil.example/style-escaped.png)}</style>`,
      String.raw`<style>@im\70ort "https://evil.example/escaped-import.css";</style>`,
      '<noscript><style>.fallback{background:url(https://evil.example/nojs.png)}</style></noscript>',
    ]

    for (const markup of remoteMarkup) {
      const dist = createCompleteDistFixture()
      try {
        const file = join(dist, 'projects/aider.html')
        writeFileSync(
          file,
          readFileSync(file, 'utf8').replace('<div class="vp-doc">', `<div class="vp-doc">${markup}`),
        )
        expect(validateDist(dist), markup)
          .toContain('项目页包含外链资源：projects/aider.html')
      } finally {
        rmSync(dist, { recursive: true, force: true })
      }
    }
  })

  it('allows explicit local, data, and blob image candidates in project HTML', () => {
    const dist = createCompleteDistFixture()
    try {
      const file = join(dist, 'projects/aider.html')
      const localMarkup = `<picture><source src="relative.png" srcset="/local.png 1x, data:image/png;base64,AAAA 2x, blob:https://example.com/id 3x"><img src="/fallback.png"></picture><svg><use href="/icons.svg#local"></use><feImage href="data:image/png;base64,AAAA"></feImage></svg><script src="/runtime.js"></script><iframe src="./frame.html"></iframe><link rel="stylesheet" href="/theme.css"><link rel="canonical" href="https://docs.example.com/canonical"><video src="/video.mp4" poster="data:image/png;base64,AAAA"></video><audio src="blob:https://example.com/audio"></audio><track src="/subtitles.vtt"><object data="/object.svg"></object><embed src="./embed.pdf"><input src="/input.png"><div style="background:url(data:image/png;base64,AAAA);mask:url(blob:https://example.com/id);content-image:image-set('/one.png' 1x, 'data:image/png;base64,BBBB' 2x)"></div><style>@import "/local.css";.local{background:url(./asset.png);content:image-set("blob:https://example.com/id" 1x)}</style>`
      writeFileSync(
        file,
        readFileSync(file, 'utf8').replace(
          '<div class="vp-doc">',
          `<div class="vp-doc">${localMarkup}`,
        ),
      )
      expect(validateDist(dist)).toEqual([])
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('rejects remote resources in built CSS and allows local, data, and blob URLs', () => {
    const dist = createCompleteDistFixture()
    try {
      const cssPath = join(dist, 'assets/project.css')
      mkdirSync(dirname(cssPath), { recursive: true })
      writeFileSync(
        cssPath,
        '@import "./local.css" layer(project) supports(display:grid) screen;@import "data:text/css,.safe{}" layer(data);.local{background:url(./asset.png);mask:url(data:image/svg+xml,AAAA);cursor:url(blob:https://example.com/id),auto}',
      )
      expect(validateDist(dist)).toEqual([])

      for (const css of [
        '.remote{background:url(https://evil.example/a.png)}',
        '@import "//evil.example/theme.css";',
        '@import url(https://evil.example/theme-url.css);',
        String.raw`.remote{background:url(https:\\evil.example\a.png)}`,
        '.remote{background:url(h\tt\ntps://evil.example/control.png)}',
        String.raw`.remote{background:u\72l(https://evil.example/escaped-function.png)}`,
        String.raw`.remote{background:url(https\3a //evil.example/escaped-value.png)}`,
        '.remote{background:image-set("/local.png" 1x,"https://evil.example/image-set.png" 2x)}',
        '.remote{background:-webkit-image-set(url(/local.png) 1x,url(//evil.example/webkit.png) 2x)}',
        String.raw`@im\70ort "https://evil.example/escaped-import.css";`,
        String.raw`@import "https\3A //evil.example/escaped-scheme.css" layer(project);`,
        String.raw`@import "\68\74\74\70\73\3A \2F \2F evil.example/escaped-characters.css" supports(display:grid) screen;`,
        String.raw`@import "HTTPS\3a //EVIL.EXAMPLE/escaped-case.css" layer(theme) supports(display:grid) print;`,
      ]) {
        writeFileSync(cssPath, css)
        expect(validateDist(dist), css)
          .toContain('构建产物 CSS 包含外链资源：assets/project.css')
      }
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('requires real project sections and h2 elements instead of string bait', () => {
    const dist = createCompleteDistFixture()
    try {
      const bait = [
        '固定版本',
        '关键源码入口',
        ...fixtureProjectHeadings.map((heading) => `<h2>${heading}</h2>`),
        '<ol class="project-source-links"><a href="https://github.com/Aider-AI/aider/blob/a4be6ccd87ebaa59b361f3f028d116ce1761b626/aider/main.py">source</a></ol>',
      ].join('')
      writeFileSync(
        join(dist, 'projects/aider.html'),
        `<main><div class="vp-doc"><script type="application/json">${bait}</script><!-- ${bait} --></div></main>`,
      )
      expect(validateDist(dist)).toEqual(expect.arrayContaining([
        '项目页缺少固定版本：projects/aider.html',
        '项目页缺少源码入口：projects/aider.html',
        '核心项目页缺少章节 30 秒结论：projects/aider.html',
        '项目页源码与许可链接不符合 catalog：projects/aider.html',
      ]))
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('requires the exact catalog-derived project source and license URLs', () => {
    const aider = fixtureProjectCatalog.subjects.find((subject) => subject.id === 'aider')!
    const originalUrl = fixtureProjectSourceUrl(aider, aider.entrypoints[0].path)
    const replacements = [
      originalUrl.replace('github.com', 'github.example.com'),
      originalUrl.replace('/Aider-AI/aider/', '/someone-else/aider/'),
      originalUrl.replace(`/blob/${aider.pinned_commit}/`, '/blob/develop/'),
      originalUrl.replace('/aider/main.py', '/aider/wrong.py'),
      originalUrl.replace('https://', 'https://user@'),
      originalUrl.replace('github.com/', 'github.com:444/'),
      `${originalUrl}?plain=1`,
      `${originalUrl}#L1`,
    ]

    for (const replacement of replacements) {
      const dist = createCompleteDistFixture()
      try {
        const file = join(dist, 'projects/aider.html')
        writeFileSync(file, readFileSync(file, 'utf8').replace(originalUrl, replacement))
        expect(validateDist(dist), replacement)
          .toContain('项目页源码与许可链接不符合 catalog：projects/aider.html')
      } finally {
        rmSync(dist, { recursive: true, force: true })
      }
    }
  })

  it('rejects missing and unexpected project source or license anchors', () => {
    const aider = fixtureProjectCatalog.subjects.find((subject) => subject.id === 'aider')!
    const licenseUrl = fixtureProjectSourceUrl(aider, aider.license_sources[0].path)
    const dist = createCompleteDistFixture()
    try {
      const file = join(dist, 'projects/aider.html')
      const html = readFileSync(file, 'utf8')
        .replace(`<a href="${licenseUrl}">${aider.license_sources[0].path}</a>`, '')
        .replace(
          '</ol>',
          `<a href="https://github.com/Aider-AI/aider/blob/${aider.pinned_commit}/unexpected.ts">unexpected</a></ol>`,
        )
      writeFileSync(file, html)
      expect(validateDist(dist))
        .toContain('项目页源码与许可链接不符合 catalog：projects/aider.html')
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('rejects unexpected internal or external anchors anywhere in the project document', () => {
    const aider = fixtureProjectCatalog.subjects.find((subject) => subject.id === 'aider')!
    const unexpectedHrefs = [
      'https://evil.example/project',
      `https://evil.example/?next=${encodeURIComponent(fixtureProjectSourceUrl(aider, aider.entrypoints[0].path))}`,
      `https://github.com/Aider-AI/aider/blob/main/${aider.entrypoints[0].path}`,
      '/agent-engineering-for-beginners/chapters/01-ai-native#iq-01-a',
    ]

    for (const href of unexpectedHrefs) {
      const dist = createCompleteDistFixture()
      try {
        const file = join(dist, 'projects/aider.html')
        writeFileSync(
          file,
          readFileSync(file, 'utf8').replace('</div></main>', `<a href="${href}">unexpected</a></div></main>`),
        )
        expect(validateDist(dist), href)
          .toContain('项目页链接不符合公开契约：projects/aider.html')
      } finally {
        rmSync(dist, { recursive: true, force: true })
      }
    }
  })
})

describe('reader aids and landing page', () => {
  it('defines a five-minute route and a strong editorial hero', () => {
    const home = readFileSync('docs/index.md', 'utf8')
    expect(home).toContain('class="book-hero"')
    expect(home).toContain('五分钟看懂')
    expect(home).toContain('/chapters/02-workflow-agent')
    expect(home).toContain('/case-study/delivery-agent')
    expect(home).toContain('<SystemStack />')
  })

  it('explains the essential vocabulary', () => {
    const glossaryPath = 'docs/appendix/glossary.md'
    expect(existsSync(glossaryPath)).toBe(true)
    const glossary = readFileSync(glossaryPath, 'utf8')
    for (const term of ['Agent', 'Workflow', 'Tool', 'MCP', 'RAG', 'Memory', 'Graph', 'Eval']) {
      expect(glossary).toContain(`## ${term}`)
    }
  })

  it('provides a printable system review checklist', () => {
    const checklistPath = 'docs/appendix/review-checklist.md'
    expect(existsSync(checklistPath)).toBe(true)
    const checklist = readFileSync(checklistPath, 'utf8')
    for (const section of ['适用性', '可靠性', '安全', '成本', '运营']) {
      expect(checklist).toContain(`## ${section}`)
    }
    expect(checklist.match(/- \[ \]/g)?.length).toBeGreaterThanOrEqual(25)
  })

  it('makes source grades and local verification commands explicit', () => {
    const readingPath = 'docs/appendix/reading.md'
    expect(existsSync(readingPath)).toBe(true)
    const reading = readFileSync(readingPath, 'utf8')
    for (const grade of ['A级', 'B级', 'C级']) expect(reading).toContain(grade)

    const readmePath = 'README.md'
    expect(existsSync(readmePath)).toBe(true)
    const readme = readFileSync(readmePath, 'utf8')
    for (const command of ['pnpm test', 'pnpm validate', 'pnpm build', 'pnpm preview']) {
      expect(readme).toContain(command)
    }
    expect(readme).toContain('https://mengen-ink.github.io/agent-engineering-for-beginners/')
  })

  it('introduces the four-part, fourteen-chapter handbook and worksheets', () => {
    const home = readFileSync('docs/index.md', 'utf8')
    const navigationLinks = configuredNavigationLinks()
    expect(home).toContain('14 章')
    expect(home).toContain('第四篇')
    expect(home).toContain('/chapters/11-research-agent')
    expect(navigationLinks).toContain('/appendix/application-matrix')
    expect(navigationLinks).toContain('/appendix/chapter-template')
    expect(existsSync('docs/appendix/application-matrix.md')).toBe(true)
    expect(existsSync('docs/appendix/chapter-template.md')).toBe(true)
  })

  it('keeps saturated fields out of long homepage sections', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    const acts = style.match(/\.acts-section\s*\{([\s\S]*?)\}/u)?.[1] ?? ''
    const caseCallout = style.match(/\.case-callout\s*\{([\s\S]*?)\}/u)?.[1] ?? ''
    const start = style.match(/\.start-section\s*\{([\s\S]*?)\}/u)?.[1] ?? ''
    expect(acts).toContain('background: var(--reading-bg-soft)')
    expect(caseCallout).toContain('background: var(--reading-bg)')
    expect(start).toContain('background: var(--reading-bg-soft)')
  })
})

describe('release configuration', () => {
  it('maps base-prefixed preview URLs to the built files safely', async () => {
    const previewScript = 'scripts/serve-preview.mjs'
    expect(existsSync(previewScript)).toBe(true)
    const { resolvePreviewPath } = await import(
      pathToFileURL(join(process.cwd(), previewScript)).href
    )
    const fixtureDir = mkdtempSync(join(tmpdir(), 'agent-book-preview-'))
    mkdirSync(join(fixtureDir, 'assets'), { recursive: true })
    mkdirSync(join(fixtureDir, 'chapters'), { recursive: true })
    mkdirSync(join(fixtureDir, 'paths'), { recursive: true })
    writeFileSync(join(fixtureDir, 'index.html'), '<h1>book</h1>')
    writeFileSync(join(fixtureDir, 'assets/app.js'), 'console.log("book")')
    writeFileSync(join(fixtureDir, 'chapters/01.html'), '<h1>chapter</h1>')
    writeFileSync(join(fixtureDir, 'paths/index.html'), '<h1>reading paths</h1>')

    try {
      expect(resolvePreviewPath('/agent-engineering-for-beginners/', fixtureDir)).toBe(
        join(fixtureDir, 'index.html'),
      )
      expect(resolvePreviewPath('/agent-engineering-for-beginners/assets/app.js', fixtureDir)).toBe(
        join(fixtureDir, 'assets/app.js'),
      )
      expect(resolvePreviewPath('/agent-engineering-for-beginners/chapters/01', fixtureDir)).toBe(
        join(fixtureDir, 'chapters/01.html'),
      )
      expect(resolvePreviewPath('/agent-engineering-for-beginners/paths/', fixtureDir)).toBe(
        join(fixtureDir, 'paths/index.html'),
      )
      expect(resolvePreviewPath('/agent-engineering-for-beginners/paths', fixtureDir)).toBe(
        join(fixtureDir, 'paths/index.html'),
      )
      expect(resolvePreviewPath('/agent-engineering-for-beginners/chapters/01/', fixtureDir)).toBe(
        join(fixtureDir, 'chapters/01.html'),
      )
      expect(resolvePreviewPath('/agent-engineering-for-beginners/../../LICENSE', fixtureDir)).toBeNull()
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true })
    }
  })

  it('serves the existing SVG mark as a base-aware favicon', () => {
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    expect(config).toContain("rel: 'icon'")
    expect(config).toContain('href: `${base}mark.svg`')
  })

  it('uses a least-privilege GitHub Pages workflow with the full quality gate', () => {
    const workflowPath = '.github/workflows/deploy.yml'
    expect(existsSync(workflowPath)).toBe(true)
    const workflow = readFileSync(workflowPath, 'utf8')

    for (const fragment of [
      'contents: read',
      'pages: write',
      'id-token: write',
      'pnpm install --frozen-lockfile',
      'pnpm test',
      'pnpm build',
      'actions/configure-pages@v5',
      'actions/upload-pages-artifact@v3',
      'actions/deploy-pages@v4',
      'docs/.vitepress/dist',
    ]) {
      expect(workflow).toContain(fragment)
    }
    expect(workflow).toMatch(/push:\s*\n\s*branches: \[main\]/)
  })

  it('ships explicit licenses for code and prose', () => {
    expect(existsSync('LICENSE')).toBe(true)
    expect(existsSync('LICENSE-CONTENT')).toBe(true)
    expect(readFileSync('LICENSE', 'utf8')).toContain('MIT License')
    expect(readFileSync('LICENSE-CONTENT', 'utf8')).toContain('Creative Commons Attribution-ShareAlike 4.0')
  })
})

describe('interview registry', () => {
  it('contains forty-two structured and uniquely identified questions', async () => {
    const registryPath = 'docs/.vitepress/theme/data/interviewQuestions.ts'
    expect(existsSync(registryPath)).toBe(true)
    const { interviewQuestions } = await import(
      pathToFileURL(join(process.cwd(), registryPath)).href
    )

    expect(interviewQuestions).toHaveLength(42)
    expect(new Set(interviewQuestions.map((item: { id: string }) => item.id)).size).toBe(42)

    for (const item of interviewQuestions) {
      expect(item.id).toMatch(/^iq-(0[1-9]|1[0-4])-[abc]$/)
      expect(item.chapter).toBeGreaterThanOrEqual(1)
      expect(item.chapter).toBeLessThanOrEqual(14)
      expect(['工程', '产品']).toContain(item.role)
      expect(['基础', '进阶', '系统设计']).toContain(item.difficulty)
      expect(item.question.length).toBeGreaterThan(8)
      expect(item.shortAnswer.length).toBeGreaterThan(35)
      expect(item.followUps.length).toBeGreaterThanOrEqual(2)
      expect(item.followUps.length).toBeLessThanOrEqual(3)
      expect(item.strongSignals.length).toBeGreaterThanOrEqual(3)
      expect(item.pitfall.length).toBeGreaterThan(15)
    }
  })

  it('keeps three questions per chapter and the approved role mix', async () => {
    const registryPath = 'docs/.vitepress/theme/data/interviewQuestions.ts'
    expect(existsSync(registryPath)).toBe(true)
    const { interviewQuestions } = await import(
      pathToFileURL(join(process.cwd(), registryPath)).href
    )

    for (let chapter = 1; chapter <= 14; chapter += 1) {
      expect(interviewQuestions.filter((item: { chapter: number }) => item.chapter === chapter)).toHaveLength(3)
    }
    expect(interviewQuestions.filter((item: { role: string }) => item.role === '工程')).toHaveLength(30)
    expect(interviewQuestions.filter((item: { role: string }) => item.role === '产品')).toHaveLength(12)
  })
})

describe('interview placement', () => {
  it('renders accessible answer cards and a linked index', () => {
    const cardPath = 'docs/.vitepress/theme/components/InterviewQuestion.vue'
    const indexPath = 'docs/.vitepress/theme/components/InterviewIndex.vue'
    expect(existsSync(cardPath)).toBe(true)
    expect(existsSync(indexPath)).toBe(true)

    const card = readFileSync(cardPath, 'utf8')
    for (const marker of ['<details', ':id="question.id"', '30 秒回答', '面试官追问', '高分要点', '常见失分点']) {
      expect(card).toContain(marker)
    }
    const index = readFileSync(indexPath, 'utf8')
    expect(index).toContain('interviewQuestions')
    expect(index).toContain('#${question.id}')
  })

  it('places two questions in the chapter body and one after the exercise', () => {
    for (let chapter = 1; chapter <= 14; chapter += 1) {
      const file = [...expandedChapterFiles, ...applicationChapterFiles][chapter - 1]
      const text = readFileSync(file, 'utf8')
      const prefix = String(chapter).padStart(2, '0')
      const markers = ['a', 'b', 'c'].map(
        (suffix) => `<InterviewQuestion id="iq-${prefix}-${suffix}" />`,
      )
      for (const marker of markers) expect(text.split(marker)).toHaveLength(2)
      const exercise = text.indexOf('## 练习')
      expect(text.indexOf(markers[0])).toBeGreaterThan(0)
      expect(text.indexOf(markers[0])).toBeLessThan(exercise)
      expect(text.indexOf(markers[1])).toBeLessThan(exercise)
      expect(text.indexOf(markers[2])).toBeGreaterThan(exercise)
    }
  })

  it('publishes the interview index route without duplicating answers', () => {
    const pagePath = 'docs/appendix/interview.md'
    expect(existsSync(pagePath)).toBe(true)
    const page = readFileSync(pagePath, 'utf8')
    expect(page).toContain('<InterviewIndex />')
    expect(page).not.toContain('<InterviewQuestion')

    expect(configuredNavigationLinks()).toContain('/appendix/interview')
  })
})

describe('visual explanations', () => {
  const newDiagrams = [
    'NativeShift',
    'ToolBoundary',
    'GraphFlow',
    'MultiAgentHandoff',
    'ResearchPipeline',
    'ServiceEscalation',
    'CodingLoop',
    'BrowserEvidence',
  ]
  const allDiagrams = [
    'AgentLoop',
    'SystemStack',
    'DeliveryCase',
    'DecisionLadder',
    'MemoryLayers',
    'EvidencePyramid',
    'RiskMatrix',
    ...newDiagrams,
  ]

  it('registers eight new diagrams with conclusions and preserved semantics', () => {
    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    for (const component of newDiagrams) {
      const path = `docs/.vitepress/theme/components/${component}.vue`
      expect(existsSync(path)).toBe(true)
      expect(theme).toContain(`'${component}'`)
      const source = readFileSync(path, 'utf8')
      expect(source).toContain('<figure')
      expect(source).toContain('<figcaption>')
      expect(source).toContain('aria-label=')
      expect(source).toContain('不要误解')
      expect(source).not.toContain('role="img"')
    }
  })

  it('places exactly twenty-two explanatory visuals across fourteen chapters', () => {
    const pattern = new RegExp(`<(${allDiagrams.join('|')})\\s*/>`, 'g')
    let total = 0
    for (const chapter of [...expandedChapterFiles, ...applicationChapterFiles]) {
      const matches = readFileSync(chapter, 'utf8').match(pattern) ?? []
      expect(matches.length, chapter).toBeGreaterThanOrEqual(1)
      total += matches.length
    }
    expect(total).toBe(22)
  })

  it('provides mobile reflow rules for every new diagram family', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    for (const selector of [
      '.native-shift',
      '.tool-boundary',
      '.graph-flow',
      '.multi-agent-handoff',
      '.research-pipeline',
      '.service-escalation',
      '.coding-loop',
      '.browser-evidence',
    ]) {
      expect(style).toContain(selector)
    }
    expect(style).toContain('.visual-flow-list')
    expect(style).toContain('grid-template-columns: 1fr')
  })

  it('models graph fan-out, join and recovery as distinct structures', () => {
    const graph = readFileSync('docs/.vitepress/theme/components/GraphFlow.vue', 'utf8')
    expect(graph).toContain('class="parallel-branches"')
    expect(graph).toContain('role="group"')
    expect(graph).toContain('并行分叉')
    expect(graph).toContain('全部必需分支完成后汇合')
    expect(graph).toContain('class="flow-recovery"')
    expect(graph).toContain('回到失败节点前')
  })

  it('preserves list semantics after visual markers are removed', () => {
    for (const component of [
      'ToolBoundary',
      'ResearchPipeline',
      'ServiceEscalation',
      'CodingLoop',
      'BrowserEvidence',
    ]) {
      const source = readFileSync(`docs/.vitepress/theme/components/${component}.vue`, 'utf8')
      expect(source).toContain('<ol class="visual-flow-list" role="list">')
    }
  })
})
