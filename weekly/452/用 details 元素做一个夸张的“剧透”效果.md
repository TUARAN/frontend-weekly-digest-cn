原文：[An Over The Top Spoiler Design With The Details Element](https://frontendmasters.com/blog/an-over-the-top-spoiler-design-with-the-details-element/)
翻译：TUARAN
欢迎关注 [{{前端周刊}}](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 用 `<details>` 元素做一个夸张的“剧透”效果



作者：Chris Coyier

发布时间：2026-02-04

`<details>` 是 HTML 自带的“开关”（toggle）：打开/关闭由浏览器管理，并且有一个明确的状态（`[open]`）。

这篇短文的核心想法是：既然我们已经有了一个原生 toggle，那么配合现代 CSS（尤其是 `:has()`），可以非常直接地把“开关状态”扩散到页面任何地方，而不再像过去那样依赖 `:checked ~ .something` 的结构技巧。

## 从 `:checked` 到 `:has()`

早期做交互（比如 checkbox hack）常见写法是：

```css
/* 过去经常需要依赖 DOM 结构关系（兄弟选择器等） */
#toggle:checked ~ .something-else {
  /* ... */
}
```

现在，如果浏览器支持 `:has()`，你可以把 toggle 的影响范围写得非常“无视 DOM 结构”——例如：

```css
body:has(#toggle:checked) {
  /* 给 body 自身或任意后代“连带”样式 */
}

body:has(#toggle:checked) .something-else {
  /* 影响页面上任何你想影响的元素 */
}
```

## `<details>` 同样是一个 toggle

`<details>` 的开关状态是 `[open]`，因此可以类似地写：

```css
details {
  /* details 的默认样式 */
}

details[open] {
  /* 展开时的样式 */
}

/* 当页面上存在打开的 details 时，影响其他区域 */
body:has(details[open]) {
  /* 例如：降低背景对比、禁止滚动、做“聚光灯”效果等 */
}

body:has(details[open]) .something-else {
  /* 例如：让其它内容模糊/变暗 */
}
```

作者的感受是：这种写法“怪异地强大”。

## 一个夸张的效果：做“剧透聚光灯”

灵感来自一个用 `<details>` 切换视频预览的例子。作者进一步脑洞：当 `<details>` 打开时，能不能像 modal 的 `::backdrop` 一样，在页面上铺一层“背景遮罩”，但又让 `<details>` 本身保持在最上层，强行吸引注意力？

这类效果的关键点通常是：

- 有一个可靠的 toggle 状态（这里是 `details[open]`）
- 能影响全局（这里是 `body:has(details[open])`）
- 遮罩层覆盖背景、但不遮住 `<details>` 本体（通过层级与定位实现）

示例（CodePen）：

- https://codepen.io/

（原文包含两个 CodePen embed，这里只保留思路与链接，去掉了页面推广与评论区。）
