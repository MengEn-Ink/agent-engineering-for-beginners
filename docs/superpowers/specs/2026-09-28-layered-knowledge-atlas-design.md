# 分层知识图谱设计

**状态：** 待读者视角、数据契约与范围一致性复核
**阶段：** 课程化重构的独立设计阶段
**设计基线：** `main@ccc1993492e95b1e8119a0758d2e371acda56662`

## 1. 决策摘要

本阶段新增一套“分层知识图谱”，把现有首页、课程地图、三条阅读路径、14 章正文、4 个前沿专题、8 个项目页面、交付型案例、42 道面试题和完成证据串成同一个可导航的知识空间。

它不是一张无限缩放、自由拖拽的巨型脑图，也不复制现有正文。它回答三个读者问题：

1. 整本书围绕哪条系统主线展开；
2. 我现在位于哪一层、依赖什么、关联哪些真实项目；
3. 下一步为什么读那里，读完应留下什么证据。

推荐交付为一个独立 `/atlas/` 入口和章节内的轻量“你在这里”条带。总图采用同一数据、四种镜头：

1. Agent 运行关系图；
2. 工程生命周期图；
3. 章节 × 项目 × 产物矩阵；
4. 先修依赖图。

Release A 只交付知识关系层：`/atlas/` 四视图、章节 location strip 和入口接线。图谱可以只读叠加现有“已读”状态，但不新增学习状态写操作。阶段检查点与成果档案属于独立的 `learning-artifact-portfolio` 后续规格，不阻塞关系层上线。

## 2. 当前事实与主要缺口

### 2.1 已有能力

当前书已经具备：

- 首页的七个核心问题：目标、上下文、工具、状态、控制流、验证、边界；
- 首页的四幕结构：认识 Agent、组装 Agent、敢于上线、进入应用；
- `courseMap` 中 26 个课程项、六个阶段、先修关系、学习结果和完成证据；
- 小白入门、工程实战、面试冲刺三条阅读路径；
- 14 章正文、4 个前沿专题、8 个项目页和 1 个交付型案例；
- 本地已读、书签、当前路线和“下一站”推荐；
- 42 道面试题及按章节回链；
- 项目页到相关章节的少量映射，以及项目内部的固定源码调用链。

### 2.2 事实证据

当前线上课程页能显示 26 个课程项，25 个项目带先修说明，但没有可视化依赖图；课程页和阅读路径页的图形节点数为 0。

首页的七个问题、四幕结构、课程阶段和项目阅读顺序分别存在于不同页面。读者需要自己把这些分类体系拼起来。

14 个章节正文没有显式站内章间链接。章节末尾只在当前选中路径中给出“下一站”，不展示反向依赖、相关项目、同一概念的其他章节或全局位置。

项目页会回链 1–3 个相关章节，但项目总览没有提供“哪个项目验证哪个章节、对应什么学习产物”的全局矩阵。

现有学习状态只有已读和书签。`courseMap` 已定义每项的完成证据，但读者没有一个统一位置查看阶段检查点和已完成成果。

### 2.3 五个最明显的缺口

1. **缺少唯一的全书心智模型。** 首页、课程、路径和项目各自正确，但没有统一视图解释它们的关系。
2. **缺少章节定位与双向关系。** 读者能知道下一站，却不知道“我在哪里、为什么在这里、哪些后续内容依赖本章”。
3. **缺少理论到源码的横向映射。** 章节与项目之间的关系散落在页面内，无法按概念或工程问题反查。
4. **缺少阶段性反馈。** 已读是行为记录，不等于完成了本阶段应留下的图、协议、清单或评测证据；本规格只让这些既有 evidence 在关系图中可见，交互式成果档案另立项目。
5. **缺少关系型复习入口。** 术语、面试题、前沿专题和历史反例能单独访问，但不能从一个概念看到相关章节、项目、题目和失败边界。

## 3. 目标与成功标准

### 3.1 目标

