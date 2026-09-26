import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createMarkdownRenderer } from 'vitepress'
import { describe, expect, it } from 'vitest'
import { contentItems, getContentItem } from '../docs/.vitepress/theme/data/contentRegistry'
import { interviewQuestions } from '../docs/.vitepress/theme/data/interviewQuestions'
import { createProjectCatalogLookup } from '../docs/.vitepress/theme/data/projectCatalogCore'
import type { ProjectCatalog } from '../docs/.vitepress/theme/data/projectCatalogTypes'
import {
  loadProjectCatalog,
  validateProjectCatalogIntegration,
} from '../scripts/project-catalog.mjs'
import {
  extractProjectMarkdownContract,
  isRemoteImageCandidate,
} from '../scripts/publication-contracts.mjs'
import { validateBook } from '../scripts/validate-content.mjs'

const projectCatalog = loadProjectCatalog(resolve('sources/project-index.yml')) as ProjectCatalog
const {
  getProjectChain,
  getProjectPage,
  getProjectSubject,
  projectSourceUrl,
} = createProjectCatalogLookup(projectCatalog)

const requiredProjectHeadings = [
  '30 秒结论', '为什么选', '版本与边界', '原创建筑图', '唯一纵向调用链',
  '关键源码入口', '一次请求的数据流', '阅读练习', '失败边界', '生产边界',
  '高频面试点', '升级复核', '来源与归因',
]

const projectRouteRecords = [
  ['projects-index', '/projects/', '开源项目拆解', 'project'],
  ['project-mcp-python-sdk', '/projects/mcp-python-sdk', 'MCP 规范与 Python SDK', 'project'],
  ['project-aider', '/projects/aider', 'Aider 源码拆解', 'project'],
  ['project-openhands', '/projects/openhands', 'OpenHands 源码拆解', 'project'],
  ['project-agent-benchmarks', '/projects/agent-benchmarks', 'Agent 评测基准', 'project'],
  ['project-dify', '/projects/dify', 'Dify 源码拆解', 'project'],
  ['project-crewai', '/projects/crewai', 'CrewAI 源码拆解', 'project'],
  ['project-history-autogpt-flowise', '/projects/history-autogpt-flowise', 'AutoGPT 与 Flowise：历史反例', 'project'],
] as const

const markdown = await createMarkdownRenderer(resolve('docs'))

function expectCoreProjectPage(path: string, projectId: string) {
  const text = readFileSync(path, 'utf8')
  const contract = extractProjectMarkdownContract(text, markdown)
  expect(text).toContain(`<ProjectMeta project-id="${projectId}" />`)
  expect(text).toContain(`<ProjectCallChain project-id="${projectId}" />`)
  expect(text).toContain(`<ProjectSourceLinks project-id="${projectId}" />`)
  expect(contract.headings, path).toEqual(requiredProjectHeadings)
  expect(contract.text).not.toMatch(
    /npm install|pip install|docker run|OPENAI_API_KEY|ANTHROPIC_API_KEY/u,
  )
  expect(contract.images.filter(isRemoteImageCandidate), path).toEqual([])
}

