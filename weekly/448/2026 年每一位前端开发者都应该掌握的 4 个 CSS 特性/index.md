# 2026 年每一位前端开发者都应该掌握的 4 个 CSS 特性

> 原文：[4 CSS Features Every Front-End Developer Should Know In 2026 · January 7, 2026](https://nerdy.dev/4-css-features-every-front-end-developer-should-know-in-2026)
>
> 翻译：[嘿嘿](https://blog.heyfe.org/blog)

2026 年了，我觉得每一位前端开发者都应该学会如何查询[滚动状态（scroll states）](#scroll-state-container-queries)、如何使用 [`text-box`](#trim-typographic-whitespace-with-text-box) 消除排版留白、利用 [`sibling-index()`](#sibling-index-and-sibling-count) 实现交错效果，以及掌握[类型安全的 `attr()`](#advanced-attr%28%29-with-type-checking)。

**这还只是 2025 年发布的众多必知 CSS 特性中的一部分。**

这是一个系列文章！
也可以看看 [2023](https://web.dev/articles/6-css-snippets-every-front-end-developer-should-know-in-2023)、[2024](https://web.dev/articles/5-css-snippets-every-front-end-developer-should-know-in-2024) 和 [2025](https://nerdy.dev/6-css-snippets-every-front-end-developer-should-know-in-2025) 年的版本。

## sibling-index() 和 sibling-count()

今年早些时候，这些还只是实验性功能，而现在 Chrome 和 Safari 的稳定版都已经支持了！

它们允许你在计算属性值时，引用元素相对于其兄弟节点的位置。例如，你可以根据元素的 `sibling-index()` 为它们设置不同的过渡延迟（transition-delay），从而实现阶梯式的交错效果。

这里有一个很棒的技巧：减去 1，这样**第一个元素就会立即开始动画**：

```css
li {
  transition: opacity .3s ease;
  /* 使用索引计算延迟，减 1 让首个元素无延迟 */
  transition-delay: calc((sibling-index() - 1) * 100ms);
}
```

再配合 `@starting-style`，你就能轻而易举地实现丝滑的元素入场交错动画！

```css
li {
  transition: opacity .3s ease;
  transition-delay: calc((sibling-index() - 1) * 100ms);

  @starting-style {
    opacity: 0;
  }
}
```

https://codepen.io/argyleink/pen/KwKXPYW

此外，你还可以用它在 `oklch` 颜色空间中旋转色相、自动为元素编号，或者玩出各种花样。

相关资源：
* [我之前写的博文](https://nerdy.dev/sibling-index)
* [MDN: sibling-index()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/sibling-index)
* [MDN: sibling-count()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/sibling-count)
* [Brecht 的文章](https://utilitybend.com/blog/styling-siblings-with-CSS-has-never-been-easier.-Experimenting-with-sibling-count-and-sibling-index/)
* [CSS Tricks](https://css-tricks.com/almanac/functions/s/sibling-index/)

## @container scroll-state()

在我看来，这些特性非常适合做渐进增强（类似于[滚动驱动动画](https://scroll-driven-animations.style/)），因为它们更像是画龙点睛的增强，而非硬性需求。

现在，滚动容器（scroller）的三种状态已经可以被查询了：
[stuck（粘性固定）](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Conditional%5Frules/Container%5Fscroll-state%5Fqueries#using%5Fstuck%5Fqueries)、[snapped（吸附）](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Conditional%5Frules/Container%5Fscroll-state%5Fqueries#using%5Fsnapped%5Fqueries)、[scrollable（可滚动）](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@container#scrollable) 以及 scrolled（已滚动）。

首先，你需要给那个处于 stuck、snapped 或 scrollable 状态的元素设置 `container-type: scroll-state`。然后，其子元素就可以通过 `@container scroll-state()` 来查询它。

虽然元素不能查询自身的状态，但它的伪元素可以！

### stuck

你可以完美地捕捉到 `position: sticky` 元素何时处于“吸附固定”状态。

https://nerdy.dev/media/scroll-state-stuck.mp4

```css
/* 当 .outer-navbar 吸附固定时 */
@container scroll-state(stuck) {
  .inner-navbar {
    box-shadow: var(--shadow-3);
  }
}
```

利用这个特性，你可以提示用户：该元素现在正悬浮在滚动内容之上。

### snapped

能够精准得知滚动吸附（scroll-snap）对齐何时处于激活状态。

```css
/* 当 <li> 父元素吸附时 */
@container scroll-state(snapped) {
  .box {
    scale: 1.1;
  }
}

/* 或者当它没被吸附时！ */
@container not scroll-state(snapped) {
  .box figcaption {
    translate: 0 100%;
  }
}
```

非常适合用来突出显示当前项，或者弱化其他项。

### scrollable

精准判断内容是否溢出了容器，以及在哪个方向上溢出。

```css
@container scroll-state(scrollable) {
  .scroll-hint {
    opacity: 1;
  }
}
```

可以用它来切换提示信息、显示滚动指示器，或者调整内边距以暗示还有更多内容。

### scrolled

精准得知内容是否已向某个方向滚动。

```css
@container scroll-state(scrolled: bottom) {
  translate: 0 -100%;
}
```

非常适合做那种根据滚动方向自动显示或隐藏的粘性页眉或导航栏。

相关资源：
* [Chrome 官方博客](https://developer.chrome.com/blog/css-scroll-state-queries)
* [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Conditional%5Frules/Container%5Fscroll-state%5Fqueries)
* [Una 谈 scrolled](https://una.im/scroll-state-scrolled)
* [Bramus 谈 scrolled](https://www.bram.us/2025/10/22/solved-by-css-scroll-state-queries-hide-a-header-when-scrolling-down-show-it-again-when-scrolling-up/)
* [我复刻的 Switch 主页](http://localhost:3030/nintendo-switch-homescreen-css-recreation)
* [The CSS Podcast 关于状态查询的章节](http://localhost:3030/the-css-podcast-on-state-queries)

## text-box

`text-box` 让你能直接切掉文本框自带的“半行间距（half-leading）”！

Web 字体渲染时，[为了“安全间距”，通常会在字形上下保留一些空白](https://matthiasott.com/notes/the-thing-with-leading-in-css)，但有时我们需要像素级的对齐，比如对齐到基线（baseline）或大写高度（x-height）。

![](https://nerdy.dev/media/text-box-trim-cap.png "标题") 

通过以下代码即可实现上图的效果：

```css
h1 {
  text-box: trim-both cap alphabetic;
}
```

这行简短的代码裁掉了大写高度以上的空间以及字母基线以下的空间。

https://nerdy.dev/media/text-box-trimmed.mp4

[在我的交互式笔记本中了解更多信息](https://nerdy.dev/notebook/text-box.html)

这绝对是排版控和网格对齐狂魔的福音。我觉得它[终将成为默认标准](https://nerdy.dev/text-box-ftw)。

相关资源：
* [Chrome 博客文章](https://developer.chrome.com/blog/css-text-box-trim)
* [交互式笔记本](https://nerdy.dev/notebook/text-box.html)
* [Codepen 集合](https://codepen.io/collection/zxQBaL)
* [Una 和我在 Syntax 播客上的讨论](http://localhost:3030/CSS4-and-CSS5-with-Una-and-SyntaxFM)

## 强化版 attr()

[`attr()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/attr) 出了一个进阶版：支持类型安全，且功能更强大。

它允许你**在 CSS 中直接使用 HTML 属性**，并且带类型检查和回退方案。

**传递颜色值：**

```html
<div data-bg="white" data-fg="deeppink"></div>
```

```css
.theme {
  /* 使用 data-bg 颜色，回退值为黑色 */
  background: attr(data-bg color, black);
  /* 使用 data-fg 颜色，回退值为白色 */
  color: attr(data-fg color, white);
}
```

**传递数字：**

```html
<div class="grid" data-columns="3">…</div>
```

```css
.grid {
  --_columns: attr(data-columns number, 3);

  display: grid;
  grid-template-columns: repeat(var(--_columns), 1fr);
}
```

这在 HTML 和 CSS 之间架起了一座强大的桥梁。

下面是一个滚动吸附的例子，CSS 基本上控制了枚举选项，而 HTML 必须传递有效的值才能获得预期的吸附效果：

```html
<li scroll-snap="start"></li>
<li scroll-snap="center"></li>
<li scroll-snap="end"></li>
<li scroll-snap="nothing"></li>
```

```css
[scroll-snap] {
  /* type() 函数会将属性值与允许的关键字进行匹配校验 */
  scroll-snap-align: attr(scroll-snap type(start | center | end));
}
```

[`type()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/type) 函数会根据允许的关键字校验属性值。无效的值则会平滑地回退。

[在 Codepen 上试试看](https://codepen.io/argyleink/pen/qEWyZgx)

相关资源：
* [我 2025 年写的相关文章](https://nerdy.dev/advanced-attr)
* [Codepen 示例](https://codepen.io/argyleink/pen/qEWyZgx)
* [Chrome Developers 文章](https://developer.chrome.com/blog/advanced-attr)
* [Temani Afif 的文章](https://css-tip.com/value-input/)
* [Temani 的滑块提示工具](https://codepen.io/t%5Fafif/pen/MWdmZPL)

**CSS 真的强。**
