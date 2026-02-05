# JavaScript 框架展望 2026

原文：[JavaScript Frameworks — Heading into 2026](https://dev.to/this-is-learning/javascript-frameworks-heading-into-2026-2hel)

作者：[Ryan Carniato](https://dev.to/ryansolid)

日期：2026年1月5日

翻译：[TUARAN](https://github.com/TUARAN)

> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

![JavaScript Frameworks - Heading into 2026](https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fedmku9fx7x4yun3dx99y.webp)

我想，三年之后，我的 JavaScript 框架年度回顾已经可以算作一个“惯例”了。2025 年写这篇文章时，我很难下笔，因为我们尝试的很多想法并不足以走到终点。有时我们确实需要一次现实检验，用来重置期望。

这种情绪延续到了今年。一些原本以为不会再更新的库，竟然又出了新版本。

React 在今年经历了一些显著的崩溃事故和安全漏洞。

这一年变化很多，但更多是一种视角的变化。若说 AI 过去还不够主流，那么过去一年它已完全主导了讨论。以至于几乎没人再谈新的 JavaScript 框架或框架特性。但这并不代表事情没有进展。

我们已经到了一个阶段：在这片水域里航行时，“愿景”比实现更重要。最初推动许多框架转向 Signals 的性能关注，正让位给更战略化的思考。因此，从这些方向开始聊 2026 是个很好的切入点。

## AI-First 框架

过去几年里，我一直认为 AI 对 JavaScript 框架的开发影响不大。虽然开发者不断学习新工具，LLM 也在生成各种框架代码上越来越强，但框架本身并没有做太多改变。是的，它改变了我们看文档的方式，有些工具也加上了 MCP 服务器。但它真的改变了框架设计方式吗？

### 2025 的视角

和所有颠覆性技术一样，行业需要时间适应。我们往往先关注它当下的能力，而不是全部潜力。对于 LLM 来说，就是它在训练数据最丰富的地方表现最好。你可能听过“React 是最后一个框架”的说法。

![React is the Last Framework](https://media2.dev.to/dynamic/image/width=800,height=,fit=scale-down,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F85dyr9p71f2ffygew9jl.png)

这个观点认为：借助编译器，React 可以在不引入新特性或语法变化的情况下变得更高效。但过去几年告诉我们，这更像是一厢情愿。事情总会变。

但这个现象确实存在。AI 是我们见过最大的“回音室”，它把 React 交到了原本不会使用它的人手中。

同时，这也意味着每个框架都是自身成功的受害者。LLM 每天都在更广泛的工具上生成更好的代码。那么会不会出现某个拐点，让这些训练集的质量超越历史上更受欢迎方案的“数量优势”？

因为如果 2018 年的 React 真的已经是“最后一个框架”，那我们还有更大的问题。

### 拥抱重设计

如今新的 JavaScript 框架更少了，但有一个框架特别强调 AI-First 的重设计：Remix 3 不再构建在 React 之上，它从零开始重构全栈 Web 开发。创建者 Ryan Florence 和 Michael Jackson 对 AI 在框架设计与实现中的角色非常直言不讳。

他们最有趣的立场是：减少领域特定语言（DSL），让 AI 更容易生成通用解决方案。

看他们的发布会，Ryan 会让 AI 生成一段简单逻辑，不需要了解框架本身，然后轻松把它放进演示里。

这与其他框架提供语义化“语言原语”的做法形成鲜明对比。大多数框架最终都围绕状态、派生状态和副作用建立了一套相似语言，尽管实现不同。

究竟是“更容易集成通用解法”更好，还是“领域原语带来的保证”更好，只能交给时间来证明。但感觉我们终于开始问到正确的问题了。

## Isomorphic-First 框架

去年我们提到，开发者对“服务器驱动”技术有所反弹。Islands 与 React Server Components 在电商与速度评分主导的时代迅速兴起，但很多人发现这些方案无法满足复杂且高度交互的应用需求。

这种复杂性来自于服务器与客户端 UI 之间无处不在的边界，以及 Islands 和 RSC 本质上是一种不同架构的事实。它们的导航和变更方式更像传统的多页应用。

因此，2024 年对单页应用的技术升级继续向各框架扩散也就不奇怪了。

我们看到 TanStack Start 和 SvelteKit 跟随 SolidStart，把“乱序流式渲染（Out-of-Order streaming）”、“Server Functions”、“更细粒度的乐观 UI（Optimistic UI）”和“Single-Flight mutations”等模式带入各自生态。

这再次印证了我所说的 Isomorphic-First 架构：应用核心代码在服务端与客户端都运行。它可以 SSR，但架构核心还是同构。我们多年都这样做，只是现在有了更多新工具与能力，借鉴了 Server Components 的一些效率，却没有改变架构本质。

事实证明，你仍然可以利用很多服务器效率而不必切换架构。我预计这些框架会继续演化，把自己的服务端模板（Server Components）版本纳入体系。

## Async-First 框架

如果要指出 2025 年框架思维上最大的进化，我认为是 Async。

虽然一些近年拥抱 Signals 的框架带来了专用原语，比如 Angular 的 Resource API，但我说的变化更根本。

JavaScript 框架的目标是让创建交互式 UI 更可控。大多数框架选择了声明式：你描述 UI 在某个状态下应该是什么样，框架负责处理输入、同步状态，并确保一致性。

实现这一点最简单的方法是：在同步更新上建立保证。这也是 VDOM 和 Signals 的吸引力。异步更新则不同，它会打破这些保证，若考虑不周常常显得“硬加上去”。

如果异步本身也能携带保证，并成为核心体验的一部分呢？

React 多年前在并发模式与 Transitions 上就提出了这些问题。而今年终于让我们看到它走到哪里。Rick Hanlon 围绕 `useOptimistic` 和 “Actions” 的探索，描绘了一个未来：每次用户交互都被包裹在 Transition 中，按数据就绪情况协调 UI 展示并确保一致性。

有趣的是，如果你稍微眯起眼看，这并不比 Svelte 的新异步处理方式差多少。尽管 Svelte 没有 Transitions，但它[仍会将触发异步的更新分组，以确保屏幕上状态的一致性](https://svelte.dev/playground/fe4b93c45cb741feb54a106d77750e97?version=5.46.1)。行为上非常相似，只是 Svelte 借助编译器而不是显式封装。

当然，这里还有不少需要打磨的地方。React 要让设计系统普遍采用这些模式，可能会对生态造成较大负担。但可以确定的是：一些漂浮多年的理念，终于开始显现出成形的愿景。

这种变化影响深远，但又足够基础，以至于几年后会成为框架的“入场券”。敬请关注。

## JavaScript 框架的未来

我认为，2025 年比近年任何一年都更挑战框架在 Web 开发中的角色。我们渴望从复杂性中退一步，但替代方案并不充分。

你可以不断做“更少”，直到不再能做；你可以选择更受限的抽象，直到它无法满足需求。这是很好的学习方式，我作为框架作者也常这么做。但你可能能更高效地利用时间。

![Cyberpunk City](https://media2.dev.to/dynamic/image/width=800,height=,fit=scale-down,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Flnfbhauwxuzqm0ql82gv.webp)

我并不是在说 HTMX、无构建方案、Web Components 等简单工具在各自范围内不好用。问题是，一旦我们不得不继续前进，就很难回到更“简单”的时代。

我们避免复杂性的方法，更多是绕过选择瘫痪：采用元框架，并在其之上再叠更具意见的脚手架与默认配置（例如 Redwood、create-t3-app）。我一直担心这些会很难保持更新，而 AI 的出现直接削弱了这一层：框架作者精心铺好的模块，AI 很可能一股脑拼在一起。

这反过来让焦点回到更“原始”的模式。并不是说 API 不会稳定，React 也可以变化，局部 API 的变化可以学习。问题在于这种“拼装式实现”的模块化需求，让我们更难整体理解方案。

某种意义上，AI 正用它的不足在“解决复杂性”：它做的事就像一个不了解系统的开发者——绕过它、往下走一层，坚持自己熟悉的方式。于是最终负责把东西拼起来的人，也会顺着这个方向走。

我们可以说这并不理想，但解决它是优先级。它暗示我们需要一种方案：在局部提供明确控制的同时，整体上又能和系统协同。这就像在团队中开发软件，即便只有一个人，也要以“协作”的方式去设计。它改变了某些规模化问题出现的时点。

幸运的是，不管是否刻意，这种系统性重思正是当前发生的事。不论是重新检视 async，还是寻找保持同构模式下大部分旧代码继续工作的方式。

## 结论

![Conclusion](https://media2.dev.to/dynamic/image/width=800,height=,fit=scale-down,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fh4g6tr3qspqlumusmlqw.jpg)

这些主题都值得更深入的讨论，而我今天只是浅尝辄止。过去一年我本该写更多文章，但我一直在做研究。

这是一个在 JavaScript 框架上工作的激动人心的时代。它不是 Islands、可恢复性（Resumability）或 RSC 初登场时那种“预览式”的未来能力，也不是那种会在架构层面彻底改变问题处理方式的技术前瞻。

这是一个核心打磨的时代。把经验教训提炼为更普适的事实。这样的改变影响的是我们思考代码的方式，而不仅仅是我们写的内容。因为未来写代码的可能都不是我们自己。

过去几年人们就一直在说类似的话。但在 2026 年，我认为我们会开始看到这些变化显化为具体形态。构建模块正在以正确的层级搭建起来。

如果你觉得这些话听起来很玄，也没关系。给它一点时间。我承认，直到我能在自己的决策中感受到这种“拉力”之前，它对我来说也不太有意义——就像远处黑洞微微改变重力轨迹一样。但在经历了几年的复杂架构折磨之后，我已经准备好继续走向它指引的方向。

Banner credits：©️ [Cyberpunk-City](https://www.behance.net/gallery/53451651/Cyberpunk-City) by Artur Sadlos。
