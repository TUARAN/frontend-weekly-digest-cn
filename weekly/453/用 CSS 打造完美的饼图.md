> 原文：[Trying to Make the Perfect Pie Chart in CSS](https://css-tricks.com/trying-to-make-the-perfect-pie-chart-in-css/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 用 CSS 打造完美的饼图

[说到图表](https://css-tricks.com/css-bar-charts-using-modern-functions/)……你上次使用饼图是什么时候？如果你是那些需要到处做演示的人之一，那么恭喜！你既在我个人的地狱里……也被饼图包围着。幸运的是，我想我很久没需要用过它们了，至少直到最近是这样。

去年，我自愿为墨西哥的一个儿童慈善机构制作网页。一切都很标准，但工作人员希望在他们的落地页上以饼图展示一些数据。他们给我们的时间不多，所以我承认我走了捷径，使用了[众多用于制作图表的 JavaScript 库](https://css-tricks.com/the-many-ways-of-getting-data-into-charts/)之一。

看起来不错，但内心深处我感到不安；为几个简单的饼图引入整个库。感觉像是走捷径，而不是打造真正的解决方案。

我想弥补这一点。在本文中，我们将尝试用 CSS 制作完美的饼图。这意味着在解决手写饼图带来的主要头痛问题的同时，尽可能减少 JavaScript。但首先，让我们设定我们的「完美」应该遵守的一些目标。

按优先级排序：

1. 应该将 JavaScript 保持在最低限度！不是对 JavaScript 有意见，只是这样更有趣。
2. 应该是 HTML 可定制的！一旦 CSS 完成，我们只需要修改标记就可以自定义饼图。
3. 必须是语义化的！这意味着屏幕阅读器应该能够理解饼图中显示的数据。

完成后，我们应该得到像这样的饼图：

这要求太多吗？也许吧，但无论如何我们会试试。

### 圆锥渐变（conic gradients）不是最佳选择

我们不能在谈论饼图时不先谈谈圆锥渐变。如果你读过任何与 [conic-gradient()](https://css-tricks.com/almanac/functions/c/conic-gradient/) 函数相关的内容，那么你可能已经看到它们可以用来在 CSS 中创建简单的饼图。见鬼，甚至我在[年鉴条目](https://css-tricks.com/almanac/functions/c/conic-gradient/#aa-hard-color-stops)中也这么说过。为什么不呢？只需要一个元素和一行 CSS……

```css
.gradient {
  background: conic-gradient(blue 0% 12.5%, lightblue 12.5% 50%, navy 50% 100%);
}
```

我们可以得到无缝完美的饼图：

CodePen Embed Fallback

然而，这种方法公然违背了我们语义化饼图的第一个目标。正如同一条目后面所指出的：

不要使用 `conic-gradient()` 函数创建真正的饼图或任何其他信息图。它们不包含任何语义含义，应仅用于装饰目的。

请记住，渐变是图像，因此将渐变显示为 [background-image](https://css-tricks.com/almanac/properties/b/background/background-image/) 不会告诉屏幕阅读器关于饼图本身的任何信息；它们只能看到一个空元素。

这也违背了我们的第二条规则，即让饼图可通过 HTML 定制，因为对于每个饼图，我们都必须更改其对应的 CSS。

那么我们是否应该完全抛弃 `conic-gradient()`？尽管我很想这么做，但它的语法太好了，不能错过，所以让我们至少尝试弥补它的缺点，看看能带我们走到哪里。

### 改进语义

`conic-gradient()` 第一个也是最严重的问题是它的语义。我们想要一个包含所有数据的丰富标记，以便屏幕阅读器能够理解。我必须承认我不知道语义化书写的最佳方式，但在使用 [NVDA](https://www.nvaccess.org/) 测试后，我相信这是一个足够好的标记：

```html
<figure>
  <figcaption>上月售出的糖果</figcaption>
  <ul class="pie-chart">
    <li data-percentage="35" data-color="#ff6666"><strong>巧克力</strong></li>
    <li data-percentage="25" data-color="#4fff66"><strong>软糖</strong></li>
    <li data-percentage="25" data-color="#66ffff"><strong>硬糖</strong></li>
    <li data-percentage="15" data-color="#b366ff"><strong>泡泡糖</strong></li>
  </ul>
</figure>
```

理想情况下，这就是我们饼图所需要的全部，一旦样式完成，只需编辑 `data-*` 属性或添加新的 `<li>` 元素即可更新我们的饼图。

不过有一点：在目前的状态下，`data-percentage` 属性不会被屏幕阅读器朗读出来，所以我们必须将它作为伪元素附加到每个项目的末尾。记得在末尾加上「%」以便一起朗读：

```css
.pie-chart li::after {
  content: attr(data-percentage) "%";
}
```

CodePen Embed Fallback

那么，它是否具有可访问性？至少在 NVDA 中测试时是的。这是 Windows 上的效果：

你可能对我为什么选择这个或那个有一些疑问。如果你信任我，我们继续，但如果不，这是我的思考过程：

为什么使用 data 属性而不是直接写入每个百分比？

我们很容易将它们写在每个 `<li>` 里面，但使用属性我们可以通过 [attr()](https://css-tricks.com/almanac/functions/a/attr/) 函数在 CSS 中获取每个百分比。正如我们稍后将看到的，这使得在 CSS 中使用它变得容易得多。

为什么用 `<figure>`？

`<figure>` 元素可以作为我们饼图的自包含包装器使用，除了图像之外，它也经常用于图表。很方便，因为我们可以通过 `<figcaption>` 给它一个标题，然后在无序列表中写出数据，我之前不知道 [figure 允许的内容](https://html.spec.whatwg.org/multipage/grouping-content.html#the-figure-element) 中包括 [ul 作为流内容](https://html.spec.whatwg.org/multipage/dom.html#flow-content-2)。

为什么不用 ARIA 属性？

我们可以使用 `aria-description` 属性让屏幕阅读器朗读每个项目对应的百分比，这可能是最重要的部分。然而，我们可能也需要在视觉上显示图例。这意味着在语义和视觉上都有百分比没有优势，因为它们可能会被朗读两次：（1）在 `aria-description` 上一次，（2）在伪元素上又一次。

### 做成饼图

我们已经在纸上有了数据。现在是时候让它看起来像一个真正的饼图了。我首先想到的是，「这应该很容易，有了标记，我们现在可以使用 `conic-gradient()` 了！」

嗯……我大错特错了，但不是因为语义，而是因为 [CSS 层叠](https://css-tricks.com/the-c-in-css-the-cascade/)的工作原理。

让我们再看看 `conic-gradient()` 的语法。如果我们有以下数据：

- 项目 3：50%
- 项目 2：35%
- 项目 1：15%

……那么我们会写下以下 `conic-gradient()`：

```css
.gradient {
  background: 
    conic-gradient(
      blue 0% 15%, 
      lightblue 15% 50%, 
      navy 50% 100%
    );
}
```

这基本上是说：「从 0 到 15% 画第一种颜色，下一种颜色从 15% 到 50%（所以差值是 35%），以此类推。」

你看到问题了吗？饼图是在单个 `conic-gradient()` 中绘制的，这等于单个元素。你可能看不到，但这很糟糕！如果我们想在 `data-percentage` 中显示每个项目的权重——让一切更漂亮——那么我们需要一种从父元素访问所有这些百分比的方法。这是不可能的！

我们能够利用 `data-percentage` 简单性的唯一方法是每个项目绘制自己的扇形。然而，这并不意味着我们不能使用 `conic-gradient()`，而是我们需要使用多个。

计划是让每个项目都有自己的 `conic-gradient()` 绘制其扇形，然后将它们全部叠在一起：

为此，我们首先给每个 `<li>` 一些尺寸。我们不会硬编码大小，而是定义一个 `--radius` 属性，这在后面保持样式可维护时会很有用。

```css
.pie-chart li {
  --radius: 20vmin;

  width: calc(var(--radius) * 2); /* 半径的两倍 = 直径 */
  aspect-ratio: 1;
  border-radius: 50%;
}
```

然后，我们使用 `attr()` 及其[新类型语法](https://developer.chrome.com/blog/advanced-attr)将 `data-percentage` 属性引入 CSS，该语法允许我们将属性解析为字符串以外的内容。请注意，在我写这篇文章时，新语法目前仅限于 Chromium。

然而，在 CSS 中使用小数（如 `0.1`）比使用百分比（如 `10%`）更好，因为我们可以将它们乘以其他单位。所以我们将 `data-percentage` 属性解析为 `<number>`，然后除以 `100` 得到小数形式的百分比。

```css
.pie-chart li {
  /* ... */
  --weighing: calc(attr(data-percentage type(<number>)) / 100);
}
```

我们仍然需要它作为百分比，这意味着将结果乘以 `1%`。

```css
.pie-chart li {
  /* ... */
  --percentage: calc(attr(data-percentage type(<number>)) * 1%);
}
```

最后，我们再次使用 `attr()` 从 HTML 获取 `data-color` 属性，但这次使用 `<color>` 类型而不是 `<number>`：

```css
.pie-chart li {
  /* ... */
  --bg-color: attr(data-color type(<color>));
}
```

让我们暂时把 `--weighing` 变量放在一边，使用另外两个变量创建 `conic-gradient()` 扇形。它们应该从 0% 到所需百分比，然后 thereafter 变为透明：

```css
.pie-chart li {
  /* ... */
   background: conic-gradient(
   var(--bg-color) 0% var(--percentage),
   transparent var(--percentage) 100%
  );
}
```

我显式定义了起始 0% 和结束 100%，但由于这些是默认值，我们 technically 可以删除它们。

这是我们目前的进度：

CodePen Embed Fallback

如果你的浏览器不支持新的 `attr()` 语法，也许一张图片会有所帮助：

现在所有扇形都完成了，你会注意到每个扇形都从顶部开始，顺时针方向延伸。我们需要将它们定位成，你知道的，饼图形状，所以下一步是适当旋转它们以形成圆形。

就在这时我们遇到了一个问题：每个扇形旋转的量取决于它前面的项目数量。我们必须将项目旋转前面扇形的大小。理想情况下，有一个累加器变量（如 `--accum`）保存每个项目之前百分比的总和。然而，由于 CSS 层叠的工作方式，我们既不能在兄弟之间共享状态，也不能在每个兄弟上更新变量。

相信我，我真的努力绕过这些问题。但我们似乎被迫在两个选项之间做出选择：

1. 使用 JavaScript 计算 `--accum` 变量。
2. 在每个 `<li>` 元素上硬编码 `--accum` 变量。

如果我们重新审视我们的目标，选择并不难：硬编码 `--accum` 会否定灵活的 HTML，因为移动项目或更改百分比会迫使我们再次手动计算 `--accum` 变量。

然而，JavaScript 使这变得微不足道：

```javascript
const pieChartItems = document.querySelectorAll(".pie-chart li");

let accum = 0;

pieChartItems.forEach((item) => {
  item.style.setProperty("--accum", accum);
  accum += parseFloat(item.getAttribute("data-percentage"));
});
```

有了 `--accum`，我们可以使用 [from 语法](https://css-tricks.com/almanac/functions/c/conic-gradient/#aa-from-angle-zero) 旋转每个 `conic-gradient()`，该语法告诉圆锥渐变旋转的起点。问题是它只接受角度，不接受百分比。（我觉得百分比也应该可以工作，但这是另一个话题）。

为了解决这个问题，我们必须创建另一个变量——我们称它为 `--offset`——它等于转换为角度的 `--accum`。这样，我们可以将值插入每个 `conic-gradient()`：

```css
.pie-chart li {
  /* ... */
  --offset: calc(360deg * var(--accum) / 100);

  background: conic-gradient(
    from var(--offset),
    var(--bg-color) 0% var(--percentage),
    transparent var(--percentage) 100%
  );
}
```

我们看起来好多了！

CodePen Embed Fallback

剩下的就是把所有项目叠在一起。当然有很多方法可以做到这一点，但最简单的可能是 CSS Grid。

```css
.pie-chart {
  display: grid;
  place-items: center;
}

.pie-chart li {
  /* ... */
  grid-row: 1;
  grid-column: 1;
}
```

这几行 CSS 将所有扇形排列在 `.pie-chart` 容器的正中心，每个扇形覆盖容器的唯一行和列。它们不会碰撞，因为它们被正确旋转了！

CodePen Embed Fallback

除了那些重叠的标签，我们的状态真的非常非常好！让我们清理一下。

### 定位标签

现在，`<li>` 里面的名称和百分比标签彼此散落在一起。我们希望它们浮动在各自扇形的旁边。为了修复这个问题，让我们首先使用与容器本身相同的网格居中技巧，将所有项目移动到 `.pie-chart` 容器的中心：

```css
.pie-chart li {
  /* ... */
  display: grid;
  place-items: center;
}

.pie-chart li::after,
strong {
  grid-row: 1;
  grid-column: 1;
}
```

幸运的是，[我已经探索过如何使用较新的 CSS 的 cos()](https://css-tricks.com/almanac/functions/c/cos/) 和 [sin()](https://css-tricks.com/almanac/functions/s/sin/) 在圆上布局东西。去看看那些链接，因为那里有很多上下文。简而言之，给定一个角度和半径，我们可以使用 `cos()` 和 `sin()` 来获取圆上每个项目的 X 和 Y 坐标。

为此，我们需要——你猜对了！——另一个表示角度的 CSS 变量（我们称之为 `--theta`），我们将在那里放置每个标签。我们可以用下一个公式计算该角度：

```css
.pie-chart li {
  /* ... */
  --theta: calc((360deg * var(--weighing)) / 2 + var(--offset) - 90deg);
}
```

值得了解该公式在做什么：

- `- 90deg`：`cos()` 和 `sin()` 的角度从右边测量，但 `conic-gradient()` 从顶部开始。这部分通过 `-90deg` 校正每个角度。
- `+ var(--offset)`：移动角度以匹配当前偏移。
- `360deg * var(--weighing)) / 2`：将百分比作为角度获取，然后除以二以找到中点。

我们可以使用 `--theta` 和 `--radius` 变量找到 X 和 Y 坐标，如下面的伪代码：

```
x = cos(theta) * radius
y = sin(theta) * radius
```

翻译成……

```css
.pie-chart li {
  /* ... */
  --pos-x: calc(cos(var(--theta)) * var(--radius));
  --pos-y: calc(sin(var(--theta)) * var(--radius));
}
```

这会将每个项目放在饼图的边缘，所以我们会在它们之间添加一个 `--gap`：

```css
.pie-chart li {
  /* ... */
  --gap: 4rem;
  --pos-x: calc(cos(var(--theta)) * (var(--radius) + var(--gap)));
  --pos-y: calc(sin(var(--theta)) * (var(--radius) + var(--gap)));
}
```

然后我们用 `--pos-x` 和 `--pos-y` 平移每个标签：

```css
.pie-chart li::after,
strong {
  /* ... */
  transform: translateX(var(--pos-x)) translateY(var(--pos-y));
}
```

哦等等，还有一个小细节。每个项目的标签和百分比仍然叠在一起。幸运的是，修复就像在 Y 轴上再多平移一点百分比一样简单：

```css
.pie-chart li::after {
  --pos-y: calc(sin(var(--theta)) * (var(--radius) + var(--gap)) + 1lh);
}
```

现在我们在用煤气做饭了！

CodePen Embed Fallback

让我们确保这对屏幕阅读器友好：

### 暂时就这些……

我会称这是朝着「完美」饼图迈出的非常好的第一步，但仍有一些我们可以改进的地方：

- 这似乎迫切需要一种漂亮的悬停效果，比如 maybe 放大扇形并显示它？
- 不同类型的图表呢？柱状图，有人要吗？
- `data-color` 属性很好，但如果没有提供，我们仍然应该提供一种让 CSS 生成颜色的方式。也许是 [color-mix()](https://css-tricks.com/almanac/functions/c/color-mix/) 的好工作？
- 饼图假设你会自己写百分比，但应该有一种方式输入原始项目数量，然后计算它们的百分比。

这就是我目前能想到的全部，但我已经在计划在后续文章中逐步解决这些问题（懂吗？！）。此外，没有大量反馈就没有完美，所以告诉我你会改变或添加什么到这个饼图中，让它真正完美！

---

¹ 他们是很好的人，帮助孩子们度过极其艰难的时期，所以如果你有兴趣捐款，可以在[他们的社交媒体](https://www.instagram.com/esperalaprimaveraiap/)上找到更多。↪️
