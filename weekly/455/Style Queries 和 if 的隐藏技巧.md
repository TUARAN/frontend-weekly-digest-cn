原文：The Hidden Trick of Style Queries and if()  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## Style Queries 和 if() 的隐藏技巧

- [上一篇 CSS Tip](https://css-tip.com/anchor-issues/)

## Style Queries 和 if() 的隐藏技巧

2026 年 2 月 25 日

在现代 CSS 中，我们有两种新的方式来表达条件：内联 `if()` 和 style queries（样式查询）。它们的语法如下：

```css
/* inline if() */
.box {
  background: if(style(--n: 3): red; else: green);
}
/* style queries */
.box {
  background: green;
  @container style(--n: 3) {
    background: red;  
  }
}
```

它们之间的共同点是 `style()` 这一部分；规范定义它在这两项特性中的行为应当一致。它包含一个条件，用于计算结果为 true 或 false。大多数在线 demo 会展示上面这种写法，但还有另一种同样有效的语法：使用 `=`

```css
/* inline if() */
.box {
  background: if(style(--n = 3): red; else: green);
}
/* style queries */
.box {
  background: green;
  @container style(--n = 3) {
    background: red;  
  }
}
```

你可能会直觉地认为两者是等价的，但事实并非如此！

当使用 `style(--n: 3)` 时，我们依赖的是如下语法：`style(<style-feature-name>: <style-feature-value>)`（称为 `<style-feature-plain>`）。在这种情况下，如果给定属性的 computed value（计算值）与给定值（同样会被计算）匹配，则条件为 true。

来看下面这个例子：

```css
.box {
  --n: calc(6/2);

  background: if(style(--n: 3): red; else: green);
}
```

`--n` 的 computed value 是什么？3 吗？不是，它是 `calc(6/2)`。浏览器在这个上下文里不会执行计算，因此计算值是 `calc(6/2)`。这个值与 `3` 不匹配，所以条件为 false（我们得到绿色）。我知道，这有点奇怪，但你可以把它理解为字符串匹配。

下面这种写法就能正常工作：

```css
.box {
  --n: calc(6/2);

  background: if(style(--n: calc(6/2)): red; else: green);
}
```

下面这个也可以：

```css
.box {
  --n: calc(6/2);

  background: if(style(--n: var(--n)): red; else: green);
}
```

同样地，下面这个例子也成立：

```css
.box {
  --s: new;

  background: if(style(--s: new): red; else: green);
}
```

当使用 `style(--n = 3)` 时，我们依赖的是如下语法：`style(<style-range-value> <mf-comparison> <style-range-value>)`（称为 `<style-range>`）。接着我们会按以下步骤来计算条件：

- 如果 `<style-range-value>` 是一个自定义属性，那么需要进行替换：就好像该自定义属性被包在 `var()` 里一样。

- 将 `<style-range-value>` 解析为 `<number>`、`<percentage>`、`<length>`、`<angle>`、`<time>`、`<frequency>` 或 `<resolution>`。如果无法解析，则结果为 false。

- 如果 range 中的每个 `<style-range-value>` 都是相同类型，那么对它们分别计算，并进行比较运算。

把我们的例子应用到这里：把 `:` 替换成 `=`

```css
.box {
  --n: calc(6/2);

  background: if(style(--n = 3): red; else: green);
}
```

我们先替换得到 `style(calc(6/2) = 3)`。然后进行解析，可以看到两边都是 `<integer>`（这里会执行计算）。它们类型相同且相等，所以条件为 true！

`=` 这种写法在表达条件时给了我们更大的自由度。下面这些都是有效的：

```css
.box {
  background: if(style(3 = --n): red; else: green);
  background: if(style(var(--n) = 3): red; else: green);
  background: if(style(3 = var(--n)): red; else: green);
  background: if(style(calc(6/2) = var(--n)): red; else: green);
  background: if(style(--n = var(--n)): red; else: green);
}
```

你可以调换顺序、使用 `var()`、包含计算等。而当使用 `:` 这种写法时，我们必须总是从自定义属性开始，并且不能把它与 `var()` 一起用于属性名位置（`var()` 只能用于值）。下面这些都是无效的：

```css
.box {
  background: if(style(var(--n): 3): red; else: green);
  background: if(style(3: --n): red; else: green);
  background: if(style(3: var(--n)): red; else: green);
}
```

我们再用 `=` 写法来试试使用 `new` 值的例子：

```css
.box {
  --s: new;

  background: if(style(--s = new): red; else: green);
}
```

替换后得到 `style(new = new)`。接下来解析会……失败！因为 `new` 不属于上面列出的任何类型，所以条件为 false。

这里有一个 demo 展示了所有这些条件，方便你观察两种写法之间的差异：

See the Pen  
The hidden trick of if() by Temani Afif ([@t_afif](https://codepen.io/t_afif))  
on [CodePen](https://codepen.io/).

下面是使用 style queries 的同一个示例：

See the Pen  
The hidden trick of style queries() by Temani Afif ([@t_afif](https://codepen.io/t_afif))  
on [CodePen](https://codepen.io/).

总结一下，你需要记住的是：

使用 `style(--variable: value)` 会对两边的 computed value 进行精确匹配。这种方式适合做“类似字符串”的匹配（例如：`style(--stock: low)`）。

`style(--variable = value)` 会对两个值进行数值比较，并要求它们具有相同的类型（类型来自我前面列出的那些）。这种方式适合数学相关的比较（例如：`style(--n = 5)`）。

第一种方法与 `@property` 结合时还有一个有趣的行为。关于这种情况的更多内容，请看这里：[How to correctly use if() in CSS](https://css-tip.com/inline-if/)。

## 更多 CSS 技巧

- [Graph Theory using Modern CSS](https://css-tip.com/graph-theory/)  
  仅用 CSS 实现最短路径算法。  
  2026 年 2 月 16 日

- [A Better Way to Express Percentage Height](https://css-tip.com/percentage-height/)  
  一种现代替代方案，用来替代经典的百分比高度写法，并且始终有效。  
  2026 年 2 月 10 日