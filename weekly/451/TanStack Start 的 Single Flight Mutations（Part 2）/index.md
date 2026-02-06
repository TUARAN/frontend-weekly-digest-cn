# TanStack Start 的 Single Flight Mutations（Part 2）

原文：[Single Flight Mutations in TanStack Start: Part 2](https://frontendmasters.com/blog/single-flight-mutations-in-tanstack-start-part-2/)

作者：Adam Rackis

日期：2026年1月28日

翻译：[TUARAN](https://github.com/TUARAN)

> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

---

## TL;DR

这篇文章延续 Part 1 的思路：把一次 mutation 所需的 UI 更新数据，在同一次网络往返里一起带回来（避免 mutation 后再额外发请求 refetch）。

Part 2 的重点是把“要 refetch 哪些查询”抽成可复用的 middleware：调用 server function 时传入 react-query 的 `QueryKey[]`，middleware 会在客户端从 Query Cache 找到每个 query 对应的 `serverFn` 和参数，把这些信息通过 `sendContext` 送到服务端统一执行，然后把结果回传给客户端并用 `setQueryData` 写回缓存。

---

在 [Part 1](https://frontendmasters.com/blog/single-flight-mutations-in-tanstack-start-part-1/) 里，我们聊过 single flight mutations：它让你在更新数据时，同时把 UI 需要的所有相关“已更新数据”重新获取回来，并且整个过程只需要一次跨网络的往返。

我们当时做了个很朴素的实现：在“更新数据”的 server function 里直接把需要的东西 refetch 一遍。它确实能用，但可扩展性和灵活性都一般（耦合也偏重）。

这篇文章我们会实现同样的效果，但方式更通用：定义一个“refetch middleware”，把它挂到任意 server function 上。这个 middleware 允许我们通过 react-query 的 key 指定要 refetch 的数据，剩下的事情它会自动完成。

我们会先做一个最简单版本，然后不断加能力、加灵活性。到最后会稍微复杂一些，但请别误会：你不需要把文中讲的全部都用上。事实上，对绝大多数应用来说，single flight mutations 可能完全无关紧要。更别被“高级做法”迷惑了：对很多小应用而言，直接在 server function 里 refetch 一点数据可能就足够了。

不过，跟着做一遍，我们会看到一些很酷的 TanStack（甚至 TypeScript）特性。即便你永远不用 single flight mutations，这些内容也很可能在别的场景派上用场。

## 我们的第一个 Middleware

[TanStack Query](https://tanstack.com/query/latest)（我们有时也会称它为 react-query，这是它的包名）已经有一套非常好用的层级 key 系统。如果我们的 middleware 能直接接收“要 refetch 的 query keys”，然后就……自动搞定，那该多好？

问题在于：middleware 要怎么知道“怎么 refetch”呢？第一眼看确实有点难。我们的 queries（刻意保持简单）本质上都是对 server functions 的调用。但我们没法把一个普通函数引用传到服务端；函数不可序列化，这很合理。你能把字符串/数字/布尔值序列化成 JSON 在线上传输，但一个函数可能带状态、闭包、上下文……传过去根本说不清。

除非——它是 TanStack Start 的 server function。

这个项目背后的工程师们为序列化引擎做了定制，使其支持 server functions。也就是说：你可以从客户端把一个 server function “发到”服务端，它能正常工作。底层原理是：server functions 有一个内部 ID。TanStack 会捕捉到它、发送 ID，然后在另一端把 ID 反序列化成对应的 server function。

为了让事情更简单，我们不妨把 server function（以及它需要的参数）直接放到我们已经定义好的 query options 上。这样 middleware 只要拿到 query keys，就能从 TanStack Query 的 cache 里找到对应的 query options，拿到“如何 refetch”的信息，然后把整个流程串起来。

## 开始吧

首先引入一些好用的东西：

```ts
import { createMiddleware, getRouterInstance } from "@tanstack/react-start";
import { QueryClient, QueryKey } from "@tanstack/react-query";
```

接着更新我们的 epics 列表查询（主要的 epics 列表）的 query options：

```ts
export const epicsQueryOptions = (page: number) => {
  return queryOptions({
    queryKey: ["epics", "list", page],
    queryFn: async () => {
      const result = await getEpicsList({ data: page });
      return result;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    meta: {
      __revalidate: {
        serverFn: getEpicsList,
        arg: page,
      },
    },
  });
};
```

注意这个新增的 `meta` 区块。它允许我们往 query 上塞任何我们需要的元数据。这里我们放了 `getEpicsList` 这个 server function 的引用以及它需要的参数。这样写确实会有“重复”（`queryFn` 写了一次调用方式，`meta` 又写了一次），如果你觉得别扭，先别急，后面会处理。summary 查询（用于统计数量）我们也会同样更新，不过这里没贴代码。

接下来我们把 middleware 一点点拼出来：

```ts
// the server function and args are all `any`, for now, 
// to keep things simple we'll see how to type them in a bit
type RevalidationPayload = {
  refetch: {
    key: QueryKey;
    fn: any;
    arg: any;
  }[];
};

type RefetchMiddlewareConfig = {
  refetch: QueryKey[];
};

export const refetchMiddleware = createMiddleware({ type: "function" })
  .inputValidator((config?: RefetchMiddlewareConfig) => config)
  .client(async ({ next, data }) => {
    const { refetch = [] } = data ?? {};
```

我们为 middleware 定义了一个输入。这个输入会自动与“挂载该 middleware 的 server function 的输入”合并。

我们把输入写成可选的（`config?`），因为完全可能出现这种情况：你只想调用 server function，但并不想 refetch 任何东西。

然后开始写 `.client` 回调（在浏览器中运行）：先拿到要 refetch 的 keys：

`const { refetch = [] } = data ?? {};`

接着我们拿到 `queryClient` 和它的 cache，并创建一个 payload，之后会通过 `sendContext` 发到 `.server` 回调，让它执行真正的 refetch。

如果你对 TanStack middleware 不熟，我之前写的 [middleware 文章](https://frontendmasters.com/blog/introducing-tanstack-start-middleware/) 可能会更适合作为入门。

```ts
const router = await getRouterInstance();
const queryClient: QueryClient = router.options.context.queryClient;
const cache = queryClient.getQueryCache();

const revalidate: RevalidationPayload = {
  refetch: [],
};
```

我们的 `queryClient` 已经挂在 TanStack router 的 context 上，所以只要拿到 router 再取出来即可。

还记得我们把 `__revalidate` 塞到 query options 的 `meta` 里吗？现在我们针对每个 key 去 cache 里找对应 query，并把 `serverFn/arg` 抽出来组装成要发给服务端的 payload。

```ts
refetch.forEach((key: QueryKey) => {
  const entry = cache.find({ queryKey: key, exact: true });
  if (!entry) return;

  const revalidatePayload: any = entry?.meta?.__revalidate ?? null;

  if (revalidatePayload) {
    revalidate.refetch.push({
      key,
      fn: revalidatePayload.serverFn,
      arg: revalidatePayload.arg,
    });
  }
});
```

`if (!entry) return;` 是为了防止请求里包含了“当前缓存里根本不存在”的 query（也就是说，它可能从未在 UI 里被请求过）。这种情况下我们拿不到 `serverFn`，也就无法 refetch。

你也可以把 middleware 输入扩展得更丰富：比如对那些“无论是否在缓存里都必须执行”的 refetch，直接把 `serverFn + arg` 一起传上去。比如你打算 mutation 后 redirect，并希望新页面的数据能预取。本文不实现这个变体，但它只是同一主题的另一种组合。

接着我们调用 `next`，触发真正的 server function（以及其它 middleware）。通过 `sendContext` 我们把 `revalidate` 发到服务端：

```ts
const result = await next({
  sendContext: {
    revalidate,
  },
});
```

`result` 是 server function 调用的返回值。它的 `context` 上会有一个 `payloads` 数组（由下方 `.server` 回调返回），其中每一项都包含 `key`（query key）和 `result`（对应数据）。我们遍历并写回 query cache。

我们稍后会修复这里用 `// @ts-expect-error` 遮掉的 TS 错误：

```ts
// @ts-expect-error
for (const entry of result.context?.payloads ?? []) {
  queryClient.setQueryData(entry.key, entry.result);
}

return result;
```

## 服务端回调

服务端回调完整代码如下：

```ts
.server(async ({ next, context }) => {
  const result = await next({
    sendContext: {
      payloads: [] as any[]
    }
  });

  const allPayloads = context.revalidate.refetch.map(refetchPayload => {
    return {
      key: refetchPayload.key,
      result: refetchPayload.fn({ data: refetchPayload.arg })
    };
  });

  for (const refetchPayload of allPayloads) {
    result.sendContext.payloads.push({
      key: refetchPayload.key,
      result: await refetchPayload.result
    });
  }

  return result;
});
```

我们会立刻调用 `next()`，它会执行这个 middleware 所挂载的 server function。我们在 `sendContext` 里传入一个 `payloads` 数组：这个数组决定了“服务端最终会发回给客户端回调的数据结构”（也就是 `.client` 里循环的那份 `payloads`）。

然后我们遍历客户端通过 `sendContext` 传上来的 `revalidate` payload，并从 `context` 上读出来（是的：*send* context，发上来再从 context 读出来）。接着调用所有 server functions，并把结果 push 到 `payloads` 数组里。

把前后拼起来，这就是完整 middleware：

```ts
export const refetchMiddleware = createMiddleware({ type: "function" })
  .inputValidator((config?: RefetchMiddlewareConfig) => config)
  .client(async ({ next, data }) => {
    const { refetch = [] } = data ?? {};

    const router = await getRouterInstance();
    const queryClient: QueryClient = router.options.context.queryClient;
    const cache = queryClient.getQueryCache();

    const revalidate: RevalidationPayload = {
      refetch: [],
    };

    refetch.forEach((key: QueryKey) => {
      const entry = cache.find({ queryKey: key, exact: true });
      if (!entry) return;

      const revalidatePayload: any = entry?.meta?.__revalidate ?? null;

      if (revalidatePayload) {
        revalidate.refetch.push({
          key,
          fn: revalidatePayload.serverFn,
          arg: revalidatePayload.arg,
        });
      }
    });

    const result = await next({
      sendContext: {
        revalidate,
      },
    });

    // @ts-expect-error
    for (const entry of result.context?.payloads ?? []) {
      queryClient.setQueryData(entry.key, entry.result);
    }

    return result;
  })
  .server(async ({ next, context }) => {
    const result = await next({
      sendContext: {
        payloads: [] as any[],
      },
    });

    const allPayloads = context.revalidate.refetch.map(refetchPayload => {
      return {
        key: refetchPayload.key,
        result: refetchPayload.fn({ data: refetchPayload.arg }),
      };
    });

    for (const refetchPayload of allPayloads) {
      result.sendContext.payloads.push({
        key: refetchPayload.key,
        result: await refetchPayload.result,
      });
    }

    return result;
  });
```

## 修复 TypeScript 报错

为什么下面这一行是无效的？

```ts
// @ts-expect-error
for (const entry of result.context?.payloads ?? []) {
```

这段代码运行在 `.client` 回调里，并且是在我们调用 `next()` 之后运行的。本质上，我们是在服务端读取“发送回客户端的数据”（通过 `sendContext` 传回来的 payload）。这段代码在运行时确实能工作，那为什么类型对不上？

我在上面提到的 middleware 文章里解释过：服务端回调能“看见”客户端发给它的内容，但反过来不成立。这种信息天生就不是双向可见的；类型推断也没法倒着跑。

解决方式很简单：把 middleware 拆成两段，让后一段 middleware 依赖前一段。

```ts
const prelimRefetchMiddleware = createMiddleware({ type: "function" })
  .inputValidator((config?: RefetchMiddlewareConfig) => config)
  .client(async ({ next, data }) => {
    const { refetch = [] } = data ?? {};

    const router = await getRouterInstance();
    const queryClient: QueryClient = router.options.context.queryClient;

    // same
    // as
    // before

    return await next({
      sendContext: {
        revalidate,
      },
    });

    // those last few lines are removed
  })
  .server(async ({ next, context }) => {
    const result = await next({
      sendContext: {
        payloads: [] as any[],
      },
    });

    // exactly the same as before

    return result;
  });

export const refetchMiddleware = createMiddleware({ type: "function" })
  .middleware([prelimRefetchMiddleware]) // <-------- connect them!
  .client(async ({ next }) => {
    const result = await next();

    const router = await getRouterInstance();
    const queryClient: QueryClient = router.options.context.queryClient;

    // and here's those last few lines we removed from above
    for (const entry of result.context?.payloads ?? []) {
      queryClient.setQueryData(entry.key, entry.result);
    }

    return result;
  });
```

整体逻辑不变，只是把 `.client` 回调里 `next()` 之后那部分移到了单独的 middleware 里。其余部分留在另一个 middleware 中，并作为输入传给新的这个 middleware。这样当我们在 `refetchMiddleware` 里调用 `next` 时，TypeScript 就能看到“从服务端发下来的 context 数据”，因为这些数据是在 `prelimRefetchMiddleware` 里发送的，而它又是本 middleware 的输入，因此 TS 可以完整看清类型流动。

## 接起来

现在我们回到“更新 epic”的 server function：把之前的手动 refetch 移除，改为使用 refetch middleware。

```ts
export const updateEpic = createServerFn({ method: "POST" })
  .middleware([refetchMiddleware])
  .inputValidator((obj: { id: number; name: string }) => obj)
  .handler(async ({ data }) => {
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.random()));
    await db.update(epicsTable).set({ name: data.name }).where(eq(epicsTable.id, data.id));
  });
```

在 React 组件中通过 `useServerFn` 来调用它；这个 hook 会自动处理错误、重定向等。

`const runSave = useServerFn(updateEpic);`

还记得我说过：middleware 的输入会自动与底层 server function 的输入合并吗？当我们调用这个 server function 时就能看到：

![图 1：一个 handleSaveFinal 函数的代码片段，保存输入值并调用 runSave，参数对象包含 id 和 name。](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/01/img8.png?resize=1024%2C272&ssl=1)

（`unknown[]` 对 react-query 的 query key 来说就是正确类型）

现在我们可以这样调用它，并指定要 refetch 的查询：

```ts
await runSave({
  data: {
    id: epic.id,
    name: newValue,
    refetch: [
      ["epics", "list", 1],
      ["epics", "list", "summary"],
    ],
  },
});
```

运行后，一切正常：epics 列表和 summary 都会在没有任何新网络请求的情况下更新。测试 single flight mutations 时，你其实不是在找“发生了什么”，而是在找“什么都没发生”——也就是 Network 面板里缺少那些本该出现的额外请求。

## 再改进

react-query 的 query keys 是层级结构的，你可能很熟悉这种写法：

`queryClient.invalidateQueries({ queryKey: ["epics", "list"] });`

它会 refetch 任何 key 以 `["epics", "list"]` 开头的 queries。我们的 middleware 能不能也支持这种“key 前缀”呢？也就是只传一个 key prefix，让它找出所有匹配项并 refetch。

可以，开干。

匹配 key 会稍复杂一点：每个传入的 key 可能是 prefix，会匹配多条 cache entry，所以我们用 `flatMap` 来找出所有匹配项，再利用 `cache.findAll`（很好用）。

```ts
const allQueriesFound = refetch.flatMap(
  k => cache.findAll({ queryKey: k, exact: false })
);
```

然后循环并做和之前一样的事：

```ts
const allQueriesFound = refetch.flatMap(
  k => cache.findAll({ queryKey: k, exact: false })
);

allQueriesFound.forEach(entry => {
  const revalidatePayload: any = entry?.meta?.__revalidate ?? null;

  if (revalidatePayload) {
    revalidate.refetch.push({
      key: entry.queryKey,
      fn: revalidatePayload.serverFn,
      arg: revalidatePayload.arg,
    });
  }
});
```

这就能用了。

## 更进一步

不过我们的方案仍然不理想。假设用户在 epics 页面翻页：到第 2 页、到第 3 页、再回到第 1 页。我们的逻辑会找到第 1 页和 summary query，但也会把第 2、3 页一并找到（因为它们现在也在 cache 里）。然而第 2、3 页并不活跃，也不在屏幕上展示，我们不应该 refetch 它们。

我们可以只 refetch active queries：只要给 `findAll` 加上 `type` 参数即可。

`cache.findAll({ queryKey: key, exact: false, type: "active" });`

于是代码就变成这样：

```ts
const allQueriesFound = refetch.flatMap(key => cache.findAll({ queryKey: key, exact: false, type: "active" }));

allQueriesFound.forEach(entry => {
  const revalidatePayload: any = entry?.meta?.__revalidate ?? null;

  if (revalidatePayload) {
    revalidate.refetch.push({
      key: entry.queryKey,
      fn: revalidatePayload.serverFn,
      arg: revalidatePayload.arg,
    });
  }
});
```

## 更更进一步

这样就能工作了。但你仔细想想，那些 inactive 的 queries 其实应该被 invalidated。我们不希望立刻 refetch 它们（浪费资源，而且用户没在看），但如果用户又翻回那些页面，我们希望触发一次重新获取。TanStack Query 通过 `invalidateQueries` 很容易做到。

我们把这段加到“被依赖的那个 middleware”的 client 回调里：

```ts
data?.refetch.forEach(key => {
  queryClient.invalidateQueries({ queryKey: key, exact: false, type: "inactive", refetchType: "none" });
});
```

遍历传入的 query keys，把所有匹配的 inactive queries 标记为无效，但不立刻 refetch（`refetchType: "none"`）。

下面是更新后的完整 middleware：

```ts
const prelimRefetchMiddleware = createMiddleware({ type: "function" })
  .inputValidator((config?: RefetchMiddlewareConfig) => config)
  .client(async ({ next, data }) => {
    const { refetch = [] } = data ?? {};

    const router = await getRouterInstance();
    const queryClient: QueryClient = router.options.context.queryClient;
    const cache = queryClient.getQueryCache();

    const revalidate: RevalidationPayload = {
      refetch: [],
    };

    const allQueriesFound = refetch.flatMap(key => cache.findAll({ queryKey: key, exact: false, type: "active" }));

    allQueriesFound.forEach(entry => {
      const revalidatePayload: any = entry?.meta?.__revalidate ?? null;

      if (revalidatePayload) {
        revalidate.refetch.push({
          key: entry.queryKey,
          fn: revalidatePayload.serverFn,
          arg: revalidatePayload.arg,
        });
      }
    });

    return await next({
      sendContext: {
        revalidate,
      },
    });
  })
  .server(async ({ next, context }) => {
    const result = await next({
      sendContext: {
        payloads: [] as any[],
      },
    });

    const allPayloads = context.revalidate.refetch.map(refetchPayload => {
      return {
        key: refetchPayload.key,
        result: refetchPayload.fn({ data: refetchPayload.arg }),
      };
    });

    for (const refetchPayload of allPayloads) {
      result.sendContext.payloads.push({
        key: refetchPayload.key,
        result: await refetchPayload.result,
      });
    }

    return result;
  });

export const refetchMiddleware = createMiddleware({ type: "function" })
  .middleware([prelimRefetchMiddleware])
  .client(async ({ data, next }) => {
    const result = await next();

    const router = await getRouterInstance();
    const queryClient: QueryClient = router.options.context.queryClient;

    for (const entry of result.context?.payloads ?? []) {
      queryClient.setQueryData(entry.key, entry.result, { updatedAt: Date.now() });
    }

    data?.refetch.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key, exact: false, type: "inactive", refetchType: "none" });
    });

    return result;
  });
```

我们告诉 TanStack Query：把匹配 key 的 inactive queries 置为 invalid（但不 refetch）。

这个方案非常好用：如果你浏览到第 2、3 页，然后回到第 1 页，再编辑一个 todo，你会看到第 1 页列表和 summary 立刻更新。之后如果你再翻回第 2、3 页，你会看到网络请求触发，从而拿到新数据。

## 锦上添花

还记得我们把 server function 和参数塞进 query options 时的写法吗？

```ts
export const epicsQueryOptions = (page: number) => {
  return queryOptions({
    queryKey: ["epics", "list", page],
    queryFn: async () => {
      const result = await getEpicsList({ data: page });
      return result;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    meta: {
      __revalidate: {
        serverFn: getEpicsList,
        arg: page,
      },
    },
  });
};
```

我之前提过：在 `meta` 和 `queryFn` 里重复写 serverFn/arg 有点“脏”。我们来修一下。

先从最简单的 helper 开始：

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

这个 helper 会接收 query key、server function 和参数，然后返回 query options：

- 拼好的 `queryKey`（必要时把 arg 追加进去）
- `queryFn`（直接调用 server function）
- `meta.__revalidate`（同样记录 server function 和参数）

于是 epics 列表 query 就可以写成：

```ts
export const epicsQueryOptions = (page: number) => {
  return queryOptions({
    ...refetchedQueryOptions(["epics", "list"], getEpicsList, page),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};
```

它能工作，但类型不好：到处都是 `any`，意味着传给 server function 的参数不做类型检查；更糟的是，`queryFn` 的返回值也不会被检查，于是你的 query（比如这个 epics 列表）会变成返回 `any`。

我们来加点类型。

server functions 本质上是函数：接收一个对象参数；如果 server function 定义了输入，那么这个对象会包含一个 `data` 属性，里面就是输入。说一堆大白话不如看调用例子：

```ts
const result = await runSaveSimple({
  data: {
    id: epic.id,
    name: newValue,
  },
});
```

第二版 helper 可以这样写：

```ts
export function refetchedQueryOptions<T extends (arg: { data: any }) => Promise<any>>(
  queryKey: QueryKey,
  serverFn: T,
  arg: Parameters<T>[0]["data"],
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

我们把 server function 约束为一个 async 函数，且它的参数对象上有 `data`；然后用它来静态推断 `arg` 的类型。这已经不错了，但当你把它用在“没有参数”的 server function 上时会报错：

```ts
...refetchedQueryOptions(["epics", "list", "summary"], getEpicsSummary)
// Expected 3 arguments, but got 2.
```

你传 `undefined` 可以解决，功能也正常：

`...refetchedQueryOptions(["epics", "list", "summary"], getEpicsSummary, undefined),`

如果你是个正常人，你大概会觉得这已经很好了，而且确实如此。但如果你像我一样有点“怪”，你可能会想能不能做到更完美：

- 当 server function 有参数时：必须传入且类型要正确
- 当 server function 没参数时：允许省略 arg

TypeScript 有一个特性正好适合：**函数重载（overloaded functions）**。

这篇文章已经够长了，所以我直接贴代码，解读留作读者练习（以及可能的未来文章）。

```ts
import { QueryKey, queryOptions } from "@tanstack/react-query";

type AnyAsyncFn = (...args: any[]) => Promise<any>;

type ServerFnArgs<TFn extends AnyAsyncFn> = Parameters<TFn>[0] extends infer TRootArgs
  ? TRootArgs extends { data: infer TResult }
    ? TResult
    : undefined
  : never;

type ServerFnHasArgs<TFn extends AnyAsyncFn> = ServerFnArgs<TFn> extends infer U ? (U extends undefined ? false : true) : false;

type ServerFnWithArgs<TFn extends AnyAsyncFn> = ServerFnHasArgs<TFn> extends true ? TFn : never;
type ServerFnWithoutArgs<TFn extends AnyAsyncFn> = ServerFnHasArgs<TFn> extends false ? TFn : never;

type RefetchQueryOptions<T> = {
  queryKey: QueryKey;
  queryFn?: (_: any) => Promise<T>;
  meta?: any;
};

type ValidateServerFunction<Provided, Expected> = Provided extends Expected ? Provided : "This server function requires an argument!";

export function refetchedQueryOptions<TFn extends AnyAsyncFn>(
  queryKey: QueryKey,
  serverFn: ServerFnWithArgs<TFn>,
  arg: Parameters<TFn>[0]["data"],
): RefetchQueryOptions<Awaited<ReturnType<TFn>>>;
export function refetchedQueryOptions<TFn extends AnyAsyncFn>(
  queryKey: QueryKey,
  serverFn: ValidateServerFunction<TFn, ServerFnWithoutArgs<TFn>>,
): RefetchQueryOptions<Awaited<ReturnType<TFn>>>;
export function refetchedQueryOptions<TFn extends AnyAsyncFn>(
  queryKey: QueryKey,
  serverFn: ServerFnWithoutArgs<TFn> | ServerFnWithArgs<TFn>,
  arg?: Parameters<TFn>[0]["data"],
): RefetchQueryOptions<Awaited<ReturnType<TFn>>> {
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

有了它之后，当 server function 需要参数时，你可以这样调用：

```ts
export const epicsQueryOptions = (page: number) => {
  return queryOptions({
    ...refetchedQueryOptions(["epics", "list"], getEpicsList, page),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};
```

参数类型会被正确检查：

```ts
...refetchedQueryOptions(["epics", "list"], getEpicsList, "")
// Argument of type 'string' is not assignable to parameter of type 'number'.
```

如果你忘了传参数，它也会报错：

```ts
...refetchedQueryOptions(["epics", "list"], getEpicsList)
// Argument of type 'RequiredFetcher<undefined, (page: number) => number, Promise<{ id: number; name: string; }[]>>' is not assignable to parameter of type '"This server function requires an argument!"'.
```

最后这个报错信息不算特别直观，但如果你把代码读到最后，会发现它已经在尽力提示你哪里错了，靠的就是这个小工具类型：

`type ValidateServerFunction<Provided, Expected> = Provided extends Expected ? Provided : "This server function requires an argument!";`

而对于“没有参数”的 server function，它也能正常工作。完整解释留给未来文章。

## 总结

single flight mutations 是一个很不错的优化工具：当你做一次 mutation 后，UI 需要的更新数据不必再额外发请求获取，而是可以在同一次往返里顺便带回来。

希望这篇文章把各个拼图都讲清楚了：如何用 middleware 收集要 refetch 的查询、如何借助 TanStack Start 的 server function 序列化能力把“要执行的 refetch”发送到服务端、以及如何在客户端用 `setQueryData` 把数据写回缓存。