- 首次访问者在 30 秒内理解全书的七个问题和一条 Agent 运行闭环；
- 任一章节读者都能一眼确认当前位置、关键先修、后续分支、相关项目和完成证据；
- 工程读者能从一个问题反查正文、前沿专题、真实源码、案例与评审产物；
- 复习读者能按概念而不是目录定位面试题、术语和失败模式；
- 所有关系保持机器可校验，并继续复用现有权威 ID、路由和标题。

### 3.2 可验收标准

- `/atlas/` 首屏最多显示七个主轴节点，不出现不可读的全量毛线团；
- 四个视图都能独立回答一个明确问题，并以语义化列表或表格作为 SSR/no-JavaScript 主契约；视觉关系图只做增强；
- 26 个课程项全部映射到至少一个核心问题、一个生命周期阶段和一个完成产物；
- 6 个核心项目、1 个交付型案例、1 个历史反例页都能在矩阵中定位；
- 每个纳入课程或阅读路径的页面都能显示“你在这里”；
- 所有边引用已存在的 content ID、project page ID 或 interview question ID；
- course denominator 仍为 26，既有路由和本地学习记录继续有效；
- 390px、读屏、键盘、SSR、no-JavaScript、打印和 Pages 构建全部通过。

## 4. 方案比较

### 4.1 方案 A：一张巨型思维导图

把章节、概念、项目、问题和产物全部放在一个自由缩放画布中。

优点是视觉冲击强、关系似乎“一图尽览”。缺点是节点和连线很快失控，移动端、键盘、读屏、打印和 no-JavaScript 都难以成立；读者看见的是关系数量，不是学习决策。

**结论：不采用。**

### 4.2 方案 B：分层知识图谱

以七个核心问题为稳定主轴，通过运行、生命周期、横向矩阵和先修关系四个视图逐层展开；每个视图只显示完成当前任务所需的关系。

优点是能复用现有数据，适合渐进展开，并能为移动端、读屏和打印提供等价列表或表格。缺点是需要定义清楚边类型和多个视图之间的职责。

**结论：推荐并采用。**

### 4.3 方案 C：线性故事地图

用一条从 Prompt 到生产的长时间线串联全书。

优点是初学者容易跟随；缺点是难以表达多条阅读路径、项目横向映射和可回访的概念关系，最终仍会退化成另一份目录。

**结论：保留为运行关系图和生命周期图的叙事方式，不作为唯一结构。**

## 5. 全局信息架构

### 5.1 新入口

新增 `/atlas/`，名称为“全书总图”。它注册在 `contentRegistry`，进入侧栏“课程入口”，但不进入顶栏主导航，也不进入 `courseMap`、完成度分母或任何阅读路径的必读站点。

首页在七个问题之后增加“打开全书总图”入口；`/course/` 顶部和所有章节的 location strip 提供文字链接，不复制图谱内容。`/paths/` 继续承担目标导向路线选择，不额外增加同权重入口。

### 5.2 第一屏：七个核心问题

第一屏固定为七个节点：

1. 目标：到底交付什么；
2. 上下文：此刻知道什么；
3. 工具：能对世界做什么；
4. 状态：当前做到哪里；
5. 控制流：下一步由谁决定；
6. 验证：怎样证明做对；
7. 边界：何时停止、恢复或交人。

模型不是第八个核心问题，而是运行关系图中的决策组件；它必须持续接受目标、上下文、控制流、验证和边界的共同约束。

节点显示一句解释、对应课程项数量和明确标注的“已读 X / Y”。分母是映射到该问题的 CourseItem 去重集合，分子只读取现有 completed routes；不混入成果状态或面试掌握度。点击节点只过滤下方视图，不跳到自由画布。

### 5.3 四个视图

#### 视图一：Agent 运行关系图

回答“一个 Agent 任务实际怎样运行”。稳定主链是：

`目标与输入 → 上下文选择 → 模型决策 → 工具动作 → 观察与状态 → 控制下一步 → 验证与证据 → 边界/人工接管`

每个运行节点映射到七个问题、主章节、前沿专题和一个代表项目。`runtime-boundary-handoff → runtime-goal-input` 是反馈 loop edge，不是第九个节点。它不是代码调用链，而是全书共用的系统模型。

#### 视图二：工程生命周期图

