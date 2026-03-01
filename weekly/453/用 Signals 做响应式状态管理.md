> 原文：[Reactive state management with JavaScript Signals](https://www.infoworld.com/article/4129648/reactive-state-management-with-javascript-signals.html)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 用 Signals 做响应式状态管理

![](https://www.infoworld.com/wp-content/uploads/2026/02/4129648-0-82142300-1770886918-marcel-ardivan-wU089-5b5pc-unsplash.jpg?quality=50&strip=all&w=1024)

Signals 的思路很简单，但能力很强：它一方面提供响应式，另一方面让状态保持简洁，即使在大型应用里也更容易管理。这也是为什么 [Solid](https://www.infoworld.com/article/2271109/hands-on-with-the-solid-javascript-framework.html)、[Svelte](https://www.infoworld.com/article/2265950/hands-on-with-svelte.html)、[Angular](https://www.infoworld.com/article/2252872/get-started-with-angular-introducing-the-modern-reactive-workflow.html) 都采用了 Signals 模式。

本文将介绍 Signals 的基本思路，并通过对比例子说明它如何改变 JavaScript 前端中的状态管理方式。

## Signals 模式简介

Signals 模式最早出现在 JavaScript 的 [Knockout](https://knockoutjs.com/) 框架中。其核心思想是：

> 某个值发生变化时，应该主动“通知”应用中依赖它的部分。

这与 React 的“拉（pull）模型”形成对比：React 常在组件重新渲染时重新读取数据；而 signal 是“推（push）模型”，会把更新推送到具体需要更新的位置。

这种模式是对“响应式（reactivity）”的直接表达，也常被称为 **细粒度（fine-grained）响应式**：当某个 signal 更新时，不需要你手动做任何额外操作，就能更新某个文本节点或属性的输出，体验上近乎“魔法”。

这种“魔法”本质上是函数式思想与依赖追踪的结合。它可以减少框架在渲染检查上的额外开销，更重要的是提供一种可在各处复用（甚至跨组件复用）的统一机制，从而降低对集中式 store 的依赖。

## Signals 之前：虚拟 DOM（VDOM）

要理解 Signals 为什么让人觉得“清爽”，可以从过去十多年最主流的模型开始：由 React 推广开来的 Virtual DOM。

VDOM 可以理解为：在内存里维护一份抽象 DOM。当状态变化时：

1. 框架在内存里重新渲染一遍组件树
2. 将新旧两棵树做比较（diff）
3. 把差异应用到真实 DOM

这种模式让 UI 开发变得声明式、可预测，但代价是：框架需要做大量工作来“找出哪些东西没变”。对于列表、树这种数据密集组件，这个开销会被放大；应用越大，diff 的成本越明显，于是开发者不得不引入各种优化手段（例如 memoization）来阻止引擎过度工作。

## 细粒度响应式（Fine-grained reactivity）

在 VDOM 模型里，框架反复“遍历一棵树”。Signals 则绕开了这一步：它用依赖图把“响应式单位”从组件变成了**值本身**。

你可以把 Signals 看成一种 observer 模式，但订阅者是自动收集的：

- 当视图模板读取某个 signal 时，会自动订阅它
- signal 与具体输出（文本节点/属性）之间形成直接、明确的连接
- signal 更新时，只通知这些精确订阅者

因此，这种更新更像“点对点”的直接更新：不需要遍历组件树、不需要推断变化来源。作者用复杂度来概括这种差异：

- VDOM 更接近 $O(n)$（$n$ 是树规模）
- Signals 更接近 $O(1)$（直接更新）

（顺带一提，React 团队也在用不同路径缓解这类问题，例如 React Compiler 通过编译器自动应用性能优化技巧。）

## Signals 上手：看起来相似，行为差异很大

先看 React 写一个简单 counter：

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  const double = count * 2;

  return (
    <button onClick={() => setCount(count + 1)}>
      {count} doubled is {double}
    </button>
  );
}
```

再看 Svelte（Runes 语法）里用 signal 的写法：

```svelte
<script>
  let count = $state(0);
  let double = $derived(count * 2);
</script>

<button onclick={() => (count += 1)}>
  {count} doubled is {double}
</button>
```

两者都有一个响应式值 `count`，以及一个依赖它的派生值 `double`。如果只看功能，它们做的事情一样。

差异要通过一个更“暴力”的观察方式才能体现：加一行 log。

React 版本：

```tsx
export default function Counter() {
  const [count, setCount] = useState(0);
  const double = count * 2;

  console.log("Re-evaluating the world...");

  return (
    <button onClick={() => setCount(count + 1)}>
      Count is {count}, double is {double}
    </button>
  );
}
```

在 React 中，每次组件挂载**或更新**，这行日志都会输出。

Svelte 版本：

```svelte
<script>
  let count = $state(0);
  let double = $derived(count * 2);

  console.log("One and done.");
</script>

<button onclick={() => (count += 1)}>
  Count is {count}, double is {double}
</button>
```

这里日志只会在组件挂载时输出一次。

看起来像“不可能”，但背后逻辑很直接：signal 直接把值和输出连接起来，不需要重新执行包裹它的整段 JS；组件本身不必被重新求值。signal 是一个可携带的响应式单位。

## Signals 如何减少“依赖数组”的心智负担

Signals 也会改变我们处理副作用的方式。在 React 里，我们必须显式声明依赖数组（`useEffect` 的第二个参数）。这是 DX 的常见痛点：依赖漏了就会出 bug，依赖多了又容易带来额外执行。

React 的写法：

```tsx
useEffect(() => {
  console.log(`The count is now ${count}`);
}, [count]);
```

Signals 的写法可以把“依赖关系”交给自动追踪：

```ts
effect(() => {
  console.log(`The count is now ${count()}`);
});
```

作者用 Angular 语法举例，Solid 的写法也类似：

```ts
createEffect(() => {
  console.log(count());
});
```

## “Prop drilling”的终点

当你需要跨组件共享状态时，React 中常见的方式之一是层层传 props（prop drilling）：

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  return <Child count={count} />;
}

function Child({ count }) {
  return <GrandChild count={count} />;
}

function GrandChild({ count }) {
  return <div>{count}</div>;
}
```

Redux 等集中式 store 试图解决这种“复杂度蔓延”，但在一些团队里，它又会引入另一套复杂度。

Signals 给出的方向是：共享状态可以只是一个普通 JS 模块，在任意组件中直接导入即可：

```js
// store.svelte.js
export const counter = $state({
  value: 0,
});

export function increment() {
  counter.value += 1;
}
```

使用时就是普通的 JavaScript：

```svelte
<script>
  import { increment } from "./store.svelte.js";
</script>

<button onclick={increment}>Click Me</button>
```

## 走向标准？

历史上，很多从库/框架里长出来的成功模式都会进入语言/平台：比如 jQuery 的选择器思路影响了 `document.querySelector`，Promise 也最终成为标准。

Signals 可能也在走这条路：目前 TC39 有一个 [proposal-signals](https://github.com/tc39/proposal-signals) 提案，试图把 signals 作为语言层的响应式原语加入 JavaScript。

作者畅想了一个场景：你在一个纯 JS 文件里定义一个 signal，然后它同时驱动 React 组件、Svelte 模板、Angular service 的更新。如果真的标准化成功，状态管理可能从“框架问题”变成“语言问题”，这会显著简化很多系统的复杂度。

当然，作者也吐槽：标准化并不总是净收益——别变成“又多了一种做法”就好。

## 结语

很长一段时间里，我们接受了一个前端开发的折中：为了 VDOM 带来的声明式体验，我们容忍了额外的性能开销。

Signals 提供了一条“走出折中”的路：它让你依然能以声明式方式定义状态并让 UI 响应它，但更新性能更接近“外科手术式”的精确更新。作者也把功劳归于 Ryan Carniato 与 Solid.js：他们在现代框架里证明了细粒度响应式可以在性能上战胜 VDOM，并推动这个思想扩散到 Angular、Svelte，甚至有机会进入 JavaScript 语言本身。

回到“推（push）模型”而不是“拉（pull）模型”，意味着我们有机会用更少的代码，做更多的事。也许，JavaScript 对“简洁”的追求终于开始重新占上风了。

