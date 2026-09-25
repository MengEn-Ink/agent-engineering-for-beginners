# 课程地图与导航设计

**状态：** 待用户与审判者复核  
**日期：** 2026-09-25  
**阶段：** 课程化重构第 1/4 阶段  
**实现主线：** Python（只约束后续可运行实验与综合项目）

## 1. 决策摘要

本阶段在现有电子书之上增加一个课程导航层，把已经发布的内容组织成“基础 → 机制 → 工程 → 应用 → 项目 → 综合实战”的学习关系。现有 14 章、4 个前沿专题、面试题、阅读路径和交付型案例继续作为唯一正文，不移动、不复制、不修改事实，也不改变已有 URL。

公开入口新增 `/course/`。它回答“完整课程有哪些阶段、每阶段为何学习、先修是什么、完成后能做什么”；现有 `/paths/` 继续回答“针对小白、工程或面试目标，下一站读什么”。课程地图是稳定课程结构，阅读路径是可切换的个性化顺序，两者不互相取代。

项目拆解页、Python Lab Kit 和综合项目属于后三个独立子项目。本阶段只定义它们接入课程地图时必须满足的数据契约，不创建空页面、假按钮、死链接或不可运行的占位实验。

## 2. 已确认事实与约束

- 当前线上有 14 章、4 个前沿专题、交付型案例、42 道中央面试题、三条阅读路径和浏览器本地进度。
- `/chapters/*`、`/frontier/*`、`/paths/`、`/radar/`、`/appendix/*` 与 `/case-study/delivery-agent` 已公开，必须保持兼容。
- Python 只用于后续自建 Lab 和综合项目；开源项目拆解必须尊重项目原生技术栈与真实源码路径。
- 常青正文、前沿 Radar、版本化项目解剖和可运行实验必须分层，不能把快速变化的框架细节写成基础原理。
- 图片默认原创重绘。后续若直接复用素材，必须经过逐文件许可证与 `assets/provenance.yml` 门禁。
- 课程进度、书签与面试掌握度只存浏览器，不增加账号、后端、遥测或云同步。

## 3. 用户与学习结果

### 主要用户

1. 第一次系统学习 Agent 的后端开发者；
2. 已能调用模型，但缺少工具、状态、评测和安全体系的工程师；
3. 需要准备 Agent / AI 工程岗位面试的人；
4. 希望从课程跳转到真实项目源码和可运行实验的进阶读者。

### 第一阶段成功结果

读者进入 `/course/` 后，应在一分钟内回答：

- 我现在处于哪一阶段；
- 这一阶段的先修、学习目标和完成证据是什么；
- 哪些页面已经可学，哪些能力属于后续独立交付；
- 如何切换到目标导向的 `/paths/`；
- 已有阅读进度如何反映到课程阶段，而不需要重新记录。

## 4. 总课程关系

```text
基础认知
  └─ AI Native → Workflow / Agent → ReAct
       ↓
核心机制
  └─ 工具 / MCP → Context → 状态 / 记忆 → Graph → 多 Agent / A2A
       ↓
生产工程
  └─ 评测 / 可观测 → 安全 / 恢复 → Durable Execution → 灰度 / 回滚
       ↓
应用模式
  └─ 研究 → 客服运营 → Coding → Computer Use（高风险选修）
       ↓
项目拆解（第 2 子项目交付后接入）
  └─ MCP → Aider → OpenHands → SWE-bench / τ²-bench → Dify → CrewAI
       ↓
综合实战（第 3、4 子项目交付后接入）
  └─ Python Lab Kit → 交付型后端 Agent
```

这是一条依赖关系，不是强迫所有人线性通读。`/course/` 展示完整能力树，`/paths/` 从中选择适合目标的子序列。

## 5. 第一阶段公开信息架构

### 5.1 新路由

- `/course/`：唯一新增公开页面，展示课程总地图、四个已发布阶段、后续阶段关系和已有学习进度。

