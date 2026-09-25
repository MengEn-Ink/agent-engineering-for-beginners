---
title: 前沿专题 · Agent 互操作与身份
description: 分清 MCP 与 A2A 的职责，并把身份、授权、委托和审计放回系统设计。
---

# Agent 互操作与身份：能连上，不代表可以替你行动

<ChapterFreshness path="/frontier/interoperability-identity" />

跨系统协作至少有两个不同问题：一个 Agent 怎样接入工具与上下文，两个独立 Agent 系统又怎样互相发现、分派任务和交付结果。MCP 与 A2A 分别处理这两个方向的互操作，但都不能凭协议名称自动解决业务授权。

## 先看稳定原则

1. **协议身份不等于业务身份。** 能建立连接，只证明某个客户端或服务通过了技术认证。
2. **授权绑定动作、对象和时间。** “允许查订单”不能被放大为“允许退款所有订单”。
3. **委托必须可追踪。** Agent A 把任务交给 Agent B 时，要保留用户意图、权限范围、截止时间和责任链。
4. **结果仍需验证。** 对方返回 `completed` 不是业务完成证据，应查询真实系统状态或制品。
5. **最小披露。** 能力发现只暴露完成协作所需的元数据，不顺带公开内部工具、提示词或用户数据。

## 当前前沿

MCP 2026-07-28 继续演进工具、资源、提示模板和授权相关能力；A2A v1.0.1 描述独立 Agent 应用的 Agent Card、消息、任务、制品和扩展。它们可以组合：一个客服 Agent 通过 A2A 委托研究 Agent 查资料，研究 Agent 再通过 MCP 读取获准的知识库。

组合之后仍有一条横向信任链：谁发现了谁，谁代表最终用户，哪一段授权可转委托，接收方能看到哪些数据，失败时谁撤销权限，审计记录如何串起来。NIST 的标准倡议正在把这些问题推向更明确的标准化讨论，但目前不应把倡议写成已经完成的认证制度。

## 版本与成熟度

- MCP：`2026-07-28`，状态 `evolving`
- A2A 文档发布：`v1.0.1`；线上协议兼容按 `major.minor` 表达，状态 `evolving`
- NIST Agent Standards Initiative：状态 `frontier`
- 最近核验：2026-09-25；下次复核：2026-10-25

## 架构图

<figure class="learning-diagram" role="img" aria-label="互操作分层：用户授权给 Host Agent；Host Agent 通过 MCP 连接受限工具与上下文，通过 A2A 向 Remote Agent 委托任务；身份、授权、委托记录和审计横跨两条连接。">
  <figcaption><b>MCP 与 A2A 是两条路，信任治理是共同的护栏</b><span>左边接能力，右边接协作；两边都不能跳过业务授权。</span></figcaption>
  <div class="visual-compare">
    <section><span>MCP · 能力侧</span><strong>Host Agent ↔ Tools / Resources</strong><p>发现并调用获准的工具与上下文。</p></section>
    <b aria-hidden="true">＋</b>
    <section><span>A2A · 协作侧</span><strong>Host Agent ↔ Remote Agent</strong><p>发现 Agent、交换消息、跟踪任务与制品。</p></section>
  </div>
  <p class="diagram-caution"><b>横向护栏：</b>身份认证 → 最小授权 → 可转委托范围 → 结果验证 → 全链路审计。</p>
</figure>

可以把它想成一次出差：MCP 像你在目的地获准使用会议室和打印机；A2A 像你把一个研究任务交给当地同事。门卡能开会议室，不代表同事可以替你签合同；同事接受任务，也不代表自动继承你所有权限。

## 失败边界

- 把 Agent Card 或工具描述当成安全证明，未验证发布者与内容完整性；
- 委托链丢失最终用户和原始目的，接收方只看到一句宽泛任务；
- 将短期访问令牌转发给下游，权限范围和有效期不可控；
- A2A 任务显示完成，但关键制品缺失或无法验证；
- 只做认证不做授权，任何合法连接都能调用高风险动作；
- 默认认为 MCP 与 A2A 的所有版本和扩展可以互通。

## 影响章节

- 第 4 章：MCP 的能力连接、版本协商与权限边界；
- 第 7 章：多 Agent handoff、共享状态与交付证据；
- 第 9 章：凭证隔离、最小权限、撤销和人工接管；
- 第 10 章：版本矩阵、灰度、审计与运营责任。

## 复核计划

每 30 天检查 MCP current 版本、A2A latest release 和 NIST initiative 状态。若出现破坏性版本、稳定身份扩展或可执行评测规范，先在 Radar 记录，再决定是否修改正文和模板。

## 来源

- [source:mcp-spec] [Model Context Protocol Specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)
- [source:a2a-spec] [Agent2Agent Protocol Specification](https://a2a-protocol.org/v1.0.1/specification/)
- [source:a2a-release] [A2A v1.0.1 release](https://github.com/a2aproject/A2A/releases/tag/v1.0.1)
- [source:nist-agentic-ai] [NIST · AI Agent Standards Initiative](https://www.nist.gov/artificial-intelligence/ai-agent-standards-initiative)

