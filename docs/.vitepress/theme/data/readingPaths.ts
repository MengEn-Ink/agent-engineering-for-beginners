export interface ReadingStep {
  path: string
  title: string
  why: string
}

export interface ReadingPath {
  id: 'beginner' | 'engineering' | 'interview'
  title: string
  summary: string
  pace: string
  steps: ReadingStep[]
}

export const readingPaths: ReadingPath[] = [
  {
    id: 'beginner',
    title: '小白入门',
    summary: '先建立 Agent 的完整心智模型，再进入状态、评测、安全和上线。',
    pace: '8 站 · 约 4–6 小时',
    steps: [
      { path: '/chapters/01-ai-native', title: 'AI Native', why: '先理解系统为何要重新分工' },
      { path: '/chapters/02-workflow-agent', title: 'Workflow 与 Agent', why: '学会选择最简单的自动化形态' },
      { path: '/chapters/03-react', title: 'ReAct 循环', why: '看懂 Agent 如何行动和观察' },
      { path: '/chapters/04-tools-mcp', title: '工具与 MCP', why: '给能力加上契约和权限' },
      { path: '/chapters/05-state-memory', title: '状态与记忆', why: '别把所有历史都塞回窗口' },
      { path: '/chapters/08-evaluation', title: '评测与可观测性', why: '从一次答对走向可重复验证' },
      { path: '/chapters/09-safety-recovery', title: '安全与恢复', why: '为失败和高风险动作留出口' },
      { path: '/chapters/10-production', title: '走向生产', why: '把版本、灰度和运营串起来' },
    ],
  },
  {
    id: 'engineering',
    title: '工程实战',
    summary: '围绕工具、状态、Graph、验证和应用边界，形成可以落地的系统设计。',
    pace: '10 站 · 建议边读边做',
    steps: [
      { path: '/chapters/02-workflow-agent', title: '选对自动化形态', why: '避免一开始就过度 Agent 化' },
      { path: '/chapters/03-react', title: '实现受控循环', why: '明确观察、停止与恢复' },
      { path: '/chapters/04-tools-mcp', title: '设计工具契约', why: '缩小能力与权限边界' },
      { path: '/chapters/05-state-memory', title: '拆分状态层', why: '让任务可恢复、信息可治理' },
      { path: '/chapters/06-loop-graph', title: '显式控制流', why: '把分支、汇合和错误边画出来' },
      { path: '/chapters/08-evaluation', title: '建立评测集', why: '同时看结果、轨迹、证据和成本' },
      { path: '/chapters/09-safety-recovery', title: '设计失败协议', why: '处理幂等、补偿与接管' },
      { path: '/chapters/10-production', title: '生产化门禁', why: '用灰度、SLO 和回滚保护上线' },
      { path: '/chapters/13-coding-agent', title: 'Coding Agent', why: '把工程原则放进真实仓库任务' },
      { path: '/chapters/14-computer-use', title: 'Computer Use', why: '验证高不确定环境里的证据链' },
    ],
  },
  {
    id: 'interview',
    title: '面试冲刺',
    summary: '先补术语，再按高频系统设计主题复习，最后进入 42 道题的训练。',
    pace: '11 站 · 适合分 3 次复习',
    steps: [
      { path: '/appendix/glossary', title: '术语表', why: '先把容易混淆的概念说清' },
      { path: '/appendix/interview', title: '42 道面试题', why: '了解题型与自己的薄弱区' },
      { path: '/chapters/02-workflow-agent', title: 'Workflow 与 Agent', why: '回答方案选择和成本取舍' },
      { path: '/chapters/04-tools-mcp', title: '工具与 MCP', why: '回答协议、契约与权限边界' },
      { path: '/chapters/05-state-memory', title: '状态与记忆', why: '回答上下文和持久化分层' },
      { path: '/chapters/06-loop-graph', title: 'Loop 与 Graph', why: '回答控制流与恢复设计' },
      { path: '/chapters/07-multi-agent', title: '多 Agent', why: '回答协作收益和额外成本' },
      { path: '/chapters/08-evaluation', title: '评测', why: '把可靠性指标说成可计算公式' },
      { path: '/chapters/09-safety-recovery', title: '安全与恢复', why: '处理注入、幂等和人工接管' },
      { path: '/chapters/10-production', title: '生产化', why: '完成一轮系统设计串讲' },
      { path: '/appendix/interview-training', title: '随机训练', why: '用筛选、口答和自评完成闭环' },
    ],
  },
]

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

export const readingPathById = Object.fromEntries(
  readingPaths.map((path) => [path.id, path]),
) as Record<ReadingPath['id'], ReadingPath>