本阶段不创建 `/projects/*`、`/labs/*` 或综合项目页面。只有对应子项目通过独立设计与验收后，相关路由才进入导航和课程数据。

### 5.2 已发布阶段与现有页面映射

| 阶段 | 核心内容 | 现有页面 | 完成证据 |
| --- | --- | --- | --- |
| 01 基础认知 | AI Native、控制权、ReAct | 序章、第 1–3 章 | 能为任务选择 Prompt / Workflow / Agent，并写出停止条件 |
| 02 核心机制 | 工具、MCP、状态、记忆、Graph、多 Agent | 第 4–7 章；Context 与互操作专题 | 能画工具契约、状态边界和控制流 |
| 03 生产工程 | 评测、安全、恢复、生产化、长时运行 | 第 8–10 章；安全与 Durable 专题 | 能定义评测集、恢复协议、权限与上线门禁 |
| 04 应用模式 | 研究、客服运营、Coding、Computer Use | 第 11–14 章 | 能判断适用性、最低权限、人工接管与最终证据 |
| 05 项目拆解 | 当前仅有脱敏交付型案例作为预览 | `/case-study/delivery-agent` | 不把案例推演冒充公开项目源码事实 |
| 06 综合实战 | 说明与前五阶段的依赖关系 | 无公开任务入口 | 本阶段不计入完成度，不展示可点击占位项 |

阶段 05 只链接已经存在的交付型案例，并明确它是模式推演。阶段 06 只在课程关系图中说明后续方向，不渲染“开始实验”按钮，也不计入总进度。这样既呈现完整课堂体系，又不制造“已经有 Lab”的错觉。

### 5.3 二十个课程 item 权威表

下表是第一阶段实现的唯一课程集合。`prerequisites` 表示理解依赖，不表示读者必须按线性顺序解锁；页面始终允许直接访问。

| # | 稳定 ID | 规范路由 | 阶段 | prerequisites |
| ---: | --- | --- | --- | --- |
| 1 | `preface` | `/preface` | `foundation` | 无 |
| 2 | `chapter-01-ai-native` | `/chapters/01-ai-native` | `foundation` | `preface` |
| 3 | `chapter-02-workflow-agent` | `/chapters/02-workflow-agent` | `foundation` | `chapter-01-ai-native` |
| 4 | `chapter-03-react` | `/chapters/03-react` | `foundation` | `chapter-02-workflow-agent` |
| 5 | `chapter-04-tools-mcp` | `/chapters/04-tools-mcp` | `mechanisms` | `chapter-03-react` |
| 6 | `frontier-context-engineering` | `/frontier/context-engineering` | `mechanisms` | `chapter-03-react` |
| 7 | `chapter-05-state-memory` | `/chapters/05-state-memory` | `mechanisms` | `chapter-03-react` |
| 8 | `chapter-06-loop-graph` | `/chapters/06-loop-graph` | `mechanisms` | `chapter-05-state-memory` |
| 9 | `chapter-07-multi-agent` | `/chapters/07-multi-agent` | `mechanisms` | `chapter-06-loop-graph` |
| 10 | `frontier-interoperability-identity` | `/frontier/interoperability-identity` | `mechanisms` | `chapter-04-tools-mcp`, `chapter-07-multi-agent` |
| 11 | `chapter-08-evaluation` | `/chapters/08-evaluation` | `engineering` | `chapter-03-react` |
| 12 | `chapter-09-safety-recovery` | `/chapters/09-safety-recovery` | `engineering` | `chapter-04-tools-mcp`, `chapter-08-evaluation` |
| 13 | `chapter-10-production` | `/chapters/10-production` | `engineering` | `chapter-08-evaluation`, `chapter-09-safety-recovery` |
| 14 | `frontier-durable-execution` | `/frontier/durable-execution` | `engineering` | `chapter-05-state-memory`, `chapter-06-loop-graph`, `chapter-09-safety-recovery` |
| 15 | `frontier-agent-security-evaluation` | `/frontier/agent-security-evaluation` | `engineering` | `chapter-08-evaluation`, `chapter-09-safety-recovery` |
| 16 | `chapter-11-research-agent` | `/chapters/11-research-agent` | `applications` | `chapter-07-multi-agent`, `chapter-08-evaluation` |
| 17 | `chapter-12-service-operations-agent` | `/chapters/12-service-operations-agent` | `applications` | `chapter-04-tools-mcp`, `chapter-09-safety-recovery` |
| 18 | `chapter-13-coding-agent` | `/chapters/13-coding-agent` | `applications` | `chapter-04-tools-mcp`, `chapter-08-evaluation`, `chapter-09-safety-recovery` |
| 19 | `chapter-14-computer-use` | `/chapters/14-computer-use` | `applications` | `chapter-04-tools-mcp`, `chapter-09-safety-recovery` |
| 20 | `case-delivery-agent` | `/case-study/delivery-agent` | `projects` | `chapter-08-evaluation`, `chapter-09-safety-recovery`, `chapter-10-production` |

