# Rolldown 1.0 RC 发布

原文：[Announcing Rolldown 1.0 RC](https://voidzero.dev/posts/announcing-rolldown-rc)

作者：sapphi-red

日期：2026年1月22日

翻译：[TUARAN](https://github.com/TUARAN)

> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

![Announcing Rolldown 1.0 RC](./assets/announcing-rolldown-rc.jpg)

今天我们非常兴奋地宣布 Rolldown 1.0 的候选版本（Release Candidate，RC）。

**TL;DR**：Rolldown 是一个用 Rust 编写的 JavaScript/TypeScript 打包器。在保持与 Rollup 插件 API 兼容的同时，它比 Rollup 快 10–30 倍。本次 RC 标志着 API 进入稳定阶段：在 1.0 正式版发布前，我们不计划引入破坏性变更。我们鼓励你在自己的项目中试用，并在遇到问题时到 GitHub 上反馈：<https://github.com/rolldown/rolldown/issues>。

> 在用 Vite？
>
> 现在就可以通过 [Vite 8 beta](https://voidzero.dev/posts/announcing-vite-8-beta) 体验 Rolldown（该版本默认使用 Rolldown 作为打包器）。

## Rolldown 是什么？

Rolldown 是一个高性能的 JavaScript 打包器，目标是成为 [Vite](https://vite.dev/) 的下一代默认打包器。它试图同时拿到两边的优势：既有 [esbuild](https://esbuild.github.io/) 的速度，又保留了 [Rollup](https://rollupjs.org/) 的生态兼容性。

除此之外，Rolldown 还提供了一些两者都没有的能力，例如 [`output.codeSplitting`](https://rolldown.rs/reference/OutputOptions.codeSplitting) ——它能让你获得类似 webpack 那样更“细颗粒度”的分包控制能力。

## 关键特性

- **比 Rollup 快 10–30 倍**：原生 Rust 性能 + 并行处理，同时提供 WASM 构建以提升可移植性
- **兼容 Rollup 的插件 API**：绝大多数现有 Rollup 插件可以直接使用
- **内置转换能力**：TypeScript、JSX、语法降级由 [Oxc](https://oxc.rs/) 提供
- **原生的 CJS/ESM 互操作**：不再需要 `@rollup/plugin-commonjs`
- **内置 Node.js 模块解析**：不再需要 `@rollup/plugin-node-resolve`
- **更精细的代码拆分**：通过 [`output.codeSplitting`](https://rolldown.rs/reference/OutputOptions.codeSplitting) 提供 webpack 风格的 chunk 控制（这是 Rollup 所不具备的）

完整清单可查看：[Notable Features](https://rolldown.rs/guide/notable-features)。

## 快速上手

安装 Rolldown：

```sh
npm install -D rolldown
# 或
pnpm add -D rolldown
# 或
yarn add -D rolldown
# 或
bun add -D rolldown
```

创建配置文件：

```js
import { defineConfig } from 'rolldown'

export default defineConfig({
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
  },
})
```

运行构建：

```sh
npx rolldown -c
# 或
pnpm rolldown -c
# 或
yarn rolldown -c
# 或
bunx rolldown -c
```

## “RC” 意味着什么？

这次 Release Candidate 代表 **API 稳定**：在 1.0 正式版发布前，Rolldown 的公共 API 不计划再做破坏性变更。

**关于实验特性的一点说明**：目前仍有一部分能力处于 experimental 状态，例如：

- [Module types](https://rolldown.rs/in-depth/module-types)
- [Watch mode](https://rolldown.rs/reference/Function.watch)

实验特性会在文档中明确标注；即使 Rolldown 进入 1.0 之后，它们仍可能发生破坏性变更。如果要在生产环境使用，建议先做充分验证。

## 我们最近做了什么？

从 beta.1 以来，我们已经合入了超过 3,400 个提交：**749** 个功能、**682** 个 Bug 修复、**109** 个性能优化，以及 **166** 个文档更新。

### Vite 集成

我们将多个 Vite 内部插件移植到了 Rust，以提升常见场景的性能。同时我们也在 [rolldown-vite](https://v7.vite.dev/guide/rolldown) 以及后续的 Vite 8 beta 中持续验证稳定性。

### 性能

109 个性能相关提交包括：SIMD JSON 转义、并行 chunk 生成、符号重命名优化、更快的 sourcemap 处理等。

除了 Rolldown 本身，提供转换器与解析器能力的 [Oxc](https://oxc.rs/) 也变得更快了。

### 更好的分包

我们改进了分包算法，让产出的 chunk 数量更少。对于那些动态导入、但实际引用的是“已经加载过的模块”的场景，现在会直接内联；而一些小的 wrapper chunk 在可能时也会与目标 chunk 合并。

### 兼容性

我们继续扩大对 Rollup 与 esbuild 的兼容覆盖。当前 Rolldown 已通过 900+ 个 Rollup 测试和 670+ 个 esbuild 测试。

新补齐的一些 Rollup 选项示例：

- [`output.dynamicImportInCjs`](https://rolldown.rs/reference/OutputOptions.dynamicImportInCjs)：控制在 CJS 输出里如何渲染动态导入
- [`watch.onInvalidate`](https://rolldown.rs/reference/InputOptions.watch#oninvalidate)：监听模式下，文件触发重建时的 hook
- [`output.minifyInternalExports`](https://rolldown.rs/reference/OutputOptions.minifyInternalExports)：压缩内部导出名以减小体积

我们还增加了对 Node.js `module.exports` 的 ESM 导出形式的支持，以对齐 Node.js 关于 `require(ESM)` 的新行为：
<https://nodejs.org/docs/latest-v24.x/api/modules.html#loading-ecmascript-modules-using-require>

### API 稳定化

我们将一些 API 从 experimental 提升，并对齐默认值。例如：

- [`output.strictExecutionOrder`](https://rolldown.rs/reference/OutputOptions.strictExecutionOrder)：从 `experimental` 中移出
- [`output.codeSplitting`](https://rolldown.rs/reference/OutputOptions.codeSplitting)：从 `output.advancedChunks` 更名而来
- [`tsconfig` 自动发现](https://rolldown.rs/reference/InputOptions.tsconfig)：默认启用
- [`preserveEntrySignatures`](https://rolldown.rs/reference/InputOptions.preserveEntrySignatures)：默认值调整为 `'exports-only'`
- 通过 [`checks.pluginTimings`](https://rolldown.rs/reference/InputOptions.checks#plugintimings) 提供插件耗时诊断

### 开发体验

更好的错误提示（带文档链接）、用于崩溃上报的自定义 panic hook，以及与 Rollup 对齐的一批新诊断（如 `CIRCULAR_REEXPORT`、`CANNOT_CALL_NAMESPACE`）。

### 文档

我们补齐了此前缺失的文档：

- 在 [API reference](https://rolldown.rs/reference/) 中为全部选项、函数、类型提供了专门页面
- 基于 Rollup 文档并加入 Rolldown 扩展的 [Plugin API](https://rolldown.rs/apis/plugin-api)
- [CLI reference](https://rolldown.rs/apis/cli)

## 走向 1.0 与 Vite 8 的路线图

我们的后续路径大致是：

- **RC 阶段**：收集社区反馈、修复关键问题、确保 API 稳定。我们的目标是把破坏性变更降到零。
- **Vite 8**：默认使用 Rolldown 作为打包器，在生产构建管线中同时替换 esbuild 与 Rollup。
- **Rolldown 1.0**：当 RC 在真实生产用例中证明可靠后，发布稳定版本。

Rolldown 集成进 Vite 后，会统一构建管线，消除当前“两个打包器并存”的架构，从而让开发与生产的行为更加一致。

需要注意的是：Vite 8 很可能会先于 Rolldown 1.0 发布，因为 Rolldown 1.0 的部分目标并不是 Vite 集成的前置条件。

## 致谢

Rolldown 1.0 RC 是 [150+ 位贡献者](https://github.com/rolldown/rolldown/graphs/contributors) 共同努力的成果。感谢每一位贡献代码、提交 issue、以及帮忙传播的人。

同时我们也非常感谢启发 Rolldown 的项目：

- [Rollup](https://github.com/rollup/rollup)（Rich Harris、Lukas Taegert-Atkinson）
- [esbuild](https://github.com/evanw/esbuild)（Evan Wallace）

## 加入社区

- [Discord](https://chat.rolldown.rs/)：和团队与其他用户交流
- [GitHub](https://github.com/rolldown/rolldown)：点 Star、提 issue、参与贡献
- [Contributing Guide](https://rolldown.rs/contribution-guide/)：从这里开始参与贡献

## 去试试吧

Rolldown 已经准备好接受真实世界的检验。把它用在你的项目里，看看效果如何。

如果你遇到问题，请到 GitHub 上提一个 issue：<https://github.com/rolldown/rolldown/issues>。你在 RC 阶段给出的反馈，会直接影响到 1.0 的最终形态。

期待看到你用 Rolldown 构建出的作品。
