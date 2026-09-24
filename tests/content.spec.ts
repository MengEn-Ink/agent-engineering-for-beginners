import { describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'yaml'

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
