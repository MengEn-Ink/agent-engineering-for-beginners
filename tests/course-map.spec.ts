import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import {
  contentItems,
  getContentItem,
  navigationItem,
} from '../docs/.vitepress/theme/data/contentRegistry'

const expectedIds = [
  'course', 'paths', 'preface',
  'chapter-01-ai-native', 'chapter-02-workflow-agent', 'chapter-03-react',
  'chapter-04-tools-mcp', 'chapter-05-state-memory', 'chapter-06-loop-graph',
  'chapter-07-multi-agent', 'chapter-08-evaluation', 'chapter-09-safety-recovery',
  'chapter-10-production', 'chapter-11-research-agent',
  'chapter-12-service-operations-agent', 'chapter-13-coding-agent',
  'chapter-14-computer-use', 'frontier-context-engineering',
  'frontier-interoperability-identity', 'frontier-durable-execution',
  'frontier-agent-security-evaluation', 'case-delivery-agent', 'radar',
  'radar-2026-09', 'appendix-glossary', 'appendix-review-checklist',
  'appendix-reading', 'appendix-application-matrix', 'appendix-chapter-template',
  'appendix-interview', 'appendix-interview-training',
]

function markdownPath(route: string) {
  const path = route.endsWith('/') ? `${route}index` : route
  return `docs${path}.md`
}

describe('content registry', () => {
  it('owns every routed learning page exactly once', () => {
    expect(contentItems.map((item) => item.id)).toEqual(expectedIds)
    expect(new Set(contentItems.map((item) => item.id)).size).toBe(contentItems.length)
    expect(new Set(contentItems.map((item) => item.route)).size).toBe(contentItems.length)
  })

  it('points every registry route at a real page', () => {
    for (const item of contentItems.filter((item) => item.id !== 'course')) {
      expect(existsSync(markdownPath(item.route)), item.id).toBe(true)
    }
  })

  it('fails loudly for an unknown ID', () => {
    expect(() => getContentItem('missing')).toThrow('Unknown content item: missing')
  })

  it('uses the controlled navigation title variant', () => {
    expect(navigationItem('preface', 'nav').text).toBe('开始阅读')
    expect(navigationItem('preface').text).toBe('序章 · 会聊天，不等于会做事')
  })
})
