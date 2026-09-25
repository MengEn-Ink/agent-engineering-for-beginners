import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'yaml'

const githubRepositoryPattern = /^https:\/\/github\.com\/([^/]+)\/([^/#?]+)\/?$/u

function isoDate(value) {
  return value.toISOString().slice(0, 10)
}

export async function checkSource(source, {
  fetchImpl = fetch,
  now = new Date(),
  timeoutMs = 12_000,
} = {}) {
  const findings = []
  let httpStatus = 0
  let finalUrl = source.url
  let repository = null

  try {
    const response = await fetchImpl(source.url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'user-agent': 'agent-engineering-handbook-source-check/1.0' },
    })
    httpStatus = response.status
    finalUrl = response.url || source.url
    if (httpStatus >= 400) findings.push('broken_link')
    if (finalUrl !== source.url) findings.push('redirected')
  } catch {
    findings.push('unreachable')
  }

  if (source.review_by && source.review_by < isoDate(now)) findings.push('review_due')

  if (source.watch_url && source.version && source.version !== 'rolling') {
    try {
      const watchResponse = await fetchImpl(source.watch_url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
        headers: { 'user-agent': 'agent-engineering-handbook-source-check/1.0' },
      })
      if (watchResponse.status < 400) {
        const watchText = (await watchResponse.text()).slice(0, 256_000)
        if (!watchText.includes(source.version)) findings.push('version_watch')
      }
    } catch {
      findings.push('watch_unreachable')
    }
  }

  const githubMatch = source.url.match(githubRepositoryPattern)
  if (githubMatch) {
    const [, owner, repositoryName] = githubMatch
    try {
      const apiResponse = await fetchImpl(
        `https://api.github.com/repos/${owner}/${repositoryName}`,
        {
          signal: AbortSignal.timeout(timeoutMs),
          headers: {
            accept: 'application/vnd.github+json',
            'user-agent': 'agent-engineering-handbook-source-check/1.0',
          },
        },
      )
      if (apiResponse.status < 400) {
        const metadata = await apiResponse.json()
        repository = { archived: Boolean(metadata.archived), pushed_at: metadata.pushed_at ?? null }
        if (repository.archived) findings.push('repository_archived')
      }
    } catch {
      findings.push('repository_metadata_unreachable')
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
  now = new Date(),
} = {}) {
  const data = parse(readFileSync(sourcePath, 'utf8'))
  const defaults = data?.source_defaults ?? {}
  const sources = (data?.sources ?? []).map((source) => ({ ...defaults, ...source }))
  const results = await mapWithConcurrency(
    sources,
    6,
    (source) => checkSource(source, { fetchImpl, now }),
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
