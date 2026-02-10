# ESLint v10.0.0 发布

原文：https://eslint.org/blog/2026/02/eslint-v10.0.0-released/

发布时间：2026-02-06（Release Notes）

ESLint v10.0.0 是一次**大版本升级**：新增功能、修复 bug，同时包含多项破坏性变更。升级前建议先快速过一遍本文要点与迁移指南。

## 要点速览

### 安装

这是大版本升级，npm 不一定会自动把你升级到 v10。要确保使用 v10.0.0，请执行：

```bash
npm i eslint@10.0.0 --save-dev
```

### 不再支持 Node.js < v20.19.0、v21.x、v23.x

截至本文发布时，Node.js v24.x 是 LTS 版本。因此 ESLint v10.0.0 开始：

- 不再支持低于 v20.19.0 的所有 Node.js 版本；
- 同时不再支持 v21.x 与 v23.x。

### 迁移指南

由于变更较多，官方提供了详细的迁移指南：

- https://eslint.org/docs/latest/use/migrate-to-10.0.0

官方预期大多数用户可以在**不改构建配置**的前提下完成升级；但如果遇到问题，迁移指南会是最重要的排查入口。

### 新的配置文件查找算法

ESLint v10.0.0 查找 `eslint.config.*` 的方式发生变化：改为从**每个被 lint 的文件所在目录**开始向上查找（参考 RFC），而不是像 ESLint v9 那样从当前工作目录（cwd）出发。

- RFC：https://github.com/eslint/rfcs/tree/main/designs/2024-config-lookup-from-file

新行为的好处是：

- 同一次运行中可以使用多个配置文件；
- 对 monorepo 场景更友好。

在 ESLint v9 中，可以用 `v10_config_lookup_from_file` 特性开关启用这套行为；从 v10 起它成为默认行为，同时该开关被移除。

### 移除 eslintrc（旧配置系统）功能

正如官方在 Flat config rollout plans 中提前说明的那样：ESLint v10.0.0 **彻底移除了** eslintrc 配置系统。

- 说明：https://eslint.org/blog/2023/10/flat-config-rollout-plans/#eslintrc-removed-in-eslint-v10.0.0

具体包括：

- 不再识别 `ESLINT_USE_FLAT_CONFIG` 环境变量。
- CLI 不再支持 eslintrc 专属参数：`--no-eslintrc`、`--env`、`--resolve-plugins-relative-to`、`--rulesdir`、`--ignore-path`。
- 不再识别 `.eslintrc.*` 与 `.eslintignore`。
- `/* eslint-env */` 注释会被当作错误报告。
- `loadESLint()` 现在始终返回 `ESLint` 类。
- `Linter` 构造函数的 `configType` 参数只能是 `"flat"`；如果传入 `"eslintrc"` 会抛错。

以下 `Linter` 中与 eslintrc 相关的方法被移除：

- `defineParser()`
- `defineRule()`
- `defineRules()`
- `getRules()`

`/use-at-your-own-risk` 入口也有变更：

- `LegacyESLint` 移除
- `FileEnumerator` 移除
- `shouldUseFlatConfig()` 将始终返回 `true`

### JSX 引用现在会被追踪

ESLint v10.0.0 开始会追踪 JSX 引用，从而让 JSX 元素的作用域分析更正确。

此前 JSX 标识符不会被当作引用，这会让依赖作用域信息的规则产生误判。例如：

```jsx
import { Card } from "./card.jsx";

export function createCard(name) {
  return <Card name={name} />;
}
```

在 v10.0.0 之前：

- **误报（false positives）**：`<Card>` 可能被报 “定义了但从未使用”（`no-unused-vars`）。
- **漏报（false negatives）**：即便你删掉 import，也可能不会触发 “未定义变量”（`no-undef`）。

从 v10.0.0 起，`<Card>` 会被当作对同名变量的正常引用处理，从而减少困惑的误报/漏报，并改善 JSX 项目的 lint 体验。

### Espree 与 ESLint Scope 内置类型定义

从 Espree v11.1.0 与 ESLint Scope v9.1.0 开始，这两个包自带 TypeScript 类型定义：

- Espree v11.1.0：https://www.npmjs.com/package/espree/v/11.1.0
- ESLint Scope v9.1.0：https://www.npmjs.com/package/eslint-scope/v/9.1.0

