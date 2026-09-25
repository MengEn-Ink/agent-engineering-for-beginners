import type { ReadingPath } from './readingPaths'

export const learningStorageKeys = {
  path: 'agent-handbook:path',
  progress: 'agent-handbook:progress',
  bookmarks: 'agent-handbook:bookmarks',
} as const

export const learningStateEvent = 'agent-handbook:learning-state'

export interface LearningState {
  selectedPath: ReadingPath['id']
  completed: string[]
  bookmarks: string[]
}

export type CourseProgressRead =
  | { status: 'available'; completed: string[] }
  | { status: 'corrupt'; completed: null }
  | { status: 'blocked'; completed: null }

export interface ReadOnlyStorage {
  getItem(key: string): string | null
}

export function emptyLearningState(): LearningState {
  return { selectedPath: 'beginner', completed: [], bookmarks: [] }
}

function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function parseList(raw: string | null): string[] {
  if (!raw) return []
  try {
    const value = JSON.parse(raw)
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function loadLearningState(storage = browserStorage()): LearningState {
  if (!storage) return emptyLearningState()
  try {
    const selected = storage.getItem(learningStorageKeys.path)
    const selectedPath = ['beginner', 'engineering', 'interview'].includes(selected ?? '')
      ? (selected as ReadingPath['id'])
      : 'beginner'
    return {
      selectedPath,
      completed: parseList(storage.getItem(learningStorageKeys.progress)),
      bookmarks: parseList(storage.getItem(learningStorageKeys.bookmarks)),
    }
  } catch {
    return emptyLearningState()
  }
}

export function saveLearningState(state: LearningState, storage = browserStorage()): boolean {
  if (!storage) return false
  try {
    storage.setItem(learningStorageKeys.path, state.selectedPath)
    storage.setItem(learningStorageKeys.progress, JSON.stringify([...new Set(state.completed)]))
    storage.setItem(learningStorageKeys.bookmarks, JSON.stringify([...new Set(state.bookmarks)]))
    return true
  } catch {
    return false
  }
}

export function announceLearningState(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(learningStateEvent))
}

export function clearLearningState(storage = browserStorage()): boolean {
  if (!storage) return false
  try {
    Object.values(learningStorageKeys).forEach((key) => storage.removeItem(key))
    announceLearningState()
    return true
  } catch {
    return false
  }
}

export function normalizeCourseRoute(
  raw: string,
  origin = typeof window === 'undefined' ? 'https://mengen-ink.github.io' : window.location.origin,
  base = '/agent-engineering-for-beginners',
): string | null {
  try {
    const expectedOrigin = new URL(origin).origin
    const url = new URL(raw, `${expectedOrigin}/`)
    if (url.origin !== expectedOrigin) return null

    let path = decodeURIComponent(url.pathname).replace(/\/{2,}/gu, '/')
    const normalizedBase = `/${base.replace(/^\/+|\/+$/gu, '')}`
    if (path === normalizedBase) path = '/'
    else if (path.startsWith(`${normalizedBase}/`)) path = path.slice(normalizedBase.length)
    path = path.replace(/\/index(?:\.html)?\/?$/u, '/')
    path = path.replace(/\.html$/u, '')
    if (path !== '/') path = path.replace(/\/$/u, '')
    return path || '/'
  } catch {
    return null
  }
}

// Preserve the existing string-returning API until Tasks 4 and 6 migrate
// current consumers to registry IDs and nullable course normalization.
export function normalizeLearningPath(path: string): string {
  return normalizeCourseRoute(path) ?? path
}

export function readCourseProgress(
  storage: ReadOnlyStorage | null = browserStorage(),
): CourseProgressRead {
  if (!storage) return { status: 'blocked', completed: null }
  let raw: string | null
  try {
    raw = storage.getItem(learningStorageKeys.progress)
  } catch {
    return { status: 'blocked', completed: null }
  }
  if (raw === null) return { status: 'available', completed: [] }
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
      return { status: 'corrupt', completed: null }
    }
    return { status: 'available', completed: parsed }
  } catch {
    return { status: 'corrupt', completed: null }
  }
}

