import { describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildFreshnessReport, checkSource, runSourceCheck } from '../scripts/check-sources.mjs'
import { validateSourceRegistry } from '../scripts/validate-content.mjs'

const baseSource = {
  id: 'official-spec',
  title: 'Official specification',
  publisher: 'Example',
  url: 'https://example.com/spec/v1',
  grade: 'A',
  version: 'v1',
  last_verified: '2026-09-20',
  review_by: '2026-10-20',
  status: 'active',
  replaced_by: null,
  impact_chapters: ['04'],
  note: 'Fixture source',
}

describe('source freshness checker', () => {
  it('marks a reachable source healthy', async () => {
    const fetchImpl = async () => ({ status: 200, url: baseSource.url, text: async () => 'spec v1' })
    const result = await checkSource(baseSource, { fetchImpl, now: new Date('2026-09-25') })
    expect(result.findings).toEqual([])
    expect(result.http_status).toBe(200)
  })

  it('reports redirects and broken links without response bodies', async () => {
    const redirected = await checkSource(baseSource, {
      fetchImpl: async () => ({ status: 200, url: 'https://example.com/spec/v2', text: async () => 'secret body' }),
      now: new Date('2026-09-25'),
    })
    expect(redirected.findings).toContain('redirected')
    expect(JSON.stringify(redirected)).not.toContain('secret body')

    const broken = await checkSource(baseSource, {
      fetchImpl: async () => ({ status: 404, url: baseSource.url, text: async () => 'not found body' }),
      now: new Date('2026-09-25'),
    })
    expect(broken.findings).toContain('broken_link')
    expect(JSON.stringify(broken)).not.toContain('not found body')
  })

  it('reports review dates and watched versions', async () => {
    const result = await checkSource(
      { ...baseSource, review_by: '2026-09-24', watch_url: 'https://example.com/spec/' },
      {
        fetchImpl: async (url: string) => ({
          status: 200,
          url,
          text: async () => (url.endsWith('/spec/') ? 'Latest specification v2' : 'spec v1'),
        }),
        now: new Date('2026-09-25'),
      },
    )
    expect(result.findings).toEqual(expect.arrayContaining(['review_due', 'version_watch']))
  })

  it('detects a newer current version even when the old version remains on the page', async () => {
    const result = await checkSource(
      { ...baseSource, watch_url: 'https://example.com/spec/' },
      {
        fetchImpl: async (url: string) => ({
          status: 200,
          url,
          text: async () => (url.endsWith('/spec/') ? 'Current v2; previous v1' : 'spec v1'),
        }),
        now: new Date('2026-09-25'),
      },
    )
    expect(result.findings).toContain('version_watch')
  })

  it('retries transient watch failures and reports non-success statuses', async () => {
    let attempts = 0
    const recovered = await checkSource(
      { ...baseSource, watch_url: 'https://example.com/spec/' },
      {
        fetchImpl: async (url: string) => {
          if (!url.endsWith('/spec/')) return { status: 200, url, text: async () => 'spec v1' }
          attempts += 1
          return attempts < 3
            ? { status: 429, url, text: async () => '' }
            : { status: 200, url, text: async () => 'Current v1' }
        },
        now: new Date('2026-09-25'),
        retryAttempts: 3,
        retryDelayMs: 0,
      },
    )
    expect(attempts).toBe(3)
    expect(recovered.findings).not.toContain('watch_transient_error')

    const unavailable = await checkSource(
      { ...baseSource, watch_url: 'https://example.com/spec/' },
      {
        fetchImpl: async (url: string) => ({
          status: url.endsWith('/spec/') ? 500 : 200,
          url,
          text: async () => '',
        }),
        now: new Date('2026-09-25'),
        retryAttempts: 2,
        retryDelayMs: 0,
      },
    )
    expect(unavailable.findings).toContain('watch_transient_error')

    const missing = await checkSource(
      { ...baseSource, watch_url: 'https://example.com/spec/' },
      {
        fetchImpl: async (url: string) => ({
          status: url.endsWith('/spec/') ? 404 : 200,
          url,
          text: async () => '',
        }),
        now: new Date('2026-09-25'),
      },
    )
    expect(missing.findings).toContain('watch_http_error')
  })

  it('detects archived GitHub repositories', async () => {
    const source = { ...baseSource, url: 'https://github.com/example/agent' }
    const result = await checkSource(source, {
      fetchImpl: async (url: string) => ({
        status: 200,
        url,
        json: async () => ({ archived: true, pushed_at: '2026-01-01T00:00:00Z' }),
        text: async () => '',
      }),
      now: new Date('2026-09-25'),
    })
    expect(result.findings).toContain('repository_archived')
  })

  it('reports GitHub updates, releases and API failures', async () => {
    const source = {
      ...baseSource,
      url: 'https://github.com/example/agent',
      version: 'v1.0.0',
      last_verified: '2026-09-20',
    }
    const updated = await checkSource(source, {
      fetchImpl: async (url: string) => {
        if (url.endsWith('/releases/latest')) {
          return {
            status: 200,
            url,
            json: async () => ({ tag_name: 'v1.1.0', published_at: '2026-09-22T00:00:00Z' }),
          }
        }
        if (url.startsWith('https://api.github.com/')) {
          return {
            status: 200,
            url,
            json: async () => ({ archived: false, pushed_at: '2026-09-21T00:00:00Z' }),
          }
        }
        return { status: 200, url, text: async () => '' }
      },
      now: new Date('2026-09-25'),
    })
    expect(updated.findings).toEqual(expect.arrayContaining(['repository_updated', 'release_watch']))
    expect(updated.repository.latest_release).toBe('v1.1.0')

    const denied = await checkSource(source, {
      fetchImpl: async (url: string) => url.startsWith('https://api.github.com/')
        ? { status: 403, url, text: async () => '' }
        : { status: 200, url, text: async () => '' },
      now: new Date('2026-09-25'),
      retryAttempts: 1,
    })
    expect(denied.findings).toContain('repository_api_error')
  })

  it('builds a stable summary for issue automation', () => {
    const report = buildFreshnessReport([
      { id: 'ok', findings: [], http_status: 200 },
      { id: 'bad', findings: ['broken_link', 'review_due'], http_status: 404 },
    ], '2026-09-25T00:00:00.000Z')
    expect(report.summary).toEqual({ total: 2, healthy: 1, needs_review: 1 })
    expect(report.needs_review).toBe(true)
  })

  it('fails closed when the source registry schema is missing or truncated', async () => {
    const fixtureDir = mkdtempSync(join(tmpdir(), 'source-freshness-schema-'))
    const sourcePath = join(fixtureDir, 'source-index.yml')
    const outputJson = join(fixtureDir, 'report.json')
    const outputMarkdown = join(fixtureDir, 'report.md')
    writeFileSync(sourcePath, 'schema_version: 2\nsources: []\n', 'utf8')
    let fetchCalls = 0

    try {
      const report = await runSourceCheck({
        sourcePath,
        outputJson,
        outputMarkdown,
        fetchImpl: async () => {
          fetchCalls += 1
          throw new Error('should not fetch')
        },
        now: new Date('2026-09-25'),
      })
      expect(fetchCalls).toBe(0)
      expect(report.needs_review).toBe(true)
      expect(report.summary).toEqual({ total: 0, healthy: 0, needs_review: 1 })
      expect(report.schema_errors.length).toBeGreaterThan(0)
      expect(readFileSync(outputMarkdown, 'utf8')).toContain('schema_invalid')
      expect(readFileSync(outputMarkdown, 'utf8')).toContain('来源索引至少需要 15 条记录')
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true })
    }
  })

  it('rejects impossible dates and replaced_by references that do not exist', () => {
    const fixtureDir = mkdtempSync(join(tmpdir(), 'source-freshness-relations-'))
    const sourcePath = join(fixtureDir, 'source-index.yml')
    writeFileSync(sourcePath, `
schema_version: 2
source_defaults:
  version: rolling
  last_verified: '2026-02-30'
  review_by: '2026-01-01'
  status: deprecated
  replaced_by: missing-source
sources:
  - id: only-source
    title: Example
    publisher: Example
    url: https://example.com
    grade: A
    accessed: '2026-99-99'
    impact_chapters: ['01']
    note: Fixture
`, 'utf8')

    try {
      const errors = validateSourceRegistry(sourcePath)
      expect(errors).toEqual(expect.arrayContaining([
        expect.stringContaining('accessed 无效'),
        expect.stringContaining('last_verified 无效'),
        expect.stringContaining('review_by 不能早于 last_verified'),
        expect.stringContaining('replaced_by 引用不存在'),
      ]))
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true })
    }
  })
})

describe('source freshness automation', () => {
  it('runs weekly and can only report through GitHub Issues', () => {
    const workflowPath = '.github/workflows/source-freshness.yml'
    expect(existsSync(workflowPath)).toBe(true)
    const workflow = readFileSync(workflowPath, 'utf8')
    expect(workflow).toContain('cron:')
    expect(workflow).toContain('contents: read')
    expect(workflow).toContain('issues: write')
    expect(workflow).toContain('pnpm sources:check')
    expect(workflow).toContain('actions/github-script@v7')
    expect(workflow).toContain('persist-credentials: false')
    expect(workflow).toContain('upload-artifact@v4')
    expect(workflow).toContain('download-artifact@v4')
    expect(workflow).toContain('concurrency:')
    expect(workflow).toContain('github.event.repository.default_branch')
    expect(workflow).not.toContain('contents: write')
    expect(workflow).not.toContain('git push')
  })

  it('exposes the local source-check command', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(packageJson.scripts['sources:check']).toBe('node scripts/check-sources.mjs')
  })
})
