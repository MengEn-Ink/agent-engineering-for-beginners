import { existsSync, readFileSync } from 'node:fs'
import { parse } from 'yaml'

const shaPattern = /^[0-9a-f]{40}$/u
const datePattern = /^\d{4}-\d{2}-\d{2}$/u
const pageTiers = new Set(['core', 'historical'])
const subjectTiers = new Set(['core', 'historical', 'watch-only'])
const repositoryStatuses = new Set(['active', 'archived', 'eol'])
const pinKinds = new Set(['release', 'tag', 'commit'])
const pathScopePattern = /^(?:\*\*|[-.\w/]+(?:\/\*\*)?)$/u

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function validDate(value) {
  if (!nonEmpty(value) || !datePattern.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function parseProjectCatalog(text) {
  try {
    return parse(text)
  } catch {
    throw new Error('Project catalog YAML cannot be parsed')
  }
}

export function validateProjectCatalog(data) {
  const errors = []
  const pages = Array.isArray(data?.pages) ? data.pages : []
  const subjects = Array.isArray(data?.subjects)
    ? data.subjects.map((subject) => ({ ...data?.defaults, ...subject }))
    : []
  const chains = Array.isArray(data?.chains) ? data.chains : []
  const pageById = new Map(pages.map((page) => [page.page_item_id, page]))
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]))
  const chainById = new Map(chains.map((chain) => [chain.id, chain]))

  if (data?.schema_version !== 1) errors.push('Project catalog schema_version must be 1')
  if (pages.length === 0) errors.push('Project catalog requires pages')
  if (subjects.length === 0) errors.push('Project catalog requires subjects')
  if (chains.length === 0) errors.push('Project catalog requires chains')
  if (!validDate(data?.defaults?.verified_at)) errors.push('Project catalog verified_at is invalid')
  if (!validDate(data?.defaults?.review_by)) errors.push('Project catalog review_by is invalid')
  if (data?.defaults?.review_by < data?.defaults?.verified_at) {
    errors.push('Project catalog review_by cannot precede verified_at')
  }

  for (const page of pages) {
    for (const field of ['page_item_id', 'catalog_tier', 'subjects', 'interview_question_ids', 'counted_in_course', 'primary_chain_id']) {
      if (!Object.hasOwn(page, field)) errors.push(`Page ${page?.page_item_id ?? '<unknown>'} is missing ${field}`)
    }
    if (!pageTiers.has(page.catalog_tier)) errors.push(`Page ${page.page_item_id} has invalid catalog_tier`)
    if (!Array.isArray(page.subjects) || !Array.isArray(page.interview_question_ids)
      || typeof page.counted_in_course !== 'boolean') {
      errors.push(`Page ${page.page_item_id} has invalid mapping fields`)
    }
    for (const subjectId of page.subjects ?? []) {
      if (!subjectById.has(subjectId)) errors.push(`Page ${page.page_item_id} references unknown subject: ${subjectId}`)
    }
    if (page.primary_chain_id !== null && !chainById.has(page.primary_chain_id)) {
      errors.push(`Page ${page.page_item_id} references unknown chain: ${page.primary_chain_id}`)
    }
    if (page.page_item_id === 'projects-index' && page.primary_chain_id !== null) {
      errors.push('Page projects-index primary_chain_id must be null')
    }
    if (page.page_item_id !== 'projects-index' && page.primary_chain_id === null) {
      errors.push(`Page ${page.page_item_id} requires primary_chain_id`)
    }
    if (page.primary_chain_id !== null && chainById.get(page.primary_chain_id)?.page_item_id !== page.page_item_id) {
      errors.push(`Page ${page.page_item_id} chain belongs to another page`)
    }
  }

  for (const subject of subjects) {
    for (const field of ['id', 'canonical_repo', 'canonical_url', 'pinned_ref', 'license_summary', 'watch_url']) {
      if (!nonEmpty(subject[field])) errors.push(`Subject ${subject?.id ?? '<unknown>'} requires ${field}`)
    }
    if (!/^[-\w]+\/[-.\w]+$/u.test(subject.canonical_repo ?? '')) {
      errors.push(`Subject ${subject.id} has invalid canonical_repo`)
    }
    if (subject.canonical_url !== `https://github.com/${subject.canonical_repo}`) {
      errors.push(`Subject ${subject.id} canonical_url does not match canonical_repo`)
    }
    if (!pinKinds.has(subject.pin_kind)) errors.push(`Subject ${subject.id} has invalid pin_kind`)
    if (!shaPattern.test(subject.pinned_commit ?? '')) errors.push(`Subject ${subject.id} has invalid pinned_commit`)
    if (!repositoryStatuses.has(subject.repository_status)) errors.push(`Subject ${subject.id} has invalid repository_status`)
    if (!subjectTiers.has(subject.catalog_tier)) errors.push(`Subject ${subject.id} has invalid catalog_tier`)
    if (typeof subject.archived !== 'boolean') errors.push(`Subject ${subject.id} archived must be boolean`)
    if (!validDate(subject.verified_at) || !validDate(subject.review_by)
      || subject.review_by < subject.verified_at) {
      errors.push(`Subject ${subject.id} has invalid review dates`)
    }
    if (subject.repository_status === 'active' && subject.archived !== false) {
      errors.push(`Subject ${subject.id} active status requires archived=false`)
    }
    if (subject.repository_status === 'archived' && subject.archived !== true) {
      errors.push(`Subject ${subject.id} archived status requires archived=true`)
    }
    if (!nonEmpty(subject.license_summary) || !Array.isArray(subject.license_scopes) || subject.license_scopes.length === 0) {
      errors.push(`Subject ${subject.id} requires license_summary and license_scopes`)
    }
    if (!/^https:\/\//u.test(subject.watch_url ?? '') || !Array.isArray(subject.entrypoints)
      || !Array.isArray(subject.license_sources) || subject.license_sources.length === 0) {
      errors.push(`Subject ${subject.id} requires HTTPS watch_url, entrypoints, and license_sources`)
    }
    const entryPaths = new Set()
    for (const entry of subject.entrypoints ?? []) {
      if (!nonEmpty(entry.path) || !nonEmpty(entry.symbol) || !nonEmpty(entry.responsibility)) {
        errors.push(`Subject ${subject.id} has an incomplete entrypoint`)
      }
      if (entryPaths.has(entry.path)) errors.push(`Subject ${subject.id} has duplicate entrypoint: ${entry.path}`)
      entryPaths.add(entry.path)
    }
    for (const license of subject.license_sources ?? []) {
      if (!nonEmpty(license.path) || !/^[0-9a-f]{64}$/u.test(license.sha256 ?? '')) {
        errors.push(`Subject ${subject.id} has an invalid license source`)
      }
    }

    const pathExpressions = new Map()
    for (const scope of subject.license_scopes ?? []) {
      if (!['path', 'contribution'].includes(scope.basis)
        || !nonEmpty(scope.expression) || !nonEmpty(scope.scope) || !nonEmpty(scope.note)) {
        errors.push(`Subject ${subject.id} has an invalid license scope`)
        continue
      }
      if (scope.basis === 'path') {
        if (!nonEmpty(scope.path_or_glob) || Object.hasOwn(scope, 'selector')) {
          errors.push(`Subject ${subject.id} path license scope requires path_or_glob and forbids selector`)
        } else if (!pathScopePattern.test(scope.path_or_glob)) {
          errors.push(`Subject ${subject.id} has unsupported path license scope: ${scope.path_or_glob}`)
        } else {
          const previous = pathExpressions.get(scope.path_or_glob)
          if (previous && previous !== scope.expression) {
            errors.push(`Subject ${subject.id} has conflicting path license scopes for ${scope.path_or_glob}`)
          }
          pathExpressions.set(scope.path_or_glob, scope.expression)
        }
      } else if (!nonEmpty(scope.selector) || Object.hasOwn(scope, 'path_or_glob')) {
        errors.push(`Subject ${subject.id} contribution license scope requires selector and forbids path_or_glob`)
      }
    }
  }

  for (const chain of chains) {
    for (const field of ['id', 'page_item_id', 'label', 'reading_hint', 'misconception', 'steps']) {
      if (!Object.hasOwn(chain, field)) errors.push(`Chain ${chain?.id ?? '<unknown>'} is missing ${field}`)
    }
    for (const field of ['id', 'page_item_id', 'label', 'reading_hint', 'misconception']) {
      if (!nonEmpty(chain[field])) errors.push(`Chain ${chain?.id ?? '<unknown>'} requires non-empty ${field}`)
    }
    const page = pageById.get(chain.page_item_id)
    if (!page) errors.push(`Chain ${chain.id} references unknown page: ${chain.page_item_id}`)
    if (!Array.isArray(chain.steps) || chain.steps.length === 0) errors.push(`Chain ${chain.id} requires non-empty steps`)
    const stepIds = new Set()
    for (const step of chain.steps ?? []) {
      for (const field of ['id', 'label', 'subject_id', 'source_path', 'symbol', 'responsibility']) {
        if (!nonEmpty(step[field])) errors.push(`Chain ${chain.id} step ${step?.id ?? '<unknown>'} is missing ${field}`)
      }
      if (stepIds.has(step.id)) errors.push(`Chain ${chain.id} has duplicate step ID: ${step.id}`)
      stepIds.add(step.id)
      const subject = subjectById.get(step.subject_id)
      if (!subject) {
        errors.push(`Chain ${chain.id} step ${step.id} references unknown subject: ${step.subject_id}`)
      } else {
        if (!page?.subjects?.includes(step.subject_id)) {
          errors.push(`Chain ${chain.id} step ${step.id} subject is not owned by page: ${step.subject_id}`)
        }
        if (!(subject.entrypoints ?? []).some((entry) => entry.path === step.source_path)) {
          errors.push(`Chain ${chain.id} step ${step.id} references an undeclared entrypoint: ${step.subject_id}/${step.source_path}`)
        }
      }
    }
  }

  for (const [label, rows] of [['page', pages], ['subject', subjects], ['chain', chains]]) {
    const ids = rows.map((row) => label === 'page' ? row.page_item_id : row.id)
    if (new Set(ids).size !== ids.length) errors.push(`Project catalog has duplicate ${label} IDs`)
  }
  for (const subject of subjects.filter((item) => item.catalog_tier === 'watch-only')) {
    const owners = pages.filter((page) => page.subjects?.includes(subject.id)).map((page) => page.page_item_id)
    if (owners.length !== 1 || owners[0] !== 'projects-index') {
      errors.push(`Watch-only subject ${subject.id} must belong only to projects-index`)
    }
    if (!Array.isArray(subject.risk_tags) || subject.risk_tags.length === 0) {
      errors.push(`Watch-only subject ${subject.id} requires risk_tags`)
    }
  }
  return errors
}

