原文：React Remix Vs Next JS Vs SvelteKit
翻译：TUARAN
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Remix vs Next.js vs SvelteKit：框架对比与选型
原文链接：https://blog.logrocket.com/react-remix-vs-next-js-vs-sveltekit/



编者按：本文在 2026 年 1 月更新，以反映 Remix 与 React Router v7 的合并、静态站点生成能力的演进、更现代的错误处理模式，以及最新的框架约定。

Remix 是由 React Router 团队打造的全栈 Web 框架，近年的最大变化之一是它与 React Router v7 的统一：路由、数据加载与“韧性（resilience）”等能力更直接地沉淀进 React Router 的范式中。这让开发者能在熟悉的 React Router 模型下构建更快、更稳健的应用。

与此同时，近几年开源框架与云服务结合的 SaaS 范式在业界进一步固化：Next.js、Gatsby 等 React 元框架提供了带有额外优化能力的付费托管；Shopify 推出了 React 元框架 Hydrogen，并配套了名为 Oxygen 的托管服务；Neo4j、ArangoDB、MongoDB 等数据库也都提供了云数据库产品，降低采用与运维成本。

另一方面，Next.js 背后的 Vercel 也在生态上动作频繁，例如邀请 Svelte 的作者 Rich Harris 全职投入 SvelteKit（Svelte 的主要元框架）。

作为服务端渲染（SSR）框架，Remix/React Router v7 与 Next.js、SvelteKit 在目标上有相当重叠：它们都希望用“约定优于配置”的方式提供路由、数据加载、构建与部署体验。下面我们按从创建项目到部署的一条线，对比它们的核心能力，帮助你为不同项目做出更合适的选择。

注：Vue/Angular/SolidJS 的同类元框架通常对应 Nuxt、Angular Universal、SolidStart。

## 初始化项目

三个框架的脚手架命令大致如下：

```bash
# React Router v7（原 Remix）
npx create-react-router@latest

# Next.js
npx create-next-app@latest

# SvelteKit
npx sv create my-app
```

React Router v7 的脚手架通常会提供针对不同托管平台的模板（如 Netlify、Cloudflare、Fly.io、Vercel 等），并包含与部署相关的默认配置与文档，便于快速落地。

## 路由

路由决定了访问不同页面所对应的 URL。三者都采用文件系统路由：URL 由页面文件的路径与命名规则决定。

下面展示三者把文件映射到 URL 的方式（包含一个带 URL 参数的例子）：

### React Router v7（Remix）

React Router v7 在 v6 的基础上加入了更一等的服务端能力，你仍然可以在客户端代码里使用熟悉的 Hook（例如 `useParams`、`useNavigate`）来处理导航。

```text
/             → app/routes/home.tsx
/hello        → app/routes/hello.tsx
/use_param/:id → app/routes/use_param.$id.tsx
```

### Next.js

App Router（推荐）：

```text
/             → app/page.js
/hello        → app/hello/page.js
/use_param/:id → app/use_param/[id]/page.js
```

Pages Router（旧方案）：

```text
/             → pages/index.js
/hello        → pages/hello/index.js 或 pages/hello.js
/use_param/:id → pages/use_param/[id].js
```

### SvelteKit

```text
/             → src/routes/+page.svelte
/hello        → src/routes/hello/+page.svelte
/use_param/:id → src/routes/use_param/[id]/+page.svelte
```

说明：SvelteKit v1+ 使用 `+page.svelte` 约定替代过去的 `index.svelte`。

## 服务端数据加载

元框架的一个关键收益，是能在页面“水合（hydration）”之前就把数据准备好（例如请求 API、做数据转换等），从而减少在客户端用 `useEffect` 等方式处理异步数据的负担。

三者都提供了“每个页面/路由的服务端函数”，会在把页面返回给浏览器之前执行。

### React Router v7（Remix）

通过导出 `loader` 函数获取上下文（URL 参数、请求对象等），返回给路由的数据随后可用 `useLoaderData` 读取：

```tsx
import { useLoaderData } from "react-router";

export async function loader({ params, request }) {
  const id = params.id;
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit");

  return { id, limit };
}

export default function SomePage() {
  const { id, limit } = useLoaderData();
  return (
    <div>
      <h1>The params is: {id}</h1>
      <h1>The limit url query is: {limit}</h1>
    </div>
  );
}
```

### Next.js

App Router 下，你通常会使用 async Server Components，并通过 `params` 与 `searchParams` 获取参数：

