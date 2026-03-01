> 原文：[WebMCP: Making the web AI-agent ready](https://techhub.iodigital.com/articles/web-mcp-making-the-web-ai-agent-ready)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# WebMCP：让 Web 为 AI Agent 准备就绪

Web 正在变化。AI Agent 越来越多地代表用户与网站交互：订机票、提工单、下单购物。

问题是：Web 天生是为人设计的，不是为 Agent 设计的。按钮、表单、可视化流程都面向“阅读与点击”，而不是面向稳定的程序化调用。

[WebMCP](https://webmachinelearning.github.io/webmcp/) 试图解决这个问题。它于 2026 年 2 月 10 日以 [W3C Draft Community Group Report](https://webmachinelearning.github.io/webmcp/) 形式发布，目标是让网站具备“AI-agent ready”能力。

## 什么是 WebMCP？

WebMCP 全称 Web Model Context Protocol。它建立在 Anthropic 的 [MCP](https://modelcontextprotocol.io/) 之上，但把能力带到了浏览器侧。

核心思想是：不要让 Agent 继续通过抓 DOM、猜按钮、模拟点击来“摸索”网站能力；而是由网站显式声明可用动作及调用方式。

这种声明形式是“工具（tools）”：

- 用 JavaScript 函数实现
- 带自然语言描述
- 带结构化 schema
- 可被 Agent 发现并调用

可以把它理解成“浏览器内、基于现有会话上下文的可调用 API”。

## 两套 API

根据 Chrome for Developers 的介绍，WebMCP 提供两种方式让浏览器 Agent 代表用户执行动作。

### Declarative API

Declarative API 可以直接在 HTML 表单中定义标准动作。

适合“动作与表单提交天然一一对应”的场景，例如：搜索、结算、联系表单等。已有表单页面几乎不需要额外 JavaScript 就能对 Agent 可发现。

### Imperative API

Imperative API 面向更复杂、动态的交互。

它的核心入口是 `navigator.modelContext`，通过 `ModelContextContainer` 注册工具。

## 一个实际示例

假设你在做电商站点，希望 Agent 能代用户把商品加入购物车。可以这样注册工具：

```js
if ('modelContext' in navigator) {
	navigator.modelContext.registerTool({
		name: 'add_to_cart',
		description: 'Add a product to the shopping cart by its product ID and a specified quantity',
		inputSchema: {
			type: 'object',
			properties: {
				productId: {
					type: 'string',
					description: 'The unique identifier of the product',
				},
				quantity: {
					type: 'number',
					description: 'The number of items to add',
				},
			},
			required: ['productId', 'quantity'],
		},
		async execute({ productId, quantity }) {
			const response = await fetch('/api/cart', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ productId, quantity }),
			})

			const result = await response.json()
			return { success: true, cartTotal: result.total }
		},
	})
}
```

这个示例对应四个关键部分：

- `name`
- 面向人的 `description`
- 参数结构 `inputSchema`
- 真正执行业务的 `execute`

Agent 由此可以直接发现工具、理解能力、按 schema 传参调用，不再依赖“界面猜测”。

## WebMCP 与 MCP 的区别

文中给出的区分很直接：

- **MCP**：更偏后端服务与 server-to-agent 通信
- **WebMCP**：更偏浏览器内工具调用（用户在场）

二者是互补关系。

- 当 Agent 需要直连后端服务时，用 MCP
- 当交互发生在浏览器并希望复用用户会话/登录态/上下文时，用 WebMCP

## 典型使用场景

文章列举了几个高价值场景：

- **电商**：找商品、配规格、走结算流程
- **旅游**：搜索与筛选航班、完成预订
- **客服**：自动填充技术细节，辅助创建更完整工单

本质上，只要网站存在可由用户执行的操作，就有机会暴露为 WebMCP 工具：表单密集型流程、仪表盘、预订系统、内容后台等都适用。

## 落地前要考虑的事

### 1) 还很早期

截至 2026 年 2 月，WebMCP 仍处在 early preview，W3C 文档是社区草案而非正式标准，API 表面仍可能变化。

### 2) 浏览器尚无原生支持

文中指出，当前浏览器尚未原生支持 `navigator.modelContext`。

[MCP-B](https://docs.mcp-b.ai/) 作为参考实现（兼 polyfill）可在浏览器中补充该 API，并把 WebMCP 工具桥接到 MCP 格式，以兼容现有 AI 框架。源码可见 [WebMCP-org](https://github.com/WebMCP-org)。

### 3) 安全与用户同意

WebMCP 工具运行在用户现有会话中，会继承当前认证与权限。这很方便，也意味着“暴露什么工具、授权给谁”必须慎重设计。规范中的安全与隐私章节值得完整阅读。

## 结语

WebMCP 的意义在于：为网站提供了一种结构化方式，把应用能力安全、清晰地暴露给 AI Agent。

它让 Agent 从“脆弱 UI 自动化脚本”走向“应用能力的原生扩展”。

虽然仍在早期阶段，但方向很明确：API 简单、可复用既有应用逻辑、且基于标准化路径推进。

如果你想开始尝试，可以从以下入口入手：

- [Early Preview Program](https://developer.chrome.com/blog/webmcp-epp)
- [WebMCP 规范](https://webmachinelearning.github.io/webmcp/)
- [MCP-B 文档](https://docs.mcp-b.ai/)

