import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { buildFreshnessReport, checkSource } from '../scripts/check-sources.mjs'

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

  it('builds a stable summary for issue automation', () => {
    const report = buildFreshnessReport([
      { id: 'ok', findings: [], http_status: 200 },
      { id: 'bad', findings: ['broken_link', 'review_due'], http_status: 404 },
    ], '2026-09-25T00:00:00.000Z')
    expect(report.summary).toEqual({ total: 2, healthy: 1, needs_review: 1 })
    expect(report.needs_review).toBe(true)
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
    expect(workflow).not.toContain('contents: write')
    expect(workflow).not.toContain('git push')
  })

  it('exposes the local source-check command', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(packageJson.scripts['sources:check']).toBe('node scripts/check-sources.mjs')
  })
})