describe('project routes and catalog overview', () => {
  it('enforces the project page contract for every reading-only page', () => {
    const coreIds = projectRouteRecords.slice(1, 7).map(([id]) => id)
    for (const [id, route] of projectRouteRecords) {
      const file = `docs${route.endsWith('/') ? `${route}index` : route}.md`
      const text = readFileSync(file, 'utf8')
      const parsed = extractProjectMarkdownContract(text, markdown)
      expect(parsed.text, file).not.toMatch(/npm install|pip install|docker run|API_KEY/u)
      expect(parsed.images.filter(isRemoteImageCandidate), file).toEqual([])
      if (coreIds.includes(id)) {
        expect(parsed.headings, file).toEqual(requiredProjectHeadings)
        expect(new Set(parsed.headings).size, `${file}: duplicate H2`)
          .toBe(requiredProjectHeadings.length)
        expect(text).toContain(`<ProjectMeta project-id="${id}" />`)
        expect(text).toContain(`<ProjectCallChain project-id="${id}" />`)
        expect(text).toContain(`<ProjectSourceLinks project-id="${id}" />`)
      }
    }

    const questionIds = new Set(interviewQuestions.map((question) => question.id))
    for (const page of projectCatalog.pages) {
      for (const id of page.interview_question_ids) {
        expect(questionIds.has(id), `${page.page_item_id}:${id}`).toBe(true)
      }
      const route = getContentItem(page.page_item_id).route
      const file = `docs${route.endsWith('/') ? `${route}index` : route}.md`
      const text = readFileSync(file, 'utf8')
      const actualLinks = extractProjectMarkdownContract(text, markdown).links
      const expectedLinks = page.page_item_id === 'projects-index'
        ? ['/case-study/delivery-agent']
        : page.interview_question_ids.map((id) => {
            const question = interviewQuestions.find((candidate) => candidate.id === id)!
            return `${question.path}#${id}`
          })
      expect(actualLinks, page.page_item_id).toEqual(expectedLinks)
      expect(new Set(actualLinks).size, `${page.page_item_id}: duplicate interview links`)
        .toBe(actualLinks.length)
    }
  })

  it('ignores fenced and commented fake Markdown contracts', () => {
    const parsed = extractProjectMarkdownContract(`
## Real heading

\`\`\`md
## Fake heading
![remote](https://example.com/fake.png)
![protocol relative](//example.com/fake-protocol-relative.png)
[fake](/chapters/01-ai-native#iq-01-a)
npm install fake-package
FAKE_API_KEY=secret
\`\`\`

\`npm install inline-code\`
<code><a href="/chapters/01-ai-native#iq-01-a">code link</a><img src="https://example.com/code.png">INLINE_API_KEY=secret</code>
<code><code>nested</code><img src="https://example.com/nested-code.png">NESTED_API_KEY=secret</code>

<template>

## Template heading

<a href="/chapters/02-workflow-agent#iq-02-a">template link</a>

</template>

<pre>

## Pre heading

<a href="/chapters/03-react#iq-03-a">pre link</a>

</pre>

<code>

## Code block heading

<a href="/chapters/03-react#iq-03-b">code block link</a>

</code>

<svg>

## SVG heading

<a href="/chapters/04-tools-mcp#iq-04-a">svg link</a>

</svg>

<noscript>

## Noscript heading

<a href="/chapters/05-state-memory#iq-05-a">noscript link</a>

</noscript>

<script>

## Script heading

<a href="/chapters/06-loop-graph#iq-06-a">script link</a>

</script>

<style>

## Style heading

<a href="/chapters/07-multi-agent#iq-07-a">style link</a>

</style>

<!--
## Comment heading
![remote](https://example.com/comment.png)
<a href="/chapters/01-ai-native#iq-01-a">comment link</a>
<picture><source srcset="https://example.com/comment-source.png"><img src="//example.com/comment-image.png"></picture>
-->
`, markdown)

    expect(parsed.headings).toEqual(['Real heading'])
    expect(parsed.images).toEqual([])
    expect(parsed.links).toEqual([])
    expect(parsed.text).not.toMatch(/npm install|API_KEY/u)
  })

  it('normalizes browser-visible text across Markdown and HTML formatting', () => {
    const parsed = extractProjectMarkdownContract(`
npm **install** package

npm <em>install</em>

pip&nbsp;install package
`, markdown)

    expect(parsed.text).toContain('npm install package npm install pip install package')
  })

  it('collects real Markdown and inline HTML links and images in source order', () => {
    const parsed = extractProjectMarkdownContract(`
[first](/chapters/01-ai-native#iq-01-a)
<a href="/chapters/01-ai-native#iq-01-a">duplicate</a>
<a href="https://evil.example/chapters/01-ai-native#iq-01-a">evil</a>
![markdown remote](https://example.com/markdown.png)
<img src="https://example.com/html.png" alt="html remote">
`, markdown)

    expect(parsed.links).toEqual([
      '/chapters/01-ai-native#iq-01-a',
      '/chapters/01-ai-native#iq-01-a',
      'https://evil.example/chapters/01-ai-native#iq-01-a',
    ])
    expect(parsed.images).toEqual([
      'https://example.com/markdown.png',
      'https://example.com/html.png',
    ])
  })

  it('collects remote image candidates from Markdown, srcset, picture, and noscript', () => {
    const backslashUrl = String.raw`https:\\evil.example\a.png`
    const controlUrl = 'h\tt\ntps://evil.example/control.png'
    const parsed = extractProjectMarkdownContract(`
![protocol relative](//example.com/markdown.png)
<img src="//example.com/html.png">
<img src="/local.png" srcset="/local-2x.png 2x, https://example.com/srcset.png 3x">
<picture><source srcset="data:image/png;base64,AAAA 1x, //example.com/picture.png 2x"><img src="/local-picture.png"></picture>
<picture><source src="https://example.com/source-src.png"><img src="/local-source-fallback.png"></picture>
<noscript><img src="https://example.com/noscript.png"></noscript>
<svg><image href="//example.com/svg-href.png"></image></svg>
<svg><image xlink:href="https://example.com/svg-xlink.png"></image></svg>
<img srcset="data:image/png;base64,AAAA, https://evil.example/data-comma.png 2x">
<img src="${backslashUrl}">
<img src="${controlUrl}">
<img src="http://[">
`, markdown)

    expect(parsed.images.filter(isRemoteImageCandidate)).toEqual([
      '//example.com/markdown.png',
      '//example.com/html.png',
      'https://example.com/srcset.png',
      '//example.com/picture.png',
      'https://example.com/source-src.png',
      'https://example.com/noscript.png',
      '//example.com/svg-href.png',
      'https://example.com/svg-xlink.png',
      'https://evil.example/data-comma.png',
      backslashUrl,
      controlUrl,
      'http://[',
    ])
    expect(parsed.images).toEqual(expect.arrayContaining([
      '/local.png',
      '/local-2x.png',
      'data:image/png;base64,AAAA',
      '/local-picture.png',
      '/local-source-fallback.png',
      'data:image/png;base64,AAAA',
    ]))
  })

  it('classifies image candidates with WHATWG URL semantics and fails closed', () => {
    const backslashUrl = String.raw`https:\\evil.example\a.png`
    const controlUrl = 'h\tt\ntps://evil.example/a.png'
    for (const candidate of [
      'https://evil.example/a.png',
      'http://evil.example/a.png',
      '//evil.example/a.png',
      backslashUrl,
      controlUrl,
      'http://[',
    ]) {
      expect(isRemoteImageCandidate(candidate), candidate).toBe(true)
    }
    for (const candidate of [
      '/images/local.png',
      './images/local.png',
      'images/local.png',
      'data:image/png;base64,AAAA',
      'blob:https://example.com/id',
    ]) {
      expect(isRemoteImageCandidate(candidate), candidate).toBe(false)
    }
  })

  it('keeps project pages free of remote images for project asset provenance', () => {
    for (const path of projectRouteRecords.map(([, route]) =>
      `docs${route.endsWith('/') ? `${route}index` : route}.md`)) {
      const contract = extractProjectMarkdownContract(readFileSync(path, 'utf8'), markdown)
      expect(contract.images.filter(isRemoteImageCandidate), path).toEqual([])
    }
  })

  it('adds exactly eight project routes without changing the existing 31', () => {
    const actual = projectRouteRecords.map(([id]) => getContentItem(id))
    expect(actual.map(({ id, route, title, kind }) => [id, route, title, kind])).toEqual(
      projectRouteRecords,
    )
    expect(contentItems).toHaveLength(39)
    expect(projectCatalog.pages.map((page) => page.page_item_id))
      .toEqual(projectRouteRecords.map(([id]) => id))
    for (const page of projectCatalog.pages) {
      expect(getContentItem(page.page_item_id).kind).toBe('project')
    }
  })

  it('cross-validates real page and interview IDs instead of a second runtime allowlist', () => {
    expect(validateProjectCatalogIntegration(projectCatalog, {
      contentItems,
      interviewQuestions,
    })).toEqual([])
  })

  it('publishes the overview and keeps watch-only items external-only', () => {
    const page = readFileSync('docs/projects/index.md', 'utf8')
    expect(page).toContain('<ProjectOverview />')
    expect(page).toContain('不是安装清单')
    const component = readFileSync('docs/.vitepress/theme/components/ProjectOverview.vue', 'utf8')
    expect(component).toContain("catalog_tier === 'watch-only'")
    expect(component).not.toContain('getContentItem(subject.id)')
    expect(component).toContain('courseItemById')
    expect(component).toContain('courseItemFor(page.page_item_id)?.outcome')
    expect(component).toContain('先修：')
  })

  it('publishes the complete historical page with distinct factual boundaries', () => {
    expectCoreProjectPage(
      'docs/projects/history-autogpt-flowise.md',
      'project-history-autogpt-flowise',
    )
    const page = readFileSync('docs/projects/history-autogpt-flowise.md', 'utf8')
    expect(page).toContain('AutoGPT 上游仍活跃')
    expect(page).toContain('Flowise 已归档并于 2026-08-31 EOL')
    expect(page).toContain('PolyForm Shield')
    expect(page).toContain('商业许可')
    for (const id of ['IQ-02-B', 'IQ-07-C', 'IQ-10-A']) expect(page).toContain(id)
    expect(page).not.toMatch(/推荐安装|生产级首选/u)
  })

  it('reports stable validation errors for malformed TypeScript integration sources', () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), 'project-integration-'))
    const dataRoot = join(fixtureRoot, 'docs/.vitepress/theme/data')
    mkdirSync(dataRoot, { recursive: true })
    const contentPath = join(dataRoot, 'contentRegistry.ts')
    const interviewPath = join(dataRoot, 'interviewQuestions.ts')
    writeFileSync(interviewPath, "export const interviewQuestions = [question('iq-02-b')]\n")

    try {
      writeFileSync(contentPath, 'export const contentItems = [\n')
      expect(validateBook(fixtureRoot, { projectCatalogPath: resolve('sources/project-index.yml') }))
        .toContain('contentItems TypeScript has parse diagnostics')

      writeFileSync(contentPath, 'export const otherItems = []\n')
      expect(validateBook(fixtureRoot, { projectCatalogPath: resolve('sources/project-index.yml') }))
        .toContain('contentItems TypeScript is missing exported array contentItems')

      writeFileSync(contentPath, "const dynamicId = 'projects-index'\nexport const contentItems = [{ id: dynamicId }]\n")
      expect(validateBook(fixtureRoot, { projectCatalogPath: resolve('sources/project-index.yml') }))
        .toContain('contentItems entry 0 requires a string-literal id')
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true })
    }
  })

  it('rejects interview IDs produced by any factory other than local question', () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), 'project-integration-factory-'))
    const dataRoot = join(fixtureRoot, 'docs/.vitepress/theme/data')
    mkdirSync(dataRoot, { recursive: true })
    writeFileSync(
      join(dataRoot, 'contentRegistry.ts'),
      "export const contentItems = [{ id: 'projects-index' }]\n",
    )
    writeFileSync(
      join(dataRoot, 'interviewQuestions.ts'),
      "export const interviewQuestions = [otherFactory('iq-04-a')]\n",
    )

    try {
      expect(validateBook(fixtureRoot, { projectCatalogPath: resolve('sources/project-index.yml') }))
        .toContain('interviewQuestions entry 0 must call local question with a string-literal id')
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true })
    }
  })
})