表中 20 条全部计入当前公开课程完成度。`capstone` 是 `relationship-only` 阶段，当前没有 item，不进入分母。前沿专题是已发布的深化内容，因此进入相应阶段和总分母；它们的成熟度仍由 `chapterMeta` 单独展示，课程地图不会把“已阅读”解释成“技术已稳定”。

## 6. `/course/` 与 `/paths/` 的职责边界

| 维度 | `/course/` 课程地图 | `/paths/` 阅读路径 |
| --- | --- | --- |
| 核心问题 | 完整知识体系是什么 | 针对当前目标先读什么 |
| 顺序 | 稳定的依赖顺序 | 小白 / 工程 / 面试三种子序列 |
| 内容来源 | 引用现有页面 | 引用同一批现有页面 |
| 个性化 | 只叠加完成状态，不改变课程结构 | 保存用户选择的路径并推荐下一站 |
| 状态写入 | 只读展示，不提供标记、书签或清除动作 | 继续拥有路径选择、已读和书签交互 |
| 未上线模块 | 只描述依赖关系，不产生链接和进度 | 不出现 |

课程地图不会复制章节摘要、面试答案或项目说明。每个课程项只有一句学习目的、先修关系、完成证据和原页面链接。

## 7. 数据边界与稳定接口

新增一个全站共享的 `contentRegistry`，作为稳定 `id + route + title` 的唯一数据源。`courseMap`、`readingPaths`、`chapterMeta`、面试题章节链接和 VitePress 导航都只保存或引用 item ID，不再各自硬编码同一路由和标题。

设计接口如下：

```ts
type CourseStageId =
  | 'foundation'
  | 'mechanisms'
  | 'engineering'
  | 'applications'
  | 'projects'
  | 'capstone'

type ContentItem = {
  id: string
  kind: 'chapter' | 'frontier' | 'case-study' | 'project' | 'lab' | 'capstone'
  title: string
  route: string
}

type CourseItem = {
  itemId: ContentItem['id']
  stageId: CourseStageId
  prerequisites: string[]
  outcome: string
  evidence: string
}

type CourseStage = {
  id: CourseStageId
  order: number
  title: string
  purpose: string
  availability: 'published' | 'relationship-only'
  itemIds: ContentItem['id'][]
}

type ReadingPathStep = {
  itemId: ContentItem['id']
  why: string
}
```

约束如下：

