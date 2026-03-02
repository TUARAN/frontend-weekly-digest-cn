原文：How we rebuilt Next.js with AI in one week  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 我们如何在一周内用 AI 重建 Next.js

## 我们如何在一周内用 AI 重建 Next.js

2026-02-24  
- [![](https://blog.cloudflare.com/cdn-cgi/image/format=auto,dpr=3,width=64,height=64,gravity=face,fit=crop,zoom=0.5/https://cf-assets.www.cloudflare.com/zkvhlag99gkb/5QLe2KDuN7J0YVnb2gf743/2b6327152ff0e693cf3d142bbbefcd44/1517689834276.jpg)](https://blog.cloudflare.com/author/steve-faulkner/)[Steve Faulkner](https://blog.cloudflare.com/author/steve-faulkner/)  
阅读时长：10 分钟  
本文也提供 [韩语](https://blog.cloudflare.com/ko-kr/vinext) 版本。![](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/64oL10LCSz30EiEHWVdJPG/aeaed48a681ec3d5bc9d8cb6e5e30a96/BLOG-3194_1.png)

**本文于太平洋时间 12:35 pm 更新，以修正构建耗时基准测试中的一个拼写错误。*

上周，一位工程师和一个 AI 模型从零开始重建了最流行的前端框架。成果是 [vinext](https://github.com/cloudflare/vinext)（读作 “vee-next”）：一个基于 [Vite](https://vite.dev/) 构建、可直接替代 Next.js 的实现，并且只需一条命令就能部署到 Cloudflare Workers。早期基准测试显示，它构建生产应用的速度最高可快 4 倍，生成的客户端 bundle 体积最高可缩小 57%。而且我们已经有客户在生产环境中运行它了。

整个项目的 token 成本大约是 1,100 美元。

## Next.js 的部署问题

[Next.js](https://nextjs.org/) 是最受欢迎的 React 框架。数以百万计的开发者在使用它。它支撑了生产环境 Web 的很大一部分，而且这并非偶然：它的开发体验确实是一流的。

但当 Next.js 被放到更广泛的 serverless 生态中使用时，会遇到部署问题。它的工具链完全是高度定制的：Next.js 在 Turbopack 上投入巨大，但如果你想把它部署到 Cloudflare、Netlify 或 AWS Lambda，就必须把它的构建产物重新塑形为目标平台真正能运行的形式。

如果你在想：“这不就是 OpenNext 在做的事情吗？”，没错。

这确实就是 [OpenNext](https://opennext.js.org/) 要解决的问题。并且 OpenNext 已经汇聚了来自多个提供商的大量工程投入，包括我们 Cloudflare。它能用，但很快就会撞上限制，变成一场打地鼠游戏。

以 Next.js 的输出作为基础去叠加构建，已经被证明是一种困难且脆弱的方式。因为 OpenNext 必须对 Next.js 的构建产物进行逆向工程，这会导致不同版本之间出现不可预测的变化，而修正这些变化需要投入大量工作。

Next.js 一直在推进一套一等公民的 adapters API，我们也在与他们合作。这项工作仍处于早期阶段，但即使有了 adapters，你仍然是在那套定制的 Turbopack 工具链之上进行构建。而且 adapters 只覆盖构建与部署。在开发阶段，`next dev` 只能在 Node.js 中运行，没有办法接入不同的运行时。如果你的应用使用了平台特定的 API，比如 Durable Objects、KV 或 AI bindings，那么在 dev 环境里你就无法直接测试那段代码，除非使用一些变通方案。

## 介绍 vinext

如果我们不去适配 Next.js 的输出，而是直接在 [Vite](https://vite.dev/) 之上重新实现 Next.js 的 API 表面，会怎样？Vite 是 Next.js 之外绝大多数前端生态所使用的构建工具，驱动着 Astro、SvelteKit、Nuxt 和 Remix 等框架。我们想做的是一种干净的重实现，而不只是一个 wrapper 或 adapter。说实话，我们一开始也不觉得能成。但现在是 2026 年，构建软件的成本已经彻底改变了。

我们的进展远超预期。

````
`npm install vinext
```
`
````

把脚本里的 `next` 替换成 `vinext`，其他都保持不变。你现有的 `app/`、`pages/`、`next.config.js` 都可以原样工作。

            vinext dev          # 带 HMR 的开发服务器
vinext build        # 生产构建
vinext deploy       # 构建并部署到 Cloudflare Workers

这不是对 Next.js 和 Turbopack 输出的包装。它是对 API 表面的另一种实现：路由、服务端渲染、React Server Components、server actions、缓存、middleware——全部都实现了，并以 Vite 插件的方式构建在 Vite 之上。最重要的是，借助 [Vite Environment API](https://vite.dev/guide/api-environment)，Vite 的输出可以运行在任何平台上。

## 数据表现

早期基准测试结果很乐观。我们将 vinext 与 Next.js 16 进行了对比，使用的是同一个包含 33 条路由的 App Router 应用。

两个框架做的是同样的工作：编译、打包，并为服务端渲染路由做准备。我们在 Next.js 的构建中禁用了 TypeScript 类型检查和 ESLint（Vite 在构建期间不会运行这些），并使用 `force-dynamic`，以避免 Next.js 额外花时间对静态路由做预渲染——否则会不公平地拖慢它的耗时。我们的目标是只衡量打包器与编译速度，不包含其他因素。基准测试会在每次合并到 main 时在 GitHub CI 上运行。

**生产构建耗时：**

  
    Framework
    Mean
    vs Next.js
  

  
    Next.js 16.1.6 (Turbopack)
    7.38s
    baseline
  
  
    vinext (Vite 7 / Rollup)
    4.64s
    1.6x faster
  
  
    vinext (Vite 8 / Rolldown)
    1.67s
    4.4x faster
  

**客户端 bundle 体积（gzip 后）：**

  
    Framework
    Gzipped
    vs Next.js
  

  
    Next.js 16.1.6
    168.9 KB
    baseline
  
  
    vinext (Rollup)
    74.0 KB
    56% smaller
  
  
    vinext (Rolldown)
    72.9 KB
    57% smaller
  

这些基准测试衡量的是编译与打包速度，而不是生产环境的服务性能。测试样例是一个单独的 33 路由应用，并不代表所有生产应用的典型情况。随着这三个项目持续发展，我们预计这些数字会继续变化。[完整的方法论与历史结果](https://benchmarks.vinext.workers.dev/) 已公开。请把它们当作方向性的参考，而不是最终定论。

这个方向还是很让人鼓舞的。Vite 的架构，尤其是（将在 Vite 8 中推出的、基于 Rust 的打包器）[Rolldown](https://rolldown.rs/)，在构建性能方面具备结构性的优势，而这些优势在这里表现得非常明显。

## 部署到 Cloudflare Workers

vinext 以 Cloudflare Workers 作为第一部署目标来构建。一条命令就能把你从源代码带到一个正在运行的 Worker：

````
`vinext deploy
```
`
````

它会把所有事情都处理好：构建应用、自动生成 Worker 配置，然后完成部署。App Router 和 Pages Router 都可以在 Workers 上运行，并且支持完整的客户端 Hydration（注水）、交互组件、客户端导航、React 状态等。

在生产环境缓存方面，vinext 内置了一个 Cloudflare KV 缓存处理器，让你开箱即用地获得 ISR（Incremental Static Regeneration，增量静态再生成）：

```js
import { KVCacheHandler } from "vinext/cloudflare";
import { setCacheHandler } from "next/cache";

setCacheHandler(new KVCacheHandler(env.MY_KV_NAMESPACE));
```

对于大多数应用来说，[KV](https://developers.cloudflare.com/kv/) 是一个很好的默认选择，但缓存层被设计为可插拔。那次 `setCacheHandler` 调用意味着你可以替换成任何合理的后端。[R2](https://developers.cloudflare.com/r2/) 可能更适合缓存体积更大、或访问模式不同的应用。我们也在改进我们的 Cache API，希望它能以更少的配置提供一个强健的缓存层。我们的目标是灵活性：选择最适合你应用的缓存策略。

目前正在运行的在线示例：
- [App Router Playground](https://app-router-playground.vinext.workers.dev/)
- [Hacker News clone](https://hackernews.vinext.workers.dev/)
- [App Router minimal](https://app-router-cloudflare.vinext.workers.dev/)
- [Pages Router minimal](https://pages-router-cloudflare.vinext.workers.dev/)

我们还有一个[在线示例](https://next-agents.threepointone.workers.dev/)，演示 Cloudflare Agents 在 Next.js 应用中运行，而且不需要像 [getPlatformProxy](https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy) 这样的变通方案——因为整个应用在开发和部署阶段都运行在 workerd 中。这意味着你可以毫无妥协地使用 Durable Objects、AI 绑定以及其他所有 Cloudflare 特有的服务。[可以看这里。](https://github.com/cloudflare/vinext-agents-example)

## 框架需要团队协作

当前的部署目标是 Cloudflare Workers，但这只是全貌中的一小部分。vinext 大约 95% 都是纯 Vite。路由、模块 shim、SSR 流水线、RSC 集成：这些都不是 Cloudflare 特有的。

Cloudflare 正在与其他托管服务提供商探讨，让他们也能为客户采用这套工具链（改造成本很低——我们在不到 30 分钟内就在 [Vercel](https://vinext-on-vercel.vercel.app/) 上跑通了一个概念验证！）。这是一个开源项目，为了它的长期成功，我们认为与生态中的合作伙伴一起协作、确保持续投入非常重要。欢迎来自其他平台的 PR。如果你有兴趣添加一个部署目标，请[提一个 issue](https://github.com/cloudflare/vinext/issues) 或直接联系。

## 状态：实验性

我们想把话说明白：vinext 处于实验阶段。它甚至还不到一周大，也还没有在任何有规模的真实流量下经过实战检验。如果你正在评估把它用于生产应用，请保持必要的谨慎。

不过，它的测试套件非常全面：有超过 1,700 个 Vitest 测试和 380 个 Playwright E2E 测试，其中包括直接从 Next.js 测试套件移植的测试，以及 OpenNext 的 Cloudflare 一致性测试套件。我们已用 Next.js App Router Playground 验证过它。覆盖范围达到了 Next.js 16 API 面的 94%。

来自真实客户的早期结果令人鼓舞。我们一直在与 [National Design Studio](https://ndstudio.gov/) 合作，这是一个致力于现代化每一个政府界面的团队；合作项目是他们的一个 beta 站点 [CIO.gov](https://www.cio.gov/)。他们已经在生产环境中运行 vinext，并在构建时间和包体大小方面获得了显著改进。

README 对[哪些不支持、也不会支持的内容](https://github.com/cloudflare/vinext#whats-not-supported-and-wont-be)以及[已知限制](https://github.com/cloudflare/vinext#known-limitations)都写得很坦诚。我们希望保持透明，而不是过度承诺。

## 预渲染怎么办？

vinext 已经开箱即用地支持 ISR（增量静态再生成）。任何页面在第一次请求之后都会被缓存，并在后台重新验证，和 Next.js 的行为一致。这部分现在就能用。

vinext 还不支持在构建时进行静态预渲染。在 Next.js 中，没有动态数据的页面会在 `next build` 阶段被渲染，并以静态 HTML 的形式提供。如果你有动态路由，则需要用 `generateStaticParams()` 枚举哪些页面要提前构建。vinext 还没有做到这一点……至少目前还没有。

这是我们在发布时做出的一个有意设计决策。它已经列入[路线图](https://github.com/cloudflare/vinext/issues/9)，但如果你的网站是 100% 预构建 HTML 的纯静态内容，那么你现在大概率看不到 vinext 带来太多收益。话虽如此：如果一个工程师能花 &#36;1,100 的 token 成本把 Next.js 重建一遍，那你大概也能花 $10 迁移到一个基于 Vite、专门为静态内容设计的框架，比如 [Astro](https://astro.build/)（它也[支持部署到 Cloudflare Workers](https://blog.cloudflare.com/astro-joins-cloudflare/)）。

不过，对于不是纯静态的网站，我们认为我们能做得比“在构建时把一切都预渲染出来”更好。

## 引入“流量感知”的预渲染（Traffic-aware Pre-Rendering）

Next.js 会在构建期间预渲染 `generateStaticParams()` 中列出的每一个页面。一个拥有 10,000 个商品页的网站，意味着在构建时要渲染 10,000 次——尽管其中 99% 的页面可能永远不会收到任何请求。构建耗时会随着页面数量线性增长。这就是为什么大型 Next.js 站点最终会出现 30 分钟构建时间的原因。

因此我们构建了 **Traffic-aware Pre-Rendering**（TPR，流量感知预渲染）。它目前还是实验性功能，我们计划在获得更多真实世界测试之后，将其设为默认方案。

这个思路很简单。Cloudflare 已经是你网站的反向代理。我们掌握你的流量数据。我们知道哪些页面真的有人访问。所以我们不再“要么全部预渲染，要么完全不预渲染”，而是在部署时由 vinext 去查询 Cloudflare 的 zone analytics，只预渲染真正重要的页面。

```bash
vinext deploy --experimental-tpr

  Building...
  Build complete (4.2s)

  TPR (experimental): Analyzing traffic for my-store.com (last 24h)
  TPR: 12,847 unique paths — 184 pages cover 90% of traffic
  TPR: Pre-rendering 184 pages...
  TPR: Pre-rendered 184 pages in 8.3s → KV cache

  Deploying to Cloudflare Workers...
```

对于一个拥有 100,000 个商品页的网站来说，幂律分布意味着 90% 的流量通常只会落在 50 到 200 个页面上。这些页面可以在几秒内完成预渲染。其余页面则回退到按需 SSR，并在第一次请求后通过 ISR 进行缓存。每一次新的部署都会基于当前的流量模式刷新这组预渲染页面。突然爆红的页面会被自动纳入。所有这些都无需 `generateStaticParams()`，也无需让你的构建过程与生产数据库产生耦合。

## Taking on the Next.js challenge, but this time with AI

像这样的项目通常需要一个工程师团队花上数月甚至数年。多家公司里有好几个团队都尝试过，但规模实在太大。我们在 Cloudflare 也试过一次！两个路由器、33+ 个模块 shim、服务端渲染流水线、RSC 流式传输、基于文件系统的路由、中间件、缓存、静态导出。没人能真正把它做成，是有原因的。

但这次我们在不到一周的时间里就做出来了。由一名工程师（严格来说是工程经理）指挥 AI 完成。

第一个 commit 在 2 月 13 日合入。到当天晚上结束时，Pages Router 和 App Router 都已经实现了基础 SSR，同时还支持了 middleware、server actions 和 streaming。到第二天下午，[App Router Playground](https://app-router-playground.vinext.workers.dev/) 已经能渲染 11 条路由中的 10 条。到第三天，`vinext deploy` 已经可以把应用发布到 Cloudflare Workers，并完成完整的客户端 hydration。本周剩下的时间主要用来加固：修复边缘情况、扩展测试套件、把 API 覆盖率提升到 94%。

和以前那些尝试相比，变化是什么？AI 变强了。强了很多。

## Why this problem is made for AI

不是每个项目都会这样发展。但这个项目之所以能成，是因为有几件事刚好在对的时间对齐了。

**Next.js 的规范很完善。** 它有大量文档、庞大的用户群，以及多年来 Stack Overflow 上的答案和教程。其 API 覆盖面在训练数据里到处都是。当你让 Claude 实现 `getServerSideProps` 或解释 `useRouter` 的工作原理时，它不会胡编乱造。它“知道” Next 是怎么工作的。

**Next.js 有一套精心设计的测试套件。** [Next.js 仓库](https://github.com/vercel/next.js) 里包含成千上万个 E2E 测试，覆盖每个功能和边缘情况。我们直接从他们的测试套件里移植测试（你可以在代码里看到署名标注）。这为我们提供了一个可以用机械化方式验证的“规格说明”。

**Vite 是极佳的基础。** [Vite](https://vite.dev/) 负责处理前端工具链中最难的部分：极速 HMR、原生 ESM、干净的插件 API、生产环境打包。我们不必从头造一个 bundler。我们只需要教它“说 Next.js”。[`@vitejs/plugin-rsc`](https://github.com/vitejs/vite-plugin-rsc) 仍处于早期阶段，但它让我们无需从零实现 RSC，就能获得 React Server Components 支持。

**模型能力追上来了。** 我们认为即便在几个月前，这也不可能实现。早期模型无法在如此规模的代码库上持续保持连贯性。新模型可以把完整架构保持在上下文里，推理模块之间如何交互，并以足够高的正确率产出代码，从而让进度得以持续推进。有时我看到它为了定位一个 bug，会深入 Next、Vite 和 React 的内部实现去分析。最先进的模型令人印象深刻，而且看起来还在不断变强。

这些条件必须在同一时间都成立：目标 API 文档完善、测试套件全面、底层构建工具扎实，以及一个确实能处理复杂度的模型。少了任何一个环节，效果都不会这么好。

## How we actually built it

vinext 几乎每一行代码都是由 AI 编写的。但更重要的是：每一行都通过了你对人类编写代码也会要求的同等质量门槛。项目拥有 1,700+ 个 Vitest 测试、380 个 Playwright E2E 测试，通过 tsgo 完整进行 TypeScript 类型检查，并使用 oxlint 做 lint。持续集成会在每个 pull request 上运行全部检查。在代码库里建立一套好的护栏（guardrails），对让 AI 真正具备生产力至关重要。

流程从一个计划开始。我花了几个小时在 [OpenCode](https://opencode.ai/) 里和 Claude 来回讨论，定义整体架构：要构建什么、按什么顺序、使用哪些抽象。这个计划成了“北极星”。从那之后，工作流就很直接了：

- 定义一个任务（“实现 `next/navigation` 的 shim，包含 usePathname、`useSearchParams`、`useRouter`”）。
- 让 AI 编写实现和测试。
- 运行测试套件。
- 测试通过就合并；不通过就把错误输出给 AI，让它迭代。
- 重复上述步骤。

我们也把 AI 代理接入到了代码评审流程里。当有 PR 被创建时，会有一个代理去做 review。评审意见回来后，另一个代理会根据这些意见进行修改。这个反馈闭环大多是自动化的。

但它并不是每次都能完美运作。有些 PR 就是错的。AI 会很自信地实现一些“看起来没问题”的东西，但实际并不符合 Next.js 的真实行为。我不得不经常纠偏。架构决策、优先级取舍、判断 AI 什么时候走进死胡同：这些都得我来做。当你给 AI 明确的方向、充足的上下文，以及可靠的护栏时，它确实能非常高效。但人类仍然需要掌舵。

在浏览器级别的测试方面，我使用了 [agent-browser](https://github.com/vercel-labs/agent-browser) 来验证真实的渲染输出、客户端侧导航，以及 hydration（注水）行为。单元测试会漏掉很多细微的浏览器问题，而这个工具能把它们抓出来。

在整个项目期间，我们在 OpenCode 里跑了超过 800 次会话。总成本：大约 $1,100 的 Claude API token 费用。

## 这对软件意味着什么

为什么我们的技术栈里会有这么多层？这个项目迫使我深入思考这个问题，并且去考虑 AI 会如何影响答案。

软件中的大多数抽象之所以存在，是因为人类需要帮助。我们无法把整个系统都装在脑子里，于是就构建出一层层的结构来替我们管理复杂度。每一层都会让下一位接手者的工作更容易。于是你就会得到“框架上套框架”、各种封装库，以及成千上万行的胶水代码。

AI 没有同样的限制。它可以把整个系统都放在上下文里，并直接把代码写出来。它不需要一个中间框架来保持组织性。它只需要一份规范（spec）和一个用来构建的基础（foundation）。

目前还不清楚哪些抽象才是真正的基础设施，哪些只是为了弥补人类认知而使用的拐杖。未来几年，这条分界线会发生很大变化。而 vinext 就是一个数据点：我们给了它一份 API 合约、一个构建工具、以及一个 AI 模型，然后 AI 把中间所有东西都写出来了。不需要任何中间框架。我们认为，这种模式会在很多软件里反复出现。我们这些年堆起来的层级，并不都会留下来。

## 致谢

感谢 Vite 团队。[Vite](https://vite.dev/) 是整个项目赖以建立的基础。[`@vitejs/plugin-rsc`](https://github.com/vitejs/vite-plugin-rsc) 仍处于早期阶段，但它让我无需从零构建就能获得 RSC 支持——否则这个项目就无法推进。当我把该插件推到它以前从未被测试过的使用场景时，Vite 的维护者们反应迅速、并且非常乐于提供帮助。

我们也要感谢 [Next.js](https://nextjs.org/) 团队。他们花了多年打造一个框架，把 React 开发的上限抬到了新的高度。他们的 API 面向如此完善的文档，以及如此全面的测试套件，是这个项目得以成立的重要原因。没有他们设定的标准，就不会有 vinext。

## 试用

vinext 内置了一个 [Agent Skill](https://agentskills.io/)，可以帮你处理迁移工作。它支持 Claude Code、OpenCode、Cursor、Codex，以及几十种其他 AI 编码工具。安装它，打开你的 Next.js 项目，然后告诉 AI 开始迁移：

````
`npx skills add cloudflare/vinext
```
`
````

然后在任何受支持的工具中打开你的 Next.js 项目，并输入：

````
`migrate this project to vinext
```
`
````

这个 skill 会负责兼容性检查、依赖安装、配置生成，以及启动开发服务器。它知道 vinext 支持什么，并会标记出任何需要手动处理的部分。

或者，如果你更喜欢手动操作：

```bash
npx vinext init    # 迁移现有的 Next.js 项目
npx vinext dev     # 启动开发服务器
npx vinext deploy  # 发布到 Cloudflare Workers
```

源码在 [github.com/cloudflare/vinext](https://github.com/cloudflare/vinext)。欢迎提交 issue、PR，以及各种反馈。

Cloudflare 的 Connectivity Cloud 可以保护[整个企业网络](https://www.cloudflare.com/network-services/)，帮助客户高效构建[互联网规模的应用](https://workers.cloudflare.com/)，加速任何[网站或互联网应用](https://www.cloudflare.com/performance/accelerate-internet-applications/)，[抵御 DDoS 攻击](https://www.cloudflare.com/ddos/)，让[黑客无从下手](https://www.cloudflare.com/application-security/)，并且还能在你迈向 [Zero Trust](https://www.cloudflare.com/products/zero-trust/) 的旅程中提供帮助。

从任意设备访问 [1.1.1.1](https://one.one.one.one/) 即可开始使用我们的免费应用，让你的互联网更快、更安全。

想了解更多关于我们“帮助构建更好互联网”的使命，请从[这里开始](https://www.cloudflare.com/learning/what-is-cloudflare/)。如果你正在寻找新的职业方向，可以看看[我们的开放职位](https://www.cloudflare.com/careers)。server-island-start [AI](https://blog.cloudflare.com/tag/ai/)[Cloudflare Workers](https://blog.cloudflare.com/tag/workers/)[Workers AI](https://blog.cloudflare.com/tag/workers-ai/)[Developers](https://blog.cloudflare.com/tag/developers/)[Developer Platform](https://blog.cloudflare.com/tag/developer-platform/)[JavaScript](https://blog.cloudflare.com/tag/javascript/)[Open Source](https://blog.cloudflare.com/tag/open-source/)[Performance](https://blog.cloudflare.com/tag/performance/)