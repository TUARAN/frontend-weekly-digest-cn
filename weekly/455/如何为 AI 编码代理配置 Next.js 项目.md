原文：How to set up your Next.js project for AI coding agents  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 如何为 AI 编码代理配置 Next.js 项目

最后更新：2026 年 2 月 27 日

Next.js 在 `next` 包内置了与版本精确匹配的文档，使 AI 编码代理可以引用准确、最新的 API 和实践模式。你只需在项目根目录放置一个 `AGENTS.md`，就能把代理从“训练语料记忆”引导到这份本地文档。

## 工作原理

安装 `next` 后，Next.js 文档会被打包到 `node_modules/next/dist/docs/`。其目录结构与 [Next.js 官方文档站](https://nextjs.org/docs) 保持一致：

```text
node_modules/next/dist/docs/
├── 01-app/
│   ├── 01-getting-started/
│   ├── 02-guides/
│   └── 03-api-reference/
├── 02-pages/
├── 03-architecture/
└── index.mdx
```

这意味着：代理始终能读取与你本地安装版本一致的文档，不需要网络请求，也不依赖外部检索。

项目根目录下的 `AGENTS.md` 会明确要求代理在写代码前先阅读这些文档。包括 Claude Code、Cursor、GitHub Copilot 在内的多数编码代理，会在会话启动时自动读取 `AGENTS.md`。

## 快速开始

### 新项目

[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) 会自动生成 `AGENTS.md` 和 `CLAUDE.md`，无需额外配置：

```bash
pnpm create next-app@canary
```

如果你不希望生成代理配置文件，可传入 `--no-agents-md`：

```bash
npx create-next-app@canary --no-agents-md
```

### 既有项目

确保 Next.js 版本为 `v16.2.0-canary.37` 或更高，然后在项目根目录新增下列文件。

`AGENTS.md`（代理会读取的规则）：

```md
<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->
```

`CLAUDE.md`（通过 `@` 引入 `AGENTS.md`，避免重复维护）：

```md
@AGENTS.md
```

## 理解 AGENTS.md

默认的 `AGENTS.md` 只有一条核心规则：**写代码前先读内置文档**。这个设计刻意保持最小化，目标是把代理从过时训练数据重定向到 `node_modules/next/dist/docs/` 中版本匹配的官方文档。

`<!-- BEGIN:nextjs-agent-rules -->` 与 `<!-- END:nextjs-agent-rules -->` 定义了 Next.js 托管区块。你可以在这个区块外添加项目私有规则，后续升级时不会被覆盖。

内置文档包含 App Router 与 Pages Router 的指南、API 参考与文件约定。当代理遇到路由、数据获取或其他 Next.js 任务时，应优先查阅本地文档，而不是依赖可能过时的训练记忆。

**补充：**想看这套机制在真实任务中的效果，可参考 [benchmark results](https://nextjs.org/evals)。

## 下一步

### Next.js MCP Server

继续阅读 Next.js MCP 支持文档，让编码代理可以访问你的应用运行时状态与上下文。

- [AI Agents 指南](https://nextjs.org/docs/app/guides/ai-agents)
- [Next.js MCP Server](https://nextjs.org/docs/app/guides/mcp)
- [Next.js Evals / Benchmark 结果](https://nextjs.org/evals)