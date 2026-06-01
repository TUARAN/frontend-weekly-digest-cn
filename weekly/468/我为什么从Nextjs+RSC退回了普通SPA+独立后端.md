原文：[Why I Walked Back from Next.js and RSC to a Plain SPA and a Separate Backend](https://dev.to/devrayat000/why-i-walked-back-from-nextjs-and-rsc-to-a-plain-spa-and-a-separate-backend-3ibo)
链接：https://dev.to/devrayat000/why-i-walked-back-from-nextjs-and-rsc-to-a-plain-spa-and-a-separate-backend-3ibo
翻译：TUARAN

---

# 我为什么从 Next.js + RSC 退回了普通 SPA + 独立后端

**作者：Zul Ikram Musaddik Rayat | 2026年5月21日**

---

我写 React 已经很久了。我想给你们讲一个"往返"的故事：我曾经是 Next.js 的忠实信徒，经历了 App Router 和 Server Components 搬进项目、打乱所有代码结构的时代，遇上了几起真正惊悚的安全事件，最后我开心地回到了一种枯燥、易懂的架构：单页应用（SPA）+ 独立后端，两者通过 plain HTTP 边界通信。

这不是一篇"框架 X 已死"的博眼球文章。它描述的是我自己的思考是如何转变的，以及为什么 2026 年我会选择的工具，看起来和 2018 年我会选的非常像——只不过在真正重要的部分更聪明了。

---

## 当 Next.js 确实很好的时候

我想公平地对待 Next.js，因为在很长一段时间里它配得上它的口碑。

Pages Router 时代是它的黄金时期。文件路由系统你可以用 5 分钟给新人讲明白。`getStaticProps` 和 `getServerSideProps` 两个函数，命名清晰，心智模型非常明确：一个在构建时运行，一个每次请求都运行，剩下的都是普通的 React 代码。你还能获得代码分割、图片优化，以及基本能正常工作的开发服务器。部署也不是什么麻烦事。

我最欣赏的是**服务器和客户端的边界是清晰可辨的**。数据获取发生在路由顶部的命名生命周期函数里，下面的组件树都是普通的客户端 React。我可以指着任何一行代码告诉你它运行在哪台机器上。这种清晰性比人们当时意识到的价值高得多——我们直到它消失之后才注意到它。

所以当我说是我离开的时候，要明白我是离开了一个我曾经热爱的东西。

---

## 然后 App Router 和 Server Components 搬进来了

App Router 和 React Server Components 被宣传为下一代进化，纸面上的宣传点非常诱人：在服务器上渲染组件，发送更少的 JavaScript，把数据获取和需要它的组件放在一起，当 HTML 准备就绪就流式传输到浏览器。谁不想要更少的 JS 和更快的首屏绘制呢？

但在实际使用中，我真正经历的是：

**心智模型破碎了。** 突然之间每个文件要么是 Server Component 要么是 Client Component，这个区别是决定性的，边界通过文件顶部的 `"use client"` 字符串声明。这个指令在一个方向上是"病毒式传播"的，而且不会显式提示。昨天还能正常工作的组件今天挂了，因为往上三层某个组件跨过了边界，而你得到的错误很少是"你跨过了边界"；它要么是序列化报错，要么是 hydration 不匹配，要么是 hook 被用在了不能用它的地方。

**"开发环境能跑"不再有任何意义。** `next dev`、`next build && next start` 和生产环境边缘部署之间的缓存行为差异大到我不再相信本地结果。我遇到过只存在于生产缓存里的 bug。我遇到过不管怎么设置 `revalidate` 值都不会消失的过时数据。我学了比我想要的多的多的 Next.js 缓存层知识，而这份知识的回报是我永远处于一种低烈度的焦虑中，担心任何给定页面是不是真的刷新了。

**服务器/客户端边界不再清晰可辨。** 这是真正让我抓狂的点。Pages 时代我最喜欢的东西——看代码就知道它运行在哪——恰恰是 RSC 夺走的东西。现在数据获取分散在组件树的各个地方。`async` 组件看起来和普通组件一样，但其实不是。边界是真实存在且有后果的，但在调用点完全看不见。

单独来看这些问题都不是无法修复的。但加在一起意味着我把很大一部分时间花在了和框架的模型对抗上，而不是构建产品。这是本该更早读懂的信号。

---

## 然后安全事件让它变得具体

架构层面的摩擦还只是主观判断。安全事件不是。一连串的安全事件把我模糊的不安变成了一个决策。

一切始于 **CVE-2025-29927**，2025 年 3 月披露的、CVSS 评分 9.1 的中间件授权绕过漏洞。攻击机制简单到近乎尴尬：Next.js 使用内部 header `x-middleware-subrequest` 来标记子请求、防止无限中间件循环，但这个 header 本来就不应该由客户端控制，攻击者通过伪造这个 header，可以完全跳过中间件，包括认证和授权，用一个精心构造的 `curl` 命令就能访问受保护的路由。

如果这只是个例，我本来会耸耸肩就过去了；每个框架都有 bug。但这不是个例。2025 年下半年和 2026 年初接二连三的安全事件，**模式**才是关键：

- **CVE-2025-55182**（2025 年 12 月）—— React Server Components 漏洞，CVSS 满分 10.0。它存在于 `react-server-dom-*` 包中，因此影响了所有基于 RSC 构建的框架：Next.js、React Router 的 RSC API、Waku、Parcel 的 RSC 插件、Vite RSC 插件。满分是非常罕见的，而这个漏洞就存在于 RSC 机制本身。
- **CVE-2026-23864**（2026 年 1 月，CVSS 7.5）—— React Server Components 中的拒绝服务漏洞：发送到 Server Function 端点的恶意负载会触发内存耗尽或 CPU 跑满。和同一次发布中的另外两个中危 Next.js CVE 一起被修复。
- **CVE-2026-23869** 和 **CVE-2026-23870**（2026 年初）—— Server Components 中的更多 DoS 问题，由发送到 App Router Server Function 端点的精心构造的 HTTP 请求触发，在反序列化时炸掉 CPU。影响 Next.js 13.x 到 16.x 的 App Router 版本。
- **CVE-2026-44578**（2026 年 5 月，CVSS 7.8）—— 自托管 Next.js Node 服务器中的服务端请求伪造（SSRF）漏洞：精心构造的 WebSocket 升级请求让攻击者可以把请求代理到任意内部目标，包括云元数据端点。

看看这些漏洞集中的地方。一个中间件绕过，然后是一连串 Server Component 和 Server Function 漏洞，其中好几个都是由**"精心构造的请求反序列化时触发"**的。这不是代码库里随机分布的不幸。易受攻击的层面**正是**服务端渲染和服务端函数机制，也就是 App Router 和 RSC 作为核心的那部分。你的框架在每次请求时做的服务端工作越多，你注册的**攻击面就越大**，而 RSC 共享包里的 10 分漏洞意味着一个 bug 会波及所有采用这个模型的框架。

让我不安的不是任何一个单独的 CVE……而是这个集群对架构的暗示。像我这样的团队被悄悄引导把中间件当成授权层，因为在 App Router 模型中，中间件做认证是阻力最小的路径。所有漏洞分析里最清醒的结论也是让我最受触动的：**中间件应该作为补充，而不是替代靠近数据的、强制执行的**安全措施。所以，我坐下来思考了一个问题：**我愿意把多少安全态势和渲染框架的内部请求管道耦合在一起？** 我的答案是"尽可能少"。

---

## TanStack 路线——也不是免费的午餐

当开发者受够了 Next.js，常见的下一个选择是 TanStack 生态——TanStack Router 和 TanStack Start。我得诚实说：TanStack Router 确实是工程上非常出色的作品。类型安全的路由是一流的，搜索参数处理非常周到，数据加载也考虑得很周全。如果你只问我开发体验，我会说很多好话。

但"切换到 TanStack"并不是有些人以为的逃生舱口，最近的历史非常尖锐地说明了这一点。

2026 年 5 月，**TanStack npm 包遭到了供应链攻击**。2026 年 5 月 11 日，一个威胁组织针对 npm 和 PyPI 生态发起了协调的供应链攻击，入侵了多个命名空间下的包，包括 `@tanstack` 命名空间，其中包含 `@tanstack/react-router`——React 生态中使用最广泛的路由库之一，每周下载量约 1200 万。在一个周一的 19:20 到 19:26 UTC 之间，攻击者在 42 个 TanStack 包中发布了 84 个恶意版本。

攻击载荷并不隐晦。它目标是 CI/CD 令牌、AWS/GCP/Azure 的云凭证、Kubernetes 服务账户、Vault、registry 令牌，而且它使用窃取的 npm 和 GitHub Actions 令牌发布更多包的恶意版本，就像一个在 npm 生态里传播的蠕虫。它还安装了一个持久化守护进程，每 60 秒轮询一次 GitHub，如果发现令牌被吊销，就尝试运行 `rm -rf` 删除用户的 home 目录。有一个细节让这件事格外可怕：**被入侵的包带有有效的 SLSA Build Level 3 溯源证明**，这让它成为第一个被记录下来的、能生成有效证明的恶意 npm 蠕虫，因为恶意版本是通过项目自己的 GitHub Actions 发布流水线、使用被劫持的 OIDC 令牌发布的。

我想在这里很小心也很公平。这**不是** TanStack Router 代码的漏洞。攻击者是通过在 GitHub 上 fork 一个 TanStack 仓库，然后用伪造的身份提交恶意 commit 进来的。TanStack 的维护者响应很快，沟通也很好。这可能发生在几乎任何人身上——2025 年供应链攻击显著增长，而 npm 生态因为流行度高，吸收了其中很大一部分。2025 年 9 月的 Shai-Hulud 蠕虫是 npm 生态里第一个自传播的蠕虫，影响了超过 500 个包。

所以我从 TanStack 事件里得到的教训不是"TanStack 不安全"。这个教训和派系无关。**教训是：没有任何框架选择能让你免疫供应链风险，你把多少栈集中到一个重量级元框架里，一次入侵的影响范围和吸引力就有多大。** 切换框架品牌解决不了这个问题。减少攻击面和依赖数量才行。

---

## 更深层的原因：全栈 RSC 本来就会很难——序列化

暂时把 CVE 放在一边，因为我认为有一个更根本的问题，它最终让我确定了想法。

Server Components、server actions 和流式传输的整个承诺是，服务器/客户端边界应该感觉无缝……你只要写组件和调用函数，框架会搞清楚什么在哪运行。但跨网络的函数调用**不是**函数调用。边界是真实存在的，它由**序列化**构成。

所有从服务器传到客户端的东西都必须序列化成 RSC 负载，流式传输，然后反序列化。这个约束悄悄塑造了一切：

- 你不能从 Server Component 给 Client Component 传递函数，除非它是 server action，因为函数无法序列化。所以"传个回调就行"——React 里最普通的事情，变成了一个边界决策。
- 类实例、`Date` 语义、`Map`/`Set`，任何有方法或身份的东西，所有这些都得被压平成普通数据，否则就没法干净地传输。
- 起源于服务器的错误在你能在客户端看到之前就被序列化了，所以你得到的堆栈跟踪往往是真实问题的翻译版本，而不是问题本身。
- 流式传输加入了**时间**这个维度。组件乱序解析，Suspense 边界独立刷新，现在你要推理的是树在流式传输中的部分状态，这比"先获取，再渲染"的心智模型难得多。

这不是任何人能修补的 bug。这是**内在的**。一旦你让 UI 树跨网络边界存在，你就签下了一个披着组件外衣的分布式系统问题，而序列化就是这个问题泄露出来的地方。RSC 的无缝性，在很大程度上，是对本质上不无缝的东西的一个 leaky 抽象。你可以用它做出令人印象深刻的 demo。要在大型应用、团队和一年的变更中保持它的稳定，是另一回事。

而且注意这和之前的 CVE 集群的联系。2026 年的好几个漏洞，Server Function DoS bug，都是在**"精心构造的请求反序列化时触发"**的。这不是巧合。把不受信任的输入反序列化成活的程序是计算领域最古老、最危险的操作之一，而 RSC 模型把反序列化边界放在了普通功能工作的热路径上。这个架构不仅让我的应用更难推理；它还让框架本身成为了更丰富的攻击目标。**序列化既是人体工程学上的代价，也是安全攻击面，是同一个缝，被收了两次费。**

一旦我这么想，我的决策基本上就自己做了。我不希望我的 UI 框架和数据边界融合在一起。我希望网络边界是**显式的、可见的、枯燥的**，是我特意走过去的地方，而不是隐藏在我的组件树里的缝。

---

## 我现在实际使用的技术栈

这就是我最终落地的选择。这些东西都不新奇。这才是重点。

### 前端：React Router 框架模式，基于 Vite，主要是 SPA

我使用**框架模式下的 React Router**，搭配 **Vite**。框架模式给了我确实怀念的 Next.js 的东西：类文件路由约定、loaders 和 actions、嵌套布局、类型安全的参数，而且不强迫我接受服务端渲染模型。

关键的部分：**我不运行 SSR。** 少数真正静态的页面——营销页、文档、落地页——在构建时被**预渲染**，所以它们作为快速的静态 HTML 发送，对爬虫友好。其他所有东西都是**普通的客户端渲染 SPA**。

人们会说，"但 SPA 慢/对 SEO 不友好/过时了。" 对于一个需要认证的应用、仪表盘、工具或者登录后才能看到的产品，这些批评几乎都不适用。登录墙后面没有什么需要谷歌索引的。首屏绘制是一个薄的外壳，包按路由分割，之后的导航都是即时的，因为全是客户端渲染。我得到的构建产物只是静态文件。我可以把它们放在任何 CDN 或对象存储上。没有需要保持运行、打补丁、扩容或者出 CVE 的服务端渲染进程。部署的故事就是"上传一个文件夹"，前端的安全攻击面几乎降到了零。

而且关键的是：**我的 UI 里没有序列化边界。** 组件树完全在浏览器里运行。它通过 `fetch` 和后端通信，调用的是我刻意设计的 API。边界在代码里是可见的，就在它存在的地方。

实际用起来是这样的。一个路由在 `clientLoader` 里加载数据，尽管它住在框架模式的路由文件里，它完全在浏览器里运行，只是调用我的 API：

```typescript
// app/routes/projects.tsx
import type { Route } from "./+types/projects";
import { api } from "~/lib/api-client";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // 在浏览器里运行。没有服务器。只是对我的后端的一个 HTTP 调用。
  const projects = await api.projects.$get();
  if (!projects.ok) throw new Response("Failed to load", { status: 502 });
  return { projects: await projects.json() };
}

export default function Projects({ loaderData }: Route.ComponentProps) {
  return (
    <ul>
      {loaderData.projects.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

这里根本没有 `loader`（服务端），只有 `clientLoader`。缝就是 `api.projects.$get()` 调用，我可以指着它。认证也是一样的做法，用一个在受保护路由的 loaders 之前运行的 `clientMiddleware`：

```typescript
// app/routes/dashboard.tsx - 一个受保护的布局路由
import { redirect } from "react-router";
import type { Route } from "./+types/dashboard";
import { api } from "~/lib/api-client";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  async ({ context }) => {
    const res = await api.auth.me.$get();
    if (!res.ok) throw redirect("/login");
    context.set(userContext, await res.json());
  },
];
```

但注意这个中间件**不是什么**：它不是我的安全边界。它是一个 UX 便利；它把未认证的用户弹到登录页，这样他们就不会盯着一个坏掉的页面。如果有人完全跳过它，他们也得不到任何东西，因为**每个 API 端点在服务端、每次请求都强制执行认证。** 这就是 CVE-2025-29927 的教训的应用：客户端中间件是为了体验，永远不是为了强制执行。前端没法绕过后端拥有的检查。

那个契约的后端部分，在 Hono 里，是显式且可检查的：

```typescript
// server/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { authMiddleware } from "./auth";

