import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import {
  contentItems,
  getContentItem,
  navigationItem,
} from '../docs/.vitepress/theme/data/contentRegistry'
import {
  courseItems,
  courseStages,
  currentCourseStage,
  publishedCourseItems,
  projectCourseProgress,
  validateCourseMap,
} from '../docs/.vitepress/theme/data/courseMap'

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

const expectedCourseItems = [
  { itemId: 'preface', stageId: 'foundation', prerequisites: [], outcome: '说清 Agent 工程课程解决什么问题，以及学习顺序为何这样安排', evidence: '一张个人学习目标与已有基础清单' },
  { itemId: 'chapter-01-ai-native', stageId: 'foundation', prerequisites: ['preface'], outcome: '区分 AI-Enhanced 与 AI-Native，并划分模型和确定性代码责任', evidence: '一张 AI Native 改造画布' },
  { itemId: 'chapter-02-workflow-agent', stageId: 'foundation', prerequisites: ['chapter-01-ai-native'], outcome: '为具体任务选择 Prompt、Workflow 或 Agent', evidence: '一份控制方式选择单' },
  { itemId: 'chapter-03-react', stageId: 'foundation', prerequisites: ['chapter-02-workflow-agent'], outcome: '设计可观察、可停止、可恢复的 Agent 循环', evidence: '一份行动、观察与停止契约' },
  { itemId: 'chapter-04-tools-mcp', stageId: 'mechanisms', prerequisites: ['chapter-03-react'], outcome: '写出窄能力、可授权、可验证的工具契约', evidence: '一份工具契约 YAML 与风险清单' },
  { itemId: 'frontier-context-engineering', stageId: 'mechanisms', prerequisites: ['chapter-03-react'], outcome: '为一次决策选择、压缩、隔离和验证上下文', evidence: '一张上下文预算与来源表' },
  { itemId: 'chapter-05-state-memory', stageId: 'mechanisms', prerequisites: ['chapter-03-react'], outcome: '分开任务状态、会话、长期偏好、知识和审计', evidence: '一份记忆写入与删除协议' },
  { itemId: 'chapter-06-loop-graph', stageId: 'mechanisms', prerequisites: ['chapter-05-state-memory'], outcome: '把分支、并行、汇合和恢复画成显式控制流', evidence: '一张带失败回边的状态图' },
  { itemId: 'chapter-07-multi-agent', stageId: 'mechanisms', prerequisites: ['chapter-06-loop-graph'], outcome: '判断多 Agent 是否比单 Agent 基线更有价值', evidence: '一份 handoff 契约与角色消融方案' },
  { itemId: 'frontier-interoperability-identity', stageId: 'mechanisms', prerequisites: ['chapter-04-tools-mcp', 'chapter-07-multi-agent'], outcome: '区分 MCP 与 A2A，并画出身份、授权和委托链', evidence: '一张跨 Agent 委托与审计链路图' },
  { itemId: 'chapter-08-evaluation', stageId: 'engineering', prerequisites: ['chapter-03-react'], outcome: '联合评估结果、轨迹、业务证据、成本和延迟', evidence: '一组 10 条微型评测样本与评分表' },
  { itemId: 'chapter-09-safety-recovery', stageId: 'engineering', prerequisites: ['chapter-04-tools-mcp', 'chapter-08-evaluation'], outcome: '为高风险动作设计权限、幂等、补偿和人工接管', evidence: '一张权限与恢复矩阵' },
  { itemId: 'chapter-10-production', stageId: 'engineering', prerequisites: ['chapter-08-evaluation', 'chapter-09-safety-recovery'], outcome: '设计版本、门禁、灰度、SLO、回滚与退役', evidence: '一份二维上线矩阵与回滚清单' },
  { itemId: 'frontier-durable-execution', stageId: 'engineering', prerequisites: ['chapter-05-state-memory', 'chapter-06-loop-graph', 'chapter-09-safety-recovery'], outcome: '设计检查点、租约、重放和版本迁移', evidence: '一份可恢复任务协议' },
  { itemId: 'frontier-agent-security-evaluation', stageId: 'engineering', prerequisites: ['chapter-08-evaluation', 'chapter-09-safety-recovery'], outcome: '用任务后果和自适应攻击衡量 Agent 劫持风险', evidence: '一张安全评测集结构与指标表' },
  { itemId: 'chapter-11-research-agent', stageId: 'applications', prerequisites: ['chapter-07-multi-agent', 'chapter-08-evaluation'], outcome: '组织检索、证据、冲突与研究结论', evidence: '一份带引用覆盖率的研究计划' },
  { itemId: 'chapter-12-service-operations-agent', stageId: 'applications', prerequisites: ['chapter-04-tools-mcp', 'chapter-09-safety-recovery'], outcome: '设计客服运营中的政策、动作与升级边界', evidence: '一张人工升级与业务回执流程' },
  { itemId: 'chapter-13-coding-agent', stageId: 'applications', prerequisites: ['chapter-04-tools-mcp', 'chapter-08-evaluation', 'chapter-09-safety-recovery'], outcome: '约束仓库理解、修改、测试和交付证据', evidence: '一份 Coding Agent 任务与验证契约' },
  { itemId: 'chapter-14-computer-use', stageId: 'applications', prerequisites: ['chapter-04-tools-mcp', 'chapter-09-safety-recovery'], outcome: '为界面操作设计观察、权限和最终证据', evidence: '一张 Computer Use 风险与证据闭环' },
  { itemId: 'case-delivery-agent', stageId: 'projects', prerequisites: ['chapter-08-evaluation', 'chapter-09-safety-recovery', 'chapter-10-production'], outcome: '把评测、安全和生产门禁组合到一个交付型案例', evidence: '一份可复核的质量门评审记录' },
]

