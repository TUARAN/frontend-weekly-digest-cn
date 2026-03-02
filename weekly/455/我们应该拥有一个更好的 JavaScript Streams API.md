原文：We deserve a better streams API for JavaScript
翻译：TUARAN
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 我们应该拥有一个更好的 JavaScript Streams API

2026-02-27  
- [![](https://blog.cloudflare.com/cdn-cgi/image/format=auto,dpr=3,width=64,height=64,gravity=face,fit=crop,zoom=0.5/https://cf-assets.www.cloudflare.com/zkvhlag99gkb/5dR6CJtYedvLrkAZ6rxv9I/0db3d5a763a8b0a350ac04ac6410da6b/jasnell.jpg)](https://blog.cloudflare.com/author/jasnell/) [James M Snell](https://blog.cloudflare.com/author/jasnell/)  
24 分钟阅读 ![](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/5qjBI2UpJXcpCqgAY4SJkH/9e6489cd148e2c74d1bdd25dd08e6db5/image7.png)

以流（streams）的方式处理数据，是我们构建应用程序时的基础能力。为了让流式处理在所有地方都能工作，[WHATWG Streams Standard](https://streams.spec.whatwg.org/)（非正式地称为 “Web streams”）被设计出来，用于建立一个可在浏览器与服务器之间通用的 API。它已在浏览器中发布，被 Cloudflare Workers、Node.js、Deno 和 Bun 采用，并成为诸如 [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) 等 API 的基础。这是一项意义重大的工程，而设计它的人是在当时的约束与工具条件下，试图解决非常困难的问题。

但在多年来基于 Web streams 的实践之后——我在 Node.js 和 Cloudflare Workers 中都实现过它们，排查过客户与运行时环境中的线上问题，并帮助开发者走过太多常见陷阱——我逐渐相信：标准 API 在可用性与性能上存在一些根本性问题，单靠渐进式改进并不容易修复。这些问题不是 bug；它们是设计决策带来的结果——这些决策在十年前也许合理，但与当今 JavaScript 开发者写代码的方式并不匹配。

这篇文章将探讨我在 Web streams 中看到的一些根本性问题，并提出一种围绕 JavaScript 语言原语（language primitives）构建的替代方案，以证明我们完全有可能做得更好。

在基准测试中，这种替代方案在我测试过的每一种运行时上（包括 Cloudflare Workers、Node.js、Deno、Bun 以及所有主流浏览器），都能比 Web streams 快 2 倍到 *120 倍*不等。提升并不是来自什么“聪明的优化”，而是来自根本不同的设计选择——它们更有效地利用了现代 JavaScript 语言特性。我并不是来贬低前人工作；我想开启一次讨论：我们接下来可能会走向什么。

## 我们从哪里走来





Node.js 当时已经有了自己的 [streaming API](https://nodejs.org/api/stream.html)，并且后来也被移植到浏览器中使用。但 WHATWG 并未选择以它作为起点，因为 WHATWG 的章程要求它只考虑 Web 浏览器的需求。服务器端运行时是在更晚之后才采用 Web streams 的：随着 Cloudflare Workers 与 Deno 先后出现并提供“一等公民”的 Web streams 支持，跨运行时兼容性变得更重要，Web streams 才随之被更广泛采用。

Web streams 的设计早于 JavaScript 的异步迭代（async iteration）。[`for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) 语法直到 [ES2018](https://262.ecma-international.org/9.0/) 才落地——这比 Streams Standard 最初定稿晚了两年。这样的时间点意味着：该 API 在起初无法利用后来会成为 JavaScript 中消费异步序列的惯用方式（idiomatic way）。因此，规范引入了它自己的 reader/writer 获取模型，而这一决定又影响并渗透到了 API 的方方面面。

#### 常见操作需要过度“仪式感”

对流最常见的任务，是把它读到结束。用 Web streams 来做，大概是这样：

```js
// First, we acquire a reader that gives an exclusive lock
// on the stream...
const reader = stream.getReader();
const chunks = [];
try {
  // Second, we repeatedly call read and await on the returned
  // promise to either yield a chunk of data or indicate we&#039;re
  // done.
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
} finally {
  // Finally, we release the lock on the stream
  reader.releaseLock();
}
```

你可能会以为这种模式是流式处理本身固有的。其实不是。reader 的获取、锁的管理、以及 `{ value, done }` 这套协议，都只是设计选择，而不是必需品。它们是 Web streams 规范在特定时间点、以特定方式编写时留下的产物。异步迭代的存在，本就是为了处理那些会随着时间到达的序列；但在 streams 规范编写时，异步迭代还不存在。因此，这里的复杂度纯粹是 API 的额外开销，并非无法避免的本质需求。

考虑到现在 Web streams 已经支持 `for await...of`，来看一种替代做法：
```

```js
            const chunks = [];
for await (const chunk of stream) {
  chunks.push(chunk);
}
            
这种方式更好，因为样板代码少了很多，但它并不能解决所有问题。异步迭代是在一个并非为它设计的 API 之上“后加”进去的，这一点从各处都能看出来。像 [BYOB（bring your own buffer，自带缓冲区）](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamBYOBReader) 这种读取特性，无法通过迭代来使用。读者（reader）、锁（lock）和控制器（controller）这些底层复杂性仍然存在，只是被隐藏了起来。一旦真的出了问题，或者需要用到该 API 的更多特性，开发者就会发现自己又回到了原始 API 的“泥潭”里：试图搞明白为什么他们的流被“锁住”了，为什么 `releaseLock()` 没有产生预期效果，或是在自己无法控制的代码里追踪性能瓶颈。

#### 锁定问题

Web Streams 使用一种“锁定模型”，用来防止多个消费者交错读取。当你调用 [`getReader()`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader) 时，这个流就会被锁定。处于锁定状态时，没有任何其他东西能直接从该流读取、把它 pipe 到别处，甚至连取消（cancel）都不行——只有真正持有 reader 的那段代码才可以。

这听起来很合理，直到你看到它是如何轻易出错的：

            async function peekFirstChunk(stream) {
  const reader = stream.getReader();
  const { value } = await reader.read();
  // Oops — forgot to call reader.releaseLock()
  // And the reader is no longer available when we return
  return value;
}

const first = await peekFirstChunk(stream);
// TypeError: Cannot obtain lock — stream is permanently locked
for await (const chunk of stream) { /* never runs */ }
            
忘记调用 [`releaseLock()`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader/releaseLock) 会永久性地破坏这个流。[`locked`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/locked)` `属性能告诉你一个流被锁住了，但不会告诉你为什么被锁、被谁锁住，或者这把锁是否仍然可用。[Piping](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/pipeTo) 在内部会获取锁，这会让流在 pipe 操作期间以一些不明显的方式变得不可用。

多年来，“在存在未完成读取（pending reads）时释放锁”的语义也一直不清晰：如果你调用了 read() 但没有 await 它，然后又调用 releaseLock()，会发生什么？规范最近才澄清：释放锁时会取消（cancel）所有未完成的读取——但各实现的行为曾经并不一致，而依赖此前未指定行为的代码可能会因此出问题。

话虽如此，需要认识到：锁定本身并不是坏事。它确实有重要作用，能确保应用以正确、有序的方式消费或生产数据。关键挑战在于：最初的手动实现方式需要使用 `getReader() `和 `releaseLock()` 这类 API。随着 async iterable 提供了自动的锁与 reader 管理，从用户视角处理锁就容易多了。

但对实现者而言，锁定模型会带来相当多且并不简单的内部记账工作。每个操作都必须检查锁状态，必须跟踪 reader，而锁、取消与错误状态之间的相互作用会形成一张由大量边缘情况组成的矩阵，所有情况都必须被正确处理。

#### BYOB：复杂却没有回报

[BYOB（bring your own buffer，自带缓冲区）](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamBYOBReader) 读取的设计目的是：让开发者在读取流时复用内存缓冲区，这是一种面向高吞吐场景的重要优化。这个思路本身很合理：你不再为每个 chunk 分配新的缓冲区，而是提供自己的缓冲区，让流把数据填进去。

但在实践中（是的，总能找到例外），BYOB 很少带来任何可衡量的收益。它的 API 明显比默认读取更复杂：需要单独的 reader 类型（`ReadableStreamBYOBReader`）以及其他专用类（例如 `ReadableStreamBYOBRequest`），需要谨慎地管理缓冲区生命周期，还需要理解 [`ArrayBuffer` 分离（detachment）](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer#transferring_arraybuffers) 的语义。当你把一个缓冲区传给 BYOB 读取时，该缓冲区会被分离——转移给流——然后你拿到的是一个新的视图，它可能指向的是不同的内存。这种基于“转移”的模型既容易出错，也让人困惑：

            const reader = stream.getReader({ mode: &#039;byob&#039; });
const buffer = new ArrayBuffer(1024);
let view = new Uint8Array(buffer);

const result = await reader.read(view);
// &#039;view&#039; should now be detached and unusable
// (it isn&#039;t always in every impl)
// result.value is a NEW view, possibly over different memory
view = result.value; // Must reassign
            
BYOB 也无法与异步迭代或 TransformStreams 一起使用，因此想要实现零拷贝读取的开发者不得不回到手动的 reader 循环。

对实现者来说，BYOB 会增加显著的复杂度。流必须跟踪待处理的 BYOB 请求，处理部分填充（partial fills），正确管理缓冲区分离，并在 BYOB reader 与底层 source 之间协调。[可读字节流的 Web Platform Tests](https://github.com/web-platform-tests/wpt/tree/master/streams/readable-byte-streams) 里甚至有专门的测试文件来覆盖 BYOB 的边缘情况：已分离的缓冲区、错误的视图（bad views）、enqueue 后响应的顺序（response-after-enqueue ordering）等等。

最终，BYOB 对用户和实现者都很复杂，但在实践中采用率却不高。大多数开发者仍然使用默认读取，并接受由此带来的分配开销。
```

Most userland（用户态）实现的自定义 `ReadableStream` 实例，通常不会去处理在同一个 stream 中同时正确实现默认读取与 BYOB 读取支持所需的整套“仪式”——而且这是有充分理由的。它很难做对，并且大多数情况下，那些耗时的代码最终都会回退到默认读取路径。下面的例子展示了一个“正确”的实现需要做些什么。它又大、又复杂、又容易出错，并不是典型开发者真的想去处理的那种复杂度：

```js
            new ReadableStream({
    type: &#039;bytes&#039;,
    
    async pull(controller: ReadableByteStreamController) {      
      if (offset >= totalBytes) {
        controller.close();
        return;
      }
      
      // Check for BYOB request FIRST
      const byobRequest = controller.byobRequest;
      
      if (byobRequest) {
        // === BYOB PATH ===
        // Consumer provided a buffer - we MUST fill it (or part of it)
        const view = byobRequest.view!;
        const bytesAvailable = totalBytes - offset;
        const bytesToWrite = Math.min(view.byteLength, bytesAvailable);
        
        // Create a view into the consumer&#039;s buffer and fill it
        // not critical but safer when bytesToWrite != view.byteLength
        const dest = new Uint8Array(
          view.buffer,
          view.byteOffset,
          bytesToWrite
        );
        
        // Fill with sequential bytes (our "data source")
        // Can be any thing here that writes into the view
        for (let i = 0; i < bytesToWrite; i++) {
          dest[i] = (offset + i) & 0xFF;
        }
        
        offset += bytesToWrite;
        
        // Signal how many bytes we wrote
        byobRequest.respond(bytesToWrite);
        
      } else {
        // === DEFAULT READER PATH ===
        // No BYOB request - allocate and enqueue a chunk
        const bytesAvailable = totalBytes - offset;
        const chunkSize = Math.min(1024, bytesAvailable);
        
        const chunk = new Uint8Array(chunkSize);
        for (let i = 0; i < chunkSize; i++) {
          chunk[i] = (offset + i) & 0xFF;
        }
        
        offset += chunkSize;
        controller.enqueue(chunk);
      }
    },
    
    cancel(reason) {
      console.log(&#039;Stream canceled:&#039;, reason);
    }
  });
```

当宿主运行时（host runtime）由运行时自身提供一个面向字节的 `ReadableStream` 时，例如作为 fetch `Response` 的 `body `，通常对于运行时本身来说，会更容易提供一个针对 BYOB 读取优化过的实现；但这些实现仍然需要能够同时处理默认读取与 BYOB 的读取模式，而这一要求也带来了相当程度的复杂性。

#### 背压：理论上很好，实践中却坏掉了

背压（Backpressure）——让较慢的消费者向较快的生产者发出“放慢速度”信号的能力——在 Web streams 中是一个一等概念。至少在理论上是这样；而在实践中，这个模型存在一些严重缺陷。

主要信号是控制器上的 [`desiredSize`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultController/desiredSize)。它可能为正（表示需要数据）、为 0（表示达到容量上限）、为负（表示超出容量）、或为 null（表示已关闭）。生产者应该检查这个值，并在它不是正数时停止 enqueue。可问题在于，没有任何机制强制这样做：即使 `desiredSize` 已经是很深的负数，[`controller.enqueue()`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultController/enqueue) 依然总是会成功。

```js
            new ReadableStream({
  start(controller) {
    // Nothing stops you from doing this
    while (true) {
      controller.enqueue(generateData()); // desiredSize: -999999
    }
  }
});
```

Stream 的实现方完全可以（而且确实会）忽略背压；并且规范里定义的一些特性还会显式地破坏背压。比如 [`tee()`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/tee) 会从单个 stream 创建两个分支。如果一个分支的读取速度比另一个快，数据就会在内部缓冲区中累积，而且没有上限。一个快速消费者可能在慢消费者追赶期间导致内存无限增长；除非取消较慢的分支，否则既无法配置这种行为，也没有办法选择退出。

Web streams 确实提供了清晰的机制来调节背压行为，例如 `highWaterMark` 选项以及可自定义的 size 计算方式；但它们和 `desiredSize` 一样容易被忽略，而许多应用往往根本不会去关注这些设置。

同样的问题也存在于 `WritableStream` 一侧。`WritableStream` 有 `highWaterMark` 和 `desiredSize`。它还提供了一个 `writer.ready` promise，数据生产者按理说应该关注它，但实际中往往不会。

```js
            const writable = getWritableStreamSomehow();
const writer = writable.getWriter();

// Producers are supposed to wait for the writer.ready
// It is a promise that, when resolves, indicates that
// the writables internal backpressure is cleared and
// it is ok to write more data
await writer.ready;
await writer.write(...);
```

对实现者而言，背压在增加复杂度的同时却没有提供任何保证。用于跟踪队列大小、计算 `desiredSize`、并在恰当的时间调用 `pull()` 的整套机制都必须正确实现。然而，由于这些信号本质上只是“建议性的”（advisory），所有这些工作并不能真正阻止背压本该解决的问题发生。

#### Promise 的隐藏成本

Web streams 规范要求在许多节点创建 promise，而且往往发生在热路径上，并且对用户而言通常是不可见的。每一次 `read()` 调用不仅仅是返回一个 promise；在内部，实现还会为队列管理、`pull()` 协调、以及背压信号等创建额外的 promise。

这种开销是由规范对 Promise 的依赖所决定的：它用 Promise 来做缓冲区管理、完成信号以及背压信号。虽然其中一部分取决于具体实现，但只要你按规范原样实现，其中很大一部分开销就是不可避免的。对于高频流式场景——视频帧、网络数据包、实时数据——这种开销会非常显著。

在管道（pipeline）里，问题会被进一步放大。每加一个 `TransformStream`，就在源（source）与汇（sink）之间再叠一层 Promise 机制。规范没有定义同步的快速路径（fast path），所以即便数据是立刻可用的，Promise 相关的机制仍然会照常运行。

对实现者而言，这种“Promise 很重”的设计会限制优化空间。规范要求特定的 Promise resolve 顺序，这使得实现者很难对操作进行批处理，或者跳过不必要的异步边界——否则就可能引入微妙的规范兼容性问题。实现者确实做了许多隐藏的内部优化，但这些优化可能很复杂，也很难做到完全正确。

在我写这篇博文期间，Vercel 的 Malte Ubl 发布了他们自己的[博文](https://vercel.com/blog/we-ralph-wiggumed-webstreams-to-make-them-10x-faster)，介绍了 Vercel 围绕提升 Node.js 的 Web streams 实现性能所做的一些研究工作。在那篇文章里，他们讨论了每一种 Web streams 实现都会面对的同一个根本性能优化问题：

> “再比如 pipeTo()。每个 chunk 都会走完整的 Promise 链：read、write、检查背压、重复。每次 read 都会分配一个 `{value, done}` 结果对象。错误传播还会创建额外的 Promise 分支。  
>  
> 这些都没错。这些保证在浏览器里很重要：stream 会跨越安全边界，取消语义必须滴水不漏，而且你无法同时控制管道两端。但在服务器上，当你用 1KB 的 chunk 把 React Server Components 通过三个 transform 管道传输时，成本会不断累积。  
> 我们基准测试里，原生 WebStream 的 pipeThrough 在 1KB chunks 下是 630 MB/s。Node.js 的 pipeline() 在相同的直通（passthrough）transform 下：约 7,900 MB/s。差距是 12 倍，而差异几乎完全来自 Promise 和对象分配的开销。”
>
> —— Malte Ubl, https://vercel.com/blog/we-ralph-wiggumed-webstreams-to-make-them-10x-faster

作为他们研究的一部分，他们整理了一组针对 Node.js Web streams 实现的改进提案：在某些代码路径中消除 Promise，从而带来显著的性能提升，最高可达 10 倍。这也恰好印证了一个观点：Promise 虽然有用，但确实会带来可观的开销。作为 Node.js 的核心维护者之一，我很期待能帮助 Malte 以及 Vercel 的同事把这些改进提案落地！

在 Cloudflare Workers 最近的一次更新中，我也对内部的一条数据管道做了类似的修改：在某些应用场景下，将创建的 JavaScript Promise 数量最多减少了 200 倍。其结果是这些应用的性能提升了好几个数量级。

### 真实世界中的失败案例

#### 未消费的 body 导致资源耗尽

当 `fetch()` 返回一个响应时，body 是一个 [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/Response/body)。如果你只检查状态码而不去消费（consume）或取消（cancel）body，会发生什么？答案因实现而异，但一个常见结果是资源泄漏。

```js
            async function checkEndpoint(url) {
  const response = await fetch(url);
  return response.ok; // Body is never consumed or cancelled
}

// In a loop, this can exhaust connection pools
for (const url of urls) {
  await checkEndpoint(url);
}
```

这种写法曾在使用 [undici](https://nodejs.org/api/globals.html#fetch)（Node.js 内置的 `fetch()` 实现）的 Node.js 应用中导致连接池耗尽，其他运行时里也出现过类似问题。这个 stream 会持有对底层连接的引用；如果没有显式消费或取消，该连接可能会一直滞留到垃圾回收（GC）发生为止——而在高负载下，GC 可能来得不够及时。

此外，一些 API 会隐式创建 stream 分支，使问题进一步加剧。[`Request.clone()`](https://developer.mozilla.org/en-US/docs/Web/API/Request/clone) 和 [`Response.clone()`](https://developer.mozilla.org/en-US/docs/Web/API/Response/clone) 会对 body stream 隐式执行 `tee()` 操作——这一细节很容易被忽略。为了记录日志或实现重试逻辑而克隆请求的代码，可能会在不知不觉中创建分支 stream，而这些分支需要分别被消费，从而成倍增加资源管理负担。

当然，需要明确的是，这类问题*确实*属于实现层面的 bug。连接泄漏显然是 undici 需要在其自身实现中修复的问题；但规范的复杂性也确实让处理这类问题变得不那么容易。

> “在 Node.js 的 fetch() 实现里克隆 stream 比看起来更难。当你克隆 request 或 response body 时，你调用的是 tee()——它会把单个 stream 分成两个分支，而这两个分支都需要被消费。如果一个消费者读得比另一个快，数据就会在内存里无限缓冲，等待较慢的分支。如果你没有正确消费两个分支，底层连接就会泄漏。两个 reader 共享一个 source 所需的协调工作，使得你很容易不小心破坏原始请求或耗尽连接池。这是一个看似简单的 API 调用，但其底层机制非常复杂，很难做到正确无误。”  
> —— Matteo Collina, Ph.D. —— Platformatic 联合创始人兼 CTO，Node.js 技术指导委员会主席

#### 一头栽下 tee() 的内存悬崖

[`tee()`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/tee) 会把一个流拆分成两个分支。看起来很直观，但实现上需要缓冲：如果一个分支的读取速度比另一个更快，那么数据就必须先被存放在某个地方，直到较慢的分支追上来。

```js
const [forHash, forStorage] = response.body.tee();

// Hash computation is fast
const hash = await computeHash(forHash);

// Storage write is slow — meanwhile, the entire stream
// may be buffered in memory waiting for this branch
await writeToStorage(forStorage);
```

规范并没有强制规定 `tee()` 的缓冲区上限。公平地说，规范允许各个实现以任何它们认为合适的方式来实现 `tee()` 以及其他 API，只要满足规范中可观察到的规范性要求即可。但如果某个实现选择按照 Streams 规范里描述的特定方式来实现 `tee()`，那么 `tee()` 就会带来一个内置的内存管理问题，而且很难绕开。

因此，各种实现不得不发展出自己的应对策略。Firefox 最初使用的是链表方案，导致内存增长为 O`(n)`，并且增长量与两端消费速率的差值成正比。在 Cloudflare Workers 中，我们选择实现一种共享缓冲区模型：背压由最慢的消费者而不是最快的消费者来触发。

#### Transform 背压缺口（Transform backpressure gaps）

`TransformStream` 会创建一对 `readable/writable`，中间夹着处理逻辑。`transform()` 函数是在 *写入* 时执行，而不是在读取时执行。转换处理会在数据到达时被积极（eagerly）执行，不管是否有消费者已经准备好。这会在消费者很慢时造成不必要的工作；而且两侧之间的背压信号存在缺口，在负载下可能导致无界缓冲。规范中的预期是：被转换的数据的生产者会关注 transform 可写端的 `writer.ready` 信号，但实际上生产者往往直接忽略它。

如果 transform 的 `transform()` 操作是同步的，并且总是立即把输出 enqueue，那么即便下游消费者很慢，它也永远不会向可写端传递背压。这是规范设计带来的结果，很多开发者完全没有注意到。在浏览器中，因为只有单个用户、并且通常同一时间只会有少量流管线在运行，这类“脚枪”（foot gun）往往无关紧要；但在服务端或边缘运行时里，如果要同时服务成千上万的并发请求，它会对性能造成巨大影响。

```js
const fastTransform = new TransformStream({
  transform(chunk, controller) {
    // Synchronously enqueue — this never applies backpressure
    // Even if the readable side&#039;s buffer is full, this succeeds
    controller.enqueue(processChunk(chunk));
  }
});

// Pipe a fast source through the transform to a slow sink
fastSource
  .pipeThrough(fastTransform)
  .pipeTo(slowSink);  // Buffer grows without bound
```

TransformStream 本来应该做的是：检查 controller 上的背压，并用 Promise 把背压信息传回给 writer：

```js
const fastTransform = new TransformStream({
  async transform(chunk, controller) {
    if (controller.desiredSize <= 0) {
      // Wait on the backpressure to clear somehow
    }

    controller.enqueue(processChunk(chunk));
  }
});
```

但这里的难点在于：`TransformStreamDefaultController` 并没有像 Writer 那样的 ready promise 机制；因此 `TransformStream` 的实现需要做一个轮询机制，定期检查 `controller.desiredSize` 何时再次变为正数。

在管线（pipeline）里问题会更严重。当你把多个 transform 串起来——比如解析、转换、再序列化——每个 `TransformStream` 都有自己内部的可读与可写缓冲区。如果实现者严格遵循规范，数据会以面向 push 的方式在这些缓冲区中层层级联：源头 push 到 transform A，A 再 push 到 B，B 再 push 到 C；即使最终消费者甚至还没开始 pull，数据也会先在中间缓冲里不断累积。仅仅三个 transform，就可能同时有六个内部缓冲区在填充。

Streams API 的使用者被期望记得在创建 source、transform 以及 writable 目标时使用诸如 `highWaterMark` 之类的选项，但他们往往要么忘了，要么干脆选择忽略。

```js
source
  .pipeThrough(parse)      // buffers filling...
  .pipeThrough(transform)  // more buffers filling...
  .pipeThrough(serialize)  // even more buffers...
  .pipeTo(destination);    // consumer hasn&#039;t started yet
```

各个实现已经找到了优化 transform 管线的方法，例如：折叠恒等（identity）transform、对不可观察的路径做短路（short-circuiting）、延迟分配缓冲区，或者回退到完全不运行 JavaScript 的原生代码路径。Deno、Bun 和 Cloudflare Workers 都成功实现了“native path”优化，能够消除大量开销；而 Vercel 最近的 [fast-webstreams](https://vercel.com/blog/we-ralph-wiggumed-webstreams-to-make-them-10x-faster) 研究也在为 Node.js 探索类似优化。但这些优化本身会显著增加复杂度，并且仍然无法彻底摆脱 TransformStream 内在的、以 push 为导向的模型。

#### 服务端渲染中的 GC 震荡（GC thrashing in server-side rendering）

流式服务端渲染（SSR）是一个特别痛苦的场景。一个典型的 SSR 流可能会渲染成千上万个很小的 HTML 片段，每一个片段都会经过 streams 的整套机制：

```js
            // 每个组件都会入队一小段内容
function renderComponent(controller) {
  controller.enqueue(encoder.encode(`<div>${content}</div>`));
}

// 数百个组件 = 数百次 enqueue 调用
// 每一次都会在内部触发 Promise 相关机制
for (const component of components) {
  renderComponent(controller);  // 创建 Promise、分配对象
}
            
每一个片段都意味着：为 `read()` 调用创建 Promise、为背压协调创建 Promise、分配中间缓冲区，以及创建 `{ value, done } `结果对象——其中大多数几乎立刻就会变成垃圾。

在高负载下，这会带来 GC（垃圾回收）压力，足以摧毁吞吐量。JavaScript 引擎会把大量时间花在回收短生命周期对象上，而不是做真正有用的工作。随着 GC 暂停打断请求处理，延迟会变得不可预测。我见过一些 SSR 负载中，垃圾回收占据了每个请求总 CPU 时间中相当大的一部分（最高甚至超过 50%）。这些时间本可以用来真正渲染内容。

讽刺的是，流式 SSR 的初衷是通过增量发送内容来提升性能。但 streams 机制本身的开销可能会抵消这些收益，尤其是对包含大量小组件的页面来说。开发者有时会发现，把整个响应先缓冲起来反而比通过 Web streams 进行流式传输更快——这就完全违背了流式传输的目的。

    
      
### 优化的跑步机

      
        
      
    
    
为了实现可用的性能，每个主流运行时都不得不对 Web streams 进行一些非标准的内部优化。Node.js、Deno、Bun 和 Cloudflare Workers 都开发了各自的变通方案。对于与系统级 I/O 相连的 streams 来说尤其如此，因为其中大量机制对外是不可观测的，因此可以被“短路”跳过。

寻找这些可优化的机会本身就可能是一项巨大的工程。你需要对规范有端到端的理解，才能识别哪些行为是可观测的、哪些可以安全地省略。即便如此，某个具体优化是否真的符合规范，也往往并不明确。实现者必须对哪些语义可以放松而不破坏兼容性做出判断。这迫使运行时团队为了获得可接受的性能而不得不成为规范专家，压力巨大。

这些优化很难实现，往往容易出错，并且会导致不同运行时之间出现不一致的行为。Bun 的 “[Direct Streams](https://bun.sh/docs/api/streams#direct-readablestream)” 优化刻意采取了可观察、且非标准的方式，几乎完全绕过了规范中的大量机制。Cloudflare Workers 的 [`IdentityTransformStream`](https://developers.cloudflare.com/workers/runtime-apis/streams/transformstream/) 为“直通型”转换提供了快速路径，但它是 Workers 特有的，并且实现了一些对于标准 `TransformStream` 来说并不存在的行为。每个运行时都有自己的一套技巧，而自然的趋势就是走向非标准方案，因为很多时候只有这样才能把性能做快。

这种碎片化会伤害可移植性。即使代码使用的是“标准”API，在某个运行时上表现良好，也可能在另一个运行时上行为不同（或表现很差）。运行时实现者的复杂度负担非常沉重，而这些细微的行为差异也会给试图编写跨运行时代码的开发者带来摩擦，尤其是那些维护必须在多种运行时环境中高效运行的框架的人。

还必须强调的是，许多优化只可能发生在规范中那些对用户代码不可观测的部分。另一种选择（比如 Bun 的 “Direct Streams”）则是有意偏离规范所定义的可观测行为。这就意味着优化常常显得“不完整”：在某些场景有效、在另一些场景无效；在某些运行时有效、在另一些运行时无效，等等。每出现一种这样的情况，都会进一步增加 Web streams 方案整体上难以持续的复杂度——这也是为什么大多数运行时实现者在通过一致性测试之后，很少再投入大量精力继续改进其 streams 实现。

实现者不应该需要这样层层翻越障碍。当你发现为了获得还算合理的性能，不得不放松或绕过规范语义时，这表明规范本身出了问题。一个设计良好的流式 API 应该默认就是高效的，而不是要求每个运行时都去发明自己的“逃生舱口”。

    
      
### 合规负担

      
        
      
    
    
复杂的规范会带来复杂的边界情况。[streams 的 Web Platform Tests](https://github.com/web-platform-tests/wpt/tree/master/streams) 覆盖了 70 多个测试文件。全面测试当然是好事，但真正耐人寻味的是：到底有哪些东西需要被测试。

看看实现必须通过的一些更晦涩的测试：
- 
原型污染防御：有一个测试会修改 `Object.prototype.`then，以拦截 Promise 的 resolve，然后验证 `pipeTo()` 和 `tee()` 操作不会通过原型链泄露内部值。这个安全属性之所以需要测试，只是因为规范内部大量依赖 Promise，从而创造出了攻击面。

- 
拒绝 WebAssembly 内存：BYOB 读取必须显式拒绝由 WebAssembly 内存支持（backed）的 ArrayBuffer。这类缓冲区看起来像普通 buffer，但无法被 transfer。这个边界情况源自规范的 buffer 分离（detachment）模型——如果 API 更简单，就不需要处理它。
```

- **状态机冲突导致的崩溃回归：** 有一个测试专门检查：在调用 `enqueue()` 之后再调用 `byobRequest.respond()` 不会让运行时崩溃。这个调用顺序会在内部状态机中制造一次冲突——`enqueue()` 会完成（fulfill）挂起的读取操作，并且应当使 `byobRequest` 失效；但为了覆盖一种非常可能发生的情况（开发者并没有正确使用这套复杂 API），实现必须能够优雅地处理随后发生的 `respond()` 调用，而不是因此破坏内存。

这些并不是测试作者凭空捏造的刻意场景。它们是规范设计带来的后果，并且反映了真实世界中的 bug。

对于运行时实现者来说，通过 WPT 测试套件意味着要处理大量复杂的边界情况——其中绝大多数应用代码永远也不会遇到。测试覆盖的不只是“顺利路径”（happy path），还包括读者、写者、控制器、队列、策略以及将它们全部连接起来的 Promise 机制之间，各种交互组合的完整矩阵。

更简单的 API 意味着更少的概念、概念之间更少的相互作用，以及更少需要正确处理的边界情况，从而也能更有信心确保不同实现之间的行为确实一致。

### 要点总结

Web Streams 对用户和实现者而言都很复杂。规范的问题并不是 bug；它们是在完全按设计使用 API 时自然浮现出来的。这些问题也不是仅靠渐进式改进就能彻底修复的。它们源自一些根本性的设计选择。要改善现状，我们需要不同的基础。

## 一个更好的 streams API 是可能的

在不同运行时里多次实现 Web Streams 规范，并亲眼见到其中的痛点之后，我决定是时候探索：如果今天从第一性原理重新设计，一个更好、可替代的流式 API 可能会是什么样子。

接下来给出的是一个概念验证（proof of concept）：它不是一个完成的标准，不是可直接用于生产的库，甚至也不一定是一个关于“新东西”的具体提案；它更像是讨论的起点——用来说明 Web Streams 的问题并非流式处理本身所固有，而是特定设计选择导致的结果，而这些选择本可以不同。这个 API 是否就是正确答案并不那么重要；更重要的是，它是否能引发一场有建设性的讨论：我们究竟需要怎样的流式原语（streaming primitive）。

### 什么是 stream（流）？

在深入 API 设计之前，值得先问一句：什么是 stream？

从本质上讲，stream 只是随时间到达的一段数据序列。你不会一次性拿到全部数据，而是随着数据变得可用就增量地处理它。

Unix 管道也许是对这个想法最纯粹的表达：

````
`cat access.log | grep "error" | sort | uniq -c
```
`
````

数据从左往右流动。每个阶段读取输入、完成自己的工作、写出输出。你不需要获取什么“管道 reader”，也不需要管理什么“controller lock”。如果下游阶段很慢，上游阶段自然也会跟着慢下来。背压（backpressure）是模型中隐含的一部分，而不是一套需要学习（或者忽略）的额外机制。

在 JavaScript 里，“一串随时间到达的东西”这种概念，其实语言本身就已经有一个很自然的原语：异步可迭代对象（async iterable）。你可以用 `for await...of` 来消费它；而当你停止迭代时，也就停止了消费。

这正是新 API 想要保留的直觉：stream 应该像迭代那样自然，因为它本来就是迭代。Web Streams 的复杂性——reader、writer、controller、lock、队列策略（queuing strategies）——遮蔽了这种根本的简单性。更好的 API 应该让简单用例保持简单，只在确实需要时才引入复杂性。

### 设计原则

我围绕另一组原则构建了这个替代方案的概念验证。

#### Streams 是可迭代对象。

不再有带隐藏内部状态的自定义 `ReadableStream` 类。一个可读流只是一个 [`AsyncIterable<Uint8Array[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols)。你用 `for await...of` 来消费它。不需要获取 reader，也不需要管理 lock。

#### 拉动式（pull-through）转换

转换只有在消费者拉取（pull）时才会执行。没有急切求值（eager evaluation），也没有隐藏缓冲。数据会按需从源头流经各个转换，最后抵达消费者。如果你停止迭代，处理也就停止。

#### 显式背压

默认情况下，背压是严格的。当缓冲区满了，写入会被拒绝（reject），而不是悄悄继续累积。你可以配置其他策略——比如阻塞直到有空间、丢弃最旧的、丢弃最新的——但你必须显式做出选择。不再出现静默的内存增长。

#### 批量 chunk

stream 不再每次迭代只 yield 一个 chunk，而是 yield `Uint8Array[]`：也就是一组 chunk 的数组。这样可以把异步开销摊到多个 chunk 上，从而减少 Promise 创建，并降低热路径中的微任务（microtask）延迟。

#### 只处理字节

该 API 只处理字节（[`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)）。字符串会自动以 UTF-8 编码。不存在“值流（value stream）”与“字节流（byte stream）”的二分；如果你想流式传递任意 JavaScript 值，直接使用 async iterable 即可。虽然 API 使用 `Uint8Array`，但它会把 chunk 当作不透明的内容来对待：不支持部分消费（partial consumption），不支持 BYOB 模式，也不在流式机制内部做任何字节级别的操作。chunk 进来，chunk 出去；除非某个 transform 显式修改它们，否则内容保持不变。

#### 同步快速路径很重要

API 认识到同步数据源既必要又常见。应用不应该因为只提供了异步调度这一种选择，就被迫总是承担异步调度带来的性能开销。与此同时，同步与异步处理混用也可能很危险。同步路径应当始终作为一种可选项存在，并且必须始终是显式的。

### 新 API 实战

#### 创建与消费流

在 Web Streams 中，创建一个简单的生产者/消费者对，需要用到 `TransformStream`、手动编码，以及小心地管理锁：

```js
            const { readable, writable } = new TransformStream();
const enc = new TextEncoder();
const writer = writable.getWriter();
await writer.write(enc.encode("Hello, World!"));
await writer.close();
writer.releaseLock();

const dec = new TextDecoder();
let text = &#039;&#039;;
for await (const chunk of readable) {
  text += dec.decode(chunk, { stream: true });
}
text += dec.decode();
```

即便是这个相对干净的版本，也仍然需要：一个 `TransformStream`、手动的 `TextEncoder` 与 `TextDecoder`，以及显式释放锁。

下面是用新 API 实现的等价写法：

```js
            import { Stream } from &#039;new-streams&#039;;

// Create a push stream
const { writer, readable } = Stream.push();

// Write data — backpressure is enforced
await writer.write("Hello, World!");
await writer.end();

// Consume as text
const text = await Stream.text(readable);
```

这里的 readable 就只是一个异步可迭代对象（async iterable）。你可以把它传给任何期望接收异步可迭代对象的函数，包括 `Stream.text()`（它会收集并解码整个流）。

writer 的接口也很简单：`write()`、用于批量写入的 `writev()`、用于标记完成的 `end()`，以及用于错误场景的 `abort()`。基本就这些。

Writer 并不是一个具体的类。任何实现了 `write()`、`end()` 和 `abort()` 的对象都可以作为 writer，这使得你很容易去适配现有 API，或者在不需要继承（subclassing）的情况下创建专用实现。也没有那种复杂的 `UnderlyingSink` 协议：不需要 `start()`、`write()`、`close()`、`and abort()` 这类回调必须通过一个 controller 来协调；这个 controller 的生命周期与状态又独立于它所绑定的 `WritableStream`。

下面是一个简单的内存 writer，它会收集所有写入的数据：

```js
            // A minimal writer implementation — just an object with methods
function createBufferWriter() {
  const chunks = [];
  let totalBytes = 0;
  let closed = false;

  const addChunk = (chunk) => {
    chunks.push(chunk);
    totalBytes += chunk.byteLength;
  };

  return {
    get desiredSize() { return closed ? null : 1; },

    // Async variants
    write(chunk) { addChunk(chunk); },
    writev(batch) { for (const c of batch) addChunk(c); },
    end() { closed = true; return totalBytes; },
    abort(reason) { closed = true; chunks.length = 0; },

    // Sync variants return boolean (true = accepted)
    writeSync(chunk) { addChunk(chunk); return true; },
    writevSync(batch) { for (const c of batch) addChunk(c); return true; },
    endSync() { closed = true; return totalBytes; },
    abortSync(reason) { closed = true; chunks.length = 0; return true; },

    getChunks() { return chunks; }
  };
}

// Use it
const writer = createBufferWriter();
await Stream.pipeTo(source, writer);
const allData = writer.getChunks();
```

不需要去扩展基类、不需要实现抽象方法、也没有需要协调的 controller。它只是一个“形状”正确（具备所需方法）的对象而已。

#### 拉动式（pull-through）变换

在新的 API 设计下，变换（transform）在数据被消费之前不应该执行任何工作。这是一条基本原则。

```js
            // Nothing executes until iteration begins
const output = Stream.pull(source, compress, encrypt);

// Transforms execute as we iterate
for await (const chunks of output) {
  for (const chunk of chunks) {
    process(chunk);
  }
}
```

`Stream.pull()` 会创建一个惰性（lazy）管线。`compress` 与 `encrypt` 这两个变换只有在你开始迭代 output 时才会运行。每次迭代都会按需把数据从管线中拉过来（pull through）。

这与 Web Streams 的 [`pipeThrough()`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/pipeThrough) 有本质区别：`pipeThrough()` 在你搭好管道后，会立刻开始主动把数据从 source 泵送（pumping）到 transform。拉动式语义意味着你可以控制处理何时发生；停止迭代也就会停止处理。

变换可以是无状态的，也可以是有状态的。无状态变换只是一个函数：接收 chunks 并返回变换后的 chunks：

```js
            // Stateless transform — a pure function
// Receives chunks or null (flush signal)
const toUpperCase = (chunks) => {
  if (chunks === null) return null; // End of stream
  return chunks.map(chunk => {
    const str = new TextDecoder().decode(chunk);
    return new TextEncoder().encode(str.toUpperCase());
  });
};

// Use it directly
const output = Stream.pull(source, toUpperCase);
```

有状态变换则是一些简单对象：通过成员函数在多次调用之间维护状态：

```js
            // Stateful transform — a generator that wraps the source
function createLineParser() {
  // Helper to concatenate Uint8Arrays
  const concat = (...arrays) => {
    const result = new Uint8Array(arrays.reduce((n, a) => n + a.length, 0));
    let offset = 0;
    for (const arr of arrays) { result.set(arr, offset); offset += arr.length; }
    return result;
  };
```

```js
  return {
    async *transform(source) {
      let pending = new Uint8Array(0);
      
      for await (const chunks of source) {
        if (chunks === null) {
          // Flush: yield any remaining data
          if (pending.length > 0) yield [pending];
          continue;
        }
        
        // Concatenate pending data with new chunks
        const combined = concat(pending, ...chunks);
        const lines = [];
        let start = 0;

        for (let i = 0; i < combined.length; i++) {
          if (combined[i] === 0x0a) { // newline
            lines.push(combined.slice(start, i));
            start = i + 1;
          }
        }

        pending = combined.slice(start);
        if (lines.length > 0) yield lines;
      }
    }
  };
}

const output = Stream.pull(source, createLineParser());
```

对于那些在中止（abort）时需要做清理的变换，可以添加一个 abort 处理器：

```js
            // Stateful transform with resource cleanup
function createGzipCompressor() {
  // Hypothetical compression API...
  const deflate = new Deflater({ gzip: true });

  return {
    async *transform(source) {
      for await (const chunks of source) {
        if (chunks === null) {
          // Flush: finalize compression
          deflate.push(new Uint8Array(0), true);
          if (deflate.result) yield [deflate.result];
        } else {
          for (const chunk of chunks) {
            deflate.push(chunk, false);
            if (deflate.result) yield [deflate.result];
          }
        }
      }
    },
    abort(reason) {
      // Clean up compressor resources on error/cancellation
    }
  };
}
```

对于实现者来说，这里没有所谓的 Transformer 协议（带有 `start()`、`transform()`、`flush()` 方法），也没有把控制器协调逻辑传进一个 `TransformStream` 类里，让它依赖自身隐藏的状态机和缓冲机制来运转。变换（transform）只是函数或简单对象：实现与测试都简单得多。

#### 明确的背压策略

当一个有界缓冲区被写满，而生产者还想继续写入时，你能做的事情其实只有几种：
- 拒绝写入：拒绝接收更多数据
- 等待：阻塞直到有空间可用
- 丢弃旧数据：逐出已经缓冲的数据来腾出空间
- 丢弃新数据：丢掉即将写入的数据

就这些。任何其他做法，要么只是这些策略的变体（比如“扩容缓冲区”，本质上只是把选择往后拖），要么就是特定领域的逻辑，不应该被塞进通用的流式原语（streaming primitive）里。Web Streams 目前总是默认选择“等待（Wait）”。

新的 API 让你必须在这四种策略中显式选择一种：
- `strict`（默认）：当缓冲区已满且待处理写入（pending writes）过多时，拒绝写入。它能捕捉“发完就不管（fire-and-forget）”这类生产者无视背压的模式。
- `block`：写入会等待直到缓冲区有空间。适用于你信任生产者会正确地 `await` 写入的场景。
- `drop-oldest`：丢弃最旧的已缓冲数据来腾出空间。适用于实时数据流（live feeds），因为过期数据会迅速失去价值。
- `drop-newest`：在满载时丢弃新进来的数据。适用于你希望处理已有数据、避免被大量新数据压垮的场景。

```js
            const { writer, readable } = Stream.push({
  highWaterMark: 10,
  backpressure: &#039;strict&#039; // or &#039;block&#039;, &#039;drop-oldest&#039;, &#039;drop-newest&#039;
});
```

不再需要指望生产者会“自觉配合”。你选择的策略决定了缓冲区写满时会发生什么。

下面展示了当生产者写入速度快于消费者读取速度时，每种策略各自的行为：

```js
            // strict: Catches fire-and-forget writes that ignore backpressure
const strict = Stream.push({ highWaterMark: 2, backpressure: &#039;strict&#039; });
strict.writer.write(chunk1);  // ok (not awaited)
strict.writer.write(chunk2);  // ok (fills slots buffer)
strict.writer.write(chunk3);  // ok (queued in pending)
strict.writer.write(chunk4);  // ok (pending buffer fills)
strict.writer.write(chunk5);  // throws! too many pending writes

// block: Wait for space (unbounded pending queue)
const blocking = Stream.push({ highWaterMark: 2, backpressure: &#039;block&#039; });
await blocking.writer.write(chunk1);  // ok
await blocking.writer.write(chunk2);  // ok
await blocking.writer.write(chunk3);  // waits until consumer reads
await blocking.writer.write(chunk4);  // waits until consumer reads
await blocking.writer.write(chunk5);  // waits until consumer reads

// drop-oldest: Discard old data to make room
const dropOld = Stream.push({ highWaterMark: 2, backpressure: &#039;drop-oldest&#039; });
await dropOld.writer.write(chunk1);  // ok
await dropOld.writer.write(chunk2);  // ok
await dropOld.writer.write(chunk3);  // ok, chunk1 discarded

// drop-newest: Discard incoming data when full
const dropNew = Stream.push({ highWaterMark: 2, backpressure: &#039;drop-newest&#039; });
await dropNew.writer.write(chunk1);  // ok
await dropNew.writer.write(chunk2);  // ok
await dropNew.writer.write(chunk3);  // silently dropped
```

#### 明确的多消费者模式

```js
            // Share with explicit buffer management
const shared = Stream.share(source, {
  highWaterMark: 100,
  backpressure: &#039;strict&#039;
});

const consumer1 = shared.pull();
const consumer2 = shared.pull(decompress);
```

相比 `tee()` 那种带有隐藏的无界缓冲区的做法，这里提供的是显式的多消费者原语。`Stream.share()` 是基于拉取（pull-based）的：消费者从共享源中拉取数据，而你可以预先配置缓冲上限与背压策略。

此外还有 `Stream.broadcast()`，用于基于推送（push-based）的多消费者场景。两者都要求你认真思考当不同消费者的处理速度不一致时会发生什么，因为这确实是一个真实存在的问题，不应该被隐藏起来。

#### 同步/异步分离
```

并非所有流式（streaming）工作负载都涉及 I/O。当你的数据源在内存中、变换都是纯函数时，引入 async 机制只会增加开销而没有收益。你是在为“等待”的协调成本买单，但这种等待并不会带来任何好处。

新 API 提供了完整的同步并行版本：`Stream.pullSync()`、`Stream.bytesSync()`、`Stream.textSync()` 等等。如果你的数据源和所有变换都是同步的，你可以在整个管线里不创建任何一个 promise。

```js
            // Async — when source or transforms may be asynchronous
const textAsync = await Stream.text(source);

// Sync — when all components are synchronous
const textSync = Stream.textSync(source);
```

下面是一个完整的同步管线示例——压缩、变换与消费，全程 0 async 开销：

```js
            // Synchronous source from in-memory data
const source = Stream.fromSync([inputBuffer]);

// Synchronous transforms
const compressed = Stream.pullSync(source, zlibCompressSync);
const encrypted = Stream.pullSync(compressed, aesEncryptSync);

// Synchronous consumption — no promises, no event loop trips
const result = Stream.bytesSync(encrypted);
```

整个管线在一次调用栈中执行完毕。不创建 promises，不会发生 microtask 队列调度，也不会因为短生命周期的 async 机制而增加 GC 压力。对于解析、压缩，或对内存数据做变换这类 CPU 密集型工作负载，这种方式可能显著快于等价的 Web streams 代码——后者即便每个组件都是同步的，也会强制引入 async 边界。

Web streams 没有同步路径。即使你的数据源已经就绪、变换是纯函数，你仍然要在每次操作中付出 promise 创建和 microtask 调度的成本。在确实需要等待的场景下，promises 非常棒，但它们并不总是必要。这个新 API 让你在需要的时候可以保持在同步世界里。

#### 在这种方案与 Web streams 之间搭桥

基于 async iterator 的方式，为这种替代方案与 Web streams 之间提供了一座天然的桥梁。当你从 ReadableStream 迁移到这种新方案时，如果 ReadableStream 被设置为产出字节（bytes），那么只要把 readable 作为输入传进去就能按预期工作：

```js
            const readable = getWebReadableStreamSomehow();
const input = Stream.pull(readable, transform1, transform2);
for await (const chunks of input) {
  // process chunks
}
```

而当你要适配到 ReadableStream 时，由于这种替代方案产出的是“分批的 chunks”，就需要多做一点点工作；不过适配层同样很直接：

```js
            async function* adapt(input) {
  for await (const chunks of input) {
    for (const chunk of chunks) {
      yield chunk;
    }
  }
}

const input = Stream.pull(source, transform1, transform2);
const readable = ReadableStream.from(adapt(input));
```

#### 这如何解决前面提到的真实世界失败案例

- **未被消费的 body：** 拉取（pull）语义意味着在你开始迭代之前什么都不会发生。没有隐藏的资源占用。如果你不消费一个 stream，就不会有后台机制把连接一直保持打开。

- **`tee()` 的内存悬崖：** `Stream.share()` 需要显式配置缓冲区。你需要预先选择 `highWaterMark` 和背压策略：不再出现当消费者速度不一致时悄悄发生的无界增长。

- **Transform 背压缺口：** 拉取式（pull-through）变换按需执行。数据不会在中间缓冲区里级联堆积；只有当消费者拉取时才会流动。停止迭代，就停止处理。

- **SSR 中的 GC 抖动：** 批量 chunks（`Uint8Array[]`）能摊薄 async 开销。通过 `Stream.pullSync()` 的同步管线则能为 CPU 密集型工作负载彻底消除 promise 分配。

### 性能

这些设计选择会带来性能影响。下面是该“可能的替代方案”的参考实现与 Web streams 的基准对比（Node.js v24.x，Apple M1 Pro，10 次运行取平均）：

**场景** | **替代方案** | **Web streams** | **差异**
---|---:|---:|---:
小 chunks（1KB × 5000） | ~13 GB/s | ~4 GB/s | ~3× 更快
极小 chunks（100B × 10000） | ~4 GB/s | ~450 MB/s | ~8× 更快
异步迭代（8KB × 1000） | ~530 GB/s | ~35 GB/s | ~15× 更快
串联 3× transforms（8KB × 500） | ~275 GB/s | ~3 GB/s | **~80–90× 更快**
高频（64B × 20000） | ~7.5 GB/s | ~280 MB/s | ~25× 更快

其中“串联变换”的结果尤其惊人：拉取式语义消除了困扰 Web streams 管线的中间缓冲问题。Web streams 中每个 `TransformStream` 都会急切地填充自己的内部缓冲；而在这里，数据会按需从消费者一路流到数据源。

当然，客观来说，Node.js 目前确实还没有在充分优化其 Web streams 实现的性能上投入太多精力。只要针对那些热点路径做一些优化，Node.js 的性能结果很可能还有很大提升空间。即便如此，在 Deno 和 Bun 上运行这些基准测试，也同样显示：这种基于 iterator 的替代方案相比它们各自的 Web streams 实现也有显著性能提升。

浏览器基准（Chrome/Blink，3 次运行取平均）同样显示出一致的收益：

**场景** | **替代方案** | **Web streams** | **差异**
---|---:|---:|---:
推送 3KB chunks | ~135k ops/s | ~24k ops/s | ~5–6× 更快
推送 100KB chunks | ~24k ops/s | ~3k ops/s | ~7–8× 更快
3 个 transform 串联 | ~4.6k ops/s | ~880 ops/s | ~5× 更快
5 个 transform 串联 | ~2.4k ops/s | ~550 ops/s | ~4× 更快
`bytes()` 消费 | ~73k ops/s | ~11k ops/s | ~6–7× 更快
异步迭代 | ~1.1M ops/s | ~10k ops/s | **~40–100× 更快**

这些基准测试是在受控场景下衡量吞吐量的；实际环境中的性能取决于你的具体使用场景。Node.js 与浏览器的性能提升幅度之所以不同，反映的是各自运行时在 Web streams 上采取了不同的优化路径。

值得注意的是，这些基准测试是在对比：新 API 的一个纯 TypeScript/JavaScript 实现，与各运行时中 Web streams 的原生实现（JavaScript/C++/Rust）。新 API 的参考实现没有做任何性能优化工作；性能提升完全来自于设计本身。如果做成原生实现，很可能还会有进一步提升。

这些收益说明了基础设计选择如何叠加产生效果：批处理（batching）可以摊销异步开销；拉取语义（pull semantics）消除了中间缓冲；并且当数据可立即获得时，实现方可以自由走同步快速路径（synchronous fast paths）——这些因素共同起作用。

> “我们在提升 Node streams 的性能与一致性方面做了很多工作，但从零开始有一种独特的力量。新 streams 的方法拥抱现代运行时的现实，不背负历史包袱，这为更简单、更高性能、更一致的 streams 模型打开了大门。”
>
> —— Robert Nagy，Node.js TSC 成员、Node.js streams 贡献者

## 接下来是什么

我发布这篇文章是为了开启一场讨论。我哪些地方做对了？我遗漏了什么？有没有不适合这个模型的用例？这种方案的迁移路径应该是什么样的？目标是收集那些在 Web streams 上吃过苦、并且对更好的 API 应该长什么样有自己看法的开发者反馈。

### 你可以自己试试

这种替代方案目前已经有一个参考实现，可以在这里找到：<https://github.com/jasnell/new-streams>。

- API 参考：完整文档请看 [API.md](https://github.com/jasnell/new-streams/blob/main/API.md)
- 示例：[samples 目录](https://github.com/jasnell/new-streams/tree/main/samples) 里有常见模式的可运行代码

欢迎提 issue、发起讨论以及提交 pull request。如果你遇到我没覆盖到的 Web streams 问题，或者你看到了这种方法的不足，请告诉我。但再次强调，这里的目的不是说“大家都来用这个闪亮的新东西吧！”，而是要发起一场讨论：超越当前 Web Streams 的现状，回到第一性原理来思考。

Web streams 是一个很有雄心的项目：在当时没有其他方案的情况下，把流式处理带到了 Web 平台。设计它的人在 2014 年的约束条件下做出了合理的选择——那时还没有异步迭代（async iteration），也没有多年生产实践来暴露各种边界情况。

但从那以后，我们学到了很多。JavaScript 已经演进了。今天设计的流式 API 可以更简单、更贴合语言本身，并且能更明确地表达真正重要的事情，比如背压（backpressure）和多消费者（multi-consumer）行为。

我们值得拥有一个更好的 stream API。那么就来聊聊它应该是什么样子。

Cloudflare 的 Connectivity Cloud 能保护[整个企业网络](https://www.cloudflare.com/network-services/)，帮助客户高效构建[互联网规模的应用](https://workers.cloudflare.com/)，加速任何[网站或互联网应用](https://www.cloudflare.com/performance/accelerate-internet-applications/)，[抵御 DDoS 攻击](https://www.cloudflare.com/ddos/)，[阻挡黑客](https://www.cloudflare.com/application-security/)，并且还能在你迈向 [Zero Trust](https://www.cloudflare.com/products/zero-trust/) 的旅程中提供帮助。

从任何设备访问 [1.1.1.1](https://one.one.one.one/)，即可开始使用我们的免费应用，让你的互联网更快、更安全。

想进一步了解我们“帮助构建更好的互联网”的使命，请[从这里开始](https://www.cloudflare.com/learning/what-is-cloudflare/)。如果你正在寻找新的职业方向，可以看看[我们的开放职位](https://www.cloudflare.com/careers)。server-island-start [标准（Standards）](https://blog.cloudflare.com/tag/standards/)[JavaScript](https://blog.cloudflare.com/tag/javascript/)[TypeScript](https://blog.cloudflare.com/tag/typescript/)[开源（Open Source）](https://blog.cloudflare.com/tag/open-source/)[Cloudflare Workers](https://blog.cloudflare.com/tag/workers/)[Node.js](https://blog.cloudflare.com/tag/node-js/)[性能（Performance）](https://blog.cloudflare.com/tag/performance/)[API](https://blog.cloudflare.com/tag/api/)