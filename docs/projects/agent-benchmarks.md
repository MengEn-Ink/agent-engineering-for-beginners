---
title: Agent 评测基准：从任务到可复核评分
description: 对照 SWE-bench 与 τ²-bench 的任务、环境、轨迹和评分边界，不混用指标。
---

# Agent 评测基准：从任务到可复核评分

## 30 秒结论

SWE-bench 关注代码补丁能否在固定仓库环境通过指定测试；τ²-bench 关注 Agent 与用户、工具和业务状态的多轮交互。两者任务、环境和评分合同不同，分数不能直接横比。

## 为什么选

这两个项目把第 8 章的“结果、轨迹、环境与证据”落到真实 harness。重点不是榜单，而是分母、环境、失败分类和可复现性。

## 版本与边界

<ProjectMeta project-id="project-agent-benchmarks" />

SWE-bench 的 v5.0.1 是 tag，不冒充 GitHub Release。页面只拆评测执行链，不复制数据集，也不运行模型或发布分数。

## 原创建筑图

<ProjectCallChain project-id="project-agent-benchmarks" />

两条受控轨道并列，分别闭合到自己的评分，不在图末尾合成一个“总分”；这不是先运行 SWE-bench 再运行 τ²-bench 的顺序流程。

## 唯一纵向调用链

本页使用一个“任务到评分”的比较视图：左轨是 patch、容器、测试与 report；右轨从当前 `tau2` CLI 的 `main` 开始。`main` 注册局部 `run_command`，再把 `tau2 run` 分派到 `run_domain`、任务加载、单任务 simulation、orchestrator、环境工具、trajectory、evaluation 与 `reward_info`；`run_command` 不是可链接的顶层 symbol。两轨只比较证据结构，不暗示调用关系或数值高低。

## 关键源码入口

<ProjectSourceLinks project-id="project-agent-benchmarks" />

## 一次请求的数据流

SWE-bench 将实例和预测 patch 放入隔离环境，运行目标测试并由 grading 生成解决状态。τ²-bench 由当前 CLI 调用 batch runner，构建 agent、user、environment 与 orchestrator；simulation 保留 trajectory。只有默认 `EvaluationType.ALL` 按 `task.reward_basis` 选择分量后相乘，ACTION 只有被选中时才是硬门禁；单项类型与 `*_IGNORE_BASIS` 各走自己的分支。early termination 返回 `0.0`，没有 criteria 时返回 `1.0`，这些短路结果不能冒充默认 ALL 分支的乘积。

## 阅读练习

1. 找出 SWE-bench 的预测输入、容器执行和最终报告边界。
2. 找出 τ²-bench 中 user simulator 与 environment 的职责差异。
3. 列出三个会让两个分数不可比较的契约差异。

兼容层里的 `tau2.run.run_task` 与 `tau2.run.run_tasks` 是旧 flat 参数 API 已 deprecated；这不是说整个 `tau2.run` module 都 deprecated，也不是当前 CLI 主链入口。

## 失败边界

镜像构建失败、基础设施超时、测试解析失败和产品行为失败必须分开。把环境阻塞从分母删掉或把解析异常当作模型失败，都会制造错误结论。

## 生产边界

公开 benchmark 不能替代企业自己的权限、数据、延迟和业务后果评测。第三阶段若提供 10 条本地 fixture，它们只是本书自建微型回归集，不是官方 benchmark 成绩。

## 高频面试点

- [IQ-08-A：非确定性 Agent 怎样评测](/chapters/08-evaluation#iq-08-a)
- [IQ-08-B：怎样避免泄漏与指标投机](/chapters/08-evaluation#iq-08-b)
- [IQ-08-C：怎样避免单指标绑架](/chapters/08-evaluation#iq-08-c)

## 升级复核

检查任务 schema、环境镜像、预测格式、评分逻辑、失败分类和报告分母。任何 leaderboard 变化都只进入 Radar，除非 harness 契约本身改变。

## 来源与归因

比较图为本书原创重绘，依据两个固定 commit 的 harness 源码。页面不复制 benchmark 数据、排行榜或第三方仓库内容。
