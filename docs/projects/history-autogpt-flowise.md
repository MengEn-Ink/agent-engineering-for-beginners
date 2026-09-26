---
title: AutoGPT 与 Flowise：历史反例不是嘲笑旧项目
description: 从早期自主循环和低代码画布中提取仍有效的设计经验，并说明维护与许可证边界。
---

# AutoGPT 与 Flowise：历史反例不是嘲笑旧项目

## 30 秒结论

AutoGPT 和 Flowise 都推动了 Agent 工程普及，但“曾经重要”不等于“今天仍是默认生产基线”。历史拆解关注哪些假设失效、哪些能力迁移，以及怎样识别维护和许可证风险。

## 为什么选

AutoGPT 代表早期开放式自主循环，Flowise 代表可视化低代码工作流。它们能帮助读者理解为什么今天更强调窄任务、显式状态、可验证工具和可维护运行时。

## 版本与边界

<ProjectMeta project-id="project-history-autogpt-flowise" />

AutoGPT 上游仍活跃，但本书把经典自主循环放在 historical 层；这不是“无人维护”。Flowise 已归档并于 2026-08-31 EOL，属于仓库生命周期事实。

## 原创建筑图

<ProjectCallChain project-id="project-history-autogpt-flowise" />

## 唯一纵向调用链

左轨只看 AutoGPT classic 的入口与 agent，右轨只看 Flowise prediction controller 与 service。目标是比较“开放式循环”和“画布配置执行”分别把复杂度藏在哪里。

## 关键源码入口

<ProjectSourceLinks project-id="project-history-autogpt-flowise" />

## 一次请求的数据流

AutoGPT classic 从目标进入 agent 循环，依赖模型持续规划；Flowise 从 prediction 请求进入已配置流程。两者都说明：入口体验不能替代停止条件、权限、状态、环境证据和维护责任。

## 阅读练习

1. 找出 AutoGPT classic 循环依赖模型继续推进的边界。
2. 找出 Flowise controller 与 service 的职责分离。
3. 把两个项目分别改写成一个更窄、更可测的任务合同。

## 失败边界

AutoGPT 的风险来自开放目标、长循环和工具权限；Flowise 的风险还包括归档后的依赖、安全补丁与运行维护。仓库可见不等于仍有官方维护承诺。

## 生产边界

AutoGPT 上游仍活跃，但 `autogpt_platform/**` 使用 PolyForm Shield；classic 等范围才是 MIT。Flowise enterprise 目录和显式文件使用商业许可，其余才按 Apache-2.0。两者都不作为本书默认安装步骤。

## 高频面试点

- [IQ-02-B：什么时候应该升级为 Agent](/chapters/02-workflow-agent#iq-02-b)
- [IQ-07-C：如何识别昂贵的角色扮演](/chapters/07-multi-agent#iq-07-c)
- [IQ-10-A：从 Demo 到生产需要什么](/chapters/10-production#iq-10-a)

## 升级复核

AutoGPT 检查 classic 与 platform 的边界和根许可证；Flowise 检查归档状态、Discussion #6727、根许可证与生态迁移。维护状态与本书教学层级分别记录。

## 来源与归因

比较图为本书原创重绘。事实来自固定 commit、根许可证和 Flowise 维护者公告，不复用项目截图、Logo 或第三方素材。
