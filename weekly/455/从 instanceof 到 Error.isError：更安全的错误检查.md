原文：From instanceof to Error.isError: safer error checking in JavaScript  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 从 instanceof 到 Error.isError：在 JavaScript 中更安全的错误检查

很长一段时间里，JavaScript 开发者一直依赖 `instanceof` 来判断：“这是不是一个错误（Error）？”

```js
err instanceof Error // true...usually
```

在一般代码里，这样用没问题。你很少会特意去想它。但一旦某些值来自其他 realm（执行域），事情就会变得诡异，而且失败是“静默”的。

一切看起来都“正常”，直到你的日志流水线悄悄把真实的错误给丢了。

我在排查一个错误上报问题时就遇到过：这个问题只在生产环境出现。本地和预发都没事。但在生产里，有些错误就是……空的。

## 跨 realm 问题

JavaScript 并不是只运行在一个全局环境中。它有 **realms**（执行域），也就是彼此隔离的 JavaScript 世界：各自拥有自己的全局对象，以及像 `Object`、`Array`、`Error` 这样的内建对象。

两个值都可能是真实的错误，但如果它们是在不同的 realm 中创建的，JavaScript 会把它们当作不同的东西。这属于那种“这为什么会存在？”的时刻——第一次被它坑到时尤其如此。

## 为什么 `instanceof` 会失效

想一个使用 iframe 的例子：

```js
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);

const err = new iframe.contentWindow.Error('Oops!');
err instanceof Error; // false
```

乍一看这个结果很离谱：`err` *明明*就是一个错误。

说实话：我很多年里到处都在用 `instanceof Error`，从来没质疑过。它在我机器上从不出问题，那为什么要怀疑？

关键在于：它不是用 *你这个 realm* 的 `Error` 构造器创建出来的，而是来自 iframe 的 `Error`。由于 `instanceof` 会针对某个 realm 去沿着原型链做检查，所以这个判断就会失败。`instanceof` 并没有错，只是它的适用范围被限制在它自己的世界里。

这类 bug 往往只有在你把代码发布之后才会出现：

- Workers 和 iframes  
- 浏览器扩展  
- SSR 和测试运行器  
- 任何跨执行上下文的场景  

如果你曾经疑惑为什么某个日志系统突然不再显示堆栈信息，这种检查方式往往就是原因之一。

我见过它在生产日志里表现为“神秘的空错误对象”。错误确实存在，但这个判断就是决定它“不算”。

## `Error.isError()` 登场

JavaScript 现在有了 `Error.isError(value)`，**它提供了一种 realm-safe（跨 realm 安全）的方式来回答：“这到底是不是一个错误？”** 这是那种事后看会觉得理所当然的 API。

它保证：

- 对真实的 `Error` 对象返回 `true`，即使跨 realm 也一样  
- 对非错误值返回 `false`  
- 即使输入很奇怪或出乎意料，也绝不会抛异常  

API 本身很简单：

```js
Error.isError(value)
```

其行为也符合预期：

```js
Error.isError(new Error('Oops!'))                 // true
Error.isError(new TypeError('Bad type'))          // true
Error.isError('just a string')                    // false
Error.isError({ message: 'Not really an error' }) // false
Error.isError(Object.create(Error.prototype))     // false
```

最后一种情况很关键。尽管这个对象继承自 `Error.prototype`，**但它从未被创建为一个真正的错误对象**。`Error.isError()` 会正确地把它拒绝掉。

跨 realm 的场景现在也会按大多数开发者的直觉工作：

```js
const err = new iframe.contentWindow.Error('Oops');
Error.isError(err); // true
```

在底层，引擎会检查真实错误对象携带的某个内部“brand”（标记），这个东西在用户代码里是访问不到的。这也解释了为什么我们过去的各种替代方案总是有点……不够精确。

还有一个实用细节值得一提：在浏览器中，`Error.isError()` 对 `DOMException` 对象也会返回 `true`。尽管从通常的原型关系来看，`DOMException` 并不是 `Error` 的子类，但平台会把它当作真实错误。对于日志记录或错误处理代码来说，这通常正是你想要的行为。

自定义错误类也能按预期工作：

```js
class CustomError extends Error {}

const err = new CustomError('Custom fail');
Error.isError(err); // true
```

只要你的自定义错误正确继承自 `Error`，它就会被视为真实错误，即使跨 realm 也一样。

## 什么时候该用它？

如果你的代码需要处理来自自身执行上下文之外的错误，`Error.isError()` 会是更安全的默认选择。

常见例子包括：

- 全局错误处理器和日志工具  
- 测试框架  
- Web 扩展  
- SSR / edge 运行时  
- Workers、iframes，**基本上任何跨边界的场景**  

在这些情况下，`instanceof Error` 可能会悄悄漏掉真实错误。它甚至比直接抛异常更糟，因为你往往直到下游哪里坏了才发现。

这也意味着你可以不再依赖这种脆弱的检查方式：

```js
err &&
typeof err === 'object' &&
'message' in err &&
'stack' in err
```

你不必彻底禁用 `instanceof`。在边界清晰、范围很小的代码里它没问题。一旦涉及跨边界，`Error.isError()` 就是更可靠的检查方式。

☝🏻 顺便说一句...

当你能可靠地识别真实的错误对象之后，下一个挑战就是：在它们穿过你的代码时，如何保留有用的上下文信息。[`Error.cause` API](https://allthingssmitty.com/2025/11/10/error-chaining-in-javascript-cleaner-debugging-with-error-cause/) 正是为此而生的。

## 不用大重构也能采用

你不需要重写整个代码库才能开始使用它。一个小封装就能获得大部分收益：

```js
function isError(value) {
  return typeof Error.isError === 'function'
    ? Error.isError(value)
    : value instanceof Error;
}
```

在日志、框架胶水代码等边界密集的位置使用它，而不是到处撒 `instanceof Error`。

这种做法能给你带来：

- 在现代运行时中具备跨 realm 安全的行为  
- 在旧环境里有一个还算靠谱的兜底  
- 未来当支持普及时，只需要在一个地方更新  

从应用的边缘开始。跨 realm 的错误最容易从那里潜入。

## 今天就能用吗？

`Error.isError()` 在现代环境中已得到支持，Safari 仍是部分支持：

- ✅ Chrome 134+、Firefox 138+、Edge 134+
- ✅ Node.js 24.3+
- ⚠️ Safari 18.4

做特性检测就够了：

```js
if (typeof Error.isError === 'function') {
  Error.isError(err);
} else {
  // Fallback, not realm safe
  err instanceof Error;
}
```

## 你意想不到的 bug

如果你的代码会跨越边界，`instanceof` 就是个“踩雷点”。而 `Error.isError()` 才是我们一直以来真正想要的行为。

这是一个很小的改动，却能消除一整类恼人的 bug，而且非常划算。只要你的代码会涉及 workers、iframes、扩展，或者服务端边界，把它切换到 `Error.isError()` 就是轻松的收益：简单一改，就少了一件可能在背后悄悄出错的事情。

- [JavaScript](https://allthingssmitty.com/tags/javascript)

[上一篇文章](https://allthingssmitty.com/2026/02/02/explicit-resource-management-in-javascript/)

请启用 JavaScript 以查看由 Disqus 提供支持的[评论](https://disqus.com/?ref_noscript)。