export function validateProjectCatalogIntegration(data, { contentRegistryText, interviewQuestionsText }) {
  const errors = []
  const contentIds = new Set(Array.from(
    contentRegistryText.matchAll(/\{\s*id:\s*'([^']+)'/gu),
    (match) => match[1],
  ))
  const questionIds = new Set(Array.from(
    interviewQuestionsText.matchAll(/question\(\s*'([^']+)'/gu),
    (match) => match[1],
  ))
  for (const page of data.pages ?? []) {
    if (!contentIds.has(page.page_item_id)) {
      errors.push(`Project page is missing from contentRegistry: ${page.page_item_id}`)
    }
    for (const questionId of page.interview_question_ids ?? []) {
      if (!questionIds.has(questionId)) {
        errors.push(`Project page ${page.page_item_id} references unknown interview question: ${questionId}`)
      }
    }
  }
  return errors
}

export function validateProjectCatalogFile(path) {
  if (!existsSync(path)) return ['Missing sources/project-index.yml']
  try {
    return validateProjectCatalog(parseProjectCatalog(readFileSync(path, 'utf8')))
  } catch (error) {
    return [error instanceof Error ? error.message : 'Project catalog YAML cannot be parsed']
  }
}

export function loadProjectCatalog(path) {
  const parsed = parseProjectCatalog(readFileSync(path, 'utf8'))
  const data = {
    ...parsed,
    subjects: (parsed.subjects ?? []).map((subject) => ({ ...parsed.defaults, ...subject })),
  }
  const errors = validateProjectCatalog(data)
  if (errors.length > 0) throw new Error(errors.join('\n'))
  return data
}
