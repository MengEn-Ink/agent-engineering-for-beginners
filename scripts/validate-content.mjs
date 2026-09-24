import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
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

export function validateSourceRegistry(sourcePath) {
  if (!existsSync(sourcePath)) return ['缺少 sources/source-index.yml']

  const data = parse(readFileSync(sourcePath, 'utf8'))
  const sources = Array.isArray(data?.sources) ? data.sources : []
  const required = ['id', 'title', 'publisher', 'url', 'grade', 'accessed', 'chapters', 'note']
  const errors = []
  const ids = new Set()

  if (sources.length < 15) errors.push('来源索引至少需要 15 条记录')

  for (const [index, source] of sources.entries()) {
    for (const field of required) {
      if (source?.[field] === undefined || source?.[field] === '') {
        errors.push(`来源 ${index + 1} 缺少字段 ${field}`)
      }
    }
    if (!['A', 'B', 'C'].includes(source?.grade)) errors.push(`来源 ${source?.id} 的 grade 无效`)
    if (!/^https:\/\//.test(source?.url ?? '')) errors.push(`来源 ${source?.id} 不是 HTTPS URL`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source?.accessed ?? '')) {
      errors.push(`来源 ${source?.id} 的 accessed 无效`)
    }
    if (!Array.isArray(source?.chapters)) errors.push(`来源 ${source?.id} 的 chapters 必须为数组`)
    if (ids.has(source?.id)) errors.push(`来源 ID 重复：${source?.id}`)
    ids.add(source?.id)
  }

  return errors
}

function listMarkdownFiles(root) {
  if (!existsSync(root)) return []
  const files = []

  for (const entry of readdirSync(root)) {
    if (entry === '.vitepress' || entry === 'superpowers') continue
    const path = join(root, entry)
    if (statSync(path).isDirectory()) files.push(...listMarkdownFiles(path))
    else if (path.endsWith('.md')) files.push(path)
  }

  return files
}

export function validateBook(root = process.cwd()) {
  const sourcePath = join(root, 'sources/source-index.yml')
  const markdownFiles = listMarkdownFiles(join(root, 'docs'))
  return [...validateSourceRegistry(sourcePath), ...validateMarkdownFiles(markdownFiles)]
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
