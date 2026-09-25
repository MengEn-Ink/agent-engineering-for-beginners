---
title: 前沿专题 · Context Engineering
description: 在有限上下文里选择、压缩、隔离和验证真正有用的信息。
---

# Context Engineering：不是把所有东西塞进窗口

上下文是 Agent 此刻能够看到的工作台。它包含系统规则、用户目标、工具说明、检索资料、任务状态和中间产物。工作台越满不一定越聪明；关键是让当前决策看到最少而充分、来源清楚、仍然有效的信息。

## 先看稳定原则

1. **先定义决策，再取上下文。** 每一步只加载完成当前判断需要的材料。
2. **事实、指令和数据分层。** 检索网页与工具返回默认是不可信数据，不能获得系统指令的优先级。
3. **原文可追溯，摘要可重建。** 压缩结果要保留来源、时间和能回到原始证据的标识。
4. **状态不等于聊天记录。** 任务阶段、业务对象、长期偏好和审计日志分别存放。
5. **用评测决定预算。** 关注结果正确率、遗漏、延迟和成本，不迷信固定 token 比例。

## 当前前沿

Context Engineering 把 Prompt 看成上下文流水线的一个环节。常见做法包括按需检索工具说明、对旧轨迹做结构化压缩、为稳定前缀使用缓存、把大产物留在外部存储并只传引用，以及让不同子任务拥有隔离的上下文视图。

真正需要实验的是选择策略：哪些内容必须常驻，哪些可以按需取回，摘要在什么条件下失效，冲突事实由谁裁决。文章里的经验方法可以借鉴，但不存在跨模型、跨任务通用的“窗口使用到 70% 就压缩”定律。

## 版本与成熟度

- 稳定性：`evolving`
- 最近核验：2026-09-25
- 下次复核：2026-10-25
- 版本说明：工程方法随模型上下文能力、缓存和检索接口变化，不承诺固定阈值。

## 架构图

<figure class="learning-diagram" role="img" aria-label="上下文流水线：先收集候选信息，再按可信度和当前决策筛选，压缩并组装上下文，执行后用结果更新状态与证据。">
  <figcaption><b>上下文不是仓库，而是一条受控流水线</b><span>每一步都要知道信息从哪来、为何进入、何时失效。</span></figcaption>
  <ol class="visual-flow-list" role="list">
    <li><span>01 · 收集</span><strong>候选信息</strong><small>规则、状态、检索、工具</small></li>
    <li><span>02 · 分级</span><strong>可信与时效</strong><small>来源、权限、更新时间</small></li>
    <li><span>03 · 选择</span><strong>当前决策所需</strong><small>删去无关和重复内容</small></li>
    <li><span>04 · 组装</span><strong>可追溯上下文</strong><small>保留引用与冲突提示</small></li>
    <li><span>05 · 验证</span><strong>结果回写</strong><small>更新状态，不污染原证据</small></li>
  </ol>
</figure>

举个通俗例子：修一处代码时，不必把整个仓库和全部聊天记录贴给模型。先给当前任务、目标文件附近规则、相关接口和失败测试；需要跨模块信息时再检索。像做菜一样，台面只放这一步要用的食材，仓库仍然保留完整库存。

## 失败边界

- **上下文污染：** 网页或工具返回夹带“忽略原规则”的文字；应按外部数据处理并限制其控制力。
- **摘要失真：** 多轮压缩丢掉否定词、约束或未决问题；应保留原始引用并定期从源重建。
- **陈旧缓存：** 权限、价格或状态已变化，模型仍使用旧快照；应为动态事实设置版本或有效期。
- **检索过载：** 相似但无关的材料挤掉关键规则；应按当前问题做召回与重排，并测遗漏率。
- **秘密外泄：** 为了“给足上下文”把凭证、个人数据和内部日志送入不该看到的模型或 trace；应在采集前最小化与脱敏。

## 影响章节

- 第 3 章：ReAct 每轮观察怎样进入下一步；
- 第 5 章：任务状态、会话上下文和长期记忆怎样分层；
- 第 8 章：怎样评测检索、压缩与污染控制是否真的改善结果。

## 复核计划

2026-10-25 前复核官方文章和主流模型的上下文、缓存与工具检索接口。只有在多任务评测中稳定成立的方法才回写常青章节；厂商特定阈值继续留在专题或 Radar。

## 来源

- [source:anthropic-context-engineering] [Anthropic · Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [source:anthropic-agent-sdk] [Anthropic · Building agents with the Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)

