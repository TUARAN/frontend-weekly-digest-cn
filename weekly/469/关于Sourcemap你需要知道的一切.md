原文：Everything you need to know about Sourcemaps
链接：https://neciudan.dev/everything-you-need-to-know-about-sourcemaps
翻译：TUARAN

# 关于 Sourcemap，你需要知道的一切

我一直对 sourcemap 感到好奇。

我知道它们是什么，但在看了 Sentry 的 Charly Gomez 在 JNation 的演讲后，我终于更深入地理解了它们。然后我写了这篇文章，涵盖你需要知道的关于 sourcemap 的一切，包括它们引入的一些危险。

---

## 什么是 Sourcemap

当你部署一个 React 应用时，浏览器运行的并不是你写的代码。

构建工具输出的代码是**压缩、打包后**的，变量名被缩短，注释被移除，所有东西合并到一个文件中。

这对下载体积来说是好事，但让调试变得极其困难。一个 `bundle.min.js:1:48211` 处的生产错误对你来说完全没有意义。

**Sourcemap 是一个 JSON 文件**，它将压缩后的代码映射回原始文件、行号、列号和变量名。

一个简化版的 sourcemap 长这样：

```json
{
  "version": 3,
  "file": "bundle.min.js",
  "sources": ["src/UserCard.tsx", "src/api.ts"],
  "sourcesContent": ["function UserCard({ user }) {...", "export async function..."],
  "names": ["UserCard", "user", "fetchUser"],
  "mappings": "AAAA,SAASA,WAAW..."
}
```

关键字段是 `sources`、`sourcesContent`、`names` 和 `mappings`。

**`sources`** 是打包进 bundle 的原始文件列表，以路径形式写入。当你的构建工具读取 `src/components/billing/InvoiceForm.tsx` 时，那个精确的路径就被写进了这里。所以**当你发布 sourcemap 时，你也发布了你项目的文件夹结构和内部模块名**。

**`names`** 是被压缩工具重命名或删除的原始标识符列表：函数名、变量、属性。你写了 `calculateShippingCost`；bundle 里变成了 `c`；字符串 `calculateShippingCost` 就存在这个数组里。当调试器需要展示真实名称而不是 `c` 时，它从这里读取。

**`mappings`** 是将二者连接起来的字符串。每个片段对应压缩后输出中的一个位置。该片段再指向 `sources` 中的一个文件、文件中精确的行和列，以及 `names` 中的一个名称。当一个工具解码给定位置的片段时，它就能检索到该位置的原始位置和标识符。（格式是 base64 VLQ，以保持字符串紧凑）

**`sourcesContent`** 保存的是每个原始源文件的**完整文本**，直接内联在 JSON 中，顺序与 `sources` 相同。`sources` 给你路径，`mappings` 给你位置，而 `sourcesContent` 给你实际的代码、注释和所有内容。

---

## 转换是如何进行的

当你写一些 TypeScript 代码：

```tsx
function calculateShippingCost(country: string, weight: number): number {
  const baseRate = 5.0;
  const weightMultiplier = weight * 0.5;
  return baseRate + weightMultiplier;
}
```

TypeScript 首先将其编译为 JavaScript，去除类型注解：

```js
function calculateShippingCost(country, weight) {
  const baseRate = 5.0;
  const weightMultiplier = weight * 0.5;
  return baseRate + weightMultiplier;
}
```

然后压缩工具开始工作。它将每个局部绑定重命名为最短的合法标识符，删除空白，内联能内联的，并将所有内容压缩到一行：

```js
function c(o,e){return 5+.5*e}
```

**这就是部署到生产环境的东西。** 每个函数被串联在一起，形成 Network 标签页里那个不可读的长墙。

---

## 反向转换

在一个加载了 sourcemap 的网站上打开 DevTools，浏览器会自动完成反向转换。你在 `c` 上设置断点，DevTools 会向你展示 `calculateShippingCost`，带着原始类型，因为 sourcemap 告诉它怎么做了。

当浏览器在 `bundle.min.js` 中遇到错误时，它读取 `mappings` 表，解码 VLQ 片段，并找到覆盖那个精确输出位置的那一个。该片段指向一个源索引、一个原始行、一个原始列和一个名称索引。

浏览器直接从 sourcemap 中使用这些索引获取原始源码和变量名。

然而，**Sourcemap 也带来了重大的安全风险**：泄露一个 sourcemap 可以让任何能访问到 `.map` 文件的人看到你整个原始代码库。

人们以为 sourcemap 是一个轻量索引，只是一个目录。但默认情况下，大多数现代打包器**会在 `sourcesContent` 字段中嵌入你原始源文件的完整内容**，除非你做了特殊配置。

主流框架在开发环境中通常会默认开启这个设置，而有时在生产环境中忘记关闭——尤其是使用模板或生成器项目时。

如果你部署了包含源代码的 sourcemap，任何能访问 `.map` 文件的人都可以查看你可读的代码库。压缩只是减少了代码体积，**它并不隐藏你的逻辑或保护敏感信息**。

**Sourcemap 就是解压你代码的钥匙。** 如果有人获得了 `.map` 文件，他们可以完全重建你的源代码，消除压缩提供的任何保护。

---

## 那么，谁可以获取 .map 文件？

任何人，如果你允许的话。

**Apple 的教训。** 2025 年 11 月 5 日，Apple 重新设计的网页版 App Store 上线时暴露了其完整源代码——一个简单的配置错误就能产生巨大的连锁反应。这是因为 Apple 在生产环境中**开启了 sourcemap**，将压缩后的 bundle 还原成了可读代码。有人发现了这一点，使用一个 Chrome 扩展运行 sourcemap，重建了整个网页版 Apple Store 的代码。

