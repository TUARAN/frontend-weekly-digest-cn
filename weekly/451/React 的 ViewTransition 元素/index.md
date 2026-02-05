# React 的 ViewTransition 元素

原文：[React’s ViewTransition Element](https://frontendmasters.com/blog/reacts-viewtransition-element/)

作者：Chris Coyier

日期：2026年1月30日

翻译：[TUARAN](https://github.com/TUARAN)

> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

作为一个 View Transitions 的爱好者，同时又在用 React，我自然会关注 React 现在直接提供了一个 `<ViewTransition>` 元素（目前在 “Canary” 预发布版本中）。

我想看看它到底怎么用，但在开始之前，我们先……**别**用它。View Transitions 是 Web 平台本身的特性，不属于任何框架。所以 React 也无法阻止我们使用它。直接用其实也不算奇怪。

## 在 React 中使用 View Transitions（经典方式？）

同页 View Transitions API（对 React 更相关，而不是多页切换的那种）基本是这样：

```js
document.startViewTransition(() => {
  // 在这里改 DOM
});
```

但改 DOM 这种事……是 React 的工作。它并不喜欢你自己去动它。所以与其直接操作 DOM，我们不如做些“更 React 的事”，比如更新 state。

```js
import React, { useState } from "react";

export default function DemoOne() {
  const [buttonExpanded, setButtonExpanded] = useState(false);

  const toggleButton = () => {
    document.startViewTransition(() => {
      setButtonExpanded(!buttonExpanded);
    });
  };

  return (
    <button
      className={`button ${buttonExpanded ? "expanded" : ""}`}
      onClick={toggleButton}
    >
      Button
    </button>
  );
}
```

视觉效果由 CSS 完成。状态变化触发 class 变化，而 class 改变按钮的样式。

```css
.button {
  /* button styles */

  &.expanded {
    scale: 1.4;
    rotate: -6deg;
  }
}
```

## 准备使用 `<ViewTransition>`

写这篇文章时，这个元素还只存在于 React 的 “Canary” 版本，所以你得显式安装：

```bash
npm install react@canary
```

你的 `package.json` 会把版本写成 `canary`：

```json
{
  "dependencies": {
    "react": "canary",
    "react-dom": "canary"
  }
}
```

如果你在客户端用 React，也可以用 CDN 的 import map：

```html
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@canary",
    "react-dom": "https://esm.sh/react-dom@canary"
  }
}
</script>
```

## 在 React 中使用 `<ViewTransition>`

现在我们可以导入 `ViewTransition`，并把它作为 JSX 元素使用，同时配合它的搭档 `startTransition`。

```js
import React, { startTransition, ViewTransition } from "react";

function App() {
  const [buttonExpanded, setButtonExpanded] = useState(false);

  const toggleButton = () => {
    startTransition(() => {
      // 以更“React”的方式改变 DOM
      setButtonExpanded(!buttonExpanded);
    });
  };

  return (
    <main>
      <ViewTransition>
        <button
          className={`button ${buttonExpanded ? "expanded" : ""}`}
          onClick={toggleButton}
        >
          Button
        </button>
      </ViewTransition>
    </main>
  );
}
```

CSS 和上面一样，因为本质还是切换 class。注意我们没有用 `.classList.toggle("expanded")` 这种直接 DOM 操作，而是让 React 走自己的渲染流程。

## 所以……两种方式都能用？

是的，至少在这些简单 demo 里都没问题。甚至同页混用也可以。

一个小差异是：如果你直接用 `document.startViewTransition`，需要自己加 `view-transition-name`；而 `<ViewTransition>` 会自动帮你加。这算是 `<ViewTransition>` 的一个小加分点。

### 我“讨厌”的那部分

有一部分我并不喜欢这个方案。React 并没有给出太多额外价值，它只是要求你用一种不破坏框架运行方式的写法。如果你花了很多时间去学它（而且[确实有不少内容](https://react.dev/reference/react/ViewTransition#my-viewtransition-is-not-activating)），这些知识并不太能迁移到其他地方。

### 我“勉强接受”的那部分

React 一直以来就希望自己掌控 DOM，这是它的核心卖点。也正因为如此，你必须让它来做一些协调工作。这意味着使用 `<ViewTransition>` 可以“自动与渲染生命周期、Suspense 边界、并发特性协调”，完成批量更新、防冲突、嵌套管理等你我不想操心的事情。

此外，`<ViewTransition>` 有一点点更“声明式”：你明确包裹了要过渡的区域，更符合很多人的心智模型。但你仍然需要调用 `startTransition`，所以仍然是偏命令式的。在更复杂的嵌套 UI 中，如何组织它可能会有些困惑。

我倒是挺喜欢 `<ViewTransition>` 上像 `enter`、`exit` 这样的明确属性，它对应“自带的” CSS view transition class，比起自己通过 `:only-child` 技巧推断要直观一些。

总之，以上就是我的看法。更多示例请参见原文。