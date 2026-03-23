原文：How We Used Next.js to Improve Core Web Vitals for SaaS  
链接：https://www.surajon.dev/nextjs-to-improve-core-web-vitals-for-saas  
创作：TUARAN

# 我们如何用 Next.js 改善 SaaS 的 Core Web Vitals

SaaS 产品的性能优化和内容站不太一样。它往往有更复杂的权限系统、更重的交互、更长的会话时间，还有大量“用户已经登录所以什么都能慢一点”的错误假设。也正因为这样，当有人认真复盘如何用 Next.js 去改善 SaaS 的 Core Web Vitals，这类文章特别值得看。

最有价值的地方通常不是“用了某个神奇技巧”，而是它会把优化重新拉回业务现实：首屏到底有哪些阻塞、哪些资源是必须的、哪些组件其实不该第一时间 hydration、哪些数据请求可以改走更合适的渲染路径。Next.js 在这种语境里的作用，也不是万能框架，而是一组帮助你重排关键路径的工具。

我很喜欢这类文章，因为它比单纯讨论 Lighthouse 更有现实感。SaaS 的性能问题常常不是某一个指标太差，而是太多默认工程决策堆在一起，最后让用户在日常操作里不断感受到摩擦。

真正好的 Core Web Vitals 优化，从来不是“为分数服务”，而是为持续使用这个产品的人服务。