浏览器（和任何逆向 sourcemap 的工具）通过两种方式找到 sourcemap：要么 bundle 末尾有一个注释指向它：

```js
//# sourceMappingURL=bundle.min.js.map
```

要么服务器在 JavaScript 响应中发送一个 `SourceMap` HTTP 头。

无论哪种方式，位置都是公开的。DevTools 可以获取它，`curl` 也可以。

**Anthropic 的教训。** 2026 年 3 月 31 日，在 Apple 事件五个月后，Anthropic 发布了 `@anthropic-ai/claude-code` npm 包的 2.1.88 版本。包内包含了一个 **59.8 MB 的 `cli.js.map` 文件**。它映射了大约 1,900 个文件和超过 512,000 行的未混淆 TypeScript——Claude Code 完整的客户端 agent 体系。

和 Apple 犯了同样的错误——但有一个关键差异让这次暴露变得**永久性**。

Apple 将 sourcemap 发布到网站，修复配置后可以移除。只有当时快的人看到了全部。

**Anthropic 的 npm 包被立即下载、缓存和镜像**——没有任何配置可以从所有缓存中删除一个已发布的版本。

几小时内，代码库被从 Anthropic 自己的 Cloudflare R2 bucket 中拉取出来，镜像到 GitHub，并被 fork 了数万次。

Anthropic 的声明称这是一个由人为错误导致的发布打包问题，而非安全漏洞。但**这个 harness 本身就等同于核心 Claude 产品**。

这次泄露将竞争对手提供了一个高自主性编码 agent 的实际构建蓝图：API 调用引擎、流式响应处理、工具调用循环、重试逻辑、token 计数以及权限模型。

---

## 如何避免这种情况

每一个这类事件都可以通过一个默认值翻转或一行服务器规则来预防。

你可以实施四层防护来保护自己和你的代码：

**第一层：从打包器开始。** 为生产构建禁用 sourcemap 生成，或者生成它们但将其排除在部署产物之外。

在 Vite 中：

```ts
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: false,
  },
});
```

在 Next.js 中：

```ts
// next.config.js
module.exports = {
  productionBrowserSourceMaps: false,
};
```

`false` 在两者中**都已经是默认值**。Apple 和 Anthropic 都需要做点什么才能**主动开启**这个功能。生产环境中的 sourcemap 几乎总是有人为调试临时开启然后忘记关掉的。

**第二层：如果为了错误追踪需要 sourcemap，将其隐藏。** 生成 `.map` 文件但不让浏览器加载。Vite 的 `sourcemap: 'hidden'` 会构建文件但不在 bundle 末尾添加指向它的注释，所以 DevTools 永远不会获取它。你把那个文件上传到监控工具（如 Sentry），然后从公开部署中移除它。

**第三层：在服务器上加一道防护。** 为任何 `.map` 请求返回 404，这样即使有一个漏到了部署产物中，也无法被访问：

```nginx
location ~* \.map$ {
  return 404;
}
```

**第四层：亲自检查。** 打开你的生产网站，进入 Network 标签页，过滤 `.map`。如果出现了任何内容，或者你的 Sources 面板显示的是可读的变量名和注释而不是单个字母——**你的源代码此刻是公开的**。

如果你发布 npm 包，等效的检查是查看 tarball。运行 `npm pack`，解压结果，检查。里面有 `.map` 文件就是 Anthropic 级别的事故在等着发生。

**来自 Apple 和 Anthropic 的不舒服教训是：知道规则并不能拯救你。** 两家公司都有安全团队，都知道生产环境不该有 sourcemap。那个开关是因为某个在当时看来合理的理由被打开的，而没有任何自动化检查在部署路上将其捕获。

所以**唯一真正的保护是自动化检查**——当带有 `sourcesContent` 的 `.map` 出现在公众可访问的地方时，构建或部署应该失败。

以下是一个实用的检查脚本 `scripts/check-sourcemaps.mjs`：

```js
import { readFileSync } from "node:fs";
import { glob } from "node:fs/promises";

const OUTPUT_DIR = process.argv[2] ?? "dist";
const ALLOW_EMPTY_MAPS = true;
const offenders = [];

for await (const file of glob(`${OUTPUT_DIR}/**/*.map`)) {
  let map;
  try {
    map = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    offenders.push({ file, reason: "unparseable .map file" });
    continue;
  }

  const hasInlinedSource =
    Array.isArray(map.sourcesContent) &&
    map.sourcesContent.some((c) => typeof c === "string" && c.length > 0);

  if (hasInlinedSource) {
    offenders.push({ file, reason: "contains sourcesContent (original code)" });
  } else if (!ALLOW_EMPTY_MAPS) {
    offenders.push({ file, reason: "source map present" });
  }
}

if (offenders.length > 0) {
  console.error(`\n✖ Source map check failed in "${OUTPUT_DIR}":\n`);
  for (const { file, reason } of offenders) {
    console.error(`  ${file}\n    -> ${reason}`);
  }
  process.exit(1);
}

console.log(`✓ No source-leaking maps found in "${OUTPUT_DIR}".`);
```

将其挂到 `package.json` 的 `postbuild` 钩子上，再配合 CI 中的一步检查，就能让这种错误变成**不可能再犯**的错误。

自动化检查一次，它就会捕获之后每一次的失误。
