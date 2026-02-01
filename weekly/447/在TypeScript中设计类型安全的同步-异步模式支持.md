# 在 TypeScript 中设计类型安全的同步/异步模式支持

> 原文： [Designing type-safe sync/async mode support in TypeScript](https://hackers.pub/@hongminhee/2026/typescript-sync-async-type-safety)
>
> 翻译： [樱吹雪](https://juejin.cn/user/1179091901098269)

我最近为 Optique 添加了同步/异步模式支持，[Optique](https://optique.dev/) 是一个我开发的类型安全的 TypeScript CLI 解析器。事实证明，这是我实现过的最棘手的功能之一——仅 `object()` 组合子（combinator）就需要从其所有子解析器中计算出一个合并后的模式，而 TypeScript 的类型推导总是遇到各种边缘情况。

## 什么是 Optique？

Optique 是一个用于 TypeScript 的类型安全、组合式 CLI 解析器，灵感来自 Haskell 的 [optparse-applicative](https://github.com/pcapriotti/optparse-applicative)。它不使用装饰器或构建者模式，而是让你通过组合子将小型解析器组合成大型解析器，并由 TypeScript 自动推导结果类型。

先来快速体验一下：

```typescript
import { object } from '@optique/core/constructs'
import { argument, option } from '@optique/core/primitives'
import { string, integer } from '@optique/core/valueparser'
import { run } from '@optique/run'

const cli = object({
  name: argument(string()),
  count: option('-n', '--count', integer()),
})

// TypeScript 推导结果: { name: string; count: number | undefined }
const result = run(cli) // 默认为同步
```

这种类型推导适用于任意深度的组合——在大多数情况下，你不需要显式的类型注解。

## 缘起

Lucas Garron ([@lgarron](https://mastodon.social/@lgarron)) 提了一个 issue，请求为 Shell 补全（shell completions）提供异步支持。他希望通过运行像 `git for-each-ref` 这样的 Shell 命令来列出分支和标签，从而提供 Tab 键补全建议。

```typescript
// Lucas 的例子：并行获取 Git 分支和标签
const [branches, tags] = await Promise.all([
  $`git for-each-ref --format='%(refname:short)' refs/heads/`.text(),
  $`git for-each-ref --format='%(refname:short)' refs/tags/`.text(),
])
```

起初，我并不喜欢这个主意。Optique 的整个 API 都是同步的，这使得它更易于推理，并且避免了“异步传染（async infection）”问题（即一个异步函数迫使上游所有内容都变成异步）。我认为 Shell 补全应该是瞬间完成的，如果你需要异步数据，应该在启动时进行缓存。

但 Lucas 反驳了这一点。文件系统本身就是一个数据库，许多有用的补全本质上就需要异步工作——Git 的引用（refs）不断变化，对于大型仓库来说，在启动时预缓存所有内容是无法扩展的。这确实是个合理的观点。

## 我需要解决的问题

那么，如何在保持类型安全的同时，在一个可组合的解析器库中同时支持同步和异步执行模式呢？

关键需求如下：

- `parse()` 返回 `T` 或 `Promise<T>`
- `complete()` 返回 `T` 或 `Promise<T>`
- `suggest()` 返回 `Iterable<T>` 或 `AsyncIterable<T>`
- 在组合解析器时，如果任何一个子解析器是异步的，组合后的结果必须是异步的
- 现有的同步代码应无需更改即可继续工作

第四点是最棘手的。考虑以下情况：

```typescript
const syncParser = flag('--verbose')
const asyncParser = option('--branch', asyncValueParser)

// 这个类型是什么？
const combined = object({ verbose: syncParser, branch: asyncParser })
```

由于其中一个字段是异步的，组合后的解析器应该是异步的。这意味着我们需要类型层面的逻辑来计算组合后的模式。

## 五种设计方案

我探索了五种不同的方法，每种都有其权衡。

### 方案 A：带模式参数的条件类型

向 `Parser` 添加一个模式类型参数，并使用条件类型：

```typescript
type Mode = 'sync' | 'async'

type ModeValue<M extends Mode, T> = M extends 'async' ? Promise<T> : T

interface Parser<M extends Mode, TValue, TState> {
  parse(context: ParserContext<TState>): ModeValue<M, ParserResult<TState>>
  // ...
}
```

挑战在于计算组合模式：

```typescript
type CombineModes<T extends Record<string, Parser<any, any, any>>> =
  T[keyof T] extends Parser<infer M, any, any>
    ? M extends 'async'
      ? 'async'
      : 'sync'
    : never
```

### 方案 B：带默认值的模式参数

方案 A 的变体，但将模式参数放在第一位，并默认设为 `"sync"`：

```typescript
interface Parser<M extends Mode = 'sync', TValue, TState> {
  readonly $mode: M
  // ...
}
```

默认值保持了向后兼容性——现有的用户代码无需更改即可继续工作。

### 方案 C：独立的接口

定义完全独立的 `Parser` 和 `AsyncParser` 接口，并进行显式转换：

```typescript
interface Parser<TValue, TState> {
  /* 同步方法 */
}
interface AsyncParser<TValue, TState> {
  /* 异步方法 */
}

function toAsync<T, S>(parser: Parser<T, S>): AsyncParser<T, S>
```

这更容易理解，但需要代码重复和显式转换。

### 方案 D：仅针对 suggest() 的联合返回类型

最小化方案。只允许 `suggest()` 是异步的：

```typescript
interface Parser<TValue, TState> {
  parse(context: ParserContext<TState>): ParserResult<TState> // 始终同步
  suggest(
    context: ParserContext<TState>,
    prefix: string
  ): Iterable<Suggestion> | AsyncIterable<Suggestion> // 可以是任一种
}
```

这解决了最初的用例，但如果以后需要异步 `parse()` 就无能为力了。

### 方案 E：fp-ts 风格的高阶类型 (HKT) 模拟

使用 fp-ts 中的技术来模拟高阶类型（Higher-Kinded Types）：

```typescript
interface URItoKind<A> {
  Identity: A
  Promise: Promise<A>
}

type Kind<F extends keyof URItoKind<any>, A> = URItoKind<A>[F]

interface Parser<F extends keyof URItoKind<any>, TValue, TState> {
  parse(context: ParserContext<TState>): Kind<F, ParserResult<TState>>
}
```

这是最灵活的方法，但学习曲线陡峭。

## 验证想法

与其基于理论分析选定一种方法，我创建了一个原型来测试 TypeScript 在实践中处理类型推导的效果。我在 GitHub issue 中[发布了我的发现](https://github.com/dahlia/optique/issues/52#issuecomment-3686348167)：

> 两种方法都能在类型层面正确处理“任意异步 → 全部异步”的规则。(...) 像 `ModeValue<CombineParserModes<T>, ParserResult<TState>>` 这样复杂的条件类型有时需要在实现中进行显式的类型转换。但这只影响库的内部，面向用户的 API 保持整洁。

原型验证了**方案 B**（带默认值的显式模式参数）是可行的。我选择它的原因如下：

- _向后兼容_：默认的 `"sync"` 让现有代码保持工作。
- _显式_：模式在类型和运行时（通过 `$mode` 属性）都可见。
- _可调试_：易于在运行时检查当前模式。
- _更好的 IDE 支持_：类型信息更可预测。

## CombineModes 如何工作

`CombineModes` 类型计算组合解析器应该是同步还是异步：

```typescript
type CombineModes<T extends readonly Mode[]> = 'async' extends T[number]
  ? 'async'
  : 'sync'
```

这个类型检查模式元组中是否存在 `"async"`。如果存在，结果就是 `"async"`；否则就是 `"sync"`。

对于像 `object()` 这样的[组合子](https://optique.dev/concepts/constructs)，我需要从解析器对象中提取模式并进行组合：

```typescript
// 从单个解析器中提取模式
type ParserMode<T> = T extends Parser<infer M, unknown, unknown> ? M : never

// 组合解析器记录（Record）中所有值的模式
type CombineObjectModes<
  T extends Record<string, Parser<Mode, unknown, unknown>>
> = CombineModes<{ [K in keyof T]: ParserMode<T[K]> }[keyof T][]>
```

## 运行时实现

类型系统处理编译时的安全性，但实现也需要运行时逻辑。每个解析器都有一个 `$mode` 属性来指示其执行模式：

```typescript
const syncParser = option('-n', '--name', string())
console.log(syncParser.$mode) // "sync"

const asyncParser = option('-b', '--branch', asyncValueParser)
console.log(asyncParser.$mode) // "async"
```

组合子在构造时计算它们的模式：

```typescript
function object<T extends Record<string, Parser<Mode, unknown, unknown>>>(
  parsers: T
): Parser<CombineObjectModes<T>, ObjectValue<T>, ObjectState<T>> {
  const parserKeys = Reflect.ownKeys(parsers)
  const combinedMode: Mode = parserKeys.some(
    (k) => parsers[k as keyof T].$mode === 'async'
  )
    ? 'async'
    : 'sync'

  // ... 实现代码
}
```

## 优化 API

Lucas 在我们讨论期间提出了一个重要的[改进建议](https://github.com/dahlia/optique/issues/52#issuecomment-3691142985)。与其让 `run()` 根据解析器模式自动在同步和异步之间选择，他建议使用独立的函数：

> 也许 `run(...)` 可以是自动的，而 `runSync(...)` 和 `runAsync(...)` 可以强制推导出的类型符合预期。

所以我们最终采用了：

- `run()`: 根据解析器模式自动决定
- `runSync()`: 在编译时强制要求同步模式
- `runAsync()`: 在编译时强制要求异步模式

```typescript
// 自动：同步解析器返回 T，异步解析器返回 Promise<T>
const result1 = run(syncParser) // string
const result2 = run(asyncParser) // Promise<string>

// 显式：编译时强制检查
const result3 = runSync(syncParser) // string
const result4 = runAsync(asyncParser) // Promise<string>

// 编译错误：不能对异步解析器使用 runSync
const result5 = runSync(asyncParser) // 类型错误！
```

我将同样的模式应用到了[门面函数](https://optique.dev/concepts/runners)中的 `parse()/parseSync()/parseAsync()` 和 `suggest()/suggestSync()/suggestAsync()`。

## 创建异步值解析器

有了新的 API，为 Git 分支创建[异步值解析器](https://optique.dev/concepts/valueparsers#async-value-parsers)如下所示：

```typescript
import type { Suggestion } from '@optique/core/parser'
import type { ValueParser, ValueParserResult } from '@optique/core/valueparser'

function gitRef(): ValueParser<'async', string> {
  return {
    $mode: 'async',
    metavar: 'REF',
    parse(input: string): Promise<ValueParserResult<string>> {
      return Promise.resolve({ success: true, value: input })
    },
    format(value: string): string {
      return value
    },
    async *suggest(prefix: string): AsyncIterable<Suggestion> {
      const { $ } = await import('bun')
      const [branches, tags] = await Promise.all([
        $`git for-each-ref --format='%(refname:short)' refs/heads/`.text(),
        $`git for-each-ref --format='%(refname:short)' refs/tags/`.text(),
      ])
      for (const ref of [...branches.split('\n'), ...tags.split('\n')]) {
        const trimmed = ref.trim()
        if (trimmed && trimmed.startsWith(prefix)) {
          yield { kind: 'literal', text: trimmed }
        }
      }
    },
  }
}
```

注意，即使 `parse()` 是同步的，它也返回 `Promise.resolve()`。这是因为 `ValueParser<"async", T>` 类型要求所有方法都使用异步签名。Lucas 指出这是一个小的人体工程学问题。如果只有 `suggest()` 需要异步，你仍然必须将 `parse()` 包装在 Promise 中。

我考虑过按方法的模式粒度（例如 `ValueParser<ParseMode, SuggestMode, T>`），但这会使实现复杂度成倍增加。目前，变通方法足够简单：

```typescript
// 选项 1: 使用 Promise.resolve()
parse(input) {
  return Promise.resolve({ success: true, value: input });
}

// 选项 2: 标记为 async 并忽略 linter 警告
// biome-ignore lint/suspicious/useAwait: sync implementation in async ValueParser
async parse(input) {
  return { success: true, value: input };
}
```

## 代价是什么

支持双模式大大增加了 Optique 内部的复杂性。每个组合子都需要更新：

- 类型签名变得更加复杂，带有模式参数
- 每个组合子都必须添加模式传播逻辑
- 需要为同步和异步代码路径提供双重实现
- 实现中有时需要类型断言以满足 TypeScript 的检查

例如，`object()` 组合子从大约 100 行增加到了大约 250 行。内部实现使用基于组合模式的条件逻辑：

```typescript
if (combinedMode === 'async') {
  return {
    $mode: 'async' as M,
    // ... 带有 Promise 链的异步实现
    async parse(context) {
      // ... await 每个字段的解析结果
    },
  }
} else {
  return {
    $mode: 'sync' as M,
    // ... 同步实现
    parse(context) {
      // ... 直接调用每个字段的 parse
    },
  }
}
```

这种重复是为了在支持两种模式的同时，不给仅使用同步的场景带来运行时开销所付出的代价。

## 经验教训

### 倾听用户，但用原型验证

我最初的直觉是拒绝异步支持。Lucas 的坚持和具体例子改变了我的想法，但在承诺之前，我用原型验证了该方法。原型揭示了纯设计分析会遗漏的实际问题（如 TypeScript 推导的限制）。

### 向后兼容值得增加复杂性

将 "sync" 设为默认模式意味着现有代码可以无需更改继续运行。这是一个深思熟虑的选择。破坏性变更应该需要用户操作，而不是悄无声息地破坏代码。

### 统一模式 vs 逐方法粒度

我选择了统一模式（所有方法共享相同的同步/异步模式），而不是逐方法的粒度。这意味着用户偶尔需要为不需要异步的方法编写 `Promise.resolve()`，但另一种选择是类型系统中成倍增加的复杂性。

### 公开设计

整个设计过程都在公开的 GitHub issue 中进行。Lucas、Giuseppe 和其他人贡献的想法塑造了最终的 API。`runSync()`/`runAsync()` 的区分直接来自于 Lucas 的反馈。

## 结论

这是我在 Optique 中实现过的最具挑战性的功能之一。TypeScript 的类型系统足够强大，可以在编译时编码“任意异步即全部异步”的规则，但实现它需要仔细的设计工作和原型设计。

成功的关键在于：像 `ModeValue<M, T>` 这样的条件类型可以弥合同步和异步世界之间的鸿沟。你需要为此付出实现复杂度的代价，但面向用户的 API 保持了整洁和类型安全。

带有异步支持的 Optique 0.9.0 目前处于预发布测试阶段。如果你想尝试，请查看 PR #70 或安装预发布版本：

```bash
npm  add       @optique/core@0.9.0-dev.212 @optique/run@0.9.0-dev.212
deno add --jsr @optique/core@0.9.0-dev.212 @optique/run@0.9.0-dev.212
```

欢迎反馈！
