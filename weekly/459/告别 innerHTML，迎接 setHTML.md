原文：Goodbye innerHTML, Hello setHTML  
链接：https://frontendmasters.com/blog/goodbye-innerhtml-hello-sethtml/  
创作：TUARAN

# 告别 innerHTML，迎接 setHTML

`innerHTML` 能活这么多年，说明它足够方便；但它也一直代表着 Web 平台里一个非常典型的历史包袱：最顺手的 API，未必是最安全的 API。`setHTML()` 之所以值得关注，并不是因为它会立刻替代所有旧写法，而是因为平台终于开始认真提供一个更现代的默认选项。

安全这件事如果总靠“开发者自己小心”，最后通常都会失败。真正有效的路径，是让更安全的做法也足够易用。只有这样，团队才有可能把安全基线内化到日常开发，而不是停留在文档规范里。

所以 `setHTML()` 的意义不只是一个新方法名，而是平台态度的变化。它说明浏览器开始更积极地把“默认正确”这件事做进 API 设计本身。

