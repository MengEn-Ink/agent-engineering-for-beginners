import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createProjectCatalogLookup } from '../docs/.vitepress/theme/data/projectCatalogCore'
import type { ProjectCatalog } from '../docs/.vitepress/theme/data/projectCatalogTypes'
import { loadProjectCatalog } from '../scripts/project-catalog.mjs'

const projectCatalog = loadProjectCatalog(resolve('sources/project-index.yml')) as ProjectCatalog
const {
  getProjectChain,
  getProjectPage,
  getProjectSubject,
  projectSourceUrl,
} = createProjectCatalogLookup(projectCatalog)

describe('project presentation primitives', () => {
  it('loads the validated project catalog and fails closed on inherited IDs', () => {
    expect(getProjectPage('project-aider').subjects).toEqual(['aider'])
    expect(getProjectSubject('aider').pinned_ref).toBe('v0.86.0')
    expect(getProjectSubject('hermes-agent').risk_tags).toEqual(['长期自主', '长期记忆', '外部系统'])
    expect(getProjectSubject('openclaw').risk_tags).toEqual(['长期自主', 'IM', '桌面控制', '外部系统'])
    expect(getProjectChain('aider-repo-to-verified-edit').steps).toHaveLength(6)

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