describe('course graph', () => {
  it('contains the approved twenty items and excludes the relationship-only stage', () => {
    expect(courseItems).toEqual(expectedCourseItems)
    expect(courseStages.map((stage) => stage.id)).toEqual([
      'foundation', 'mechanisms', 'engineering', 'applications', 'projects', 'capstone',
    ])
    expect(courseStages.find((stage) => stage.id === 'capstone')).toMatchObject({
      availability: 'relationship-only', itemIds: [],
    })
    expect(projectCourseProgress([]).total).toBe(20)
  })

  it('has only known prerequisite IDs and no cycles', () => {
    expect(validateCourseMap(courseItems, courseStages)).toEqual([])
    expect(validateCourseMap([
      { itemId: 'preface', stageId: 'foundation', prerequisites: ['chapter-01-ai-native'], outcome: 'a', evidence: 'a' },
      { itemId: 'chapter-01-ai-native', stageId: 'foundation', prerequisites: ['preface'], outcome: 'b', evidence: 'b' },
    ], courseStages)).toContain('Prerequisite cycle: chapter-01-ai-native -> preface -> chapter-01-ai-native')
  })

  it('rejects inherited Object prototype keys as unknown content IDs', () => {
    for (const itemId of ['toString', 'constructor', '__proto__']) {
      const items = [
        { itemId, stageId: 'foundation' as const, prerequisites: [], outcome: 'a', evidence: 'a' },
      ]
      const stages = [
        { id: 'foundation' as const, order: 1, title: 'a', purpose: 'a', availability: 'published' as const, itemIds: [itemId] },
      ]
      expect(validateCourseMap(items, stages)).toContain(`Unknown content item: ${itemId}`)
    }
  })

  it('keeps exported graph data and returned stage references immutable', () => {
    const initialProgress = projectCourseProgress([])
    const current = currentCourseStage([])

    expect(Object.isFrozen(courseStages)).toBe(true)
    expect(Object.isFrozen(courseStages[0])).toBe(true)
    expect(Object.isFrozen(courseStages[0].itemIds)).toBe(true)
    expect(Object.isFrozen(courseItems)).toBe(true)
    expect(Object.isFrozen(courseItems[0])).toBe(true)
    expect(Object.isFrozen(courseItems[0].prerequisites)).toBe(true)
    expect(Object.isFrozen(publishedCourseItems)).toBe(true)
    expect(Object.isFrozen(current)).toBe(true)

    expect(() => {
      (current as { title: string }).title = 'mutated'
    }).toThrow(TypeError)
    expect(currentCourseStage([])?.title).toBe('基础认知')
    expect(projectCourseProgress([])).toEqual(initialProgress)
  })

  it('selects the first incomplete published stage and handles 20/20', () => {
    expect(currentCourseStage([])?.id).toBe('foundation')
    const allRoutes = expectedCourseItems.map(({ itemId }) => getContentItem(itemId).route)
    expect(projectCourseProgress(allRoutes)).toMatchObject({ completed: 20, total: 20 })
    expect(currentCourseStage(allRoutes)).toBeNull()
  })
})
