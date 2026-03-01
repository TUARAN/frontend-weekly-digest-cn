> 原文：[How to Create a CSS-only Elastic Text Effect](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 纯 CSS 实现弹性文字效果

逐字母动画的文字效果通常很吸睛。这类错峰效果常依赖 JavaScript 库，但对本文这种相对轻量的场景来说，JS 往往显得偏重。本文会探索如何只用 CSS 实现该效果（代价是需要手动拆分字符）。

截至撰写时，仅 Chrome 和 Edge 完全支持我们使用的特性。

将鼠标悬停在下方演示的文字上，即可看到效果：

CodePen Embed Fallback

仅靠 CSS 就能做出相当逼真的弹性效果，而且参数可调。在进入代码前，先说明一个重要问题：这个方案有明显缺点。

## 关于可访问性的重要声明

我们要做的效果依赖于把单词拆成单个字母，一般来说这种做法非常不推荐。

一个简单链接通常是这样写的：

```
<a href="#">About</a>Code language: HTML, XML (xml)
```

但要分别控制每个字母的样式，我们会改成这样：

```
<a href="#">
  <span>A</span><span>b</span><span>o</span><span>u</span><span>t</span>
</a>Code language: HTML, XML (xml)
```

这会带来可访问性问题。

很容易想到用 `aria-*` 属性来弥补。至少我之前是这么想的。网上有不少资料推荐类似下面的结构：

```
<a href="#" aria-label="About">
  <span aria-hidden="true">
    <span>A</span><span>b</span><span>o</span><span>u</span><span>t</span>
  </span>
</a>Code language: HTML, XML (xml)
```

看起来没问题吧？不！这种结构依然很糟糕。实际上，网上能找到的大多数结构都有问题。我不是这个领域的专家，所以请教了一些人，发现 [Adrian Roselli](https://adrianroselli.com/) 的两篇博客很有参考价值：

- [You Know What? Just Don't Split Words into Letters](https://adrianroselli.com/2026/02/you-know-what-just-dont-split-words-into-letters.html)
- [Barriers from Links with ARIA](https://adrianroselli.com/2026/01/barriers-from-links-with-aria.html)

强烈建议读一读，理解为什么把单词拆成字母是个坏主意（以及可能的替代方案）。

那我为什么还要做这个演示？

我更倾向于把它当作一次探索现代 CSS 特性的实验。这个效果里可能有很多你还不熟悉的属性，是了解它们的好机会。可以用在娱乐或 side project 中，但在广泛使用或关键场景中引入前，请三思。

好了，声明完毕，我们开始。

## 原理说明

思路是使用 `offset()` 属性，定义字母沿一条路径运动。这条路径是一条曲线，我们沿曲线做动画。`offset()` 是一个被低估的特性，但潜力很大，尤其配合现代 CSS 使用时。我曾用它做过[无限跑马灯动画](https://frontendmasters.com/blog/infinite-marquee-animation-using-modern-css/)、让元素[沿圆精确排布](https://css-tip.com/images-circle/)、做[图片画廊](https://css-tip.com/circular-gallery/)等。

下面是一个简化示例，帮助理解我们要用的技巧：

CodePen Embed Fallback

上面的演示使用了来自 SVG 的 `path()` 值。三个字母最初沿第一条路径，悬停时切换到第二条路径。借助 transition，就形成了平滑的效果。

可惜的是，使用 SVG 并不理想，因为你只能创建静态、基于像素的路径，无法用 CSS 控制。因此我们将转而使用[新的 shape() 函数](https://frontendmasters.com/blog/shape-a-new-powerful-drawing-syntax-in-css/)，它可以定义复杂形状（包括曲线），并方便地用 CSS 控制。

本文只用到 `shape()` 的简单用法（只需要一条曲线），如果想深入了解这个强大函数，可以参考我之前的文章：

- [Better CSS Shapes Using shape()](https://css-tricks.com/better-css-shapes-using-shape-part-1-lines-and-arcs/)
- [Creating Blob Shapes using clip-path: shape()](https://frontendmasters.com/blog/creating-blob-shapes-using-clip-path-shape/)
- [Creating Flower Shapes using clip-path: shape()](https://frontendmasters.com/blog/creating-flower-shapes-using-clip-path-shape/)

## 开始写代码

用到的 HTML：

```
<ul>
  <li>
    <a href="#"><span>A</span><span>b</span><span>o</span><span>u</span><span>t</span></a>
  </li>
  <!-- 更多 li 元素 -->
</ul>Code language: HTML, XML (xml)
```

CSS：

```
ul li a {
  display: flex;
  font-family: monospace;
}
ul li a span {
  offset-path: shape(???);
  offset-distance: ???;
}
ul li a:hover {
  offset-path: shape(???);
}Code language: CSS (css)
```

目前还比较朴素

CodePen Embed Fallback

用 flex 让字母并排，并用等宽字体，确保每个字母宽度一致。

接下来用下面的代码定义路径：

```
offset-path: shape(from Xa Ya, curve to Xb Yb with Xc Yc / Xd Yd );Code language: CSS (css)
```

这里用 `curve` 命令在 A 到 B 之间画贝塞尔曲线，控制点为 C 和 D。

然后通过调整控制点的坐标（尤其是 Y 值）来驱动曲线动画。当 Y 与 A、B 的 Y 相同时是直线；更大时变成曲线。

曲线的代码大致如下：

```
offset-path: shape(from Xa Y, curve to Xb Y with Xc Y1 / Xd Y1);
```

直线的代码如下：

```
offset-path: shape(from Xa Y, curve to Xb Y with Xc Y / Xd Y);
```

注意我们只改控制点的 Y，其他保持不变。

现在来确定各参数。使用 `offset` 时有两个要点：

1. 默认以元素中心作为在路径上的位置。
2. 定义在子元素上，但参考框是父容器。

第一个字母应在路径起点，最后一个在终点，所以 A 是第一个字母中心，B 是最后一个字母中心：

```
Y = 50%Xa = .5chXb = 100% - Xa = 100% - .5ch
```

C 和 D 的 X 没有固定规则，可以任意指定。我选 `Xc = 30%`，`Xd = 100% - Xc = 70%`。你可以自己调整这些值试验不同的曲线形态。

路径现在可以这样写：

```
offset-path: shape(from .5ch 50%, curve to calc(100% - .5ch) 50% with 30% Y / 70% Y);
```

`Y` 是变量，可以是 `50%`（与 A、B 相同）或别的值，我们设成 `50% - H`。`H` 越大，弹性越强。

试试看：

CodePen Embed Fallback

一团糟！因为我们没定义 `offset-distance`，所有字母都叠在一起了。

是不是要给每个字母单独设位置？那太麻烦了。

我们必须给每个字母不同的位置，好在可以用一个公式配合 `sibling-index()` 和 `sibling-count()` 搞定。

第一个字母在 `0%`，最后一个在 `100%`。共 N 个字母，步长为 `100%/(N - 1)`，字母从 `0%` 到 `100%` 依次排布，公式为：

```
offset-distance: (100% * i)/(N - 1)
```

其中 `i` 从 0 开始。

写成 CSS：

```
offset-distance: calc(100%*(sibling-index() - 1)/(sibling-count() - 1))Code language: CSS (css)
```

CodePen Embed Fallback

几乎完美。除了最后一个字母外都位置正确。由于某种原因，`0%` 和 `100%` 被当成同一个点。`offset-distance` 不限于 0%–100%，可以取任意值（包括负值），有一种取模行为形成环路。你可以从 `0%` 到 `100%` 走完整条路径，到 `100%` 后又回到起点，还能继续从 `100%` 到 `200%`，如此往复。

虽然有点反直觉，但修复很简单：把 `100%` 换成 `99.9%`。有点 hack，但有效！

CodePen Embed Fallback

现在排布完美了，悬停时可以看到直线变成曲线的过程。

最后加上 transition，就大功告成！

CodePen Embed Fallback

可能还不算完全搞定，因为动画似乎有些异常。这很可能是 bug（我已在此[提交](https://issues.chromium.org/issues/482074624)），不过问题不大，因为我本来就打算重构，避免重复写两次 shape，改为动画一个变量：

```
@property --_s {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}
ul li a {
  --h: 20px; /* 控制效果强度 */
 
  display: flex;
  font: bold 40px monospace;
  transition: --_s .3s;
}
ul li a:hover {
  --_s: 1;
}
ul li a span {
  offset-path: 
    shape(
      from .5ch 50%, curve to calc(100% - .5ch) 50% 
      with 30% calc(50% - var(--_s)*var(--h)) / 70% calc(50% - var(--_s)*var(--h))
    );
  offset-distance: calc(99.9%*(sibling-index() - 1)/(sibling-count() - 1));
}Code language: CSS (css)
```

现在有了 `--h` 变量来调节路径曲率，以及一个内部变量在 0 到 1 之间动画，实现从直线到曲线的过渡。

CodePen Embed Fallback

嗒哒！动画完美了！但弹性感呢？

要得到弹性效果，需要调整缓动，用到 `linear()`。这是最简单的部分，我用[生成器](https://linear-easing-generator.netlify.app/)生成取值。

多调几次直到满意。我得到的是：

CodePen Embed Fallback

效果已经不错，但如果微调曲线还能更好。目前所有单词的曲线「高度」是一样的，理想情况是根据单词长度变化。为此我会在公式里加入 `sibling-count()`，让单词越宽时高度越大。

CodePen Embed Fallback

## 让效果具备方向感知

效果已经可用，但既然做到这里，不妨再进一步：根据鼠标方向决定曲线向上还是向下。

向上的曲线已经通过 `--_s: 1` 实现：

```
ul li a:hover {
  --_s: 1;
}Code language: CSS (css)
```

若改为 `-1`，就得到向下的曲线：

CodePen Embed Fallback

现在需要把两种情况结合起来。从上方悬停时，使用向下曲线 `--_s: -1`；从下方悬停时，使用向上曲线 `--_s: 1`。

首先给 `li` 加一个伪元素，填满上半部分并位于链接上方：

```
ul li {
  position: relative;
}
ul li:after {
  content: "";
  position: absolute;
  inset: 0 0 50%;
  cursor: pointer;
}Code language: CSS (css)
```

CodePen Embed Fallback

然后定义两个不同的选择器。当悬停伪元素时，相当于也悬停了 `li`，所以可以用：

```
ul li:hover a {
  --_s: -1;
}Code language: CSS (css)
```

悬停 `a` 时，同样会悬停 `li`，上面的规则也会生效。但若悬停的是伪元素，则没有悬停 `a`，因此可以用：

```
ul li:has(a:hover) a {
  --_s: 1;
}Code language: CSS (css)
```

有点绕？没关系，我们把两个选择器放在一起看：

```
ul li:hover a {
  --_s: -1;
}
ul li:has(a:hover) a {
  --_s: 1;
}Code language: CSS (css)
```

我们可以从上方（通过伪元素）或从下方（通过 `a`）悬停。前者会触发第一个选择器，因为我们在悬停 `li`，但不会触发第二个，因为 `li`「并没有悬停其 `a`」。当我们悬停 `a` 时，两个选择器都会触发，后者会胜出。

方向感知就这么实现了！

CodePen Embed Fallback

能用，但不如开头的演示那么流畅。当鼠标移动穿过整个元素时，会突然停止一个动画并切换到另一个。

可以调整伪元素的大小来改善。悬停时让它覆盖整个元素，这样就不会再触达下方的 `a`，第二个动画就不会触发。而悬停 `a` 时，把伪元素高度设为 0，就无法悬停它，从而不会触发第一个动画。

CodePen Embed Fallback

好多了！把伪元素设为透明，效果就很自然。

CodePen Embed Fallback

## 结语

希望这个 CSS 实验对你有帮助。再强调一次：在生产场景中请谨慎使用。它确实是学习 `shape()`、`linear()`、`sibling-index()` 等现代特性的好例子，但为了这种效果牺牲可访问性并不划算。
