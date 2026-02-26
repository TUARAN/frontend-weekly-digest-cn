> 原文：[Fun with TypeScript Generics](https://frontendmasters.com/blog/fun-with-typescript-generics/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 「Fun with TypeScript Generics」：玩转 TS 泛型的实用技巧

很多人一提到 TypeScript 泛型，就会联想到「类型体操」「脑筋急转弯」这类词。  
这篇文章试图把泛型拉回到一个更友好的位置：**通过一组循序渐进的例子，说明泛型在真实项目里能解决哪些问题、该如何用更优雅的方式书写它们**。

---

## 从简单的「容器类型」开始

作者首先从最朴素的泛型用法讲起：为「装某种东西的容器」建模。

例如一个最简单的 `Result<T>`：

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: Error };
```

通过这个例子，可以自然引出：

- 如何给函数增加泛型参数，以便返回更精确的 `Result<T>`；  
- 如何在调用端利用类型收窄（discriminated unions）获得更好的提示；
- 泛型其实并不神秘，它只是「把某个位置留空，等调用者来填」的一种语法。

---

## 利用约束（constraints）表达「可用但不滥用」的类型

接着，文章介绍了带约束的泛型：

```ts
function pluck<T, K extends keyof T>(obj: T, keys: K[]): T[K][] {
  return keys.map(k => obj[k]);
}
```

这里有几个关键点：

- `K extends keyof T` 确保你传入的 key 一定来自对象本身；  
- 返回类型 `T[K][]` 精确地反映了 keys 对应字段的联合类型；  
- 在调用处，如果 key 写错，编译器能立刻给出错误。

这些例子说明：**泛型 + 约束的组合，本质是在「数据形状」和「使用方式」之间建立约定**，而不是为了炫技。

---

## 条件类型与「推断（infer）」：从工具类型到模式抽象

文章后半部分展示了几个常见的条件类型与 `infer` 用法，例如：

- 提取 Promise 内部的值类型：`type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;`  
- 把函数类型拆解为参数和返回值：`Parameters<T>`、`ReturnType<T>` 这类模式；
- 构建只读、可选、排除某些字段等工具类型。

作者强调的重点不是「记住每一个工具类型长什么样」，而是：

- 识别出「可以被抽象成模式」的一类类型操作；  
- 尝试用条件类型 + `infer` 表达这种模式，让 IDE 和编译器帮你在项目各处重用它。

---

## 何时该上泛型，何时应该收手？

最后，作者给出了一些关于「泛型使用边界」的经验之谈：

- 如果一种类型逻辑只在一个小函数里出现一次，没有必要抽象成通用泛型；  
- 当一段类型定义让团队大部分人都看不懂时，应该考虑「拆分 + 起名」或「换一种更直白的写法」；  
- 泛型真正带来的价值是**减少重复、增加反馈**，而不是堆叠复杂性。

一句话总结这篇文章的基调：  
**泛型可以很有趣，但更重要的是——它应该帮你把真实的 TypeScript 代码写得更安全、更清晰，而不是只停留在代码高尔夫。**

