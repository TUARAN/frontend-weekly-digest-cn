原文：NoJS 3 — The dawn of Flappy Bird. Making a Flappy Bird clone using pure HTML and CSS, no JavaScript  
链接：https://blog.scottlogic.com/2026/03/09/noJS-3-flappy-bird.html  
创作：TUARAN

# 不用 JavaScript 做 Flappy Bird：纯 HTML + CSS

“纯 HTML + CSS 做游戏”这种标题，第一眼看上去往往像是创意秀。但真正吸引人的地方，从来不是结果本身，而是它会强迫我们重新看一遍平台能力的边界：状态、触发、动画、碰撞的近似表达、用户输入的映射，原来在没有 JavaScript 的前提下也能被组织到这种程度。

Flappy Bird 之所以是个很妙的实验对象，是因为它足够简单，简单到你能看见每一个机制是怎么被“借用”出来的；但它又不至于简单到毫无挑战。要让它在纯 CSS/HTML 下成立，本质上是一次对声明式能力的极限压榨。

这类文章的价值，不在于鼓励大家以后真的不用 JS 做游戏，而在于它会让你重新意识到：很多我们习惯性丢给脚本的问题，之所以变成脚本问题，往往是因为我们从来没认真想过还能怎么建模。创意编码最珍贵的，就是这种打开思路的能力。

所以我会把这篇文章看成一种“认知训练”。它不一定直接服务生产，但会让你对 CSS、HTML 和浏览器默认行为的理解更深一层。