回答“团队怎样把一个想法做成可运营系统”。稳定阶段是：

`定义目标与基线 → 选择控制方式 → 设计契约、上下文和状态 → 实现最小执行闭环 → 构建评测与证据 → 加权限、恢复与接管 → 灰度发布与运营 → 复盘、扩权或退役`

生命周期固定为上述八个节点。`lifecycle-improve-retire → lifecycle-scope` 是“事故进入回归/下一轮基线”的反馈边，不是第九个节点。章节 8–10 是发布门，章节 11–14 是应用分支，交付型案例负责收束。

#### 视图三：章节 × 项目 × 产物矩阵

回答“理论在哪学、源码在哪看、读完留下什么、怎样复习”。主行以 chapter/frontier CourseItem 为 anchor，固定表达以下列顺序：

`概念 → 核心章节/前沿专题 → 开源项目或交付型案例 → 完成证据 → 面试题`

视觉矩阵的列顺序必须与该关系链相同。完成证据先于面试题，避免把“会回答”误当成“会交付”。chapter/frontier 行必须有 concept 和现有 course evidence；project 与 interview question 均允许 `0..n`，空值明确显示“暂无直接落点”，不得为了填满矩阵制造关系。

六个核心项目和交付型案例通过 `applies` 关系进入项目列。历史反例页只通过 `revisit` 关系作为注释出现，不建立虚构 evidence；项目 overview 不算证据项目，也不占主行。

矩阵默认只显示当前核心问题的一组行，支持按阶段、内容类型和项目筛选。单元格只引用现有 ID，并显示由 registry 解析出的标题和路由。

#### 视图四：先修依赖图

回答“为什么先读这一章，以及下一步可以去哪”。

主边来自 `courseMap.prerequisites`，不手抄第二份依赖。视图支持按六个阶段折叠，默认只显示当前阶段、直接前置和直接后续；完整 DAG 通过“展开全部”查看。

边必须带文字类型，不只依靠颜色或箭头：

- `先修`：理解本内容前建议先掌握；
- `展开`：同一概念的更深入说明；
- `应用`：理论在项目或案例中的落点；
- `复习`：术语或面试题回到原章节。

## 6. 章节“你在这里”

`publishedCourseItems` 与三条 `readingPaths` 的路由联集是 location strip 的权威范围，当前精确为 29 页。组件通过全局 Layout 的 `doc-before` slot 注入，位置固定为文档正文容器入口；不要求位于 Markdown 内手写的 freshness 组件之后。

26 个 CourseItem 使用 course variant：当前阶段与序号、1–2 个核心问题、直接先修、直接后续、相关项目或案例、现有完成证据和 atlas 定位链接。

3 个复习 appendix 使用 review variant：复习工具类型、可派生的关联章节、在 interview reading path 中的前后站、返回 `/paths/` 和 atlas 定位链接。它们不显示虚构的阶段、先修或 evidence。

位置条带不复制章节摘要，不替代侧栏，也不自动改变当前阅读路径。它通过全局 Layout 的 route-based 注入挂载，组件按当前 route 查询统一关系索引；不得修改 29 个 Markdown 文件来手写阶段、先修、项目或产物元数据。

反向关系由统一索引推导：如果 B 的 prerequisites 包含 A，A 页面自动显示 B 为后续分支。项目映射同样生成双向关系，章节不手写 backlink。

## 7. 后续成果档案接入契约

阶段检查点与贯穿式成果档案不属于 Release A，不创建组件、localStorage key、三态状态机或写操作，也不进入本轮成功标准、任务拆分和发布门禁。

关系层只展示现有 `courseMap.evidence` 文案，让读者知道每页应该留下什么。未来独立的 `learning-artifact-portfolio` 规格若获批准，必须：

- 继续以现有 course item ID 作为成果身份，不创建第二套 artifact ID；
- 把成果状态与“已读”和面试掌握度分开；
- 使用独立、带版本号的本地存储，不改变当前 path/progress/bookmark key；
- 不上传正文、文件或敏感数据，不引入账号、后端或云同步；
- 通过 atlas 的稳定只读接口叠加状态，不能让 portfolio 成为关系数据的权威来源。

