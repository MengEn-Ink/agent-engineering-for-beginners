import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'yaml'
import { validateProjectCatalogFile } from './project-catalog.mjs'
import { reviewDateInTimeZone } from './review-date.mjs'

const retryable = new Set([408, 429, 500, 502, 503, 504])
const shaPattern = /^[0-9a-f]{40}$/iu
const maxSchemaErrors = 20
const maxSchemaErrorLength = 240

function responseHeader(response, name) {
  if (typeof response?.headers?.get === 'function') return response.headers.get(name)
  if (!response?.headers || typeof response.headers !== 'object') return null
  const key = Object.keys(response.headers).find((item) => item.toLowerCase() === name.toLowerCase())
  return key ? String(response.headers[key]) : null
}

function nowMilliseconds(now) {
  const value = typeof now === 'function' ? now() : now
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}

function headerDelayMs(response, now) {
  const delays = []
  const retryAfter = responseHeader(response, 'retry-after')
  if (retryAfter !== null && retryAfter.trim() !== '') {
    const seconds = Number(retryAfter)
    const delay = Number.isFinite(seconds)
      ? seconds * 1_000
      : Date.parse(retryAfter) - nowMilliseconds(now)
    if (Number.isFinite(delay)) delays.push(Math.max(0, delay))
  }
  const resetHeader = responseHeader(response, 'x-ratelimit-reset')
  if (resetHeader !== null && resetHeader.trim() !== '') {
    const reset = Number(resetHeader)
    if (Number.isFinite(reset)) delays.push(Math.max(0, (reset * 1_000) - nowMilliseconds(now)))
  }
  return delays.length > 0 ? Math.max(...delays) : null
}

function retryDelay(response, { attempt, retryDelayMs, maxRetryDelayMs, now }) {
  const requested = headerDelayMs(response, now) ?? retryDelayMs * attempt
  return Math.min(Math.max(0, requested), maxRetryDelayMs)
}

