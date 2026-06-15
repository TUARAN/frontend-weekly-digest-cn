原文：The quiet problem with unnecessary async
链接：https://allthingssmitty.com/2026/06/08/the-quiet-problem-with-unnecessary-async/
翻译：TUARAN

# 那些"不必要 async"造成的隐性复杂度

在 JavaScript 代码库里，有一种模式正在悄悄地把复杂度扩散到整个应用。你大概率见过类似这样的代码：

```js
async function getConfig() {
  return defaultConfig;
}
```

乍一看，这种写法几乎算不上一个真正的决定。

也许有一天 `getConfig()` 会远程拉取某些东西。也许将来还要读 IndexedDB。现在就把它标记成 `async`，看起来似乎是无害的，甚至是"有远见的"。

问题是：**`async` 改变了这个函数的契约**。

---

## 函数一旦变成 `async`，会发生什么变化

一个函数一旦被标记为 `async`，它就不再直接返回一个值，而是开始返回一个 Promise——即使内部没有任何 `await`。

这会影响下游所有的调用方。

```js
const config = getConfig();
```

会变成：

```js
const config = await getConfig();
```

而一旦发生这种变化，周围的代码也会跟着调整：

- 调用方需要"识别" Promise
- 测试需要变成 async-aware
- 组合函数开始传播 Promise

有人把这叫做"function coloring problem"（函数染色问题）：

> async 行为倾向于沿调用链向外传播。

多年前我接手过一个代码库，几乎每个 helper 都返回一个 Promise。追踪一次请求的执行路径，意味着跟着一连串 `await` 再 `await`，直到最后才发现真正发生异步 I/O 的地方。其实大多数函数返回的只是已经在内存里的数据。

让人抓狂的并不是语法本身，而是**不确定性**。从外部看，几乎所有函数都"长一样"，都是异步的——于是函数签名失去了告诉我"真正的 I/O 在哪"的能力。

从那之后，我才开始认真对待"async 边界到底应该放在哪"这件事。

---

## "以后可能会用到"

一个常见的理由长这样：

```js
async function getFeatureFlags() {
  return localFlags;
}
```

背后的逻辑往往是：

> "以后可能要改成从服务器拉。"

有时候这确实是一个好理由。

公开的 library 通常会**早期就**把 API 暴露成 async，因为以后想改回来代价很大；同时不同实现之间保持一致也很重要。

但**应用代码往往不一样**。内部 helper 经常是"投机性"地变成 async，哪怕当下根本没有任何异步发生。

此刻：

- 没有挂起点
- 没有 I/O
- 没有异步依赖

但**今天所有调用方已经在为 async 付出代价**。

---

## `async` 本身是一种语义表达

当我快速浏览一段陌生的代码时，我会用**函数签名**当快捷线索。

如果我看到：

```js
async function loadUser()
```

我会假设这里存在一个真正的"边界"——

- 网络请求
- 存储读写
- 后台处理

某种**无法立即产生结果**的事情。

这是一种很有价值的信息。函数签名能帮我们建立对系统的心理模型。当一个函数返回的就是同步可获得的数据时，把它标成 `async`，反而**在暗示某种其实并不存在的工作**。

---

## 认知开销

性能通常不是这里的瓶颈。现代 JS 引擎处理 Promise 的效率已经很高。**真正的成本是认知上的。**

对比一下：

```js
function getTheme() {
  return currentTheme;
}
```

和：

```js
async function getTheme() {
  return currentTheme;
}
```

再看调用方：

```js
const theme = getTheme();
applyTheme(theme);
```

vs.

```js
const theme = await getTheme();
applyTheme(theme);
```

前者保持在同步控制流里。后者引入了 async 流——即使底层数据本就是同步可得的。

测试里这种情况尤其明显。一个不必要的 Promise，就能让一个原本简单的测试文件变成一连串 async 的 setup 与 assert。

---

## 异步边界是一种"架构决定"

现代前端系统本来就重异步：

- Streaming SSR
- React Server Components
- Edge runtimes
- Server actions
- 异步路由
- Suspense-driven rendering

异步边界会影响渲染行为、组合方式、错误处理、调试体验以及整个应用的形态。正因如此，我倾向于把 async 边界当成**架构决策**，而不是实现细节。

我有一个粗略的原则：**`async` 应该代表真正的异步边界，而不是假想的未来需求**。如果一个函数根本没 `await` 任何东西，那就值得问一句：它到底为什么要 `async`？

> 📌 顺带一提
>
> 我之前写过 [Async loops and iteration patterns in JavaScript](/2025/10/20/rethinking-async-loops-in-javascript/)，里面讨论的取舍和本文关于异步边界 / 控制流的话题是相通的。

---

## 让 API 保持"诚实"

不要围绕"这个函数将来可能会变成什么"来设计，而要围绕"它今天是什么"来设计。

如果它是同步的：

```js
function getConfig() {
  return defaultConfig;
}
```

就让它保持同步。

如果将来真的出现异步工作，再有意识地引入 async 语义。在那之前，更小的异步边界意味着：更容易推理、更容易追踪，也让函数签名更有意义。

因为 `async` 改变的**不只是**一个函数的实现——**它改变了围绕这个函数的所有代码的形态**。

---

## 作者附注（文末修订说明）

> 这一版最大的区别是：
>
> - 在文章开头加入了一段更具体的个人轶事。
> - 删掉了几处重复的"async 会向外传播"的解释。
> - 把一些泛化的表达（"人们依赖函数签名"）替换为第一人称观察（"我浏览陌生代码时……"）。
> - 收紧了结尾，让结论落得更重一点，而不是再把主题解释一遍。
