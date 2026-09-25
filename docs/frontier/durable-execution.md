---
title: 前沿专题 · 长时运行与 Durable Execution
description: 让 Agent 在进程重启、上下文切换和版本变化后仍能安全继续任务。
---

# 长时运行：不是让一次对话永远不结束

一个持续数小时或数天的 Agent，会经历上下文耗尽、网络中断、工具超时、人工等待、模型升级和执行环境回收。Durable Execution 的目标不是保证进程永不退出，而是让任务在退出后能从明确、可验证的位置继续。

## 先看稳定原则

1. **任务状态外置。** 目标、阶段、输入、产物、批准和错误不能只存在模型对话里。
2. **检查点发生在可恢复边界。** 写入副作用后必须先记录回执，再进入下一步。
3. **写操作幂等。** 重放同一任务不会重复扣款、发送或创建资源。
4. **租约代替永久占有。** Worker 只在有限时间内持有任务，失联后可安全接管。
5. **代码和状态都有版本。** 恢复时要知道旧状态能否被新流程读取，不能盲目续跑。
6. **人工等待也是状态。** 待批准、拒绝、超时和取消都必须有明确转移。

## 当前前沿

长时 Agent 正从“固定模型 + 固定 harness”转向“稳定任务接口 + 可替换推理器 + 隔离执行环境”。Anthropic Managed Agents 提出的“脑与手解耦”是一个值得观察的工程方向：模型负责当前判断，harness 负责环境、状态、工具和生命周期。

这不意味着所有团队都要购买托管 Agent 服务。可迁移的设计原则是：任务合同和事件格式不绑定某个模型；模型切换不会丢失副作用回执；执行环境可以重建；恢复动作先验证外部世界，再决定重放、跳过或补偿。

## 版本与成熟度

- 稳定性：`frontier`
- 参考实现：供应商工程实践，非通用协议
- 最近核验：2026-09-25
- 下次复核：2026-10-25
- 采用边界：采纳 durable 原则，不承诺厂商特定 API 或迁移兼容性。

## 架构图

<figure class="learning-diagram" role="img" aria-label="可恢复任务循环：调度器取得任务租约，模型读取当前检查点并做一步决策，隔离执行器调用工具，证据与副作用回执先写入状态库，再提交新检查点；失败时从状态库验证后恢复。">
  <figcaption><b>进程可以短命，任务状态必须耐久</b><span>每次只做可验证的一步，先记账，再前进。</span></figcaption>
  <ol class="visual-flow-list" role="list">
    <li><span>01 · 租约</span><strong>领取任务</strong><small>带期限和 owner</small></li>
    <li><span>02 · 读取</span><strong>恢复检查点</strong><small>状态、版本、待办</small></li>
    <li><span>03 · 执行</span><strong>隔离做一步</strong><small>工具调用带幂等键</small></li>
    <li><span>04 · 记账</span><strong>保存证据</strong><small>回执先于状态推进</small></li>
    <li><span>05 · 转移</span><strong>继续或等待</strong><small>完成、重试、人工接管</small></li>
  </ol>
</figure>

通俗地说，长时 Agent 像接力赛，不是一个人憋气跑完全程。接力棒上必须写清已经跑到哪、上一棒做了什么、证据在哪里、下一棒能做什么；只留一句“差不多快完成了”无法安全接班。

## 失败边界

- **检查点早于副作用：** 状态写着“尚未发送”，外部消息其实已发出，恢复后重复发送；
- **检查点晚于副作用且无幂等键：** 回执保存失败，系统无法分辨重试还是查询；
- **多个 Worker 同时持有任务：** 没有租约或 fencing token，产生并发写入；
- **版本漂移：** 新代码误读旧状态字段，跳过批准或重复步骤；
- **无限恢复：** 相同错误持续重试，没有预算、退避和人工接管；
- **模型成为数据库：** 依赖长对话记住事实，压缩或换模型后状态消失。

## 影响章节

- 第 5 章：状态、会话与长期记忆的职责分离；
- 第 6 章：Graph 节点、检查点与恢复边；
- 第 9 章：幂等、超时、补偿和人工接管；
- 第 10 章：版本迁移、SLO、灰度和退役。

## 复核计划

按月复核 Managed Agents 与长时 harness 的公开变化，并与事件驱动工作流的成熟模式交叉核对。只有能跨模型或跨实现成立的原则进入正文，产品接口、配额和专有运行时保持在 Radar。

## 来源

- [source:anthropic-managed-agents] [Anthropic · Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents)
- [source:langgraph-repository] [LangGraph repository](https://github.com/langchain-ai/langgraph)
- [source:anthropic-agent-sdk] [Anthropic · Building agents with the Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)

