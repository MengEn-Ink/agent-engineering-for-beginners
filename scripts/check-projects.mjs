import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'yaml'
import { validateProjectCatalogFile } from './project-catalog.mjs'
import { reviewDateInTimeZone } from './review-date.mjs'

const retryable = new Set([408, 429, 500, 502, 503, 504])

export async function requestProjectJson(url, {
  fetchImpl,
  githubToken,
  retryAttempts,
  retryDelayMs,
}) {
  for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
    try {
      const isGitHubApi = new URL(url).hostname === 'api.github.com'
      const response = await fetchImpl(url, {
        signal: AbortSignal.timeout(12_000),
        headers: {
          accept: 'application/vnd.github+json',
          'user-agent': 'agent-engineering-handbook-project-check/1.0',
          ...(githubToken && isGitHubApi ? { authorization: `Bearer ${githubToken}` } : {}),
        },
      })
      if (retryable.has(response.status) && attempt < retryAttempts) {
        await new Promise((done) => setTimeout(done, retryDelayMs * attempt))
        continue
      }
      if (response.status >= 400) {
        return {
          status: response.status,
          data: null,
          failure: retryable.has(response.status) ? 'transient' : 'http',
        }
      }
      try {
        return { status: response.status, data: await response.json(), failure: null }
      } catch {
        if (attempt === retryAttempts) {
          return { status: response.status, data: null, failure: 'parse' }
        }
        await new Promise((done) => setTimeout(done, retryDelayMs * attempt))
      }
    } catch {
      if (attempt === retryAttempts) return { status: 0, data: null, failure: 'network' }
      await new Promise((done) => setTimeout(done, retryDelayMs * attempt))
    }
  }
  return { status: 0, data: null, failure: 'network' }
}

function recordFailure(findings, response) {
  if (response.failure === 'transient') findings.push('project_transient_error')
  else if (response.failure === 'network') findings.push('project_network_error')
  else if (response.failure === 'parse') findings.push('project_parse_error')
  else if (response.failure === 'http') findings.push('project_http_error')
}

function requireReview(findings, detail) {
  findings.push(detail, 'project_review_required')
}

function githubContentSha256(data) {
  if (data?.encoding !== 'base64' || typeof data.content !== 'string') return null
  const content = Buffer.from(data.content.replace(/\n/gu, ''), 'base64')
  return createHash('sha256').update(content).digest('hex')
}

export async function checkProjectSubject(subject, {
  fetchImpl = fetch,
  githubToken = process.env.GITHUB_TOKEN,
  now = new Date(),
  retryAttempts = 3,
  retryDelayMs = 250,
} = {}) {
  const api = `https://api.github.com/repos/${subject.canonical_repo}`
  const options = { fetchImpl, githubToken, retryAttempts, retryDelayMs }
  const findings = []
  let defaultBranch = null

  const metadata = await requestProjectJson(api, options)
  if (metadata.failure) {
    recordFailure(findings, metadata)
  } else {
    const metadataData = metadata.data
    defaultBranch = metadataData?.default_branch
    if (typeof metadataData?.full_name !== 'string'
      || typeof metadataData?.archived !== 'boolean'
      || typeof defaultBranch !== 'string'
      || defaultBranch === '') {
      requireReview(findings, 'repository_metadata_invalid')
    }
    if (metadataData?.full_name !== subject.canonical_repo) {
      requireReview(findings, 'canonical_repo_changed')
    }
    if (Boolean(metadataData?.archived) !== subject.archived) {
      requireReview(findings, 'repository_status_changed')
    }
  }

  if (defaultBranch) {
    const head = await requestProjectJson(`${api}/commits/${encodeURIComponent(defaultBranch)}`, options)
    if (head.failure) {
      recordFailure(findings, head)
    } else if (head.data?.sha !== subject.pinned_commit
      && head.data?.commit?.committer?.date
      && reviewDateInTimeZone(new Date(head.data.commit.committer.date)) > subject.verified_at) {
      findings.push('project_update_available')
    }
  }

  const ref = await requestProjectJson(`${api}/commits/${encodeURIComponent(subject.pinned_ref)}`, options)
  if (ref.failure) recordFailure(findings, ref)
  else if (ref.data?.sha !== subject.pinned_commit) requireReview(findings, 'pin_ref_mismatch')

  for (const entrypoint of subject.entrypoints) {
    const encodedPath = entrypoint.path.split('/').map(encodeURIComponent).join('/')
    const entry = await requestProjectJson(
      `${api}/contents/${encodedPath}?ref=${subject.pinned_commit}`,
      options,
    )
    if (entry.failure === 'http' && entry.status === 404) {
      requireReview(findings, 'entrypoint_missing')
    } else if (entry.failure) {
      recordFailure(findings, entry)
    } else if (entry.data?.path !== entrypoint.path) {
      requireReview(findings, 'entrypoint_response_invalid')
    }
  }

  for (const source of subject.license_sources) {
    const encodedPath = source.path.split('/').map(encodeURIComponent).join('/')
    const refs = [...new Set([subject.pinned_commit, defaultBranch].filter(Boolean))]
    for (const refName of refs) {
      const license = await requestProjectJson(
        `${api}/contents/${encodedPath}?ref=${encodeURIComponent(refName)}`,
        options,
      )
      if (license.failure === 'http' && license.status === 404) {
        requireReview(findings, 'license_source_missing')
      } else if (license.failure) {
        recordFailure(findings, license)
      } else if (githubContentSha256(license.data) !== source.sha256) {
        requireReview(findings, 'license_changed')
      }
    }
  }

  if (subject.pin_kind !== 'commit') {
    const latestUrl = subject.pin_kind === 'tag'
      ? `${api}/tags?per_page=1`
      : `${api}/releases/latest`
    const latest = await requestProjectJson(latestUrl, options)
    if (latest.failure === 'http' && latest.status === 404) {
      requireReview(findings, 'project_release_missing')
    } else if (latest.failure) {
      recordFailure(findings, latest)
    } else {
      const latestRef = subject.pin_kind === 'tag' ? latest.data?.[0]?.name : latest.data?.tag_name
      if (!latestRef) requireReview(findings, 'project_release_missing')
      else if (latestRef !== subject.pinned_ref) findings.push('project_update_available')
    }
  }

  if (subject.review_by < reviewDateInTimeZone(now)) {
    requireReview(findings, 'project_review_due')
  }
  return {
    id: subject.id,
    license_source_paths: subject.license_sources.map((source) => source.path),
    findings: [...new Set(findings)],
  }
}

