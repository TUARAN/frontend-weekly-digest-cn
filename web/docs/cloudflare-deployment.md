# Cloudflare 部署说明

本项目现在按 Cloudflare 优先部署整理。`web/` 仍然是 Next.js App Router 项目，但已经使用 `output: "export"` 生成静态站点，因此可以直接部署到 Cloudflare Pages，也可以部署到 Cloudflare Workers Static Assets。

## 推荐方案：接入旧 Cloudflare Pages 项目

如果你的旧 Flare/Cloudflare 项目已经和 GitHub 连接，直接把它指向本仓库即可：

| 配置项 | 值 |
| --- | --- |
| Production branch | `main` |
| Root directory | `web` |
| Framework preset | `Next.js (Static HTML Export)` |
| Build command | `npm ci && npm run build` |
| Build output directory | `out` |
| Node.js version | `22` |

部署完成后，把正式域名 `frontendweekly.cn` 绑定到这个 Cloudflare Pages 项目。确认新项目可访问后，可以关闭 Vercel 上旧项目的自动部署，避免两个平台同时抢域名或造成缓存判断混乱。

## DSJC 类似方案：Workers Static Assets

如果旧项目是 Workers Builds + Git 自动部署，使用 `web/wrangler.jsonc`：

```bash
cd web
npm ci
npm run build:cloudflare
npx wrangler deploy
```

Cloudflare Workers Builds 中建议填写：

| 配置项 | 值 |
| --- | --- |
| Root directory | `web` |
| Build command | `npm ci && npm run build:cloudflare` |
| Deploy command | `npx wrangler deploy` |
| Production branch | `main` |

`wrangler.jsonc` 会把 `./out` 作为静态资源目录上传，并使用 `auto-trailing-slash` 保持 Next.js 静态导出的目录 URL 行为。

## 本地验证

```bash
cd web
npm ci
npm run build:cloudflare
npm run deploy:cloudflare:dry-run
```

## 注意事项

- 当前站点是静态导出，页面、周刊、每日精选、7x24 数据都可以作为静态资源部署。
- `app/api/*` 这类 Next.js API Route 不会在静态导出中作为服务端接口运行。如果后续需要支付回调、服务端接口或动态 OG 图，需要再迁到 Cloudflare Workers + OpenNext。
- 正式域名仍然是 `https://frontendweekly.cn/`。
