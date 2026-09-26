import { existsSync, lstatSync, readFileSync, realpathSync, readdirSync } from 'node:fs'
import { isAbsolute, join, posix, relative, resolve, sep } from 'node:path'
import { parse } from 'yaml'
import { loadProjectCatalog } from './project-catalog.mjs'

const assetRoot = 'docs/public/project-assets'
const shaPattern = /^[0-9a-f]{40}$/u
const datePattern = /^\d{4}-\d{2}-\d{2}$/u
const requiredFields = [
  'local_file', 'origin', 'license', 'manual_license_review', 'copyright_holder',
  'modified', 'used_by', 'alt', 'verified_at',
]
const thirdPartyRequiredFields = [
  'subject_id', 'source_url', 'source_repo', 'source_ref', 'source_path',
  'license_basis', 'manual_reviewed_by', 'manual_review_note',
]
const originalForbiddenFields = [
  'subject_id', 'source_url', 'source_repo', 'source_ref', 'source_path',
  'license_basis', 'license_selector', 'manual_reviewed_by', 'manual_review_note',
]

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidDate(value) {
  if (typeof value !== 'string' || !datePattern.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function projectAssetFiles(root, projectRoot) {
  if (!existsSync(root)) return { files: [], errors: [] }
  const files = []
  const errors = []
  const displayPath = (path) => relative(projectRoot, path).split(sep).join('/')
  const rootStat = lstatSync(root)
  if (rootStat.isSymbolicLink()) {
    return {
      files,
      errors: [`Project asset path must not be a symbolic link: ${displayPath(root)}`],
    }
  }
  if (!rootStat.isDirectory()) {
    return { files, errors: [`Project asset root must be a directory: ${displayPath(root)}`] }
  }
  const realRoot = realpathSync(root)

  function visit(directory) {
    for (const entry of readdirSync(directory).sort()) {
      const path = join(directory, entry)
      const localPath = displayPath(path)
      const stat = lstatSync(path)
      if (stat.isSymbolicLink()) {
        errors.push(`Project asset path must not be a symbolic link: ${localPath}`)
        continue
      }
      const realPath = realpathSync(path)
      const relativeRealPath = relative(realRoot, realPath)
      if (relativeRealPath === '..' || relativeRealPath.startsWith(`..${sep}`)
        || isAbsolute(relativeRealPath)) {
        errors.push(`Project asset path resolves outside ${assetRoot}: ${localPath}`)
        continue
      }
      if (stat.isDirectory()) visit(path)
      else files.push(path)
    }
  }

  visit(root)
  return { files, errors }
}

function pathScopeMatches(path, pattern) {
  if (pattern === '**') return true
  if (pattern.endsWith('/**')) return path.startsWith(pattern.slice(0, -2))
  return path === pattern
}

function pathScopeSpecificity(pattern) {
  return pattern === '**' ? 0 : pattern.replace('/**', '').length
}

function isCanonicalRepoPath(path) {
  if (typeof path !== 'string' || path === '' || path.includes('\0') || path.includes('\\')) return false
  if (path.startsWith('/') || /^[a-z]:/iu.test(path) || path.endsWith('/')) return false
  if (/%(?:00|25|2f|5c)/iu.test(path)) return false
  if (path.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')) return false
  return posix.normalize(path) === path
}

function encodeRepoPath(path) {
  return path.split('/').map((segment) => encodeURIComponent(segment)).join('/')
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

  const assetTree = projectAssetFiles(resolve(root, assetRoot), resolve(root))
  errors.push(...assetTree.errors)
  const actual = assetTree.files.map((file) => relative(root, file).split(sep).join('/'))
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
    } else {
      const validPageIds = asset.used_by.filter((pageId) =>
        typeof pageId === 'string' && pageId.trim() !== '')
      if (validPageIds.length !== asset.used_by.length) {
        errors.push(`Asset ${asset.local_file} used_by must contain only non-empty string project page IDs`)
      }
      const seenPageIds = new Set()
      for (const pageId of validPageIds) {
        if (seenPageIds.has(pageId)) {
          errors.push(`Asset ${asset.local_file} has duplicate used_by page ID: ${pageId}`)
        }
        seenPageIds.add(pageId)
        if (!pageById.has(pageId)) {
          errors.push(`Asset ${asset.local_file} references unknown project page: ${pageId}`)
        }
      }
    }
    if (!isValidDate(asset.verified_at)) {
      errors.push(`Asset ${asset.local_file} has invalid verified_at`)
    }
    if (typeof asset.modified !== 'boolean') {
      errors.push(`Asset ${asset.local_file} requires boolean modified`)
    }
    if (typeof asset.manual_license_review !== 'boolean') {
      errors.push(`Asset ${asset.local_file} requires boolean manual_license_review`)
    }
    for (const field of ['license', 'copyright_holder', 'alt']) {
      if (typeof asset[field] !== 'string' || asset[field].trim() === '') {
        errors.push(`Asset ${asset.local_file} requires non-empty ${field}`)
      }
    }
    counts.set(asset.local_file, (counts.get(asset.local_file) ?? 0) + 1)
    if (!actual.includes(asset.local_file)) {
      errors.push(`Provenance record points to a missing file: ${asset.local_file}`)
    }

    if (asset.origin === 'original') {
      if (originalForbiddenFields.some((field) => asset[field] !== null && asset[field] !== undefined)) {
        errors.push(`Original asset must not declare third-party provenance fields: ${asset.local_file}`)
      }
      if (asset.manual_license_review !== false) {
        errors.push(`Original asset manual_license_review must be false: ${asset.local_file}`)
      }
      continue
    }
    if (asset.origin !== 'third-party') continue

    for (const field of thirdPartyRequiredFields) {
      if (!Object.hasOwn(asset, field)) errors.push(`Asset ${asset.local_file} is missing ${field}`)
    }

    const thirdPartyStrings = ['subject_id', 'source_url', 'source_repo', 'source_path']
    for (const field of thirdPartyStrings) {
      if (typeof asset[field] !== 'string' || asset[field].trim() === '') {
        errors.push(`Third-party asset ${asset.local_file} requires ${field}`)
      }
    }
    const sourceRefIsValid = typeof asset.source_ref === 'string' && shaPattern.test(asset.source_ref)
    if (!sourceRefIsValid) {
      errors.push(`Third-party asset must use a 40-character source_ref: ${asset.local_file}`)
    }
    const sourcePathIsCanonical = isCanonicalRepoPath(asset.source_path)
    if (typeof asset.source_path === 'string' && asset.source_path.trim() !== '' && !sourcePathIsCanonical) {
      errors.push(`Third-party asset has invalid source_path: ${asset.local_file}`)
    }
    let sourceUrl = null
    const sourceIdentityIsValid = thirdPartyStrings.every((field) =>
      typeof asset[field] === 'string' && asset[field].trim() !== '')
      && sourceRefIsValid
      && sourcePathIsCanonical
    if (sourceIdentityIsValid) {
      try {
        sourceUrl = new URL(asset.source_url)
      } catch {}
    }
    if (sourceIdentityIsValid
      && (!sourceUrl || sourceUrl.protocol !== 'https:' || sourceUrl.hostname !== 'github.com'
        || sourceUrl.port || sourceUrl.username || sourceUrl.password
        || !asset.source_url.startsWith('https://github.com/'))) {
      errors.push(`Third-party asset URL must use https://github.com: ${asset.local_file}`)
    }

    const subject = subjectById.get(asset.subject_id)
    if (!subject || subject.canonical_repo !== asset.source_repo) {
      errors.push(`Third-party asset source_repo does not match subject: ${asset.local_file}`)
    }
    if (subject && subject.pinned_commit !== asset.source_ref) {
      errors.push(`Third-party asset source_ref does not match subject pin: ${asset.local_file}`)
    }
    const expectedPath = sourceIdentityIsValid
      ? `/${asset.source_repo}/blob/${asset.source_ref}/${encodeRepoPath(asset.source_path)}`
      : null
    const expectedUrl = expectedPath ? `https://github.com${expectedPath}` : null
    if (sourceIdentityIsValid
      && (!sourceUrl || sourceUrl.pathname !== expectedPath || sourceUrl.search || sourceUrl.hash
        || asset.source_url !== expectedUrl)) {
      errors.push(`Third-party asset URL does not match repo/ref/path: ${asset.local_file}`)
    }
    for (const pageId of Array.isArray(asset.used_by) ? asset.used_by : []) {
      if (!pageById.get(pageId)?.subjects?.includes(asset.subject_id)) {
        errors.push(`Third-party asset subject is not owned by page ${pageId}: ${asset.local_file}`)
      }
    }

    const licenseScopes = Array.isArray(subject?.license_scopes) ? subject.license_scopes : []
    if (subject && asset.license_basis === 'path' && sourcePathIsCanonical) {
      const scopes = licenseScopes
        .filter((scope) => scope.basis === 'path'
          && pathScopeMatches(asset.source_path, scope.path_or_glob))
        .sort((a, b) => pathScopeSpecificity(b.path_or_glob) - pathScopeSpecificity(a.path_or_glob))
      if (scopes.length === 0 || scopes[0].expression !== asset.license) {
        errors.push(`Third-party asset license does not match the most specific path scope: ${asset.local_file}`)
      }
    } else if (subject && asset.license_basis === 'contribution' && sourcePathIsCanonical) {
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
    } else if (sourcePathIsCanonical) {
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