describe('project documentation handoff', () => {
  it('documents the project catalog without claiming labs exist', () => {
    const readme = readFileSync('README.md', 'utf8')
    expect(readme).toContain('/projects/')
    expect(readme).toContain('六个核心源码拆解')
    expect(readme).toContain('固定 commit')
    expect(readme).toContain('Python Lab Kit 属于下一阶段')
    expect(readme).toContain('仓库不会发布 `/labs/`')
    expect(readme).not.toMatch(/\]\([^)]*\/labs\//u)
  })
})

describe('project presentation primitives', () => {
  it('loads the validated project catalog and fails closed on inherited IDs', () => {
    expect(getProjectPage('project-aider').subjects).toEqual(['aider'])
    expect(getProjectSubject('aider').pinned_ref).toBe('v0.86.0')
    expect(getProjectSubject('hermes-agent').risk_tags).toEqual(['长期自主', '长期记忆', '外部系统'])
    expect(getProjectSubject('openclaw').risk_tags).toEqual(['长期自主', 'IM', '桌面控制', '外部系统'])
    expect(getProjectChain('aider-repo-to-verified-edit').steps).toHaveLength(21)

    for (const id of ['missing', 'toString', 'constructor', '__proto__']) {
      expect(() => getProjectPage(id)).toThrow(`Unknown project page: ${id}`)
      expect(() => getProjectSubject(id)).toThrow(`Unknown project subject: ${id}`)
      expect(() => getProjectChain(id)).toThrow(`Unknown project chain: ${id}`)
    }
  })

  it('generates immutable source links from the pinned commit', () => {
    expect(projectSourceUrl('aider', 'aider/main.py')).toBe(
      'https://github.com/Aider-AI/aider/blob/a4be6ccd87ebaa59b361f3f028d116ce1761b626/aider/main.py',
    )
    expect(projectSourceUrl('aider', 'LICENSE.txt')).toContain(
      '/blob/a4be6ccd87ebaa59b361f3f028d116ce1761b626/LICENSE.txt',
    )
    expect(() => projectSourceUrl('aider', 'README.md')).toThrow(
      'Undeclared project source: aider/README.md',
    )
  })

  it('URL-encodes each declared source path segment without encoding separators', () => {
    const specialCatalog = structuredClone(projectCatalog)
    const aider = specialCatalog.subjects.find((subject) => subject.id === 'aider')!
    aider.entrypoints.push({
      path: 'docs/path with space/#guide?100%.md',
      symbols: ['render special path'],
      responsibility: 'Exercise reserved URL characters in a declared source path.',
    })
    const specialLookup = createProjectCatalogLookup(specialCatalog)

    expect(specialLookup.projectSourceUrl('aider', 'docs/path with space/#guide?100%.md')).toBe(
      'https://github.com/Aider-AI/aider/blob/a4be6ccd87ebaa59b361f3f028d116ce1761b626/docs/path%20with%20space/%23guide%3F100%25.md',
    )
  })

  it('loads the catalog relative to the loader module instead of the process working directory', () => {
    const loader = readFileSync('docs/.vitepress/theme/data/projectCatalog.data.ts', 'utf8')
    expect(loader).not.toContain('process.cwd()')
    expect(loader).not.toContain('watchedFiles[0]')
    expect(loader).toContain('import.meta.url')
    expect(loader).toContain("new URL('../../../../sources/project-index.yml', import.meta.url)")
  })

  it('registers four SSR-safe components with native list and disclosure semantics', () => {
    const loader = readFileSync('docs/.vitepress/theme/data/projectCatalog.data.ts', 'utf8')
    expect(loader).toContain("import { defineLoader } from 'vitepress'")
    expect(loader).not.toContain('type { Loader }')

    const core = readFileSync('docs/.vitepress/theme/data/projectCatalogCore.ts', 'utf8')
    expect(core).not.toContain('projectCatalog.data')

    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    for (const name of ['ProjectOverview', 'ProjectMeta', 'ProjectCallChain', 'ProjectSourceLinks']) {
      expect(theme).toContain(`'${name}'`)
    }

    const chain = readFileSync('docs/.vitepress/theme/components/ProjectCallChain.vue', 'utf8')
    expect(chain).toContain('<figure')
    expect(chain).toContain('class="project-architecture"')
    expect(chain).toContain('本书归纳 · 原创建筑关系图')
    expect(chain).toContain('<ol')
    expect(chain).toContain('role="list"')
    expect(chain).toContain('role="listitem"')
    expect(chain).toContain('源码事实：')
    expect(chain).toContain('本书归纳：')
    expect(chain).toContain('不要误解')

    const meta = readFileSync('docs/.vitepress/theme/components/ProjectMeta.vue', 'utf8')
    expect(meta).toContain('仓库状态')
    expect(meta).toContain('教学层级')
    expect(meta).toContain('<details')
    expect(meta).toContain('project-license-print')
    expect(meta).not.toContain('pinned_commit.slice')
    expect(meta).toContain('scope.basis')
    expect(meta).toContain('scope.path_or_glob ?? scope.selector')
    expect(meta).toContain('projectSourceUrl(subject.id, source.path)')

    const sources = readFileSync('docs/.vitepress/theme/components/ProjectSourceLinks.vue', 'utf8')
    for (const field of ['row.path', 'row.symbols', 'row.responsibility']) {
      expect(sources).toContain(field)
    }
    expect(sources).not.toContain('row.symbol }}')

    const overview = readFileSync('docs/.vitepress/theme/components/ProjectOverview.vue', 'utf8')
    expect(overview).toContain('subject.risk_tags')
    for (const id of ['frontier-agent-security-evaluation', 'chapter-09-safety-recovery', 'radar']) {
      expect(overview).toContain(id)
    }
  })

  it('uses only local theme tokens and includes mobile, focus, dark, and print rules', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    expect(style).toContain('.project-meta')
    expect(style).toContain('.project-call-chain')
    expect(style).toContain('.project-overview')
    expect(style).toContain('@media (max-width: 700px)')
    expect(style).toContain('@media print')
    expect(style).toContain(':focus-visible')
    expect(style).not.toMatch(/project-[^{]+\{[^}]*#[0-9a-f]{6}/isu)
  })

  it('constrains source-link rows to the mobile content width', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    expect(style).toMatch(
      /\.project-source-links\s*>\s*li\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/su,
    )
  })

  it('constrains call-chain rows to the mobile content width', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    expect(style).toMatch(
      /\.project-call-chain\s+li\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/su,
    )
  })

  it('enforces the scoped Vue and TypeScript check during production builds', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    const tsconfig = JSON.parse(readFileSync('tsconfig.projects.json', 'utf8'))
    expect(pkg.scripts['typecheck:projects']).toBe('vue-tsc --noEmit -p tsconfig.projects.json')
    expect(pkg.scripts.build).toContain('pnpm typecheck:projects')
    expect(pkg.devDependencies['vue-tsc']).toBe('^3.3.11')
    expect(pkg.devDependencies.typescript).toBe('^5.9.3')
    expect(pkg.devDependencies['@types/node']).toBe('^24.10.0')
    expect(tsconfig.compilerOptions.types).toEqual(['vitepress/client', 'node'])
  })
})

