原文：Shrinkwrap Solution
翻译：TUARAN
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 解决 Shrinkwrap：一种全新的实验性技术
原文链接：https://kizu.dev/shrinkwrap-solution/



本文介绍一种用于解决被认为“不可能”的 CSS 问题的新技巧：让包含自动换行内容的元素 实现真正的 shrinkwrap（紧贴包裹）。通过结合锚点定位（anchor positioning）与滚动驱动动画（scroll-driven animations），我们可以通过“测量内部内容”来调整元素 的外部尺寸。

在很多场景下，这套方法今天已经能工作，并且可能为未来的原生特性打开思路。

#### 简单场景[anchor](https://kizu.dev/shrinkwrap-solution/#simple-case)

我们再来看看在 [“The Problem”](https://kizu.dev/shrinkwrap-solution/#the-problem) 一节里提到的那个例子：

##### 我是一个更长的 题；我会换行而且看起来很糟！哦不！我们能做什么？

现在，把“基础技巧”应用到它身上。

（原文此处有可缩放的交互演示，用于观察不同换行机会下的表现；译文略去这些演示 UI。）

它能工作！但我们是怎么做到的？

下面是实现该技巧所需的 HTML（关于这个示例额外需要 的 CSS，见旁注）。注意：这里不再是单个元素 ，而是一个相当特定的嵌套结构（旁注里也说明了 `h5` 只是示例）。

  旁注：这个具体示例额外需要添 的 CSS 只有 `--sw-padding: var(--inline-padding)` —— 我会在后面的 [base technique’s CSS API](https://kizu.dev/shrinkwrap-solution/#base-techniques-api) 里解释它。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#and-css-Context)。

  旁注：这里的 `h5` 只是为了示例；实际使用时它可以是 `p`、`span` 或任何符合 用例的元素 。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#specific-h5-Context)。

<h5 class="shrinkwrap">
  <span class="shrinkwrap-content">
    <span class="shrinkwrap-source">
      <!-- Text -->
    </span>
    <span class="shrinkwrap-probe"></span>
  </span>
</h5>

顶层 `shrinkwrap` wrapper 的 CSS 里有 个关键部分（细节作者会略过，完整 式可查 full code）：

  旁注：如前所述，这里会跳过很多具体 式；如果 想看完整实现，可以查 [full code](https://kizu.dev/shrinkwrap-solution/#full-code)。下面的解释会更关注整体思路。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#skipping-details-Context)。

.shrinkwrap {
  /* 1. Setting up overrideable custom properties. */
  @layer defaults {/*…*/}

  /* 2. Base styles: some other values are allowed. */
  display:  block;
  overflow: hidden;

  /* 3. Scroll-driven animations for remote measuring. */
  timeline-scope:     /* One timeline   */;
  animation:          /* Two animations */;
  animation-range:    /* Two ranges     */;
  animation-timeline: /* One timeline   */;

  /* 4. Applying the measured dimensions to the element. */
  inline-size:     /* Cyclic-toggled value. */;
  min-inline-size: max(/*…*/);

  /* 5. Some important resets. */
  box-sizing: content-box !important;
  flex-grow:  0 !important;
  flex-shrink:     /* Cyclic-toggled value */;
  max-inline-size: /* Cyclic-toggled value */;
}

这里使用 layers（层）与自定义属性来定义这套技巧的 [CSS API](https://kizu.dev/shrinkwrap-solution/#base-techniques-api)。

最外层元素 需要处在正常文档流里：`block` 或 `inline-block` 都可以，也可以在 flex 或 grid 的上下文中；但这个元素  *自身* 不能建立 grid 或 flex 布局（也就是不能成为 grid/flex 容器）。

关键点之一：我们用滚动驱动动画获取内部元素 的尺寸。作者会在后面的 [“Remote Dimensions Measuring”](https://kizu.dev/shrinkwrap-solution/#remote-dimension-measuring) 小节里再展开讲。

关键点之二：把测量到的尺寸应用回这个元素 。这里的 `inline-size` 与 `min-inline-size` 会 据滚动驱动动画写入的变量来计算。

作者还列出了一些“最好别改”的属性， 为我们在用非常特定的方式给父元素 定尺寸。当然这块也可能会调整：可以 入更多需要强制的属性，或在某些场景允许覆盖。

  旁注：这里（以及文章 其他地方）作者使用了自己的 [“Cyclic Dependency Space Toggles”](https://kizu.dev/cyclic-toggles/) 技巧，来有条件地应用 式，主要目的是在浏览器不支持所需 CSS 特性时提供更优雅的降级方案。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#cyclic-toggles-Context)。

##### 内容 Wrapper 的 式[anchor](https://kizu.dev/shrinkwrap-solution/#styles-for-the-content-wrapper)

（原文此处同 有 3D 演示与可切换选项；译文略去这些演示 UI 文本。）

可以看到 `shrinkwrap-content` 会超出父元素 盒子的边界；当 调整示例大小时，也能观察到：正是它在决定内部文本如何换行。

`shrinkwrap-content` 就是那个可能比外层 `shrinkwrap` 元素 更大的“内盒子”（关于文本对齐会带来的影响，作者在后面会更详细展开，见旁注）。

  旁注：这里省略了一些 式，它们在后面的 [“Non-Left Text Alignment”](https://kizu.dev/shrinkwrap-solution/#non-left-text-alignment) 小节里会更好理解。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#text-alignment-later-Context)。

.shrinkwrap-content {
  /* 1. Base styles. */
  display:  block;
  overflow: hidden;

  /* 2. Inner box’ dimensions. */
  inline-size:     /*…*/;
  min-inline-size: min-content;
}

目前内盒子的 式（在这一阶段）比较简单：

需要一些基础 式——同 要保证它处在正常文档流里；并且必须有 `overflow: hidden`， 为滚动驱动动画需要依赖这个元素 的溢出裁剪。

接着，我们要用一种相当特定的方式给它定尺寸：它会复用我们在 wrapper 上设置的一些“私有”自定义属性，这些属性基于技巧对外提供的 API。这里最重要的是 `inline-size`：作者默认用 `100cqi` 进行尺寸设定，从而让它不依赖 `shrinkwrap` 的尺寸。

##### Source（源）元素 的 式[anchor](https://kizu.dev/shrinkwrap-solution/#styles-for-the-source)

`shrinkwrap-source` 是结构里相对更简单的一个元素 ：

  旁注：它只是包住行内内容。作者省略了它的示意图， 为它和下一节的图 乎一 ，而且这一节很短。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#same-illustration-Context)。

.shrinkwrap-source {
  anchor-name: var(/*…*/);

  @layer defaults {
    display: inline;
  }
}

它提供了本技巧需要的 `anchor-name`，并且可以通过自定义属性 API 重新指定。

默认情况下，它 *必须* 是 `inline`， 为测量时我们依赖它是行内盒子。不过也有一些用例不是测量 *行内* 元素 ，所以作者把这条 式放在较弱的层里，允许在外部覆盖。

##### Probe（探针）元素 的 式[anchor](https://kizu.dev/shrinkwrap-solution/#styles-for-the-probe)

最后是 `shrinkwrap-probe` 元素 ：

（原文此处有 3D 演示与可切换选项；译文略去这些演示 UI 文本。）

默认情况下，这个元素 会被锚定到覆盖 `shrinkwrap-source` 的区域，然后把自身测得的尺寸“ 递”给 `shrinkwrap`。

@supports (timeline-scope: --f) {
  .shrinkwrap-probe {
    /* 1. Base styles. */
    position:       absolute;
    pointer-events: none;

    /* 2. Anchoring to the Source. */
    position-anchor: var(/*…*/);
    inset-block:     0;
    inset-inline:    calc(/*…*/);
    margin:          calc(/*…*/);

    /* Establishing the view timeline. */
    view-timeline: /*…*/;
  }
}

这是一个绝对定位的元素 ，用来测量 source 元素 （旁注里作者解释了为什么这里不太建议用 `fixed`）。我们需要给它设置 `pointer-events: none`，避免它以任何方式干扰页面交互。另一种选择是 `visibility: hidden`，但作者觉得保留“可见”（只是禁用 pointer events）更方便调试。

然后我们把它锚定到 `shrinkwrap-source`。后续一些变体技巧可能会覆盖其中部分值；但默认情况下，我们主要关心 `inset-inline`，并用锚点定位来定义它。此外，还可以通过 `margin` 可选地调整测量矩形。

最后，需要建立一个 `inline` 方向的 view timeline，这 在 `shrinkwrap` 元素 上就能通过 `timeline-scope` 与 `animation` 等属性访问并使用它。

  旁注：作者也试过在这里用 `position: fixed`，但稳定性不如 `absolute`，尤其是在 Safari 和 Firefox 上。虽然 `fixed` 的锚点定位在某些场景很有用，但只要可能，最好优先保持 `absolute`；只有在别 选择时再用 `fixed`。
更多细节见作者文章 ：[“Anchoring to a Containing Block”](https://blog.kizu.dev/anchoring-to-a-containing-block/)。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#better-not-fixed-Context)。

另外， 也可以用 `@supports` 把整个 probe 元素 包起来：如果不支持 `timeline-scope`，那就没有理由对它做任何事。

#### 非左对齐文本[anchor](https://kizu.dev/shrinkwrap-solution/#non-left-text-alignment)

如果只是左对齐文本，上面的 式就已经足够了： 为 `shrinkwrap-source` 的左边界保持一致，外层 `shrinkwrap` 只要缩到合适宽度即可。

但如果我们在元素 上覆盖了 `text-align`，就可能出现一些问题。

（原文此处有一个可以切换 `text-align` 并观察效果的交互示例；译文略去演示 UI。）

这个示例背后的代 仍然在使用可工作的技巧；作者只是覆盖了“修复该行为”的关键部分，从而展示问题。

 会看到外层 wrapper 的尺寸是对的，但文本的渲染与对齐发生在 wrapper *内部*，因此我们还需要额外处理。

 为内盒子比外盒子更大，并且文本是在 *内盒子* 里对齐的，所以仅仅缩小外盒子还不够——我们还需要检测 `shrinkwrap-content` 与 `shrinkwrap-source` 之间的那个偏移量。

  旁注：另一种做法是，如果我们事先知道对齐方式，就可以直接改 `shrinkwrap-content` 的 `justify-self`；但作者选择做自动调整。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#or-realign-Context)。

好消息是：借助[我们测量元素 的方式](https://kizu.dev/shrinkwrap-solution/#remote-dimension-measuring)，可以复用滚动驱动动画写入的变量，来调整 `shrinkwrap-content` 的位置：

/* Added to the other styles */
.shrinkwrap-content {
  position: relative;

  @supports (timeline-scope: --f) {
    inset-inline-start: min(/*…*/);
  }
}

我们把元素 设为 `position: relative`，并用 `inset-inline-start` 去调整它的位置。

  旁注：作者让 `position: relative` 始终存在（不依赖时间线支持）， 为这个属性可能会影响元素 内容；在降级场景里也不希望丢掉它。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#always-relative-Context)。

（原文此处还有一个演示，展示切换 `text-align` 时 `.shrinkwrap-content` 如何移动；译文略去演示 UI。）

有意思的是：Safari 在“对齐/变换”文本时的渲染方式和其他情况差异很大。比如在这个示例里，切换 `text-align` 时，Chrome 的第一行可能完全不变，而 Safari 则会有明显差异。

作者认为可能还有其他文本边缘情况是基础技巧覆盖不到的——如果 想到什么，也欢迎告诉他。

#### 多层嵌套的行内内容[anchor](https://kizu.dev/shrinkwrap-solution/#multiple-nested-phrasing-contents)

基础技巧本身只适用于“内部是行内（phrasing）内容”的 shrinkwrap；但更复杂的情况，也可以通过**对每一段行内内容重复使用这套技巧**来覆盖。

例如：我们有一个包含多条列表项的列表，想把它放进一个卡片里，并让卡片的边缘能紧贴列表项内容的最宽处。做法是：把列表当作容器，然后把每个列表项的内容都用这套结构包一层，再用 `max-content` 给卡片定尺寸——它就能工作！如果某个列表项包含多个段落，就对每个段落各用一次。

（原文此处有交互示例，展示列表在“最多 容器 50%”的同时，仍然能对启用 `text-wrap: balance` 后产生的换行做 shrinkwrap；译文略去演示 UI。）

你可以关闭 shrinkwrap 修复来对比差异；调整示例尺寸也会展示：元素 会依据自身换行情况最多 据 50% 的空间，但会把剩余空间让给旁边的列。

总之：我们可以把基础技巧当作更复杂布局的“积木”。后续 节会在这个基础之上继续扩展，不过会调整测量方式，以及“到底在测量什么”。

#### 基础技巧的 API[anchor](https://kizu.dev/shrinkwrap-solution/#base-techniques-api)

这套技巧的 HTML 结构本身就是它的 API 的一部分：

<div class="shrinkwrap">
  <div class="shrinkwrap-content">
    <span class="shrinkwrap-source">
      <!-- Text -->
    </span>
    <span class="shrinkwrap-probe"></span>
  </div>
</div>

`shrinkwrap` 和 `shrinkwrap-content` 不一定要用 `div`，但 论用什么 签，它们都只能保持 `display: block`（这条 式由技巧本身提供，不应该被覆盖）。

`shrinkwrap-source` 用来定义“我们要测量的对象”，默认是 `display: inline`。如果 通过 `shrinkwrap-probe` 改写了目标，也可以把它应用到别的元素 上，甚至完全省略这一层。

`shrinkwrap-probe` 是用来测量的元素 ：它必须严 放在 `shrinkwrap-content` 之内；默认会测量 `shrinkwrap-source`。如果 覆盖它的 `inset`，就能改写 `shrinkwrap-probe` 实际在测量什么。

除了 HTML 结构外，我们还可以在 `shrinkwrap` 元素 上定义一组 CSS 自定义属性：

`--sw-limit` —— 最关键的自定义属性，默认值为 `100cqi`。当 希望 shrinkwrap 元素 与其他元素 并排放在同一“行”时会用到它。上面的 [“Multiple Nested Phrasing Contents”](https://kizu.dev/shrinkwrap-solution/#multiple-nested-phrasing-contents) 就是一个例子：它把该值设为近似 `50cqi - 3 * var(--gap) - var(--list-item-padding)`，以此定义文本最多能 到容器一半宽度（再减去布局里的 padding 与 gap）。同时这也相当于定义了一个 max 限制（旁注解释了为什么没做 min-limit）。

`--sw-padding` 适用于“外层有统一 padding”的场景。使用该技巧时，我们处在一种类似 `box-sizing: content-box` 的语境里，因此需要通过这个属性把可能的偏移量 进去。它的效果有点像在 `--sw-limit` 里写一个 `calc()`；很多时候这 处理 padding 更简单，但更复杂的场景可能更适合用计算后的 `--sw-limit` 来解决。

`--sw-inner-padding` 稍有不同，它更多用于涉及 `--sw-inset` 或 `--sw-source` 覆盖的复杂情况。这个属性用来计入：`shrinkwrap` 与 `shrinkwrap-content` 内被测量内容之间，可能存在的那部分 padding。

`--sw-inset` 用来覆盖 `shrinkwrap-probe` 的 `inset` 值，从而可以把 probe 锚定到多个元素 上，处理类似 [“Multiple Explicit Anchors”](https://kizu.dev/shrinkwrap-solution/#multiple-explicit-anchors) 的复杂场景。这时 `--sw-inner-padding` 也会很有用：它会自动参与某些计算，而这些计算用 `inset` 简写往往更难表达。注意：这个自定义属性针对的是 `inset-inline`，而不是 `inset`。

`--sw-source` 用于少数需要覆盖 `shrinkwrap-probe` 的 `anchor-name` 的场景。当被测量元素 存在于 `shrinkwrap` *外部* 时，这个属性就能帮助我们把两者“连接”起来。相关思路可以看作者文章 ：[“Inline Custom Identifiers”](https://blog.kizu.dev/inline-custom-identifiers/)。

  旁注：作者最初也想 入一个用于“最小限制”的自定义属性，但后来为了简化 API 去掉了。如果确实需要，仍然可以用 `max(min-limit, limit)` 自己实现同 效果。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#no-min-limit-Context)。

### 远程尺寸测量[anchor](https://kizu.dev/shrinkwrap-solution/#remote-dimension-measuring)

作者这里用到了一种技巧：他大概在 2023 年（发表第二篇滚动驱动动画文章 《[my second article about scroll-driven animations](https://kizu.dev/position-driven-styles/)》之后）想出了其基础思路。此前他还没正式写文介绍过这套方法，但私下里有 个草稿，偶尔在后台继续打磨不同用例。

幸运的是，也有人想到了类似思路并写了出来：比如 [Temani Afif](https://css-articles.com/) 在 2024 年 7 月写的《[How to Get the Width/Height of Any Element in Only CSS](https://frontendmasters.com/blog/how-to-get-the-width-height-of-any-element-in-only-css/)》。

两种技巧有一个关键差异：Temani 的方法依赖“测量元素 ”位于盒子的起点，然后利用它的 `1px` 尺寸，以及它相对于 scrollport 的比例，来反推出 scrollport 的尺寸。

而作者这里使用锚点定位，把 probe 放到他想测量的那个非常具体的位置；因此他改用一个很大的 `timeline-range` 值（存进 `--resolution` 自定义属性）。

当 view timeline 在这个范围内报告自己的位置时，我们只要知道这个“分辨率”，就能通过把 timeline scope 提升到另一个元素 上，取回那个位置，从而得到我们想要的数值。

下面是与滚动驱动动画有关的那段 CSS（之前作者在文中略过了它；旁注说明了这段代 来自哪里）：

  旁注：这只是从技巧的 [full code](https://kizu.dev/shrinkwrap-solution/#full-code) 里复制出来的、与滚动驱动动画相关的代 ，注释也原 保留。这些注释能帮助 大致理解发生了什么；作者也提到他打算另写一篇文章 专门解释这种测量方法及其性质，等写好后会从这里链接过去。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#snippets-from-full-Context)。

.shrinkwrap {
  /* Lifting the scope of view timelines from inside. */
  timeline-scope: --_sw-x;

  /*
    Accessing the start and end coordinates of the
    inner element via scroll-driven animations.
    Only apply when the technique is enabled.
  */
  animation: var(--sw-enabled--on,
    --_sw-x-start linear both,
    --_sw-x-end   linear both
  );

  /*
    Calculating the actual size from the variables applied
    via the animation with the given resolution.
  */


@supports (timeline-scope: --f) {
  .shrinkwrap-probe {
    /* Exposes the element to the scope on an ancestor. */
    view-timeline: --_sw-x inline;
  }
}

@property --_sw-x-start {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}

/* The keyframes that deliver their values. */
@keyframes --_sw-x-end {
  0%   { --_sw-x-end: 0 }
  100% { --_sw-x-end: 1 }
}
@keyframes --_sw-x-start {
  0%   { --_sw-x-start: 0 }
  100% { --_sw-x-start: 1 }
}

作者计划另写一篇文章 ，详细解释这种“尺寸测量”是怎么工作的；因此在本文中他不想重复展开（也不想把本文再写得更长）。

所以——敬请期待下一篇。

### 会导致 Safari 崩溃的 Bug[anchor](https://kizu.dev/shrinkwrap-solution/#a-crashing-safari-bug)

如同在 [disclaimer](https://kizu.dev/shrinkwrap-solution/#disclaimer) 中提到的那 ，这个技巧非常实验性，它依赖的 CSS 特性也都很新；即便它们已经出现在主流浏览器的“稳定版”里，也仍可能偶尔引发问题。

起初作者是用伪元素 来创建 probe 元素 的，但在测试文章 时，他发现某些条件下会触发 Safari 的 签页崩溃（[crashing its tab in Safari](https://bugs.webkit.org/show_bug.cgi?id=302703)）。

在把代 缩减成最小复现（minimal reproduction）之后，作者发现“probe 元素 是伪元素 ”是触发崩溃的条件之一，于是他调整了技巧：把伪元素 替换成真实 DOM 元素 。

  旁注：作者还写过一篇文章 《[Minimal Reproductions](https://blog.kizu.dev/minimal-reproductions/)》，解释在报 bug 时为什么要做最小复现，以及这 做的各种好处。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#reduce-reproduce-report-Context)。

作者一开始的技巧里其实还有另一个不会触发问题的伪元素 ；但他最终把技巧简化到：只用一个额外元素 就能完成两次测量。

### 处理复杂内容[anchor](https://kizu.dev/shrinkwrap-solution/#solving-for-complex-content)

基础技巧适用于较简单的情况：source 元素 内部是“行内（phrasing）内容”，也就是只有 `inline`（以及 `inline-…`）元素 。

那更复杂的情况怎么办？比如：在可换行（wrapping）的 flexbox / grid 里，内部有多个 item？

一些更简单的复杂情况，如果能拆成多个彼此独立的“行内内容上下文”，就可以通过重复使用基础技巧来解决——见上文的 [“Multiple Nested Phrasing Contents”](https://kizu.dev/shrinkwrap-solution/#multiple-nested-phrasing-contents)。但并不是所有问题都能 这种方式搞定。

#### 多个显式锚点[anchor](https://kizu.dev/shrinkwrap-solution/#multiple-explicit-anchors)

作者在之前的文章 里（[“Wrapping Flex Items”](https://kizu.dev/shrinkwrap-problem/#wrapping-flex-items) 小节）介绍过这个用例以及一些解法；而这篇文章 里的新技巧在此基础上做了改进。

简单来说：如果我们有一个可换行的 items 列表（在 grid 或 flex 容器中都行），并且我们知道 items 的数量，那么就可以给每个 item 分配一个唯一的 anchor，然后用一个把 *所有 anchors* 都包含进去的 `min()` 函数，找出用于确定 shrinkwrap 尺寸的“最远”元素 。

（原文此处有可切换 `justify-content` 等选项的交互演示，展示 论内部如何对齐，都能让外层容器左右两侧紧贴内容；译文略去演示 UI。）

类似于 `text-wrap: balance` 会让这类问题更显眼一 ，将来出现的 `flex-wrap: balance` 也会让 flexbox 布局中这类问题更突出。

 为作者把“测量”抽象成了一个独立元素 ，实现这个用例只需要做下面这些事（先把与技巧 关的视觉 式去掉）：

  旁注：这里必须回退到 `calc(infinity * 1px)`，否则当一个或多个 item 不在 DOM 中时，计算可能会出问题。

  在 `min()` 里 入 `infinity`，会让这个 item 在计算时被优雅地完全忽略。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#infinity-fallback-Context)

      anchor(--c inside, calc(infinity * 1px)),
      anchor(--d inside, calc(infinity * 1px)),
      anchor(--e inside, calc(infinity * 1px)),
      anchor(--f inside, calc(infinity * 1px)),
      anchor(--g inside, calc(infinity * 1px))
    )
  ;
}

HTML 也很简单：用 shrinkwrap 结构把整个列表包起来即可：

<div class="shrinkwrap">
  <div class="shrinkwrap-content">

在这个例子里，我们要做的 心事情就是：用 `min()` 把所有 items 的 anchors 都 进去，从而比较所有 item 的 inset 位置，选出能形成最大包围盒的那组值。

除此之外，我们还可以使用 `--sw-inline-padding`（原文应为 `--sw-inner-padding`）来把 item 周围的 padding 纳入计算；在这个用例里，这通常比往 `min()` 里塞更复杂的表达式要容易得多。

#### 链式锚点怪物（Chained Anchors Abomination）[anchor](https://kizu.dev/shrinkwrap-solution/#chained-anchors-abomination)

当然，上面的代 依赖 个前提：我们需要知道元素 数量、给每个元素 分配唯一的 anchor  识符、然后把它们全都列进一个 `min()`。但如果我告诉 ：我们甚至可以不这么做呢？

确实可以——但目前基本只在 Chrome 能用。 为它依赖一种能力：把多个 anchors **链式串起来**（chaining multiple anchors）。而这个行为目前只有 Chrome 相对可 ，Safari 和 Firefox 在这方面还有很严重的 bug（见旁注链接）。

  旁注：[Safari bug](https://bugs.webkit.org/show_bug.cgi?id=301919) 与 [Firefox bug](https://bugzilla.mozilla.org/show_bug.cgi?id=2005455)。感谢 [Nicolas Chevobbe](https://nicolaschevobbe.com/) 的[问题报告](https://mastodon.social/@nicolaschevobbe/115700395235230603)！[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#chained%20bugs-Context)。

（原文此处有一个可以调 item 数量与 `justify-content` 的交互演示；译文略去演示 UI。）

作者把这个列表的 item 数量限制为 99：在这种设定下，即使有 10000 个元素 也能跑得不错，主要是 为到某个阶段就不会再出现“比所有其他元素 更 左/更 右”的元素 了，于是链式 递会提前停止。

如果我们真的把元素 一个接一个完整串起来，Chrome 在超过 100 个元素 后就会开始出现长任务（long tasks）；渲染 1000 个元素 时作者测到大约需要 17 秒。

这次的 HTML 在某一方面更简单（不需要独一 二的 识符），但在另一面更复杂（每个 item 需要额外的 probe 元素 ：左右各一个）：

  <div class="shrinkwrap">
    <div class="shrinkwrap-content">
      <ol>
        <li>
          An item
          <div class="probe-left"></div>
          <div class="probe-right"></div>
        </li>
        <!-- the rest of the elements  -->
      </ol>
      <div class="shrinkwrap-probe"></div>
    </div>
  </div>
</div>

你可以看到：除了 `shrinkwrap-probe` 元素 外，每个 item 还有自己的 `probe-left` 和 `probe-right` 两个元素 。

但问题来了：在不使用 `min()`、也不显式枚举每一个元素 的前提下，我们要怎么测出“所有元素 的包围盒（bounding box）”？

下面是实现该思路的 CSS（旁注说明了这里为什么用物理方向而不是逻辑方向）：

  旁注：为了简洁与更容易理解，作者这里使用了物理关键字（left/right）而不是逻辑关键字（inline-start/inline-end）。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#non-logical-Context)。

li {
  anchor-name:  --li;
  anchor-scope: --li;
}

.probe-left,
.probe-right {
  position:       absolute;
  pointer-events: none;
  inset:          anchor(--li inside);
  container-type: inline-size;

  &::before {
    content:  "";
    position: absolute;
    inset:    0;
  }
}

.probe-left {
  left:  anchor(--li left, 0);
  right: anchor(--leftmost left, anchor(--li right));

  @container (min-width: 1px) {
    &::before {
      anchor-name: --leftmost;
    }
  }
}

.probe-right {
  left:  anchor(--rightmost right, anchor(--li left));
  right: anchor(--li right, 0);

  @container (min-width: 1px) {
    &::before {
      anchor-name: --rightmost;
    }
  }
}

.shrinkwrap {
  --sw-inner-padding: 1em
  --sw-inset:
    anchor(--leftmost  left)
    anchor(--rightmost right)
  ;
}

从结尾倒着看：由于没有 `shrinkwrap-source`，我们通过覆盖 `--sw-inset`，让它从“最靠左”和“最靠右”的 item 上取 inset 值——而这些最值会在后续步骤里动态确定。

接着，我们给 items 分配一个带 scope 的 anchor 名称：

li {
  anchor-name:  --li;
  anchor-scope: --li;
}

我们需要 *scope*，这  item 内的 probe 元素 才能看到“对应 item 的 anchors”；否则它们可能会向上找到自己能看到的最后一个 anchor。

接下来就很有趣了：我们把父级 `<li>` 当作嵌套 probes 的锚点（给它们设置 `inset: anchor(--li inside)`），并且把这些 probes 设为 *行内容器*（`container-type: inline-size`），从而可以在它们的内部伪元素 上写容器查询。

然后，对于用来测量“包围盒右边界”的 probe，我们这 写（`probe-left` 这边会做镜像处理）：

.probe-right {
  left:  anchor(--rightmost right, anchor(--li left));
  right: anchor(--li right, 0);

  @container (min-width: 1px) {
    &::before {
      anchor-name: --rightmost;
    }
  }
}

这里依赖“链式 anchor”的能力（见作者的 [chaining](https://kizu.dev/shrinkwrap-solution/#chaining) 说明）：当多个目标共享同一个 anchor 名称时，可以锚定到其中“前一个有效的目标”。然后我们用容器查询检查 probe 是否有正宽度：一旦它宽度为正，就意味着它的边界在 *上一个* rightmost probe 的右侧。

  旁注：有趣的是，这件事最初并不容易做到。它是 [Xiaocheng Hu](https://github.com/xiaochengh) 提到 CSSWG 的一个议题（[w3c/csswg-drafts#8165](https://github.com/w3c/csswg-drafts/issues/8165)），作者在写第一篇锚点定位文章 时也对这个议题提供过[反馈](https://github.com/w3c/csswg-drafts/issues/8165#issuecomment-1469912952)。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#chaining-Context)。

某种意义上，这是一个完全由布局表达出来的“求最大值算法”——锚点定位 + 容器查询！它依赖元素 的布局顺序：后面的元素 可以锚定到前面的元素 ，因此它们可以利用容器查询内部动态写入的 anchor 名称。

如果你觉得不太好理解，原文还有一个把 `probe-left` 和 `probe-right` 高亮出来的演示会更直观（译文略去演示 UI）。

从效果上看：probe 元素 会用不同方向的斜线表示状态——左侧的蓝色、右侧的绿色表示宽度为正、因此触发了容器查询样式；红色表示尺寸为 0，因此不匹配容器查询。

你可以通过调整示例尺寸、改变 items 数量来更好理解发生了什么。

当我们逐个遍历元素 时，会把左右两侧的 probe 分别定位到相应位置：它们要么从“上一个已进入正宽度容器查询的伪元素 ”的边缘继续延伸，要么回退到第一个元素 的尺寸。最终会形成一串“台阶”，而真正具有正尺寸的只会是最靠右和最靠左的那个。

可惜 Safari 和 Firefox 目前还无法很好地支持这种 chaining……

### Cross-Dependencies: Menu Use Case[anchor](https://kizu.dev/shrinkwrap-solution/#cross-dependencies-menu-use-case)

最后一个、也是最难的用例，是类似“导航菜单”的场景：所有元素参与同一个 flex 上下文，并且当空间不足时，每个元素都应该一起“缩一缩”。

当菜单项短、数量少、空间足够时，一切看起来都没问题，例如：

- Home / About Me / My Projects

但当菜单项更长、数量更多、空间不足而不得不换行时，问题就出现了，例如：

- Home / About Me / My Weird Projects / All My Blog Posts

此时 items 会换行，而它们之间的间隙会变成一团不均匀、很难看的空白。

本质上，这和其他 shrinkwrap 问题是同一类：一旦换行，元素会尽可能占满可用空间；当多个元素都在争夺这块空间时，就会触发重新分配。

如果前面介绍的“基础技巧”能直接解决它就太好了，但它做不到。基础技巧要成立，我们必须知道当前工作区间的 *限制（limit）*；可在这种菜单里，每个元素的可用宽度取决于 *所有其他元素*，并且会根据周围额外元素的多少按比例变化，因此我们暂时还无法做到这一点（见旁注）。

  旁注：作者确实有一些想法，也做了很多实验；偶尔看起来接近成功，但总会被某些东西拦住，多数时候是闪烁的无限循环（flickering infinite loop）。也许哪天能行吧！[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#cannot-achieve-Context)。

作者目前找到的唯一办法是“内容复制”：先把菜单按常规方式渲染出来但隐藏，测量换行后的各个元素尺寸，然后把这些尺寸逐个同步到可见的拷贝上。

接着，再把整个菜单放进“基础技巧”的另一个实例里：这样就能把整个菜单也 shrinkwrap 起来，让周围元素（比如搜索框）可以接管我们省出来的空间。

（原文此处有交互演示：可以调菜单项数量、开关 shrinkwrap、以及启用“顺序收缩”等选项；译文略去演示 UI。）

在这个示例里，关闭 shrinkwrap 会立刻让你看到它的价值：不仅间隙更舒服，还能把空间让给像搜索这类更需要空间的元素。

不过作者也坦言：这种菜单还有更多问题。在更窄的屏幕上会变得很糟；也许需要配合容器查询、切换布局方式，才能进一步改进。

作者暂时不会提供更细的实现说明或代码：它非常脆弱；也许等他对这类布局再多玩一阵子，会找到更好的应用方式，或者另想他法。

这个案例想表达的是：*复杂用例就是复杂*。我们可以在某些方向上“更接近”解决它，但到底应该如何解决，仍有不少未知。

## Some Other Use Cases[anchor](https://kizu.dev/shrinkwrap-solution/#some-other-use-cases)

在结束本文之前，我不希望文章停留在前面那个“还没完全解决”的偏苦涩的注脚上。所以我们回到我在上一篇 shrinkwrap 文章（[The Shrinkwrap Problem: Possible Future Solutions](https://kizu.dev/shrinkwrap-problem/)）里的一些例子，看看新技巧能把它们解决得更好。另外我还会补充两个在上一篇里没覆盖的用例。

### Chat Bubbles[anchor](https://kizu.dev/shrinkwrap-solution/#chat-bubbles)

我最喜欢的例子之一是“聊天气泡（chat bubbles）”——从手机 App 到电子游戏，你几乎到处都能看到这种 UI。我猜原生框架都有自己的实现方式，但在 Web 上，直到现在，我们还很难只用 CSS 做出这种效果。

    （原文此处为可交互演示：可切换 shrinkwrap 与 `text-wrap: balance`；译文略去演示 UI。）

      
        

        
        
      
    
  
  
    
      
        

        
        
      
    
  
  
    
      
        

        
        
      
    
  
  
    
      
        

        
        
      
    
    
      
        

        
        
      
    
  


与我上一篇文章中的[原始气泡示例](https://kizu.dev/shrinkwrap-problem/#chat-bubbles)相比，这个版本能保留“左对齐”的文本对齐方式——因为新技巧把对齐也考虑进来了。

而且有了这套技巧，`text-wrap: balance` 终于更能发挥价值了！你可以试着把它关掉对比。

实现上也比我以前“用锚点定位去伪造气泡背景”的做法简单太多。现在我们只需要给 blockquote 设置 `max-width: max-content`，并把每个段落用这套技巧包一层，就像这样：

<blockquote>
  <p class="shrinkwrap">
    <span class="shrinkwrap-content">
      <span class="shrinkwrap-source">
        Hello, there!
      </span>
      <span class="shrinkwrap-probe"></span>
    </span>
  </p>
</blockquote>

然后我们只需要再补一小段 CSS：定义 `--sw-limit` 和 `--sw-padding`：

.example-bubbles .shrinkwrap {
  --sw-padding: var(--padding-inline);
  --sw-limit: calc(
    100cqi
    -
    (
      var(--margin-start)
      +
      var(--margin-end)
    )
  );
}

我们需要把各种可能的 padding / margin 都考虑进去，并在示例的外层 wrapper 上加上 `inline-size` 的 containment；除此之外，这足以展示新技巧在使用上能简化多少。

### Fieldsets and Legends[anchor](https://kizu.dev/shrinkwrap-solution/#fieldsets-and-legends)

在我上一篇文章中对应的示例（[legends](https://kizu.dev/shrinkwrap-problem/#legends)）里，我是靠 legend 先扩展、再把边框“补回去”的方式实现的：通过额外的伪元素 来伪造边框。

下面这个 `legend` 使用了新技巧，并且没有任何伪造的边框（见旁注）。它完全依赖原生 `fieldset` / `legend` 的“魔法行为”：

  旁注：如果你想看看今天如何在 *不使用* `fieldset` 的情况下伪造这种效果，我推荐 [Tyler Sticka](https://tylersticka.com/) 的文章《[Faking a Fieldset-Legend](https://cloudfour.com/thinks/faking-a-fieldset-legend/)》。它没有处理“换行”的情况，但如果需要，可以很容易把本文的技巧和 Tyler 的代码结合起来使用。[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#fake-legends-Context)

    （原文此处为可交互演示：展示 legend 在 shrinkwrap 与 `text-wrap: balance` 开关下的效果；译文略去演示 UI。）

    在这个例子里，如果关闭 shrinkwrap，legend 会扩展，从而让边框看起来非常别扭。

    同样地，这个例子也说明了 `text-wrap: balance` 能改善效果——但前提是我们能把它“原生 shrinkwrap”起来。

### Overlay Image Captions[anchor](https://kizu.dev/shrinkwrap-solution/#overlay-image-captions)

这个用例并不在我第一篇 shrinkwrap 文章里；它来自我和 [Johannes Odland](https://odland.dev/) 的一次私下交流，他提到 NRK 里有类似需求。

假设我们有一个带图片的 figure，希望把 caption 覆盖在图片上方，并给它一个半透明背景；同时这个背景要尽量“贴合文字”，以减少遮挡图片的面积。和其他场景一样：文字短时都没问题；但一旦换行，它就会横向占满可用空间。Shrinkwrap 在这里会非常有用。

    ![](https://kizu.dev/shrinkwrap-solution/examples/image-example.jpg)
    
      
        
          A [photo from my Pixelfed](https://pixey.org/p/kizu/819867772992844044), shot in April of 2025.
        
        
      
    
  


再次可以看到 `text-wrap: balance` 在这里很有价值；调整示例尺寸也能观察到 shrinkwrap 在不同尺寸下的收益。

当然，在这个特定例子里，我也可以在文字的两部分之间直接插一个 `<br>` ——这是过去那种“硬编码”解决 shrinkwrap 问题的老办法。但更棒的是：这套技巧不需要靠 `<br>` 也能工作。

### Tooltips[anchor](https://kizu.dev/shrinkwrap-solution/#tooltips)

本文最后一个用例来自我在 Datadog 的工作实践：tooltip / popover。这类组件对做设计系统的人来说应该非常熟悉。很多时候我们希望弹层内容排版“均衡好看”，同时又要有一个上限宽度（通常远小于 viewport 宽度）。如果没有 shrinkwrap，很容易出现难看的效果；而本文技巧可以做出更整洁、好看的 tooltip。

    

  
    
      
      
    
  
  （原文此处为可交互演示：展示 tooltip 内容在 shrinkwrap 与 `text-wrap: balance` 下的效果；译文略去演示 UI。）

在这个例子里，关闭 shrinkwrap 或关闭 `text-wrap: balance` 的影响都会非常明显。

我真希望这套技巧所需的 HTML 能像最终效果一样“优雅”。上面这些 demo 虽然展示了它 *如何工作*，但它很难直接用于用户生成内容；就算你能完全控制 HTML，写起来也仍然挺繁琐。

## What Next?[anchor](https://kizu.dev/shrinkwrap-solution/#what-next)

在我看来，最基础的用例——也就是我们已知元素所能占据的 `max-inline-size` 上限——应该可以通过浏览器的原生能力实现：要么增加一个新属性，要么提供一个可用于尺寸属性的新函数。它可能需要 containment 或类似机制，因为基于百分比的尺寸仍有可能引入循环依赖。但即便需要 containment，这个能力也足以覆盖过去十多年里人们一直想做的许多事情。

我认为我们暂时没必要追求把“菜单用例”（跨依赖 shrinkwrap）也原生化解决——那是一个复杂得多的布局问题。但如果我们先把简单用例打通，就能先摘到这些“低垂的果子”，之后再看看能不能在此基础上推进更复杂的场景。

我会把本文链接以及我对“先探索更简单解决方案”的提案发布到对应的 CSSWG issue 里（[w3c/csswg-drafts#191](https://github.com/w3c/csswg-drafts/issues/191)，旁注见 [#ftf](https://kizu.dev/shrinkwrap-solution/#ftf)）。如果你之前也遇到过这个问题，并且有明确的用例需求，欢迎在 issue 里提出来——也许本文技巧已经能覆盖它们。

  旁注：本文发布时刚好在 CSS Working Group 线下会议周之前，但作者不太认为这次会议会讨论 shrinkwrap。也许要等几个月之后！[跳回旁注上下文](https://kizu.dev/shrinkwrap-solution/#ftf-Context)

另外我还会写另一篇文章：专门讲本文用到的[远程尺寸测量（remote dimension measuring）](https://kizu.dev/shrinkwrap-solution/#remote-dimension-measuring)方法，敬请期待！不过大概率不会很快更新——这类文章的调研和写作周期都很长。

  
    [欢迎在 Mastodon 上告诉我你对本文的看法！](https://front-end.social/@kizu/115966776474014598)
  
[Published on](https://kizu.dev/shrinkwrap-solution/) 

January 27, 2026 with tags: [#Anchor Positioning](https://kizu.dev/tags/anchor_positioning/) [#Scroll Driven Animations](https://kizu.dev/tags/scroll_driven_animations/) [#Future CSS](https://kizu.dev/tags/future_css/) [#Experiment](https://kizu.dev/tags/experiment/) [#CSS](https://kizu.dev/tags/css/)
