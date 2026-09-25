import { defineConfig } from 'vitepress'
import { navigationItem } from './theme/data/contentRegistry'

const base = '/agent-engineering-for-beginners/'

const navItems = (ids: string[]) => ids.map((id) => navigationItem(id))

const sidebar = [
  { text: '课程入口', items: navItems(['course', 'paths']) },
  { text: '第一篇 · 认识 Agent', collapsed: false, items: navItems([
    'preface', 'chapter-01-ai-native', 'chapter-02-workflow-agent', 'chapter-03-react',
  ]) },
  { text: '第二篇 · 组装 Agent', collapsed: false, items: navItems([
    'chapter-04-tools-mcp', 'chapter-05-state-memory', 'chapter-06-loop-graph',
    'chapter-07-multi-agent',
  ]) },
  { text: '第三篇 · 敢于上线', collapsed: false, items: navItems([
    'chapter-08-evaluation', 'chapter-09-safety-recovery', 'chapter-10-production',
  ]) },
  { text: '第四篇 · 应用方向', collapsed: false, items: navItems([
    'chapter-11-research-agent', 'chapter-12-service-operations-agent',
    'chapter-13-coding-agent', 'chapter-14-computer-use',
  ]) },
  { text: '案例研究', items: navItems(['case-delivery-agent']) },
  { text: '活教材 · 前沿层', items: navItems([
    'radar', 'radar-2026-09', 'frontier-context-engineering',
    'frontier-interoperability-identity', 'frontier-durable-execution',
    'frontier-agent-security-evaluation',
  ]) },
  { text: '随手查', items: navItems([
    'appendix-glossary', 'appendix-review-checklist', 'appendix-reading',
    'appendix-application-matrix', 'appendix-chapter-template',
    'appendix-interview', 'appendix-interview-training',
  ]) },
]

export default defineConfig({
  lang: 'zh-CN',
  title: '别只会和 AI 聊天',
  description: '一本写给小白的 AI Native 与 Agent 工程入门书',
  base,
  srcExclude: ['superpowers/**'],
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}mark.svg` }],
    ['meta', { name: 'theme-color', content: '#fcfcfa', media: '(prefers-color-scheme: light)' }],
    ['meta', { name: 'theme-color', content: '#17191d', media: '(prefers-color-scheme: dark)' }],
    ['meta', { property: 'og:title', content: '别只会和 AI 聊天' }],
    ['meta', { property: 'og:description', content: '从会写 Prompt，到能交付一个可靠的 Agent 系统。' }],
  ],
  themeConfig: {
    logo: '/mark.svg',
    siteTitle: 'Agent 工程入门',
    nav: [
      { text: '课程', items: [navigationItem('course', 'nav'), navigationItem('preface', 'nav'), navigationItem('paths', 'nav')] },
      { text: '实战', items: [navigationItem('case-delivery-agent', 'nav')] },
      { text: '前沿', items: [navigationItem('radar'), navigationItem('frontier-context-engineering'), navigationItem('frontier-interoperability-identity'), navigationItem('frontier-durable-execution'), navigationItem('frontier-agent-security-evaluation')] },
      { text: '复习', items: [navigationItem('appendix-interview-training'), navigationItem('appendix-interview'), navigationItem('appendix-glossary')] },
    ],
    sidebar,
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
