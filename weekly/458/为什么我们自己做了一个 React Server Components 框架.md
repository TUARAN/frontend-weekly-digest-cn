原文：Less code, more power: Why we rolled our own React Server Components framework  
链接：https://www.aha.io/engineering/articles/why-we-rolled-our-own-rsc-framework  
创作：TUARAN

# 为什么我们自己做了一个 React Server Components 框架

自己做框架这种决定，听起来总是很极端。尤其在 React 生态已经有这么多现成方案的前提下，团队为什么还会选择自己实现一套 RSC 框架？这类文章真正值得看的，不是“他们是不是太大胆”，而是这种决定通常暴露了一个事实：现成方案并不总能匹配特定组织的边界和复杂度需求。

React Server Components 本身就是一个特别容易引发工程重估的话题。它既带来更强的服务端协作能力，也重新分配了客户端和服务端的职责。对某些团队来说，现有框架给出的默认组织方式可能刚好不合适，于是“自己做一层”并不是为了炫技，而是为了把控制权重新拿回关键边界。

这也是这篇文章的价值。它让我们看到，框架选择很多时候不是纯技术优劣，而是团队如何权衡复杂度、控制权、可维护性和演进自由度。不是每个团队都该自己造轮子，但当有人真的这么做时，通常最值得看的正是他们为什么觉得必须这么做。

工程世界里最有意思的故事，往往都藏在这些“为什么默认答案不够用了”的瞬间。
