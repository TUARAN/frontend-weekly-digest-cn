## 概览

`web/` 目录存放的是前端周刊的在线工具和配套小工具，主要包括：

- **Next.js Web 应用**：`frontendweekly.cn` 的前端界面和后端 API，用于上传周刊内容、预览和导出。
- **Article Extractor**：辅助从网页中抽取正文、清洗噪点、翻译的全栈小工具。
- **Fetch Translate Tool**：批量抓取文章内容并生成翻译草稿的脚本工具。

下面按子目录分别说明。

## 目录结构

- **根目录（Next.js 应用）**
  - `app/`：应用页面与 API 路由
    - `app/page.tsx`：首页
    - `app/tool/page.tsx`：周刊工具页
    - `app/about/page.tsx`：关于页
    - `app/api/tool/*`：文件上传、任务创建与查询等接口
  - `components/`：通用 React 组件，例如 `Header.tsx`
  - `next.config.ts`：Next.js 配置
  - `postcss.config.mjs`：PostCSS / Tailwind 等样式工具配置
  - `docs/`：部署与集成相关文档，如 `cloudflare-llm.md`
  - `.env.local`：本地开发环境变量（不会提交到仓库）

- **`article-extractor/` 全栈抽取/翻译工具**
  - `article-extractor/server/`：Node.js 服务
    - `index.js`：服务入口
    - `routes.js`：路由与接口
    - `fetcher.js` / `cleaner.js` / `preview-helper.js` / `translator.js` / `utils.js`：抓取、清洗、预览和翻译逻辑
    - `prompts/translate_prompt.md`：翻译 Prompt 文本
  - `article-extractor/client/`：基于 Vite + React 的多步骤向导界面
    - `src/pages/StepUpload.jsx` 等：上传、确认链接、翻译、清洗预览、人工校对等步骤
    - `src/App.jsx` / `src/main.jsx` / `src/styles.css`：前端入口与样式
  - `article-extractor/package.json` / `client/package.json`：依赖管理
  - `article-extractor/README.md`：该工具的单独说明

- **`fetch-translate-tool/` 批量抓取 + 翻译脚本**
  - `fetch-articles.js`：主脚本，按配置/链接抓取文章并调用 LLM 翻译
  - `prompt.md`：翻译 Prompt
  - `ui-server.js`：简易 UI / 本地服务（可选）
  - `README.md`：工具说明
  - `output/`：脚本运行生成的中间/结果文件（可删除重建，属于产物）

- **构建/缓存目录**
  - `.next/`：Next.js 开发/构建输出目录（会自动生成，通常不需要手动修改）

## 开发与运行

在 `web/` 目录下：

```bash
# 安装依赖
npm install

# 启动 Next.js 开发服务器
npm run dev
# 默认访问地址：http://localhost:3000
```

Article Extractor 与 Fetch Translate Tool 作为“辅助工具”使用：

- **Article Extractor**
  - 后端：在 `web/article-extractor/server` 下安装依赖并启动服务。
  - 前端：在 `web/article-extractor/client` 下安装依赖并运行 `npm run dev`。
- **Fetch Translate Tool**
  - 在 `web/fetch-translate-tool` 下安装依赖，根据 `README.md` 说明运行脚本。

> 注意：`output/`、`.next/` 等目录都是运行时/构建产物，可以随时清理；真正需要维护的是上述源码与配置文件。
