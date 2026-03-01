> 原文：[Background Patterns with CSS `corner-radius`](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 用 CSS `corner-shape` 制作背景图案

CSS 里的 `corner-shape` 属性能做出不少很酷的设计。提到 `corner-shape`，大家通常会想到这类效果：像复古票券那样向内裁切的角、科幻风切角、标签形状等等。

`corner-shape` 提供了很多不错的基础关键字，比如 `round`（默认值）、`bevel`、`scoop`、`squircle`，以及[功能非常强的 `superellipse()`](https://frontendmasters.com/blog/understanding-css-corner-shape-and-the-power-of-the-superellipse/)。其实，用它做出有趣形状并不难，而且用途不只限于角落装饰。

例如：做背景图案。

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/mgdkr_7X.png?resize=1024%2C522&ssl=1)

**注意：**当浏览器不支持 `corner-shape` 时，我们可以选择保留，或者去掉由 `border-radius` 带来的默认圆角。

可以使用 CSS 的 `@supports` 来处理：

```css
@supports not (corner-shape: notch) {
  /* 改用其他方案 */
}
```

## `corner-shape` 属性

`border-radius` 决定角的大小，`corner-shape` 决定角的形状。要得到目标样式，通常两个都需要。和 `border-radius` 一样，`corner-shape` 也会影响元素的边框与阴影。

它是以下四个属性的简写：

- `corner-top-left-shape`
- `corner-top-right-shape`
- `corner-bottom-left-shape`
- `corner-bottom-right-shape`

## 嵌入到背景里

技巧在这里。

我们可以把 HTML 元素通过 SVG 以 data URL 的形式嵌入，从而把它变成 `background`。像这样：

```css
.element-with-the-background {
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">Styled HTML</div></foreignObject></svg>');
}
```

上面 URL 中未包装的 SVG 部分如下：

```xml
<svg xmlns="http://www.w3.org">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">Styled HTML</div>
  </foreignObject>
</svg>
```

核心做法是：先用 `corner-shape` 把元素做成想要的形状，再把这段标记放进背景的 data URL。

## 形状

假设我们要基于一个带如下样式的 `<div>` 来做图案：

```css
background: red;
width: 30px;
aspect-ratio: 1;
border-radius: 30%;
corner-shape: superellipse(-3);
```

为了缩短 URL 中的代码长度，我们把这些样式都写成内联样式，直接放到要嵌入 SVG 的 `<div>` 上：

```xml
<div style='background:red;width:30px;height:30px;corner-shape:superellipse(-3);border-radius:30%;'></div>
```

这样四个角都会使用 `superellipse(-3)`（效果类似 scoop），角的尺寸由 `border-radius: 30%` 决定。

接下来把这个已设样式的 div 放进 SVG，再在 CSS 里通过 data URL 作为背景并配合标准背景属性进行重复：

```css
.pattern {
  width: 150px;
  aspect-ratio: 1;
  background-size: 50px 50px;
  background-position:left 10px top 10px;
  background-repeat: repeat;
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><foreignObject width='30px' height='100%'><div xmlns='http://www.w3.org/1999/xhtml' style='background:deepskyblue;width:90%;aspect-ratio:1;corner-shape:superellipse(-1);border-radius:30%;'></div></foreignObject></svg>");
  background-color: ghostwhite;
  /* etc. */
}
```

CodePen 嵌入回退

### 不同设计 #1

因为可以分别设置每个角，所以我们还能尝试完全不同的设计：

```css
border-top-left-radius: 12px;
corner-top-left-shape: scoop;
border-bottom-right-radius: 26px;
corner-bottom-right-shape: notch;

transform: rotate(-135deg) scale(0.8) translate(-3px);
background: conic-gradient(red 265deg, blue 265deg);
```

这里仅设置了左上角和右下角，然后把整体旋转到想要的角度。

CodePen 嵌入回退

### 不同设计 #2

我们也可以把边框与阴影一起用上：

```css
border-bottom-left-radius: 66%;
corner-bottom-left-shape: notch;

box-shadow: -26px 16px 0 6px blue;
background: linear-gradient(to right, blue, deepskyblue);
```

左下角使用 notch，另外还加了一个向左偏移的蓝色阴影。

CodePen 嵌入回退

## 一个真实示例

下面是一些示例图案。由于图案设计本身就是基于 HTML 与 CSS 来实现的，除了角形状之外，我们还可以结合 `transform`、渐变和滤镜等特性做出不同设计。

这里作者把一个实体产品放在用这种方式创建的图案上。别忘了，这种方式给了我们对图案的编程式控制，因此改颜色、尺寸、重复方式等都很直接。

CodePen 嵌入回退

## 图库

CodePen 嵌入回退

