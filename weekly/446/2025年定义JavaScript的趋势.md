# 2025 年定义 JavaScript 的趋势

> 原文： [Trends That Defined JavaScript in 2025](https://thenewstack.io/trends-that-defined-javascript-in-2025/)
>
> 翻译： [樱吹雪](https://juejin.cn/user/1179091901098269)

尽管 AI 崛起且 Web 开发趋向简化，JavaScript 框架在前端的主导地位依然稳固。

2025 年被证明是 JavaScript 生态系统的变革之年，其标志是向性能优化和“[后 React](https://thenewstack.io/after-a-decade-of-react-is-frontend-a-post-react-world-now/)”探索的转变。我们在此回顾 2025 年主导 JavaScript 社区的故事和趋势。

## 挑战 React

虽然 React 仍然是开发的中流砥柱——甚至大语言模型在自由发挥时也会主要[输出 React 代码](https://thenewstack.io/why-ai-is-generating-lowest-common-denominator-react-code/)——但在 2025 年，越来越多的开发者呼吁一种“Web 标准优先”的理念。这种理念优先考虑简洁性，因为开发者们开始质疑这么重的客户端抽象是否必要。

部分原因在于现代浏览器已经足够成熟，能够处理以前需要 React 才能完成的任务，包括对 [View Transitions API](https://thenewstack.io/interop-unites-browser-makers-to-smooth-web-inconsistencies/) 和 [Web Components](https://thenewstack.io/how-microsoft-edge-is-replacing-react-with-web-components/) 的支持。我们在 [Remix 3](https://thenewstack.io/remix-3-and-the-end-of-react-centric-architectures) 中也看到了这一点，它通过优先使用 loaders/actions 等 Web 基础功能而非 React 特有的状态管理，向以 React 为中心的架构发起了挑战。它标志着 React 应当是视图层，而非基础。

但这并不全是 React 的坏消息：它现在有了自己的基金会。在 [React 的一次重大治理转变中](https://thenewstack.io/react-foundation-leader-on-whats-next-for-the-framework/)，Meta 将该框架的管理权移交给了 Linux 基金会旗下的一个独立基金会，旨在促进企业中立性和更广泛的生态系统贡献。

## 框架趋势：MPA、Signals（信号）和编译器

2025 年，框架的发展并未放缓。事实上，这一年涌现了许多新框架——包括用于边缘计算的[微框架 Hono](https://thenewstack.io/hono-shows-the-way-for-microframeworks-in-a-post-react-world/)。

还有基于 [React 的 One](https://thenewstack.io/one-lets-frontend-devs-build-once-deploy-web-and-native-apps/)，它支持创建 Web 和原生平台应用。这一年还发布了[极简主义的 Mastro](https://thenewstack.io/minimalist-mastro-framework-offers-modern-take-on-mpas/)，它用于多页应用。它倡导“默认零 JS”，并启用浏览器原生路由，以取代厚重的客户端单页应用。最后是 [Wasp](https://thenewstack.io/javascripts-missing-link-wasp-offers-full-stack-solution/)，它提供了一个全栈解决方案，为 React/Node 生态系统创造了类似 Ruby on Rails 的体验。

在非 React 框架方面，Signals（信号） 已成为响应式的基石。Signals 仅对 UI 中更新的确切部分使用响应式。Angular、Vue、Solid 和 Svelte 现在都使用 Signals 进行状态管理。甚至有人推动将 Signals 添加到 [JavaScript 规范](https://github.com/tc39/proposal-signals)中。

但在迈向 2026 年之际，SolidJS 的创建者 Ryan Carniato 预测，[细粒度响应式（fine-grained reactivity）](https://thenewstack.io/solidjs-creator-on-fine-grained-reactivity-as-next-frontier/) 可能是非 React 框架的下一个前沿。

“当除了 React 之外的几乎每个框架都将 Signals 作为一等公民采用时，这种影响很难被忽视，”他说，并补充道，“我们仅仅处于更大变革的开端，持有这种想法的不止我一人。”

我们还在2024年底发布的[Runes in Svelte 5](https://thenewstack.io/youll-write-less-code-with-svelte-5-0-promises-rich-harris/)中看到了对细粒度响应式的关注。

编译器也承担了更多繁重的工作。[Svelte 5 的 Runes](https://svelte.dev/blog/svelte-5-is-alive)于 2024 年底发布稳定版，它依赖 Svelte 的编译器。该编译器将看起来像函数的 [Runes](https://svelte.dev/blog/runes) 转换为 Signals 运行时。[React Compiler](https://thenewstack.io/meta-releases-open-source-react-compiler/) 也在今年被标记为稳定版。React 使用编译器来自动化记忆化——这是一个术语，指的是改变 UI 重新渲染的范围，而不是像 Svelte 编译器那样改变数据更新的方式。

不过在这一年里，这两种情况下的编译器都承担了将“人类可读”代码转换为优化机器代码的繁重工作，以避免不必要的重新渲染。

## 工具链：统一技术栈之争

2024 年底，Vite 的创建者[尤雨溪宣布成立 VoidZero](https://thenewstack.io/vite-creator-launches-company-to-build-javascript-toolchain/)，这是一家致力于为 Web 开发社区创建统一的、基于 Rust 的工具链的公司。这个工具生态系统旨在最终解决 JavaScript 开发的“碎片化税（fragmentation tax）”——即开发者不得不将数十种工具“像贴胶带一样拼凑”在一起。

TNS 高级编辑 [Richard MacManus](https://thenewstack.io/how-vite-became-the-backbone-of-modern-frontend-frameworks/) 在 10 月就由此产生的统一工具链 Vite+ 采访了尤雨溪。“Vite+ 是一个[统一层](https://thenewstack.io/vites-creator-on-a-unified-javascript-toolchain-and-vite/)，将所有这些东西整合在一个连贯的解决方案下，对吧？所以它是 Vite 本身的一个即插即用的超集，”尤雨溪说。

它捆绑了尤雨溪的公司正在开发的几个不同的[开源项目](https://thenewstack.io/does-your-open-source-project-need-foundation-oversight/)，包括：

- Rolldown：一个新的基于 Rust 的 Vite 打包器；
- Oxlint：一个由 Rust 驱动的 JavaScript 和 TypeScript 代码检查工具；
- Vitest：一个 Vite 原生的测试框架；以及
- Oxc：一系列用 Rust 编写的 JavaScript 工具集合。

## AI 与框架

2025 年，AI 从后端走向了前端。我们看到了一系列 MCP 服务器的推出，旨在帮助框架将最佳实践和标准与 AI 连接起来，其中包括来自 Angular 和 React 的 MCP 服务器，TanStack Start 等框架也计划推出更多此类服务。

像 Minko Gechev 这样的框架维护者甚至试验了一种专为 AI 智能体（AI agents）易于编写和调试而设计的“[LLM 优先](https://blog.mgechev.com/2025/04/19/llm-first-web-framework/)”框架。TanStack 最近发布了 [TanStack AI](https://thenewstack.io/tanstack-adds-framework-agnostic-ai-toolkit/)，这是一个面向开发者的新型框架无关 AI 工具包的 Alpha 版本。

我们还看到了在浏览器中使用 AI 的转变，像 [AsterMind-ELM 和 TensorFlow.js](https://thenewstack.io/javascript-library-runs-machine-learning-models-in-browser/) 这样的库允许开发者直接在浏览器中以微秒级延迟训练和运行机器学习模型，绕过了对昂贵的服务器端 GPU 的需求。还有一个名为 [Hashbrown](https://thenewstack.io/run-ai-agents-in-the-browser-with-the-hashbrown-framework/) 的开源框架，它允许 AI 智能体在浏览器中运行。

## 展望 2026

2025 年以令人惊讶的方式推动了 JavaScript 的进步，但留下的问题或许比答案更多。[框架最终会被迫趋同吗](https://thenewstack.io/google-angular-lead-sees-convergence-in-javascript-frameworks/)？2026 年是否会推出更多框架来解决新的关注点和需求？AI 对 JavaScript 及其支持的生态系统意味着什么？

希望在来年，我们能得到这些问题的答案。