describe('MCP and Aider dissections', () => {
  it('publishes both complete reading-only pages', () => {
    expectCoreProjectPage('docs/projects/mcp-python-sdk.md', 'project-mcp-python-sdk')
    expectCoreProjectPage('docs/projects/aider.md', 'project-aider')
  })

  it('keeps protocol, implementation, patch, and completion claims separate', () => {
    const mcp = readFileSync('docs/projects/mcp-python-sdk.md', 'utf8')
    expect(mcp).toContain('规范仓库定义协议，Python SDK 实现协议')
    expect(mcp).toContain('业务授权')
    expect(mcp).toContain('basic_tool.py 只注册工具')
    expect(mcp).toContain('宿主调用 `mcp.run`')
    expect(mcp).toContain('Runner 负责')
    expect(mcp).toContain('ServerSession 只是 request-scoped outbound proxy')
    expect(mcp).toContain('ToolManager 只负责查找')
    expect(mcp).toContain('Tool.run 才负责输入验证、调用函数和结果转换')
    expect(mcp).toContain('JSONRPCDispatcher._dispatch_request 调用 `ServerRunner._on_request`')
    expect(mcp).toContain('ServerRunner._serialize 只负责规范化 result dict')
    expect(mcp).toContain('JSONRPCDispatcher._write_result 构造并写回 `JSONRPCResponse`')
    expect(mcp).toContain('connection、dispatcher 和 request-context')
    const aider = readFileSync('docs/projects/aider.md', 'utf8')
    expect(aider).toContain('RepoMap 不是“读完全部仓库”')
    expect(aider).toContain('生成补丁不等于任务完成')
    expect(aider).toContain('lint 默认开启，而且只检查已编辑文件')
    expect(aider).toContain('test 默认关闭')
    expect(aider).toContain('shell 命令必须显式回答 yes')
    expect(aider).toContain('yes-always 也不会放行 shell')
    expect(aider).toContain('InputOutput.confirm_ask')
    expect(aider).toContain('explicit_yes_required=True')
    expect(aider).toContain('Coder.handle_shell_commands')
    expect(aider).toContain('lint 修复后可能产生第二次提交')
    expect(aider).toContain('shell 或 test 之后没有第三次自动提交')
    expect(aider).toContain('commit message 会调用 weak/main model')
    expect(aider).toContain('parser 只产出 tuples')
    expect(aider).toContain('写盘发生在 `apply_edits` 和 `InputOutput.write_text`')
    expect(aider).toContain('lint/test failure 只有在用户确认 Attempt to fix 后才设置 reflected_message')
    expect(aider).toContain('shell output 只有再次确认后才加入 cur_messages')
    expect(aider).toContain('不自动触发当前 run_one 的 reflection')
  })
})

