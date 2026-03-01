> 原文：[Fun with TypeScript Generics](https://frontendmasters.com/blog/fun-with-typescript-generics/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Fun with TypeScript Generics：玩转 TS 泛型

关于 TypeScript 泛型的文章有很多。本文不做基础入门，而是围绕一个真实的小问题，展示如何把泛型、条件类型和函数重载组合起来，构建一个类型完善且可维护的 API。

重点不是“类型体操”，而是在实际工程里把类型约束做对。

## 泛型与条件类型：快速回顾

如果你已经熟悉这些内容，可以直接跳到后面的实现部分。

### 泛型（Generics）

把泛型理解成“类型层面的函数参数”很有帮助。

普通函数参数是“值”，比如：

```ts
function arrayLength(arr: any[]) {
  return arr.length;
}
```

把 `any[]` 换成泛型之后：

```ts
function arrayLengthTyped<T>(arr: T[]) {
  return arr.length;
}
```

调用时 `T` 会从传入数组元素类型推断出来。

作者也直说：这个例子虽然“更类型安全”，但没什么意义，因为 `.length` 对任何数组都存在。

泛型真正发光的场景，是当你需要让类型信息在“输入 → 输出”之间流动时。例如手写一个 `filter`：

```ts
function filterUntyped(array: any[], predicate: (item: any) => boolean): any[] {
  return array.filter(predicate);
}
```

这个版本的问题是：传进来的 predicate 没任何类型约束，写错字段也不会提示：

```ts
type User = {
  name: string;
};

const users: User[] = [];

filterUntyped(users, (user) => user.nameX === "John");
```

泛型版可以把元素类型贯穿到 predicate 中：

```ts
function filterTyped<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}
```

这下 `user.nameX` 会被立即指出错误。

### 泛型约束（Constraints）

当你希望“泛型灵活，但不能什么都放进来”，就需要约束。例如你有多个 user 类型，但都至少有 `name`：

```ts
type User = {
  name: string;
};

type AdminUser = User & {
  role: string;
};

type BannedUser = User & {
  reason: string;
};
```

如果把函数写死成 `User[]`，会丢失具体子类型：

```ts
function filterUser(array: User[], predicate: (item: User) => boolean): User[] {
  return array.filter(predicate);
}

const adminUsers: AdminUser[] = [];
const adminsNamedAdam = filterUser(adminUsers, (u) => u.name === "Adam");
// adminsNamedAdam 被推断为 User[] —— 信息被“抹平”了
```

正确做法是保留泛型，但限制它必须是 `User`：

```ts
function filterUserCorrect<T extends User>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}
```

### 条件类型（Conditional Types）

条件类型本质是“对类型提问，并根据答案生成新类型”。

```ts
type IsArray<T> = T extends any[] ? true : false;

type YesIsArray = IsArray<number[]>;
type NoIsNotArray = IsArray<number>;
```

这看起来很无聊，但配合 `infer` 才是精华：

```ts
type ArrayOf<T> = T extends Array<infer U> ? U : never;

type NumberType = ArrayOf<number[]>; // number
type NeverType = ArrayOf<number>; // never
```

你还可以加上约束，强制只接受数组：

```ts
type ArrayOf2<T extends Array<any>> = T extends Array<infer U> ? U : never;

type NumberType2 = ArrayOf2<number[]>;
type NeverType2 = ArrayOf2<number>; // Type 'number' does not satisfy the constraint 'any[]'
```

## 正文：为 `refetchedQueryOptions` 补齐类型

作者在使用 TanStack Start 时遇到一个工程问题：为了让 react-query 的 `queryFn` 与 `meta` 中记录的服务端函数信息保持一致，他写了一个 helper 来减少重复代码：

```ts
export function refetchedQueryOptions(queryKey: QueryKey, serverFn: any, arg?: any) {
  const queryKeyToUse = [...queryKey];
  if (arg != null) {
    queryKeyToUse.push(arg);
  }
  return queryOptions({
    queryKey: queryKeyToUse,
    queryFn: async () => {
      return serverFn({ data: arg });
    },
    meta: {
      __revalidate: {
        serverFn,
        arg,
      },
    },
  });
}
```

组合使用时是这样：

```ts
export const epicsQueryOptions = (page: number) => {
  return queryOptions({
    ...refetchedQueryOptions(["epics", "list"], getEpicsList, page),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};
```

但这个 proof-of-concept 版本里，`serverFn` 和 `arg` 都是 `any`，会导致两个问题：

1) 传错参数也不会报错
2) 更糟糕的是：queryFn 返回值也会变成 `any`，下游 `useQuery` 拿到的数据类型全部丢失