async function isRateLimited403(response) {
  if (response.status !== 403) return false
  if (responseHeader(response, 'x-ratelimit-remaining') === '0') return true
  const retryAfter = responseHeader(response, 'retry-after')
  if (retryAfter !== null && retryAfter.trim() !== '') return true
  try {
    const body = await response.json()
    const message = typeof body?.message === 'string' ? body.message : ''
    return /(?:secondary\s+)?rate\s+limit|abuse\s+detection/iu.test(message)
  } catch {
    return false
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function validCommitSha(value) {
  return typeof value === 'string' && shaPattern.test(value)
}

function validCommitDate(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

function validBase64Content(value) {
  if (typeof value !== 'string') return false
  const compact = value.replace(/\s/gu, '')
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(compact)) {
    return false
  }
  return Buffer.from(compact, 'base64').toString('base64') === compact
}

export async function requestProjectJson(url, {
  fetchImpl = fetch,
  githubToken,
  retryAttempts = 3,
  retryDelayMs = 250,
  maxRetryDelayMs = 60_000,
  now = new Date(),
  sleepImpl = (delayMs) => new Promise((done) => setTimeout(done, delayMs)),
} = {}) {
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
      const responseIsRetryable = retryable.has(response.status) || await isRateLimited403(response)
      if (responseIsRetryable && attempt < retryAttempts) {
        await sleepImpl(retryDelay(response, {
          attempt,
          retryDelayMs,
          maxRetryDelayMs,
          now,
        }))
        continue
      }
      if (response.status >= 400) {
        return {
          status: response.status,
          data: null,
          failure: responseIsRetryable ? 'transient' : 'http',
        }
      }
      try {
        return { status: response.status, data: await response.json(), failure: null }
      } catch {
        if (attempt === retryAttempts) {
          return { status: response.status, data: null, failure: 'parse' }
        }
        await sleepImpl(retryDelay(response, {
          attempt,
          retryDelayMs,
          maxRetryDelayMs,
          now,
        }))
      }
    } catch {
      if (attempt === retryAttempts) return { status: 0, data: null, failure: 'network' }
      await sleepImpl(Math.min(retryDelayMs * attempt, maxRetryDelayMs))
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
  maxRetryDelayMs = 60_000,
  sleepImpl = (delayMs) => new Promise((done) => setTimeout(done, delayMs)),
} = {}) {
  const api = `https://api.github.com/repos/${subject.canonical_repo}`
  const options = {
    fetchImpl,
    githubToken,
    retryAttempts,
    retryDelayMs,
    maxRetryDelayMs,
    now,
    sleepImpl,
  }
  const findings = []
  let defaultBranch = null

  const metadata = await requestProjectJson(api, options)
  if (metadata.failure) {
    recordFailure(findings, metadata)
  } else {
    const metadataData = metadata.data
    defaultBranch = metadataData?.default_branch
    if (!isRecord(metadataData)
      || !nonEmpty(metadataData.full_name)
      || typeof metadataData?.archived !== 'boolean'
      || !nonEmpty(defaultBranch)) {
      requireReview(findings, 'repository_metadata_invalid')
    }
    if (nonEmpty(metadataData?.full_name) && metadataData.full_name !== subject.canonical_repo) {
      requireReview(findings, 'canonical_repo_changed')
    }
    if (typeof metadataData?.archived === 'boolean' && metadataData.archived !== subject.archived) {
      requireReview(findings, 'repository_status_changed')
    }
    if (nonEmpty(defaultBranch) && defaultBranch !== subject.verified_default_branch) {
      requireReview(findings, 'default_branch_changed')
    }
  }

  if (defaultBranch) {
    const head = await requestProjectJson(`${api}/commits/${encodeURIComponent(defaultBranch)}`, options)
    if (head.failure) {
      recordFailure(findings, head)
    } else {
      const headSha = head.data?.sha
      const headDate = head.data?.commit?.committer?.date
      if (validCommitSha(headSha) && headSha !== subject.verified_default_head) {
        findings.push('project_update_available')
      }
      if (!isRecord(head.data) || !validCommitSha(headSha) || !validCommitDate(headDate)) {
        requireReview(findings, 'repository_head_invalid')
      }
    }
  }

  const ref = await requestProjectJson(`${api}/commits/${encodeURIComponent(subject.pinned_ref)}`, options)
  if (ref.failure) recordFailure(findings, ref)
  else if (!isRecord(ref.data) || !validCommitSha(ref.data.sha)) {
    requireReview(findings, 'pinned_ref_response_invalid')
  } else if (ref.data.sha !== subject.pinned_commit) {
    requireReview(findings, 'pin_ref_mismatch')
  }

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
    } else if (!isRecord(entry.data) || entry.data.path !== entrypoint.path) {
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
      } else if (!isRecord(license.data)
        || license.data.path !== source.path
        || license.data.encoding !== 'base64'
        || !validBase64Content(license.data.content)) {
        requireReview(findings, 'license_response_invalid')
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
      const validLatest = subject.pin_kind === 'tag'
        ? Array.isArray(latest.data) && isRecord(latest.data[0]) && nonEmpty(latest.data[0].name)
        : isRecord(latest.data) && nonEmpty(latest.data.tag_name)
      if (!validLatest) {
        requireReview(findings, subject.pin_kind === 'tag'
          ? 'project_tags_response_invalid'
          : 'project_release_response_invalid')
      } else {
        const latestRef = subject.pin_kind === 'tag' ? latest.data[0].name : latest.data.tag_name
        if (latestRef !== subject.pinned_ref) findings.push('project_update_available')
      }
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
    if (Array.isArray(result.schema_errors) && result.schema_errors.length > 0) {
      lines.push('  - Schema errors:')
      for (const error of result.schema_errors.slice(0, maxSchemaErrors)) {
        const normalized = String(error).replace(/\s+/gu, ' ').trim()
        const marker = '... [truncated]'
        const detail = normalized.length > maxSchemaErrorLength
          ? `${normalized.slice(0, maxSchemaErrorLength - marker.length)}${marker}`
          : normalized
        lines.push(`    - ${detail}`)
      }
      if (result.schema_errors.length > maxSchemaErrors) {
        lines.push(`    - ... ${result.schema_errors.length - maxSchemaErrors} additional schema errors omitted.`)
      }
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
  retryAttempts = 3,
  retryDelayMs = 250,
  maxRetryDelayMs = 60_000,
  sleepImpl = (delayMs) => new Promise((done) => setTimeout(done, delayMs)),
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
      results.push(await checkProjectSubject(subject, {
        fetchImpl,
        githubToken,
        now,
        retryAttempts,
        retryDelayMs,
        maxRetryDelayMs,
        sleepImpl,
      }))
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