## 8. 数据契约

### 8.1 现有权威来源

- `contentRegistry`：页面 ID、路由、标题、内容类型；
- `courseMap`：阶段、先修、学习结果、完成证据；
- `readingPaths`：三条目标导向顺序；
- `project-index.yml`：项目页、subject、固定源码入口、调用链、许可证与面试题；
- interview registry：42 道题的 ID 与章节归属。

### 8.2 七问题稳定 ID

七问题从首页硬编码迁移为唯一数据源，首页和 atlas 共用同一数组：

| ID | 标题 | 一句解释 |
| --- | --- | --- |
| `goal` | 目标 | 到底交付什么？ |
| `context` | 上下文 | 此刻知道什么？ |
| `tools` | 工具 | 能对世界做什么？ |
| `state` | 状态 | 现在做到哪？ |
| `control-flow` | 控制流 | 下一步由谁决定？ |
| `validation` | 验证 | 怎么证明做对？ |
| `boundary` | 边界 | 何时停下、恢复或交人？ |

首页不得再保留第二份七问题文案。七问题节点只显示“已读 X / Y”，其中 Y 是映射到该问题的 CourseItem 去重数，X 来自现有 completed route；不混入成果或面试掌握度。

### 8.3 Runtime 节点

| ID | 节点 | 主要问题 | 代表项目/案例 ID |
| --- | --- | --- | --- |
| `runtime-goal-input` | 目标与输入 | `goal` | `case-delivery-agent` |
| `runtime-context` | 选择与组装上下文 | `context` | `project-aider` |
| `runtime-model-decision` | 模型形成候选决策 | `control-flow` | `project-crewai` |
| `runtime-tool-action` | 工具执行动作 | `tools` | `project-mcp-python-sdk` |
| `runtime-observe-state` | 读取观察并更新状态 | `state` | `project-openhands` |
| `runtime-control-next` | 分支、循环、汇合与暂停 | `control-flow` | `project-dify` |
| `runtime-verify-evidence` | 验证结果、轨迹与证据 | `validation` | `project-agent-benchmarks` |
| `runtime-boundary-handoff` | 停止、恢复与人工接管 | `boundary` | `case-delivery-agent` |

运行图顺序固定，最后一项回到第一项形成反馈边。代表项目只用于说明，不改变项目页的权威事实或课程归属。

### 8.4 Lifecycle 节点

| ID | 阶段 | 代表内容 ID | 代表项目/案例 ID |
| --- | --- | --- | --- |
| `lifecycle-scope` | 定义目标与基线 | `chapter-01-ai-native` | `case-delivery-agent` |
| `lifecycle-select-control` | 选择控制方式 | `chapter-02-workflow-agent` | `project-dify` |
| `lifecycle-design-contracts` | 设计契约、上下文和状态 | `chapter-04-tools-mcp` | `project-mcp-python-sdk` |
| `lifecycle-build-loop` | 实现最小执行闭环 | `chapter-03-react` | `project-aider` |
| `lifecycle-evaluate` | 构建评测与证据 | `chapter-08-evaluation` | `project-agent-benchmarks` |
| `lifecycle-secure-recover` | 加权限、恢复与接管 | `chapter-09-safety-recovery` | `project-openhands` |
| `lifecycle-release-operate` | 灰度、发布与运营 | `chapter-10-production` | `case-delivery-agent` |
| `lifecycle-improve-retire` | 复盘、扩权或退役 | `chapter-10-production` | `project-history-autogpt-flowise` |

生命周期视图允许 `lifecycle-improve-retire → lifecycle-scope` 的反馈边，不允许其他未声明跳转。

### 8.5 26 个 CourseItem 的完整主映射

每项必须有 1–2 个 primary question、恰好 1 个 primary lifecycle stage，并允许最多 1 个 secondary lifecycle stage：

