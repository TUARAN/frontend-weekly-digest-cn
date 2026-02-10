# 本地开发时间减少 83%：为何迁出 Next.js

[原文链接：Reducing local dev time by 83%: Why we migrated off Next.js](https://www.inngest.com/blog/migrating-off-nextjs-tanstack-start)

作者：Jacob Heric

2026 年 1 月 30 日

Inngest 团队非常重视开发者体验（DX）。但当本地开发时页面首次加载要等 10–12 秒，“把体验做漂亮”就会变成一种消耗。

本文讲述他们为什么、以及如何从 Next.js 迁出，转向 TanStack Start，并在迁移后把本地首次加载时间大幅降到 2–3 秒（作者给出的量化结果是减少 83%）。

![](https://www.inngest.com/_next/image?url=%2Fassets%2Fblog%2Fmigrating-off-nextjs-tanstack-start%2Ffeatured-image.png&w=1920&q=95)

## 早期信号：我们努力让它能用，但它越来越慢

作者加入 Inngest 时，团队已经深度使用 Next.js：

- App Router 还在 beta 时就采用
- [一天内从 Vite 迁到 Next.js](https://www.inngest.com/blog/migrating-from-vite-to-nextjs?ref=blog-migrating-off-nextjs-tanstack-start)
- 拥抱 RSC，把它当作 React 的未来

当时的承诺很诱人：摆脱 SPA 的空白 loading 与瀑布式请求，获得嵌套布局与 streaming，并把技术栈收敛到一个框架。

但“蜜月期”很快结束。作者认为 Next.js 优化的是一种特定工作流：有专门前端团队、长期深耕框架细节。而对他们这种小团队（多数工程师要多线作战）来说，认知负担会不断累积：

- `"use client"` / `"use server"` 的边界
- 多层缓存 API
- RSC 与客户端组件之间并不清晰的分界

这些都让非“全职前端”的工程师感觉是在和框架搏斗，而不是在交付功能。

### 先退一步：弱化 RSC

他们先尝试弱化 RSC：尽量只用最少量的 server components，并偏好 client components。短期内 DX 变得可接受了一些。

但随之而来的问题是：变慢——非常慢。

> 本地开发环境的首次页面加载时间推到至少 10–12 秒。

Slack 里不断出现抱怨：“我讨厌这个。”“前端太慢了。”

最终大家达成一致：我们的开发者体验很糟。

### 升级 Next.js、上 Turbopack

他们尝试升级 Next.js，并使用 Vercel 的 profiling 工具评估效果，但没有改善。

接着试 Turbopack（还试了两次）。对一个规模不小的代码库来说，这不轻松：需要升级依赖与做不少重构。

更麻烦的是：当时 Vercel 生产环境构建仍主要支持 Webpack，导致本地开发与生产构建链路不一致，带来额外问题。

最终 Turbopack 对本地首屏加载的改善有限，平均也就快了几秒。

作者的结论很直白：Turbopack 并没有那么 turbo，是时候看看 Next.js 之外的选择。

## 评估替代方案

他们希望得到：

- 更快的本地首次加载
- 更合理的路由 API
- 更清晰的 server/client 约定

于是原型验证了三种选择：

- TanStack Start
- Deno Fresh
- React Router v7（本质上是 Remix 方向）

作者以前用过 Fresh 与 Remix，都认可它们的成熟度。但：

- Fresh 从 1 到 2 的节奏让团队有点犹豫
- Remix 与 React Router 的合并/拆分演进让他们有所顾虑
- TanStack Start 当时还是 RC，但团队已经大量使用 TanStack 的其它产品，对其方向很乐观

综合权衡后，他们决定押注 TanStack Start。

![](https://www.inngest.com/assets/blog/migrating-off-nextjs-tanstack-start/figure-2-migration-timeline.png)

## 迁移策略：增量还是一次性撕掉创可贴

他们需要在两种方式中选：

- **一次性迁移（brute force）**：能更快收敛，但会带来巨大的 PR、很难传统评审。
- **增量迁移（incremental）**：需要条件路由、共享组件库里大量 Next.js 工具的替换与兼容，基础设施工作更多。

为了估算成本，作者先从 Dev Server（dashboard 路由的一个子集）开始试转。结果转得比预期快，于是直接一路做到底：

- Dev Server 约一周完成切换
- Dashboard 路由更多更复杂，整体多花了一些时间
- 总体仍是“一个工程师 + AI 辅助”在几周内完成

迁移过程中，共享组件凡是依赖 Next.js 的地方，就复制一份改成 TanStack 等价实现；遇到 app heads 之间的交叉引用，也用一些临时类型 hack 过渡。

## 结果：DX 大幅改善

迁移后，他们的本地开发体验显著变好：

- 首次加载通常不超过 2–3 秒
- 且几乎只发生在“第一次加载任一路由”
- 之后的路由切换/加载几乎都是即时

作者强调：这与 Next.js 形成鲜明对比——在他们的体验里，Next.js 本地开发时“每个路由的首次加载”都容易很慢。

## 技术取舍：从约定驱动到显式配置

他们认为核心差异在于：

- Next.js 更偏 **convention-over-configuration**，但有时“魔法且模糊”
- TanStack Start 更偏显式配置 + 规定式的 loader 数据获取

作者用两个片段对比了 Next.js App Router 与 TanStack Router 的风格差异。

### Next.js App Router（示意）

```tsx
export default async function RootLayout({
  params: { environmentSlug },
  children,
}: RootLayoutProps) {
  const env = await getEnv(environmentSlug);

  return (
    <>
      <Layout activeEnv={env}>
        <Env env={env}>
          <SharedContextProvider>{children}</SharedContextProvider>
        </Env>
      </Layout>
    </>
  );
}
```

布局与服务端数据获取“混在一起”，唯一提示它在服务端：`async/await`。

### TanStack Router（示意）

```tsx
export const Route = createFileRoute('/_authed/env/$envSlug')({
  component: EnvLayout,
  notFoundComponent: NotFound,
  loader: async ({ params }) => {
    const env = await getEnvironment({
      data: { environmentSlug: params.envSlug },
    });

    if (params.envSlug && !env) {
      throw notFound({ data: { error: 'Environment not found' } });
    }

    return { env };
  },
});

function EnvLayout() {
  const { env } = Route.useLoaderData();

  return (
    <>
      <EnvironmentProvider env={env}>
        <SharedContextProvider>
          <Outlet />
        </SharedContextProvider>
      </EnvironmentProvider>
    </>
  );
}
```

作者解释：这里的 `getEnvironment` 是 `createServerFn`，只会在 server 执行；`useLoaderData` 则在 client 侧读取路由数据。

## AI 在迁移中怎么用

![](https://www.inngest.com/assets/blog/migrating-off-nextjs-tanstack-start/figure-3-ai-workflow.png)

他们对 AI 的定位很务实：主要让 AI 做“体力活”，而不是做架构决策。

做法大致是：

- 先人工迁移一条路线并建立模式（server/client 数据获取、组织方式）
- 再让 AI 把模式复制到相似路由
- 人工复查与清理

此外，AI 也用来辅助处理一些 TypeScript 与边角 bug。

## 经验与建议

### TanStack Start 相关

- **尽早、频繁 build**：一旦有较多 server-side 代码，迟早会遇到“错误地被打进 client/server”的 bundling 问题；构建间隔越小，越容易定位。
- **不要只依赖 dev mode**：他们遇到过 dev 与 build 后行为不同的情况；有疑问就本地 build + preview。

### 迁移过程相关

- **一次性迁移意味着巨大 PR**：几乎无法传统方式评审；他们选择用充分的 UAT 来对冲风险。
- 他们确实遇到过一次需要立即回滚的问题（某个难以在生产外测试的集成流程）。
- 如果你的工程环境非常风险厌恶，可能更值得投入额外工程实现“增量切换”。

## 如何做你自己的决策

作者把迁移结果开源在 UI monorepo：

<https://github.com/inngest/inngest/tree/main/ui>

原文末尾包含产品 CTA 与联系入口，已在此译文中省略。
