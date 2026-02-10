# 用 AI 调试：能取代资深开发者吗？

[原文链接：Debugging with AI: Can It Replace an Experienced Developer?](https://www.developerway.com/posts/debugging-with-ai)

作者：Nadia Makarevich

2026 年 2 月 4 日

作者做了一个很“工程化”的测试：在一个带 Next.js + TanStack Query + Zod 的小项目里，故意埋下 3 个真实风格的 Bug，然后用“让 LLM 直接修复”的方式对比人类调试过程，评估 AI 的能力边界。

文章的重点不在“提示词技巧”，而在于：AI 什么时候能帮上忙，什么时候会把你带沟里。

## 实验设定

- 项目包含多页路由、API endpoints、TanStack 做数据请求、Zod 做 schema 校验。
- 每个问题都按同样流程：
  1) 把现象 + 控制台报错 + 复现路径丢给 LLM
  2) 看它给出的修复是否真的解决问题
  3) 人类再从根因出发验证：它修的是“表面”还是“根因”

作者关注三个问题：

- LLM 是否修好了问题？
- LLM 是否找对了根因？
- LLM 是否把根因修对了？

## 调查 1：用户页直接崩溃（Zod 校验失败）

现象：访问 `/users/1`，页面进入错误页；服务端日志没问题，浏览器控制台出现 `ZodError`。

- **LLM 的表现**：很快定位到“返回的数据缺少 schema 要求的字段（phone/address）”，并通过补齐 mock 数据让页面恢复。
- **人类复盘的关键点**：
  - 从调用链（组件 → queryFn → fetch → `UserSchema.parse`）一步步确认是 schema 与返回数据不一致。
  - 虽然“补齐数据”能让页面过，但在真实业务里这些字段往往不应该是必填；更合理的做法通常是把 schema 放宽（`.optional()`/`.nullable()`），并在渲染层做空值处理。

结论：AI 对“常见形态的错误（schema 校验/空值）”非常擅长，但它经常只让测试数据/样例数据“长得像对的”，未必做出更符合产品语义的修复。

## 调查 2：导航时出现“双加载骨架”

现象：从首页导航到用户页时，先出现一套骨架（route-level `loading.tsx`），随后又出现另一套骨架（客户端 `isLoading` 渲染的 skeleton）；但直接刷新用户页时，只出现后一套。

- **人类调试过程里一个很好用的小技巧**：给不同 skeleton 加不同颜色边框（“红框法”），快速确认到底是哪一个在闪。
- **根因拆解**：
  - `loading.tsx` 本质是一个 Suspense 边界：当 `page.tsx` 的异步工作没完成时展示。
  - 刷新时之所以不出现 route-level loading，是因为 `page.tsx` 几乎不“等待”；而从 SPA 导航进入时，需要额外下载 RSC payload，网络慢就会触发 Suspense，因而出现 loading。
  - Next.js 的 prefetch 对动态路由是“部分生效”的，强制 `prefetch={true}` 可以验证这个模型：RSC payload 被提前拉取后，“第一套骨架”就不闪了。

- **LLM 的典型问题**：它有时能给出“看上去可行”的改法（例如 `useSuspenseQuery`），但如果不按框架要求做 SSR/prefetch/hydration，很容易引入新的问题（例如 hydration mismatch）。

可行方向（从低成本到高成本）：

1) 让两套骨架复用同一 UI（减少闪烁感）
2) 把骨架范围缩小，只遮住动态区域，让页面“渐进加载”
3) 走更彻底的方案：在 Server Component 上预取数据（例如 TanStack SSR + `HydrationBoundary`），消掉客户端那套 loader

## 调查 3：访问 `/users` 时先报错再重定向

现象：访问 `/users` 会先闪一个错误页，然后重定向到 `/users/1`；控制台报错是典型的 hooks 错误：`Rendered more hooks than during the previous render.`

- **LLM 的表现**：非常不稳定，给出一堆“听起来合理但无效/不合适”的建议（把 redirect 移到 `useEffect`、改 middleware、改 config 等）。
- **人类最终定位方式**：经典的“二分/剥洋葱”——把布局/组件一层层移除，直到错误消失，从而定位到根因组件。
- **根因**：某个布局里使用了一个触发 Server Action 的组件（`useEffect` 里调用 server action），与重定向 + Suspense 的组合把 Next.js 搞“乱”了。

修复建议很明确：不要在这个路径里用该 Server Action（改成 REST endpoint 或挪到更安全的边界）。

## TL;DR（作者结论）

- AI 对“标准形态的 Bug”（schema 校验、空值、常见运行时错误）很强，作为第一步尝试很划算。
- 一旦进入“需要理解系统为何如此运作”的层面（RSC/Suspense/hydration、框架边界、产品语义权衡），AI 很容易自信胡说。
- 关键技能不是更会 prompt，而是知道什么时候应该停下来开始自己推理：用工具（Performance profile、Network、逐步删减）建立确定性的证据链。
