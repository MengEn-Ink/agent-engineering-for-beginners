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

export function normalizeLearningPath(path: string): string {
  const withoutBase = path.replace(/^\/agent-engineering-for-beginners/u, '')
  const withoutQuery = withoutBase.split(/[?#]/u)[0].replace(/\.html$/u, '')
  if (withoutQuery === '/') return '/'
  return withoutQuery.replace(/\/$/u, '')
}

