原文：[Explicit resource management in JavaScript](https://allthingssmitty.com/2026/02/02/explicit-resource-management-in-javascript/)
翻译：TUARAN
欢迎关注 [{{前端周刊}}](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# JavaScript 的显式资源管理


（原文作者站点：allthingssmitty.com）

写 JavaScript 时，只要你“打开/申请”了某种资源（文件、流、锁、数据库连接……），就意味着你也必须记得在合适的时机清理它。现实是：我们经常会漏掉。

过去 JavaScript 只能把这个问题交给开发者自己处理：用 `try/finally` 确保清理逻辑一定执行。它能用，但啰嗦、重复，并且随着资源数量增加，越来越容易在重构或边界情况下出错。

**显式资源管理（Explicit Resource Management）** 为 JavaScript 引入了语言层面的能力：你可以声明“这个东西需要清理”，并让运行时保证在作用域结束时执行清理。

## 我们很容易把清理写错

典型写法是这样：

```js
const file = await openFile('data.txt');

try {
  // 使用 file
} finally {
  await file.close();
}
```

当你需要管理多个资源时，复杂度会迅速增加：

```js
const file = await openFile('data.txt');
const lock = await acquireLock();

try {
  // 同时使用 file 和 lock
} finally {
  await lock.release();
  await file.close();
}
```

这时你得考虑：清理顺序、异常路径、早返回、未来重构时是否仍然正确……心智负担不断攀升。

## `using`：把清理交给运行时

核心语义是：用 `using` 声明一个资源，它会在**离开当前作用域时自动清理**。

```js
using file = await openFile('data.txt');

// 使用 file

// 作用域结束时自动 close
```

你不再需要显式写 `try/finally`；清理与“生命周期（lifetime）”绑定，而不是与控制流细节绑定。

## 清理机制：`Symbol.dispose` 与 `Symbol.asyncDispose`

资源需要“选择加入”（opt-in）：实现特定的 well-known symbol：

- 同步清理：`Symbol.dispose`
- 异步清理：`Symbol.asyncDispose`

例如：

```js
class FileHandle {
  async write(data) {
    /* ... */
  }

  async [Symbol.asyncDispose]() {
    await this.close();
  }
}
```

注意：`using` 并不会“魔法般地替你关闭文件”，它做的是把清理的约定标准化，避免每个库各造各的清理协议。

## 什么时候需要 `await using`

如果清理本身是异步的（例如要 `await file.close()`），就应该用 `await using`：

```js
await using file = await openFile('data.txt');

// 异步工作

// 作用域结束时，运行时会 await 资源的 disposal
```

而对同步资源（比如某些锁/内存结构），可以用普通 `using`。

## 多资源管理：自动按栈逆序清理

这类特性真正“值回票价”的地方在于：当你需要管理多个资源时，它能自动保证顺序。

```js
await using file = await openFile('data.txt');
using lock = await acquireLock();

// work
```

清理会按“后进先出”的顺序执行：

1) 释放 `lock`
2) 关闭 `file`

## 作用域就是重点

`using` 的作用域和 `const/let` 一样明确：

```js
{
  await using file = await openFile('data.txt');
  // file 在这里可用
}

// file 在这里被 dispose
```

它推动你写出更紧凑的作用域，让资源生命周期直接体现在代码结构上。

## `using` 不够用时：`DisposableStack` / `AsyncDisposableStack`

有些情况下，你不想/不方便通过新增块作用域来管理资源（例如条件分支、旧代码改造）。这时可以用 stack：

```js
const stack = new AsyncDisposableStack();

const file = stack.use(await openFile('data.txt'));
const lock = stack.use(await acquireLock());

// work

await stack.disposeAsync();
```

可以把它理解为：`using` 是最干净的声明式用法；stack 是更灵活的“逃生舱”。

## 不只是后端问题

这不只是文件/数据库连接的故事。在前端与平台 API 中也经常出现“必须清理”的资源：

- Web Streams
- `navigator.locks`
- Observer / subscription
- IndexedDB transaction

凡是你写过 `subscribe()/unsubscribe()`、`open()/close()` 之类的代码，都能从“生命周期显式化”里受益。

## 兼容性与落地

原文提到：截至 2026 年初，Chrome 123+、Firefox 119+、Node.js 20.9+ 已支持这些能力；Safari 仍在推进中。

## 小结

显式资源管理不会取代 `try/finally`（你仍会在需要精细控制时使用它），但它提供了一个更好的默认方案：

- 更少样板代码
- 更少资源泄漏
- 更清晰的意图与更稳定的清理顺序

随着 JavaScript 逐渐承担更多“系统级”的职责，这种特性从“锦上添花”变成了“迟早需要的地基”。
