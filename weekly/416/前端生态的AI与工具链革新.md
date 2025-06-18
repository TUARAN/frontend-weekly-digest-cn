# 前端生态的AI与工具链革新

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/36c8563ef19f4a269bf5e56b95ab0a35~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5o6Y6YeR5a6J5Lic5bC8:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTUyMTM3OTgyMzM0MDc5MiJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1750843228&x-orig-sign=vohh80KWKXOiZHLjqmAvgmm8yW0%3D)

本周的前端世界，像是刚经历完一场 Google I/O 和 AI 双料风暴的余震期：

**工具链加速进化（尤雨溪亲自宣布 Rolldown）、浏览器原生能力再升级（Chrome 137 带来 if() 函数），而 Gemini 与 Claude 等 AI 模型正悄悄入侵前端开发流程。从渐进式 JSON 到 Remix 的再觉醒，从 React 服务端组件组合到 GSAP 动画再突破，这是一周值得多读几遍的技术资讯集锦。**

---

## 🧠 博主点评

如果说去年是"AI 蹭热度"的一年，那 2025 的节奏早已悄悄变成了"默认叠加 AI"的原生形态。Claude、Gemini、RSC 等关键词的出现频率越来越高，甚至连 JSON 都要搞渐进式了，说明整个前端生态已经不满足于静态资源管理，而是在主动拥抱状态流动与智能交互。

---

## 🗂️ 本期精选目录

### Web 开发