- `contentRegistry` 至少登记本设计 20 个课程 item，以及阅读路径会使用的术语表、面试索引和面试训练页；所有导航目标也必须先登记。
- `route` 必须对应构建产物中的公开页面；不存在的路由不能进入 registry。
- `id` 和规范化后的 `route` 都必须唯一，显示名称可以调整；其他数据文件只能引用已登记 ID。
- `prerequisites` 必须无环，且只能引用已登记 item。
- `readingPaths` 从当前 `{ path, title, why }` 迁移为 `{ itemId, why }`；运行时从 registry 派生 path 与 title。
- `chapterMeta` 以 `itemId` 为键；`InterviewQuestion` 保留 chapter 编号，但通过对应 chapter item ID 派生 path。
- `config.mts` 的顶栏、侧栏和页脚目标通过 registry 查询；配置中不再重复章节 route 与 title 字面量。
- localStorage 继续保存规范化 route 字符串，而不是 item ID，确保现有用户数据无需迁移。
- `relationship-only` 阶段可以说明依赖与未来验收条件，但 `itemIds` 必须为空，不计入进度，也不能渲染链接或动作。
- 后续项目页只有在页面、来源、固定 commit、许可证和验收同时就绪后，才作为 `project` 类型扩展进入目录。
- 后续 Lab 需要独立的运行元数据；课程目录不预先定义依赖、命令或“可运行”状态。

### 与现有 localStorage 的兼容

现有键保持不变：

- `agent-handbook:path`
- `agent-handbook:progress`
- `agent-handbook:bookmarks`
- `agent-handbook:interview-mastery`

课程地图通过 `CourseItem.itemId → contentRegistry.route` 与 `progress` 中的规范化路由求交集，计算阶段完成数。它不迁移、不重写、不清空现有数据。`/course/` 本身没有“标记已读”按钮；标记动作仍只存在于内容页底部和 `/paths/`。

新增一个不破坏现有调用方的状态读取接口：

```ts
type LearningStateRead =
  | { status: 'available'; state: LearningState }
  | { status: 'corrupt'; state: null }
  | { status: 'blocked'; state: null }
```

- 键不存在或合法空数组属于 `available`，显示 `0 / 20`；
- `getItem` 抛错属于 `blocked`，显示“本地进度不可用”；
- JSON 无法解析、不是数组或含非字符串元素属于 `corrupt`，显示“本地进度数据损坏”；
- `corrupt` 与 `blocked` 都不回退成“0 项完成”，也不覆盖、删除或修复原值；
- 现有 `loadLearningState()` 可以保留兼容包装，但 `/course/` 必须使用带状态结果的接口。

### 路由规范化算法

读取完成记录时，对 registry route 和 localStorage route 使用同一个纯函数：

1. 以站点 origin 为基准解析绝对或相对 URL；解析失败则视为未知项；
2. 只取 pathname，移除 query 与 hash；
3. 仅在路径等于 base 或以 `${base}/` 开头时移除 `/agent-engineering-for-beginners`；
4. 解码合法的百分号编码；解码失败则视为未知项；
5. 把重复斜杠折叠为一个；
6. 把末尾 `/index.html` 或 `/index` 归一到父目录；
7. 移除末尾 `.html`；
8. 除根路径外移除尾斜杠。

未知旧路由不参与课程分子或分母，但必须原样保留在 localStorage；课程页是只读投影，不触发清理。

## 8. 导航设计

### 桌面端

当前顶栏入口偏多。本阶段把顶栏收敛为四组：

1. **课程**：课程地图、开始阅读、三条阅读路径；
2. **实战**：仅链接当前已发布的交付型案例；后续项目页验收后再加入；
3. **前沿**：Radar 与四个前沿专题；
4. **复习**：面试训练、42 题索引、术语表。

GitHub 保留为图标入口。分组使用 VitePress 原生导航能力，保证键盘和移动端行为一致，不自建复杂菜单。

### 侧栏

侧栏顶部新增“课程入口”，只含 `/course/` 与 `/paths/`。下面保留四篇 14 章、案例、前沿层和随手查。项目与 Lab 路由未交付前不进入侧栏。

### 390px 移动端

