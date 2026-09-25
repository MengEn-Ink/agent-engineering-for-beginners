---
title: 延伸阅读与证据说明
description: 本书如何选择、分级和交叉核对 Agent 工程资料。
---

# 延伸阅读：先看原始证据，再看热闹

本书不按 Star 数做“十大框架”榜单。项目热度会变，设计取舍更值得长期学习。完整机器可读索引见仓库中的 `sources/source-index.yml`。

## A级：一手权威来源

用于概念定义、协议能力和工程边界。

- [Anthropic · Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)：workflow 与 agent 的区分、简单优先、常见组合模式。
- [Anthropic · Building agents with the Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)：上下文、行动、验证与循环。
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/2025-03-26)：协议角色和核心原语。
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)：agent、handoff、guardrail、session 与 tracing。
- [Google ADK · Evaluate agents](https://adk.dev/evaluate/)：轨迹、响应、安全与多轮评测。
- [Microsoft Research · AutoGen v0.4](https://www.microsoft.com/en-us/research/blog/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/)：Core、AgentChat、Extensions 分层。

## B级：可信工程实践

用于补充取舍、经验和解释，不覆盖 A 级来源的明确边界。

- [Chip Huyen · Agents](https://huyenchip.com/2025/01/07/agents.html)：规划、工具、效率、成本和延迟。
- 微信公众号「Agent 工程实践」合集：用于发现 Prompt→Loop→Graph、状态、评测和安全等选题；不搬运原图和大段原文。
- 本书的交付型案例：用于演示通用工程模式，只是案例推演，不单独证明外部事实。

## C级：社区线索

教程、论坛讨论、二次解读和排行榜属于 C级。它们适合帮助发现关键词、项目和争议，但不能单独支撑关键结论。采用前必须回到官方规范、仓库或至少两条独立工程来源核对。

## 开源项目应该看什么

| 项目 | 值得观察 | 阅读时的刹车 |
| --- | --- | --- |
| LangGraph | 状态图、持久化、恢复、人工介入 | Graph 不是所有任务的默认答案 |
| AutoGen | 分层、消息、事件驱动、多 Agent | 多角色不自动提高质量 |
| CrewAI | 角色、任务和协作表达 | 人设不等于权限边界 |
| PydanticAI | 类型、结构化结果、依赖 | 类型安全不等于事实正确 |
| OpenAI Agents SDK | 最小原语、handoff、guardrail、trace | SDK 默认值不等于生产设计 |
| Google ADK | 代码优先组合与评测 | 指标要贴合具体业务 |
| Semantic Kernel | 插件、流程和企业集成 | 抽象越多不一定越易维护 |
| Langfuse / Phoenix | 轨迹、评测、可观测性 | 有追踪页面不等于有质量门 |

## 核验习惯

1. 记录访问日期和版本；
2. 区分项目“宣称支持”与当前稳定接口；
3. 用第二来源核对重要结论；
4. 把不确定内容写成限制，不写成事实；
5. 优先学习设计问题，不抄短期 API 语法。

本页资料最后统一核对于 2026-09-25。来源会随项目演进而更新，正文涉及版本时单独标注。
