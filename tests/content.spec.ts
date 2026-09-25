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
      chapters: string[]
    }>

    for (const chapter of ['11', '12', '13', '14']) {
      const firstParty = sources.filter(
        (source) => source.grade === 'A' && source.chapters.includes(chapter),
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

    const sources = parse(readFileSync(sourcePath, 'utf8')).sources as Array<Record<string, unknown>>
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
          chapters: expect.any(Array),
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
      expect(validateDist(fixtureDir)).toEqual([
        expect.stringContaining('superpowers'),
      ])
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
    writeFileSync(join(fixtureDir, 'index.html'), '<h1>book</h1>')
    writeFileSync(join(fixtureDir, 'assets/app.js'), 'console.log("book")')
    writeFileSync(join(fixtureDir, 'chapters/01.html'), '<h1>chapter</h1>')

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
})
