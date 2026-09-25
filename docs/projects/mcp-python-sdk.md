---
title: MCP 规范与 Python SDK：一次工具调用到底经过什么
description: 从 2026-07-28 规范到官方 Python SDK，拆开协议、传输、工具实现与业务授权。
---

# MCP 规范与 Python SDK：一次工具调用到底经过什么

## 30 秒结论

MCP 统一的是 Host、Client、Server 之间如何描述能力和交换消息。规范仓库定义协议，Python SDK 实现协议；业务授权、最小权限、工具副作用和结果真实性仍由应用负责。

## 为什么选

它把第 4 章的“工具契约”落到真实 schema、dispatcher、runner、transport 和工具对象。读完应能指出协议层、SDK 层与业务层分别负责什么，而不是把 MCP 叫作万能插件市场。

## 版本与边界

<ProjectMeta project-id="project-mcp-python-sdk" />

本页只解释固定版本中的 `tools/call` 主链。Resources、Prompts、OAuth 扩展和 draft 能力只标出边界，不展开成第二条主线。

## 原创建筑图

<ProjectCallChain project-id="project-mcp-python-sdk" />

图中每一层都可以替换实现，但消息结构、请求分发和业务授权不能互相冒充。示例里的 basic_tool.py 只注册工具，真正启动服务由宿主调用 `mcp.run`。

## 唯一纵向调用链

从 `CallToolRequest` 开始，沿宿主的 `MCPServer.run("stdio")`、`stdio_server`、`Server.run`、`serve_dual_era_loop`、`ServerRunner._on_request` 和 `get_request_handler` 进入 `tools/call` handler；再经过 `MCPServer._handle_call_tool`、`MCPServer.call_tool`、`ToolManager.call_tool`、`Tool.run` 和示例 `sum`，最后由 `ServerRunner._serialize` 生成 JSON-RPC response 并交给 `stdout_writer`。

## 关键源码入口

<ProjectSourceLinks project-id="project-mcp-python-sdk" />

源码链接全部固定到 commit；不要把 `main` 上的新扩展反推到本页版本。

## 一次请求的数据流

客户端发送带工具名和参数的 `tools/call`。Runner 负责兼容协议消息、调用 dispatcher，并把 handler 的结果序列化成 JSON-RPC response；stdio 层只提供 reader 与 `stdout_writer`。ServerSession 只是 request-scoped outbound proxy 旁路，不是入站请求的主 dispatcher。高层 handler 把请求交给工具路径后，ToolManager 只负责查找，Tool.run 才负责输入验证、调用函数和结果转换。业务系统仍必须重新校验调用主体、资源范围与副作用。

## 阅读练习

1. 在 schema 中找到 `CallToolRequest` 与结果类型。
2. 从宿主启动 `MCPServer.run("stdio")` 追到 `ServerRunner._serialize`。
3. 对比 ToolManager 的查找职责与 Tool.run 的验证、调用和结果转换。

## 失败边界

如果工具名存在但调用者无权操作目标资源，协议解析成功也必须拒绝业务动作。不要用“请求符合 MCP schema”替代身份、授权、幂等和真实回执。

## 生产边界

SDK 不自动提供租户隔离、凭证托管、数据可信度、工具审批或结果正确性。高风险工具仍需白名单、预算、审计、超时后的状态查询和人工接管。

## 高频面试点

- [IQ-04-A：工具契约至少包含什么](/chapters/04-tools-mcp#iq-04-a)
- [IQ-04-B：MCP 解决与不解决什么](/chapters/04-tools-mcp#iq-04-b)
- [IQ-04-C：怎样避免消息工具误发全员](/chapters/04-tools-mcp#iq-04-c)

## 升级复核

新版本出现时依次比较 schema、版本协商、tool result、connection、dispatcher 和 request-context；最后检查 Python SDK 对该规范版本的支持矩阵。只在差异影响本页主链时修订正文。

## 来源与归因

架构图为本书原创重绘，事实依据是上方固定的 MCP 规范和官方 Python SDK 源码。许可证按贡献历史与文件路径分别处理；公开可读不代表可无条件复制原图或大段代码。
