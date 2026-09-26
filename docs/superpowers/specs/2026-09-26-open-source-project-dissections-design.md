# 优秀开源项目拆解页设计

**状态：** 待审判者复核
**日期：** 2026-09-26
**阶段：** 课程化重构第 2/4 阶段
**设计基线：** `main@815d7613ca639d462979b1e57024eafd897e176b`

## 1. 决策摘要

本阶段把现有“原理教材”向真实源码推进，但只做可核验的阅读型项目拆解，不做框架排行榜、安装教程或可运行实验。

公开交付包含一个项目总览、六个核心拆解和一个历史反例页：

1. MCP 规范与官方 Python SDK；
2. Aider；
3. OpenHands；
4. SWE-bench 与 τ²-bench；
5. Dify；
6. CrewAI；
7. AutoGPT 与 Flowise 的历史反例。

六个核心拆解进入课程地图第 05 阶段；项目总览和历史反例只提供导航与补充判断，不计入课程完成度。现有交付型案例仍保留，项目阶段因此从 1 项扩为 7 项，全书公开课程完成度从 20 项变为 26 项。

Hermes Agent 与 OpenClaw 只进入项目总览的“前沿高权限观察区”，标记为 `watch-only`，不创建独立拆解页、不进入课程完成度，也不提供默认安装步骤。

## 2. 已确认事实与边界

- 当前公开站点已经有 14 章、4 个前沿专题、交付型案例、课程地图、三条阅读路径、42 道面试题和本地学习状态。
- 所有现有 URL、localStorage 键和 42 道题的题目 ID、正文、岗位与难度保持不变。
- Python 是第三阶段 Lab Kit 和第四阶段综合项目的默认实现语言；本阶段按开源项目原生技术栈阅读源码。
- MCP 页面必须把规范与运行实现分开：协议事实来自 `modelcontextprotocol/modelcontextprotocol`，Python 实现来自 `modelcontextprotocol/python-sdk`。
- OpenHands 当前是多仓库系统。`OpenHands/OpenHands@v1.24.0` 是 Agent Canvas 与本地编排，核心 Python Agent Server、agent、conversation、tool 和 workspace 在 `OpenHands/software-agent-sdk@v1.49.6`。页面不能继续按旧单仓库架构讲解。
- CrewAI canonical 仓库为 `crewAIInc/crewAI`；旧 owner 会重定向，但正文与数据只保存 canonical 名称。
- Flowise 仓库已归档。维护者在讨论 `#6727` 中给出的时间线为：2026-07-29 停止新功能、2026-08-13 归档、2026-08-31 EOL。它只能作为历史反例。
- Dify 使用附加限制的修改版 Apache-2.0；AutoGPT 与 Flowise 都是按目录或文件区分的混合许可，不能用一个宽泛的“开源许可”标签代替逐文件判断。
- 官方仓库可公开访问不等于其中的截图、Logo、商标或第三方素材可自由复制。项目图默认原创重绘。
- 本阶段不执行项目、不下载模型、不调用付费 API、不公布非本书自建的 benchmark 成绩。

## 3. 目标读者与学习结果

本阶段面向已经读过基础章节、希望从“知道概念”过渡到“能读真实工程”的读者。

完成六个核心拆解后，读者应能：

- 从入口、状态、工具、执行、证据和失败边界追踪一条真实调用链；
- 区分协议定义、SDK 实现、产品壳、运行时和评测 harness；
- 解释一个设计为何存在，以及它解决了什么代价；
- 识别仓库迁移、版本漂移、许可证分区、归档和营销指标的风险；
- 用现有面试题讨论源码判断与工程取舍，而不是背框架 API；
- 为第三阶段 Python Lab Kit 写出可验证的实验假设，但本阶段不运行实验。

## 4. 方案比较与选择

### 方案 A：每个仓库一篇独立长文

优点是仓库边界直观。缺点是 MCP 规范与 SDK、OpenHands Canvas 与 SDK、SWE-bench 与 τ²-bench 会被错误拆开，读者难以理解跨仓库契约；页面数量也会把课程变成框架目录。

### 方案 B：按工程问题组织六个核心拆解（采用）

每页回答一个稳定工程问题，并允许一个页面包含两个明确分工的仓库。正文采用 Markdown，机器可校验的版本、许可证、仓库状态、教学层级、源码入口和调用链放入集中数据。它既保留叙事能力，又能阻止链接和版本在多处漂移。

### 方案 C：把全部内容生成自结构化数据

一致性最强，但长篇中文解释、反例和源码推导会被迫塞进数据结构，编辑体验差，组件也会承担过多内容职责。

因此采用方案 B：`contentRegistry` 继续负责页面身份，新的项目索引负责版本化源码事实，Markdown 负责解释，组件只渲染可复用的事实卡和调用链。

## 5. 公开信息架构与精确路由

| 稳定 item ID | 规范路由 | 页面角色 | 计入课程 |
| --- | --- | --- | --- |
| `projects-index` | `/projects/` | 项目总览、阅读顺序与分类边界 | 否 |
| `project-mcp-python-sdk` | `/projects/mcp-python-sdk` | MCP 规范到 Python SDK 工具调用 | 是 |
| `project-aider` | `/projects/aider` | 仓库上下文到可验证代码修改 | 是 |
| `project-openhands` | `/projects/openhands` | Canvas、Agent Server、SDK 与工作区边界 | 是 |
| `project-agent-benchmarks` | `/projects/agent-benchmarks` | SWE-bench 与 τ²-bench 的任务到评分链 | 是 |
| `project-dify` | `/projects/dify` | 平台请求到工作流图执行 | 是 |
| `project-crewai` | `/projects/crewai` | Crew、Task、Agent 与工具协作 | 是 |
| `project-history-autogpt-flowise` | `/projects/history-autogpt-flowise` | 历史价值、架构债与迁移判断 | 否 |

规则：

- `/projects/` 是索引，不复制六篇正文；它展示学习目标、先修、状态和入口。
- 六个核心页面是 `kind: 'project'` 的公开 `CourseItem`。
- 历史页也是 `kind: 'project'` 的内容记录，但其项目索引记录使用 `catalog_tier: historical`，不进入 `courseMap` 或完成度。
- `/labs/`、`/capstone/` 与任何“开始实验”入口继续不存在并返回 404。
- `/projects` 与 `/projects/`、每个 clean URL 与尾斜杠形式都必须能由预览和 Pages 正确解析。

