# CSS @scope：命名约定与重度抽象的替代方案

[原文链接：CSS @scope: An Alternative To Naming Conventions And Heavy Abstractions](https://www.smashingmagazine.com/2026/02/css-scope-alternative-naming-conventions/)

作者：Blake Lundquist

2026 年 2 月 5 日

在真实项目里，“样式泄漏”往往会把 CSS 维护推向一个恶性循环：

- 本来只想给局部加样式；
- 结果影响到别的地方；
- 于是用更具体（更高优先级）的选择器去覆盖；
- 覆盖又反过来干扰全局样式；
- 最终导致选择器越来越复杂，靠层层覆盖才能勉强维持。

命名约定（例如 BEM）确实能缓解问题，但在多人协作、结构频繁调整、组件交互越来越多的前提下，很容易变得：

- 维护成本高（改一点结构要改一堆类名）；
- 类名又长又难读；
- 一旦不严格遵守规则，约定体系立刻失效。

于是许多团队转向“完全隔离”的方案（CSS-in-JS、utility-first），用工具强行绕开 Cascade。

但“逃离 Cascade”也会带来新的代价：构建配置更重、调试依赖编译产物、样式与组件代码耦合更深。

`@scope` 的目标，是在不牺牲继承与层叠的前提下，给你一种更原生、更轻量的“局部隔离”。

## `@scope` 是什么

`@scope` 允许你把一段样式限制在某个 DOM 子树内生效，从而：

- 精准选中某个区域内的元素；
- 不必写极端具体、难以覆盖的选择器；
- 不需要依赖构建工具生成隔离类名。

它在 2025/2026 进入更完善的跨浏览器支持（写作时 Firefox 146 也已支持），开始具备“可以认真用”的基础。

## 一个直观对比：BEM vs `@scope`

使用 BEM 时，你往往需要用类名来“人为划边界”：

```html
<button class="button button--primary">
  <span class="button__text">Click me</span>
  <span class="button__icon">→</span>
</button>
```

```css
.button .button__text { /* ... */ }
.button .button__icon { /* ... */ }
.button--primary { /* ... */ }
```

而用 `@scope`，边界可以更直接：

```html
<button class="primary-button">
  <span>Click me</span>
  <span>→</span>
</button>
```

```css
@scope (.primary-button) {
  span:first-child { /* 文本样式 */ }
  span:last-child { /* 图标样式 */ }
}
```

你仍然可以用类名（例如 `.primary-button`）来标识组件根节点，但组件内部选择器可以回归更“语义化”的元素与结构选择，而不是为了隔离而发明一套类名体系。

## 基本用法

最简单的形式是：

```css
@scope (<selector>) {
  /* 仅在 <selector> 对应的子树内生效 */
}
```

例如，把导航内的链接样式限制在 `<nav>` 中：

```css
@scope (nav) {
  a { /* nav 内的链接样式 */ }

  a:active { /* ... */ }

  a:active::before { /* ... */ }

  @media (max-width: 768px) {
    a { /* 响应式调整 */ }
  }
}
```

## Donut Scoping：设定“内边界”（排除某个子树）

`@scope` 还支持 `to (...)`，用于定义一个“结束边界”（lower boundary），把某些更内部的子树排除在外：

```css
/* nav 里的 a 默认应用样式，但 ul 内的 a 不应用 */
@scope (nav) to (ul) {
  a {
    font-size: 14px;
  }
}
```

这类需求在传统 CSS 里经常导致大量“重置样式”或堆叠 `:not()`，而 `@scope` 可以把意图表达得更直接。

你还可以一次排除多个边界：

```css
@scope (main) to (aside, nav) {
  a { font-size: 14px; }
  p {
    line-height: 16px;
    color: darkgrey;
  }
}
```

## 支持嵌套与 `:scope` 引用

`@scope` 可以嵌套，从而表达“组件里的组件”：

```css
@scope (main) {
  p {
    font-size: 16px;
    color: black;
  }

  @scope (section) {
    p {
      font-size: 14px;
      color: blue;
    }

    @scope (.highlight) {
      p {
        background-color: yellow;
        font-weight: bold;
      }
    }
  }
}
```

并且你可以用 `:scope` 指代当前 scope 的根：

```css
@scope (main > section) to (:scope > aside) {
  p {
    background-color: lightblue;
    color: blue;
  }

  :scope + ul {
    list-style: none;
  }
}
```

## `@scope` 还引入了“接近度（proximity）”维度

传统 CSS 冲突时主要看 specificity；而 `@scope` 增加了一个直觉更强的规则：当 specificity 相同，**scope 根节点离目标元素更近的那条规则优先**。

```html
<div class="sidebar">
  <div class="container">
    <h2 class="title">Hello</h2>
  </div>
</div>
```

```css
@scope (.container) {
  .title { color: green; }
}

@scope (.sidebar) {
  .title { color: red; }
}
```

在这个例子里，`h2.title` 离 `.container` 更近，因此绿色胜出。

## 小结

`@scope` 不是“万灵药”，但它为大型工程里的 CSS 维护提供了一个更原生的选择：

- 你可以继续利用继承与 Cascade，而不必彻底逃离它；
- 不必把“隔离”全靠类名规则或构建工具来保证；
- 让样式边界从“约定”变成“语法”。

如果你正在做组件化 UI，又不想把系统完全押在工具链抽象上，`@scope` 值得尽早关注和试用。