| CourseItem ID | Primary question | Primary lifecycle | Secondary lifecycle |
| --- | --- | --- | --- |
| `preface` | `goal`, `boundary` | `lifecycle-scope` | — |
| `chapter-01-ai-native` | `goal`, `boundary` | `lifecycle-scope` | `lifecycle-select-control` |
| `chapter-02-workflow-agent` | `goal`, `control-flow` | `lifecycle-select-control` | `lifecycle-build-loop` |
| `chapter-03-react` | `control-flow`, `state` | `lifecycle-build-loop` | `lifecycle-design-contracts` |
| `chapter-04-tools-mcp` | `tools`, `boundary` | `lifecycle-design-contracts` | `lifecycle-secure-recover` |
| `frontier-context-engineering` | `context`, `boundary` | `lifecycle-design-contracts` | `lifecycle-build-loop` |
| `chapter-05-state-memory` | `state`, `context` | `lifecycle-design-contracts` | `lifecycle-secure-recover` |
| `chapter-06-loop-graph` | `control-flow`, `state` | `lifecycle-build-loop` | `lifecycle-secure-recover` |
| `chapter-07-multi-agent` | `control-flow`, `boundary` | `lifecycle-build-loop` | `lifecycle-evaluate` |
| `frontier-interoperability-identity` | `tools`, `boundary` | `lifecycle-design-contracts` | `lifecycle-secure-recover` |
| `chapter-08-evaluation` | `validation` | `lifecycle-evaluate` | `lifecycle-release-operate` |
| `chapter-09-safety-recovery` | `boundary`, `validation` | `lifecycle-secure-recover` | `lifecycle-release-operate` |
| `chapter-10-production` | `validation`, `boundary` | `lifecycle-release-operate` | `lifecycle-improve-retire` |
| `frontier-durable-execution` | `state`, `boundary` | `lifecycle-secure-recover` | `lifecycle-release-operate` |
| `frontier-agent-security-evaluation` | `validation`, `boundary` | `lifecycle-evaluate` | `lifecycle-secure-recover` |
| `chapter-11-research-agent` | `context`, `validation` | `lifecycle-build-loop` | `lifecycle-evaluate` |
| `chapter-12-service-operations-agent` | `tools`, `boundary` | `lifecycle-release-operate` | `lifecycle-secure-recover` |
| `chapter-13-coding-agent` | `tools`, `validation` | `lifecycle-build-loop` | `lifecycle-evaluate` |
| `chapter-14-computer-use` | `tools`, `boundary` | `lifecycle-secure-recover` | `lifecycle-release-operate` |
| `project-mcp-python-sdk` | `tools`, `boundary` | `lifecycle-design-contracts` | `lifecycle-build-loop` |
| `project-aider` | `context`, `validation` | `lifecycle-build-loop` | `lifecycle-evaluate` |
| `project-openhands` | `state`, `boundary` | `lifecycle-release-operate` | `lifecycle-secure-recover` |
| `project-agent-benchmarks` | `validation` | `lifecycle-evaluate` | `lifecycle-improve-retire` |
| `project-dify` | `control-flow`, `state` | `lifecycle-build-loop` | `lifecycle-release-operate` |
| `project-crewai` | `control-flow`, `boundary` | `lifecycle-build-loop` | `lifecycle-evaluate` |
| `case-delivery-agent` | `validation`, `boundary` | `lifecycle-release-operate` | `lifecycle-improve-retire` |

### 8.6 关系边契约

| 边类型 | From | To | 基数 | 来源与闭环规则 |
| --- | --- | --- | --- | --- |
| `prerequisite` | CourseItem | CourseItem | 除 `preface` 外每项 `1..n` 入边 | 完全派生自 `courseMap.prerequisites`；必须无环 |
| `applies` | chapter/frontier | core project/case | `0..n` | 完全由 7 个 project/case CourseItem 的 prerequisite 反向派生；不得手写、不得成环 |
| `assessed-by` | chapter | interview question | 每章恰好 3 | 由 question.chapter 与 `chapter-NN-*` content ID 派生 |
| `revisit` | chapter/frontier/project | review appendix 或 historical page | `0..n` | 人工策展；允许形成复习闭环；不参与先修拓扑排序 |