## 6. 课程地图、导航与学习状态

### 6.1 第 05 阶段

项目阶段按以下顺序展示：

1. MCP 规范与 Python SDK；
2. Aider；
3. OpenHands；
4. Agent 评测基准；
5. Dify；
6. CrewAI；
7. 现有交付型 Agent 质量门案例。

新增六项后的公开课程分母固定为 26。项目总览、历史反例和 `watch-only` 条目不进入分母。旧的 20 条完成记录按规范化 route 原样复用，不迁移、不清空；新增项目初始为未完成。

新增课程项的先修关系：

| item ID | prerequisites | 完成证据 |
| --- | --- | --- |
| `project-mcp-python-sdk` | `chapter-04-tools-mcp`, `frontier-interoperability-identity` | 一张规范层、SDK 层与业务授权层边界图 |
| `project-aider` | `chapter-08-evaluation`, `chapter-09-safety-recovery`, `chapter-13-coding-agent` | 一份从仓库上下文到补丁验证的调用链笔记 |
| `project-openhands` | `chapter-09-safety-recovery`, `chapter-10-production`, `chapter-13-coding-agent`, `project-aider` | 一张 Canvas、Server、SDK、Workspace 的信任边界图 |
| `project-agent-benchmarks` | `chapter-08-evaluation`, `project-aider`, `project-openhands` | 一份任务、环境、轨迹、评分与不可比较项清单 |
| `project-dify` | `chapter-06-loop-graph`, `chapter-09-safety-recovery`, `chapter-10-production` | 一张 API 请求到 Graph 节点事件的执行图 |
| `project-crewai` | `chapter-07-multi-agent`, `chapter-08-evaluation`, `chapter-09-safety-recovery` | 一份角色消融与协调成本评审表 |

先修只表达推荐理解顺序，不锁页面。现有 `case-delivery-agent` 仍保留原先修关系，排列在阶段末尾作为跨项目工程质量门总结。

### 6.2 阅读路径

- `beginner` 与 `interview` 两条路径不变。
- `engineering` 在现有 10 站后追加六个核心项目和交付型案例，共 17 站；顺序与第 05 阶段一致。
- 项目总览与历史页不进入 `readingPaths`。
- `ReadingProgress` 继续追踪“全部公开 CourseItem 与所有 readingPath step 的并集”；localStorage 仍保存 route 字符串。

### 6.3 导航

- 顶栏“实战”只放“开源项目拆解”和“交付型案例”，避免塞入八个子项。
- 侧栏新增“开源项目拆解”分组，顺序为总览、六个核心、历史反例。
- 现有“案例研究”保留交付型案例，章节、前沿、复习与 GitHub 入口不变。

## 7. 项目事实索引

### 7.1 单一数据源

页面身份继续由 `contentRegistry` 唯一提供 `itemId / route / title / navTitle / kind`。项目专属事实进入 `sources/project-index.yml`，只通过 `page_item_id` 引用页面，不重复 route 或标题。

设计把两个容易混淆的概念拆成正交轴：

- `repository_status` 只描述上游生命周期，可取 `active | archived | eol`；
- `catalog_tier` 只描述本书教学定位，可取 `core | historical | watch-only`。

`repository_status` 不能由本书是否推荐反推。AutoGPT 是 `active + historical`，Hermes Agent 与 OpenClaw 是 `active + watch-only`；Flowise 是 `eol + historical`，并以 `archived: true` 记录 GitHub 的归档事实。

以下完整示例同时规定 `pages` 的八条权威记录；实现不得改名、删项或临场重组：

```yaml
schema_version: 1
defaults:
  verified_at: '2026-09-26'
  review_by: '2026-10-26'
pages:
  - page_item_id: projects-index
    catalog_tier: core
    subjects: [mcp-spec, mcp-python-sdk, aider, openhands-canvas, openhands-sdk, swe-bench, tau2-bench, dify, crewai, autogpt, flowise, hermes-agent, openclaw]
    interview_question_ids: []
    counted_in_course: false
    primary_chain_id: null
  - page_item_id: project-mcp-python-sdk
    catalog_tier: core
    subjects: [mcp-spec, mcp-python-sdk]
    interview_question_ids: [iq-04-a, iq-04-b, iq-04-c]
    counted_in_course: true
    primary_chain_id: mcp-tool-call
  - page_item_id: project-aider
    catalog_tier: core
    subjects: [aider]
    interview_question_ids: [iq-13-a, iq-13-b, iq-13-c]
    counted_in_course: true
    primary_chain_id: aider-repo-to-verified-edit
  - page_item_id: project-openhands
    catalog_tier: core
    subjects: [openhands-canvas, openhands-sdk]
    interview_question_ids: [iq-09-b, iq-10-a, iq-13-c]
    counted_in_course: true
    primary_chain_id: openhands-canvas-to-workspace-event
  - page_item_id: project-agent-benchmarks
    catalog_tier: core
    subjects: [swe-bench, tau2-bench]
    interview_question_ids: [iq-08-a, iq-08-b, iq-08-c]
    counted_in_course: true
    primary_chain_id: benchmark-task-to-score
  - page_item_id: project-dify
    catalog_tier: core
    subjects: [dify]
    interview_question_ids: [iq-02-b, iq-06-a, iq-10-a]
    counted_in_course: true
    primary_chain_id: dify-request-to-graph-events
  - page_item_id: project-crewai
    catalog_tier: core
    subjects: [crewai]
    interview_question_ids: [iq-07-a, iq-07-b, iq-07-c]
    counted_in_course: true
    primary_chain_id: crewai-kickoff-to-task-output
  - page_item_id: project-history-autogpt-flowise
    catalog_tier: historical
    subjects: [autogpt, flowise]
    interview_question_ids: [iq-02-b, iq-07-c, iq-10-a]
    counted_in_course: false
    primary_chain_id: autogpt-flowise-evolution
subjects:
  - id: aider
    canonical_repo: Aider-AI/aider
    canonical_url: https://github.com/Aider-AI/aider
    pin_kind: release
    pinned_ref: v0.86.0
    pinned_commit: a4be6ccd87ebaa59b361f3f028d116ce1761b626
    repository_status: active
    archived: false
    catalog_tier: core
    license_summary: Apache-2.0 repository license; third-party assets still require file-level review
    license_scopes:
      - basis: path
        expression: Apache-2.0
        path_or_glob: '**'
        scope: repository code and documentation unless a file states otherwise
        note: Preserve notices and separately review logos, trademarks, and third-party files.
    watch_url: https://github.com/Aider-AI/aider/releases/latest
    entrypoints:
      - path: aider/main.py
        symbols: [main]
        responsibility: Parse options and establish repository context.
      - path: aider/coders/base_coder.py
        symbols: [Coder.run, Coder.send_message, Coder.handle_shell_commands]
        responsibility: Own the coding loop, confirmed shell execution, and conditional reflection path.
```

