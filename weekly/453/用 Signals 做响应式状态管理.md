> 原文：[Reactive state management with JavaScript Signals](https://www.infoworld.com/article/4129648/reactive-state-management-with-javascript-signals.html)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 用 Signals 做响应式状态管理

在谈前端状态管理时，我们已经习惯了「基于值和订阅」的模型：  
状态存在某个 Store 里，视图通过订阅变更来更新自己。  
这篇文章介绍的 **Signals 模型** 则是另一条路线：**把「依赖关系」显式记录下来，让计算自己知道依赖了谁**。

---

## 什么是 Signal？

在 Signals 模型里，一个 Signal 可以理解为：

- 一个持有值的容器（`signal(value)`）；  
- 一个能被追踪的依赖源：当你在计算过程中读取某个 Signal，它会自动把当前计算标记为依赖者；  
- 当 Signal 值变化时，会自动通知所有依赖它的计算重新执行。

典型伪代码大致如下：

```js
const count = signal(0);
const doubled = computed(() => count.value * 2);

effect(() => {
  console.log('count =', count.value, 'doubled =', doubled.value);
});
```

当 `count.value++` 时：

- `doubled` 会被重新计算；  
- 依赖 `count` 和 `doubled` 的 `effect` 也会重新运行。

---

## 和传统状态管理方案有何不同？

作者对比了几种常见模式：

- **基于事件/动作的 Store（如 Redux）**：关注「动作 → 状态变化」，需要手写 reducer 和 action；  
- **基于 Hook 的本地状态（如 React useState/useReducer）**：和组件生命周期强绑定，状态通常跟随组件树；  
- **Signals**：把状态与组件解耦，聚焦在「数据依赖图」本身。

Signals 带来的几个潜在好处是：

- 计算的依赖关系是自动收集的，而不是手写订阅；  
- 在不重新渲染整棵组件树的前提下，局部更新依赖节点；  
- 更接近响应式系统（如 Vue、MobX）的底层原理，但实现可以更轻量。

---

## 适合用 Signals 的场景

文章列举了几个适配 Signals 的使用场景：

- **跨组件共享但又不想引入重量级 Store 的状态**，比如当前主题、布局配置、用户偏好设置；  
- **复杂派生状态较多的页面**，例如多重筛选、仪表盘、表格联动等；  
- **希望减少无意义重渲染的应用**，通过精细追踪依赖来优化更新粒度。

同时作者也提醒：

- Signals 并不是「替代所有状态管理方案」的银弹；  
- 在简单组件内部状态上，原生 Hook 或本地变量仍然足够；  
- 重要的是用它来描述「可以从依赖图视角思考」的那部分状态。

---

## 与框架生态的关系

目前，Signals 已经在多个生态中出现变体或实验：

- 一些框架内置了信号式状态（如 Solid、Angular Signals 等）；  
- 也有独立的 Signals 库可以与 React/Vue 等配合使用，用于管理跨组件状态。

文章的结论是：  
**无论你是否立刻在生产中引入 Signals，理解这种「以依赖图为中心」的状态模型，都有助于你看清不同框架状态系统背后的共性和差异。**

