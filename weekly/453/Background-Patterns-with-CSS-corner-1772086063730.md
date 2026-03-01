# Background Patterns with CSS `corner

[background-image](https://frontendmasters.com/blog/tag/background-image/)[CSS](https://frontendmasters.com/blog/tag/css/)[Patterns](https://frontendmasters.com/blog/tag/patterns/)[SVG](https://frontendmasters.com/blog/tag/svg/)    
      
    
      Background Patterns with CSS `corner-radius`    

    
      ![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2024/04/3dpvxuDw_400x400.jpg?fit=96%2C96&#038;ssl=1)
      
                Preethi Sam
      on
      February 9, 2026
    

    
      

The `corner-shape` property in CSS can do some neat designs. [Things like vintage tickets, with corners trimmed inwards](https://frontendmasters.com/blog/drawing-css-shapes-using-corner-shape/), [sci-fi corners](https://daverupert.com/2025/07/sci-fi-rectangles-with-corner-shape/), tags, and those types of designs are usually comes to mind when we think of the CSS property `corner-shape`.

There are a variety of nice primitive keywords we get with `corner-shape`, like `round` (the default), `bevel`, `scoop`, `squircle`, and [the all-powerful `superellipse()`](https://frontendmasters.com/blog/understanding-css-corner-shape-and-the-power-of-the-superellipse/). It&#8217;s actually quite easy to create interesting shapes that can be used for more than corner decorations.

Think patterned backgrounds.

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/mgdkr_7X.png?resize=1024%2C522&#038;ssl=1)

**Note**: When `corner-shape` isn’t supported by a browser, we can either keep or remove the default rounded corners set by the accompanying `border-radius`*.*

We can do that with CSS&#8217; `@supports` statements like:

@supports not (corner-shape: notch) {
  /* do something else instead */
}Code language: CSS (css)

## [](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#the-corner-shape-property)The `corner-shape` Property

While `border-radius` determines the size of the corner, `corner-shape` specifies its form. Both are needed to get the style. Just as `border-radius`, `corner-shape` affects the borders and shadows of an element.

It is a shorthand for `corner-top-left-shape`, `corner-top-right-shape`, `corner-bottom-left-shape`, and `corner-bottom-right-shape`.

## [](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#embedding-into-a-background)Embedding into a Background

Here&#8217;s the trick! 

We can make HTML elements into a `background` by embedding it through SVG as a data URL. Like this:

.element-with-the-background {
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">Styled HTML</div></foreignObject></svg>'
}Code language: CSS (css)

The unwrapped SVG part of the URL:

<svg xmlns="http://www.w3.org">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">Styled HTML</div>
  </foreignObject>
</svg>Code language: HTML, XML (xml)

The trick is to style an element into a desired shape using `corner-shape` and add that markup to a background’s data URL.

## [](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#the-shapes)The Shapes

Say we want to make a pattern based on a `<div>` that has these styles on it:

background: red;
width: 30px;
aspect-ratio: 1;
border-radius: 30%;
corner-shape: superellipse(-3);Code language: CSS (css)

To reduce code length in the URL, we&#8217;ll put all those styles as inline styles right onto the `<div>` we&#8217;re going to embed into the SVG:

```
`<div style='background:red;width:30px;height:30px;corner-shape:superellipse(-3);border-radius:30%;'></div>`Code language: HTML, XML (xml)
```

All corners get the `superellipse(-3)` style (similar to the scoop design) that are sized by the given border radius of `30%`.

Now to use this styled div within SVG, which we can then use in CSS for a background, we&#8217;ll put it in a `background: url()` function with a Data URL and repeat it with standard CSS properties.

.pattern {
  width: 150px;
  aspect-ratio: 1;
  background-size: 50px 50px;
  background-position:left 10px top 10px;
  background-repeat: repeat;
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><foreignObject width='30px' height='100%'><div xmlns='http://www.w3.org/1999/xhtml' style='background:deepskyblue;width:90%;aspect-ratio:1;corner-shape:superellipse(-1);border-radius:30%;'></div></foreignObject></svg>");
  background-color: ghostwhite;
  /* etc. */
}Code language: CSS (css)

CodePen Embed Fallback

### [](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#a-different-design-1)A Different Design #1

Since we can target individual corners, here’s a totally different design we can try:

border-top-left-radius: 12px;
corner-top-left-shape: scoop;
border-bottom-right-radius: 26px;
corner-bottom-right-shape: notch;

transform: rotate(-135deg) scale(0.8) translate(-3px);
background: conic-gradient(red 265deg, blue 265deg);Code language: CSS (css)

Only the top-left and bottom-right corners are styled, and the whole thing is rotated to a desired angle.

CodePen Embed Fallback

### [](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#a-different-design-2)A Different Design #2

We can also make use of borders and shadows:

border-bottom-left-radius: 66%;
corner-bottom-left-shape: notch;

box-shadow: -26px 16px 0 6px blue;
background: linear-gradient(to right, blue, deepskyblue);Code language: CSS (css)

The bottom-left corner has a notch style and there’s a leftward blue shadow.

CodePen Embed Fallback

## [](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#a-real-life-example)A Real Life Example

Below are a few example patterns. Since we are using HTML and CSS for the pattern design, we can work with other features, such as transform, gradients, and filters, in addition to corner shapes to get different designs.

Here we&#8217;re setting a physical product onto a pattern created this way. Remember this gives us programmatic control over the pattern, so it should be straightforward to change colors, sizing, repeating styles, etc.

CodePen Embed Fallback

## [](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#gallery)Gallery

CodePen Embed Fallback
    
    
  

  

        
### Wanna learn SVG & Animation deeply?

        
          
            ![](https://frontendmasters.com/blog/wp-content/themes/fem-v3/images/course-shoutouts/svg.png)
          

              
We have [an incredible course on all things CSS and SVG animation](https://frontendmasters.com/courses/svg-essentials-animation/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=background-patterns-with-css-corner-radius) from Sarah Drasner. Sarah comprehensively covers the possibilty of animation, the tools, and does it all in a very practical way. Access 300+ courses with a Frontend Masters subscription and [get 20% off today!](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=background-patterns-with-css-corner-radius)

          
            - Personalized Learning

            - Industry-Leading Experts

            - 24 Learning Paths

            - Live Interactive Workshops

          

          20% Off
          [Start Learning Today &rarr;](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=background-patterns-with-css-corner-radius)
        

  
    

			

	
	
		
### Leave a Reply [Cancel reply](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#respond)

Your email address will not be published. Required fields are marked *

Comment * 

Name * 

Email * 

Website 

 Save my name, email, and website in this browser for the next time I comment.

 

&#916;
	
	  

  

  
    
    
      
### Table of Contents

      
        - [The corner-shape Property](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#the-corner-shape-property)
- [Embedding into a Background](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#embedding-into-a-background)
- [The Shapes](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#the-shapes)[A Different Design #1](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#a-different-design-1)
- [A Different Design #2](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#a-different-design-2)
- [A Real Life Example](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#a-real-life-example)
- [Gallery](https://frontendmasters.com/blog/background-patterns-with-css-corner-radius/#gallery)
    

    
      
### Did you know?

      
Our courses go beyond frontend into fullstack, devops, and AI.

      &rarr; [Explore courses (20% off)](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=the-deep-card-conundrum)