原文：How to use the "auto" value with clamp
翻译：TUARAN
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 在 clamp() 里使用 auto 等关键字值

[原文链接：How to use the "auto" value with clamp](https://css-tip.com/clamp-auto/)

2026 年 2 月 5 日

如果你试过下面这段代码，会发现它并不能工作：

```css
.box {
  width: clamp(200px, auto, 400px);
}
```

原因是 `clamp()` 只接受“可计算的值”（computed value）。像 `auto`、`min-content`、`max-content` 这样的关键字不属于可计算值：一旦出现，就会让整个声明变成无效。

随着新的 `calc-size()` 出现，我们可以在 `clamp()` 里“间接”使用这些关键字。

```css
.box {
  width: calc-size(auto, clamp(200px, size, 400px));
  /* 等价于 clamp(200px, auto, 400px) */
}
```

`calc-size()` 的第一个参数可以是任意的计算表达式或尺寸关键字（sizing keyword）。第二个参数是一个计算表达式，其中的 `size` 代表第一个参数。

这意味着你可以自由组合出很多写法：

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

注意：`calc-size()` 的浏览器支持度目前还有限（写作时主要是 Chrome 支持）。

示例：

- CodePen：clamp() with keyword values by Temani Afif — https://codepen.io/t_afif
