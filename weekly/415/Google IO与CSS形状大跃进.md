# Google IO与CSS形状大跃进

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/bade4e5c54284409b511973fc2f0d05e~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5o6Y6YeR5a6J5Lic5bC8:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTUyMTM3OTgyMzM0MDc5MiJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1750843072&x-orig-sign=2MZ8Vqg1twUN%2FO1Xbksn98eIiH8%3D)

💬 **推荐语**

这周的内容不光有 Google I/O 2025 带来的重磅更新，还有 CSS 世界的"形状大跃进"、JavaScript 调试生态的深水区探索，以及 React 和 Angular 的进阶用法解析。  
尤其 CSS `shape()` 正式成为主角，让我们开始以"弯曲的方式"思考布局；而前端工具链也在默默革新，例如 `Unlighthouse` 正挑战 Lighthouse 的霸主地位。

---

## 🗂️ 本期精选目录

### Web 开发

🔹[Google I/O 2025 十项重要更新：从 CSS 轮播、AI DevTools 到多模态 Prompt API](https://developer.chrome.com/blog/web-at-io25)：一次性打包浏览器、AI 与开发者工具的年度升级。

🔹[TypeScript 原生预览功能发布](https://devblogs.microsoft.com/typescript/announcing-typescript-native-previews/)：无需安装 TS 插件即可尝鲜原生语法支持。

🔹[Dialog 是弹窗，Popover 是其他一切](https://mayank.co/notes/popover-vs-dialog/)：一篇解释两者定位的好文，帮你理清 Web 组件边界。

🔹[Unlighthouse：像 Lighthouse，但它能扫描整个网站](https://unlighthouse.dev/)：全站级性能检测工具，适合大型项目站点体检。

🔹[我对 Google 的无障碍请求](https://adrianroselli.com/2025/05/my-request-to-google-on-accessibility.html)：老牌开发者 Adrian Roselli 给 Google 的公开建议。

🔹[一场没有 AI 的 Google I/O？](https://bytes.dev/archives/394)：从另一个视角观察开发大会的"缺席者"。

---

### CSS

🔹[Behind the Curtain：从设计到代码，复刻 Aurel 剧院特效](https://tympanus.net/codrops/2025/05/20/behind-the-curtain-building-aurels-grand-theater-from-design-to-code/)：一场艺术与 CSS 的融合实践。

🔹[动画史诗第三章：SMIL 复活记](https://www.smashingmagazine.com/2025/05/smashing-animations-part-3-smil-not-dead/)：别急着宣布死亡，SMIL 依然能发光发热。

🔹[更灵活的 CSS 形状 Part 1：用 shape() 画线和圆弧](https://css-tricks.com/better-css-shapes-using-shape-part-1-lines-and-arcs/)：开箱即用的几何布局新解法。

🔹[三个你可能没预料到的 CSS 布局"解法"](https://nerdy.dev/3-unintuitive-layout-solutions)：这些 CSS 布局技巧，看似反直觉但确实好用。

🔹[模态框的移动方式，也可以 shape 一下](https://frontendmasters.com/blog/move-modal-in-on-a-shape/)：布局不只是方的，也可以是弯的。

🔹[ChatGPT 让那些过时又出错的老方法卷土重来了](https://frontendmasters.com/blog/chatgpt-and-old-and-broken-code/)：AI 内容生成的一大副作用，是我们忘了已有的好解法。

🔹[用 clip-path + shape() 做出柔滑的 Blob 形状](https://frontendmasters.com/blog/creating-blob-shapes-using-clip-path-shape/)：轻松生成不规则形状，不用再靠 SVG。

🔹[HTML 日期/时间输入框的图标，也能美化了](https://cassidoo.co/post/input-type-date/)：一个容易忽视但能提升质感的微调点。

🔹[瀑布流、流动布局，还有 GULP？](https://meyerweb.com/eric/thoughts/2025/05/21/masonry-item-flow-and-gulp/)：一场关于传统构建工具与新布局哲学的对话。

🔹[CSS Boilerplate：任何项目都能用的默认结构模板](https://fokus.dev/tools/css-boilerplate/)：让你的样式起步就整洁。

🔹[alt 文本也能像普通文字一样美化](https://piccalil.li/blog/you-can-style-alt-text-like-any-other-text/)：增强可访问性的一个好技巧。

🔹[关于嵌套列表的一个经典提问](https://css-tricks.com/a-readers-question-on-nested-lists/)：来自读者的问题，照亮你我盲区。

---

### JavaScript & React

🔹[JavaScript 简史](https://deno.com/blog/history-of-javascript)：从网景时代到现代 JS，技术演化全记录。

🔹[JS 的 at() 方法让数组索引更简单了](https://allthingssmitty.com/2025/05/19/how-javascript-at-method-makes-array-indexing-easier/)：负索引支持终于进原生了。

🔹[WebAssembly 中 JS 调试现状](https://thenewstack.io/the-state-of-javascript-debugging-in-webassembly/)：前端与低层系统的连接点，调试也很有学问。

🔹[JavaScript 的 lint 规则如何运行？语法树背后的秘密](https://www.freecodecamp.org/news/how-javascript-lint-rules-work-and-why-abstract-syntax-trees-matter/)：AST 不只是编译器的事，前端也用得到。

🔹[Next.js 的 middleware 漏洞解析](https://blog.logrocket.com/understanding-next-js-middleware-vulnerability/)：理解漏洞的根源，也是在理解框架的设计哲学。

---

### React

🔹[用 React 构建可扩展 Web 应用的关键思路](https://www.sitepoint.com/scalable-web-apps-with-react-js/)：从组件结构到数据管理的最佳实践。

🔹[React 多步表单开发指南：无状态混乱](https://thenewstack.io/building-multistep-forms-in-react-with-no-state-mess/)：无需陷入状态管理泥潭，也能做出漂亮多步骤交互。

🔹[用 Ollama 和 React 打造 AI 工作流](https://blog.logrocket.com/building-agentic-ai-workflow-ollama-react/)：将 AI Agent 流程与前端 UI 真正融合。

🔹[URL 状态管理的重要性：React 的 useSearchParams 使用指南](https://blog.logrocket.com/url-state-usesearchparams/)：页面状态也可以放在地址栏里，更好同步用户操作。

---

### Angular

🔹[Angular 在 Google I/O 上的全新进展](https://io.google/2025/explore/pa-keynote-16)：官方现场演示 Angular 新特性。

🔹[RxJS 在 Angular 16 中的最佳实践](https://www.infoq.com/articles/rxjs-angular16-best-practices/)：避开订阅陷阱，构建流式代码的正确姿势。

---

## 小结

从浏览器 API 到框架细节，从布局美学到调试底层，前端的边界再次被拉宽。尤其值得注意的是，CSS 正在走向一种更几何化、视觉更自由的表达方式，而 React 与 AI 的联动也在持续刷新开发范式。可以说，这周的前端，是一次"回归创造力"的提醒。

✅ OK，以上就是本次分享，欢迎加我威 atar24，备注「前端周刊」，我会邀请你进交流群👇  
🚀 每周分享技术干货  
🎁 不定期抽奖福利  
💬 有问必答，群友互助 