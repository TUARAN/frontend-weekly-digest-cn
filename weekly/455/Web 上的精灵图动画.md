原文：Sprites on the Web  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## Web 上的精灵图动画

## 目录
[引言](https://www.joshwcomeau.com/animation/sprites/#introduction)  
[基础实现](https://www.joshwcomeau.com/animation/sprites/#basic-implementation-1)  
[步进位置](https://www.joshwcomeau.com/animation/sprites/#step-positions-2)  
[使用场景](https://www.joshwcomeau.com/animation/sprites/#use-cases-3)  

## 引言
2015 年，那时 Twitter 还叫 Twitter，他们的开发团队遇到了一个问题。

在早期，用户可以通过点击一个小小的 “⭐” 图标来给推文点“收藏”（favourite）。产品团队想把它改成类似 Facebook 的“点赞”（like）方式，用一个 “❤️”。作为这次更新的一部分，他们的设计师做出了这个很棒的动画：

![](https://www.joshwcomeau.com/images/sprites/twitter-like-sprite.webp)Pause

这个效果看起来非常漂亮，但里面其实有很多东西同时在动；据我统计，一共有 16 个独立元素同时在做动画（14 个粒子、弹出的圆形、以及心形）。Twitter 的 Web 应用需要在*非常*低端的移动设备上运行，所以用 DOM 节点以程序化方式来生成这个动画并不现实。于是，他们决定借用一种来自电子游戏的技术：*精灵图（sprites）*。

精灵图的基本思路是：我们制作一张包含动画每一帧的长条图片，把每个独立帧按顺序放在同一张图里。然后让每一帧显示极短的时间，就像一卷胶片在老式电影放映机里滑过一样：

每帧显示：500ms![](https://www.joshwcomeau.com/images/sprites/twitter-like-sprite.webp)![](https://www.joshwcomeau.com/images/sprites/twitter-like-sprite.webp)

这种技术已经存在几十年了；我依稀记得在 2000 年代初，我就学过如何用 `background-position` 来做这个。幸运的是，现代 CSS 给了我们一些很棒的新选择，用来实现精灵图动画！

在这篇文章中，我会展示我目前找到的、在 CSS 中使用精灵图的最佳方式，并分享我发现的一些使用场景。我们也会聊聊其中的一些取舍，看看什么时候我们*不应该*使用精灵图。

**运动警告（Motion Warning）**  
你的操作系统启用了“减少动态效果（Reduce motion）”选项。我通常会尽量在本博客中尊重这一偏好，但这篇文章比较特殊：里面有多个动态幅度很大的动画，并没有被禁用。这些动画是理解该动画技术所必需的。

如果你对动态效果比较敏感，请谨慎阅读本文！

## 基础实现

首先，我们需要一个素材！我们就用我几年前做的一个金色奖杯精灵图：

![](https://www.joshwcomeau.com/images/illustrations/gold-trophy-flames.png)![](https://www.joshwcomeau.com/images/illustrations/gold-trophy.png)

为了营造火焰闪烁的错觉，我画了 5 个不同版本的蓝色火焰。这些帧被并排堆放在一张图片里，这种图片称为“精灵表（spritesheet）”：

![](https://www.joshwcomeau.com/images/sprites/gold-trophy-sprite.png)

**核心策略如下：**我们会创建一个 `<img>` 标签，并根据其中*某一帧*来计算它的尺寸。然后使用 `object-fit` 和 `object-position` 来控制当前可见的是精灵图的哪一部分，再通过 CSS 的关键帧动画来逐帧切换。

这张完整图片的原始分辨率是 2000px × 800px，其中包含 5 帧。这意味着每一帧是 400px × 800px。为了让这张图片在高分辨率屏幕上看起来足够清晰，我们会把尺寸减半，所以最终 `<img>` 的尺寸将是 200px × 400px。

默认情况下，`<img>` 标签会尝试把整张图片内容压缩到这个 DOM 节点的区域里，这会导致我们看到 5 个奖杯挤在一起：

```html
<style>
  .trophy {
    width: 200px;
    height: 400px;
  }
</style>

<img
  class="trophy"
  src="/images/sprites/gold-trophy-sprite.png"
  alt="A gold trophy with flickering flames"
/>
```

之所以会这样，是因为 [“object-fit” CSS 属性（在新标签页打开）](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit)。当底层图片的尺寸与 `<img>` 元素的尺寸不一致时，这个属性决定该如何处理。

它的默认值是 `fill`，会尽可能确保整张图片都可见，即便这意味着要把图片压扁。我们把它改成 `cover`：

```html
<style>
  .trophy {
    width: 200px;
    height: 400px;
    object-fit: cover;
  }
</style>

<img
  class="trophy"
  src="/images/sprites/gold-trophy-sprite.png"
  alt="A gold trophy with flickering flames"
/>
```

现在就有点意思了！`cover` 会缩放底层图片，让它覆盖 `<img>` 节点的整个区域。结果是，我们最终只会看到整张图片的 1/5。

接下来，我们可以用 `object-position` 属性来控制底层图片的*哪一部分*会显示出来：

![](https://www.joshwcomeau.com/images/sprites/gold-trophy-sprite.webp)![](https://www.joshwcomeau.com/images/sprites/gold-trophy-sprite.webp)object-position:0% 0%

如果你熟悉 SVG 格式，那么我们在这里做的事情在概念上类似于修改 `viewBox` 来控制显示图像的哪一部分。在这个例子中，`<img>` 标签就像是一个 200×400 的窗口，透过它去“看”我们的奖杯精灵图（sprite），而我们可以使用 `object-position` 属性来滑动底层的图像数据。

我们已经快完成了，但还有最后一个小问题需要解决：动画。我们要如何设置，才能在每个奖杯变体之间来回切换呢？

让我们试着添加一个循环的关键帧动画：

```html
<style>
  @keyframes sprite {
    from {
      object-position: 0% 0%;
    }
    to {
      object-position: 100% 0%;
    }
  }
  
  .trophy {
    width: 200px;
    height: 400px;
    object-fit: cover;
    animation: sprite 2000ms linear infinite;
  }
</style>

<img
  class="trophy"
  src="/images/sprites/gold-trophy-sprite.png"
  alt="A gold trophy with flickering flames"
/>
```

（演示略）

问题在于：我们让图片以平滑的方式滑动了，而不是以离散的步进来移动。要让这个技巧生效，我们需要让 5 帧中的每一帧都显示相同的时间长度。

我们*可以*用 JavaScript 的 `setInterval()` 来实现，但其实有一个比较冷门的 CSS timing function 可以替代它：`steps`。

`steps` 的核心思路是：与其用贝塞尔曲线进行平滑过渡，数值会在指定数量的中间点之间“跳变”。就像楼梯，而不是斜坡。配合可视化会更直观：

Timing function:linearease-insteps(5)—— Progression ———— Time ——

`steps` 这个 timing function 允许我们把总进度切分成离散的数值。在这个例子里，我们指定了 5 个 steps，动画会在每一个 step 上停留总时长的 1/5。

我们调用 `steps` 函数时需要传入两个参数：总步数，以及“step position（步进位置）”。我们稍后会拆解它，不过先来看一个完整实现：在 `<img>` 节点内使用 `object-position` 滑动图像数据，从而播放我们的奖杯精灵动画：

```html
<style>
  @keyframes sprite {
    from {
      object-position: 0% 0%;
    }
    to {
      object-position: 100% 0%;
    }
  }
  
  .trophy {
    object-fit: cover;
    animation:
      sprite 1s steps(5, jump-none) infinite;
  }
</style>

<img
  class="trophy"
  src="/images/sprites/gold-trophy-sprite.png"
  alt="A gold trophy with flickering flames"
/>
```

（演示略）

我觉得这还挺酷的。😄

**为什么不直接用动图 GIF？**  
你可能会好奇我们为什么要折腾这么一大圈。用 `<img src="/images/gold-trophy.gif" />` 难道不能实现同样的效果吗？

这种方案相比动图 GIF 的主要优势，是我们有更多控制权。我们可以通过调整 `animation-duration` 来改变动画速度；也可以用 `animation-play-state` 在恰到好处的时机精确地开始/停止动画。GIF 没有暂停按钮，而且在时间控制上往往不够一致。

此外，这种方式通常性能更好，尤其是在做过优化的情况下。在真实的 `<GoldTrophy>` 组件里，我把闪烁的蓝色火焰单独拆成了一个独立的 spritesheet，并把它叠放在一个静态的金色奖杯后面。两张图片都使用了现代的 `.avif` 图像格式。合并后的图片不到 30kb，而 `.gif` 会超过 100kb（并且还只能支持 256 色！）。

当然，很多情况下动图 GIF 也完全够用。但一旦你开始尝试精灵图，我想你会同意：它会打开很多有趣的新大门。我稍后还会分享一个更高级的用例。

### 步进位置（Step positions）

在上面的 playground 里，你可能注意到了一个有点奇怪的地方：

Copy to clipboard.
```css
.trophy {
  object-fit: cover;
  animation: sprite 1s steps(5, jump-none) infinite;
}
```

`steps()` 函数接受两个参数。第一个参数是步数，这很好理解。但 `jump-none` 到底是什么？

第二个参数是“step position（步进位置）”，它的默认值是 `jump-end`。在这个模式下，`steps()` 会把最终值从离散取值中排除掉。举例来说，如果我们的关键帧定义从 0% 走到 100%，并且设置 `steps(5)`，那么离散层级会是 0%、20%、40%、60% 和 80%。它实际上永远不会到达 100%。

下面这个 playground 会很清楚地展示这一点：

代码演练场  
使用 Prettier 格式化代码 重置代码 HTML CSS 聚焦编辑器。聚焦后会“锁定”焦点，直到你按下 Escape。代码编辑器：

```html
<style>
  @keyframes fill {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }

  .bar {
    /*
      “jump-end” is the default value, so we
      don’t actually need to specify it, but
      I want this to be as clear as possible:
    */
    animation:
      fill 2000ms steps(5, jump-end) infinite;
  }
</style>

<div class="wrapper">
  <div class="bar"></div>
</div>
```

调整编辑器大小。使用左右箭头。

结果  
刷新结果面板

我们的 `fill` 关键帧从 `width: 0%` 变化到 `width: 100%`，但 `.bar` 元素的宽度却从来不会超过 80%！

起初我觉得这非常令人困惑，但我意识到：对于**不循环**的动画来说，这种行为就合理多了：

代码演练场  
使用 Prettier 格式化代码 重置代码 HTML CSS 聚焦编辑器。聚焦后会“锁定”焦点，直到你按下 Escape。代码编辑器：

```html
<style>
  @keyframes fill {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }

  .bar {
    animation:
      fill 2000ms steps(5, jump-end) forwards;
  }
</style>

<div class="wrapper">
  <div class="bar"></div>
</div>
<p>
  (Click the “Refresh” icon by <strong>RESULT</STRONG> above to re-run the animation.)
</p>
```

调整编辑器大小。使用左右箭头。

结果  
刷新结果面板

在这段 2 秒的动画过程中，进度条的宽度从 0% 增长到 80%。当动画结束时——也就是恰好在 2 秒这个时刻——我们关键帧定义中的最终值（`width: 100%`）会被应用上去。

所以，默认情况下，`steps()` 的“step position（步进位置）”是 `jump-end`，这会让它在动画**最后**的那一刻才**跳**到最终值。如果没有这个“跳变”，我们的进度条会在 1.6 秒时就变成满宽度——在很多场景下这会显得太早。

但是，对于像我们奖杯精灵图那样的**循环**动画来说，我们不希望出现任何“跳变”。我们不希望在动画到期的那一刻才落到最后一帧；我们希望把最后一帧也作为 5 个离散值之一，参与循环切换。我们可以通过指定 `steps(5, jump-none)` 来做到这一点。

**处理中断（Handling interrupts）**  
遗憾的是，`steps()` 函数并不能很好地处理中断。对我们的金色奖杯动画来说这不是问题，因为它会无限运行；但在其他情况下，这可能会带来麻烦。

例如，Karey Higuera 使用精灵图做了一个很酷的拉杆交互。慢慢点击时效果很好，但如果过渡被中断，事情就会变得有点奇怪：

之所以会这样，是因为 CSS 过渡在被中断时会发生反向（reversed），这会改变 `steps()` 中使用的离散取值。这超出了本文的讨论范围，但你可以在 CSSWG 规范中阅读更多关于中断行为的内容：[in the CSSWG spec(opens in new tab)](https://www.w3.org/TR/css-transitions-1/#reversing)。

Karey 找到的解决方案是：使用线性的时间函数（linear timing function）配合新的 `round()` 函数；`round()` 会把某个值四舍五入到最近的指定步长。你可以在 Karey 的文章中了解更多这个思路：

- [Interactive Pixel Spritesheet Animation with CSS(opens in new tab)](https://kbravh.dev/interactive-pixel-spritesheet-animations-with-css)

## 用例（Use cases）

既然我们已经覆盖了这项技术的基础，那么来聊聊我们到底应该在什么时候使用它。同样重要的是：什么时候**不应该**使用它。

我在开头提到过，Twitter 开发团队选择基于精灵图的做法，部分原因是出于性能方面的考虑  
*来源：我在 2016 年的一次大会上见过 Twitter 的一位开发者，他跟我提过这件事。*  
我认为这在 2015 年是合理的，但如果放到 2026 年，我会反对这一点。近年来设备性能提升非常大，浏览器也优化了很多；即便是最低端的设备，同时处理 14 个粒子的动画也应该毫不费力。而当我们用精灵图来做这种效果时，我们会失去其中一些“魔法感”。

在我即将推出的课程 [Whimsical Animations(opens in new tab)](https://whimsy.joshwcomeau.com/) 中，我们会构建下面这个 “Like” 按钮。试着点几次：

Like this post

这种方案最美妙的地方在于：你每次点击时它都会有点不一样。粒子是通过三角函数与随机性进行程序化生成的。相比之下，Twitter 的 “Like” 按钮每次点击都一模一样，就像我们在一遍又一遍地重放同一段视频。😬

**那么，我们什么时候应该使用精灵图（sprites）？**  
我认为最主要的用例是：那些本来就应该看起来像精灵图的东西！除了金色奖杯的例子，这里还有一个来自我多年前发布的[生成艺术项目(opens in new tab)](http://tinkersynth.com/)的示例：

这只小猫过一会儿就会溜达进屏幕里。如果你把鼠标悬停在她身上，她会鼓励你去 [Bluesky 上关注我(opens in new tab)](https://bsky.app/profile/joshwcomeau.com)。

这是个很傻的例子，但我觉得它很好地展示了：和动图 GIF 相比，精灵图能强大多少。我们可以把它做得动态得多。比如，如果你一段时间不和她互动，她就会睡着：

睡觉时，我会把 `animation-duration` 设得更长一些，让她的呼吸慢下来！

虽然这种技术如今在 Web 上已经不太常见，但在电子游戏里却**一直**在用。网上有海量的精灵图（spritesheet）资源可供使用。你可以用这种技术，让一个小索尼克或洛克人从你的网站上跑过去！*JOSH W COMEAU 对你使用任何由公司或个人拥有的知识产权（包括但不限于 NINTENDO®、SEGA® 或 CAPCOM®）而导致的任何版权侵权行为不承担任何责任。*

如果你想学习如何制作顶级的动画与交互，欢迎看看我即将推出的课程。

[![](https://www.joshwcomeau.com/_next/image/?url=%2Fimages%2Fwhimsical-animations.jpg&w=1920&q=75)](https://whimsy.joshwcomeau.com/)

这门课程会教你我在工作中用来打造更高一层动画与交互效果的基础技巧。“点赞”按钮只是众多示例中的一个。如果你曾经好奇这个博客上的某些效果是怎么实现的，那么很有可能我们会在课程里讲到！✨

Whimsical Animations 预计会在夏天之前发布；如果你订阅获取更新，可能还能拿到特别折扣。😉

- [了解更多（在新标签页打开）](https://whimsy.joshwcomeau.com/)

### 最后更新于

2026 年 2 月 28 日

### 点击次数