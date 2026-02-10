# The CSS Selection

# The CSS Selection
 
The state of real-world CSS usage, 2026 edition.
 
![](https://www.projectwallace.com/_app/immutable/assets/bartveneman.BVhsdgFU.png) Bart Veneman
 Navigate this page  CSS SizeLines of codeStylesheet complexityEmbedded contentCommentsAt-rule totals@media@font-face@keyframes@supports@import@layer@charset@container@propertyRules per pageSelectors per ruleDeclarations per ruleTotal rule sizeRule nesting depthSelector totalsPseudo-classesAccessibilityVendor prefixesSpecificitySelector complexityCombinatorsDeclaration totals!important usageCustom propertiesProperty browserhacksVendor-prefixed propertiesColorsFont familiesFont sizesLine heightsBox shadowsText shadowsZ-indexesAnimation durationsAnimation timing functionsVendor prefixed valuesValue browserhacksValue resetsUnitsAnalytical gapsNext editionsAcknowledgements [Introduction](https://www.projectwallace.com/the-css-selection/2026#introduction) [Stylesheet composition](https://www.projectwallace.com/the-css-selection/2026#stylesheet-composition) [CSS Size](https://www.projectwallace.com/the-css-selection/2026#css-size)[Lines of code](https://www.projectwallace.com/the-css-selection/2026#lines-of-code)[Stylesheet complexity](https://www.projectwallace.com/the-css-selection/2026#stylesheet-complexity)[Embedded content](https://www.projectwallace.com/the-css-selection/2026#embedded-content)[Comments](https://www.projectwallace.com/the-css-selection/2026#comments)[At-rules](https://www.projectwallace.com/the-css-selection/2026#at-rules) [At-rule totals](https://www.projectwallace.com/the-css-selection/2026#at-rule-totals)[@media](https://www.projectwallace.com/the-css-selection/2026#media)[@font-face](https://www.projectwallace.com/the-css-selection/2026#font-face)[@keyframes](https://www.projectwallace.com/the-css-selection/2026#keyframes)[@supports](https://www.projectwallace.com/the-css-selection/2026#supports)[@import](https://www.projectwallace.com/the-css-selection/2026#import)[@layer](https://www.projectwallace.com/the-css-selection/2026#layer)[@charset](https://www.projectwallace.com/the-css-selection/2026#charset)[@container](https://www.projectwallace.com/the-css-selection/2026#container)[@property](https://www.projectwallace.com/the-css-selection/2026#property)[Rulesets](https://www.projectwallace.com/the-css-selection/2026#rulesets) [Rules per page](https://www.projectwallace.com/the-css-selection/2026#rules-per-page)[Selectors per rule](https://www.projectwallace.com/the-css-selection/2026#selectors-per-rule)[Declarations per rule](https://www.projectwallace.com/the-css-selection/2026#declarations-per-rule)[Total rule size](https://www.projectwallace.com/the-css-selection/2026#total-rule-size)[Rule nesting depth](https://www.projectwallace.com/the-css-selection/2026#rule-nesting-depth)[Selectors](https://www.projectwallace.com/the-css-selection/2026#selectors) [Selector totals](https://www.projectwallace.com/the-css-selection/2026#selector-totals)[Pseudo-classes](https://www.projectwallace.com/the-css-selection/2026#pseudo-classes)[Accessibility](https://www.projectwallace.com/the-css-selection/2026#accessibility)[Vendor prefixes](https://www.projectwallace.com/the-css-selection/2026#vendor-prefixes)[Specificity](https://www.projectwallace.com/the-css-selection/2026#specificity)[Selector complexity](https://www.projectwallace.com/the-css-selection/2026#selector-complexity)[Combinators](https://www.projectwallace.com/the-css-selection/2026#combinators)[Declarations](https://www.projectwallace.com/the-css-selection/2026#declarations) [Declaration totals](https://www.projectwallace.com/the-css-selection/2026#declaration-totals)[!important usage](https://www.projectwallace.com/the-css-selection/2026#important-usage)[Custom properties](https://www.projectwallace.com/the-css-selection/2026#custom-properties)[Property browserhacks](https://www.projectwallace.com/the-css-selection/2026#property-browserhacks)[Vendor-prefixed properties](https://www.projectwallace.com/the-css-selection/2026#vendor-prefixed-properties)[Values](https://www.projectwallace.com/the-css-selection/2026#values) [Colors](https://www.projectwallace.com/the-css-selection/2026#colors)[Font families](https://www.projectwallace.com/the-css-selection/2026#font-families)[Font sizes](https://www.projectwallace.com/the-css-selection/2026#font-sizes)[Line heights](https://www.projectwallace.com/the-css-selection/2026#line-heights)[Box shadows](https://www.projectwallace.com/the-css-selection/2026#box-shadows)[Text shadows](https://www.projectwallace.com/the-css-selection/2026#text-shadows)[Z-indexes](https://www.projectwallace.com/the-css-selection/2026#z-indexes)[Animation durations](https://www.projectwallace.com/the-css-selection/2026#animation-durations)[Animation timing functions](https://www.projectwallace.com/the-css-selection/2026#animation-timing-functions)[Vendor prefixed values](https://www.projectwallace.com/the-css-selection/2026#vendor-prefixed-values)[Value browserhacks](https://www.projectwallace.com/the-css-selection/2026#value-browserhacks)[Value resets](https://www.projectwallace.com/the-css-selection/2026#value-resets)[Units](https://www.projectwallace.com/the-css-selection/2026#units)[Conclusion](https://www.projectwallace.com/the-css-selection/2026#conclusion) [Analytical gaps](https://www.projectwallace.com/the-css-selection/2026#analytical-gaps)[Next editions](https://www.projectwallace.com/the-css-selection/2026#next-editions)[Acknowledgements](https://www.projectwallace.com/the-css-selection/2026#acknowledgements)[Research method](https://www.projectwallace.com/the-css-selection/2026#research-method)  
## [Introduction](https://www.projectwallace.com/the-css-selection/2026#introduction)
 
Welcome to **The CSS Selection 2026**! In this article we’re having a look at how CSS is used at scale on over 100,000 websites. We’ll look at what things are common on most websites and discover interesting outliers. This is the first edition of what I hope to be many, so this is meant as a baseline for future editions, setting up the first numbers to compare with in coming years.
 
This article exists for several reasons, but the [Web Almanac](https://almanac.httparchive.org/) is the most prominent one. For several years the Web Almanac has skipped the [CSS chapter](https://almanac.httparchive.org/en/2022/css), the last one published in 2022. This is mainly because of a shortage of authors and editors but mostly analysts who could wrangle BigQuery to get hold of large amounts of CSS data to analyze and put it in readable charts. Additionally, the Web Almanac uses a regex-based CSS analyzer that differs a lot from Project Wallace’s analyzer. This has bothered me for years because I think the CSS community deserves a yearly overview, as well as that overview having the best-in-class analysis. Now, I can’t crawl millions of websites like the HTTP Archive can, but I can do 100,000 and still make a pretty decent overview. This mostly explains why there will be some differences in what Almanac articles have found in previous years and what our analysis shows.
 (sponsored)  [
![](https://www.projectwallace.com/_app/immutable/assets/polypane-banner.mjH75nLq.png)](https://polypane.app/?utm_source=projectwallace&utm_medium=the-css-selection-2026&utm_content=banner-image) See every breakpoint. Catch every accessibility issue. Make your site work for everyone.
 [Polypane](https://polypane.app/?utm_source=projectwallace&utm_medium=the-css-selection-2026&utm_content=banner-text) is a development browser that shows your site in multiple viewports at once, with built-in tools to test accessibility
		(WCAG violations, color contrast, DOM structure), performance metrics, layout debugging, and meta tag validation. Thousands of developers trust Polypane to build sites that work beautifully for everyone without constant
		tab-switching and browser resizing. [Start Your Free Trial 
 No credit card needed](https://polypane.app/?utm_source=projectwallace&utm_medium=the-css-selection-2026&utm_content=banner-button) CSS has taken flight in recent years with many new features, properties, values, at-rules and so much more. With power shifting to CSS, it’s interesting to look at the use of these new features as well as to keep an eye on global metrics like file size, units used etc. We’ll work our way down from the top, so we’ll start by looking at stylesheet composition, followed by at-rule analysis, then rules, selectors, declarations, and lastly, values and units.
 
## [Stylesheet composition](https://www.projectwallace.com/the-css-selection/2026#stylesheet-composition)
 
To get a global idea of what we’re looking at, it’s good to take a look at some numbers from a bird’s-eye view. What is our CSS made up of?
 
### [CSS Size](https://www.projectwallace.com/the-css-selection/2026#css-size)
 
How much CSS does a website ship to their users? For this we simply look at how large the string of CSS is if we put it in one single, continuous, uncompressed string.
 Stylesheet size distribution in percentiles Stylesheet size distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts of small at 32.6 kB. 25th percentile: 130 kB; 50th percentile: 309 kB; 75th percentile: 619 kB; 90th percentile: 1.12 MB.
 0 B200 kB400 kB600 kB800 kB1 MBp10p25p50p75p9032.6 kB130 kB309 kB619 kB1.12 MB View chart as table Stylesheet size distribution in percentilesPercentileValuep1032.6 kBp25130 kBp50309 kBp75619 kBp901.12 MB 52.5 MB The website with the biggest CSS of all shipped a whopping 52.5 MB! Imagine being on a train or in a country where internet is very expensive and going to this specific website. Yikes! Luckily for them the CSS compressed down to 2.89 MB to transfer over the network, but still!
 
#### Correction
 
The initial release of this article mentioned the maximum CSS size being 131 MB but this was incorrect. A well-hidden bug in the CSS scraper (see [Research method](#research-method)) caused incorrect CSS sizes for some websites. After re-checking the data it seems that the percentiles data still holds up, as well as all the other metrics, but the award for largest site needs updating from 131 MB to 52 MB.
 
### [Lines of code](https://www.projectwallace.com/the-css-selection/2026#lines-of-code)
 
Because most (?) websites minify their CSS it’s also relevant to look at the lines of code. In more traditional programming languages this is a common metric to get a sense of the magnitude of a program. For CSS, [I’ve determined](https://www.projectwallace.com/blog/counting-lines-of-code-in-css#source-lines-of-code-for-css) that:
 
**source lines of code = # of rules + # of at-rules + # of declarations**
 
With that established, let’s look at the numbers:
 Source Lines of Code distribution in percentiles Source Lines of Code distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 1,029. 25th percentile: 4,551; 50th percentile: 10,677; 75th percentile: 20,013; 90th percentile: 33,457.
05,00010,00015,00020,00025,00030,000p10p25p50p75p901,0294,55110,67720,01333,457 View chart as table Source Lines of Code distribution in percentilesPercentileValuep101,029p254,551p5010,677p7520,013p9033,457 It looks like most websites manage to stay below or around 10,000 lines of code. That’s still a lot of CSS, but looking at any regularly sized website tells you that declaring your design system with a bunch of custom properties and loading some third-party tools quickly ramps up the numbers.
 
Further analysis of at-rules/rules/selectors/declarations per page is in their respective chapters.
 
### [Stylesheet complexity](https://www.projectwallace.com/the-css-selection/2026#stylesheet-complexity)
 
One of my favorite metrics is [complexity](https://www.projectwallace.com/blog/css-complexity). Using it besides the Source Lines of Code and file size gives a quick impression, even more so when comparing the number between websites. Or different versions of the same website, like a staging environment and a production environment. This chart shows the total complexity of all the CSS on a page, including that for complex selectors, property browser hacks, use of vendor prefixes and much more.
 Stylesheet complexity distribution in percentiles Stylesheet complexity distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 2,978. 25th percentile: 13,743; 50th percentile: 33,188; 75th percentile: 65,140; 90th percentile: 114,893.
020,00040,00060,00080,000100,000p10p25p50p75p902,97813,74333,18865,140114,893 View chart as table Stylesheet complexity distribution in percentilesPercentileValuep102,978p2513,743p5033,188p7565,140p90114,893 The distribution across percentiles here is pretty much the same as for lines of code.
 
### [Embedded content](https://www.projectwallace.com/the-css-selection/2026#embedded-content)
 
One contributor to file size is embedded content. A good portion of websites embed various types of content in their CSS, like encoded images or sometimes even entire WOFF2 files.
 Embedded content size distribution in percentiles Embedded content size distribution in percentilesA bar chart with 5 bars. The 10th and 25th percentiles are both 0 bytes. 50th percentile: 2.23 kB; 75th percentile: 8.23 kB; 90th percentile: 36.6 kB.
 0 B5 kB10 kB15 kB20 kB25 kB30 kB35 kBp10p25p50p75p90 0 B 0 B2.23 kB8.23 kB36.6 kB View chart as table Embedded content size distribution in percentilesPercentileValuep10 0 Bp25 0 Bp502.23 kBp758.23 kBp9036.6 kB This is an interesting distribution because we can see both the 10th and 25th percentiles don’t embed any content at all. Only from the 50th percentile onwards do we see a little bit of embedding, with the chart steeply rising from the 90th percentile.
 16.2 MB 
The award for the largest amount of embedded content goes to a website with a whopping 16.2 MB of embedded content!
 
### [Comments](https://www.projectwallace.com/the-css-selection/2026#comments)
 
Another contributor to file size can be the presence of comments. Minifiers usually strip most comments but some remain, like copyright notices.
 Comment size distribution in percentiles Comment size distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile is 0 bytes. 25th percentile: 72 bytes; 50th percentile: 729 bytes; 75th percentile: 3.84 kB; 90th percentile: 11.4 kB.
 0 B2 kB4 kB6 kB8 kB10 kBp10p25p50p75p90 0 B72 B729 B3.84 kB11.4 kB View chart as table Comment size distribution in percentilesPercentileValuep10 0 Bp2572 Bp50729 Bp753.84 kBp9011.4 kB It’s encouraging that, like the embedded content, the amount of comments in shipped CSS is pretty low.
 8 MB 
There's always an outlier: one website managed to send 8 MB of comments to their users…
 
## [At-rules](https://www.projectwallace.com/the-css-selection/2026#at-rules)
 
### [At-rule totals](https://www.projectwallace.com/the-css-selection/2026#at-rule-totals)
 
Let’s start by looking at how many at-rules we’re shipping. Not looking at which ones specifically, just count how many there are in total.
 Total at-rules per website distribution in percentiles Total at-rules per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 8. 25th percentile: 58; 50th percentile: 173; 75th percentile: 394; 90th percentile: 740.
0100200300400500600700800p10p25p50p75p90858173394740 View chart as table Total at-rules per website distribution in percentilesPercentileValuep108p2558p50173p75394p90740 Looks like most websites have their at-rules well under control. With modern CSS there’s a lot to control with at-rules, like containers, media, keyframes and supports. You need a bunch of them to get a properly functioning website, so let’s dive into how we actually use the various at-rules.
 150,825 
Someone is getting their webmaster license revoked! Having 150,825 at-rules on a single page is just… wild!
 
A quick look at the adoption rates of the various at-rules that we will further analyze in this chapter.
 AtruleAdoption %Relative count @media93.06%@font-face85.62%@keyframes83.90%@supports44.57%@charset39.57%@import18.04%@container9.61%@layer2.71%@property2.67% 
`@media` is the undisputed king of at-rules (93%), closely followed by `@font-face` (85%) and `@keyframes` (83%). This seems like a very reasonable list of adoption rates. Let’s look at the at-rules in more detail.
 
### [@media](https://www.projectwallace.com/the-css-selection/2026#media)
 
Our versatile friend the media query: always there to help with that responsive design, making that page print-ready or adjusting the layout for the folks who love that extra dash of contrast. So many possibilities!
 
Let’s start by looking at how many of them are on the page at all:
 @media at-rules per website distribution in percentiles @media at-rules per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 3. 25th percentile: 33; 50th percentile: 116; 75th percentile: 285; 90th percentile: 577.
0100200300400500600p10p25p50p75p90333116285577 View chart as table @media at-rules per website distribution in percentilesPercentileValuep103p2533p50116p75285p90577 Looking at the difference between this graph and the one above with at-rule totals, I think it’s safe to say that the largest amount of at-rules on a page would be `@media`. And that would make a ton of sense if you look at the versatility of it. So, what do we use it for actually?
 FeatureAdoption %Relative count max-width88.29%min-width86.45%prefers-reduced-motion44.15%orientation25.06%hover23.79%max-height23.23%-webkit-min-device-pixel-ratio22.60%min-resolution20.32%-ms-high-contrast15.65%max-device-width13.32%forced-colors8.59%pointer7.54%min-device-pixel-ratio6.35%-webkit-transform-3d6.07%transform-3d5.94%min--moz-device-pixel-ratio5.75%min-device-width5.66%min-height5.52%prefers-color-scheme5.11% 
[Source data](https://www.projectwallace.com/data/the-css-selection/2026/atrules.media.features.unique.stats.json)
 
The `max-width` and `min-width` features are quite unexpectedly used on most websites (88% and 86%). I did not expect `prefers-reduced-motion` to have such a great adoption rate even though it’s almost half of that of the top two. There are some other surprises here, like `forced-colors` being used a bunch more than `prefers-color-scheme`.
 
(sponsored)
 [Polypane wrote the complete guide to media queries](https://polypane.app/blog/the-complete-guide-to-css-media-queries/?utm_source=projectwallace&utm_medium=the-css-selection-2026&utm_content=media-queries) Read it here   
### [@font-face](https://www.projectwallace.com/the-css-selection/2026#font-face)
 
With `@font-face` Baseline widely available since July 2015, it’s hard to imagine the days that we had to embed images or use Flash to make our typography look great. Luckily, `@font-face` has made our lives a lot easier. How much do we use it?
 @font-face at-rules per website distribution in percentiles @font-face at-rules per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile is 0. 25th percentile: 3; 50th percentile: 8; 75th percentile: 19; 90th percentile: 48.
01020304050p10p25p50p75p900381948 View chart as table @font-face at-rules per website distribution in percentilesPercentileValuep100p253p508p7519p9048 Given the fact that you need multiple `@font-face` rules for every weight and italics, it makes sense that the numbers here are as they are. I actually expected the numbers to be a bit higher. Maybe some of you are experiencing some [*faux-bolds*](https://fonts.google.com/knowledge/glossary/faux_fake_pseudo_synthesized)?
 
### [@keyframes](https://www.projectwallace.com/the-css-selection/2026#keyframes)
 
Continuing the making-our-website-pretty theme with a look at `@keyframes`. It’s hard to imagine a website without any kind of animation and `@keyframes` has been a cross-browser help with that since September 2015. Every website has at least one spinner nowadays, right?
 @keyframes at-rules per website distribution in percentiles @keyframes at-rules per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile is 0. 25th percentile: 2; 50th percentile: 9; 75th percentile: 26; 90th percentile: 93.
020406080100p10p25p50p75p900292693 View chart as table @keyframes at-rules per website distribution in percentilesPercentileValuep100p252p509p7526p9093 Okay, maybe not every website then. 10% of them are as static as can be!
 @keyframes nameAdoption %Relative count fa-spin25.68%spin23.90%progress-bar-stripes21.44%fadeIn18.53%pulse15.78%fadeOut15.07%swiper-preloader-spin14.51%bounce11.28%turn-off-visibility10.95%lightbox-zoom-out10.94%lightbox-zoom-in10.94%turn-on-visibility10.94%fadeInUp10.62% 
[Source data](https://www.projectwallace.com/data/the-css-selection/2026/atrules.keyframes.unique.stats.json)
 
It looks like `@keyframes` do make things spin around. `fa-spin` is a clear sign of [FontAwesome](https://github.com/FortAwesome/Font-Awesome/blob/16ac6af0d816e1b132bb2e3f06aa59a1bc5c6d23/css/fontawesome.css#L356-L363) being present. The `turn-off-visibility` seems to come from the [WordPress Gutenberg editor](https://github.com/WordPress/gutenberg/blob/07a15b4fc745d747435328bad84f0f4b74dfb489/packages/block-library/src/image/style.scss#L358) as well as the two `lightbox-zoom-*` keyframes.
 
### [@supports](https://www.projectwallace.com/the-css-selection/2026#supports)
 
This at-rule is still evolving into something better even though it has been in our toolbox for quite a while now (Baseline since September 2015!). Where we first only could check if a certain declaration was supported, we can now also check for the support of [selectors, font-tech and font-format](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@supports#function_syntax)!
 @supports at-rules per website distribution in percentiles @supports at-rules per website distribution in percentilesA bar chart with 5 bars. The 10th, 25th and 50th percentiles are all 0. 75th percentile: 3; 90th percentile: 6.
0246810p10p25p50p75p9000036 View chart as table @supports at-rules per website distribution in percentilesPercentileValuep100p250p500p753p906 Uh-oh, not quite what I expected. Either everyone’s progressive enhancement game is top-notch or we’re missing out big time on some quality of life improvements. I really wonder why the adoption rate of `@supports` is this low. An underrated tool, it seems.
 4,858 
At least someone is cramming 4,858 supports rules into their website. Go champ!
 
#### [Unique @supports queries](https://www.projectwallace.com/the-css-selection/2026#unique-supports-queries)
 
Even though we don’t have a ton of `@supports` usage, it’s still fun to look at which unique queries are used most often. Note that this is not a normalized list of features, just unique values.
 @supports queryAdoption %Relative count (-webkit-mask-image:none) or (mask-image:none)) or (-webkit-mask-image:none)11.96%(position:sticky)11.91%(-webkit-touch-callout:inherit)9.89%(position:-webkit-sticky) or (position:sticky)4.59%not (container-type: inline-size)) or (not (selector(:has(*))3.36%(-webkit-appearance:none)3.03%(display:grid)2.52%(-ms-ime-align:auto)2.21%(-webkit-touch-callout:none)2.12%(-webkit-overflow-scrolling:touch)1.90%(display: grid)1.49%(position: sticky)1.40%(padding:max(0px))1.39%(outline-offset:-3px)1.24%(-webkit-touch-callout: none)1.20%(color:color-mix(in lab,red,red))1.09% 
[Source data](https://www.projectwallace.com/data/the-css-selection/2026/atrules.supports.unique.stats.json)
 
#### [@supports browserhacks](https://www.projectwallace.com/the-css-selection/2026#supports-browserhacks)
 
Another creative use of `@supports` is to use it to target specific browsers. Again, a table of non-normalized data, but look at what people are doing to be very specific. There are some really nasty ones in this list, and I sure hope you’re not actively taking part in this.
 @supports queryAdoption %Relative count (-webkit-appearance:none)3.03%(-webkit-appearance:none) and (stroke-color:transparent)0.50%(-webkit-appearance: none)0.29%(-moz-appearance: meterbar)0.18%(font: -apple-system-body) and (-webkit-appearance: none) and (-webkit-hyphens: none)0.15%(hanging-punctuation:first) and (font:-apple-system-body) and (-webkit-appearance:none)0.10%(-moz-appearance:meterbar)0.09%(-webkit-appearance: none) and (stroke-color: transparent)0.08%(-webkit-appearance:none) or (-moz-appearance:none) or (appearance:none)) or ((-moz-appearance:none) and (mask-type:alpha)0.07%(-webkit-appearance: none) or (-moz-appearance: none)0.07%(-webkit-appearance:none) or (-moz-appearance:none)0.06%(font:-apple-system-body) and (-webkit-appearance:none)0.06%(hanging-punctuation: first) and (font: -apple-system-body) and (-webkit-appearance: none)0.04% 
[Source data](https://www.projectwallace.com/data/the-css-selection/2026/atrules.supports.unique.stats.json)
 
### [@import](https://www.projectwallace.com/the-css-selection/2026#import)
 
If our previous at-rule was used so little, let’s hope this one is too! Using `@import` is *usually* an anti-pattern unless you know what you’re doing.
 @import at-rules per website distribution in percentiles @import at-rules per website distribution in percentilesA bar chart with 5 bars. The 10th, 25th, 50th and 75th percentiles are all 0. 90th percentile: 1.
0246810p10p25p50p75p9000001 View chart as table @import at-rules per website distribution in percentilesPercentileValuep100p250p500p750p901 Wow, job well done internet! Only 18.04% of websites analyzed use `@import`. The 90th percentile only has 1 `@import` at most.
 176 
There's always that one friend at the party taking it too far. Looking at you, web dev who included 176 @import rules into their website. Let's get you into rehab, buddy. Party's over.
 
For next year I’d be curious about the usage of layers, supports queries and media queries inside `@import` rules. This at-rule is a [pretty versatile beast](https://www.projectwallace.com/blog/css-imports-are-awesome), and I wonder if we’re taking full advantage of it when we use it.
 
### [@layer](https://www.projectwallace.com/the-css-selection/2026#layer)
 
Baseline widely available since March 2022, we can control our specificity and cascade more with `@layer`. Compared to other at-rules, the adoption rate is quite low, so it shows nothing on our percentiles chart. At least I found one website with… checks notes… 1,100 `@layer` at-rules. It’s a good thing that we’re not tracking averages.
 2.71% 
2.71% of analyzed websites use `@layer`. Not a high number considering its usefulness and availability.
 
`@layer` use seems mostly powered by the use of TailwindCSS but also the use of layers like `legacy` and `global` seem encouraging patterns of developers using `@layer`. Especially `@layer legacy` seems like a trick that developers use to incrementally modernize their codebase. I’ve skipped some named layers at the bottom of the chart so I could include `<anonymous>`.
 @layer nameAdoption %Relative count base1.85%utilities1.80%components1.76%theme1.64%properties1.48%reset0.29%legacy0.16%component0.13%global0.10%tokens0.10%<anonymous>0.04% 
[Source data](https://www.projectwallace.com/data/the-css-selection/2026/atrules.layer.unique.stats.json)
 
(sponsored)
 [Polypane has the best devtools to debug cascade layers](https://polypane.app/?utm_source=projectwallace&utm_medium=the-css-selection-2026&utm_content=layers) Start Your Free Trial  No credit card needed 
### [@charset](https://www.projectwallace.com/the-css-selection/2026#charset)
 @charset at-rules per website distribution in percentiles @charset at-rules per website distribution in percentilesA bar chart with 5 bars. The 10th, 25th and 50th percentiles are all 0. 75th percentile: 1; 90th percentile: 2.
0246810p10p25p50p75p9000012 View chart as table @charset at-rules per website distribution in percentilesPercentileValuep100p250p500p751p902 Almost 40% of websites use `@charset`, and an overwhelming majority use UTF-8 encoding. It is interesting to see that there is a distinct group using Chinese (`gb2312`), Japanese (`shift_jis`) and Cyrillic (`windows-1251`) encodings. This proves that there is a real use case for `@charset` even though most of us don’t use it that often.
 CharsetAdoption %Relative count utf-839.46%iso-8859-10.03%gb23120.02%shift_jis0.02%windows-12510.02%euc-jp0.02%euc-kr0.01% 
[Source data](https://www.projectwallace.com/static/data/the-css-selection/2026/atrules.charset.unique.stats.json)
 
### [@container](https://www.projectwallace.com/the-css-selection/2026#container)
 
Almost 10% of websites use `@container` already (well, it has been Baseline widely available since February 2023) is a pretty good number. It’s not enough to show anything on our percentiles chart so we’re omitting that.
 9.61% 
Just out of reach of appearing in the p10: `@container` is used on 9.61% of websites. Still quite the adoption!
 
Looking at the names that are used, there is no real pattern apart from the list of 8 hash-like gibberish names that appear in 0.16% of websites. Names like `wrapper`, `card` and `welcome-panel` speak more to the imagination.
 Container nameAdoption %Relative count wrapper3.38%welcome-panel0.35%welcome-panel-media0.35%dfposts0.26%card0.19%wpforms-field-row-responsive0.18%column0.17%[hash] like _1f7pmjs0 (7 rows omitted for brevity)0.17%wpforms-field-row-responsive-name-field0.15%wpforms-field-2-columns-responsive0.13%wpforms-field-3-columns-responsive0.13%media0.12%horizontal-product-card0.12% 
[Source data](https://www.projectwallace.com/data/the-css-selection/2026/atrules.container.names.unique.stats.json)
 
I wonder if the `media` container has anything to do with [the ‘OG’ CSS media object](https://www.stubbornella.org/2010/06/25/the-media-object-saves-hundreds-of-lines-of-code/).
 
### [@property](https://www.projectwallace.com/the-css-selection/2026#property)
 
`@property` is Baseline newly available since July 2024, so it makes sense that most websites haven’t picked it up yet. In that regard, the current adoption ratio of 2.67% is already encouraging.
 2.67% 
2.67% of websites use `@property`, which is not enough to make them show up in a percentiles chart. Maybe next year?
 Property nameAdoption %Relative count --tw-border-style1.63%--tw-font-weight1.61%--tw-leading1.53%--tw-inset-ring-shadow1.53%--tw-inset-shadow1.53%--tw-ring-offset-color1.53%--tw-ring-offset-shadow1.53%--tw-ring-offset-width1.53%--tw-ring-shadow1.53% 
[Source data](https://www.projectwallace.com/data/the-css-selection/2026/atrules.property.unique.stats.json)
 
After analyzing the most common `@property` names, I found that by far the most popular were TailwindCSS property names like `--tw-border-style`, `--tw-font-weight` etc. with most of them having an adoption rate between 1.63% and 0.12%. After that is a huge list of `--x-[hash]`, properties which seem to be entirely computer-generated. It doesn’t really make sense to show the full chart here, but it’s an interesting observation. My conclusion is that the most common usage of `@property` seems to be tied to some kind of (CSS) framework.
 
## [Rulesets](https://www.projectwallace.com/the-css-selection/2026#rulesets)
 
Each stylesheet consists of one or more rulesets or rules, unless you only ship some at-rules, like the Google Fonts API does. They are the cornerstone of how CSS works: one or more selectors and some declarations and you have yourself a ruleset. With that in mind let’s see how most rulesets are constructed and used.
 
### [Rules per page](https://www.projectwallace.com/the-css-selection/2026#rules-per-page)
 
Starting off with a simple but relevant metric: how many CSS rulesets are there per website analyzed?
 Total CSS rules per website distribution in percentiles Total CSS rules per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 224. 25th percentile: 1,119; 50th percentile: 2,802; 75th percentile: 5,420; 90th percentile: 9,118.
02,0004,0006,0008,000p10p25p50p75p902241,1192,8025,4209,118 View chart as table Total CSS rules per website distribution in percentilesPercentileValuep10224p251,119p502,802p755,420p909,118 The maximum I could find was 210,695 rules on a single page.
 
### [Selectors per rule](https://www.projectwallace.com/the-css-selection/2026#selectors-per-rule)
 
The most common number of selectors on a rule is 1. For this metric we look at the maximum number of selectors found on a single rule.
 Maximum selectors per rule distribution in percentiles Maximum selectors per rule distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 6. 25th percentile: 13; 50th percentile: 32; 75th percentile: 70; 90th percentile: 90.
0102030405060708090p10p25p50p75p90613327090 View chart as table Maximum selectors per rule distribution in percentilesPercentileValuep106p2513p5032p7570p9090 The maximum number I could find was 128,528 selectors on a single rule. Most of the cases where there are so many selectors are caused by [Sass’s `@extend` feature](https://sass-lang.com/documentation/at-rules/extend/) being used outrageously.
 
### [Declarations per rule](https://www.projectwallace.com/the-css-selection/2026#declarations-per-rule)
 
The most common number of declarations is 1, but for this metric we’ll look at the maximum number of declarations in a single rule.
 Maximum declarations per rule distribution in percentiles Maximum declarations per rule distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 17. 25th percentile: 28; 50th percentile: 50; 75th percentile: 117; 90th percentile: 279.
050100150200250300p10p25p50p75p90172850117279 View chart as table Maximum declarations per rule distribution in percentilesPercentileValuep1017p2528p5050p75117p90279 These numbers are quite a bit higher than the ones above for maximum selectors per ruleset. My guess is that this is because we tend to author more rules with many declarations versus many rules with few selectors and declarations that tools like Tailwind generate. They show up as most common, but the human-authored outliers show up in this graph. Notice that the 90th percentile for this metric is a lot higher compared to that for selectors per rule.
 
The largest number of declarations in a single rule in our data set was 41,620.
 
### [Total rule size](https://www.projectwallace.com/the-css-selection/2026#total-rule-size)
 
When you add up selectors and declarations, you get the rule size.
 
**rule size = # of rule selectors + # of rule declarations**
 
This metric helps draw attention to those rules that don’t stand out for having many selectors or declarations but have a large total.
 Maximum rule size distribution in percentiles Maximum rule size distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 21. 25th percentile: 48; 50th percentile: 74; 75th percentile: 137; 90th percentile: 352.
050100150200250300350400p10p25p50p75p90214874137352 View chart as table Maximum rule size distribution in percentilesPercentileValuep1021p2548p5074p75137p90352 The most common size is 2, which makes sense if you look at the data for common selectors and declarations per rule. Also, like the chart for declarations per rule, the 90th percentile for this metric is quite a bit higher than the rest.
 
The maximum ruleset size in our dataset was 128,529.
 
### [Rule nesting depth](https://www.projectwallace.com/the-css-selection/2026#rule-nesting-depth)
 
Developers love to nest CSS. For years we only had the option to nest media queries and some other at-rules but with CSS Nesting entering in 2023, we can go *deep*. But do we? Is it still only territory for preprocessors/postprocessors? Or do we avoid it?
 Maximum rule nesting depth distribution in percentiles Maximum rule nesting depth distribution in percentilesA bar chart with 5 bars. The 10th, 25th and 50th percentiles are all 1. 75th and 90th percentile: 2.
0246810p10p25p50p75p9011122 View chart as table Maximum rule nesting depth distribution in percentilesPercentileValuep101p251p501p752p902 That looks a bit underwhelming, but I think that’s a good sign. We’re not going overboard with this new feature yet.
 37 
There is one website where nesting levels went up to 37 levels deep. This particular site uses WordPress with a `<style id="wp-custom-css">` block and in that block they use 37 @media queries and for every single one of them they forgot to close the block with a `}`.
 
## [Selectors](https://www.projectwallace.com/the-css-selection/2026#selectors)
 
Love them or hate them, you need selectors to target the elements you want to change, whether it be for that fancy P3 color, or that 90’s grunge background-image.
 
### [Selector totals](https://www.projectwallace.com/the-css-selection/2026#selector-totals)
 
Looking at the number of selectors in a stylesheet gives us a quick look into the magnitude of things.
 Total selectors per website distribution in percentiles Total selectors per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 272. 25th percentile: 1,391; 50th percentile: 3,660; 75th percentile: 7,335; 90th percentile: 12,607.
02,0004,0006,0008,00010,00012,000p10p25p50p75p902721,3913,6607,33512,607 View chart as table Total selectors per website distribution in percentilesPercentileValuep10272p251,391p503,660p757,335p9012,607 From my experience analyzing websites, I expected the p90 and p75 to be a lot higher. I’m actually quite pleased with this distribution. Also, the top 10% of websites apparently have only 272 selectors or fewer, which is also surprising. This seems like a really low number to me.
 
### [Pseudo-classes](https://www.projectwallace.com/the-css-selection/2026#pseudo-classes)
 
One concept I copied from the Web Almanac is their overview of popular pseudo-classes. It offers an interesting look into adoption of newer pseudo-classes and proportional use between classes.
 Pseudo-classAdoption %Relative count hover95.24%where90.56%focus88.57%before87.58%after86.99%not86.39%last-child85.96%first-child85.76%active83.93%root79.14%nth-child76.82%disabled58.83%empty58.77%checked58.54%last-of-type57.32%visited54.65%nth-of-type53.19%first-of-type52.97%focus-visible48.20%-ms-input-placeholder44.10%has41.30%focus-within41.02%only-child36.97%is36.31%nth-last-child34.47%-moz-focusring32.99%-moz-placeholder25.68%link25.64%first-letter22.69%invalid21.42%host19%indeterminate18.31%-webkit-autofill17.04%valid16.50%placeholder-shown13.63%lang11.20%-moz-ui-invalid9.31%target6.11%-moz-placeholder-shown5.92%nth-last-of-type4.41%-webkit-full-screen3.77%enabled3.60%fullscreen3.59%required2.79%read-only2.53%only-of-type2.50% 
[Source data](https://www.projectwallace.com/data/the-css-selection/2026/selectors.pseudoClasses.unique.stats.json)
 
The 2022 Almanac listed `:hover`, `:focus` and `:active` as their top 3, but look at this: `:where` made it into the top 3! It has been Baseline widely available since January 2021, but this would be a good time to give yourself a pat on the back if you are a spec writer, or part of the CSS Working Group. And while you’re patting: `:has` is used on 41% of websites (Baseline newly available December 2023). That’s even higher than `:is`, clocking in at 36% (also Baseline widely available January 2021). It would be interesting to see if the use of `:matches` and `:any` will go down, as we use `:is` more. Regardless, these look like rock-solid adoption rates, if you ask me. We know that adoption of CSS features usually takes a bit, and seeing these newish ones up there makes you proud of the language.
 
Looking further down the list, we see `:empty` being used on 58% of websites. I find that surprising because I found it useful only on a handful of occasions.
 
Don't mind the `:before` and `:after` in this list. They get marked as pseudo-classes even though they're actually pseudo-elements. For backwards compatibility reasons, browsers allow you to write them with a single colon instead of two, and most CSS minifiers omit the optional colon. I kept them in this overview to see how often they are used.
 
### [Accessibility](https://www.projectwallace.com/the-css-selection/2026#accessibility)
 
Accessibility selectors are attribute selectors that check for the presence of `[aria-]` and `[role=]`. These are interesting because they tell a little bit about how accessibility is baked into the CSS. It’s never the complete story but it’s interesting nonetheless.
 Accessibility selectors per website distribution in percentiles Accessibility selectors per website distribution in percentilesA bar chart with 5 bars. The 10th and 25th percentiles are both 0. 50th percentile: 1; 75th percentile: 6; 90th percentile: 21.
051015202530p10p25p50p75p90001621 View chart as table Accessibility selectors per website distribution in percentilesPercentileValuep100p250p501p756p9021 Based on my own experience, I find this number quite low. Most projects I’ve worked on have many more accessibility-focused selectors than this. Either everyone is setting their styles via regular class names (very valid), or we’re not focusing on accessibility that much.
 
(sponsored)
 [Find and fix accessibility issues easily with Polypane](https://polypane.app/blog/find-and-fix-accessibility-issues-with-polypane/?utm_source=projectwallace&utm_medium=the-css-selection-2026&utm_content=layers) Learn more   
### [Vendor prefixes](https://www.projectwallace.com/the-css-selection/2026#vendor-prefixes)
 
Sometimes we need to use non-standard selectors to select that one pesky thing in that one single browser. Think of `:-moz-focusring`, `::-webkit-scrollbar` or `::-webkit-file-upload-button`. Vendor-prefixed selectors are usually taken care of by CSS toolchains, where they take your modern authored CSS and add some prefixes where necessary, based on the required browser support.
 Vendor-prefixed selectors per website distribution in percentiles Vendor-prefixed selectors per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile is 0. 25th percentile: 7; 50th percentile: 21; 75th percentile: 47; 90th percentile: 84.
0102030405060708090p10p25p50p75p9007214784 View chart as table Vendor-prefixed selectors per website distribution in percentilesPercentileValuep100p257p5021p7547p9084 Data shows that there are not that many vendor-prefixed selectors per website, and I’m curious to see if that number will go down in coming years as some of them will become obsolete. But on the other hand, some browser makers are shipping *new* vendor-prefixed selectors, so we might be seeing these for years and years to come.
 
### [Specificity](https://www.projectwallace.com/the-css-selection/2026#specificity)
 
Our beloved metric: specificity. It’s a shame Wes Bos isn’t [butchering](https://syntax.fm/816?t=0:14:26) the pronunciation of this as much as he did before. Jokes aside, specificity is one of the most misunderstood concepts in CSS, which is also a reason that so many people blogged about it and why online tools like [Polypane’s Specificity Calculator](https://polypane.app/css-specificity-calculator/) exist. Some CSS analyzers get specificity wrong, but luckily we don’t, so we can show cool stuff like this:
 Unique selector specificities per website distribution in percentiles Unique selector specificities per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 12. 25th percentile: 22; 50th percentile: 39; 75th percentile: 58; 90th percentile: 83.
0102030405060708090p10p25p50p75p901222395883 View chart as table Unique selector specificities per website distribution in percentilesPercentileValuep1012p2522p5039p7558p9083 The chart shows that 50% of websites have up to 39 unique specificities on their pages, which is a higher number than I had expected. Thinking about this a bit more actually leads me to think that this might be because CSS is such an expressive, capable language: there are so many ways to express [selector intent](https://csswizardry.com/2012/07/shoot-to-kill-css-selector-intent/), and increasingly more so with new selectors like `:has()` and `:where()`.
 
Now let’s look at the most commonly used specificities:
 SpecificityAdoption %Relative count 0,1,097.06%0,0,196.21%0,1,196.14%0,0,095.84%0,2,094.57%0,2,193.70%0,3,091%0,1,290.32%0,3,188.96%0,2,287.93%0,4,085.65%0,0,285.25%0,3,281.94%0,4,181.79%1,0,079.28%0,5,077.21%0,1,376.62%0,2,375.33%1,1,072.63%0,5,169.84%0,4,269.50%0,6,067.87%0,3,366.32%1,0,165.09%1,1,164.69%1,2,063.34% 
[Source data](https://www.projectwallace.com/data/the-css-selection/2026/selectors.specificity.unique.stats.json)
 
There’s absolutely nothing notable about this adoption rate chart. This is to be expected. One item I want to highlight is the no. 4 position of `0,0,0`. This means that the high usage of `:where()` seems to translate into this chart, as well as it being very likely that most websites use the universal selector (`*`). The fun part is at the bottom (the list has 2,876 unique entries), where things definitely got out of hand.
 146,1546,159 
There is one website shipping several *insane* selectors, up to 146,1546,159 in specificity. Bramus van Damme taught us that [specificity only goes up to 255,255,255](https://www.bram.us/2023/02/21/255255255-is-the-highest-specificity/) but, apart from that, the fact that this exists is completely bonkers.
 
(sponsored)
 [Inspect your selector specificity with Polypane's calculator](https://polypane.app/css-specificity-calculator/?utm_source=projectwallace&utm_medium=the-css-selection-2026&utm_content=selector-specificity) Inspect selectors   
### [Selector complexity](https://www.projectwallace.com/the-css-selection/2026#selector-complexity)
 
Selector complexity is an important metric next to measuring specificity. With the addition of `:where()` and `:is()`, we can not rely on counting the individual parts of the specificity, because these new pseudo classes nullify them. Therefore, we look at how many parts the selector is made up of. Example: `:where(#reset-theme > *)` has a [specificity of `0,0,0`](https://www.projectwallace.com/specificity-calculator?selectors=%3Awhere(%23reset-theme+%3E+*)) it has a [complexity of 4](https://www.projectwallace.com/selector-complexity?selector=%3Awhere(%23reset-theme+%3E+*)).
 Most common selector complexity per website distribution in percentiles Most common selector complexity per website distribution in percentilesA bar chart with 5 bars. The 10th, 25th and 50th percentiles are all 1. 75th percentile: 2; 90th percentile: 3.
0246810p10p25p50p75p9011123 View chart as table Most common selector complexity per website distribution in percentilesPercentileValuep101p251p501p752p903 Most selectors on most sites are simple selectors: they have only 1 or 2 parts to them. But what about the most complex selectors on any site?
 Maximum selector complexity per website distribution in percentiles Maximum selector complexity per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 8. 25th percentile: 12; 50th percentile: 16; 75th percentile: 22; 90th percentile: 29.
051015202530p10p25p50p75p90812162229 View chart as table Maximum selector complexity per website distribution in percentilesPercentileValuep108p2512p5016p7522p9029 This shows a different picture. Even simple websites sometimes need more complex selectors to express more complex state.
 8,804 
If we were to display this selector with 8,804 complexity, this page would probably crash. So let's not do that. But beware of this beast in the wild.
 
### [Combinators](https://www.projectwallace.com/the-css-selection/2026#combinators)
 
Selector combinators let you define relationships between your selectors. We often use the descendant combinator without thinking about it, but what about the others?
 Combinator adoption rates Combinator adoption ratesA bar chart with 4 bars. Descendant combinator: 96.2%; child combinator: 90.2%; adjacent sibling combinator: 81.9%; general sibling combinator: 67.7%.
0%20%40%60%80%100%(descendant)> (child)+ (adjacent sibling)~ (general sibling)96.20%90.23%81.94%67.68% View chart as table Combinator adoption ratesPercentileValue(descendant)96.20%> (child)90.23%+ (adjacent sibling)81.94%~ (general sibling)67.68% As expected, the descendant combinator takes the top spot, but the child combinator (`>`) is a close second. The other two are a bit below that and for me that makes sense. That seems to align with how I write CSS myself.
 
## [Declarations](https://www.projectwallace.com/the-css-selection/2026#declarations)
 
Declarations are where we start to apply actual styles. So far we’ve only selected the conditions: the device properties, media types, support levels, container requirements. Now it’s finally time to paint the pixels.
 
### [Declaration totals](https://www.projectwallace.com/the-css-selection/2026#declaration-totals)
 
We’ll start by looking at how many declarations websites are shipping in total.
 Total declarations per website distribution in percentiles Total declarations per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 700. 25th percentile: 2,926; 50th percentile: 6,573; 75th percentile: 12,163; 90th percentile: 19,914.
05,00010,00015,00020,000p10p25p50p75p907002,9266,57312,16319,914 View chart as table Total declarations per website distribution in percentilesPercentileValuep10700p252,926p506,573p7512,163p9019,914 The highest number of declarations in a single website found in our data set is 346,750.
 
### [!important usage](https://www.projectwallace.com/the-css-selection/2026#important-usage)
 
When cascade layers and specificity are not enough, there’s always the trusty `!important`.
 Total !important declarations per website distribution in percentiles Total !important declarations per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 1. 25th percentile: 36; 50th percentile: 154; 75th percentile: 628; 90th percentile: 1,514.
- 02004006008001,0001,2001,4001,600p10p25p50p75p901361546281,514 View chart as table Total !important declarations per website distribution in percentilesPercentileValuep101p2536p50154p75628p901,514 Compared to the totals in the section above, I’m happy to see that the majority of websites only use a respectable *number* of importants. But what do the *ratios* of `!important` look like? What *percentage* of our declarations is marked as `!important`?
 !important ratio per website distribution in percentiles !important ratio per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile is 0%. 25th percentile: 1%; 50th percentile: 2%; 75th percentile: 6%; 90th percentile: 13%.
0%5%10%15%20%p10p25p50p75p900%1%2%6%13% View chart as table !important ratio per website distribution in percentilesPercentileValuep100%p251%p502%p756%p9013% The maximum of `!important` found on a single website is 249,021. A small side note on the use of different `!important` notation just because I found some of them hilarious:
 `Important`
 - `!IMPORTANT`
 - `!impotant`
 - `!imporStant`
 - `!i`
 - `!imporatnt`
 - `!imPORTANT`
 - `!importan`
 - `!importantl`
 - `!imporant`
 - `!importnat`
 - `!imortant`
 - `!imprtant`
 
### [Custom properties](https://www.projectwallace.com/the-css-selection/2026#custom-properties)
 
One of the great power-ups of CSS in the last decade was the addition of custom properties. Finally we have our variables!
 Total custom properties per website distribution in percentiles Total custom properties per website distribution in percentilesA bar chart with 5 bars. The 10th and 25th percentiles are both 0. 50th percentile: 68; 75th percentile: 339; 90th percentile: 1,161.
02004006008001,0001,200p10p25p50p75p9000683391,161 View chart as table Total custom properties per website distribution in percentilesPercentileValuep100p250p5068p75339p901,161 It’s slightly surprising that up to the 50th percentile custom properties aren’t used at all. Looking at adoption rates of far newer functionalities, I’d expect custom properties to have a higher adoption ratio. But once websites use them, they use them *good*.
 Custom property ratio per website distribution in percentiles Custom property ratio per website distribution in percentilesA bar chart with 5 bars. The 10th and 25th percentiles are both 0%. 50th percentile: 1%; 75th percentile: 5%; 90th percentile: 14%.
0%5%10%15%20%p10p25p50p75p900%0%1%5%14% View chart as table Custom property ratio per website distribution in percentilesPercentileValuep100%p250%p501%p755%p9014% In terms of custom property ratios compared to the total amount of properties, we see a similar picture.
 
### [Property browserhacks](https://www.projectwallace.com/the-css-selection/2026#property-browserhacks)
 
A recent addition to our collective toolboxes has been [ReliCSS](https://www.alwaystwisted.com/relicss/). It detects a ton of questionable CSS hacks, including property hacks. These hacks were used in earlier times to target specific browsers and versions. For example, you could target IE6-7 specifically by writing `*font-size: 10px` or `_width: 100px` for IE 6 specifically. Are these property hacks still used in the wild?
 Property browserhack adoption rates Property browserhack adoption ratesA bar chart with 6 bars. *property: 18.8%; \_property: 3.5%; /property: 1.2%; #property: 0.3%; +property and $property are both near 0%.
- 0%5%10%15%20%*property_property/property#property+property$property18.75%3.52%1.17%0.31%0.03%0.02% View chart as table Property browserhack adoption ratesPercentileValue*property18.75%_property3.52%/property1.17%#property0.31%+property0.03%$property0.02% A quick explainer using data from [browserhacks.com](http://browserhacks.com/):
 `*property`: IE 6/7
 - `_property`: IE 6
 - `/property`: IE 6/7
 - `#property`: IE 6/7
 - `+property`: IE 6/7
 - `$property`: IE 6/7
 
This was going to be an uplifting article about the new era of CSS and great adoption rates of shiny new features, but look at this monstrosity. Let’s move on before it affects our mood.
 
### [Vendor-prefixed properties](https://www.projectwallace.com/the-css-selection/2026#vendor-prefixed-properties)
 
Slightly less disturbing than browser hacks but still a sign of the times and sometimes browser quirks: prefixes. A slightly more readable way of targeting specific browsers or rendering engines. Hopefully you don’t author them by hand because tools like LightningCSS and PostCSS can handle these things for you.
 Vendor-prefixed properties per website distribution in percentiles Vendor-prefixed properties per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 6. 25th percentile: 40; 50th percentile: 140; 75th percentile: 504; 90th percentile: 1,274.
02004006008001,0001,200p10p25p50p75p906401405041,274 View chart as table Vendor-prefixed properties per website distribution in percentilesPercentileValuep106p2540p50140p75504p901,274 The use of vendor-prefixes for properties is not surprising. Many reset stylesheets include properties like `-webkit-text-size-adjust`, including the [modern ones](https://vale.rocks/posts/css-reset) that [everyone](https://fokus.dev/tools/uaplus/) is blogging about in 2026.
 Vendor-prefixed property ratio per website distribution in percentiles Vendor-prefixed property ratio per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile is 0%. 25th percentile: 1%; 50th percentile: 2%; 75th percentile: 6%; 90th percentile: 11%.
0%5%10%15%20%p10p25p50p75p900%1%2%6%11% View chart as table Vendor-prefixed property ratio per website distribution in percentilesPercentileValuep100%p251%p502%p756%p9011% A closer look at what percentage of all properties is vendor-prefixed tells a slightly reassuring story. Not that many properties are prefixed.
 
## [Values](https://www.projectwallace.com/the-css-selection/2026#values)
 
Let me start with a rather disappointing note about this chapter. Because analyzing values is one of the areas where Project Wallace shines, but I made a bad decision early on in the scraping process. After an initial crawl started to fill my laptop’s drive rather quickly, I decided to cut out some ‘non-important’ metrics to save some disk space and speed up analysis. Boy, do I regret that. This decision means that I’ve analyzed and then **thrown away** all analysis about popular colors, font sizes, shadows, everything. All I have at this point are aggregate percentiles. So. This is not the values chapter I was hoping for but it’s the best I can do for this year.
 
### [Colors](https://www.projectwallace.com/the-css-selection/2026#colors)
 
Unique colors are analyzed by looking at their string representation, so `Red` is a different value than `red` and `#f00`. From a design systems perspective, counting like this makes sense, because you want all your colors to be uniform and coming from the same, single source of truth. This is what is counted when we look at the metric like that:
 Unique colors per website distribution in percentiles Unique colors per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 26. 25th percentile: 77; 50th percentile: 164; 75th percentile: 278; 90th percentile: 408.
0100200300400500p10p25p50p75p902677164278408 View chart as table Unique colors per website distribution in percentilesPercentileValuep1026p2577p50164p75278p90408 16,172 Whoever ships 16,172 unique colors to their users: your Design System team is very cross with you …
 
It would be very interesting to compare colors value-wise, so that is on my list for next year.
 
Then on to color formats. This table highlights what the most used color formats are across all websites analyzed.
 Color formatAdoption %Relative count hex697.10%hex394.94%transparent90.65%rgba90.44%named79.24%currentcolor59.29%rgb55.26%hex842.32%hex433.86%hsla32.08%system23.08%hsl6.20%oklch1.89%color0.56%oklab0.54%lab0.24%lch0.05%hwb0.03% 
[Source data](https://www.projectwallace.com/data/the-css-selection/2026/values.colors.formats.unique.stats.json)
 
The top 7 are very much as expected, but I’m surprised that 8-character hex colors are catching on so well with 42% adoption. Although I might be an old-school dev, because apparently this and 4-character hex codes have been Baseline widely available since January 2020…
 
Further down the list we have HSL(A) still beating OKLCH by some margin despite [active campaigns](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) to get us onto the better format.
 
### [Font families](https://www.projectwallace.com/the-css-selection/2026#font-families)
 
Apart from declaring custom `@font-face` families, there’s also the point of using actual families for your styling. How many unique families do websites use in their CSS?
 Unique font families per website distribution in percentiles Unique font families per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 3. 25th percentile: 6; 50th percentile: 12; 75th percentile: 20; 90th percentile: 33.
0510152025303540p10p25p50p75p9036122033 View chart as table Unique font families per website distribution in percentilesPercentileValuep103p256p5012p7520p9033 This data actually overlaps quite well with the use of [`@font-face`](https://www.projectwallace.com/the-css-selection/2026#font-face), with the number of families used always being slightly higher than the number of custom families declared.
 
### [Font sizes](https://www.projectwallace.com/the-css-selection/2026#font-sizes)
 
Similar to the color analysis, we only compare font sizes by their string representation, so `1.2em` is not the same as `120%` in our analysis, even though the browser will render them the same.
 Unique font sizes per website distribution in percentiles Unique font sizes per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 12. 25th percentile: 26; 50th percentile: 47; 75th percentile: 73; 90th percentile: 99.
020406080100p10p25p50p75p901226477399 View chart as table Unique font sizes per website distribution in percentilesPercentileValuep1012p2526p5047p7573p9099 This table matches my expectations quite well, but I’m always slightly surprised how we end up with so many unique font sizes on our websites. There are countless articles out there explaining how to create a font scale and use that but I guess reality comes at us quickly when it comes to CSS.
 
### [Line heights](https://www.projectwallace.com/the-css-selection/2026#line-heights)
 
Line heights are often, but not always, set in combination with `font-size` and/or `font-family`, often in the `font` shorthand. So it is no surprise that this graph is similar in shape to the the `font-size` and `font-family` charts, but just lower in numbers.
 Unique line heights per website distribution in percentiles Unique line heights per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 5. 25th percentile: 15; 50th percentile: 28; 75th percentile: 46; 90th percentile: 66.010203040506070p10p25p50p75p90515284666 View chart as table Unique line heights per website distribution in percentilesPercentileValuep105p2515p5028p7546p9066 
### [Box shadows](https://www.projectwallace.com/the-css-selection/2026#box-shadows)
 
One metric that is under-analyzed but often used in design systems is the humble box shadow. Not contributing to the box model, but it does play a role in branding and UX.
 Unique box shadows per website distribution in percentiles Unique box shadows per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 1. 25th percentile: 5; 50th percentile: 17; 75th percentile: 34; 90th percentile: 60.0102030405060p10p25p50p75p9015173460 View chart as table Unique box shadows per website distribution in percentilesPercentileValuep101p255p5017p7534p9060 
### [Text shadows](https://www.projectwallace.com/the-css-selection/2026#text-shadows)
 
Like box shadows, text shadows can help with creative effects or even help [improve readability of text on top of images](https://css-tricks.com/design-considerations-text-images/#aa-floor-fade) (wow, that CSS-Tricks article is from 2014!).
 Unique text shadows per website distribution in percentiles Unique text shadows per website distribution in percentilesA bar chart with 5 bars. The 10th and 25th percentiles are both 0. 50th percentile: 1; 75th percentile: 3; 90th percentile: 7.
0246810p10p25p50p75p9000137 View chart as table Unique text shadows per website distribution in percentilesPercentileValuep100p250p501p753p907 The use of text-shadows appears to be very limited. It makes me wonder why that is. Don’t we see the value in it? Is it too distracting?
 
### [Z-indexes](https://www.projectwallace.com/the-css-selection/2026#z-indexes)
 
The seemingly never-ending battle of putting things over other things. Modern CSS gives us [modern ways to create stacking contexts](https://polypane.app/blog/offset-parent-and-stacking-context-positioning-elements-in-all-three-dimensions/#creating-a-stacking-context), like `isolation: isolate`. So once you have that stacking context, what number do you put on it?
 Unique z-indexes per website distribution in percentiles Unique z-indexes per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 2. 25th percentile: 10; 50th percentile: 18; 75th percentile: 28; 90th percentile: 38.
0510152025303540p10p25p50p75p90210182838 View chart as table Unique z-indexes per website distribution in percentilesPercentileValuep102p2510p5018p7528p9038 It seems that we are a creative bunch when it comes to thinking of numbers. Given the wide range of unique `z-index` values it’s probably time for a word from our sponsor, Polypane. If you can master the concept of stacking contexts, you will not need so many z-indexes anymore. Kilian knows his stuff and if you need help debugging your stacking contexts, just use Polypane!
 
(sponsored)
 [Learn everything there is to know about stacking contexts](https://polypane.app/blog/offset-parent-and-stacking-context-positioning-elements-in-all-three-dimensions/?utm_source=projectwallace&utm_medium=the-css-selection-2026&utm_content=z-indexes) Read article   
### [Animation durations](https://www.projectwallace.com/the-css-selection/2026#animation-durations)
 
Oh, I wish that I could look into the actual values used for `animation-duration`. It would be very interesting to see what durations are used most so we could spark [a healthy debate](https://bsky.app/profile/vale.rocks/post/3mb6m6ggaos2l) on social media as to why everyone is wrong.
 Unique animation durations per website distribution in percentiles Unique animation durations per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 1. 25th percentile: 6; 50th percentile: 12; 75th percentile: 19; 90th percentile: 29.
051015202530p10p25p50p75p9016121929 View chart as table Unique animation durations per website distribution in percentilesPercentileValuep101p256p5012p7519p9029 At least we know that most websites don’t use a lot of unique durations. Again, these are compared string-wise, so `200ms` is different from `0.2s` and `.2s`. Now fight.
 
### [Animation timing functions](https://www.projectwallace.com/the-css-selection/2026#animation-timing-functions)
 
Are timing functions debated as heavily as durations? At least there are fewer unique values per website, so perhaps this is less of an issue?
 Unique timing functions per website distribution in percentiles Unique timing functions per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 1. 25th percentile: 3; 50th percentile: 6; 75th percentile: 10; 90th percentile: 16.05101520p10p25p50p75p901361016 View chart as table Unique timing functions per website distribution in percentilesPercentileValuep101p253p506p7510p9016 
### [Vendor prefixed values](https://www.projectwallace.com/the-css-selection/2026#vendor-prefixed-values)
 
Sometimes even values have vendor prefixes, like selectors and properties do. Think of `background-image: -webkit-linear-gradient()` or `display: -ms-flexbox`.
 Vendor prefixed values per website distribution in percentiles Vendor prefixed values per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile is 0. 25th percentile: 4; 50th percentile: 20; 75th percentile: 76; 90th percentile: 199.050100150200p10p25p50p75p90042076199 View chart as table Vendor prefixed values per website distribution in percentilesPercentileValuep100p254p5020p7576p90199 
### [Value browserhacks](https://www.projectwallace.com/the-css-selection/2026#value-browserhacks)
 
Unfortunately I have not broken down usage of value hacks properly but based on [the source data](https://www.projectwallace.com/data/the-css-selection/2026/values.browserhacks.unique.stats.json) I can tell that two main types of value hacks are still commonly used in at least 5% of websites:
 - `\9` is used to target IE 6-8
 - `!ie` is used to target IE <= 7 and acts as `!important` where the string after `!` can be anything
 
Source: [browserhacks.com](http://browserhacks.com/#ie)
 
### [Value resets](https://www.projectwallace.com/the-css-selection/2026#value-resets)
 
Value resets are measured as declarations where any level of margin or padding is set to `0` with or without units. Resets are usually a code smell because you’re overriding a value previously set, and now it’s ‘in the way’, and you need to do double work. That’s a sign that something is wrong with your CSS composition or cascade setup.
 Value resets per website distribution in percentiles Value resets per website distribution in percentilesA bar chart with 5 bars in an upward trend. The 10th percentile starts at 14. 25th percentile: 71; 50th percentile: 200; 75th percentile: 385; 90th percentile: 664.
0100200300400500600700p10p25p50p75p901471200385664 View chart as table Value resets per website distribution in percentilesPercentileValuep1014p2571p50200p75385p90664 Luckily there’s a small group of websites that seem to use the bare minimum, but looking further down the graph, we can see CSS resets quickly ramping up.
 
### [Units](https://www.projectwallace.com/the-css-selection/2026#units)
 
Looking at how many unique CSS units are used is useful because you probably don’t want to mix too many sorts of units to stay consistent. But there are also good reasons to not use the same unit for every single property, so it’s tradeoffs all the way down. How many units do websites actually use?
 Unique units per website distribution in percentiles Unique units per website distribution in percentilesA bar chart with 5 bars in a gentle upward trend. The 10th percentile starts at 4. 25th percentile: 7; 50th percentile: 9; 75th percentile: 11; 90th percentile: 12.
05101520p10p25p50p75p904791112 View chart as table Unique units per website distribution in percentilesPercentileValuep104p257p509p7511p9012 This might be one of the least eventful graphs in the entire report. Not a lot of diversity of CSS units across the biggest percentiles. Things get more interesting when we look at adoption rates of specific units:
 UnitAdoption %Relative count px98.28%em91.72%s91.50%deg89.30%rem80.15%vh76.04%vw72.34%fr60.23%ms56.70%turn35.64%ch23.06%pt15.50%dvh10.32%ex7.82%cm7.19%svh3.98%lh2.80%x2.75%dvw2.30%vmax1.69%vmin1.52%cqw1.48%pc1.29%mm1.18%in1.08%lvh0.95%svw0.55%cqi0.55%cqh0.32%cap0.15%vi0.15%lvw0.14%dppx0.13%m0.11%rad0.08%cqmin0.07% 
[Source data](https://www.projectwallace.com/data/the-css-selection/2026/values.units.unique.stats.json)
 
`px` remains the ruler with some distance over `em` and `s` although I’m surprised `s` is actually that high on the list. It’s even well above `rem`! Looking down the list we can see that `deg` is used more than `turn` (89.3% vs. 35.6%); `s` more than `ms` (91.5% vs. 56.7%); `cm` more than `mm` and `in` (7.19% vs. 1.18% vs. 1.08%). The list also shows that we’ve started using viewport and container units.
 
If you think that this list of units is incomplete, you're right. But since you're such an expert, why don't you show off your units knowledge in our [CSS Units memory game](https://www.projectwallace.com/css-units-game)?
 
## [Conclusion](https://www.projectwallace.com/the-css-selection/2026#conclusion)
 
That was a wild ride along some of the most-used but also most obscure pieces of CSS usage around the world. The goal of this first edition of Project Wallace’s CSS Selection was to have a look at how CSS is being used in the real world, and I am pleased to say that this article has shown us some real eye-openers as well as opportunities for mad respect and deep regret.
 
What stands out most to me is the adoption rate of various newish features in CSS, like `@container`, `:where` and `:has`. On the other hand, adoption of great features, like `@supports` and `@layer`, seems to lag behind. Perhaps this is my bias towards my own authoring style, but I expected the balance to be more in favor of the old-but-good.
 
Looking at the bigger picture, I expected the overall state of global CSS usage to be a lot worse than it is. Perhaps that stems from the fact that people send me their worst websites to analyze, and that causes my bias to shift towards a negative outlook. On the other hand, there is still a lot of improvents that could be easily made, if people would just look at the CSS they send to their customers’ browsers. I am tooting my own horn here, obviously, but if you occasionally analyze your website using Project Wallace, you’ll always find a couple of spots that could be improved.
 
### [Analytical gaps](https://www.projectwallace.com/the-css-selection/2026#analytical-gaps)
 
After spending dozens of hours analyzing and writing these chapters, I found that there are some flaws in my overall analysis that I plan to improve in future editions:
 - Do deeper analysis on comparing string-based values: `red` and `Red` should be marked as the same values for colors, as should `(position: sticky)` and `(position:sticky)` for `@supports` queries.
 - There is no correlation analysis: does having lots of embedded content always mean having a bigger file size than usual? Do websites with a large `!important` ratio also have different specificity metrics? This is worth exploring next time.
 
### [Next editions](https://www.projectwallace.com/the-css-selection/2026#next-editions)
 - Because this is the first edition, I haven’t done comparisons to other years yet. This is ‘the big plan’ for future editions: to have a look at how CSS usage evolves as we drop legacy browser support and adopt more modern features.
 - For the next edition I’ll use a more realistic scraper, probably based on a headless browser. Our current scraper fetches static HTML, parses it to get CSS resources and downloads each of them. A headless browser would yield more realistic results, because it is able to see the actual network requests, even the ones initiated by JavaScript.
 - Continuing on the last point: if we’re going to use a headless browser, then we can also look at [CSS coverage analysis](https://www.projectwallace.com/css-coverage).
 - Multiple suggestions came in through the review process, some of which we might incorporate into upcoming editions: comparing usage of `grid` and `flex`; analyzing `@scope` and `:scope`; analyzing adoption ratios of pseudo-elements and attribute selectors; looking for adoption ratio of the PostCSS `@layer` polyfill; Web component selectors: the list goes on and on!
 
### [Acknowledgements](https://www.projectwallace.com/the-css-selection/2026#acknowledgements)
 
This article would not have existed without the prior work of all those who contributed to the Web Almanac CSS chapter over the years. Your work is invaluable, and let’s hope we will get an updated CSS chapter this year.
 
[Declan Chidlow (vale.rocks)](https://vale.rocks/) helped out by meticulously reviewing this article and schooling me in how to write properly. Thank you for that. Go check out that blog, it’s awesome.
 
A tremendous word of thanks to [Kilian](https://kilianvalkhof.com/) from [Polypane](https://polypane.app/) for sponsoring (and reviewing) this inaugural edition of The CSS Selection. Your support means the world to me personally, because it encourages me to write about CSS more and to make better tools, like you do yourself. Folks, seriously, if you are not using Polypane yet, you’re missing out.
 (sponsored)  [
![](https://www.projectwallace.com/_app/immutable/assets/polypane-banner.mjH75nLq.png)](https://polypane.app/?utm_source=projectwallace&utm_medium=the-css-selection-2026&utm_content=banner-image) See every breakpoint. Catch every accessibility issue. Make your site work for everyone.
 [Polypane](https://polypane.app/?utm_source=projectwallace&utm_medium=the-css-selection-2026&utm_content=banner-text) is a development browser that shows your site in multiple viewports at once, with built-in tools to test accessibility
		(WCAG violations, color contrast, DOM structure), performance metrics, layout debugging, and meta tag validation. Thousands of developers trust Polypane to build sites that work beautifully for everyone without constant
		tab-switching and browser resizing. [Start Your Free Trial  No credit card needed](https://polypane.app/?utm_source=projectwallace&utm_medium=the-css-selection-2026&utm_content=banner-button) 
## [Research method](https://www.projectwallace.com/the-css-selection/2026#research-method)
 
This article used the following methodology:
 - Use the [Majestic Million list](https://majestic.com/reports/majestic-million) to get the top ~100,000 website domains to scrape, although in practice it turned out to be more than 200,000 websites because a lot of them errored or blocked the scraper.
 - Run a [CSS Scraper](https://github.com/nl-design-system/theme-wizard/tree/main/packages/css-scraper) [(v1.0.2)](https://github.com/nl-design-system/theme-wizard/releases/tag/%40nl-design-system-community%2Fcss-scraper%401.0.2) to get the CSS for the homepage of each of those domains. Only homepages were analyzed, no deeper URLs. All CSS is collected into a single string for analysis.
 - Use [@projectwallace/css-analyzer](https://github.com/projectwallace/css-analyzer) ([v7.6.3](https://github.com/projectwallace/css-analyzer/releases/tag/v7.6.3)) to analyze the CSS.
 - Analysis is stored in a local SQLite database and SQL queries are used to gather unique values, medians, percentiles, min, max etc.
 - No AI was used to write this content. If you think it’s slop, it’s simply because I’m a lousy writer. Some AI was used to generate the SQL queries to generate the data but they were all checked by my human eyes.
 
All conclusions and opinions are mine, a mere mortal with an above-average interest in looking at CSS in a different way than most people do. You may not agree, and that’s fine.