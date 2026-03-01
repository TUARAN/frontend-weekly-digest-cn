> 原文：[You might not need role=”presentation”](https://piccalil.li/blog/you-might-not-need-rolepresentation/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 你可能并不需要 `role="presentation"`

作者曾长期做网站可访问性合规评估。在大量真实项目里，他反复看到 `role="presentation"` 被误用：有的只是技术上别扭，有的会直接降低可访问性。

因此本文基于规范与真实案例，重新回答三个问题：

- `role="presentation"` 到底做了什么
- 它在真实代码里是如何被误解的
- 它真正“少数可用”的场景是什么

## 关于这个属性，你可能常看到的说法

很多人把 `role="presentation"` 理解为“隐藏元素，不让辅助技术读到”。

但规范从一开始就强调了：`presentation`（以及同义词 `none`）并不等于 `aria-hidden="true"`。

## 官方规范怎么说

规范里最关键的一点是：

`role="presentation"` 主要影响的是**角色语义**，而不是把元素内容从可访问性树中完全移除。

也就是说，它并不是“可访问性版 `display: none`”。

这也是为什么 ARIA 1.1 引入了 `none` 作为同义词：因为太多人把 `presentation` 误当成“隐藏内容”。

文中还引用了规范里的多个示例/描述（如布局表格、纯 CSS 挂钩元素等），并强调一句核心语义：

> `presentation` 会让元素被当成“无角色”或被从可访问性树中去角色化处理；但它并不自动移除该元素内部的内容。

例如下面两段代码在可访问性树中的结果不同：

```html
<!-- 可访问性树：泛型容器 + 泛型子项 -->
<ul role="presentation">
  <li>Sample Content</li>
  <li>More Sample Content</li>
</ul>

<!-- 可访问性树：真正的无序列表 + 列表项 -->
<ul>
  <li>Sample Content</li>
  <li>More Sample Content</li>
</ul>
```

## 有问题的真实案例

作者给出了一组真实世界里常见的“可疑写法”。

### 1) “不可见”的 `iframe`

```html
<iframe src="..." title role="presentation" loading="eager" style="width:0;height:0;border:0;display:none;">
  <!-- ... -->
</iframe>
```

这类写法的意图通常是“把 iframe 从辅助技术里藏起来”。但 `presentation` 并不是最合适的手段，而且 `title` 为空本身也不正确。

更直接的做法是：

```html
<iframe aria-hidden="true" src="..." loading="eager"></iframe>
```

### 2) “没有列表项语义”的导航列表

```html
<nav>
  <ul>
    <li role="presentation">
      <a href="/">To homepage</a>
    </li>
  </ul>
</nav>
```

对导航列表而言，这种去语义并不合理。删除 `role="presentation"`，并在当前页上配合 `aria-current="page"` 通常更合适。

### 3) “被隐藏语义”的图标

```html
<a href="/shop" aria-label="Shop">
  <svg role="presentation">
    <title>Shopping cart</title>
  </svg>
</a>
```

这类写法很容易把本可复用的图像替代文本逻辑搞乱。若去掉 `aria-label`，这个链接甚至可能没有可访问名称。

更简洁的方式是保留 SVG 正常语义，不强行 `presentation`：

```html
<a href="/shop">
  <svg>
    <title>Shop</title>
  </svg>
</a>
```

### 4) 先做语义，再撤销语义

```html
<a href="/retail">
  <p role="presentation">Search store</p>
</a>
```

这不会一定造成严重障碍，但写法别扭。直接写成文本链接更自然：

```html
<a href="/retail">Search store</a>
```

### 5) 技术上“能跑”，语义上“别扭”

```html
<div role="presentation">
  <section role="presentation" aria-label="Header">
    <!-- ... -->
  </section>
</div>
```

这种写法在浏览器/辅助技术里可能仍表现“可用”，但结构上非常绕。更干净的版本是直接保留语义元素，不强行去语义。

### 6) 给了可访问名称，又自己去掉

```html
<a href="/profile">
  <div>
    <div>
      <img alt="Go to profile" role="presentation" src="...">
    </div>
  </div>
</a>
```

这里 `img` 的语义被去掉后，`alt` 也不再按预期工作，链接可访问名称会出问题。移除 `role="presentation"` 即可恢复正常。

## 这个属性“少数可用”的场景

作者认为真正合理的场景并不多，主要是：

- 某些组件模式（如 tab / menu）中的特定结构处理
- 以及最常见的：**布局表格（layout table）**

对于现代网页布局，规范与实践都更建议使用 CSS（Flex/Grid），而不是用 `<table>` 排版。

但在邮件模板等受限环境里，如果你被迫使用布局表格，给 `<table>` 添加 `role="presentation"` 仍是一个常见、合理的折中做法。

## 总结

这篇文章的核心结论是：`role="presentation"` 远比很多教程描述得“窄用”。

它不是“隐藏元素”的通用开关；在多数业务页面里，优先保持原生语义、只在确有必要时小范围使用 ARIA，会更稳妥。

作者也特别感谢 Heydon Pickering 对文章的审阅与建议。

