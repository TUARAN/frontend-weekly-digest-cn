原文：Using CSS animations as state machines to remember focus and hover states with CSS only  
链接：https://patrickbrosset.com/articles/2026-03-09-using-css-animations-as-state-machines-to-remember-focus-and-hover-states-with-css-only/  
创作：TUARAN

# 把 CSS 动画当状态机记住 focus 和 hover

CSS 动画大多数时候被当作视觉层工具：做过渡、做节奏、做强调。但这篇文章最有趣的地方，在于它把动画从“表现手段”拉到了“状态记忆机制”的角度去看。也就是说，动画不再只是动起来，而是开始承担某种接近状态机的角色。

这种思路很有启发，因为它再次说明现代 CSS 不是只能描述“最终长什么样”，也越来越能近似表达“在什么条件下保持什么状态”。尤其当 `focus` 和 `hover` 这类瞬时状态需要被更巧妙地记忆和延续时，CSS 本身就开始显露出比很多人预期更强的表达力。

当然，这类做法未必适合所有生产场景，但它很适合拿来训练思维。你会开始重新理解动画、延迟、关键帧和状态之间的关系，而不是只把它们当成装饰效果的语法。

很多好文章的价值，不在于你会直接照抄，而在于它能让你重新看见一门语言另一种不那么显眼的潜力。这篇就是典型。
