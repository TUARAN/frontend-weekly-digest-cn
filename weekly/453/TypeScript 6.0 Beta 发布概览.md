> 原文：[Announcing TypeScript 6.0 Beta](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0-beta/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# TypeScript 6.0 Beta 发布说明（结构化整理翻译）

TypeScript 6.0 Beta 的官方文章按“新特性 + 破坏性变更/弃用 + 后续计划”组织。下面按原文章节顺序整理。

## 主要新特性（原文标题）

### Less Context-Sensitivity on `this`-less Functions

对不使用 `this` 的函数，类型推断与上下文敏感性策略做了调整，减少不必要的上下文耦合。

### Subpath Imports Starting with `#/`

支持以 `#/` 开头的子路径导入写法（结合项目配置使用），用于更清晰地表达工程内模块路径。

### Combining `--moduleResolution bundler` with `--module commonjs`

对 `moduleResolution: bundler` 与 `module: commonjs` 的组合做了支持/改进，帮助部分工具链迁移场景。

### The `--stableTypeOrdering` Flag

新增 `--stableTypeOrdering` 开关，用于获得更稳定的类型排序表现（例如输出/比较场景更可预测）。

### `es2025` option for `target` and `lib`

`target` 与 `lib` 新增 `es2025` 选项。

### New Types for `Temporal`

加入对 `Temporal` 相关 API 的类型支持。

### New Types for “upsert” Methods (a.k.a. `getOrInsert`)

为“upsert”一类方法（如 `getOrInsert`）提供了新的类型定义支持。

### `RegExp.escape`

加入 `RegExp.escape` 的类型支持。

### The `dom` lib Now Contains `dom.iterable` and `dom.asynciterable`

`dom` 库现在包含 `dom.iterable` 与 `dom.asynciterable` 相关类型。

## TypeScript 6.0 的 Breaking Changes 与弃用项

原文在这一节下给出了分组。

### Up-Front Adjustments

这一组是建议先处理的迁移调整项。

### Simple Default Changes

默认行为有若干变化，其中明确列出的包括：

- `rootDir` 现在默认是 `.`
- `types` 现在默认是 `[]`

### 弃用（Deprecated）项目

原文列出了以下弃用项：

- `target: es5`
- `--downlevelIteration`
- `--moduleResolution node`（也即 `node10`）
- `module` 中的 `amd` / `umd` / `systemjs`
- `--baseUrl`
- `--moduleResolution classic`
- `--esModuleInterop false` 与 `--allowSyntheticDefaultImports false`
- `--alwaysStrict false`
- `outFile`
- namespace 的旧 `module` 语法
- `imports` 上的 `asserts` 关键字
- `no-default-lib` 指令

另有一个行为变更：当存在 `tsconfig.json` 时，再在命令行直接指定文件会报错。

## Preparing for TypeScript 7.0

官方在 6.0 Beta 中也提前给出了对 7.0 的准备方向，建议团队尽早清理旧配置与弃用能力，降低后续升级成本。

## What’s Next?

下一步是继续收集 Beta 反馈、修复问题并推进正式版发布。

---

## 迁移建议（实践向）

对现有项目，建议按以下顺序推进：

1. 先在非核心仓库试点 6.0 Beta
2. 优先处理默认值变化与已弃用选项
3. 再处理 `module/moduleResolution` 等工具链敏感配置
4. 最后统一清理历史配置，给 7.0 预留空间

