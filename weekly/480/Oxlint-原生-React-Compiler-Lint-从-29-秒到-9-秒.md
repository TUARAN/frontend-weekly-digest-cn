原文：React Compiler Linting Just Got a Rust-Native Speedup in Oxlint
链接：<https://blog.master.dev/react-compiler-linting-just-got-a-rust-native-speedup-in-oxlint/>
翻译：TUARAN

# Oxlint 原生 React Compiler Lint：从 29 秒到 9 秒

**更新！** 这是关于使用 Oxlint 对即将进入 React Compiler 的代码进行 lint 的近期文章的重写版。Oxlint 刚刚发布了一篇新的[指南](https://oxc.rs/blog/2026-08-18-react-compiler-support)，因此本文反映了这些新信息。

React 团队最近宣布发布 React Compiler 的 Rust 重写版，并表示它将成为未来编译器的规范版本，这引起了不小的轰动。

我已经在我的 AI 网站构建器 [Outlyne](https://outlyne.com/) 上使用 React Compiler 快一年了，效果稳定，我没有回头。我不再需要考虑什么时候该用 `useCallback` 或 `useMemo`。再配合审慎使用 `useEffectEvent` 以及遵循 [“You Might Not Need An Effect”](https://react.dev/learn/you-might-not-need-an-effect) 最佳实践，我基本摆脱了 React 批评者（甚至支持者）最常抱怨的问题。

我也已经完全迁移到 Vite v8（搭配 Rolldown）以及相应的 oxc 生态：

- Rollup → Rolldown
- eslint → Oxlint
- prettier → oxfmt
- jest → vitest

这意味着整个仓库的代码格式化几乎是瞬时的，测试运行快得多，lint 也通常非常快。但 React Compiler 一直拖累了这个工具链，没能发挥全部潜力。

我的大部分构建时间花在 Babel + React Compiler 上，而 lint 任务也被严重拖慢，因为我必须依赖 Oxlint 对 JS 插件的支持来添加 React Compiler linter。那个 linter 插件需要先运行 Babel，再运行 React Compiler 核心，以构建出 AST 和对代码的理解，才能进行静态分析并报告结果。总的来说，运行 React Compiler lint 插件让我的 lint 任务耗时变成了不运行时的三倍多。

“不值得吧，”你可能在想，“不过是几条 lint 规则。”很高兴你提了这个，因为这里还有最后一点关键背景：**我认为，启用全部规则的 React Compiler linter，是使用 React Compiler 无可争议的前提条件**。我在之前的[博客文章](https://acusti.ca/blog/2025/12/16/react-compiler-silent-failures-and-how-to-fix-them/)里详细写过。简单说一下：把手动 memoization 移除，交给 React Compiler 处理，这很神奇，能显著简化和清理代码库；但如果组件树在没有正确 memoization 的情况下快速重新渲染，而你又恰好引入了 React Compiler 支持的 JavaScript 子集之外的代码，编译器就会 bailout。这意味着你失去了自动 memoization，并可能看到明显的用户体验下降。

这种情况就曾发生在我们身上：一次 bailout 导致首页主要提示输入框里的动画占位符出现了卡顿和视觉破损（虽然功能仍正常）。

## Oxlint 获得原生 React Compiler 支持

Oxc 在今年 6 月的 [v1.70.0 发布](https://github.com/oxc-project/oxc/releases/tag/apps_v1.70.0) 中并没有大张旗鼓地宣布，但我从发布说明里看到他们新增了一个 nursery 规则 `react/react-compiler`，它可以在 Rust 中原生运行 React Compiler，无需 Babel 流水线。

速度提升名副其实。切换到原生规则后，我们的 lint 任务从约 **29.2 秒 → 9.1 秒**，这要归功于 Rust 原生实现，提速约 3.2 倍。这个数字还包括了 `perfectionist`——一个我们没有原生 Oxlint 替代品、仍在运行的 JS 插件。当我把 perfectionist 也去掉后，同样的 lint 任务只要约 2.6 秒，**提速 11 倍**。

今天的发布更重要，而且这次有正式的[公告](https://oxc.rs/blog/2026-08-18-react-compiler-support)。[v1.79.0](https://github.com/oxc-project/oxc/releases/tag/apps_v1.79.0) 引入了更接近最终形态的 Oxlint React Compiler lint 插件实现：

> Oxlint 现在包含 22 条由 React Compiler 驱动的规则，这些规则使用编译器的校验通道来捕获违反 React 规则的行为。

我认为对最广泛受众最有用的配置，是为整个代码库启用 Oxlint 的 `correctness` 类别（覆盖 12 条规则），然后显式列出剩下的 10 条：

```json
{
  "categories": { "correctness": "error" },
  "plugins": ["react"],
  "rules": {
    "react/capitalized-calls": "error",
    "react/exhaustive-effect-dependencies": "error",
    "react/hooks": "error",
    "react/invariant": "error",
    "react/memo-dependencies": "error",
    "react/no-deriving-state-in-effects": "error",
    "react/rule-suppression": "error",
    "react/syntax": "error",
    "react/todo": "error",
    "react/unsupported-syntax": "error"
  }
}
```

如果你启用 `restriction` 类别（我的配置），会自动引入另外 5 条规则；`suspicious` 类别引入 4 条；`perf` 类别引入最后一条（`react/no-deriving-state-in-effects`）。

Oxlint 的规则与 `eslint-plugin-react-hooks` v7 的规则完全匹配为一个子集，但不包括 `config`（通过 Oxlint 运行时编译器不可配置）、`gating`（同类原因）、`fbt`（Meta 内部类别）以及 `memoized-effect-dependencies`。

## 那 Vite 呢？

以上解决了流水线中的 lint 部分，我认为这部分已经完全解决，并且可以在 Rust React Compiler 工具链上使用。但你的实际构建还不完全是这样，即使构建流水线的其余部分已经是 Rust 化的。

oxc 在 2026 年 6 月合并了一个原生的构建时 transform 版本，但 Rolldown/Vite 维护者在上线后不久又把它撤回了，因为启用它会让 Rolldown 的二进制体积增加约 17%。2026 年 8 月 4 日，oxc 发布了 [`oxc-transform-react` v0.0.1](https://www.npmjs.com/package/oxc-transform-react)，其 README 描述为 “Oxc 实验性 Rust 版 React Compiler 的 Native Node.js 绑定”。

今天的 oxc.rs 文章是我见过的关于该 transform 状态最详细的说明。他们报告说，当前版本的 transform 比原始 Rust 版 React Compiler 快约 2 倍，已在 100 多个仓库和 10 多万个源文件上验证正确性。而且他们已经修复了 source map 支持，意味着它现在可以跨整个现代 React 工具链工作，包括 fast refresh。

这个包面向底层使用，用于转换源代码，但我已经开始测试用它创建一个 Vite 插件，以替代推荐 Vite React Compiler 设置中的 `@rolldown/plugin-babel` 部分，并且已经在 Outlyne 的生产环境中使用。我会在接下来几天发布一篇后续文章。

## 试试看

这只会影响 lint，因此无论你的技术栈是什么（Next.js、Webpack、Vite 等），都可以在不改动构建步骤的情况下采用。它确实需要 `oxlint`，但 [ESLint 到 Oxlint 迁移](https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint.html) 已经成熟且简单。如果你使用的是 ESLint v9/v10 flat config，有一个迁移工具可以自动处理：

```bash
npx @oxlint/migrate <可选的 eslint flat config 路径>
```

否则，可以让你的 LLM 帮你做，使用 [migrate-oxlint skill](https://skills.sh/oxc-project/oxc/migrate-oxlint) 作为额外保险。或者最渐进的方式：直接在 ESLint 旁边加上 Oxlint。它如此之快，以至于如果你去掉现有的 ESLint React Compiler 插件并采用 Oxlint 版本，即使多引入了一个工具，lint 步骤也会更快。

安装 Oxlint：

```bash
npm install --save-dev oxlint
# 或
pnpm add -D oxlint
# 或
yarn add -D oxlint
# 或
bun add -D oxlint
```

创建 `.oxlintrc.json`（最精简的起步方式是跳过 categories，单独启用规则）：

```json
{
  "plugins": ["react"],
  "rules": {
    "eslint/no-param-reassign": "error",
    "react/capitalized-calls": "error",
    "react/error-boundaries": "error",
    "react/exhaustive-effect-dependencies": "error",
    "react/globals": "error",
    "react/hooks": "error",
    "react/immutability": "error",
    "react/incompatible-library": "error",
    "react/invariant": "error",
    "react/memo-dependencies": "error",
    "react/no-deriving-state-in-effects": "error",
    "react/preserve-manual-memoization": "error",
    "react/purity": "error",
    "react/refs": "error",
    "react/rule-suppression": "error",
    "react/set-state-in-effect": "error",
    "react/set-state-in-render": "error",
    "react/static-components": "error",
    "react/syntax": "error",
    "react/todo": "error",
    "react/unsupported-syntax": "error",
    "react/use-memo": "error",
    "react/void-use-memo": "error"
  }
}
```

运行 `npx oxlint` 查看代码库中的不兼容之处并加以解决。注意我在列表里加了 [`eslint/no-param-reassign`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-param-reassign)。这是因为我遇到的最常见问题之一，是在组件中重新赋值一个 prop，而这个 prop 随后又在闭包（例如箭头函数）中被使用：

```javascript
function MyComponent({ value }) {
  value = value ?? someStateValue;
  return <button onClick={() => submit(value)}>Click me</button>;
}
```

修复方式是重命名，这 arguably 也更清晰：

```javascript
function MyComponent({ value: valueFromProps }) {
  const value = valueFromProps ?? someStateValue;
  return <button onClick={() => submit(value)}>Click me</button>;
}
```

这个小小的问题会让整个组件退出 React Compiler 优化，意味着你只要在热点路径组件里加一个 nullish prop 合并，就可能导致应用任何部分的性能回退。而目前 Oxlint 的 React Compiler lint 规则还无法捕捉这个特定问题，但 `eslint/no-param-reassign` 可以。

对于那些愿意忍受一些 lint 噪音的人，我的配置包含 `restriction` 类别，因此我只需要显式启用这些规则：

```json
{
  "categories": { "correctness": "error", "restriction": "error" },
  "plugins": ["react"],
  "rules": {
    "react/capitalized-calls": "error",
    "react/exhaustive-effect-dependencies": "error",
    "react/hooks": "error",
    "react/memo-dependencies": "error",
    "react/no-deriving-state-in-effects": "error"
  }
}
```

我的实际配置要长得多，因为我不得不禁用一些我不同意的 `restriction` 规则（例如 [`"eslint/no-eq-null": "off"`](https://eslint.org/docs/latest/rules/no-eq-null)，因为检查可能为 nullish 的 `value == null` 以同时覆盖 `null` 和 `undefined` 是最好的做法）。但我始终把所有 React Compiler 规则都作为 error 运行。一次 bailout 曾破坏了我们首页的动画占位符，正如我前面提到的。那次经历给我的结论是：**“没有 lint 所有 bailout 的 React Compiler 都是不安全的。”** 用 Oxlint 保护自己。
