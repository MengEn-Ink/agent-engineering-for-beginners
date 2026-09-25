import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'yaml'

const forbiddenRules = [
  { label: '本机绝对路径', pattern: /\/Users\//g },
  { label: '会话 Cookie', pattern: /an_sso_session/gi },
  { label: '敏感环境变量', pattern: /E2E_[A-Z0-9_]*(?:SK|SECRET|COOKIE|TOKEN|KEY)/g },
  { label: '内部产品标识', pattern: /p-[a-z0-9]{16,}/gi },
]

export function findForbiddenMarkers(text) {
  return forbiddenRules.flatMap(({ label, pattern }) => {
    pattern.lastIndex = 0
    return Array.from(text.matchAll(pattern), (match) => ({ label, value: match[0] }))
  })
}

export function validateMarkdownFiles(files) {
  const errors = []

  for (const file of files) {
    const findings = findForbiddenMarkers(readFileSync(file, 'utf8'))
    for (const finding of findings) {
      errors.push(`${basename(file)}: 命中${finding.label}`)
    }
  }

  return errors
}

const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.mts',
  '.svg',
  '.ts',
  '.vue',
  '.yaml',
  '.yml',
])

export function collectTextFiles(root, excludedNames = new Set(['.git', 'node_modules', 'dist'])) {
  if (!existsSync(root)) return []
  const files = []

  for (const entry of readdirSync(root).sort()) {
    if (excludedNames.has(entry)) continue
    const path = join(root, entry)
    if (statSync(path).isDirectory()) files.push(...collectTextFiles(path, excludedNames))
    else if (textExtensions.has(extname(path))) files.push(path)
  }

  return files
}

export function validatePublishedFiles(root) {
  const docsRoot = join(root, 'docs')
  const publishedFiles = collectTextFiles(docsRoot, new Set(['superpowers', 'dist']))
  const extraScopes = [
    join(root, '.github'),
    join(root, 'sources'),
    join(root, 'package.json'),
    join(root, 'README.md'),
  ]

  for (const scope of extraScopes) {
    if (!existsSync(scope)) continue
    if (statSync(scope).isDirectory()) publishedFiles.push(...collectTextFiles(scope))
    else publishedFiles.push(scope)
  }

  return validateMarkdownFiles([...new Set(publishedFiles)].sort())
}

export function validateSourceRegistry(sourcePath) {
  if (!existsSync(sourcePath)) return ['缺少 sources/source-index.yml']

  let data
  try {
    data = parse(readFileSync(sourcePath, 'utf8'))
  } catch {
    return ['来源索引 YAML 无法解析']
  }
  const defaults = data?.source_defaults ?? {}
  const sources = Array.isArray(data?.sources)
    ? data.sources.map((source) => ({ ...defaults, ...source }))
    : []
  const requiredScalars = [
    'id',
    'title',
    'publisher',
    'url',
    'grade',
    'accessed',
    'version',
    'last_verified',
    'review_by',
    'status',
    'note',
  ]
  const errors = []
  const ids = new Set()
  const isValidDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  }

  if (data?.schema_version !== 2) errors.push('来源索引 schema_version 必须为 2')
  if (sources.length < 15) errors.push('来源索引至少需要 15 条记录')

  for (const [index, source] of sources.entries()) {
    for (const field of requiredScalars) {
      if (typeof source?.[field] !== 'string' || source[field].trim() === '') {
        errors.push(`来源 ${index + 1} 的字段 ${field} 必须为非空字符串`)
      }
    }
    if (source?.replaced_by === undefined) errors.push(`来源 ${index + 1} 缺少字段 replaced_by`)
    if (source?.impact_chapters === undefined) errors.push(`来源 ${index + 1} 缺少字段 impact_chapters`)
    if (!['A', 'B', 'C'].includes(source?.grade)) errors.push(`来源 ${source?.id} 的 grade 无效`)
    if (!/^https:\/\//.test(source?.url ?? '')) errors.push(`来源 ${source?.id} 不是 HTTPS URL`)
    if (!isValidDate(source?.accessed)) {
      errors.push(`来源 ${source?.id} 的 accessed 无效`)
    }
    if (!isValidDate(source?.last_verified)) {
      errors.push(`来源 ${source?.id} 的 last_verified 无效`)
    }
    if (!isValidDate(source?.review_by)) {
      errors.push(`来源 ${source?.id} 的 review_by 无效`)
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(source?.last_verified ?? '')
      && /^\d{4}-\d{2}-\d{2}$/.test(source?.review_by ?? '')
      && source.review_by < source.last_verified) {
      errors.push(`来源 ${source?.id} 的 review_by 不能早于 last_verified`)
    }
    if (!['active', 'watch', 'deprecated', 'broken'].includes(source?.status)) {
      errors.push(`来源 ${source?.id} 的 status 无效`)
    }
    if (!Array.isArray(source?.impact_chapters)) {
      errors.push(`来源 ${source?.id} 的 impact_chapters 必须为数组`)
    }
    if (source?.replaced_by !== null && typeof source?.replaced_by !== 'string') {
      errors.push(`来源 ${source?.id} 的 replaced_by 必须为字符串或 null`)
    }
    if (source?.watch_url && !/^https:\/\//.test(source.watch_url)) {
      errors.push(`来源 ${source?.id} 的 watch_url 不是 HTTPS URL`)
    }
    if (ids.has(source?.id)) errors.push(`来源 ID 重复：${source?.id}`)
    ids.add(source?.id)
  }

  for (const source of sources) {
    if (typeof source?.replaced_by === 'string' && !ids.has(source.replaced_by)) {
      errors.push(`来源 ${source?.id} 的 replaced_by 引用不存在：${source.replaced_by}`)
    }
    if (source?.replaced_by === source?.id) {
      errors.push(`来源 ${source?.id} 不能用自己作为 replaced_by`)
    }
  }

  const replacementById = new Map(
    sources
      .filter((source) => typeof source?.id === 'string' && typeof source?.replaced_by === 'string')
      .map((source) => [source.id, source.replaced_by]),
  )
  const reportedCycles = new Set()
  for (const start of replacementById.keys()) {
    const path = []
    const positions = new Map()
    let current = start
    while (replacementById.has(current)) {
      if (positions.has(current)) {
        const cycle = path.slice(positions.get(current))
        if (cycle.length > 1) {
          const key = [...cycle].sort().join('|')
          if (!reportedCycles.has(key)) {
            errors.push(`来源 replaced_by 形成循环：${[...cycle, current].join(' -> ')}`)
            reportedCycles.add(key)
          }
        }
        break
      }
      positions.set(current, path.length)
      path.push(current)
      current = replacementById.get(current)
    }
  }

  return errors
}

export function validateBook(root = process.cwd()) {
  const sourcePath = join(root, 'sources/source-index.yml')
  return [...validateSourceRegistry(sourcePath), ...validatePublishedFiles(root)]
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath && pathToFileURL(invokedPath).href === import.meta.url) {
  const errors = validateBook()
  if (errors.length > 0) {
    for (const error of errors) console.error(`- ${error}`)
    process.exitCode = 1
  } else {
    console.log('content validation passed')
  }
}
