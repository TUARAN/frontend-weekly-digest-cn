原文：A TypeScript Class-Based WebSocket Library for React  
链接：https://techhub.iodigital.com/articles/a-typescript-class-based-websocket-library-for-react/websockets  
创作：TUARAN

# 一个面向 React 的 TypeScript 类式 WebSocket 库

React 世界里，函数式和 Hook 已经几乎成为默认表达。但这并不意味着所有问题都必须用完全一样的方式建模。WebSocket 就是一个很好的例子：它本身天然带着连接生命周期、状态变迁、重连机制和事件流，这些东西有时用类式封装反而更直观。

这篇文章最有趣的地方，不在于“它居然用了 class”，而在于它重新提醒我们：React 负责的是 UI 组织，不一定要接管系统里每一种资源模型。某些底层连接对象、协议层和长生命周期服务，完全可以用更传统但更清晰的方式实现，再以合适接口暴露给 React。

对 TypeScript 项目来说，这种思路尤其有价值。类并不总是更好，但在状态明确、职责单一、生命周期清晰的资源对象上，它有时会比一堆 Hook 更容易维护。关键从来不是写法是否“新派”，而是模型是否贴合问题本身。

这篇文章值得读的地方，就在于它打破了一点前端惯性：不是所有事都该先从 Hook 开始想。
