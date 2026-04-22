原文：You can’t cancel a JavaScript promise (except sometimes you can)  
链接：https://www.inngest.com/blog/hanging-promises-for-control-flow  
创作：TUARAN

# 你不能取消 JavaScript Promise，但有时又可以

Promise 不能被真正取消，这几乎是 JavaScript 开发者的常识；但一到真实工程里，你又总会遇到“我就是想终止这次异步流程”的需求。文章好看的地方，就在于它把这个矛盾讲清楚了。

比起空谈语言缺陷，它更关心控制流层面到底能怎样安全绕过去，这对写异步复杂逻辑的人很有帮助。
