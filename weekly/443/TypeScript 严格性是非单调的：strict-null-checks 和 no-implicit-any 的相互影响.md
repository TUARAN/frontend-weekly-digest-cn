# TypeScript 严格性是非单调的：strict-null-checks 和 no-implicit-any 的相互影响

> 原文： [TypeScript strictness is non-monotonic: strict-null-checks and no-implicit-any interact](https://huonw.github.io/blog/2025/12/typescript-monotonic/)
> 
> 翻译： [嘿嘿](https://blog.heyfe.org/blog)

TypeScript 编译器选项 `strictNullChecks` 和 `noImplicitAny` 以一种奇怪的方式相互作用：仅启用 `strictNullChecks` 会导致类型错误，而在同时启用 `noImplicitAny` 后这些错误却消失了。这意味着更严格的设置反而导致更少的错误！

这虽然是一个影响不大的奇闻异事，但我在实际工作中确实遇到了它，当时我正在将一些模块更新为更严格的设置。

## 背景

TypeScript 是驯服 JavaScript 代码库的强大工具，但要获得最大的保障，需要在“严格”模式下使用它。

在现有的 JavaScript 代码库中采用 TypeScript 可以逐步完成：逐个打开每个严格的子设置，并逐一处理出现的错误。这种渐进式方法使得采用变得可行：不要在一次大爆炸中修复*整个世界*，而是进行多次较小的更改，直到最终世界被修复。

在工作中，我们最近一直在以这种方式逐步提高代码的严格性，然后我遇到了这种相互作用。

## 示例

下面这段代码中，`array` 的类型是什么？

```typescript
const array = [];
array.push(123);
```

作为一个独立的代码片段，它看起来奇怪且毫无意义（“为什么不直接用 `const array = [123];`？”），但它是真实代码的最小化版本。

```typescript
const featureFlags = [];

if (enableRocket()) {
  featureFlags.push("rocket");
}
if (enableParachute()) {
  featureFlags.push("parachute");
}

prepareForLandSpeedRecord(featureFlags);
```

这里没有显式的类型注解，所以 TypeScript 需要推断它。这种推断有点巧妙，因为它需要“时间旅行”（指需要运行后续语句后回头去修改推断的类型，类似正则回溯）：`const array = []` 这个声明并没有说明数组中可能包含什么，这个信息只来自代码后面出现的 `push`。

考虑到所有这些，推断出的确切类型依赖于两个 TypeScript 语言选项也就不足为奇了：

|              | strictNullChecks | noImplicitAny | 推断类型 |
| ------------ | ---------------- | ------------- | -------- |
| 最不严格     | ❌                | ❌             | any\[\]  |
|              | ❌                | ✅             | number\[\] |
|              | ✅                | ❌             | never\[\] |
| 最严格       | ✅                | ✅             | number\[\] |

## 选项说明

这里影响推断类型的两个选项是：

* [strictNullChecks](https://www.typescriptlang.org/tsconfig/#strictNullChecks)：正确强制处理可选/可为空的值。例如，启用后，一个可为空的字符串变量（类型为 `string | null`）不能直接用在期望普通 `string` 值的地方。
* [noImplicitAny](https://www.typescriptlang.org/tsconfig/#noImplicitAny)：避免在一些模棱两可的情况下推断出“全能”的 `any` 类型。

最好同时启用它们：`strictNullChecks` 解决了[“十亿美元的错误”](https://en.wikipedia.org/wiki/Null%5Fpointer#History)，而 `noImplicitAny` 减少了感染代码库的容易出错的 `any` 的数量。

## 问题所在

我们上表中第三种配置，即启用 `strictNullChecks` 但禁用 `noImplicitAny` 时，推断出 `array: never[]`。因此，代码片段无效并被报错（[在线示例](https://www.typescriptlang.org/play/?strict=false&noImplicitAny=false&strictFunctionTypes=false&strictPropertyInitialization=false&strictBindCallApply=false&noImplicitThis=false&noImplicitReturns=false&alwaysStrict=false&esModuleInterop=false&declaration=false&noErrorTruncation=true&noImplicitOverride=false&ts=5.9.3#code/GYVwdgxgLglg9mABMAFASkQbwFCL4gegMRQDkAhAOkRiQENlxp4kAjAUwjpAGd3EGUOAAcAtABt2AN3bjEUugCcYdVpMQATTuKV1YCGj0Q9xMAOYALKOICex4ZxXi02XPggIeUAYsV07ALyIANoAugDcbnhKfjaUwrwWKACMAEwAzGiRAL5AA)）：

```typescript
array.push(123);
//         ^^^ 错误：类型“123”的参数不能赋给类型“never”的参数。
```

没有任何东西（既不是字面量 `123`，也不是任何其他 `number`，也不是任何其他东西）是 `never` 的“子类型”，所以，是的，这段代码无效是合理的。

## 奇怪之处

“启用一些更严格的要求，然后得到一个错误”并不令人惊讶，也不值得注意……但让我们再仔细看看表格：

|              | strictNullChecks | noImplicitAny | 推断类型 |
| ------------ | ---------------- | ------------- | -------- |
| 最不严格     | ❌                | ❌             | any\[\]  |
|              | ❌                | ✅             | number\[\] |
| **报错！**   | ✅                | ❌             | **never\[\]** |
| 最严格       | ✅                | ✅             | number\[\] |

所以，如果我们从一个宽松的代码库开始，并希望使其变得严格，我们可能会：

1.  启用 `strictNullChecks`，然后遇到一个新错误（不奇怪），然后
2.  **解决这个错误**，无需更改代码，只需启用 `noImplicitAny`（奇怪！）。

当我们朝着完全严格的方向前进时，逐个启用严格选项可能会导致一些“虚假的”错误短暂出现，仅仅出现在中间的半严格状态。随着我们打开设置，错误数量会先上升后下降！

我个人期望启用严格选项是单调的：启用的选项越多 = 报错越多。但这一对选项违反了这种期望。

## 解决方案

在尝试使 TypeScript 代码库变得严格时，有几种方法可以“解决”这种奇怪现象：

1.  直接用显式注解修复错误，例如 `const array: number[] = []`。
2.  使用不同的逐个启用顺序：先启用 `noImplicitAny`，然后再启用 `strictNullChecks`。如上表所示，按照这个顺序，两个步骤的推断结果都是 `array: number[]`，因此没有错误。
3.  同时启用它们：不要试图完全渐进，而是将这两个选项作为一步启用。

## 解释

为什么启用 `strictNullChecks` 并禁用 `noImplicitAny` 会导致一个在其他地方不出现的错误？[jcalz 在 StackOverflow 上解释得很好](https://stackoverflow.com/a/72660888)，其核心是：

*   这种有问题的组合是一个为了**向后兼容**而留下的边缘情况，其中 `array` 的类型在其声明处被推断为 `never[]`，并在后续代码中被锁定。
*   启用 `noImplicitAny` 会使编译器在模棱两可的位置（在没有 `noImplicitAny` 时会推断为 `any` 的地方）使用“演化”类型（evolving types，可理解为先推断为 any/never 然后后续追加推断的类型）：因此，`array` 的类型*不会*在其声明行被确定，并且可以结合来自 `push` 的信息进行推断。

## 评论

这感觉像是一个有趣的脑筋急转弯，而不是一个重大问题：

*   修复这些虚假错误并不是一个重大的负担或显著的浪费时间，而且可以说，添加注解可能使这类代码更清晰。
*   半严格状态可能有奇怪的行为是可以理解的：我想 TypeScript 开发者更关心完全严格模式下的良好体验，希望中间状态只是垫脚石，而不是长期状态。

## 总结

TypeScript 选项 `strictNullChecks` 和 `noImplicitAny` 以一种奇怪的方式相互作用：以“错误”的顺序逐个启用它们会导致错误出现然后又消失，违反了单调性的期望（启用的严格选项越多 = 错误越多）。这可能发生在真实代码中，但影响极小，因为很容易解决和/或规避。
