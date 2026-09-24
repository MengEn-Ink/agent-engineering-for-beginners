import { defineConfig } from 'vitepress'

const chapterSidebar = [
  { text: '序章 · 会聊天，不等于会做事', link: '/preface' },
  { text: '01 · AI Native 到底 Native 在哪', link: '/chapters/01-ai-native' },
  { text: '02 · Prompt、Workflow、Agent', link: '/chapters/02-workflow-agent' },
  { text: '03 · ReAct：想、做、看、再决定', link: '/chapters/03-react' },
  { text: '04 · 工具与 MCP', link: '/chapters/04-tools-mcp' },
  { text: '05 · 状态与记忆', link: '/chapters/05-state-memory' },
  { text: '06 · 从 Loop 到 Graph', link: '/chapters/06-loop-graph' },
  { text: '07 · 多 Agent 协作', link: '/chapters/07-multi-agent' },
  { text: '08 · 验证与可观测性', link: '/chapters/08-evaluation' },
  { text: '09 · 失败、恢复与安全边界', link: '/chapters/09-safety-recovery' },
  { text: '10 · 从 Demo 到生产', link: '/chapters/10-production' },
]

export default defineConfig({
  lang: 'zh-CN',
  title: '别只会和 AI 聊天',
  description: '一本写给小白的 AI Native 与 Agent 工程入门书',
  base: '/agent-engineering-for-beginners/',
  srcExclude: ['superpowers/**'],
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['meta', { name: 'theme-color', content: '#101e3a' }],
    ['meta', { property: 'og:title', content: '别只会和 AI 聊天' }],
    ['meta', { property: 'og:description', content: '从会写 Prompt，到能交付一个可靠的 Agent 系统。' }],
  ],
  themeConfig: {
    logo: '/mark.svg',
    siteTitle: 'Agent 工程入门',
    nav: [
      { text: '开始阅读', link: '/preface' },
      { text: '交付型案例', link: '/case-study/delivery-agent' },
      { text: '术语表', link: '/appendix/glossary' },
    ],
    sidebar: [
      {
        text: '从聊天到交付',
        collapsed: false,
        items: chapterSidebar,
      },
      {
        text: '案例研究',
        items: [{ text: '交付型 Agent 的质量门', link: '/case-study/delivery-agent' }],
      },
      {
        text: '随手查',
        items: [
          { text: '术语表', link: '/appendix/glossary' },
          { text: '方案评审清单', link: '/appendix/review-checklist' },
          { text: '延伸阅读', link: '/appendix/reading' },
        ],
      },
    ],
    outline: { level: [2, 3], label: '本页地图' },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索全书', buttonAriaLabel: '搜索全书' },
          modal: {
            noResultsText: '没搜到，换个更朴素的说法试试',
            resetButtonTitle: '清空',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/MengEn-Ink/agent-engineering-for-beginners' },
    ],
    editLink: {
      pattern: 'https://github.com/MengEn-Ink/agent-engineering-for-beginners/edit/main/docs/:path',
      text: '发现问题？在 GitHub 修正这一页',
    },
    lastUpdated: { text: '最后核对' },
    docFooter: { prev: '上一章', next: '下一章' },
  },
})
