原文：Guide to Creating an Angular-based Micro-frontend Application Using Native Federation  
链接：https://www.telerik.com/blogs/guide-creating-angular-based-micro-frontend-application-native-federation  
创作：TUARAN

# 用 Native Federation 构建 Angular 微前端

微前端这些年经历过很明显的起伏：热的时候像是所有大型前端团队的必答题，冷下来后又有不少人重新质疑它到底是不是复杂度陷阱。Native Federation 之所以值得重新关注，是因为它在尝试回答一个更具体的问题：如果不再完全依赖打包器层面的联邦机制，能不能用更原生的方式组织前端模块协作？

放到 Angular 语境里，这个问题尤其有意思。Angular 本身就更强调工程结构、模块化和大型应用治理，因此微前端的讨论在这里从来不只是技术秀，而是实际组织问题：团队如何拆分、如何部署、如何共享依赖、如何减少相互牵制。

Native Federation 的价值，就在于它试图把这套能力建立在更贴近 Web 平台的基础上，而不是只建立在某个工具链魔法之上。这会让架构讨论重新回到一个更长期的问题：微前端究竟是工具方案，还是平台组合方式。

所以这篇文章非常适合那些已经从“微前端神话”里走出来、开始认真思考成本和边界的团队。
