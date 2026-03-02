原文：Style Headings using the CSS :heading pseudo  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 使用 CSS 的 `:heading` 伪类为标题设置样式

2026 年 2 月 16 日

`:heading` 伪类让我们可以用一条 CSS 规则选中所有标题元素（`h1` 到 `h6`），而不必每次需要时都写一长串选择器组。

这只是一个小改动，但它代表着一种转变：朝着更好、更有意图、更“语义化”的 CSS 迈进。

## 目前的做法

在 `:heading` 之前，只要我们想给部分或全部标题应用相同的样式，就必须把每个标题元素都列出来：

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: 'Georgia', serif;
  color: #333;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
```

这当然完全能用，但确实有点啰嗦，尤其是当我们要针对某些特定标题重置部分规则时更是如此。而且如果我们在维护一个（或多个）大型代码库，很可能会发现自己在多个文件里重复这种写法。

这倒也不是什么灾难，但看起来多少有点不够利落。

## 轮到 `:heading` 登场

`:heading` 伪类用更干净、更语义化的写法解决了这个问题：

```css
:heading {
  font-family: 'Georgia', serif;
  color: #333;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
```

这样好看多了，读起来也很直观：“对所有标题元素应用这些样式”。意图应该一眼就能看出来。下面是实际效果：

      See the Pen 
  :heading example by Stuart Robson ([@sturobson](https://codepen.io/sturobson))
  on [CodePen](https://codepen.io/).
      

## 选中特定的标题级别

虽然 `:heading` 能让我们一次性选中所有标题，但我们经常还是需要对不同级别的标题应用不同样式。`:heading()` 这种函数式写法可以把多个标题级别分组，从而实现这一点：

```css
/* Major headings - larger and bolder */
:heading(1, 2, 3) {
  font-weight: 700;
  letter-spacing: -0.02em;
  font-size: 2rem;
}

/* Secondary headings - smaller and lighter */
:heading(4, 5, 6) {
  font-weight: 600;
  letter-spacing: -0.01em;
  font-size: 1.25rem;
}
```

在设计系统里，把标题按“层级（tier）”分组是一种常见思路：我们可以应用不同的样式规则，而不必逐个列出每一个标题元素（h1、h2、h3 等）。

作为一个工作原则，可以用 `:heading` 来设置应该全局一致的属性（例如 `font-family`、`line-height`），而当确实需要对不同级别做不同处理时（例如 `font-size`、`font-weight`），再使用 `:heading()`。

### 关于特异性（Specificity）

有个小点需要记住：`:heading` 的特异性和类选择器相同（`0-1-0`）。

对比一下旧的多选择器写法：

- `:heading` = `0-1-0`
- `h1, h2, h3, h4, h5, h6` = `0-0-1`

这意味着：如果两者同时存在，`:heading` 应该会覆盖单独标题元素上的样式。一般来说这正是我们想要的，但在排查层叠（cascade）问题时，记住这一点会很有帮助。

## 一些可能的使用场景

### 统一的排版（Typography）

最直接的用法，就是确保所有标题遵循同一套排版规则：

```css
:heading {
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  word-wrap: break-word;
}
```

这样就能让标题层级保持一致，而不需要重复书写。行高、字距（letter spacing）、字重（font weight）这类属性通常应该在所有标题级别之间保持统一，而 `:heading` 让我们只需要设置一次。

### 组件级的标题样式

在组件系统里，同一个标题级别（比如 h3）根据所在位置不同，可能需要不同的样式。使用 `:heading`，我们可以先设置一次基础样式，然后在各组件中进行定制：

```css
/* Base heading styles that apply everywhere */
:heading {
  font-family: var(--font-family-heading);
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-heading);
}

/* In a card, headings get a bottom border and different color */
.card :heading {
  border-bottom: 2px solid var(--color-primary);
  color: var(--color-card-heading);
  padding-bottom: 0.5rem;
}

