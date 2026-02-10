# You Know What? Just Don&#8217;t Split Words into Letters — Adrian Roselli

# You Know What? Just Don&#8217;t Split Words into Letters

		
		
		February 5, 2026; [0 Comments](https://adrianroselli.com/2026/02/you-know-what-just-dont-split-words-into-letters.html#Comments)
		
        
This is an unplanned part two for [Barriers from Links with ARIA](https://adrianroselli.com/2026/01/barriers-from-links-with-aria.html). The title reflects my exasperation because this isn&#8217;t new, I&#8217;ve simply failed to be explicit about it over the last decade or so.



In 2012 [I vented about TypeButter](https://xcancel.com/aardrian/status/184979227232309248) using `<kern style="letter-spacing: -0.01em;">` for each letter. In 2020 [I noted the AWWWards site](https://xcancel.com/aardrian/status/1220115927011938309) wrapped every letter in a `<div>` for animation, which screen readers presented letter by letter. In 2022, [it was BeeLine Reader](https://xcancel.com/aardrian/status/1494400740286246917) using `<span>`s to achieve gradients across a word.



In 2026 I am finally writing about it because GSAP has its [SplitText plug-in asserting screen reader support](https://gsap.com/docs/v3/Plugins/SplitText/#screen-reader-accessibility) that doesn&#8217;t stand up to use. I appreciate the [embedded video](https://youtu.be/L1afzNAhI40?t=821) explains how it should work, and even includes an unnamed screen reader demo, but GSAP assumes authors will use SplitText in a very specific way and fails to note potential problems. That&#8217;s a bummer because now I have to be the buzzkill.






## GSAP&#8217;s Demo



This is the animation demo on the SplitText page (or go to the [debug view](https://cdpn.io/GreenSock/debug/xxmaNYj) if you want to test it):



      See the Pen 
  SplitText Demo by GSAP ([@GreenSock](https://codepen.io/GreenSock))
  on [CodePen](https://codepen.io/).
      
      


I also [made a fork](https://codepen.io/aardrian/pen/dPXjgwG), just in case GSAP changes the code later (which would mess with future testing).



The simplest way to test this is to fire up a screen reader and try navigating the page with whatever method you prefer. You may get different results than I did, but that&#8217;s the fun of testing! Though I did get confirmation [from one](https://dragonscave.space/@MostlyBlindGamer/116014749485642673), [then another](https://node.isonomia.net/@modulux/statuses/01KGNCVAG4WQH82FA6SDZ075P3), [then a third](https://dragonscave.space/@menelion/116014953936550552) screen reader user.



If you press the &#8220;Characters&#8221; button, this is the HTML output of the first line of text (which is in its own `<div>`):


<div aria-hidden="true" style="position: relative; display: block; text-align: center;">
  <div aria-hidden="true" style="position: relative; display: inline-block;">
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">B</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">r</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">e</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">a</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">k</div>
  </div>
  <div aria-hidden="true" style="position: relative; display: inline-block;">
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">a</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">p</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">a</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">r</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">t</div>
  </div>
  <div aria-hidden="true" style="position: relative; display: inline-block;">
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">H</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">T</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">M</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">L</div>
  </div>
  <div aria-hidden="true" style="position: relative; display: inline-block;">
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">t</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">e</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">x</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">t</div>
  </div>
  <div aria-hidden="true" style="position: relative; display: inline-block;">
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">i</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">n</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">t</div>
    <div aria-hidden="true" style="position: relative; display: inline-block; translate: none; rotate: none; scale: none; opacity: 1; transform: translate(0px);">o</div>
  </div>
</div>


Five words.





## The ARIA Non-Solution



The demo uses a [`<div>`, which in the HTML AAM maps to the `generic` role](https://www.w3.org/TR/html-aam-1.0/#el-div). The problem here is that the [`generic` role does not allow itself to be named by the author](https://w3c.github.io/aria/#namefromprohibited) — which means [`aria-label` is prohibited on it](https://w3c.github.io/aria/#aria-label).



The [example code GSAP offers](https://gsap.com/docs/v3/Plugins/SplitText/#built-in-aria), however, shows headings instead ([which allow `aria-label`](https://w3c.github.io/aria/#heading)). It makes no mention of the restrictions on which roles allow `aria-label`. An author might think nothing of using `aria-label` on a `<div>`. Kind of like the embedded GSAP demo.



When `aria-label` is used on an element that allows it, the GSAP page makes no mention of other risks. I&#8217;ve repeatedly said [`aria-label` may not auto-translate for users](https://adrianroselli.com/2019/11/aria-label-does-not-translate.html). It also doesn&#8217;t talk about [WCAG SC 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) risks when `aria-label` is applied to any control.




## Hiding Content



Kind of a nitpick, but the GSAP page links to a CSS-Tricks post that itself simply links to Scott&#8217;s [Inclusively Hidden](https://www.scottohara.me/blog/2017/04/14/inclusively-hidden.html) post. Scott&#8217;s post got an update in 2023. CSS-Tricks&#8217; post did not. I consider that a disservice to both Scott and readers.





## Videos



I hate making these videos. It takes so much time. But it&#8217;s evidence. Or proof. Or something.





 
  
  
  Sorry, your browser doesn’t support embedded videos, but don’t worry, you can [download it](https://adrianroselli.com/wp-content/uploads/2026/02/SplitText-NVDA.mp4). The [caption file](https://adrianroselli.com/wp-content/uploads/2026/02/SplitText-NVDA.vtt) is also available in case your video player can import it.
 
 NVDA 2025.3.2 with Firefox 147.0.2. The text is announced both before and after animation.






 
  
  
  Sorry, your browser doesn’t support embedded videos, but don’t worry, you can [download it](https://adrianroselli.com/wp-content/uploads/2026/02/SplitText-JAWS.mp4). The [caption file](https://adrianroselli.com/wp-content/uploads/2026/02/SplitText-JAWS.vtt) is also available in case your video player can import it.
 
 JAWS 2026.2512.50 with Chrome 144. The text is never announced.






 
  
  
  Sorry, your browser doesn’t support embedded videos, but don’t worry, you can [download it](https://adrianroselli.com/wp-content/uploads/2026/02/SplitText-Narr.mp4). The [caption file](https://adrianroselli.com/wp-content/uploads/2026/02/SplitText-Narr.vtt) is also available in case your video player can import it.
 
 Narrator Win 11 25H2 26200.7623 with Edge 144. Only the first letter of the text is ever announced.






 
  
  
  Sorry, your browser doesn’t support embedded videos, but don’t worry, you can [download it](https://adrianroselli.com/wp-content/uploads/2026/02/SplitText-VO.mp4). The [caption file](https://adrianroselli.com/wp-content/uploads/2026/02/SplitText-VO.vtt) is also available in case your video player can import it.
 
 VoiceOver macOS 26.2 with Safari 26.2. Only a sub-set of the letters is exposed, and those are read letter-by-letter. This video is more sloppy owing to not feeding the audio properly and an electrician poking holes in my walls.






 
  
  
  Sorry, your browser doesn’t support embedded videos, but don’t worry, you can [download it](https://adrianroselli.com/wp-content/uploads/2026/02/SplitText-Orca.mp4). The [caption file](https://adrianroselli.com/wp-content/uploads/2026/02/SplitText-Orca.vtt) is also available in case your video player can import it.
 
 Orca Ubuntu 25.04 with Firefox 146. The text is announced both before and after animation.








I was going to make videos for VoiceOver iPadOS with Safari, TalkBack with Chrome, and TalkBack with Firefox, but I got tired. If you&#8217;ve been reading my blog long enough, then [you should know the commands to give it a try](https://adrianroselli.com/2022/11/your-accessibility-claims-are-wrong-unless.html#SRs).



Similarly, you can [pop open the Braille viewers on the desktop](https://adrianroselli.com/2023/01/jaws-nvda-and-voiceover-braille-viewers.html) and see how those perform.







## Results



I&#8217;ve reduced these to a binary yes/no. I also added mobile results, for which I made no videos.



 SplitText in Screen Readers
 
  Pairing
  Works?
 
 
  NVDA / Firefox
  yes
 
 
  JAWS / Chrome
  ❌no
 
 
  Narrator / Edge
  ❌no
 
 
  VO macOS / Safari
  ❌no
 
 
  Orca / Firefox
  ❌no
 
 
  TalkBack / Chrome
  yes
 
 
  TalkBack / Firefox
  ❌no
 
 
  VO iPadOS / Safari
  ❌no
 





## Bug Report



This post is a warning to authors. I&#8217;ve also filed an issue with GSAP asking the SplitText page to clarify the risks and limitations: [#642 Screen Readers do not expose SplitText](https://github.com/greensock/GSAP/issues/642) 




I don&#8217;t expect them to be able to jump on the bug report immediately, and they will almost definitely want to perform further testing. So until they can tackle it, I strongly recommend avoiding SplitText.








## Wrap-up



If you need to split words into their constituent letters in order to adjust kerning, give them gradients, animate them, or whatever, well, no you don&#8217;t. Find another method.



If the GSAP people who guaranteed their approach works with screen readers got it wrong, it seems likely you will too. Unless you have all the screen reader, browser, platform, and TTS variations along with the screen reader navigation skills needed to perform ongoing and robust testing.



Which you don&#8217;t.












## Update: Same Damn Day



 
  
  Sorry, your browser doesn’t support embedded videos, but don’t worry, you can [download it](https://adrianroselli.com/wp-content/uploads/2026/02/ui-dot-shit.mp4).
 
 Turn your terminal into is completed letter by letter first with an interface designer, which is deleted letter by letter and replaced with a frontend wizard, and then replaced by an accessibility expert. The browser dev tools show it&#8217;s all in a `<span>` with an `aria-label`.



The makers of Tailwind, dissatisfied with pushing verbose class names on human authors only, have decided to target LLMs with [ui.sh](https://ui.sh/) (pronounced &#8220;wish&#8221;). While this [hilarious](https://front-end.social/@mayank/116015669183729724), [non-parody](https://toot.cafe/@thomaswilburn/116019993666382011) home page doesn&#8217;t make the mistake of wrapping every letter in its own element, it does make the mistake of using `aria-label`.



I&#8217;ve decided it warrants a mention here.



The good news is this will help guarantee the need for human accessibility practitioners over poorly-trained LLMs.






		
						
## Tags

			
			[accessibility](https://adrianroselli.com/tag/accessibility), [ARIA](https://adrianroselli.com/tag/aria), [html](https://adrianroselli.com/tag/html), [standards](https://adrianroselli.com/tag/standards), [WCAG](https://adrianroselli.com/tag/wcag)			

			
## Other Posts

      
  			
			[Earlier post: Barriers from Links with ARIA](https://adrianroselli.com/2026/01/barriers-from-links-with-aria.html)
			
  			
			[More recent post: Honoring Mobile OS Text Size](https://adrianroselli.com/2026/02/honoring-mobile-os-text-size.html)
			      

		
									
		
		

			
## No comments? Be the first!

	
		
### Leave a Comment or Response [Cancel response](https://adrianroselli.com/2026/02/you-know-what-just-dont-split-words-into-letters.html#respond)

Comment: 
- The form doesn’t support Markdown.
- This form allows limited HTML.
- Allowed HTML elements are `<a href>`, `<blockquote>`, `<code>`, `<del>`, `<em>`, `<ins>`, `<q>`, `<strong>`, and maybe some others. WordPress is fickle and randomly blocks or allows some.
 - If you want to include HTML *examples* in your comment, then HTML encode them. E.g. `<code>&lt;div&gt;</code>` (you can copy and paste that chunk).

Name * 

Email * 

Website 

 

&#916;