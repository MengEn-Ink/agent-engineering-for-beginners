---
title: Aider：从仓库上下文到可审查补丁
description: 沿一条真实调用链理解 repo map、模型请求、edit format、文件修改与 Git 证据。
---

# Aider：从仓库上下文到可审查补丁

## 30 秒结论

Aider 的价值不只是“在终端里聊天”，而是把仓库识别、上下文选择、编辑格式、文件变更与 Git 证据连成受约束的 Coding Agent 循环。生成补丁不等于任务完成；测试、构建和业务验收仍是独立证据。

## 为什么选

它的主链比大型平台短，适合第一次读 Coding Agent 源码。RepoMap、Coder、edit format 和 GitRepo 分工清楚，可以直接对应第 13 章的现场核对、TDD 与最终差异审查。

## 版本与边界

<ProjectMeta project-id="project-aider" />

本页固定在 v0.86.0，只追踪一个 edit-block 路径。其他模型适配、语音、网页 UI 和排行榜不进入主链。

## 原创建筑图

<ProjectCallChain project-id="project-aider" />

RepoMap 不是“读完全部仓库”，而是被预算约束的结构摘要；真正写盘发生在 edit 解析之后。

## 唯一纵向调用链

从 `main` 的仓库预检进入 `Coder.run`，再跟踪 repo map、模型响应、edit-block 解析、`apply_updates` 和 Git 记录。每一步都问：输入来自哪里，失败是否停止，证据保存在哪里。

## 关键源码入口

<ProjectSourceLinks project-id="project-aider" />

## 一次请求的数据流

用户请求先与明确加入的文件和 RepoMap 组合。Coder 生成消息并请求模型，edit format 把文本限制成结构化修改，应用层检查文件是否可编辑并落盘，随后 lint、命令或 Git diff 提供反馈。下一轮应消费这些环境事实，而不是只相信模型的完成声明。

## 阅读练习

1. 找出仓库根目录与脏文件在进入 Coder 前如何处理。
2. 比较 RepoMap 与聊天文件的来源和预算。
3. 从 `get_edits` 追到 `apply_updates`，记录三个可能停止修改的条件。

## 失败边界

当模型输出不能解析为 edit block，正确结果是保留原文件并反馈格式错误；不能用模糊字符串替换“尽量改一下”。当测试命令失败，提交存在也不能被报告为任务成功。

## 生产边界

Aider 不替团队决定需求是否正确，也不自动解决权限、秘密、依赖供应链或跨服务业务验证。真实仓库必须保护用户未提交改动，并限制命令和可编辑路径。

## 高频面试点

- [IQ-13-A：改代码前核对什么](/chapters/13-coding-agent#iq-13-a)
- [IQ-13-B：为什么先看测试失败](/chapters/13-coding-agent#iq-13-b)
- [IQ-13-C：怎样验收 Coding Agent](/chapters/13-coding-agent#iq-13-c)

## 升级复核

重点比较 CLI 入口、Coder 生命周期、RepoMap 选择、默认 edit format、文件安全检查和 Git 行为。模型列表或榜单变化只进入更新记录，不自动改写稳定工程结论。

## 来源与归因

调用链图为本书原创重绘，依据固定 commit 的 Aider 源码。页面不复用项目 Logo、网站截图或排行榜图；短源码概念按 Apache-2.0 边界归因。
