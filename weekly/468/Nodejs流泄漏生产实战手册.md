原文：[The Production Playbook for Node.js Stream Leaks](https://frontendmasters.com/blog/the-production-playbook-for-node-js-stream-leaks/)
链接：https://frontendmasters.com/blog/the-production-playbook-for-node-js-stream-leaks/
翻译：TUARAN

---

# Node.js Stream 泄漏的生产环境实战手册

> 本文是两部分系列文章的第二部分。第一部分介绍了背压的核心心智模型、为什么 `highWaterMark` 不是安全网、从 `.pipe()` 迁移到 `pipeline()` 的方法，以及为什么 `async/await` 无法解决数据量问题。

---

## 前言

即使正确处理了背压，仍然存在一些无法被发现的故障模式。它们不会在测试中出现，因为测试运行在快速的本地机器上，数据集小，客户端也不会随意断开连接。生产环境可没那么客气。以下是五种只在真实流量下才会暴露的泄漏模式，以及在用户发现之前捕获它们的五条规则手册。

---

## 一、你的 Stream 正在泄漏的五种方式

### 1. 客户端离开了，但服务器没有察觉

用户发起一个大型 CSV 导出，等了十秒后关闭了浏览器标签页。HTTP 响应触发了 `close` 事件。如果你使用的是旧版 `.pipe()` 方法，上游数据库查询会继续运行，transform 继续处理行，内存继续攀升。另一端没有人在监听，但服务器不知道这一点，因为 `.pipe()` 只在 `finish` 事件上触发清理，而在连接断开时 `finish` 永远不会触发。

```javascript
// 有问题的写法：当客户端断开连接时，legacy pipe() 会泄漏
db.cursor()
  .pipe(csvTransform)
  .pipe(res);
```

**修复方案：** 现代 Node.js（v14+）在使用 `pipeline()` 时会原生监控目标流。如果用户在流正式结束前关闭了标签页，`pipeline()` 会检测到 socket 的提前关闭，抛出 `ERR_STREAM_PREMATURE_CLOSE` 错误，并自动销毁上游数据库游标。

```javascript
import { pipeline } from "node:stream/promises";

// 修复后：当客户端断开时，pipeline() 自动清理上游
try {
  await pipeline(db.cursor(), csvTransform, res);
} catch (err) {
  if (err.code === "ERR_STREAM_PREMATURE_CLOSE") {
    console.log("Client disconnected early. Cleanup handled automatically.");
  } else {
    throw err;
  }
}
```

你也可以在长时间运行的处理器中主动检查 `req.destroyed`。如果客户端在你开始流之前就已经断开了，根本没必要打开数据库游标：

```javascript
// 防御性写法：如果客户端已经断开，在开始昂贵操作之前直接退出
if (req.destroyed) {
  return res.end();
}
await pipeline(db.cursor(), csvTransform, res);
```

---

### 2. 手动监听器清理是一场噩梦

在 async 迭代器出现之前，扫描流中的特定值然后停止是出奇地困难。你必须手动连接 `data` 事件，当找到所需内容时，你不能直接 `return`，必须手动分离监听器并销毁流，否则它会在后台继续读取，消耗 CPU 和内存。

```javascript
// 有问题的写法：legacy 事件监听器使提前退出变得危险且容易泄漏
fileStream.on("data", (line) => {
  if (line.includes("ERROR")) {
    console.log("Found error!");
    // 流仍在读取！我们必须手动：
    // fileStream.removeAllListeners("data");
    // fileStream.destroy();
  }
});
```

**修复方案：** async 迭代器（`for await...of`）实际上是消费流最安全的方式。因为 JavaScript 迭代器协议原生地与流的清理机制挂钩。当你从 async 迭代器循环中 `break`、`return` 或 `throw` 时，JavaScript 会自动调用迭代器的 `.return()` 方法，Node.js 将其直接映射到 `stream.destroy()`。

```javascript
// 修复后：async 迭代器在 break 时自动销毁流
for await (const line of fileStream) {
  if (line.includes("ERROR")) {
    console.log("Found error!");
    break; // fileStream.destroy() 在幕后自动被调用！
  }
}
```

**注意：** 虽然 `break` 在现代 Node.js 中会触发清理，但旧版本（v14 之前）存在 destroy 信号无法正确传播的 bug。如果你维护的代码必须在旧版运行时上运行，请在 `try/finally` 中包裹 async 迭代器，并显式调用 `.destroy()` 作为保险。

---

### 3. 你的超时只杀死了响应，其他什么都没杀死

你的 HTTP 框架有 30 秒超时。一个慢速客户端触发了它。框架调用 `res.end()` 然后继续。但 `res.end()` 是一个优雅关闭——它只是发出可写端结束的信号，而不会触发错误。这意味着 `pipeline()` 不会将其视为失败，因此不会清理上游链。从第三方 API 拉取数据的 fetch？还在运行。数据库游标？还开着。

```javascript
// 有问题的写法：超时只关闭了响应，上游继续运行
setTimeout(() => res.end(), 30000);
await pipeline(fetchStream, res);
```

**修复方案：** 超时时，你需要销毁流本身，或者使用带超时的 `AbortSignal`，它会杀死整个链。`AbortSignal.timeout()` 就是为此而生的：

```javascript
// 修复后：超时中止整个 pipeline，不仅仅是响应
const signal = AbortSignal.timeout(30000);
await pipeline(fetchStream, res, { signal });
```

当 30 秒到期时，信号触发，`pipeline()` 销毁链中的每一个流——上游和下游。被拒绝的 Promise 的错误代码为 `ABORT_ERR`，你可以将其与流错误区分开来单独处理。

---

### 4. 你把数据库清理与网络速度绑定在一起

这是一个导致连接饥饿的重大架构缺陷。开发者通常在下游 HTTP 响应完成时释放数据库连接。但将数据库连接生命周期与 HTTP 客户端的网络速度绑定在一起是极其危险的。如果一个 3G 慢速移动用户花了五分钟下载导出文件，你就要持有一个数据库 worker 整整五分钟，只是在等待 TCP socket 关闭。

```javascript
// 有问题的写法：将数据库连接与下游网络延迟绑定
res.on("close", () => db.releaseConnection());
```

**修复方案：** 将上游资源与下游交付解耦。将清理逻辑直接绑定到数据库游标自身的 `close` 或 `end` 事件。一旦数据库产出了最后一行，立即将连接释放回连接池。让 Node.js 将剩余的行缓冲到内存中或刷新到慢速网络 socket，但不要饿死你的数据库。

```javascript
// 修复后：游标完成时立即释放连接，与网络速度无关
const cursor = db.cursor();
cursor.on("close", () => db.releaseConnection());

await pipeline(cursor, csvTransform, res);
```

对于更精确的生命周期跟踪，`stream.finished()` 让你监听特定流何时"完成"——无论是正常完成、出错还是被销毁。它是绑定到单个事件的外科手术版本：

```javascript
import { finished } from "node:stream/promises";

const cursor = db.cursor();

// 无论何种原因（成功、错误或销毁），游标完成时释放连接
finished(cursor).then(() => db.releaseConnection());

await pipeline(cursor, csvTransform, res);
```

---

### 5. `pipeline()` 正常工作了，但源头仍在继续

这是那些做对了一切的人会踩到的坑。你使用了 `pipeline()`，下游 transform 抛出了错误，`pipeline()` 清理了链并拒绝了 Promise。但在错误触发的那一刻和源头收到 destroy 信号的那一刻之间，源头可能会再推送几个 chunk。`destroy()` 调用是异步的——它在下一个 tick 调度内部的 `_destroy` 回调。在这个窗口期内，一个活跃的数据库游标可以推送分配内存的 chunk，而这些内存永远不会被清理。

```javascript
// 有问题的写法：完全依赖 pipeline() 进行源头清理
try {
  await pipeline(source, transform, res);
} catch (err) {
  log.error("Pipeline failed");
}
```

**修复方案：** 在 `catch` 块中，即使 `pipeline()` 应该已经处理了，也要显式调用 `source.destroy(err)`。双重保险。如果源头已经被销毁，冗余的 destroy 调用是无操作的；如果没有，它能救你。

```javascript
// 修复后：显式的后备清理
try {
  await pipeline(source, transform, res);
} catch (err) {
  source.destroy(err);
  log.error("Pipeline failed");
}
```

---

## 二、现代实战手册：如何在不泄漏的情况下使用 Stream

以下是作者在经历了大量教训后总结的五条规则，没有一条是复杂的，但每一条都能节省数小时的堆快照考古工作。

---

### 规则 1：始终用 `pipeline()` 替代 `.pipe()`

每个流链都通过 `pipeline()` 处理，没有例外。它处理错误时的清理、完成时的清理，以及整个链的背压传播。一个 import，一个函数调用，一个 `try/catch`。

```javascript
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";

try {
  await pipeline(
    createReadStream("./input.csv"),
    createGzip(),
    createWriteStream("./output.csv.gz")
  );
} catch (err) {
  console.error("Pipeline failed:", err);
}
```

如果 gzip transform 失败，读取流关闭，写入流关闭。如果写入流的磁盘满了，上游的一切都停止。如果读取流遇到权限错误，下游的一切都被销毁。你不需要自己连接任何这些逻辑。

---

### 规则 2：尊重布尔值

任何时候手动调用 `.write()`，都要检查它的返回值。如果返回 `false`，停下来等待 `drain` 事件。这是 Node.js 流底层的基本模式，必须牢记。

#### "Drain 挂起"陷阱

等待 drain 时有一个危险的边缘情况。如果你写：

```javascript
// 危险：如果流出错或关闭，可能永远挂起
if (!ok) {
  await once(writable, "drain");
}
```

如果可写流在 drain 之前抛出错误或关闭，`drain` 事件将永远不会触发。你的 async 函数将永远挂在内存中，悬停在一个未解决的 `await` 中。

直觉上的修复是使用 `Promise.race()` 将 `drain` 事件与 `error` 事件竞争。但这样做会引入一个微妙的事件循环内存泄漏：竞争中"失败"的那个事件会通过 `events.once` 留下一个悬空的监听器附加在流上。在高负载下，这最终会触发 `MaxListenersExceededWarning` 并泄漏内存。

真正防弹的现代修复方案是将竞争包裹在 `try/finally` 块中，并传递一个 `AbortSignal` 来显式清理悬空的监听器：

```javascript
import { once } from "node:events";

// 防弹写法：将 drain 与错误竞争，清理失败的监听器
if (!ok) {
  const ac = new AbortController();

  // 当 ac.abort() 在 finally 块中触发时，它会导致失败的
  // once() 以 AbortError 拒绝。我们必须捕获并丢弃那个
  // 特定错误，同时重新抛出任何真实的流错误。
  const swallowAbort = (err) => { if (err.name !== "AbortError") throw err; };

  try {
    await Promise.race([
      once(writable, "drain", { signal: ac.signal })
        .catch(swallowAbort),
      once(writable, "error", { signal: ac.signal })
        .then((args) => Promise.reject(args[0]))
        .catch(swallowAbort)
    ]);
  } finally {
    ac.abort(); // 销毁失败事件的悬空监听器
  }
}
```

让人困惑的部分是 `swallowAbort`。为什么失败的 `once()` 会抛出？因为 `events.once` 返回一个 Promise，而 Promise 必须要么 resolve 要么 reject——它不能静默地分离和消失。当 `ac.abort()` 在 `finally` 块中触发时，它强制每个仍在等待事件的 `once()` 以 `AbortError` 拒绝。这就是清理机制。没有 `swallowAbort`，那个拒绝会作为未处理的错误传播并崩溃你的进程。有了它，`AbortError` 被捕获并丢弃，而来自 `error` 监听器的任何真实流错误仍然正常传播。

结果：如果下游 socket 崩溃，你的循环立即以真实错误抛出。失败的监听器在流的事件发射器上留下零垃圾。

---

### 规则 3：销毁你创建的东西

如果你打开了一个流，你就拥有它的生命周期。不要依赖垃圾回收来关闭文件描述符。在处理数千个请求的服务器中，它的速度不够快。

在 async 迭代器周围使用 `try/finally` 块。将 `AbortController` 信号传入 `pipeline()`，这样你就可以从外部清理整个链。当客户端断开连接、超时触发、健康检查失败时，你需要一种方法来杀死该请求触及的每一个流。

```javascript
const ac = new AbortController();
res.on("close", () => ac.abort());

try {
  await pipeline(source, transform, res, { signal: ac.signal });
} catch (err) {
  if (err.name === "AbortError") {
    console.log("Client disconnected, pipeline aborted cleanly.");
  } else {
    throw err;
  }
}
```

客户端关闭标签页？`ac.abort()` 触发。链中的每个流都被销毁。没有孤立的游标，没有悬空的 socket。

对于在 `pipeline()` 之外通过 async 迭代器消费的流，执行同样的纪律：

```javascript
const fileStream = createReadStream("./large-file.log");

try {
  for await (const chunk of fileStream) {
    // 处理 chunk
  }
} finally {
  // 双重保险：确保流被销毁，即使迭代器内部的 .return() 由于某种原因没有触发
  if (!fileStream.destroyed) fileStream.destroy();
}
```

---

### 规则 4：在生产前进行性能分析

不要等 Kubernetes 告诉你出了什么问题，在本地捕获它。

在负载测试期间使用 `--max-old-space-size=128` 运行你的服务。这人为地限制了 V8 堆，使内存泄漏快速崩溃而不是慢慢发酵数小时。在崩溃前立即拍一个堆快照，并在 Chrome DevTools 中加载它。

**在快照中寻找什么：** 在"Summary"标签中过滤 `WritableState`，按"Retained Size"排序。你可能会看到一个实例持有整个堆的 90%。

展开那个 `WritableState` 对象，查找其内部队列。在现代 Node 中，这是 `buffered` 数组（在旧版本中是 `bufferedRequest` 链表）。展开它，你会找到你要找的确切证据：

> Chrome DevTools 堆快照过滤 `WritableState`。保留 92% 堆的单个实例是可写流的内部缓冲队列——1,834 个未处理的 chunk，这些是生产者在忽略 `false` 返回值时推送的。

你甚至不需要堆快照来实时监控这个。Node 通过 `stream.writableLength`（或旧版本中的 `stream._writableState.length`）暴露了这个队列的确切大小。如果你正在调查生产事故，添加一个快速诊断日志：

```javascript
setInterval(() => {
  console.log(`[Diagnostic] writableLength: ${writable.writableLength} bytes`);
}, 1000);
```

如果背压正常工作，你会看到数字严格绑定在你的 `highWaterMark`：

```
[Diagnostic] writableLength: 65536 bytes
[Diagnostic] writableLength: 65536 bytes
[Diagnostic] writableLength: 65536 bytes
```

但如果你有泄漏，你会看到生产者脱离消费者的确切时刻。队列大小简单地脱离现实并攀升，直到进程死亡：

```
[Diagnostic] writableLength: 65536 bytes
[Diagnostic] writableLength: 1425890 bytes
[Diagnostic] writableLength: 5892304 bytes
[Diagnostic] writableLength: 12059382 bytes
...
[Diagnostic] writableLength: 3840192300 bytes
// FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

如果你需要在不重启的情况下从运行中的生产进程捕获堆快照，Node.js 支持 `--heapsnapshot-signal` 标志。使用 `--heapsnapshot-signal=SIGUSR2` 启动你的服务，当内存开始攀升时，从主机发送 `kill -USR2 <pid>`。Node 将 `.heapsnapshot` 文件写入工作目录，而不停止进程。无需代码更改，无需重启，无需附加调试器。

对于整个 pipeline 的更广泛视图，通过 [clinic.js Bubbleprof](https://clinicjs.org/bubbleprof/) 运行你的服务。它跟踪异步操作并可视化事件循环在哪里停滞。背压停滞表现为流操作之间的长空闲间隙。你可以准确看到链中哪个流是瓶颈。

---

### 规则 5：测试你的背压处理

不要仅仅依赖生产性能分析。你可以编写单元测试来捕获这个问题。创建一个模拟可写流，明确验证生产者在缓冲区填满时是否等待。

**策略：** 设置一个极低的 `highWaterMark`（2 个对象），用 `setTimeout` 模拟慢速消费者，然后向其提供 100 个 chunk。如果生产者尊重背压，内部队列永远不会超过 `highWaterMark + 1`（正在主动处理的那一个 chunk）。如果不尊重，所有 100 个 chunk 会同步落入队列。

```javascript
import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";

it("should respect backpressure", async () => {
  let maxBufferLength = 0;
  let drainEmitted = false;

  const slowWritable = new Writable({
    highWaterMark: 2,
    objectMode: true,
    write(chunk, enc, cb) {
      // 跟踪内部队列达到的最大大小
      if (this.writableLength > maxBufferLength) {
        maxBufferLength = this.writableLength;
      }
      setTimeout(cb, 10); // 模拟慢速消费者
    }
  });

  slowWritable.on("drain", () => {
    drainEmitted = true;
  });

  await pipeline(yourProducer(100), slowWritable);

  // 如果生产者忽略了背压，Node 会同步排队所有 chunk，
  // maxBufferLength 会飙升到 100。
  expect(maxBufferLength).toBeLessThanOrEqual(3);

  // 确认流实际上暂停并恢复了
  expect(drainEmitted).toBe(true);
});
```

这个测试是你的金丝雀。在 CI 中运行它。如果有人重构了你的生产者并意外删除了 drain 检查，这个测试会在 PR 合并之前捕获它。

---

## 三、未来的方向

Node.js TSC 成员 Matteo Collina 一直在推动生态系统走向他所称的"无流未来"。这个想法是用纯 async 生成器通过 `pipeline()` 管道来替换旧版 Stream API。

**为什么这是未来？** 因为它从根本上翻转了控制流。旧版 Stream API 是基于推送的：生产者向下游抛数据，直到下游喊"停"。生成器是基于拉取的：下游请求下一个 chunk，上游按需计算它。

当你将生成器传递给 `pipeline()` 时，Node 的内部机制处理转换。你不管理事件，不连接监听器，你编写线性代码来 yield chunk，`pipeline()` 只在可写端的缓冲区有空间时才拉取下一次迭代。

以下是一个完全 async 生成器 pipeline 在实践中的样子，无缝混合了数据库游标、转换和下游 HTTP 响应：

```javascript
import { pipeline } from "node:stream/promises";

// 生成器 1：生产者（按需获取数据）
async function* fetchRows(dbCursor) {
  for await (const batch of dbCursor) {
    for (const row of batch) {
      yield row;
    }
  }
}

// 生成器 2：转换（只在被拉取时处理）
async function* formatCSV(source) {
  for await (const row of source) {
    yield `${row.id},${row.name},${row.total}\n`;
  }
}

// Pipeline 自动处理背压桥接
await pipeline(
  fetchRows(cursor),
  formatCSV,
  res
);
```

没有流类，没有带有令人困惑的对象模式设置的 `Transform` 实例，没有手动 drain 检查。内存配置文件保持完全平坦，因为生成器每次只 yield 一个 chunk，`pipeline()` 只在 `res` 准备好时才拉取下一次迭代。

### `stream.compose()` 的复用能力

`stream.compose()`（在 Node.js 22 中稳定）将多个流或 async 生成器缝合成一个单一的 `Duplex` 流——一个你定义一次并插入任何 pipeline 的可复用单元：

```javascript
import { compose } from "node:stream";

// 一次定义转换
const csvExporter = compose(formatCSV, compressGzip);

// 在任何地方使用它——相同的行为，单一的真相来源
await pipeline(fetchRows(cursor), csvExporter, res);
```

`pipeline()` 用于*消费*一个链，`compose()` 用于将一个链*打包*成其他代码可以消费的东西。当你的流逻辑开始在端点之间共享时，这个区别很重要。

### 关于清理的注意事项

async 生成器确实比原始流引入了轻微的 CPU 和微任务开销。对于像 CSV 导出或网络请求这样的 IO 密集型任务，这很少是瓶颈，但如果你在编写超热路径，请针对你的特定工作负载分析抽象成本。

清理问题与生成器无关——这与本文中适用于每个 pipeline 的规则 3（销毁你创建的东西）相同。防御方式与任何 `pipeline()` 调用相同——传递一个 `AbortSignal`，这样当下游 socket 关闭时链会干净地清理：

```javascript
const ac = new AbortController();
res.on("close", () => ac.abort());

await pipeline(
  fetchRows(cursor),
  formatCSV,
  res,
  { signal: ac.signal }
);
```

---

## 四、修复很简单，系统并不简单

第一部分中的 CSV 导出服务？即时修复是四行代码。检查 `.write()` 的布尔返回值。如果是 `false`，等待 `drain` 事件。恢复。内存在 180MB 处趋于平稳，而不是攀升到 3.8GB。Pod 停止死亡。Slack 线程安静了。

但那四行修复是开始，而不是结束。本文的每一节都存在，因为有人发布了看起来正确的代码，通过了测试，经过了代码审查，运行了几个月——直到客户端在错误的时刻断开连接，超时关闭了 pipeline 的错误端，或者数据库连接在慢速 socket 排空时空闲了五分钟。Node.js 流建立在信任系统上，当你打破这种信任时，没有什么会大声失败。进程只是悄悄地积累损害，直到某些东西崩溃。

**`pipeline()` 替代 `.pipe()`。检查布尔值。销毁你创建的东西。在你的编排器替你做之前，用受限堆进行性能分析。编写在 PR 合并之前捕获回归的背压测试。** 这些都不复杂。困难的部分始终是知道它很重要。

---

*本文由 TUARAN 翻译自 Frontend Masters 博客，原文链接见上方。*
