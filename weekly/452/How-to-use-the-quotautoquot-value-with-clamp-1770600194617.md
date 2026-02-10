# 如何在 clamp() 中使用 “auto” 值

- [上一篇 CSS Tip](https://css-tip.com/elastic-hover/)

# 如何在 clamp() 中使用 “auto” 值

2026 年 2 月 5 日

如果你试过下面这段代码，你会发现它并不能工作：

```css
.box {
  width: clamp(200px, auto, 400px);
}
```

`clamp()` 只接受“计算值”，像 `auto`、`min-content`、`max-content` 这样的关键字是不允许的；一旦出现，就会让整个属性值变成无效。

有了新的 `calc-size()`，我们就可以在 `clamp()` 里间接使用这类关键字。

```css
.box {
  width: calc-size(auto, clamp(200px, size, 400px));
  /* 等价于 clamp(200px, auto, 400px) */
}
```

`calc-size()` 的第一个参数可以是任意计算表达式或尺寸关键字（sizing keyword）。第二个参数则是一个计算表达式，其中 `size` 代表第一个参数。

你可以自由组合出很多写法：

```css
.box {
  width: calc-size(max-content, clamp(size, 70%, 600px));
  /* 等价于 clamp(max-content, 70%, 600px) */

  width: calc-size(max-content, clamp(300px, 80%, 2 * size));
  /* 等价于 clamp(300px, 80%, 2 * max-content) */

  width: calc-size(min-content, clamp(size + 50px, 100% - 40px, 700px));
  /* 等价于 clamp(min-content + 50px, 100% - 40px, 700px) */

  width: calc-size(max-content, clamp(size, 80%, 2 * size));
  /* 等价于 clamp(max-content, 80%, 2 * max-content) */
}
```

⚠️ 支持度有限（目前仅 Chrome 支持）

示例（CodePen）：

clamp() with keyword values by Temani Afif ([@t_afif](https://codepen.io/t_afif)) on [CodePen](https://codepen.io/).

## 更多 CSS Tips

- [Responsive Pyramidal Grid of Hexagon Shapes (and more!)](https://css-tip.com/pyramidal-grid/)：无需 media query 的响应式“金字塔网格”，可生成多种形状。
- [Recreating the <filedset> component and its <legend>](https://css-tip.com/filedset-legend/)：用基础 HTML + 少量 CSS 复刻 fieldset 组件及其 legend。