`project-index.yml` 只包含公开事实和固定源码路径。页面中的解释性段落仍在 Markdown；组件从索引渲染固定版本、仓库状态、教学层级、许可证、源码入口和升级日期。

`projects-index` 引用全部 13 个 subject，是唯一展示 watch-only 条目的页面。`hermes-agent` 与 `openclaw` 的 subject 级 `catalog_tier` 必须为 `watch-only`，且它们不得出现在其他七条 page 记录、`courseMap` 或 `readingPaths` 中。

page 级 `catalog_tier: core` 表示该页面属于主项目目录，不等于计入课程；是否计分只由 `counted_in_course` 决定。因此 `projects-index` 是核心总览但不计分，六个核心拆解同时满足 `catalog_tier: core` 与 `counted_in_course: true`。

### 7.2 字段不变量

- `page_item_id` 必须存在于 `contentRegistry`，且页面 tier 与 courseMap 使用方式一致。
- `canonical_repo` 使用 GitHub API 返回的 `full_name`，不能保存会重定向的旧 owner。
- `pinned_commit` 必须是 40 位小写十六进制 SHA；页面源码链接必须使用该 SHA，不使用 `main`、`master` 或可移动 tag。
- `pinned_ref` 用于人类识别；`pin_kind` 明确是 `release`、`tag` 或 `commit`。
- 一个 ref 若存在，远端解析结果必须等于 `pinned_commit`。
- 每个 `entrypoint` 的 schema 固定为 `path + symbols:string[] + responsibility`：`path` 在 subject 内唯一，`symbols` 至少包含一个非空字符串且不得重复，`responsibility` 非空；不再接受单数 `symbol` 字段。
- `entrypoints` 必须在固定 commit 中存在；每个核心页面至少 3 个。普通核心页最多 8 个，MCP、OpenHands、评测、Dify、CrewAI 等复杂跨层、多轨或双轨页面最多 12 个；初始目录共固定 64 个文件级 entrypoint。
- 调用链 step 的 `source_path` 必须匹配对应 subject 的一个 entrypoint，且 step 的单数 `symbol` 必须属于该 entrypoint 的 `symbols`；同一文件可通过数组声明多个实际使用符号。
- `repository_status` 只能是 `active`、`archived` 或 `eol`；`archived` 是独立布尔事实，允许表达“已归档且 EOL”。
- `repository_status: active` 必须搭配 `archived: false`；`repository_status: archived` 必须搭配 `archived: true`；`repository_status: eol` 可按 GitHub 实际归档状态搭配布尔值。
- subject 的 `catalog_tier` 只能是 `core`、`historical` 或 `watch-only`；page 的 `catalog_tier` 只能是 `core` 或 `historical`。
- `license_summary` 必须是非空字符串；`license_scopes` 必须是非空数组，每项都包含 `basis / expression / scope / note`。
- `basis: path` 表示按目录或文件分区，必须提供 `path_or_glob`，不得提供 `selector`；同等具体的路径 scope 重叠且 expression 不同时校验失败。
- `basis: contribution` 表示许可证取决于贡献历史而非文件路径，必须提供 `selector`，不得提供 `path_or_glob`，也不参与路径冲突算法。
- 混合许可必须拆成多条 `license_scopes`。不得使用一个 `AND` 表达“不同目录或不同贡献分别适用不同许可”。
- `LicenseRef-*` 只用于项目自定义或无法准确写成 SPDX 的条款，必须在 `note` 中链接或解释项目原始许可文件。
- `interview_question_ids` 只能引用现有 42 题，页面不得创建新答案副本。
- 八个 page 记录都必须包含 `page_item_id / catalog_tier / subjects / interview_question_ids / counted_in_course / primary_chain_id`；只有 `projects-index.primary_chain_id` 可以为 `null`。
- `verified_at <= review_by`，到期只改变复核状态，不自动改正文。

## 8. 初始固定版本与许可证基线

下表是设计日核验的初始 pin。实施时如果上游已发布新版本，不自动追新；先比较差异，再由人工决定更新设计 pin 或保留当前教学基线。