describe('OpenHands and benchmark dissections', () => {
  it('publishes both complete reading-only pages', () => {
    expectCoreProjectPage('docs/projects/openhands.md', 'project-openhands')
    expectCoreProjectPage('docs/projects/agent-benchmarks.md', 'project-agent-benchmarks')
  })

  it('uses the current OpenHands multi-repository boundary', () => {
    const text = readFileSync('docs/projects/openhands.md', 'utf8')
    expect(text).toContain('Agent Canvas')
    expect(text).toContain('software-agent-sdk')
    expect(text).toContain('不是旧版单体 Python Agent 仓库')
    expect(text).toContain('已有会话的 message/action/event 链')
    expect(text).toContain('Canvas Message')
    expect(text).toContain('SDK `MessageEvent`')
    expect(text).toContain('Agent Server 直接调用 `LocalConversation`')
    expect(text).toContain('Workspace 是工具构造与执行所消费的环境边界和配置来源')
    expect(text).not.toContain('Workspace 只是工具的 owner')
    expect(text).toContain('streaming delta 不属于持久事件回流链')
    expect(text).toContain('不追踪 conversation 创建链')
    expect(text).toContain('持久化 append 先发生')
    expect(text).toContain('`LocalConversation.__init__`')
    expect(text).toContain('`AsyncCallbackWrapper.__call__`')
    expect(text).toContain('`EventService.start`')
    expect(text).toContain('`AsyncCallbackWrapper(self._pub_sub, ...)`')
    expect(text).toContain('`EventService.subscribe_to_events`')
    expect(text).toContain('`_WebSocketSubscriber.__call__`')
    expect(text).toContain('subscriber 调用 `_send_event`')
    expect(text).toContain('三条 track 不是一条跨异步边界的同步调用栈')
    expect(text).not.toMatch(/conversation router|conversation service|adapter/iu)
  })

  it('does not present local fixtures or cross-benchmark scores as official results', () => {
    const text = readFileSync('docs/projects/agent-benchmarks.md', 'utf8')
    expect(text).toContain('不能直接横比')
    expect(text).toContain('不是官方 benchmark 成绩')
    expect(text).toContain('两条受控轨道并列')
    expect(text).toContain('不是先运行 SWE-bench 再运行 τ²-bench')
    expect(text).toContain('`tau2.run.run_task` 与 `tau2.run.run_tasks`')
    expect(text).toContain('旧 flat 参数 API 已 deprecated')
    expect(text).toContain('不是说整个 `tau2.run` module 都 deprecated')
    expect(text).toContain('`main` 注册局部 `run_command`')
    expect(text).toContain('把 `tau2 run` 分派到 `run_domain`')
    expect(text).not.toContain('CLI 的 `run`')
    expect(text).toContain('默认 `EvaluationType.ALL`')
    expect(text).toContain('`EvaluationType.ALL_WITH_NL_ASSERTIONS`')
    expect(text).toContain('只强制 NL assertions')
    expect(text).toContain('按 `task.evaluation_criteria.reward_basis` 选择分量后相乘')
    expect(text).toContain('ACTION 只有被选中时才是硬门禁')
    expect(text).toContain('单项类型与 `*_IGNORE_BASIS` 各走自己的分支')
    expect(text).toContain('early termination 返回 `0.0`')
    expect(text).toContain('没有 criteria 时返回 `1.0`')
    expect(text).not.toMatch(/本书.*SWE-bench.*(?:得分|准确率|通过率)\s*\d/iu)
  })
})

