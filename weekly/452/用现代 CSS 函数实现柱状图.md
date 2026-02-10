原文：CSS Bar Charts Using Modern Functions
翻译：TUARAN
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 用现代 CSS 函数实现柱状图

[原文链接：CSS Bar Charts Using Modern Functions](https://css-tricks.com/css-bar-charts-using-modern-functions/)

作者：Preethi

2026 年 2 月 5 日

新 CSS 特性有时不会带来“全新玩法”，但能让我们用更少的代码、更少的 hack，把过去就能做的东西写得更清晰、更可靠。

这篇文章用一个柱状图（bar chart）举例，展示两个越来越“现代”的 CSS 能力：

- `sibling-index()`：按同级元素顺序返回序号（第几个兄弟元素）。
- 升级后的 `attr()`：可以把 `data-*` 属性读取为特定类型，例如 `<number>`。

核心思路是：让 HTML 用 `data-value` 表达数据；让 CSS 用网格 + 函数把数据映射成高度，并自动把每根柱子放到对应列。

## 基本结构

HTML：

```html
<ul class="chart" tabindex="0" role="list" aria-labelledby="chart-title">
  <li class="chart-bar" data-value="32" tabindex="0" role="img" aria-label="32 percentage">32%</li>
  <!-- ... -->
</ul>
```

CSS（先把图表划成 100 行网格，对应 0–100%）：

```css
.chart {
  display: grid;
  grid-template-rows: repeat(100, 1fr);
}
```

关键在柱子：

```css
.chart-bar {
  grid-column: sibling-index();
  grid-row: span attr(data-value number);
}
```

- `grid-column: sibling-index()`：第 1 个 `<li>` 放第 1 列，第 2 个放第 2 列……不需要手写 `--i` 变量，也不用 JS。
- `grid-row: span attr(data-value number)`：从 `data-value="32"` 读到数字 `32`，让柱子跨 32 行，从而得到“高度 = 百分比”。

## 这两项能力为什么重要

### 1) `sibling-index()`：自动生成顺序

传统做法往往要：

- 手写每个条目的 `grid-column`；或
- 在 HTML/CSS 里维护 `--index` 变量；或
- 用 JS 在运行时注入样式。

`sibling-index()` 直接用 DOM 顺序把列号算出来，让“结构顺序 = 视觉顺序”这件事更自然。

### 2) `attr(data-value number)`：从标记读取数据

过去 `attr()` 在很多场景只能用于 `content:` 等位置，而现在它在更多属性上更实用，并且能把读到的字符串按类型转换。

在这里，`number` 参数会把 `data-value` 转成 `<number>`，从而能用于 `grid-row: span …` 这样的计算。

## 进一步扩展

当“每个柱子占多少行”和“第几个柱子”都可以自动计算时，同一套思路就能扩展出更多变体：

- 反向柱状图（从顶部向下/从底部向上）。
- 只显示标记点（marker）而不是整根柱子。
- 横向柱状图（交换行/列）。

（原文包含多个 CodePen 示例与带兼容性兜底的完整 demo，建议点开体验。）

## 兼容性提示

写作时 `sibling-index()` 的浏览器支持仍不完整（例如 Firefox 支持滞后）。可以把它当作渐进增强：在不支持时用传统 CSS 变量或手写序号兜底。
