# 抓取翻译工具（本地）

> 本目录用于本地运行抓取工具；Web 站点内置了在线版本入口（/tool）。

一个用于批量读取链接、抓取原文并转换为本地 Markdown 文件的工具（图片下载可选）。

## 功能特性

- ✅ 批量处理多个 URL
- ✅ 自动抓取网页内容
- ✅ 智能提取文章正文
- ✅ HTML 转 Markdown
- ✅ 图片下载可选（默认使用外链）
- ✅ 自动处理重定向
- ✅ 支持中文文件名
- ✅ 零依赖（仅使用 Node.js 内置模块）

## 安装

命令行抓取功能本身只用 Node.js 内置模块；可视化 UI 需要安装一个轻量服务端依赖（express）。

要求：Node.js >= 14.0.0

```bash
cd web/fetch-translate-tool
npm install
```

## 使用方法

### 可视化（推荐）

启动本地 UI：

```bash
cd web/fetch-translate-tool
npm run ui
```

然后打开：

- http://127.0.0.1:3005

生成的文件会出现在：

- 手动模式：`web/fetch-translate-tool/output/`
- weekly 模式：对应期数目录（例如 `weekly/451/`）

### 方式一：从 weekly 目录读取周刊链接（推荐）

默认会读取项目根目录的 `weekly/`，并从每一期的周刊 Markdown 中提取链接，抓取结果输出到对应期数目录：

```bash
node fetch-articles.js --weekly
```

只处理某一期：

```bash
node fetch-articles.js --weekly --issue 451
```

如需下载图片到本地：

```bash
node fetch-articles.js --weekly --issue 451 --download-images
```

指定 weekly 目录：

```bash
node fetch-articles.js --weekly /path/to/weekly
```

### 方式二：从文件读取链接（兼容模式）

1. 编辑 `urls.txt` 文件，每行添加一个要抓取的 URL：

```txt
https://example.com/article1
https://example.com/article2
https://example.com/article3
```

2. 运行命令：

```bash
node fetch-articles.js urls.txt
```

如需下载图片到本地：

```bash
node fetch-articles.js urls.txt --download-images
```

### 方式三：直接传入链接（兼容模式）

```bash
node fetch-articles.js https://example.com/article1 https://example.com/article2
```

如需下载图片到本地：

```bash
node fetch-articles.js https://example.com/article1 https://example.com/article2 --download-images
```

### 使用 npm scripts

```bash
# 使用 weekly 目录（默认）
npm run weekly

# 自定义命令
npm run fetch urls.txt
```

## 输出结果

默认只保存 Markdown，图片保留外链。

### 手动模式输出（`output/`）

若使用 `--download-images`，会在 `output` 目录下生成以下内容：

```
output/
├── 文章标题-时间戳.md        # Markdown 文件
├── 另一篇文章-时间戳.md
└── images/                   # 图片目录
    ├── image1.jpg
    ├── image2.png
    └── ...

### weekly 模式输出（期数目录）

weekly 模式会从 `weekly/` 目录下对应期数的周刊 Markdown 中提取链接，并把抓取结果写回对应期数目录：

```
weekly/
└── 451/
  ├── 前端周刊第451期.md
  ├── 文章标题-时间戳.md
  ├── 另一篇文章-时间戳.md
  └── images/               # 仅在开启 --download-images 时生成
    ├── image1.jpg
    └── ...
```
```

## 配置选项

你可以在 `fetch-articles.js` 文件中修改 `CONFIG` 对象来自定义配置：

```javascript
const CONFIG = {
  outputDir: './output',        // 输出目录
  imagesDir: './output/images', // 图片目录
  downloadImages: false,        // 是否下载图片（默认 false）
  userAgent: '...',             // User-Agent
  timeout: 30000,               // 请求超时时间（毫秒）
};
```

## 工作原理

1. **读取链接**：从文件或命令行参数读取 URL 列表
2. **抓取内容**：使用 HTTP/HTTPS 请求获取网页 HTML
3. **解析内容**：
   - 提取文章标题
   - 智能识别正文内容（article、main、content 等容器）
   - 移除 script 和 style 标签
4. **转换格式**：将 HTML 转换为 Markdown 格式
5. **下载图片**：可选下载图片到本地（默认关闭，使用外链）
6. **保存文件**：生成 Markdown 文件，图片使用外链或相对路径引用

## 支持的 HTML 元素

- 标题：`<h1>` ~ `<h6>`
- 段落：`<p>`
- 链接：`<a>`
- 列表：`<ul>`, `<ol>`, `<li>`
- 强调：`<strong>`, `<b>`, `<em>`, `<i>`
- 代码：`<code>`, `<pre>`
- 图片：`<img>`
- 换行：`<br>`

## 注意事项

1. **请求频率**：工具会在每个请求之间添加 1 秒延迟，避免对目标网站造成压力
2. **反爬虫**：某些网站可能有反爬虫机制，可能需要调整 User-Agent 或添加其他请求头
3. **内容提取**：工具使用启发式方法提取正文，对于复杂或非标准的网页结构可能效果不佳
4. **图片下载**：图片下载为可选（默认关闭）；若开启，某些图片可能因为防盗链或其他原因无法下载
5. **编码问题**：工具默认使用 UTF-8 编码，某些网站可能需要特殊处理

## 故障排除

### 链接无法访问

- 检查网络连接
- 确认 URL 是否正确
- 某些网站可能需要特殊的请求头或 Cookie

### 图片下载失败

- 图片 URL 可能有防盗链保护
- 图片可能已被删除或移动
- 检查网络连接

### 内容提取不完整

- 网页可能使用了非标准的 HTML 结构
- 内容可能通过 JavaScript 动态加载（此工具不支持）
- 可以尝试修改 `htmlToMarkdown` 函数中的选择器

## 进阶用法

### 作为模块使用

```javascript
const { processUrl } = require('./fetch-articles.js');

async function example() {
  const result = await processUrl('https://example.com/article', 1);
  console.log(result);
}
```

### 自定义 HTML 转换

修改 `htmlToMarkdown` 函数可以自定义转换规则，例如添加对更多 HTML 元素的支持。

## 未来改进

- [ ] 支持更多的 HTML 转 Markdown 规则
- [ ] 添加对 JavaScript 渲染页面的支持（使用 puppeteer）
- [ ] 支持更多的配置选项
- [ ] 添加进度条显示
- [ ] 支持断点续传
- [ ] 添加缓存机制避免重复下载

## 许可证

MIT
