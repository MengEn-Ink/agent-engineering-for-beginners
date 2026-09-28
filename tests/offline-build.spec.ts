import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  buildOfflineBundle,
  collectOfflineFiles,
  createServiceWorkerSource,
} from '../scripts/build-offline.mjs'

const temporaryDirectories: string[] = []

function createDist() {
  const directory = mkdtempSync(join(tmpdir(), 'agent-book-offline-'))
  temporaryDirectories.push(directory)
  mkdirSync(join(directory, 'chapters'))
  mkdirSync(join(directory, 'assets'))
  writeFileSync(join(directory, 'index.html'), '<h1>Book</h1>')
  writeFileSync(join(directory, 'chapters', '01.html'), '<h1>Chapter 1</h1>')
  writeFileSync(join(directory, 'assets', 'app.js'), 'console.log("book")')
  return directory
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('offline book bundle', () => {
  it('collects every built file in stable order and excludes generated outputs', () => {
    const directory = createDist()
    writeFileSync(join(directory, 'sw.js'), 'old worker')
    writeFileSync(join(directory, 'offline-manifest.json'), '{}')

    expect(collectOfflineFiles(directory).map((file) => file.path)).toEqual([
      'assets/app.js',
      'chapters/01.html',
      'index.html',
    ])
  })

  it('generates a versioned full-book cache under the GitHub Pages base path', () => {
    const directory = createDist()
    const manifest = buildOfflineBundle(directory, '/agent-engineering-for-beginners/')
    const worker = readFileSync(join(directory, 'sw.js'), 'utf8')

    expect(manifest).toMatchObject({ fileCount: 3 })
    expect(manifest.totalBytes).toBeGreaterThan(0)
    expect(manifest.version).toMatch(/^[0-9a-f]{12}$/)
    expect(worker).toContain(`const CACHE_NAME = "agent-book-${manifest.version}"`)
    expect(worker).toContain('"/agent-engineering-for-beginners/chapters/01.html"')
    expect(worker).toContain('"/agent-engineering-for-beginners/offline-manifest.json"')
    expect(worker).toContain("event.request.mode === 'navigate'")
    expect(worker).toContain("key.startsWith('agent-book-')")
  })

  it('deletes a partial cache when any precache request fails', () => {
    const worker = createServiceWorkerSource({
      base: '/book/',
      cacheName: 'agent-book-test',
      urls: ['/book/index.html'],
    })

    expect(worker).toContain('await caches.delete(CACHE_NAME)')
    expect(worker).toContain('throw error')
  })
})