`evidence` 不是统一 relation graph 的边，而是 CourseItem 的派生展示字段和 crosswalk 列；即使视觉组件画出连接线，也不创建 target ID。只有 `revisit` 可以形成闭环。任何人工 `revisit` 边都必须同时声明 source/target kind，构建时验证目标 ID 与允许基数。

Release A 的 `applies` 全部从 7 个 project/case CourseItem 的 prerequisites 反向派生，不手写。Release A 不需要 `expands`，因此不定义该边类型。

完整人工边只有以下 `revisit`：

| Edge ID | Type | Source ID | Target ID | 理由 |
| --- | --- | --- | --- | --- |
| `revisit-glossary-control` | `revisit` | `chapter-02-workflow-agent` | `appendix-glossary` | 复习 Prompt、Workflow、Agent 控制方式术语 |
| `revisit-glossary-tools` | `revisit` | `chapter-04-tools-mcp` | `appendix-glossary` | 复习工具、契约、MCP 与权限术语 |
| `revisit-glossary-state` | `revisit` | `chapter-05-state-memory` | `appendix-glossary` | 复习状态、记忆、知识与审计分层 |
| `revisit-glossary-graph` | `revisit` | `chapter-06-loop-graph` | `appendix-glossary` | 复习节点、边、检查点与汇合术语 |
| `revisit-glossary-evaluation` | `revisit` | `chapter-08-evaluation` | `appendix-glossary` | 复习结果、轨迹、证据和运行指标 |
| `revisit-glossary-safety` | `revisit` | `chapter-09-safety-recovery` | `appendix-glossary` | 复习权限、幂等、补偿和人工接管 |
| `revisit-history-control` | `revisit` | `chapter-02-workflow-agent` | `project-history-autogpt-flowise` | 用历史反例复盘控制方式选择 |
| `revisit-history-coordination` | `revisit` | `chapter-07-multi-agent` | `project-history-autogpt-flowise` | 用历史反例复盘协调成本 |
| `revisit-history-production` | `revisit` | `chapter-10-production` | `project-history-autogpt-flowise` | 用历史反例复盘维护、迁移和退役 |

### 8.7 Crosswalk 行与空值

Crosswalk 主行只以 `preface`、14 个 chapter 和 4 个 frontier CourseItem 为 anchor，共 19 行。每行必须有 concept、内容链接和现有 evidence；project/case 和 interview question 是 `0..n`。

项目列由 `applies` 反向索引生成。没有直接项目或题目的单元格显示“暂无直接落点”，不创建占位 ID。`project-history-autogpt-flowise` 只经 `revisit` 作为历史注释出现；`projects-index` 不进入项目证据列。

### 8.8 Location strip 的两种 variant

29 个唯一页面分成两种显示契约：

- **Course variant（26 页）：** 当前阶段/序号、primary question、直接先修、直接后续、相关项目、现有 evidence、atlas 定位链接；
- **Review variant（3 页）：** `appendix-glossary`、`appendix-interview`、`appendix-interview-training`。只显示“复习工具”、已有关系索引能推导的关联章节、在 interview reading path 中的前后站和返回 `/paths/`；不伪造 course stage、prerequisite 或 evidence。

Review variant 的章节关系来源：interview 与 training 从 42 题 chapter 字段派生；glossary 只使用人工 `revisit` 边。29 个唯一 ID 的集合必须与 published CourseItem 和 readingPaths 的去重联集精确相等。

### 8.9 新增数据只拥有什么

新增 `knowledgeAtlas` 数据只能拥有：

- 七个核心问题的稳定 ID、顺序和一句解释；
- 运行关系图与生命周期图中不能从现有数据推导的稳定概念节点；
- 内容 ID 到核心问题、生命周期阶段的人工策展映射；
- Release A 无法从既有数据派生的完整 `revisit` 边表；
- 每个视图的显示顺序和默认折叠策略。

它不得复制 route、title、navTitle、project name、commit、license、question text、course outcome 或 evidence 文案。

### 8.10 派生关系

