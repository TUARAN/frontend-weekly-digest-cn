原文：An Exploit ... in CSS?!
翻译：TUARAN
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## CSS 里……居然也能有漏洞利用？！

好，先深呼吸一下。

在你用下表确认自己的浏览器没有受影响之后，我们再来开心地理解这个漏洞是怎么回事。

**基于 Chromium 的浏览器** | **我安全吗？**
---|---
Google Chrome | 确保你运行的是 **145.0.7632.75 或更高版本**。进入 **Settings > About Chrome** 并检查更新。
Microsoft Edge | 确保你运行的是 **145.0.3800.58** 或更高版本。点击窗口最右侧的三个点（…）。点击 **Help and Feedback > About Microsoft Edge**。
Vivaldi | 确保你运行的是 **7.8** 或更高版本。点击左上角的 **V 图标**（菜单），选择 **Help > About.**
Brave | 确保你运行的是 **v1.87.188** 或更高版本。点击右上角的汉堡菜单，选择 **Help > About Brave.**

所以，你更新了浏览器，还顺便祈祷了一下。当你终于又能把一句话完整说出来时，你的第一个问题是：*CSS 真的“荣幸”地成为了 2026 年* [*Chromium 系浏览器的首个零日漏洞利用*](https://nvd.nist.gov/vuln/detail/CVE-2026-2441) *的原因吗？*

我的意思是，[Chrome 的更新通道公告](https://chromereleases.googleblog.com/2026/02/stable-channel-update-for-desktop_13.html)说他们修复了一个高危漏洞，描述为“[u]ser after free in CSS”（CSS 中的 use-after-free）……而且还是在 13 号星期五！一个描述和日期都这么“邪门”的发布你都不信，那还能信啥？Google 将该漏洞报告归功于安全研究员 Shaheen Fazim。这位老哥的 LinkedIn 显示他是[职业漏洞猎人](https://www.linkedin.com/in/shaheenfazim/)，而我觉得他完全配得上[最高等级的漏洞赏金](https://bughunters.google.com/about/key-stats)，因为他发现的东西，连[政府机构](https://nvd.nist.gov/vuln/detail/CVE-2026-2441)都在说：“在 145.0.7632.75 之前的 Google Chrome 中，CSS 里存在问题，允许远程攻击者通过精心构造的 HTML 页面在沙箱内执行任意代码。”

### [](https://css-tricks.com/an-exploit-in-css/#aa-is-this-really-a-css-exploit)这真的是一个 CSS 漏洞利用吗？

总觉得哪里不对劲。甚至[这位安全研究员都强烈主张用 CSS 而不是 JavaScript](https://lyra.horse/blog/2025/08/you-dont-need-js/)，这样她那些注重安全的读者在看她博客时就不需要启用 JavaScript。她信任 CSS 的安全性——尽管她对 CSS 的理解已经深到能做出一个[纯 CSS 的 x86 模拟器](https://lyra.horse/x86css/)（题外话：卧槽）。到目前为止，我们大多数人都默认：[CSS 里可能存在的安全问题](https://css-tricks.com/css-security-vulnerabilities/)相对温和。我们不至于突然活在一个 CSS 能劫持别人操作系统的世界里吧？

不过在我看来，把这个 bug 描述成 Chrome 里的 CSS exploit（CSS 漏洞利用）的那些标题有点标题党，因为它们让人以为这是“纯 CSS 漏洞利用”，好像只要恶意 CSS 和 HTML 就足够完成攻击似的。说实话，我早上赶着出门坐火车上班之前第一次扫这些文章时，那些措辞让我脑补出类似这样的恶意 CSS：

```css
.malicious-class {
  vulnerable-property: 'rm -rf *';
}
```

在我那种由错误认知催生的、虚构的噩梦版本里，某种这样的 CSS 可以被“精心构造”出来，把那条 shell 命令注入到某个会在受害者机器上执行的地方。即便我更认真地重读那些报告，它们仍然让人觉得有意误导——而且不只是我这么觉得。我那位注重安全的朋友问我的第一句话就是：“可是……CSS 不是很容易被严格校验吗？”然后我继续深挖，发现这个漏洞的 [proof of concept](https://github.com/huseyinstif/CVE-2026-2441-PoC) 里，CSS 根本不是恶意的那部分，所以做 CSS 校验也帮不上忙！

更加深误解的是，[SitePoint 关于 CVE-2026-2441 的文章](https://www.sitepoint.com/zero-day-css-cve-2026-2441-security-vulnerability/)离谱地对读者撒谎：它描述的其实是另一个中危 bug——通过在 CSS 里加载图片，把输入框的渲染值发送到恶意服务器。那根本不是这个漏洞。

从“漏洞利用”的意义上说，它并不算真正的 CSS exploit，因为真正利用这个 bug 的部分是 JavaScript。我承认：制造出让恶意脚本能够发动这次攻击所需条件的那行代码，确实在 [Google Chrome 的 Blink](https://developer.chrome.com/docs/web-platform/blink) CSS 引擎组件里，但参与其中的 CSS 并不是恶意部分。

### [](https://css-tricks.com/an-exploit-in-css/#aa-so-how-did-the-exploit-work)那么，这次漏洞利用是怎么运作的？

这次漏洞与 CSS 的关联，在于 Chrome 渲染引擎把某些 CSS 转换为 [CSS 对象模型（CSS object model）](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model)的方式。看看下面这段 CSS：

```css
@font-feature-values VulnTestFont {
  @styleset {
    entry_a: 1;
    entry_b: 2;
    entry_c: 3;
    entry_d: 4;
    entry_e: 5;
    entry_f: 6;
    entry_g: 7;
    entry_h: 8;
  }
}
```
```

当这段 CSS 被解析时，一个 [`CSSFontFeaturesValueMap`](https://developer.mozilla.org/en-US/docs/Web/API/CSSFontFeatureValuesMap) 会被添加到 `document.styleSheets[0].cssRules` 中的 [`CSSRule`](https://developer.mozilla.org/en-US/docs/Web/API/CSSRule) 对象集合里。Chrome 在管理作为 `CSSFontFeaturesValueMap` 的 JavaScript 表示底层数据结构 `HashMap` 的内存时存在一个 bug，意外地让恶意脚本能够访问本不应访问的内存。仅凭这一点本身不足以造成除浏览器崩溃以外的危害，但它可以作为 [Use After Free（UAF，释放后使用）漏洞利用](https://learn.snyk.io/lesson/use-after-free/?ecosystem=cpp) 的基础。

Chrome 对该补丁的描述提到，“Google 已知 CVE-2026-2441 的漏洞利用已在野外出现”，不过出于显而易见的原因，他们对完整端到端利用的细节讳莫如深。令人担忧的是，**[`@font-feature-values`](https://css-tricks.com/almanac/rules/f/font-feature-values/)** 并不新——从 2023 年初起就已经可用——但端到端的 UAF 漏洞利用被发现可能是最近的事。比较合理的推测是：引入这一可利用可能性的代码早就存在，只是直到最近才有人成功做出了可用的漏洞利用。如果你看看这篇关于 2020 年 Chrome 中 [WebAudio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) 里一处释放后使用漏洞的[详细解析](https://github.blog/security/vulnerability-research/exploiting-a-textbook-use-after-free-security-vulnerability-in-chrome)，你会感觉到：要让 UAF 漏洞利用真正跑通，“访问已释放内存”只是拼图中的一块。现代操作系统会[设置很多攻击者必须跨过的门槛](https://en.wikipedia.org/wiki/Address_space_layout_randomization)，这会让这类攻击变得相当困难。

这类漏洞在现实世界中的案例往往会非常复杂，尤其是在 Chrome 的漏洞里，你只能通过间接方式触发底层语句。但如果你了解 C，并希望通过一个简化示例理解基本原理，你可以[试试这个编程挑战](https://ctftime.org/writeup/34455)。另一个帮助理解这些概念的方法是阅读这篇关于近期 Chrome `CSSFontFeaturesValueMap` 漏洞利用的 [Medium 文章](https://infosecwriteups.com/they-hacked-the-css-inside-chromes-first-zero-day-of-2026-cve-2026-2441-d6087cedae2d)，其中有个很形象的类比：指向对象的[指针](https://en.wikipedia.org/wiki/Pointer_(computer_programming) 就像一根牵引绳——即使你已经把狗放走（释放）了，你手里还攥着绳子；但攻击者把绳子另一头拴到一只猫身上（这被称为 [type confusion（类型混淆）](https://learn.snyk.io/lesson/type-confusion/?ecosystem=javascript)）。于是当你命令你的“狗”去叫时，攻击者早已把“叫”这条指令训练成让猫去执行某些恶意行为。

### [](https://css-tricks.com/an-exploit-in-css/#aa-the-world-is-safe-again-but-for-how-long)世界又安全了，但能持续多久？

我前面提到 Chrome 做的那条“一行修复”，就是修改 Blink 的代码：不再使用指向底层 [`CSSFontFeaturesValueMap`](https://developer.mozilla.org/en-US/docs/Web/API/CSSFontFeatureValuesMap) 所依赖 `HashMap` 的指针，而是对该 `HashMap` 使用[深拷贝](https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy) 来进行处理，这样就不可能引用到已释放的内存。相比之下，Firefox 似乎[用 Rust 重写了其 CSS 渲染器](https://hacks.mozilla.org/2017/08/inside-a-super-fast-css-engine-quantum-css-aka-stylo/)，因此往往能自动处理内存管理。Chromium 也[从 2023 年开始支持使用 Rust](https://security.googleblog.com/2023/01/supporting-use-of-rust-in-chromium.html)。其中提到的动机之一是“**更安全**（整体 C++ 更少、更不复杂，沙箱中也不会出现内存安全漏洞）”，以及“**提升 Chrome 的安全性**（增加不含内存安全漏洞的代码行数、降低代码的缺陷密度）”。鉴于这类 UAF 漏洞利用在 Chromium 多年来似乎反复出现，而且这类漏洞一旦被发现往往属于高危级别，也许需要一种更全面的防御思路来应对这类问题，这样我就不用再用类似的文章来吓你了。