const app = new Hono();

app.use("*", cors({ origin: ["https://app.example.com"], credentials: true }));
app.use("*", csrf({ origin: ["https://app.example.com"] }));

// 真正的强制执行：API 本身拒绝未认证的请求。
const projects = new Hono()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    const user = c.get("user"); // 由 authMiddleware 设置，这里可信
    return c.json(await db.projectsForUser(user.id));
  });

const routes = app.route("/projects", projects).route("/auth", authRoutes);
export type AppType = typeof routes; // <- 为前端导出
```

最后一行是我特意选择 Hono 的唯一原因。导出 `AppType` 让前端可以构建一个完全类型化的客户端，不需要代码生成步骤，也不需要共享运行时：

```typescript
// app/lib/api-client.ts
import { hc } from "hono/client";
import type { AppType } from "../../server";

// `api` 是和后端路由端到端类型匹配的。
export const api = hc<AppType>("/api", { init: { credentials: "include" } });
```

如果后端改变了路由的形状，前端就无法编译。这就是人们归功于好的 Next.js setup 的类型安全，而我不用把两半融合到一个运行时里就得到了它。把 Hono 换成 Go 或者 Python，我只会失去这个类型化客户端的便利；架构是不变的，因为契约只是 HTTP。

对于**初始渲染之后**加载的数据，一个在其他内容都就绪的页面上的慢部件，我会用 `Suspense` 和 `use` hook。这是流式传输时代里唯一真正的好主意，而且好在它在普通 SPA 里也能完美工作，不需要服务端渲染：

```tsx
import { Suspense, use } from "react";
import { api } from "~/lib/api-client";