- `prerequisite` 边从 `courseMap` 派生；
- 页面标题和 URL 从 `contentRegistry` 派生；
- project page 到章节的关系优先从课程先修和项目 catalog 映射派生；
- crosswalk 的完成证据列从课程项 `evidence` 派生，不生成 graph edge；
- question 回链从 interview ID registry 派生；题目现有的 chapter 数字通过唯一的 `chapter-NN-*` content ID 映射到章节，不手写另一份题目到章节表；
- 反向边在构建时生成，不写入源数据。

### 8.11 校验规则

- 所有内容引用必须命中已登记 ID；
- 每个公开课程项至少映射一个核心问题、生命周期阶段和产物；
- 每个核心问题至少有一个核心章节，且 runtime 节点表为其声明至少一个代表 project/case 工程落点；两处必须使用同一 project/case ID；
- 先修图无环，非先修关系边允许闭环但必须有类型；
- 边不得自指或重复；
- 不得出现第二份标题、路由或完成证据；
- 项目、面试题和前沿专题的关系必须引用现有 ID；
- course denominator、reading paths 和既有 localStorage key 不因图谱变化而改变。

## 9. 组件与交互边界

建议组件边界：

- `KnowledgeAtlas`：页面总控、当前层和过滤条件；
- `AtlasSpine`：七个核心问题；
- `AtlasRuntime`：运行闭环；
- `AtlasLifecycle`：工程生命周期；
- `AtlasCrosswalk`：章节 × 项目 × 产物矩阵；
- `AtlasPrerequisites`：先修 DAG；
- `AtlasLocation`：route-based 的“你在这里”。

交互只包括层切换、过滤、展开、聚焦和跳转。没有自由拖拽、任意缩放、编辑节点、保存布局或多人协作。

URL hash 保存当前视图和节点，例如 `#runtime-validation`，便于章节“在总图中查看”直接定位；无效 hash 回到七问题总览，不影响页面加载。

## 10. 渐进披露与视觉规则

- 首屏最多七个核心节点；
- 单个视图默认不同时展示超过 12 个主要节点；
- 次级节点通过阶段、过滤或 details 展开；
- 关系必须同时使用文字标签和视觉样式；
- 不用颜色深浅表达完成状态的唯一含义；
- 不把所有内容做成同权重卡片；
- 图中只显示短标签，完整解释位于相邻文本或详情区；
- 项目、章节、前沿、复习和产物使用稳定但克制的视觉区分。

## 11. SSR、no-JavaScript、移动端、打印与读屏

### 11.1 SSR 与 no-JavaScript

服务器 HTML 必须包含：

- 七个核心问题；
- 四个视图的标题、摘要和语义列表或表格；
- 所有当前可见节点的真实 anchor；
- 先修与边类型的可读文本；
- crosswalk 中从现有 CourseItem 派生的完成证据。

语义列表和表格是所有环境的主内容契约，不是视觉图失败后才出现的简化替代。JavaScript 只增强筛选、当前节点高亮和本地进度，不负责提供核心关系。

### 11.2 移动端

390px 下不缩放成微型画布。运行图和生命周期图改为纵向步骤；先修图改为“当前节点 + 前置 + 后续”列表；矩阵改为按问题分组的行式详情。

所有页面和关键容器满足 `scrollWidth <= clientWidth`，技术长 token 使用专用换行规则。

### 11.3 打印

打印时展开四个视图的主语义列表/表格、边图例和当前筛选摘要；隐藏交互控件，不隐藏节点关系、路由或完成证据。使用白底深字，避免空白尾页。

### 11.4 读屏与键盘

- 每个图有明确名称、摘要和操作说明；
- 图结构使用原生 heading、nav、ol/li、table；
- 可视增强与主语义结构不能被重复朗读；
- 层切换、过滤和节点链接均可键盘操作并有可见焦点；
- 当前位置使用 `aria-current`，展开状态使用原生 `details` 或正确的 `aria-expanded`；
- 连线不是唯一关系表达，读屏能读出“先修”“应用”“证据”等边类型。

## 12. 失败与降级行为

