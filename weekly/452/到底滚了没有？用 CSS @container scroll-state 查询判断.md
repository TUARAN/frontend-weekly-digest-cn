原文：Is it scrolled? Is it not? Let's find out with CSS @container scroll-state() queries
翻译：TUARAN
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 到底滚了没有？用 CSS @container scroll-state 查询判断

[原文链接：Is it scrolled? Is it not? Let's find out with CSS @container scroll-state() queries](https://utilitybend.com/blog/is-it-scrolled-is-it-not-lets-find-out-with-css-container-scroll-state-queries)

2026 年 1 月 23 日

过去几年里，我们经常需要用 JavaScript（滚动事件、Intersection Observer）来回答一些看似简单的问题：

- 这个 sticky 头部现在真的“贴住”了吗？
- 这个 scroll-snap 列表现在“吸附到哪一项”了？
- 这个容器是否还能继续滚？左边/右边还有没有内容？

而 `@container scroll-state`（本文简称“scroll-state 查询”）提供了一种 CSS 原生的状态查询方式：容器可以根据自己的滚动状态，去样式化子元素。

## 快速回顾：scroll-state 查询怎么用

先把某个祖先设置为 scroll-state 容器：

```css
.scroll-ancestor {
  container-type: scroll-state;
}
```

然后用容器查询按状态应用样式：

```css
@container scroll-state(stuck: top) {
  .child-of-scroll-parent {
    /* 只有“贴住顶部”时才生效 */
  }
}
```

## Chrome 133：三件套（stuck / snapped / scrollable）

### 1) stuck：sticky 是否真的“贴住”了

当你用 `position: sticky` 做吸顶 header 时，常见需求是：只有在 header 真的贴住时才加背景、阴影。

```css
.sticky-header-wrapper {
  position: sticky;
  inset-block-start: 0;
  container-type: scroll-state;
}

@container scroll-state(stuck: top) {
  .main-header {
    background-color: var(--color-header-bg);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
}
```

### 2) snapped：当前吸附项

对于 scroll-snap 画廊，你往往想高亮当前吸附项，例如放大当前卡片、改变滤镜。

```css
.horizontal-track li {
  container-type: scroll-state;
}

@container scroll-state(snapped: inline) {
  .card-content img {
    transform: scale(1.1);
    filter: sepia(0);
  }
}
```

### 3) scrollable：某个方向上是否“还能滚”

这类需求过去常靠 JS 读 `scrollLeft/scrollWidth/clientWidth`。现在可以按方向做样式：

```css
@container scroll-state(scrollable: left) {
  .scroll-arrow.left {
    opacity: 1;
  }
}

@container scroll-state(scrollable: right) {
  .scroll-arrow.right {
    opacity: 1;
  }
}
```

## Chrome 144：新增 scrolled（最近一次滚动方向）

写作时 Chrome 144 带来了 `scrolled`，用于判断“最近一次滚动的方向”。这让一些常见的 UI 模式可以不写 JS：

### 经典的“hidey-bar” 头部

```css
html {
  container-type: scroll-state;
}

@container scroll-state(scrolled: bottom) {
  .main-header {
    transform: translateY(-100%);
  }
}

@container scroll-state(scrolled: top) {
  .main-header {
    transform: translateY(0);
  }
}
```

### “滚动提示”只在第一次交互后消失

例如横向滚动容器：用户一旦横向滚过，就隐藏提示。

```css
@container scroll-state(scrolled: inline) {
  .scroll-indicator {
    opacity: 0;
  }
}
```

## 小结

scroll-state 查询把一部分“滚动状态机”的能力下放给 CSS：

- 能做渐进增强时，UI 代码会更轻、更稳定；
- 状态可由浏览器内部实现，避免滚动事件带来的性能与时序问题；
- 但要大规模依赖，还需要更完整的跨浏览器支持。

进一步阅读：

- Directional CSS with scroll-state(scrolled)：https://una.im/scroll-state-scrolled
