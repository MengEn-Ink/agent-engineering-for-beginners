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

本页固定在 v0.86.0，只追踪一个 edit-block 路径。所选条件是 Git 仓库内启用默认 auto-commit 与 auto-lint，同时保持 auto-test 关闭；其他模型适配、语音、网页 UI 和排行榜不进入主链。

## 原创建筑图

<ProjectCallChain project-id="project-aider" />

RepoMap 不是“读完全部仓库”，而是被预算约束的结构摘要。parser 只产出 tuples，写盘发生在 `apply_edits` 和 `InputOutput.write_text`。

## 唯一纵向调用链

从 `main` 进入 `Coder.run` / `Coder.run_one`，由 `Coder.send_message` 组装聊天文件和 RepoMap 上下文，再经 `Coder.send`、`Model.send_completion`、edit tuple 解析、dry run、脏文件预提交、写盘、自动提交和 lint。之后分别观察需确认的 shell、可选 auto-test 与错误 reflection 分支。

## 关键源码入口

<ProjectSourceLinks project-id="project-aider" />

## 一次请求的数据流

用户请求先与明确加入的文件和 RepoMap 组合，`Coder.send` 再通过 `Model.send_completion` 请求模型。`EditBlockCoder.get_edits` 这个 parser 只产出 tuples；`apply_edits_dry_run` 先验证，`prepare_to_edit` 为脏文件做预提交，写盘发生在 `apply_edits` 和 `InputOutput.write_text`。编辑后可先自动提交；commit message 会调用 weak/main model。lint 默认开启，而且只检查已编辑文件，lint 修复后可能产生第二次提交。test 默认关闭；shell 命令必须显式回答 yes，yes-always 也不会放行 shell；shell 或 test 之后没有第三次自动提交。失败证据会进入后续 reflection，而不是被“已有 commit”掩盖。

## 阅读练习

1. 找出仓库根目录与脏文件在进入 Coder 前如何处理。
2. 比较 RepoMap 与聊天文件的来源和预算。
3. 从 `get_edits` 追到 `write_text`，再按 track 标出首次提交、lint 后第二次提交、shell、test 与 reflection 的条件。

## 失败边界

当模型输出不能解析为 edit block，正确结果是保留原文件并反馈格式错误；不能用模糊字符串替换“尽量改一下”。dry run 或脏文件保护失败也必须在写盘前停止。当 lint、shell 或测试命令失败，提交存在也不能被报告为任务成功。

## 生产边界

Aider 不替团队决定需求是否正确，也不自动解决权限、秘密、依赖供应链或跨服务业务验证。真实仓库必须保护用户未提交改动，并限制命令和可编辑路径。

## 高频面试点

- [IQ-13-A：改代码前核对什么](/chapters/13-coding-agent#iq-13-a)
- [IQ-13-B：为什么先看测试失败](/chapters/13-coding-agent#iq-13-b)
- [IQ-13-C：怎样验收 Coding Agent](/chapters/13-coding-agent#iq-13-c)

## 升级复核

重点比较 CLI 入口、`run_one` 与 `send_message` 生命周期、RepoMap 选择、edit tuple parser、脏文件预提交、自动 lint/test 默认值、shell 确认和 Git 提交时序。模型列表或榜单变化只进入更新记录，不自动改写稳定工程结论。

## 来源与归因

调用链图为本书原创重绘，依据固定 commit 的 Aider 源码。页面不复用项目 Logo、网站截图或排行榜图；短源码概念按 Apache-2.0 边界归因。
