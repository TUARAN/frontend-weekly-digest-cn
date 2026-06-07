原文：Understanding What Really Updated in Next.js App Router
链接：https://jsdev.space/nextjs-app-cache/
翻译：TUARAN

# Next.js App Router 缓存机制深度拆解：为什么你的数据"卡住了"

Next.js 的缓存让人困惑的原因通常是一样的：**好几个不同的系统可能产生几乎相同的行为。**

你的 API 已经返回了新数据。你刷新了页面。UI 仍然显示旧值。

你立刻加上：

```ts
fetch(endpoint, { cache: "no-store" })
```

一切恢复正常。问题解决。

直到下一个问题出现：**如果每个请求都绕过缓存，Next.js 为什么不一开始就设计成不做缓存？**

答案比乍看之下更简单——在 App Router 中，"缓存"不是一个单一功能。不同层级可以影响你看到的内容：

- 客户端导航复用
- 路由渲染行为
- 服务端 fetch 缓存
- 基于时间的重新验证

如果你把它们当作一个机制来对待，调试会很快变得令人沮丧。

理解缓存最容易的方法不是通过图表或定义，而是**通过观察**。

---

## 第一步：检测服务端是否执行了重新渲染

在调试数据之前，先验证页面是否真的在服务端重新执行了。

创建一个小的渲染指示器：

```tsx
// app/components/ServerRenderBadge.tsx

export function ServerRenderBadge({
  name = "server render",
}: {
  name?: string;
}) {
  const serverRenderedAt = new Date().toISOString();

  return (
    <p className="text-xs text-slate-500">
      {name}: <code>{serverRenderedAt}</code>
    </p>
  );
}
```

这个组件在服务端运行。每次路由真正重新渲染时，时间戳就会变化。

现在做一个简单的导航测试：

1. 打开 `/catalog`
2. 访问一个商品页
3. 按返回
4. 再次打开同一个商品
5. 刷新浏览器标签页

你会注意到一个重要的区别：**返回导航可能保留相同的时间戳，而刷新通常会产生一个新的。**

这本身就揭示了一个重要事实：**再次看到页面并不自动意味着服务端重新渲染了它。**

---

## 渲染新鲜度和数据新鲜度是不同的信号

知道渲染是否发生是有用的。但大多数调试会话真正关心的是另一件事：**新的 API 响应是否到达了？**

在数据层中添加第二个标记。不只是暴露 JSON，而是连同调试元数据一起返回响应：

```ts
async function requestCatalog<T>(
  path: string,
  init?: RequestInit & {
    next?: { revalidate?: number };
  }
) {
  const response = await fetch(`${CATALOG_API_URL}${path}`, init);
  const receivedAt = response.headers.get("date") ?? new Date().toUTCString();
  const payload = await response.json();

  return {
    ...payload,
    _debug: { receivedAt },
  };
}
```

在页面上同时展示两个标记：

- **ServerRenderBadge** → 路由是否重新渲染？
- **receivedAt** → 是否有新的网络响应到达？

这个区分**彻底改变了调试体验**。因为页面完全可以在重新渲染的同时仍然返回缓存数据。这正是"Next.js 卡住了"的感觉来源。

---

## `force-cache`：UI 更新了，网络请求没有

使用 `force-cache` 策略：

```ts
export async function loadProductDetails(productId: string) {
  return requestCatalog(
    `/products/${productId}`,
    { cache: "force-cache" }
  );
}
```

在生产模式下重新加载同一页面多次，你可能会观察到：

```
render: 13:42:18
API response received: 13:37:04
```

再次刷新：

```
render: 13:42:33
API response received: 13:37:04
```

**渲染时间变了，但响应时间戳没变。**

这精确地告诉你发生了什么：**路由再次执行了，但 fetch 层复用了缓存的数据。** 这不是 bug，这正是 `force-cache` 被设计要做的事。

---

## `no-store`：当每个请求都必须是最新的

有些页面不能容忍过期数据。切换到实时策略：

```ts
export async function loadProductDetails(productId: string) {
  return requestCatalog(
    `/products/${productId}`,
    { cache: "no-store" }
  );
}
```

现在两个信号同步移动：

```
render: 14:02:11
received: 14:02:11
```

每次请求都执行新的 fetch。适用于：账户余额、订单状态、管理后台、实时内部工具。但**新鲜度是有代价的**——更多请求，更高的外部 API 压力，更低的复用效率。对很多公开页面来说，这完全是不必要的过度设计。

---

## `revalidate`：通常最实用的选择

大多数应用需要在"永久复用"和"持续获取"之间找到一个平衡点。这就是**定时重新验证（timed revalidation）**的价值所在。

```ts
export async function loadProductDetails(productId: string) {
  return requestCatalog(
    `/products/${productId}`,
    buildFetchPolicy({
      strategy: "timed",
      ttl: 60, // 60 秒
    })
  );
}
```

行为变得可预测：

- **TTL 窗口内**：render 时间戳变化，response 时间戳不变
- **过期后**：render 时间戳变化，response 时间戳刷新

这种模式通常适合：商城页面、产品目录、博客、文档、公开列表。**在很多真实项目中，`revalidate` 是默认的最佳甜点。**

---

## 开发模式为什么经常"说谎"

很多缓存实验因为只在 `next dev` 里做而变得误导人。开发模式的行为与生产模式不同：

- HMR 缓存复用
- 开发环境 fetch 行为
- 浏览器缓存覆盖
- DevTools 缓存禁用
- 热更新副作用

即使配置了 `no-store` 的请求在本地开发中也可能表现不一致。

**对于严肃的缓存调试，永远在生产模式下验证：**

```bash
npm run build
npm start
```

这不只是部署预演。对于缓存而言，**生产模式本身就是诊断工具包的一部分。**

---

## 选择策略而不需要死记理论

你通常不需要一长串架构讨论。你的数据模型已经包含了答案：

- 使用 **`no-store`** → 过期信息不可接受时
- 使用 **`force-cache`** → 数据很少变化、效率重要时
- 使用 **`revalidate`** → 需要在新鲜度和请求成本之间平衡时

对大多数公开的 Next.js 应用来说，**定时重新验证是最实用的默认选择。**

---

## 结语

一旦你不再把渲染和数据新鲜度当作同一事件来处理，Next.js 的缓存就变得容易理解得多。它们是**不同的信号**：一个时间戳告诉你服务端是否重新渲染了，另一个告诉你 fetch 层是否交付了新鲜数据。

一旦你将这些观察分开，`force-cache`、`no-store` 和 `revalidate` 就不再感觉像是神秘的框架开关。**它们变成了你可以测量、可以验证、可以有意选择的普通工程权衡。**
