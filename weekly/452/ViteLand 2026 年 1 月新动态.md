# ViteLand 2026 年 1 月新动态

[原文链接：What’s New in ViteLand — January 2026 Recap](https://voidzero.dev/posts/whats-new-jan-2026)

本文回顾 Vite+、Vite、Vitest、Rolldown、Oxc 的项目更新，以及社区动态。

![](https://voidzero.dev/images/whats-new-jan-2026/voidzero-bento-grid.jpg)

## 设计统一（Unified by Design）

VoidZero 的使命是：**让 Web 开发者比以往任何时候都更高效。**

为此，他们把 Vite、Vitest、Rolldown 和 Oxc 归到同一条统一工具链的愿景下。但在过去，每个项目都有各自独立的视觉风格。

2026 年 1 月，这一点发生了改变：

- [voidzero.dev](https://voidzero.dev/)
- [vite.dev](https://vite.dev/)
- [vitest.dev](https://vitest.dev/)
- [rolldown.rs](https://rolldown.rs/)
- [oxc.rs](https://oxc.rs/)

这些站点都完成了全面的视觉重构。

这次重构包括：

- **新网站**：改进落地页，并在各项目之间建立统一的视觉语言
- **更新 Logo**：保留辨识度的同时共享一致的“设计基因”
- **更新 Vite 启动模板**：从项目初始化就内置新品牌风格

这些变化不只是“外观升级”。作者强调，工具链在能力上也在更深度地集成：

- 使用 [Vite 8](https://voidzero.dev/posts/announcing-vite-8-beta) 时，底层已经在使用 Rolldown 与 Oxc
- 运行 Oxlint 或 Oxfmt 时，也会受益于 Rolldown 使用的同一套解析器

统一的视觉体系也被视为后续 Vite+ 产品化体验的基础。

## 项目更新（Project Updates）

### Vite

- 自 2020 年 4 月发布以来，Vite 的 npm 总下载量已突破 30 亿。
- Vite 的 React Server Components 插件做了调整，以便框架更容易集成自定义环境配置：不仅支持 Nitro 与 Cloudflare 的插件，也支撑了 TanStack Start 新增的 RSC 集成。

（注：原文此处包含推文内容，抓取时未完整加载，因此本译文到此为止。）
