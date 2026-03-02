原文：Why is WebAssembly a second  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 为什么 WebAssembly 是二等公民

*本文是我在 2025 年于慕尼黑举行的*[*WebAssembly CG*](https://www.w3.org/community/webassembly/)*会议上所做演讲的扩展版本。*

自从 WebAssembly 在 2017 年发布[首个版本](https://blog.mozilla.org/en/mozilla/webassembly-in-browsers/)以来，它已经走了很长一段路。WebAssembly 的第一个版本就已经非常适合 C、C++ 这类底层语言，并且立刻让许多全新类型的应用能够高效地面向 Web 运行。

从那以后，WebAssembly CG 大幅扩展了这门语言的核心能力，新增了[共享内存](https://github.com/webassembly/threads)、[SIMD](https://github.com/webassembly/simd)、[异常处理](https://github.com/webassembly/exception-handling)、[尾调用](https://github.com/webassembly/tail-call)、[64 位内存](https://github.com/WebAssembly/spec/blob/wasm-3.0/proposals/memory64/Overview.md)以及 [GC 支持](https://github.com/webassembly/gc)；同时也加入了许多较小的改进，例如[批量内存指令](https://github.com/WebAssembly/bulk-memory-operations)、[多返回值](https://github.com/WebAssembly/multi-value)和[引用值](https://github.com/WebAssembly/spec/blob/wasm-3.0/proposals/function-references/Overview.md)。

这些新增能力让更多语言能够高效地以 WebAssembly 为目标进行编译。后续仍然还有不少重要工作要做，比如[栈切换](https://github.com/webassembly/stack-switching)和[改进线程模型](https://github.com/webassembly/shared-everything-threads)，但 WebAssembly 在很多方面已经缩小了与原生（native）之间的差距。

然而，它仍然给人一种“还缺了点什么”的感觉——某些东西阻碍了 WebAssembly 在 Web 上更广泛的采用。

造成这种情况的原因不止一个，但核心问题在于：**WebAssembly 在 Web 上是一门二等公民语言**。尽管新增了许多语言特性，WebAssembly 仍然没有像它本该做到的那样，与 Web 平台紧密集成。

这会带来糟糕的开发者体验，从而让开发者只在“不得不用”的时候才选择 WebAssembly。很多时候，JavaScript 更简单，也“足够好用”。结果就是：WebAssembly 的使用者往往是那些有充足资源、能证明投入合理性的大公司；这又进一步把 WebAssembly 的收益限制在更大 Web 社区中的一小部分人身上。

解决这个问题并不容易，而 CG 一直把重心放在扩展 WebAssembly 语言本身。现在这门语言已经明显成熟，是时候更认真地审视这一点了。我们会深入讨论这个问题，然后再谈谈 [WebAssembly Components](https://component-model.bytecodealliance.org/) 如何改善现状。

## 什么让 WebAssembly 成为二等公民？

从非常高的层面看，Web 平台中“脚本”这一部分的分层大致如下：

![](https://hacks.mozilla.org/wp-content/uploads/2026/02/WebPlatformLayering-250x266.jpg)

WebAssembly 可以直接与 JavaScript 交互，而 JavaScript 可以直接与 Web 平台交互。WebAssembly 也能访问 Web 平台，但只能借助 JavaScript 的一些特殊能力。JavaScript 是 Web 上的一等公民语言，而 WebAssembly 不是。

这并不是一个有意的或带恶意的设计决策；JavaScript 是 Web 最初的脚本语言，并且与平台一起共同演化。尽管如此，这种设计仍然会对 WebAssembly 的使用者产生重大影响。

那么，JavaScript 的这些“特殊能力”是什么？在今天的讨论中，主要有两项：

- 加载代码  
- 使用 Web API

### 加载代码

WebAssembly 的代码加载方式不必要地繁琐。加载 JavaScript 代码只需要把它放进一个 script 标签里就行：

````
`<script src="script.js"></script>`
````

目前 WebAssembly 还不支持放在 script 标签中，因此开发者需要使用 [WebAssembly JS API](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Using_the_JavaScript_API) 来手动加载并实例化代码。

```js
let bytecode = fetch(import.meta.resolve(&#039;./module.wasm&#039;));
let imports = { ... };
let { exports } =
  await WebAssembly.instantiateStreaming(bytecode, imports);
```

要使用哪一套 API 调用顺序相当晦涩，而且完成这个过程的方法不止一种；每种方式都有不同的权衡点，但大多数开发者并不清楚这些差异。一般来说，这个过程要么靠死记硬背，要么就交给工具替你生成。

好在已经有了 [esm-integration](https://github.com/webassembly/esm-integration) 提案：它如今已在打包工具（bundlers）里实现，我们也正在 Firefox 中[积极推进实现](https://bugzilla.mozilla.org/show_bug.cgi?id=wasm-esm-integration)。该提案允许开发者使用熟悉的 JS 模块系统，在 JS 代码中导入 WebAssembly 模块。

```js
import { run } from "/module.wasm";

run();
```

此外，它还允许通过带有 `type="module"` 的 script 标签直接加载 WebAssembly 模块：

````
`<script type="module" src="/module.wasm"></script>`
````

这让最常见的 WebAssembly 模块加载与实例化模式变得更顺畅。不过，即便它缓解了最初的上手难度，我们也很快会碰到真正的问题。

### 使用 Web API

在 JavaScript 里使用 Web API 简单到像这样一行就能完成：

````
`console.log("hello, world");`
````

但对于 WebAssembly，情况要复杂得多。WebAssembly 无法直接访问 Web API，必须借助 JavaScript 才能使用它们。

同样是一行的 `console.log` 程序，在 WebAssembly 中需要下面这样的 JavaScript 文件：

```js
// We need access to the raw memory of the Wasm code, so
// create it here and provide it as an import.
let memory = new WebAssembly.Memory(...);
```

```js
function consoleLog(messageStartIndex, messageLength) {
  // 字符串存储在 Wasm 内存中，但我们需要把它
  // 解码成一个 JS 字符串，因为 DOM API
  // 需要的就是这种格式。
  let messageMemoryView = new UInt8Array(
      memory.buffer, messageStartIndex, messageLength);
  let messageString =
    new TextDecoder().decode(messageMemoryView);

  // Wasm 无法获取 `console` 这个全局对象，也无法进行
  // 属性查找，所以我们在这里处理。
  return console.log(messageString);
}

// 通过 import 将封装后的 Web API
// 传给 Wasm 代码。
let imports = {
  "env": {
    "memory": memory,
    "consoleLog": consoleLog,
  },
};
let { instance } =
  await WebAssembly.instantiateStreaming(bytecode, imports);

instance.exports.run();

```

以及下面这个 WebAssembly 文件：

```wat

(module
  ;; 从 JS 代码导入内存
  (import "env" "memory" (memory 0))

  ;; 导入 JS 的 consoleLog 包装函数
  (import "env" "consoleLog"
    (func $consoleLog (param i32 i32))
  )

  ;; 导出一个 run 函数
  (func (export "run")
    (local i32 $messageStartIndex)
    (local i32 $messageLength)

    ;; 在 Wasm 内存中创建一个字符串，并存到局部变量里
    ...

    ;; 调用 consoleLog 方法
    local.get $messageStartIndex
    local.get $messageLength
    call $consoleLog
  )
)

像这样的代码通常被称为 “bindings”（绑定）或 “glue code”（胶水代码），它充当你的源语言（C++、Rust 等）与 Web API 之间的桥梁。

这些胶水代码负责把 WebAssembly 的数据重新编码成 JavaScript 数据，反过来也一样。比如，当需要把一个字符串从 JavaScript 返回给 WebAssembly 时，胶水代码可能需要在 WebAssembly 模块里调用 malloc 函数，并把字符串按返回地址重新编码写入；之后模块还需要负责在合适的时候调用 free 释放内存。

这些工作既繁琐、又套路化，而且很难手写，所以通常会用诸如 [embind](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html) 或 [wasm-bindgen](https://github.com/wasm-bindgen/wasm-bindgen) 之类的工具来自动生成这些胶水代码。这能让编写过程更顺畅，但也会给构建流程增加复杂度——而原生平台通常并不需要这些复杂步骤。此外，这种构建复杂度还是与语言强相关的：Rust 代码需要的绑定和 C++ 代码不同，诸如此类。

当然，胶水代码在运行时也有成本。你需要分配并由垃圾回收处理 JavaScript 对象，需要重新编码字符串，需要反序列化结构体。其中一部分成本对任何绑定系统来说都是不可避免的，但也有很大一部分并非如此。这是一种普遍存在的开销：你只要在 JavaScript 和 WebAssembly 的边界上交互就要付出代价，即便[调用本身已经很快](https://hacks.mozilla.org/2018/10/calls-between-javascript-and-webassembly-are-finally-fast-%F0%9F%8E%89/)。

这就是大多数人在问[“Wasm 什么时候才能支持 DOM？”](https://spawn-queue.acm.org/doi/pdf/10.1145/3746174)时真正想表达的意思。WebAssembly 其实已经可以访问任何 Web API，但前提是你得写 JavaScript 胶水代码。

## 为什么这很重要？

从技术角度看，现状是可行的。WebAssembly 能在 Web 上运行，也已经有很多人成功用它交付了软件。

但从普通 Web 开发者的角度来看，现状并不理想。WebAssembly 在 Web 上用起来过于复杂，而且你总会有一种强烈的感觉：自己拿到的是“二等体验”。以我们的经验来看，WebAssembly 更像是一项“高级用户功能”，普通开发者并不会去用——即便从技术上讲，它可能才是对他们项目更好的选择。

对于一个刚开始使用 JavaScript 的人来说，典型的开发体验大概是这样的：

![](https://hacks.mozilla.org/wp-content/uploads/2026/02/JSDevEx-250x175.jpg)

你会沿着一条相当平滑的曲线前进：随着项目规模扩大，逐步使用更复杂的特性。

相比之下，对于一个刚开始使用 WebAssembly 的人来说，典型的开发体验更像是这样：

![](https://hacks.mozilla.org/wp-content/uploads/2026/02/WasmDevEx-250x183.jpg)

你一上来就得攀爬一面“高墙”，要把许多不同的部件费力地拼在一起才能工作。最终往往只有在大型项目中，这么做才算值得。

为什么会这样？原因有好几个，而且它们都直接源自于：WebAssembly 在 Web 上是一个“二等语言”。

### 1. 编译器很难为 Web 提供一等支持

任何以 Web 为目标的平台语言，都不能只生成一个 Wasm 文件；它还必须生成一个配套的 JS 文件，用来加载 Wasm 代码、实现对 Web API 的访问，并处理一长串其他问题。想要支持 Web 的每一种语言都得把这套工作重新做一遍，而且这套成果也无法复用到非 Web 平台上。

像 Clang/LLVM 这样的上游编译器并不想知道任何关于 JS 或 Web 平台的事情——而且这不只是“缺少投入”那么简单。生成并维护 JS 与 Web 的胶水代码是一项专业技能，对于本就分身乏术的维护者来说，很难证明这件事值得投入。他们只想生成一个单一的二进制文件，最好还是一种标准化格式，并且能用于 Web 之外的平台。

### 2. 标准编译器生成的 WebAssembly 并不能在 Web 上正常工作

结果就是：Web 上对 WebAssembly 的支持往往由第三方、非官方的工具链发行版来提供，用户需要自己去找到它们并学习使用。而真正的一等体验，应该从用户已经熟悉、并且已经安装在机器上的那套工具开始。
```

这不幸是许多开发者在开始使用 WebAssembly 时遇到的第一个路障。他们以为只要安装了 `rustc`，再传一个 `--target=wasm` 标志，就能得到可以在浏览器里加载的东西。你这么做或许确实能生成一个 WebAssembly 文件，但它不会包含任何必需的平台集成。就算你摸索出了用 JS API 来加载该文件的方法，它也会因为一些难以解释、而且很难调试的原因而失败。你真正需要的是一个非官方的工具链发行版，它会替你实现这些平台集成。

### 3. Web 文档是为 JavaScript 开发者写的

与大多数技术平台相比，Web 平台拥有令人惊叹的[文档](https://developer.mozilla.org/en-US/)。不过，其中大部分内容都是以 JavaScript 为中心编写的。如果你不了解 JavaScript，那么你在理解如何使用大多数 Web API 时会困难得多。

一个想要使用新 Web API 的开发者，必须先从 JavaScript 的视角理解它，然后再把它“翻译”成其源语言里可用的类型与 API。工具链开发者可以尝试为他们的语言手动翻译现有的 Web 文档，但这是一件既繁琐又容易出错、而且无法规模化的工作。

### 4. 调用 Web API 仍然可能很慢

如果你去看上面那次 `console.log` 调用所对应的全部 JS 胶水代码，你会发现这里有大量开销。各大引擎已经花了很多时间来[优化这个问题](https://github.com/webassembly/js-string-builtins)，并且还有更多工作正在[推进中](https://github.com/WebAssembly/custom-descriptors/blob/main/proposals/custom-descriptors/Overview.md)。然而，这个问题依然存在。它不会影响每一种工作负载，但这是每个 WebAssembly 用户都需要留心的点。

要对它做基准测试并不容易，不过我们在 2020 年做过一次[实验](https://docs.google.com/document/d/13XsHiQr91JQEmbVSnQsufzx8Bu1ADYPwK-y6JNh0iww/edit?tab=t.0)，用来精确测量在真实世界的 DOM 应用中，JS 胶水代码带来的开销。我们在[实验性的 Dodrio Rust 框架](https://hacks.mozilla.org/2019/03/fast-bump-allocated-virtual-doms-with-rust-and-wasm/)里实现了经典的 [TodoMVC](https://todomvc.com/) 基准，并测量了不同调用 DOM API 的方式。

Dodrio 非常适合做这件事，因为它会把所有需要的 DOM 修改先计算出来，再与真正“应用这些修改”的过程分离开。这让我们能够在保持基准测试其余部分完全相同的情况下，仅通过替换“应用 DOM 变更列表”的函数，来精确衡量 JS 胶水代码的影响。

我们测试了两种不同的实现：

- **“Wasm + JS glue”**：一个 WebAssembly 函数在循环中读取变更列表，然后请求 JS 胶水代码逐条应用每一次变更。这代表了当下 WebAssembly 的性能表现。

- **“Wasm only”**：一个 WebAssembly 函数在循环中读取变更列表，然后使用一种跳过 JS 胶水代码的、实验性的直接 DOM 绑定来应用变更。这代表了如果我们能跳过 JS 胶水代码时，WebAssembly 可能达到的性能表现。

![](https://hacks.mozilla.org/wp-content/uploads/2026/02/Screenshot-2026-02-25-at-2.22.23-PM-250x166.png)

当我们能够移除 JS 胶水代码后，应用 DOM 变更的耗时下降了 *45%*。DOM 操作本来就可能很昂贵；WebAssembly 用户无法在此之上再承担 2 倍的性能“税”。而且正如这个实验所示，移除这部分开销是可行的。

### 5. 你始终需要理解 JavaScript 这一层

有句说法是：“[抽象总是会泄漏](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/)”。

在 Web 上使用 WebAssembly 的当前最先进做法，是每种语言都用 JavaScript 构建一套对 Web 平台的抽象。但这些抽象会泄漏。如果你在 Web 上以比较严肃的方式使用 WebAssembly，最终总会遇到某个时刻：你必须阅读或编写自己的 JavaScript，才能让某些东西正常工作。

这会增加一个概念层，对开发者来说是一种负担。按理说，掌握源语言与 Web 平台应该就足够了。然而对 WebAssembly 来说，我们还要求用户同时懂 JavaScript，才能成为熟练开发者。

## 我们该如何修复这些问题？

这是一个复杂的技术与社会问题，并不存在单一解法。并且，对于“WebAssembly 最应该优先修复的问题是什么”，我们也存在彼此竞争的优先级。

不妨问问自己：在一个理想世界里，什么能帮助我们？

如果我们有一种东西，它是：

- 一个标准化的、自包含的可执行制品（artifact）
- 被多种语言与工具链支持
- 能处理 WebAssembly 代码的加载与链接
- 支持使用 Web API

如果这样的东西存在，语言就可以生成这些制品，而浏览器可以直接运行它们，完全不需要 JavaScript 介入。这种格式会更容易被各语言支持，并且有可能无需第三方发行版，就能直接存在于标准的上游编译器、运行时、工具链以及常用包之中。实际上，我们就能从“每种语言都用 JavaScript 重新实现 Web 平台集成”的世界，走向“共享一套由浏览器直接内建的公共集成”的世界。

显然，设计并验证这样的方案会需要大量工作！好在，我们已经有一个符合这些目标、并且已经开发多年的提案：[WebAssembly Component Model（组件模型）](https://component-model.bytecodealliance.org/)。

## 什么是 WebAssembly 组件（Component）？

就本文的语境而言，一个 WebAssembly 组件定义了一个高层 API，而这个 API 由一捆（bundle）底层 WebAssembly 代码来实现。它是 WebAssembly CG 标准化轨道上的一项[提案](https://github.com/WebAssembly/component-model/)，从 [2021](https://docs.google.com/presentation/d/1PSC3Q5oFsJEaYyV5lNJvVgh-SNxhySWUqZ6puyojMi8/edit?slide=id.p#slide=id.p) 年开始开发至今。

即使在今天，WebAssembly 组件也已经……

- 可以用[多种不同的编程语言](https://github.com/yoshuawuyts/awesome-wasm-components?tab=readme-ov-file#programming-language-support)来创建。

- 可以在[多种不同的运行时](https://github.com/yoshuawuyts/awesome-wasm-components?tab=readme-ov-file#host-runtimes)中执行（包括今天就能在浏览器里运行——借助 polyfill）。

- 可以彼此链接，从而在不同语言之间实现代码复用。

- 允许 WebAssembly 代码直接调用 Web API。

如果你想了解更多细节，可以查看 [Component Book](https://component-model.bytecodealliance.org/)，或观看 [“What is a Component?”](https://www.youtube.com/watch?v=tAACYA1Mwv4)。

我们认为，WebAssembly Components 有潜力让 WebAssembly 在 Web 平台上获得“第一等公民”的体验，并成为上文所描述的那条缺失链路。

## 它们可能如何工作？

让我们尝试只使用 WebAssembly Components、完全不使用 JavaScript，来复刻前面那个 `console.log` 的示例。

*注意：WebAssembly Components 与 Web 平台之间的交互尚未完全设计完成，相关工具链也仍在积极开发中。*

*请将其视为一种对“未来可能如何实现”的愿景，而不是教程或承诺。*

第一步是指定我们的应用需要哪些 API。这通过一种称为 [WIT](https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md) 的 [IDL（接口描述语言）](https://en.wikipedia.org/wiki/Interface_description_language)来完成。在这个例子里，我们需要 [Console API](https://developer.mozilla.org/en-US/docs/Web/API/Console_API)。我们可以通过指定接口名称将其导入。

```wit
component {
  import std:web/console;
}
```

`std:web/console` 这个接口今天并不存在，但从设想上，它会来自浏览器用来描述 Web API 的官方 [WebIDL](https://developer.mozilla.org/en-US/docs/Glossary/WebIDL)。这个特定接口可能会长这样：

```wit
package std:web;

interface console {
  log: func(msg: string);
  ...
}
```

有了上述接口后，我们就可以在编写会编译成 WebAssembly Component 的 Rust 程序时使用它们：

```rust
use std::web::console;

fn main() {
  console::log(“hello, world”);
}
```

一旦我们有了一个 component，就可以用一个 script 标签把它加载到浏览器中。

````
`<script type="module" src="component.wasm"></script>`
````

然后就结束了！浏览器会自动加载该 component，直接绑定原生 Web API（不需要任何 JS 胶水代码），并运行这个 component。

如果你的整个应用都用 WebAssembly 编写，这当然很棒。然而，大多数 WebAssembly 的使用场景都是“混合应用”的一部分，其中也包含 JavaScript。我们也希望简化这种用法。Web 平台不应该被分割成彼此无法交互的“孤岛”。好在，WebAssembly Components 也通过支持跨语言互操作性来解决这个问题。

让我们创建一个 component，导出一个图像解码器，供 JavaScript 代码使用。首先我们需要写一个接口来描述这个图像解码器：

```wit
interface image-lib {
  record pixel {
    r: u8;
    g: u8;
    b: u8;
    a: u8;
  }

  resource image {
    from-stream:
      static async func(bytes: stream<u8>) -> result<image>;
    get: func(x: u32, y: u32) -> pixel;
  }
}

component {
    export image-lib;
}
```

完成后，我们就可以用[任何支持 components 的语言](https://github.com/yoshuawuyts/awesome-wasm-components?tab=readme-ov-file#programming-language-support)来编写该 component。选择哪种语言取决于你要构建什么，或者你需要用哪些库。对于这个示例，我会把图像解码器的实现留给读者作为练习。

然后，这个 component 可以在 JavaScript 中作为模块加载。我们定义的图像解码器接口对 JavaScript 是可访问的，用起来就像你在导入一个 JavaScript 库来完成这项工作一样。

```js
import { Image } from "image-lib.wasm";

let byteStream = (await fetch("/image.file")).body;
let image = await Image.fromStream(byteStream);

let pixel = image.get(0, 0);

console.log(pixel); // { r: 255, g: 255, b: 0, a: 255 }
```

## 下一步

就目前而言，我们认为 WebAssembly Components 会是 Web 向正确方向迈出的一步。Mozilla 正在与 WebAssembly CG 合作设计 WebAssembly Component Model。Google 也在[此时](https://issues.chromium.org/issues/474661098)对其进行评估。

如果你有兴趣亲自试试，可以先[学习如何构建你的第一个 component](https://component-model.bytecodealliance.org/language-support.html)，然后使用 [Jco](https://github.com/bytecodealliance/jco) 在浏览器中试用，或使用命令行工具 [Wasmtime](https://wasmtime.dev/) 来运行。工具链仍处于快速开发阶段，欢迎贡献与反馈。如果你对仍在制定中的规范本身感兴趣，可以查看 [component-model 提案仓库](https://github.com/webassembly/component-model)。

WebAssembly 自 2017 年首次发布以来已经走过了很长的路。我认为，如果我们能把它从一种“高级用户”功能，变成普通开发者也能受益的东西，最精彩的部分或许还在后头。

---

### 关于

Ryan Hunt

- **[https://eqrion.net/](https://eqrion.net/)

[更多 Ryan Hunt 的文章…](https://hacks.mozilla.org/author/rhuntmozilla-com/)

## 发现优质的 Web 开发资源

订阅 Mozilla 开发者通讯（Mozilla Developer Newsletter）：

E-mail

我同意 Mozilla 按照这份[隐私政策](https://www.mozilla.org/privacy/)所述方式处理我的信息。

立即订阅

## 谢谢！请查看你的收件箱以确认订阅。

如果你之前还没有确认订阅过与 Mozilla 相关的新闻通讯，你可能需要先进行确认。请查看你的收件箱或垃圾邮件过滤器，留意我们发给你的一封邮件。