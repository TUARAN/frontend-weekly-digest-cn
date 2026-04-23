---
title: Rolldown 1.0 到底该不该上生产？
slug: rolldown-1-0-should-i-upgrade
date: 2026-04-18
category: 工具链决策
tldr: 中小项目可以先在非关键构建链路试水，大型 monorepo 建议再等一个小版本；核心是评估 SWC/esbuild 生态插件的迁移成本。
readMinutes: 8
pro: false
tags:
  - Rolldown
  - Vite
  - 构建工具
---

## 事实摘要

- Rolldown 1.0 RC 在 2026 年 1 月释出，背后是 Vite 团队主导的 Rust 打包器。
- Vite 8 beta 默认使用 Rolldown 驱动，Vite+ Alpha 也已配套发布。
- 相较 Rollup，冷启动平均快 2-5x，生产打包快 3-10x（官方基准，下游因插件而异）。

## 一方观点：现在就该上

- 性能收益来自底层 Rust 实现，不是优化技巧，迁移越晚越浪费 CI 时间。
- Vite 官方已把 Rolldown 定位为默认后端，生态会被"拉"过去，而不是分叉。

## 反方观点：再等一季度

- 自定义 Rollup 插件的兼容层仍有行为差异，部分 SSR 场景的 chunk 分裂策略和 Rollup 不一致。
- 大型 monorepo 最大的风险不是打包失败，而是"打包成功但产物变了"，线上只能靠灰度才能发现。

## 作者判断

**中小项目**：现在就换，收益明确，回滚成本低。
**大型 monorepo**：等 1.1 或 1.2，把现有 Rollup 自定义插件列成清单，提前联系维护者确认兼容性。
**真正关键的问题不是"快不快"，而是"产物语义稳不稳"**——这是任何打包器升级的真正风险点。

## 行动建议

1. 在非关键构建链路（文档站、内部工具）先跑 Rolldown，观察 2 周。
2. 把自定义 Rollup 插件清单化，打上 "已验证 / 需改造 / 未知" 三档标签。
3. 准备一个可以切回 Rollup 的 feature flag，不要把升级做成不可逆操作。

## 延伸阅读

- [Rolldown 1.0 RC 发布](/weekly/451/Rolldown%201.0%20RC%20发布/index)
- [Vite 8 Beta：由 Rolldown 驱动的 Vite](/weekly/443/Vite-8-Beta%EF%BC%9A%E7%94%B1-Rolldown-%E9%A9%B1%E5%8A%A8%E7%9A%84-Vite)