| subject ID | canonical repo | pinned ref | pinned commit | repository_status | archived | catalog_tier | license_summary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `mcp-spec` | `modelcontextprotocol/modelcontextprotocol` | `2026-07-28` | `5f5440bb26a62e2cf3440b92da5a667efa03b267` | active | false | core | 贡献级 MIT → Apache-2.0 过渡，普通文档另有 CC-BY-4.0 |
| `mcp-python-sdk` | `modelcontextprotocol/python-sdk` | `v2.2.0` | `9972c21aa42054fb1450c5fc614761ed11847ec6` | active | false | core | MIT，仍需逐文件排除第三方素材 |
| `aider` | `Aider-AI/aider` | `v0.86.0` | `a4be6ccd87ebaa59b361f3f028d116ce1761b626` | active | false | core | Apache-2.0 |
| `openhands-canvas` | `OpenHands/OpenHands` | `v1.24.0` | `7dc6805406ea3c76cb4a3ce407c3c72d481b0ac6` | active | false | core | MIT；本仓库现在主要是 Agent Canvas 和编排层 |
| `openhands-sdk` | `OpenHands/software-agent-sdk` | `v1.49.6` | `fcc102a697874d54a357e36004e02c95040dbdc0` | active | false | core | MIT；Canvas 同版本依赖 `@openhands/typescript-client@1.49.6` |
| `swe-bench` | `SWE-bench/SWE-bench` | `v5.0.1` | `87ab1f6ced28f75ba73ca899dc759b019310944a` | active | false | core | MIT；该 ref 是 tag，不冒充 GitHub Release |
| `tau2-bench` | `sierra-research/tau2-bench` | `v1.0.1` | `fc0055dc4e0a316c3f83133267fbd6faaa770992` | active | false | core | MIT |
| `dify` | `langgenius/dify` | `1.17.1` | `8387590ace4a094de812b7847fc6a4c3a27cd52b` | active | false | core | 修改版 Apache-2.0，含多租户、前端标识与外观专利条件 |
| `crewai` | `crewAIInc/crewAI` | `1.15.22` | `7a01af27912c2b142d8bac70d1894343f8b91bd1` | active | false | core | MIT；源码已采用 `lib/crewai/...` monorepo 路径 |
| `autogpt` | `Significant-Gravitas/AutoGPT` | `autogpt-platform-beta-v0.8.1` | `ead8f943f981ea650285eee3020c8ff0e7eda94d` | active | false | historical | 按目录分为 PolyForm Shield 与 MIT |
| `flowise` | `FlowiseAI/Flowise` | `flowise@3.1.4` | `a65f81bb43ef66d3ce734bf0dff4223ae8041c95` | eol | true | historical | 按目录与显式文件分为商业许可与 Apache-2.0；2026-08-31 EOL |
| `hermes-agent` | `NousResearch/hermes-agent` | `v2026.9.24` | `f97608f178d1ffeca59860195ab7da295f7c8e5f` | active | false | watch-only | MIT；只做长期自主能力与权限风险观察 |
| `openclaw` | `openclaw/openclaw` | `v2026.9.6` | `eb377ac59e6c9fd6c7705028034812becf00271b` | active | false | watch-only | MIT，另有 `THIRD_PARTY_NOTICES.md`；只做高权限个人 Agent 风险观察 |

### 8.1 特殊许可证的 `license_scopes`

| subject ID | basis | expression | selector 或 path_or_glob | scope | note |
| --- | --- | --- | --- | --- | --- |
| `mcp-spec` | `contribution` | `Apache-2.0` | `selector: new-code-or-spec-contribution OR recorded-relicense-consent` | 新代码与规范贡献，以及已取得重许可同意的贡献 | 这是贡献级适用范围，不能仅凭文件路径推断全部历史内容 |
| `mcp-spec` | `contribution` | `MIT` | `selector: historical-contribution-without-recorded-consent` | 尚未取得重许可同意的历史贡献 | 引用前需追踪具体文件与贡献历史 |
| `mcp-spec` | `path` | `CC-BY-4.0` | `path_or_glob: docs/**` | 普通文档贡献，不含规范 | 规范仍按仓库过渡许可处理；直接复用前还需排除规范路径 |
| `dify` | `path` | `LicenseRef-Dify-Modified-Apache-2.0` | `path_or_glob: **` | 仓库代码与内容 | 多租户服务、`web/` 前端 Logo/版权与外观专利受附加条件约束 |
| `autogpt` | `path` | `PolyForm-Shield-1.0.0` | `path_or_glob: autogpt_platform/**` | 平台目录代码与内容 | 不得把平台目录写成 MIT |
| `autogpt` | `path` | `MIT` | `path_or_glob: **` | classic 与 LICENSE 明列的其他部分 | 更具体的 `autogpt_platform/**` PolyForm scope 优先；文件若有独立声明，以文件声明为准 |
| `flowise` | `path` | `LicenseRef-Flowise-Commercial` | `path_or_glob: packages/server/src/enterprise/**` | enterprise 目录 | 商业许可，不作为可自由复制素材 |
| `flowise` | `path` | `LicenseRef-Flowise-Commercial` | `path_or_glob: packages/server/src/IdentityManager.ts` | 当前许可文件点名的显式商业许可文件 | 扫描到其他显式商业声明时必须新增独立 scope，否则校验失败 |
| `flowise` | `path` | `Apache-2.0` | `path_or_glob: **` | 其余未受限内容 | 更具体的 commercial scope 优先；第三方组件仍服从各自原始许可 |

路径型 `license_scopes` 使用“最具体路径优先”规则。MCP 的 Apache/MIT 过渡使用贡献型 selector，允许覆盖同一文件树而不触发路径冲突；它不能自动授权直接复制，任何引用仍必须进入人工 provenance 审核。MCP 普通文档的 CC-BY-4.0 是路径型规则，但 scope 和 note 明确排除规范。

## 9. 核心页面固定模板

六个核心页面使用同一信息顺序，标题可按项目调整，但不能删除契约段落：

1. **30 秒结论**：这个项目解决什么，不解决什么；
2. **为什么选它**：与课程哪一章连接，以及为什么不是按 Star 排名；
3. **版本与边界卡**：canonical repo、固定 ref/SHA、核验日期、仓库状态、教学层级、许可证作用域；
4. **原创架构图**：只画本页会追踪的组件，标明“源码事实”和“本书归纳”；
5. **唯一纵向调用链**：从一个入口追到结果或评分，步骤有稳定编号；
6. **关键源码入口**：3–12 个固定 commit 文件链接，写清文件职责，并显示该文件在本页使用的全部符号；
7. **一次请求的数据流**：输入、状态变化、工具或环境、输出证据；
8. **阅读练习**：要求读者在固定源码中找证据，不要求安装依赖或调用模型；
9. **失败边界**：至少一个确定性反例，说明哪一层负责停止、恢复或拒绝；
10. **生产边界**：什么不能由该项目自动保证；
11. **高频面试点**：只链接现有题目 ID，页面不复制答案；
12. **升级复核**：上游变化时先检查哪些文件与契约；
13. **来源与归因**：固定源码、许可证、官方文档和原创图依据。

页面必须明确区分三类陈述：

- **源码事实**：固定 commit 中可以定位的接口、路径或控制流；
- **本书解释**：为教学简化的架构名称、分层和类比；
- **阅读练习**：读者应从源码验证的假设，不写成已经运行的结果。

## 10. 六个核心拆解的纵向范围

### 10.1 MCP 规范与 Python SDK