### 验收标准（测试用例）

作者给出了一套“应该通过/应该报错”的调用来验证类型：

```ts
import { QueryKey, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

export function refetchedQueryOptions(queryKey: QueryKey, serverFn: any, arg?: any) {
  const queryKeyToUse = [...queryKey];
  if (arg != null) {
    queryKeyToUse.push(arg);
  }
  return queryOptions({
    queryKey: queryKeyToUse,
    queryFn: async () => {
      return serverFn({ data: arg });
    },
    meta: {
      __revalidate: {
        serverFn,
        arg,
      },
    },
  });
}

const serverFnWithArgs = createServerFn({ method: "GET" })
  .inputValidator((arg: { value: string }) => arg)
  .handler(async () => {
    return { value: "Hello World" };
  });

const serverFnWithoutArgs = createServerFn({ method: "GET" }).handler(async () => {
  return { value: "Hello World" };
});

refetchedQueryOptions(["test"], serverFnWithArgs, { value: "" });
refetchedQueryOptions(["test"], serverFnWithoutArgs);

// wrong argument type
// @ts-expect-error
refetchedQueryOptions(["test"], serverFnWithArgs, 123);

// need an argument
// @ts-expect-error
refetchedQueryOptions(["test"], serverFnWithArgs);
```

目标是前两行通过，后两行必须报错。

## Iteration 1：先恢复 `serverFn` 的类型信息

TanStack 的 server function 本质就是函数：它只有一个参数对象，常用参数在 `data` 字段里。既然它是函数，我们就能用 TS 内置的 `Parameters` / `ReturnType`。

第一步是把 `serverFn` 设为泛型参数 `T`，并把 `arg` 绑定到 `Parameters<T>[0]["data"]`：

```ts
export function refetchedQueryOptions<T extends (arg: { data: any }) => Promise<any>>(
  queryKey: QueryKey,
  serverFn: T,
  arg: Parameters<T>[0]["data"]
) {
  const queryKeyToUse = [...queryKey];
  if (arg != null) {
    queryKeyToUse.push(arg);
  }
  return queryOptions({
    queryKey: queryKeyToUse,
    queryFn: async (): Promise<Awaited<ReturnType<T>>> => {
      return serverFn({ data: arg });
    },
    meta: {
      __revalidate: {
        serverFn,
        arg,
      },
    },
  });
}
```

这样做以后：

- `arg` 的类型会跟随传入的 `serverFn` 自动推断
- `queryFn` 的返回值也能从 `ReturnType<T>` 推导出来

但很快出现一个新问题：即便 `serverFn` 不需要参数，`refetchedQueryOptions` 仍会强制传第三个参数。

把 `undefined` 传进去能工作：

```ts
refetchedQueryOptions(["test"], serverFnWithoutArgs, undefined);
```

这对大多数项目已经足够，但作者希望继续把 API 打磨到更理想的形态：

- serverFn 需要参数时：第三个参数必须传
- serverFn 不需要参数时：第三个参数就不该出现

## 正确方向：函数重载

你可能会想到把 `arg` 设为可选，但那会让“本应必传参数的 `serverFn`”也可不传，约束就失效了。

你也许会想到条件类型：如果 `data` 是 `undefined` 就不需要参数，否则需要参数。但 TS 里很难用条件类型表达“这个参数根本不存在”。

