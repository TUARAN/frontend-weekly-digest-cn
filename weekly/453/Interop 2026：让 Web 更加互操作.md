> 原文：[Announcing Interop 2026](https://webkit.org/blog/17818/announcing-interop-2026/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Interop 2026：WebKit 宣布内容（逐段整理）

Interop 2026 已启动。WebKit 表示今年仍与 Google、Igalia、Microsoft、Mozilla 协作，目标是持续提升跨浏览器互操作性。

文章提到，Safari 已经率先实现了本轮部分能力（如 `contrast-color()`、媒体伪类、`shape()`、Scoped Custom Element Registries），并且已支持 Anchor Positioning、Style Queries、Custom Highlights、Scroll Snap、View Transitions 等。2026 年将继续推动这些能力在其它浏览器中的一致落地。

## 2026 Focus Areas（20 项）

原文列出了 20 个重点方向：

- Anchor positioning
- Advanced `attr()`
- Container style queries
- `contrast-color()`
- Custom Highlights
- Dialog and popover additions
- Fetch uploads and ranges
- `getAllRecords()` for IndexedDB
- JSPI for Wasm
- Media pseudo-classes
- Navigation API
- Scoped custom element registries
- Scroll-driven Animations
- Scroll Snap
- `shape()`
- View transitions
- Web Compat
- WebRTC
- WebTransport
- CSS Zoom

其中 15 项是新增，5 项来自 2025 延续。

## 关键能力（原文示例节选）

### Advanced `attr()`

`attr()` 过去主要用于 `content`。Interop 2026 推进的是“高级 `attr()`”：可用于更多 CSS 属性并支持类型转换（颜色、长度、角度等），减少依赖 JavaScript 做属性到样式的中转。

### Container style queries

通过 `@container style()` 根据容器中的自定义属性值切换样式：

```css
@container style(--theme: dark) {
  .card {
    background: #1a1a1a;
    color: #ffffff;
  }
}
```

### `contrast-color()`

浏览器在黑/白中自动选择与给定颜色对比更高的一项：

```css
.button {
  background: var(--brand-color);
  color: contrast-color(var(--brand-color));
}
```

原文也强调：它并不“自动解决全部无障碍问题”，只是其中一块能力。

### Dialog / Popover 增强

本轮关注 `closedby`、`popover="hint"` 以及 `:open` 伪类等增强，目标是让覆盖层 UI 更易构建且行为更一致。

### Fetch uploads and ranges

围绕 `fetch()` 的上传与部分内容读取能力推进互操作，包括：

- `ReadableStream` 作为请求体（流式上传）
- 增强 `FormData`
- `Range` 头支持（如视频分片、断点续传）

### `getAllRecords()` for IndexedDB

聚焦 `IDBObjectStore` / `IDBIndex` 的新方法 `getAllRecords()`，支持批量与逆序读取。Interop 分数针对该方法对应测试，而非整个 IndexedDB。

### JSPI for Wasm

JSPI 用于桥接“Wasm 中常见同步调用习惯”与“Web 上异步 Promise API”之间的差异，降低 C/C++/Rust 应用迁移到 Web 的改造成本。

### Media pseudo-classes

本轮包含 `:playing`、`:paused`、`:seeking`、`:buffering`、`:stalled`、`:muted`、`:volume-locked` 等媒体状态伪类，减少 UI 状态同步对 JS 的依赖。

### Navigation API

继续 2025 的推进，并新增 `precommitHandler` 相关测试，支持在提交导航前等待关键资源，减轻“半成品闪烁”体验。

```js
navigation.addEventListener('navigate', (e) => {
  e.intercept({
    async precommitHandler() {
      await loadCriticalData();
    },
    async handler() {
      renderPage();
    }
  });
});
```

### Scoped custom element registries

允许创建作用域化注册表，避免全局 `customElements` 在微前端/多组件库场景下的标签名冲突：

```js
const registry = new CustomElementRegistry();
registry.define('my-button', MyButtonV2);
shadowRoot.registry = registry;
```

### Scroll-driven Animations / Scroll Snap / `shape()` / View transitions

这些能力在实际开发中已较常见，Interop 2026 的重点是继续补齐长尾差异，使行为更可预测、可跨浏览器复用。

### Web Compat

今年聚焦三类真实兼容问题：

- ESM module loading（含循环模块记录、多 top-level await 等）
- 滚动事件与动画事件的触发时序
- `-webkit-user-select` 的去前缀推进（转向 `user-select`）

### WebRTC / WebTransport / CSS Zoom

- WebRTC：延续 2025，继续清理主规范剩余长尾差异
- WebTransport：推动 HTTP/3 实时传输能力跨浏览器一致
- CSS Zoom：继续从 2025 延续，修复历史边界不一致

## Investigation Efforts（前瞻）

Interop 2026 同时包含 4 个调查方向：

- Accessibility testing
- JPEG XL
- Mobile testing
- WebVTT

它们的目标是补齐测试与基础设施，作为后续正式 Focus Areas 的铺垫。

## 结语

WebKit 将 2026 这轮工作概括为：在开发者真正关心的能力上继续缩小浏览器差异，提供更可靠的 Web 平台基础。