export function buildProjectFreshnessReport(results, generatedAt = new Date().toISOString()) {
  const flagged = results.filter((result) => result.findings.length > 0)
  return {
    generated_at: generatedAt,
    summary: {
      total: results.length,
      healthy: results.length - flagged.length,
      needs_review: flagged.length,
    },
    needs_review: flagged.length > 0,
    results,
  }
}

const blockingFindings = new Set([
  'project_review_required',
  'project_transient_error',
  'project_network_error',
  'project_parse_error',
  'project_http_error',
  'project_schema_invalid',
])

export function isProjectReportBlocking(report) {
  return report.results.some(
    (result) => result.findings.some((finding) => blockingFindings.has(finding)),
  )
}

function renderProjectReport(report) {
  const lines = ['# Project freshness report', '', `Generated: ${report.generated_at}`, '']
  for (const result of report.results.filter((item) => item.findings.length > 0)) {
    lines.push(`- ${result.id}: ${result.findings.join(', ')}`)
    if (result.license_source_paths.length > 0) {
      lines.push(`  - License sources: ${result.license_source_paths.join(', ')}`)
    }
  }
  lines.push('', 'Automated findings request review; they never authorize content changes.', '')
  return lines.join('\n')
}

export async function runProjectCheck({
  projectPath = resolve('sources/project-index.yml'),
  outputJson = resolve('reports/project-freshness.json'),
  outputMarkdown = resolve('reports/project-freshness.md'),
  fetchImpl = fetch,
  githubToken = process.env.GITHUB_TOKEN,
  now = new Date(),
} = {}) {
  const schemaErrors = validateProjectCatalogFile(projectPath)
  let report
  if (schemaErrors.length > 0) {
    report = buildProjectFreshnessReport([{
      id: 'project-catalog',
      license_source_paths: [],
      findings: ['project_schema_invalid'],
      schema_errors: schemaErrors,
    }], now.toISOString())
  } else {
    const data = parse(readFileSync(projectPath, 'utf8'))
    const subjects = data.subjects.map((subject) => ({ ...data.defaults, ...subject }))
    const results = []
    for (const subject of subjects) {
      results.push(await checkProjectSubject(subject, { fetchImpl, githubToken, now }))
    }
    report = buildProjectFreshnessReport(results, now.toISOString())
  }
  mkdirSync(dirname(outputJson), { recursive: true })
  mkdirSync(dirname(outputMarkdown), { recursive: true })
  writeFileSync(outputJson, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(outputMarkdown, renderProjectReport(report))
  return report
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath && pathToFileURL(invokedPath).href === import.meta.url) {
  const report = await runProjectCheck()
  console.log(JSON.stringify(report.summary))
  if (process.argv.includes('--strict') && isProjectReportBlocking(report)) process.exitCode = 1
}
