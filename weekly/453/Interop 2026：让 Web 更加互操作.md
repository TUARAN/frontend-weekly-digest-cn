原文：[Announcing Interop 2026](https://webkit.org/blog/17818/announcing-interop-2026/)
翻译：TUARAN
欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Interop 2026：让 Web 更加互操作

每年一度的 Interop 计划，核心目标都是一件事：**让同一套 Web 技术在不同浏览器中表现更一致**。  
2026 年已经是 Interop 项目的第 5 个年头，这次 WebKit 团队联合 Chrome、Firefox、Edge、Igalia 等，再次挑选出一批和开发者体验高度相关的特性，集中火力补齐兼容性与实现差异。

本文可以理解为一份「Safari 视角的 Interop 2026 解读」：一方面回顾 Safari 已经率先落地的能力，另一方面说明今年会在哪些特性上投入更多精力。

---

## 什么是 Interop 项目？

如果你在实际项目中做过跨浏览器适配，大概率踩过这些坑：

- 某个 CSS 特性在一个浏览器里表现正常，在另一个浏览器却有细微差别；
- 某些新 API 在不同引擎中的行为边界不一致，只能依赖大量测试或手动兜底；
- 旧规范在实现多年后又经历了多轮修订，早期实现和规范最新版本之间存在「历史债」。

**Interop 项目**就是浏览器厂商之间的一项协作机制：

- 每年挑出一批「重点特性」作为 **Focus Areas**；
- 围绕这些特性，在 Web Platform Tests（WPT）里补齐、完善测试用例；
- 各大浏览器团队在同一时期集中修 bug、对齐实现、推进规范落地；
- 最终用一套统一评分来衡量各家在这些特性上的互操作性。

对开发者而言，Interop 的意义是：**当一个特性被列入当年的 Focus Areas，意味着未来一两年内它会变得“更好用也更敢用”**。

---

## 2026 年的重点方向总览

Interop 2026 一共覆盖了 **20 个 Focus Areas**，其中：

- 15 个是全新加入；
- 5 个是从 Interop 2025 延续而来。

这些能力大致可以分成几类：

- **CSS 与布局**：如 `anchor-positioning`、`advanced attr()`、容器样式查询、`contrast-color()`、自定义高亮、`shape()`、Scroll Snap、Scroll-driven Animations、CSS Zoom 等；
- **Web API 与平台能力**：如 Navigation API、JSPI for Wasm、Fetch uploads & ranges、`getAllRecords()` for IndexedDB、WebTransport、WebRTC；
- **组件与架构能力**：如 Scoped Custom Element Registries；
- **真实世界兼容性问题（Web Compat）**：围绕用户实际遇到的「某站在某浏览器挂掉」类问题进行专项治理；
- **探索性方向（Investigation Efforts）**：例如可访问性测试、JPEG XL、移动端测试以及 WebVTT 字幕等。

下面按「开发者最容易感知」的角度，挑几类重点能力展开说说。

---

## 一批「现代 CSS 能力」的集中提速

### Anchor Positioning：元素之间的相对定位

**Anchor Positioning** 是从 Interop 2025 延续下来的能力。它的诉求很直观：  
让你可以更自然地描述「一个元素相对于另一个元素」的位置，而不是纯粹基于视口/父元素坐标去算。

在实际场景里：

- 下拉菜单跟随按钮；
- Tooltip 精确贴合某个图标；
- 悬浮卡片相对触发源对齐；

这些都属于 anchor 定位可以发力的地方。  
2026 年的工作重点在于：继续磨平各家浏览器在边界行为上的细微差异，并补齐测试用例。

### Advanced `attr()`：让结构数据直接喂给 CSS

传统上，CSS 的 [`attr()`](https://developer.mozilla.org/docs/Web/CSS/attr) 只能在 `content` 属性里使用，更多是用来做小装饰。  
**Advanced `attr()`** 则把它扩展到了所有属性，并且支持类型转换——比如把属性值当作颜色、长度、角度等。

这意味着很多「原本需要 JS 同步属性值到样式」的场景，现在可以直接通过 HTML 属性 + CSS 完成：

```css
button {
  color: attr(data-color color, black);
  padding-inline: attr(data-padding length, 1rem);
}
```

Interop 2026 要做的，是在安全模型已经达成共识的前提下，让各家浏览器在实现与行为上保持高度一致，减少「某个角落 case 只在某浏览器挂掉」的问题。

### Container Style Queries：样式随「容器状态」而变

我们已经熟悉了 **容器尺寸查询**：根据容器宽高而不是视口去响应式布局。  
**容器样式查询** 则进一步允许你根据容器上的自定义变量等「状态」来切换样式。

例如：

```css
@container style(--theme: dark) {
  .card {
    background: #1a1a1a;
    color: #ffffff;
  }
}
```

这给设计系统、主题切换、组件状态驱动等场景带来了更强大的表达力。  
Safari 已经在 18.0 中 shipped 了这一能力，Interop 2026 会推动其它浏览器补齐实现，确保你可以放心在生产中使用。

### `contrast-color()`：浏览器帮你选对比色

[`contrast-color()`](https://developer.mozilla.org/docs/Web/CSS/color_value/contrast-color) 的核心想法是：

> 给我一个背景色，**浏览器自动帮我选一个更有对比度的前景色**（黑或白）。

典型用法：

```css
.button {
  background: var(--brand-color);
  color: contrast-color(var(--brand-color));
}
```

这对设计系统维护非常友好：你不再需要为每一种背景色手写对应文本颜色，而是把决策逻辑交给浏览器。  
Safari 和 Firefox 已在 2025 年率先支持；Interop 2026 会推动所有主流浏览器统一行为。

需要注意的是：**`contrast-color()` 并不能「一次性解决所有无障碍问题」**，它只是解决了「黑/白前景对比度选择」这个子问题，其他对比度、色弱模式等仍需额外考量。

### 自定义高亮（Custom Highlight）

CSS Custom Highlight API 让你可以在 **不改动 DOM 结构** 的前提下，为任意一段文本打高亮。  
典型场景包括：

- 页面内搜索结果高亮；
- 在线代码编辑器的语法高亮；
- 协同编辑中的他人光标、选区标记；
- 基于文本片段的链接（`::target-text`）等。

这些功能在 Safari 中已经存在多年，但由于其他浏览器迟迟未跟进，很多开发者甚至不知道它们的存在。Interop 2026 把这一块拉上桌面，希望通过测试驱动，最终让高亮行为在各家之间真正可预期。

---

## Web 平台能力：从 JSPI 到 Navigation API

除了 CSS，Interop 2026 还挑了几块「基础设施级」的 API：

### JSPI for Wasm：让「同步习惯」的应用跑在异步的 Web 上

很多被移植到 Web 的 C/C++/Rust 应用，原本运行在「可以同步 IO」的环境里，而浏览器世界基本一切都是异步的。  
**JavaScript Promise Integration API（JSPI）** 用来桥接这两者：

- 让 Wasm 代码在不大改架构的前提下，和 JS 的 Promise 异步模型对接；
- 降低大型桌面应用、游戏、专业工具迁移到 Web 的门槛。

Interop 2026 会确保 JSPI 在各家浏览器中行为一致，让 Web 真正成为「复杂应用可行的平台」。

### Navigation API：把单页应用的导航变成一等公民

过去做 SPA，你可能痛恨过 `history.pushState` + `popstate` 这套手写导航管理。  
**Navigation API** 则提供了更现代的接口，让你直接拦截、修改导航行为，并在关键资源准备就绪后再真正「提交导航」：

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

它在 2025 年已经取得了不错的互操作成绩（>90% 测试通过率），2026 年会继续收尾长尾问题，并把新的 `precommitHandler` 能力纳入测试范围。

### WebTransport、WebRTC：实时通信栈的互操作升级

- **WebRTC**：继续补齐核心规范在各家实现中的差异，让视频会议、实时协作等场景更稳定可用；
- **WebTransport**：在 HTTP/3 之上提供低延迟、可多路复用的数据通道，兼顾「类 UDP 的速度」与「类 TCP 的可靠性」，是介于 WebSocket 与 WebRTC 之间的一块拼图。

这些都是「你不一定直接手写，但会通过框架/库间接依赖」的能力，Interop 2026 通过测试把它们拉到同一水位线。

---

## Scoped Custom Element Registries：组件隔离的新基石

使用 Web Components 时，一个经典痛点是：`customElements` 注册表是**全局单例**，同一个 tag name 在全站只能定义一次。

在微前端、第三方组件集成、老项目迁移等场景下，这极易造成冲突：

- A 库和 B 库都定义了 `<my-button>`，谁先注册，谁就「赢」；
- 想要渐进式升级组件实现，往往不得不改 tag 名称，非常割裂。

**Scoped Custom Element Registries** 允许你在不同的 Shadow Root 或子树中使用不同的注册表：

```js
const registry = new CustomElementRegistry();
registry.define('my-button', MyButtonV2);
shadowRoot.registry = registry;
```

Safari 是第一个 ship 这一能力的浏览器，Interop 2026 会推动其它引擎和规范实现对齐，让它真正成为组件隔离、新老版本共存的基础设施。

---

## Investigation Efforts：为未来的 Focus Areas 做铺垫

除了 20 个已经量化评分的 Focus Areas，Interop 2026 还定义了 4 个 **Investigation Efforts**，更像是「前期调研与基础设施建设」：

- **无障碍测试（Accessibility Testing）**：统一各家浏览器生成的可访问性树结构，为未来的自动化 a11y 测试打基础；
- **JPEG XL**：为下一代图片格式补齐测试，方便后续可能升级为正式 Focus Area；
- **移动端测试（Mobile Testing）**：聚焦移动端视口、动态高度变化等在实践中非常棘手的问题；
- **WebVTT**：针对字幕与文字轨道行为不一致的问题做集中排查与修复。

这些方向短期内可能感知不强，但会在未来几年渐渐体现为「某些长期困扰的坑终于不再出现」。

---

## 小结：开发者可以如何利用 Interop 2026？

对一线开发者来说，可以从三个角度理解 Interop 2026 带来的价值：

1. **「可以大胆用」的特性清单**  
   当某个特性被列入 Interop Focus Area，可以认为它在未来一两年内的实现差异会快速收敛 —— 例如 `anchor-positioning`、`contrast-color()`、容器样式查询等。

2. **对现有痛点的「集中还债」**  
   像 Scroll Snap、WebRTC、Web Compat 这样的领域，过去一直存在长尾 bug；Interop 让各家团队在同一时间窗口集中解决这些历史问题。

3. **为下一批能力铺路**  
   Investigation Efforts 所做的很多工作（比如可访问性测试基础设施），会直接决定未来几年我们能否放心在生产中依赖这些能力。

从更长远的角度看，**Interop 代表的是一种「把 Web 当平台认真打磨」的态度**：  
让规范、实现与测试三者形成闭环，让你在写代码时更少被「奇怪的兼容性坑」拖后腿，把精力放在真正的产品与体验上。

