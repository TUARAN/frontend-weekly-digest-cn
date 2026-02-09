# 为 `::search-text` 及其它“高亮类”伪元素设置样式

> 原文：[Styling ::search-text and Other Highlight-y Pseudo-Elements](https://css-tricks.com/styling-search-text-and-other-highlight-y-pseudo-elements/)  
> 作者：Daniel Schwarz  
> 日期：2026年01月28日  
> 翻译：田八  

Chrome 144 最近发布了 `::search-text`，它现在是多个“高亮相关”伪元素中的一个。这个伪元素会选择“页内查找（find-in-page）”的匹配文本——也就是你在页面里按下 `Ctrl`/`Command` + `F` 搜索某个内容并找到匹配项时，被高亮出来的那段文字。

默认情况下，`::search-text` 的匹配项会显示为黄色，而当前命中的目标（`::search-text:current`）会显示为橙色。不过，`::search-text` 让我们可以把这些默认样式改掉。

老实说，我之前并没有怎么关注这些高亮伪元素。直到现在我才知道它们有一个统一的称呼，不过这挺好的——有了名字，就更容易把它们都归拢起来做对比，而这正是我今天要做的事。因为只看伪元素的名字，并不那么直观能理解它到底选中了什么。我也会解释为什么我们能够自定义它们，并给出一些建议。

### 不同类型的高亮伪元素

| 伪选择器 | 选中…… | 备注 |
| --- | --- | --- |
| `::search-text` | 页内查找的匹配项 | `::search-text:current` 会选择当前目标 |
| [`::target-text`](https://css-tricks.com/almanac/pseudo-selectors/t/target-text/) | 文本片段（text fragments） | 文本片段允许用 URL 参数进行编程式高亮。如果你是通过搜索引擎跳转到某个网站，它可能会用到文本片段，因此 `::target-text` 很容易和 `::search-text` 混淆。 |
| [`::selection`](https://css-tricks.com/almanac/pseudo-selectors/s/selection/) | 用指针（鼠标/触摸）高亮的文本 |  |
| [`::highlight()`](https://css-tricks.com/css-custom-highlight-api-early-look/) | 由 JavaScript 的 [Custom Highlight API](https://css-tricks.com/css-custom-highlight-api-early-look/) 定义的自定义高亮 |  |
| [`::spelling-error`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::spelling-error) | 拼写错误的词 | 基本只适用于可编辑内容 |
| [`::grammar-error`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::grammar-error) | 语法错误 | 基本只适用于可编辑内容 |

另外别忘了还有 [`<mark>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/mark) 这个 HTML 元素——下面的 demo 里我也会用到它。

### 高亮伪元素应该长什么样？

问题在于：如果它们（除了 `::highlight()`）都已经有默认样式了，那我们为什么还需要用伪元素去选中它们？原因是可访问性（尤其是颜色对比度）和可用性（强调效果）。举个例子：如果 `::search-text` 默认的黄色背景和文字颜色之间对比不够，或者它在某个容器的背景上不够显眼，那么你就会想把它改掉。

我相信有很多方法能解决这个问题（我很想在评论里听到一句 *“challenge accepted”*），但我能想到的最好方案是使用 [relative color syntax](https://css-tricks.com/css-color-functions/#aa-the-relative-color-syntax)。在意识到很多 CSS 属性在高亮伪元素上是禁用的之前，我在 `background-clip: text` 和 `backdrop-filter: invert(1)` 这两条路上都走偏了：

```css
body {
  --background: #38003c;
  background: var(--background);

  mark,
  ::selection,
  ::target-text,
  ::search-text {
    /* Match color to background */
    color: var(--background);

    /* Convert to RGB then subtract channel value from channel maximum (255) */
    background: rgb(from var(--background) calc(255 - r) calc(255 - g) calc(255 - b));
  }
}
```

Demo（CodePen）： https://codepen.io/anon/pen/ogLZeQN

你的浏览器可能还不支持这些特性，所以这里有一段视频，展示高亮文本如何随着背景颜色变化而自适应。

<video controls preload="metadata" style="max-width: 100%;">
  <source src="./assets/videos/screen-recording-2026-01-21.mov" type="video/quicktime" />
</video>

原视频地址： https://css-tricks.com/wp-content/uploads/2026/01/Screen-Recording-2026-01-21-at-10.28.07-AM.mov

这里发生的事情是：我把容器的背景色转换成 RGB 格式，然后从每个通道（`r`、`g` 和 `b`）的最大值 `255` 中减去该通道的值。这样每个通道都会被“反相”，从而得到整体反相后的颜色。然后把这个颜色作为高亮背景色，就能保证它无论在什么背景上都足够显眼。并且多亏了新的 [CodePen slideVars](https://css-tricks.com/playing-with-codepen-slidevars/)，你可以在 demo 里随便调参数来观察效果。也许除了 RGB 之外还有别的颜色格式也能做到，但 RGB 最简单。

可用性讲完了，那可访问性呢？

高亮文本的颜色会设置为容器的背景色，这是因为我们知道它就是 *高亮背景色* 的反相色。虽然这并不意味着这两种颜色一定能达到可访问性的对比度要求，但看起来它们在大多数情况下应该是可以的（不过无论如何，你都应该用 [颜色对比度工具](https://css-tricks.com/color-contrast-accessibility-tools/) 去检查）。

如果你不喜欢这种“反相颜色带来的随机感”，也完全能理解。你当然可以手动挑选颜色，然后写条件 CSS 来处理，但要为各种高亮伪元素在不同的背景层级上找到既显眼又无障碍的颜色，同时还要考虑暗色模式等替代显示模式……这就很折磨了。而且我觉得某些 UI 元素（比如：高亮、错误提示、焦点指示器）*就应该* 丑一点。它们 *就应该* 以一种偏粗野主义（brutalist）的方式狠狠突出，刻意与设计的调色盘“格格不入”。它们应当通过“不融入”来索取最大注意力。

同时也要记住：不同类型的高亮伪元素在视觉上也应该彼此可区分——原因很明显；并且当两种高亮发生重叠时（例如：用户选中了正好被页内查找匹配的文本），这种区分就更重要了。因此在下面这段改进后的代码里，`mark`、`::selection`、`::target-text` 和 `::search-text` 都会使用略有差别的背景。

我让 `mark` 保持不变；让 `::selection` 的 `r` 通道保持原值；让 `::target-text` 的 `g` 通道保持原值；让 `::search-text` 的 `b` 通道保持原值。这样一来，后三者都只反相了两个通道，而不是三个通道。它们的颜色会更有差异（但仍然有“反相”的味道）。再加上 `70%` 的 alpha（`::search-text:current` 则是 `100%`），它们还会彼此融合，这样我们就能看清每个高亮从哪里开始、到哪里结束：

<video controls preload="metadata" style="max-width: 100%;">
  <source src="./assets/videos/highlights.mov" type="video/quicktime" />
</video>

原视频地址：https://css-tricks.com/wp-content/uploads/2026/01/highlights.mov

```css
body {
  --background: #38003c;
  background: var(--background);

  mark,
  ::selection,
  ::target-text,
  ::search-text {
    color: var(--background);
  }

  mark {
    /* Invert all channels */
    background: rgb(from var(--background) calc(255 - r) calc(255 - g) calc(255 - b) / 70%);
  }

  ::selection {
    /* Invert all channels but R */
    background: rgb(from var(--background) r calc(255 - g) calc(255 - b) / 70%);
  }

  ::target-text {
    /* Invert all channels but G */
    background: rgb(from var(--background) calc(255 - r) g calc(255 - b) / 70%);
  }

  ::search-text {
    /* Invert all channels but B */
    background: rgb(from var(--background) calc(255 - r) calc(255 - g) b / 70%);

    &:current {
      /* Invert all channels but B, but without transparency */
      background: rgb(from var(--background) calc(255 - r) calc(255 - g) b / 100%);
    }
  }
}
```

Demo（CodePen）：https://codepen.io/anon/pen/GgqWzax

`::spelling-error` 和 `::grammar-error` 没有包含在这些示例里，因为它们有自己的视觉提示（分别是红色下划线和绿色下划线），并且通常是在类似 `<textarea>` 这样的可编辑元素的中性背景上显示。

但 `mark`、`::selection`、`::target-text`，以及 Chrome 新增的 `::search-text` 呢？它们可能出现在任何地方（甚至叠在一起），所以我认为重要的是：它们既要始终可访问，又要彼此视觉上足够可区分。不过要再次强调：即使是完全反相的颜色，也可能不满足无障碍对比度。事实上，`#808080` 的反相还是 `#808080`，所以要测试、测试、再测试！也许等到 [CSS Color Module Level 5](https://www.w3.org/TR/css-color-5/#funcdef-contrast-color) 里的 [`contrast-color()`](https://css-tricks.com/exploring-the-css-contrast-color-function-a-second-time/) 真正落地时，它能来救场。

在那之前，*拜托了*，别再增加更多“高亮类”的元素了！
