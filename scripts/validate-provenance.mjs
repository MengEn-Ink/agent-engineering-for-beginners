import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { parse } from 'yaml'
import { loadProjectCatalog } from './project-catalog.mjs'

const assetRoot = 'docs/public/project-assets'
const shaPattern = /^[0-9a-f]{40}$/u
const datePattern = /^\d{4}-\d{2}-\d{2}$/u
const requiredFields = [
  'local_file', 'origin', 'subject_id', 'source_url', 'source_repo', 'source_ref',
  'source_path', 'license', 'license_basis', 'manual_license_review',
  'manual_reviewed_by', 'manual_review_note', 'copyright_holder', 'modified',
  'used_by', 'alt', 'verified_at',
]

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function files(root) {
  if (!existsSync(root)) return []
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
}

function pathScopeMatches(path, pattern) {
  if (pattern === '**') return true
  if (pattern.endsWith('/**')) return path.startsWith(pattern.slice(0, -2))
  return path === pattern
}

function pathScopeSpecificity(pattern) {
  return pattern === '**' ? 0 : pattern.replace('/**', '').length
}

export function validateProvenanceFile(
  path,
  root = process.cwd(),
  catalog = null,
) {
  if (!existsSync(path)) return ['Missing assets/provenance.yml']
  let data
  try {
    data = parse(readFileSync(path, 'utf8'))
  } catch {
    return ['Asset provenance YAML cannot be parsed']
  }

  const errors = []
  const assets = Array.isArray(data?.assets) ? data.assets : []
  if (data?.schema_version !== 1) errors.push('Asset provenance schema_version must be 1')
  if (!Array.isArray(data?.assets)) errors.push('Asset provenance assets must be an array')

  let projectCatalog = catalog
  if (!projectCatalog) {
    try {
      projectCatalog = loadProjectCatalog(resolve(root, 'sources/project-index.yml'))
    } catch {
      return [...errors, 'Asset provenance cannot load a valid project catalog']
    }
  }

  const actual = files(resolve(root, assetRoot))
    .map((file) => relative(root, file).split(sep).join('/'))
  const counts = new Map()
  const subjects = Array.isArray(projectCatalog?.subjects) ? projectCatalog.subjects : []
  const pages = Array.isArray(projectCatalog?.pages) ? projectCatalog.pages : []
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]))
  const pageById = new Map(pages.map((page) => [page.page_item_id, page]))

  for (const [index, asset] of assets.entries()) {
    if (!isRecord(asset)) {
      errors.push(`Asset provenance entry ${index} must be an object`)
      continue
    }
    for (const field of requiredFields) {
      if (!Object.hasOwn(asset, field)) errors.push(`Asset ${asset.local_file ?? '<unknown>'} is missing ${field}`)
    }
    if (!['original', 'third-party'].includes(asset.origin)) {
      errors.push(`Asset ${asset.local_file} has invalid origin`)
    }
    if (typeof asset.local_file !== 'string'
      || !asset.local_file.startsWith(`${assetRoot}/`)
      || asset.local_file.includes('..')) {
      errors.push(`Asset path must stay inside ${assetRoot}: ${asset.local_file}`)
    }
    if (!Array.isArray(asset.used_by) || asset.used_by.length === 0) {
      errors.push(`Asset ${asset.local_file} requires used_by`)
    }
    if (!datePattern.test(asset.verified_at ?? '')) {
      errors.push(`Asset ${asset.local_file} has invalid verified_at`)
    }
    if (typeof asset.modified !== 'boolean') {
      errors.push(`Asset ${asset.local_file} requires boolean modified`)
    }
    counts.set(asset.local_file, (counts.get(asset.local_file) ?? 0) + 1)
    if (!actual.includes(asset.local_file)) {
      errors.push(`Provenance record points to a missing file: ${asset.local_file}`)
    }

    if (asset.origin !== 'third-party') continue

    if (!shaPattern.test(asset.source_ref ?? '')) {
      errors.push(`Third-party asset must use a 40-character source_ref: ${asset.local_file}`)
    }
    let sourceUrl = null
    try {
      sourceUrl = new URL(asset.source_url)
    } catch {}
    if (!sourceUrl || sourceUrl.protocol !== 'https:' || sourceUrl.hostname !== 'github.com'
      || sourceUrl.port || sourceUrl.username || sourceUrl.password) {
      errors.push(`Third-party asset URL must use https://github.com: ${asset.local_file}`)
    }

    const subject = subjectById.get(asset.subject_id)
    if (!subject || subject.canonical_repo !== asset.source_repo) {
      errors.push(`Third-party asset source_repo does not match subject: ${asset.local_file}`)
    }
    if (subject && subject.pinned_commit !== asset.source_ref) {
      errors.push(`Third-party asset source_ref does not match subject pin: ${asset.local_file}`)
    }
    const expectedPath = `/${asset.source_repo}/blob/${asset.source_ref}/${asset.source_path}`
    if (!sourceUrl || sourceUrl.pathname !== expectedPath || sourceUrl.search || sourceUrl.hash) {
      errors.push(`Third-party asset URL does not match repo/ref/path: ${asset.local_file}`)
    }
    for (const field of ['source_repo', 'source_path', 'license', 'copyright_holder', 'alt']) {
      if (typeof asset[field] !== 'string' || asset[field].trim() === '') {
        errors.push(`Third-party asset ${asset.local_file} requires ${field}`)
      }
    }
    for (const pageId of Array.isArray(asset.used_by) ? asset.used_by : []) {
      if (!pageById.get(pageId)?.subjects?.includes(asset.subject_id)) {
        errors.push(`Third-party asset subject is not owned by page ${pageId}: ${asset.local_file}`)
      }
    }

    const licenseScopes = Array.isArray(subject?.license_scopes) ? subject.license_scopes : []
    if (subject && asset.license_basis === 'path') {
      const scopes = licenseScopes
        .filter((scope) => scope.basis === 'path'
          && pathScopeMatches(asset.source_path, scope.path_or_glob))
        .sort((a, b) => pathScopeSpecificity(b.path_or_glob) - pathScopeSpecificity(a.path_or_glob))
      if (scopes.length === 0 || scopes[0].expression !== asset.license) {
        errors.push(`Third-party asset license does not match the most specific path scope: ${asset.local_file}`)
      }
    } else if (subject && asset.license_basis === 'contribution') {
      const scope = licenseScopes.find((candidate) =>
        candidate.basis === 'contribution'
        && candidate.expression === asset.license
        && candidate.selector === asset.license_selector,
      )
      if (!scope || asset.manual_license_review !== true
        || typeof asset.manual_reviewed_by !== 'string' || asset.manual_reviewed_by.trim() === ''
        || typeof asset.manual_review_note !== 'string' || asset.manual_review_note.trim() === '') {
        errors.push(`Contribution-based asset requires recorded human review: ${asset.local_file}`)
      }
    } else {
      errors.push(`Third-party asset has invalid license_basis: ${asset.local_file}`)
    }
  }

  for (const file of actual) {
    if (!counts.has(file)) errors.push(`Unregistered project asset: ${file}`)
    if ((counts.get(file) ?? 0) > 1) errors.push(`Duplicate project asset record: ${file}`)
  }
  for (const [file, count] of counts) {
    if (count > 1 && !actual.includes(file)) errors.push(`Duplicate project asset record: ${file}`)
  }
  return errors
}