/* In a sidebar, headings are smaller and uppercase */
.sidebar :heading {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* In modals, headings get extra spacing */
.modal :heading {
  margin-bottom: 1.5rem;
}
```

如果没有 `:heading`，我们就得为每个组件选择器分别定义基础字体、字重、行高等。用了 `:heading` 之后，基础样式只定义一次，各组件只需要补上它们的差异部分即可。

### 在各组件间强制统一字体族与字重

在一个组件系统中，Card 里的标题、Modal 里的标题、Hero 区块里的副标题，可能共享同一套基础排版——相同的字体族、相同的字重、相同的行高，只是字号不同。

用 `:heading` 做起来很简单：

```css
/* All headings across the entire system */
:heading {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  line-height: 1.2;
}

/* Each component only customises what's unique to it */
.card :heading {
  font-size: 1.25rem;
}

.modal :heading {
  font-size: 1.5rem;
}

.hero :heading {
  font-size: 2.5rem;
}
```

如果没有 `:heading`，我们就得在每个组件里重复写 `font-family`、`font-weight`、`line-height`：

```css
/* Without :heading - repetitive and fragile */
.card h1,
.card h2,
.card h3,
.card h4,
.card h5,
.card h6 {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  line-height: 1.2;
}

.card h1 {
  font-size: 1.25rem;
}
.card h2 {
  font-size: 1.1rem;
}
/* ... and repeat for modal, hero, etc. */

.modal h1,
.modal h2,
.modal h3,
.modal h4,
.modal h5,
.modal h6 {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  line-height: 1.2;
}

.modal h1 {
  font-size: 1.5rem;
}
/* ... and again for hero ... */
```

## 将 `:heading` 与其他选择器组合使用

除了组件级样式之外，`:heading` 也很适合与其他 CSS 模式搭配使用：

```css
/* 变体修饰符——适用于设计系统组件 */
:heading.error {
  color: var(--color-error);
}

:heading.success {
  color: var(--color-success);
}

/* 相邻兄弟选择器——管理连续标题之间的间距 */
:heading + :heading {
  margin-top: 0.5rem;
}

/* 交互元素内部的标题 */
button :heading,
a :heading {
  font-size: inherit;
  margin: 0;
}
```

这些模式可以避免在每种场景里都为 h1、h2、h3 等重复写同一条规则。正是这种可组合性，让 `:heading` 在更大型的系统中如此有价值。

## 浏览器支持与测试

`:heading` 伪类目前只在 nightly 构建版本中可用。你现在可以在以下环境中进行测试：

- Firefox Nightly（需要通过一个 flag 启用）

- Safari Technology Preview

如果你想在 Chrome 中看到它，可以去给这个 issue 点个 star：[star this issue](https://issues.chromium.org/issues/438147580)

在 nightly 构建中测试 `:heading` 并为该特性发声的开发者越多，它就越有可能更快被优先纳入稳定版发布计划。浏览器厂商会关注开发者的采用情况和需求。

## 更干净的设计系统

如果我们在构建设计系统或组件库，`:heading` 会特别有用。

我们可以一次性定义基础标题样式，并确信它们会在所有地方生效：

```css
/* 带默认值的基础标题样式 */
:heading {
  font-family: var(--font-family-heading);
  font-weight: var(--heading-font-weight, 600);
  line-height: var(--heading-line-height, 1.2);
  color: var(--color-heading);
  margin-block: var(--spacing-heading-block);
  font-size: var(--heading-font-size, 1rem);
}

/* 通过覆盖自定义属性来实现特定标题级别的变化 */
h1 {
  --heading-font-size: var(--font-size-h1);
}

h2 {
  --heading-font-size: var(--font-size-h2);
}

/* 以此类推... */
```

这种做法遵循了 [Mike Riethmuller 的策略](https://www.smashingmagazine.com/2018/05/css-custom-properties-strategy-guide/)：使用 CSS 自定义属性来创建可覆盖的默认值。通过设置能够自然级联的自定义属性，并让它们被基础的 `:heading` 规则读取，我们就能减少重复，同时也更容易为单个标题级别做定制。

## 总结

`:heading` 伪类是 CSS 中一个小巧但可爱的新增特性，会让标题样式的编写不再那么重复。

它与 CSS 自定义属性结合后会变得更强大：我们可以用极少的代码，在整个设计系统中一致地管理标题样式。

[#Css](https://www.alwaystwisted.com/tag/css/)

[#Designsystems](https://www.alwaystwisted.com/tag/design-systems/)

[#Typography](https://www.alwaystwisted.com/tag/typography/)

[#Html](https://www.alwaystwisted.com/tag/html/)

🦋 - 点赞

🔄 - 转发

[在 Bluesky 上给这篇文章点赞](https://www.alwaystwisted.com/articles/styling-with-the-heading-pseudo-class#)

你的 CSS 架构是否对当前和未来的项目来说都可持续、可扩展？

我可以重构你的 CSS，以获得更好的可维护性、一致性和可扩展性。

[**联系我**！](https://www.alwaystwisted.com/contact)
```