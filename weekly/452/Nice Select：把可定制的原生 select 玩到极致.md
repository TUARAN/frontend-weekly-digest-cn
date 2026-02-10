原文：[Nice Select](https://nerdy.dev/nice-select)
翻译：TUARAN
欢迎关注 [{{前端周刊}}](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Nice Select：把可定制的原生 `<select>` 玩到极致



发布时间：2026-02-03

这篇文章把 Chrome 新增的“可定制原生 `<select>`”（`appearance: base-select`）玩到一个非常夸张、但也很启发人的程度：

- 绝大多数效果靠 CSS 完成；
- 少量 JS 只用于把 `::picker()` 下拉层与当前选中项对齐（写入一个 CSS 变量）；
- 通过渐进增强，让不支持的新特性（Firefox/Safari、以及移动端）回退为原生 select 体验。

提示：目前这些能力主要是 Chrome 生态优先支持；作者也明确移动端仍保留原生 select。

在线 Demo（CodePen）：https://codepen.io/editor/argyleink/pen/019c1f28-bbc2-7bac-ad4a-a7e41d3730f1

## 核心架构（Core Architecture）

这个组件建立在 `appearance: base-select` 之上：既保留了浏览器原生的可访问性与键盘交互，又获得了更强的视觉可控性。

- `appearance: base-select`：在保留浏览器控制的可访问性/键盘导航前提下，解锁原生 `<select>` 的深度定制
  - MDN：https://developer.mozilla.org/docs/Web/CSS/appearance#base-select
  - Chrome 介绍：https://developer.chrome.com/blog/a-customizable-select
- 条件式渐进增强：只在“可 hover + 精细指针”的设备上启用自定义（例如 `@media (hover)` + `(pointer: fine)`）
  - https://developer.mozilla.org/docs/Web/CSS/@media/hover
  - https://developer.mozilla.org/docs/Web/CSS/@media/pointer
- JS + CSS 混合：JS 只负责算对齐偏移（anchor offset），CSS 负责全部视觉表现与动画

## 对齐与定位（Alignment & Positioning）

文章用 CSS Anchor Positioning，把下拉 `::picker()` 定位到触发按钮附近；然后用一点 JS 把“下拉列表里的当前选中项”与按钮文本对齐，从而产生一种“形变连接感”。

- CSS Anchor Positioning：https://developer.mozilla.org/docs/Web/CSS/CSS_anchor_positioning
- 下拉层相对触发器定位：使用 `anchor(start)`
  - https://developer.mozilla.org/docs/Web/CSS/Reference/Values/anchor
- 选中项对齐：通过自定义属性 `--_select-anchor-offset` 控制垂直对齐
  - 自定义属性：https://developer.mozilla.org/docs/Web/CSS/--*
- 同步 `transform-origin`：用 `50% var(--_select-anchor-offset)` 让 scale 动画更贴合选中项位置
- 边缘回退：使用 `position-try` 做 `flip-block / flip-inline` 等回退，避免 picker 溢出视口
  - https://developer.mozilla.org/docs/Web/CSS/position-try-fallbacks

## 动画与过渡（Animation & Transitions）

从弹簧缩放，到滚动驱动的选项逐个出现，整体还尊重用户的“减少动态效果”偏好。

- `@starting-style`：定义 popover 进入动画的初始状态
  - https://developer.mozilla.org/docs/Web/CSS/Reference/At-rules/@starting-style
- 弹簧 easing：使用 Open Props 的 `--ease-spring-3`（scale/旋转等）
  - https://open-props.style/#easing
- 离散属性过渡：`display`、`overlay` 配合 `allow-discrete`，支持 `::picker()` 的 popover 动画
  - https://developer.mozilla.org/docs/Web/CSS/transition-behavior
- `::picker-icon`：下拉箭头在展开时旋转 180°
  - https://developer.mozilla.org/docs/Web/CSS/::picker-icon
- 滚动驱动的 option reveal：用 `animation-timeline: view()` 实现从底部淡入
  - https://developer.mozilla.org/docs/Web/CSS/animation-timeline
- 降低动态：所有动画都包在 `@media (prefers-reduced-motion: no-preference)` 内
  - https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion
- 交互反馈：`:active` 缩放到 `0.98`；`:open` 时整体放大到 `1.04`
  - `:open`：https://developer.mozilla.org/docs/Web/CSS/:open

## 主题与配色（Theming & Color Handling）

通过系统色 + 现代颜色函数，实现明暗自适应与强制高对比模式的适配，甚至把 forced colors 当作“骨架/间距调试工具”。

- `color-scheme: light dark`：允许浏览器根据系统主题适配
  - https://developer.mozilla.org/docs/Web/CSS/color-scheme
- `light-dark()`：针对需要不同明暗值的背景
  - https://developer.mozilla.org/docs/Web/CSS/color_value/light-dark
- 系统色：`Canvas`、`CanvasText`、`Highlight`、`HighlightText`
  - https://developer.mozilla.org/docs/Web/CSS/system-color
- `color-mix()`：做半透明覆盖层与边框
  - https://developer.mozilla.org/docs/Web/CSS/color_value/color-mix
- Data URI 图标：把 chevron/checkmark 作为 SVG data URI 内嵌
  - https://developer.mozilla.org/docs/Web/URI/Schemes/data
- 强制颜色模式：`@media (forced-colors: active)`
  - https://developer.mozilla.org/docs/Web/CSS/@media/forced-colors

## 布局与间距（Layout & Spacing）

作者用逻辑属性实现真正的国际化（自动 RTL），再用 `text-box` 做更精细的垂直对齐，并把间距/尺寸抽成 token。

- 设计 token：所有 spacing/size/timing 定义为 `--_select-*`
- 逻辑属性全覆盖：`inline-size`、`block-size`、`inset-block-start`、`margin-inline`、`padding-block` 等
  - https://developer.mozilla.org/docs/Web/CSS/CSS_logical_properties_and_values
- `text-box: trim-both cap alphabetic`：让文字垂直对齐更“像素级”
  - https://developer.mozilla.org/docs/Web/CSS/text-box
- option 内容布局：flex + gap（图标 + 文案）
- checkmark 位置：`order: 2` + `margin-inline-start: auto` 推到末尾

## 滚动与溢出（Scrolling & Overflow）

用 scroll-state queries 判断列表是否可滚动、sticky header 是否“粘住”，并配合滚动条样式、overscroll 行为做体验打磨。

- 容器 scroll-state queries：`container-type: scroll-state` + `@container scroll-state(stuck)`
  - https://developer.mozilla.org/docs/Web/CSS/Guides/Conditional_rules/Container_scroll-state_queries
- Sticky legends：分组标题滚动时吸顶，并在 stuck 状态变色
- 自定义 scrollbar：`scrollbar-width: thin`、`scrollbar-color`，并做 hover 渐隐
  - https://developer.mozilla.org/docs/Web/CSS/scrollbar-width
  - https://developer.mozilla.org/docs/Web/CSS/scrollbar-color
- 防滚动链：`overscroll-behavior-block: contain`
  - https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-block
- 平滑滚动：`scroll-behavior: smooth`（在 motion-safe 前提下）
  - https://developer.mozilla.org/docs/Web/CSS/scroll-behavior
- 动态检测：JS 在内容超过 max-height 时加 `.scrollable`，CSS 再按这个状态调整 padding

## 可定制特性（Customizable Select Features）

新伪元素让你能“外科手术式”地控制 select 的细节，同时用 superellipse 做出偏 iOS 风格的圆角矩形。

- `::picker(select)`：样式化下拉容器
  - https://developer.mozilla.org/docs/Web/CSS/::picker
- `::picker-icon`：样式化下拉 chevron
  - https://developer.mozilla.org/docs/Web/CSS/::picker-icon
- `::checkmark`：样式化选中项标记
  - https://developer.mozilla.org/docs/Web/CSS/::checkmark
- `<selectedcontent>`：原生元素，映射当前选中项内容到按钮
  - https://developer.chrome.com/blog/customize-select#selectedcontent
- `corner-shape: superellipse(1.25)`：squircle 圆角（含回退）
  - https://developer.mozilla.org/docs/Web/CSS/corner-shape
- 状态选择器：`:open`、以及 option 的 `:checked`
  - https://developer.mozilla.org/docs/Web/CSS/:open
  - https://developer.mozilla.org/docs/Web/CSS/:checked

## 可访问性与体验（Accessibility & UX）

整体可访问性很大程度“继承自平台”：语义正确、键盘导航与焦点管理都更靠谱。

- 焦点样式：区分 `:focus`（轻）与 `:focus-visible`（重）
  - https://developer.mozilla.org/docs/Web/CSS/:focus
  - https://developer.mozilla.org/docs/Web/CSS/:focus-visible
- 禁用选项：`option[disabled]` 样式化并阻止 hover
  - https://developer.mozilla.org/docs/Web/HTML/Element/option#disabled
- 文本溢出：按钮文本用 `text-overflow: ellipsis`
  - https://developer.mozilla.org/docs/Web/CSS/text-overflow
- 触控目标：最小高度 36px
- hidden 选项：JS 在 offset 计算中跳过 `[hidden]`
  - https://developer.mozilla.org/docs/Web/HTML/Global_attributes/hidden
- RTL 示例：用阿拉伯语 demo 验证双向布局
  - https://developer.mozilla.org/docs/Web/CSS/CSS_writing_modes

## 性能优化（Performance Optimizations）

为了避免动画卡顿与布局抖动，作者做了不少偏“工程化”的优化：

- `will-change: scale`：提示合成器优化，并修复一个文本位移 bug
  - https://developer.mozilla.org/docs/Web/CSS/will-change
- WeakMap 缓存 offset：避免每次交互都做昂贵的测量，且可自动 GC
  - https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
- 一些布局常量选择提前硬编码，避免初始化时 `getComputedStyle()` 触发强制回流
  - https://developer.mozilla.org/docs/Web/API/Window/getComputedStyle
- `background-clip: padding-box`：避免背景在边框下“渗色”
  - https://developer.mozilla.org/docs/Web/CSS/background-clip
- 并行图标变体：提前准备黑/白两套 SVG，避免运行时做颜色处理

## 示例变体（Example Variations）

同一套架构可做出很多变体：

- 带状态指示点的 toggle（绿/红/灰）
- 头像选择（圆形头像 + 名字）
- 多行 option（标题 + 描述）
- 分组选项（fieldset + sticky legend）
- “标签在上、值在下”的布局
- 国旗 emoji 选择器（按区域分组）

## 试玩与结语

作者鼓励 fork 并反馈：他尝试过很多动画变体，但还没找到一种能在所有变体上都稳定消除定位 shift 的方案。

这篇文章最有价值的点在于：它展示了“现代 CSS + 渐进增强”如何在不牺牲原生可访问性（键盘/焦点/读屏）的前提下，做出非常精致的自定义交互组件。

更多类似作品：https://nerdy.dev/nice-details
