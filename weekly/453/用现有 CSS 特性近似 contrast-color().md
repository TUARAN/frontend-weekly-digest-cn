> 原文：[Approximating contrast-color() With Other CSS Features](https://css-tricks.com/approximating-contrast-color-with-other-css-features/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 用现有 CSS 特性近似 contrast-color()

你有一个可配置背景色的元素，希望计算出前景文字应该用浅色还是深色。听起来很简单，尤其考虑到我们对可访问性应当格外用心。

这类功能已经有若干规范草案，最新的是 [contrast-color()](https://css-tricks.com/exploring-the-css-contrast-color-function-a-second-time/)（前身为 `color-contrast()`），出自 [CSS Color Module Level 5 草案](https://drafts.csswg.org/css-color-5/#contrast-color)。但目前只有 Safari 和 Firefox 实现了它，最终版本恐怕还有一段路要走。与此同时，CSS 已经增加了很多新能力；多到我想试试能否在今天就用一种跨浏览器友好的方式实现它。下面是我得到的结果：

```css
color: oklch(from <your color round(1.21 - L) 0 0);
```

让我解释一下推导过程。

### WCAG 2.2

WCAG 给出了计算两个 RGB 颜色对比度的公式，[Stacie Arellano 曾做过非常详细的说明](https://css-tricks.com/understanding-web-accessibility-color-contrast-guidelines-and-ratios/#aa-what-does-the-ratio-mean)。它基于较旧的方法，计算颜色的亮度（视觉上的明暗程度），甚至考虑了显示器限制和屏幕反光带来的影响：

```none
L1 + 0.05 / L2 + 0.05
```

……其中较亮的颜色（`L1`）在分子。亮度范围是 0 到 1，这个分数决定了对比度从 1（1.05/1.05）到 21（1.05/.05）。

计算 RGB 颜色亮度的公式更复杂，但我只需要判断黑色和白色谁与给定颜色的对比度更高，所以可以适当简化。最终得到类似这样的式子：

```none
L = 0.1910(R/255+0.055)^2.4 + 0.6426(G/255+0.055)^2.4 + 0.0649(B/255+0.055)^2.4
```

我们可以把它转换成 CSS，像这样：

```css
calc(.1910*pow(r/255 + .055,2.4)+.6426*pow(g/255 + .055,2.4)+.0649*pow(b/255 + .055,2.4))
```

我们可以用 [round()](https://css-tricks.com/almanac/functions/r/round/) 把整个结果四舍五入为 1 或 0，1 代表白色，0 代表黑色：

```css
round(.67913 - .1910*pow(r/255 + .055, 2.4) - .6426*pow(g/255 + .055, 2.4) - .0649*pow(b/255 + .055, 2.4))
```

然后乘以 255，并用 [相对颜色语法](https://css-tricks.com/css-color-functions/#aa-the-relative-color-syntax) 应用到三个通道，得到：

```css
color: rgb(from <your color  
  round(173.178 - 48.705*pow(r/255 + .055, 2.4) - 163.863*pow(g/255 + .055, 2.4) - 16.5495*pow(b/255 + .055, 2.4), 255)  
  round(173.178 - 48.705*pow(r/255 + .055, 2.4) - 163.863*pow(g/255 + .055, 2.4) - 16.5495*pow(b/255 + .055, 2.4), 255)  
  round(173.178 - 48.705*pow(r/255 + .055, 2.4) - 163.863*pow(g/255 + .055, 2.4) - 16.5495*pow(b/255 + .055, 2.4), 255)  
);
```

CodePen Embed Fallback

这个公式在给定颜色时，根据 WCAG 2 返回白色或黑色。不太易读，但能用……不过 [APCA](https://git.myndex.com/) 很可能会[在未来 WCAG 指南中取代它，作为更新更好的公式](https://www.smashingmagazine.com/2025/05/wcag-3-proposed-scoring-model-shift-accessibility-evaluation/)。我们可以重新按 APCA 算一遍，但 APCA 的公式更复杂。虽然可以借助 CSS 函数稍作整理，但最终这个实现还是会难以阅读、难以维护，而且不够通用。

### 新思路

我退一步想了想我们还能用什么。我们确实有一个可以尝试的新特性：[色彩空间](https://css-tricks.com/color-everything-in-css/#aa-color-spaces)。CIELAB 色彩空间中的「L*」值表示感知亮度，旨在反映人眼的感受。它和 luminance 不完全一样，但很接近。也许可以根据感知亮度来猜测用黑色还是白色对比更好；我们试试能否找到一个阈值，低于它用黑色，高于它用白色。

你可能会直觉想到 50% 或 0.5，但其实不是。很多颜色即使很亮，和白色对比仍然比和黑色更好。下面是用 [lch()](https://css-tricks.com/almanac/functions/l/lch/) 的例子，保持色相不变，逐渐提高亮度：

CodePen Embed Fallback

通常来说，黑色文字比白色更易读的转折点出现在 60–65 之间。于是我用 [Colorjs.io](http://colorjs.io/) 写了一个小 Node 程序，用 APCA 计算对比度，找出合理的阈值。

对于 [oklch()](https://css-tricks.com/almanac/functions/o/oklch/)，我发现阈值大约在 0.65 到 0.72 之间，平均约为 0.69。

换句话说：

- 在 0.65 到 0.72 之间，通常黑色和白色的对比度都在 45–60 左右。
- 低于 0.65 时，白色始终比黑色对比更好。
- 当 OKLCH 亮度在 0.72 及以上时，黑色始终比白色对比更好。

所以，只要用 `round()` 和 0.72 作为上界，就能得到一个更短的实现：

```css
color: oklch(from <your color round(1.21 - L) 0 0);
```

CodePen Embed Fallback

如果你好奇 1.21 从哪来的：这样 0.72 会向下舍入，0.71 会向上舍入：`1.21 - .72 = .49` 向下舍入，`1.21 - .71 = .5` 向上舍入。

这个公式在实际项目中迭代了几次，效果不错。更易读、也更好维护。不过需要说明，它更接近 APCA 而非 WCAG，所以有时会和 WCAG 不一致。例如，WCAG 认为在 `#407ac2` 上黑色对比更高（4.70 对 4.3），而 APCA 结论相反：黑色 33.9，白色 75.7。新的 CSS 公式跟 APCA 一致，因此显示白色：

可以说，这个公式可能比 WCAG 2.0 更符合实际观感，因为它更贴近 APCA。但如果你在法律上必须遵守 WCAG 而不是 APCA，那这个更简单的公式对你可能帮助有限，你还是需要单独检查可访问性。

### LCH vs OKLCH

我也对两者都做过计算，除了 OKLCH 本身是设计来替代 LCH 的，数据也显示 OKLCH 更合适。

在 LCH 中，「太暗不宜用黑色」和「太亮不宜用白色」之间的区间往往更大，而且这个区间会随颜色变动。例如，从 `#e862e5` 到 `#fd76f9` 既太暗不宜用黑色，又太亮不宜用白色。在 LCH 里，这对应亮度 63 到 70；在 OKLCH 里是 0.7 到 0.77。OKLCH 的亮度尺度与 APCA 更匹配。

### 更进一步

虽然「最大对比色」肯定更好，但我们还能多做一步。目前的逻辑只能得到白色或黑色（这也是 [color-contrast() 目前的限制](https://css-tricks.com/exploring-the-css-contrast-color-function-a-second-time/#aa-the-shortcomings-of-contrast-color)），但我们可以改成在白色和另一个给定颜色之间切换，比如白色和正文色。从下面开始：

```css
color: oklch(from <your color round(1.21 - L) 0 0);  

/* 变成： */

--white-or-black: oklch(from <your color round(1.21 - L) 0 0);  
color: rgb(  
  from color-mix(in srgb, var(--white-or-black), <base color>)  
  calc(2*r) calc(2*g) calc(2*b)  
);
```

CodePen Embed Fallback

数学上很巧妙，但可读性一般：

- 若 `--white-or-black` 是黑色，`color-mix()` 会把每个 RGB 通道减半；再乘以 2 就回到原来的 `<base color>`。
- 若 `--white-or-black` 是白色，[color-mix()](https://css-tricks.com/almanac/functions/c/color-mix/) 得到 `rgb(127.5, 127.5, 127.5)` 或更亮；乘以 2 就是 `rgb(255, 255, 255)` 或更高，也就是白色。

遗憾的是，这个公式在 Safari 18 及以下不生效，所以你需要针对 Chrome、Safari 18+ 和 Firefox。但它确实让我们能用纯 CSS 在白色和基准文字色之间切换，而不仅仅是白色和黑色，在 Safari <18 上可以回退到白/黑方案。

你也可以用 [CSS Custom Functions](https://css-tricks.com/css-functions-and-mixins-module-notes/) 重写，但目前并非所有环境都支持：

```css
@function --white-black(--color) {  
  result: oklch(from var(--color) round(1.21 - l) 0 0);  
}

@function --white-or-base(--color, --base) {  
  result: rgb(from color-mix(in srgb, --white-black(var(--color)), var(--base)) calc(2*r) calc(2*g) calc(2*b));  
}
```

CodePen Embed Fallback

### 小结

希望这个技巧对你有用。我想再强调一点：这种「找阈值 + 简单公式」的思路，是为了让实现既灵活又好改。你可以根据需求自由调整阈值。
