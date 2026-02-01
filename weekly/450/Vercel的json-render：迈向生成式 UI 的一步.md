# Vercel 的 json-render：迈向生成式 UI 的一步

> 原文： [Vercel’s json-render: A step toward generative UI](https://thenewstack.io/vercels-json-render-a-step-toward-generative-ui/)
>
> 翻译： [樱吹雪](https://juejin.cn/user/1179091901098269)

> 一个新的开源工具让 AI 生成的 UI 更近了一步。Vercel CEO Guillermo Rauch 告诉前端开发者该如何准备。

Vercel 最近发布了一款名为 [json-render](https://json-render.dev/) 的新开源工具，这标志着向生成式用户界面迈出了一步——这是 Vercel 为 AI 生成的 Web 界面创造的术语。

“如果大语言模型不仅仅是生成文本，而是能即时为我们提供 UI 会怎样？”Vercel 创始人兼 CEO [Guillermo Rauch](https://www.linkedin.com/in/rauchg/) 向 *《The New Stack》* 提出了这个问题。“我们基本上是将 AI 直接接入了渲染层。”

他表示，AI 和基础设施很快将能够支持[生成式 UI](https://thenewstack.io/a-guide-to-generative-ai-for-devops-team-managers/)。json-render 正是这块拼图中的一部分。

开发者可以使用 json-render 来定义 AI 的“护栏”，例如 AI 可以使用哪些组件、动作和数据绑定。然后，最终用户可以通过 AI 提示词用自然语言描述他们想要的内容。随后，AI 会生成 JSON，并随着模型的响应进行渐进式渲染。

Rauch 称其为一项“极具颠覆性的技术”，因为它绕过了生产软件的传统步骤。该工具已作为 Vercel Labs的一部分进行部署。虽然它被认为是一个早期的研究原型，但 Rauch 表示这项技术已经“非常稳健”。

Rauch 提到，有一位开发者甚至能够在本地部署的低参数开源模型 Quinn 上运行 json-render。

“如果你从这里开始推演，你可以想象这样一个世界：当你打开一个网站，UI 会使用 json-render 自发地为你生成，”他说。请把它看作是一种基础设施。

“它使任何公司都能利用 AI 并将其转化为 UI，并且可以插入到系统中，”他说。“再次强调，目前它还是实验性的，但如果你想将这种生成式 UI 能力嵌入到系统中，你会使用 json-render。”

## json-render 的幕后机制

据 Rauch 介绍，json-render 是一个酝酿了数十年的工具。他将此归功于 Vercel 软件工程师 [Chris Tate](https://www.linkedin.com/in/ctatedev/) 的工作，并补充说，json-render 涉及了对生成式 UI 挑战长达 10 年的思考，甚至早于 LLM 的出现。

json-render 拥有一套既定的预定义组件，给予 AI 组合的自由。

“我们不希望 AI 过于‘有创意’，以至于改变你的品牌准则，或者在某些看起来不美观的地方改变你的配色系统，”Rauch 说。“工程师的工作将是策划系统的品牌标识、外观和感觉，以便进行渲染。”

他补充说，它甚至可以用于按需构建游戏 UI。它是模型无关和框架无关的，因此它可以与你选择的任何 JavaScript 框架配合使用。

Rauch 设想了一个网络环境，用户访问他们最喜欢的电子商务网站，网站会自动提醒用户过去的订单，更新发货信息，或提供定制的产品推荐。

“它基本上自动化了程序员——甚至是 AI 辅助的程序员——创建这些 UI 规则的工作。它只是在数学层面完成了这一切，”他说。

## 前端开发者该如何准备？

Rauch 认为技术已经“非常接近”实现生成式 UI——他预测我们今年就会看到生成式 UI 的雏形——所以我问他，这将把前端开发者置于何地？

Rauch 对前端开发者提出了一个警告：**专注于发布智能体。**

“这对企业和开发者等来说可能是一个警报：如果你不开始发布智能体，你可能会错失明天的互联网，”他说。“你可能会被淘汰。你可能无法接入新的协议。”

他指出了 [Google](https://cloud.google.com/?utm_content=inline+mention) 最近发布的 UCP（一种电子商务协议），作为开发者需要“接入”的协议示例之一。

> “我仍然鼓励人们学习使用 JavaScript。但我的建议是，瞄准明天的互联网。尝试部署一个智能体。弄清楚这些模型是如何工作的。尝试用 json-render 进行实验。”
>
> —— **Guillermo Rauch，Vercel CEO 兼联合创始人**

虽然可能不再需要开发者来构建具体的 UI，但他们在定义智能体行为方面仍有一席之地。Shopify CEO [Tobias Lütke](https://ca.linkedin.com/in/tobiaslutke) 将此称为 [上下文工程](https://www.linkedin.com/posts/mattpaige_the-shopify-ceo-has-done-it-again-coining-activity-7341816822641377281-A6Fm/)。

“工程师们将退后一步，不再过多关注 UI 层，而是关注智能体的行为，确保它拥有正确的数据，确保它拥有正确的上下文，设置评估标准，”Rauch 说。“也许行业的下一步将是退后一步，更多地关注那个引擎，而不是最后一公里的 UI。”

那么 JavaScript 呢？Rauch 指出，这种流行的语言在每一代大型软件变革中都存活了下来。他预测它也将在这场向生成式 UI 的转变中存活下来。

“当云和 Serverless 出现时，JavaScript 发挥了核心作用。当服务端渲染（SSR）出现，渲染回到服务器时，JavaScript 发挥了核心作用，”他说。“现在我们在 AI SDK 上也看到了这一点。今天创建智能体最简单的方法是 JavaScript。再一次。”

“我仍然鼓励人们学习使用 JavaScript。但我的建议是，瞄准明天的互联网。尝试部署一个智能体。弄清楚这些模型是如何工作的。尝试用 json-render 进行实验。”

## Vercel 的 AI 长期博弈

Vercel 在过去一年发布了许多 AI 工具，包括 AI Cloud、AI SDK 和 AI Gateway。我问 Rauch，这些零散的产品是否构成了一个总体战略。

> “Vercel 的第二章将由 Token 和智能体主导。我们称之为 AI Cloud。”
>
> —— **Guillermo Rauch**

“是的，当然，”Rauch 说。“Vercel 的第一章是由页面和像素主导的。我们称之为前端云（Frontend Cloud）。”

“Vercel 的第二章将由 Token 和智能体主导。我们称之为 AI Cloud。关于 AI Cloud，我实际上在[我的博客上写过](https://rauchg.com/2025/the-ai-cloud)，这个概念意味着你需要新的服务，你需要新的框架，你需要新的标准。”

Rauch 补充说，通过 AI SDK，Vercel 创建了大量的管道设施，允许将模型流式传输到 UI。

“需要提到的一件重要事情是，在过去的几年里，我们一直在投资基础设施，以便从‘一次性’（你去一个网站，一次性获取所有内容）转变为这种可以随时间推移进行‘流式传输’的理念，”他说。“这是一项赋能技术。”

他说，公司越来越多地看到 AI 智能体部署在其平台上或 [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox) 上，后者允许开发者在隔离的、临时的 Linux 虚拟机中运行任意代码。

“智能体需要一个我们可以完全信任它们的地方，”他解释道。“它们可能会犯错，所以我们需要围绕它们的行为创建一个沙盒。”

他补充说，这是 Vercel 从一开始就试图做的事情的延续，即在消除所有令人头疼的问题（如配置）的同时，让大众能够使用云服务。Rauch 称之为自动驾驶基础设施。

“如果你使用 [AWS](https://aws.amazon.com/?utm_content=inline+mention) 或 Google Cloud，就像开手动挡汽车，”他说。“Vercel 就像云端的 Waymo 或特斯拉——全自动驾驶。”
