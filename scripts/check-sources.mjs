import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'yaml'
import { validateSourceRegistry } from './validate-content.mjs'

const githubRepositoryPattern = /^https:\/\/github\.com\/([^/]+)\/([^/#?]+)\/?$/u
const retryableStatuses = new Set([408, 429, 500, 502, 503, 504])

function isoDate(value) {
  return value.toISOString().slice(0, 10)
}

function wait(milliseconds) {
  if (milliseconds <= 0) return Promise.resolve()
  return new Promise((resolveWait) => setTimeout(resolveWait, milliseconds))
}

async function fetchWithRetry(url, init, {
  fetchImpl,
  timeoutMs,
  retryAttempts,
  retryDelayMs,
}, parseResponse = null) {
  let lastError = null
  for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (retryableStatuses.has(response.status)) {
        if (attempt === retryAttempts) return { response, data: null, error: null, failure: null }
      } else if (parseResponse && response.status < 400) {
        try {
          const data = await parseResponse(response)
          return { response, data, error: null, failure: null }
        } catch (error) {
          lastError = error
          if (attempt === retryAttempts) {
            return { response, data: null, error: lastError, failure: 'parse' }
          }
        }
      } else {
        return { response, data: null, error: null, failure: null }
      }
    } catch (error) {
      lastError = error
      if (attempt === retryAttempts) {
        return { response: null, data: null, error: lastError, failure: 'request' }
      }
    }
    await wait(retryDelayMs * attempt)
  }
  return { response: null, data: null, error: lastError, failure: 'request' }
}

function addHttpFinding(findings, scope, status) {
  findings.push(retryableStatuses.has(status)
    ? `${scope}_transient_error`
    : `${scope}_http_error`)
}

function addApiFinding(findings, scope, status) {
  findings.push(retryableStatuses.has(status)
    ? `${scope}_transient_error`
    : `${scope}_error`)
}

function normalizedVersion(value) {
  return String(value).trim().toLowerCase().replace(/^v/u, '')
}

export function watchedVersionChanged(text, expectedVersion) {
  const expected = normalizedVersion(expectedVersion)
  const lifecycle = new Set(['development', 'draft', 'stable'])
  const numericToken = '(\\d{4}-\\d{2}-\\d{2}|v?\\d+(?:\\.\\d+){0,2})'
  const lifecycleToken = '(Development|Draft|Stable)'
  const patterns = lifecycle.has(expected)
    ? [new RegExp(`status\\s*[:=-]\\s*${lifecycleToken}`, 'giu')]
    : [
        new RegExp(`(?:current|latest|stable)(?:\\s+[A-Za-z]+){0,4}\\s*[:=-]\\s*${numericToken}`, 'giu'),
        new RegExp(`(?:current|latest|stable)(?:\\s+[A-Za-z]+){0,3}\\s+${numericToken}`, 'giu'),
      ]
  const advertised = []
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) advertised.push(match[1])
  }
  if (advertised.length > 0) {
    return advertised.some((candidate) => normalizedVersion(candidate) !== expected)
  }
  return !text.toLowerCase().includes(String(expectedVersion).toLowerCase())
}

export async function checkSource(source, {
  fetchImpl = fetch,
  githubToken = process.env.GITHUB_TOKEN,
  now = new Date(),
  timeoutMs = 12_000,
  retryAttempts = 3,
  retryDelayMs = 250,
} = {}) {
  const findings = []
  let httpStatus = 0
  let finalUrl = source.url
  let repository = null

  const requestOptions = { fetchImpl, timeoutMs, retryAttempts, retryDelayMs }
  const sourceRequest = await fetchWithRetry(source.url, {
    redirect: 'follow',
    headers: { 'user-agent': 'agent-engineering-handbook-source-check/1.0' },
  }, requestOptions)
  if (sourceRequest.response) {
    const response = sourceRequest.response
    httpStatus = response.status
    finalUrl = response.url || source.url
    if (retryableStatuses.has(httpStatus)) findings.push('source_transient_error')
    else if (httpStatus >= 400) findings.push('broken_link')
    if (finalUrl !== source.url) findings.push('redirected')
  } else {
    findings.push('unreachable')
  }

  if (source.review_by && source.review_by < isoDate(now)) findings.push('review_due')

  if (source.watch_url && source.version && source.version !== 'rolling') {
    const watchRequest = await fetchWithRetry(source.watch_url, {
      redirect: 'follow',
      headers: { 'user-agent': 'agent-engineering-handbook-source-check/1.0' },
    }, requestOptions, async (response) => (await response.text()).slice(0, 256_000))
    if (watchRequest.failure === 'parse') {
      findings.push('watch_parse_error')
    } else if (!watchRequest.response) {
      findings.push('watch_unreachable')
    } else if (watchRequest.response.status >= 400) {
      addHttpFinding(findings, 'watch', watchRequest.response.status)
    } else {
      if (watchedVersionChanged(watchRequest.data, source.version)) findings.push('version_watch')
    }
  }

  const githubMatch = source.url.match(githubRepositoryPattern)
  if (githubMatch) {
    const [, owner, repositoryName] = githubMatch
    const githubHeaders = {
      accept: 'application/vnd.github+json',
      'user-agent': 'agent-engineering-handbook-source-check/1.0',
      ...(githubToken ? { authorization: `Bearer ${githubToken}` } : {}),
    }
    const metadataRequest = await fetchWithRetry(
      `https://api.github.com/repos/${owner}/${repositoryName}`,
      { headers: githubHeaders },
      requestOptions,
      (response) => response.json(),
    )
    if (metadataRequest.failure === 'parse') {
      findings.push('repository_metadata_parse_error')
    } else if (!metadataRequest.response) {
      findings.push('repository_metadata_unreachable')
    } else if (metadataRequest.response.status >= 400) {
      addApiFinding(findings, 'repository_api', metadataRequest.response.status)
    } else {
      const metadata = metadataRequest.data
      repository = {
        archived: Boolean(metadata.archived),
        pushed_at: metadata.pushed_at ?? null,
        latest_release: null,
        release_published_at: null,
      }
      if (repository.archived) findings.push('repository_archived')
      if (repository.pushed_at?.slice(0, 10) > source.last_verified) {
        findings.push('repository_updated')
      }
    }

    const releaseRequest = await fetchWithRetry(
      `https://api.github.com/repos/${owner}/${repositoryName}/releases/latest`,
      { headers: githubHeaders },
      requestOptions,
      (response) => response.json(),
    )
    if (releaseRequest.failure === 'parse') {
      findings.push('repository_release_parse_error')
    } else if (!releaseRequest.response) {
      findings.push('repository_release_unreachable')
    } else if (releaseRequest.response.status === 404) {
      // A repository can legitimately have no releases.
    } else if (releaseRequest.response.status >= 400) {
      addApiFinding(findings, 'repository_release_api', releaseRequest.response.status)
    } else {
      const release = releaseRequest.data
      if (!repository) {
        repository = { archived: null, pushed_at: null, latest_release: null, release_published_at: null }
      }
      repository.latest_release = release.tag_name ?? null
      repository.release_published_at = release.published_at ?? null
      if (repository.release_published_at?.slice(0, 10) > source.last_verified) {
        findings.push('repository_release')
      }
      if (source.version !== 'rolling' && repository.latest_release
        && normalizedVersion(repository.latest_release) !== normalizedVersion(source.version)) {
        findings.push('release_watch')
      }
    }
  }

  return {
    id: source.id,
    title: source.title,
    url: source.url,
    final_url: finalUrl,
    http_status: httpStatus,
    version: source.version,
    review_by: source.review_by,
    impact_chapters: source.impact_chapters,
    repository,
    findings: [...new Set(findings)],
  }
}

