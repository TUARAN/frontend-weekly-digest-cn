原文：Flexbox Masonry Layout (Explained with Math)  
链接：https://frontendmasters.com/blog/flexbox-masonry-layout-explained-with-math/  
创作：TUARAN

# Flexbox Masonry 布局：用数学讲清楚

Masonry 布局一直是前端布局史上的经典命题。大家都想要那种高低错落但依然紧凑的视觉效果，可长期以来实现方式要么依赖 JS 测量，要么需要某些局限明显的 CSS 近似技巧。也正因为如此，任何一篇能把“为什么能这样排”讲清楚的文章，都非常值得看。

这篇文章特别好的地方，是它没有停在“给你一段代码”，而是试图用数学和布局逻辑把 Flexbox 近似 Masonry 的原理讲透。前端很多布局技巧之所以难记，不是因为语法难，而是因为大家只记结果不记原因。一旦原因清楚了，代码反而不难。

我一直很喜欢这种“解释型布局文章”，因为它会把 CSS 从调参数的黑箱里拉出来。你开始意识到，很多布局并不是玄学，而是空间分配规则加上一点点建模方式变化。

真正让人进步的从来不是复制某个技巧，而是第一次明白这个技巧为什么成立。
