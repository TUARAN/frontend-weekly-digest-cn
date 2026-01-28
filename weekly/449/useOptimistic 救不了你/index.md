# useOptimistic 救不了你

> 原文：[useOptimistic Won't Save You](https://www.columkelly.com/blog/use-optimistic)
>
> 翻译：[嘿嘿](https://blog.heyfe.org/blog)

## 乐观 UI (Optimistic UI)

乐观 UI 是指在后台操作尚未完成时，为了响应用户交互而立即更新 UI 的技术。这种做法让界面响应速度与网络延迟实现了脱钩。最典型的例子就是“点赞”按钮。

你可能觉得在 React 中实现这个功能轻而易举，但要在不引入视觉闪烁（Glitches）或竞态条件（Race conditions）的前提下搞定它，其实并不简单。React 19 引入了 `useOptimistic` Hook，看起来是想把这种模式变成框架的“一等公民”。然而，我认为随着并发 React（Concurrent React）的到来，乐观 UI 反而变得更复杂、更难实现了。

让我们来探讨一下，为什么过去手动实现乐观更新如此脆弱，`useOptimistic` 能帮上什么忙，以及为什么它并不是包治百病的银弹。

## 我们的过去

为了理解 `useOptimistic` 在架构上的重要意义，我们首先应该审视一下之前在用户层实现时的局限性。

### 示例 1：糟糕的乐观更新

最幼稚的方法是在用户交互时更新一次 UI，然后在服务器响应时再更新一次。这种做法存在几个问题，会导致 UI 状态不同步。

https://codesandbox.io/p/sandbox/r4qgdq

如果我们疯狂点击按钮，随着请求的相继完成，状态会在不同值之间来回跳变。如果我们再加入随机的网络延迟，就会看到竞态条件，最终的状态完全看运气。

注释掉代码第 24 行（假设此处有代码）会有细微的改进。这能阻止与服务器的最后一次同步并解决闪烁问题，但又会引发新问题：如果 UI 真的同步失误了，除非再次触发 Bug 或者刷新页面，否则它永远无法恢复到正确状态。

在保持该行注释的情况下，勾选“总是报错（Always Error）”并发送两个请求。你会发现 UI 会从后一个乐观状态回退到前一个乐观状态，而无法根据服务器的实际结果进行对齐。

### 示例 2：好一点的乐观更新

为了防止这些问题，我们需要维护两个独立的状态：服务器状态和乐观状态。然后我们需要手动同步它们，比如使用 `ref` 来跟踪最新的请求 ID，并丢弃过时的响应。

这种方案可行，但为了正确处理竞态条件，需要编写大量的样板代码（Boilerplate）。

https://codesandbox.io/p/sandbox/nvxsvf

虽然这种方法解决了上一个例子中的问题，但依然存在缺陷：

#### 模板代码与复杂性

我们现在必须管理两个独立的状态、一个用于跟踪请求 ID 的 `ref`，以及在事件处理器中编写复杂的命令式逻辑。我们必须手动确保在成功和失败的情况下都检查了 `callId`。

或者，我们也可以使用 `AbortController` 在发起新请求时取消正在进行的请求，但代码量也差不多。

#### 过渡（Transitions）

如果更新发生在过渡（Transition）中会怎样？并发 React 使用 Transition 来处理非阻塞更新。在下一个例子中，待办事项（Todo）是通过 Form Action 更新的，React 会将其视为一个 Transition。

### 示例 3：Transition 内部的乐观更新

https://codesandbox.io/s/dgp9vr?file=%2FApp.js&utm_medium=sandpack

这行不通。当状态更新函数在 Transition 内部被调用时，它不会引起立即重绘，而我们需要立即重绘来展示乐观状态。这就是 `useOptimistic` 派上用场的地方。它允许我们在 Transition 内部立即更新 UI。它还会将状态的回滚（Reversions）推迟到最后一个 Transition 结束时再批量处理。

### 示例 4：useOptimistic

https://codesandbox.io/p/sandbox/xxk2fx

看起来起作用了。我们删掉了一些 `setTodos` 调用，并将剩下的那个封装在 Transition 中。我们还在 Todo 组件中创建了一个新的状态变量来跟踪乐观状态。

这比之前使用 `callIds` ref 的例子更简洁，但稍微有点不够直观。另一个问题是，使用 Transition 并不能阻止竞态条件。如果随机设置延迟并疯狂点击复选框，UI 仍然可能不同步。React 文档中对此有一条注释：

> 这是因为更新是异步调度的，React 在跨越异步边界时会丢失对顺序的感知。

好吧，看来我们又没能处理好竞态条件。还没完：

> 这是符合预期的，因为 Transition 内部的 Action 并不保证执行顺序。对于常见用例，React 提供了更高级的抽象，如 `useActionState` 和 `<form>` action，它们会为你处理排序问题。对于高级用例，你需要实现自己的队列和中止（Abort）逻辑来处理。

换句话说，“我们还有另一个 API 能解决这个问题。”

### 示例 5：终极方案

这是最后一个例子，同时使用了 `useActionState` 和 `useOptimistic`。我最初在这里写了一些乱糟糟的代码，但 Ricky [指出](https://bsky.app/profile/ricky.fm/post/3mciteprjzc2q)了一些问题，随后我们对其进行了清理。它确实解决了竞态条件问题，而且代码非常精简。

猜猜 React 是如何保证执行顺序正确的，然后动手试一下。

https://codesandbox.io/s/fcv8qr?file=%2FApp.js&utm_medium=sandpack

请求会被放入队列并按顺序处理，一次只发起一个请求。现在，我们既能处理错误和竞态条件，也能在 Transition 内部更新 UI 了。

## 结论是什么？

事实是，这些新 API 并没有让这些场景变得比以前更容易处理。`useOptimistic` 很有用，但它本身并不能简化乐观 UI 的实现，也无法独立解决竞态条件问题。

你真的需要深入理解 Transition、Action 以及像 `useTransition`、`useActionState` 这样的 Hook 才能正确使用它。

我之所以想写这篇文章，是因为我自己花了很多时间才弄明白。你简直无法想象 Medium 上有多少关于 `useOptimistic` 的文章甚至连 Transition 提都不提。

坦白说，我们应该把这些 API 留给库和框架的作者。我建议你看看 Ricky Hanlon 在 React Conf 上的演讲 [《Async React》](https://www.youtube.com/watch?v=tSO%5FtdnYprM)。在做了一段状况百出、失误连连的演示后，Ricky 说道：

> “所以我认为这里的关键点之一是——你们也看到我在那儿费劲折腾了——老实说，手写所有这些独立的功能简直是件苦差事。”

事实就是这样。React 团队在推荐配合框架使用 React 时引发了很多争议，但这就是原因所在。这些新 API 用起来非常麻烦，它们并没有减少我们要写的样板代码，也没有降低引入 Bug 的可能性。

React 的意图是让框架作者利用这些 API 构建路由和数据层，而让我们这些开发者无需亲自动手处理这些复杂性就能享受到红利。