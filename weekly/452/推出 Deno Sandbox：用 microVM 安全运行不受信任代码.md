原文：[Introducing Deno Sandbox](https://deno.com/blog/introducing-deno-sandbox)
翻译：TUARAN
欢迎关注 [{{前端周刊}}](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 推出 Deno Sandbox：用 microVM 安全运行不受信任代码



作者：Ryan Dahl

发布时间：2026-02-03

Deno 团队观察到过去一年里 Deno Deploy 用户的一个显著变化：越来越多的产品让用户（或 LLM）生成代码，并且这段代码会在**没有人工审核**的情况下立即运行。更麻烦的是，这些代码往往还会继续调用外部 API（包括再次调用 LLM），因此需要网络访问与真实密钥。

这不再是传统的“运行不受信任插件”问题：

- 仅仅把计算沙箱化还不够；
- 你必须能控制网络出口（egress）；
- 同时必须保护密钥，避免被提示注入/恶意代码外传。

Deno Sandbox 的目标就是同时解决“隔离计算 + 控制网络出口 + 保护密钥”，并且在代码准备好后可以无缝部署到 Deno Deploy。

## 什么是 Sandbox？

Deno Sandbox 提供轻量的 Linux microVM（运行在 Deno Deploy 云上），用于以“深度防御（defense in depth）”的方式执行不受信任代码。

你可以通过 JavaScript 或 Python SDK 以编程方式创建 sandbox，它们启动时间不到 1 秒；也可以用 SSH / HTTP 交互，甚至直接在 VS Code 中打开一个窗口连接到 sandbox。

一个最小示例：

```ts
import { Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create();
await sandbox.sh`ls -lh /`;
```

这里的 `await using` 表示以资源管理的方式确保 sandbox 生命周期在作用域结束时被正确清理。

## “偷不走”的密钥

文章强调的一个关键点：在 Deno Sandbox 中，密钥不会直接进入环境变量。

代码读取到的只是占位符（placeholder）。只有当 sandbox 发起到**允许的目标域名**的出站请求时，真实密钥才会在出站代理处被“注入”进请求。

示例：

```ts
import { Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create({
  secrets: {
    OPENAI_API_KEY: {
      hosts: ["api.openai.com"],
      value: process.env.OPENAI_API_KEY,
    },
  },
});

await sandbox.sh`echo $OPENAI_API_KEY`;
// DENO_SECRET_PLACEHOLDER_...
```

如果被提示注入的代码试图把这个占位符外传到 `evil.com`，它也没有任何价值。

## 网络出口控制（Egress Control）

你可以限制 sandbox 能访问的主机列表：

```ts
await using sandbox = await Sandbox.create({
  allowNet: ["api.openai.com", "*.anthropic.com"],
});
```

任何访问未在白名单内的主机请求，都会在 VM 边界被拦截。

这两项能力（密钥注入 + 出站白名单）通过一个出站代理实现，类似 `coder/httpjail`，让策略控制有一个统一的“卡口（chokepoint）”。官方也提到后续会扩展更多能力，例如：出站连接分析、以及让可信代码能检查/修改请求的 hooks。

同时，文章建议把 Deno 运行时层面的 `--allow-net` 权限控制也一起用上，形成双层防护：

- VM 层面的网络限制
- 运行时层面的权限系统

## 从 Sandbox 直接部署到生产

`sandbox.deploy()` 允许你把 sandbox 中的代码直接部署到 Deno Deploy：

```ts
const build = await sandbox.deploy("my-app", {
  production: true,
  build: { mode: "none", entrypoint: "server.ts" },
});

const revision = await build.done;
console.log(revision.url);
```

文章把它概括为“一次调用从 sandbox 到生产”：不需要在另一个 CI 系统里重新构建，也不用换一套认证流程。

## 持久化能力

Sandbox 默认是临时的（ephemeral），但需要状态时也提供能力：

- Volumes：可读写存储（缓存、数据库、用户数据等）
- Snapshots：只读镜像，用于预装工具链或作为 volume 基底

典型用法是：先 `apt-get install` 一次，把结果做成 snapshot；后续 sandbox 启动时基于 snapshot 秒级构建出一个“工具都装好了”的环境。

## 技术参数（节选）

原文给出了一个规格表（地区、vCPU、内存、生命周期等）。具体以官方文档与控制台为准。

（原文包含视频、产品入口与更多营销/导航内容，这里保留核心概念与示例代码，去除页面噪音。）
