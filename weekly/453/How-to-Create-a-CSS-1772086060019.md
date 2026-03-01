# How to Create a CSS

[@property](https://frontendmasters.com/blog/tag/property/)[CSS](https://frontendmasters.com/blog/tag/css/)[linear()](https://frontendmasters.com/blog/tag/linear/)[shape()](https://frontendmasters.com/blog/tag/shape/)[sibling-index()](https://frontendmasters.com/blog/tag/sibling-index/)    
      
    
      How to Create a CSS-only Elastic Text Effect    

    
      ![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2024/02/14073250.png?fit=96%2C96&#038;ssl=1)
      
                Temani Afif
      on
      February 11, 2026
    

    
      

Text effects where each letter animates separately are always cool and eye-catching. Such staggered animations are often achieved with JavaScript libraries, making their code a bit heavy for the relatively small design effect we&#8217;re usually shooting for. In this article, we will explore tricks to achieve a fancy text effect with just CSS and without the need of JavaScript (meaning will do the character-splitting by hand).

At the time of writing, only Chrome and Edge have full support of the features we will be using.

Hover the text in the demo below and see the magic in play:

CodePen Embed Fallback

Cool, right? We have a realistic elastic effect with nothing but CSS. It’s also flexible and easy to adjust. Before we dig into the code, let me start with an important warning. It’s a nice effect but it comes with several drawbacks.

## [](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#important-disclaimer-about-accessibility)Important Disclaimer About Accessibility

The effect we are making relies on splitting words into letters, which, in general, is a very bad idea.

A simple link with a word in it is normally like this:

```
`<a href="#">About</a>`Code language: HTML, XML (xml)
```

But we need to target and style individual letters, so we&#8217;ll be doing this:

<a href="#">
  <span>A</span><span>b</span><span>o</span><span>u</span><span>t</span>
</a>Code language: HTML, XML (xml)

This has accessibility drawbacks. 

There is a strong temptation to use `aria-*` attributes to fix that up. Or that&#8217;s what I thought, anyway. I found a few online resources that recommend using a structure similar to this one:

<a href="#" aria-label="About">
  <span aria-hidden="true">
    <span>A</span><span>b</span><span>o</span><span>u</span><span>t</span>
  </span>
</a>Code language: HTML, XML (xml)

Looks good, right? No! That structure is still terrible. Actually, most of the structures you will find online are bad. I am not an expert in the field, so I asked around, and two blog posts by [Adrian Roselli](https://adrianroselli.com/) emerged:

- [Barriers from Links with ARIA](https://adrianroselli.com/2026/01/barriers-from-links-with-aria.html)

- [You Know What? Just Don’t Split Words into Letters](https://adrianroselli.com/2026/02/you-know-what-just-dont-split-words-into-letters.html)

I highly recommend you read them to understand why splitting words is a bad idea (and what the potential solutions might be).

So why am I making this demo anyway?

I consider it more of a CSS experiment to explore modern features. That effect probably contains many properties that you are not aware of so it’s a good opportunity to discover them. Use it for fun or within a side project, but think twice before including it anywhere in widespread use or mission critical.

Now that you are warned, let’s get started.

## [](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#how-does-it-work)How Does It Work?

The idea is to use the `offset()` property and define a path that the letters should follow. That path will be a curve that we animate along. The `offset()` property is an underrated feature, but it has a lot of potential, especially when combined with modern features. I used it to create [an infinite marquee animation](https://frontendmasters.com/blog/infinite-marquee-animation-using-modern-css/), to perfectly [position elements around a circle](https://css-tip.com/images-circle/), to create a [fancy gallery of images](https://css-tip.com/circular-gallery/), and so on.

Here is a simplified example to understand the trick we will be using:

CodePen Embed Fallback

The demo above uses `path()` values, which comes from SVG. The three letters initially follow the first one. On hover, I switch to the second path. Thanks to the transition, we have a nice effect.

Unfortunately, using SVG is not ideal because you can only create static pixel-based paths that cannot be controlled with CSS. Instead, we are going to rely on [the new `shape()` function,](https://frontendmasters.com/blog/shape-a-new-powerful-drawing-syntax-in-css/) which allows us to define complex shapes (including curves) that we can easily control using CSS.

In this article, I will consider a simple usage for `shape()` as we only need one curve, but if you want to explore this powerful function, here are some of my previous articles:

- [Creating Flower Shapes using clip-path: shape()](https://frontendmasters.com/blog/creating-flower-shapes-using-clip-path-shape/)

- [Creating Blob Shapes using clip-path: shape()](https://frontendmasters.com/blog/creating-blob-shapes-using-clip-path-shape/)

- [Better CSS Shapes Using shape()](https://css-tricks.com/better-css-shapes-using-shape-part-1-lines-and-arcs/)

## [](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#lets-write-some-code)Let’s write some code

The HTML I will work with:

<ul>
  <li>
    <a href="#"><span>A</span><span>b</span><span>o</span><span>u</span><span>t</span></a>
  </li>
  <!-- more li elements -->
</ul>Code language: HTML, XML (xml)

The CSS:

ul li a {
  display: flex;
  font-family: monospace;
}
ul li a span {
  offset-path: shape(???);
  offset-distance: ???;
}
ul li a:hover {
  offset-path: shape(???);
}Code language: CSS (css)

Nothing fancy so far
CodePen Embed Fallback

A flexbox configuration to place the letters side-by-side and a monospace font because we need all the letters to have the same width.

Next, we define the path using the following code:

```
`offset-path: shape(from Xa Ya, curve to Xb Yb with Xc Yc / Xd Yd );`Code language: CSS (css)
```

I am using the curve command to draw a Bezier curve from A to B, with two control points, C and D.

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/DU1tNgpr.png?resize=693%2C352&#038;ssl=1)

Then I will animate the curve by adjusting the coordinates of the control points, specifically their Y value. When it is equal to the Y value of A and B, we get a straight line. When it’s bigger, we get a curve.

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/LFV3iqIt.png?resize=1024%2C228&#038;ssl=1)

The code of the curve will look like this:

```
offset-path: shape(from Xa Y, curve to Xb Y with Xc Y1 / Xd Y1);
```

And the one of the line will look like this:

```
offset-path: shape(from Xa Y, curve to Xb Y with Xc Y / Xd Y);
```

Notice how we are only changing the coordinate of the control points while everything else remains static.

Now let’s identify the different values. Two things to consider when working with offset:

- It’s defined on the child elements, but the reference box is the parent container.

- By default, we consider the center of the element when placing it on the path.

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/WSTDsr-l.png?resize=772%2C263&#038;ssl=1)

The first letter should be at the beginning of the path, and the last one at the end, so A is at the center of the first letter and B at the center of the last one

Y = 50%
Xa = .5ch
Xb = 100% - Xa = 100% - .5ch

For C and D, we don’t have any particular rules to follow, so you can specify any value for the X coordinate. I will pick `30%` for `Xc`, and `Xd` will be `100% - Xc = 70%`. Feel free to adjust the values to test different variations of the curve.

Our path is now ready:

```
offset-path: shape(from .5ch 50%, curve to calc(100% - .5ch) 50% with 30% Y / 70% Y);
```

The `Y` value is our variable, and it will be either `50%` (same as A and B) or another value, let’s define it as `50% - H`. The bigger `H` will be, the more elasticity we will have.

Let’s try it:

CodePen Embed Fallback

It’s a mess! We didn’t define the `offset-distance`, which makes all the letters overlap.

Should we define a position for each letter? Nah, that&#8217;s too much work.

We are obliged to define a different position for each letter, but the good thing is that we can do it with one formula using the `sibling-index()`and `sibling-count()` functions.

The first letter should be at `0%` and the last one at `100%`. We have N letters, which means we need a step equal to `100%/(N - 1)` to place all the letters from `0%` to `100%`, hence the following formula:

```
offset-distance: (100% * i)/(N - 1)
```

Where `i` is 0-indexed.

Written in CSS, we get:

```
`offset-distance: calc(100%*(sibling-index() - 1)/(sibling-count() - 1))`Code language: CSS (css)
```

CodePen Embed Fallback

Almost perfect. All the letters are correctly placed except the last one. For some reason, the `0%` and `100%` value are the same. `offset-distance` is not limited to values between `0%` and `100%` but can take any value (including negative ones) and there is a modulo ting that creates a kind of loop. You can travel the entire path from `0%` to `100%`, and starting from `100%`, you return to the initial point, and you can repeat the same from `100%` to `200%`, and so on.

Well, it’s a bit strange and not intuitive, but the fix is simple: we change `100%` with `99.9%`. Hacky, but it works!

CodePen Embed Fallback

Now the placement is perfect, and on hover, you can see how the straight line becomes a curve.

The last step is to add a transition, and we are done!

CodePen Embed Fallback

Maybe not quite done, as the animation seems broken. It’s probably a bug (that I have filled [here](https://issues.chromium.org/issues/482074624)), but it’s not a big deal because I was going to refactor the code to avoid writing the same shape twice and instead animate a variable.

@property --_s {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}
ul li a {
  --h: 20px; /* control the effect */
 
  display: flex;
  font: bold 40px monospace;
  transition: --_s .3s;
}
ul li a:hover {
  --_s: 1;
}
ul li a span {
  offset-path: 
    shape(
      from .5ch 50%, curve to calc(100% - .5ch) 50% 
      with 30% calc(50% - var(--_s)*var(--h)) / 70% calc(50% - var(--_s)*var(--h))
    );
  offset-distance: calc(99.9%*(sibling-index() - 1)/(sibling-count() - 1));
}Code language: CSS (css)

Now you have the `--h` variable you can adjust the control the curvature of the path and another internal variable that we animate from 0 to 1 to move from a straight line to a curve.

CodePen Embed Fallback

Tada! The animation is now perfect! *But where is the elastic effect?*

To get the elastic effect, we need to update the easing and rely on `linear()`. That’s the simplest part because I am going to use a [generator](https://linear-easing-generator.netlify.app/) to get the value.

Play with the config until you get what looks good to you. Here&#8217;s where I landed:

CodePen Embed Fallback

Now it’s good, but it can be improved if we adjust the curve slightly. Right now, the “height” of the curve is the same for all the words, but it would be ideal to have it based on the length of the word. For this, I will include `sibling-count()`within the formula so that the height gets bigger when the word gets wider.

CodePen Embed Fallback

## [](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#making-the-effect-direction-aware)Making the effect direction-aware

Our effect is good, but while we&#8217;re here, let&#8217;s go the extra mile. Let’s upgrade it and make it direction-aware. The idea is to have either a bottom curvature or a top one based on the direction of the mouse.

We already have the top curve making the variable `--_s` equal to 1:

ul li a:hover {
  --_s: 1;
}Code language: CSS (css)

If you change the value to `-1`, you get a bottom curve:

CodePen Embed Fallback

Now, we need to combine both somehow. When hovering from the top, we should get the bottom curve `--_s: -1`, and when hovering from the bottom, we should get the top curve `--_s: 1`.

First, I will add a pseudo-element of the `li` that fills the upper half of the element and is placed above the link:

ul li {
  position: relative;
}
ul li:after {
  content: "";
  position: absolute;
  inset: 0 0 50%;
  cursor: pointer;
}Code language: CSS (css)

CodePen Embed Fallback

From there, we can define two different selectors. When we hover the pseudo-element, it means we are also hovering the `li` element, so we can use:

ul li:hover a {
  --_s: -1;
}Code language: CSS (css)

When we hover the `a` element, we are also hovering the `li` element, so the above will also get triggered. but if we are hovering the pseudo-element, we are not hovering `a`, so we can use the following:

ul li:has(a:hover) a {
  --_s: 1;
}Code language: CSS (css)

Are you a bit lost? Don’t worry, let’s place both selectors together and see what is happening:

ul li:hover a {
  --_s: -1;
}
ul li:has(a:hover) a {
  --_s: 1;
}Code language: CSS (css)

We can either hover our element from the top (through the pseudo-element) or from the bottom (through the `a` element). The first case will trigger the first selector because we are also hovering `li`, BUT will not trigger the second one because the `li` “is not having its `a` hovered”. Now, when hovering the `a` element, both selectors will get triggered, and the last one will win.

We have our direction-aware feature!

CodePen Embed Fallback

It works, but it’s not as fluid as the demo I shared in the introduction. When the mouse moves the whole element, it abruptly stops one animation and triggers the other one.

To fix this, we can play with the size of the pseudo-element. When we hover it, we increase its size so it fills the entire element. This will prevent the second animation from getting triggered as we can no longer hover the `a` element below it. And when hovering the `a` element, we make the size of the pseudo-element equal to 0 hence we cannot hover it and trigger the first animation.

CodePen Embed Fallback

Much better! We make the pseudo-element transparent, and the illusion is perfect.

CodePen Embed Fallback

## [](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#conclusion)Conclusion

I hope you enjoyed this fun CSS experiment. I will repeat it again: think twice before using it in your project. It was a great demo to explore some modern features such as `shape()`, `linear()`, `sibling-index()`, etc., but it’s not a good idea to break accessibility for such an effect.

    
    
  

  

        
### Want to expand your CSS skills?

        
          
            ![](https://frontendmasters.com/blog/wp-content/themes/fem-v3/images/course-shoutouts/css.png)
          

              
Our [full CSS learning path](https://frontendmasters.com/learn/css/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=how-to-create-a-css-only-elastic-text-effect) covers everything from fundamentals to advanced layouts & design systems. Access 300+ courses with a Frontend Masters subscription and [get 20% off today!](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=how-to-create-a-css-only-elastic-text-effect)

          
            - Personalized Learning

            - Industry-Leading Experts

            - 24 Learning Paths

            - Live Interactive Workshops

          

          20% Off
          [Start Learning Today &rarr;](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=how-to-create-a-css-only-elastic-text-effect)
        

  
    

	
		3 responses to &#8220;How to Create a CSS-only Elastic Text Effect&#8221;	

	
		
		
	

	
			
				
				
			![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2025/09/bafkreidfn6b76tqsit32gjbatz7grz6iuw7r2ohinxzeqpjmwz2yyhk544.jpg?fit=32%2C32&#038;ssl=1)			[Daniel Schwarz](https://dxnny.fun/) says:		
		
		
			[February 12, 2026 at 9:30 pm](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#comment-57281)		

		
Could [::highlight()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::highlight) make it accessible?

		[Reply](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/?replytocom=57281#respond)
				
				
		
				
				
			![](https://secure.gravatar.com/avatar/41a6f9778d12dfedcc7ec3727d64a12491d75d9a65d4b9323feb075391ae6795?s=32&#038;d=mm&#038;r=g)			[Chris Coyier](https://chriscoyier.net/) says:		
		
		
			[February 12, 2026 at 10:30 pm](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#comment-57288)		

		
Crossed my mind too but the styling you can apply to it is super limited.

		[Reply](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/?replytocom=57288#respond)
				
				
		
				
				
			![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2025/09/bafkreidfn6b76tqsit32gjbatz7grz6iuw7r2ohinxzeqpjmwz2yyhk544.jpg?fit=32%2C32&#038;ssl=1)			[Daniel Schwarz](https://dxnny.fun/) says:		
		
		
			[February 13, 2026 at 12:02 am](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#comment-57292)		

		
As is the case with most pseudos, I guess. That&#8217;s a shame.

		[Reply](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/?replytocom=57292#respond)
				
				

	

	
		
		
	

	
		
### Leave a Reply [Cancel reply](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#respond)

Your email address will not be published. Required fields are marked *

Comment * 

Name * 

Email * 

Website 

 Save my name, email, and website in this browser for the next time I comment.

 

&#916;
	
	  

  

  
    
    
      
### Table of Contents

      
        - [Important Disclaimer About Accessibility](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#important-disclaimer-about-accessibility)
- [How Does It Work?](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#how-does-it-work)
- [Let’s write some code](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#lets-write-some-code)
- [Making the effect direction-aware](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#making-the-effect-direction-aware)
- [Conclusion](https://frontendmasters.com/blog/how-to-create-a-css-only-elastic-text-effect/#conclusion)
    

    
      
### Did you know?

      
Our courses go beyond frontend into fullstack, devops, and AI.

      &rarr; [Explore courses (20% off)](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=the-deep-card-conundrum)