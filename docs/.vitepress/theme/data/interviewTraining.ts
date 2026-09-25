import {
  interviewQuestions,
  type InterviewDifficulty,
  type InterviewQuestion,
  type InterviewRole,
} from './interviewQuestions'

export type InterviewMastery = 'unknown' | 'fuzzy' | 'mastered'
export type FilterValue<T extends string> = T | '全部'

export interface InterviewFilters {
  role: FilterValue<InterviewRole>
  difficulty: FilterValue<InterviewDifficulty>
  topic: string
}

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): unknown
  removeItem(key: string): unknown
}

export const defaultInterviewFilters: InterviewFilters = {
  role: '全部',
  difficulty: '全部',
  topic: '全部',
}

export const interviewTopics = [...new Set(interviewQuestions.map((item) => item.topic))]
export const interviewMasteryKey = 'agent-handbook:interview-mastery'

export function filterInterviewQuestions(
  questions: InterviewQuestion[],
  filters: InterviewFilters,
): InterviewQuestion[] {
  return questions.filter((question) =>
    (filters.role === '全部' || question.role === filters.role)
    && (filters.difficulty === '全部' || question.difficulty === filters.difficulty)
    && (filters.topic === '全部' || question.topic === filters.topic),
  )
}

export function parseTrainingQuery(search: string): InterviewFilters {
  const params = new URLSearchParams(search)
  const role = params.get('role')
  const difficulty = params.get('difficulty')
  const topic = params.get('topic')
  return {
    role: role === '工程' || role === '产品' ? role : '全部',
    difficulty: difficulty === '基础' || difficulty === '进阶' || difficulty === '系统设计'
      ? difficulty
      : '全部',
    topic: topic && interviewTopics.includes(topic) ? topic : '全部',
  }
}

export function buildTrainingQuery(filters: InterviewFilters): string {
  const params = new URLSearchParams()
  if (filters.role !== '全部') params.set('role', filters.role)
  if (filters.difficulty !== '全部') params.set('difficulty', filters.difficulty)
  if (filters.topic !== '全部') params.set('topic', filters.topic)
  return params.toString()
}

export function questionFromHash(
  hash: string,
  questions: InterviewQuestion[],
): InterviewQuestion | undefined {
  try {
    const id = decodeURIComponent(hash.replace(/^#/u, ''))
    return questions.find((question) => question.id === id)
  } catch {
    return undefined
  }
}

export function chooseRandomQuestion<T extends { id: string }>(
  questions: T[],
  currentId: string | null,
  random = Math.random,
): T | undefined {
  if (questions.length === 0) return undefined
  const candidates = questions.length > 1
    ? questions.filter((question) => question.id !== currentId)
    : questions
  const index = Math.min(Math.floor(random() * candidates.length), candidates.length - 1)
  return candidates[index]
}

function browserStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function loadInterviewMastery(
  storage: StorageLike | null = browserStorage(),
): Record<string, InterviewMastery> {
  if (!storage) return {}
  try {
    const parsed = JSON.parse(storage.getItem(interviewMasteryKey) ?? '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, InterviewMastery] =>
        ['unknown', 'fuzzy', 'mastered'].includes(String(entry[1])),
      ),
    )
  } catch {
    return {}
  }
}

export function saveInterviewMastery(
  mastery: Record<string, InterviewMastery>,
  storage: StorageLike | null = browserStorage(),
): boolean {
  if (!storage) return false
  try {
    storage.setItem(interviewMasteryKey, JSON.stringify(mastery))
    return true
  } catch {
    return false
  }
}

export function clearInterviewMastery(storage: StorageLike | null = browserStorage()): boolean {
  if (!storage) return false
  try {
    storage.removeItem(interviewMasteryKey)
    return true
  } catch {
    return false
  }
}

