原文：Useful JavaScript Additions in ECMAScript 2026
链接：<https://www.telerik.com/blogs/useful-javascript-additions-ecmascript-2026>
翻译：TUARAN

# ECMAScript 2026 中有用的 JavaScript 新增能力

![Peter Mbanugo](https://www.telerik.com/sfimages/default-source/blogs/author-images/peter-mbanugo.jpg?sfvrsn=7b2c735_1 "Peter Mbanugo") [Peter Mbanugo](https://www.telerik.com/blogs/author/peter-mbanugo)

发布于：2026 年 8 月 17 日 | 阅读约 9 分钟 | [Web](https://www.telerik.com/blogs/web) | [0 条评论](https://www.telerik.com/blogs/useful-javascript-additions-ecmascript-2026#disqus_thread)

## 目录

- [在值到达时构建 Map](#在值到达时构建-map)
- [将异步可迭代对象收集为数组](#将异步可迭代对象收集为数组)
- [将多个可迭代对象合并为一个惰性序列](#将多个可迭代对象合并为一个惰性序列)
- [在 JSON 中保留大整数](#在-json-中保留大整数)
- [在 Base64 或 Hex 与字节之间转换](#在-base64-或-hex-与字节之间转换)
- [跨 Realm 识别 Error 对象](#跨-realm-识别-error-对象)
- [更准确地求和浮点数](#更准确地求和浮点数)
- [总结](#总结)
- [延伸阅读](#延伸阅读)

对 JavaScript 开发者来说，ECMAScript 2026 标准中有用的部分并不是语言的戏剧性变革，而是**几个常见用例终于有了直接对应的名称**。

JavaScript 每年都会获得一个新的语言标准。有些版本会引入改变程序写法或执行方式的语法。[ECMAScript 2026](https://ecma-international.org/publications-and-standards/standards/ecma-262/)（ES17）带来了一批实用特性，我们将逐一介绍。这些特性为 JavaScript 开发者原本用小型辅助函数、重复检查或容易遗漏的变通方案处理的任务，提供了专门的 API。

本文聚焦那些能够**减少代码量、让意图更清晰、或防止微妙错误**的新增能力。

> **运行时支持：** 这些 API 并非同时出现在所有运行时中。请查看每个链接 MDN 页面上的**浏览器兼容性**表格，确认你支持的浏览器和运行时。如果某个 API 不可用，请使用经过测试的兜底方案。

![Useful JavaScript Additions in ECMAScript 2026](https://www.telerik.com/sfimages/default-source/blogs/2026/2026-08/useful-javascript-additions-in-ecmascript-2026.png?sfvrsn=c4d86b5a_2 "Useful JavaScript Additions in ECMAScript 2026")
*图片由 AI 生成*

## 在值到达时构建 Map

在[我关于数组分组的文章](https://pmbanugo.me/blog/array-grouping-in-javascript)中，我展示了使用 `Object.groupBy()` 和 `Map.groupBy()` 对相关项进行分组的简单方式。这两个方法都从一个已经存在的集合开始，但如果你想对流式数据做同样的事呢？

例如，下面这段代码按部门对异步流中的员工进行分组：

```js
const employeesByDepartment = new Map();

for await (const employee of employeeStream) {
  if (!employeesByDepartment.has(employee.department)) {
    employeesByDepartment.set(employee.department, []);
  }

  employeesByDepartment
    .get(employee.department)
    .push(employee);
}
```

这段代码并不复杂，但 `has()`、`set()` 和 `get()` 的序列是我们真正关心的操作——把新员工加入部门——周围的样板代码。

ECMAScript 2026 新增了 [`Map.prototype.getOrInsert()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsert) 和 [`Map.prototype.getOrInsertComputed()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsertComputed)。这些方法返回指定键对应的值。如果不存在，则插入一个以该键和给定默认值组成的新条目，并返回插入的值。

当默认值应该惰性创建时——尤其是创建成本高、有副作用、或分配可变对象（如数组）时——你应该使用 `getOrInsertComputed()`。使用 computed 版本后，前面的代码变成：

```js
const employeesByDepartment = new Map();

for await (const employee of employeeStream) {
  employeesByDepartment
    .getOrInsertComputed(employee.department, () => [])
    .push(employee);
}
```

结果简单且紧凑。

## 将异步可迭代对象收集为数组

异步生成器是隐藏分页的实用方式。调用者可以消费一个序列，而无需知道某一页响应在哪里结束、下一页从哪里开始。例如：

```js
async function* fetchAllIssues(url) {
  while (url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const page = await response.json();

    yield* page.items;
    url = page.next;
  }
}
```

要把所有结果收集到一个数组，通常需要写一个循环：

```js
const issues = [];

for await (const issue of fetchAllIssues("/api/issues")) {
  issues.push(issue);
}
```

[`Array.fromAsync()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync) 方法可以直接完成这个收集：

```js
const issues = await Array.fromAsync(
  fetchAllIssues("/api/issues"),
);
```

是不是更短、更简单？

尽管名字如此，这个方法也接受同步可迭代对象和类数组对象。它会逐个 await 这些来源的值。

`Array.fromAsync()` 也接受映射函数，并且运行时会等待映射结果完成后再读取下一个值。例如，可以调整前面的代码，让它只返回 issue 标题：

```js
const issueTitles = await Array.fromAsync(
  fetchAllIssues("/api/issues"),
  (issue) => issue.title,
);
```

基于这个例子，可能会误以为 `Array.fromAsync()` 会并发运行独立操作。例如：

```js
// 请求一个接一个启动。
const sequential = await Array.fromAsync(urls, fetchJson);

// 所有请求在任何一个被 await 之前就已经发起。
const concurrent = await Promise.all(urls.map(fetchJson));
```

当独立操作可以同时运行时，应使用 `Promise.all()`。当来源或映射步骤可能是异步的，并且你希望惰性、有序地消费时，再使用 `Array.fromAsync()`。另外请记住这个方法返回的是包含所有结果的数组。如果你想增量处理一个可能永不结束的大流，请继续使用 `for await...of` 循环。

## 将多个可迭代对象合并为一个惰性序列

有时几个可迭代来源应该表现得像一个连续序列。假设一个应用先检查内置路由，然后是插件注册的路由，最后是一个兜底路由。你可以把所有内容展开到一个新数组中，但这会急切地消费每个可迭代对象并分配另一个集合。

生成器可以保持序列的惰性：

```js
function* allRoutes() {
  yield* builtInRoutes;
  yield* pluginRoutes;
  yield fallbackRoute;
}
```

另一方面，[`Iterator.concat()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/concat) 无需自定义生成器即可表达相同操作：

```js
const allRoutes = Iterator.concat(
  builtInRoutes,
  pluginRoutes,
  [fallbackRoute],
);
```

结果先产出内置路由，然后是插件路由，最后是兜底路由。值只在消费者推进迭代器时才被拉出；`Iterator.concat()` 不会先把它们收集到一个新数组中。每个参数必须是可迭代对象，因此示例把 `fallbackRoute` 包在了数组里。

`Iterator.concat()` 方法只适用于同步可迭代对象，不能合并异步可迭代对象。

## 在 JSON 中保留大整数

聊天平台通常会把 snowflake ID 作为消息或其他数据的一部分。这些通常是 64 位整数，可能超过 `Number.MAX_SAFE_INTEGER`，因此如果把它们解析为 JSON 数字，可能会静默丢失精度。考虑这个响应：

```js
const payload = `{
  "messageId": 1183028002140618753,
  "channel": "general"
}`;

const event = JSON.parse(payload);

console.log(event.messageId);
// 1183028002140618800
```

打印出来的值与 JSON 文本中的值不同。

ECMAScript 2026 为 `JSON.parse()` 的 reviver 函数增加了第三个参数，名为 `context`。当值是解析器产生的未修改原始值时，`context.source` 包含原始 JSON 文本。我们可以利用这一点将其解析并转换为正确的类型，例如 `BigInt`。

下面是前面示例的重写：

```js
const event = JSON.parse(
  payload,
  (key, value, context) => {
    if (key === "messageId") {
      return BigInt(context.source);
    }

    return value;
  },
);

console.log(event.messageId);
// 1183028002140618753n
```

当 reviver 收到 `value` 时，`Number` 已经丢失了精度。但 `context.source` 让代码可以忽略这个受损的值，从原始数字构建 `BigInt`。

序列化则面临相反的问题：`JSON.stringify()` 在遇到 `BigInt` 时会抛出异常，除非你处理它。新的 [`JSON.rawJSON()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/rawJSON) 方法让 `JSON.stringify` 的 replacer 函数能够为原始值提供有效的 JSON 文本。`JSON.rawJSON()` 方法创建一个包含 JSON 文本的 “raw JSON” 对象。

下面是 `JSON.stringify()` 和 `JSON.rawJSON()` 一起使用的示例：

```js
const json = JSON.stringify(
  event,
  (key, value) =>
    typeof value === "bigint"
      ? JSON.rawJSON(value.toString())
      : value,
);

console.log(json);
// {"messageId":1183028002140618753,"channel":"general"}
```

两者结合，程序可以先把原始数字恢复为 `BigInt`，再把这些数字序列化回 JSON 而不会四舍五入。

使用这些 API 并不意味着你应该把所有整数都变成 `BigInt`。计数、价格、数据库标识符都可能以 JSON 数字形式出现，但它们不一定属于同一个底层 JavaScript 类型。需要注意的是，解析器只在未修改的原始值上暴露 `context.source`，而 `JSON.rawJSON()` 只接受表示原始值的有效 JSON 文本。

## 在 Base64 或 Hex 与字节之间转换

二进制数据常常不必要地绕道字符串。在语言中，字节与其他形式之间的转换并不是一种自然的接口。我记得 Bun 是我用过的第一个内置了字节与各种数据类型转换 API 的 JS 运行时。幸运的是，2026 年的 ECMAScript 标准带来了以下字节转换函数：

- `Uint8Array.prototype.toBase64`
- `Uint8Array.prototype.toHex`
- `Uint8Array.prototype.setFromHex` 及其静态形式 `Uint8Array.fromHex`
- `Uint8Array.prototype.setFromBase64` 及其静态形式 `Uint8Array.fromBase64`

它们有什么用呢？

假设你想创建一个 URL 安全的 token。代码可能是这样：

```js
const bytes = crypto.getRandomValues(new Uint8Array(32));

const token = btoa(String.fromCharCode(...bytes))
  .replaceAll("+", "-")
  .replaceAll("/", "_")
  .replace(/=+$/, "");
```

程序从字节开始，先转成临时字符串，再编码，然后调整字母表和填充。它能工作，但这些中间步骤都没有表达真正的任务：把这些字节编码成 base64url。

我们可以使用 [`Uint8Array.prototype.toBase64()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64) 方法来完成转换：

```js
const bytes = crypto.getRandomValues(new Uint8Array(32));

const token = bytes.toBase64({
  alphabet: "base64url",
  omitPadding: true,
});
```

反向转换同样简单：

```js
const decoded = Uint8Array.fromBase64(token, {
  alphabet: "base64url",
});
```

`setFromBase64()` 和 `setFromHex()` 方法会写入现有数组，并返回一个包含 `read` 和 `written` 计数的对象。与 `fromBase64()` 和 `fromHex()` 不同，它们适用于需要控制内存分配、解码到预分配缓冲区或跟踪多少输入能容纳的场景。关于可用输入选项和运行时支持，请参阅 [`Uint8Array.fromBase64()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64) 文档。

这些方法不会取代 `TextEncoder` 或 `TextDecoder`。用那些 API 在文本与字节之间转换；用新的 `Uint8Array` 方法在字节与 base64 或十六进制表示之间转换。

## 跨 Realm 识别 Error 对象

`instanceof Error` 看起来是检查一个对象是否为 `Error` 的显而易见的方法。但当值来自另一个 JavaScript realm（例如 iframe 或 Node.js 的 `vm` 上下文）时，它就不再可靠。每个 realm 都有自己的 `Error` 构造函数，因此来自另一个 realm 的真实错误可能无法通过 `instanceof` 检查。

在浏览器控制台试试：

```js
const iframe = document.createElement("iframe");
document.body.append(iframe);

const otherError = new iframe.contentWindow.Error("Failure");

console.log(otherError instanceof Error);
// false
```

这可能不会让多少经验丰富的 JavaScript 程序员感到惊讶，他们早已被 JavaScript 的某些古怪行为“教育”过。

解决方案是使用新的 [`Error.isError()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError)。`Error.isError()` 通过检测内部 `[[ErrorData]] slot` 来进行内置检查，而不是依赖当前 realm 的原型链。这让它类似于 `Array.isArray()`，成为一种可靠的跨 realm 检查。

如果你在前面的代码片段后面追加 `console.log(Error.isError(otherError))`，应该会看到正确的结果。

这个方法在 `catch` 块中也很有用，因为 JavaScript 允许抛出任何值：

```js
try {
  await runPlugin();
} catch (value) {
  const error = Error.isError(value)
    ? value
    : new Error(String(value), { cause: value });

  reportError(error);
}
```

当你需要知道一个值是否是真正的 Error 对象时，请使用 `Error.isError()`。它故意不会把带有 `name` 和 `message` 属性的普通对象当作 Error。

## 更准确地求和浮点数

直接用 `reduce()` 累加浮点数可能会丢失信息，而且失败模式比你想象的更隐蔽，因为结果并不总是看起来明显错误。考虑一个运动传感器库：它先施加一个很大的每台设备校准偏移量，然后加上一个微小读数，再移除偏移量：

```js
const readings = [1e16, 3.5, -1e16];

const total = readings.reduce(
  (sum, value) => sum + value,
  0,
);

console.log(total);
// 4
```

正确答案是 `3.5`——一旦偏移量抵消，这就是实际读数。在 `1e16` 附近，相邻可表示数字之间的间隔是 2。因此精确值 `1e16 + 3.5` 会舍入为 `1e16 + 4`，减去偏移量后留下 4 而不是 3.5。结果不是崩溃，而是一个看起来合理却是错误的数字，这正是这类 bug 在代码审查中容易被忽略的原因。

这就是 [`Math.sumPrecise()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sumPrecise) 的用武之地。它使用更精确的求和算法，因此从 `.reduce()` 切换到 `Math.sumPrecise()` 就能得到正确答案。

重写如下：

```js
const total = Math.sumPrecise(readings);

console.log(total);
// 3.5
```

`Math.sumPrecise()` 方法接受一个数字的可迭代对象。它不会把字符串或 `BigInt` 强制转换为数字。空可迭代对象，或只包含 `-0` 的可迭代对象，返回 `-0`。不过这个名字值得提醒一下：`Precise` 并不意味着十进制算术精度。这个熟悉的结果不会改变：

```js
console.log(Math.sumPrecise([0.1, 0.2]));
// 0.30000000000000004
```

两个输入本身已经是二进制浮点近似值。`Math.sumPrecise()` 减少的是求和过程中引入的额外误差，它不会改变 JavaScript 表示数字的方式。这让它对数值聚合有用，但不是金钱计算的完整解决方案。对于金融数值，应使用合适的十进制类型或整数表示。

## 总结

ECMAScript 2026 标准中有用的部分并不是语言的戏剧性变革，而是**几个常见用例终于有了直接对应的名称**：获取 Map 值或在不存在时创建它、保留 JSON 中的原始数字、无需把字节伪装成文本就能编码、收集异步序列、识别真正的 Error、减少求和误差、惰性合并可迭代对象。单独来看，这些 API 都不会改变一个应用。但它们可以替代那些容易重复、容易写错、或比其操作本身更难理解的样板代码。

这就是为什么 JavaScript 变得越来越好用！

在生产环境使用这些新增能力之前，请务必检查运行时支持。标准定义了语言，但每个运行时有各自的发布节奏。一些示例的源代码可在 [GitHub](https://github.com/pmbanugo/es2026-samples-and-verifier) 上找到。

## 延伸阅读

- [ECMAScript 2026 语言规范](https://ecma-international.org/publications-and-standards/standards/ecma-262/)
- [ECMAScript 2026 截止日期时的 TC39 已完成提案](https://github.com/tc39/proposals/blob/cae61138d3872cb9748effe04b729b7152f71369/finished-proposals.md)
