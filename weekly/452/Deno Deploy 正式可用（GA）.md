原文：[Deno Deploy Is GA](https://deno.com/blog/deno-deploy-is-ga)
翻译：TUARAN
欢迎关注 [{{前端周刊}}](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Deno Deploy 正式可用（GA）



作者：Luca Casonato、Ryan Dahl、Andy Jiang

发布时间：2026-02-03

Deno 团队宣布 Deno Deploy 进入 GA（Generally Available，正式可用）阶段。它希望把“部署一个 Web 应用”变得像本地运行一样简单：不需要适配器、不需要复杂构建配置、也不需要供应商特有的配置文件。无论你用的是 SvelteKit、Next.js、Astro（或其他框架），Deno Deploy 都尽量做到自动识别与自动构建。

同时，Deno 也在同一天介绍了 Deno Deploy 上的新能力：Deno Sandbox（用于以 microVM 方式安全执行任意代码，并可对网络出口和密钥做更强控制）。

## 任何框架、任何构建流程

Deno Deploy 宣称可支持主流 JavaScript 框架，即使你的构建/运行并不使用 Deno，也能通过检测框架类型来运行对应构建命令，并利用框架的新能力（例如 Next.js 16 的 `"use cache"`）。

## 零配置持续部署（Zero-config CD）

把 GitHub 仓库连接到 Deno Deploy 后，可获得默认的持续交付体验：

- 每次提交都有预览（preview）
- 每个 PR 形成一条“时间线（timeline）”，并拥有隔离的数据库环境
- 支持在 UI 中一键发布到生产与回滚

如果你希望更可控的发布流程，官方也提供了新的 `deno deploy` 子命令，可用于本地快速试跑或集成到 CI。

CLI 参考：

- https://docs.deno.com/runtime/reference/cli/deploy/

## 内置数据库：Deno KV + Postgres

除了 Deno KV（全球分布式 KV 存储）之外，Deno Deploy 现在也支持 Postgres：

- 可链接第三方数据库
- 也可在控制台中（与 Prisma 的合作能力）直接开通数据库
- 每个 PR 可自动开一套新数据库，减少“错连生产库”的风险

文章强调：即便 PR 与生产使用的是不同数据库，你的应用代码也能保持一致——因为环境变量由 Deno Deploy 自动管理。

示例（使用 `pg` 的连接池，省去手动配置）：

```ts
import { Pool } from "npm:pg";

// 无需额外配置——Deno Deploy 会自动处理连接信息
const pool = new Pool();

Deno.serve(async () => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [123]);

  return new Response(JSON.stringify(result.rows), {
    headers: { "content-type": "application/json" },
  });
});
```

此外，Deno Deploy 控制台还提供数据浏览能力，方便直接查看数据库内容。

## 用 `--tunnel` 打通本地与云端环境

部署时常见痛点是“本地能跑、线上不一样”。Deno Deploy 推出 `--tunnel` 以缩小这种差距：

- 从 Deno Deploy 拉取集中管理的环境变量
- 本地运行 dev server
- 即时暴露一个可分享的公网 URL
- 发送遥测数据回控制台

目前 `--tunnel` 主要用于 `deno run` 与 `deno task`，并预期会持续增强。

文档：

- https://docs.deno.com/deploy/reference/tunnel/

## 默认可观测性（Observability）

文章称：不论你在 Deploy 上跑的是 Node 还是 Deno，也不论你是否手动加了特定的 telemetry，默认都能在控制台看到 logs/traces/metrics。

默认捕获内容包括：`console.log`、`fetch`、HTTP、V8 事件、GC 与 IO；并把日志自动与请求关联，降低排查成本。

## Deno Sandbox：安全的“即开即用”计算

最后一节引出 Deno Sandbox（更详细见另一篇文章）。核心定位是：用 microVM 安全运行代码，并在密钥与网络出口控制方面做得更细。

（原文包含视频/图片与更多产品细节，这里保留关键要点与链接，去除页面导航等噪音内容。）
