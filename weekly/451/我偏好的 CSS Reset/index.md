# 我偏好的 CSS Reset

> 原文：[My Opinionated CSS Reset](https://vale.rocks/posts/css-reset)  
> 作者：Vale  
> 日期：2026年1月22日  
> 翻译：田八  
> 
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

随着时间推移，各大浏览器的 `User-Agent（UA）`默认样式，已经和很多开发者使用 `Web` 平台的方式越来越不一致。我也不例外，经常发现自己的需求和主流浏览器预置的 UA 样式表相冲突：

- Chromium：<https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/html/resources/html.css>
- Firefox：<https://searchfox.org/firefox-main/source/layout/style/res/html.css>
- WebKit：<https://github.com/WebKit/WebKit/blob/main/Source/WebCore/css/html.css>

因此，我和许多人一样[^1]，会在很多项目里应用一套 `CSS reset`，用来让开发更顺手。

`“Reset” `这个词也许并不完全准确，因为这套东西里有不少都是主观偏好，并不只是把一切“重置为白纸”。我们早就过了 IE 这种“野路子”浏览器横行的时代，而且浏览器之间的样式已经**基本**[^2]趋于一致。

尽管`“reset”` 不算最准确的名字，但更精确的标题——“首选 CSS 默认值与 UA 覆盖规则”——听起来就没那么带劲了。

下面是我完整、未删节的 `reset`：

```css
@layer {
	*,
	*::before,
	*::after {
		box-sizing: border-box;
		background-repeat: no-repeat;
	}

	* {
		padding: 0;
		margin: 0;
	}

	html {
		-webkit-text-size-adjust: none;
		text-size-adjust: none;
		line-height: 1.5;
		-webkit-font-smoothing: antialiased;
        block-size: 100%;
	}

	body {
		min-block-size: 100%;
	}

	img,
	iframe,
	audio,
	video,
	canvas {
		display: block;
		max-inline-size: 100%;
		block-size: auto;
	}

	svg {
		max-inline-size: 100%;
	}

	svg:not([fill]) {
		fill: currentColor;
	}

	input,
	button,
	textarea,
	select {
		font: inherit;
	}

	textarea {
		resize: vertical;
	}

	fieldset,
	iframe {
		border: none;
	}

	p,
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		overflow-wrap: break-word;
	}

	p {
		text-wrap: pretty;
		font-variant-numeric: proportional-nums;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		font-variant-numeric: lining-nums;
	}

	p,
    blockquote,
    q,
    figcaption,
    li {
        hanging-punctuation: first allow-end last;
    }

	input,
	label,
	button,
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
        line-height: 1.1;
    }

	math,
	time,
	table {
		font-variant-numeric: tabular-nums lining-nums slashed-zero;
	}

	code {
		font-variant-numeric: slashed-zero;
	}

	table {
		border-collapse: collapse;
	}

	abbr {
		font-variant-caps: all-small-caps;
		text-decoration: none;

		&[title] {
			cursor: help;
			text-decoration: underline dotted;
		}
	}

	sup,
	sub {
		line-height: 0;
	}

	:disabled {
		opacity: 0.8;
		cursor: not-allowed;
	}

	:focus-visible {
		outline-offset: 0.2rem;
	}
}
```

## 拆解（Breakdown）

你可能会注意到，这份 `reset` 的第一点特征是：它完全包在一个匿名 `layer` 里。通过 `@layer` 规则把 `reset` 放进匿名级联层，能够让每一条声明都拥有较低的特异性（`specificity`）[^3]。

```css
*,
*::before,
*::after {
	box-sizing: border-box;
	background-repeat: no-repeat;
}
```

我觉得 `content-box` 不直观、也容易让人困惑。我更喜欢把 `border-box` 作为默认值——它会把 `padding` 和 `border` 也算进元素的宽高里。

背景图默认会重复，在我看来一直是个不太合理的默认行为，因为它通常都会被覆盖掉。所以我直接禁用了它。

```css
* {
	padding: 0;
	margin: 0;
}
```

当我在写自定义 `CSS` 时，浏览器默认的 `margin` 和 `padding` 对我来说更多是阻碍而不是帮助。它们在处理“未样式化”的文档时确实提供了一个还算合理的默认值[^4]，但在我自己写样式时，更多时候只会碍事。

```css
html {
	-webkit-text-size-adjust: none;
	text-size-adjust: none;
	line-height: 1.5;
	-webkit-font-smoothing: antialiased;
	block-size: 100%;
}
```

`text-size-adjust` 会阻止移动端浏览器“自作主张”调整文字大小；当你本来就按移动端来设计时，这种行为弊大于利。`Kilian Valkhof` 在`《Your CSS reset needs text-size-adjust (probably)》`里解释得很清楚：

- <https://kilianvalkhof.com/2022/css-html/your-css-reset-needs-text-size-adjust-probably/>

`UA` 默认的 `line-height` 太小了，会让文字看起来很挤、也更难读。

`-webkit-font-smoothing` 是一个用来修复 `macOS` 字体渲染方式的**非常特定**的补丁。加上它可以避免字体在 `macOS` 上看起来比实际更粗：

- <https://dbushell.com/2024/11/05/webkit-font-smoothing/>

`block-size` 的设置是为了配合 `body` 上的 `min-block-size`：

```css
body {
	min-block-size: 100%;
}
```

它能避免 `body` 折叠（`collapse`）。当页面内容高度不足以填满视口时，这会很有用。

```css
img,
iframe,
audio,
video,
canvas {
	display: block;
	max-inline-size: 100%;
	block-size: auto;
}

svg {
	max-inline-size: 100%;
}
```

绝大多数时候我使用媒体内容，并不是想让它以内联（`inline`）的形式展示（`SVG` 是个例外）。我也很少希望内容比容器更大，所以 `max-inline-size` 是处理内联方向溢出的合理方式。把 `block-size` 设为 `auto` 可以避免宽高比被改变。

```css
svg:not([fill]) {
	fill: currentColor;
}
```

如果 `SVG` 没有明确设置 `fill`，让它默认继承当前文字颜色（`current color`），而不是默认黑色，是合理的。

```css
input,
button,
textarea,
select {
	font: inherit;
}
```

表单输入元素默认不该使用不同的字体样式；否则它们会立刻显得“格格不入”。

```css
textarea {
	resize: vertical;
}
```

`textarea` 通常只需要允许纵向缩放，不太需要横向缩放。

```css
fieldset,
iframe {
	border: none;
}
```

`fieldset` 很适合做分组，但它的边框很丑。我个人总会用其它视觉聚合方式，所以默认就把边框去掉了。我以前会在个别地方手动去掉，但后来意识到：我保留边框的情况反而是少数。

`iframe` 通常是为了把内容“嵌进页面里”，而不是让它突出显示。所以我认为无边框是更合理的默认值。

```css
p,
h1,
h2,
h3,
h4,
h5,
h6 {
	overflow-wrap: break-word;
}
```

这是导致横向溢出的常见原因之一——尤其是在“大字号”如今颇受追捧的情况下——合理的做法就是让它们可以换行断开。

```css
p {
	text-wrap: pretty;
	font-variant-numeric: proportional-nums;
}
```

这个特性支持度不算好，但我是个排版控，能改善一点是一点。

`proportional-nums` 会启用“比例数字”，也就是每个数字会有自然不同的宽度，而不是所有数字都占用同样的固定宽度。

```css
h1,
h2,
h3,
h4,
h5,
h6 {
	font-variant-numeric: lining-nums;
}
```

我喜欢确保标题里不会出现 `oldstyle-nums`（旧式数字），它们在标题里总显得不太对劲。顺带一提，我真的很期待 `:heading`。

我不会对标题再设置更多规则，因为我习惯按项目来配置。`text-wrap: balance;` 是个常见的补充项。

```css
p,
blockquote,
q,
figcaption,
li {
	hanging-punctuation: first allow-end last;
}
```

`hanging-punctuation` 看起来就是更好。写这篇文章时，浏览器支持还很有限，但总有一天大家都会支持的，而我已经准备好了。

```css
input,
label,
button,
h1,
h2,
h3,
h4,
h5,
h6 {
    line-height: 1.1;
}
```

标题和输入元素应该有更小的行高：标题这样看起来不会像被拆开；输入框则是因为文字太少，太大的行高会影响可读性。虽然这算是个合理的默认值，但如果标题字体的上伸部/下伸部（`ascenders/descenders`）很长，就可能需要重新评估。

```css
math,
time,
table {
	font-variant-numeric: tabular-nums lining-nums slashed-zero;
}

code {
	font-variant-numeric: slashed-zero;
}
```

当内容需要更清晰易读时（比如时间、数学、或代码），往往都需要做一些排版上的调整。

`tabular-nums` 和 `lining-nums` 能让数字对齐且一致，从而让数据更容易阅读。

带斜杠的 0（`0`）可以减少视觉歧义。

```css
table {
	border-collapse: collapse;
}
```

非折叠边框看起来非常“90 年代”，视觉上也更压迫。

```css
abbr {
	font-variant-caps: all-small-caps;
	text-decoration: none;

	&[title] {
		cursor: help;
		text-decoration: underline dotted;
	}
}
```

`<abbr>` 是个挺奇怪的元素。它依赖 `title` 属性的那部分并不太“可见”，而且基本上只有在使用指针设备时才真的好用：

- <https://adrianroselli.com/2024/01/using-abbr-element-with-title-attribute.html>

我仍然喜欢照顾到它，但也需要把这一点记在心里。

```css
sup,
sub {
	line-height: 0;
}
```

上标和下标会很烦人地影响行高，而我不喜欢这样。这条规则会覆盖掉这种行为。

```css
:disabled {
	opacity: 0.8;
	cursor: not-allowed;
}
```

`Firefox` 是唯一一个不会降低禁用元素透明度的主流浏览器，所以我降低一下以保持一致。我还加了 `not-allowed` 光标来增强可理解性。

需要注意的是：这样可能会导致文字对比度不足。

```css
:focus-visible {
	outline-offset: 0.2rem;
}
```

`outline-offset` 是好东西，但当它离目标太近时常常很难看清。略微加一点偏移有助于改善可见性。

- [^1] : 具体点名几个：`Andy Bell` 的`《A (more) Modern CSS Reset》`、`Eric Meyer` 的`《Reset CSS》`、`Josh W Comeau` 的`《A Modern CSS Reset》`，以及 `Manuel Matuzović` 的 `uaplus.css`。
    - <https://piccalil.li/blog/a-more-modern-css-reset/>
    - <https://meyerweb.com/eric/tools/css/reset/>
    - <https://www.joshwcomeau.com/css/custom-css-reset/>
    - <https://fokus.dev/tools/uaplus/>
- [^2] : *咳咳。* Safari。
- [^3] : 参考：<https://www.matuzo.at/blog/2026/lowering-specificity-of-multiple-rules>
- [^4] : 这并不是说我认同默认样式；相反，我对它的排版选择有强烈异议。标题的上下外边距（block margin）居然相等，这在排版上简直是“罪过”，会把标题放进无人区：它和上一段内容距离不够远，但又和它后面的内容关联得不够紧密。
