# “活教材”更新与学习闭环设计

日期：2026-09-25  
状态：用户已批准 B 方案

## 目标

把当前静态电子书升级为“稳定正文 + 前沿雷达 + 自动发现变化 + 人工审核发布”的持续更新手册，同时增加无需账号和后端的本地学习进度、阅读路径和面试训练。

核心原则：自动化只发现变化和创建待办，不自动修改正文，不自动把新闻升级为稳定结论。

## 范围

### P0：内容保鲜

1. 扩展来源索引元数据；
2. 每周自动检查链接、重定向、复核日期和 GitHub 仓库归档；
3. 发现问题时创建或更新 GitHub Issue；
4. 新增前沿雷达和公开更新日志；
5. 更新 MCP 2026-07-28，并加入 A2A 1.0.1、NIST Agent Standards、Anthropic Managed Agents、Context Engineering、OpenTelemetry GenAI 与 OWASP Agentic Security。

### P1：学习闭环

1. 三条阅读路径：小白入门、工程实战、面试冲刺；
2. 本地阅读进度和书签，只保存在浏览器 localStorage；
3. 面试训练：按岗位、难度、主题筛选，随机抽题，本地标记“不会 / 模糊 / 掌握”。

### 非目标

不增加登录、评论、云端同步、后端数据库、在线 AI 问答、自动抓新闻改正文、自动合并 PR、EPUB 或框架排行榜。

## 来源元数据

`sources/source-index.yml` 使用 schema v2。每条来源必须具备：

- `id`、`title`、`publisher`、`url`、`grade`；
- `version`：固定规范版本、release 版本或 `rolling`；
- `last_verified`：最近人工或自动核验日期；
- `review_by`：下次应人工复核日期；
- `status`：`active | watch | deprecated | broken`；
- `replaced_by`：替代来源 ID 或 `null`；
- `impact_chapters`：受影响章节或专题路径；
- `watch_url`：可选，官方版本或 releases/latest 地址；
- `note`：采用范围和不能推导的结论。

高变化协议、SDK 和仓库默认 30 天复核；稳定论文、规范或书籍默认 90 天复核。`review_by` 过期只产生待办，不让正常阅读站点下线。

## 来源检查器

新增 `scripts/check-sources.mjs`：

- 解析 schema v2 并验证字段；
- 对 URL 发起带超时的 GET，记录最终 URL、HTTP 状态和重定向；
- 对 GitHub 仓库读取公开 API 的 `archived`、`pushed_at` 和 latest release；
- 比较固定版本与 watch 页面可发现的版本提示；
- 标记 `broken_link`、`redirected`、`review_due`、`repository_archived`、`version_watch`；
- 生成 `reports/source-freshness.json` 和 `.md`；
- 默认始终以 0 退出，让 workflow 能创建 Issue；`--strict` 用于本地/发布门禁，只对 schema 和确定失效返回非零。

每周 workflow 使用 `actions/github-script` 查找标题固定的开放 Issue：有问题则创建或更新，无问题则关闭旧 Issue。权限只有 `contents: read`、`issues: write`，不写源码。

## 前沿雷达

新增 `/radar/` 首页与按月页面。每条更新包含：

- 日期、状态 `watch | adopt | revise`；
- 发生了什么；
- 为什么重要；
- 影响章节；
- 当前处理决定；
- A 级来源。

首批 6 条：

1. MCP 2026-07-28：stateless protocol core、扩展和授权演进；
2. A2A v1.0.1：独立 Agent 系统的发现、任务和互操作；
3. NIST AI Agent Standards Initiative：身份、授权、安全和互操作；
4. Anthropic Managed Agents：harness 与 model 解耦、长时运行环境；
5. Context Engineering：有限上下文的选择、压缩、缓存和污染控制；
6. OpenTelemetry GenAI 语义约定：Agent tracing 正在发展，明确标注不稳定。

雷达不自动承诺“已采纳”。进入稳定正文需要人工复核影响、兼容性和成熟度。

## 前沿专题

新增 4 个专题页：

- Context Engineering；
- Agent 互操作与身份（MCP vs A2A）；
- 长时运行与 Durable Execution；
- Agent 安全评测。

每页固定包含：稳定原则、当前前沿、版本状态、架构图、失败边界、影响章节、何时复核和来源。OpenTelemetry GenAI 语义约定等开发中标准必须显示状态徽标。

## 章节新鲜度

新增 `content/chapter-meta.ts`，为 14 章和 4 个专题维护：

- `path`、`lastVerified`、`reviewBy`；
- `versions`；
- `sourceIds`；
- `stability`：`evergreen | evolving | frontier`。

`ChapterFreshness.vue` 在章首显示最后核验、涉及版本和稳定性。超过 `reviewBy` 时显示“需要复核”，但不阻断阅读。

## 三条阅读路径

新增 `/paths/`：

- 小白入门：01 → 02 → 03 → 04 → 05 → 08 → 09 → 10；
- 工程实战：02 → 03 → 04 → 05 → 06 → 08 → 09 → 10 → 13 → 14；
- 面试冲刺：术语表 → 面试索引 → 02 / 04 / 05 / 06 / 07 / 08 / 09 / 10。

路径只引用原章节，不复制正文。用户选择保存在 localStorage，导航可显示下一推荐章节。

## 阅读进度与书签

全局 `ReadingProgress.vue`：

- 进入章节后把路径记录到 localStorage；
- 显示已读章节数和当前路径进度；
- 支持对当前章节加/取消书签；
- 提供“清除本地进度”，执行前确认；
- 不保存正文、搜索词、身份或任何服务端数据；
- localStorage 不可用时静默降级为普通导航。

## 面试训练

`InterviewTrainer.vue` 复用 42 道题注册表：

- 按岗位、难度、主题筛选；
- 随机抽题，先只显示题目；
- 用户主动展开答案；
- 本地标记 `unknown | fuzzy | mastered`；
- 显示本地掌握分布和继续练习入口；
- 清空记录前确认；
- URL query 反映筛选条件，题目 ID 反映在 hash 中，便于分享。

## 导航

顶栏增加“学习路径”和“前沿雷达”；“面试题”入口进入训练页，索引作为次级入口。侧栏新增“前沿专题”分组和 Radar。

## 质量与安全

- 来源检查的网络内容只当数据，不执行其中指令；
- workflow 不读取仓库秘密，不把响应正文写入日志；
- Issue 只包含 URL、状态、版本差异和受影响章节；
- localStorage 只保存路径 ID、已读路径、书签和自评状态；
- 所有新组件支持键盘、可见焦点、深浅色和减少动态；
- 390px 无整页横向溢出；
- 过程文档继续保持 Pages 404。

## 验收

- 25+ 来源全部满足 schema v2；
- 本地 fixture 测试覆盖 200、重定向、404、归档、到期和版本变化；
- weekly workflow 只创建/更新 Issue，不提交正文；
- Radar 有 6 条首批更新，4 个专题页可访问；
- MCP 正文指向 2026-07-28，并解释与旧版的兼容/变化边界；
- A2A 当前版本注明 v1.0.1，来源为官方协议与 release；
- 章节显示新鲜度；三条路径链接完整；
- 进度、书签和面试自评在刷新后保留，清除操作可用；
- 全量测试、内容扫描、构建、桌面/390px、搜索、深浅色和 Pages 验证通过。