- **核心问题：** 一次 `tools/call` 如何从协议消息进入 Python 工具函数，再返回结构化结果。
- **唯一链路：** 2026-07-28 schema → Host 调用 `MCPServer.run("stdio")` → `stdio_server` → low-level `Server.run` / `serve_dual_era_loop` → `JSONRPCDispatcher.run` / `_dispatch_request` → `ServerRunner._on_request` → low-level `tools/call` handler → `MCPServer._handle_call_tool` / `call_tool` → `ToolManager.call_tool` → `Tool.run` → `basic_tool.sum` → `ServerRunner._serialize`（只返回 result dict）→ dispatcher 构造并写出 `JSONRPCResponse` → `stdout_writer`。
- **关键入口：**
  - `schema/2026-07-28/schema.json`
  - `examples/snippets/servers/basic_tool.py`
  - `src/mcp/server/mcpserver/server.py`
  - `src/mcp/server/stdio.py`
  - `src/mcp/server/lowlevel/server.py`
  - `src/mcp/server/runner.py`
  - `src/mcp/shared/jsonrpc_dispatcher.py`
  - `src/mcp/server/mcpserver/tools/tool_manager.py`
  - `src/mcp/server/mcpserver/tools/base.py`
- **必须讲清：** 规范仓库不是 Python 服务实现；SDK 提供协议实现，但不替业务授权、工具最小权限或结果正确性背书。`ServerSession` 只作为 request-scoped outbound proxy 的旁路说明，不是入站 `tools/call` 主链节点；`ServerRunner._serialize` 只产出 result dict，JSON-RPC envelope 由 dispatcher 构造并交给 transport。
- **面试题：** `iq-04-a`、`iq-04-b`、`iq-04-c`。

### 10.2 Aider

- **核心问题：** 一个 Coding Agent 如何把仓库上下文变成可审查的补丁并接回 Git 证据。
- **唯一链路：** CLI 参数与仓库确认 → `Coder.run/run_one/send_message` → repo map/上下文选择 → `Coder.send` / `Model.send_completion` → edit block 解析与 dry-run → `prepare_to_edit` → 文件写入 → 条件性的自动提交与 lint → 需两次确认的 shell 分支 → 可选 auto-test → 仅在用户确认修复 lint/test 失败后设置 reflection 并进入后续 turn。
- **关键入口：**
  - `aider/main.py`
  - `aider/coders/base_coder.py`
  - `aider/models.py`
  - `aider/repomap.py`
  - `aider/coders/editblock_coder.py`
  - `aider/io.py`
  - `aider/repo.py`
  - `aider/commands.py`
- **必须讲清：** repo map 是上下文选择策略，不等于模型读完全部仓库；自动提交也不等于任务已经通过业务验收。shell 命令由 `Coder.handle_shell_commands` 执行，`InputOutput.confirm_ask` 分别负责“是否执行”和“是否把输出加入上下文”的两次确认；lint/test 失败本身不会自动触发 reflection，只有用户确认尝试修复后才设置 `reflected_message`。
- **面试题：** `iq-13-a`、`iq-13-b`、`iq-13-c`。

### 10.3 OpenHands

- **核心问题：** 用户界面、Agent Server、SDK agent 与 workspace 如何跨仓库协作并隔离执行权限。
- **唯一链路：** 已有 Canvas conversation 的 `handleSendMessage` → `useSendMessage().send` → WebSocket `sendMessage` → Agent Server `events_socket`（通过 `EventService.subscribe_to_events` 注册订阅）→ `EventService.send_message` → `LocalConversation.send_message` 持久化用户 `MessageEvent` → `EventService.run` → `LocalConversation.arun` → `Agent.astep` → `_ahandle_tool_calls` 生成 `ActionEvent` → `Agent._aexecute_actions` → `ToolDefinition.__call__` 返回 `Observation` → `LocalConversation.__init__` 组装 persistence-first callback → `EventService.start` 装配 async PubSub bridge → `_WebSocketSubscriber.__call__` 调用 `_send_event` → Canvas `handleMainMessage`。结构化链固定为 16 个节点，三个 track 分别为 6 / 6 / 4。
- **关键入口：**
  - Canvas：`src/components/features/chat/chat-interface.tsx`
  - Canvas：`src/hooks/use-send-message.ts`
  - Canvas：`src/contexts/conversation-websocket-context.tsx`
  - Server：`openhands-agent-server/openhands/agent_server/sockets.py`
  - Server：`openhands-agent-server/openhands/agent_server/event_service.py`
  - SDK：`openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py`
  - SDK：`openhands-sdk/openhands/sdk/agent/agent.py`
  - SDK：`openhands-sdk/openhands/sdk/agent/response_dispatch.py`
  - SDK：`openhands-sdk/openhands/sdk/tool/tool.py`
- **必须讲清：** `OpenHands/OpenHands` 当前不是旧版单体 Python Agent 仓库；本页只追踪已有会话的 message/action/durable-event 链，不追踪 conversation 创建链。`Workspace` 是工具构造与执行所消费的环境边界和配置来源，不是 tools 的 owner，也不是 `ToolDefinition.__call__` 之后的主链节点；streaming delta 是非持久旁路。durable append 的保证来自 `LocalConversation.__init__` 组装的 default callback 先执行、caller callback 后执行；`EventService.start` 构造并注册 `AsyncCallbackWrapper(self._pub_sub, ...)`，subscriber 的 `_WebSocketSubscriber.__call__` 再调用 `_send_event`。`EventService.run` 不拥有订阅。
- **面试题：** `iq-09-b`、`iq-10-a`、`iq-13-c`。

### 10.4 SWE-bench 与 τ²-bench

- **核心问题：** Agent 输出如何进入可复现环境、轨迹和评分，为什么两个 benchmark 的分数不能直接横比。
- **纵向双轨：**
  - SWE-bench：实例与预测 patch → evaluation runner → 容器环境 → 测试执行 → grading → report；
  - τ²-bench：当前 CLI `main` 注册局部 `run_command` 并把 `tau2 run` 分派到 `run_domain` → `get_tasks` → `run_tasks` → `run_single_task` → `build_orchestrator` → `run_simulation` → `BaseOrchestrator.run` → environment tool call → trajectory → `evaluate_simulation` → `reward_info`；局部 `run_command` 不是可链接的顶层 symbol。
