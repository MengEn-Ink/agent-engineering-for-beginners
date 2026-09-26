---
title: Dify：一次请求怎样进入工作流图
description: 只追踪 service API、AppRunner、WorkflowEntry、Graphon、节点和响应事件这一条链。
---

# Dify：一次请求怎样进入工作流图

## 30 秒结论

Dify 把应用配置、模型、工具、知识与工作流组织成平台。真正执行不是“画布自己跑起来”，而是请求进入 AppRunner，由 WorkflowEntry 配置 Graphon，引擎调度节点并把事件转换成响应。

## 为什么选

它适合观察低代码平台如何把编辑态配置变成运行态控制流，以及多租户、插件、持久化和可观测层为什么不能被一张画布替代。

## 版本与边界

<ProjectMeta project-id="project-dify" />

本页固定在 1.17.1，只追踪 service API 的 workflow 执行。数据集、插件市场、计费、前端编辑器和云服务不展开。

## 原创建筑图

<ProjectCallChain project-id="project-dify" />

Graphon 是固定版本中实际的图执行依赖；页面必须把 Dify 的适配层与 Graphon 引擎分开标注。

## 唯一纵向调用链

从 workflow controller 进入 AppGenerator/AppRunner，再到 WorkflowEntry、GraphEngine、NodeFactory、AgentNode 和 response converter。只追这一条链，不从头解释整个仓库。

## 关键源码入口

<ProjectSourceLinks project-id="project-dify" />

## 一次请求的数据流

请求先经过应用与访问校验，生成运行配置和变量池。WorkflowEntry 创建 GraphEngine 并叠加执行限制、可观测与持久化层；NodeFactory 按版本解析节点，节点产生事件，响应转换器再把内部事件变成调用方可消费的输出。

## 阅读练习

1. 从 controller 找到 AppRunner 的创建位置。
2. 在 WorkflowEntry 中列出 GraphEngine 之外叠加的三个工程层。
3. 找出节点类型和版本如何进入 NodeFactory。

## 失败边界

节点执行失败、人工输入暂停、执行上限和响应流中断是不同状态。不能把“前端仍显示流程图”当作运行继续，也不能在恢复时忽略已经发生的外部副作用。

## 生产边界

平台封装不自动保证工作流适合 Agent、工具最小权限、数据隔离或结果正确。Dify 使用修改版 Apache-2.0，多租户服务与前端标识复用必须先读根许可证。

## 高频面试点

- [IQ-02-B：何时从 Workflow 升级为 Agent](/chapters/02-workflow-agent#iq-02-b)
- [IQ-06-A：什么时候需要显式 Graph](/chapters/06-loop-graph#iq-06-a)
- [IQ-10-A：从 Demo 到生产](/chapters/10-production#iq-10-a)

## 升级复核

比较 controller、AppRunner、WorkflowEntry、Graphon 版本、NodeFactory、AgentNode 和事件转换。许可证文本或 Graphon 主版本变化必须触发人工复核。

## 来源与归因

执行图为本书原创重绘，依据固定 commit 的 Dify 源码。页面不复用 Dify Logo、产品截图或受外观专利保护的视觉表达。