此前类型来自 Definitely Typed 的 `@types/espree` 与 `@types/eslint-scope`。新旧类型定义存在差异（多为修复类变更）。如果你的代码直接依赖这些包的类型，请留意是否需要调整。

### `RuleTester` 增强

ESLint 提供的 `RuleTester` 用于插件作者为规则编写测试。本次版本为 `RuleTester` 增加了多项改进，用于让测试定义更严格、更易调试。

#### 断言选项（Assertion options）

`RuleTester#run()` 新增断言选项：`requireMessage`、`requireLocation`、`requireData`。

这些选项用于强制每个 invalid 测试用例明确校验报错的消息、位置与数据，避免测试“只要报了错就算过”的情况。

- `requireMessage`：确保每个测试用例校验 message。
- `requireLocation`：确保每个测试用例校验位置（`line`/`column`）。
- `requireData`：当 `messageId` 对应消息包含占位符时，强制提供 `data` 并校验。

示例：

```js
ruleTester.run("my-rule", rule, {
  valid: [{ code: "var foo = true;" }],
  invalid: [
    {
      code: "var invalidVariable = true;",
      errors: [{ message: "Unexpected invalid variable.", line: 1, column: 5 }],
    },
  ],
  assertionOptions: {
    requireMessage: true,
    requireLocation: true,
  },
});
```

#### 更好的失败定位信息

`RuleTester` 现在会在 stack trace 中附加额外信息，帮助你更快定位失败用例：例如 invalid 数组中失败用例的索引，以及测试用例定义所在文件与行号。

### `max-params` 新增 `countThis` 选项

`max-params` 规则新增 `countThis` 选项，取代已弃用的 `countVoidThis`。

当设置 `countThis: "never"` 时，在统计 TypeScript 函数参数数量时，会忽略参数列表中的 `this` 注解。例如：

```ts
function doSomething(this: SomeType, first: string, second: number) {
  // ...
}
```

会被认为只有 2 个参数。

### formatter context 新增 `color` 属性

当命令行指定 `--color` 或 `--no-color` 时，ESLint 会在传给 formatter 的 context（`format()` 方法的第二个参数）上附加一个 `color` 布尔属性：

- `--color` 时为 `true`
- `--no-color` 时为 `false`

自定义 formatter 可以用这个值决定是否输出彩色样式（基于“终端是否支持颜色”的假设）。

### 更新 `eslint:recommended`

`eslint:recommended` 更新并纳入了一些官方认为重要的新规则（详情见原文）。

### 移除已弃用的 rule `context` 成员

以下 rule `context` 成员不再可用：

- `context.getCwd()`：请改用 `context.cwd`
- `context.getFilename()`：请改用 `context.filename`
- `context.getPhysicalFilename()`：请改用 `context.physicalFilename`
- `context.getSourceCode()`：请改用 `context.sourceCode`
- `context.parserOptions`：请改用 `context.languageOptions` 或 `context.languageOptions.parserOptions`
- `context.parserPath`：无替代

### 移除已弃用的 `SourceCode` 方法

以下 `SourceCode` 方法不再可用（自定义规则作者需留意）：

- `getTokenOrCommentBefore()`：改用 `getTokenBefore({ includeComments: true })`
- `getTokenOrCommentAfter()`：改用 `getTokenAfter({ includeComments: true })`
- `isSpaceBetweenTokens()`：改用 `isSpaceBetween()`
- `getJSDocComment()`：无替代

### `Program` AST 节点的 range 覆盖整个源文本

从 ESLint v10.0.0 起，`Program` AST 节点的 range 会覆盖整个源文本。此前 range 不包含开头/结尾的注释与空白。

- 详情：https://github.com/eslint/js/issues/648

### 不再支持 Jiti < v2.2.0

ESLint v10.0.0 在加载 TypeScript 配置文件时，会因为已知兼容性问题而停止支持 `jiti` 2.2.0 之前的版本。

- 详情：https://github.com/eslint/eslint/issues/19765

## 变更清单（原文链接）

完整的变更清单（Breaking changes / Features / Fixes 等）条目较长，建议直接参考官方原文与迁移指南：

- 发布说明：https://eslint.org/blog/2026/02/eslint-v10.0.0-released/
- 迁移指南：https://eslint.org/docs/latest/use/migrate-to-10.0.0
- 配置查找 RFC：https://github.com/eslint/rfcs/tree/main/designs/2024-config-lookup-from-file

