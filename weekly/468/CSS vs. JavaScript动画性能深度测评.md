原文：[CSS vs. JavaScript: Exploring the performance implications of different animation strategies](https://www.joshwcomeau.com/animation/css-vs-javascript/)
链接：https://www.joshwcomeau.com/animation/css-vs-javascript/
翻译：TUARAN

---

# CSS vs. JavaScript：不同动画策略的性能影响深度测评

**作者：Josh W. Comeau | 2026年5月26日**

---

关于动画性能，最常见的问题之一是：基于 JS 的动画是否比基于 CSS 的动画更慢？我们是否应该始终努力使用 CSS 过渡，还是可以使用 JavaScript 动画库？

这个问题有着出人意料的细微差别，我认为传统观念并不完全正确。在这篇文章中，我们将深入探讨这个问题，亲眼看看其中的差异！

---

## 一、比较 CSS 关键帧与 JavaScript 循环

假设我们要构建一个弹跳动画，可以用 CSS 关键帧来实现：

```css
@keyframes bounce {
  to {
    transform: translateX(calc(var(--bounce-magnitude) * -1));
  }
}

.ball {
  --bounce-magnitude: 200px;
  animation: bounce 1000ms infinite alternate;
}
```

（这里使用 CSS `transform` 是因为它能产生最流畅的动画效果。如果容器尺寸是动态的，我们需要在 JS 中计算并应用 `--bounce-magnitude`。）

或者，我们也可以用 JavaScript 来实现这个动画！在考虑 GSAP 或 Motion 等 JS 库之前，先来看一个纯 JS 版本：

```javascript
const startTime = performance.now();

const ball = document.querySelector('.ball');

function animate() {
  const elapsedTime = performance.now() - startTime;

  // ✂️ 根据已经过去的时间计算 `x` 值。

  ball.style.transform = `translateX(${x}px)`;

  window.requestAnimationFrame(animate);
}
```

这段代码使用 `requestAnimationFrame` 在每一帧（大多数显示器上每秒 60 次）运行 `animate` 函数。计算 `x` 的主要逻辑被省略了，因为它有些复杂且与主题无关。

**那么问题来了：** 你认为哪种方式运行得更流畅？

对我们大多数人来说，直觉会告诉我们 CSS 版本性能更好。我们的直觉是对的，但原因可能并不是我们所想的那样。😅

你可能认为 JS 版本更慢，是因为它每帧都要做额外的计算工作，或者"跨越 JavaScript 与 DOM 之间的桥梁"有额外开销。但现代浏览器引擎可以轻松处理这些工作；即使在低端设备上，这些工作也只需要极短的时间，远不足以影响动画的帧率。

**但有一个显著的区别：** JavaScript 版本运行在**主线程**上，与应用中发生的*一切其他事情*共享资源。CSS 过渡和关键帧动画运行在**独立线程**上，因此不会受到 JavaScript 中发生的事情的干扰。

在现代 Web 应用中，主线程要做*大量*工作。React 等 JavaScript 框架不断地更新 DOM，以保持其与应用状态同步。每次发出 `fetch` 请求（例如加载更多数据或刷新现有数据）时，响应都必须由主线程解析。

所以，如果你曾经看到一个加载动画在 UI 更新前短暂冻结，这就是原因！**基于 JavaScript 的动画必须与应用的其他部分竞争处理能力。**

---

## 二、比较动画库

在上面的例子中，我使用了 `requestAnimationFrame` 循环在每一帧更新 UI。这是一种相当底层的技术；在实践中，许多开发者会使用提供更高层次抽象的 JavaScript 库。

让我们比较两个流行的动画库：[Motion](https://motion.dev/)（前身为 Framer Motion）和 [GSAP](https://gsap.com/)。

Motion 和 GSAP 都是基于 JavaScript 的，所以你可能认为它们都有运行在主线程上的相同限制。但 Motion 却能在主线程繁忙时保持动画流畅运行。🤔

**秘密在于：** Motion 在底层使用了 [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)（WAAPI）。WAAPI 本质上是一个 JavaScript 接口，它接入了与 CSS 关键帧动画相同的底层动画引擎。因此，Motion 能够在独立线程上运行其动画，避免了大多数其他 JavaScript 动画库的主要缺陷！😮

公平地说，GSAP 是一个功能极其强大的库，包含了可能与 WAAPI 不兼容的特性。所以，这不是说 GSAP 做出了错误的选择，而是它们在做不同的权衡取舍。

### 失去同步

这里还有另一个有趣的细节。

当主线程繁忙时，`requestAnimationFrame` 实现会冻结，但随后会跳到正确的位置，与 CSS 关键帧动画保持同步。

但 GSAP 版本不会保持同步。当主线程再次空闲时，GSAP 动画会从当前位置继续：

这是因为 GSAP 不跟踪自动画开始以来经过了多少时间。相反，它专注于每帧移动相同的量，即使这些帧被延迟了。

*总体而言，* 我们希望动画保持同步。如果一个动画应该持续 500ms，那么无论动画是否流畅运行，它都应该在 500ms 后完成！我经常需要编排各种动画，使它们按特定顺序运行，如果动画时长不可靠，这就很难实现。\*我们*勉强*可以通过使用 `animationend` / `transitionend` 事件处理器而不是依赖特定时长来解决这个问题，但这只在动画完全顺序执行时有效。在实践中，我经常希望动画略有重叠，使动画交错而不是一次运行一个。

当然，你也可以认为 GSAP 的方式在某些情况下能带来更好的用户体验，因为元素在丢帧后不会立即跳到新位置。所以，这真的取决于你在优化什么。

### 前期下载成本

我还没有考虑到的一个方面是，JavaScript 动画库在使用之前需要被下载和解析。这些库往往有些体积较大；Motion 压缩后为 [48kB](https://bundlephobia.com/package/motion@12.40.0)，而 GSAP 压缩后为 [27kB](https://bundlephobia.com/package/gsap@3.15.0)（实际上会更大，因为 GSAP 的许多有价值的功能分散在可选插件中）。

我有一个有争议的观点：在大多数情况下，这其实*并没有那么大的影响* 😅。即使在低端设备上使用慢速网络连接，加载动画库也不应该超过一两秒，所以这只会在用户进入页面后的最初几秒内需要动画时才会影响用户体验。

我通常*不想*在页面加载后*立即*就播放动画；除了简单的内容淡入（不需要 JS 库）之外，我的大多数动画都是响应用户交互的，而用户通常不会*那么快*就与页面内容交互。

我能想到的一个例外是基于滚动的动画。用户*确实*会很快开始滚动！但如今，我们可以使用 [Animation Timeline API](https://www.joshwcomeau.com/animation/scroll-driven-animations/) 来处理滚动驱动的动画，而无需库。

---

## 三、选择合适的工具

在我自己的工作中，我尽量在能用的时候使用原生 CSS 动画/过渡。当遇到 CSS 单独无法处理的情况时，我会尝试使用 Motion 这样的库，它能在不带来 JS 库通常缺点的情况下解决问题。

也就是说，CSS 已经变得如此强大，以至于现在真的没有*那么多*需要使用动画库的情况了；[View Transitions](https://www.joshwcomeau.com/css/view-transitions/)、[`linear()`](https://www.joshwcomeau.com/animation/linear-timing-function/)、以及 [Animation Timeline](https://www.joshwcomeau.com/animation/scroll-driven-animations/) 等新 API 使得无需 JavaScript 就能实现各种效果成为可能。✨

### 两类动画库

最后一点建议。动画库有两种类型：

1. **扩展可创建动画范围的库。** 它们开辟了新的可能性，例如允许我们在不同的 SVG 形状之间进行变形，这是现代 CSS 目前还无法做到的。\*对于 `path` 元素，我们实际上*可以*使用 CSS 过渡来在路径定义之间进行动画！但截至 2026 年 5 月，Safari 尚不支持此功能。
2. **对内置 CSS 功能（如过渡和关键帧动画）提供抽象封装的库。** 它们实际上并没有提供任何新功能；相反，它们封装了过渡等 CSS 特性，提供了一种使用 JavaScript 而不是 CSS 来创建基本动画的方式。

Motion 和 GSAP 都属于第一类。它们开辟了新的可能性。

然而，我见过的*大多数*库属于第二类。它们实际上并没有提供任何新功能；相反，它们封装了过渡等 CSS 特性，提供了一种使用 JavaScript 而不是 CSS 来创建基本动画的方式。

我的真实看法是，第二类工具不值得使用。它们带来了我们在本文中看到的所有"主线程"负担，还会增大 JavaScript 包的体积，却没有真正提供任何回报。我们*不需要*一个基于 JS 的接口来实现基本过渡，CSS 本身已经非常出色了！

因此，在评估动画库时，我会尝试弄清楚用它能做哪些新颖的事情。如果这个问题没有好的答案，我就不会使用它。

---

## 总结

**关键要点：**

1. **CSS 动画运行在独立线程**，JS 动画运行在主线程——这是性能差异的核心原因
2. **Motion 之所以能"逃课"**，是因为它底层用了 WAAPI，也跑在独立线程
3. **GSAP 不跟踪时间**，主线程繁忙时动画会失去同步
4. **CSS 正在吃掉动画库的饭碗**——View Transitions、`linear()`、Scroll-driven Animations 等新特性让"不需要 JS 的动画"从口号变成现实
5. **评估动画库的标准**：用它能做哪些 CSS 做不到的事情？如果答不上来，就不要用

> 最好的动画是那些你不需要加载库就能实现的动画。
