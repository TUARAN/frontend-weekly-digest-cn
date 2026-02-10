原文：[Debugging with AI: Can It Replace an Experienced Developer?](https://www.developerway.com/posts/debugging-with-ai)
翻译：TUARAN
欢迎关注 [{{前端周刊}}](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 用 AI 调试：能取代资深开发者吗？


作者：Nadia Makarevich

2026 年 2 月 4 日

AI 能不能“真正地”解决复杂的 React/Next.js 调试问题？作者设计了一个小型但足够真实的项目，故意埋下 3 个 Bug，然后把现象与错误信息交给大模型（LLM）直接修复，并和自己手动排查的过程做对比。

她关心的问题非常具体：

- LLM 是否修好了问题？
- LLM 是否找对了根因？
- LLM 是否把根因修对了？

下面是清理过站点噪音后的译文初稿（保留原文结构与关键代码）。

## 项目与工具准备

实验项目在 GitHub：<https://github.com/developerway/debugging-with-ai>。

它是一个 React/Next.js App Router 应用，有几页路由与几个 API endpoint，使用 TanStack Query 做数据获取，用 Zod 做 schema 校验。

应用里有一个“用户资料（User Profile）”入口，理论上应该能看到用户信息；但这个路由被刻意做成“在多个层面都坏掉”，这正是要调查的对象。

作者在 LLM 侧会尽量“盲调”（假装自己不熟技术栈），然后再用对技术栈的理解手动复盘验证。

## 调查 1：用户页崩溃（Zod 校验错误）

启动项目后访问 `/users/1`，页面进入错误页（Something went wrong），浏览器控制台里是 `ZodError`，服务端日志干净，说明问题发生在前端。

### LLM 尝试

给 LLM 的提示大意是：

> 访问 `/users/1` 页面报错，控制台有如下错误堆栈（完整粘贴）。服务端日志正常。请修复。

LLM 给出的结论是：`/api/user` 返回的数据缺少 `UserSchema` 要求的字段 `phone` 和 `address`，因此 `UserSchema.parse(data)` 抛错。它的修复是：在 mock 数据里补齐字段。

这次效果上“确实修好了页面”。

### 人工复盘

从错误栈里可以看到：问题发生在 `fetchUser`，它在拿到 `/api/user` 的 JSON 后做了 Zod 解析。

```ts
// FILE: src/queries/useUser.ts
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  });
}

async function fetchUser() {
  const response = await fetch('/api/user');
  const data = await response.json();
  return UserSchema.parse(data);
}
```

Zod 的错误信息进一步明确了违反 schema 的字段：

- `phone` 期望是 `string`，但拿到的是 `undefined`
- `address` 期望是 `object`，但拿到的是 `undefined`

而 schema 里确实把它们写成了必填：

```ts
export const UserSchema = z.object({
  // ...
  phone: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  // ...
});
```

所以 LLM 的“根因判断”是对的：数据与 schema 不一致。

但真正该怎么修，要看上下文：

- 如果这是单元测试的 mock，那么补齐 mock 数据可能是正确的。
- 但在这个项目里，mock 更像“未来后端数据的替身”；在真实业务中，`phone` 和 `address` 通常不会是用户资料的强制字段。

因此更合理的修复往往是把 schema 放宽（例如 `.optional()` 或 `.nullable()`），然后在渲染层处理缺失值。

把 schema 放宽后，页面会出现新的运行时错误：读取 `address.street` 时 `address` 可能是 `undefined`。

```ts
// 伪代码：渲染时做空值保护
user.address && (
  <div>
    {/* render address */}
  </div>
)
```

作者因此把这一题对 LLM 的评价定为：能修现象、能说对根因，但对“根因的正确修法”只能算半分。

## 调查 2：从 Dashboard 导航到用户页会出现“双骨架”

现象：从 `/`（Dashboard）点到用户页时，会先出现一套 skeleton，随后又出现另一套 skeleton；但如果直接刷新用户页，只会看到后一套。

### LLM 尝试

同样把现象丢给 LLM：

> 从根页面导航到用户页会出现两个不同的 loading skeleton；刷新用户页只出现一个。为什么？如何修？

LLM 的解释与修复非常不稳定：有时它猜是 root 级别的 `app/loading.tsx` 与 route 级别的 `app/users/[id]/loading.tsx` 交替；有时它又猜是 route 的 `loading.tsx` 与组件内的 `<UserPageSkeleton />` 交替。

修复方面，它最终会给出一个“能让双骨架消失”的改法：把 `useQuery` 改成 `useSuspenseQuery`。

但它并没有稳定地解释清楚根因，所以作者给它“能修现象 ✅，根因判断 ❌”。

### 人工复盘

第一步是确认：到底是哪两套 skeleton 在闪。

作者用一个很朴素但有效的方法：给三种 loading 各加不同颜色边框，立刻就能看出来顺序。

- root 级别 `app/loading.tsx`
- route 级别 `app/users/[id]/loading.tsx`
- 组件内 `isLoading` 时渲染的 `<UserPageSkeleton />`

结论是：**先出现 route 级别 loading（`loading.tsx`），再出现客户端 skeleton**；root 级别 loading 并没有参与。

第二步：为什么刷新用户页时看不到 route 级别 loading？

关键在于：`loading.tsx` 的语义是给 `page.tsx`（Server Component）形成一个 Suspense 边界——当 `page.tsx` 里有“需要等待”的异步工作时，先展示 `loading.tsx`，等待结束后再替换成页面内容。

如果 `page.tsx` 基本不做异步等待，那么刷新时 promise 很快 resolve，于是 loading 一闪而过（几乎看不见）。

作者给了一个验证思路：在 `page.tsx` 人为加延迟，就能在刷新时稳定看到 route loading。

第三步：为什么 SPA 导航时 route loading 会明显出现？

作者建议用生产构建配合 Performance 录制：`npm run build` + `npm run start`。

在 Performance 录制里可以看到两段关键网络活动：

- 下载 User 页的 RSC payload（SPA 导航时单独下载）
- 请求 `/api/user` 获取数据

当网络被限速时，RSC payload 下载耗时变长，Suspense 边界被触发，于是 route-level `loading.tsx` 会更明显。

接着作者提出一个非常实用的问题：为什么这里没有预取（prefetch）？

Next.js 的文档提到：动态路由的 prefetch 是“部分生效”。作者的猜测是：并没有把页面 RSC 一并预取。

为了验证这个模型，她在链接上强制开启 prefetch：

```tsx
// FILE: src/components/dashboard/UserProfileDropdown.tsx
<Link href={`/users/${user.id}`} prefetch={true}>
  <User />
  Profile
</Link>
```

结果是：再从 Dashboard 导航到用户页时，route-level 的“绿色骨架”消失了，只剩客户端 skeleton。

这说明前面的心智模型大体正确：route loading 的可见性受 RSC payload 获取影响。

那 `useSuspenseQuery` 是不是正确修复？

TanStack 文档对 `useSuspenseQuery` 有一个重要前提：**只有在你总能预取所有 query 的情况下**才建议这么用，否则可能造成 hydration mismatch（服务端与客户端渲染不同）。

作者实际验证也发现：按照 LLM 的建议把 `useQuery` 改成 `useSuspenseQuery` 后，刷新用户页会在控制台出现新的错误。

因此“LLM 修复虽然看起来消掉了双骨架，但引入了新问题”，最终还是判定为失败。

作者给出的“真正可行”的修复方向（取决于你愿意投入多少重构成本）：

1) 最省事：让两套 skeleton 复用同一个 UI（即使顺序出现也不容易被察觉）
2) 让骨架只遮住动态区域，做渐进式加载体验
3) 更彻底：把用户数据放到 Server Component 侧预取，消掉客户端 skeleton

