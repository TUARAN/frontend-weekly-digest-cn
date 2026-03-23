原文：When Deno or Bun is a Better Solution than Node.js  
链接：https://frontendmasters.com/blog/when-deno-or-bun-is-a-better-solution-than-node-js/  
创作：TUARAN

# 什么时候 Deno 或 Bun 比 Node.js 更合适

Node.js 长期以来几乎是服务端 JavaScript 的默认答案，这种地位并不是轻易会被动摇的。但“默认答案”并不代表“所有场景最佳答案”。随着 Deno 和 Bun 越来越成熟，这个问题开始变得更值得认真讨论：到底什么时候它们不只是“新选择”，而是真正更合适的选择？

这类文章的价值，不在于替代 Node 造势，而在于把技术选择重新拉回场景。因为运行时之争最容易变成立场辩论，可真正重要的永远是约束：启动速度、部署模型、内置能力、安全默认值、工具链整合、兼容性要求、团队熟悉度。不同项目的最优解，根本不一定相同。

对很多团队来说，Node 仍然会是最稳的路线；但也会有一些项目，在边缘脚本、工具型服务、轻量 API、实验产品或特定部署模型上，更适合 Deno 或 Bun。真正成熟的工程判断，不是选“最潮”的，而是选“最贴场景”的。

所以这篇文章值得读，是因为它试图把运行时选择从信仰题变回决策题。
