# Interop 2025：趋同的一年

[原文链接：Interop 2025: A year of convergence](https://webkit.org/blog/17808/interop-2025-review/)

2026 年 2 月 6 日

作者：Nicole Sullivan

Interop 2025 已经落幕，而结果足以说明一切。Interop 项目进入第四年，由 Apple、Bocoup、Google、Igalia、Microsoft 和 Mozilla 携手合作：找出 Web 平台上对开发者来说最重要的互操作性问题，然后一起把它们真正解决。

今年的目标是迄今为止最具野心的一次：团队选定了 19 个重点领域与 5 个调研领域，覆盖 CSS、JavaScript、Web API 以及性能。2025 年初，所有浏览器都能通过的测试只有 29%；到年底，Interop 得分达到 97% 的通过率——四个“实验通道”浏览器（Chrome Canary、Edge Dev、Firefox Nightly 与 Safari Technology Preview）更是都达到了 99%。

![](https://webkit.org/wp-content/uploads/Interop-2025-experimental-scores.png)

每一年，Interop 都会通过“提案 + 研究开发者需求 + 优先级讨论”的协作流程来选择重点领域。对于 Interop 2025，我们团队主张加入一些我们明知会让 WebKit 付出显著工程投入的领域——因为我们知道，它们会对你这样的 Web 开发者产生实质影响。结果证明，这份投入得到了回报：Safari 今年的提升幅度最大，从 43 一跃升到 99。

一如既往，今年的重点领域来自开发者反馈（包括 State of CSS 调研结果）。我们为覆盖的广度感到自豪：19 个重点几乎触及平台的每个角落。

在 CSS 与 UI 方向，项目推进了 [Anchor Positioning（锚点定位）](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)、[View Transitions（视图切换）](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)、[`@scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope)、[`backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)、[`text-decoration`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)、[Writing modes（书写模式）](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_writing_modes)、[Layout（布局）](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)（Flexbox 与 Grid，延续自往年），以及 [`<details>` 元素](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details)。

在 API 与平台能力方面，我们推进了 [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)、[Storage Access API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API)、[`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)、[Modules（模块）](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)、[`scrollend` 事件](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event)、[WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) 与 [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly)。

在健康度与兼容性方面，项目重点投入在 [Core Web Vitals](https://web.dev/articles/vitals)、[Pointer 与 Mouse 事件](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)、[移除 Mutation 事件](https://developer.mozilla.org/en-US/docs/Web/API/MutationEvent) 以及整体 [Web 兼容性](https://wpt.fyi/interop-2025)。此外，5 个调研领域——无障碍测试、Gamepad API 测试、移动端测试、隐私测试和 WebVTT——也为未来的 Interop 周期打下基础。

我们想重点强调今年尤其有意义的三个方向：

- [锚点定位（Anchor positioning）](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning) 允许你仅用 CSS 就把 popover、tooltip、菜单相对任意元素定位，不再需要 JavaScript 定位库。这是过去几年呼声最高的 CSS 特性之一，现在已经能在所有浏览器上互操作地工作。

- [同文档 View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) 让浏览器原生支持 UI 状态之间的平滑动画切换，并新增 `view-transition-class` CSS 属性用于更灵活的过渡样式。我们在 2024 年秋季为 [Safari 18.0](https://webkit.org/blog/15865/webkit-features-in-safari-18-0/) 和 [Safari 18.2](https://webkit.org/blog/16301/webkit-features-in-safari-18-2/) 交付了支持。开发者对 View Transitions 非常兴奋！而今年对跨浏览器互操作性的额外投入，意味着它已经更适合你直接用于生产。

- [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API) 是 `history.pushState()` 的现代替代方案，为单页应用带来更完善的导航处理能力（拦截、遍历、entries 等）。我们在 [Safari 26.2](https://webkit.org/blog/17640/webkit-features-for-safari-26-2/) 中交付了支持，也很高兴看到它从一开始就以互操作为目标落地。

![](https://webkit.org/wp-content/uploads/Interop-2025-progress-graph.png)

上图讲述了这一年的故事：各家浏览器引擎都投入了大量精力，而曲线最终在顶部收敛。正是这种“趋同”，让 Interop 项目如此珍贵——共同的进步意味着你可以写一次代码，并相信它在各处都能工作。

我们也想感谢行业里所有促成这一切的同事。互操作性是 Web 的基石之一，我们也会继续推进这项合作。你可以在 [Interop 2025 Dashboard](https://wpt.fyi/interop-2025) 上查看完整结果，包括每个重点领域的单项得分。

（原文末尾包含站点的“上一篇 / 版本说明”等导航链接，已在抓取时一并带入；此处保留原始链接供参考。）

[Safari Technology Preview 236 的版本说明（原文站点导航）](https://webkit.org/blog/17791/release-notes-for-safari-technology-preview-236/)