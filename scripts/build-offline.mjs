import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const generatedFiles = new Set(['offline-manifest.json', 'sw.js'])

function normalizeBase(base) {
  const value = `/${String(base).replace(/^\/+|\/+$/g, '')}/`
  return value === '//' ? '/' : value
}

export function collectOfflineFiles(distPath) {
  const files = []
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = join(directory, entry.name)
      if (entry.isDirectory()) visit(absolutePath)
      if (!entry.isFile()) continue
      const outputPath = relative(distPath, absolutePath).split(sep).join('/')
      if (generatedFiles.has(outputPath)) continue
      const content = readFileSync(absolutePath)
      files.push({ path: outputPath, bytes: content.byteLength, content })
    }
  }
  visit(distPath)
  return files.sort((left, right) => left.path.localeCompare(right.path))
}

export function createServiceWorkerSource({ base, cacheName, urls }) {
  return `const CACHE_NAME = ${JSON.stringify(cacheName)}\nconst BASE = ${JSON.stringify(base)}\nconst PRECACHE_URLS = ${JSON.stringify(urls)}\n\nself.addEventListener('install', (event) => {\n  event.waitUntil((async () => {\n    const cache = await caches.open(CACHE_NAME)\n    try {\n      for (let index = 0; index < PRECACHE_URLS.length; index += 40) {\n        await cache.addAll(PRECACHE_URLS.slice(index, index + 40))\n      }\n      await self.skipWaiting()\n    } catch (error) {\n      await caches.delete(CACHE_NAME)\n      throw error\n    }\n  })())\n})\n\nself.addEventListener('activate', (event) => {\n  event.waitUntil((async () => {\n    const keys = await caches.keys()\n    await Promise.all(keys.filter((key) => key.startsWith('agent-book-') && key !== CACHE_NAME).map((key) => caches.delete(key)))\n    await self.clients.claim()\n  })())\n})\n\nself.addEventListener('fetch', (event) => {\n  if (event.request.method !== 'GET') return\n  const requestUrl = new URL(event.request.url)\n  if (requestUrl.origin !== self.location.origin || !requestUrl.pathname.startsWith(BASE)) return\n  event.respondWith((async () => {\n    const cached = await caches.match(event.request, { ignoreSearch: true })\n    if (cached) return cached\n    if (event.request.mode === 'navigate') {\n      const relativePath = requestUrl.pathname.slice(BASE.length).replace(/\\/$/, '')\n      const candidates = relativePath\n        ? [BASE + relativePath + '.html', BASE + relativePath + '/index.html']\n        : [BASE + 'index.html']\n      for (const candidate of candidates) {\n        const page = await caches.match(candidate, { ignoreSearch: true })\n        if (page) return page\n      }\n    }\n    return fetch(event.request)\n  })())\n})\n`
}

export function buildOfflineBundle(distPath, requestedBase) {
  if (!existsSync(distPath) || !statSync(distPath).isDirectory()) {
    throw new Error(`构建目录不存在：${distPath}`)
  }
  const base = normalizeBase(requestedBase)
  const files = collectOfflineFiles(distPath)
  const digest = createHash('sha256')
  for (const file of files) {
    digest.update(file.path)
    digest.update(file.content)
  }
  const version = digest.digest('hex').slice(0, 12)
  const urls = files.map((file) => `${base}${file.path}`)
  const manifest = {
    version,
    generatedAt: new Date().toISOString(),
    fileCount: files.length,
    totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  }
  writeFileSync(join(distPath, 'offline-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  writeFileSync(join(distPath, 'sw.js'), createServiceWorkerSource({
    base,
    cacheName: `agent-book-${version}`,
    urls: [...urls, `${base}offline-manifest.json`],
  }))
  return manifest
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath && pathToFileURL(invokedPath).href === import.meta.url) {
  const distPath = resolve(process.argv[2] ?? 'docs/.vitepress/dist')
  const manifest = buildOfflineBundle(distPath, process.argv[3] ?? '/')
  console.log(`offline bundle ready: ${manifest.fileCount} files, ${manifest.totalBytes} bytes, ${manifest.version}`)
}