- **关键入口：**
  - `swebench/harness/run_evaluation.py`
  - `swebench/harness/docker_utils.py`
  - `swebench/harness/grading.py`
  - `swebench/harness/reporting.py`
  - `src/tau2/cli.py`
  - `src/tau2/runner/batch.py`
  - `src/tau2/runner/helpers.py`
  - `src/tau2/runner/build.py`
  - `src/tau2/runner/simulation.py`
  - `src/tau2/orchestrator/orchestrator.py`
  - `src/tau2/environment/environment.py`
  - `src/tau2/evaluator/evaluator.py`
- **必须讲清：** 本书只拆 harness，不公布自称官方的成绩；后续 10 条本地 fixture 是第三阶段自建微型回归集，不是 SWE-bench 或 τ²-bench 子集。`tau2.run.run_task` 与 `tau2.run.run_tasks` 只是旧 flat 参数 API 的 deprecated 兼容 shim，不能作为当前 CLI 主链入口。默认 `EvaluationType.ALL` 与 `EvaluationType.ALL_WITH_NL_ASSERTIONS` 都按 `task.evaluation_criteria.reward_basis` 选择分量后相乘，后者只强制 NL assertions；ACTION 只有被选中时才是硬门禁。单项类型和 `*_IGNORE_BASIS` 各走自己的分支，early termination 返回 `0.0`，没有 criteria 时返回 `1.0`。
- **面试题：** `iq-08-a`、`iq-08-b`、`iq-08-c`。

### 10.5 Dify

- **核心问题：** 一个低代码平台如何把 API 请求转成可执行工作流图，并在节点、事件和持久化之间分层。
- **唯一链路：** 编号主链固定 blocking：`WorkflowRunApi.post` → `AppGenerateService` guardrails 与 `AppMode.WORKFLOW` 分派 → `WorkflowAppGenerator` → `WorkflowAppRunner` → `WorkflowBasedAppRunner._init_graph` → `Graph.init` / `DifyNodeFactory.create_node` → 条件 `DifyAgentNode` → `WorkflowEntry` 接收已有 Graph → `GraphEngine.run` → graph event adapter / queue → task pipeline → 内部 typed response → 最终 public payload。streaming 是独立旁路：先订阅 topic，再投递 Celery `_AppRunner`，复用共同执行核心后写 topic 并由请求进程取回为 SSE。
- **关键入口：**
  - `api/controllers/service_api/app/workflow.py`
  - `api/services/app_generate_service.py`
  - `api/core/app/apps/workflow/app_generator.py`
  - `api/core/app/apps/workflow/app_runner.py`
  - `api/core/app/apps/workflow_app_runner.py`
  - `api/core/app/apps/workflow/app_queue_manager.py`
  - `api/core/app/apps/workflow/generate_task_pipeline.py`
  - `api/core/app/apps/workflow/generate_response_converter.py`
  - `api/core/app/apps/common/workflow_response_converter.py`
  - `api/core/workflow/workflow_entry.py`
  - `api/core/workflow/node_factory.py`
  - `api/core/workflow/nodes/agent_v2/agent_node.py`
- **必须讲清：** `WorkflowEntry` 接收已由 `Graph.init` 与 `DifyNodeFactory` 构造的 Graph，GraphEngine 不负责创建节点；通用 `WorkflowResponseConverter` 只生成内部 typed response，`WorkflowAppGenerateResponseConverter` 才输出 public payload。持久化不归 `WorkflowEntry` 单独负责；blocking 主链与 streaming 交付旁路不可串成一个同步栈。Graphon 是实际执行依赖；Dify 许可证不是无附加条件的 Apache-2.0。
- **面试题：** `iq-02-b`、`iq-06-a`、`iq-10-a`。

### 10.6 CrewAI

- **核心问题：** 角色式多 Agent 如何把 Crew、Process、Task、Agent、Executor 和 Tool 串起来，以及协调成本在哪里出现。
- **唯一默认链：** 固定 `Process.sequential + Task.async_execution=false + Agent.planning=false`：`Crew.kickoff` → `prepare_kickoff` / `setup_agents` / `Agent.create_agent_executor` → `Process.sequential` → `Crew._run_sequential_process` / `_execute_tasks` → `prepare_task_execution` → `Task.execute_sync` / `_execute_core` → `Agent.execute_task` → 默认 `experimental.AgentExecutor.invoke` → `AgentFinish.output` → `Agent._finalize_task_execution` → `TaskOutput` → `Crew._create_crew_output`。
- **关键入口：**
  - `lib/crewai/src/crewai/crew.py`
  - `lib/crewai/src/crewai/crews/utils.py`
  - `lib/crewai/src/crewai/process.py`
  - `lib/crewai/src/crewai/task.py`
  - `lib/crewai/src/crewai/agent/core.py`
  - `lib/crewai/src/crewai/experimental/agent_executor.py`
  - `lib/crewai/src/crewai/utilities/agent_utils.py`
  - `lib/crewai/src/crewai/tools/tool_usage.py`
  - `lib/crewai/src/crewai/tools/structured_tool.py`
  - `lib/crewai/src/crewai/agents/step_executor.py`
- **必须讲清：** 页面以默认 synchronous sequential、planning-disabled 路径作为主链，不把它泛化为所有 CrewAI 模式。text ReAct 与 native tool 是互斥条件分支：前者经过 `ToolUsage.use/_use`，后者直接使用 `_execute_single_native_tool_call`；`StepExecutor` 只在 planning enabled 且 todos 已生成后懒创建。`CrewAgentExecutor` 已 deprecated，不属于默认主链；`Task._execute_core` 构造并持有 `TaskOutput`，`_export_output` 只做结构化字段转换。角色名称不自动形成权限隔离或质量增益。
- **面试题：** `iq-07-a`、`iq-07-b`、`iq-07-c`。

## 11. 历史反例与前沿观察

### 11.1 AutoGPT / Flowise 历史页

历史页仍记录固定 commit、仓库状态、教学层级、许可证和关键路径，但不使用核心页的“推荐采用”语气。页面回答：

