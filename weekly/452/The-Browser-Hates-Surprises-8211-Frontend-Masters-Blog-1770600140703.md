# The Browser Hates Surprises &#8211; Frontend Masters Blog

[CSS](https://frontendmasters.com/blog/tag/css/)[JavaScript](https://frontendmasters.com/blog/tag/javascript/)[Layout](https://frontendmasters.com/blog/tag/layout/)[Performance](https://frontendmasters.com/blog/tag/performance/)    
      
    
      The Browser Hates Surprises    

    
      ![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/1757598951795.png?fit=96%2C96&#038;ssl=1)
      
                Durgesh Rajubhai Pawar
      on
      February 6, 2026
    

    
      

We often treat the browser like a canvas — a blank slate waiting for us to paint pixels. But this mental model is flawed. The browser isn&#8217;t really a painter; it’s a **constraint solver**.

Every time you load a page, you enter a high-speed negotiation. You provide the rules (HTML & CSS), and the browser calculates the geometry. When you give it all the math upfront, the result feels magical: a stable, buttery-smooth experience.

But when we force the browser to recalculate that geometry mid-stream — because an image loaded late, a scrollbar popped in, or a font swapped — we break the spell.

We know this phenomenon as &#8220;Cumulative Layout Shift&#8221; (CLS), but really, it&#8217;s just **jank**. And jank doesn&#8217;t happen by accident. It happens because we *surprised* the browser.

To fix this, we need to stop fighting the rendering engine and start orchestrating it. But first, seeing is believing. Let&#8217;s look at exactly what it looks like when we get it wrong.

## [](https://frontendmasters.com/blog/the-browser-hates-surprises/#a-hostile-web-site)A &#8220;Hostile&#8221; Web Site

I call what we&#8217;re doing in the demo below &#8220;hostile&#8221; because the code is indifferent to the browser&#8217;s needs. It treats the rendering engine like a bucket we can dump data into whenever it arrives.

In the code below, you will see four distinct &#8220;surprises&#8221; that break the user experience:

- **The Sticky Header Collision:** When you click &#8220;Jump to Section 2,&#8221; the browser scrolls correctly to the top of the element, but the title gets buried behind the fixed header.

- **Popcorn Loading:** The text and images load independently. The layout jumps once for the text, and again for the image.

- **The Image Shift:** The image isn&#8217;t reserved space. It pushes the text down when it finally arrives.

- **The Scrollbar Shift:** When the content grows long enough, a physical scrollbar pops in (on Windows/Linux), shifting the entire UI to the left.

### [](https://frontendmasters.com/blog/the-browser-hates-surprises/#%f0%9f%9b%a0-the-before-demo)🛠 The &#8220;Before&#8221; Demo

CodePen Embed Fallback

Note that we&#8217;re just **faking* ***this hostile behavior with `setTimeout`, but it&#8217;s entirely plausible that real world websites experience these conditions naturally. Data can take time to arrive from APIs. Media can be slow to load. The amount of content can push a page to needing to scroll when it didn&#8217;t before.  

## [](https://frontendmasters.com/blog/the-browser-hates-surprises/#the-theory-why-this-happens)The Theory (Why This Happens)

Why did that feel so broken? It wasn&#8217;t just &#8220;slow internet.&#8221; It was a failure of negotiation.

To fix this, we need to understand how the browser thinks. The browser rendering engine has a strict pipeline:

- **Parse** (Read HTML/CSS)

- **Layout** (Calculate the geometry of every box)

- **Paint** (Fill in the pixels)

### [](https://frontendmasters.com/blog/the-browser-hates-surprises/#the-streaming-buffer-mistake)The &#8220;Streaming Buffer&#8221; Mistake

In the code above, we threw the text at the browser, *then* the image, *then* the scrollbar.

Every time we did that, we forced the browser to stop **Painting**, go back to **Layout**, recalculate the math for the page, and then **Paint** again. This is called a **Reflow**. Reflows are expensive for the CPU, but they are disastrous for the user experience because they physically move pixels that the user is currently looking at.

We need to move from **Reactive Rendering** (reacting to data arrival) to **Orchestrated Rendering** (planning for data arrival).

## [](https://frontendmasters.com/blog/the-browser-hates-surprises/#solutions)Solutions

We are going to make four specific negotiations with the browser to ensure stability.

### [](https://frontendmasters.com/blog/the-browser-hates-surprises/#1-the-coordinate-negotiation)1. The Coordinate Negotiation

The browser isn&#8217;t &#8220;wrong&#8221; when it scrolls your title behind the sticky header. It is scrolling to the exact mathematical top of the element. The problem is that our header exists *outside* the normal document flow.

We need to update the browser’s metadata regarding that element&#8217;s landing zone.

:target {
  /* "Hey browser, when you scroll here, leave 6rem of space against the top" */
  scroll-margin-top: 6rem;
}Code language: CSS (css)

### [](https://frontendmasters.com/blog/the-browser-hates-surprises/#2-the-space-negotiation)2. The Space Negotiation

On Windows and Linux, standard scrollbars take up physical space (usually ~17px). This happens on macOS too, but only when users have the [Show scroll bars: Always](https://www.macrumors.com/how-to/make-scroll-bars-always-visible/) option selected, which is not the default. When a scrollbar appears, the available width of the viewport changes, forcing a global recalculation that shifts centered content to the left.

We have two ways to solve this layout mutation.

#### [](https://frontendmasters.com/blog/the-browser-hates-surprises/#option-a-the-classic-fix-maximum-compatibility)Option A: The Classic Fix (Maximum Compatibility)

The most reliable method is to force the scrollbar track to be visible at all times, even on short pages.

html {
  overflow-y: scroll;
}Code language: CSS (css)

#### [](https://frontendmasters.com/blog/the-browser-hates-surprises/#option-b-the-modern-fix-cleaner-ui)Option B: The Modern Fix (Cleaner UI)

Modern CSS gives us a dedicated property that tells the browser: *&#8220;If a scrollbar might exist later, reserve that 17px slot now, but don&#8217;t show an ugly disabled track.&#8221;*

html {
  scrollbar-gutter: stable;
}Code language: CSS (css)

### [](https://frontendmasters.com/blog/the-browser-hates-surprises/#3-the-layout-reservation)3. The Layout Reservation 

Normally, the browser assumes an image is 0x0 until the file header downloads. By setting an `aspect-ratio` in CSS, we issue a &#8220;reservation ticket.&#8221; We allow the browser to calculate the final bounding box during the **CSS Parse** phase — before the network request is even sent.

img {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
Code language: CSS (css)

### [](https://frontendmasters.com/blog/the-browser-hates-surprises/#4-the-orchestration-promise-all)4. The Orchestration (**Promise.all)**

Instead of firing three separate state updates (three separate reflows), we wait for the entire &#8220;scene&#8221; to be ready. We trade a few milliseconds of &#8220;First Paint&#8221; for a UI that arrives fully formed.

// Don't just fetch. Orchestrate.
async function loadScene() {
  // Wait for critical actors to be ready
  const results = await Promise.all(&#91;
    fetch('/api/text'),
    fetch('/api/image')
  ]);

  // Update the state ONCE. 
  // One reflow. One paint.
  setFullScene(results);
}Code language: JavaScript (javascript)

## [](https://frontendmasters.com/blog/the-browser-hates-surprises/#phase-4-the-stable-application)Phase 4: The &#8220;Stable&#8221; Application

Here is the exact same application, but negotiated correctly.

Notice how &#8220;calm&#8221; the loading feels. The layout never jumps. The scroll lands exactly where you expect. It feels like a native application because we gave the browser the constraints it needed *before* painting.

### [](https://frontendmasters.com/blog/the-browser-hates-surprises/#%f0%9f%9b%a0-the-after-demo)🛠 The &#8220;After&#8221; Demo

CodePen Embed Fallback

## [](https://frontendmasters.com/blog/the-browser-hates-surprises/#conclusion)Conclusion

Optimization is not about making things load faster; it is about making them load **calmer**.

Every scroll bug, every jumpy image, and every layout shift is a sign that we failed to give the browser the information it needed at the time it needed it.

Stop surprising the browser. Start reserving space.

    
    
  

  

        
### Need to learn about web performance?

        
          
            ![](https://frontendmasters.com/blog/wp-content/themes/fem-v3/images/course-shoutouts/web_perf.png)
          

              
We have an in-depth course all about [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=the-browser-hates-surprises) from Todd Gardner. There is a lot to know, from the psychology of web performance, to measuring the new Core Web Vitals (LCP! INP! CLS!), to building a culture of performance at your organization. Access 300+ courses with a Frontend Masters subscription and [get 20% off today!](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=the-browser-hates-surprises)

          
            - Personalized Learning

            - Industry-Leading Experts

            - 24 Learning Paths

            - Live Interactive Workshops

          

          20% Off
          [Start Learning Today &rarr;](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=the-browser-hates-surprises)
        

  
    

			

	
	
		
### Leave a Reply [Cancel reply](https://frontendmasters.com/blog/the-browser-hates-surprises/#respond)

Your email address will not be published. Required fields are marked *

Comment * 

Name * 

Email * 

Website 

 Save my name, email, and website in this browser for the next time I comment.

 

&#916;
	
	  

  

  
    
    
      
### Table of Contents

      
        - [A “Hostile” Web Site](https://frontendmasters.com/blog/the-browser-hates-surprises/#a-hostile-web-site)[🛠 The “Before” Demo](https://frontendmasters.com/blog/the-browser-hates-surprises/#%f0%9f%9b%a0-the-before-demo)
- [The Theory (Why This Happens)](https://frontendmasters.com/blog/the-browser-hates-surprises/#the-theory-why-this-happens)[The “Streaming Buffer” Mistake](https://frontendmasters.com/blog/the-browser-hates-surprises/#the-streaming-buffer-mistake)
- [Solutions](https://frontendmasters.com/blog/the-browser-hates-surprises/#solutions)[1. The Coordinate Negotiation](https://frontendmasters.com/blog/the-browser-hates-surprises/#1-the-coordinate-negotiation)
- [2. The Space Negotiation](https://frontendmasters.com/blog/the-browser-hates-surprises/#2-the-space-negotiation)
- [3. The Layout Reservation ](https://frontendmasters.com/blog/the-browser-hates-surprises/#3-the-layout-reservation)
- [4. The Orchestration (Promise.all)](https://frontendmasters.com/blog/the-browser-hates-surprises/#4-the-orchestration-promise-all)
- [Phase 4: The “Stable” Application](https://frontendmasters.com/blog/the-browser-hates-surprises/#phase-4-the-stable-application)[🛠 The “After” Demo](https://frontendmasters.com/blog/the-browser-hates-surprises/#%f0%9f%9b%a0-the-after-demo)
- [Conclusion](https://frontendmasters.com/blog/the-browser-hates-surprises/#conclusion)
    

    
      
### Did you know?

      
Our courses go beyond frontend into fullstack, devops, and AI.

      &rarr; [Explore courses (20% off)](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=the-deep-card-conundrum)