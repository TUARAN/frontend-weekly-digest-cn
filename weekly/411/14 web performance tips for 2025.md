# 14 web performance tips for 2025

Strategic web performance tips that you should be focusing on in 2025 to improve Core Web Vitals

14 Apr 2025 by ![img](https://sia.codes/img/sia_96.jpg) [Sia Karamalegos](https://sia.codes/)

![A box of Sweethearts with a large heart on the front with the message 'Dream Big'](https://res.cloudinary.com/siacodes/image/upload/q_auto,f_auto,w_680/v1607719366/sia.codes/kenny-eliason-4nr9MylSRxA-unsplash_yahxia.jpg)

What should you be worried about when it comes to web performance in 2025? How should you even start?

I'm a web performance engineer, and I see a lot of common mistakes across the board when web developers and website owners try to understand and fix web performance, or "Core Web Vitals" in popular parlance.

This post started as a Valentines-themed social media thread to celebrate a follower milestone. I decided to write up these short and sweet nuggets (or nougats? 🍫) of web performance knowledge in case you missed it:

1. [Know your weaknesses](https://sia.codes/posts/web-perf-tips-2025/#1.-know-your-weaknesses)
2. [Understand your targets: loading speed](https://sia.codes/posts/web-perf-tips-2025/#2.-understand-your-targets%3A-loading-speed)
3. [Images are usually a micro-optimization](https://sia.codes/posts/web-perf-tips-2025/#3.-images-are-usually-a-micro-optimization)
4. [Understand your targets: layout shift](https://sia.codes/posts/web-perf-tips-2025/#4.-understand-your-targets%3A-layout-shift)
5. [Understand your targets: interactions](https://sia.codes/posts/web-perf-tips-2025/#5.-understand-your-targets%3A-interactions)
6. [Prevention: Use better architecture](https://sia.codes/posts/web-perf-tips-2025/#6.-prevention%3A-use-better-architecture)
7. [Prevention: Know the platform](https://sia.codes/posts/web-perf-tips-2025/#7.-prevention%3A-know-the-platform)
8. [Prevention: Analyze your options using data](https://sia.codes/posts/web-perf-tips-2025/#8.-prevention%3A-analyze-your-options-using-data)
9. [Learn from the experts](https://sia.codes/posts/web-perf-tips-2025/#9.-learn-from-the-experts)
10. [Invest in a performance culture](https://sia.codes/posts/web-perf-tips-2025/#10.-invest-in-a-performance-culture)
11. [Ask for help](https://sia.codes/posts/web-perf-tips-2025/#11.-ask-for-help)
12. [Buyer beware](https://sia.codes/posts/web-perf-tips-2025/#12.-buyer-beware)
13. [Recruit allies by explaining why performance is important](https://sia.codes/posts/web-perf-tips-2025/#13.-recruit-allies-by-explaining-why-performance-is-important)
14. [Make a more powerful message using your own data](https://sia.codes/posts/web-perf-tips-2025/#14.-make-a-more-powerful-message-using-your-own-data)

Struggling with web performance? Failing your Core Web Vitals? I'm here to help. Check out my [services](https://sia.codes/services/) or [contact me](https://sia.codes/contact/?subject=help with web performance) today to get started.

## 1. Know your weaknesses [#](https://sia.codes/posts/web-perf-tips-2025/#1.-know-your-weaknesses)

My #1 tip is to know your weaknesses before you start "fixing" things. Most people still reach for Lighthouse first and churn on low value fixes, wasting time and generating frustration.

Instead, look at real user data (or field data) first to find your weaknesses. [The Chrome User Experience Report (CrUX)](https://developer.chrome.com/docs/crux) is a great start.

Here are three CrUX tools I reach for the most:

- TREO's free [sitespeed tool](https://treo.sh/sitespeed) - shows the last 12 months for a domain
- The top of [PageSpeed Insights](https://pagespeed.web.dev/) - shows the last 28 days for a domain or page
- [CrUX Vis](https://cruxvis.withgoogle.com/#/) - shows deep-dive data on Core Web Vitals, sub-part metrics, and more

Analyze your data to see which metrics fail on which pages and devices. Then focus your debugging on those specific issues.

CrUX won't give you detailed breakdowns nor connect with key business metrics like bounce rate and conversion rate. So, you'll eventually want to graduate to a full-featured solution. You can roll your own with [web-vitals](https://github.com/GoogleChrome/web-vitals) or use a RUM provider like [SpeedCurve](https://www.speedcurve.com/), [DebugBear](https://www.debugbear.com/) and [RUMvision](https://www.rumvision.com/) to name a few.

## 2. Understand your targets: loading speed [#](https://sia.codes/posts/web-perf-tips-2025/#2.-understand-your-targets%3A-loading-speed)

Once you know where you're failing with RUM, make sure you understand the metrics and the common reasons why they fail. So that you can be more strategic about approaching optimization.

**Largest Contentful Paint (LCP)** measures loading speed, specifically when the largest item in the viewport has rendered.

LCP is currently the hardest metric to achieve "good" across the web.

We can make it easier by breaking it down into metrics that represent each part, further reducing the total possible causes for poor perf. This means less time and frustration debugging in lab tools.

If your RUM supports LCP sub-parts, here are two great articles to guide you:

- [Measure LCP Subparts To Improve Largest Contentful Paint](https://www.debugbear.com/blog/lcp-subparts) by Matt Zeunert (DebugBear)
- [Optimize Largest Contentful Paint](https://web.dev/articles/optimize-lcp#optimal_sub-part_times) by Philip Walton and Parry Pollard (web.dev)

If your RUM does not support LCP sub-parts, you can use TTFB and FCP in a similar way, which I describe in this article: [Debugging common causes for slow loading](https://sia.codes/posts/debugging-shopify-lcp/). It's focused on Shopify sites, but the concepts are the same for all sites. And, a lot of the common causes are shared across e-commerce & the web.

## 3. Images are usually a micro-optimization [#](https://sia.codes/posts/web-perf-tips-2025/#3.-images-are-usually-a-micro-optimization)

Today I will make enemies. My third tip is that images are usually a micro-optimization. Usually, your time would be more wisely spent on other issues.

Images are the most popular thing to optimize when it comes to web performance. My guess as to why?

1. Lighthouse almost always lists some image that could be reduced in size.
2. Images are less difficult to optimize compared to the alternatives.

Unpopular opinion: Once you've done a modicum of basic image size optimization (e.g., not serving 1MB+ images), your problems are probably more likely to be loading priorities, order, the critical rendering path, and render-blocking resources.

While unpopular, my opinion is backed by data:

> The majority of origins with poor LCP spend less than 10% of their p75 LCP time downloading the LCP image."
> –Brendan Kenny from [Common misconceptions about how to optimize LCP](https://web.dev/blog/common-misconceptions-lcp)

My advice: stop spending so much time micro-optimizing your image sizes, and instead dig into your RUM data to figure out where the real culprits may be, and debug.

## 4. Understand your targets: layout shift [#](https://sia.codes/posts/web-perf-tips-2025/#4.-understand-your-targets%3A-layout-shift)

Switching gears from loading speed, if your site is failing **Cumulative Layout Shift (CLS)**, luckily it is usually due to a smaller set of possible reasons.

CLS measures unexpected layout shifts which frustrate users. Think about the last time you tried to follow a recipe online and the content kept jumping around as more ads were injected.

I cover common causes and how to debug them in this post, [How to optimize Cumulative Layout Shift (CLS) on Shopify sites](https://sia.codes/posts/optimize-cls-on-shopify/). It's focused on Shopify but can be applied to most of the web.

![img](https://res.cloudinary.com/siacodes/image/upload/q_auto,f_auto,w_680/v1607719366/sia.codes/font_shift_i52uzo.webp)Web fonts can cause layout shifts, especially if they cause different line lengths resulting in a new line when they swap with the fallback font as shown in this example. Learn more and see more tips in [How to optimize Cumulative Layout Shift (CLS) on Shopify sites](https://sia.codes/posts/optimize-cls-on-shopify/).

## 5. Understand your targets: interactions [#](https://sia.codes/posts/web-perf-tips-2025/#5.-understand-your-targets%3A-interactions)

**Interaction to Next Paint (INP)** measures how long before the next paint after a user interaction. Poor INP results in rage clicks and page abandonment.

INP requires user interaction so it is a field-only metric. As such, RUM data is critical for both INP and LoAF (long animation frames) otherwise you're just guessing and rooting around in the dark.

You can start by cleaning up your JS (reducing third parties and dependencies, etc.), but if that's not enough, you'll need to start detailed RUM to catch your worst offenders. See options and recommended providers in [1. Know your weaknesses](https://sia.codes/posts/web-perf-tips-2025/#1.-know-your-weaknesses)

Are you finding this post helpful? If so, [sign up for my newsletter](https://sia.codes/posts/web-perf-tips-2025/#inform) to be notified of new posts!

## 6. Prevention: Use better architecture [#](https://sia.codes/posts/web-perf-tips-2025/#6.-prevention%3A-use-better-architecture)

An ounce of prevention is worth a pound of cure. When deciding on architecture, make sure you keep UX and web perf top of mind. Folks often reach for tools like JS frameworks when they aren't needed, will add extra bloat, and result in higher development costs.

Harry Roberts has a great post about this and using the web platform, [Build for the Web, Build on the Web, Build with the Web](https://csswizardry.com/2025/01/build-for-the-web-build-on-the-web-build-with-the-web/).

## 7. Prevention: Know the platform [#](https://sia.codes/posts/web-perf-tips-2025/#7.-prevention%3A-know-the-platform)

On the prevention front, know the platform. If you're a JavaScript dev, shore up your skills in HTML and CSS. Know what the platform can do for you. These two videos by Ryan Townsend and Kilian Valkhof are excellent starts:

PlayPlay Video: The Unbearable Weight of Massive JavaScript

PlayPlay Video: Stop using JS for that: Moving features to CSS and HTML

## 8. Prevention: Analyze your options using data [#](https://sia.codes/posts/web-perf-tips-2025/#8.-prevention%3A-analyze-your-options-using-data)

On prevention again, use CrUX data to help you decide between frameworks, platforms, and themes - [The CWV Tech Report](https://cwvtech.report/) is a great tool for this.

For example, I used CrUX data to analyze whether headless ecommerce was all it was cracked up to be in [Liquid vs headless: A look at real user web performance](https://performance.shopify.com/blogs/blog/liquid-vs-headless-a-look-at-real-user-web-performance) (short answer: no).

You can also dig deeper into the data for more specialized analysis, which is how I built [Theme Vitals](https://themevitals.com/) - a tool for comparing performance of Shopify themes. CrUX and HTTP Archive are public data sets - use them to answer key questions before you pick a bad framework or tool.

## 9. Learn from the experts [#](https://sia.codes/posts/web-perf-tips-2025/#9.-learn-from-the-experts)

If you're an engineer who wants to get better at performance, start following the experts! Here's a list of experts and accounts that create web performance content that I compiled into a [Bluesky starter pack](https://go.bsky.app/RVWSVqe).

![Join the conversation: Sia's frontend web performance starter pack on Bluesky](https://res.cloudinary.com/siacodes/image/upload/q_auto,f_auto,w_680/v1607719366/sia.codes/bsky_lc1hem.png)Follow web performance experts on Bluesky using [this starter pack](https://go.bsky.app/RVWSVqe).

## 10. Invest in a performance culture [#](https://sia.codes/posts/web-perf-tips-2025/#10.-invest-in-a-performance-culture)

Once you've fixed your performance, if you're large enough and have a budget, invest in a performance culture. SpeedCurve has a great guide around this: [Best Practices for Creating a Culture of Web Performance](https://www.speedcurve.com/web-performance-guide/performance-culture-best-practices/).

In my experience and contrary to what a lot of folks in my space might talk about, most companies are too small to dedicate staff toward this. There is a middle ground though!

Performance culture for small companies:

- Set up RUM to notify you when performance starts deviating.
- CI (continuous integration) is even better if you can swing it and it's not too noisy.
- Use a contractor (hi, that's me!) to step in when you get deviations and to participate in discussions of any larger architecture or major feature changes.

## 11. Ask for help [#](https://sia.codes/posts/web-perf-tips-2025/#11.-ask-for-help)

Take care of yourself by asking for help. Front end development is not easy. Nowadays, developers need to know too much in too many wheelhouses - from core HTML, CSS, and JS coding to frameworks, accessibility, SEO, and web perf.

Is it really better to have your devs churn 100 hours with no results than just hire a web perf expert who can give you results in a tenth of the time? I'm here to help along with other web perf freelancers. Check out my [services](https://sia.codes/services/) or [contact me](https://sia.codes/contact/) today to get started.

## 12. Buyer beware [#](https://sia.codes/posts/web-perf-tips-2025/#12.-buyer-beware)

Contracting a web perf expert is a smart decision for many companies of all sizes. However, buyer beware! A lot of scam apps, third parties, and contractors are out there.

General tip: if it sounds too good to be true, then it's probably a scam or hack...

Your app might be cheating Lighthouse scores or your freelancer might be regurgitating Lighthouse audits or doing busy work like micro-optimizing images. The latter can be a problem as undersized images can reduce conversion rates on ecommerce sites (poor-quality images = poor-quality products by consumers).

My former colleague wrote a great piece about this when he went through the Shopify app store to clean up a lot of problematic apps: [Don’t get scammed by fake performance experts and apps](https://performance.shopify.com/blogs/blog/don-t-get-scammed-by-fake-performance-experts-and-apps).

## 13. Recruit allies by explaining why performance is important [#](https://sia.codes/posts/web-perf-tips-2025/#13.-recruit-allies-by-explaining-why-performance-is-important)

As we approach the end of this series, let's circle back to why performance is important. We know little to nothing about how Google changes rank based on performance, but one thing we've proven repeatedly is that poor performance results in higher bounces and lower conversions.

You can check out multiple case studies on [WPO stats](https://wpostats.com/) as use them in your message to managers and business leaders.

But, your message will be even better if...

## 14. Make a more powerful message using your own data [#](https://sia.codes/posts/web-perf-tips-2025/#14.-make-a-more-powerful-message-using-your-own-data)

In the following photo, you can see aggregated data collected across multiple ecommerce sites in the showing how Largest Contentful Paint, a loading speed metric, impacts both conversions and bounces:

![Two curves showing conversion rate decreasing and bounce rate increasing as LCP increases](https://res.cloudinary.com/siacodes/image/upload/q_auto,f_auto,w_680/v1607719366/sia.codes/webperfbiz_buik8e.jpg)Slow LCP can increase bounce rate and decrease conversions.

By leveraging real user data paired with your business's key performance metrics, you can:

1. Learn exactly how web performance impacts your bottom line
2. Use that data to make an unassailable case for investing in better performance

Now, go forth and optimize!