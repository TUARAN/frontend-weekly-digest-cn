> 原文：[A complete guide to React performance optimization](https://blog.logrocket.com/a-complete-guide-to-react-performance-optimization/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# React 性能优化完全指南（全量翻译）

如今的用户默认就期待应用“又快又顺”。性能不再只是“锦上添花”，它是真正的产品优势，会直接影响留存、转化和收入。

难点在于：排查性能问题常常让人崩溃，因为一个应用变慢的原因实在太多了。

在这份指南中，我会分享一个循序渐进的框架：从分析 bundle 开始，一路优化到服务端渲染。按这四个阶段走，你可以在不牺牲代码质量和开发体验的前提下，把 LCP 从 28 秒降到约 1 秒（超过 93% 的提升！）。

我们会用一个“视频播放器应用”作为示例，按阶段逐步提升性能。你可以在这里获取示例代码仓库：https://github.com/shrutikapoor08/videoplayer-demo 。这篇指南也有视频版。

### 🚀 订阅 The Replay Newsletter（原文站内推荐）

The Replay 是面向开发者与工程负责人（dev + engineering leaders）的每周通讯。

每周一期，精选你需要关注的前端开发讨论、正在涌现的 AI 工具、以及现代软件开发的现状。

---

## 建立基线（Establish baseline）

在改任何东西之前，我们得先知道现状。

先在 Chrome DevTools → Performance 里拿到基线数据。

- 把网络限速设为 Slow 4G
- 关闭缓存（Disable cache）

这样结果才能更接近真实用户环境。

录制一次应用里的“正常用户流程”，观察几个关键指标：

- First Contentful Paint（FCP）
- Largest Contentful Paint（LCP）
- Time to Interactive（TTI）

这些数字能让你很快看出“慢”到底慢在哪。下面是我们起步时的结果：

![](https://blog.logrocket.com/wp-content/uploads/2026/02/1_baseline.png)

---

## 阶段 1：分析并优化 bundle（Phase 1: Analyze and optimize the bundle）

优化的第一步，是搞清楚你到底给用户发了什么。

在动代码之前，先看 bundle，从中找出最值得优先优化的地方。

1) 给构建加一个 bundle analyzer 来可视化包体：

- **Webpack**：`webpack-bundle-analyzer`
- **Vite**：`vite-bundle-analyzer` 或 `rollup-plugin-visualizer`

2) analyzer 会给你一个交互式的 treemap，告诉你哪些包/文件占了最多空间。

你经常会发现：某个“大依赖”（通常是第三方库）吃掉了很大一块体积——这能立刻帮你明确“先优化谁”。

