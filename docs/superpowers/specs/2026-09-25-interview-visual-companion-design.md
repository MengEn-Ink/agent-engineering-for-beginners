# 面试题与解释性配图设计

日期：2026-09-25  
状态：用户已批准

## 目标

在不打断 14 章手册主线的前提下，加入 42 道高频 Agent / AI 工程面试题，并把解释性视觉扩充到约 22 个章节实例。题目帮助读者把概念组织成可表达的工程判断；图解帮助读者看清关系、流程、边界和决策。

“高频”表示公开岗位要求、官方工程材料和常见面试复盘中反复出现的核心主题，不宣称来自任何公司的内部题库，也不提供虚假的精确出现次数。

## 面试题结构

每章 3 题，共 42 题：

- 章中第 1 题：基础概念，检查是否能用自己的话解释；
- 章中第 2 题：工程追问，检查约束、取舍和失败处理；
- 章末第 3 题：场景设计，要求把本章方法放入真实系统。

岗位分布约为：工程岗 70%，产品 / 解决方案岗 30%。难度使用“基础、进阶、系统设计”三级。

每题包含：

- 唯一题号，例如 `iq-04-b`；
- 关联章节、岗位标签和难度；
- 题目；
- 30 秒回答骨架；
- 2–3 个常见追问；
- 高分要点；
- 常见失分点。

答案默认折叠，使用原生 `<details>`，避免正文被答案淹没。题目数据集中维护，章节与索引页共享同一份数据，避免复制答案后漂移。

## 面试题索引

新增 `/appendix/interview`，按主题、岗位和难度提供完整索引。索引只显示题目摘要和章节链接，答案仍在原章节上下文中。

主题至少覆盖：AI Native、Prompt / Workflow / Agent、ReAct、工具、MCP、状态、记忆、Graph、多 Agent、评测、可观测性、安全、生产化、研究、客服运营、Coding、Computer Use。

## 配图体系

目标为 22 个解释性视觉实例，不为数量制作装饰图。每张图必须解释以下至少一种信息：

- 组件关系；
- 执行流程；
- 权限或数据边界；
- 方案决策；
- 状态变化；
- 证据链与恢复路径。

保留现有 7 类图解：SystemStack、AgentLoop、DeliveryCase、DecisionLadder、MemoryLayers、EvidencePyramid、RiskMatrix。

新增 8 类图解：

- `NativeShift`：旧流程加聊天框与 AI Native 重构对比；
- `ToolBoundary`：模型、工具、权限、批准和外部系统边界；
- `GraphFlow`：分支、并行、人工等待、汇合与恢复；
- `MultiAgentHandoff`：执行者、审判者、共享证据和人类裁决；
- `ResearchPipeline`：问题树、搜索、证据、反证与综合；
- `ServiceEscalation`：客服从理解、查询、草稿到人工接管；
- `CodingLoop`：仓库核对、失败测试、修改、回归和差异审查；
- `BrowserEvidence`：观察、定位、风险确认、动作和业务验证。

## 章节图解映射

| 章 | 核心图 | 补充视觉 |
| --- | --- | --- |
| 01 | NativeShift | SystemStack |
| 02 | DecisionLadder | 控制方式对比表 |
| 03 | AgentLoop | 无 |
| 04 | ToolBoundary | SystemStack |
| 05 | MemoryLayers | 无 |
| 06 | GraphFlow | AgentLoop |
| 07 | MultiAgentHandoff | 无 |
| 08 | EvidencePyramid | DeliveryCase |
| 09 | RiskMatrix | DeliveryCase |
| 10 | DeliveryCase | 二维上线矩阵表 |
| 11 | ResearchPipeline | EvidencePyramid |
| 12 | ServiceEscalation | 无 |
| 13 | CodingLoop | 无 |
| 14 | BrowserEvidence | RiskMatrix |

合计 14 个核心图 + 8 个补充视觉实例。

## 图解表达与可访问性

- 使用项目内原创 Vue / SVG / CSS，不复制公众号或外部项目图片；
- 每张图有标题、结论型说明和“不要误解成什么”；
- 纯视觉关系使用 `role="img"` 与完整 `aria-label`；
- 含真实表格、列表或步骤的图保留原生语义，不统一套 `role="img"`；
- 颜色不是唯一编码，同时使用文字、形状、顺序和边线；
- 390px 下重排成纵向步骤、分组结构或受控横向滚动，不整体缩小成小字；
- 深浅色保持 WCAG AA；减少动态偏好下无非必要动画。

## 数据与组件

- `docs/.vitepress/theme/data/interviewQuestions.ts`：42 道题的唯一事实来源；
- `InterviewQuestion.vue`：按 ID 渲染章中折叠题；
- `InterviewIndex.vue`：按主题、岗位和难度渲染索引与章节链接；
- 8 个新增 diagram 组件：每个只负责一种关系；
- `docs/appendix/interview.md`：面试索引页面；
- 14 个章节分别插入 3 个问题和约定图解。

## 自动化验收

- 面试题恰好 42 道，ID 唯一，每章 3 道；
- 工程岗题目 29–30 道，产品 / 方案题 12–13 道；
- 每题具备 30 秒回答、2–3 个追问、高分要点和失分点；
- 每个题号在且只在一个章节出现；
- 索引引用全部题号并链接正确章节；
- 解释性视觉实例恰好 22 个；
- 8 个新图组件具备正确语义和移动端规则；
- 390px 无整页横向溢出；复杂图只在自身容器内滚动或重排；
- `pnpm test`、`pnpm validate`、`pnpm build`、搜索与 Pages 回归全部通过；
- 过程文档继续保持线上 404。

## 非目标

本轮不采集或声称任何公司内部题库，不增加用户答题记录、在线评分、登录、后端或 AI 模拟面试。题目是阅读辅助，不把整本书改造成应试题库。
