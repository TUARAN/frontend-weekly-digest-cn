# 项目长期记忆

## 项目概况
- **仓库**：`/Users/tuaran/Documents/GitHub/frontend-weekly-digest-cn`
- **部署**：Vercel 自动构建，push main 分支即触发
- **框架**：Next.js（App Router），位于 `web/` 子目录

## 内容结构
- `weekly/` — 历史周刊 Markdown（按期数目录）
- `web/content/briefs/` — 精读/简报类 Markdown，frontmatter：`title/slug/date/category/tldr/readMinutes/pro/tags`
- `web/components/LiveSignalBoard.tsx` — 首页信号流组件，`signals[]` 数组硬编码在第 15 行，由 `AiRadarHome.tsx` 在 PageCarousel 下方渲染
- `web/components/AiDailyBoard.tsx` — AI 早报展示组件（iframe + 摘要面板 + 导出/分享），导出图片时会临时解除外层容器高度限制以完整截图

## AI 早报自动化
- **自动化 ID**：`automation-1779852562690`
- **名称**：前端周看 · AI 早报 | by 安东尼
- **时间**：每天 09:00 执行
- **工作流**（8 Steps）：
  1. 搜索当天 AI 动态
  2. 筛选 3-5 条（AI Coding / 具身智能）
  3. **生成 HTML + 更新 Manifest**（3A: 生成 HTML → 3B: cp 到 public/ → 3C: 更新 manifest.json 追加条目）
  4A. 替换 `LiveSignalBoard.tsx` 的 `signals[]`（首页卡片）
  4B. 写入 `web/content/briefs/ai-daily-YYYYMMDD.md`（/brief 独立页）
  5. git add `MMDD.html + manifest.json + LiveSignalBoard.tsx + brief.md` → commit + push
  6. 生成社群配文（简洁版 + 朋友圈版）
  7. deliver_attachments 交付 HTML
  8. 写入执行记录

## AI 早报 Manifest 索引机制
- **文件**：`web/public/ai-daily-manifest.json` — 所有早报的元数据索引
- **Schema**：`{ list: [{date, displayDate, file, count, highlights[]}], latest: "YYYY-MM-DD" }`
- **前端组件**：`web/components/AiDailyBoard.tsx`（`'use client'`）
  - fetch manifest → 默认展示最新（index 0）
  - 左右箭头切换历史日期，含"最新"绿色标签、摘要 pills
  - 覆盖加载态 / 空状态 / 错误态
- **首页接入**：`AiRadarHome.tsx` 中 `<AiDailyBoard />` 替代原硬编码 iframe

## 周刊翻译自动化
- **自动化 ID**：`automation-1779951288854`
- **名称**：前端周刊 · 周刊翻译 | by 安东尼
- **时间**：每周一 07:00 执行
- **信息源**：Medium @frontender-ua（Fresh Frontend Links），Frontend Weekly Digest 系列
- **工作流**（8 Steps）：
  1. WebSearch 搜索最新一期 "Frontend Weekly Digest"
  2. 抓取文章内容（curl → agent-browser → WebFetch 三级兜底）
  3. 检查 `weekly/{期数}/` 是否已存在（幂等）
  4. 翻译生成 `前端周刊第{N}期.md`（推荐语 + 分类目录 + 结语）
  5. 翻译精选文章 3-5 篇，独立 Markdown 文件
  6. 更新 README.md 追加新期数条目 + 转移 ⭐最新 标记
  7. git add + commit + push
  8. 写入执行记录到 `.workbuddy/memory/`
- **分类映射**：Web Dev / CSS / JavaScripts / React / Tools / Demo
- **当前进度**：项目最新第 467 期（已补齐 463-467），与 Medium 源同步
- **Medium 抓取方式**：RSS feed `https://medium.com/feed/@frontender-ua` 是最可靠方式（WebFetch 可获取完整文章列表），直接 curl/WebFetch Medium 文章页会被 Cloudflare 拦截

## Git 配置
- remote：`https://github.com/TUARAN/frontend-weekly-digest-cn.git`
- SSH 已配置并验证通过（`Hi TUARAN!`）
- 用户：CodeMiner-掘金安东尼 / 729922845@qq.com
- commit 格式：`chore: AI 早报 YYYY-MM-DD - 今日精选 X 条动态`
