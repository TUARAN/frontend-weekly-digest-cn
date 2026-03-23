原文：SVG Mask Transitions on Scroll with GSAP and ScrollTrigger  
链接：https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/  
创作：TUARAN

# 用 GSAP 和 ScrollTrigger 实现滚动 SVG Mask 转场

滚动驱动动画之所以总让人着迷，是因为它天然带着一种“内容和行为绑在一起”的叙事感。用户不是点击触发，而是在阅读和滑动过程中逐步看见画面变化。SVG mask 和 GSAP、ScrollTrigger 组合起来，正适合做这种层次很强的视觉过渡。

这类 Demo 真正值得学的地方，不只是某个酷炫效果，而是它展示了一种构图思路：把内容显隐、空间节奏和滚动进度绑定到同一条时间线上。Mask 让过渡更像“被揭开”而不是“被替换”，这会比普通透明度动画更有戏剧感。

对前端来说，这类文章最有价值的部分通常是方法论。你会更清楚什么时候该用 SVG 的形状能力，什么时候该把动画交给 GSAP，什么时候滚动应该成为叙事驱动力而不是单纯输入源。

真正高级的动效，不是“会动”，而是用户会觉得它本来就应该这样动。