export function buildFreshnessReport(results, generatedAt = new Date().toISOString()) {
  const needsReview = results.filter((result) => result.findings.length > 0)
  return {
    generated_at: generatedAt,
    summary: {
      total: results.length,
      healthy: results.length - needsReview.length,
      needs_review: needsReview.length,
    },
    needs_review: needsReview.length > 0,
    results,
  }
}

export function renderMarkdownReport(report) {
  const lines = [
    '# Source freshness report',
    '',
    `Generated: ${report.generated_at}`,
    '',
    `- Total: ${report.summary.total}`,
    `- Healthy: ${report.summary.healthy}`,
    `- Needs review: ${report.summary.needs_review}`,
    '',
  ]
  if (report.schema_errors?.length) {
    lines.push('## Registry errors', '')
    for (const error of report.schema_errors) lines.push(`- ${error}`)
    lines.push('')
  }
  const flagged = report.results.filter((result) => result.findings.length > 0)
  if (flagged.length === 0) return `${lines.join('\n')}All sources passed automated checks.\n`
  lines.push('| Source | Findings | HTTP | Impact |', '| --- | --- | ---: | --- |')
  for (const result of flagged) {
    lines.push(`| ${result.id} | ${result.findings.join(', ')} | ${result.http_status} | ${(result.impact_chapters ?? []).join(', ')} |`)
  }
  lines.push('', 'Automated findings are review prompts, not permission to edit or publish book content.', '')
  return lines.join('\n')
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length)
  let cursor = 0
  async function run() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await worker(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run))
  return results
}

export async function runSourceCheck({
  sourcePath = resolve('sources/source-index.yml'),
  outputJson = resolve('reports/source-freshness.json'),
  outputMarkdown = resolve('reports/source-freshness.md'),
  strict = false,
  fetchImpl = fetch,
  githubToken = process.env.GITHUB_TOKEN,
  now = new Date(),
} = {}) {
  const schemaErrors = validateSourceRegistry(sourcePath)
  if (schemaErrors.length > 0) {
    const report = {
      generated_at: now.toISOString(),
      summary: { total: 0, healthy: 0, needs_review: 1 },
      needs_review: true,
      schema_errors: schemaErrors,
      results: [{
        id: 'source-registry',
        title: 'Source registry',
        url: '',
        final_url: '',
        http_status: 0,
        version: '',
        review_by: '',
        impact_chapters: [],
        repository: null,
        findings: ['schema_invalid'],
      }],
    }
    mkdirSync(dirname(outputJson), { recursive: true })
    writeFileSync(outputJson, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    writeFileSync(outputMarkdown, renderMarkdownReport(report), 'utf8')
    if (strict) process.exitCode = 1
    return report
  }
  const data = parse(readFileSync(sourcePath, 'utf8'))
  const defaults = data?.source_defaults ?? {}
  const sources = (data?.sources ?? []).map((source) => ({ ...defaults, ...source }))
  const results = await mapWithConcurrency(
    sources,
    6,
    (source) => checkSource(source, { fetchImpl, githubToken, now }),
  )
  const report = buildFreshnessReport(results, now.toISOString())
  mkdirSync(dirname(outputJson), { recursive: true })
  writeFileSync(outputJson, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  writeFileSync(outputMarkdown, renderMarkdownReport(report), 'utf8')

  if (strict) {
    const blocking = results.some((result) =>
      result.findings.some((finding) => ['broken_link', 'unreachable'].includes(finding)),
    )
    if (blocking) process.exitCode = 1
  }
  return report
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath && pathToFileURL(invokedPath).href === import.meta.url) {
  const strict = process.argv.includes('--strict')
  const report = await runSourceCheck({ strict })
  console.log(JSON.stringify(report.summary))
}
