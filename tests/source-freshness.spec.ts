import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parse, stringify } from 'yaml'
import {
  buildProjectFreshnessReport,
  checkProjectSubject,
  isProjectReportBlocking,
  requestProjectJson,
  runProjectCheck,
} from '../scripts/check-projects.mjs'
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

  it('keeps exhausted transient source failures separate from permanent broken links', async () => {
    const result = await checkSource(baseSource, {
      fetchImpl: async () => ({ status: 503, url: baseSource.url, text: async () => '' }),
      now: new Date('2026-09-25'),
      retryAttempts: 2,
      retryDelayMs: 0,
    })
    expect(result.findings).toContain('source_transient_error')
    expect(result.findings).not.toContain('broken_link')
  })

  it('treats exhausted DNS, connection and timeout failures as non-permanent network errors', async () => {
    let attempts = 0
    const result = await checkSource(baseSource, {
      fetchImpl: async () => {
        attempts += 1
        throw new Error('ECONNRESET')
      },
      now: new Date('2026-09-25'),
      retryAttempts: 2,
      retryDelayMs: 0,
    })
    expect(attempts).toBe(2)
    expect(result.findings).toContain('source_network_error')
    expect(result.findings).not.toEqual(expect.arrayContaining(['unreachable', 'broken_link']))
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

  it('uses the same Shanghai calendar boundary as the reader freshness label', async () => {
    const result = await checkSource(
      { ...baseSource, review_by: '2026-09-24' },
      {
        fetchImpl: async () => ({ status: 200, url: baseSource.url }),
        now: new Date('2026-09-24T16:30:00Z'),
      },
    )
    expect(result.findings).toContain('review_due')
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

  it('does not compare a lifecycle status with a numeric version', async () => {
    const result = await checkSource(
      { ...baseSource, watch_url: 'https://example.com/spec/' },
      {
        fetchImpl: async (url: string) => ({
          status: 200,
          url,
          text: async () => (url.endsWith('/spec/')
            ? 'Current version: v1. Status: Stable'
            : 'spec v1'),
        }),
        now: new Date('2026-09-25'),
      },
    )
    expect(result.findings).not.toContain('version_watch')
  })

  it('does not compare calendar update dates with semantic versions', async () => {
    const semantic = await checkSource(
      { ...baseSource, watch_url: 'https://example.com/spec/' },
      {
        fetchImpl: async (url: string) => ({
          status: 200,
          url,
          text: async () => (url.endsWith('/spec/')
            ? 'Current version: v1. Latest update: 2026-09-25'
            : 'spec v1'),
        }),
        now: new Date('2026-09-25'),
      },
    )
    expect(semantic.findings).not.toContain('version_watch')

    const calendar = await checkSource(
      {
        ...baseSource,
        version: '2026-07-28',
        watch_url: 'https://example.com/spec/',
      },
      {
        fetchImpl: async (url: string) => ({
          status: 200,
          url,
          text: async () => (url.endsWith('/spec/')
            ? 'Current protocol version: 2026-07-28. Latest SDK: v2.4.0'
            : 'spec 2026-07-28'),
        }),
        now: new Date('2026-09-25'),
      },
    )
    expect(calendar.findings).not.toContain('version_watch')
  })

  it('ignores previous-version labels and accepts latest version without a colon', async () => {
    const result = await checkSource(
      { ...baseSource, watch_url: 'https://example.com/spec/' },
      {
        fetchImpl: async (url: string) => ({
          status: 200,
          url,
          text: async () => (url.endsWith('/spec/')
            ? 'Previous version: v1. Latest version v2'
            : 'spec v1'),
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

  it('retries response parsing and reports exhausted body or JSON failures', async () => {
    let watchParses = 0
    const recovered = await checkSource(
      { ...baseSource, watch_url: 'https://example.com/spec/' },
      {
        fetchImpl: async (url: string) => ({
          status: 200,
          url,
          text: async () => {
            if (!url.endsWith('/spec/')) return 'spec v1'
            watchParses += 1
            if (watchParses === 1) throw new Error('truncated body')
            return 'Current version: v1'
          },
        }),
        now: new Date('2026-09-25'),
        retryAttempts: 2,
        retryDelayMs: 0,
      },
    )
    expect(watchParses).toBe(2)
    expect(recovered.findings).not.toContain('watch_parse_error')

    const invalidJson = await checkSource(
      { ...baseSource, url: 'https://github.com/example/agent' },
      {
        fetchImpl: async (url: string) => {
          if (url.endsWith('/releases/latest')) return { status: 404, url }
          if (url.startsWith('https://api.github.com/')) {
            return { status: 200, url, json: async () => { throw new Error('invalid json') } }
          }
          return { status: 200, url }
        },
        now: new Date('2026-09-25'),
        retryAttempts: 2,
        retryDelayMs: 0,
      },
    )
    expect(invalidJson.findings).toContain('repository_metadata_parse_error')

    const invalidWatchBody = await checkSource(
      { ...baseSource, watch_url: 'https://example.com/spec/' },
      {
        fetchImpl: async (url: string) => ({
          status: 200,
          url,
          text: async () => {
            if (url.endsWith('/spec/')) throw new Error('truncated body')
            return 'spec v1'
          },
        }),
        now: new Date('2026-09-25'),
        retryAttempts: 2,
        retryDelayMs: 0,
      },
    )
    expect(invalidWatchBody.findings).toContain('watch_parse_error')
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

  it('sends a read token only to GitHub API requests', async () => {
    const seen = new Map<string, string | undefined>()
    await checkSource({ ...baseSource, url: 'https://github.com/example/agent' }, {
      githubToken: 'read-only-token',
      fetchImpl: async (url: string, init?: { headers?: Record<string, string> }) => {
        seen.set(url, init?.headers?.authorization)
        if (url.endsWith('/releases/latest')) return { status: 404, url }
        if (url.startsWith('https://api.github.com/')) {
          return {
            status: 200,
            url,
            json: async () => ({ archived: false, pushed_at: '2026-09-20T00:00:00Z' }),
          }
        }
        return { status: 200, url }
      },
      now: new Date('2026-09-25'),
    })
    expect(seen.get('https://github.com/example/agent')).toBeUndefined()
    expect(seen.get('https://api.github.com/repos/example/agent')).toBe('Bearer read-only-token')
    expect(seen.get('https://api.github.com/repos/example/agent/releases/latest')).toBe('Bearer read-only-token')
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

  it('rejects null required scalars and cycles across replacement chains', () => {
    const fixtureDir = mkdtempSync(join(tmpdir(), 'source-freshness-cycle-'))
    const sourcePath = join(fixtureDir, 'source-index.yml')
    const sources = Array.from({ length: 15 }, (_, index) => ({
      id: `source-${index + 1}`,
      title: `Source ${index + 1}`,
      publisher: 'Example',
      url: `https://example.com/${index + 1}`,
      grade: 'A',
      accessed: '2026-09-25',
      impact_chapters: ['01'],
      note: 'Fixture',
    }))
    sources[0].title = null as unknown as string
    ;(sources[0] as Record<string, unknown>).version = null
    ;(sources[0] as Record<string, unknown>).replaced_by = 'source-2'
    ;(sources[1] as Record<string, unknown>).replaced_by = 'source-1'
    writeFileSync(sourcePath, stringify({
      schema_version: 2,
      source_defaults: {
        version: 'rolling',
        last_verified: '2026-09-25',
        review_by: '2026-10-25',
        status: 'active',
        replaced_by: null,
      },
      sources,
    }), 'utf8')

    try {
      const errors = validateSourceRegistry(sourcePath)
      expect(errors).toEqual(expect.arrayContaining([
        expect.stringContaining('title'),
        expect.stringContaining('version'),
        expect.stringContaining('replaced_by 形成循环'),
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
    expect(workflow).toContain('GITHUB_TOKEN: ${{ github.token }}')
    expect(workflow).not.toContain('contents: write')
    expect(workflow).not.toContain('git push')
  })

  it('exposes the local source-check command', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(packageJson.scripts['sources:check']).toBe('node scripts/check-sources.mjs')
  })
})

const licenseText = 'MIT fixture license\n'
const licenseDigest = createHash('sha256').update(licenseText).digest('hex')

const projectSubject = {
  id: 'aider',
  canonical_repo: 'Aider-AI/aider',
  canonical_url: 'https://github.com/Aider-AI/aider',
  pin_kind: 'release',
  pinned_ref: 'v0.86.0',
  pinned_commit: 'a'.repeat(40),
  verified_default_branch: 'main',
  verified_default_head: 'a'.repeat(40),
  repository_status: 'active',
  archived: false,
  catalog_tier: 'core',
  watch_url: 'https://github.com/Aider-AI/aider/releases/latest',
  verified_at: '2026-09-26',
  review_by: '2026-10-26',
  license_sources: [{ path: 'LICENSE.txt', sha256: licenseDigest }],
  entrypoints: [{ path: 'aider/main.py', symbols: ['main'], responsibility: 'Validate repository arguments.' }],
}

function projectFetchWithHead(headData: unknown) {
  return async (url: string) => {
    if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
    if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => headData }
    if (url.includes('/contents/aider/main.py')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
    if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
    if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
    return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main' }) }
  }
}

function projectFetchWithMalformedEndpoint(
  malformedEndpoint: 'metadata' | 'ref' | 'entrypoint' | 'license' | 'release' | 'tags',
  subject = projectSubject,
) {
  return async (url: string) => {
    const api = `https://api.github.com/repos/${subject.canonical_repo}`
    if (url === api) {
      return { status: 200, url, json: async () => malformedEndpoint === 'metadata'
        ? ({})
        : ({ full_name: subject.canonical_repo, archived: subject.archived, default_branch: subject.verified_default_branch }) }
    }
    if (url.endsWith(`/commits/${subject.verified_default_branch}`)) {
      return { status: 200, url, json: async () => ({ sha: subject.verified_default_head, commit: { committer: { date: '2026-09-26T00:00:00Z' } } }) }
    }
    if (url.endsWith(`/commits/${subject.pinned_ref}`)) {
      return { status: 200, url, json: async () => malformedEndpoint === 'ref' ? ({}) : ({ sha: subject.pinned_commit }) }
    }
    if (url.includes('/contents/aider/main.py')) {
      return { status: 200, url, json: async () => malformedEndpoint === 'entrypoint' ? ({}) : ({ path: 'aider/main.py' }) }
    }
    if (url.includes('/contents/LICENSE.txt')) {
      return { status: 200, url, json: async () => malformedEndpoint === 'license'
        ? ({})
        : ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
    }
    if (url.endsWith('/releases/latest')) {
      return { status: 200, url, json: async () => malformedEndpoint === 'release' ? ({}) : ({ tag_name: subject.pinned_ref }) }
    }
    if (url.endsWith('/tags?per_page=1')) {
      return { status: 200, url, json: async () => malformedEndpoint === 'tags' ? ({}) : ([{ name: subject.pinned_ref }]) }
    }
    return { status: 404, url, json: async () => ({}) }
  }
}

describe('project freshness checker', () => {
  it('accepts matching canonical metadata, ref, commit, and entrypoints', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40), commit: { committer: { date: '2026-09-26T00:00:00Z' } } }) }
        if (url.includes('/contents/aider/main.py')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main' }) }
      },
    })
    expect(result.findings).toEqual([])
    expect(result.license_source_paths).toEqual(['LICENSE.txt'])
  })

  it('reports deterministic pin, path, canonical, archive, and release changes', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'b'.repeat(40) }) }
        if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => ({ sha: 'c'.repeat(40), commit: { committer: { date: '2026-09-27T00:00:00Z' } } }) }
        if (url.includes('/contents/')) return { status: 404, url, json: async () => ({}) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.87.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'NewOwner/aider', archived: true, default_branch: 'main' }) }
      },
    })
    expect(result.findings).toEqual(expect.arrayContaining([
      'canonical_repo_changed', 'repository_status_changed', 'pin_ref_mismatch',
      'entrypoint_missing', 'license_source_missing', 'project_update_available', 'project_review_required',
    ]))
  })

  it('uses the default-branch HEAD commit rather than repository pushed_at', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => ({ sha: 'c'.repeat(40), commit: { committer: { date: '2026-09-27T00:00:00Z' } } }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
        if (url.includes('/contents/')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main', pushed_at: '2020-01-01T00:00:00Z' }) }
      },
    })
    expect(result.findings).toEqual(['project_update_available'])
  })

  it('reports a changed default-branch HEAD even when its commit date is the verified date', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: projectFetchWithHead({
        sha: 'c'.repeat(40),
        commit: { committer: { date: '2026-09-26T00:00:00Z' } },
      }),
    })
    expect(result.findings).toEqual(['project_update_available'])
  })

  it('fails closed when the default-branch HEAD response is empty', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: projectFetchWithHead({}),
    })
    expect(result.findings).toEqual(expect.arrayContaining([
      'repository_head_invalid',
      'project_review_required',
    ]))
  })

  it('reports both an update and invalid HEAD when a changed SHA has no commit date', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: projectFetchWithHead({ sha: 'c'.repeat(40) }),
    })
    expect(result.findings).toEqual(expect.arrayContaining([
      'project_update_available',
      'repository_head_invalid',
      'project_review_required',
    ]))
  })

  it('requires review when repository metadata changes the default branch', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/trunk')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40), commit: { committer: { date: '2026-09-26T00:00:00Z' } } }) }
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.includes('/contents/aider/main.py')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'trunk' }) }
      },
    })
    expect(result.findings).toEqual(expect.arrayContaining([
      'default_branch_changed',
      'project_review_required',
    ]))
  })

  it('uses the shared Shanghai date boundary and escalates an expired review', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-10-26T16:30:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40), commit: { committer: { date: '2026-09-26T00:00:00Z' } } }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
        if (url.includes('/contents/')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main' }) }
      },
    })
    expect(result.findings).toEqual(['project_review_due', 'project_review_required'])
  })

  it('keeps HTTP, parse, and request failures explicit and non-healthy', async () => {
    const transient = await checkProjectSubject(projectSubject, {
      retryAttempts: 2,
      retryDelayMs: 0,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async () => ({ status: 503, url: '', json: async () => ({}) }),
    })
    expect(transient.findings).toContain('project_transient_error')
    const network = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async () => { throw new Error('ECONNRESET') },
    })
    expect(network.findings).toContain('project_network_error')
    const http = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async () => ({ status: 418, url: '', json: async () => ({}) }),
    })
    expect(http.findings).toContain('project_http_error')
    const parseFailure = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async () => ({ status: 200, url: '', json: async () => { throw new Error('truncated json') } }),
    })
    expect(parseFailure.findings).toContain('project_parse_error')
  })

  it.each([
    ['metadata', 'repository_metadata_invalid'],
    ['ref', 'pinned_ref_response_invalid'],
    ['entrypoint', 'entrypoint_response_invalid'],
    ['license', 'license_response_invalid'],
    ['release', 'project_release_response_invalid'],
  ] as const)('fails closed for a malformed %s response', async (endpoint, finding) => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: projectFetchWithMalformedEndpoint(endpoint),
    })
    expect(result.findings).toEqual(expect.arrayContaining([finding, 'project_review_required']))
  })

  it('fails closed for a malformed tags response', async () => {
    const tagSubject = { ...projectSubject, pin_kind: 'tag' }
    const result = await checkProjectSubject(tagSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: projectFetchWithMalformedEndpoint('tags', tagSubject),
    })
    expect(result.findings).toEqual(expect.arrayContaining([
      'project_tags_response_invalid',
      'project_review_required',
    ]))
  })

  it('retries JSON parsing before reporting an exhausted parse failure', async () => {
    let attempts = 0
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 0,
      fetchImpl: async (url: string) => ({
        status: 200,
        url,
        json: async () => {
          attempts += 1
          if (attempts === 1) throw new Error('truncated json')
          return { full_name: 'example/repo' }
        },
      }),
    })
    expect(attempts).toBe(2)
    expect(recovered).toMatchObject({ failure: null, data: { full_name: 'example/repo' } })
  })

  it('retries a rate-limited 403 and caps the reset-header delay', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 10,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => {
        attempts += 1
        if (attempts === 1) {
          return {
            status: 403,
            url,
            headers: new Headers({
              'x-ratelimit-remaining': '0',
              'x-ratelimit-reset': String(Date.parse('2026-09-26T00:01:00Z') / 1000),
            }),
            json: async () => ({}),
          }
        }
        return { status: 200, url, headers: new Headers(), json: async () => ({ ok: true }) }
      },
    })
    expect(attempts).toBe(2)
    expect(sleeps).toEqual([5_000])
    expect(recovered).toMatchObject({ failure: null, data: { ok: true } })
  })

  it('retries a 403 carrying Retry-After even without a remaining header', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 10,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => {
        attempts += 1
        return attempts === 1
          ? { status: 403, url, headers: new Headers({ 'retry-after': '3' }), json: async () => ({}) }
          : { status: 200, url, headers: new Headers(), json: async () => ({ ok: true }) }
      },
    })
    expect(attempts).toBe(2)
    expect(sleeps).toEqual([3_000])
    expect(recovered.failure).toBeNull()
  })

  it('retries a 403 carrying an explicit rate-limit body signal', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 25,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => {
        attempts += 1
        return attempts === 1
          ? { status: 403, url, headers: new Headers(), json: async () => ({ message: 'You have exceeded a secondary rate limit.' }) }
          : { status: 200, url, headers: new Headers(), json: async () => ({ ok: true }) }
      },
    })
    expect(attempts).toBe(2)
    expect(sleeps).toEqual([25])
    expect(recovered.failure).toBeNull()
  })

  it('honors Retry-After when retrying a 429', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 10,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => {
        attempts += 1
        return attempts === 1
          ? { status: 429, url, headers: new Headers({ 'retry-after': '2' }), json: async () => ({}) }
          : { status: 200, url, headers: new Headers(), json: async () => ({ ok: true }) }
      },
    })
    expect(attempts).toBe(2)
    expect(sleeps).toEqual([2_000])
    expect(recovered.failure).toBeNull()
  })

  it('honors the reset header when retrying a 5xx response', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 10,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => {
        attempts += 1
        return attempts === 1
          ? {
              status: 503,
              url,
              headers: new Headers({ 'x-ratelimit-reset': String(Date.parse('2026-09-26T00:00:04Z') / 1000) }),
              json: async () => ({}),
            }
          : { status: 200, url, headers: new Headers(), json: async () => ({ ok: true }) }
      },
    })
    expect(attempts).toBe(2)
    expect(sleeps).toEqual([4_000])
    expect(recovered.failure).toBeNull()
  })

  it('does not retry an ordinary 403', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const result = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 3,
      retryDelayMs: 10,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => {
        attempts += 1
        return { status: 403, url, headers: new Headers(), json: async () => ({}) }
      },
    })
    expect(attempts).toBe(1)
    expect(sleeps).toEqual([])
    expect(result).toMatchObject({ status: 403, failure: 'http' })
  })

  it('escalates a changed license digest to manual review', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40), commit: { committer: { date: '2026-09-26T00:00:00Z' } } }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from('changed license').toString('base64') }) }
        if (url.includes('/contents/')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main' }) }
      },
    })
    expect(result.findings).toEqual(expect.arrayContaining(['license_changed', 'project_review_required']))
  })

  it('sends the token only to api.github.com and fails closed on invalid schema', async () => {
    const seen = new Map<string, string | undefined>()
    await checkProjectSubject(projectSubject, {
      githubToken: 'read-token',
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string, init?: { headers?: Record<string, string> }) => {
        seen.set(url, init?.headers?.authorization)
        return { status: 200, url, json: async () => url.endsWith('/commits/v0.86.0')
          ? ({ sha: 'a'.repeat(40) })
          : url.endsWith('/commits/main') ? ({ sha: 'a'.repeat(40), commit: { committer: { date: '2026-09-26T00:00:00Z' } } })
          : url.includes('/contents/LICENSE.txt') ? ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') })
            : url.includes('/contents/') ? ({ path: 'aider/main.py' })
            : url.endsWith('/releases/latest') ? ({ tag_name: 'v0.86.0' })
              : ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main' }) }
      },
    })
    expect([...seen.entries()].every(([url, auth]) => url.startsWith('https://api.github.com/') && auth === 'Bearer read-token')).toBe(true)

    let externalAuthorization: string | undefined
    await requestProjectJson('https://github.com/example/repo', {
      githubToken: 'read-token',
      retryAttempts: 1,
      retryDelayMs: 0,
      fetchImpl: async (_url: string, init?: { headers?: Record<string, string> }) => {
        externalAuthorization = init?.headers?.authorization
        return { status: 200, json: async () => ({}) }
      },
    })
    expect(externalAuthorization).toBeUndefined()

    const outputRoot = mkdtempSync(join(tmpdir(), 'project-freshness-'))
    try {
      const report = await runProjectCheck({
        projectPath: join(outputRoot, 'missing-project-index.yml'),
        outputJson: join(outputRoot, 'project-freshness.json'),
        outputMarkdown: join(outputRoot, 'project-freshness.md'),
        now: new Date('2026-09-26T00:00:00Z'),
        fetchImpl: async () => { throw new Error('must not fetch') },
      })
      expect(report.needs_review).toBe(true)
      expect(report.results[0].findings).toContain('project_schema_invalid')
    } finally {
      rmSync(outputRoot, { recursive: true, force: true })
    }
  })

  it('renders schema validation details in the Markdown report', async () => {
    const outputRoot = mkdtempSync(join(tmpdir(), 'project-freshness-schema-report-'))
    const outputMarkdown = join(outputRoot, 'project-freshness.md')
    try {
      await runProjectCheck({
        projectPath: join(outputRoot, 'missing-project-index.yml'),
        outputJson: join(outputRoot, 'project-freshness.json'),
        outputMarkdown,
        now: new Date('2026-09-26T00:00:00Z'),
        fetchImpl: async () => { throw new Error('must not fetch') },
      })
      expect(readFileSync(outputMarkdown, 'utf8')).toContain('Missing sources/project-index.yml')
    } finally {
      rmSync(outputRoot, { recursive: true, force: true })
    }
  })

  it('bounds schema details in Markdown with deterministic truncation markers', async () => {
    const outputRoot = mkdtempSync(join(tmpdir(), 'project-freshness-schema-limits-'))
    const projectPath = join(outputRoot, 'project-index.yml')
    const outputMarkdown = join(outputRoot, 'project-freshness.md')
    const longId = 'x'.repeat(500)
    writeFileSync(projectPath, stringify({
      schema_version: 0,
      defaults: {},
      pages: [],
      chains: [],
      subjects: Array.from({ length: 25 }, () => ({ id: longId })),
    }))
    try {
      await runProjectCheck({
        projectPath,
        outputJson: join(outputRoot, 'project-freshness.json'),
        outputMarkdown,
        now: new Date('2026-09-26T00:00:00Z'),
        fetchImpl: async () => { throw new Error('must not fetch') },
      })
      const markdown = readFileSync(outputMarkdown, 'utf8')
      expect(markdown).toContain('[truncated]')
      expect(markdown).toMatch(/additional schema errors omitted/u)
      expect(markdown).not.toContain(longId)
      expect(markdown.match(/^    - /gmu)?.length).toBeLessThanOrEqual(21)
    } finally {
      rmSync(outputRoot, { recursive: true, force: true })
    }
  })

  it('checks every catalog entrypoint and both pinned and default-branch license copies', async () => {
    const catalog = parse(readFileSync('sources/project-index.yml', 'utf8')) as any
    const subjects = catalog.subjects.map((subject: any) => ({ ...catalog.defaults, ...subject }))
    expect(subjects).toHaveLength(13)
    expect(subjects.flatMap((subject: any) => subject.entrypoints)).toHaveLength(66)
    expect(subjects.flatMap((subject: any) => subject.license_sources)).toHaveLength(14)

    const seen = new Set<string>()
    const outputRoot = mkdtempSync(join(tmpdir(), 'project-freshness-catalog-'))
    try {
      const report = await runProjectCheck({
        outputJson: join(outputRoot, 'project-freshness.json'),
        outputMarkdown: join(outputRoot, 'project-freshness.md'),
        now: new Date('2026-09-26T00:00:00Z'),
        fetchImpl: async (url: string) => {
          seen.add(url)
          const subject = subjects.find((item: any) => url.startsWith(`https://api.github.com/repos/${item.canonical_repo}`))
          if (!subject) return { status: 404, url, json: async () => ({}) }
          const api = `https://api.github.com/repos/${subject.canonical_repo}`
          if (url === api) return { status: 200, url, json: async () => ({ full_name: subject.canonical_repo, archived: subject.archived, default_branch: subject.verified_default_branch }) }
          if (url.endsWith(`/commits/${encodeURIComponent(subject.verified_default_branch)}`)) return { status: 200, url, json: async () => ({ sha: subject.verified_default_head, commit: { committer: { date: `${subject.verified_at}T00:00:00Z` } } }) }
          if (url.includes('/commits/')) return { status: 200, url, json: async () => ({ sha: subject.pinned_commit }) }
          if (url.includes('/contents/')) {
            const path = decodeURIComponent(url.split('/contents/')[1].split('?')[0])
            return { status: 200, url, json: async () => ({ path, encoding: 'base64', content: Buffer.from('license fixture').toString('base64') }) }
          }
          if (url.endsWith('/tags?per_page=1')) return { status: 200, url, json: async () => ([{ name: subject.pinned_ref }]) }
          return { status: 200, url, json: async () => ({ tag_name: subject.pinned_ref }) }
        },
      })

      expect(report.results).toHaveLength(13)
      for (const subject of subjects) {
        for (const entrypoint of subject.entrypoints) {
          const path = entrypoint.path.split('/').map(encodeURIComponent).join('/')
          expect(seen).toContain(`https://api.github.com/repos/${subject.canonical_repo}/contents/${path}?ref=${subject.pinned_commit}`)
        }
        for (const license of subject.license_sources) {
          const path = license.path.split('/').map(encodeURIComponent).join('/')
          expect(seen).toContain(`https://api.github.com/repos/${subject.canonical_repo}/contents/${path}?ref=${subject.pinned_commit}`)
          expect(seen).toContain(`https://api.github.com/repos/${subject.canonical_repo}/contents/${path}?ref=${subject.verified_default_branch}`)
        }
      }
    } finally {
      rmSync(outputRoot, { recursive: true, force: true })
    }
  })

  it('builds a stable issue summary', () => {
    expect(buildProjectFreshnessReport([
      { id: 'ok', license_source_paths: ['LICENSE'], findings: [] },
      { id: 'changed', license_source_paths: ['LICENSE'], findings: ['project_update_available'] },
    ], '2026-09-26T00:00:00.000Z').summary).toEqual({ total: 2, healthy: 1, needs_review: 1 })
    expect(isProjectReportBlocking(buildProjectFreshnessReport([
      { id: 'update', license_source_paths: ['LICENSE'], findings: ['project_update_available'] },
    ]))).toBe(false)
    expect(isProjectReportBlocking(buildProjectFreshnessReport([
      { id: 'license', license_source_paths: ['LICENSE'], findings: ['project_review_required'] },
    ]))).toBe(true)
    expect(isProjectReportBlocking(buildProjectFreshnessReport([
      { id: 'network', license_source_paths: ['LICENSE'], findings: ['project_network_error'] },
    ]))).toBe(true)
  })

  it('exposes the local project-check command', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(packageJson.scripts['projects:check']).toBe('node scripts/check-projects.mjs')
  })

  it('keeps write permission and repository execution in separate workflow jobs', () => {
    const workflow = parse(readFileSync('.github/workflows/source-freshness.yml', 'utf8')) as any
    expect(workflow.jobs.scan.permissions).toEqual({ contents: 'read' })
    expect(workflow.jobs.scan.steps.find((step: any) => step.uses === 'actions/checkout@v4').with['persist-credentials']).toBe(false)
    expect(workflow.jobs.scan.steps.some((step: any) => step.run === 'pnpm projects:check')).toBe(true)
    expect(workflow.jobs.scan.steps.find((step: any) => step.uses === 'actions/upload-artifact@v4').with.path).toBe('reports/*freshness.*')
    expect(workflow.jobs.report.permissions).toEqual({ contents: 'read', issues: 'write' })
    expect(workflow.jobs.report.if).toContain('default_branch')
    expect(workflow.jobs.report.steps.map((step: any) => step.uses)).toEqual([
      'actions/download-artifact@v4',
      'actions/github-script@v7',
    ])
    expect(workflow.jobs.report.steps.every((step: any) => !Object.hasOwn(step, 'run'))).toBe(true)
    const reportScript = workflow.jobs.report.steps.find((step: any) => step.uses === 'actions/github-script@v7').with.script
    expect(reportScript).toContain('[Freshness] Source review required')
    expect(reportScript).toContain('[Freshness] Project review required')
  })
})