// 启动请求；不要 await 它。`use` 会在这个 promise 上挂起。
function ActivityFeed({ feedPromise }: { feedPromise: Promise<Activity[]> }) {
  const activity = use(feedPromise); // 一直挂起直到解决
  return <Feed items={activity} />;
}

export default function Dashboard() {
  // 在浏览器里的渲染期间创建的 Promise。没有 RSC 负载。
  const feedPromise = useMemo(() => api.activity.$get().then((r) => r.json()), []);
  return (
    <>
      <Header />
      <Suspense fallback={<FeedSkeleton />}>
        <ActivityFeed feedPromise={feedPromise} />
      </Suspense>
    </>
  );
}
```

同样的 `Suspense`，同样的 `use`，同样的内容渐进到达的流式体验 UX，但 promise 是在浏览器里解决的普通 `fetch`，不是序列化服务器树的一个块。没有乱序刷新需要推理，没有 hydration 边界，没有负载格式。我得到了流式传输时代的人体工程学优势，同时抛弃了和它捆绑在一起的序列化树机制。

### 后端：独立服务——如果我想要 TypeScript 就用 Hono

后端是它自己的东西，独立部署、扩容和推理。现在，我大多选择 **Hono**，因为它小、快、可以在从 Node 到 workers 到 Bun 的任何地方运行，而且让我可以端到端保持 TypeScript。用 Hono，我可以在客户端和服务器之间共享类型，甚至得到一个类型化的客户端，所以我完全没有失去好的 Next.js setup 给我的类型安全。

但是，而且这很重要——**后端根本不一定是 JavaScript。** 它完全可以同样是 Go 或者 Python。我现在可以自由选择的原因恰恰是前面的序列化点：当前端是一个通过 plain HTTP 和 JSON 和 API 通信的 SPA 时，没有 RSC 负载，没有 server action 边界，没有强制两边用同一种语言的共享组件树契约。契约只是 HTTP。Go 做后端非常棒。Python 做后端非常棒。我特意用 Hono，而且只在我想要 TypeScript 类型共享便利的时候；这是一种偏好，不是要求。架构本身是与语言无关的，而这种灵活性是我通过**移除**融合边界给自己的一项功能。

### 安全特意放在后端

这是我最在意的部分，也是 CVE-2025-29927 的直接教训。**授权和安全是后端的工作，在 API 层强制执行，每次请求，没有例外。** 不在框架中间件里。不和渲染器的内部请求管道耦合。在拥有数据的服务里。

具体来说，在后端，我运行：

- **认证**作为一个真正的、deliberate 的会话或令牌层，在每次受保护请求时服务端验证。拥有数据库的服务器决定你能看到什么。前端永远不被信任来执行这个；它只反映它。
- **CORS**配置得很严格——明确的来源白名单，不是通配符，所以浏览器只允许我的实际前端和 API 通信。
- **CSRF 保护**——因为 SPA 加 API 的 setup 经常使用 cookie，我使用适当的 anti-CSRF 令牌和/或 `SameSite` cookie 属性，这样恶意站点不能骑在一个登录用户的会话上。
- **CAPTCHA**放在容易被滥用的端点上，注册、登录、密码重置、公开表单提交，以阻止机器人和 credential stuffing。
- 加上通常的不光彩的卫生：速率限制、API 边缘的严格输入验证、安全 header、秘密不放在客户端包里、处处最小权限。

每一个都是我可以配置并且指着说的。没有看不见的 header 能关掉我的认证，因为我的认证从来不是一个 header；它是请求处理器里的一个被检查的条件，位于攻击者和数据库之间。如果有人绕过一个路由层，他们会打到 API，而 API 仍然会说不。

---

## 我实际得到了什么

退一步看，这是我做的交易以及我为什么满意它。

**我放弃了：**开箱即用的服务端渲染动态页面，以及元框架的"所有东西都是一个项目"的便利。

**作为交换，我得到了：**

- **清晰的架构。** 我可以指着任何一行说它运行在哪台机器上。网络边界是一个显式的地方，即 API，而不是被 invisibly 地涂抹在组件树里。
- **没有序列化税。** UI 树完全在浏览器里运行。没有 RSC 负载，没有 server action 管道，没有流式顺序谜题。
- **微小的前端攻击面。** 静态文件在 CDN 上。没有需要保持运行的，没有需要打补丁的，没有 Server Functions 可以发送精心构造的负载，没有什么能抓住 RSC 包里的下一个 10.0 分漏洞。
- **我可以看到的安全。** 认证、CORS、CSRF、CAPTCHA 和速率限制都住在一个服务里，每次请求强制执行，和任何渲染器解耦。
- **后端自由。** 今天用 Hono 是为了 TypeScript 人体工程学；明天如果项目需要可以用 Go 或者 Python。HTTP 契约不在乎。
- **更小的爆炸半径。** 两个适中的、独立更新的部分，依赖更少，而不是一个大的元框架，其单一入侵是一个非常吸引人的目标。

---

## 那么，Next.js 不好吗？TanStack 不好吗？

不。我想诚实地结束，因为派系博客文章老化得很差。

Next.js 和 TanStack 都是严肃的、工程良好的项目，由有才华的人构建。我描述的 CVE 和供应链攻击是真实的，值得了解，但 CVE 得到了修补，而 TanStack 事件是一个账号和流水线入侵，可能发生在几乎任何流行的包上。如果你的产品真的需要服务端渲染来做动态内容的 SEO，或者你有一个内容重的站点，流式传输能收回成本，元框架绝对可以是正确的选择。很多团队在 exactly 我离开的栈上发布了很棒的东西。

我的观点更窄，更个人。对于**我**构建的应用，认证后的产品，其 UI 是交互式的，数据是皇冠上的宝石，全栈 RSC 模型增加了一个我不想要的序列化形状的边界，隐藏了我最需要看到的缝，并且把我的安全推向了框架的管道而不是我自己的后端。一个 SPA 加一个独立的、安全良好的后端给了我一个更小的、更清晰的、更枯燥的系统。而在软件里，枯燥通常是一种赞美。

这就是往返。我离开了，我看了看周围，然后我回到了一个普通的 SPA 和一个真正的后端，更老的想法，带着更锐利的理由持有。

---

*本文由 TUARAN 翻译自 Dev.to，原文作者 Zul Ikram Musaddik Rayat，原文链接见上方。*
