import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let outputRoot = ''
const projectHtmlFiles = [
  'projects/index.html',
  'projects/mcp-python-sdk.html',
  'projects/aider.html',
  'projects/openhands.html',
  'projects/agent-benchmarks.html',
  'projects/dify.html',
  'projects/crewai.html',
  'projects/history-autogpt-flowise.html',
]

beforeAll(() => {
  outputRoot = mkdtempSync(join(tmpdir(), 'project-ssr-'))
  execFileSync('pnpm', ['exec', 'vitepress', 'build', 'docs', '--outDir', outputRoot], {
    cwd: process.cwd(), stdio: 'pipe', encoding: 'utf8',
  })
}, 120_000)

afterAll(() => rmSync(outputRoot, { recursive: true, force: true }))

describe('actual project SSR', () => {
  it('renders all eight approved routes', () => {
    expect(projectHtmlFiles.filter((file) => !existsSync(join(outputRoot, file)))).toEqual([])
  })

  it('renders the overview component with internal pages and external-only watch subjects', () => {
    const html = readFileSync(join(outputRoot, 'projects/index.html'), 'utf8')
    expect(html).toContain('project-overview')
    expect(html).toContain('/projects/mcp-python-sdk')
    expect(html).toContain('github.com/NousResearch/hermes-agent')
    expect(html).toContain('github.com/openclaw/openclaw')
    expect(html).not.toContain('/projects/hermes-agent')
    expect(html).not.toContain('/projects/openclaw')
  })

  it('renders metadata, architecture, textual chains, and fixed sources into every dissection page', () => {
    for (const file of projectHtmlFiles.slice(1)) {
      const html = readFileSync(join(outputRoot, file), 'utf8')
      for (const marker of [
        'project-meta', 'project-architecture', 'project-call-chain', 'project-source-links',
        '源码事实', '本书归纳', '仓库状态', '教学层级', '许可证边界', '失败边界',
      ]) expect(html, `${file}: ${marker}`).toContain(marker)
      expect(html, file).toMatch(/\b[0-9a-f]{40}\b/u)
      expect(html, file).toMatch(/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\//u)
      expect(html, file).toMatch(/role="img"[^>]+aria-label="本书原创架构关系图/u)
      expect(html, file).toMatch(/<ol[^>]+role="list"[^>]+aria-label="[^"]*源码调用链文本版"/u)
    }
    const openhands = readFileSync(join(outputRoot, 'projects/openhands.html'), 'utf8')
    expect(openhands).toContain('7dc6805406ea3c76cb4a3ce407c3c72d481b0ac6')
    expect(openhands).toContain('fcc102a697874d54a357e36004e02c95040dbdc0')
  })
})
