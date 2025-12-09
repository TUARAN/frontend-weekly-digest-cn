# Vite 8 Beta：由 Rolldown 驱动的 Vite
2025年12月3日

![Vite 8 Beta Announcement Cover Image](https://raw.githubusercontent.com/TUARAN/frontend-weekly-digest-cn/main/weekly/443/img/og-image-announcing-vite8-beta.webp)

**简述**：由 Rolldown 驱动的 Vite 8 首个 Beta 版本现已发布。Vite 8 带来了显著更快的生产构建速度，并开启了未来改进的可能性。你可以通过将 `vite` 升级到 `8.0.0-beta.0` 版本并阅读迁移指南来尝试新版本。

我们很高兴发布 Vite 8 的首个 Beta 版本。此版本统一了底层工具链，带来了更好的一致性行为，以及显著的构建性能提升。Vite 现在使用 Rolldown 作为其打包器，取代了之前 esbuild 和 Rollup 的组合。

## 面向 Web 的新打包器
Vite 之前依赖两个打包器来满足开发和生产构建的不同需求：

*   **esbuild** 用于开发期间的快速编译
*   **Rollup** 用于生产构建的打包、分块和优化

这种方法让 Vite 专注于开发者体验和编排，而不是重新发明解析和打包。然而，维护两个独立的打包管道引入了不一致性：独立的转换管道、不同的插件系统，以及为了保持开发和生产之间打包行为一致而不断增加的胶水代码。

为了解决这个问题，VoidZero 团队构建了 **Rolldown**，这是下一代打包器，目标是在 Vite 中使用。它的设计宗旨是：

*   **性能**：Rolldown 用 Rust 编写，以原生速度运行。它达到了 esbuild 的性能水平，比 Rollup 快 10–30 倍。
*   **兼容性**：Rolldown 支持与 Rollup 和 Vite 相同的插件 API。大多数 Vite 插件在 Vite 8 中开箱即用。
*   **更多功能**：Rolldown 为 Vite 解锁了更多高级功能，包括全打包模式（full bundle mode）、更灵活的分块控制、模块级持久缓存、模块联邦（Module Federation）等。

## 统一工具链
Vite 更换打包器的影响不仅仅在于性能。打包器利用了解析器、解析器、转换器和压缩器。Rolldown 使用 **Oxc**（另一个由 VoidZero 领导的项目）来实现这些目的。

这使得 Vite 成为由同一团队维护的端到端工具链的入口点：构建工具 (Vite)、打包器 (Rolldown) 和编译器 (Oxc)。

这种对齐确保了整个技术栈的行为一致性，并允许我们在 JavaScript 继续演进时快速采用并与新语言规范保持一致。它还解锁了以前仅靠 Vite 无法实现的广泛改进。例如，我们可以利用 Oxc 的语义分析在 Rolldown 中执行更好的 Tree-shaking。

## Vite 如何迁移到 Rolldown
迁移到由 Rolldown 驱动的 Vite 是一个根本性的变化。因此，我们的团队采取了审慎的步骤来实施它，而不牺牲稳定性或生态系统兼容性。

首先，发布了一个独立的 `rolldown-vite` 包作为技术预览。这使我们能够在不影响 Vite 稳定版本的情况下与早期采用者合作。早期采用者受益于 Rolldown 的性能提升，同时提供了宝贵的反馈。亮点包括：

*   Linear 的生产构建时间从 46 秒减少到 6 秒
*   Ramp 的构建时间减少了 57%
*   Mercedes-Benz.io 的构建时间减少了高达 38%
*   Beehiiv 的构建时间减少了 64%

接下来，我们建立了一个测试套件，用于针对 `rolldown-vite` 验证关键的 Vite 插件。这个 CI 任务帮助我们尽早发现回归和兼容性问题，特别是对于 SvelteKit、react-router 和 Storybook 等框架和元框架。

最后，我们构建了一个兼容层，以帮助开发者从 Rollup 和 esbuild 选项迁移到相应的 Rolldown 选项。

结果是，每个人都有了一条通往 Vite 8 的平滑迁移路径。

## 迁移到 Vite 8 Beta
由于 Vite 8 触及核心构建行为，我们专注于保持配置 API 和插件钩子不变。我们创建了一个迁移指南来帮助你升级。

有两种可用的升级路径：

1.  **直接升级**：在 `package.json` 中更新 `vite` 并运行通常的开发和构建命令。
2.  **逐步迁移**：从 Vite 7 迁移到 `rolldown-vite` 包，然后再迁移到 Vite 8。这允许你在不更改 Vite 其他部分的情况下，识别仅与 Rolldown 相关的兼容性问题或故障。（推荐用于大型或复杂项目）

**重要提示**

如果你依赖特定的 Rollup 或 esbuild 选项，你可能需要对 Vite 配置进行一些调整。请参阅迁移指南以获取详细说明和示例。与所有非稳定主要版本一样，建议在升级后进行彻底测试，以确保一切按预期工作。请务必报告任何问题。

如果你使用的框架或工具将 Vite 作为依赖项（例如 Astro、Nuxt 或 Vitest），你必须在 `package.json` 中覆盖 `vite` 依赖项，根据你的包管理器，操作略有不同：

**npm / Yarn / pnpm / Bun**

```json
{
  "overrides": {
    "vite": "8.0.0-beta.0"
  }
}
```

添加这些覆盖后，重新安装依赖项并像往常一样启动开发服务器或构建项目。

## Vite 8 的其他功能
除了搭载 Rolldown 之外，Vite 8 还带来了：

*   **内置 tsconfig paths 支持**：开发者可以通过将 `resolve.tsconfigPaths` 设置为 `true` 来启用它。此功能有较小的性能开销，默认不启用。
*   **emitDecoratorMetadata 支持**：Vite 8 现在内置了对 TypeScript `emitDecoratorMetadata` 选项的自动支持。有关更多详细信息，请参阅功能页面。

## 展望未来
速度一直是 Vite 的标志性特征。与 Rolldown 以及 Oxc 的集成意味着 JavaScript 开发者将受益于 Rust 的速度。升级到 Vite 8 应该仅仅因为使用 Rust 就能带来性能提升。

我们也为即将发布 Vite 的**全打包模式（Full Bundle Mode）**感到兴奋，这将极大地提高大型项目的 Vite 开发服务器速度。初步结果显示，开发服务器启动速度提高了 3 倍，完整重新加载速度提高了 40%，网络请求减少了 10 倍。

Vite 的另一个标志性特征是插件生态系统。我们希望 JavaScript 开发者继续使用他们熟悉的 JavaScript 语言扩展和定制 Vite，同时受益于 Rust 的性能提升。我们的团队正在与 VoidZero 团队合作，加速这些基于 Rust 的系统中的 JavaScript 插件使用。

目前处于实验阶段的即将到来的优化：

*   **原始 AST 传输**：允许 JavaScript 插件以最小的开销访问 Rust 生成的 AST。
*   **原生 MagicString 转换**：简单的自定义转换，逻辑在 JavaScript 中，但计算在 Rust 中。

## 联系我们
如果你尝试了 Vite 8 beta，我们很乐意听到你的反馈！请报告任何问题或分享你的经验：

*   **Discord**：加入我们的社区服务器进行实时讨论
*   **GitHub**：在 GitHub discussions 上分享反馈
*   **Issues**：在 `rolldown-vite` 仓库报告错误和回归问题
*   **Wins**：在 `rolldown-vite-perf-wins` 仓库分享你改进的构建时间

我们感谢所有的报告和复现案例。它们有助于指导我们发布稳定的 8.0.0 版本。
