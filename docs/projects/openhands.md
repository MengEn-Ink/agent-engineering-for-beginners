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

Canvas v1.24.0 依赖 `@openhands/typescript-client@1.49.6`，与本页固定的 software-agent-sdk v1.49.6 对齐。页面只解释一次 conversation 到 workspace event 的路径。

## 原创建筑图

<ProjectCallChain project-id="project-openhands" />

图中最重要的边界是：Canvas 选择并连接 backend，Agent Server 承接会话，SDK 决定动作，Workspace 限制动作发生在哪里。

## 唯一纵向调用链

从 Canvas conversation service 开始，经过 adapter 和 Agent Server router/service，进入 SDK Conversation 与 Agent，最后由 Tool/Workspace 产生事件回流界面。不要把 UI 中的 backend selector 当作沙箱。

## 关键源码入口

<ProjectSourceLinks project-id="project-openhands" />

## 一次请求的数据流

用户消息由 Canvas 发送到选定 Agent Server。服务创建或恢复 conversation，SDK agent 基于已有事件产生动作，工具在 workspace 边界执行，观察与状态事件再通过服务和客户端回到 Canvas。权限、秘密和文件范围必须在服务与 workspace 层实际限制。

## 阅读练习

1. 找出 Canvas 如何选择 Agent Server，而不是直接调用 Python agent。
2. 从 conversation router 追到 SDK Conversation。
3. 画出宿主机直跑、Docker 和远端 workspace 的信任边界差异。

## 失败边界

如果 Agent Server 连接中断，Canvas 的“发送成功”不能冒充 workspace 动作完成。恢复必须基于 conversation/event 状态；直接重放高风险动作前要检查外部副作用。

## 生产边界

直接在宿主机启动 Agent Server 会拥有主机文件权限。Docker 或远端环境也不是自动安全，需要目录挂载、网络、秘密、工具和审批的最小权限策略。

## 高频面试点

- [IQ-09-B：沙箱、guardrail 与最小权限](/chapters/09-safety-recovery#iq-09-b)
- [IQ-10-A：从 Demo 到生产](/chapters/10-production#iq-10-a)
- [IQ-13-C：怎样验收 Coding Agent](/chapters/13-coding-agent#iq-13-c)

## 升级复核

先检查 Canvas README 的 repository boundaries、客户端依赖版本、Agent Server conversation API、SDK Conversation/Agent 和 Workspace 契约。仓库再次拆分或合并时，先改边界图再改调用链。

## 来源与归因

架构图为本书原创重绘，依据固定的 Canvas 与 software-agent-sdk 两个仓库。页面不复用 OpenHands Logo、README 截图或云产品素材。
