import { contentById, getContentItem } from './contentRegistry'
import { normalizeLearningPath } from './learningState'

export type CourseStageId =
  | 'foundation'
  | 'mechanisms'
  | 'engineering'
  | 'applications'
  | 'projects'
  | 'capstone'

export interface CourseItem {
  itemId: string
  stageId: CourseStageId
  prerequisites: string[]
  outcome: string
  evidence: string
}

export interface CourseStage {
  id: CourseStageId
  order: number
  title: string
  purpose: string
  availability: 'published' | 'relationship-only'
  itemIds: string[]
}

export interface CourseProgress {
  completed: number
  total: number
  stages: Array<{ id: CourseStageId; completed: number; total: number }>
}

export const courseStages: CourseStage[] = [
  { id: 'foundation', order: 1, title: '基础认知', purpose: '分清控制权与 Agent 循环', availability: 'published', itemIds: ['preface', 'chapter-01-ai-native', 'chapter-02-workflow-agent', 'chapter-03-react'] },
  { id: 'mechanisms', order: 2, title: '核心机制', purpose: '组装工具、上下文、状态与协作', availability: 'published', itemIds: ['chapter-04-tools-mcp', 'frontier-context-engineering', 'chapter-05-state-memory', 'chapter-06-loop-graph', 'chapter-07-multi-agent', 'frontier-interoperability-identity'] },
  { id: 'engineering', order: 3, title: '生产工程', purpose: '建立评测、安全、恢复与上线能力', availability: 'published', itemIds: ['chapter-08-evaluation', 'chapter-09-safety-recovery', 'chapter-10-production', 'frontier-durable-execution', 'frontier-agent-security-evaluation'] },
  { id: 'applications', order: 4, title: '应用模式', purpose: '理解四类 Agent 的适用与失败边界', availability: 'published', itemIds: ['chapter-11-research-agent', 'chapter-12-service-operations-agent', 'chapter-13-coding-agent', 'chapter-14-computer-use'] },
  { id: 'projects', order: 5, title: '项目拆解', purpose: '从已发布案例观察工程质量门', availability: 'published', itemIds: ['case-delivery-agent'] },
  { id: 'capstone', order: 6, title: '综合实战', purpose: '在后续独立阶段组合 Python Lab 与交付型后端 Agent', availability: 'relationship-only', itemIds: [] },
]

export const courseItems: CourseItem[] = [
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

export const publishedCourseItems = courseItems.filter((item) =>
  courseStages.find((stage) => stage.id === item.stageId)?.availability === 'published',
)

export const courseItemById = Object.fromEntries(
  courseItems.map((item) => [item.itemId, item]),
) as Record<string, CourseItem>

export function projectCourseProgress(completedRoutes: string[]): CourseProgress {
  const completed = new Set(completedRoutes.map(normalizeLearningPath))
  const stages = courseStages
    .filter((stage) => stage.availability === 'published')
    .map((stage) => {
      const itemIds = publishedCourseItems
        .filter((item) => item.stageId === stage.id)
        .map((item) => item.itemId)
      return {
        id: stage.id,
        completed: itemIds.filter((id) => completed.has(normalizeLearningPath(getContentItem(id).route))).length,
        total: itemIds.length,
      }
    })

  return {
    completed: stages.reduce((total, stage) => total + stage.completed, 0),
    total: publishedCourseItems.length,
    stages,
  }
}

export function currentCourseStage(completedRoutes: string[]): CourseStage | null {
  const progress = projectCourseProgress(completedRoutes)
  const current = progress.stages.find((stage) => stage.completed < stage.total)
  return current ? (courseStages.find((stage) => stage.id === current.id) ?? null) : null
}

export function validateCourseMap(items: CourseItem[], stages: CourseStage[]): string[] {
  const errors: string[] = []
  const stageById = new Map(stages.map((stage) => [stage.id, stage]))
  const itemCounts = new Map<string, number>()

  for (const item of items) {
    itemCounts.set(item.itemId, (itemCounts.get(item.itemId) ?? 0) + 1)
    if (!contentById[item.itemId]) errors.push(`Unknown content item: ${item.itemId}`)

    const stage = stageById.get(item.stageId)
    if (!stage) {
      errors.push(`Unknown course stage: ${item.stageId}`)
    } else {
      if (stage.availability === 'relationship-only') {
        errors.push(`Relationship-only stage contains item: ${item.itemId}`)
      }
      if (!stage.itemIds.includes(item.itemId)) {
        errors.push(`Stage/item mismatch: ${item.itemId} is not listed in ${stage.id}`)
      }
    }
  }

  for (const [itemId, count] of itemCounts) {
    if (count > 1) errors.push(`Duplicate course item: ${itemId}`)
  }

  const knownCourseIds = new Set(items.map((item) => item.itemId))
  for (const item of items) {
    for (const prerequisite of item.prerequisites) {
      if (!knownCourseIds.has(prerequisite)) {
        errors.push(`Unknown prerequisite: ${item.itemId} -> ${prerequisite}`)
      }
    }
  }

  for (const stage of stages) {
    if (stage.availability === 'relationship-only' && stage.itemIds.length > 0) {
      errors.push(`Relationship-only stage has items: ${stage.id}`)
    }
    for (const itemId of stage.itemIds) {
      const item = items.find((candidate) => candidate.itemId === itemId)
      if (!item) {
        errors.push(`Unknown stage item: ${stage.id} -> ${itemId}`)
      } else if (item.stageId !== stage.id) {
        errors.push(`Stage/item mismatch: ${itemId} belongs to ${item.stageId}, not ${stage.id}`)
      }
    }
  }

  const firstItemById = new Map<string, CourseItem>()
  for (const item of items) {
    if (!firstItemById.has(item.itemId)) firstItemById.set(item.itemId, item)
  }
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const path: string[] = []

  function visit(itemId: string): void {
    if (visited.has(itemId)) return
    if (visiting.has(itemId)) {
      const cycleStart = path.indexOf(itemId)
      errors.push(`Prerequisite cycle: ${[...path.slice(cycleStart), itemId].join(' -> ')}`)
      return
    }

    const item = firstItemById.get(itemId)
    if (!item) return
    visiting.add(itemId)
    path.push(itemId)
    for (const prerequisite of item.prerequisites) {
      if (firstItemById.has(prerequisite)) visit(prerequisite)
    }
    path.pop()
    visiting.delete(itemId)
    visited.add(itemId)
  }

  for (const itemId of [...firstItemById.keys()].sort()) visit(itemId)
  return errors
}
