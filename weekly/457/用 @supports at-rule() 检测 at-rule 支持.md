原文：Detect at-rule support in CSS with @supports at-rule(@keyword)  
链接：https://www.bram.us/2026/03/15/at-rule/  
创作：TUARAN

# 用 @supports at-rule() 检测 at-rule 支持

CSS 的渐进增强一直是个非常讲究细节的话题。我们会检测属性支持、检测值支持、做降级策略，但对 at-rule 的支持检测长期以来却没那么顺手。`@supports at-rule()` 的出现，正好补上了这块空白。

别小看这个能力。随着 CSS 新 at-rule 越来越多，像 `@scope`、`@starting-style`、`@container` 这类规则都在逐渐进入真实项目，开发者需要的不只是“能不能写”，还包括“能不能优雅判断并分支处理”。一旦支持检测变得更自然，渐进增强就更容易真正落地，而不只是停留在理论最佳实践。

这类特性对工程的意义往往比语法本身更大。因为它帮助我们把 CSS 新能力引入生产时的风险降下来，让“先试一点、再推广一点”变得可操作。

现代前端真正舒服的地方，不只是新能力很多，而是围绕这些能力的探测、降级和实验路径也开始越来越完整了。