```tsx
export default async function SomePage({ params, searchParams }) {
  const id = params.id;
  const limit = searchParams.limit;

  return (
    <div>
      <h1>The params is: {id}</h1>
      <h1>The limit url query is: {limit}</h1>
    </div>
  );
}
```

Pages Router（旧方案）下，则可导出 `getServerSideProps`：

```tsx
export const getServerSideProps = async ({ params, query }) => {
  const id = params.id;
  const limit = query.limit;

  return { props: { id, limit } };
};

export default function SomePage({ id, limit }) {
  return (
    <div>
      The params is: {id}

      The limit url query is: {limit}
    </div>
  );
}
```

### SvelteKit

在 `+page.js` / `+page.ts` 中导出 `load`：

```js
// +page.js
export async function load({ params, url }) {
  const id = params.id;
  const limit = url.searchParams.get("limit");

  return { id, limit };
}
```

在 `+page.svelte` 中读取：

```svelte
<!-- +page.svelte -->
<script>
  export let data;
</script>

<div>
  <h1>The params is: {data.id}</h1>
  <h1>The limit url query is: {data.limit}</h1>
</div>
```

## 以静态站点生成（SSG）方式预渲染

三者的静态预渲染能力近年都有显著演进。

### React Router v7（Remix）

React Router v7 通过“预渲染（pre-rendering）”支持静态站点生成。你可以在路由模块中导出 `prerender`（或在应用配置中设置）来让部分路由在构建期生成静态 HTML，使其更适用于博客、营销站等内容型站点。

### Next.js

Next.js 提供多种渲染策略。App Router 下常见的选择包括：

- 静态生成：默认在构建期渲染
- 动态渲染：使用 `cookies()`、`headers()` 或动态的 `searchParams` 等会触发动态行为
- 增量静态再生成（ISR）：部署后定期/按需再验证并更新静态页面

示例：静态生成 + 定时再验证

```tsx
export const revalidate = 3600; // 每小时再验证一次

export default async function Page() {
  const data = await fetch("https://api.example.com/data");
  return <div>{/* content */}</div>;
}
```

Pages Router（旧方案）下，通常通过 `getStaticProps`：

```ts
export async function getStaticProps() {
  return {
    props: { data: null },
    revalidate: 3600,
  };
}
```

### SvelteKit

SvelteKit 支持按页面开启预渲染：

```js
// +page.js
export const prerender = true;
```

也可以在 `svelte.config.js` 中全局配置，让整个站点都预渲染。

## API 路由

即使你可以用 `loader` 在服务端做很多事情，实际项目里仍然经常需要“只在服务端可见/可执行”的专用 API 端点。

### React Router v7（Remix）

如果创建一个路由且不导出组件，它会被当作资源路由（resource route），用于返回 JSON 等响应：

```ts
export function loader({ params }) {
  const id = params.id;
  return Response.json(
    { id },
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
```

### Next.js

App Router 使用 `route.js` 创建 Route Handlers：

```js
// app/api/user/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  return Response.json({ id });
}
```

Pages Router（旧方案）在 `pages/api` 下创建 API：

```js
export default function handler(req, res) {
  res.status(200).json({ id: req.query.id });
}
```

### SvelteKit

通过 `+server.js` 定义端点：

```js
// +server.js
export async function GET({ params }) {
  return new Response(JSON.stringify({ id: params.id }), {
    headers: { "content-type": "application/json" },
  });
}
```

## 样式（Styling）

三者在样式组织方式上差异相对明显。

### React Router v7（Remix）

React Router v7 提供了通过导出 `links` 函数来引入传统 CSS 的方式；同时也支持 CSS Modules、Tailwind CSS 与常见的 CSS-in-JS 方案。

```ts
export function links() {
  return [{ rel: "stylesheet", href: "/styles/app.css" }];
}
```

### Next.js

Next.js 的样式选项比较全面：

- CSS Modules：通过 `.module.css`
- Tailwind CSS：一等支持与自动配置
- CSS-in-JS：支持 styled-components、Emotion 等
- Sass：内置支持 `.scss` / `.sass`
- 全局 CSS：在根 layout 中引入

App Router 下可以在 Server Components 中直接引入 CSS：

```tsx
import "./styles.css";

export default function Page() {
  return <div>Content</div>;
}
```

### SvelteKit

Svelte 倾向单文件组件，组件内 `<style>` 默认是“组件级作用域”的：