- 课程阶段纵向排列，不把桌面宽图整体缩小；
- 每个阶段展示编号、目标、完成数和完整现有顺序；超过 4 项时用原生语义折叠控制视觉长度，静态 HTML 仍包含全部链接；
- 触控目标至少 44px；
- 不出现页面级横向滚动；
- 路线和课程的当前状态同时使用文本与形状，不只依赖颜色。

## 9. 页面结构与视觉语言

`/course/` 延续当前“工程手册 + 编辑式排版”的低干扰风格，不做常见仪表盘卡片墙。

页面从上到下为：

1. 一句话说明“这是完整课程地图，不是另一份正文”；
2. 六阶段关系图，阶段 1–4 为已发布，阶段 5 显示已有案例入口，阶段 6 只说明后续依赖；
3. 已发布阶段的纵向课程轨道；
4. 当前本地进度摘要；
5. `/paths/` 的明确跳转；
6. 关于项目拆解、Lab 与综合项目的范围说明。

视觉使用细线轨道、阶段编号、少量语义色和充足留白。深浅色沿用现有 token；不增加大面积高饱和背景、浮动面板或持续动画。

## 10. 状态与数据流

```text
course catalog（只读、构建时校验）
       │
       ├── 渲染课程阶段、先修、成果与现有链接
       │
localStorage progress（可选、浏览器本地）
       │
       └── 按 route 求交集 → 阶段完成数 / 总完成数

/paths/ selectedPath ── 只影响下一站推荐，不改变课程地图顺序
```

课程页不发网络请求，不记录访问，不上传进度。页面首次静态渲染时展示完整课程内容和“本地进度将在页面加载后显示”的中性文案；hydration 后按带状态读取结果显示完成数或错误提示，避免无 JavaScript 用户看到错误状态。

### 完成度与当前阶段算法

- **阶段分母：** 该 `published` 阶段 `itemIds` 的数量；阶段 1–5 分母之和固定为 20。
- **阶段分子：** 对完成记录规范化、去重后，与该阶段已发布 item route 的交集数量。
- **总完成度：** 五个 `published` 阶段的分子之和除以 20；`relationship-only` 阶段完全排除。
- **当前阶段：** 从顺序 1–5 找到第一个“分子 < 分母”的阶段；不使用“最近访问”推断。
- **全部完成：** 显示“当前公开课程已完成 · 20 / 20”，不把尚未交付的综合实战标成待完成，也不生成下一站链接。
- **状态不可读：** `corrupt` 或 `blocked` 时不计算当前阶段和完成度，只展示完整课程结构与对应错误提示。
- **同步来源：** 用户在内容页或 `/paths/` 标记后，`/course/` 通过既有同页事件和 `storage` 事件重新读取；课程页自己不写状态。

## 11. 失败与降级

- **localStorage 禁用或读取抛错：** 返回 `blocked`；不阻断课程地图和跳转，显示“本地进度不可用”。
- **localStorage JSON 损坏或类型错误：** 返回 `corrupt`；显示“本地进度数据损坏”，不把它静默解释成全新用户，也不覆盖原值。
- **课程数据引用不存在的页面：** 测试和构建失败，不发布死链接。
- **先修关系成环：** 数据校验失败，并打印涉及的 item ID。
- **后续阶段未交付：** 不生成链接、按钮、完成度或“即将上线”卡片；只保留课程关系说明。
- **JavaScript 禁用：** 课程阶段、学习目标、现有链接和后续边界仍完整可读；个性化进度保持中性。
- **移动端空间不足：** 关系图重排为语义有序列表，不缩成不可读小字。
- **现有学习状态含未知路由：** 忽略未知项，不删除用户数据，避免未来或旧版本状态被破坏。

## 12. 测试与验收

### 自动化

