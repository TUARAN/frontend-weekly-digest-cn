> 原文：[Interop 2026: Continuing to improve the web for developers](https://web.dev/blog/interop-2026)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Interop 2026：继续为开发者改进 Web

web.dev 宣布 Interop 2026 正式启动。该计划由 Apple、Google、Igalia、Microsoft、Mozilla 等共同参与，持续目标是提升关键 Web 特性在浏览器之间的一致性。

所选测试会在自动化基础设施中持续运行，进展可在 Interop 2026 看板查看：

- https://wpt.fyi/interop-2026

## 重点领域（Focus Areas）

web.dev 文章将 2026 重点领域逐项列出，包含：

- 锚点定位（Anchor positioning）
- 容器样式查询（Container style queries）
- 对话框与弹出层增强（Dialog and popover additions）
- 滚动驱动动画（Scroll-driven animations）
- 视图过渡（View transitions）
- `attr()` CSS 函数
- `contrast-color()` CSS 函数
- 自定义高亮（Custom highlights）
- Fetch 上传与 Range
- IndexedDB（`getAllRecords()`）
- Wasm 的 JSPI
- 媒体伪类（Media pseudo-classes）
- Navigation API
- Scoped custom element registries
- Scroll Snap
- `shape()` CSS 函数
- Web Compat
- WebRTC
- WebTransport
- CSS `zoom`

文章还说明，这些条目来自 HTML/CSS 状态调查、开发者信号仓库与互操作性热点问题。

## 部分条目说明（按原文节选）

### 锚点定位

从 2025 延续。用于按另一个元素的位置放置元素（如提示层锚定目标）。2026 继续推进相关测试。

### 容器样式查询

使用 `@container` + `style()` 按容器自定义属性值应用样式。

### 对话框与弹出层

本轮聚焦：

- `<dialog closedby>`
- `:open` 伪类
- `popover="hint"`

### 滚动驱动动画

覆盖 `animation-timeline`、`scroll-timeline`、`view-timeline` 等。

### 视图过渡

在同文档视图过渡基础上，继续推进跨文档视图过渡及相关配套能力互操作。

### `attr()` 与 `contrast-color()`

`attr()` 关注类型化取值能力；`contrast-color()` 关注自动对比色选择的一致性。

### Fetch 上传与范围 / IndexedDB / JSPI

- Fetch：流式请求体、FormData/媒体类型支持、Range 头
- IndexedDB：`getAllRecords()`
- JSPI：桥接 Wasm 同步调用习惯与 JS Promise 异步模型

### Navigation API

继续推进 API 一致性，并包含 `navigateEvent.intercept()` 的 `precommitHandler` 相关工作。

### Web Compat

今年聚焦真实兼容问题：

- ESM 模块加载
- 滚动事件与动画事件时序
- `-webkit-user-select` 去前缀

## 调查工作（Investigation Efforts）

Interop 2026 还包含 4 项调查方向，为未来功能测试与互操作工作打基础：

- Accessibility testing
- JPEG XL
- Mobile testing
- WebVTT

## 跟踪进度与相关阅读

- 进度看板：https://wpt.fyi/interop-2026
- 其他公告：
  - Apple：https://webkit.org/blog/17818/announcing-interop-2026/
  - Igalia：https://igalia.com/news/interop-2026.html
  - Microsoft：https://blogs.windows.com/msedgedev/2026/02/12/microsoft-edge-and-interop-2026/
  - Mozilla：https://hacks.mozilla.org/2026/02/launching-interop-2026/

