原文：Introducing view-transitions-mock: A non-visual Polyfill for Same-Document View Transitions  
链接：https://www.bram.us/2026/03/11/view-transitions-mock-is-a-non-visual-polyfill-for-same-document-view-transitions/  
创作：TUARAN

# view-transitions-mock：Same-Document View Transitions 的非可视 Polyfill

前端里有一类工具很容易被忽视，因为它们并不直接让界面更炫，而是让工程更可测。`view-transitions-mock` 就属于这种类型。它不是为了在不支持 View Transitions 的浏览器里复刻视觉效果，而是为了在测试和非视觉环境中提供同样的 API 语义。

这件事其实非常实用。很多新 Web API 最大的工程阻力，不是你不会用，而是它一旦进入测试环境、Node 环境或 CI 环境，就开始缺失上下文。于是项目里到处都是条件分支和兼容补丁。一个非可视 polyfill 的价值，就是先把语义层补齐，让测试和应用代码至少能站在同一套接口之上。

这也说明现代前端工程正在进入一个更成熟的阶段：我们不再只关心浏览器里演示是否成功，也开始认真对待“新能力如何进测试体系”这件事。没有这一步，再好的 API 也很难成为真正稳定的生产能力。

所以这篇文章更像是在提醒我们，平台能力落地的最后一公里，常常不是视觉，而是可测试性。