- 当时解决了什么真实问题；
- 哪些架构模式仍值得学习；
- 哪些假设在模型、工具和工程实践变化后失效；
- 许可证、归档或迁移如何改变生产选型；
- 如何迁移到更小、更可测、更可维护的结构。

AutoGPT 只追踪 `classic/original_autogpt/autogpt/app/main.py`、`agents/agent.py` 与当前平台边界；Flowise 只追踪 `packages/server/src/controllers/predictions/index.ts`、`services/predictions/index.ts` 与 Agentflow 结构。页面不提供安装命令，也不把仓库未归档等同于经典架构仍是推荐生产基线。

关联面试题：`iq-02-b`、`iq-07-c`、`iq-10-a`。

### 11.2 Hermes Agent / OpenClaw

项目总览设置“前沿高权限观察区”，只展示：

- canonical repo 与固定观察版本；
- 长期自主、记忆、IM/桌面/外部系统权限的风险标签；
- 指向 `Agent 安全评测`、`失败、恢复与安全边界` 和 Radar 的站内链接；
- “不是初学者默认安装步骤”的明确说明。

二者不进入课程完成度、readingPaths、侧栏项目拆解列表或面试题扩展。以后若要升格为核心拆解，必须走新的设计与安全审查。

## 12. 组件与内容边界

建议最小组件：

- `ProjectOverview.vue`：从项目索引生成核心、历史与 watch-only 三组入口；
- `ProjectMeta.vue`：分别渲染固定版本、仓库状态、教学层级、许可证和核验日期；
- `ProjectCallChain.vue`：把结构化步骤渲染成有序列表与原创关系图；
- `ProjectSourceLinks.vue`：生成固定 SHA 的源码链接和路径说明。

组件只负责结构、状态与可访问性，不保存长篇解释。每个 Markdown 页面通过 `project-id` 绑定项目索引，并保留模板中的 13 个段落。

调用链数据必须是有序数组；每一步包含 `id / label / subject_id / source_path / symbol / responsibility`。同一页只能有一个主链；benchmark 页允许在同一比较组件中并列两条受控轨道，但每条各自从任务到评分闭合。

## 13. 版本保鲜与自动化安全

在现有每周来源巡检上增加项目索引检查，但继续遵守“只发现变化，不自动改正文”：

1. 验证 canonical repo 未重定向且固定 commit 可访问；
2. 验证 pinned ref 仍解析到 pinned commit；
3. 验证所有 `entrypoints` 在固定 commit 中存在；
4. 比较最新 release、默认分支 HEAD、archived 状态和许可证路径；
5. 新版本或新提交只产生 `project_update_available`；归档、迁移、许可证变化产生 `project_review_required`；
6. HTTP 429/5xx、DNS、超时与 JSON 解析失败归为瞬时或网络错误，不能计为 healthy，也不能当永久死链；
7. 页面超过 `review_by` 后静态 HTML 只显示中性“固定于 X，待按日期复核”，客户端可显示当前复核状态；页面与脚本共用 `Asia/Shanghai` 日期函数；
8. 自动化只上传报告并创建权威 Issue 或草稿 PR，绝不抓取上游正文自动写入书稿。

权限保持两段式：扫描 job 只有 `contents: read`，checkout 使用 `persist-credentials: false`；写 Issue 的 job 不 checkout、不安装依赖，只读取扫描 artifact 并调用 GitHub API。feature branch 手动运行不得更新默认分支权威 Issue；workflow 使用并发组避免互相关闭或覆盖告警。

## 14. 图片、代码引用与 provenance

- 六张主架构图和调用链图使用本项目原创 Vue/SVG/CSS；图下注明依据的 subject、ref、commit 与源码路径。
- 默认不放项目 Logo、README 图片、产品 UI 截图或第三方 benchmark 图表。
- 代码只做短引或伪代码重述；直接引用必须精确到文件、固定 commit 和适用许可证，不复制大段实现。
- 若确需直接素材，文件只能进入 `docs/public/project-assets/`，并登记到 `assets/provenance.yml`。

`assets/provenance.yml` 每条必须包含：

```yaml
- local_file: docs/public/project-assets/example.svg
  origin: third-party
  source_url: https://github.com/org/repo/blob/<commit>/path/file.svg
  source_repo: org/repo
  source_ref: <commit>
  source_path: path/file.svg
  license: Apache-2.0
  copyright_holder: Example Authors
  modified: true
  used_by: [project-example]
  alt: 图中表达的实际关系
  verified_at: '2026-09-26'
```

缺字段、使用移动分支 URL、许可证不覆盖该文件、来源是网页但没有复用授权时，构建失败。原创内联组件不进入外部素材目录，但图下注明“本书原创重绘”及事实来源。

## 15. 页面数据流

```text
contentRegistry（页面身份）
        │ itemId
        ▼
project-index.yml（固定版本、许可证、源码入口、调用链）
        │                         ┌─ weekly check → report / Issue
        ├─ ProjectOverview ───────┤
        ├─ ProjectMeta            └─ no automatic content rewrite
        ├─ ProjectCallChain
        └─ ProjectSourceLinks

Markdown（解释、反例、练习、生产边界）
        └─ 引用同一 project-id，不复制版本和链接
```

所有项目元数据在构建时静态渲染。页面运行时不请求 GitHub API，不暴露 token，也不会因上游临时不可用而失去正文。

## 16. 移动端、读屏与打印

- 1440px 使用正文主列、窄事实栏和源码目录；390px 全部重排为单列。
- 调用链使用原生 `<ol>` / `<li>`，CSS 只增强轨道；移除 marker 时显式保留 `role="list"` / `role="listitem"` 以兼容 Safari/VoiceOver。
- 颜色不能单独表达 core、historical、watch-only 或失败状态，必须同时显示文本。
- 源码路径允许容器内换行或局部滚动，不能造成页面级横向溢出。
- 触控目标至少 44px，`:focus-visible` 使用明确轮廓，不用高饱和整块背景。
- 无 JavaScript 时，版本卡、调用链、源码入口、失败边界和来源仍完整可读。
- 打印时展开所有折叠说明，显示完整固定 SHA 与 URL；隐藏纯交互 summary，不遗漏折叠后的源码入口。
- 原创图同时提供“怎么看”“不要误解”和纯文本有序版；纯视觉 SVG 使用明确 `aria-label`，结构性列表不套 `role="img"`。

