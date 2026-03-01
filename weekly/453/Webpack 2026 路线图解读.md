> 原文：[Webpack: Roadmap 2026](https://webpack.js.org/blog/2026-04-02-roadmap-2026/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Webpack 2026 路线图

Webpack TSC 在文中表示：尽管新工具不断出现，Webpack 依然会继续作为稳定、可靠的构建工具持续演进。2026 年的重点不仅是维护现有能力，也包括为 Webpack 6 与多运行时未来做准备。

## 2026 年重点方向

### 1) `webpack#14893`：CSS 能力内建，减少插件依赖

目前已有 `experiments.css`，可以在不依赖 `mini-css-extract-plugin` 这类插件的情况下启用原生 CSS 支持。

团队表示该能力已接近完成，计划先以实验特性继续收集反馈；到 Webpack 6 目标是转为非实验状态，相关插件在此任务上将不再是必需。

### 2) `webpack#6525`：`universal` target（跨运行时构建目标）

目标是新增 `universal` target，让产物可运行于 Node、Web、Bun、Deno 等不同运行时。

即使项目里有 CommonJS，Webpack 也会进行包装，最终输出尽量走纯 ESM，以实现运行时无关。

这项工作已有明显进展，但仍需继续补齐：ESM 输出细节、CommonJS wrapper 完整性、缺失测试等。

### 3) TypeScript 直构建（无 loader）

Webpack 5.105 已支持读取 TS 配置路径（减少 `tsconfig-paths-webpack-plugin` 依赖）。接下来要进一步推进：减少对 `ts-loader` 等 loader 的依赖，直接在 Webpack 内完成 TS 转译流程。

### 4) `webpack#536`：HTML 作为入口点的内建支持

当前把 HTML 作为入口通常要依赖 `html-webpack-plugin`。路线图希望把这一常见能力并入核心（初期以实验形态），类似 CSS 的推进方式，长期目标是在 Webpack 6 里减少这类基础插件依赖。

### 5) Webpack Everywhere（Node / Deno / Bun / Web）

目标是让 Webpack 本身在不同运行时中都能平滑运行，并逐步降低对 Node 内部能力与 `Buffer` 的耦合。

文中还提到现实进展差异：例如 Deno/Bun 方向当前仍需完善测试与资产支持；同时计划增加站点 playground，用于验证 Webpack 在不同环境中的运行情况。

### 6) 评估 Lazy Barrel Optimization

团队在评估类似 Rspack 的 lazy barrel 思路：对于 side-effect-free 的 barrel 文件，跳过未使用重导出模块的构建，从而降低大型工程里的无效构建成本。

这属于“先评估再落地”的方向，意在吸收生态中已验证有效的优化策略。

### 7) 统一资源压缩能力（minimizer）

当前压缩通常依赖多插件协作（JS/CSS/HTML/JSON 各自一个）。路线图提出整合为更统一的 minimizer 方案，减少配置重复与维护成本。

### 8) 优化开发体验（Dev Experience）

#### Dev Tooling

包括：

- 合并 `webpack-dev-middleware` 与 `webpack-hot-middleware`
- 从 dev-server 中抽离 overlay 并复用
- 统一 overlay + WebSocket/EventSource 逻辑
- 为 dev-server 增加插件支持

核心目标是降低维护复杂度，同时保留可扩展性。

#### CLI 改进

路线图提到会继续整理 CLI 包结构、重构 help/subcommand 逻辑，并提升易用性与可维护性（参考 `webpack-cli#4619`）。

### 9) 文档准确性与一致性

目标是从类型与 schema 自动生成 API / 配置文档，确保网站文档与真实行为同步（含新选项、废弃项、类型变化），缓解历史上的文档不一致问题。

### 10) 社区与生态投入

路线图把社区建设单列为重点，包括：

- 持续内容输出（文章、演讲等）
- 视觉与品牌资产建设（项目视觉物料、周边等）
- GSoC 指导与维护者培养
- 争取更多捐赠与赞助，增强可持续维护能力

### 11) 多线程 API（探索中）

受 `thread-loader` 启发，团队在探索更正式的多线程 API。该项仍处于设计/讨论阶段，目标是在保持易用与可维护的前提下提升大项目并行构建效率。

### 12) 为 Webpack 6 做准备

文章把很多方向都归拢到 Webpack 6 准备工作中，包括：

- Core 与 Loader 改进（如把 `loader-runner` 进一步并入核心）
- 提高测试覆盖和类型覆盖，减少 `any` / `unknown` 滥用
- 增加 benchmark，并纳入 CI 做跨版本性能对比

## 结语

官方在文末强调：2026 的工作重点之一是提升项目可持续性（包括资金层面），并欢迎社区通过 Discord、邮件或联系 TSC 参与贡献。

整体信号是：Webpack 在继续维护存量生态的同时，正在系统性为“跨运行时 + 更低配置成本 + Webpack 6”铺路。

