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

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validDate(value) {
  if (!nonEmpty(value) || !datePattern.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function validPathScope(value) {
  if (!nonEmpty(value) || value.includes('\\') || value.startsWith('/') || value.startsWith('./')) return false
  if (value.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')) return false
  return pathScopePattern.test(value)
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
  const defaults = isRecord(data?.defaults) ? data.defaults : {}
  const pages = []
  const subjects = []
  const chains = []
  for (const [index, page] of (Array.isArray(data?.pages) ? data.pages : []).entries()) {
    if (!isRecord(page)) errors.push(`Project catalog page at index ${index} must be an object`)
    else pages.push(page)
  }
  for (const [index, subject] of (Array.isArray(data?.subjects) ? data.subjects : []).entries()) {
    if (!isRecord(subject)) errors.push(`Project catalog subject at index ${index} must be an object`)
    else subjects.push({ ...defaults, ...subject })
  }
  for (const [index, chain] of (Array.isArray(data?.chains) ? data.chains : []).entries()) {
    if (!isRecord(chain)) errors.push(`Project catalog chain at index ${index} must be an object`)
    else chains.push(chain)
  }
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
    for (const subjectId of Array.isArray(page.subjects) ? page.subjects : []) {
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
    if (!nonEmpty(subject.verified_default_branch)) {
      errors.push(`Subject ${subject.id} requires verified_default_branch`)
    }
    if (!shaPattern.test(subject.verified_default_head ?? '')) {
      errors.push(`Subject ${subject.id} has invalid verified_default_head`)
    }
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
    const entrypoints = Array.isArray(subject.entrypoints) ? subject.entrypoints : []
    const licenseSources = Array.isArray(subject.license_sources) ? subject.license_sources : []
    const licenseScopes = Array.isArray(subject.license_scopes) ? subject.license_scopes : []
    if (!/^https:\/\//u.test(subject.watch_url ?? '') || !Array.isArray(subject.entrypoints)
      || !Array.isArray(subject.license_sources) || licenseSources.length === 0) {
      errors.push(`Subject ${subject.id} requires HTTPS watch_url, entrypoints, and license_sources`)
    }
    const entryPaths = new Set()
    for (const [index, entry] of entrypoints.entries()) {
      if (!isRecord(entry)) {
        errors.push(`Subject ${subject.id} entrypoint at index ${index} must be an object`)
        continue
      }
      if (!nonEmpty(entry.path) || !nonEmpty(entry.responsibility)) {
        errors.push(`Subject ${subject.id} has an incomplete entrypoint`)
      }
      if (!Array.isArray(entry.symbols) || entry.symbols.length === 0) {
        errors.push(`Subject ${subject.id} entrypoint ${entry.path} requires non-empty symbols`)
      } else {
        if (!entry.symbols.every(nonEmpty)) {
          errors.push(`Subject ${subject.id} entrypoint ${entry.path} symbols must contain only non-empty strings`)
        }
        if (new Set(entry.symbols).size !== entry.symbols.length) {
          errors.push(`Subject ${subject.id} entrypoint ${entry.path} has duplicate symbols`)
        }
      }
      if (entryPaths.has(entry.path)) errors.push(`Subject ${subject.id} has duplicate entrypoint: ${entry.path}`)
      entryPaths.add(entry.path)
    }
    for (const [index, license] of licenseSources.entries()) {
      if (!isRecord(license)) {
        errors.push(`Subject ${subject.id} license source at index ${index} must be an object`)
        continue
      }
      if (!nonEmpty(license.path) || !/^[0-9a-f]{64}$/u.test(license.sha256 ?? '')) {
        errors.push(`Subject ${subject.id} has an invalid license source`)
      }
    }

    const pathExpressions = new Map()
    for (const [index, scope] of licenseScopes.entries()) {
      if (!isRecord(scope)) {
        errors.push(`Subject ${subject.id} license scope at index ${index} must be an object`)
        continue
      }
      if (!['path', 'contribution'].includes(scope.basis)
        || !nonEmpty(scope.expression) || !nonEmpty(scope.scope) || !nonEmpty(scope.note)) {
        errors.push(`Subject ${subject.id} has an invalid license scope`)
        continue
      }
      if (scope.basis === 'path') {
        if (!nonEmpty(scope.path_or_glob) || Object.hasOwn(scope, 'selector')) {
          errors.push(`Subject ${subject.id} path license scope requires path_or_glob and forbids selector`)
        } else if (!validPathScope(scope.path_or_glob)) {
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
    const steps = Array.isArray(chain.steps) ? chain.steps : []
    for (const [index, step] of steps.entries()) {
      if (!isRecord(step)) {
        errors.push(`Chain ${chain.id} step at index ${index} must be an object`)
        continue
      }
      for (const field of ['id', 'label', 'subject_id', 'source_path', 'symbol', 'responsibility']) {
        if (!nonEmpty(step[field])) errors.push(`Chain ${chain.id} step ${step?.id ?? '<unknown>'} is missing ${field}`)
      }
      if (stepIds.has(step.id)) errors.push(`Chain ${chain.id} has duplicate step ID: ${step.id}`)
      stepIds.add(step.id)
      const subject = subjectById.get(step.subject_id)
      if (!subject) {
        errors.push(`Chain ${chain.id} step ${step.id} references unknown subject: ${step.subject_id}`)
      } else {
        if (!Array.isArray(page?.subjects) || !page.subjects.includes(step.subject_id)) {
          errors.push(`Chain ${chain.id} step ${step.id} subject is not owned by page: ${step.subject_id}`)
        }
        const entrypoints = Array.isArray(subject.entrypoints)
          ? subject.entrypoints.filter(isRecord)
          : []
        const matchingPath = entrypoints.some((entry) => entry.path === step.source_path)
        const matchingEntrypoint = entrypoints.some(
          (entry) => entry.path === step.source_path
            && Array.isArray(entry.symbols)
            && entry.symbols.includes(step.symbol),
        )
        if (!matchingEntrypoint) {
          const reference = `${step.subject_id}/${step.source_path}${matchingPath ? `#${step.symbol}` : ''}`
          errors.push(`Chain ${chain.id} step ${step.id} references an undeclared entrypoint: ${reference}`)
        }
      }
    }
  }

  for (const [label, rows] of [['page', pages], ['subject', subjects], ['chain', chains]]) {
    const ids = rows.map((row) => label === 'page' ? row.page_item_id : row.id)
    if (new Set(ids).size !== ids.length) errors.push(`Project catalog has duplicate ${label} IDs`)
  }
  for (const subject of subjects.filter((item) => item.catalog_tier === 'watch-only')) {
    const owners = pages
      .filter((page) => Array.isArray(page.subjects) && page.subjects.includes(subject.id))
      .map((page) => page.page_item_id)
    if (owners.length !== 1 || owners[0] !== 'projects-index') {
      errors.push(`Watch-only subject ${subject.id} must belong only to projects-index`)
    }
    if (!Array.isArray(subject.risk_tags) || subject.risk_tags.length === 0) {
      errors.push(`Watch-only subject ${subject.id} requires risk_tags`)
    }
  }
  return errors
}

export function validateProjectCatalogIntegration(data, sources) {
  const errors = []
  const pages = Array.isArray(data?.pages) ? data.pages : []
  const contentItems = Array.isArray(sources?.contentItems) ? sources.contentItems : []
  const interviewQuestions = Array.isArray(sources?.interviewQuestions) ? sources.interviewQuestions : []
  if (!Array.isArray(data?.pages)) errors.push('Project catalog integration requires pages')
  if (!Array.isArray(sources?.contentItems)) errors.push('Project catalog integration requires contentItems')
  if (!Array.isArray(sources?.interviewQuestions)) {
    errors.push('Project catalog integration requires interviewQuestions')
  }
  const contentIds = new Set()
  for (const [index, item] of contentItems.entries()) {
    if (!isRecord(item) || !nonEmpty(item.id)) {
      errors.push(`Content registry item at index ${index} requires non-empty id`)
    } else {
      contentIds.add(item.id)
    }
  }
  const questionIds = new Set()
  for (const [index, question] of interviewQuestions.entries()) {
    if (!isRecord(question) || !nonEmpty(question.id)) {
      errors.push(`Interview question at index ${index} requires non-empty id`)
    } else {
      questionIds.add(question.id)
    }
  }
  for (const [index, page] of pages.entries()) {
    if (!isRecord(page)) {
      errors.push(`Project catalog integration page at index ${index} must be an object`)
      continue
    }
    if (!contentIds.has(page.page_item_id)) {
      errors.push(`Project page is missing from contentRegistry: ${page.page_item_id}`)
    }
    for (const questionId of Array.isArray(page.interview_question_ids) ? page.interview_question_ids : []) {
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
