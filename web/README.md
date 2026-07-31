## 概览

`web/` 是站点前端与配套工具目录，当前口径统一为三部分：

- **AI情报站**：首页，面向 AI、Agent、前端、科技资讯的 7×24h 播报与导航入口。
- **原·前端周刊**：保留历史周刊内容，并继续按周更新。

> **部署**：本项目**只通过 Cloudflare Pages 部署**（DNS 解析也在 Cloudflare）。`next.config.ts` 锁定 `output: "export"`，所有路由必须可静态导出 —— 不允许新增动态 API 路由或使用 `await searchParams` 的 page。不要引入 Vercel 或 `vercel.json`。

## 目录结构

- **Next.js 应用**
  - `app/page.tsx`：AI情报站首页
  - `app/weekly/page.tsx`：原·前端周刊列表页
  - `app/weekly/[slug]/page.tsx`：单期周刊正文页
  - `components/`：站点通用组件
  - `docs/`：部署与集成文档

- **`article-extractor/`**
  - 全栈抽取/翻译工具，负责网页正文抽取、清洗、预览与翻译辅助

- **`fetch-translate-tool/`**
  - 批量抓取 + 翻译脚本工具，用于本地抓取与整理流程

- **文档**
  - `docs/domain-matrix-cloudflare.md`：主品牌 + 周刊子站的域名矩阵与重定向策略
  - `docs/fetch-translate-llm.md`：本地抓取翻译工具的大模型环境变量配置说明

- **运行产物**
  - `.next/`、`output/` 等目录都属于构建或运行产物，可删除重建

## 实时数据

AI 情报实时流、每日精选和周刊索引由仓库根目录的 GitHub Actions 定时生成，写入主站的 `tuaran-content-feed` R2 bucket。展示页优先读取 `https://2aran.com/api/frontend-weekly`，仓库里的静态 JSON 只作为离线和接口故障时的兜底，不再由定时任务持续提交。

- `scripts/publish-2aran-feed.mjs live`：发布实时流
- `scripts/publish-2aran-feed.mjs daily`：发布每日精选
- `scripts/publish-2aran-feed.mjs weekly`：发布周刊索引

GitHub Actions 使用 OIDC 短期令牌调用主站写入接口，不需要配置长期 API 密钥。写入权限限定为本仓库 `main` 分支的工作流。

## 本地开发

在 `web/` 目录下：

```bash
npm install
npm run dev
```

默认访问：

- `http://localhost:3000` 或自动切换后的可用端口

## 相关子工具

- **Article Extractor**
  - 后端位于 `web/article-extractor/server`
  - 前端位于 `web/article-extractor/client`

- **Fetch Translate Tool**
  - 位于 `web/fetch-translate-tool`
  - 具体运行方式见该目录下的 `README.md`

## 说明

- 这个目录服务的是站点展示层和周刊工具链，不是单一的“周刊前端”
- 当前产品重点已经从单纯内容整理，转向前端开发者面向 AI Agent 开发转型所需的信息、资料与能力支撑