作者选择展示第 3 种方案：在 `app/users/[id]/page.tsx` 里创建 TanStack `QueryClient`，`prefetchQuery` 后把状态传给 `<HydrationBoundary />`。

```ts
// FILE: src/app/users/[id]/page.tsx
export default async function Page({ params }) {
  const { id } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['user'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, DELAYS.USER));
      const user = await getUser();
      return user;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserPage userId={id} />
    </HydrationBoundary>
  );
}
```

这样导航与刷新都只剩下 route-level loading，且 Network 里不再出现客户端对用户信息的请求。

## 调查 3：访问 `/users` 会先报错再重定向

现象：访问 `/users` 会先闪错误页，然后重定向到 `/users/1`（重定向是预期行为：非管理员只能看自己的用户页），但错误不是预期。

控制台错误：`Rendered more hooks than during the previous render.`

### LLM 尝试

这次 LLM 表现很差：它循环给出一堆“听起来很专业但不适用”的建议，例如把 redirect 移到 `useEffect`、改 `next.config.ts`、上 middleware、改 Provider 等，并且每个建议都配了“很像那么回事”的解释，但都无法真正修复。

### 人工复盘

作者先查到 Next.js 文档提到：`redirect` 会通过抛错实现，因此在 `try/catch` 场景应在 `try` 外调用。这个点有参考价值，但并不能解释 hooks 错误。

继续排查，她找到了 Next.js 的相关 issue（App Router 下出现“Rendered more hooks…”），社区建议包括“加 `loading.tsx`”或“移除 `loading.tsx`”。在这个项目里，移除 `loading.tsx` 的确能让错误消失，但这显然不是一个可接受的通用方案。

于是进入经典调试手段：**一点点剥离组件，直到错误消失**。

最终发现：把根布局里的 `<SendAnalyticsData />` 去掉后，错误消失；恢复它，错误复现。进一步确认另一个布局里也用到了同一个组件。

这个组件本身看起来很无害：

```ts
export function SendAnalyticsData({ value }: { value: string }) {
  useEffect(() => {
    sendAnalyticsData(value);
  }, [value]);
  return <></>;
}
```

但 `sendAnalyticsData` 竟然是一个 Server Action：

```ts
'use server';
export async function sendAnalyticsData(name: string) {
  console.log('analytics data sent', name);
}
```

把这个 action 注释掉后，错误就消失了。作者据此判断：**server-side redirect + Suspense + action in progress** 的组合会让 Next.js 陷入混乱，进而触发 hooks 错误。

最终解决方案也很直接：把这个 Action 移除或改成普通 REST endpoint。

## TL;DR

作者的最终结论很明确：

- AI 擅长模式识别，对“标准形态”的错误（schema 校验、空值、常见运行时错误）往往能很快给出可用修复。
- 当问题需要理解“系统为什么这样工作/应该怎样工作”（例如 RSC、Suspense、hydration、框架边界与未来演进），AI 很容易给出自信但错误的解释。
- 关键技能不是更会写 prompt，而是知道什么时候停止 prompt、开始自己推理：用 Performance 录制、Network 面板、逐步剥离组件等方法建立确定性证据链。
