# React已经改变了，你的 Hooks 也应该改变

> 原文： [React has changed, your Hooks should too](https://allthingssmitty.com/2025/12/01/react-has-changed-your-hooks-should-too/)
>
> 翻译： [嘿嘿](https://blog.heyfe.org/blog)

React Hooks 已经问世多年，但大多数代码库仍然以同样的方式使用它们：用点 `useState`，过度使用 `useEffect`，以及大量不经思考就复制粘贴的模式。我们都经历过。

但 Hooks 从来就不是生命周期方法的简单重写。它们是用于构建更具表现力、更模块化架构的设计系统。

随着并发式 React（React 18/19 时代）的到来，React 处理数据（尤其是**异步数据**）的方式已经改变。我们现在有了服务器组件、`use()`、服务器操作、基于框架的数据加载……甚至根据你的设置，在客户端组件中也具备了一些异步能力。

那么，让我们来看看现代 Hook 模式如今是什么样子，React 在引导开发者走向何方，以及生态系统不断陷入的陷阱。

## `useEffect` 陷阱：做得太多、太频繁

`useEffect` 仍然是最常被滥用的 Hook。它常常成为堆放不应属于那里的逻辑的“垃圾场”，例如数据获取、衍生值，甚至简单的状态转换。这通常就是组件开始感觉“诡异”的时候：它们在不恰当的时间重新运行，或者运行得过于频繁。

```ts
useEffect(() => {
  // 每次查询变化时都会重新运行，即使新值实际上相同
  fetchData();
}, [query]);

```

这种痛苦大部分源于将**衍生状态**和**副作用**混在一起，而 React 对这两者的处理方式截然不同。

### 以 React 预期的方式使用副作用

React 在这里的规则出奇地简单：

> 只在真正有必要时才使用副作用。

其他一切都应该在渲染过程中衍生出来。

```ts
const filteredData = useMemo(() => {
  return data.filter(item => item.includes(query));
}, [data, query]);

```

当你确实需要一个副作用时，React 的 [useEffectEvent](https://react.dev/reference/react/useEffectEvent) 会是你的好帮手。它让你能在副作用内部访问最新的 props/状态，而**不必**扰乱你的依赖数组。

```ts
const handleSave = useEffectEvent(async () => {
  await saveToServer(formData);
});

```

在使用 `useEffect` 之前，先问问自己：

* 这是由外部因素（网络、DOM、订阅）驱动的吗？
* 还是我可以在渲染过程中计算这个？

如果是后者，像 `useMemo`、`useCallback` 或框架提供的基础构建块这样的工具，会让你的组件健壮得多。

> 🙋🏻‍♂️ 小贴士
> 
> 不要把 useEffectEvent 当作一种用来逃避编写依赖数组（dependency arrays）的‘作弊码’。它是专门针对 Effect 内部的操作逻辑进行优化的。”

## 自定义 Hooks：不仅仅是复用，更是真正的封装

自定义 Hooks 不仅仅是为了减少重复代码。它们关乎将领域逻辑从组件中抽离出来，让你的 UI 专注于……嗯，UI。

例如，与其用这样的设置代码来污染组件：

```ts
useEffect(() => {
  const listener = () => setWidth(window.innerWidth);
  window.addEventListener('resize', listener);
  return () => window.removeEventListener('resize', listener);
}, []);

```

不如将其移入一个 Hook：

```ts
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const listener = () => setWidth(window.innerWidth);
    window.addEventListener('resize', listener);
    // 注意：原文为 'change'，但通常 resize 事件应配对 'resize'，这里保持原文但应该是笔误
    return () => window.removeEventListener('change', listener);
  }, []);

  return width;
}

```

这样就干净多了。也更容易测试。你的组件不再泄露实现细节。

> SSR 小提示
> 
> 总是从确定的回退值开始，以避免水合不匹配报错。

## 基于订阅的状态与 `useSyncExternalStore`

React 18 引入了 [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)，它悄无声息地解决了一大类与订阅、撕裂效应和高频更新相关的 Bug。

如果你曾经与 `matchMedia`、滚动位置或跨渲染行为不一致的第三方存储库斗争过，这就是 React 希望你使用的 API。

它适用于：

* 浏览器 API（`matchMedia`、页面可见性、滚动位置）
* 外部存储（Redux、Zustand、自定义订阅系统）
* 任何对性能敏感或事件驱动的事物

```ts
function useMediaQuery(query) {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => window.matchMedia(query).matches,
    () => false // SSR 回退值
  );
}

```

## 使用过渡和延迟值实现更流畅的 UI

如果你的应用在用户输入或筛选时感觉卡顿，React 的并发工具可以提供帮助。这些并非魔法，但它们能帮助 React 将紧急更新置于高开销更新之前。

```
const [searchTerm, setSearchTerm] = useState('');
const deferredSearchTerm = useDeferredValue(searchTerm);

const filtered = useMemo(() => {
  return data.filter(item => item.includes(deferredSearchTerm));
}, [data, deferredSearchTerm]);

```

输入保持响应，而繁重的筛选工作被延后处理。

快速心智模型：

* `startTransition(() => setState())` → 延迟**状态更新**
* `useDeferredValue(value)` → 延迟**衍生值**

需要时可以一起使用，但不要过度使用。它们不适用于琐碎的计算。

## 可测试和可调试的 Hooks

现代 React DevTools 让检查自定义 Hooks 变得极其简单。如果你能良好地组织你的 Hooks，大部分逻辑无需渲染实际组件就能测试。

* 将领域逻辑与 UI 分离
* 尽可能直接测试 Hooks
* 为了清晰，将提供者逻辑提取到其自身的 Hook 中

```ts
function useAuthProvider() {
  const [user, setUser] = useState(null);
  const login = async (credentials) => { /* ... */ };
  const logout = () => { /* ... */ };
  return { user, login, logout };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = useAuthProvider();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

```

下次调试时，你会感谢自己这么做。

## 超越 Hooks：迈向数据优先的 React 应用

React 正朝着**数据优先的渲染流程**转变，特别是现在服务器组件和基于操作的模式正在成熟。它并非追求像 Solid.js 那样的细粒度响应式，但 React 正大力投入异步数据和服务器驱动的 UI。

值得了解的 API：

*   [use()](https://react.dev/reference/react/use) 用于在渲染期间处理异步资源（主要用于服务器组件；通过服务器操作在客户端组件中支持有限）
*   `useEffectEvent` 用于稳定的副作用回调
*   `useActionState` 用于类似工作流的异步状态
*   框架级别的缓存和数据原语
*   更好的并发渲染工具和 DevTools

方向很明确：React 希望我们减少对“瑞士军刀”式 `useEffect` 的依赖，更多地依赖简洁、由渲染驱动的数据流。

围绕衍生状态和服务器/客户端边界来设计你的 Hooks，能让你的应用天然地面向未来。

## Hooks 即架构，而非语法

Hooks 不仅仅是比类组件更友好的 API，它们是一种架构模式。

*   将衍生状态放在渲染过程中
*   只将副作用用于真正的副作用
*   通过小而专注的 Hooks 组合逻辑
*   让并发工具平滑处理异步流程
*   同时考虑客户端**和**服务器边界

React 在进化，我们的 Hooks 也应随之进化。

如果你仍然在用 2020 年的方式写 Hooks，那也没关系。我们大多数人都是如此。但 React 18+ 给了我们一个强大得多的工具箱，熟悉这些模式会很快带来回报。