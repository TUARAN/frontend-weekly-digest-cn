原文：Tales from the Void: May 2026 Recap
链接：https://voidzero.dev/posts/whats-new-may-2026
翻译：TUARAN

# VoidZero 的故事：2026 年 5 月回顾

## VoidZero 正式加入 Cloudflare

上周，VoidZero 正式成为 Cloudflare 的一部分。

**不会改变的事：**

- Vite、Vitest、Rolldown、Oxc 以及 Vite+ 继续保持 **开源、中立、MIT 协议**。
- Evan 以及 VoidZero 团队的其他成员继续领导这些开源项目。

VoidZero 成立于 2023 年，目标是提升 JavaScript 开发者的生产力。从那时起我们构建了 Vite+、Rolldown、Oxlint、Oxfmt，同时持续改进 Vite 和 Vitest。

VoidZero 早在 Vite Environment API 以及 Cloudflare 的 Vite 插件阶段就开始了与 Cloudflare 的合作。我们的部署平台 [Void](https://void.cloud/) 就构建在 Cloudflare 之上。走到一起之后，我们可以继续专注于最擅长的事，同时让 Cloudflare 成为部署 Vite 应用更好的平台。

我们相信这次收购无论从战略还是文化上都非常契合 VoidZero，并对这个新篇章充满期待。

更多内容请阅读 [**我们的完整公告**](/posts/voidzero-cloudflare) 和 [**Cloudflare 的公告**](https://blog.cloudflare.com/voidzero-joins-cloudflare/)。

---

## 项目更新

### Vite+

- Vite+ [现已支持](https://github.com/voidzero-dev/vite-plus/pull/1715) 通过 `vp pm staged` 进行分阶段发布。
- 如果原生包是针对与你当前所用 Node 版本不同的版本构建的，Vite+ [会主动提示](https://github.com/voidzero-dev/vite-plus/pull/1666) 你，避免你不小心运行了过期的包。
- 下一版 VS Code [将内置](https://github.com/microsoft/vscode/pull/320183) `vp` 作为 `npm.scriptRunner` 设置的可选项，让你在 VS Code 里跑脚本和任务时更方便地使用 Vite+。
- Vite+ [新增一条内置的 Oxlint 规则](https://github.com/voidzero-dev/vite-plus/pull/1408)，用于拦截那些仍然指向旧版 `vite` 和 `vitest`（而非 Vite+）的 import，避免一些隐蔽的 bug。

### Vite

- Vite 团队发布了 [多条安全公告](https://github.com/vitejs/vite/security/advisories/) 并推送了补丁。请尽快升级到最新的 Vite 8 或 Vite+ 版本以获取修复。

### Vitest

- Vitest 正在 [规划成为引擎无关的测试框架](https://github.com/vitest-dev/vitest/discussions/10271)。欢迎在讨论中发表你的看法。
- Vitest 5 将带来 [一套重写的基准测试 API](https://github.com/vitest-dev/vitest/pull/10113)，它现在作为测试本身的一部分出现，而不是一项独立的"测试"，从而让基准测试更灵活、集成度更高。

### Rolldown

Rolldown 是驱动 Vite 8 的 Rust 打包器，已达到 v1.0 里程碑。如果你已经在使用 Vite 8 或最新的 Rolldown RC，升级过程无需任何代码或配置改动。

Rolldown 1.0 意味着：

- **API 稳定性**：插件 API、配置项、类型都将受 semver 约束。
- **构建输出稳定**：内部实现（如分块、dead code elimination）仍会在 minor 版本中持续优化，但 minor 版本之间的构建输出形态不会再变化。
- **Rollup 插件兼容**：作为 drop-in 替代品，现有生态可以直接迁移。

构建速度比 Rollup **快 10-30 倍**，与 esbuild 持平。Ramp、Beehiiv、Mercedes-Benz.io 等采用者反馈 **构建时间最高缩短 64%**。

1.0 里程碑同时也为那些"禁止引入未达 1.0 依赖"的团队扫清了障碍，让插件作者拥有了一个稳定且值得投入的目标。

[**阅读 Rolldown 1.0 完整公告**](/posts/announcing-rolldown-1-0) 了解详情。

### Oxc

- Oxlint 新增 [agent 输出模式](https://github.com/oxc-project/oxc/pull/21955)，单行诊断、不输出汇总信息，减少 LLM 防护场景下的 token 消耗。
- Oxfmt 通过 [内部性能优化](https://github.com/oxc-project/oxc/pull/22065) 速度提升达 25%。
- Oxfmt [支持格式化 Svelte 文件](https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#svelte)。
- Oxc 团队正在试验 [集成基于 Rust 的 React Compiler 预览版](https://github.com/oxc-project/oxc/pull/22942)。

---

## 即将到来的活动

想听 VoidZero 团队成员的演讲，请关注以下活动：

- Alexander Lichter 将于 6 月 11 日在阿姆斯特丹的 [JS Nation 2026](https://jsnation.com/2026/) 上演讲"Rust 是如何重塑 Vite 的"。
- Alexander Lichter 还将参加 6 月 16 日在德国曼海姆举办的 [enterJS 2026](https://enterjs.de/veranstaltung-86570-0-vue-im-jahr-2026-zukunftssicher-oder-sackgasse.html)。

---

## 社区动态

- Alexander Lichter 在 Laravel Live Japan 上分享了 Vite+——统一 JavaScript 工具链，并由 Sen Corporation 整理为 [博客回顾](https://productblog.sencorp.co.jp/entry/2026/06/04/100000)（日文）。
- Marvin Hagemeister 撰文介绍 [Oxlint 与 Oxfmt 50% 提速](https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-13) 的实践，针对那些**目录极多**的项目。
- Brandon Roberts 分享了一篇 [将 Angular 应用部署到 Void](https://dev.to/brandontroberts/deploying-angular-applications-to-cloudflare-with-void-94f) 的指南，详细介绍项目设置、`void.json` 配置和一键部署到边缘的过程。
- Oxc 团队成员 Cam McHenry 构建了 [oxc_checker](https://github.com/camchenry/oxc_checker)，这是一个高度实验性的类型检查器，目标是为 Oxc 系工具补充类型解析与推断能力。
- Evil Martians 推荐 Oxlint 和 Oxfmt 作为"只对变更文件做 lint"的快速工具，并呼吁开发者 [别再往 AGENTS.md 里写规则了](https://evilmartians.com/chronicles/stop-writing-rules-in-agents-md-use-agent-hooks-and-nano-staged-instead)，转而依赖 agent 与 git hooks。
- Directus 的 CTO Rijk van Zanten 在关于 [Rust 启发的 TypeScript](https://www.youtube.com/watch?v=WDCVGaF4IGo) 的演讲中指出，Oxc 和 Rolldown 等 Rust 工具已经在塑造整个生态。
- Puru 发布了 [bundle-roast](https://bundle-roast.puruvj.dev/)，一个构建在 Rolldown 之上的包分析器，输出真实 Brotli 体积与完整传递依赖树（还附赠吐槽），帮你保持 bundle 精简。
- Deep Sarkar 在 LinkedIn 上发布了他 [对 Vite+ 的第一次贡献](https://www.linkedin.com/posts/deeprr_opensource-github-vite-ugcPost-7460595064902279168-92ZQ)。
- Syntax 团队在最新一期 Potluck 中推荐 [将 `vp check` 作为 LLM 防护栏](https://www.youtube.com/watch?v=srh13T0NvGA&start=2491)。
- Chromatic 放出了 [Vitest 视觉测试的预演](https://www.chromatic.com/blog/vitest-visual-testing-sneak-peek/)，将基于快照的视觉回归测试带入 Vitest 的 Browser Mode。
