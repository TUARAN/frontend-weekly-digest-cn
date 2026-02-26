> 原文：[Making a Responsive Pyramidal Grid With Modern CSS](https://css-tricks.com/making-a-responsive-pyramidal-grid-with-modern-css/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 用现代 CSS 打造响应式金字塔网格

在[上一篇文章](https://css-tricks.com/responsive-hexagon-grid-using-modern-css/)中，我们构建了经典的六边形网格。那是一个无需媒体查询的响应式实现。当时的挑战是用现代 CSS 改进一种[五年前的方法](https://css-tricks.com/hexagons-and-beyond-flexible-responsive-grid-patterns-sans-media-queries/)。

由于该技术使用了近期发布的新特性，包括 [corner-shape](https://css-tricks.com/almanac/properties/c/corner-shape/)、[sibling-index()](https://css-tricks.com/almanac/functions/s/sibling-index/) 和[单位除法](https://caniuse.com/mdn-css_types_calc_typed_division_produces_unitless_number)，目前仅限 Chrome 支持。

CodePen Embed Fallback

在本文中，我们将探索另一种类型的网格：金字塔式网格。我们仍然使用六边形形状，但采用不同的元素排列方式。

一张演示胜过千言万语：

CodePen Embed Fallback

为了更好地观察效果，请打开[演示的整页视图](https://codepen.io/t_afif/full/bNeYmwb)查看金字塔结构。在调整屏幕大小时，你会看到底部开始呈现出与上一篇文章中创建的网格类似的响应式行为！

酷吧？这一切都是在没有任何媒体查询、JavaScript 或大量 hacky CSS 的情况下完成的。你可以添加任意数量的元素，一切都会自动完美调整。

在开始之前，建议你先阅读[上一篇文章](https://css-tricks.com/responsive-hexagon-grid-using-modern-css/)，如果你还没读过的话。我会跳过一些在那里已经解释过的内容，比如形状是如何创建的，以及我将在这里复用的一些公式。与上一篇文章类似，金字塔网格的实现是对[五年前方法](https://css-tricks.com/hexagons-and-beyond-flexible-responsive-grid-patterns-sans-media-queries/)的改进，所以如果你想比较 2021 年和 2026 年的实现，也可以查看那篇旧文章。

### 初始配置

这次我们将使用 CSS Grid 而不是 Flexbox。有了这种结构，就更容易控制列和行中项目的放置，而不必调整 margin。

```html
<div class="container">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <!-- 等等 -->
</div>
```

```css
.container {
  --s: 40px;  /* 尺寸 */
  --g: 5px;   /* 间隙 */

  display: grid;
  grid-template-columns: repeat(auto-fit, var(--s) var(--s));
  justify-content: center;
  gap: var(--g);
}

.container * {
  grid-column-end: span 2;
  aspect-ratio: cos(30deg);
  border-radius: 50% / 25%;
  corner-shape: bevel;
  margin-bottom: calc((2*var(--s) + var(--g))/(-4*cos(30deg)));
}
```

我使用[经典的 repeat auto-fit](https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/) 来创建尽可能多的列以适应可用空间。对于项目，我使用与上一篇文章相同的代码来创建六边形形状。

你写了两次 `var(--s)`，是笔误吗？

不是！我希望网格始终有偶数列，每个项目占两列（这就是我使用 `grid-column-end: span 2` 的原因）。有了这种配置，我可以轻松控制不同行之间的偏移。

上面是 DevTools 显示网格结构的截图。例如，如果项目 2 占据第 3 和第 4 列，那么项目 4 应该占据第 2 和第 3 列，项目 5 应该占据第 4 和第 5 列，以此类推。

响应式部分也是同样的逻辑。每隔一行的第一个项目向右偏移一列，从第二列开始。

使用这种配置，项目的大小将等于 `2*var(--s) + var(--g)`。因此，负的 bottom margin 与上一个示例不同。

所以，不是这样：

```css
margin-bottom: calc(var(--s)/(-4*cos(30deg)));
```

……我使用的是：

```css
margin-bottom: calc((2*var(--s) + var(--g))/(-4*cos(30deg)));
```

CodePen Embed Fallback

到目前为止没什么特别的，但我们已经完成了 80% 的代码。信不信由你，我们只差一个属性就能完成整个网格。我们需要做的就是为少数元素设置 [grid-column-start](https://css-tricks.com/almanac/properties/g/grid-column/grid-column-start/)，使其正确放置，你可能已经猜到，这里涉及复杂计算，是最棘手的部分。

### 金字塔网格

假设容器足够大，可以包含所有元素的金字塔。换句话说，我们暂时忽略响应式部分。让我们分析结构并尝试识别模式：

无论项目数量如何，结构在某种程度上是静态的。左侧的项目（即每行的第一个项目）总是相同的（1、2、4、7、11 等）。一个简单的解决方案是使用 `:nth-child()` 选择器来定位它们。

```css
:nth-child(1) { grid-column-start: ?? }
:nth-child(2) { grid-column-start: ?? }
:nth-child(4) { grid-column-start: ?? }
:nth-child(7) { grid-column-start: ?? }
:nth-child(11) { grid-column-start: ?? }
/* 等等 */
```

它们的位置是相互关联的。如果项目 1 放在第 `x` 列，那么项目 2 应该放在第 `x - 1` 列，项目 4 在第 `x - 2` 列，以此类推。

```css
:nth-child(1) { grid-column-start: x - 0 } /* 0 不是必需的，但有助于看清模式 */
:nth-child(2) { grid-column-start: x - 1 }
:nth-child(4) { grid-column-start: x - 2 }
:nth-child(7) { grid-column-start: x - 3 }
:nth-child(11) { grid-column-start: x - 4 }
/* 等等 */
```

项目 1 逻辑上放在中间，所以如果我们的网格包含 `N` 列，那么 `x` 等于 `N/2`：

```css
:nth-child(1) { grid-column-start: N/2 - 0 }
:nth-child(2) { grid-column-start: N/2 - 1 }
:nth-child(4) { grid-column-start: N/2 - 2 }
:nth-child(7) { grid-column-start: N/2 - 3 }
:nth-child(11) { grid-column-start: N/2 - 4 }
```

由于每个项目占据两列，`N/2` 也可以看作容器中可以容纳的项目数量。所以，让我们更新逻辑，将 `N` 视为项目数量而不是列数。

```css
:nth-child(1) { grid-column-start: N - 0 }
:nth-child(2) { grid-column-start: N - 1 }
:nth-child(4) { grid-column-start: N - 2 }
:nth-child(7) { grid-column-start: N - 3 }
:nth-child(11) { grid-column-start: N - 4 }
/* 等等 */
```

要计算项目数量，我将使用与上一篇文章相同的公式：

```
N = round(down, (container_size + gap) / (item_size + gap));
```

唯一的区别是项目大小不再是 `var(--s)`，而是 `2*var(--s) + var(--g)`，这给我们带来以下 CSS：

```css
.container {
  --s: 40px;  /* 尺寸 */
  --g: 5px;   /* 间隙 */

  container-type: inline-size; /* 我们使其成为容器以使用 100cqw */
}

.container * {
  --_n: round(down,(100cqw + var(--g))/(2*(var(--s) + var(--g))));
}

.container *:nth-child(1) { grid-column-start: calc(var(--_n) - 0) }
.container *:nth-child(2) { grid-column-start: calc(var(--_n) - 1) }
.container *:nth-child(4) { grid-column-start: calc(var(--_n) - 2) }
.container *:nth-child(7) { grid-column-start: calc(var(--_n) - 3) }
.container *:nth-child(11) { grid-column-start: calc(var(--_n) - 4) }
/* 等等 */
```

CodePen Embed Fallback

成功了！我们有了金字塔结构。它还不是响应式的，但我们马上就会做到。顺便说一句，如果你的目标是构建具有固定数量项目的这种结构，并且不需要响应式行为，那么上面的代码就完美了，你已经完成了！

为什么所有项目都正确放置了？我们只定义了少数项目的列，并且没有指定任何行！

这就是 CSS Grid 自动放置算法的威力。当你为项目定义列时，下一个项目会自动放在它后面！我们不需要为所有项目手动指定一堆列和行。

### 改进实现

你不喜欢那些冗长的 `:nth-child()` 选择器，对吧？我也是，所以让我们移除它们，获得更好的实现。这样的金字塔在数学界是众所周知的，我们有一个叫做[三角数](https://en.wikipedia.org/wiki/Triangular_number)的东西，我将使用它。别担心，我不会开数学课，所以这是我将使用的公式：

```
j*(j + 1)/2 + 1 = index
```

……其中 `j` 是正整数（包括零）。

理论上，所有 `:nth-child` 可以使用以下伪代码生成：

```css
for(j = 0; j< ?? ;j++) {
  :nth-child(j*(j + 1)/2 + 1) { grid-column-start: N - j }
}
```

CSS 中没有循环，所以我将遵循与上一篇文章相同的逻辑（希望你读过，否则会有点跟不上）。我用索引来表达 `j`。我解出了之前的公式，这是一个二次方程，但我相信你不想深入所有这些数学。

```
j = sqrt(2*index - 1.75) - .5
```

我们可以使用 [sibling-index()](https://css-tricks.com/almanac/functions/s/sibling-index/) 函数获取索引。逻辑是测试每个项目的 `sqrt(2*index - 1.75) - .5` 是否为正整数。

```css
.container {
  --s: 40px; /* 尺寸 */
  --g: 5px; /* 间隙 */

  container-type: inline-size; /* 我们使其成为容器以使用 100cqw */
}
.container * {
  --_n: round(down,(100cqw + var(--g))/(2*(var(--s) + var(--g))));
  --_j: calc(sqrt(2*sibling-index() - 1.75) - .5);
  --_d: mod(var(--_j),1);
  grid-column-start: if(style(--_d: 0): calc(var(--_n) - var(--_j)););
}
```

当 `--_d` 变量等于 `0` 时，意味着 `--_j` 是整数；在这种情况下，我将列设置为 `N - j`。我不需要测试 `--_j` 是否为正，因为它总是正的。最小的索引值是 1，所以 `--_j` 的最小值是 `0`。

CodePen Embed Fallback

嗒哒！我们用三行 CSS 替换了所有 `:nth-child()` 选择器，可以覆盖任意数量的项目。现在让我们让它变成响应式的！

### 响应式行为

[在我 2021 年的文章中](https://css-tricks.com/hexagons-and-beyond-flexible-responsive-grid-patterns-sans-media-queries/#aa-wait-one-more-a-pyramidal-grid)，我根据屏幕大小在金字塔网格和经典网格之间切换。这次我要做点不同的。我将继续构建金字塔，直到不再可能，从那以后，它将变成经典网格。

项目 1 到 28 构成金字塔。之后，我们得到与上一篇文章构建的相同的经典网格。我们需要定位某些行的第一个项目（29、42 等）并偏移它们。这次我们不会在左侧设置 margin，但需要将它们的 `grid-column-start` 值设置为 `2`。

像往常一样，我们识别项目的公式，用索引表达它，然后测试结果是否为正整数：

```
N*i + (N - 1)*(i - 1) + 1 + N*(N - 1)/2 = index
```

所以：

```
i = (index - 2 + N*(3 - N)/2)/(2*N - 1)
```

当 `i` 为正整数（不包括零）时，我们将列起始设置为 `2`。

```css
.container {
  --s: 40px; /* 尺寸 */
  --g: 5px; /* 间隙 */

  container-type: inline-size; /* 我们使其成为容器以使用 100cqw */
}
.container * {
  --_n: round(down,(100cqw + var(--g))/(2*(var(--s) + var(--g))));

  /* 金字塔网格的代码 */
  --_j: calc(sqrt(2*sibling-index() - 1.75) - .5);
  --_d: mod(var(--_j),1);
  grid-column-start: if(style(--_d: 0): calc(var(--_n) - var(--_j)););

  /* 响应式网格的代码 */
  --_i: calc((sibling-index() - 2 + (var(--_n)*(3 - var(--_n)))/2)/(2*var(--_n) - 1));
  --_c: mod(var(--_i),1);
  grid-column-start: if(style((--_i > 0) and (--_c: 0)): 2;);
}
```

与 `--_j` 变量不同，我需要测试 `--_i` 是否为正值，因为对于某些索引值它可能为负。因此，与第一个相比，我多了一个条件。

但等等！这根本不行。我们声明了两次 `grid-column-start`，所以只有一个会被使用。我们应该只有一个声明，为此，我们可以使用单个 [if()](https://css-tricks.com/if-css-gets-inline-conditionals/) 语句将两个条件组合起来：

```css
grid-column-start:
if(
  style((--_i > 0) and (--_c: 0)): 2; /* 第一个条件 */
  style(--_d: 0): calc(var(--_n) - var(--_j)); /* 第二个条件 */
);
```

如果第一个条件为真（响应式网格），我们将值设置为 `2`；否则如果第二个条件为真（金字塔网格），我们将值设置为 `calc(var(--_n) - var(--_j))`；否则我们什么都不做。

为什么是那个特定的顺序？

因为响应式网格应该有更高的优先级。查看下图：

项目 29 是金字塔网格的一部分，因为它是其行的第一个项目。这意味着金字塔条件对该项目始终为真。但当网格变为响应式时，该项目成为响应式网格的一部分，另一个条件也为真。当两个条件都为真时，响应式条件应该获胜；这就是为什么它是我们首先测试的条件。

让我们看看效果：

CodePen Embed Fallback

哎呀！金字塔看起来不错，但之后事情变得混乱了。

要理解发生了什么，让我们具体看看项目 37。如果你查看上图，会注意到它是金字塔结构的一部分。所以，即使网格变为响应式，它的条件仍然为真，它从公式 `calc(var(--_n) - var(--_j))` 获得列值，这不好，因为我们希望保持其默认值以进行自动放置。许多项目都是这种情况，所以我们需要修复它们。

为了找到修复方法，让我们看看金字塔中的值如何变化。它们都遵循公式 `N - j`，其中 `j` 是正整数。例如，如果 `N` 等于 10，我们得到：

```
10, 9, 8, 7, ... ,0, -1 , -2
```

在某些点，值变为负数，由于负值是有效的，这些项目将被随机放置，破坏网格。我们需要确保忽略负值，并改用默认值。

我们使用以下方法只保留正值并将所有负值转换为零：

```css
max(0, var(--_n) - var(--_j))
```

我们将 `0` 设为最小边界（[更多信息在此](https://css-tip.com/min-max/)），值变为：

```
10, 9, 8, 7, ... , 0, 0, 0, 0
```

我们要么得到列的正值，要么得到 `0`。

但你说值应该是默认值而不是 `0`。

是的，但 `0` 对 `grid-column-start` 是无效值，所以使用 `0` 意味着浏览器会忽略它并回退到默认值！

我们的新代码是：

```css
grid-column-start:
  if(
    style((--_i > 0) and (--_c: 0)): 2; /* 第一个条件 */
    style(--_d: 0): max(0,var(--_n) - var(--_j)); /* 第二个条件 */
  );
```

成功了！

CodePen Embed Fallback

你可以添加任意数量的项目，调整屏幕大小，一切都会完美适应！

### 更多示例

代码和数学已经够了！让我们用不同形状享受更多变化。我把代码剖析留给你作为作业。

#### 菱形网格

CodePen Embed Fallback

在接下来三个演示中，你会注意到设置元素之间间隙的方法略有不同。

#### 八边形网格

CodePen Embed Fallback

#### 圆形网格

CodePen Embed Fallback

以及另一个六边形网格：

CodePen Embed Fallback

### 结论

还记得我说过我们离完成网格只差一个属性吗？那个属性（`grid-column-start`）让我们花了整篇文章来讨论！这说明 CSS 已经 evolved，需要新的思维方式来使用。CSS 不再是一种你只需设置静态值的语言，比如 `color: red`、`margin: 10px`、`display: flex` 等。

现在我们可以通过复杂计算定义动态行为。这是一个完整的思考过程：找公式、定义变量、创建条件等等。这并不是什么新鲜事，因为我在 2021 年就能做到同样的事情。然而，我们现在有了更强大的特性，使我们能够拥有更少 hacky 的代码和更灵活的实现。
