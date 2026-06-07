原文：Stop Using JS for Everything: Harnessing the Power of Pure CSS in 2026
链接：https://norvilis.com/stop-using-js-for-everything-harnessing-the-power-of-pure-css-in-2026/
翻译：TUARAN

# 2026 年了，别再什么都用 JS 写了——重新发现纯 CSS 的力量

我记得曾经，构建一个简单的下拉菜单或粘性头部都需要引入 jQuery 这样的库。后来，我们又进化到为屏幕上每一个微小的交互都写一个 Stimulus controller 或 React hook。

作为开发者，我的本能一直是："只要它会动，就写 JavaScript。"

但 2026 年的浏览器已经不一样了。CSS 进化了如此之多，以至于很多我们过去用 JS 做的事情，现在都原生地内建在了样式表中。把这些逻辑迁移到 CSS 不只是为了"酷"——它让你的网站**显著变快**、减少"布局偏移"，而且意味着你要维护的代码更少了。

下面是我如何在 Rails 8 项目中开始用纯 CSS 替代 JavaScript 的实践。

---

## 1. "父选择器"（`:has`）

几十年来，我们一直想要一种方式——根据元素**内部**的内容来样式化它。

**旧方法（JS）：** 你会写一个脚本来检查 checkbox 是否被勾选，然后给父容器加一个 `.is-active` 类。

**2026 年方法（CSS）：** 我们现在有了 `:has()` 选择器。这是一个游戏规则的改变者。

```css
/* 仅当卡片内包含已勾选的 checkbox 时样式化该卡片 */
.card:has(input[type="checkbox"]:checked) {
  background-color: #f0fdf4;
  border-color: #22c55e;
}
```

这替代了数百行的"状态切换" JavaScript。你可以用它来做表单验证、菜单状态和复杂的网格布局。

---

## 2. 原生 Popover（`popover` 属性）

Tooltip 和下拉菜单通常是人首先用 JavaScript 实现的东西。在 2026 年，我们不再需要为此使用 JS 库了。

**现代方法：** 使用 HTML 的 `popover` 属性，然后用 CSS 来定位它。

```html
<button popovertarget="my-menu">打开菜单</button>

<div id="my-menu" popover class="p-4 rounded-lg shadow-xl">
  <p>这是一个纯 CSS/HTML 的下拉菜单！</p>
</div>
```

零行 JavaScript，浏览器自动处理：

- 显示/隐藏元素。
- "轻触关闭"（点击外部时关闭）。
- 将菜单放到"顶层"（top layer），使其不会被父容器裁剪。

---

## 3. Container Queries（告别 JS Resize 监听器）

我们过去用 JavaScript 的 `ResizeObserver` 来在容器太小时改变组件布局（比如侧边栏沉到底部）。

**2026 年方法：** Container queries 允许元素根据**自己的尺寸**来样式化自己，而不是整个浏览器窗口的大小。

```css
.card-container {
  container-type: inline-size;
}

@container (max-width: 400px) {
  .card {
    flex-direction: column;
    padding: 1rem;
  }
}
```

这对使用 **ViewComponents** 的 Rails 开发者来说太完美了。你的组件现在无论被放到布局的哪个位置，都能"智能"地响应。

---

## 4. 滚动驱动动画（Scroll-Driven Animations）

我曾经讨厌写 JS 滚动监听器。它们性能糟糕，在手机上经常"卡顿"。

在 2026 年，我们可以用纯 CSS 将动画直接绑定到滚动位置。想在博客文章顶部放一个进度条？

```css
@keyframes grow-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.progress-bar {
  animation: grow-progress auto linear;
  animation-timeline: scroll();
}
```

浏览器自己处理数学计算。它丝般顺滑，而且相比 JS 的 `scroll` 事件，消耗零 CPU 周期。

---

## 5. 原生平滑滚动和 Snap

如果你在做一个带轮播图或"回到顶部"按钮的着陆页，你可能会想引入一个 JS 库。

别这么做。

```css
html {
  scroll-behavior: smooth;
}

.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.carousel-item {
  scroll-snap-align: center;
}
```

这会给你带来原生的、高级的"App 般"滑动体验。

---

## 总结：为什么这对 Rails 8 很重要

当我们使用 **Hotwire 和 Turbo** 时，我们希望尽可能把"状态"保留在服务端。每次我们为一个微小的 UI 动画添加一个自定义 Stimulus controller，我们就是在添加需要管理的"客户端状态"。

通过使用这些 2026 年的 CSS 特性：

1. 你的 **HTML 更干净**。
2. 你的 **JavaScript bundle 更小**。
3. 你的 **UX 更具韧性**（CSS 不会像 JS 那样"崩溃"）。

下次你准备跑 `rails generate stimulus` 时，问问自己：**"我能不能用 `:has()` 或 container query 来做这个？"** 大多数时候，答案现在是"可以"。
