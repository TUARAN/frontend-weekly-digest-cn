原文：Lessons Learned from Failed Demos: Pure CSS Nav Thumb Flip on Scroll – Frontend Masters Blog  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 从失败的 Demo 中学到的经验：纯 CSS 的滚动导航缩略图翻转效果

[3D](https://frontendmasters.com/blog/tag/3d/) [CSS](https://frontendmasters.com/blog/tag/css/) [Scrolling](https://frontendmasters.com/blog/tag/scrolling/)

Lessons Learned from Failed Demos: Pure CSS Nav Thumb Flip on Scroll

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2024/09/default.webp?fit=96%2C96&#038;ssl=1)

Ana Tudor  
发表于  
February 26, 2026

最近的一个 [CodePen Spark](https://codepen.io/spark/497) 让我发现了 [这个看起来很酷的 demo](https://codepen.io/vii120/pen/KwMJeXP)。这个效果挺有意思，但它用的 JavaScript 对我来说太多了，所以我想着能不能用 CSS 来实现。另外，我觉得如果翻转效果能根据我们前进的方向，“铰接”在上边缘/下边缘上，看起来会更好。

大约半小时后，我做出了这个效果：

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/550874633-b1332c1f-234c-47db-9bdb-f060d7ad3628.gif?resize=800%2C760&#038;ssl=1)我的结果录屏

来看看我是怎么做的……以及哪里出了问题。

## [](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#the-layout-basics)布局基础

我们有一个 `<nav>` 元素，里面有 `n` 个子元素。由于我们需要用到这个数字 `n` 来做样式上的选择，我们把它作为自定义属性传给 CSS。每个 `nav` 项的索引 `i` 也是同理。为了让自己更省事，我用 Pug 根据一个数据对象生成 HTML——结果大致如下：

```html
<nav style="--n: 7">
  <a href="#" style="--i: 0">
    tiger
    <img src="tiger.jpg" alt="tiger drinking water" />
  </a>
  <a href="#" style="--i: 1">
    lion
    <img src="lion.jpg" alt="lion couple on a rock" />
  </a>
  <!-- the other cats -->
</nav>
```  
Code language: HTML, XML (xml)

这是一个非常简单的结构：用 `nav` 包住若干个 `a` 项，每个 `a` 项里面包含文本和一个 `img` 子元素。

`sibling-index()` 和 `sibling-count()` 这两个 CSS 函数[还没做到跨浏览器可用](https://bugzilla.mozilla.org/show_bug.cgi?id=1953973)，所以我们在生成 HTML 的时候把条目索引和数量作为自定义属性加上，从而传给 CSS。否则，CSS 并不知道一个 HTML 元素到底有多少个子元素。

接下来写 CSS：我们的 nav 使用 fixed 定位，并让它覆盖视口中所有可用空间（注意：这不包含可能存在的滚动条）。

```css
nav {
  position: fixed;
  inset: 0;
}
```  
Code language: CSS (css)

下一步是给它用 `grid` 布局，为网格的单列[限制宽度](https://frontendmasters.com/blog/super-simple-full-bleed-breakout-styles/)，并把这个网格在元素中垂直/水平居中对齐：

```css
nav {
  display: grid;
  grid-template-columns: min(100% - 1em, 25em);
  place-content: center;
  position: fixed;
  inset: 0;
}
```  
Code language: CSS (css)

注意，我们在 `min()` 里用 `100% - 1em`，是为了在网格两侧留出一点空间，避免它紧贴视口边缘，同时又不需要额外写一条 `padding` 规则。毕竟，既然可以把更重要的 CSS 塞进去，为什么要把宝贵的屏幕空间浪费在一条非必要的声明上呢？

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/551003446-e3d4a37f-db71-4df8-b40e-6edf4e143778.png?resize=800%2C800&#038;ssl=1)现在看起来还没什么

`nav` 上重要的样式已经搞定了，接下来加点“美化”。我们给它加一个淡淡的背景，并设置一个相对视口的 `font`，再用 `clamp()` 把它限制在合理范围内——我们不希望文字小到看不清，也不希望在超大屏上膨胀得离谱。

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/551003613-ff332bde-b9f6-4d26-a66a-99977a8508f9.png?resize=800%2C800&#038;ssl=1)嗯，这下差别就有点明显了

`nav` 的样式确定后，我们把注意力转向链接。这里我们用 `flex` 布局，这样就能让文本内容和 `img` 在垂直方向居中，并在水平方向分别靠两端对齐：

```css
nav a {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```  
Code language: CSS (css)

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/551003796-e7eeb327-595d-4081-b906-34ad9d44584e.png?resize=800%2C800&#038;ssl=1)开始有点样子了

每个链接都加一条很细的 `border-bottom` 作为分隔线，并设置左右内边距。这些值都用自定义属性来设定——现在可能看不出意义，但我保证这么做是有原因的。

```css
nav a {
  --pad: min(2em, 4vw);
  --l: 1px;
	
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: solid var(--l) #000;
  padding: 0 var(--pad);
}
```  
Code language: CSS (css)

我们给每个链接设置 `color`，并用 `text‑decoration: none` 去掉默认下划线。这些都只是纯粹的外观调整，我们会在文章后面再回到它们。

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/551004002-1e83aaf9-fa1f-482d-b182-3c08e20452a5.png?resize=800%2C800&#038;ssl=1)粗糙感少了一点

接着，我们为未来的“魔法”做好 `img` 元素的准备：给它们设置尺寸，并确保它们像乖猫一样表现良好——不要拉伸！响应式的图片高度和宽高比也作为自定义属性放在链接内边距和分隔线宽度旁边一起定义——这样做的目的很快就会清楚。

```css
nav a {
  --pad: min(2em, 4vw);
  --l: 1px;
  --r: 3/ 2;
  --h: round(down, min(4em, 30vw, 100dvh/(var(--n) + 1)), 2px);
	
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: solid var(--l) #000;
  padding: 0 var(--pad);
}
```

```css
nav img {
  height: var(--h);
  aspect-ratio: var(--r);
  object-fit: cover;
}
```
代码语言：CSS (css)

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/550962275-908aa24f-35a8-4da4-9b08-7a781f5950d7.png?resize=800%2C800&#038;ssl=1)终于看起来都一致了

由于这些图片会在 3D 空间里翻转，所以还要给它们加上 `backface-visibility: hidden`。这样只有当它们正面对着我们时才可见，转到屏幕后方时就会不可见。

```css
nav img {
  height: var(--h);
  aspect-ratio: var(--r);
  object-fit: cover;
  backface-visibility: hidden;
}
```
代码语言：CSS (css)

当我们想确保它们朝向正确时，这个属性很有用。稍后我们可能会暂时把它注释掉一小会儿，只是为了偷看一下、检查它们在朝向另一边时是否也处在正确的位置。

（原文此处为 CodePen 演示，若无法显示请访问原文查看。）

为了让这些缩略图真正看起来像是在 3D 中旋转，我们会在每个 `img` 的父元素上添加 `perspective` 和 `perspective-origin`。origin 的水平位置需要设置为：距离右边缘（也就是 100%）向左偏移一个内边距 `--pad` 再加上半个 `img` 的宽度（由高度 `--h` 与宽高比 `--r` 计算得出）。

```css
nav a {
  --pad: min(2em, 4vw);
  --l: 1px;
  --r: 3/ 2;
  --h: round(down, min(30vw, 100dvh/(var(--n) + 1)), 2px);
	
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: solid var(--l) #000;
  padding: 0 var(--pad);
  perspective-origin: 
    calc(100% - var(--pad) - .5*var(--h)*var(--r)); 
  perspective: 20em;
}
```
代码语言：CSS (css)

这就是我们为什么需要为这些值使用自定义属性：这样在我们想调整条目左右内边距，或使用不同尺寸的图片时，不必在多个地方同时改动，也能确保整体保持一致。

到目前为止，我们得到的是这样：

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/550961846-c7534391-5005-4ebd-b78c-c8941af1821e.png?resize=800%2C800&#038;ssl=1)当前的视觉效果（没有网格或 flex 覆盖层）

现在让它动起来！

## [](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#the-scroll-basics)滚动的基础

不幸的是，[`scroll-snap-points`](https://www.w3.org/TR/2015/WD-css-snappoints-1-20150326/#scroll-snap-points) 已经被[废弃](https://lists.w3.org/Archives/Public/www-style/2015Nov/0266.html)了，所以现在我们不得不往 DOM 树里塞进这样一个丑陋的「幽灵分支」：

```xml
<div class='snaps' aria-hidden='true'>
  <div class='snap'></div>
  <div class='snap'></div>
  <!-- as may of these as nav items -->
</div>
```
代码语言：HTML, XML (xml)

我们需要让 `nav` 的内容始终固定在视口里，所以它不能滚动。但是，由于现在仅仅把 `html` 撑高已经不足以实现滚动吸附（scroll snapping），我们就必须创建这些可滚动的元素，让滚动能够吸附到它们上面。

```css
* { margin: 0 }

html {
  scroll-snap-type: y mandatory;
  overscroll-behavior: none
}

.snap {
  scroll-snap-align: center;
  scroll-snap-stop: always;
  height: 100dvh
}
```
代码语言：CSS (css)

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/551198558-6319c7a8-ab9a-4ffb-ac6f-297aae9487a2.gif?resize=800%2C800&#038;ssl=1)这里 `.snap` 元素的用法示意

我们还加了 `overscroll-behavior` 来消除橡皮筋式的回弹效果，并加了 `scroll-snap-stop`，避免在快速向上或向下滚动时跳过吸附点。不过，除非我误解了它们本该做什么，否则这两个属性实际上都没有起作用。

## [](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#the-scroll-animation)滚动动画

我们引入一个新的自定义属性 `--k` 来跟踪滚动进度。首先，我们通过 `@property` 注册它，让浏览器把它当作可动画的数值类型来处理。否则，它只会在动画结束状态的几个值之间突然跳变。

```css
@property --k {
  syntax: '<number>';
  initial-value: 0;
  inherits: true
}
```
代码语言：CSS (css)

接着，我们通过一个关键帧 `animation` 将 `--k` 从 `initial-value` 的 `0` 驱动到 `1`，并把这个动画绑定到滚动时间线（scroll timeline）上：

```css
nav {
  /* same as before */
  animation: k 1s linear both;
  animation-timeline: scroll();
}

@keyframes k { to { --k: 1 } }
```
代码语言：CSS (css)

我们用这个 `--k` 的值来计算当前的 `nav` 条目索引，把它命名为 `--j`，并且它需要注册为整数：

```css
@property --j {
  syntax: '<integer>';
  initial-value: 0;
  inherits: true
}

nav {
  /* same as before */
  --j: round(var(--k)*(var(--n) - 1));
}
```
代码语言：CSS (css)

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/551106094-9d9df46f-77c1-4e45-b228-28303eea6914.gif?resize=800%2C800&#038;ssl=1)向下滚动时，当前条目索引发生变化

这里有两点需要注意。

第一，我们必须注册 `--j`，动画才能在 Chrome 里正常工作。我其实不太明白为什么，因为这里被动画驱动的并不是这个 CSS 变量；而在 Safari 中，无论是否注册，动画表现都一样。我一开始注册它只是为了在 DevTools 里跟踪计算值，后来发现当我尝试移除它的 `@property` 块时，演示就坏掉了。也许更懂的人可以补充解释一下。

第二，如果直接把 `--k` 以 step 的方式从 `0` 动画到 `n - 1`，会更简单。不过到目前为止，Firefox 仍然[拒绝](https://bugzilla.mozilla.org/show_bug.cgi?id=1899531)对一个自定义属性进行动画，而该属性的目标值又依赖另一个自定义属性。

## [](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#the-interesting-part)有意思的部分！

现在我们可以继续：根据每个 `nav` 条目的索引 `--i` 以及当前条目的索引 `--j`，去计算旋转角度和「铰链」位置（通过 `transform-origin` 设置）。

我们先将每个项目自身的索引（`--i`）与由滚动推导出的当前索引（`--j`）进行比较。它们差值的符号会告诉我们某个项目是在当前项之前、之后，还是正好对齐；据此我们得到一个二元的选择标记（`--sel`）。当 `--sel` 为 `1` 时，该项目就是当前聚光灯下的那个。

```css
nav a {
  /* same as before */
  --sgn: sign(var(--i) - var(--j));
  --sel: calc(1 - abs(var(--sgn)));
}
```

把这个选择标记当作一个 CSS 布尔值来理解；关于这一点，我以前写过一篇文章（链接），而且讲得相当详细。

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/551111930-096d773f-772e-4c9c-932c-e4276c11ceb7.gif?resize=800%2C800&#038;ssl=1)

所有情况下的符号与选择标记计算

这里有三种可能的情况。

- `--i` 大于 `--j`（索引为 `--i` 的项目在当前项之后），因此它们差值的符号是 `1`，选择标记是 `0`（索引为 `--i` 的项目未被选中）

- `--i` 等于 `--j`（索引为 `--i` 的项目就是当前项），因此它们差值的符号是 `0`，选择标记是 `1`

- `--i` 小于 `--j`（索引为 `--i` 的项目在当前项之前），因此它们差值的符号是 `-1`，选择标记是 `0`（索引为 `--i` 的项目未被选中）

接下来，我们需要用这些值，在这三种情形下计算导航项围绕 *x-*轴的旋转，以及旋转水平轴的垂直位置。

如果你需要复习一下 CSS 3D：绕 *x-*轴旋转的效果，如下面这个在线演示所示：

（原文此处为 CodePen 演示，若无法显示请访问原文查看。）

我们旋转所围绕的 *x-*轴指向那只猫。从猫的视角来看，正向旋转是她看到的顺时针方向。

了解这些之后，我们就能在三种情况里这样使用：

- `i > j`（在当前项之后，符号为 `+1`）—— 图片旋转 `+180°`，围绕一个“铰链”顺时针翻转。这个铰链位于图片上边缘之上、距离为分隔线厚度的一半；其垂直位置可以表示为 `-.5*l`，或者等价地写成 `50% - +1·(50% + .5·l)`

- `i = j`（当前项，符号为 `0`）—— 图片不旋转，因此可以视为 `0°` 旋转，或等价地写成 `0·180°`；由于没有旋转，铰链并不重要，因此它的垂直位置可以随便取，比如默认的 `50%`，或等价地写成 `50% - 0·(50% + .5·l)`

- `i < j`（在当前项之前，符号为 `-1`）—— 图片旋转 `-180°`，围绕一个“铰链”逆时针翻转。这个铰链位于图片下边缘之下、距离为分隔线厚度的一半；其垂直位置可以表示为 `100% + .5*l`，或者等价地写成 `50% - -1·(50% + .5·l)`

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/551164553-47498afe-ef19-4e96-a67d-d442e843ffae.gif?resize=800%2C800&#038;ssl=1)

与旋转相关的计算

上面内容很多，但它展示的不仅是当前项图片的位置，还包括紧挨着它的前一项与后一项：它们被旋转，并且高亮了旋转轴。它们还被水平平移了以避免重叠——这只是为了在图中并排展示；在实际 demo 里并没有这段平移。

现在你可能会疑惑：为什么要写成这些看起来“奇怪”的等价形式？这是为了说明：根据差值符号的不同，这些值都能满足同一套公式。

旋转角度是：

- 符号为 `+1` 时：`+1·180°`

- 符号为 `0` 时：`0·180°`

- 符号为 `-1` 时：`-1·180°`

看出规律了吗？旋转角度就是“符号 × `180°`”。

类似地，铰链的 *y* 轴位置是：

- 符号为 `+1` 时：`50% - +1·(50% + .5·l)`

- 符号为 `0` 时：`50% - 0·(50% + .5·l)`

- 符号为 `-1` 时：`50% - -1·(50% + .5·l)`

同样，除了符号不同之外，几乎完全一致。

把这些放进 CSS，我们得到：

```css
nav a {
  /* same as before */
  --sgn: sign(var(--i) - var(--j));
  --sel: calc(1 - abs(var(--sgn)));
}

nav img {
  /* same as before */
  transform-origin:
    0 calc(50% - var(--sgn)*(50% + .5*var(--l))); 
  rotate: x calc(var(--sgn)*180deg);
}
```

最后一块拼图，是给旋转加上过渡，这样当某个容器项被选中时，图片就不会只是“直接出现在那里”。由于我们也希望项目文字的 `color` 和 `text-indent` 也有过渡效果，因此我们把时长设置为项目级别的自定义属性：

```css
nav a {
  /* same as before */
  --sgn: sign(var(--i) - var(--j));
  --sel: calc(1 - abs(var(--sgn)));
  --t: .5s;
}

nav img {
  /* same as before */
  transform-origin: 
    0 calc(50% - var(--sgn)*(50% + .5*var(--l)));
  rotate: x calc(var(--sgn)*180deg);
  transition: var(--t) rotate
}
```

差不多了，但还没完全对：

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/551176165-94fef295-bd91-486e-ab25-75b400ebe72f.gif?resize=800%2C800&#038;ssl=1)

放慢后的动画，让发生的事情更清晰

一开始效果不错：刚刚取消选中的项目图片，会围绕它的“退出铰链”旋转出去。然而，新选中的项目图片却没有像预期那样围绕“进入铰链”旋转进来；相反，它只是绕着自身的中轴旋转进来。

问题在于：一旦某个项目变为选中态，`transform-origin` 的第二个值（也就是旋转水平轴的 *y* 位置）会突然从“上/下边缘之外半个线条厚度”的位置，跳到元素的中间。我们只希望这种变化发生在旋转完成之后，因此需要添加一个延迟，延迟时间等于旋转的 `transition-duration`。

同时，我们希望在某个条目被取消选中后，保留它当下的状态。一旦它变为未选中，我们希望它的 `transform-origin` 立即跳变到顶边/底边的上方/下方半个线条厚度的位置，具体取决于我们移动的方向。

因此，我们只希望在条目变为选中时（`--sel` 翻转为 `1`）让 `transform-origin` 的“突变”（`0s` 时长）带有延迟；但在条目变为未选中时（`--sel` 翻转为 `0`）则不需要延迟。这意味着我们需要用“选中标记”去乘上这个延迟值。

所以最终的 `transition` 声明如下：

```css
transition: 
  0s transform-origin calc(var(--sel)*var(--t)), 
  var(--t) rotate
```

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/551199082-b3e4ba83-071b-4e8b-970b-04e0f89befc2.gif?resize=800%2C800&#038;ssl=1)

全程都能正确地“铰接”旋转

## [](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#refining-touches)细节完善

除了缩略图翻转之外，我们还希望当文本所在的条目变为当前项时，文本能更突出一些，所以我们提高它的对比度，并让它滑入一点。

同一个用来告诉我们条目是否被选中的 `--sel` 标记，同时驱动 `color` 和 `text‑indent` 的变化。`color` 会从正常情况下的中灰色变为选中情况下接近黑色的颜色，而 `text-indent` 则从 `0` 变为 `1em`。两个属性都加上简单的 `transition`，让变化更顺滑。

```css
/* relevant CSS for the visual motion part only */
nav a {
  --sgn: sign(var(--i) - var(--j));
  --sel: calc(1 - abs(var(--sgn)));
  --t: .5s;
	
  color: hsl(0 0% calc(50% - var(--sel)*43%));
  text-indent: calc(var(--sel)*1em);
  transition: var(--t); 
  transition-property: color, text-indent; 
}

nav img {
  transform-origin: 
    0 calc(50% - var(--sgn)*(50% + .5*var(--l)));
  rotate: x calc(var(--sgn)*180deg);
  transition: var(--t) rotate
}
```

我们的 demo 现在的行为已经和原版一致了，只不过它是由滚动驱动的，并且旋转是围绕分隔线“铰接”进行的。本文开头录屏里展示的就是这个版本。

## [](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#issues)问题

最终效果在 Chrome 里看起来不错，但在 Epiphany 里会出现卡顿/抖动的问题；不过根据我在 [Mastodon](https://mastodon.social/@anatudor/116085163828052104) 和 [Bluesky](https://bsky.app/profile/anatudor.bsky.social/post/3mf27lgt5as22) 上提问后收到的反馈，这在真正的 Safari 里似乎没那么严重。另外，它在 Firefox 中完全没有任何动画。后来发现 Firefox 问题的根源是 [这个 bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1927325)：几年前某个路人提交的。那个路人看起来像是我本人，但我已经完全不记得这事了。

另一个问题是：由于 `nav` 和这些 snap 都在使用动态视口（dynamic viewport），在手机/平板上会出现大量跳动。所以更好的做法可能是：`nav` 使用 small viewport，而 snap 使用 large viewport。

```css
.snap {
  /* same as before */
  height: 100lvh
}

nav {
  /* same as before */
  height: 100svh
}
```

不过，`nav` 使用 small viewport 意味着在某些场景下它可能无法覆盖整个视口，这样底部就可能出现一条白色带——默认页面背景会和 `nav` 那个很淡的背景形成对比。要修复这一点，我们需要把 `background` 从 `nav` 挪到 `html` 或 `body` 上。

既然我们的 nav 条目是链接，它们就应该有可用的 `:hover` 和 `:focus` 样式。

```css
nav a {
  /* same as before */
  --hov: 0;
  color: 
    hsl(345 
      calc(var(--hov)*100%) 
      calc(50% - var(--sel)*(1 - var(--hov))*53%));

  &:is(:hover, :focus) { --hov: 1 }

  &:focus-visible {
    outline: dotted 4px;
    outline-offset: 2px
  }
}
```

另外，最好别用这么亮的 `background` 去迎接夜猫子，所以我们应该尊重用户设置的深色模式偏好，这也意味着需要[重新思考](https://web.dev/articles/light-dark)我们设置 `color` 的方式。

```css
html {
  /* same as before */
  color-scheme: light dark;
  background: light-dark(#dedede, #212121)
}

a {
  /* same as before */
  border-bottom: solid var(--l) light-dark(#121212, #ededed);
  color: 
    light-dark(
      color-mix(in srgb, 
        #9b2226 var(--prc-hov), 
        color-mix(in srgb, #023047 var(--prc-sel), #454545)), 
      color-mix(in srgb, 
        #ffb703 var(--prc-hov), 
        color-mix(in srgb, #8ecae6 var(--prc-sel), #ababab))
    );
}
```

这是那个 demo（记住：这是基于滚动，而不是基于悬停）：

（原文此处为 CodePen 演示，若无法显示请访问原文查看。）

还有，也许我们不该把下划线去掉。虽然这是一个导航组件，所以理应默认里面是链接？我个人对此还挺纠结的。我决定不加回下划线的主要原因是：我不是设计师，而仅仅因为反复尝试、又反复失败地想给下划线做出一个好看且有创意的方案，我就已经被带进了一个和本文主题无关的深坑。

最后，经常有人说“scroll-jacking 是个坏主意，别这么做”。如果滚动效果做得好、而且不过度，我个人其实挺喜欢的，但我也能理解别人可能有不同偏好。

既然这是一个导航，但 demo 里又没有任何内容可供导航，也许我们应该加上内容，并让这个效果在跳转到对应 section 时发生。

不过，这会带来额外挑战：当各个 section 高度不一致时会更难处理；以及通过导航跳过某些 section 时也会遇到问题。这两点我都解决不了。

下面是我能做到的最好效果。它用到了 JavaScript，而且在跳过条目时动画看起来很糟。另外它也不具备响应式，我也确实不知道在很小或非常大的视口上该怎么处理。

（原文此处为 CodePen 演示，若无法显示请访问原文查看。）

## [](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#lessons-learned)经验教训

最重要的一点大概是：事情往往不会按你预期的方式发展。

我在一开始无谓地把这个 demo 复杂化了（为了更广的支持/避免 bug，去设置自定义属性，而不是用 `sibling-index()` 和 `sibling-count()`；也没有直接对当前条目索引 `--j` 做动画）。而到最后，我甚至不需要这么做，因为它本来就无法跨浏览器工作。

我也曾想做一个纯 CSS 的方案，配上漂亮的铰链式动画，但当我试图把它做成可用的东西时，发现不借助 JavaScript 根本做不到，而且我也没法让动画一直保持好看。

另一个同样非常重要的教训是：当你像我一样不太行的时候，任何东西都可能变成一个深不见底的兔子洞。demo 很快就完成了，但我还是不满意，于是又在各种“改进尝试”上花了荒唐的时间；结果没有一个成功，所以最后我把它们全都删掉了。

### 学会使用 Canvas 和 WebGL

![](https://frontendmasters.com/blog/wp-content/themes/fem-v3/images/course-shoutouts/webgl.png)

对创意编程感兴趣吗？我们有一门很棒的课程：[打造获奖网站](https://frontendmasters.com/courses/winning-websites/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=nav-thumbnail-flip-image)，讲师是 Vercel 的设计工程师 Matias Gonzales。你将学习如何用 GSAP 控制 canvas、构建时间轴、实现由滚动和鼠标触发的效果，并且让这一切都具备良好的无障碍支持。订阅 Frontend Masters 可访问 300+ 门课程，并且[今天可享 8 折优惠！](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=nav-thumbnail-flip-image)

- 个性化学习
- 行业顶尖专家
- 24 条学习路径
- 直播互动式工作坊

8 折优惠  
[今天开始学习 →](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=nav-thumbnail-flip-image)

### 留言回复 [取消回复](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#respond)

你的电子邮箱地址不会被公开。必填项已用 * 标注。

评论 *  

姓名 *  

邮箱 *  

网站  

在此浏览器中保存我的姓名、邮箱和网站信息，以便下次评论时使用。

&#916;

### 目录

- [布局基础](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#the-layout-basics)
- [滚动基础](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#the-scroll-basics)
- [滚动动画](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#the-scroll-animation)
- [有意思的部分！](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#the-interesting-part)
- [细节打磨](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#refining-touches)
- [问题](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#issues)
- [经验教训](https://frontendmasters.com/blog/nav-thumbnail-flip-image/#lessons-learned)

### 你知道吗？

我们的课程不止涵盖前端，还包括全栈、DevOps 和 AI。

→ [探索课程（8 折优惠）](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=the-deep-card-conundrum)