import { getContentItem } from './contentRegistry'

export type ReadingPathId = 'beginner' | 'engineering' | 'interview'

export interface ReadingPathDefinition {
  id: ReadingPathId
  title: string
  summary: string
  pace: string
  steps: Array<{ itemId: string; why: string }>
}

export const readingPathDefinitions: ReadingPathDefinition[] = [
  {
    id: 'beginner',
    title: '小白入门',
    summary: '先建立 Agent 的完整心智模型，再进入状态、评测、安全和上线。',
    pace: '8 站 · 约 4–6 小时',
    steps: [
      { itemId: 'chapter-01-ai-native', why: '先理解系统为何要重新分工' },
      { itemId: 'chapter-02-workflow-agent', why: '学会选择最简单的自动化形态' },
      { itemId: 'chapter-03-react', why: '看懂 Agent 如何行动和观察' },
      { itemId: 'chapter-04-tools-mcp', why: '给能力加上契约和权限' },
      { itemId: 'chapter-05-state-memory', why: '别把所有历史都塞回窗口' },
      { itemId: 'chapter-08-evaluation', why: '从一次答对走向可重复验证' },
      { itemId: 'chapter-09-safety-recovery', why: '为失败和高风险动作留出口' },
      { itemId: 'chapter-10-production', why: '把版本、灰度和运营串起来' },
    ],
  },
  {
    id: 'engineering',
    title: '工程实战',
    summary: '围绕工具、状态、Graph、验证和应用边界，形成可以落地的系统设计。',
    pace: '10 站 · 建议边读边做',
    steps: [
      { itemId: 'chapter-02-workflow-agent', why: '避免一开始就过度 Agent 化' },
      { itemId: 'chapter-03-react', why: '明确观察、停止与恢复' },
      { itemId: 'chapter-04-tools-mcp', why: '缩小能力与权限边界' },
      { itemId: 'chapter-05-state-memory', why: '让任务可恢复、信息可治理' },
      { itemId: 'chapter-06-loop-graph', why: '把分支、汇合和错误边画出来' },
      { itemId: 'chapter-08-evaluation', why: '同时看结果、轨迹、证据和成本' },
      { itemId: 'chapter-09-safety-recovery', why: '处理幂等、补偿与接管' },
      { itemId: 'chapter-10-production', why: '用灰度、SLO 和回滚保护上线' },
      { itemId: 'chapter-13-coding-agent', why: '把工程原则放进真实仓库任务' },
      { itemId: 'chapter-14-computer-use', why: '验证高不确定环境里的证据链' },
    ],
  },
  {
    id: 'interview',
    title: '面试冲刺',
    summary: '先补术语，再按高频系统设计主题复习，最后进入 42 道题的训练。',
    pace: '11 站 · 适合分 3 次复习',
    steps: [
      { itemId: 'appendix-glossary', why: '先把容易混淆的概念说清' },
      { itemId: 'appendix-interview', why: '了解题型与自己的薄弱区' },
      { itemId: 'chapter-02-workflow-agent', why: '回答方案选择和成本取舍' },
      { itemId: 'chapter-04-tools-mcp', why: '回答协议、契约与权限边界' },
      { itemId: 'chapter-05-state-memory', why: '回答上下文和持久化分层' },
      { itemId: 'chapter-06-loop-graph', why: '回答控制流与恢复设计' },
      { itemId: 'chapter-07-multi-agent', why: '回答协作收益和额外成本' },
      { itemId: 'chapter-08-evaluation', why: '把可靠性指标说成可计算公式' },
      { itemId: 'chapter-09-safety-recovery', why: '处理注入、幂等和人工接管' },
      { itemId: 'chapter-10-production', why: '完成一轮系统设计串讲' },
      { itemId: 'appendix-interview-training', why: '用筛选、口答和自评完成闭环' },
    ],
  },
]

export interface ReadingStep {
  itemId: string
  path: string
  title: string
  why: string
}

export interface ReadingPath extends Omit<ReadingPathDefinition, 'steps'> {
  steps: ReadingStep[]
}

export const readingPaths: ReadingPath[] = readingPathDefinitions.map((path) => ({
  ...path,
  steps: path.steps.map((step) => {
    const item = getContentItem(step.itemId)
    return { ...step, path: item.route, title: item.title }
  }),
}))

export const readingPathById = Object.fromEntries(
  readingPaths.map((path) => [path.id, path]),
) as Record<ReadingPathId, ReadingPath>

export function findNextReadingStep(
  path: ReadingPath,
  currentPath: string,
  completed: string[],
): ReadingStep | undefined {
  const currentIndex = path.steps.findIndex((step) => step.path === currentPath)
  if (currentIndex >= 0) {
    return currentIndex < path.steps.length - 1 ? path.steps[currentIndex + 1] : undefined
  }
  return path.steps.find((step) => !completed.includes(step.path))
}
