import { describe, expect, it } from 'vitest'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'yaml'
import { getContentItem } from '../docs/.vitepress/theme/data/contentRegistry'
import { publishedCourseItems } from '../docs/.vitepress/theme/data/courseMap'

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

function contentCharacterCount(markdown: string) {
  return markdown
    .replace(/^---[\s\S]*?---\s*/u, '')
    .replace(/<!--[\s\S]*?-->/gu, '')
    .replace(/\s/gu, '')
    .length
}

describe('book scaffold', () => {
  it('declares the public title and all ten chapter routes', () => {
    const configPath = 'docs/.vitepress/config.mts'

    expect(existsSync(configPath)).toBe(true)

    const config = readFileSync(configPath, 'utf8')
    expect(config).toContain('别只会和 AI 聊天')

    for (let chapter = 1; chapter <= 10; chapter += 1) {
      expect(config).toContain(`/chapters/${String(chapter).padStart(2, '0')}-`)
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
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    for (const route of [
      '/chapters/11-research-agent',
      '/chapters/12-service-operations-agent',
      '/chapters/13-coding-agent',
      '/chapters/14-computer-use',
    ]) {
      expect(config).toContain(route)
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
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    expect(frontierPages.filter((page) => !existsSync(page))).toEqual([])

    for (const route of [
      '/radar/',
      '/radar/2026-09',
      '/frontier/context-engineering',
      '/frontier/interoperability-identity',
      '/frontier/durable-execution',
      '/frontier/agent-security-evaluation',
    ]) {
      expect(config).toContain(route)
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
        expect(step.path).toMatch(/^\/(chapters|appendix)\//u)
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
    const current = '/chapters/14-computer-use'
    expect(findNextReadingStep(path, current, [])?.path).not.toBe(current)
    expect(findNextReadingStep(path, current, path.steps.slice(0, -1).map((step: { path: string }) => step.path)))
      .toBeUndefined()
  })

  it('publishes an interactive path page and global chapter controls', () => {
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    const pathsPage = 'docs/paths/index.md'
    const pathsComponent = 'docs/.vitepress/theme/components/ReadingPaths.vue'
    const progressComponent = 'docs/.vitepress/theme/components/ReadingProgress.vue'

    expect(config).toContain('/paths/')
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
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')

    expect(existsSync(page)).toBe(true)
    expect(readFileSync(page, 'utf8')).toContain('<InterviewTrainer />')
    expect(config).toContain('/appendix/interview-training')
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
        '<nav class="course-map"><a href="/preface">重复课程</a><a href="/preface">重复课程</a>/projects/ /labs/ 标记已读 加入书签</nav>',
      )

      const errors = validateDist(fixtureDir)
      expect(errors).toContain('课程页必须包含 20 个唯一的公开课程链接')
      expect(errors).toContain('课程页缺少 SSR 中性进度文案')
      for (const stage of ['基础认知', '核心机制', '生产工程', '应用模式', '项目拆解', '综合实战']) {
        expect(errors).toContain(`课程页缺少阶段：${stage}`)
      }
      for (const forbidden of ['/projects/', '/labs/', '标记已读', '加入书签']) {
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
      expect(validateDist(fixtureDir)).toContain('课程页必须包含 20 个唯一的公开课程链接')
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
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    expect(home).toContain('14 章')
    expect(home).toContain('第四篇')
    expect(home).toContain('/chapters/11-research-agent')
    expect(config).toContain('/appendix/application-matrix')
    expect(config).toContain('/appendix/chapter-template')
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

    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    expect(config).toContain('/appendix/interview')
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
