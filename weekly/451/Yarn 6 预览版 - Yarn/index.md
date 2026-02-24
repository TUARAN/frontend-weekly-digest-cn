# Yarn 6 预览版 | Yarn

> 原文：[Yarn 6 Preview | Yarn](https://yarn6.netlify.app/blog/2026-01-28-yarn-6-preview/)
>
> 翻译：[嘿嘿](https://blog.heyfe.org/blog)

很高兴向大家宣布 Yarn 的下一次进化。我们将重新定义 JavaScript 包管理器的“顶尖水平（State of the art）”。

一直以来，Yarn 始终坚持三大核心支柱：正确性（Correctness）、开发者体验（DX）和性能。想要同时在这三方面做到极致确实是个挑战，但我们认为，作为项目最根基的工具，本就不该有任何妥协。虽然我们一直为 Yarn 的正确性、稳定性和开发者体验感到自豪，但近年来我们也意识到，Yarn 的性能已经触及了天花板——特别是在那些拥有数千个工作区（Workspaces）的超大规模 Monorepo 中。

在 Yarn 第一个公开发布版本问世近十年后的今天，正是揭晓我们计划的最佳时机：**我们将用 Rust 重构 Yarn。** 这个项目其实在一年多前就已经启动了，现在已经准备好向更多人展示。虽然目前还处于预览阶段，但我们预计在接下来的 6 到 8 个月内完成这次转型。这次进化将带来大幅提升的响应速度和更低的内存占用，并能实现一些以前因效率问题而无法落地的新功能。

## 到底快了多少？

虽然性能是这次重写的核心驱动力，但我们初期的重点在于严格的兼容性。即便在这种限制下，结果依然令人振奋。目前还有很多容易优化的点（Low-hanging fruits）待挖掘，我们非常期待现在能与 JavaScript + Rust 工具链社区公开合作，进一步拉开差距。

| 测试场景                               | 重写前 | 重写后     | Pnpm  |
| ------------------------------------ | ------ | --------- | ----- |
| Next.js - 依赖虽少但很“重”             |        |           |       |
| 冷缓存 (Cold cache)                   | 4.1s   | 2.5s      | 3.0s  |
| 热缓存 (Warm cache)                   | 577ms  | **184ms** | 686ms |
| Gatsby - 大量细碎依赖                 |        |           |       |
| 冷缓存 (Cold cache)                   | 19.8s  | 11.7s     | 13.1s |
| 热缓存 (Warm cache)                   | 1.7s   | **0.3s**  | 1.9s  |

_（更多基准测试结果可以在 [这里](https://p.datadoghq.eu/sb/d2wdprp9uki7gfks-badb2c0f08402af744326888f9535a82) 查看；我们还在针对超大型仓库（Megarepos）建立新的基准测试，不过目前的测试量级其他包管理器还跑不动。）_

除了原始速度的提升，这些数据还开启了新的可能性。有些想法还在构思阶段，但有些已经落地了——比如我马上要介绍的“延迟安装（Lazy Install）”功能。

## 新特性

虽然我们的首要任务是完成重写，但有些功能太过基础，我们觉得必须在 MVP（最小可行性产品）阶段就实现它们，因为它们会直接影响架构设计。

### Yarn Switch

如果你熟悉 Node.js 生态，可能听说过 Corepack。Corepack 是一个实验性的包管理器版本管理工具，由 Node.js 核心贡献者共同开发，自从它内置在 Node.js 官方发行版后，就一直是推荐的 Yarn 使用方式。虽然现在的包管理器都会锁定依赖版本，但它们并不总是能锁定“包管理器自己”的版本。Corepack 正是为此而生，但随着最近 Node.js 决定停止分发 Corepack，我们不得不另寻出路。

因此，我们开发了自己的替代方案：**Yarn Switch**。

Yarn Switch 同样是用 Rust 编写的。当你按照我们最新的[安装指南](https://yarn6.netlify.app/getting-started)操作时，安装到你机器上的二进制文件就是它。执行时，它会读取你项目中的 `packageManager` 字段，然后透明地下载、缓存并将命令转发给对应的 Yarn 版本。你可以把它看作是 Yarn 专属的 `rustup` 或 `nvm`。

只要 Node.js 24.x 还在分发 Corepack，我们就会继续支持在主流平台（即 Linux、macOS 和 Windows 的 x86-64 及 ARM 架构）上通过 Corepack 使用 Yarn 6.x。不过，我们深信 Yarn Switch 会提供更优秀的开发者体验。

关于 Yarn Switch 的更多细节，请查看 [Yarn Switch 文档](https://yarn6.netlify.app/concepts/switch)。

### 延迟安装 (Lazy Installs)

Yarn 长期以来一直支持“零安装（Zero Installs）”——即把安装产物直接提交到仓库，这样在切换分支时就不必运行安装命令。这招很好用，但在仓库体积上会有负担，尤其是在超大规模的 Monorepo 中。

从 Yarn 6.x 开始，我们将引入一个新的默认模式：**延迟安装 (Lazy Installs)**。

在这个模式下，运行大多数 Yarn 命令（包括 `yarn run`）时，如果检测到本地产物与 `package.json` 不同步，Yarn 就会悄无声息地自动执行安装。得益于原生的 Rust 实现，这种检查在正常流程下的开销几乎可以忽略不计。我们认为这既能保留“零安装”的大部分好处，又不会导致代码仓库过度臃肿。

## 版本路线图

目前的稳定版本是 Yarn 4.12。我们计划让 JS 代码库继续更新到 Yarn 5.x 系列。这个版本将在几个月后发布，作为一个过渡跳板，它会包含一些在 Rust 版 Yarn 6.x 中引入的弃用项。

第一个 Yarn 6.x 稳定版将在 Rust 实现达到与当前版本足够的兼容性后发布。我们预计这至少要等到 **2026 年第三季度**。

一旦 6.x 稳定，Yarn 5.x 将进入 LTS（长期支持）状态：代码库将接受约 30 个月的关键 Bug 修复，而主要的开发工作将全面转向 Rust 代码库。

向后兼容性是我们最关心的。我们正在使用完全相同的测试套件来验证 Yarn 6.x 与前代版本的一致性。目前 Yarn 6.x 的实验版本已经成功在 **Datadog** 的生产环境中部署，且几乎没有遇到破坏性变更。

## 下一步计划

虽然这个预览版是一个重要的里程碑，但距离 Yarn 6.x 正式发布还有数月之遥。还有一些核心功能需要攻克：

* Windows 平台支持
* 交互式命令
* 与需要手动解析 lockfile 的第三方工具进行协作
* 解决剩下的测试失败项并补全缺失的命令

工作正在紧锣密鼓地进行中，我们非常渴望能与社区一起开启这个新篇章。

如果你想精进 Rust 技能，或者想深入研究 JavaScript 工具链，现在就是参与进来的最佳时机。我们正在积极寻找贡献者来一起解决剩下的挑战——你可以查看我们的 [Issues](https://github.com/yarnpkg/zpm/issues) 或在 [Discord 服务器](https://discord.com/invite/yarnpkg) 上打个招呼。

最后，如果你的公司依赖 Yarn 并希望支持它的可持续发展，请考虑通过 [GitHub Sponsors](http://github.com/sponsors/yarnpkg) 或 [OpenCollective](https://opencollective.com/yarnpkg) 赞助我们。