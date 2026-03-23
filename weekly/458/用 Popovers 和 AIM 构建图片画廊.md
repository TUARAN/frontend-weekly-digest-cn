原文：Image Gallery with Popovers and AIM (Anchor-Interpolated Morph)  
链接：https://frontendmasters.com/blog/image-gallery-with-popovers-and-aim-anchor-interpolated-morph/  
创作：TUARAN

# 用 Popovers 和 AIM 构建图片画廊

现代 Web 最有趣的变化之一，是很多过去只能靠重型动效库或复杂 DOM 技巧实现的体验，现在开始能用更原生的组合方式做出来。Popovers 加上 AIM（Anchor-Interpolated Morph）就是一个很好的例子：浮层、锚点关系和过渡形变被拼在一起，画廊体验会突然从“切换图片”变成“图像在空间里自然延展”。

这类文章特别适合帮助我们理解一个趋势：平台能力本身变强之后，前端的工作不再只是“实现功能”，而越来越像“组合正确的原生语义和过渡”。一旦组合得好，体验会显得非常轻盈，因为你感觉不到中间有一大堆手工桥接逻辑。

图片画廊这个场景也很适合做试验。它足够具体，又天然依赖视觉流动性，因此特别能放大新能力组合的价值。你会直观感觉到，现代 CSS 和平台 API 正在慢慢接住以前那部分“只能靠技巧”的界面表达。

对前端来说，这不是一个小技巧，而是未来很多交互方式可能演化的缩影。
