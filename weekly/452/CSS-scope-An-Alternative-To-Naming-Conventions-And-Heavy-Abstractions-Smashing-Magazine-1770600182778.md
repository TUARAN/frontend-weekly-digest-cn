# CSS @scope: An Alternative To Naming Conventions And Heavy Abstractions — Smashing Magazine

- Blake Lundquist
- Feb 5, 2026
- 0 comments

# CSS `@scope`: An Alternative To Naming Conventions And Heavy Abstractions
- 9 min read
CSS,
Techniques,
Tools,
Coding- Share on [Twitter](https://twitter.com/intent/tweet?text=CSS%20%3ccode%3e%40scope%3c%2fcode%3e%3a%20An%20Alternative%20To%20Naming%20Conventions%20And%20Heavy%20Abstractions&url=https%3A%2F%2Fwww.smashingmagazine.com%2f2026%2f02%2fcss-scope-alternative-naming-conventions%2f&via=smashingmag), [LinkedIn](https://data.smashing.services/ball?uri=//www.linkedin.com/shareArticle?url=https://www.smashingmagazine.com%2f2026%2f02%2fcss-scope-alternative-naming-conventions%2f&title=CSS%20%3ccode%3e%40scope%3c%2fcode%3e%3a%20An%20Alternative%20To%20Naming%20Conventions%20And%20Heavy%20Abstractions)

#### About The Author
Blake Lundquist writes about simplifying the overly complex world of front-end development using vanilla JavaScript and CSS. He is currently a software engineer …
More about
Blake ↬
#### Email Newsletter
Your (smashing) email

Weekly tips on front-end & UX.
Trusted by 182,000+ folks.

*SurveyJS: White-Label Survey Solution for Your JS App*
*Register for free to attend Axe-con*
*Celebrating 10 million developers*
*Register now for WAS 2026*
*Building Interactive, Accessible Components with Modern CSS & JS, with Stephanie Eckles*
*Deep Dive On Accessibility Testing, with Manuel Matuzovic*
*Behavioral Design Workshop, with Susan Weinschenk*Prescriptive class name conventions are no longer enough to keep CSS maintainable in a world of increasingly complex interfaces. Can the new `@scope` rule finally give developers the confidence to write CSS that can keep up with modern front ends?
When learning the principles of basic CSS, one is taught to write modular, reusable, and descriptive styles to ensure maintainability. But when developers become involved with real-world applications, it often feels impossible to add UI features without styles leaking into unintended areas.

This issue often snowballs into a self-fulfilling loop; styles that are theoretically scoped to one element or class start showing up where they don’t belong. This forces the developer to create even more specific selectors to override the leaked styles, which then accidentally override global styles, and so on.

Rigid class name conventions, such as BEM, are one theoretical solution to this issue. The **BEM (Block, Element, Modifier) methodology** is a systematic way of naming CSS classes to ensure reusability and structure within CSS files. Naming conventions like this can reduce cognitive load by leveraging domain language to describe elements and their state, and if implemented correctly, can make styles for large applications easier to maintain.

In the real world, however, it doesn’t always work out like that. Priorities can change, and with change, implementation becomes inconsistent. Small changes to the HTML structure can require many CSS class name revisions. With highly interactive front-end applications, class names following the BEM pattern can become long and unwieldy (e.g., `app-user-overview__status--is-authenticating`), and not fully adhering to the naming rules breaks the system’s structure, thereby negating its benefits.

Given these challenges, it’s no wonder that developers have turned to frameworks, Tailwind being the most popular CSS framework. Rather than trying to fight what seems like an unwinnable specificity war between styles, it is easier to give up on the CSS Cascade and use tools that guarantee complete isolation.

## Developers Lean More On Utilities

How do we know that some developers are keen on avoiding cascaded styles? It’s the rise of “modern” front-end tooling &mdash; like CSS-in-JS frameworks &mdash; designed specifically for that purpose. Working with isolated styles that are tightly scoped to specific components can seem like a breath of fresh air. It removes the need to name things &mdash; still one of the most hated and time-consuming front-end tasks &mdash; and allows developers to be productive without fully understanding or leveraging the benefits of CSS inheritance.

But ditching the CSS Cascade comes with its own problems. For instance, composing styles in JavaScript requires heavy build configurations and often leads to styles awkwardly intermingling with component markup or HTML. Instead of carefully considered naming conventions, we allow build tools to autogenerate selectors and identifiers for us (e.g., `.jsx-3130221066`), requiring developers to keep up with yet another pseudo-language in and of itself. (As if the cognitive load of understanding what all your component’s `useEffect`s do weren’t already enough!)

Further abstracting the job of naming classes to tooling means that basic debugging is often constrained to specific application versions compiled for development, rather than leveraging native browser features that support live debugging, such as Developer Tools.

[It’s almost like we need to develop tools to debug the tools we’re using to abstract what the web already provides — all for the sake of running away from the “pain” of writing standard CSS.](https://twitter.com/share?text=%0aIt%e2%80%99s%20almost%20like%20we%20need%20to%20develop%20tools%20to%20debug%20the%20tools%20we%e2%80%99re%20using%20to%20abstract%20what%20the%20web%20already%20provides%20%e2%80%94%20all%20for%20the%20sake%20of%20running%20away%20from%20the%20%e2%80%9cpain%e2%80%9d%20of%20writing%20standard%20CSS.%0a&url=https://smashingmagazine.com%2f2026%2f02%2fcss-scope-alternative-naming-conventions%2f)
“
Luckily, modern CSS features not only make writing standard CSS more flexible but also give developers like us a great deal more power to manage the cascade and make it work for us. CSS Cascade Layers are a great example, but there’s another feature that gets a surprising lack of attention &mdash; although that is changing now that it has recently become **Baseline compatible**.

## The CSS `@scope` At-Rule

I consider the **CSS `@scope` at-rule** to be a potential cure for the sort of style-leak-induced anxiety we’ve covered, one that does not force us to compromise native web advantages for abstractions and extra build tooling.
“The `@scope` CSS at-rule enables you to select elements in specific DOM subtrees, targeting elements precisely without writing overly-specific selectors that are hard to override, and without coupling your selectors too tightly to the DOM structure.”

&mdash; MDN
In other words, we can work with isolated styles in specific instances **without sacrificing inheritance, cascading, or even the basic separation of concerns** that has been a long-running guiding principle of front-end development.

Plus, it has excellent browser coverage. In fact, Firefox 146 added support for `@scope` in December, making it Baseline compatible for the first time. Here is a simple comparison between a button using the BEM pattern versus the `@scope` rule:
<!-- BEM --> 
<button class="button button--primary">
  <span class="button&#95;&#95;text">Click me</span>
  <span class="button&#95;&#95;icon">→</span>
</button>

<style>
  .button .button&#95;&#95;text { /&#42; button text styles &#42;/ }
  .button .button&#95;&#95;icon { /&#42; button icon styles &#42;/ }
  .button--primary { primary button styles &#42;/ }
</style>
<!-- @scope --> 
<button class="primary-button">
  <span>Click me</span>
  <span>→</span>
</button>

<style>
  @scope (.primary-button) {
    span:first-child { /&#42; button text styles &#42;/ }
    span:last-child { /&#42; button icon styles &#42;/ }
  }
</style>

The `@scope` rule allows for **precision with less complexity**. The developer no longer needs to create boundaries using class names, which, in turn, allows them to write selectors based on native HTML elements, thereby eliminating the need for prescriptive CSS class name patterns. By simply removing the need for class name management, `@scope` can alleviate the fear associated with CSS in large projects.

## Basic Usage

To get started, add the `@scope` rule to your CSS and insert a root selector to which styles will be scoped:
@scope (<selector>) {
  /&#42; Styles scoped to the <selector> &#42;/
}

So, for example, if we were to scope styles to a `<nav>` element, it may look something like this:
@scope (nav) {
  a { /&#42; Link styles within nav scope &#42;/ }

  a:active { /&#42; Active link styles &#42;/ }

  a:active::before { /&#42; Active link with pseudo-element for extra styling &#42;/ }

  @media (max-width: 768px) {
    a { /&#42; Responsive adjustments &#42;/ }
  }
}

This, on its own, is not a groundbreaking feature. However, a second argument can be added to the scope to create a **lower boundary**, effectively defining the scope’s start and end points.
/&#42; Any `a` element inside `ul` will not have the styles applied &#42;/
@scope (nav) to (ul) {
  a {
    font-size: 14px;
  }
}

This practice is called **donut scoping**, and there are several approaches one could use, including a series of similar, highly specific selectors coupled tightly to the DOM structure, a `:not` pseudo-selector, or assigning specific class names to `<a>` elements within the `<nav>` to handle the differing CSS.

Regardless of those other approaches, the `@scope` method is much more concise. More importantly, it prevents the risk of broken styles if classnames change or are misused or if the HTML structure were to be modified. Now that `@scope` is Baseline compatible, we no longer need workarounds!

We can take this idea further with multiple end boundaries to create a “style figure eight”:
/&#42; Any <a> or <p> element inside <aside> or <nav> will not have the styles applied &#42;/
@scope (main) to (aside, nav) {
  a {
    font-size: 14px;
  }
  p {
    line-height: 16px;
    color: darkgrey;
  }
}

Compare that to a version handled without the `@scope` rule, where the developer has to “reset” styles to their defaults:
main a {
  font-size: 14px;
}

main p {
  line-height: 16px;
  color: darkgrey;
}

main aside a,
main nav a {
  font-size: inherit; /&#42; or whatever the default should be &#42;/
}

main aside p,
main nav p {
  line-height: inherit; /&#42; or whatever the default should be &#42;/
  color: inherit; /&#42; or a specific color &#42;/
}

Check out the following example. Do you notice how simple it is to target some nested selectors while exempting others?

See the Pen [@scope example [forked]](https://codepen.io/smashingmag/pen/wBWXggN) by Blake Lundquist.
See the Pen @scope example [forked] by Blake Lundquist.
Consider a scenario where unique styles need to be applied to slotted content within web components. When slotting content into a web component, that content becomes part of the Shadow DOM, but still inherits styles from the parent document. The developer might want to implement different styles depending on which web component the content is slotted into:
<!-- Same <user-card> content, different contexts -->
<product-showcase>
  <user-card slot="reviewer">
    <img src="avatar.jpg" slot="avatar">
    <span slot="name">Jane Doe</span>
  </user-card>
</product-showcase>

<team-roster>
  <user-card slot="member">
    <img src="avatar.jpg" slot="avatar">
    <span slot="name">Jane Doe</span>
  </user-card>
</team-roster>

In this example, the developer might want the `<user-card>` to have distinct styles only if it is rendered inside `<team-roster>`:
@scope (team-roster) {
  user-card {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  user-card img {
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }
}

## More Benefits

There are additional ways that `@scope` can remove the need for class management without resorting to utilities or JavaScript-generated class names. For example, `@scope` opens up the possibility to easily **target descendants of any selector**, not just class names:
/&#42; Only div elements with a direct child button are included in the root scope &#42;/
@scope (div:has(> button)) {
  p {
    font-size: 14px;
  }
}

And they **can be nested**, creating scopes within scopes:
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

Plus, the root scope can be easily referenced within the `@scope` rule:
/&#42; Applies to elements inside direct child `section` elements of `main`, but stops at any direct `aside` that is a direct chiled of those sections &#42;/
@scope (main > section) to (:scope > aside) {
  p {
    background-color: lightblue;
    color: blue;
  }
  /&#42; Applies to ul elements that are immediate siblings of root scope  &#42;/
  :scope + ul {
    list-style: none;
  }
}

The `@scope` at-rule also introduces a new **proximity** dimension to CSS specificity resolution. In traditional CSS, when two selectors match the same element, the selector with the higher specificity wins. With `@scope`, when two elements have equal specificity, the one whose scope root is closer to the matched element wins. This eliminates the need to override parent styles by manually increasing an element’s specificity, since inner components naturally supersede outer element styles.
<style>
  @scope (.container) {
    .title { color: green; } 
  }
  <!-- The <h2> is closer to .container than to .sidebar so "color: green" wins. -->
  @scope (.sidebar) {
    .title { color: red; }
  }
</style>

<div class="sidebar">
  <div class="container">
    <h2 class="title">Hello</h2>
  </div>
</div>

## Conclusion

Utility-first CSS frameworks, such as Tailwind, work well for prototyping and smaller projects. Their benefits quickly diminish, however, when used in larger projects involving more than a couple of developers.

Front-end development has become increasingly overcomplicated in the last few years, and CSS is no exception. While the `@scope` rule isn’t a cure-all, it can reduce the need for complex tooling. When used in place of, or alongside strategic class naming, `@scope` can make it easier and more fun to write maintainable CSS.

### Further Reading
- CSS `@scope` (MDN)
- “CSS `@scope`”, Juan Diego Rodríguez (CSS-Tricks)
- Firefox 146 Release Notes (Firefox)
- Browser Support (CanIUse)
- Popular CSS Frameworks (State of CSS 2024)
- “The “C” in CSS: Cascade”, Thomas Yip (CSS-Tricks)
- BEM Introduction (Get BEM)

(gg, yk)Explore more on- CSS
- Techniques
- Tools
- Coding

#### Smashing Newsletter

Tips on front-end & UX, delivered weekly in your inbox. Just the things you can actually use.

#### Front-End & UX Workshops, Online

With practical takeaways, live sessions, video recordings and a friendly Q&A.

#### TypeScript in 50 Lessons

Everything TypeScript, with code walkthroughs and examples. And other printed books.