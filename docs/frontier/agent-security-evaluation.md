---
title: 前沿专题 · Agent 安全评测
description: 用任务后果、重复攻击、权限边界和可观测证据评估 Agent 劫持风险。
---

# Agent 安全评测：别只测它会不会说“不”

<ChapterFreshness item-id="frontier-agent-security-evaluation" />

Agent 安全不是问模型十次“请泄露密码”看它拒绝几次。真正的攻击会藏在网页、邮件、工具返回和共享文件里，目标是改变 Agent 的计划、窃取数据或诱导高影响工具调用。评测必须观察最终任务后果，而不只是某一条回复。

## 先看稳定原则

1. **先画资产与信任边界。** 明确要保护的数据、动作、凭证和最终用户授权。
2. **按任务测攻击。** 同一条注入在只读搜索和付款流程中的后果完全不同。
3. **重复且自适应。** 攻击成功率不是单次布尔值，要覆盖变体、多轮和攻击者调整。
4. **结果与轨迹一起看。** 既检查是否完成合法任务，也检查是否读取越权数据、调用危险工具或泄露信息。
5. **用硬边界降低损失。** 最小权限、隔离、批准和速率限制不能由“模型拒绝”代替。
6. **评测数据本身要脱敏。** trace 和红队样本不能成为新的凭证或个人数据泄露面。

## 当前前沿

NIST 对 Agent hijacking 的研究强调持续扩展评测、使用自适应攻击并关注任务相关后果。OWASP Agentic Top 10 提供了威胁分类入口，适合检查是否漏掉身份冒用、工具滥用、数据外泄和失控委托等风险，但 Top 10 不是安全认证。

OpenTelemetry 的 GenAI / Agent 语义约定有望让跨框架 trace 更一致，当前仍在演进。工程上可以先固定自己的概念模型：任务 ID、模型调用、工具调用、授权决定、外部副作用、成本、延迟和最终证据；把具体字段名隔离在映射层，避免草案变化破坏历史数据。

## 版本与成熟度

- NIST Agent hijacking 评测：`evolving`
- OWASP Agentic Top 10：`2026` 风险框架，状态 `evolving`
- OpenTelemetry Agent observability：`draft/frontier`
- 最近核验：2026-09-25；下次复核：2026-10-25

## 架构图

<figure class="learning-diagram" role="img" aria-label="Agent 安全评测闭环：合法任务与攻击样本一起进入受限 Agent；Agent 访问工具时由权限门禁约束；观察外部副作用和最终证据；评测器同时计算任务成功、攻击成功、越权、成本和恢复指标，再生成新攻击样本。">
  <figcaption><b>同时测“事有没有办成”和“攻击有没有得逞”</b><span>拒绝一段恶意文字，不等于整个任务安全。</span></figcaption>
  <ol class="visual-flow-list" role="list">
    <li><span>01 · 样本</span><strong>任务＋攻击</strong><small>直接、间接、多轮变体</small></li>
    <li><span>02 · 边界</span><strong>受限 Agent</strong><small>最小上下文与权限</small></li>
    <li><span>03 · 行动</span><strong>工具与委托</strong><small>批准、隔离、速率限制</small></li>
    <li><span>04 · 观察</span><strong>副作用证据</strong><small>轨迹、业务状态、外泄</small></li>
    <li><span>05 · 迭代</span><strong>指标与红队</strong><small>修边界，再生成变体</small></li>
  </ol>
</figure>

一套最小指标可以包含：合法任务成功率、攻击成功率、越权工具调用率、敏感数据暴露率、人工接管率、平均损失、恢复时间和每次安全任务成本。指标要按动作风险分层；搜索失败和付款越权不能简单平均成一个分数。

## 失败边界

- 只测公开的固定注入句式，模型记住样本后“安全率”虚高；
- 只看最终文字，没有观察工具、网络、文件和真实业务副作用；
- 安全拦截很强，但合法任务全部失败，系统实际上不可用；
- 将模型拒绝当最后防线，没有最小权限、批准和凭证隔离；
- trace 记录完整 Prompt、令牌或个人信息，评测系统反而扩大泄露面；
- 把 OWASP 列表逐项打勾后宣称“已合规”或“绝对安全”。

## 影响章节

- 第 8 章：结果、轨迹、业务证据与运行指标的联合评测；
- 第 9 章：提示注入、工具投毒、权限、沙箱和恢复；
- 第 10 章：生产门禁、SLO、灰度、回滚和运营审计。

## 复核计划

每月检查 NIST agentic AI 页面、hijacking 评测更新、OWASP Agentic Top 10 与 OpenTelemetry 语义约定。新威胁先进入红队样本和 Radar；只有复现稳定且影响明确时才修改常青安全清单。

## 来源

- [source:nist-agent-hijacking] [NIST · Strengthening AI Agent Hijacking Evaluations](https://www.nist.gov/news-events/news/2025/01/technical-blog-strengthening-ai-agent-hijacking-evaluations)
- [source:nist-agentic-ai] [NIST · AI Agent Standards Initiative](https://www.nist.gov/artificial-intelligence/ai-agent-standards-initiative)
- [source:owasp-agentic-top-10] [OWASP Top 10 for Agentic Applications](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/)
- [source:otel-agent-observability] [OpenTelemetry · AI Agent Observability](https://opentelemetry.io/blog/2025/ai-agent-observability/)

