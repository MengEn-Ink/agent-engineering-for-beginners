---
title: OpenHands：从 Agent Canvas 到受控工作区
description: 按当前多仓库架构追踪 Canvas、Agent Server、SDK agent、工具、工作区与事件回流。
---

# OpenHands：从 Agent Canvas 到受控工作区

## 30 秒结论

当前 OpenHands 不是旧版单体 Python Agent 仓库。`OpenHands/OpenHands` 主要承载 Agent Canvas 与本地编排，`OpenHands/software-agent-sdk` 承载 Agent Server、conversation、agent、tool 和 workspace；两者通过公开客户端与事件契约连接。

## 为什么选

它能把大型 Coding Agent 的产品界面、服务边界、执行循环和环境权限拆开观察。读者应学会跨仓库追踪契约，而不是从头阅读全部源码。

## 版本与边界

<ProjectMeta project-id="project-openhands" />

Canvas v1.24.0 依赖 `@openhands/typescript-client@1.49.6`，与本页固定的 software-agent-sdk v1.49.6 对齐。页面只解释已有会话的 message/action/event 链，不追踪 conversation 创建链。

## 原创建筑图

<ProjectCallChain project-id="project-openhands" />

图中最重要的边界是：Canvas `Message` 是客户端传输消息，SDK `MessageEvent` 才进入持久事件模型。Agent Server 直接调用 `LocalConversation`，SDK 决定动作并调用工具；Workspace 只是工具的 owner 与配置边界，是不在主调用链上的旁路，不是这条链的下一跳。

## 唯一纵向调用链

从 `handleSendMessage` 与 `useSendMessage().send` 进入 WebSocket 后，`events_socket` 把消息交给 `EventService.send_message`，再由 `LocalConversation.send_message` 写入用户 `MessageEvent`。执行侧由 `EventService.run`、`LocalConversation.arun` 和 `Agent.astep` 推进；tool call 被转成 `ActionEvent`，执行结果形成 `Observation`。事件侧的持久化 append 先发生，之后才经 PubSub、`AsyncCallbackWrapper` 和 `_send_event` 回到 Canvas event store。图中的三条 track 不是一条跨异步边界的同步调用栈。

## 关键源码入口

<ProjectSourceLinks project-id="project-openhands" />

## 一次请求的数据流

用户消息由 Canvas 发送到已有 conversation 的 Agent Server。Canvas Message 与 SDK event 不能混为一个对象：服务把消息交给 `LocalConversation`，agent 基于持久事件产生 `ActionEvent`，工具返回 `Observation`，`LocalConversation._on_event` 先追加持久事件，再异步发布给客户端。模型生成过程中的 streaming delta 不属于持久事件回流链，而是非持久旁路，也不能被当作已完成动作。权限、秘密和文件范围仍必须由工具及其 Workspace owner 实际限制。

## 阅读练习

1. 从 `handleSendMessage` 追到 `LocalConversation.send_message`，标出 Canvas Message 与 SDK `MessageEvent` 的转换点。
2. 从 `_ahandle_tool_calls` 追到 `ToolDefinition.__call__`，区分 `ActionEvent` 与 `Observation`。
3. 从 `LocalConversation._on_event` 追到 Canvas event store，解释为何持久追加与异步推送不能画成一个同步调用栈。

## 失败边界

如果 Agent Server 连接中断，Canvas 的“发送成功”不能冒充 workspace 动作完成。恢复必须基于 conversation/event 状态；直接重放高风险动作前要检查外部副作用。

## 生产边界

直接在宿主机启动 Agent Server 会拥有主机文件权限。Docker 或远端环境也不是自动安全，需要目录挂载、网络、秘密、工具和审批的最小权限策略。

## 高频面试点

- [IQ-09-B：沙箱、guardrail 与最小权限](/chapters/09-safety-recovery#iq-09-b)
- [IQ-10-A：从 Demo 到生产](/chapters/10-production#iq-10-a)
- [IQ-13-C：怎样验收 Coding Agent](/chapters/13-coding-agent#iq-13-c)

## 升级复核

先检查 Canvas 的消息 hook 与 WebSocket context、客户端依赖版本、Agent Server event service、SDK `LocalConversation`/Agent 和 Tool 契约。仓库再次拆分或合并时，先改边界图再改调用链。

## 来源与归因

架构图为本书原创重绘，依据固定的 Canvas 与 software-agent-sdk 两个仓库。页面不复用 OpenHands Logo、README 截图或云产品素材。
