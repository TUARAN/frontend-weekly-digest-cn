原文：[Incremental Hydration In Angular Apps](https://www.syncfusion.com/blogs/post/incremental-hydration-in-angular-apps)
翻译：TUARAN
欢迎关注 [{{前端周刊}}](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Angular 中的增量水合：构建“秒开且可交互”的 SSR 应用



![增量水合封面图](https://www.syncfusion.com/blogs/wp-content/uploads/2026/01/Build-High%E2%80%91Performance-Angular-Apps-with-Incremental-Hydration.jpg)

**TL;DR：**Angular 的增量水合（Incremental Hydration）通过把“可见”与“可交互”的成本拆开：页面仍然用 SSR 很快渲染出完整 HTML（有利于 LCP/SEO），但把某些区域的客户端激活（事件绑定、变更检测等）推迟到「空闲 / 进入视口 / 交互 / 定时」等触发时机，从而减少主线程阻塞（TBT）并让首屏更“顺滑”。

## 目录

- 1. 性能悖论：看起来好了，但还不能用
- 2. 演进与术语：从“破坏式”到“非破坏式”再到“增量”
- 3. 深入：`@defer` 的加载与水合双触发
- 4. 实现与配置：开启增量水合与事件回放
- 5. 架构：嵌套块、层级规则与 HTML 约束
- 6. 排错与调试：水合不匹配（Hydration Mismatch）
- 常见问题
- 总结与行动清单

## 1. 性能悖论

现代 Web 应用经常陷入一个悖论：

- **业务与指标（Core Web Vitals）**希望尽快看到内容：通过 SSR 改善 LCP（Largest Contentful Paint）。
- **用户体验**希望像 SPA 一样顺滑可交互：事件绑定、变更检测、路由与各种组件逻辑都要跑起来。

问题在于：**“看起来 ready”与“用起来 ready”之间存在时间差**。

在传统水合（hydration）里，浏览器需要在主线程上启动框架、遍历 DOM、挂载监听器等。用户看到页面已经“完整”，但点击按钮没有反应、菜单卡住——这段时间就像性能的“恐怖谷”，通常发生在 LCP（内容已绘制）到 TTI（Time to Interactive）之间。

Angular 的增量水合把应用视为一组相对独立的“岛屿”：不是启动时把整棵组件树一次性激活，而是让某些部分**在合适的时机再醒来**。收益通常体现在更低的 TBT（Total Blocking Time）与更快的“体感可用”。

![标准水合 vs 增量水合](https://www.syncfusion.com/blogs/wp-content/uploads/2026/01/Standard-Hydration-vs-compressed-scaled.jpg)

## 2. 演进与术语

理解 Angular 的水合语法之前，先把“hydration”在不同阶段的含义理清：

### 2.1 破坏式水合（早期/遗留）

在一些旧方案里，“水合”更像是误用：

1. 服务端返回 HTML。
2. 浏览器先把它画出来。
3. 客户端框架**丢弃这份 DOM**，再用 JS 从头重建。

这会导致闪烁（flicker）与大量计算开销。

### 2.2 非破坏式水合（Angular 16+）

Angular 16 引入非破坏式水合：

- 启动后遍历已有的 SSR DOM；
- 将 DOM 节点与组件树匹配；
- 在复用 DOM 的前提下挂载事件监听。

这是巨大进步，但仍是“一刀切”：启动时仍要把整棵树都水合。

### 2.3 增量水合（Incremental Hydration）

增量水合建立在非破坏式水合之上，但进一步提供“粒度”。它基于 `@defer` 块作为边界：可以让某些组件子树先以静态 HTML（dehydrated）呈现，等触发条件满足时再执行客户端逻辑并挂载监听。

它与“懒加载（lazy loading）”的关键差异是：

- **懒加载（常见于 CSR）**：代码晚点加载，DOM 往往也是晚点渲染（可能先显示骨架/占位）。
- **增量水合（SSR）**：内容先由服务端渲染出来，用户立刻能看到；只是先不激活交互，等触发再水合。

因此它更像是在“保持视觉完整”的前提下，优化主线程执行成本。

## 3. 深入：`@defer` 的加载与水合双触发

在增量水合语境里，一个 `@defer` 块实际控制两件事：

1. **Loading：**什么时候去拉取对应的 JS chunk。
2. **Hydrating：**什么时候执行逻辑、把监听器挂到已存在的 HTML 上。

这意味着你可以做出更“精细”的性能画像：先把代码悄悄拉下来，但把激活推迟到真正需要的时候。

### 3.1 双触发示例

```javascript
@defer (on idle; hydrate on interaction) {
  <app-heavy-chart />
}
```

- **首屏（SSR）：**服务端会渲染 `<app-heavy-chart />`，用户立刻看到内容。
- `on idle`：浏览器空闲时在后台拉取图表的 JS。
- `hydrate on interaction`：先不执行图表逻辑，让它保持“静态壳”；主线程保持轻。
- **当用户交互（点击/触摸/键盘等）：**触发水合，组件“醒来”。
- **如果是 CSR 路由进入（没有 SSR）：**`on idle` 会影响该块什么时候真正渲染。

### 3.2 常见水合触发方式

下面这些是更偏“水合时机”的触发类型（不同版本/文档里表述略有差异，核心思想一致）：

1. **`hydrate on idle`（默认型优化）**
   - 行为：在浏览器空闲时水合（概念上类似 `requestIdleCallback` 的时机）。
   - 适合：大多数非关键区域。

2. **`hydrate on viewport`（首选的“屏外内容”策略）**
   - 行为：进入视口才水合（基于 `IntersectionObserver`）。
   - 适合：长列表、评论区、页脚等。

3. **`hydrate on interaction`（重组件“按需启动”）**
   - 行为：点击/触摸/键盘等交互触发。
   - 适合：地图、复杂日期选择器等“看得见但不一定会用”的部件。

4. **`hydrate on hover`（提前一点点）**
   - 行为：鼠标悬停 / focus 触发。
   - 适合：下拉菜单等，鼠标靠近时提前准备。

5. **`hydrate on timer (X)`（按时间排队）**
   - 行为：延迟 X 毫秒后水合。
   - 适合：你想明确安排启动顺序，比如侧边栏 500ms、广告 2000ms。

6. **`hydrate on immediate`（关键交互）**
   - 行为：在非延迟内容渲染完之后尽快水合。
   - 适合：首屏必须马上可点的关键按钮。

```javascript
@defer (hydrate on immediate) {
  <hero-cta-button />
} @placeholder {
  <div>Loading...</div>
}
```

7. **`hydrate when <condition>`（条件门控）**
   - 行为：当某个信号或布尔条件变为真时水合。
   - 适合：例如「只有管理员才需要的仪表盘组件」。
   - 注意：条件通常只能在**最外层**尚未水合的 `@defer` 上可靠评估；父块还没水合时，子块条件也无法被计算。

8. **`hydrate never`（纯静态块）**
   - 行为：服务端渲染后永不水合。
   - 适合：完全没有交互需求的内容（条款、静态介绍等）。

## 4. 实现与配置：开启增量水合与事件回放

开启增量水合通常只是一处配置，但真正的关键点在于：**交互触发的那一下不能丢**。

### 4.1 基本配置

在 `app.config.ts` 中启用客户端水合，并开启增量能力：

```javascript
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import {
  provideClientHydration,
  withIncrementalHydration,
} from "@angular/platform-browser";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(withIncrementalHydration()),
  ],
};
```

### 4.2 自动事件回放（Event Replay）

很多人第一反应是：

> 如果我用了 `hydrate on interaction`，那用户第一次点击是不是会被吞掉？

Angular 的思路是：在真正框架逻辑还没起来时，先用一段轻量脚本捕获事件，把它们缓冲起来，等对应块水合完成后再“回放”。在启用 `withIncrementalHydration()` 时，这类事件回放能力通常会一并启用（文档中也常提到 `withEventReplay()`）。

事件回放大致流程：

1. **捕获：**在文档根部注册全局事件分发器。
2. **缓冲：**如果事件发生在尚未水合的 `@defer` 区域内，就先暂存。
3. **触发水合：**事件本身触发 `hydrate on interaction`。
4. **回放：**代码加载 + 水合完成后，把事件交给新挂载的监听器执行。

![Angular 水合与事件回放示意](https://www.syncfusion.com/blogs/wp-content/uploads/2026/01/Angular-Hydration-Event-Replay-1.png)

## 5. 架构：嵌套块与约束

增量水合带来收益，也带来一些你必须遵守的“架构规则”。忽略它们会导致退化（de-opt），甚至回落到破坏式重渲染。

### 5.1 层级规则：自上而下

Angular 水合是有层级的：

- **父级必须先水合（或同时水合）**，子级才能可靠水合。
- 子组件依赖父组件的变更检测与输入绑定；如果父级仍是“脱水”状态，子级很难独立激活。

实践建议：把 `@defer` 块设计得更“自包含”，避免出现点了叶子节点却把整棵树都连锁唤醒的“瀑布效应”。

### 5.2 HTML 结构必须有效且一致

非破坏式水合依赖“复用 DOM”：服务端输出的 DOM 结构需要与浏览器最终 DOM、以及客户端期望结构严格一致。

常见坑：

- `<a>` 嵌套 `<a>`
- `<p>` 里塞了 `<div>` 这类块级元素
- `<table>` 缺 `<tbody>`
- 由于无效 HTML 导致浏览器自动修复、从而改变了 DOM

这些都会导致水合复用失败，进而触发重建。

### 5.3 SEO 影响？通常不会

有人担心 `@defer` 会伤害 SEO。增量水合的前提是 SSR：主内容在服务端模板里已经输出成语义化 HTML，搜索引擎拿到的就是完整内容。

水合触发控制的是“什么时候执行 JS 让它可交互”，不是“内容什么时候出现”。

### 5.4 `@placeholder` 仍然需要

即使 SSR 会把真实内容渲染出来，`@placeholder` 仍然很重要——主要用于 **CSR 路由导航** 的场景。

当用户通过 `routerLink` 在客户端导航进入某页时，该页的 `@defer` 更像常规延迟块：

- 会先显示 `@placeholder`
- 然后根据触发条件加载并渲染真实内容

```javascript
@defer (on viewport; hydrate on interaction) {
  <comments-section />
} @placeholder {
  <div class="comments-skeleton">Loading comments...</div>
}
```

建议：给占位提供接近真实内容的尺寸，减少 CSR 下的布局抖动（CLS）。

## 6. 排错与调试：Hydration Mismatch

最常见的问题是 **Hydration Mismatch（水合不匹配）**：

> 服务端生成的 HTML 与客户端期望的 DOM 不一致。

本质原因是：客户端在水合时要求“可复用的 DOM”必须匹配预期；哪怕是一个文本节点差异，都会出问题。

### 6.1 常见原因

1. **动态日期：**模板里直接 `new Date()`，服务端与客户端时间不同。
2. **随机 ID：**用 `Math.random()` 之类生成随机值。
3. **浏览器规范化：**无效 HTML 被浏览器修复后结构变了。

### 6.2 调试手段

- **控制台日志：**Angular 通常会提示具体不匹配的节点。
- **Angular DevTools：**可以查看组件树；在较新版本里也能看到组件的水合状态（Hydrated / Skipped / Dehydrated）。
- **可视化标记：**临时用 CSS（如 `.ng-hydrating`）给“醒来”的组件加高亮，观察时序。

## 常见问题

### 增量水合解决了什么问题？

它减少了 SSR 应用里“内容已出现但还不能交互”的间隙，通过延迟/分批激活交互逻辑降低启动期主线程压力。

### 它和标准水合有什么区别？

标准水合倾向于启动时激活整棵组件树；增量水合根据触发条件只激活需要的部分。

### 它等同于懒加载吗？

不等同。懒加载往往会推迟渲染；增量水合强调 SSR 先渲染出内容，再推迟交互激活。

### 会影响 SEO 吗？

通常不会。SSR 已输出完整内容，触发控制的是 JS 执行时机。

### `@defer` 的作用是什么？

它定义水合边界，并控制“什么时候加载代码 / 什么时候激活交互”。

## 总结与行动清单

增量水合的核心很简单：

- **服务端把内容都渲染出来**（用户立刻看到、SEO 友好）
- **客户端只在需要时才水合**（主线程更清爽、体感更快）

你可以从这份行动清单开始：

1. **做一次页面盘点：**哪些在首屏？哪些在首屏下方？哪些必须立即可点？
2. **为不同区域选择触发：**
   - Hero + CTA：`hydrate on immediate`
   - 评论区/长列表：`hydrate on viewport`
   - 重型但不一定会用的组件：`hydrate on interaction`
   - 纯静态块：`hydrate never`
3. **CSR 场景别忘 `@placeholder`：**占位尽量稳定尺寸，避免 CLS。
4. **在真实设备上验证：**用 DevTools 观察水合状态与事件回放是否符合预期。

一句话结论：不要在启动时把所有东西一次性“唤醒”。让组件在用户需要时再启动，你会得到更快、更稳、更顺滑的 Angular SSR 体验。
