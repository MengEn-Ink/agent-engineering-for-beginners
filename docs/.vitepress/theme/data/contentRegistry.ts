export type ContentKind =
  | 'course'
  | 'paths'
  | 'chapter'
  | 'frontier'
  | 'case-study'
  | 'radar'
  | 'appendix'
  | 'project'
  | 'lab'
  | 'capstone'

export interface ContentItem {
  id: string
  route: string
  title: string
  navTitle?: string
  kind: ContentKind
}

export const contentItems: ContentItem[] = [
  { id: 'course', route: '/course/', title: 'Agent 工程完整课程地图', navTitle: '课程地图', kind: 'course' },
  { id: 'paths', route: '/paths/', title: '三条阅读路径', navTitle: '阅读路径', kind: 'paths' },
  { id: 'preface', route: '/preface', title: '序章 · 会聊天，不等于会做事', navTitle: '开始阅读', kind: 'chapter' },
  { id: 'chapter-01-ai-native', route: '/chapters/01-ai-native', title: '01 · AI Native 到底 Native 在哪', kind: 'chapter' },
  { id: 'chapter-02-workflow-agent', route: '/chapters/02-workflow-agent', title: '02 · Prompt、Workflow、Agent', kind: 'chapter' },
  { id: 'chapter-03-react', route: '/chapters/03-react', title: '03 · ReAct：想、做、看、再决定', kind: 'chapter' },
  { id: 'chapter-04-tools-mcp', route: '/chapters/04-tools-mcp', title: '04 · 工具与 MCP', kind: 'chapter' },
  { id: 'chapter-05-state-memory', route: '/chapters/05-state-memory', title: '05 · 状态与记忆', kind: 'chapter' },
  { id: 'chapter-06-loop-graph', route: '/chapters/06-loop-graph', title: '06 · 从 Loop 到 Graph', kind: 'chapter' },
  { id: 'chapter-07-multi-agent', route: '/chapters/07-multi-agent', title: '07 · 多 Agent 协作', kind: 'chapter' },
  { id: 'chapter-08-evaluation', route: '/chapters/08-evaluation', title: '08 · 验证与可观测性', kind: 'chapter' },
  { id: 'chapter-09-safety-recovery', route: '/chapters/09-safety-recovery', title: '09 · 失败、恢复与安全边界', kind: 'chapter' },
  { id: 'chapter-10-production', route: '/chapters/10-production', title: '10 · 从 Demo 到生产', kind: 'chapter' },
  { id: 'chapter-11-research-agent', route: '/chapters/11-research-agent', title: '11 · 研究型 Agent', kind: 'chapter' },
  { id: 'chapter-12-service-operations-agent', route: '/chapters/12-service-operations-agent', title: '12 · 客服与运营 Agent', kind: 'chapter' },
  { id: 'chapter-13-coding-agent', route: '/chapters/13-coding-agent', title: '13 · Coding Agent', kind: 'chapter' },
  { id: 'chapter-14-computer-use', route: '/chapters/14-computer-use', title: '14 · Computer Use', kind: 'chapter' },
  { id: 'frontier-context-engineering', route: '/frontier/context-engineering', title: 'Context Engineering', kind: 'frontier' },
  { id: 'frontier-interoperability-identity', route: '/frontier/interoperability-identity', title: 'Agent 互操作与身份', kind: 'frontier' },
  { id: 'frontier-durable-execution', route: '/frontier/durable-execution', title: '长时运行与恢复', kind: 'frontier' },
  { id: 'frontier-agent-security-evaluation', route: '/frontier/agent-security-evaluation', title: 'Agent 安全评测', kind: 'frontier' },
  { id: 'case-delivery-agent', route: '/case-study/delivery-agent', title: '交付型 Agent 的质量门', navTitle: '交付型案例', kind: 'case-study' },
  { id: 'radar', route: '/radar/', title: '前沿雷达', kind: 'radar' },
  { id: 'radar-2026-09', route: '/radar/2026-09', title: '2026 年 9 月更新', kind: 'radar' },
  { id: 'appendix-glossary', route: '/appendix/glossary', title: '术语表', kind: 'appendix' },
  { id: 'appendix-review-checklist', route: '/appendix/review-checklist', title: '方案评审清单', kind: 'appendix' },
  { id: 'appendix-reading', route: '/appendix/reading', title: '延伸阅读', kind: 'appendix' },
  { id: 'appendix-application-matrix', route: '/appendix/application-matrix', title: '应用选型矩阵', kind: 'appendix' },
  { id: 'appendix-chapter-template', route: '/appendix/chapter-template', title: '章节与方案模板', kind: 'appendix' },
  { id: 'appendix-interview', route: '/appendix/interview', title: '42 道面试题', kind: 'appendix' },
  { id: 'appendix-interview-training', route: '/appendix/interview-training', title: '面试训练模式', kind: 'appendix' },
]

export const contentById = Object.fromEntries(
  contentItems.map((item) => [item.id, item]),
) as Record<string, ContentItem>

export function getContentItem(id: string): ContentItem {
  const item = contentById[id]
  if (!item) throw new Error(`Unknown content item: ${id}`)
  return item
}

export function navigationItem(id: string, variant: 'title' | 'nav' = 'title') {
  const item = getContentItem(id)
  return { text: variant === 'nav' ? (item.navTitle ?? item.title) : item.title, link: item.route }
}
