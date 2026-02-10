# Is it scrolled? Is it not? Let&#39;s find out with CSS @container scroll

# Is it scrolled? Is it not? Let's find out with CSS @container scroll-state() queries
 23 Jan 2026     
   ![](https://utilitybend.com/_astro/visual.BsG_KDY__ZvRO74.jpg)   Oh, how I have been waiting to write this title! If you've read a few things by me, you know I'm always a bit hyped when CSS gives us the keys to the state-machine kingdom. For years, we've relied on intersection observers or scroll events in JavaScript to answer simple questions about an element's position and state. We already have a lot of these things happening in browsers, such as scroll-driven animations. But more state information is on the rise with an update on scroll-state queries.
   

I don’t know about you, but for me, Intersection Observer always felt like this magical thing that kind of works, but somehow I never got it to work exactly the way I wanted it. It missed control, it missed clarity. Way too many times have I been playing with margins and thresholds in that API only to notice that it didn’t always work perfectly on every screen.

If you are in the same boat as me, well, it seems that the future is bright, because `@container scroll-state` is here to make our lives a whole lot easier. For the sake of this article, I’m going to refer to them as just “Scroll-state queries”, ditching the container part.

There are a few updates in **Chrome 144**, but a few things were already available in **Chrome 133**, so let’s recap this first.

## A Quick Recap: How Do Scroll-State Queries Work?

Before we get to the shiny new toys, let’s do a little refreshing. Scroll-state queries allow a container to query its own scroll state and style its children accordingly. You simply define a container and then use a container query to check its state. It’s beautifully simple.

.scroll-ancestor {
  container-type: scroll-state;
}

@container scroll-state(stuck: top) {
  .child-of-scroll-parent {
    /* Magic happens here! */
  }
}

This functionality landed in **Chrome 133** with a trio of incredibly useful states that already solved some major headaches.

### The power trio: stuck, snapped, and scrollable

As I played around during my first look at this feature (at the time still in Canary), “[Is the sticky thing stuck?](https://utilitybend.com/blog/is-the-sticky-thing-stuck-is-the-snappy-item-snapped-a-look-at-state-queries-in-css)”, the initial implementation gave us some powerful tools.

#### Is it stuck?

This query answers the age-old question: “Is my `position: sticky` header actually stuck to the top right now?”. Before, this required tricky JavaScript. With this CSS feature, it’s trivial. In our demo, we use a wrapper to detect the state and style the header inside it, adding a background and shadow only when it’s “stuck”.

.sticky-header-wrapper {
  position: sticky;
  inset-block-start: 0;
  container-type: scroll-state;
}

@container scroll-state(stuck: top) {
  .main-header {
    background-color: var(--color-header-bg);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
}

See the Pen 
CSS Scroll-state: Is the sticky header stuck? by utilitybend ([@utilitybend](https://codepen.io/utilitybend))
on [CodePen](https://codepen.io/).

#### Is it snapped?

For scroll-snap galleries, we often want to highlight the active item. The `snapped` state lets us do just that. It checks if an element within a scroll-snap container is the one currently “snapped” in the viewport. In this demo, I used this to create a zoom effect on the active image, and also changed a bit of the background color.

.horizontal-track li {
  container-type: scroll-state;
}

@container scroll-state(snapped: inline) {
  .card-content img {
    transform: scale(1.1);
    filter: sepia(0);
  }
}

See the Pen 
CSS Scroll-state: Is the snap item snapped? by utilitybend ([@utilitybend](https://codepen.io/utilitybend))
on [CodePen](https://codepen.io/).

I’m also re-entering my Pokémon demo again… I just spent way too many hours on it, not to repeat it.

See the Pen 
Scroll-state query to check which item is snapped with CSS, Pokemon version by utilitybend ([@utilitybend](https://codepen.io/utilitybend))
on [CodePen](https://codepen.io/).

#### Is it scrollable?

I’m sure that this one will have quite a few use cases. The `scrollable` state doesn’t care what the user has done; it cares about what the user *can* do. It asks, “Is there un-scrolled content past a certain edge?” This is perfect for showing arrows only when there’s somewhere to scroll, a task that used to require a heap of JS checking `scrollLeft`, `scrollWidth`, and `clientWidth`.

/* Show the LEFT arrow ONLY if there is content to scroll to on the left */
@container scroll-state(scrollable: left) {
  .scroll-arrow.left {
    opacity: 1;
  }
}
  
/* Show the RIGHT arrow ONLY if there is content to scroll to on the right */
@container scroll-state(scrollable: right) {
  .scroll-arrow.right {
    opacity: 1;
  }
}

See the Pen 
CSS Scroll-state: Is it scrollable? by utilitybend ([@utilitybend](https://codepen.io/utilitybend))
on [CodePen](https://codepen.io/).

**Note:** all data/horses in this table were created by using AI; anything resembling real horses or people is purely accidental. If your horse feels offended, you can always let me know, and I will remove it from this generated list. (I mean… at least I’m honest about it…)

This is a very specific use case, but you could, for example, check if a container is scrollable in general using the `inline` or `block` axis as a keyword.

## The new kid: @container scroll-state(scrolled) arrives in Chrome 144!

That original trio was powerful, but one piece of the puzzle was missing: understanding the action of scrolling itself. With **Chrome 144**, the arrival of the `scrolled` state completes the picture, and it will help us with a very common pattern across the web.

The `scrolled` state is all about the user’s immediate action. It tracks the direction of the most recent scroll. Think of it as asking the browser, “Which way did the user just move?”

This is perfect for the classic “hidey-bar” header.

html {
  container-type: scroll-state;
}

/* If the last scroll was DOWN, hide the header */
@container scroll-state(scrolled: bottom) {
  .main-header {
    transform: translateY(-100%);
  }
}

/* If the last scroll was UP, show the header */
@container scroll-state(scrolled: top) {
  .main-header {
    transform: translateY(0);
  }
}

No more JavaScript janky headers. Yay!

See the Pen 
CSS Scroll-state: Has the user scrolled up or down? by utilitybend ([@utilitybend](https://codepen.io/utilitybend))
on [CodePen](https://codepen.io/).

The `scrolled` query can also be used for a one-time check. By querying `scrolled: inline`, we can ask, “Has this container been scrolled horizontally at all?” This is ideal for a scroll hint that should disappear after the user’s first interaction.

@container scroll-state(scrolled: inline) {
  .scroll-indicator {
    opacity: 0;
  }
}

See the Pen 
CSS Scroll-state: Has the user scrolled inline? by utilitybend ([@utilitybend](https://codepen.io/utilitybend))
on [CodePen](https://codepen.io/).

Now I know that the preference for this sort of behavior will probably be the earlier “arrow demo”, still, it’s nice to have the option. I would like to note that there is still a [small Chromium bug related to this new feature](https://issues.chromium.org/issues/477300992), but I already filed it.

## The Future is State-ful

With the arrival of `scrolled`, the scroll-state query family feels complete. This is a clever CSS-native toolkit for handling UI changes that were once the exclusive domain of JavaScript. That being said, these are features that people will probably only start to rely on fully when there is more browser support. Even though you can perfectly use all of them as a progressive enhancement, in my experience, clients usually want “hidey headers” or “scroll indicators” in every browser. You could do a JS fallback, but you know… time and money and time and….

Once again, I’m happy to welcome more CSS into the state-machine kingdom. These features are important for performance, UI enhancement, and yes, maybe even accessibility.

## Further reading

- [Directional CSS with scroll-state(scrolled)](https://una.im/scroll-state-scrolled) by Una Kravets

- [CSS scroll-state()](https://developer.chrome.com/blog/css-scroll-state-queries) on Chrome for Developers

- [Solved by CSS Scroll State Queries: hide a header when scrolling down, show it again when scrolling up](https://www.bram.us/2025/10/22/solved-by-css-scroll-state-queries-hide-a-header-when-scrolling-down-show-it-again-when-scrolling-up/) by Bramus

   
Article by
[ Brecht De Ruyte ](https://utilitybend.com/about)   
 in 
   [ css ](https://utilitybend.com/category/css)  ,  [ html ](https://utilitybend.com/category/html)  ,  [ ux ](https://utilitybend.com/category/ux)        
### Related posts
    
##  5 CSS debugging features I want to see in Chrome DevTools - Holidays list  
     28 Nov 2025            
   ![](https://utilitybend.com/_astro/visual-devtools.DSXvONBs_1dELOG.jpg)         It's the end of November, holidays are getting closer, and I thought, why not make a list? In this article, I want to highlight a few CSS debugging features I'd love to see in Chrome DevTools in the upcoming year, some of which are new and others that are long overdue.
  
Read moreabout 5 CSS debugging features I want to see in Chrome DevTools - Holidays list      
##  Styling siblings with CSS has never been easier. Experimenting with sibling-count and sibling-index  
     12 Sep 2025            
   ![](https://utilitybend.com/_astro/visual.BqckTkJX_91TEE.jpg)         If I were to divide CSS evolutions into categories, then last year was probably the year that ended with animations and colors getting better; This year, the end of the year seems to be about those ease-of-life features. We had one of those not that long go with :has(), but with things such as sibling-count, sibling-index, functions, and conditionals, the way we write CSS might just change for the better once again. In this article, I want to dip my toe in sibling-index() and sibling-count(), while also carefully adding some functions in the mix.
  
Read moreabout Styling siblings with CSS has never been easier. Experimenting with sibling-count and sibling-index            
Return to overview