```svelte
<style>
  h1 {
    color: blue;
  }
</style>

<h1>Hello World</h1>
```

同时也支持全局样式、预处理器与 Tailwind 等。

## 错误处理

再完善的系统也难免出错。生产环境不是 `localhost`，因此需要为错误准备合适的处理与兜底机制。

### React Router v7（Remix）

React Router v7 内置了服务端与客户端渲染的错误处理能力。错误边界不会阻止整页渲染，而是仅替换发生错误的 UI 部分；错误会沿着路由层级向上冒泡，直到命中某个错误边界为止。

```tsx
import { useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div>
      <p>An error occurred!</p>
      <pre className="mt-4">{error.message}</pre>
    </div>
  );
}
```

### Next.js

App Router 通过特殊文件 `error.js` 自动创建错误边界：

```tsx
// error.js
"use client";

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

你也可以用 `global-error.js` 捕获根 layout 的错误。Pages Router（旧方案）通常使用 React 的 ErrorBoundary 模式。

### SvelteKit

SvelteKit 使用 `+error.svelte` 处理错误，并通过 `error` helper 抛出：

```js
// +page.js
import { error } from "@sveltejs/kit";

export async function load({ params }) {
  const post = await db.getPost(params.slug);

  if (!post) {
    throw error(404, { message: "Post not found!" });
  }

  return { post };
}
```

```svelte
<!-- +error.svelte -->
<script>
  import { page } from "$app/stores";
</script>

<h1>{$page.status}: {$page.error.message}</h1>
```

## 部署

### React Router v7（Remix）

Vercel、Render、Netlify、Cloudflare 等平台都提供了部署指南；框架本身也提供了多种模板，便于通过 CLI 快速部署。

### Next.js

由于 Vercel 是 Next.js 的主要“官方”托管选择，体验通常最顺滑。但 Next.js 也相对更灵活：只要宿主支持 Node.js，就可以部署到多种平台（Netlify、Cloudflare、Render、AWS、Heroku 等）。总体而言，Next.js 的部署选项往往比 SvelteKit 与 Remix/React Router v7 更丰富。

### SvelteKit

Vercel 与 Render 对 SvelteKit 有较好的一等支持；在其他平台上，可以通过 SvelteKit 的 Adapters API 做针对性的适配与优化，并参考 Netlify/Cloudflare 等平台提供的 adapter 部署指南。

## React Router v7 真正的差异点在哪里？

React Router v7 在“表单处理”的取向上很突出：随着 Remix 的融合，这套模型直接进入了 React Router 的核心能力。

很多现代框架会用 JS 驱动的提交流程替代浏览器原生表单行为；而 React Router v7 更强调渐进增强（progressive enhancement）——即便在 JavaScript 不可用的情况下，表单也应该能工作。

例如传统表单：

```html
<form method="post" action="/user/new">
  <input type="text" name="username" />
  <input type="password" name="password" />
  <input type="submit" value="new user" />
</form>
```

请求方法和提交地址都由表单本身定义，不需要 `onSubmit` / `preventDefault`。React Router v7 提供了 `Form` 组件来保留并强化这种体验。

下面是一个 `Form` 的示例（通过导出 `action` 处理 POST，并在完成后重定向）：

```tsx
import { Form, redirect } from "react-router";

export async function action({ request }) {
  const formData = await request.formData();
  const project = await createProject(formData);
  return redirect(`/projects/${project.id}`);
}

export default function NewProject() {
  return (
    <Form method="post">
      <p>
        <label>
          Name: <input name="name" type="text" />
        </label>
      </p>
      <p>
        <label>
          Description:
          <br />
          <textarea name="description" />
        </label>
      </p>
      <p>
        <button type="submit">Create</button>
      </p>
    </Form>
  );
}
```

当表单提交时，会向当前路由发起 `POST` 请求，由该路由导出的 `action` 负责处理，然后重定向到正确的页面。某种意义上，“旧方式”在今天又变得新潮了。

## 结论

如果你希望找回更“传统的全栈 Web 应用”的手感，同时又能在客户端合理利用 React，那么 React Router v7 是一个很有吸引力的选择。随着静态站点生成能力的加入，它也能覆盖更广的场景（例如博客与营销站）。

更宏观地看，前端真正的创新很多都发生在元框架上：React Router v7、Next.js、SvelteKit、Nuxt、Gatsby、SolidStart 等持续塑造现代 Web 应用的构建方式。
