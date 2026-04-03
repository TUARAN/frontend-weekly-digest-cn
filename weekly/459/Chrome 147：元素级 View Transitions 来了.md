原文：Chrome 147 enables concurrent and nested view transitions with element-scoped view transitions  
链接：https://developer.chrome.com/blog/element-scoped-view-transitions  
创作：TUARAN

# Chrome 147：元素级 View Transitions 来了

View Transitions 真正开始变得“能打”的一个标志，就是它不再只服务整页切换，而是开始深入到组件和局部区域。Chrome 147 推出的 element-scoped view transitions，核心价值就在这里。它让我们可以把转场能力更精细地绑定到具体元素，而不是总得把整个页面都卷进来。

这件事对复杂前端界面尤其重要。现实里的产品并不总是“整页跳转”那么简单，更多时候是卡片展开、局部重排、嵌套容器切换、面板之间的连续过渡。过去这些场景往往要靠框架状态管理、动画库和一堆手写协调逻辑才能勉强做顺；现在平台开始给出更像样的原生答案了。

更关键的是，这不是单纯“动画更炫”这么简单。元素级转场本质上是在改善界面状态变化的组织方式，让交互从突兀切换变成可理解的连续过程。前端体验成熟到一定阶段，差异往往就藏在这种过渡是否自然、是否有结构感上。

