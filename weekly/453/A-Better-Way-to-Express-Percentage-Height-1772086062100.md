# A Better Way to Express Percentage Height

- [Previous CSS Tip](https://css-tip.com/clamp-auto/)
- [Next CSS Tip](https://css-tip.com/graph-theory/)

# A Better Way to Express Percentage Height

February 10, 2026

Percentage height is a common issue in CSS. Using `height: 100%` to fill the vertical space fails in most cases because the parent container doesn't have an explicit height. Even if the parent has a definite height, you may still face issues related to margin, box-sizing, etc.

Instead of `height: 100%`, you can rely on the new `stretch` value that will do a better job!

.box {
  height: stretch;
}

## How does it work? [#](https://css-tip.com/percentage-height/#how-does-it-work)

As its name suggests, it will try to stretch the element to fill the parent container (more precisely the containing block).

It works following two rules:

- If the element can be aligned using `align-self` (and `align-items`), the value produces the same result as a stretch alignment (`align-self: stretch`).

- If alignment doesn't apply, it works the same way as `height: 100%`, expect that margin is considered and the value of `box-sizing` doesn't matter. In other words, you won't get overflow issues due to margin, padding, or border.

In the demo below, `height: 100%` will either fail or create an overflow, while `height: stretch` is perfect!

⚠️ Limited Support (Chrome-only for now)

      See the Pen 
  Height: 100% vs height: stretch by Temani Afif ([@t_afif](https://codepen.io/t_afif))
  on [CodePen](https://codepen.io/).

Additionally, using `height: stretch` gives the element a definite height, allowing for a cascading stretch.

* {
  height: stretch;
}

      See the Pen 
  cascading stretch by Temani Afif ([@t_afif](https://codepen.io/t_afif))
  on [CodePen](https://codepen.io/).

`stretch` may not work if self-alignment doesn't apply to the element AND the parent container (containing block) doesn't have an explicit height. Similar to `height: 100%`, it will fallback to `auto`. Those cases are rare, but don't forget about them.

Here is an example involving inline-block elements.

      See the Pen 
  No stretching by Temani Afif ([@t_afif](https://codepen.io/t_afif))
  on [CodePen](https://codepen.io/).

## What about a percentage different from 100%? [#](https://css-tip.com/percentage-height/#what-about-a-percentage-different-from-100)

`stretch` only covers the `100%` case, so if you want to, for example, consider `height: 80%`, you need to rely on the `calc-size()` function.

.box {
  height: calc-size(stretch, .8*size);
  /* same as height: calc(.8*stretch) */
}

The `size` keyword in the calculation will refer to the `stretch` value to find the result, which is the same as "80% of stretch".

      See the Pen 
  calc-size() with stretch by Temani Afif ([@t_afif](https://codepen.io/t_afif))
  on [CodePen](https://codepen.io/).

Note that the same applies to `width: stretch`, expect that we consider the `justify-*` properties instead of the `align-*` ones in the first rule.

## More CSS Tips

  	
		[The Hidden Trick of Style Queries and if()](https://css-tip.com/if-trick/)
		Learn the secret behind the new conditions and how to use them correctly.
		February 25, 2026
	
  	
		[Why is Anchor Positioning not working?](https://css-tip.com/anchor-issues/)
		Learn the edge cases that prevent anchor positioning from working correctly.
		February 19, 2026
	
  	
		[Elastic/Bouncy Text Effect](https://css-tip.com/elastic-hover/)
		A few lines of modern CSS to create a fancy elastic effect on hover.
		February 03, 2026
	
  	
		[Responsive Pyramidal Grid of Hexagon Shapes (and more!)](https://css-tip.com/pyramidal-grid/)
		A responsive pyramidal grid of various shapes without media queries.
		January 27, 2026