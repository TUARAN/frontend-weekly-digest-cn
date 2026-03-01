# A complete guide to React performance optimization - LogRocket Blog

Today’s users expect fast, smooth experiences by default. Performance is no longer just a “nice to have”; it’s a real product advantage that directly impacts retention, conversions, and revenue.

The challenge is that debugging performance issues can feel overwhelming because there are so many reasons an app might be slow.

In this guide, I’ll share a step-by-step framework for optimizing React apps from bundle analysis all the way to server-side rendering. Following these four phases can help you cut LCP from 28 seconds to about one second (that’s over 93%!), without sacrificing code quality or developer experience.

We’ll use a video player app as our example and improve its performance phase by phase. You can grab the [code repo here](https://github.com/shrutikapoor08/videoplayer-demo). This guide is also available as a video:

### ![Image 1: 🚀](https://s.w.org/images/core/emoji/17.0.2/svg/1f680.svg) Sign up for The Replay newsletter

[**The Replay**](https://blog.logrocket.com/the-replay-archive/) is a weekly newsletter for dev and engineering leaders.

Delivered once a week, it's your curated guide to the most important conversations around frontend dev, emerging AI tools, and the state of modern software.

Establish baseline
------------------

Before we change anything, we need to know what we’re working with.

Start by getting baseline numbers in Chrome DevTools → Performance. Throttle the network to Slow 4G and disable cache so the results actually reflect real user conditions.

Record a normal user flow in your app and watch the key metrics:

*   First Contentful Paint (FCP)
*   Largest Contentful Paint (LCP)
*   Time to Interactive (TTI)

These numbers make it easy to spot what’s slowing things down. Here’s what we’re starting with:![Image 2: establish baseline](https://blog.logrocket.com/wp-content/uploads/2026/02/1_baseline.png)

Phase 1: Analyze and optimize the bundle
----------------------------------------

The first step in optimization is knowing what you’re actually shipping to users. Before changing code, look at your bundle to analyze areas that need improvement:

1.   Visualize your bundle by adding a bundle analyzer to your build: 
    *   **For [Webpack](https://blog.logrocket.com/webpack-adoption-guide/):**`webpack-bundle-analyzer`
    *   **For [Vite](https://blog.logrocket.com/vite-adoption-guide/):**`vite-bundle-analyzer` or `rollup-plugin-visualizer`

2.   The analyzer gives you an interactive treemap showing which packages and files take up the most space. You’ll often find that one big dependency (usually a third-party library) is eating a huge chunk of your bundle. That makes it clear what to optimize first!:![Image 3: vite bundle analyzer](https://blog.logrocket.com/wp-content/uploads/2026/02/2_vite-bundle-analyzer.png)

![Image 4: index html screen](https://blog.logrocket.com/wp-content/uploads/2026/02/3_index-html.png)Looking at this, we know that some node modules are taking a large chunk, along with our hero image. Thankfully, our source folder is a tiny sliver.

### Optimizing build

*   **Enable minification for both JavaScript and CSS.** Most modern build tools enable this by default in production mode, but verify that it’s actually happening. Minification removes whitespace, shortens variable names, and applies other transformations that significantly reduce file sizes.
*   **Turn on code splitting to divide your bundle into smaller chunks based on routes or features.** Instead of shipping one massive JavaScript file, code splitting delivers only the code needed for the current page, with additional chunks loaded on demand. This project uses TanStack Router, so we are going to split on the route. This will make it easy to later lazily import routes that are not used a lot:

//vite.config.ts build: { outDir: "dist", emptyOutDir: true, sourcemap: true, minify: true, cssMinify: true, terserOptions: { compress: false, mangle: false }, }, // ... tanstackRouter({ target: 'react', autoCodeSplitting: false, }), // …
### Lazy load components

![Image 5: lazy load analyzer](https://blog.logrocket.com/wp-content/uploads/2026/02/4_lazy-load-analyzer.png)

When we zoom into the bundle analyzer into the source components, we might notice that some components take up a lot of bundle size. We can optimize the performance by [lazy loading](https://blog.logrocket.com/understanding-lazy-loading-javascript/) these components to ensure that they only get imported if they are actually navigated to:

//MovieList.tsximport { lazy } from "react";const MovieCard = lazy(() => import('@/components/MovieCard'))
### Removing unused dependencies

*   Run `npx depcheck` to identify unused node modules in your `package.json`. Depcheck scans your codebase and reports packages that aren’t actually imported anywhere, allowing you to safely remove them and reduce your bundle size:![Image 6: removing unused dependencies](https://blog.logrocket.com/wp-content/uploads/2026/02/5_remove-unused-dependencies.png)

### Measure again

To check if the changes we have made have actually helped, we must measure again. We can check this by rebuilding using `npm run build`:![Image 7: measuring again react dom client](https://blog.logrocket.com/wp-content/uploads/2026/02/6_measuring-again.png)

![Image 8: server local host](https://blog.logrocket.com/wp-content/uploads/2026/02/7_server-local-host.png)**Impact:** Just by code splitting, removing unnecessary node modules, and minifying files, we are able to get the bundle size down from 1.71MB to 890KB! The LCP also went down from 28.10 seconds to 21.56 seconds!:![Image 9: reducing bundle to 21.56](https://blog.logrocket.com/wp-content/uploads/2026/02/image-4.png)

Now let’s get to the fun part, where we optimize the React components.

Phase 2: Optimizing React code
------------------------------

Before the React Compiler, you had to manually find performance bottlenecks and optimize your components by adding memoization with `useMemo` and `useCallback`.

But modern React development indeed gives us [React Compiler](https://blog.logrocket.com/exploring-react-compiler-detailed-introduction/), which can handle many performance optimizations automatically.

On top of that, newer performance monitoring tools like the custom React Performance tracks make it much easier to understand what’s happening and identify what’s actually causing slow renders.

Before we start optimizing, let’s first look at the tools we have available today –

### 1. React 19 Performance tracks

React 19 introduces custom [Performance tracks](https://react.dev/reference/dev-tools/react-performance-tracks) that level up performance profiling by integrating right within the Chrome DevTools Performance panel, so you can debug real render-time bottlenecks instead of guessing which components are taking longer.

It shows how much time each component spends in the four phases of the React component life cycle:

*   blocking
*   transition
*   suspense
*   idling

The trace helps you correlate those long tasks back to the specific component work and hook logic responsible, so you can quickly isolate expensive render paths, unnecessary recomputation, and avoidable re-renders:

![Image 10: react performance tracks](https://blog.logrocket.com/wp-content/uploads/2026/02/8_react-performance-tracks.png)

Source: https://react.dev/reference/dev-tools/react-performance-tracks

### 2. React Compiler

[React Compiler](https://react.dev/learn/react-compiler) changes how we approach memoization today. Pre-React-Compiler, developers manually wrapped components in `React.memo` and callbacks in `useMemo` and `useCallback` to prevent unnecessary re-renders.

This approach was error-prone and required a lot of manual effort to identify which components actually needed memoization. Even with manual memoization, it was easy to miss components and parts of the app that were slow.

The React Compiler, added as a Babel plugin to your build pipeline, automatically analyzes your components and applies memoization based on the [Rules of React](https://react.dev/reference/rules). It understands React’s rendering behavior and can make smarter decisions than manual optimization, often outperforming hand-optimized code.

To get started, install the compiler and add it to your Babel configuration:

npm install -D babel-plugin-react-compiler@latest
and then update Vite config:

// vite.config.jsimport { defineConfig } from 'vite';import react from '@vitejs/plugin-react';export default defineConfig({ plugins: [ react({ babel: { plugins: ['babel-plugin-react-compiler'], }, }), ],});
Now, when you open your components in the React profiler, you will notice a ![Image 11: ✨](https://s.w.org/images/core/emoji/17.0.2/svg/2728.svg) next to components that are memoized by the compiler:![Image 12: open components in react profiler](https://blog.logrocket.com/wp-content/uploads/2026/02/9_react-profiler.png)

### 3. React Profiler

Although this was introduced a long time ago, it is still really helpful in understanding how many times the component re-renders and which components are re-rendering. We’ll also be using this in addition to the React Compiler and performance tracks to find out the slow components

### Measure

While using React Profiler, we are going to measure the most common UX a user would go through. Here’s the flow we will measure:

1.   Click on a movie card to open movie details
2.   Play the movie trailer
3.   Go back to the home page:![Image 13: netflix home page](https://blog.logrocket.com/wp-content/uploads/2026/02/10_netflix-home-page.png)

You can see at the top right corner that the app re-rendered **16** times in this UX flow:![Image 14: react re renders](https://blog.logrocket.com/wp-content/uploads/2026/02/11_react-re-renders.png)

The highest bar is for the movie list component that took 25 milliseconds to render. This gives us insight into which component is the slowest and re-renders the most.

### Improvements:

#### 1. Let React Compiler handle memoization

With React Compiler, you don’t have to manually add `useMemo` / `useCallback`. It can automatically reduce unnecessary re-renders and recomputation, so you can focus on fixing the code issues.

#### 2. Clean up `useEffect`

`useEffect`s can cause a lot of unnecessary re-renders. When possible, avoid using `useEffect`, and ensure that `useEffect`s are cleaned up properly and do not cause infinite state updates. I dive deeper into the most common `useEffect` mistakes in [this blog post](https://blog.logrocket.com/15-common-useeffect-mistakes-react/), and the video below:

#### 3. Clean up functions

A common mistake is defining functions inside component bodies that don’t belong there, such as a utility component. The problem is that every time the component renders, these functions are recreated from scratch, even though their implementation never changes. This creates unnecessary work for the JavaScript engine.

Move utility functions outside the component or into a separate utilities file:

 const formatRuntime = (minutes: number) => { const hours = Math.floor(minutes / 60); const mins = minutes % 60; return `${hours}h ${mins}m`; };
#### 4. Lazy loading components

Big components that users don’t see right away are great candidates for lazy loading. Things like video players, charts, or rich text editors can add a lot to your initial bundle, even if most users never use them.

React makes this easy with `React.lazy` and `Suspense`:

*   Use `React.lazy()` instead of a normal import to load the component only when needed.
*   Wrap it in `<Suspense>` with a fallback UI (like a spinner or skeleton) while it loads.

This works especially well with route-based code splitting, where each page loads only when the user visits it:

import { lazy, Suspense } from "react";const MovieCard = lazy(() => import('@/components/MovieCard'))
#### 5. Virtualized lists

Rendering big lists with tons of DOM nodes is a common performance problem. Most users won’t even scroll through the entire list, so you end up doing a lot of work for nothing.

List virtualization fixes this by only rendering what’s visible on screen (plus a small buffer). As the user scrolls, items get added and removed from the DOM, so the list feels complete but stays fast.

Libraries like react-window (lightweight) or react-virtualized (more feature-rich) make this easy to implement.

**Impact![Image 15: react flix](https://blog.logrocket.com/wp-content/uploads/2026/02/12_react-flix.png)**

You can see that the number of times the app re-rendered has gone down. The peaks have also lowered in height, with the maximum one being 13.1ms:![Image 16: re renders go down and lcp goes down](https://blog.logrocket.com/wp-content/uploads/2026/02/13_re-renders-go-down.png)

LCP also went down by 2 seconds. Even though this is not a big change in LCP, it is still encouraging because it is a step in the right direction.

Phase 3: Moving to the server (SSR)
-----------------------------------

[Client-side rendering](https://blog.logrocket.com/csr-ssr-pre-rendering-which-rendering-technique-choose/) can be slow because users often see a blank screen or spinner while the browser downloads and runs JavaScript and fetches data. This delay is a big reason for poor LCP scores, causing “element render delay.”

Server-side rendering (SSR) fixes this by fetching the data on the server, generating the HTML on the server, and sending a page that can show content right away. Users see real content immediately, while JavaScript loads and hydrates in the background.

### Adopting a framework

You can build SSR yourself, but frameworks like Next.js, Remix, or [TanStack Start](https://blog.logrocket.com/tanstack-start-overview/) make it much easier and production-ready. TanStack Start also supports streaming SSR, which means the server can start sending HTML to the browser as it’s being generated instead of waiting for the full page to finish.

Switching to a framework usually means changing how routing and data fetching work, but the performance gains are huge. You’re not just tweaking client-side code; you’re changing when and where the page renders. Data fetching happens on the server before the component even renders, ensuring data is ready immediately when the page loads. This dramatically reduces LCP.

### Server functions

In TanStack Start, you can fetch data on the server using a server function. We are going to move our client-side data fetching to server side by creating a server function:

//Before: data-fetching in useEffect useEffect(() => { async function fetchPopularMovies() { const token = import.meta.env.VITE_TMDB_AUTH_TOKEN; if (!token) { setError('Missing TMDB_AUTH_TOKEN environment variable'); setLoading(false); return; } setLoading(true); setError(null); try { const response = await fetch( API_URL, { headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}`, }, } ); if (!response.ok) { throw new Error(`Failed to fetch movies: ${response.statusText}`); } const data = (await response.json()) as TMDBResponse; setMovies(data.results); } catch (error) { setError((error as Error).message); } finally { setLoading(false); } } fetchPopularMovies(); }, []);//After: Data-fetching in TanStack Start Server Functionexport const getMovies = createServerFn({ method: 'GET',}).handler(async () => { try { const response = await fetch(`${API_URL}/popular`, { headers: { accept: "application/json", Authorization: `Bearer ${token}`, }, }); if (!response.ok) { throw new Error(`Failed to fetch movies: ${response.statusText}`); } const movies = await response.json(); return { movies }; } catch (error) { const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'; throw new Error(`Movies fetch failed: ${errorMessage}`); }})
### Impact

LCP went down to **13.43s!**:**![Image 17: lcp went down to 13.43](https://blog.logrocket.com/wp-content/uploads/2026/02/14_lcp-down-13.png)**

* * *

* * *

Phase 4: Asset and image optimization
-------------------------------------

Images are often the biggest contributors to a slow LCP. A few techniques can be used to optimize image and video asset delivery:

### CDN usage

Move large local assets (like hero backgrounds) to a CDN (e.g., Cloudinary or Cloudflare) to reduce the load on your server. CDN services also provides automatic image optimization, delivering modern formats like WebP or AVIF to browsers that support them while falling back to JPEG or PNG for older browsers. Moving large assets to a CDN also reduces load on your application server and decreases bundle size.

### Priority tagging

Not all images are equally important. The browser can’t know which images are critical for the initial view and which are below the fold or in tabs users might never open. You need to provide this information explicitly. Use `fetchpriority="high"` for critical above-the-fold images and `loading="lazy"` for everything else:

//Hero banner has highest priority therefore fetchPriority is high<img src={"<https://res.cloudinary.com/dubc3wnbv/image/upload/v1760360925/hero-background_ksbmpq.jpg>" } fetchPriority='high' alt="" /> //Lazy load Movie Card images <img src={movie?.poster_path ? TMDB_IMAGES_ASSET_URL + movie?.poster_path : "/placeholder.svg"} alt={movie?.title} loading='lazy' />
### Preloading critical resources

Modern frameworks like TanStack Router can preload routes automatically. For example, when a user hovers over a link, it can start loading the next page’s code and data before they click. That makes navigation feel instant:

//router.tsx const router = createTanStackRouter({ routeTree, scrollRestoration: true, defaultPreload: 'intent', })
You can also preload important CSS and fonts so they start downloading right away instead of being discovered later. This helps avoid layout shifts and prevents flashes of unstyled content:

//__root.tsx links: [ { rel: 'preload', href: appCss, as: 'style' },]
### Impact

![Image 18: lcp dropped down to 8.48](https://blog.logrocket.com/wp-content/uploads/2026/02/15_lcp-dropped-8.png)The LCP dropped down to 8.48s.

### Final measurement:

Now let’s uncheck Disable Cache to let the browser and build tools to do their job. Give the browser a hard reload by emptying the cache.

We notice a significant drop in LCP – down to 1.27s!:![Image 19: lcp dropped down to 1.27](https://blog.logrocket.com/wp-content/uploads/2026/02/16_dropped-down-127.png)

Note that since we emptied the cache and hard reloaded, the assets are still being loaded from the network and not pulled from cache:![Image 20: not pulled from the cache](https://blog.logrocket.com/wp-content/uploads/2026/02/17_not-pulled-from-cache.png)

Bundle size has reduced to 454KB and gzip of 164KB! DAMN!:![Image 21: decreased bundle size](https://blog.logrocket.com/wp-content/uploads/2026/02/18_damn-bundle-size.png)

Conclusion
----------

Big performance gains like going from a 28-second LCP to under 2 seconds come from stacking multiple optimizations, not one magic fix. Some changes (like code splitting or using a CDN) are quick wins, while bigger upgrades (like SSR or virtualization) take more work but can give major speed boosts.

### Key takeaways

*   **Measure first:**Use Chrome DevTools with slow network settings to find what’s actually slow.
*   **Check your bundle:** Use tools like `webpack-bundle-analyzer` to spot large dependencies and split code.
*   **Use modern React tools:** React Compiler, DevTools Profiler, and React 19 performance tracks to find bottlenecks.
*   **Optimize the code where it matters:** Move utility functions out, lazy load heavy components, virtualize big lists, and clean up effects.
*   **Use SSR if initial load speed matters:** Fetch data on the server to avoid slow client-side loading chains.
*   **Optimize images hard:**Use a CDN, load key images first, and lazy load everything below the fold.
*   **Performance is ongoing:** Keep profiling and monitoring as your app grows.

Optimizing the performance of a React app is incredibly important. Not just from an engineering standpoint, but from a business perspective, too. A slow React app causes users to drop off mid-flow, which directly leads to lost revenue.

Performance isn’t a one-time task. As your app grows, new bottlenecks will show up, so keep optimizing the performance of your components as you build them.

Get set up with LogRocket's modern React error tracking in minutes:
-------------------------------------------------------------------

1.    Visit [https://logrocket.com/signup/](https://lp.logrocket.com/blg/react-signup-general) to get an app ID 
2.   Install LogRocket via npm or script tag. `LogRocket.init()` must be called client-side, not server-side

    *   [npm](https://blog.logrocket.com/a-complete-guide-to-react-performance-optimization/#plug-tab-1)
    *   [Script tag](https://blog.logrocket.com/a-complete-guide-to-react-performance-optimization/#plug-tab-2)

$ npm i --save logrocket // Code:import LogRocket from 'logrocket'; LogRocket.init('app/id'); 

// Add to your HTML:<script src="https://cdn.lr-ingest.com/LogRocket.min.js"></script><script>window.LogRocket && window.LogRocket.init('app/id');</script> 

3.   (Optional) Install plugins for deeper integrations with your stack:
    *   Redux middleware 
    *   NgRx middleware 
    *   Vuex plugin 

[Get started now](https://lp.logrocket.com/blg/react-signup-general)
