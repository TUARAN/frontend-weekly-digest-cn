> 原文：[Interop 2026 Focus Areas Announced](https://www.igalia.com/news/interop-2026.html)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Interop 2026 Focus Areas：Igalia 公告整理

Igalia 宣布 Interop 2026 最终选择结果：

- 19 个 focus areas
- 3 个 cleanup areas
- 4 个 investigation areas

文章提到，Interop 2025 成绩非常高：年度内总体互操作分数从 28 提升到 95，并在 2025 结束后一个月进一步到 97。2026 目标是延续这类改进幅度。

## HTML

在标记层，Interop 2026 没有只选一个单点提案，而是把一组与 dialog/popover 相关提案并为一个 HTML 重点方向，覆盖：

- `<dialog>`
- `popover`
- `:open` 伪类

原因是这些能力在实现完整性和一致性上仍有缺口。

## CSS

展示层提案最多，最终有 11 个与 CSS 相关的重点方向：

- Advanced `attr()`
- Container style queries
- `contrast-color()`
- Custom highlights
- Media pseudo-classes
- Scroll-driven animations
- Scroll snap
- `shape()` basic shape function
- Anchor positioning（从 2025 延续）
- View transitions（从 2025 延续）
- CSS zoom（从 2025 延续）

## JavaScript

脚本层共 7 个重点方向：

- Fetch uploads and ranges（由 3 个提案合并）
- IndexedDB
- JSPI for Wasm
- Navigation API
- Scoped custom element registries
- WebRTC
- WebTransport

## Web compat(ibility)

这部分是“投入不大但收益明显”的兼容性问题，2026 聚焦：

- ESM module loading
- 滚动事件相对于动画事件的触发时序
- 去前缀 `-webkit-user-select`

文章指出，这类工作有时需要与 W3C 工作组确认规范细节，或通过 origin trial 验证变更影响。

## Investigation areas

今年的 4 个调查方向是：

- Accessibility testing
- JPEG XL tests
- Mobile testing
- WebVTT

这类方向通常是因为“测试用例不足”或“测试基础设施不足”，尚不适合直接纳入正式打分，但需要先做铺垫。

## 结语

Igalia 在文末表示，将继续参与 Interop 过程，并持续推动与自身关注方向相关的提案落地。

如需查看更多 Interop 2026 公告，可对照：

- Apple
- Google
- Microsoft
- Mozilla

