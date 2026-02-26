原文：[Interop 2026: Continuing to improve the web for developers](https://web.dev/blog/interop-2026)
翻译：TUARAN
欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Interop 2026：从开发者视角看 Web 互操作

从 2021 年的「Compat 2021」、到 Interop 2022~2025，再到今年的 **Interop 2026**，浏览器厂商们已经连续多年「结成同盟」，围绕一组共同选定的 Web 特性做系统性对齐。  
这篇来自 web.dev 的文章，从**开发者视角**解释了：Interop 计划是如何运作的、2026 年选择了哪些重点领域、以及这些工作会怎样改变我们写 Web 应用的方式。

---

## Interop 是什么？为什么和普通开发者有关？

表面上看，Interop 是浏览器团队之间的协作项目：  

- 每年选出一批「重点特性」（Focus Areas）；  
- 在 Web Platform Tests 中补齐覆盖这些特性的测试用例；  
- 各家浏览器在同一时间段针对这些测试集中修 bug、补实现；  
- 最后在 wpt.fyi 上可以看到每个特性在不同浏览器的互操作评分。

但对开发者来说，更直接的含义是：

- **可以放心用的现代特性清单**：当一个能力被列入当年 Interop，意味着它的兼容性会在最近一两年明显提升；  
- **「历史债」集中偿还窗口**：像 Scroll Snap、WebRTC、老协议行为差异等，都会在对应年份被集中清理；  
- **更透明的演进节奏**：通过公开的路标和测试结果，你能更早判断某个特性能否用于生产环境。

---

## 2026 年的 20 个 Focus Areas 概览

文章先列出了 Interop 2026 的 20 个重点领域，大致可以分为几类：

- **现代 CSS 能力**：  
  - `anchor-positioning`、`advanced attr()`、容器样式查询（container style queries）、`contrast-color()`；  
  - Scroll-driven Animations、Scroll Snap、`shape()`、CSS Zoom 等；  
  - 自定义高亮、媒体伪类（media pseudo-classes）、`@container scroll-state` 等。
- **平台与 API 能力**：  
  - Navigation API、Fetch uploads & ranges、`getAllRecords()` for IndexedDB；  
  - JSPI for Wasm、WebTransport、WebRTC；  
  - Scoped Custom Element Registries。
- **真实网站兼容性（Web Compat）**：  
  - 围绕 user-select、滚动事件与动画事件顺序、ESM 模块加载等「会真实导致网站在某浏览器挂掉」的问题做专项治理。
- **探索性方向（Investigation Areas）**：  
  - 可访问性测试、JPEG XL、移动端测试、WebVTT 字幕等，为未来进一步标准化与互操作打基础。

文章强调：**这些领域之所以入选，是因为它们要么已经在生产中被广泛使用，要么被认为对未来 Web 能力至关重要**。

---

## 对日常开发最有影响的几个能力

作者重点挑了一些对一线开发者影响最大的能力展开介绍：

- **Anchor Positioning**：让工具提示、菜单、浮层等组件可以更自然地「锚定」到触发元素上，而不是手动算一堆绝对坐标；  
- **Advanced `attr()` 与容器样式查询**：把「从 HTML 属性/容器状态到 CSS」这条链路打通，减少 JS 在状态同步上的参与度；  
- **`contrast-color()` 与自定义高亮**：为设计系统、文本高亮、辅助功能提供更直接的原生支持；  
- **Scroll-driven Animations 与 Scroll Snap**：帮助我们用纯 CSS 实现更平滑的滚动驱动动效和卡片吸附体验；  
- **Navigation API 与 WebTransport/WebRTC**：降低构建复杂 SPA、实时协作和多媒体应用时，处理导航与实时连接的心智负担。

文章一再强调：**这些特性本身已经很强大，而 Interop 的目标是让它们在所有主要浏览器中表现一致，从而「真正可用」**。

---

## Web 平台正在变得更易预测

在没有 Interop 这类协作之前，Web 平台经常呈现出这样一种状态：

- 新能力由少数浏览器尝鲜，开发者很难判断是否值得投入；  
- 规范与实现之间有时间差，某些行为「写在 spec 里但没人实现」；  
- 老特性经过多年演进，导致不同实现之间充满历史兼容包袱。

Interop 的价值在于：

- 通过 WPT 这样的公共测试集，让规范、实现与开发者期望之间持续对齐；  
- 把「修长尾兼容性问题」从杂务变成一个有明确目标和时间盒的项目；  
- 让浏览器团队在**同一时间窗口**聚焦同一批能力，避免重复踩坑。

对前端开发者而言，最直接的收获是：  
**未来几年里，当你在文档里看到这些 Interop 2026 的特性时，可以更加自信地把它们用到真实项目中，而不是再写一堆 UA 分支或降级逻辑。**

