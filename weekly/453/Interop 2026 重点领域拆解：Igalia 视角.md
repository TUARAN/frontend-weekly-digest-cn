原文：[Interop 2026 Focus Areas Announced](https://www.igalia.com/news/interop-2026.html)
翻译：TUARAN
欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Interop 2026 重点领域拆解：Igalia 视角

相比官方公告与厂商博客，Igalia 这篇文章更像是一次「幕后视角」：  
作为长期参与 Web 标准和浏览器实现的独立公司，他们详细解释了 **Interop 2026 选定哪些 Focus Areas、这些领域背后的技术考量，以及 Igalia 在其中扮演的角色**。

---

## Interop 2026：延续而又扩展的路线

文章首先回顾了 Interop 的基本目标：  
通过一套约定好的测试与评分机制，推动浏览器厂商围绕同一批 Web 特性协同发力，减少「在 A 浏览器正常，在 B 浏览器诡异」的情况。

在 2026 年，Interop 继续沿用「Focus Areas + Investigation Areas」的结构：

- **Focus Areas**：有明确测试集与量化评分的特性集合；  
- **Investigation Areas**：当前还不适合打分，但需要投入精力完善测试基础设施与规范细节的方向。

Igalia 指出，2026 年的选题既延续了 2024/2025 中部分长期工程（比如 Scroll Snap、WebRTC、Navigation API 等），也加入了不少「近两年刚成气候」的新能力（例如 `anchor-positioning`、`advanced attr()`、JSPI for Wasm 等）。

---

## CSS 相关 Focus Areas：从布局到可访问性

Igalia 长期深耕 CSS 布局、排版与可视化，这次在 CSS 相关的多个 Focus Areas 上投入了大量精力：

- **Anchor Positioning 与容器查询**  
  这两者是现代组件化布局的关键 —— 前者解决「元素间对齐」、后者解决「组件响应容器环境」问题。  
  Igalia 参与了规范讨论和多家实现，Interop 2026 会进一步用测试推动边界行为收敛。

- **`contrast-color()` 与自定义高亮**  
  它们直接影响设计系统与可访问性实现：  
  - `contrast-color()` 让前景色选择可以由浏览器自动基于对比度决策；  
  - Custom Highlight API 则把「高亮任意文本区间」变成一等公民，而不需要在 DOM 里插入大量标签。

- **Scroll Snap 与 Scroll-driven Animations**  
  这两者在实际产品中已经广泛使用，但过去规范演化较多、实现历史久远，存在不少长尾 bug。  
  2026 年 Igalia 会继续用 Web Platform Tests 帮助发现与修复这些差异。

---

## JS 与平台能力：JSPI、WebTransport、Navigation API 等

文章也特别提到了几项和 JavaScript 与平台能力相关的重点：

- **JSPI for Wasm**：解决「原本依赖同步 IO 的本地应用」在异步 Web 平台上的迁移难题，使更多 C/C++/Rust 应用更容易搬到浏览器；  
- **WebTransport 与 WebRTC**：为实时通信与低延迟数据流提供更现代的传输层选择；  
- **Navigation API**：在 SPA 场景下替代手动 `history.pushState`/`popstate` 管理，提供更可控的导航生命周期。

Igalia 既参与了这些规范的推进，也在多个浏览器引擎里承担具体实现工作，因此在 Interop 测试用例设计和问题排查中扮演了重要角色。

---

## Investigation Areas：为未来几年铺路

Igalia 认为，对开发者影响最大的并不只有已经打分的 Focus Areas，**Investigation Areas 同样值得关注**，因为它们会决定未来几年哪些能力会成为新的 Focus Areas：

- **Accessibility Testing**：统一各家浏览器的可访问性树与测试工具链，为自动化 a11y 检测打基础；  
- **JPEG XL 与 WebVTT**：分别针对下一代图片格式与字幕格式的测试完善，解决现有实现中的不一致问题；  
- **移动端测试基础设施**：让和虚拟键盘、动态视口高度等移动端特性相关的行为更容易被系统性验证。

这些工作短期内可能不会直接反馈到「某个 CSS 属性能不能用」上，但从长期看，会极大改善 Web 平台整体的可预测性。

---

## 为什么这些细节值得你关心？

从 Igalia 的视角看，Interop 的真正价值在于：

- **让规范不再停留在纸面，而是通过测试与实现不断校验与修正**；  
- **让浏览器之间的差异变得「可见且可量化」**，从而推动资源投入；  
- **让开发者可以把精力更多投入在产品和体验本身，而不是兼容性细节。**

如果你是前端或 Web 平台相关工程师，可以把 Interop 2026 这份 Focus Areas 列表当作一份「未来一两年可以积极拥抱的新能力路线图」，  
而 Igalia 这样的参与者，则在背后帮你处理掉了大量看不见的实现细节与协作成本。

