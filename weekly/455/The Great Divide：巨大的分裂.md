原文：The Great Divide  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## The Great Divide（巨大的分裂）

两位前端开发者坐在酒吧里。他们无话可聊。

2019 年 1 月 — Chris Coyier

*假设前端开发领域正在发生一种分裂。* 我能感觉到，而且不只是“凭直觉”。根据大量开发者在文字里的情绪表达、我和 Dave Rupert 在 [ShopTalk](https://shoptalkshow.com/) 上做过的访谈，以及线下讨论来看——用他们的话说……这事儿确实*存在*。

这种分裂发生在这样一群人之间：他们自我认同为（或岗位名称就是）前端开发者，但技能组合却大相径庭。

**一边**是一支开发者大军：他们的兴趣、职责与技能集高度围绕 JavaScript 展开。

**另一边**也是一支开发者大军：他们的兴趣、职责与技能集则聚焦在前端的其他领域，比如 HTML、CSS、设计、交互、模式、无障碍等。

来听听那些正在感受到这种分裂的人怎么说。

![](https://i0.wp.com/css-tricks.com/wp-content/uploads/2018/12/different-paths.png?ssl=1)

在我们发布的文章 *[“What makes a good front-end developer?”（什么样的前端开发者才算优秀？）](https://css-tricks.com/what-makes-a-good-front-end-developer/)* 下，Steven Davis [写道](https://css-tricks.com/what-makes-a-good-front-end-developer/#comment-1652648)：

我觉得我们应该**摆脱这个术语**。我们应该拆分成 UX 工程师（UX Engineers）和 JavaScript 工程师（JavaScript Engineers）。这是两种不同的思维方式。大多数人不可能同时在 JavaScript 和 CSS 上都非常厉害。让 UX 工程师与 UX/设计紧密合作，做出优秀的设计、交互、原型等；让 JavaScript 工程师处理所有数据相关的部分。

**我受够了自己 CSS 很强却被迫去写 JavaScript。我不是程序员！**

这道裂痕并不是在我们脚下“自然形成”的。是我们主动在促成它。

我第一次听到有人把它称作“身份危机（identity crisis）”，是在 Vernon Joyce 的文章 *[“Is front-end development having an identity crisis?”（前端开发是否正在经历身份危机？）](https://dev.to/assaultoustudios/is-front-end-development-having-an-identitycrisis-2224)* 里。他把矛头指向了主要的 JavaScript 框架：

像 Angular 这样的框架，或像 React 这样的库，要求开发者对编程概念有更深入的理解；这些概念在历史上可能只与后端相关。MVC、函数式编程、高阶函数、提升（hoisting）……**如果你的背景是 HTML、CSS 和基础的交互 JavaScript，这些都很难掌握。**

这点对我来说很有共鸣。我喜欢使用并阅读现代框架、花哨的构建工具、以及有意思的数据层策略相关的内容。现在我用得很开心的是：把 React 当 UI 库、用 Apollo GraphQL 做数据层、用 Cypress 做集成测试、用 webpack 做构建工具。我也一直在关注 CSS-in-JS 的各类库。不过，尽管我认为这些确实属于前端开发的一部分，但它们和那些围绕无障碍、语义化标记、CSS 的可能性、UX 考量、UI 打磨等文章与讨论相比，仿佛隔着宇宙那么远。感觉像是两个不同的世界。

当公司发布“前端开发（Front-End Developer）”的岗位时，他们到底在招什么？假设他们真的知道自己要什么（lol），仅仅“前端开发者”这个标题已经不够了。更有帮助的，可能是弄清楚他们更需要这道分裂两边的哪一边。

![](https://i0.wp.com/css-tricks.com/wp-content/uploads/2019/01/jobbs.png?ssl=1)

谁能拿到这份工作？谁才适合这份工作？这些技能组合的薪资等级是一样的吗？

我希望解决方案是：写出更具描述性的招聘信息。如果要整个行业都明确并统一定义岗位名称，这个要求太高了（而且我担心确实如此），那我们至少还能在文字上写清楚。Corey Ginnivan [说得很好](https://twitter.com/CoreyGinnivan/status/1082455681037262849)：

我希望更多的岗位描述能**更坦诚**、更开放——让大家知道你想达成什么目标，明确他们将会做哪些工作，同时也把它作为双方共同成长的机会。

![](https://i0.wp.com/css-tricks.com/wp-content/uploads/2019/01/hiring.png?ssl=1)

在 CodePen，我们这么做效果还挺好。我们团队的 Cassidy Williams 说，当 Rachel Smith 把这份说明发给她让她考虑时，她非常欣赏这种写法。

“前端开发者”依然是个有用的术语。就像 Mina Markham 最近在节目里 [跟我们描述的那样](https://shoptalkshow.com/episodes/332-how-to-think-like-a-front-end-developer-with-mina-markham/)：它指的是那些主要与浏览器、以及使用浏览器的人打交道的从业者。但 Miriam Suzanne 也说，这是个泛化的简称：

当前端开发者的细节不重要时，它就是一种简写。就像你在一个独立摇滚乐队里——谁知道那到底意味着什么，但我总这么说。简写很好用，直到你要发布一份岗位描述。细节一旦重要起来，我们其实已经有更精确的说法——只是需要把它们用起来。

为了把这种*分裂*说得更具体一点，可以看看 Trey Huffine 的这篇文章：*[“A Recap of Frontend Development in 2018”（2018 年前端开发回顾）](https://levelup.gitconnected.com/a-recap-of-frontend-development-in-2018-715724c9441d)*[。](https://levelup.gitconnected.com/a-recap-of-frontend-development-in-2018-715724c9441d) 这篇写得非常好！它指出了这一年的重要时刻，展示了有趣的数据，并对明年可能出现的情况做了预测。但它的内容完全围绕 JavaScript 生态展开。提到 HTML，只是在讨论由 JavaScript 驱动的静态站点生成器时；提到 CSS，也只是在讨论 CSS-in-JS 时。它当然是在谈前端开发，但或许只是一半：JavaScript 的那一半。如果你读完那份总结，发现里面大多数内容都与你无关，那么我的建议会是：

*没关系。* 你仍然可以成为一名前端开发者。🙏

你可能正在探索布局的各种可能性、搭建 CSS 或设计系统、深入研究 UX、制作有趣的动画、钻研无障碍访问，或者从事其他各种坚定属于前端开发的工作。能做的事情多得很。

还记得就在去年，Frank Chimero（他为自己和客户制作了非常棒的网站）对前端开发变成什么样感到[完全困惑](https://frankchimero.com/writing/everything-easy-is-hard-again/)吗？总结一下：

……别人的工具链从外部看完全像天书。连入门都很棘手。上个月，我为了安装一个包管理器，不得不先安装另一个包管理器。那一刻我合上电脑，慢慢地把它推远了。我们离我起步时的 CSS Zen Garden 已经很远很远了。

确实远得很。我甚至可以说：你并不*必须*在意这些。如果你一直以来、并且仍然能用你熟悉的方式为自己和客户成功地构建网站，*谢天谢地！* 那就把这些新的工具链玩意儿完全当作一种“自愿选择”的方案：它解决的是与你不同的问题。

然而，这种工具链的不透明性，甚至也会刺痛那些不得不深陷其中的人。Dave Rupert 记录了一个真实的 bug，它的解决方案深藏得离谱，能被挖出来简直是个奇迹。随后他又[感叹](https://daverupert.com/2019/01/angular-autoprefixer-ie11-and-css-grid-walk-into-a-bar/)道：

随着工具链不断增长、变得越来越复杂，除非你对它们非常熟悉，否则很难弄清楚我们的代码到底经历了哪些转换。追踪输入与输出之间的差异，以及代码在此过程中经历的处理步骤，会让人不堪重负。

谁需要这些庞大的工具链？通常是那些*大型*网站。*大型*到底是什么意思有点难界定，但我猜你心里大概有数。讽刺的是，尽管一堆工具会*增加复杂度*，它们之所以被使用，却是为了*对抗复杂度*。有时候这感觉就像为了处理森林里的蛇，放了几只美洲狮进去。结果现在你又多了个美洲狮问题。

关于这一切最显眼的讨论，往往被那些在开发这些大型复杂网站的公司里工作的人所主导。Bastian Allgeier 曾[写道](https://twitter.com/bastianallgeier/status/1073529690097356800)：

大团队需要“x”，所以“x”就是适用于所有人的最佳方案。我认为这对规模更小、需求不同、对“可维护性”或“可持续性”的定义也不同的团队来说，非常有毒。我会和来自世界各地的小型代理公司与自由职业者保持联系，很有意思的是：他们的工作常常与 Web 圈那套 VIP 马戏团完全脱节。

这到底怎么回事？发生了什么？这种分裂从何而来？在我看来答案很清楚：

![](https://i0.wp.com/css-tricks.com/wp-content/uploads/2019/01/javascript-got-big.png?resize=506%2C240&#038;ssl=1)

它变得如此庞大：

- 它在网站前端无处不在。主流 JavaScript 前端框架正在爆炸式增长，并在招聘信息中占据主导地位。大量团队用这些框架驱动大量网站。原生 JavaScript 也在快速演进，这让很多人兴奋不已。
- 它也驱动后端。你的网站可能由 Node.js 服务器驱动或参与其中。你的构建流程很可能也是由 JavaScript 驱动的。
- 第三方 JavaScript 为无数前端功能提供动力，从网站的广告网络和分析工具，到评论、点评、相关推荐内容等完整功能。
- 诸如 Node 驱动的云函数、存储与认证等概念，再加上低成本、低投入且可扩展的托管方案，让以 JavaScript 为核心的前端开发者获得了极其强大的能力。他们可以只用自己的技能就交付完整可用的产品。

如今，拥有扎实 JavaScript 技能的前端开发者被赋予了极强的能力。我一直把它称作**全能型前端开发者**，并且专门为此做过一次完整演讲：

在围绕 [serverless](https://thepowerofserverless.info/) 的各种可能性，与预封装的 UI 框架结合所形成的思路中，一名前端开发者几乎不用——或者只需要极少——其他领域的帮助，就能构建几乎任何东西。我觉得这既令人兴奋、也很有吸引力，但同样值得停下来想一想。很有可能的是：沿着这条路走下去，你会变得过度框架驱动，以至于更广泛的问题解决能力受到影响。我从 Estelle Weyl 那里听到过类似观点——她甚至直言，她更愿意把开发者看作“框架实现者（framework implementers）”，并把“工程师（engineer）”这个称号留给那些不依赖特定工具、能工具无关地解决问题的人。

这种前端能力的增强是真实存在的。尤其在过去几年里，前端开发者变得格外强大。强大到 [Michael Scharnagl 说](https://justmarkup.com/log/2018/11/just-markup/)他看到一些公司把招聘方向都往这边倾斜：

我看到的是：如今很多开发者完全专注于 JavaScript，而且我也看到一些公司**用 JavaScript 开发者替代后端开发者。**

有些人不明白的是：JavaScript 开发者并不必然就是前端开发者。JavaScript 开发者可能不喜欢写 CSS，也不关心语义化。就像我同样更倾向于不直接和数据库打交道、也不喜欢去配置服务器一样。这没问题。问题在于：如果你不想用某个东西，同时又告诉别人他们做的事很简单或毫无用处，那就不对了。更糟糕的是：你试图对某个领域的专家说他们全都做错了，应该按你的方式来做。

而 Jay Freestone 也[尝试解释原因](https://www.browserlondon.com/blog/2019/01/02/front-end-2019-predictions/)：

在过去几年里，我们开始看到前端开发者这一角色发生了显著转变。
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 前端开发者角色的转变

在过去几年里，我们开始看到前端开发者这一角色发生了显著转变。随着应用变得越来越“JavaScript 重”，前端工程师也就必须理解并实践一些传统上属于后端开发者领域的架构原则，比如 API 设计和数据建模。

即便是在我自己规模不大的工作里，也发生了这样的变化。我们当时在 CodePen 想找一位后端 Go 开发者，来帮助推进我们的 Web 服务演进。当我们没能顺利找到那个“完美人选”时，我们决定换一条路走。我们发现，我们的技术栈正在演变成一种对以 JavaScript 为中心的前端开发者极其友好的形态，以至于我们几乎可以马上让更多这类人投入工作。所以我们就这么做了。

这件事也可能带有某种周期性。我们看到编程学校/训练营迅速爆发，在不到一年的时间里就能培养出相当有天赋的开发者。这些训练营毕业生正在填补劳动力缺口，但更重要的是，正如 Brad Westfall 跟我说的那样，他们开始*引领*行业讨论，而不是被动跟随。别搞错：这些学校培养出来的开发者，站在“分界线”的 JavaScript 这一侧。我见过的每一份训练营 Web 开发课程，都把 HTML/CSS/UI/UX/A11Y 这些主题当作入门基础：要么学生很快就“过一遍”，要么作为补充点缀在一旁，而后续课程则由 JavaScript 彻底主导。*“你能来用三个小时把所有布局概念教给我们的学生吗？”*

当 JavaScript 主导了关于前端的讨论时，就会让一些开发者感到自己“不够格”。在 Robin Rendle 的文章 *[“Front-end development is not a problem to be solved,”](https://css-tricks.com/front-end-development-is-not-a-problem-to-be-solved/#comment-1653457)* 的一条评论里，Nils [写道](https://css-tricks.com/front-end-development-is-not-a-problem-to-be-solved/#comment-1653457)：

**也许“前端开发者”这个术语需要重新想一想。** 我刚开始工作时，前端大多是 HTML、CSS，再加上一点 JavaScript。一个好的前端开发者需要能够把 Photoshop 的设计稿转换成像素级还原的网站。如今的前端要复杂得多得多。如果你想学前端开发，人们似乎会从学习 git、npm、angular、react、vue 等等开始，而这些全都被叫做前端开发。

我是一名设计师，我觉得自己在 HTML 和 CSS 上挺不错，**但这已经不够让你成为一名前端开发者了**。

Robin 自己甚至给自己起了这么一个头衔：**一个太在意无障碍、CSS 和组件设计的“成年男孩”，但对 GraphQL、Rails 或 Redux 完全不关心，可我又会因为不关心这些东西而感到很糟糕**。

它在其他方面也会让人沮丧。还记得 Lara Schenck 那篇关于她去面试的[故事](https://css-tricks.com/tales-of-a-non-unicorn-a-story-about-the-trouble-with-job-titles-and-descriptions/)吗？她满足了招聘列表里 90% 的要求，但面试内容却是 JavaScript 算法。最终她就因为这个没拿到 offer。并不是每个人都需要拿下每一次面试的工作，但这里的问题在于，*front-end developer（前端开发者）* 这个头衔并没有作为一个有效的岗位名称，把它需要表达的东西传达清楚。

有些日子里，这感觉就像活在一个平行宇宙。

![](https://i0.wp.com/css-tricks.com/wp-content/uploads/2019/01/alternate-universe.png?ssl=1)

两个“前端 Web 开发者”可以肩并肩站在一起，却几乎没有任何共同的技能组合。对我来说，这对于一个如此具体、又如此普遍的岗位名称而言，简直离谱。我敢肯定，像 *designer（设计师）* 这种头衔可能早就存在类似情况，但 *front-end web developer（前端 Web 开发者）* 本来就是“细分领域里的细分领域”。

我很敬佩 [Jina Anne](https://www.sushiandrobots.com/)——她是一位前端开发者兼设计师。然而，在几年前我和她一起参加的一场[圆桌讨论](https://alistapart.com/event/front-end-dev)中，她承认自己并不把这个称呼用在自己身上：

我在 Apple 的时候，刚进去时的职位名称是前端开发者。现在我会这么称呼自己吗？不会，因为它已经变成完全不同的东西了。比如，我学了 HTML/CSS，我从来没系统学过 JavaScript，但我懂得足够多，能绕过去把活干了。现在——我们在聊职位名称——当我听到“前端开发者”的时候，我会默认你比我懂得多得多。

看起来，在当时，缺少对 JavaScript 的侧重，让 Jina 觉得自己比那些拥有“前端开发者”正式头衔的人更“不够格”。我认为，如果有人能拥有 Jina 左手小拇指里的那些技能都算走运了，但这只是我的看法。最近和 Jina 聊起这件事时，她说自己至今仍会刻意避开这个头衔，因为它会让人对她的技能组合产生错误假设。

在文章 *“[Is there any value in people who cannot write JavaScript?](https://medium.com/@mandy.michael/is-there-any-value-in-people-who-cannot-write-javascript-d0a66b16de06)”* 里，Mandy Michael 把这个问题讲得比任何人都更到位：

我不明白的是，为什么你“只会写 JS”也没关系，但如果你“只会写 HTML 和 CSS”，就好像不够好一样。

当互联网上每一个新网站都有完美、语义化、可访问的 HTML，以及执行得异常出色、同样可访问、并且在所有设备和浏览器上都能正常工作的 CSS 时，你再来告诉我这些语言本身没有价值。在那之前，我们需要停止贬低 CSS 和 HTML。

Mandy 用她的文章来“劝和”。她在告诉我们：是的，确实存在分裂，但不，任何一方都不比另一方更有价值。

另一种令人沮丧的情况是：**这种巨大的分野会导致糟糕的工匠精神**。在我看来，这正是跨阵营互相嘲讽、挖苦的大多数原因。Brad Frost 曾[指出“全栈开发者”这个术语](http://bradfrost.com/blog/post/full-stack-developers/)多少有些误导性：

在我的经验里，“全栈开发者”总会被翻译成“因为不得不做，而且前端很‘简单’，所以也能写前端代码的程序员”。**从来不会反过来。**“全栈开发者”这个词暗示开发者在前端代码和后端代码上同样熟练，但以我个人经验，我从未见过真正符合这种描述的人。

Heydon Pickering 也[表达了类似的观点](http://www.heydonworks.com/article/reluctant-gatekeeping-the-problem-with-full-stack)。当你以这种神话般的高阶水平被雇来时，[像 HTML 这样的东西很可能并不是你的强项](https://www.brucelawson.co.uk/2018/the-practical-value-of-semantic-html/)。

……把全栈开发者当作所有代码相关事务的把关人，其中最刺眼的问题之一就是：产出的 HTML 质量惨不忍睹。多数人来自计算机科学背景，而文档结构并不会像控制结构那样被一并教授。**这不是他们的能力所长，但我们仍然把它当作他们的工作。**

就像配置部署流水线、处理数据库扩容可能并不是我的工作（如果这任务落到我头上，我会做得一塌糊涂），也许最好把 HTML 和 CSS 的工作交给真正擅长它的人。或许更容易这样说：**即便确实存在分野，也不代表我们任何人就可以因此不把工作做好。**

正如架构与开发者体验（developer ergonomics）是我们共同的工作一样，我们也应该把性能、可访问性（accessibility）和用户体验纳入我们的职责范围。如果我们在其中某个具体部分做不好，那就要确保有别人*能够*把那部分做好。任何人都不允许把工作做差。

值得一提的是，确实有很多开发者的技能栈能够跨越这道分野，而且做得很优雅。我会想到我们自己的 Sarah Drasner：她以出色的动画能力、SVG 专长而闻名，是 Vue 核心团队成员，同时也在微软 Azure 团队工作。的确是全栈。

我在最近一次于 WordCamp US 的会议演讲中，对其中许多话题做了更深入的展开：

对于工匠精神受损、技能被贬值这些问题，有解决方案吗？这些问题是系统性的、根深蒂固的，还是只停留在表面、并不会造成严重后果？这道分野是真实存在的，还是暂时性的裂缝？这种摩擦是在缓和还是在加剧？随着时间推移，前端开发者的技能范围会变宽还是变窄？让我们继续讨论下去！

即便 JavaScript 持续升温，Rachel Andrew 告诉我，以前 CSS 工作坊很难招满人，但如今大会组织者反而在主动邀约，因为需求非常旺盛。有一点可以确定：正如古老的赫拉克利特所说，*唯一不变的，就是变化。*

&#x270c;&#xfe0f;