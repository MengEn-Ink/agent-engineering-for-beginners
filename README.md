# 别只会和 AI 聊天

一本面向产品、运营、设计、初级开发者和技术管理者的中文 AI Native / Agent 工程入门书。全书共 4 篇、14 章，包含研究、客服运营、Coding 与 Computer Use 应用方向，并穿插 42 道面试题与 22 个解释性视觉实例。

项目按“活教材”维护：常青正文讲稳定工程原则，前沿 Radar 与专题页承载 MCP、A2A、Agent 安全和长时运行等快速变化；每章显示核验日期与版本关注。读者可以选择小白、工程或面试路线，并在浏览器本地保存进度、书签和面试掌握度，无需账号或后端。

在线阅读：<https://mengen-ink.github.io/agent-engineering-for-beginners/>

## 本地开发

需要 Node.js 22+ 与 pnpm 9+。

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm validate
pnpm build
pnpm sources:check
pnpm preview --host 127.0.0.1 --port 4173
```

## 内容原则

- 先讲生活类比，再解释工程概念；
- 关键事实至少由一条 A 级来源，或两条独立 B 级来源支撑；
- 公众号只提供选题和观点线索，不复制原图或大段原文；
- 交付型案例只保留可公开的通用模式，不包含内部地址、账号、标识、凭证、日志、报告、源码或未发布能力；
- Star、下载量和热度只代表关注度，不代替架构判断。
- 自动巡检只发现链接、重定向、版本与归档变化并创建待审 Issue，不自动改写正文或发布结论。

机器可读来源清单位于 [`sources/source-index.yml`](sources/source-index.yml)。设计与实现记录不进入 VitePress 发布面。

## 质量门

`pnpm test` 检查章节结构、来源 ID、前沿状态、学习组件、侧栏目标、视觉组件、公开边界和部署工作流；`pnpm validate` 扫描将发布的 Markdown、Vue、TypeScript、JavaScript、CSS、SVG、YAML、JSON 与 HTML；`pnpm build` 还会确认最终产物不泄露项目过程文档；`pnpm sources:check` 生成不包含响应正文的来源保鲜报告。

## 技术栈

VitePress + Vue 3 + TypeScript + Vitest + GitHub Actions / Pages。所有解释性插图均为项目内原创 SVG 或 CSS 组件。

## License

正文与原创插图采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)，站点代码采用 MIT License。外部资料版权归原作者所有。
