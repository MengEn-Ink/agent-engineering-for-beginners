import { describe, expect, it } from 'vitest'
import { interviewQuestions } from '../docs/.vitepress/theme/data/interviewQuestions'
import {
  buildTrainingQuery,
  chooseRandomQuestion,
  filterInterviewQuestions,
  loadInterviewMastery,
  parseTrainingQuery,
  saveInterviewMastery,
} from '../docs/.vitepress/theme/data/interviewTraining'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  }
}

describe('interview training helpers', () => {
  it('filters the existing registry by role, difficulty and topic', () => {
    const filtered = filterInterviewQuestions(interviewQuestions, {
      role: '工程',
      difficulty: '进阶',
      topic: 'MCP',
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('iq-04-b')
    expect(filterInterviewQuestions(interviewQuestions, {
      role: '全部',
      difficulty: '全部',
      topic: '全部',
    })).toHaveLength(42)
  })

  it('round-trips supported filters through a compact query string', () => {
    const filters = parseTrainingQuery('?role=%E5%B7%A5%E7%A8%8B&difficulty=%E8%BF%9B%E9%98%B6&topic=MCP')
    expect(filters).toEqual({ role: '工程', difficulty: '进阶', topic: 'MCP' })
    expect(buildTrainingQuery(filters)).toBe('role=%E5%B7%A5%E7%A8%8B&difficulty=%E8%BF%9B%E9%98%B6&topic=MCP')
    expect(parseTrainingQuery('?role=invalid&difficulty=invalid')).toEqual({
      role: '全部',
      difficulty: '全部',
      topic: '全部',
    })
  })

  it('draws from filtered questions without immediately repeating the current item', () => {
    const sample = interviewQuestions.slice(0, 3)
    expect(chooseRandomQuestion(sample, sample[0].id, () => 0)?.id).toBe(sample[1].id)
    expect(chooseRandomQuestion([sample[0]], sample[0].id, () => 0)?.id).toBe(sample[0].id)
    expect(chooseRandomQuestion([], null, () => 0)).toBeUndefined()
  })

  it('persists only valid local mastery values and tolerates corrupt data', () => {
    const storage = memoryStorage()
    expect(loadInterviewMastery(storage)).toEqual({})
    expect(saveInterviewMastery({ 'iq-01-a': 'mastered', 'iq-01-b': 'fuzzy' }, storage)).toBe(true)
    expect(loadInterviewMastery(storage)).toEqual({ 'iq-01-a': 'mastered', 'iq-01-b': 'fuzzy' })

    storage.setItem('agent-handbook:interview-mastery', '{broken')
    expect(loadInterviewMastery(storage)).toEqual({})
    storage.setItem('agent-handbook:interview-mastery', JSON.stringify({ a: 'mastered', b: 'invalid' }))
    expect(loadInterviewMastery(storage)).toEqual({ a: 'mastered' })
  })
})

