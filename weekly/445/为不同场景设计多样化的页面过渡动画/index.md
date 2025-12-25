# 为不同场景设计多样化的页面过渡动画

> 原文
> ：[Different Page Transitions For Different Circumstances](https://frontendmasters.com/blog/different-page-transitions-for-different-circumstances/)
>
> 翻译：[嘿嘿](https://blog.heyfe.org/blog)

我感觉多页面视图过渡的常见用法，通常是搭建一个通用的系统，让它适用于所有页面和元素，然后就可以不用管了。

但我最近看到了 JavaScript 中有相关的 DOM 事件，以及如何利用它们来设置“类型”（过渡的类型）。我们先来看看这些事件：

```javascript
// 旧页面 / 正在卸载的页面
window.addEventListener('pageswap', async (e) => {
  if (e.viewTransition) {

  }
}

// 新页面 / 正在加载的页面
window.addEventListener('pagereveal', async (e) => {
  if (e.viewTransition) {

  }
}
```

你可以在事件处理器里做任何你想做的事情，但对我来说特别有趣的一点是，你可以设置视图过渡的类型，并且能够 _有条件地_ 设置。

## 为特定 URL 自定义视图过渡类型

为了清晰地说明这一点，假设你想让某个特定页面的过渡动画与其他所有页面都不一样。比如，某个网站上相对路径为 `/shows` 的“演出”页面。那么我们就可以监听
`pagereveal` 事件，并检查当前 URL，如果匹配就设置对应的类型：

```javascript
window.addEventListener('pagereveal', async e => {
    if (e.viewTransition && document.location.pathname === '/shows') {
        e.viewTransition.types.add('toShowsPage');
    }
});
```

这里的 `toShowsPage` 只是一个我们随便起的名字，用来在 CSS 中设置对应的自定义动画。

## “默认”视图过渡

我们已经设置了一个自定义类型，但先来把默认的动画搭好。类似下面这样的效果就挺优雅的：

```css
::view-transition-old(main) {
    animation-name: slide-out-to-left;
    animation-duration: 1s;
}
::view-transition-new(main) {
    animation-name: slide-in-from-right;
    animation-duration: 1s;
}

@keyframes slide-out-to-left {
    to {
        translate: -150px 0;
        opacity: 0;
        scale: 0.5;
    }
}
@keyframes slide-in-from-right {
    from {
        translate: 100vi 0;
    }
}
```

在我的这个例子里，假设有一个内容区域 `<main>` 设置了 `view-transition-name: main;`，所以这个元素在这里就是被专门指定的目标。现在，当我切换页面（仅仅点
击普通的旧链接）时，就会得到这个效果：

<iframe title="VideoPress Video Player" aria-label="VideoPress Video Player" width="380" height="430" src="https://videopress.com/embed/ekBvCWFC?cover=1&amp;autoPlay=0&amp;controls=1&amp;loop=0&amp;muted=0&amp;persistVolume=1&amp;playsinline=0&amp;preloadContent=metadata&amp;useAverageColor=1&amp;hd=0" frameborder="0" allowfullscreen="" data-resize-to-parent="true" allow="clipboard-write" style=""></iframe>

## 为自定义动画使用自定义类型

当点击“Shows”链接并加载 `/shows` 页面时，我们设置了 “toShowsPage” 类型，而这就是 CSS 中展现效果的神奇时刻：

```css
html:active-view-transition-type(toShowsPage) {
    &::view-transition-new(main) {
        animation: to-shows-page 1s forwards;
    }
}

@keyframes to-shows-page {
    from {
        scale: 1.1;
        translate: 0 -200px;
    }
}
```

因为它比单纯的 `::view-transition-new` 具有更高的优先级，这让我们有机会用一组新的关键帧来 _覆盖_ 默认的 `animation`。现在，_只有_ 演出页面会从顶部下来
。看看区别：

<iframe title="VideoPress Video Player" aria-label="VideoPress Video Player" width="394" height="551" src="https://videopress.com/embed/rE06avRv?cover=1&amp;autoPlay=0&amp;controls=1&amp;loop=0&amp;muted=0&amp;persistVolume=1&amp;playsinline=0&amp;preloadContent=metadata&amp;useAverageColor=1&amp;hd=0" frameborder="0" allowfullscreen="" data-resize-to-parent="true" allow="clipboard-write" style=""></iframe>

## 补充说明

我认为这种通过 JavaScript 和 CSS 实现的精细控制交互非常酷。

我最初是在 Bramus 的 [《多页面应用中的跨文档视图过渡》](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) 中看到这个的，
这是一份很好的文章，涵盖了“前进”、“后退”和“重新加载”的视图过渡类型，这些看起来非常实用，让我希望有原生的 CSS 方法来检测它们。

CSS 确实有一个原生的方式来
[_声明_ 类型](https://css-tricks.com/almanac/rules/v/view-transition/#aa-limiting-view-transitions-with-the-types-descriptor)，但我还不太明白这样做有
什么用处或重要性。我目前的理解是，如果你声明了类型，那么任何 _未_ 在列表中列出的类型都会被设为无效，也许这在某些情况下是有用的？

我曾以为“类型”相关的功能会比视图过渡的其他部分更新一些，因此浏览器支持度会更低，但事实并非如此。MDN 将
[JavaScript 类型设置](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransitionTypeSet) 以及 CSS 选择器
[`:active-view-transition-type()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:active-view-transition-type) 的浏览器支持度标
记为与多页面视图过渡整体相同，也就是说，Chrome 和 Safari 已支持，Firefox 则处于标志启用状态（即将发布支持）。
