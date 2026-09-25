import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

export const previewBase = '/agent-engineering-for-beginners/'

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

export function resolvePreviewPath(requestPath, distRoot) {
  let pathname
  try {
    pathname = decodeURIComponent(requestPath.split('?')[0])
  } catch {
    return null
  }

  if (!pathname.startsWith(previewBase)) return null
  const relativePath = pathname.slice(previewBase.length)
  const distPath = resolve(distRoot)
  const isInsideDist = (candidate) => candidate === distPath || candidate.startsWith(`${distPath}${sep}`)
  const relativeTarget = resolve(distPath, relativePath)
  if (!isInsideDist(relativeTarget)) return null

  const hasExtension = extname(relativePath) !== ''
  if (relativePath !== '' && !hasExtension) {
    const cleanPath = relativePath.replace(/\/$/u, '')
    const cleanUrlFile = resolve(distPath, `${cleanPath}.html`)
    const directoryIndex = resolve(distPath, cleanPath, 'index.html')
    const candidates = relativePath.endsWith('/')
      ? [directoryIndex, cleanUrlFile]
      : [cleanUrlFile, directoryIndex]
    if (candidates.some((candidate) => !isInsideDist(candidate))) return null
    return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0]
  }

  const requestedFile = relativePath === ''
    ? 'index.html'
    : relativePath
  const candidate = resolve(distPath, requestedFile)

  if (!isInsideDist(candidate)) return null
  return candidate
}

function optionValue(name, fallback) {
  const index = process.argv.indexOf(name)
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback
}

export function startPreview({
  distRoot = resolve('docs/.vitepress/dist'),
  host = optionValue('--host', '127.0.0.1'),
  port = Number(optionValue('--port', '4173')),
} = {}) {
  if (!existsSync(join(distRoot, 'index.html'))) {
    throw new Error('缺少构建产物，请先运行 pnpm build')
  }

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? host}`)
    if (url.pathname === '/' || url.pathname === previewBase.slice(0, -1)) {
      response.writeHead(302, { Location: previewBase })
      response.end()
      return
    }

    const file = resolvePreviewPath(url.pathname, distRoot)
    const target = file && existsSync(file) && statSync(file).isFile()
      ? file
      : join(distRoot, '404.html')
    const status = target === file ? 200 : 404

    response.writeHead(status, {
      'Cache-Control': 'no-cache',
      'Content-Type': mimeTypes[extname(target)] ?? 'application/octet-stream',
    })
    createReadStream(target).pipe(response)
  })

  server.listen(port, host, () => {
    console.log(`Built site served at http://${host}:${port}${previewBase}`)
  })
  return server
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath && pathToFileURL(invokedPath).href === import.meta.url) {
  startPreview()
}
