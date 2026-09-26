---
title: CrewAI：角色协作怎样落到任务执行
description: 沿 sequential process 追踪 Crew、Task、Agent、Executor、Tool 与输出，不把角色扮演当工程隔离。
---

# CrewAI：角色协作怎样落到任务执行

## 30 秒结论

CrewAI 用 Crew、Process、Task 与 Agent 组织协作，再由 executor 和 tool usage 完成具体循环。角色名称不会自动形成权限隔离，也不会自动带来质量增益。

## 为什么选

它能把第 7 章的 handoff、共享状态、协调成本和角色消融落到源码。页面选择 sequential process，保证调用链可追踪，而不是罗列所有模式。

## 版本与边界

<ProjectMeta project-id="project-crewai" />

固定版本已采用 `lib/crewai/...` monorepo 路径。Flow、A2A、企业平台和全部工具集合不进入本页主链。

## 原创建筑图

<ProjectCallChain project-id="project-crewai" />

图中 Task 是可验证工作单元，Agent 是执行主体，Process 决定编排；三者不能只靠自然语言角色名连接。

## 唯一纵向调用链

从 `Crew.kickoff` 进入 process 选择和共享执行状态，再由 Task 分配 Agent，CrewAgentExecutor/StepExecutor 驱动工具循环，最后返回 TaskOutput。

## 关键源码入口

<ProjectSourceLinks project-id="project-crewai" />

## 一次请求的数据流

输入进入 Crew 后被绑定到任务。sequential process 选择当前 Task，Agent 构造任务上下文，executor 推进模型与工具步骤，ToolUsage 记录调用结果，TaskOutput 回到 Crew 供下一项任务使用。

## 阅读练习

1. 找出 `kickoff` 如何选择 process。
2. 记录 Task、Agent 和 executor 各自拥有的状态。
3. 设计一个移除第二个角色的消融实验，并写明比较指标。

## 失败边界

工具失败、Agent 无进展、Task 输出不满足预期和跨角色信息丢失必须分别处理。把完整聊天转交给下一个角色既会复制噪声，也不能证明 handoff 正确。

## 生产边界

多 Agent 会增加调用、等待、共享状态和评测组合。只有当权限、上下文或可并行工作确实分离，并且消融实验显示增益时，才值得保留多个角色。

## 高频面试点

- [IQ-07-A：多 Agent 的价值和成本](/chapters/07-multi-agent#iq-07-a)
- [IQ-07-B：可靠 handoff 包含什么](/chapters/07-multi-agent#iq-07-b)
- [IQ-07-C：怎样识别昂贵角色扮演](/chapters/07-multi-agent#iq-07-c)

## 升级复核

检查 monorepo 路径、`Crew.kickoff`、Process、Task、Agent core、executor、step executor 和 ToolUsage。新增模式先进入 Radar，不自动替换本页 sequential 主链。

## 来源与归因

调用链图为本书原创重绘，依据固定 commit 的 MIT 源码。页面不复用 CrewAI Logo、官网截图或营销对比图。
