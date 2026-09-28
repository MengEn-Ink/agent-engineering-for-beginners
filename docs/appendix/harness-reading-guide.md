---
title: Learn Claude Code：从最小循环到可验收 Harness
description: 沿 17 个递进示例理解 Agent Loop、权限、上下文、持久任务、多 Agent 与独立验收如何接回同一运行时。
---

# Learn Claude Code：从最小循环到可验收 Harness

## 30 秒结论

[Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code/tree/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3) 最值得初学者借鉴的不是某个 Claude API 写法，而是它的教学尺度：每一章只增加一种机制，同时保留同一个 `messages → model → tool → result → messages` 主循环。先看见最小系统，再逐层加入权限、上下文、记忆、持久任务和验收，比先背完整框架更容易建立工程直觉。

## 为什么选

本书解释“为什么这样设计”，这个仓库适合补上“最小代码怎样长出来”。建议先沿本页跑通七个观察点，再回到对应章节理解边界：循环对应第 3 章，工具与权限对应第 4、9 章，上下文与任务状态对应第 5、6 章，多 Agent 对应第 7 章，独立验收对应第 8 章。

## 版本与边界

本页固定在 commit [`ce8f9f1`](https://github.com/shareAI-lab/learn-claude-code/tree/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3)，把 17 章压缩成一条从最小循环到 Goal Loop 的阅读主线。示例使用的模型 SDK、终端命令和教学用 MCP 实现不是本书推荐的唯一技术栈；这里关注的是机制如何进入运行时，以及它带来了什么失败边界。

## 七站阅读图

| 观察站 | 对应示例 | 只追一个问题 | 回到本书 |
| --- | --- | --- | --- |
| 最小循环 | s01 | 观察结果怎样回到下一轮决策 | 第 3 章 |
| 工具契约 | s02 | schema、handler、dispatcher 怎样分工 | 第 4 章 |
| 权限门禁 | s03–s04 | 哪些判断必须在副作用前完成 | 第 9 章 |
| 上下文预算 | s07–s09 | 大结果、历史和长期记忆放在哪里 | 第 5 章、Context Engineering |
| 持久任务 | s10–s12 | 依赖、认领、后台执行怎样恢复 | 第 6 章、长时运行与恢复 |
| 集成 Harness | s13–s16 | 多 Agent、MCP 与 Workflow 怎样接回主循环 | 第 7 章 |
| 独立验收 | s17 | 谁根据环境证据决定真正停止 | 第 8 章 |

这七站不是七套 Agent，而是在同一个执行循环上逐步回答：怎么行动、能力如何声明、谁能批准、上下文何时收缩、任务状态放哪里、机制如何组合、由谁判断真的完成。

## 关键源码入口

- [s01 · `agent_loop`](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/s01_agent_loop/code.py)：建立模型请求动作、环境返回观察的最小闭环。
- [s02 · `TOOL_HANDLERS`](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/s02_tool_use/code.py)：把工具声明、路径边界和执行函数分开。
- [s03 · `check_permission`](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/s03_permission/code.py)：按拒绝规则、自动规则和人工确认分层决策。
- [s08 · `ContextCompactor.prepare`](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/s08_context_compact/code.py)：在模型调用前处理大结果和长历史。
- [s10 · `claim_task`](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/s10_task_system/code.py)：把依赖、认领和完成状态写入任务图。
- [s13 · `MessageBus`](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/s13_agent_teams/code.py)：用原子认领与显式消息协调多个执行者。
- [s15 · `assemble_tool_pool`](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/s15_integrated_harness/code.py)：把工具、记忆、任务、调度、团队和 MCP 接回统一循环。
- [s17 · `GoalController.evaluate_after_turn`](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/s17_goal_loop/code.py)：由独立评估器根据证据决定继续、重试或停止。

## 一次请求的数据流

1. **输入目标**：用户目标进入消息历史，但它还不是可执行动作。
2. **请求能力**：模型输出结构化工具调用，dispatcher 只接受已注册 schema。
3. **执行前治理**：权限层先做确定性拒绝与规则判断，需要时再请求人工批准。
4. **回注观察**：工具结果以数据身份返回消息历史，不能反过来取得系统指令权。
5. **控制预算**：历史过长时保留任务事实、摘要和可恢复引用，而不是静默截断。
6. **持久推进**：长任务把依赖、认领、完成和失败写入任务图，不靠聊天文本猜进度。
7. **独立验收**：执行者报告完成后，评估器仍按目标证据判断是否需要继续。

## 阅读练习

按 s01 → s02 → s03 → s08 → s10 → s15 → s17 的顺序，每站只回答三问：新增状态由谁拥有？新增失败发生在动作前还是动作后？什么证据能证明这一层有效？然后选择一个“整理三份资料并产出对比表”的小任务，先写完成条件，再逐站补机制；不要一开始复制集成 Harness。

## 失败边界

- 工具 schema 合法不代表业务动作安全，权限仍需按副作用判断。
- 压缩上下文会丢细节；原始大结果必须可定位，摘要必须说明遗漏范围。
- 任务持久化不自动带来并发正确性；认领、租约、重试和幂等要分别设计。
- 多 Agent 增加通信、冲突与资源成本，不应替代一个本来就能完成任务的单 Agent。
- 执行者自报“完成”不是证据，评估器也需要独立输入和失败出口。

## 生产边界

仓库代码是教学用最小实现，不是可直接上线的平台。走向生产还要补身份与密钥隔离、结构化审计、超时与取消、成本预算、幂等和补偿、工作目录隔离、版本迁移、恶意工具结果处理，以及可重复的离线评测与线上监控。

## 和《Agentic AI 指南》怎么搭配

[Agentic AI 指南 v1.1.0](https://github.com/Chasing1020/agentic-ai-guide-zh/releases/tag/v1.1.0) 提供“模型基础—训练与对齐—推理—评估—Agent 系统”的 30 章全景。初学者不必先通读训练算法：先用本页理解 Agent Loop 和 Harness，再读指南中的评估、RAG、Memory、编排、Loop Engineering、MCP 与多 Agent；需要理解模型为何如此表现时，再回看 Transformer、强化学习和推理章节。

## 高频面试点

- [IQ-03-A：为什么观察比一次性规划更重要](/chapters/03-react#iq-03-a)
- [IQ-04-A：工具契约应包含哪些边界](/chapters/04-tools-mcp#iq-04-a)
- [IQ-08-A：怎样把“看起来不错”变成验收证据](/chapters/08-evaluation#iq-08-a)

## 升级复核

复核新版本时，不按文件数量判断“更强”，而是重新检查：最小循环是否仍是唯一控制主线；权限是否仍发生在副作用之前；上下文压缩是否保留可恢复证据；任务认领是否原子；独立评估是否真的能让执行继续。任何一项语义变化，都应同步核对本书第 3、5、6、7、8、9 章。

## 来源与归因

本页的章节映射、七站主线与生产边界均为本书基于固定 commit 的原创归纳。源码采用 [MIT License](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/LICENSE)；本页只做结构归纳与固定源码链接，不复制课程原文、图表或代码。
