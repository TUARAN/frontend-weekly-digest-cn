# 一个月手搓 JavaScript runtime

原文：[building a javascript runtime in one month](https://themackabu.dev/blog/js-in-one-month)

作者：[themackabu](https://github.com/themackabu)

日期：2026年1月2日

翻译：[TUARAN](https://github.com/TUARAN)

> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

---

## TL;DR

我做了一个叫 **Ant** 的小型 JavaScript runtime（大概 2MB）。源码、测试和文档都在 GitHub：<https://github.com/themackabu/ant/>。

---

我在 11 月初开始做这个项目时，脑子里只有一个简单念头：

如果能做一个足够小、能嵌进 C 程序里，但又足够完整、能跑真实代码的 JavaScript 引擎，会怎么样？

一个你可以发布出去、却不用捆上几百 MB 的 V8 或 Node 的东西。我以前也试过做“极简版 Deno”的路子，但始终不够。

我没想到这会花一个月；更没想到一个月真的做得出来。但不设 deadline 的项目有个特点：你会一直往前推，推着推着就做出来了。

## 第一周：纯纯生存模式

我是一边做一边学——说白了就是不断试错，然后把每一个错误也一起“发布”出去。最开始的工作只围绕最基本的东西：

- 数值运算
- 字符串内建函数
- 一个非常粗糙的 CommonJS 模块系统

每一次提交都像是在虚无里抢回一点点地盘。

最核心的问题是 **解析（parsing）**。在其它东西能工作之前，你必须先有 parser。而 parser 往往比看起来复杂得多。JavaScript 这种语言尤其“诡异”：

- 自动分号插入（ASI）是规范的一部分，你得处理
- `this` 的绑定会随上下文变化
- `var` 的提升（hoisting）意味着变量会在赋值前就“存在”
- 甚至 `window.window.window` 这种写法都是合法的……

我前几天做的主要是把基本流程跑通，类似一个“能算数、也能调用函数”的计算器。由于动量已经起来了，我就一直继续。

runtime 的核心数据表示大概长这样：

```c
typedef uint64_t jsval_t;
```

在这个 runtime 里，每一个 JavaScript 值都用一个 64 位整数表示：**NaN-boxing**。

IEEE 754 浮点规范有个“洞”：理论上存在 $2^{53}$ 种 NaN，其中绝大多数从来不会被用到。所以我把它们“偷”来用了。

如果把一个 64 位值按 double 解释时它看起来像 NaN，同时 exponent 与 mantissa 又满足你定义的模式，那么你就可以在这些 bit 里塞一个 tag。你有足够空间同时存一个指针和一个类型标签：把对象引用和类型 tag 一起塞进 64 bit，瞬间所有 JS 值都能塞进一个 machine word。

编译期断言也证明了前提：

```c
_Static_assert(sizeof(double) == 8, "NaN-boxing requires 64-bit IEEE 754 doubles");
_Static_assert(sizeof(uint64_t) == 8, "NaN-boxing requires 64-bit integers");
_Static_assert(sizeof(double) == sizeof(uint64_t), "double and uint64_t must have same size");
```

这就成了 runtime 表示“一切”的心脏：每个数字、对象、字符串、函数、Promise、参数、作用域……全部都是一个 `jsval_t`。

没有“带标签联合体”、没有 vtable、也不需要额外分配元数据——只有 bits。为了把它调顺，我迭代了好几天；但一旦跑通，其它东西就会更快更顺。NaN 和 Infinity 当然也有坑，不过通过微调 boxing 布局也能解决。

大约第 4 天我让变量能用了，第 5 天函数能用了，第 6 天循环能跑了。早期提交非常散：箭头函数、IIFE、可选链、空值合并……我就是一边翻 MDN 一边想起啥加啥。

## 垃圾回收（GC）灾难

然后就撞上了真正的硬骨头：**内存管理**。

一个 JavaScript runtime 必须有 GC，你不可能要求用户手动 free 对象。所以到第二周左右，我开始尝试自己实现 GC。

结果是一场噩梦：

- 我加新特性会把 GC 搞崩
- 我修 GC 又会把性能搞崩
- 我试着接入别人写的 GC，又发现集成复杂到不可控

这段时间我非常痛苦。手写的 free-list GC 被我开开关关上百次，每次都能把另一个核心模块弄坏。有些日子我明显已经快崩了：凌晨三点 debug，试图弄清为什么协程栈没被保护好、为什么内存泄漏、为什么加了 JSON 支持之后一切都坏了。

转折点是：**放弃手写 GC，改用 bdwgc**。

这是一个生产级 GC（很多语言都在用）。我把它和自己手写的“带前向引用跟踪的内存压缩”结合起来：它能做 mark、能做 forwarding 的哈希表、能做生产 GC 会做的所有事。

一旦集成上去，内存问题大部分就消失了。我写代码的“语气”也变了：东西开始更稳定地工作起来，我加了 `process` 模块、把错误信息做得更友好——速度从这里开始明显加快。

## Promise / async：另一个野兽

你以为 async/await 很简单，直到你尝试自己实现它。

要实现 async/await，你需要 Promise；Promise 需要 microtask 与定时器；microtask 与定时器又需要事件循环；事件循环还要有地方存异步操作的状态。

我为这件事折腾了好几天：

- 想让 async 工作，你需要协程
- 协程需要调度
- 调度需要事件循环
- 事件循环还要知道协程什么时候结束

如果协程在等 I/O，你不能阻塞；如果某个协程死了，它也不该把整个系统拖死。

你看提交历史就能感受到痛苦：*"async promise pushback"*、*"segfault when event loop empty"*、*"prevent dead task from blocking"*……这些坑都是做到一半才会冒出来的。

更要命的是：JS Promise 不能“简化”。它必须支持 `.then()` 链式调用，必须正确 reject，还要能与 async function 配合——而 async function 本质上是 generator 的语法糖，而 generator 又是 Promise 与回调的语法糖……

大约第 10 天，我引入了 **minicoro** 作为协程支持。这个决定大概救了整个项目。minicoro 很优雅：你定义基于栈的协程，然后让系统在它们之间切换。有了协程，我终于能让 async 真正跑起来。

```c
typedef struct coroutine {
	struct js *js;
	coroutine_type_t type;
	jsval_t scope;
	jsval_t this_val;
	jsval_t awaited_promise;
	jsval_t result;
	jsval_t async_func;
	jsval_t *args;
	int nargs;
	bool is_settled;
	bool is_error;
	bool is_done;
	jsoff_t resume_point;
	jsval_t yield_value;
	struct coroutine *prev;
	struct coroutine *next;
	mco_coro* mco;
	bool mco_started;
	bool is_ready;
} coroutine_t;
```

所有 async 执行相关的信息都塞进了这个结构：scope、`this`、正在等待哪个 promise、是否出错……接着我只需要调度这些东西并管理事件循环。

有了协程以后，Promise 才“成真”：`.then()` 链能跑，`await` 会真正暂停并在之后恢复执行。runtime 的 async 侧开始成形。后面我再补齐 Promise 内建时就快很多了，因为最难的那部分已经解决。

## JavaScript 的“诡异边缘案例”

中间两周基本就是：不停发现 JavaScript 比我预想中更诡异。

不可配置属性、freeze/seal、可选链的边缘语义、严格模式……听起来都不难，但每一个背后都是几十年的规范细节，真实世界的代码会依赖这些行为。

我一个个啃过去：

- 处理冻结/密封对象
- 支持不可配置属性
- 第 10 次修解构
- 给属性查找加 getter/setter 的访问器支持

每天都在撞一个新边缘案例。有时候一天修好几个：我实现一个功能、跑一致性测试、发现三个 bug、修完之后又冒出五个新 bug。

你知道 JavaScript 有多少种方式访问原型链吗？

- `__proto__`
- `Object.getPrototypeOf()`
- `Object.setPrototypeOf()`
- `[[Prototype]]` 内部槽

你得把它们全部做对，而且还要彼此一致。一个看起来很短的提交信息，比如 “use descriptor tables for getters/setters/properties”，背后可能就是几周的工作。

解构看起来也很简单：`const [a, b] = arr`。

但稀疏数组怎么办？对象的可枚举属性怎么办？嵌套解构、默认值、`...rest` 参数怎么办？每次修一个点都像打地鼠：修好这里，那里又坏。

一致性测试在“最好的意义上”非常残酷：每次跑都会失败在一个我根本不知道存在的语义上。然后我修掉它，继续失败在下一个。这个循环发生了几十次。

## 后半程：开始变得“能用”

第二周时，我已经有了一个能执行代码的 JavaScript runtime。它不完整，但它是真的。

然后我开始加那些让它变得“有用”的东西：文件系统、路径工具、URL 模块、以及那个因为 Bun 而变得很有名的内建 HTTP server。突然之间，**真实程序**开始能在 Ant 上跑了。

比如一个 Web 服务器只要写：

```js
import { join } from 'ant:path';
import { readFile } from 'ant:fs';
import { createRouter, addRoute, findRoute } from 'rou3';

const router = createRouter();

addRoute(router, 'GET', '/status/:id', async c => {
	await new Promise(resolve => setTimeout(resolve, 1000));

	const result = await Promise.resolve('Hello');
	const name = await readFile(join(import.meta.dirname, 'name.txt'));

	const base = '{{name}} {{version}} server is responding with';
	const data = { name, version: Ant.version() };

	return c.res.body(`${base.template(data)} ${result} ${c.params.id}!`);
});

async function handleRequest(c) {
	console.log('request:', c.req.method, c.req.uri);
	const result = findRoute(router, c.req.method, c.req.uri);

	if (result?.data) {
		c.params = result.params;
		return await result.data(c);
	}

	c.res.body('not found: ' + c.req.uri, 404);
}

console.log('started on http://localhost:8000');
Ant.serve(8000, handleRequest);
```

运行起来就是：

```bash
$ ant examples/server/server.js
started on http://localhost:8000

$ curl http://localhost:8000/status/world
Ant 0.3.2.6 server is responding with Hello world!
```

这就是“真 JavaScript”跑在 Ant 里：async/await、文件 I/O、HTTP、带参数路由、网络、字符串操作。

之后节奏更快：每天更自信，修更多 bug，加更多特性。然后到了“冷门但必须”的阶段：Proxy、Reflection、Symbol，甚至 class 私有字段/方法。它们也许很少人用，但规范里写了就得支持。

我最喜欢的一类能力之一是 **Atomics**：

```js
const sharedBuffer = new SharedArrayBuffer(256);

const int32View = new Int32Array(sharedBuffer);
Atomics.store(int32View, 0, 42);
const value = Atomics.load(int32View, 0);
console.log('stored 42, loaded:', value);

Atomics.store(int32View, 1, 10);
const oldValue = Atomics.add(int32View, 1, 5);
console.log('old value:', oldValue);

Atomics.store(int32View, 2, 100);
const result = Atomics.compareExchange(int32View, 2, 100, 200);
console.log('exchanged, new value:', Atomics.load(int32View, 2));
```

```bash
$ ant examples/atomics.js
stored 42, loaded: 42
old value: 10
exchanged, new value: 200
```

## 最后一周：多米诺骨牌一样倒下

当 Ant 的核心 runtime 能跑、GC 稳了、Promise 也通了之后，其它东西就像多米诺骨牌一样：小问题被修掉、缺的方法补齐、边缘语义逐个处理。

我重新加回了数组 length 校验，修了对象的属性缓存失效逻辑；为了优化 hash 性能又掉进“复杂算法 + 安全影响”的兔子洞——因为我已经在打磨一个“能工作的东西”。

到第 28 天，我给一个真的能用的 runtime 收尾：支持 async/await、靠谱的内存管理、网络、文件 I/O、并通过 ES1–ES5 的一致性测试，还混搭了一堆更现代的特性。

我甚至在别人提醒之后才“想起来”打开 LTO 和一些编译器 flag 😅

![uzaaft](https://themackabu.dev/static/bobr-pIqoDMXZ.png)

## 最终结果

一个月后，Ant 作为 JavaScript runtime：

- 通过 javascript-zoo 测试套件中 ES1 到 ES5 的每一个一致性测试（25 年规范跨度的完整兼容）
- 实现 async/await，并具备正确的 Promise 与 microtask 行为
- 拥有一个真的能用、且不漏内存的 GC
- 基于 libuv 运行 Web 服务器（和 Node 类似的网络底座）
- 支持通过 FFI 调用系统库，例如：

```js
import { dlopen, suffix, FFIType } from 'ant:ffi';

const sqlite3 = dlopen(`libsqlite3.${suffix}`);

sqlite3.define('sqlite3_libversion', {
	args: [],
	returns: FFIType.string
});

console.log(`version: ${sqlite3.sqlite3_libversion()}`);
```

```bash
$ ant examples/ffi/basic/sqlite.js
version: 3.43.2
```

- 支持读写文件与异步 I/O
- 支持正确的作用域、提升、变量遮蔽
- 支持 class、箭头函数、解构、展开、模板字符串、可选链
- 覆盖一些多数人根本不会想到的“怪边缘”：`__proto__` 赋值、属性描述符、不可配置属性、冻结/密封对象（可参考测试：[`tests/__proto__.js`](https://github.com/themackabu/ant/blob/master/tests/__proto__.js)）
- 实现 ES Module（import / export）
- 支持 Symbol、Proxy、Reflect、WeakMap/WeakSet、Map/Set
- 支持共享内存与 Atomics 并发原语

把这些串起来，你会发现你面对的已经几乎是一个“完整的 JavaScript runtime”，不太像玩具。

## 代价

我不知道代价是什么。

可能是睡眠，可能是健康，可能是本来可以拿去做任何其它事情的大把时间。

有些日子我连续工作 10+ 小时；有些日子一天 20+ commits。项目不会减速，只会加速：每天更自信、更快、修更多 bug、加更多特性。

到最后，我开始撞上那些必须去读 ECMAScript 规范、去理解 V8 行为、去对比其它引擎怎么处理某个怪角落的工作。改符号计数、优化 class、把内部属性迁移到 slots（像 V8 那样）……这类优化正常应该等代码稳定后再做，但因为地基已经稳了，我在最后一周反而有了余力去做。

## 发布后：优化阶段

首个 release 是 11 月 26 日。之后是一段沉默——那种“发完版本之后就没声了”的沉默。直到 12 月 20 日左右，开发又恢复。

这一次不同：runtime 能跑、能过测试，但总有更多优化空间。xctrace 让我看清什么才是真正的瓶颈。12 月下旬和 1 月初的提交呈现一种模式：找到瓶颈 → 修复 → 测量提升。

![fast](https://themackabu.dev/static/flamegraph-VIUhZt3-.png)

我先为 typed array 加了 arena allocator。之前 typed array 散落在 heap 的各处；我把它们集中起来，加速分配并改善 cache locality。

然后我把 getter/setter/property 从“每个 descriptor 单独分配”改成“descriptor table 批处理”：更少的分配、更少的指针追逐。

让 `.` 运算符支持 property reference 也很烦：每次查属性都要全量解析；于是我加了 reference table 跳过重复工作。

我很喜欢 dispatch table。我把 FFI、JSON 等路径改为 computed goto，让 CPU 直接跳到正确的 handler：少一次分支、少一次查找。

把 properties 迁到 slots 是最侵入的一次重构。对象之前用的是灵活但慢的属性系统；slots 则是按对象类型固定结构，让 runtime 能做更多假设，减少 indirection。

某个时刻我开始拿它对比 Node：跑同样 benchmark，Ant 表现如何？结果开始变得很好——好到你会想：我是不是能在某些点上赢 Node？

![bunnerfly wow](https://themackabu.dev/static/discord-BMuno760.png)

优化 Ant 的过程中我会保留一些可工作的 snapshot：如果某次优化把东西搞坏了，我还能退回到一个稳定点。于是就能持续小步推进：每次提交都比上一次快一点。有些优化有效，有些没用，但整体模式始终成立：profile → optimize → measure → commit。

然后是 GC 的改进。在最初那一个月里 bdwgc 集成得挺好，但在优化阶段的某个时刻它被禁掉了，runtime 就开始漏内存。我重新加回“可延迟 GC”的机制，并把旧 GC 的大部分代码取消注释。

但这次不是老办法：我做的是一个 mark-copy + compact 的 GC，能真正做内存碎片整理。旧 GC 的问题是它在错误的时机运行，导致热路径卡顿。所以我让它“可延迟”：在逻辑工作单元之间再收集；同时用前向引用跟踪保证对象移动后指针不坏。GC 回来了，但更聪明：它会等到合适的点暂停，并在运行时压缩堆。

## 为什么会做这件事

老实说，我也不知道。

也许是赌气？也许是想证明点什么？也许是纯粹的执念。

那种“进入心流”的状态：你写着写着，八小时就过去了，已经凌晨四点，然后你把代码 commit 掉，第二天又继续。

这个项目之所以存在，是因为我脑子里某个东西决定“它必须存在”，并且直到它真的存在之前都不会停。

它并不完美。代码里可能还有没发现的 bug；可能还有没做的性能优化；可能还有漏掉的规范角落。

但它能跑：你可以写真实 JavaScript，它会执行；你可以用 async/await；你可以写服务器；你可以拿它去做真实事情。

如果你曾经好奇：一个人如果足够执着、又不睡觉，能做到什么？答案就是：做出一个规范兼容的 JavaScript 引擎。

源码、测试与文档都在：<https://github.com/themackabu/ant/>。
