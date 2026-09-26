import { existsSync, readFileSync } from 'node:fs'
import { parse } from 'yaml'

const shaPattern = /^[0-9a-f]{40}$/u
const datePattern = /^\d{4}-\d{2}-\d{2}$/u
const pageTiers = new Set(['core', 'historical'])
const subjectTiers = new Set(['core', 'historical', 'watch-only'])
const repositoryStatuses = new Set(['active', 'archived', 'eol'])
const pinKinds = new Set(['release', 'tag', 'commit'])
const pathScopePattern = /^(?:\*\*|[-.\w/]+(?:\/\*\*)?)$/u
const encodedPathBypassPattern = /%(?:00|25|2e|2f|5c)/iu
const drivePathPattern = /^[a-z]:/iu

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function display(value) {
  return typeof value === 'string' ? value : '<invalid>'
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

function validRepositoryPath(value) {
  if (!nonEmpty(value) || value.includes('\\') || value.includes('\0')
    || value.startsWith('/') || drivePathPattern.test(value)
    || encodedPathBypassPattern.test(value)) return false
  try {
    encodeURI(value)
  } catch {
    return false
  }
  return value.split('/').every((segment) => segment !== '' && segment !== '.' && segment !== '..')
}

function validWatchUrl(subject) {
  if (!nonEmpty(subject.watch_url) || !nonEmpty(subject.canonical_repo)) return false
  let url
  try {
    url = new URL(subject.watch_url)
  } catch {
    return false
  }
  if (url.protocol !== 'https:' || url.hostname !== 'github.com'
    || url.username !== '' || url.password !== '' || url.port !== ''
    || url.search !== '' || url.hash !== '') return false
  const repositoryUrl = `https://github.com/${subject.canonical_repo}`
  const allowed = new Set([repositoryUrl])
  if (subject.pin_kind === 'release') allowed.add(`${repositoryUrl}/releases/latest`)
  if (subject.pin_kind === 'tag') allowed.add(`${repositoryUrl}/tags`)
  if (allowed.has(subject.watch_url)) return true
  const discussionPrefix = `${repositoryUrl}/discussions/`
  return (subject.repository_status === 'eol' || subject.archived === true)
    && subject.watch_url.startsWith(discussionPrefix)
    && /^[1-9]\d*$/u.test(subject.watch_url.slice(discussionPrefix.length))
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
  if (validDate(data?.defaults?.review_by) && validDate(data?.defaults?.verified_at)
    && data.defaults.review_by < data.defaults.verified_at) {
    errors.push('Project catalog review_by cannot precede verified_at')
  }

  for (const page of pages) {
    const pageId = display(page.page_item_id)
    for (const field of ['page_item_id', 'catalog_tier', 'subjects', 'interview_question_ids', 'counted_in_course', 'primary_chain_id']) {
      if (!Object.hasOwn(page, field)) errors.push(`Page ${pageId} is missing ${field}`)
    }
    if (!pageTiers.has(page.catalog_tier)) errors.push(`Page ${pageId} has invalid catalog_tier`)
    if (!Array.isArray(page.subjects) || !Array.isArray(page.interview_question_ids)
      || typeof page.counted_in_course !== 'boolean') {
      errors.push(`Page ${pageId} has invalid mapping fields`)
    }
    for (const subjectId of Array.isArray(page.subjects) ? page.subjects : []) {
      if (!subjectById.has(subjectId)) errors.push(`Page ${pageId} references unknown subject: ${display(subjectId)}`)
    }
    if (page.primary_chain_id !== null && !chainById.has(page.primary_chain_id)) {
      errors.push(`Page ${pageId} references unknown chain: ${display(page.primary_chain_id)}`)
    }
    if (page.page_item_id === 'projects-index' && page.primary_chain_id !== null) {
      errors.push('Page projects-index primary_chain_id must be null')
    }
    if (page.page_item_id !== 'projects-index' && page.primary_chain_id === null) {
      errors.push(`Page ${pageId} requires primary_chain_id`)
    }
    if (page.primary_chain_id !== null && chainById.get(page.primary_chain_id)?.page_item_id !== page.page_item_id) {
      errors.push(`Page ${pageId} chain belongs to another page`)
    }
  }

  for (const subject of subjects) {
    const subjectId = display(subject.id)
    for (const field of ['id', 'canonical_repo', 'canonical_url', 'pinned_ref', 'license_summary', 'watch_url']) {
      if (!nonEmpty(subject[field])) errors.push(`Subject ${subjectId} requires ${field}`)
    }
    if (typeof subject.canonical_repo !== 'string'
      || !/^[-\w]+\/[-.\w]+$/u.test(subject.canonical_repo)) {
      errors.push(`Subject ${subjectId} has invalid canonical_repo`)
    }
    if (!nonEmpty(subject.canonical_repo)
      || subject.canonical_url !== `https://github.com/${subject.canonical_repo}`) {
      errors.push(`Subject ${subjectId} canonical_url does not match canonical_repo`)
    }
    if (!pinKinds.has(subject.pin_kind)) errors.push(`Subject ${subjectId} has invalid pin_kind`)
    if (typeof subject.pinned_commit !== 'string' || !shaPattern.test(subject.pinned_commit)) {
      errors.push(`Subject ${subjectId} has invalid pinned_commit`)
    }
    if (!nonEmpty(subject.verified_default_branch)) {
      errors.push(`Subject ${subjectId} requires verified_default_branch`)
    }
    if (typeof subject.verified_default_head !== 'string'
      || !shaPattern.test(subject.verified_default_head)) {
      errors.push(`Subject ${subjectId} has invalid verified_default_head`)
    }
    if (!repositoryStatuses.has(subject.repository_status)) errors.push(`Subject ${subjectId} has invalid repository_status`)
    if (!subjectTiers.has(subject.catalog_tier)) errors.push(`Subject ${subjectId} has invalid catalog_tier`)
    if (typeof subject.archived !== 'boolean') errors.push(`Subject ${subjectId} archived must be boolean`)
    if (!validDate(subject.verified_at) || !validDate(subject.review_by)
      || subject.review_by < subject.verified_at) {
      errors.push(`Subject ${subjectId} has invalid review dates`)
    }
    if (subject.repository_status === 'active' && subject.archived !== false) {
      errors.push(`Subject ${subjectId} active status requires archived=false`)
    }
    if (subject.repository_status === 'archived' && subject.archived !== true) {
      errors.push(`Subject ${subjectId} archived status requires archived=true`)
    }
    if (!nonEmpty(subject.license_summary) || !Array.isArray(subject.license_scopes) || subject.license_scopes.length === 0) {
      errors.push(`Subject ${subjectId} requires license_summary and license_scopes`)
    }
    const entrypoints = Array.isArray(subject.entrypoints) ? subject.entrypoints : []
    const licenseSources = Array.isArray(subject.license_sources) ? subject.license_sources : []
    const licenseScopes = Array.isArray(subject.license_scopes) ? subject.license_scopes : []
    if (!Array.isArray(subject.entrypoints)
      || !Array.isArray(subject.license_sources) || licenseSources.length === 0) {
      errors.push(`Subject ${subjectId} requires entrypoints and license_sources`)
    }
    if (!validWatchUrl(subject)) errors.push(`Subject ${subjectId} has invalid watch_url`)
    const entryPaths = new Set()
    for (const [index, entry] of entrypoints.entries()) {
      if (!isRecord(entry)) {
        errors.push(`Subject ${subjectId} entrypoint at index ${index} must be an object`)
        continue
      }
      if (!nonEmpty(entry.path) || !nonEmpty(entry.responsibility)) {
        errors.push(`Subject ${subjectId} has an incomplete entrypoint`)
      }
      if (!validRepositoryPath(entry.path)) {
        errors.push(`Subject ${subjectId} entrypoint at index ${index} has invalid repository path`)
      }
      const entryPath = display(entry.path)
      if (!Array.isArray(entry.symbols) || entry.symbols.length === 0) {
        errors.push(`Subject ${subjectId} entrypoint ${entryPath} requires non-empty symbols`)
      } else {
        if (!entry.symbols.every(nonEmpty)) {
          errors.push(`Subject ${subjectId} entrypoint ${entryPath} symbols must contain only non-empty strings`)
        }
        if (new Set(entry.symbols).size !== entry.symbols.length) {
          errors.push(`Subject ${subjectId} entrypoint ${entryPath} has duplicate symbols`)
        }
      }
      if (entryPaths.has(entry.path)) errors.push(`Subject ${subjectId} has duplicate entrypoint: ${entryPath}`)
      entryPaths.add(entry.path)
    }
    for (const [index, license] of licenseSources.entries()) {
      if (!isRecord(license)) {
        errors.push(`Subject ${subjectId} license source at index ${index} must be an object`)
        continue
      }
      if (!validRepositoryPath(license.path)) {
        errors.push(`Subject ${subjectId} license source at index ${index} has invalid repository path`)
      }
      if (!nonEmpty(license.path) || typeof license.sha256 !== 'string'
        || !/^[0-9a-f]{64}$/u.test(license.sha256)) {
        errors.push(`Subject ${subjectId} has an invalid license source`)
      }
    }

    const pathExpressions = new Map()
    for (const [index, scope] of licenseScopes.entries()) {
      if (!isRecord(scope)) {
        errors.push(`Subject ${subjectId} license scope at index ${index} must be an object`)
        continue
      }
      if (!['path', 'contribution'].includes(scope.basis)
        || !nonEmpty(scope.expression) || !nonEmpty(scope.scope) || !nonEmpty(scope.note)) {
        errors.push(`Subject ${subjectId} has an invalid license scope`)
        continue
      }
      if (scope.basis === 'path') {
        if (!nonEmpty(scope.path_or_glob) || Object.hasOwn(scope, 'selector')) {
          errors.push(`Subject ${subjectId} path license scope requires path_or_glob and forbids selector`)
        } else if (!validPathScope(scope.path_or_glob)) {
          errors.push(`Subject ${subjectId} has unsupported path license scope: ${scope.path_or_glob}`)
        } else {
          const previous = pathExpressions.get(scope.path_or_glob)
          if (previous && previous !== scope.expression) {
            errors.push(`Subject ${subjectId} has conflicting path license scopes for ${scope.path_or_glob}`)
          }
          pathExpressions.set(scope.path_or_glob, scope.expression)
        }
      } else if (!nonEmpty(scope.selector) || Object.hasOwn(scope, 'path_or_glob')) {
        errors.push(`Subject ${subjectId} contribution license scope requires selector and forbids path_or_glob`)
      }
    }
  }

  for (const chain of chains) {
    const chainId = display(chain.id)
    for (const field of ['id', 'page_item_id', 'label', 'reading_hint', 'misconception', 'steps']) {
      if (!Object.hasOwn(chain, field)) errors.push(`Chain ${chainId} is missing ${field}`)
    }
    for (const field of ['id', 'page_item_id', 'label', 'reading_hint', 'misconception']) {
      if (!nonEmpty(chain[field])) errors.push(`Chain ${chainId} requires non-empty ${field}`)
    }
    const page = pageById.get(chain.page_item_id)
    if (!page) errors.push(`Chain ${chainId} references unknown page: ${display(chain.page_item_id)}`)
    if (!Array.isArray(chain.steps) || chain.steps.length === 0) errors.push(`Chain ${chainId} requires non-empty steps`)
    const stepIds = new Set()
    const steps = Array.isArray(chain.steps) ? chain.steps : []
    for (const [index, step] of steps.entries()) {
      if (!isRecord(step)) {
        errors.push(`Chain ${chainId} step at index ${index} must be an object`)
        continue
      }
      const stepId = display(step.id)
      for (const field of ['id', 'label', 'subject_id', 'source_path', 'symbol', 'responsibility']) {
        if (!nonEmpty(step[field])) errors.push(`Chain ${chainId} step ${stepId} is missing ${field}`)
      }
      if (stepIds.has(step.id)) errors.push(`Chain ${chainId} has duplicate step ID: ${stepId}`)
      stepIds.add(step.id)
      const subject = subjectById.get(step.subject_id)
      if (!subject) {
        errors.push(`Chain ${chainId} step ${stepId} references unknown subject: ${display(step.subject_id)}`)
      } else {
        if (!Array.isArray(page?.subjects) || !page.subjects.includes(step.subject_id)) {
          errors.push(`Chain ${chainId} step ${stepId} subject is not owned by page: ${display(step.subject_id)}`)
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
          const reference = `${display(step.subject_id)}/${display(step.source_path)}${matchingPath ? `#${display(step.symbol)}` : ''}`
          errors.push(`Chain ${chainId} step ${stepId} references an undeclared entrypoint: ${reference}`)
        }
      }
    }
  }

  for (const [label, rows] of [['page', pages], ['subject', subjects], ['chain', chains]]) {
    const ids = rows.map((row) => label === 'page' ? row.page_item_id : row.id)
    if (new Set(ids).size !== ids.length) errors.push(`Project catalog has duplicate ${label} IDs`)
  }
  for (const subject of subjects.filter((item) => item.catalog_tier === 'watch-only')) {
    const subjectId = display(subject.id)
    const owners = pages
      .filter((page) => Array.isArray(page.subjects) && page.subjects.includes(subject.id))
      .map((page) => page.page_item_id)
    if (owners.length !== 1 || owners[0] !== 'projects-index') {
      errors.push(`Watch-only subject ${subjectId} must belong only to projects-index`)
    }
    if (!Array.isArray(subject.risk_tags) || subject.risk_tags.length === 0) {
      errors.push(`Watch-only subject ${subjectId} requires risk_tags`)
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
    const pageId = display(page.page_item_id)
    if (!contentIds.has(page.page_item_id)) {
      errors.push(`Project page is missing from contentRegistry: ${pageId}`)
    }
    for (const questionId of Array.isArray(page.interview_question_ids) ? page.interview_question_ids : []) {
      if (!questionIds.has(questionId)) {
        errors.push(`Project page ${pageId} references unknown interview question: ${display(questionId)}`)
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