- 数据引用不存在、边重复、先修成环或映射缺失：构建失败；
- 现有 localStorage 不可用或数据损坏：图谱内容正常显示，“已读 X / Y”叠加显示不可用提示；本阶段不写入新状态；
- URL hash 不合法：忽略并回到默认视图；
- 图形增强运行失败：主语义列表和表格保持完整；
- 当前页面不在 atlas 映射：不渲染位置条带，并在测试中报告遗漏；
- 关系过密：保持默认折叠，不通过缩小字体或隐藏文字解决；
- 打印分页异常：优先改布局和 break 规则，不删内容或放宽空白页判定。

## 13. 测试与验收

### 13.1 数据测试

- 七个核心问题 ID、顺序和数量精确；
- 26 个课程项映射完整；
- 26 项中只有序章无先修，其余 25 项的先修边与 `courseMap` 逐项相等，图谱不得重录第二份 DAG；
- 关系引用、反向边、产物和 interview ID 闭合；
- 没有重复 route/title/evidence 字段；
- course denominator、三条 reading paths、项目 inventory 不漂移。

### 13.2 SSR 与组件测试

- `/atlas/` SSR 含七问题、四视图、图例和主语义列表/表格；
- 每个 tracked 页面 SSR 含正确位置条带；
- hash 定位、层切换、过滤和无效输入行为确定；
- 现有已读状态的可用、损坏和存储不可用分支可测；本阶段不得新增 localStorage key；
- no-JavaScript 页面能阅读并访问全部核心关系。

### 13.3 浏览器验收

- `/atlas/` 与至少四类代表页覆盖 1440px light、390px dark；
- 键盘走完整层切换、节点定位、矩阵过滤和返回章节；
- 读屏快照能读出图名、当前位置和关系类型；
- 所有站内链接、console、page error、normal/no-JS HAR 通过；
- 打印/PDF 包含四层文本关系，0 空白页；
- Pages 线上复验与本地行为一致。

## 14. 实施分期

规格放行后，实施计划按可独立提交的 TDD 任务拆分：

1. atlas 数据契约、派生器与校验；
2. `/atlas/` SSR 页面和七问题主轴；
3. 运行关系图与生命周期图；
4. crosswalk 与先修视图；
5. 章节位置条带；
6. 导航、首页入口和既有只读进度叠加；
7. 移动端、读屏、no-JavaScript、打印和 Pages 验收。

每个任务遵循 RED → 最小实现 → focused tests → full test/validate/build → 规格复核 → 代码质量复核 → 独立提交。

## 15. 明确不做

- 不创建账号、后端、数据库或云同步；
- 不上传、托管或分享用户成果文件；
- 不实现自由拖拽、任意编辑、保存布局或多人协作图谱；
- 不引入图数据库或第二套内容管理系统；
- 不复制 route、title、课程结果、项目事实或面试题正文；
- 不改变 26 项完成度、三条阅读路径或现有已读/书签语义；
- 不在 Release A 实现阶段检查点、成果三态或新的 localStorage schema；这些内容进入独立 `learning-artifact-portfolio` 后续规格；
- 不在本阶段实现 Python Lab 或综合项目；
- 不用外部图片、Logo 或未经登记的第三方素材。

## 16. 评审重点

读者视角重点检查：

- 第一屏是否在 30 秒内建立全书主线；
- 是否一眼知道自己在哪、下一步为什么去那里；
- 四个视图是否各自有明确用途，而不是四张重复目录；
- crosswalk 是否严格保持“概念 → 章节 → 项目 → 完成证据 → 面试题”的顺序；
- 关系密度是否在移动端仍可理解；
- 读完后是否能看见自己留下了什么成果。

数据与实现视角重点检查：

- 是否只引用现有权威 ID；
- 哪些边能派生，哪些边必须人工策展；
- 双向关系是否自动生成；
- SSR/no-JavaScript 主语义契约是否完整；
- 本地状态是否与已有数据兼容；
- 打印、读屏和 Pages 路由是否有可执行验收。

范围视角重点检查：

- 是否保持“关系层”而不复制正文；
- 是否避免自由画布和后端能力扩张；
- 是否能以七个独立任务逐步上线；
- 是否把第三、第四阶段内容清楚标成关系而非已交付功能。
