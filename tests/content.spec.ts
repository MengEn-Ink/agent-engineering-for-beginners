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
      expect(text, chapter).toMatch(/<(AgentLoop|SystemStack|DeliveryCase|DecisionLadder|MemoryLayers|EvidencePyramid|RiskMatrix)\s*\/>/)
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
    for (const component of ['DecisionLadder', 'MemoryLayers', 'EvidencePyramid', 'RiskMatrix']) {
      const source = readFileSync(`docs/.vitepress/theme/components/${component}.vue`, 'utf8')
      expect(source).toContain('role="img"')
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
      expect(text).toMatch(/<(AgentLoop|SystemStack|DeliveryCase)\s*\/>/)
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