describe('Dify and CrewAI dissections', () => {
  it('publishes both complete reading-only pages', () => {
    expectCoreProjectPage('docs/projects/dify.md', 'project-dify')
    expectCoreProjectPage('docs/projects/crewai.md', 'project-crewai')
  })

  it('states Dify and CrewAI boundaries without marketing claims', () => {
    const dify = readFileSync('docs/projects/dify.md', 'utf8')
    expect(dify).toContain('编号主链只选择 blocking')
    expect(dify).toContain('streaming 是独立旁路')
    expect(dify).toContain('WorkflowRunApi.post')
    expect(dify).toContain('AppGenerateService.generate')
    expect(dify).toContain('AppGenerateService._run_with_guardrails')
    expect(dify).toContain('AppMode.WORKFLOW')
    expect(dify).toContain('WorkflowAppGenerator._generate_worker')
    expect(dify).toContain('注入 execution repositories')
    expect(dify).toContain('WorkflowBasedAppRunner._init_graph')
    expect(dify).toContain('Graphon')
    expect(dify).toContain('Graph.init')
    expect(dify).toContain('DifyNodeFactory.create_node')
    expect(dify).toContain('agent_node_kind == dify_agent')
    expect(dify).toContain('WorkflowEntry 接收已经创建的 Graph')
    expect(dify).toContain('WorkflowEntry 不构图')
    expect(dify).toContain('WorkflowAppRunner.run 先用现成 Graph 构造 WorkflowEntry')
    expect(dify).toContain('WorkflowEntry.__init__ 创建 GraphEngine')
    expect(dify).toContain('自行挂 debug、execution-limit 和可选 observability layers')
    expect(dify).toContain('构造返回后，WorkflowAppRunner 才挂 WorkflowPersistenceLayer、workspace-retirement 和外部 custom layers')
    expect(dify).not.toContain('WorkflowAppRunner 创建 persistence、observability')
    expect(dify).not.toContain('Graph 和 layers 交给 WorkflowEntry')
    expect(dify).toContain('GraphEngine.run → worker → Node.run')
    expect(dify).toContain('create_run → stream_events')
    expect(dify).toContain('WorkflowAppRunner._handle_event')
    expect(dify).toContain('WorkflowAppQueueManager')
    expect(dify).toContain('WorkflowAppGenerateTaskPipeline')
    expect(dify).toContain('内部 typed response')
    expect(dify).toContain('最终 public payload')
    expect(dify).toContain('先订阅 topic，再投递 Celery `_AppRunner`')
    expect(dify).toContain('workflow_based_app_execution_task → _AppRunner.run')
    expect(dify).toContain('重载 app、user、workflow')
    expect(dify).toContain('`_publish_streaming_response` 是模块级函数')
    expect(dify).toContain('两类 Runner 不是同一个对象')
    expect(dify).toContain('修改版 Apache-2.0')
    expect(dify).toContain('持久化也不归 WorkflowEntry 单独负责')
    expect(dify).not.toContain('WorkflowEntry 创建 GraphEngine')
    expect(dify).not.toContain('AgentNode 直接输出 SSE')
    for (const id of ['IQ-02-B', 'IQ-06-A', 'IQ-10-A']) {
      expect(dify).toContain(id)
    }

    const crew = readFileSync('docs/projects/crewai.md', 'utf8')
    expect(crew).toContain('Process.sequential')
    expect(crew).toContain('Task.async_execution=false')
    expect(crew).toContain('Agent.planning=false')
    expect(crew).toContain('Crew.kickoff → begin_execution → prepare_kickoff → setup_agents → Agent.create_agent_executor')
    expect(crew).toContain('Process enum 只用于 kickoff 内的分支判断，不是执行节点')
    expect(crew).toContain('Crew._create_crew_output → end_execution')
    expect(crew).toContain('experimental.AgentExecutor.invoke')
    expect(crew).toContain('text ReAct 与 native tool 是二选一的条件分支')
    expect(crew).toContain('call_llm_and_parse → execute_tool_action → ToolUsage.use → ToolUsage._use → CrewStructuredTool.invoke')
    expect(crew).toContain('call_llm_native_tools → execute_native_tool → _execute_single_native_tool_call → _available_functions[...]')
    expect(crew).toContain('StepExecutor 只在 planning_enabled')
    expect(crew).toContain('todos 已生成后懒创建')
    expect(crew).toContain('CrewAgentExecutor 已 deprecated')
    expect(crew).toContain('Task._execute_core 构造并持有 TaskOutput')
    expect(crew).toContain('`_export_output` 只负责结构化输出转换')
    expect(crew).toContain('Crew._create_crew_output 构造 CrewOutput')
    expect(crew).toContain('角色名称不会自动形成权限隔离')
    expect(crew).toContain('消融实验显示增益')
    expect(crew).not.toContain('CrewAgentExecutor/StepExecutor 驱动工具循环')
    for (const id of ['IQ-07-A', 'IQ-07-B', 'IQ-07-C']) {
      expect(crew).toContain(id)
    }

    expect(`${dify}\n${crew}`).not.toMatch(/最佳框架|生产级首选|Star 数/u)
    expect(`${dify}\n${crew}`).not.toMatch(/^## Lab$/gmu)
  })
})
