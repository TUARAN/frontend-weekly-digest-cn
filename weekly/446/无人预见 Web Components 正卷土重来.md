无人预见 Web Components 正卷土重来

> 原文：[Web Components Are the Comeback Nobody Saw Coming](https://thenewstack.io/web-components-are-the-comeback-nobody-saw-coming/)  
> 作者：Alexander T. Williams  
> 日期：2025年12月23日  
> 翻译：田八  

多年来，[`Web Components`一直是网页开发世界里默默无闻的天才](https://thenewstack.io/the-pros-and-cons-of-web-components-via-lit-and-shoelace/)——技术精湛、广泛支持，却几乎被完全忽视。

大家都忙着追逐时下流行的框架，一层又一层地堆叠抽象概念，把每个按钮都变成一个导入半个互联网的`React`组件。

如今，随着人们对[臃肿的代码包和工具链混乱](https://thenewstack.io/why-react-is-no-longer-the-undisputed-champion-of-javascript/)的疲惫感逐渐显现，开发者们开始重新发现简洁的力量。突然之间，那些曾经看似老套的原生浏览器API又重新焕发出未来的光彩。

# 为什么 `Web Components` 第一次未能流行起来

`Web Components`首次出现时，理念虽好，但时机不对。当时开发者们已经深陷于`AngularJS`、`Backbone`等众多框架之中，这些框架号称能拯救他们脱离混乱的代码。

使用自定义元素、[Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM) 和 HTML模板等原生API的想法看似优雅，但生态系统尚未成熟。早期采用者往往需要依赖[专用主机](https://www.atlantic.net/dedicated-server-hosting/dedicated-hosts/)来管理复杂的`polyfill`（填充补丁）和依赖项，这进一步阻碍了其普及。

> 曾经拥抱复杂性的开发者们，现在却开始质疑复杂性了。

再加上框架的文化影响力，`Web Components`的推广可谓举步维艰。团队想要的是工具、生态系统和清晰的模式，而不是一个基础的API。框架则提供了全套解决方案：状态管理、路由和社区插件。相比之下，`Web Components`更像是一个DIY工具包。它们速度快、原生支持，但缺乏开发者所期望的完善度。

然而，如今风向正在转变。那些曾经热衷于复杂性的开发者如今开始质疑它。无尽的依赖所带来的性能损耗正促使团队[回归原生解决方案](https://thenewstack.io/introduction-to-web-components-and-how-to-start-using-them/)——而这正是`Web Components`的强项。

# 框架疲劳因素

[框架不会消失](https://thenewstack.io/javascript-framework-reality-check-whats-actually-working/)，但人们对它们的热情正在消退。每一代框架都承诺构建更轻量、渲染更快速的应用，但最终却往往积累起同样的冗余。

`Webpack`配置膨胀，转译器层出不穷，突然间，你一半的开发环境只是为了服务一个简单的用户界面。开发者们开始意识到，这些开销中的很多问题，浏览器已经原生解决了。

`Web Components`则避开了这一切麻烦。它们不需要`React`、`Vue`或`Svelte`来处理生命周期钩子或封装。浏览器已经内置了这些功能。`Shadow DOM`无需[CSS-in-JS](https://stackoverflow.com/questions/77166476/shadow-dom-style-isolation)库就能隔离样式。自定义元素无需虚拟DOM差异处理就能实现响应式。结果就是代码更精简、速度更快、可移植性更强——而且能在任何运行`JavaScript`的地方工作。

> 热门话题  
> 1. [2025年前端AI的颠覆性转变](https://thenewstack.io/2025s-radical-frontend-ai-shift/)  
> 2. [`Web Components`：一场无人预料的回归](https://thenewstack.io/web-components-are-the-comeback-nobody-saw-coming/)  
> 3. [Inferno老将打造专为AI设计的前端框架](https://thenewstack.io/inferno-vet-creates-frontend-framework-built-with-ai-in-mind/)  
> 4. [使用Hashbrown框架在浏览器中运行AI代理](https://thenewstack.io/run-ai-agents-in-the-browser-with-the-hashbrown-framework/)  
> 5. [CSS-in-JS：前端理性的巨大背叛](https://thenewstack.io/css-in-js-the-great-betrayal-of-frontend-sanity/)  

这并非是对简单时代的怀旧，而是出于实用主义的考虑。潮流正从过度抽象回归到实用可维护性。开发者们希望构建一次，就能在任何地方部署，而不是把半天时间都浪费在调试构建流程上。

# 互操作性：无声的杀手级特性

`Web Components`相对于框架的最大优势之一在于，它们不关心你身处哪个生态系统。`Web Components`在`React`应用、`Vue`应用或没有任何框架的环境中都能[以相同的方式工作](https://gomakethings.com/will-web-components-replace-react-and-vue/)。在当今碎片化的前端领域，这种中立性是一种超能力，因为团队经常需要在不同产品间切换多种技术栈。

想象一下，构建一个自定义日期选择器或图表，然后无需修改就能将其嵌入到五个不同的代码库中。这并非理论上的可能，而是使用`Web Components`的实际现实。它们不仅连接了框架，还超越了它们。这种互操作性也与向微前端的转变完美契合，在微前端中，大型应用被分解为可独立部署的单元。

> 不再需要在不同技术栈中重新实现相同的用户界面，也不必等待框架兼容层成熟。

对企业而言，这意味着可观的成本节约。不再需要在不同技术栈中重新实现相同的用户界面，也不必等待框架兼容层成熟。对于开发者来说，这意味着自主性和灵活性——这在现代前端开发中是难得的组合。

# 浏览器终于跟上了步伐

`Web Components`首次出现时，浏览器支持情况参差不齐。开发者不得不依赖缓慢且脆弱的`polyfill`。如今，所有主流浏览器都原生支持它们——而且不仅仅是部分支持。这些API稳定、标准化且针对性能进行了优化。时机再好不过了。

与此同时，`Web API`本身也在不断进化。现代`JavaScript`提供了模块、模板字面量和异步模式，与自定义元素完美搭配。曾经让开发者望而却步的痛点——如样式、依赖管理和状态共享——如今都能用原生工具轻松解决。甚至打包工具也已成熟，能够优雅地处理自定义元素。

这种成熟改变了一切。`Web Components`不再是实验性的。它们已准备好投入生产，像 `Lit` 和 `Stencil` 这样成熟的生态系统能够完善组件，同时保持轻量级。最终实现了框架很少能达到的控制性和便捷性之间的平衡。

# 设计系统和原生用户界面的兴起

推动`Web Components`重新兴起的另一股静默力量是设计系统的爆炸式增长。企业已经意识到，跨产品的一致性并非可选，而是品牌建设的必要条件。`Web Components`非常适合这一使命。它们提供了封装性、可重用性和框架独立性——设计系统扩展到团队和平台所需的一切。

像[Salesforce](https://developer.salesforce.com/developer-centers/lightning-web-components)（使用`Lightning Web Components`）和微软（使用[Fluent UI](https://github.com/microsoft/fluentui)）这样的大公司已经押注于这一模式。甚至初创公司也在采用`Web Components`构建内部库，因为它们简化了使用不同技术栈的开发者之间的协作。一个`React`开发者、一个`Angular`团队和一个由`CMS`驱动的营销网站都能轻松地使用同一个按钮组件。

> `Web Components`作为原生技术，不受框架更迭的影响。

这不仅仅关乎一致性；还关乎长久性。基于框架构建的设计系统，[其生命周期与依赖项息息相关](https://arxiv.org/pdf/2509.06085)。而`Web Components`作为原生组件，不受框架更迭的影响。它们能够随着Web的演进而优雅地老化。

# 开发者体验：下一个前沿领域

尽管`Web Components`具有诸多优势，但仍面临认知挑战。它们通常被视为需要更多样板代码且开发者舒适度较低的低级工具。但这种情况正在迅速改变。像`Lit`这样的库使得定义组件[几乎与编写`React`钩子一样方便](https://dev.to/reggi/framework-interoperable-component-libraries-using-lit-web-components-43ac)。开发者工具、热重载和·支持正在逐月改进。

开发者体验差距正在缩小，在某些情况下甚至正在逆转。使用`Vite`和`Web Components`设置项目可能只需几分钟，而不是几小时。无需状态管理库或`CSS`模块——一切都能通过原生API正常工作。

# 结论

每隔几年，前端世界就会重新发现一些旧事物，并宣称其为新潮流。但这次，`Web Components`并非昙花一现——它们是一场清算。开发者们正在重新审视复杂性的代价，并意识到网页的原生能力对于大多数现代应用来说已经足够。

框架仍将在大规模应用和快速原型开发中占有一席之地。然而，基准线正在发生变化。随着性能预算的收紧和架构债务越来越难以合理化，`Web Components`的精简、通用特性感觉越来越正确。

网页不需要另一场革命——它只需要重拾已有的知识。`Web Components`证明了我们一直期待的复兴之路其实早已蕴藏在浏览器中。