- 权威表的 20 个 item 与实现数据逐行一致；序章、14 章、4 个前沿专题和案例均且仅出现一次；
- `contentRegistry` 中 ID 与规范化 route 唯一，course、paths、chapterMeta、interview 和 VitePress config 不再重复声明 route/title；
- 每个 route 对应真实 Markdown 或构建产物；没有 `/projects/*`、`/labs/*` 死链接；
- 先修关系存在且无环；阶段引用只指向已登记 item；
- `/course/` 与顶栏、侧栏入口存在；所有旧 URL 保持不变；
- `/course/` 不复制章节长段落，不包含面试答案数据；
- 完成度分母固定为 20，`relationship-only` 排除，当前阶段与全部完成状态符合定义；
- 路由规范化覆盖 base、query、hash、`.html`、`/index.html`、重复斜杠、尾斜杠、非法编码和未知旧路由；
- `available / corrupt / blocked` 三类读取状态有独立测试，损坏数据不会被覆盖或清除；
- 课程完成度只读取现有 progress key，不新增账号、网络请求或云存储，也不在 `/course/` 提供写按钮；
- 无 JavaScript 静态 HTML 包含全部课程链接与中性状态；
- process docs 继续不进入 dist。

### 浏览器

- 1440px 与 390px，亮色与深色各检查一次；
- 键盘可按视觉顺序访问课程入口，焦点清晰；
- 读屏能读出“课程阶段列表、阶段标题、完成数、课程项和先修说明”；
- localStorage 正常、禁用、损坏三种状态均可使用页面；
- 在内容页或 `/paths/` 标记现有章节完成后，`/course/` 同步显示；
- 页面宽度等于视口宽度，不发生整页横向溢出；
- 已有章节、路径、Radar、面试和案例路由抽检均为 HTTP 200。

## 13. 非目标

本阶段不做以下事项：

- 不编写项目拆解正文，不固定项目 commit；
- 不创建 Python 包、虚拟环境、fixture 或实验命令；
- 不实现 MCP Server、Aider/OpenHands 复现或 benchmark；
- 不新增面试题，不改现有 42 题答案；
- 不下载或复用外部图片，不创建项目截图；
- 不改写 14 章事实内容；
- 不新增账号、后端、遥测、证书或排行榜；
- 不把未交付模块做成可点击的占位功能。

## 14. 后续三个子项目的接入契约

### 子项目 2 · 项目拆解页

每个项目通过独立设计后，提供已存在的公开 route、固定 commit、许可证与源码事实标签，才能加入 `CourseItem`。MCP 必须分别引用规范仓库与官方 Python SDK；大型项目只选一条纵向调用链。

### 子项目 3 · Python Lab Kit

Lab 通过独立数据文件登记运行方式，默认 fake provider + 固定 fixture、离线可通过，并写明耗时、环境、预期输出、成本上限与清理命令。只有验收通过的 Lab 才进入课程地图。

### 子项目 4 · 综合项目

综合项目按 Workflow、工具、状态、评测、安全、上线逐步升级。Computer Use 保持选修，不进入后端必修主链。综合项目必须复用中央题库 ID、来源索引和资产 provenance，不建立第二套平行系统。

## 15. 第一阶段交付清单

设计获批后，第一阶段实施只允许：

- 新建 `/course/` 页面；
- 新建课程目录数据与必要的纯展示/本地进度组件；
- 调整顶栏与侧栏分组；
- 为课程目录、旧链接、localStorage 降级和可访问性增加测试；
- 更新 README 的课程入口说明。

任何项目拆解、Python 实验、图片资产或综合项目代码必须进入后续独立规格，不得借第一阶段顺带实现。

## 16. 设计自审

- 文档没有未决占位项，Python 主线与四子项目边界明确；
- `/course/` 和 `/paths/` 职责不重叠；
- 现有 URL、内容事实与本地学习状态保持兼容；
- 后续阶段有稳定接入条件，但没有公开死链接或假功能；
- 无账号、后端、外部图片复用或内容复制；
- 路由、数据、失败降级、测试、移动端、键盘、读屏和深浅色验收均有明确标准。