🔹[最简单的方式部署可更新的作品集网站](https://frontendmasters.com/blog/the-simplest-way-to-deploy/)：手把手带你用最少步骤上线一个支持内容更新的个人作品集页面。

🔹[2025 年如何可靠地检测第三方 Cookie 被屏蔽](https://www.smashingmagazine.com/2025/05/reliably-detecting-third-party-cookie-blocking-2025/)：新浏览器策略频出，本文深入解析如何判断第三方 Cookie 是否被拦截。

🔹[Gemini 2.5 与前端 AI 推理的未来](https://blog.logrocket.com/gemini-2-5-future-of-ai-reasoning/)：探索 Gemini 模型如何重塑前端开发中的 AI 推理能力。

🔹[PWA 与原生应用的选型指南](https://thenewstack.io/when-to-use-progressive-web-apps-and-when-to-go-native/)：什么情况下选择渐进式 Web 应用，什么时候又该回归原生开发？

🔹[使用 Claude 构建 Web 应用的实践指南](https://blog.logrocket.com/claude-web-app/)：Claude 如何作为你的 AI 开发伙伴，帮助快速搭建 Web 应用？

🔹[渐进式 JSON 的理念与实践](https://overreacted.io/progressive-json/)：Dan Abramov 提出一种新的 JSON 处理思路，提升大数据加载体验。

---

### 工具

🔹[尤雨溪发布 Rolldown-Vite：新一代构建工具](https://voidzero.dev/posts/announcing-rolldown-vite)：一个更快、更现代的 Vite 打包核心，用 Rust 重写 Rollup。

🔹[深入 OKLCH 色彩生态与配套工具](https://evilmartians.com/chronicles/exploring-the-oklch-ecosystem-and-its-tools)：了解 OKLCH 如何带来更精细的色彩控制体验。

🔹[Chrome 137 更新：支持 CSS if()、Promise 集成 WebAssembly 等](https://developer.chrome.com/blog/new-in-chrome-137)：前端 API 再进化，Chrome 持续推进原生开发力。

🔹[ESLint v9 回顾与架构演进](https://eslint.org/blog/2025/05/eslint-v9.0.0-retrospective/)：拆解 ESLint 的新版本升级重点，了解其未来路线图。

---

### CSS

🔹[打造聚光灯式的 CSS 动效](https://frontendmasters.com/blog/css-spotlight-effect/)：实现页面元素高亮聚焦的原生 CSS 动画技巧。

🔹[更强大的 CSS shape() 使用技巧：圆弧与路径（二）](https://css-tricks.com/better-css-shapes-using-shape-part-2-more-on-arcs/)：继续探索如何用 shape() 创建复杂图形。

🔹[我们目前对 CSS 阅读顺序的理解](https://css-tricks.com/what-we-know-so-far-about-css-reading-order/)：深入研究屏幕阅读器如何解析 CSS 顺序。

🔹[CSS 中 cursor 属性的使用全解](https://blog.logrocket.com/dev/cursor-css/)：你可以用 cursor 做的事远不止"pointer"。

🔹[CSS 实现我的世界：一个像素世界的重建](https://benjaminaster.com/css-minecraft/)：用纯 CSS 模拟 Minecraft 世界，既硬核又好玩。

---

### JavaScript & React

🔹[Remix.js 的隐藏能力：重构 Markdown 博客的利器](https://vitalii4reva.medium.com/hidden-capabilities-of-remix-js-that-will-transform-your-approach-to-markdown-blogs-in-2025-26f960242856)：深入 Remix 特性，重塑内容管理模式。

🔹[Remix 觉醒！](https://remix.run/blog/wake-up-remix)：Remix 新版本登场，重新定位前端开发框架。

🔹[打造更快更流畅的个性化分页体验](https://www.infoq.com/articles/personalized-content-pagination-prefetching/)：结合预加载与缓存策略，构建响应式内容分页。

🔹[TanStack Router 的简约之美](https://tkdodo.eu/blog/the-beauty-of-tan-stack-router)：更现代的路由库，赋能复杂状态管理。

🔹[OpenJS Foundation 成为 40+ JavaScript 项目的 CNA](https://socket.dev/blog/openjs-foundation-is-now-a-cna)：开源安全生态升级，CVE 编号将直接覆盖主流 JS 项目。

---

### 理论知识

🔹[如何高效地排序 JavaScript 中的日期](https://www.freecodecamp.org/news/how-to-sort-dates-efficiently-in-javascript/)：排序场景再常见不过，但你真的用对了方法吗？

🔹[迭代器助手有多快？](https://waspdev.com/articles/2025-05-25/iterator-helpers-can-be-faster)：新提案 iterator helpers 在 V8 中表现优异，值得关注。

🔹[为什么 2025/05/28 和 2025–05–28 在 JavaScript 中不是同一天？](https://brandondong.github.io/blog/javascript_dates/)：一场日期格式引发的 Bug，大写的教训。

🔹[Array 比 Uint8Array 还省内存？](https://evanhahn.com/v8-array-vs-uint8array-memory-usage/)：浏览器 V8 的内存优化行为值得开发者重新审视数据结构选择。

---

### React 实战

🔹[用 Hugging Face Diffusers 打造 AI 图片生成器](https://blog.logrocket.com/build-react-ai-image-generator-hugging-face-diffusers/)：React + AI，轻松构建生成式 UI 应用。

🔹[使用 Vite 快速构建 React + TypeScript 项目](https://blog.logrocket.com/how-to-build-react-typescript-app-vite/)：现代化工具链最佳实践。

🔹[React 的 Error Boundary 不只是组件的 try/catch](https://www.epicreact.dev/why-react-error-boundaries-arent-just-try-catch-for-components-i6e2l)：深入理解组件错误处理机制。

🔹[React 的"超能力"：客户端与服务端组件的组合方式](https://www.epicreact.dev/composing-server-and-client-components-the-modern-reacts-superpower-08yn9)：现代 React 架构的关键突破点。

🔹[RSC 为什么要和 Bundler 深度集成？](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)：Dan Abramov 解释 RSC 与构建工具的耦合原因。

🔹[Next.js 的渲染策略与核心 Web 指标的关系](https://www.thisdot.co/blog/next-js-rendering-strategies-and-how-they-affect-core-web-vitals)：了解 ISR、SSR、CSR 等方式对性能的影响。

---

### 动效设计

🔹[用 Three.js 在 Webflow 构建交互式 3D 卡片](https://tympanus.net/codrops/2025/05/31/building-interactive-3d-cards-in-webflow-with-three-js/)：无代码平台 + 三维引擎，打造沉浸式前端。

🔹[35mm 背后的技术故事与建站过程拆解](https://tympanus.net/codrops/2025/05/30/deconstructing-the-35mm-website-a-look-at-the-process-and-technical-details/)：从灵感到编码，一个创意站点的全流程。

🔹[GSAP + clip-path 打造产品网格动画](https://tympanus.net/codrops/2025/05/27/animated-product-grid-preview-with-gsap-clip-path/)：超丝滑的 UI 动画实现技巧。

---

## 小结

这一期让人切实感受到一个转折信号：前端工程不再是「写静态代码，构建静态页面」，而是在拥抱"智能交互、渐进加载、实时响应"的全新范式。React 的 RSC、Claude 的集成实践、Vite 构建工具的重构背后，映射的正是前端边界的全面扩展。别等趋势成为标准时才开始上手，现在就是你先一步学习的最佳窗口。

***

OK，以上就是本次分享，欢迎加我威 atar24，备注「前端周刊」，我会邀请你进交流群👇

🚀 每周分享技术干货  
🎁 不定期抽奖福利  
💬 有问必答，群友互助 