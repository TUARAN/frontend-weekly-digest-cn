# ViteLand 新动态：2026 年 1 月回顾

欢迎来到新一期《ViteLand 新动态》！

我们会定期回顾 Vite+、Vite、Vitest、Rolldown、Oxc 的项目更新，以及社区里正在发生的事。

![](https://voidzero.dev/images/whats-new-jan-2026/voidzero-bento-grid.jpg) VoidZero、Vite、Vitest、Rolldown 与 Oxc 全新统一视觉体系的设计元素

## 设计统一（Unified by Design）

VoidZero 的使命很明确：**让 Web 开发者比以往任何时候都更高效。** 为了实现这一目标，我们把 Vite、Vitest、Rolldown 和 Oxc 聚到同一个屋檐下，共同推进一条统一的工具链。

但在此之前，每个项目都保持着自己独立的视觉风格。

这个月，这件事发生了变化：我们在 [voidzero.dev](https://voidzero.dev/)、[vite.dev](https://vite.dev/)、[vitest.dev](https://vitest.dev/)、[rolldown.rs](https://rolldown.rs/) 与 [oxc.rs](https://oxc.rs/) 上完成了一次全面的视觉重构。

这次重构包括：
- **新网站**：改进落地页，并在所有项目之间建立统一的视觉语言
- **更新 Logo**：在保留各自辨识度的同时，共享一致的“设计基因”
- **更新 Vite 启动模板**：从一开始就内置新的品牌风格

这些变化不只是“外观升级”。当你使用 [Vite 8](https://voidzero.dev/posts/announcing-vite-8-beta) 时，底层其实已经在使用 Rolldown 和 Oxc；当你运行 Oxlint 或 Oxfmt 时，也会受益于 Rolldown 使用的同一套解析器。我们的工具深度集成，而现在它们在视觉上也更像一个整体了。

新的设计为 Vite+ 铺平了道路：当我们把所有能力收敛到一致、连贯的开发体验时，这套统一的视觉基础会非常重要。后续会有更多消息。

## 项目更新（Project Updates）

### Vite
- 自 2020 年 4 月发布以来，Vite 的 npm 总下载量已突破 30 亿。
- Vite 的 React Server Components 插件[做了一些调整](https://github.com/vitejs/vite-plugin-react/pull/1037)，以便框架更容易集成自定义环境配置。它不仅为 Nitro 与 Cloudflare 的插件提供支持，也支撑了 TanStack Start 新增的 RSC 集成。

（原文中此处有推文内容，抓取时未完整加载。）