![](https://blog.logrocket.com/wp-content/uploads/2026/02/2_vite-bundle-analyzer.png)

![](https://blog.logrocket.com/wp-content/uploads/2026/02/3_index-html.png)

从这张图可以看出：一些 node modules 占了很大一部分体积，hero 图片也不小。好消息是，我们的 `src` 目录占比很小。

### 优化构建（Optimizing build）

- **确认生产环境启用了 JS 和 CSS 的压缩（minification）。** 现代构建工具大多在 production 模式默认开启，但你最好确认“真的有生效”。压缩会移除空白、缩短变量名，并做其他转换，显著减少文件体积。

- **开启代码分割（code splitting），按路由/功能把 bundle 拆成更小的 chunk。**

	与其把所有代码打成一个巨大的 JS 文件，不如只给当前页面发必需的代码，其余按需加载。

	这个项目使用 TanStack Router，所以我们会按路由拆分。这样后续就可以很容易对不常访问的路由做懒加载导入。

原文示例（节选，按可读性整理）：

```ts
// vite.config.ts
export default defineConfig({
	build: {
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: true,
		minify: true,
		cssMinify: true,
		terserOptions: {
			compress: false,
			mangle: false,
		},
	},
	// ...
	// tanstackRouter({
	//   target: 'react',
	//   autoCodeSplitting: false,
	// }),
});
```

### 组件懒加载（Lazy load components）

![](https://blog.logrocket.com/wp-content/uploads/2026/02/4_lazy-load-analyzer.png)

当我们放大 bundle analyzer 里 `src/components` 的区域，可能会发现：某些组件占了不少体积。

这时就可以通过[懒加载](https://blog.logrocket.com/understanding-lazy-loading-javascript/)来优化：确保它们只在用户真的导航到需要它们的页面/路径时才会被 import。

```tsx
// MovieList.tsx
import { lazy } from "react";

const MovieCard = lazy(() => import("@/components/MovieCard"));
```

### 移除未使用依赖（Removing unused dependencies）

- 运行 `npx depcheck` 找出 `package.json` 里未被实际使用的 node modules。

	depcheck 会扫描代码库并报告“没有在任何地方 import 的包”，你就可以安全移除它们，从而减少 bundle 体积。

![](https://blog.logrocket.com/wp-content/uploads/2026/02/5_remove-unused-dependencies.png)

### 再次测量（Measure again）

为了确认这些改动确实带来收益，我们必须再测一次。

通过 `npm run build` 重新打包：

![](https://blog.logrocket.com/wp-content/uploads/2026/02/6_measuring-again.png)

![](https://blog.logrocket.com/wp-content/uploads/2026/02/7_server-local-host.png)

**影响（Impact）：**

仅仅通过代码分割、移除不必要的 node modules、压缩文件，我们就把 bundle 从 1.71MB 降到了 890KB！

LCP 也从 28.10 秒降到了 21.56 秒：

![](https://blog.logrocket.com/wp-content/uploads/2026/02/image-4.png)

接下来进入更“好玩”的部分：优化 React 组件。

---

## 阶段 2：优化 React 代码（Phase 2: Optimizing React code）

在 React Compiler 出现之前，你必须手工找出性能瓶颈，然后通过 `useMemo` / `useCallback` 等手段做记忆化（memoization）来优化组件。

但现代 React 开发已经有了 [React Compiler](https://blog.logrocket.com/exploring-react-compiler-detailed-introduction/)，它可以自动处理大量性能优化。

除此之外，新的性能监控工具（例如自定义的 React Performance tracks）也让“到底发生了什么”更透明，你不必再靠猜测来判断哪些组件渲染慢。

在开始优化之前，我们先看一下当前可用的工具。

### 1) React 19 Performance tracks

React 19 引入了自定义的 [Performance tracks](https://react.dev/reference/dev-tools/react-performance-tracks)。它把性能分析能力直接集成进 Chrome DevTools 的 Performance 面板，让你能定位真实的渲染瓶颈，而不是凭感觉猜哪个组件慢。

它会展示每个组件在 React 生命周期四个阶段中分别花了多少时间：

- blocking
- transition
- suspense
- idling

trace（追踪）能把“长任务（long tasks）”关联回具体组件的工作和 hook 逻辑，从而快速隔离：昂贵的渲染路径、不必要的重复计算、以及可避免的重复渲染。

![](https://blog.logrocket.com/wp-content/uploads/2026/02/8_react-performance-tracks.png)

来源：https://react.dev/reference/dev-tools/react-performance-tracks

### 2) React Compiler

[React Compiler](https://react.dev/learn/react-compiler) 改变了我们今天看待记忆化的方式。

在它出现之前，开发者往往需要手动：

- 用 `React.memo` 包裹组件
- 用 `useMemo` / `useCallback` 包裹回调或计算

来避免不必要的重新渲染。

这种方式容易出错，而且需要你花大量精力判断“到底哪些组件需要记忆化”。即便手工做了记忆化，也很容易漏掉真正慢的部分。

React Compiler 会作为 Babel 插件接入构建流程，自动分析组件，并基于 [Rules of React](https://react.dev/reference/rules) 施加记忆化。

它理解 React 的渲染行为，能做出比手工优化更“聪明”的决定，在很多情况下甚至能超过人肉优化。

要开始使用它，先安装 compiler 并把它加到 Babel 配置中：

```bash
npm install -D babel-plugin-react-compiler@latest
```

然后更新 Vite 配置（原文示例）：

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
	],
});
```

现在，当你在 React Profiler 里打开组件，会注意到：被 compiler 自动记忆化的组件旁边会出现一个 ✨ 标记：

![](https://blog.logrocket.com/wp-content/uploads/2026/02/9_react-profiler.png)

### 3) React Profiler

虽然它出现很久了，但仍然非常有用：你可以用它理解组件重渲染的次数，以及到底哪些组件在重渲染。

本文也会把它与 React Compiler、Performance tracks 一起用，来找到真正慢的组件。

### 测量（Measure）

使用 React Profiler 时，我们测量用户最常走的一条 UX 路径。本文测量的流程是：

1. 点击一张电影卡片，打开电影详情
2. 播放电影预告片
3. 返回首页

![](https://blog.logrocket.com/wp-content/uploads/2026/02/10_netflix-home-page.png)

你可以看到右上角：在这条 UX 流程中，应用重渲染了 **16 次**：

![](https://blog.logrocket.com/wp-content/uploads/2026/02/11_react-re-renders.png)

最高的那根柱子来自 Movie List 组件，渲染耗时 25ms。

这让我们更清楚：哪个组件最慢、以及它的重渲染频率最高。

### 改进点（Improvements）

#### 1) 让 React Compiler 负责记忆化

有了 React Compiler，你不必手动到处加 `useMemo` / `useCallback`。

它可以自动减少不必要的重渲染和重复计算，你就能把注意力放在“真正需要改的代码问题”上。

#### 2) 清理 `useEffect`

`useEffect` 很容易导致不必要的重渲染。

能不写就尽量不写；必须写时，确保 effect 正确清理，并且不会造成无限的 state update。

作者在另一篇文章里更深入讨论了最常见的 `useEffect` 错误：https://blog.logrocket.com/15-common-useeffect-mistakes-react/ 。

#### 3) 清理函数定义

一个常见错误是：在组件函数体里定义一些“其实不属于这里”的函数（比如纯工具函数）。

问题在于：每次组件渲染，这些函数都会被重新创建——即便它们的实现根本不变。这会给 JS 引擎带来不必要的工作。

把工具函数挪到组件外，或放到单独的工具文件里：

```ts
const formatRuntime = (minutes: number) => {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${mins}m`;
};
```

#### 4) 懒加载组件

用户一开始看不到的大组件，是懒加载的绝佳候选。

像视频播放器、图表、富文本编辑器这类组件，会让初始 bundle 变大，即便大多数用户从来不会用到它们。

React 通过 `React.lazy` + `Suspense` 让这件事很容易：

- 用 `React.lazy()` 替代普通 import，让组件只在需要时加载
- 用 `<Suspense>` 包起来，在加载期间展示 fallback UI（比如 spinner / skeleton）

它和“按路由分割”的 code splitting 配合尤其好：只有用户访问某个页面时才加载对应代码。

```tsx
import { lazy, Suspense } from "react";

const MovieCard = lazy(() => import("@/components/MovieCard"));
```

#### 5) 列表虚拟化（Virtualized lists）

渲染包含大量 DOM 节点的长列表，是非常常见的性能问题。

多数用户甚至不会把列表滚到最底部，你却为看不见的内容做了很多渲染工作。

列表虚拟化的思路是：只渲染屏幕可见的部分（再加一点 buffer）。用户滚动时，元素在 DOM 中被动态添加/移除——列表看起来完整，但性能更好。

像 `react-window`（更轻量）或 `react-virtualized`（功能更丰富）这样的库，可以很容易实现它。

**影响（Impact）：**

![](https://blog.logrocket.com/wp-content/uploads/2026/02/12_react-flix.png)

你会看到：应用的重渲染次数下降了，峰值也变低了，最大一次渲染为 13.1ms：

![](https://blog.logrocket.com/wp-content/uploads/2026/02/13_re-renders-go-down.png)

LCP 也下降了 2 秒。虽然这不是一个巨大的 LCP 改进，但仍然令人鼓舞——因为它说明我们正在朝正确方向前进。

---

## 阶段 3：把工作移到服务端（SSR）（Phase 3: Moving to the server）

[客户端渲染（CSR）](https://blog.logrocket.com/csr-ssr-pre-rendering-which-rendering-technique-choose/) 往往会更慢，因为用户经常会在浏览器下载并执行 JS、再去请求数据期间，看到空白屏或 loading spinner。

这种延迟是 LCP 不佳的主要原因之一，会导致“元素渲染延迟（element render delay）”。

服务端渲染（SSR）通过在服务端先把数据取好、生成 HTML，再把页面发给浏览器来解决这个问题。

用户能立刻看到真实内容，而 JS 在后台加载并 hydration。

### 采用框架（Adopting a framework）

你当然可以自己搭 SSR，但像 Next.js、Remix、或 [TanStack Start](https://blog.logrocket.com/tanstack-start-overview/) 这样的框架会让事情更容易，也更适合生产环境。

TanStack Start 还支持 streaming SSR：服务端可以在生成 HTML 的同时就开始往浏览器发送，而不是等整页渲染完再一次性返回。

迁移到框架通常意味着要改路由与数据获取方式，但性能收益巨大。

你不只是在微调客户端代码，而是在改变页面“何时、在哪里”渲染：数据在组件渲染前就已经在服务端准备好，从而显著降低 LCP。

### Server functions

在 TanStack Start 中，你可以通过 server function 在服务端获取数据。

本文把原本在客户端 `useEffect` 中的数据请求迁到服务端，写成 server function。

原文“前后对比”代码（按可读性整理）：

```tsx
// Before: data-fetching in useEffect
useEffect(() => {
	async function fetchPopularMovies() {
		const token = import.meta.env.VITE_TMDB_AUTH_TOKEN;

		if (!token) {
			setError("Missing TMDB_AUTH_TOKEN environment variable");
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(API_URL, {
				headers: {
					accept: "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch movies: ${response.statusText}`);
			}

			const data = (await response.json()) as TMDBResponse;
			setMovies(data.results);
		} catch (error) {
			setError((error as Error).message);
		} finally {
			setLoading(false);
		}
	}

	fetchPopularMovies();
}, []);
```

```ts
// After: Data-fetching in TanStack Start Server Function
export const getMovies = createServerFn({
	method: "GET",
}).handler(async () => {
	try {
		const response = await fetch(`${API_URL}/popular`, {
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch movies: ${response.statusText}`);
		}

		const movies = await response.json();
		return { movies };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		throw new Error(`Movies fetch failed: ${errorMessage}`);
	}
});
```

### 影响（Impact）

LCP 下降到了 **13.43s**：

![](https://blog.logrocket.com/wp-content/uploads/2026/02/14_lcp-down-13.png)

---

## 阶段 4：静态资源与图片优化（Phase 4: Asset and image optimization）

图片往往是拖慢 LCP 的最大因素。

下面是一些常用的优化图片/视频资源交付的技巧。

### 使用 CDN（CDN usage）

把本地的大资源（例如 hero 背景）搬到 CDN（如 Cloudinary、Cloudflare），减少你自己应用服务器的压力。

很多 CDN 还能自动做图片优化：对支持的浏览器下发 WebP/AVIF，并为老浏览器回退到 JPEG/PNG。

把大资源放到 CDN 也会减少应用服务器负载，并降低 bundle 体积。

### 标记优先级（Priority tagging）

并不是所有图片都同等重要。

浏览器无法自动判断：哪些图片对首屏至关重要，哪些在首屏之外或某些 Tab 里用户可能永远不会打开。

你需要明确告诉浏览器：

- 对首屏关键图片使用 `fetchpriority="high"`
- 对其余图片使用 `loading="lazy"`

原文示例（按可读性整理）：

```html
<!-- Hero banner 是最高优先级，因此 fetchPriority=high -->
<img
	src="https://res.cloudinary.com/dubc3wnbv/image/upload/v1760360925/hero-background_ksbmpq.jpg"
	fetchpriority="high"
	alt=""
/>

<!-- Movie Card 图片懒加载 -->
<img
	src={movie?.poster_path ? TMDB_IMAGES_ASSET_URL + movie?.poster_path : "/placeholder.svg"}
	alt={movie?.title}
	loading="lazy"
/>
```

### 预加载关键资源（Preloading critical resources）

现代框架（比如 TanStack Router）可以自动预加载路由。

例如用户把鼠标悬停在链接上时，就可以提前加载下一页的代码和数据，等用户真的点下去时，导航会显得“瞬间完成”。

```ts
// router.tsx
const router = createTanStackRouter({
	routeTree,
	scrollRestoration: true,
	defaultPreload: "intent",
});
```

你也可以预加载重要的 CSS 和字体，让它们立即开始下载，而不是等到之后才被浏览器“发现”。

这样可以减少 layout shift，并避免未样式化内容闪烁（FOUC）。

```ts
// __root.tsx
links: [
	{ rel: "preload", href: appCss, as: "style" },
];
```

