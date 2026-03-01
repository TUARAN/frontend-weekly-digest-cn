> 原文：[It’s about to get a lot easier for your JavaScript to clean up after itself](https://piccalil.li/blog/its-about-to-get-a-lot-easier-for-your-javascript-to-clean-up-after-itself/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 让 JavaScript 更容易「善后」的新能力

JavaScript 开发者大致可以分成两类：一类偏“随性”，一类偏“整理控”。作者说自己在现实生活里并不整洁，但写 JavaScript 时会非常在意秩序：默认使用 `const`、重视作用域，并希望代码在完成工作后把资源也清理干净。

也正因为如此，他对 TC39 的 [Explicit Resource Management（显式资源管理）提案](https://github.com/tc39/proposal-explicit-resource-management)非常兴奋：这个提案不仅把许多已有实践系统化，还希望给 JavaScript 提供统一、可靠的资源清理机制。

本文会先介绍“隐式资源管理”，再进入“显式资源管理”的核心能力：`[Symbol.dispose]` 与新的 `using` 声明。

## 隐式资源管理（Implicit resource management）

如果你用过 `WeakSet` 或 `WeakMap`，其实已经见过一种“隐式资源管理”的思想。

`WeakSet` / `WeakMap` 的 “weak（弱引用）”含义是：它们对值（或 key）的引用不会阻止垃圾回收（GC）。当某个对象在程序里不再被其他地方引用时，它就有机会被回收；一旦被回收，`WeakSet`/`WeakMap` 里对应的条目也可能随之消失。

因此，`WeakSet`/`WeakMap` 只能存放可被 GC 的值：对象引用，以及**未注册到全局 Symbol 注册表**的 Symbol。比如尝试把 `true` 这种原始值放进 WeakSet，会报错：

```js
const theWeakSet = new WeakSet([true]);
```

`WeakMap` 的典型用途是：给某个对象“外挂”一些关联数据，但又不把数据真的挂在对象本身上，同时也不阻止对象被 GC：

```js
const theObject = {};
const theWeakMap = new WeakMap([[theObject, "A string, say, describing the object."]]);

console.log(theWeakMap.get(theObject));
```

看上去很美：对象没了，关联数据也应该跟着消失——像极了“代码会自己打扫卫生”。

不过作者也提醒：**垃圾回收何时发生是不确定的**。也就是说，即便对象已经没有其他引用，你也不能保证它立刻被回收；因此 WeakMap 里的条目也不一定马上消失。

隐式资源管理的好处是“你不用管”；坏处是“你也管不了”。

## 显式资源管理（Explicit resource management）

显式资源管理并不是让你手动管理内存（GC 依然是引擎的事），它解决的是另一类更常见、更工程化的问题：

> 当某个资源“用完了”，我们希望能**确定**执行一组清理动作。

这里的“资源”可以理解为：有明确“结束状态”的对象。例如：文件句柄、WebSocket 连接、流、锁、订阅、观察者、以及各种需要 `close()` / `disconnect()` / `abort()` 的东西。

作者用 generator 举例，说明“生命周期结束时执行清理”在 JS 里并不陌生：generator 的 `done` 会在迭代结束时变成 `true`；并且你可以在 generator 内用 `try...finally` 来保证收尾逻辑被执行。

一个简化示例：

```js
function* generatorFunction() {
	try {
		yield true;
		yield false;
	} finally {
		console.log("All done.");
	}
}

const generatorObject = generatorFunction();

console.log(generatorObject.next());
console.log(generatorObject.next());
console.log(generatorObject.next());
```

如果你提前调用 `return()`，也会走到 `finally`：

```js
console.log(generatorObject.return());
```

作者把这种“我明确地让它现在结束并清理”的方式称为**命令式（imperative）资源管理**：比如你手动调用 `close()`、`abort()`、`disconnect()`。

问题在于：这些清理方法在不同 API 里名字五花八门，而我们做的事却高度一致——“把它关掉、清理掉”。于是提案引入了一个统一约定：

- 对需要清理的资源，提供一个标准方法：`[Symbol.dispose]()`。

以 generator 为例，它可以把 `[Symbol.dispose]` 标准化为对 `return()` 的包装：

```js
console.log(generatorObject[Symbol.dispose]());
```

这在 generator 场景里看起来变化不大，但意义很大：它为“任何需要清理的资源”提供了统一入口。

## `using`：声明式资源管理

有了统一的 `[Symbol.dispose]()`，提案就可以再向前一步：提供**声明式（declarative）资源管理**。

也就是：不再靠“记得手动调用 dispose”，而是把资源的清理动作绑定到作用域生命周期上。

提案为此引入了一个新的变量声明关键字：`using`。

- `using` 声明是块级作用域（和 `const` / `let` 类似）。
- `using` 声明的绑定不可重新赋值（像 `const`）。
- 当代码执行离开该作用域时，引擎会自动调用资源的 disposer，即 `resource[Symbol.dispose]()`。

一个最小示例：

```js
{
	using theObject = {
		[Symbol.dispose]() {
			console.log("All done.");
		},
	};
	// 离开作用域时，会自动输出 "All done."
}
```

需要注意：`using` 不是“更酷的 const”。它只能用于：

- `null` / `undefined`
- 或者拥有 `[Symbol.dispose]()` 的对象

比如这样会报错（因为 `{}` 没有 disposer）：

```js
{
	using theObject = {};
}
```

并且 `using` 必须处在某个明确的作用域中（块、函数体、静态初始化块、for/for-of/for-await-of 的初始化部分，或模块顶层），否则它就没有“离开作用域”这一刻，也就失去了意义。

回到文章前面那个“把文件开着就走了”的 generator 场景：如果用 `using` 来声明 generator 对象，那么在离开作用域时就会自动触发清理：

```js
{
	function* generatorFunction() {
		console.log("Open a file.");
		try {
			yield true;
			yield false;
		} finally {
			console.log("Close the file.");
		}
	}

	using generatorObject = generatorFunction();
	console.log(generatorObject.next());
}
```

同理，如果你写一个类实例需要“用完自动收尾”，也可以直接实现 `[Symbol.dispose]()`：

```js
class TheClass {
	theFile;

	constructor(theFile) {
		this.theFile = theFile;
		console.log(`Open ${theFile}`);
	}

	[Symbol.dispose]() {
		console.log(`Close ${this.theFile}`);
	}
}

const theFile = "./some-file";

if (theFile) {
	using fileOpener = new TheClass(theFile);
	console.log(`Do things with ${fileOpener.constructor.name}, then...`);
}
```

## 现状与落地

作者提到：该提案已进入 TC39 Stage 3（推荐实现），并且大多数浏览器已经支持（Safari 仍缺席）。你可以在 caniuse 上查看：

- https://caniuse.com/mdn-javascript_builtins_symbol_dispose

当然，Stage 3 仍然意味着“可能还有语法细节会变”，所以更适合现在就开始在实验/非生产环境熟悉它。

作者最后把这件事总结为一种很朴素、但非常工程化的收益：

> JS 终于开始从“全靠自觉的清理”走向“语言级别帮助你不忘记清理”。

文末也感谢了 Ron Buckton 对提案和文章的帮助与审阅。

