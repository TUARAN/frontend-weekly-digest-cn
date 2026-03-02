原文：React’s useTransition: The hook you’re probably using wrong  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## React 的 useTransition：你很可能用错了这个 Hook

[SDK](https://www.nutrient.io/blog/categories/sdk/) / [Development](https://www.nutrient.io/blog/categories/development/)

![](https://www.nutrient.io/_astro/miguel-calderon.CXThPKO8_2acqC4.jpg)

Miguel Calderón  
2026 年 2 月 10 日

## 目录

![](https://www.nutrient.io/_astro/article-header.Bqra9eNi_Z1npToe.png)

TL;DR —— `useTransition` 会导致两次渲染：一次立即渲染（`isPending` = `true`），一次延后渲染  
- 把它用在昂贵的 CPU 密集型状态更新上，而不是网络请求上  
- 输入框的 state 不要放进 transition；只包裹派生/过滤出来的 state  
- 当你无法控制 state setter 时，选择 `useDeferredValue`

你的搜索输入框感觉很卡。用户输入时，用户界面（UI）会短暂卡住，然后结果才出现。你可能试过做 debounce，但体验仍然不够好。熟悉吗？你知道 React 其实自带一个解决方案吗？

[`useTransition`（在新标签页打开）](https://react.dev/reference/react/useTransition) 这个 Hook 从 React 18 起就已经可用，但至今仍被广泛误解。本文会讲清楚它在底层到底如何工作，说明什么时候应该（以及不应该）使用它，并结合一个生产环境的 PDF 查看器代码库中的真实示例进行讲解。

### useTransition 实际上做了什么

在看一些使用模式之前，先理解背后发生了什么很重要。当你调用 `useTransition` 时，会得到两样东西：

```js
const [isPending, startTransition] = useTransition();
```

`isPending` 这个布尔值告诉你当前是否有一个 transition 正在进行；`startTransition` 是一个函数，用来包裹你的 state 更新。但这里有个常被忽略的点：`useTransition` 会导致组件进行两次重新渲染（double rerender）。

这一点在你考虑 `isPending` 所必须满足的行为时就很清楚了：在 transition 期间它必须为 `true`，以便 UI 能渲染一个“过渡中”的状态；而在 transition 完成后它又必须变回 `false`，用来表示过渡已经结束。

第一次渲染是立即执行的高优先级渲染，此时 `isPending` 变为 `true`。随后，这个回调会以较低优先级被调度；当它完成时，会发生第二次渲染，并把 `isPending` 设为 `false`。这意味着如果期间出现更紧急的任务（比如用户又输入了一个字符），React 可以中断这段工作。

### Lane 调度：React 如何确定优先级

React 18 引入了一个叫“lanes”的概念来调度更新。当你把 state 更新包裹在 `startTransition` 里时，React 会把这些更新分配到一个较低优先级的 lane。也正因为如此，transition 才是可中断的——更高优先级的更新（例如直接来自用户输入的更新）可以插队优先执行。

### 经典用例：搜索输入框

`useTransition` 最常见的场景是“边输入边搜索”（search-as-you-type）。下面是一个典型的问题实现：

```js
function SearchDocuments({ documents }) {  const [query, setQuery] = useState('');  const [results, setResults] = useState(documents);
  const handleSearch = (value) => {    setQuery(value);    // Expensive filtering blocking the input.    setResults(documents.filter(doc =>      doc.content.toLowerCase().includes(value.toLowerCase())    ));  };
  return (    &#x3C;div>      &#x3C;input        value={query}        onChange={e => handleSearch(e.target.value)}      />      &#x3C;ResultsList results={results} />    &#x3C;/div>  );} {    setQuery(value);    // Expensive filtering blocking the input.    setResults(documents.filter(doc =>      doc.content.toLowerCase().includes(value.toLowerCase())    ));  };  return (           handleSearch(e.target.value)}      />            );}">  
```

当要过滤成千上万份文档时，每次按键都会触发一次昂贵的操作，从而阻塞主线程。输入框之所以感觉迟钝，是因为 React 在过滤完成之前无法更新输入框的 value。

下面是使用了 `useTransition` 的同一个组件：

```js
function SearchDocuments({ documents }) {  const [query, setQuery] = useState('');  const [results, setResults] = useState(documents);  const [isPending, startTransition] = useTransition();
  const handleSearch = (value) => {    setQuery(value);  // Immediate — keeps input responsive.    startTransition(() => {      // Expensive filtering — can be interrupted.      setResults(documents.filter(doc =>        doc.content.toLowerCase().includes(value.toLowerCase())      ));    });  };
  return (    &#x3C;div>      &#x3C;input        value={query}        onChange={e => handleSearch(e.target.value)}      />      {isPending &#x26;&#x26; &#x3C;LoadingSpinner />}      &#x3C;ResultsList        results={results}        style={{ opacity: isPending ? 0.7 : 1 }}      />    &#x3C;/div>  );} {    setQuery(value);  // Immediate — keeps input responsive.    startTransition(() => {      // Expensive filtering — can be interrupted.      setResults(documents.filter(doc =>        doc.content.toLowerCase().includes(value.toLowerCase())      ));    });  };  return (           handleSearch(e.target.value)}      />      {isPending &#x26;&#x26; }            );}">  
```

这里的关键洞察是：`setQuery(value)` 会立即发生（高优先级），而 `setResults()` 被包裹在 transition 中（低优先级）。如果用户在过滤完成之前又输入了一个字符，React 会放弃正在进行的 transition，并用更新后的 query 启动一个新的 transition。

### useTransition vs. useDeferredValue：什么时候用哪个

React 18 还引入了 [`useDeferredValue`（在新标签页打开）](https://react.dev/reference/react/useDeferredValue)，它看起来可能很相似。下面是选择方式。

**在以下情况使用 `useTransition`：**
- 你能控制 state 更新（你能拿到 setter）
- 你需要 `isPending` 这个标记来显示加载中的 UI
- 你想把多个相关的 state 更新一起包裹起来

**在以下场景使用 `useDeferredValue`：**
- 该值来自 props 或你无法控制的外部状态
- 你只需要一个“过期/滞后”的值版本，让它稍后再更新
- 你想在不修改父组件的情况下优化子组件

下面是 `useDeferredValue` 的实际用法：

```js
function ResultsList({ results }) {
  // Create a deferred copy that lags behind during transitions.
  const deferredResults = useDeferredValue(results);
  const isStale = results !== deferredResults;

  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      {deferredResults.map(result => (
        <ResultItem key={result.id} result={result} />
      ))}
    </div>
  );
}
```

子组件不需要了解 transition（过渡）相关的细节——它只是接收 props，然后创建一个延迟版本即可。这非常适合在不重构父组件的前提下，优化现有组件。

## useTransition vs. debouncing（防抖）

你可能会想：为什么不直接对搜索做防抖？下面这张表展示了 `useTransition` 与防抖的对比。

| 维度 | 防抖（Debouncing） | useTransition |
| --- | --- | --- |
| **延迟** | 固定（例如 300ms） | 动态（由 React 决定） |
| **输入体验** | 可能会有卡顿/滞后感 | 始终即时响应 |
| **加载状态** | 需要自己管理 | 内置 `isPending` |
| **取消** | 需要手动清理 | 自动 |

防抖会在人为设定的延迟结束前，不开始任何工作。`useTransition` 则会立刻开始工作，但允许它被打断。实际差异在于：使用防抖时，用户必须先等待一个预设的时间，之后才会发生任何事情；而使用 `useTransition` 时，工作会立刻开始，同时输入仍保持响应。

不过，当你发起的是网络请求时，防抖仍然是正确选择——`useTransition` 适用于 CPU 密集型工作，而不是 I/O。

## 真实案例：PDF 文档搜索

在 Nutrient，我们的 [Web Viewer SDK](https://www.nutrient.io/sdk/web/) 需要在可能多达数千页的文本中进行搜索。下面是我们处理搜索的简化版本：

```js
// Before: Every keystroke dispatches immediately.
const handleSearchQueryChange = (value) => {
  dispatch(searchForTerm(value));  // Expensive operation
};

// After: Wrap expensive dispatch in transition.
const [isPending, startTransition] = useTransition();

const handleSearchQueryChange = (value) => {
  startTransition(() => {
    dispatch(searchForTerm(value));
  });
};
```

即使在一份 500 页的文档中搜索，搜索输入框也能保持响应。

## 不要在这些情况下使用 useTransition

`useTransition` 并不是万能解。请在以下场景避免使用。

## 1. 网络请求

`useTransition` 不会等待 promise。如果你把 fetch 调用包在 transition 里，transition 会立刻结束，即使请求仍在进行中：

```js
// This doesn't work as expected.
startTransition(() => {
  fetchResults(query).then(setResults);  // Transition ends before data arrives.
});
```

对于异步操作，请使用 React Suspense 配合数据获取库，或者单独管理 loading 状态。

## 2. 本来就很快的操作

如果你的状态更新耗时少于 16ms（也就是一帧），使用 transition 的额外开销不值得。先用 React DevTools Profiler 测量再决定。

## 3. 关键的 UI 反馈

不要把用户需要立刻看到的状态更新包进 transition：

```js
// Don't do this — form validation should be instant.
startTransition(() => {
  setValidationError('Email is required');
});
```

## 高级模式：结合 context 的 transition

在更大的应用中，可能会出现一种协同（coordination）问题：当全局状态变化会触发多个组件的昂贵重渲染时，你需要一种方式在“源头”统一管理 transition，而不是在每个消费方组件里分别处理。

在这些高级用例中，可能需要使用 `Context` 来更新并同时向所有消费者传播，这会变得具有挑战性。举例来说，如果你的筛选器状态会影响侧边栏、结果列表和汇总面板，那么一次 `setFilters()` 调用会触发这三个部分全部重渲染。缺少统一协调时，每个组件都得各自使用自己的 `useTransition`——从而导致逻辑重复以及不一致的加载状态。

通过把 `useTransition` 放到 `Context` Provider 里，你可以把过渡（transition）逻辑集中管理，并在暴露状态的同时一并暴露 `isPending`：

```js
function FilterProvider({ children }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [isPending, startTransition] = useTransition();

  const updateFilters = (newFilters) => {
    startTransition(() => {
      setFilters(newFilters);
    });
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilters, isPending }}>
      {children}
    </FilterContext.Provider>
  );
}
```

现在，所有消费该 Context 的组件都可以基于 `isPending` 来展示加载状态，而无需各自实现 transition。侧边栏可以将内容变暗，结果列表可以显示一个 spinner，摘要面板可以展示骨架屏——它们都对同一个来自“单一事实来源”的 `isPending` 标记作出响应。

## 调试技巧

当 transitions 的表现不符合预期时，有两种方法很有帮助：在 DevTools 中检查渲染优先级，以及通过日志检测是否存在被中断的工作。

## React DevTools Profiler

在 React DevTools 中，transitions 会带有一个特殊的 “Transition” 标签显示出来。你可以看到哪些渲染是高优先级，哪些是 transition 优先级。

## 控制台日志

在 transition 的回调里添加日志，观察工作何时开始，以及是否被中断：

```js
startTransition(() => {
  console.log('Transition starting for:', value);
  setResults(expensiveFilter(value));
  console.log('Transition completed for:', value);
});
```

如果某个 transition 被中断了，你会看到 “starting”，但看不到与之对应的 “completed”。

## 关键要点

- `useTransition` 会触发两次渲染——一次是立即渲染（`isPending` = `true`），一次是延后渲染（`isPending` = `false` + 你的更新）
- 把它用于 CPU 密集型、开销大的状态更新，而不是网络请求
- 不要把输入状态包进 transition ——只包裹开销大的派生状态
- 当你无法控制 state setter 或者想优化子组件时，选择 `useDeferredValue`
- 优化前先测量——transitions 会带来额外开销，所以只在你有可度量的卡顿问题时使用

React 的并发特性让你可以控制更新的优先级。你不再只能在“全部阻塞渲染”与“完全不渲染”之间二选一；现在你可以在昂贵的工作在后台进行时，依然保持输入的响应性。当你的 UI 在状态更新期间显得迟钝时，值得考虑使用 `useTransition`——而你现在也清楚它在底层究竟发生了什么。

![](https://www.nutrient.io/_astro/miguel-calderon.CXThPKO8_2acqC4.jpg)

#### Miguel Calderón

Web 高级 Staff 软件工程师

linkedin

twitter

github

作为 Web 团队的一员，Miguel 喜欢寻找新的挑战，并尝试判断最新技术能如何改进我们的产品。其余时间里，他的兴趣是写小说、阅读和旅行。

#### 探索相关主题

[Web](https://www.nutrient.io/blog/tags/web/) [React](https://www.nutrient.io/blog/tags/react/) [JavaScript](https://www.nutrient.io/blog/tags/javascript/) [Performance](https://www.nutrient.io/blog/tags/performance/) [Development](https://www.nutrient.io/blog/tags/development/)

目录

## 目录

免费试用

准备好开始了吗？

## 相关 SDK 文章

探索更多

[![](https://www.nutrient.io/_astro/article-header.FGRN5l07_KaPzf.png)](https://www.nutrient.io/blog/webassembly-in-a-web-worker/) ![](https://www.nutrient.io/_astro/ritesh-kumar.A538LHkg_7vJ50.jpg)
Ritesh Kumar

## [如何在 web worker 中使用 WebAssembly 模块](https://www.nutrient.io/blog/webassembly-in-a-web-worker/)

[![](https://www.nutrient.io/_astro/article-header.BR9HGlu7_Z1f39ib.png)](https://www.nutrient.io/blog/frontend-performance-enhancements-at-pspdfkit/) ![](https://www.nutrient.io/_astro/steffen.DzCEIadE_ZtdiTG.jpg)
Lucas Nezwal

## [PSPDFKit 的前端性能增强](https://www.nutrient.io/blog/frontend-performance-enhancements-at-pspdfkit/)

[![](https://www.nutrient.io/_astro/article-header.C8B8VODV_Qr4Nr.png)](https://www.nutrient.io/blog/generalized-crud-api-on-web/) ![](https://www.nutrient.io/_astro/tomas-surin.Cu-29wt3_Z1fKiFA.jpg)
Tomáš Šurín

## [PSPDFKit for Web 的通用 CRUD API](https://www.nutrient.io/blog/generalized-crud-api-on-web/)