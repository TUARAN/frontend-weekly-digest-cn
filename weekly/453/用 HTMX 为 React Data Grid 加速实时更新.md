> 原文：[Integrating HTMX into a React Data Grid for Real‑Time Updates in Next.js](https://www.syncfusion.com/blogs/post/update-react-grid-with-htmx-nextjs)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 用 HTMX 为 React Data Grid 加速实时更新

![](https://www.syncfusion.com/blogs/wp-content/uploads/2026/02/Integrating-HTMX-into-a-React-Data-Grid-for-Real%E2%80%91Time-Updates-in-Next.js.png)

React 非常适合构建动态交互界面，但随着应用增长，客户端渲染开销、包体积和状态管理复杂度会逐渐增加。

HTMX 提供了另一条路径：通过 HTML 属性驱动请求与局部替换，把一部分更新逻辑交还给服务端。

本文将演示如何在 Next.js（React 19）中集成 HTMX，并结合 Syncfusion React Data Grid，通过**单个 SSE 连接**实现实时更新。

## 为什么 HTMX 适合 React + Next.js

HTMX 并不是为了替代 React，而是作为一个轻量增强层：

- 通过 `hx-get`、`hx-swap`、`hx-trigger` 等属性，浏览器可以在指定事件触发时自动发起请求，并把响应片段直接更新到 DOM。
- 在 Data Grid 这种“更新频繁、改动局部”的场景中，让服务端返回 HTML 片段，通常比在客户端维护大量同步状态更直接。

典型例子是仪表盘或 CRUD 页面：某些单元格需要高频刷新。如果完全由客户端状态管理驱动，复杂度和性能压力会快速上升；而 HTMX 正擅长这种“局部、频繁、小改动”的更新模式。

## 在 Next.js（React 19）项目中接入 HTMX

### 前置条件

- Node.js 20+
- npm / pnpm / yarn
- Next.js 15.1+
- React / React-DOM 19
- 任意编辑器（如 VS Code）

### 第 1 步：创建 Next.js 项目

```bash
npx create-next-app@latest my-htmx-app --typescript --app
cd my-htmx-app && npm install
```

### 第 2 步：在 Layout 中加载 HTMX

HTMX 尽量在页面生命周期更早的阶段加载，作者建议直接放进 `app/layout.tsx`，确保 `hx-*` 属性立即可用，同时启用 SSE 扩展。

示例（原文思路整理版）：

```tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
      <html lang="en">
         <head>
            <Script src="https://unpkg.com/htmx.org@2.0.1" strategy="beforeInteractive" />
            <Script
               src="https://unpkg.com/htmx.org@1.9.10/dist/ext/sse.js"
               strategy="beforeInteractive"
            />
         </head>
         <body>{children}</body>
      </html>
   );
}
```

作者给出的理由是：

- 让 Next.js 处理脚本加载顺序
- 不需要打包或额外的构建配置
- HTMX 可同时作用于 SSR/CSR 渲染出的 DOM

### 第 3 步：安装并配置 Syncfusion React 组件

```bash
npm install @syncfusion/ej2-react-grids @syncfusion/ej2-react-buttons
```

在全局样式中引入样式（原文使用 Tailwind 主题样式）：

```css
@import "@syncfusion/ej2-react-grids/styles/tailwind.css";
@import "@syncfusion/ej2-react-buttons/styles/tailwind.css";
```

## 在 React Data Grid 中实现实时更新

作者举了一个简单的订单列表：列包括 **OrderID**、**CustomerID**、**Freight**，并让 Freight 每 5 秒更新一次，模拟实时价格变化。

### 常见误区：每行一个 SSE 连接

直觉上，你可能会让每一行自己开一条 SSE 连接来收更新。但浏览器对并发 SSE 连接数有上限，作者指出“前几行能工作，后面就不行了”。

### 解决方案：一个 SSE 端点广播所有行

核心思路：

- 只建立 **一个** SSE 连接
- 服务端每次推送时，为每行发送一个具名事件，例如 `freight-updated-1001`
- 每个单元格只监听属于自己的事件名

这样可以绕开连接数限制，同时依然做到“行级别、单元格级别”的更新。

### 创建 Data Grid（React + HTMX）

作者给出的示例代码（保留原意并整理为可读格式）。注意：原文示例里 `Freight` 字段名处存在一个引号/拼写小问题，这里按语义修正为 `Freight`：

```tsx
import { useEffect } from "react";
import { GridComponent, ColumnsDirective, ColumnDirective } from "@syncfusion/ej2-react-grids";

declare global {
   interface Window {
      htmx?: any;
   }
}

const data = Array.from({ length: 10 }, (_, i) => ({
   OrderID: 1000 + i + 1,
   CustomerID: ["ALFKI", "ANANTR", "ANTON", "BLONP", "BOLID"][Math.floor(Math.random() * 5)],
   OrderDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
   Freight: (2.1 * (i + 1)).toFixed(2),
}));

export default function Home() {
   useEffect(() => {
      if (typeof window === "undefined" || !window.htmx) {
         console.error("HTMX not loaded");
         return;
      }

      const container = document.querySelector("#htmx-container");
      if (container) {
         window.htmx.process(container);
      }

      const observer = new MutationObserver(() => {
         if (container) window.htmx.process(container);
      });

      observer.observe(container || document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
   }, []);

   return (
      <div id="htmx-container" className="p-6 max-w-4xl mx-auto">
         <GridComponent dataSource={data} className="border rounded-lg shadow" allowPaging={false}>
            <ColumnsDirective>
               <ColumnDirective field="OrderID" headerText="Order ID" width="80" textAlign="Right" />
               <ColumnDirective field="CustomerID" headerText="Customer" width="100" />
               <ColumnDirective
                  field="Freight"
                  headerText="Freight"
                  width="80"
                  textAlign="Right"
                  template={(props: any) => (
                     <div
                        data-hx-sse={`connect:/api/updates swap:freight-updated-${props.OrderID}`}
                        data-hx-target="this"
                        data-hx-swap="innerHTML"
                        className="p-1"
                     >
                        {props.Freight}
                     </div>
                  )}
               />
            </ColumnsDirective>
         </GridComponent>
      </div>
   );
}
```

关键点是 `data-hx-sse`：它负责连接 SSE 并监听事件，然后把事件数据替换到当前单元格里。

### 创建 SSE 端点

服务端用一个静态 API 路由持续输出 `text/event-stream`：

```ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
   const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
   };

   const stream = new ReadableStream({
      async start(controller) {
         const interval = setInterval(() => {
            for (let i = 1001; i <= 1010; i++) {
               const newFreight = (Math.random() * 100).toFixed(2);
               const payload = `event: freight-updated-${i}\ndata: ${newFreight}\n\n`;
               controller.enqueue(new TextEncoder().encode(payload));
            }
         }, 5000);

         request.signal.addEventListener("abort", () => {
            clearInterval(interval);
            controller.close();
         });
      },
   });

   return new NextResponse(stream, { headers });
}
```

这样，单个 SSE 连接就能把 10 行（甚至更多）的 Freight 更新“广播”出去，而每个单元格只消费自己关心的事件。

最终效果（原文动图）：

![](https://www.syncfusion.com/blogs/wp-content/uploads/2026/02/Real-time-Freight-updates-in-a-React-Data-Grid-using-HTMX-and-Next.js.gif)

## GitHub 参考

示例代码仓库：

- https://github.com/SyncfusionExamples/React-with-HTMX-Dynamic-HTML-Updates-for-Lightning-Fast-Syncfusion-Components

## 常见问题（FAQ）

### 为什么要把 HTMX 和 React 混用？

作者的回答是：HTMX 负责“快、轻、局部”的 HTML 替换（表单、懒加载区块、局部刷新、实时更新等），React 负责复杂、状态密集的 UI 部分。组合起来的结果是：

- 更小的包体积
- 更快的主观速度
- 更少的前端状态与胶水代码

### 什么时候选择 React + HTMX，而不是全靠 React/Next.js？

适合这些情况：

- 你想把 JS 负载压到更小
- 交互大多可以通过服务端驱动的局部更新完成
- 后端本来就能产出不错的 HTML
- “速度 + 简洁”比“复杂的客户端状态”更重要

## 结语

把 HTMX 和 Next.js / React Data Grid 组合在一起，你可以同时得到：React 的组件化能力 + HTMX 的轻量局部更新能力。在需要实时更新、但又不想引入额外复杂状态层的 Data Grid 场景里，这是一条非常值得尝试的路线。