更直接、也更符合 TS 语言特性的解法是：**函数重载**。

### TypeScript 的函数重载回顾

重载在 TS 里分两层：

- 多个“声明签名”（对外可见的 API）
- 一个“实现签名”（真正的 JS 实现，参数/返回类型要覆盖所有声明）

例如：

```ts
function add(x: number, y: number): number;
function add(x: string, y: string): string;
function add(x: string | number, y: string | number): string | number {
  if (typeof x === "string" && typeof y === "string") return x + y;
  if (typeof x === "number" && typeof y === "number") return x + y;
  throw new Error("Invalid arguments");
}
```

原文还放了两张图，展示编辑器只会提示“声明签名”，而不会把实现签名暴露出来：

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/img1.png?resize=674%2C174&ssl=1)

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/img2.png?resize=678%2C188&ssl=1)

## 构建最终解：针对“有参/无参 serverFn”提供不同签名

我们想要两种重载：

1) serverFn 有参数 → `refetchedQueryOptions(queryKey, serverFn, arg)`
2) serverFn 无参数 → `refetchedQueryOptions(queryKey, serverFn)`

首先定义一个任意异步函数类型，方便复用：

```ts
type AnyAsyncFn = (...args: any[]) => Promise<any>;
```

接着写一个条件类型，提取 serverFn 参数里 `data` 的类型：

```ts
type ServerFnArgs<TFn extends AnyAsyncFn> = Parameters<TFn>[0] extends { data: infer TResult }
  ? TResult
  : undefined;
```

再用它判断“是否有参数”：

```ts
type ServerFnHasArgs<TFn extends AnyAsyncFn> = ServerFnArgs<TFn> extends undefined ? false : true;
```

最后把函数分成“有参版本”和“无参版本”：

```ts
type ServerFnWithArgs<TFn extends AnyAsyncFn> = ServerFnHasArgs<TFn> extends true ? TFn : never;
type ServerFnWithoutArgs<TFn extends AnyAsyncFn> = ServerFnHasArgs<TFn> extends false ? TFn : never;
```

作者还提醒：TS 的重载返回值最好显式写出来，因此他定义了一个返回类型：

```ts
type RefetchQueryOptions<T> = {
  queryKey: QueryKey;
  queryFn: (_?: any) => Promise<T>;
  meta: any;
};
```

### 最终重载签名

```ts
export function refetchedQueryOptions<TFn extends AnyAsyncFn>(
  queryKey: QueryKey,
  serverFn: ServerFnWithArgs<TFn>,
  arg: Parameters<TFn>[0]["data"]
): RefetchQueryOptions<Awaited<ReturnType<TFn>>>;

export function refetchedQueryOptions<TFn extends AnyAsyncFn>(
  queryKey: QueryKey,
  serverFn: ServerFnWithoutArgs<TFn>
): RefetchQueryOptions<Awaited<ReturnType<TFn>>>;
```

### 真实实现

```ts
export function refetchedQueryOptions<TFn extends AnyAsyncFn>(
  queryKey: QueryKey,
  serverFn: ServerFnWithoutArgs<TFn> | ServerFnWithArgs<TFn>,
  arg?: Parameters<TFn>[0]["data"]
): RefetchQueryOptions<Awaited<ReturnType<TFn>>> {
  const queryKeyToUse = [...queryKey];
  if (arg != null) {
    queryKeyToUse.push(arg);
  }
  return {
    queryKey: queryKeyToUse,
    queryFn: async () => {
      return serverFn({ data: arg });
    },
    meta: {
      __revalidate: {
        serverFn,
        arg,
      },
    },
  };
}
```

到这里就完成了：泛型 + 条件类型 + `infer` + 重载，组合起来可以“问对问题”，并把你想要的精确 API 表达出来。

## 结语

作者最后说：你大概率不会在日常工作里遇到完全相同的问题，但这套思路非常通用——它教你如何把类型系统当作工具，让 API 的“可用性”和“约束力”同时到位。

