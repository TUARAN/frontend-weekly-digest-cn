原文：Native Random Values in CSS  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## CSS 中的原生随机值

![](https://alvaromontoro.com/images/blog/dice-random.webp)

## CSS 中的原生随机值

CSS 工作组已经发布了《Values and Units Module Level 5》，其中引入了仅使用 CSS 生成随机内容的原生机制。这篇文章是对一篇更长文章的 tl;dr（太长不看版），那篇文章将更深入地探讨 CSS 中的随机性。

2026 年 2 月 26 日  
css  
html  
webdev  
javascript

CSS 一直是一门确定性的语言：给定相同的输入，你每次都会得到相同的输出。但随着 CSS 中两个新的随机函数的引入，这一点即将改变。

本文将直接切入这个特性。如果你想要更全面的回顾——包括 CSS 中随机化的历史、该特性如何工作，以及它对 CSS 作为一门语言意味着什么——可以关注我即将发布的文章，它将作为我最近一次会议演讲的补充内容。

在撰写本文时，这项特性的支持还不广泛（只有 Safari 从 26.2 版本开始支持 `random()` 函数，而且还是部分支持）。本文将回顾规范内容以及即将到来的这些特性。

-->

截至 2026 年 2 月，CSS 原生随机特性支持情况

特性

![](https://alvaromontoro.com/images/blog/logo-safari.svg)
Safari

![](https://alvaromontoro.com/images/blog/logo-chrome.svg)
Chrome

![](https://alvaromontoro.com/images/blog/logo-firefox.svg)
Firefox

`random()`
26.2
X
X

`random-item()`
X
X
X

截至 2026 年 2 月，CSS 原生随机特性支持情况

-->

让我们来探索这些新函数！

### random()

`random()` 会在指定范围内返回一个随机值。它最简单的形式接受两个参数——最小值和最大值——并在该区间内生成任意结果。

例如：

```css
div {
  width: random(200px, 500px);
}

/*
Possible outputs:
- width: 230px;
- width: 417px;
- width: 308.342px;
*/
```

请注意，生成的值并不局限于整数。范围内的任何值都有效，包括小数。

### 递增随机（Incremental Random）

但有时候我们并不想要小数（谁会喜欢在布局里处理半个像素这种事？），好消息是：该函数还接受一个可选的第三个参数，用来定义随机值所应用的步长（step）或增量（increment）。

要做到这一点，我们可以在函数末尾添加第三个值。这个值表示每次递增的步幅：

```css
div {
  rotate: random(0deg, 180deg, 10deg);
}

/*
Possible outputs:
- rotate: 120deg;
- rotate: 40deg;
- rotate: 180deg;

Not possible:
- rotate: 5deg;
- rotate: 134deg;
- rotate: 89deg;
*/
```

增量会从最小值开始计数，这意味着最大值有时可能并不是一个可选结果。例如，`random(100, 200, 30)` 会返回 100、130、160 或 190；但不会返回 200（因为从 100 开始按 30 递增无法正好到达 200），也不会返回 210（超出范围）。

### 共享选项（Sharing Options）

`random()` 函数的每个实例都会返回不同的值。但在某些情况下，我们并不希望发生这种事。比如，假设 `aspect-ratio` 不存在，而我们想通过设置随机的宽度和高度来创建一个正方形。

```css
div {
  width: random(10em, 30em);
  height: random(10em, 30em);
}

/*
Possible outputs:
- width: 14em; height: 15em;
- width: 21em; height: 11em;
- width: 17em; height: 27em;
*/
```

有一种方法可以在同一条规则内、同一元素内，甚至全局范围内共享随机值。这可以通过在参数列表中添加一个新参数来实现——该参数作为第一个参数传入，用于启用数值共享。

它可以有不同的取值：

`auto`：默认值，会为 `random()` 函数的每一次调用/实例生成不同的值。这个参数可以省略。

```css
div {
  width: random(auto, 100px, 200px);
  height: random(auto, 100px, 200px);
}

/*
Using auto: this would be equivalent to calling random() 
without a sharing option.

Possible result:
- div.div1 --> width: 125px; height: 198px;
- div.div2 --> width: 142px; height: 101px;
*/
```

带短横线的标识符（例如 `--w`）：该值会在同一个元素内的多个属性之间共享（它们拥有相同的缓存键），但不会跨元素共享。

```css
div {
  width: random(--d, 100px, 200px);
  height: random(--d, 100px, 200px);
}

/*
Using a dashed identifier: All the divs will be squared, because 
the  generated value is shared by the properties (per element.)

Possible result:
- div.div1 --> width: 150px; height: 150px;
- div.div2 --> width: 134px; height: 134px;
*/
```

之所以会这样，是因为 `random()` 在内部会先生成一个介于 0 到 1 之间的基础随机值，然后用它来计算最终结果。当多个 `random()` 调用使用相同的短横线标识符时，浏览器会复用同一个基础值，导致它们的结果相互关联（相关性会出现），即使这种关联并不直观。

`element-shared` 关键字：它可以单独使用，也可以与短横线标识符一起使用。其生成的值会在不同元素之间共享，但不会在同一元素内的属性之间共享（除非指定了短横线标识符）。

```css
div {
  width: random(element-shared, 100px, 200px);
  height: random(element-shared, 100px, 200px);
}

/*
Using element-shared by itself: the generated value will be shared
by the elments but not by the properties within the element.

Possible result:
- div.div1 --> width: 150px; height: 134px;
- div.div2 --> width: 150px; height: 134px;
*/

/*--------------------*/

div {
  width: random(--v element-shared, 100px, 200px);
  height: random(--v element-shared, 100px, 200px);
}

/*
Using element-shared along a dashed identifier: the generated value 
will be shared by properties and elements (same value for all)

Possible result:
- div.div1 --> width: 128px; height: 128px;
- div.div2 --> width: 128px; height: 128px;
*/
```

带数字 id 的 `fixed` 关键字：它指定一个固定的全局随机标识符。因此，该值会在全局范围内共享。

```css
div {
  width: random(fixed 0.5, 100px, 200px);
  height: random(fixed 0.5, 100px, 200px);
}

/*
Using fixed: the generated value is shared by the properties 
across all elements.

Possible result:
- div.div1 --> width: 167px; height: 167px;
- div.div2 --> width: 167px; height: 167px;
*/
```

注意：以上只是对这些共享选项如何工作的一个非常简化的说明；更多细节请查阅规范。

到这里，我们已经回顾了 `random()` 函数的不同语法形式和选项。接下来，我们来看看在最新的 [CSS Values and Units Module Level 5](https://drafts.csswg.org/css-values-5/) 规范草案中引入的第二个函数。

## random-item()

CSS 中有些属性的值是离散的，无法用一个范围来表示。在这种情况下，`random()` 就不太有用了。我们需要的是一个函数：接收一组可能的值，然后随机挑选其中一个——这正是 `random-item()` 的作用。

`random-item()` 函数把一个共享选项和一系列值作为参数，然后从列表中随机选择并返回其中一个值：

```css
div {
  display: random-item(--d, block, flex, grid, table);
  opacity: random-item(--o, 0.5, 0.6, 0.75, 0.9, 1);
  background: random-item(--b, red, #00f, conic-gradient(#fff 0 0));
}

/*
Possible outputs:
- display: block; opacity: 0.9; background: #00f;
- display: grid; opacity: 0.6; background: red;
- display: flex; opacity: 0.75; background: red;
*/
```

一个重要细节：**在 `random-item()` 中，共享变量不是可选项，而是必填项**。

顺带一提，有些读者可能已经知道，但这是我在阅读这份规范时发现的（不过它很可能源自另一份规范）：当某个以逗号分隔的值列表，需要作为“一个单独的值”放进同样以逗号分隔的参数列表中时，CSS 允许使用花括号（`{}`）来界定该值列表。基本上，只有在把嵌套列表作为参数传递时才需要这样做：

```css
div {
  font-family: random({ Times, serif }, { Arial, sans-serif }, monospace);
}

/*
Potential outputs:
- Times, serif 
- Arial, sans-serif
- monospace
*/
```

与 `random()` 函数类似，如果两个 `random-item()` 使用相同的短横线标识符并且拥有相同数量的候选项，那么它们的结果会相互关联。比如我们有 `random-item(--a, 1, 2, 3)` 和 `random-item(--a, red, green, blue)`：如果第一个函数的结果是 2（第二个元素），那么第二个函数的结果就会是 green（第二个元素）。如果我们希望把一些特性进行配对，这种关联性可能会很方便。

## Conclusion

希望这篇文章能带来一些启发，让你了解 CSS 即将到来的 `random()` 与 `random-item()` 函数（如果你在使用 Safari，它们已经可用了）。文章最终比预期更长，但我认为把所有选项都覆盖到，并用示例进行详细解释，是值得的。

在生产环境中使用这些函数时，请务必考虑 CSS 的浏览器支持情况，以及缓存、共享与性能方面的影响。同时也可以想想一些实际用例，比如随机颜色、随机旋转、随机间距等，它们能在不使用 JavaScript 的情况下增强视觉体验。

也有人可能会质疑：把这些函数加到这个层级是否是个好主意。从架构角度来看，它们是合理的：这属于布局层面的关注点，应当在布局层（CSS）中处理，而不是像以往那样放在逻辑层（JavaScript）里处理。

……不过更多内容会在即将推出的长文中详细展开！

---

本文最初发表于 2026 年 2 月 26 日

## 分享

- 在 Twitter 上分享  
- 在 Reddit 上分享  
- 在 Linkedin 上分享  
- 在 Facebook 上分享  

## 其他文章

- 使用 CSS 的圆形绘制《辛普森一家》中的霍默·辛普森  
- 100 天 CSS 插画  
- 5 个简单步骤修复 85% 的 Web 无障碍问题  
- 使用 HTML 和 CSS 开发交互式简历  
- 免费的 Web 无障碍工具