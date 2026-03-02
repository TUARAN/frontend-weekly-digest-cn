原文：Building Async Page Transitions in Vanilla JavaScript  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 使用原生 JavaScript 构建异步页面过渡动画

学习如何用原生 JavaScript、GSAP 和 Vite 构建一个轻量级的 SPA 路由器，实现真正异步的交叉淡入淡出页面过渡效果——无需任何框架。

作者：[Valentin Mor](https://tympanus.net/codrops/author/valentinmor/)  
分类：[Tutorials](https://tympanus.net/codrops/category/tutorials/)  
时间：2026 年 2 月 26 日

![](https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2026/02/Group-170.webp?x72865)

[Demo](https://async-page-transitions.crnacura.workers.dev/)

[Code](https://github.com/blenkcode/codrops-demo)

免费课程推荐：[通过 34 节免费视频课程、循序渐进的项目以及动手 Demo，用 GSAP 精通 JavaScript 动画。立即报名 →](https://www.creativecodingclub.com/courses/FreeGSAP3Express?ref=0d0431)

嗨！我是 [Valentin Mor](https://www.valentin-mor.com/)，一名常驻巴黎的前端创意开发者。在这篇教程里，我们将从零开始，使用原生 **JavaScript、GSAP** 和 **Vite** 来构建一个轻量级的异步页面过渡系统。

到最后，你将拥有一个功能完整的 SPA 路由器，能够在页面之间进行交叉淡入淡出的过渡——不需要任何框架。

## 介绍

听起来可能有点意外，但当我以开发者的身份去思考创意网站的标志性特征时，首先想到的就是路由与页面过渡是如何处理的。有时候你只需要一个简单的淡出/淡入效果，但如果再加一点层次感和运动感，就能显著提升用户体验。

我花了很多时间用 `Barba.js` 这类库来探索这个主题，试着理解幕后到底发生了什么——尤其是当当前页面与下一页面在 DOM 中短暂共存的那一刻。

在继续之前，我必须提到 [Aristide Benoist](https://aristidebenoist.com/)——在打造顺滑、电影感十足的页面过渡方面，他绝对是一个真正的标杆。我们这里要实现的过渡效果灵感来自他在 [Watson 网站](https://watson.la/) 上的作品。如果你还没看过，我强烈建议你去体验一下。

## 我们要构建的东西

一个极简的单页应用（SPA），包含：

- 一个自定义的客户端 **路由器**：拦截链接点击，并使用 History API 来管理导航。

- 一个 **异步过渡引擎**：同时为当前页面和下一页面做动画。

**这里的关键思路是：** 不要立刻把页面内容替换掉，而是先 **克隆页面容器**，把新内容注入到这个克隆容器里，然后同时对两个容器做动画（旧页面淡出、新页面淡入），最后再移除旧容器。这样就能实现真正的交叉淡入淡出过渡：动画期间，两页会在 DOM 中同时存在。

## 项目初始化

打开你最喜欢的 IDE，然后运行下面的命令：`npm create vite@latest`

当出现提示时，选择 `Vanilla` 作为框架（模板），选择 `JavaScript` 作为变体。

清理初始文件：删除 `src` 文件夹里的 `counter.js`，并在 `main.js` 中只保留样式导入。

```text
yourproject/
├── node_modules/         
├── public/         
├── src/
│   ├── main.js         
│   └── style.css        
├── gitignore
├── index.html
├── package-lock.json
└── package.json
```

## 第 1 步：HTML 外壳（Shell）

我们的 `index.html` 文件充当根布局——它是一个在导航过程中始终存在的永久外壳。只有 `data-transition="container"` 内部的内容会发生变化。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Building Async Page Transitions in Vanilla JavaScript</title>
  </head>
  <body>
    <div data-transition="wrapper">
      <div data-transition="container" data-namespace="home">
        <main id="page_content" class="page_content"></main>
      </div>
    </div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

三个 data 属性承担了主要工作：

- `data-transition="wrapper"` —— 父元素，用于在过渡期间同时承载当前容器和即将进入的容器。两页会在这里同时存在。

- `data-transition="container"` —— 每次进入新页面时都会克隆它。在一次过渡期间，wrapper 会临时包含两个这样的元素。

- `data-namespace` —— 用于标识当前展示的是哪一个页面。在本教程中，它主要用于调试；但在更复杂的项目里，它会变得至关重要，比如把不同的过渡动画映射到特定的“页面到页面”的路由上。

## 第 2 步：页面模块

先在 `src` 里创建一个 `/pages` 文件夹，然后添加你的前两个页面文件夹：`/home` 和 `/alternative-page`。

每个文件夹都包含一个 HTML 文件和一个 JavaScript 文件。

```text
├── pages/
│   ├── home/
│   │   ├── home.html    
│   │   └── home.js     
│   └── alternative-page/
│       ├── alternative-page.html  
│       └── alternative-page.js    
```

写一段最简 HTML：用 `<section>` 作为包裹层，包含一个 `<h1>`，以及一个包含链接的 `<nav>`，链接指向我们网站的两个页面：“`/`” 和 “`/alternative-page`”。

```html
<section class="hero">
  <nav>
    <a href="/alternative-page">Alternative page</a>
  </nav>

  <div class="hero_content">
    <h1>AH.736</h1>
  </div>
</section>
```

每个页面都是一个自包含模块，它会导出一个默认函数并返回 HTML。

为了完整起见，再为你的 JavaScript 初始化添加一个 `init()` 函数（例如绑定事件监听器），以及一个可选的 `cleanup()` 函数用于卸载清理。

在本教程的核心部分，我们只会用到默认导出的函数。

`?raw` 后缀是 Vite 的一个特性，它会把 HTML 文件作为原始字符串导入。对应的模板就是纯 HTML：

```js
import template from "./home.html?raw";

export default function HomePage() {
  return template;
}

export function init() {}

export function cleanup() {}
```

现在，先加一点最小化的样式：让页面内容保持全屏高度，引入你喜欢的字体，然后按你的喜好开始添加一些基础样式。

```css
@font-face {
  font-family: "Neue";
  src: url("/NeueMontreal-Medium.ttf");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

:root {
  font-family: Neue;
  line-height: 1;
  color: rgb(0, 0, 0);
  background-color: #000000;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: Neue;
  margin: 0;
  display: flex;
  overflow-x: hidden;
  min-height: 100vh;
}

main {
  width: 100vw;
}

h1 {
  font-size: 28.2vw;
  margin: 0;
  line-height: 80%;
}

a {
  color: black;
  text-decoration: none;
  text-transform: uppercase;
}

.hero {
  background-color: white;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  padding: 20px;
  align-items: center;
}
.hero_content {
  width: 100%;
  padding-top: 8vh;
  text-align: center;
}

[data-transition="container"] {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

*注意：我们不会深入讲样式或复杂的进入动画，因为这个主题本身信息量已经很大了。我建议你现在先保持最小实现，之后再用更精致的样式与动画来完善项目。*

## 第 3 步：路由（Router）

路由器是我们 SPA 的大脑。它会拦截链接点击、管理浏览器历史、动态加载页面模块，并编排页面之间的过渡。

我们来一点点把它搭起来。

在 `src` 文件夹里创建一个 `router.js` 文件。

### 路由定义（Route Definitions）

每条路由都会把一个 URL 路径映射到两样东西：一个 `namespace` —— 用来标记每个页面的字符串标识符。

过渡引擎会用它来判断哪个页面正在进入、哪个页面正在离开。

`loader` 是一个箭头函数，用来包裹动态 `import()`。

只有当我们实际调用 `loader()` 时，模块才会从网络被拉取。

第一次调用时，浏览器会下载并解析该模块；之后再次调用时，会立刻返回缓存版本。

```js
const routes = {
  "/": {
    namespace: "home",
    loader: () => import("./pages/home/home.js"),
  },
  "/alternative-page": {
    namespace: "alternative-page",
    loader: () => import("./pages/alternative-page/alternative-page.js"),
  },
};
```

### 类结构（Class Structure）

定义完路由后，我们来创建一个 `Router` 类来管理导航状态。它包含两个属性：

- `currentNamespace` 用来跟踪当前显示的是哪个页面，从而允许我们跳过“导航到同一页面”的情况。

- `isTransitioning` 是一个锁，用来防止用户快速连续点击时发生重复导航。

在文件底部，我们导出这个类的一个实例。

```js
class Router {
  constructor() {
    this.currentNamespace = null;
    this.isTransitioning = false;
  }

// Write your functions here

}

export const router = new Router();
```

接下来我们添加 Router 的函数——每个函数都有明确的职责。

### loadInitialPage()

这个方法在启动时只运行一次。

- 将当前 URL 匹配到某条路由。
- 获取当前路径。
- 将路径与我们的 `routes` 数组进行对比，以便懒加载正确的模块。
- 加载模块。
- 将它的 HTML 注入到我们 HTML 外壳中已经存在的 `#page_content` 元素里。
- 在容器上设置 `namespace`，用于跟踪当前展示的是哪个页面。

*这里没有过渡动画——页面会直接出现。*

```js
async loadInitialPage() {
  // Match the current URL to a route
  const path = window.location.pathname;
  const route = routes[path]

  // Dynamically import the page module
  const pageModule = await route.loader();

  // Inject the page&#039;s HTML template into the existing DOM shell
  const content = document.getElementById("page_content");

  content.innerHTML = pageModule.default();

  // Tag the container with the current namespace
  const container = document.querySelector(&#039;[data-transition="container"]&#039;);
  container.setAttribute("data-namespace", route.namespace);

  // Store references 
  this.currentNamespace = route.namespace;
}
```

### navigate()

当用户点击链接时，这个函数会运行。在这个阶段，我们的 `navigate()` 方法会直接在函数内完成整页替换——此时还没有过渡引擎。

我们来梳理一下用户点击链接时会发生什么：

- 通过守卫条件检查：我们是否已经处于过渡中，或者被点击的链接是否指向当前页面。
- 然后我们更新 URL。
- 我们解析路由并动态导入页面模块。接着直接用 `innerHTML` 进行替换——逻辑与 `loadInitialPage()` 相同，只是触发时机从“初始加载”变成了“用户导航”。

```js
async navigate(path) {
  // Guard clauses
  if (this.isTransitioning || window.location.pathname === path) return;

  // Update the URL in the address bar without triggering a page reload
  window.history.pushState({}, "", path);

  // Resolve the matching route
  const route = routes[path] 

  // Dynamically import the next page module
  const pageModule = await route.loader();

  // Swap the HTML content directly — no animation yet
  const content = document.getElementById("page_content");
  content.innerHTML = pageModule.default();

  // Update the namespace
  const container = document.querySelector(&#039;[data-transition="container"]&#039;);
  container.setAttribute("data-namespace", route.namespace);

  // Update internal state for the next navigation cycle
  this.currentNamespace = route.namespace;
}
```

在下一步里，我们会把这段替换逻辑抽取到一个专门的过渡引擎中，并用带动画的 `performTransition()` 调用来替换这种内联替换方式——但在那之前，我们得先确保底层的“管道”是可靠的。

### init()

`init()` 会按顺序做三件事：

- 首先，它会加载初始页面——也就是用户最初进入时所在的那个 URL 对应的页面。我们会对这个过程使用 `await`，这样在开始监听点击事件之前，第一页就已经被完整渲染出来了。

- 然后，它会在 `document` 上注册一个「全局 click 监听器」。我们不会给每一个 `<a>` 标签都单独添加事件监听（因为在过渡期间如果动态注入了新链接，这种做法会失效），而是使用事件委托：所有点击都会冒泡到 `document`，我们再用 `closest("a")` 检查这个点击是否来源于某个锚点标签。

- 我们通过检查 `startsWith(window.location.origin)` 来过滤掉外部链接。

- 我们用 `e.preventDefault()` 阻止浏览器默认的跳转行为，并使用 `isTransitioning` 这个锁来防止在过渡过程中发生的点击。

```js
async init() {
  // Load and render whatever page matches the current URL
  await this.loadInitialPage();

  // Global click listener using event delegation
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");

    // Ignore clicks that aren&#039;t on links, or on external links
    if (!link || !link.href.startsWith(window.location.origin)) return;

    // Stop the browser from doing a full page reload
    e.preventDefault();

    // Block navigation if a transition is already running
    if (this.isTransitioning) return;

    const path = new URL(link.href).pathname;
    this.navigate(path);
  });
}
```

*注意：这是一个非常精简的设置——我们还没有处理 `popstate` 事件。*

**好了，现在来检查一下我们的基础路由引擎是否正常工作。** 打开你的 `main.js` 文件，导入 router，并调用它的 `init()` 函数。

```js
import "./style.css";
import { router } from "./router.js";
router.init();
```

使用 `npm run dev` 启动本地服务，然后点击顶部导航链接——你应该可以在各个页面之间顺畅切换。

**我们进展很顺利！**

## Step 4: The Transition Engine

现在，我们可以先把 router 文件放一边（稍后会再回来处理它），并在 `/src` 里创建一个 `/transitions` 文件夹。

这个文件夹将包含：

- 一个 `/animations` 文件夹，用来存放之后用于页面过渡的动画时间轴文件。

- 一个 `pageTransition.js` 文件。

```text
├── transitions/
│   ├── animations/
│   │   └── defaultTransition.js     
│   └── pageTransitions.js
```

在创建这个简单的过渡引擎之前，我们先把过渡用的动画时间轴做出来。

我们会使用 `GSAP` 来实现动画。

用下面的命令安装 `GSAP`：`npm install gsap`

我强烈建议创建一个 `/lib` 文件夹，并在里面放一个 `index.js` 文件，用来统一导入和导出你用到的所有库——这样你就有了一个集中管理重型依赖的单一入口。

```js
import { gsap } from "gsap";

export { gsap };
```

现在我们来编写过渡动画本身。

我们想要的效果是：当前页面轻微向上移动并带一点淡出，同时下一页通过 `clip-path` 动画从下往上逐步显现。两者同时发生，从而形成一种分层揭示的效果。

**关键技巧：** 我们把下一页的容器设为 `position: fixed`，让它堆叠在当前页面之上。配合初始的 `clip-path` 状态，下一页会被完全隐藏——然后我们再动画化 `clip-path`，实现干净利落的揭示效果。

*想要一个很酷的淡出效果，可以把 `body` 元素的 `background-color` 设置为黑色。*

这个动画函数接收两个参数：`currentContainer` 和 `nextContainer`，并且**返回动画时间轴**。

```js
import { gsap } from "../../lib/index.js";

export async function defaultTransition(currentContainer, nextContainer) {
  gsap.set(nextContainer, {
    clipPath: "inset(100% 0% 0% 0%)",
    opacity: 1,
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    zIndex: 10,
    willChange: "transform, clip-path",
  });

  const tl = gsap.timeline();

  tl.to(
    currentContainer,
    {
      y: "-30vh",
      opacity: 0.6,
      force3D: true,
      duration: 1,
      ease: "power2.inOut",
    },
    0,
  )

    .fromTo(
      nextContainer,
      { clipPath: "inset(100% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1,
        force3D: true,
        ease: "power2.inOut",
      },
      0,
    );

  return tl;
}
```

## pageTransition()

我们回到 `pageTransition.js` 文件。

这是异步模式的核心：引擎会创建第二个容器，把下一页注入进去，在两个容器之间运行动画，然后再做清理。

首先，导入 `GSAP` 实例以及我们刚刚创建的动画函数。

这个函数只接收 `nextHTML`——这就是它所需要的全部参数。我们把流程拆开讲一下：

- 我们先查询当前容器及其父级 wrapper。

- 然后调用 `cloneNode(false)`——`false` 参数表示我们只克隆元素本身（同样的标签、同样的属性），但**不**克隆它的子节点。

- 我们创建一个 `<main>` 元素，把下一页的 HTML 注入进去，并把它追加到克隆出来的容器中。然后把这个容器追加到 wrapper 里。

- 我们把两个容器传给 `defaultTransition()`，它会返回一个 `GSAP timeline`。`await timeline.then()` 这一行会暂停执行，直到时间轴里的每一个 tween 都执行完成。

- 最后，我们清理现场：从 DOM 中移除旧容器，并清除 GSAP 在动画期间注入的所有内联样式（`position: fixed`、`clip-path`、`opacity` 等）。

```js
import { gsap } from "../lib/index.js";
import { defaultTransition } from "./animations/defaultTransition.js";

export async function executeTransition({ nextHTML }) {
  const currentContainer = document.querySelector(
    &#039;[data-transition="container"]&#039;,
  );
  const wrapper = document.querySelector(&#039;[data-transition="wrapper"]&#039;);

  // Clone the container structure for the next page
  const nextContainer = currentContainer.cloneNode(false);
```

```js
  const content = document.createElement("main");
  content.id = "page_content";
  content.className = "page_content";
  content.innerHTML = nextHTML;
  nextContainer.appendChild(content);

  // 将下一页追加到 DOM 中——此时两个页面将共存
  wrapper.appendChild(nextContainer);

  // 运行动画过渡
  const timeline = defaultTransition(currentContainer, nextContainer);

  // 等待动画完成
  await timeline.then();

  // 清理：移除旧页面，重置变换
  currentContainer.remove();
  gsap.set(nextContainer, { clearProps: "all" });
  gsap.set(nextContainer, { force3D: true });
}
```

当过渡正在运行时，我们的 DOM 会是这样的：

```html
<div data-transition="wrapper">

  <!-- 当前页面（正在动画退出） -->
  <div data-transition="container" data-namespace="home">
    <main id="page_content" class="page_content">
      <!-- home HTML -->
    </main>
  </div>

  <!-- 下一页（正在动画进入） -->
  <div data-transition="container" data-namespace="about">
    <main id="page_content" class="page_content">
      <!-- about HTML -->
    </main>
  </div>

</div>
```

现在我们回到 `router.js` 文件，实现新的 `pageTransition()` 逻辑。

**我们来为此创建一个专用方法。**

首先，导入我们刚刚创建的 `executeTransition()` 函数。

我们会把 `navigate()` 中直接替换 `innerHTML` 的做法，改成一个规范的 `performTransition()` 方法，并添加一个 `popstate` 处理器。

### performTransition()

这个函数只接收一个参数：`path`。

具体流程如下：

- 如果 `isTransitioning` 标记处于激活状态，或者我们已经在同一个页面上，则阻止继续执行。

- 动态导入下一页的 `module`。

- 使用 `executeTransition()` 运行异步过渡。

- 当 `executeTransition()` 的时间线执行完成后，更新当前 `namespace`，并将 `isTransitioning` 标记重置为 `false`。

```js
async performTransition(path) {

  // 如果过渡已经在运行，则阻止
  if (this.isTransitioning) return;
  this.isTransitioning = true;

  try {
    // 解析匹配的路由
    const route = routes[path];

    if (!route || this.currentNamespace === route.namespace) return;

    // 动态导入下一页模块
    const pageModule = await route.loader();

    // 运行动画异步过渡——在这里两个页面
    // 会在 DOM 中共存，并同时执行动画
    await executeTransition({
      nextHTML: pageModule.default(),
    });

    // 更新内部状态，为下一次导航周期做准备
    this.currentNamespace = route.namespace;
  } finally {
    // 无论如何都释放锁——即使发生错误也一样
    this.isTransitioning = false;
  }
}
```

### 更新 navigate()

现在，`navigate()` 只负责用 `pushState` 更新 URL，并把其余工作交给 `performTransition()`。

```js
 async navigate(path) {

  if (window.location.pathname === path || this.isTransitioning) return;

  window.history.pushState({}, "", path);
  
  await this.performTransition(path);
}
```

## popstate 事件

现在我们就可以正确地添加一个 `popstate` 处理器了。由于 `popstate` 事件触发时浏览器已经更新了 URL，我们可以直接调用 `performTransition()`——不需要 `pushState`：

在 `init()` 函数内，为 `popstate` 事件添加一个事件监听器。

```js
window.addEventListener("popstate", () => {
  if (!this.isTransitioning) {
    this.performTransition(window.location.pathname);
  }
});
```

这也正是我们要把 `navigate()` 和 `performTransition()` 拆开的原因：

`navigate()` 用于程序化导航（点击 → `pushState` → 过渡），而当 URL 已经发生变化时（`popstate` → 仅过渡），就使用 `performTransition()`。

*注意：在点击监听器中，我们通过 `new URL(link.href).pathname` 从链接的 `href` 属性里提取 path；而在 `popstate` 处理器中，我们从 `window.location.pathname` 读取。结果相同，但来源不同：点击时，我们从链接中知道用户要去哪里；而在 `popstate` 时，浏览器已经更新了 URL，所以我们只需要读取当前位置即可。*

**恭喜——你的过渡引擎可以工作了！**

一切都运行得很好，不过我们再加一个非常基础的进入动画，让动效更有层次。

## 第 5 步：进入动画（Enter Animations）

在 `src` 下创建一个 `/animations` 文件夹，并添加一个 `enter.js` 文件。

我们来让 `<h1>` 从一个正向的 `y` 偏移位置动回它的原始位置。

我们需要确保选中正确的标题，因为过渡运行期间会同时存在两个 `<h1>` 元素。因此这个函数会接收两个参数：用于微调动画的 `delay`，以及 `nextContainer`。

```js
import { gsap } from "../lib";

const ENTER = (nextContainer, delay) => {
  const t = nextContainer?.querySelector("h1");

  if (!t) return null;

  gsap.set(t, { y: "100%" });

  const tl = gsap.timeline({
    delay,
  });

  tl.to(
    t,
    {
      y: 0,
      duration: 1.2,
      force3D: true,
      ease: "expo.out",
    },
    0,
  );

  return { timeline: tl };
};

export default ENTER;
```

在两个页面模块的 `init()` 函数中调用这个动画函数。

```js
import template from "./about.html?raw";
import ENTER from "../../animations/Enter";
export default function AboutPage() {
  return template;
}

export function init({ container }) {
  ENTER(container, 0.45);
}

export function cleanup() {}
```

现在我们需要在 `performTransition()` 里调用 `executeTransition()` 的同时也调用 `init()`。

把这一部分更新为：

```js
await executeTransition({
    nextHTML: pageModule.default(),
    nextModule: pageModule,
});
```

现在 `executeTransition()` 会接收到 `nextModule`，并在它存在时调用其 `init()` 方法：

```js
if (nextModule?.init) {
  nextModule.init({ container: nextContainer });
}
```

**现在看起来好多了！**

## 进一步拓展（Going Further）

我们构建的是一个功能完整但尽可能精简的系统。它覆盖了核心机制——路由、双容器 DOM 管理以及带动画的过渡——但要做到可用于生产环境的实现，还需要处理若干额外方面。

- 页面生命周期钩子。

- 在过渡中途进行中止处理。

- 悬停时预取（prefetch）。

- 更新 meta 标签。

而且这个清单还可以一直列下去……

从零开始构建的美妙之处在于，每一个组成部分都属于你：你可以理解它、掌控它，并在此基础上扩展它。

只要稍作微调并进行一些实验，你就能做出非常酷的效果：