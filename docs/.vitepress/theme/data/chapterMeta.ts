export type ContentStability = 'evergreen' | 'evolving' | 'frontier'

export interface ChapterMeta {
  path: string
  lastVerified: string
  reviewBy: string
  versions: string[]
  sourceIds: string[]
  stability: ContentStability
}

const verified = '2026-09-25'
const monthlyReview = '2026-10-25'
const quarterlyReview = '2026-12-24'

export const chapterMeta: ChapterMeta[] = [
  {
    path: '/chapters/01-ai-native',
    lastVerified: verified,
    reviewBy: quarterlyReview,
    versions: ['常青原则 · 不绑定模型版本'],
    sourceIds: ['anthropic-effective-agents'],
    stability: 'evergreen',
  },
  {
    path: '/chapters/02-workflow-agent',
    lastVerified: verified,
    reviewBy: quarterlyReview,
    versions: ['常青原则 · 不绑定框架版本'],
    sourceIds: ['anthropic-effective-agents', 'chip-huyen-agents'],
    stability: 'evergreen',
  },
  {
    path: '/chapters/03-react',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['Agent loop · rolling'],
    sourceIds: ['anthropic-agent-sdk', 'chip-huyen-agents'],
    stability: 'evolving',
  },
  {
    path: '/chapters/04-tools-mcp',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['MCP 2026-07-28', 'A2A v1.0.1'],
    sourceIds: ['mcp-spec', 'a2a-spec', 'a2a-release'],
    stability: 'evolving',
  },
  {
    path: '/chapters/05-state-memory',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['Sessions · rolling', 'LangGraph · rolling'],
    sourceIds: ['openai-agents-sessions', 'langgraph-repository'],
    stability: 'evolving',
  },
  {
    path: '/chapters/06-loop-graph',
    lastVerified: verified,
    reviewBy: quarterlyReview,
    versions: ['Graph 原则 · 不绑定框架版本'],
    sourceIds: ['langgraph-repository', 'microsoft-autogen-architecture'],
    stability: 'evergreen',
  },
  {
    path: '/chapters/07-multi-agent',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['A2A v1.0.1', 'AutoGen · rolling'],
    sourceIds: ['a2a-spec', 'autogen-repository'],
    stability: 'evolving',
  },
  {
    path: '/chapters/08-evaluation',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['ADK evaluation · rolling', 'OTel GenAI · Development'],
    sourceIds: ['google-adk-evaluation', 'otel-agent-observability'],
    stability: 'evolving',
  },
  {
    path: '/chapters/09-safety-recovery',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['MCP 2026-07-28', 'OWASP Agentic Top 10 · 2026'],
    sourceIds: ['mcp-spec', 'nist-agent-hijacking', 'owasp-agentic-top-10'],
    stability: 'evolving',
  },
  {
    path: '/chapters/10-production',
    lastVerified: verified,
    reviewBy: quarterlyReview,
    versions: ['生产化原则 · 不绑定部署平台'],
    sourceIds: ['anthropic-effective-agents', 'vitepress-deploy'],
    stability: 'evergreen',
  },
  {
    path: '/chapters/11-research-agent',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['Research Agent · rolling'],
    sourceIds: ['anthropic-multi-agent-research', 'google-adk-evaluation'],
    stability: 'evolving',
  },
  {
    path: '/chapters/12-service-operations-agent',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['Operations Agent · rolling'],
    sourceIds: ['openai-practical-agents-guide', 'openai-agents-sdk'],
    stability: 'evolving',
  },
  {
    path: '/chapters/13-coding-agent',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['Claude Code / Copilot Agent · rolling'],
    sourceIds: ['anthropic-claude-code-best-practices', 'github-copilot-cloud-agent'],
    stability: 'evolving',
  },
  {
    path: '/chapters/14-computer-use',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['Computer Use · rolling'],
    sourceIds: ['anthropic-computer-use', 'openai-computer-use'],
    stability: 'frontier',
  },
  {
    path: '/frontier/context-engineering',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['Context Engineering · rolling'],
    sourceIds: ['anthropic-context-engineering'],
    stability: 'evolving',
  },
  {
    path: '/frontier/interoperability-identity',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['MCP 2026-07-28', 'A2A v1.0.1'],
    sourceIds: ['mcp-spec', 'a2a-spec', 'nist-agentic-ai'],
    stability: 'frontier',
  },
  {
    path: '/frontier/durable-execution',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['Managed Agents · rolling'],
    sourceIds: ['anthropic-managed-agents', 'langgraph-repository'],
    stability: 'frontier',
  },
  {
    path: '/frontier/agent-security-evaluation',
    lastVerified: verified,
    reviewBy: monthlyReview,
    versions: ['NIST Agent Hijacking · rolling', 'OTel GenAI · Development'],
    sourceIds: ['nist-agent-hijacking', 'owasp-agentic-top-10', 'otel-agent-observability'],
    stability: 'frontier',
  },
]

export const chapterMetaByPath = Object.fromEntries(
  chapterMeta.map((item) => [item.path, item]),
) as Record<string, ChapterMeta>

