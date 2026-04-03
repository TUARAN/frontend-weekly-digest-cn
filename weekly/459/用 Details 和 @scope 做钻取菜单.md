原文：The Drill-Down Menu with Details and @scope  
链接：https://frontendmasters.com/blog/the-drill-down-menu-with-details-and-scope/  
创作：TUARAN

# 用 Details 和 @scope 做钻取菜单

这篇文章最有意思的地方，是它再次说明了一个越来越清晰的事实：很多过去默认要用 JavaScript 组件库实现的交互，现在已经可以更多地回到原生 HTML 和现代 CSS 的组合上。`details` 负责语义和状态，`@scope` 负责样式边界，两者合起来就足够做出层级清晰的钻取菜单。

这不只是“少写 JS”那么简单。真正重要的是，平台原生方案通常更容易获得更稳的可访问性语义、更低的维护成本和更少的状态分叉。前端复杂度很多时候不是因为功能难，而是因为我们总在用过重的方式解决本可更轻的问题。

所以这类案例特别值得收集。它会不断训练我们重新判断：一个交互到底需要多少框架，多少脚本，多少平台能力。