## 17. 失败与降级

- **项目索引损坏：** schema 校验失败，构建中止；不能降级为“0 个项目”。
- **页面引用未知 subject/item：** 构建失败并打印 ID。
- **固定源码路径不存在：** 每周巡检标记 `project_review_required`；合并前的显式在线核验必须通过。
- **上游发布新版本：** 页面继续诚实展示固定版本；Radar/Issue 提醒人工比较，不自动改 pin。
- **仓库归档或迁移：** 不删除旧页；分别更新 `repository_status`、`archived`、canonical 地址和迁移说明后再发布，不能自动改变 `catalog_tier`。
- **许可证变化：** 立即阻止新增直接素材；原创解释页可以保留，但必须复核已有代码短引与 provenance。
- **GitHub 限流或网络失败：** 记为瞬时/网络错误并有限重试，不能算 healthy；静态站仍使用已核验数据构建。
- **项目体量过大：** 只保留本设计的一条纵向链，其他子系统放在“本页没有覆盖”中，不扩写成框架手册。
- **第三阶段 Lab 未交付：** 阅读练习只要求找源码证据，不显示运行、复制命令或成功结果。

## 18. 测试与验收

### 18.1 数据与内容

- `contentRegistry` 新增且仅新增 8 条项目路由；ID、规范化 route 唯一。
- `project-index.yml` 包含 13 个 subject：9 个核心页 subject、2 个历史 subject、2 个 watch-only subject。
- 六个核心页、一个总览和一个历史页均存在；每页 `project-id` 与 registry、项目索引一致。
- 六个核心页各包含模板 13 个部分、一个主调用链、3–12 个固定源码入口和至少一个失败边界；全目录精确包含 64 个文件级 entrypoint。OpenHands 页面固定 9 个入口，评测页固定 12 个入口（SWE-bench 4 个、τ²-bench 8 个），Dify 固定 12 个，CrewAI 固定 10 个；Dify 与 CrewAI 多轨图中的每条可视化 track 均不得超过 12 个节点。
- 页面所有源码链接使用 40 位固定 commit；不存在 `blob/main/` 或 `blob/master/`。
- 许可证、仓库状态、教学层级和设计日 pin 与第 8 节逐项一致。
- 页面引用的面试题 ID 全部存在于现有 42 题；题目数组、答案和分布不变。
- AutoGPT/Flowise 只在历史页，Hermes/OpenClaw 只在 watch-only 区；它们不进入 CourseItem 或 readingPaths。
- 不使用 Star、下载量或榜单名次证明工程质量；不声称本书取得官方 benchmark 成绩。

### 18.2 课程与路由

- project stage 恰好 7 个 CourseItem；全书公开完成度分母恰好 26。
- 六个核心项目在课程地图各出现一次；总览和历史页不计完成度。
- engineering 路径恰好 17 站，原 10 站顺序不变，后接六个核心项目和交付型案例。
- `/course/` SSR 恰好包含 26 个唯一课程链接；每个目标 HTML 存在。
- dist 只允许本设计 8 个 `/projects` 页面，拒绝额外 `/projects/**` 与全部 `/labs/**`、`/capstone/**`。
- 新路由的 clean URL 与尾斜杠形式均为 200；全部旧 URL 保持 200。
- process docs 与项目研究草稿不进入 dist。

### 18.3 版权与来源

- 外部素材目录中的每个文件在 `assets/provenance.yml` 有且仅有一条有效记录。
- 直接素材的 URL 固定到 commit，许可证覆盖具体文件，归因和 alt 非空。
- 页面引用的 source path 在对应 pinned commit 中存在；canonical repo 未发生未记录重定向。
- Dify、AutoGPT、Flowise、MCP 的特殊许可证边界有静态断言，不能被简化成错误的单一 SPDX 标签。
- 自动检查只开待审记录，不自动修改或发布正文。

### 18.4 浏览器与可访问性

- 1440px 与 390px、浅色与深色分别检查总览和至少两个复杂页面。
- 页面无横向溢出；调用链、源码路径和版本卡在 390px 可读。
- 键盘可依次访问项目导航、固定源码和相关面试题，焦点清晰。
- 读屏能分别读出项目教学层级、仓库状态、固定版本、调用链顺序和风险说明。
- 无 JavaScript 时八个页面的核心内容和链接完整可用。
- 打印 PDF 包含全部调用链与源码入口，不遗漏折叠内容。
- 控制台、资源请求和内部链接无错误。

### 18.5 完整门禁

- `pnpm test`、`pnpm validate`、`pnpm build` 和 dist 校验全部通过；
- 项目来源真实巡检完成且没有永久失败或解析失败；
- `git diff main...HEAD --check` 无输出；
- Pages Actions 成功后，线上八个项目路由、课程地图、engineering 路径和旧入口复验通过。

## 19. 非目标

本阶段明确不做：

- Python Lab 包、fixture、虚拟环境、Docker compose 或运行命令；
- 调用真实模型、执行 Aider/OpenHands/Dify/CrewAI 或跑 benchmark；
- MCP Server 示例实现、综合项目或 Computer Use 选修；
- 登录、评论、后端、云端进度、在线 AI 问答或遥测；
- 新增面试题或复制现有答案；
- 框架排名、Star 榜、价格表或“最佳框架”结论；
- 把 Hermes Agent、OpenClaw、AutoGPT 或 Flowise 作为初学者默认安装步骤；
- 直接搬运官网图片、Logo、README 截图或第三方 benchmark 图表；
- 自动抓取上游内容并改写正文。

## 20. 实施边界与完成定义

第二阶段只有在以下条件同时满足时才完成：

1. 八个公开项目路由、六个核心源码拆解和历史反例全部达到模板契约；
2. 13 个 subject 的 pin、源码入口、维护与许可证事实通过人工核验；
3. 课程地图、工程路径、导航和完成度从现有数据稳定扩展；
4. 原创图、provenance、无 JavaScript、390px、读屏与打印验收通过；
5. 自动化只发现变化，不能自动发布上游结论；
6. 第三阶段 Lab 和第四阶段综合项目没有被夹带。

本规格获批后，下一步只编写文件级实施计划；未通过计划复核前不创建项目页面或改站点实现。
