原文：Quick tip: hosting HTML/CSS/JS demos from source code on GitHub Pages  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 小技巧：在 GitHub Pages 上从源码托管 HTML/CSS/JS Demo

2026 年 2 月 28 日，星期六 12:36 pm

你知道吗？你可以在 GitHub 上托管 HTML/CSS/JS 的 Demo，并且同时实现可执行预览和源码展示。你所需要的只是：在一个 Markdown 文件里写几条 include 命令，再把你的 html/css/js 文件放到一个文件夹里即可。

[![](https://christianheilmann.com/wp-content/uploads/2026/02/code-demo.png)](https://christianheilmann.com/wp-content/uploads/2026/02/code-demo.png)

在这里试试：<https://codepo8.github.io/code-hosting-demo/example/>

在这里查看源码：<https://codepo8.github.io/code-hosting-demo/example/index.md>

```md
# My Code Demo

## Try it out
{% include_relative demo.html %}
<style>{% include_relative styles.css %}</style>
<script>{% include_relative script.js %}</script>

## HTML / JavaScript / CSS
通过 `{% include_relative ... %}` 将源码片段直接嵌入页面。
```

## 如何实现

你可以先从 [fork 这个示例仓库](https://github.com/codepo8/code-hosting-demo/) 开始。

为了能看到 Demo 被渲染出来，你需要开启 GitHub Pages 以及构建流程：

1. 进入仓库的 Settings（设置），然后在二级导航中进入 Pages：

![](https://codepo8.github.io/hosting-on-github-template/images/settings-pages.png)

2. 在 `Build and deployment`（构建与部署）下选择 `Deploy from a branch`（从分支部署），选择 `main` 分支和 `root`（根目录）文件夹，然后点击保存。

![](https://codepo8.github.io/hosting-on-github-template/images/github-pages.png)

这会触发页面的构建。

3. 在主导航中打开 `Actions` 标签页，查看页面构建过程。

![](https://codepo8.github.io/hosting-on-github-template/images/actions.png)

构建过程中会显示一个黄色的动态圆点。完成后会变成绿色的对勾。如果出现问题，会显示错误图标并解释哪里出了错。一旦变成绿色，你的改动就已经上线了。

4. 当页面构建完成后，你可以在 `Pages` 区域看到它已经被部署。

![](https://codepo8.github.io/hosting-on-github-template/images/published-page.png)

现在，你的页面已经可以在 Web 上访问，并且是一个支持 HTML/CSS/JS 的运行环境。比如这个示例地址是：<https://codepo8.github.io/code-hosting-demo/>。

它的 URL 结构是 `https://{{user}}.github.io/{{repository_name}}/`，对应的仓库地址是 `https://github.com/{{user}}/{{repository_name}}`。

下一步将是把页面的样式做得不同于 GitHub 默认显示的样子。敬请期待第 2 部分。

---

（以下为原文中的分享链接与作者推广内容）

## 通讯（Newsletter）

看看我每周为 WeAreDevelopers 撰写的 [Dev Digest Newsletter](https://www.wearedevelopers.com/about/newsletter)。最近几期包括：

- [Don't stop thinking, AI Slop vs. OSS Security, rolling your own S3](https://newsletter.wearedevelopers.com/201)  
  尽管有 AI，你仍然需要思考；构建 AI 产品的痛苦教训；AI 生成垃圾内容 vs. 开源软件安全；以及 pointer pointer……

- [200: Building for the web, what's left after rm -rf & 🌊🐴 vs AI](https://newsletter.wearedevelopers.com/200)  
  执行一次 rm -rf 之后还剩下什么？为什么 LLM 会知道海马 emoji？你应该使用哪些图片格式？你的车有多隐私？

- [Word is Doomed, Flawed LLM benchmarks, hard sorting and CSS mistakes](https://newsletter.wearedevelopers.com/199)  
  识别 LLM 基准测试的缺陷；了解为什么排序很难；如何在 Word 里运行 Doom；以及如何像经理一样说“不”。

- [30 years of JS, Browser AI, how attackers use GenAI, whistling code](https://newsletter.wearedevelopers.com/198)  
  学习如何在浏览器中使用 AI 而不是在云端；为什么 AI 会犯与人类不同的错误；以及去“吹口哨”写点代码！

- [197: Dunning-Kruger steroids, state of cloud security, puppies>beer](https://newsletter.wearedevelopers.com/197)

## 我的其他作品（My other work）

- [The Developer Advocacy Handbook](https://developer-advocacy.com/)  
  - [在 Amazon 购买](https://www.amazon.com/dp/B0BKNTPDFJ/)  
  - [在 Leanpub 购买](https://leanpub.com/developer-advocacy-handbook)

- Skillshare 课程：  
  - [Tools and Tips to Optimize Your Workflow as a Developer](https://skl.sh/3uKu5G1)  
  - [Tools for Improving Product Accessibility](https://skl.sh/3eCFWRR)  
  - [The JavaScript Toolkit: Write Cleaner, Faster & Better Code](https://skl.sh/2CpiTGZ)  
  - [Demystifying Artificial Intelligence: Understanding Machine Learning](https://skl.sh/2MHkYl1)
