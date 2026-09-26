---
title: CrewAI：默认 sequential 怎样产生 CrewOutput
description: 固定同步、无 planning 的 sequential 主链，再分开阅读 text、native tool 与 planning 条件分支。
---

# CrewAI：默认 sequential 怎样产生 CrewOutput

## 30 秒结论

本页的唯一默认主链固定为 `Process.sequential + Task.async_execution=false + Agent.planning=false`。CrewAI 用 Crew、Task 与 Agent 表达编排，但真正执行由默认 `experimental.AgentExecutor` 完成；角色名称不会自动形成权限隔离，角色数量也不是多 Agent 价值的证据。

## 为什么选

它能把第 7 章的 handoff、共享状态、协调成本和角色消融落到源码。只有权限、上下文或可并行工作确实分离，并且消融实验显示增益，多个 Agent 才有工程价值。

## 版本与边界

<ProjectMeta project-id="project-crewai" />

本页固定在 1.15.22（commit `7a01af27912c2b142d8bac70d1894343f8b91bd1`）的 `lib/crewai/...` monorepo 包。默认条件是同步 task 且关闭 agent planning；Flow、A2A、hierarchical process、企业平台和完整工具集合不进入主链。

## 原创建筑图

<ProjectCallChain project-id="project-crewai" />

两个 default sequential track 是一条连续主链的分段。Process enum 只用于 kickoff 内的分支判断，不是执行节点。text ReAct、native tool 与 planning 是条件 track，不应串成每次执行都会经过的调用栈；每个 track 都控制在 13 个节点以内。

## 唯一纵向调用链

默认链为：`Crew.kickoff → begin_execution → prepare_kickoff → setup_agents → Agent.create_agent_executor → kickoff 判断 self.process == Process.sequential → Crew._run_sequential_process → Crew._execute_tasks → prepare_task_execution → Task.execute_sync → Task._execute_core → Agent.execute_task → experimental.AgentExecutor.invoke → AgentFinish.output → Agent._finalize_task_execution → Task._execute_core 构造并持有 TaskOutput → Crew._create_crew_output → end_execution`。其中 `Crew._create_crew_output 构造 CrewOutput`，随后 kickoff 的 `finally` 关闭 execution context。

`prepare_kickoff → setup_agents → Agent.create_agent_executor` 发生在 process 分支选择之前。默认 executor 是 `experimental.AgentExecutor.invoke`；CrewAgentExecutor 已 deprecated，只是兼容实现，不能再画成默认主链。

## 关键源码入口

<ProjectSourceLinks project-id="project-crewai" />

## 一次请求的数据流

输入进入 Crew 后先由 `begin_execution` 打开执行与 tracing context，再完成 kickoff 准备和 agent executor 装配，之后 kickoff 才判断 `self.process == Process.sequential`。`Crew._execute_tasks` 在 `Task.async_execution=false` 下准备当前 task，`Task._execute_core` 委托 `Agent.execute_task`，随后进入 executor。`Agent.planning=false` 会绕过 planning/todos；executor 在 text ReAct 与 native tool 是二选一的条件分支，二者收敛到 `AgentFinish.output`，再由 Agent 完成 finalize。Task 对输出的所有权边界是：`Task._execute_core 构造并持有 TaskOutput`，`_export_output` 只负责结构化输出转换；最终 `Crew._create_crew_output 构造 CrewOutput`，`end_execution` 再关闭上下文。

text 分支是 `call_llm_and_parse → execute_tool_action → ToolUsage.use → ToolUsage._use → CrewStructuredTool.invoke`。native 分支是 `call_llm_native_tools → execute_native_tool → _execute_single_native_tool_call → _available_functions[...]`；它不经过 ToolUsage。两条分支都可能直接得到完成答案，不能强制画成先 text 后 native。

## 阅读练习

1. 从 `Crew.kickoff` 找出 `prepare_kickoff` 与 `Process.sequential` 的真实先后顺序。
2. 对照 text 与 native track，说明各自在哪里解析或分派工具。
3. 移除第二个角色做消融实验，比较任务质量、调用量、延迟、handoff 丢失与权限面，而不是比较角色数量。

## 失败边界

工具失败、Agent 无进展、Task 输出不满足契约、handoff 信息丢失和最终 CrewOutput 为空必须分别归因。完整聊天转交会复制噪声，却不能证明交接正确；角色名不同也不代表状态、权限或失败域已经隔离。

## 生产边界

多 Agent 会增加调用、等待、共享状态与评测组合。StepExecutor 只在 planning_enabled 为 true 且 todos 已生成后懒创建；默认 `Agent.planning=false` 主链不经过它。启用 planning 意味着额外模型调用、todo 状态、观察与重规划边界，必须单独评测，不能拿角色数量当收益。

## 高频面试点

- [IQ-07-A：多 Agent 的价值和成本](/chapters/07-multi-agent#iq-07-a)
- [IQ-07-B：可靠 handoff 包含什么](/chapters/07-multi-agent#iq-07-b)
- [IQ-07-C：怎样识别昂贵角色扮演](/chapters/07-multi-agent#iq-07-c)

## 升级复核

检查 monorepo 路径、execution context、kickoff utilities、Process、Task、Agent core、默认 experimental executor、text/native 工具路径、StepExecutor 条件和两个 output owner。新模式先进入 Radar，不自动替换本页固定默认链。

## 来源与归因

调用链图为本书原创重绘，依据固定 commit 的 11 个 CrewAI 源文件和 MIT 许可证。页面不复用 CrewAI Logo、官网截图或营销对比图。
