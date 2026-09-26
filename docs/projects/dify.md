---
title: Dify：blocking 请求怎样穿过工作流图
description: 固定 service API 的 blocking 主链，并把 streaming 作为独立交付旁路。
---

# Dify：blocking 请求怎样穿过工作流图

## 30 秒结论

Dify 的画布不是执行者。编号主链只选择 blocking：Service API 经过生成服务与 workflow generator/runner，先由 `Graph.init` 和 `DifyNodeFactory.create_node` 得到图及节点，再把已经创建的 Graph 交给 WorkflowEntry；Graphon 推进节点后，事件依次经过 queue、pipeline、内部 typed response 和最终 public payload。streaming 是独立旁路，不能混进这条同步返回链。

## 为什么选

它适合观察低代码平台怎样把编辑态配置变成运行态控制流，也能暴露平台边界：多租户、权限、插件、队列、交付方式与许可证限制都不会被一张画布消除。

## 版本与边界

<ProjectMeta project-id="project-dify" />

本页固定在 1.17.1（commit `8387590ace4a094de812b7847fc6a4c3a27cd52b`），只解释 `WorkflowRunApi.post` 接收的 service API workflow 请求。数据集、插件市场、计费、前端编辑器和云服务不展开；主链固定 `response_mode=blocking`。

## 原创建筑图

<ProjectCallChain project-id="project-dify" />

图中两个 blocking track 是同一条编号链为控制复杂度而分段，第三个 track 才是 streaming side path。Graphon 是固定版本中的图执行依赖；Dify 的装配、事件与响应适配层必须和 Graphon 引擎分开读。

## 唯一纵向调用链

blocking 主链按源码顺序为：`WorkflowRunApi.post → AppGenerateService.generate → AppGenerateService._run_with_guardrails → AppGenerateService._dispatch_generate(AppMode.WORKFLOW, streaming=false) → WorkflowAppGenerator.generate → WorkflowAppGenerator._generate → WorkflowAppGenerator._generate_worker → WorkflowAppRunner.run → WorkflowBasedAppRunner._init_graph → Graph.init + DifyNodeFactory.create_node → DifyAgentNode.__init__（仅 agent_node_kind == dify_agent）→ WorkflowEntry(existing Graph) → GraphEngine.run → worker → Node.run → DifyAgentNode._run/_run_inner → create_run → stream_events → WorkflowAppRunner._handle_event → WorkflowAppQueueManager → WorkflowAppGenerateTaskPipeline → WorkflowResponseConverter 内部 typed response → WorkflowAppGenerateResponseConverter 最终 public payload`。

WorkflowEntry 接收已经创建的 Graph，再配置并运行 GraphEngine；GraphEngine 并不负责创建节点。DifyAgentNode 也不直接输出 SSE，它把 agent backend 事件适配为图节点事件。

## 关键源码入口

<ProjectSourceLinks project-id="project-dify" />

## 一次请求的数据流

blocking 请求先完成应用校验、配额与并发 guardrail，再选择 `AppMode.WORKFLOW`。generator 创建 queue manager 和工作线程；runner 建变量池并初始化 Graph，`DifyNodeFactory.create_node` 依据节点类型与版本构造节点。只有配置为 agent v2 且 `agent_node_kind == dify_agent` 时才进入 DifyAgentNode，它通过 backend `create_run → stream_events` 产生节点事件。`WorkflowAppRunner._handle_event` 把 Graphon 事件转换成 app queue event，`WorkflowAppGenerateTaskPipeline` 消费并聚合；通用 `WorkflowResponseConverter` 只生成内部 typed response，最后由 `WorkflowAppGenerateResponseConverter` 映射 public payload。

streaming 旁路先订阅 topic，再投递 Celery `_AppRunner`；worker 进入同一套 WorkflowAppGenerator/WorkflowAppRunner 执行，完成 public mapping 后写入 topic，请求进程再 `retrieve_events` 并转成 SSE。这里的 Celery `_AppRunner` 与执行工作流的 `WorkflowAppRunner` 是两类 Runner 不是同一个对象。

## 阅读练习

1. 从 `WorkflowRunApi.post` 追到 `_dispatch_generate`，说明 blocking 分支在哪里确定。
2. 从 `_init_graph` 追踪 `Graph.init` 与 `DifyNodeFactory.create_node`，解释为什么 WorkflowEntry 拿到的是 existing Graph。
3. 对照 blocking 与 streaming track，标出 public mapping、topic 写入、retrieve 和 SSE 的先后关系。

## 失败边界

请求被 guardrail 拒绝、节点失败、agent backend 流中断、人工输入暂停、Graphon 执行上限和响应交付中断是不同状态。恢复前必须区分图执行是否已产生外部副作用；页面仍显示流程图或 SSE 连接仍存在，都不能证明节点成功。

## 生产边界

执行限制、可观测与部分状态层会装配到 GraphEngine，但持久化也不归 WorkflowEntry 单独负责；队列、task pipeline、数据库仓储与 streaming topic 各有职责。平台封装也不自动保证工具最小权限、租户数据隔离或输出正确。Dify 使用修改版 Apache-2.0，根许可证对多租户服务、前端标识及外观专利另有附加条件，商业或平台复用必须逐条核对。

## 高频面试点

- [IQ-02-B：何时从 Workflow 升级为 Agent](/chapters/02-workflow-agent#iq-02-b)
- [IQ-06-A：什么时候需要显式 Graph](/chapters/06-loop-graph#iq-06-a)
- [IQ-10-A：从 Demo 到生产](/chapters/10-production#iq-10-a)

## 升级复核

逐项复核 controller、AppGenerateService、WorkflowAppGenerator、两类 Runner、Graphon 版本、NodeFactory、agent node、WorkflowEntry、queue、task pipeline 与两级 response converter。Graphon 主版本、streaming transport 或根许可证变化都必须触发人工复核。

## 来源与归因

调用链图为本书原创重绘，依据固定 commit 的 12 个 Dify 源文件。页面不复用 Dify Logo、产品截图或受外观专利保护的视觉表达。
