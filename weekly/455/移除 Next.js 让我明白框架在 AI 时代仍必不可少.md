原文：Removing Next.js Taught Me Why Frameworks Are Still Essential Even for AI  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 移除 Next.js 让我明白：即使在 AI 时代，框架依然必不可少

[![](https://storage.googleapis.com/zenn-user-upload/avatar/763edd70bf.jpeg)zima](https://zenn.dev/smartvain)

#### AI 翻译
下方内容为 AI 生成的翻译。这是一个实验性功能，可能包含错误。[查看原文](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth)🪓

# 移除 Next.js 让我明白：即使在 AI 时代，框架依然必不可少

发表于 2026/02/08

[](https://twitter.com/intent/tweet?url=https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth&text=Removing%20Next.js%20Taught%20Me%20Why%20Frameworks%20Are%20Still%20Essential%20Even%20for%20AI%EF%BD%9Czima&hashtags=zenn)[](http://www.facebook.com/sharer.php?u=https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth)[](https://b.hatena.ne.jp/add?mode=confirm&url=https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth&title=Removing%20Next.js%20Taught%20Me%20Why%20Frameworks%20Are%20Still%20Essential%20Even%20for%20AI%EF%BD%9Czima)

[![](https://storage.googleapis.com/zenn-user-upload/topics/23eef6d9d7.png)AI](https://zenn.dev/topics/ai)
[![](https://storage.googleapis.com/zenn-user-upload/topics/d87ff27d89.png)Next.js](https://zenn.dev/topics/nextjs)
[![](https://zenn.dev/images/topic.png)フレームワーク](https://zenn.dev/topics/%E3%83%95%E3%83%AC%E3%83%BC%E3%83%A0%E3%83%AF%E3%83%BC%E3%82%AF)
[![](https://storage.googleapis.com/zenn-user-upload/topics/bf0d437ae5.png)Claude Code](https://zenn.dev/topics/claudecode)
[![](https://static.zenn.studio/images/drawing/tech-icon.svg)tech](https://zenn.dev/tech-or-idea)

“我们真的还需要框架吗？”

我在刷 Hacker News 的一个讨论串时，突然停住了。

*“Coding agent 已经替代了我用过的每一个框架。”*

评论区吵翻了：“把活交给 Claude Code，React 甚至都不需要了”，“纯 HTML 和原生 JS 就够”，“框架是用来弥补人类认知上限的，但 AI 没有这些限制”——。

说实话，我完全能理解。

最近我用 Claude Code 做个人项目时，也会有一些瞬间：想到 Next.js 的目录结构、App Router 的各种约定，就忍不住疑惑：“我到底是为了谁在遵守这些？”如果 agent 能把所有东西都写出来，那框架这些“最佳实践”是不是反而成了负担？——

[](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#introduction)

## 引言

先把结论放在最前面：**我真的把 Next.js 拆掉、用纯 HTML 重写之后，得出的结论恰恰相反——“正因为我们身处 agent 时代，框架才更有必要。”**

这篇文章记录了那次实验的过程；也许，它会对那些正在“无框架论”边缘摇摆的人有所帮助。

[](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#stripping-away-next.js%E2%80%94the-beginning-of-the-problem)

## 拆掉 Next.js——问题的开始

导火索很简单。我在考虑替换一个自己维护的内部工具（一个仪表盘系统）时，脑子里突然冒出一个念头。

“既然我有 Claude Code，那纯 HTML + 原生 JS 不就够了吗？”

于是我决定做个实验，把一个用 Next.js 构建的现有项目“去框架化”。

我做了这些替换：

`next/router` → 直接调用 History API

`next/image` → `<img>` + 懒加载属性

`getServerSideProps` → 用 Express 自己写 API + fetch 调用  
- 基于文件的路由 → 自己写一张路由表

- CSS Modules → 普通 CSS（BEM 命名法）

我一边给 Claude Code 提供上下文，一边推进：“把这个 Next.js 页面改成不依赖框架的 HTML/JS/CSS。”我这样要求。

agent 转得很顺畅。确实能跑。**能跑是能跑，但——。**

第一个异常出现在第三天。

当我想加路由时，Claude Code 生成的代码里，路由定义的位置和我前一天写的不一样。我把路由统一放在了 `routes.js`；但 agent 却把它写在了每个 HTML 文件的 `<script>` 标签里，直接内联。

“算了，我给它明确指令就能改。”我这么想，于是要求它修正。它也修好了。

但第二天，同样的事又在另一个地方发生了。这次是 API client 的位置变得四处分散。我本来想把它集中在 `utils/api.js`，但新页面里却直接调用了 `fetch`。

就在那一刻，我开始意识到：

**框架一消失，“代码该放在哪里”的规则也跟着消失了。**

[](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#public-reaction%E2%80%94the-%22anti-framework%22-vs.-%22pro-framework%22-camps)

## 公众反应——“反框架派” vs “挺框架派”

关于这个话题，互联网上大致分成两大阵营。

**“反框架派”**通常是这样主张的：

“AI 都能写代码了，学习框架的成本就是浪费。纯 HTML/CSS/JS 就够用。交给 agent，样板代码一瞬间就能生成。”

在前面提到的那个 Hacker News 讨论串里，这基本是主流观点。确实，看 Devin 或 Claude Code 的演示时，它们不被框架约定束缚、用极少的代码快速做出原型的画面，非常有说服力。

另一方面，**“挺框架派”**会这样反驳：

“框架能防止你重复造轮子。安全、性能优化、无障碍这些东西，别低估你自己兜底的成本。”

在 Zenn 上，“我把 Next.js 曾经替我做的事全都自己做了一遍”之类的文章也曾爆火；而且，像“拆掉之后真的很难”的真实反馈，正在获得越来越多人的共鸣。

我觉得这两边说得都有道理。

但坦白讲，它们都和我真实经历的重点，稍微有点偏差。

反框架派所说的“没关系，因为 AI 会写”这件事，在**你只需要写一次**的前提下确实成立。但在进入运维阶段后，情况就不一样了。支持框架派所说的“重复造轮子”也没错，但那并不是问题的本质。

我感受到的问题，完全在别的地方。

[](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#the-third-way%E2%80%94frameworks-were-%22instructions-for-ai%22) 第三条路——框架是给 AI 的“说明书”

用纯 HTML/JS 运行了大约两周后，最难的部分并不是“重复造轮子”。

而是**与智能体之间“感知差距”的不断累积。**

举个例子，在 Next.js App Router 里有一条规则：“在 `app/` 目录下创建文件夹，并在里面放置 `page.tsx`。”对人类来说，这看起来像是一种“必须记住的约定”。

但对智能体而言，并不是这样。

**这是一套非常明确的指令：在创建新页面时，‘该把什么文件放在哪里、文件名叫什么’。**

在纯 HTML/JS 中，这些指令并不存在。因此智能体每次都要自己判断文件该放哪儿。这个判断会偏离我的判断。随着上下文变多，这种偏离出现得越来越频繁。

具体来说，我们对比一下。

当存在 Next.js 时：

```text
app/
  dashboard/
    page.tsx        ← 页面放这里
    loading.tsx     ← Loading UI 放这里
    error.tsx       ← 错误处理放这里
  api/
    users/
      route.ts      ← API endpoint 放这里
```

如果你对智能体说“添加一个用户列表页面”，它就会创建 `app/users/page.tsx`。几乎没有犹豫空间。

在纯 HTML/JS 的情况下：

把什么放哪里？
  pages/users.html?
  views/user-list.html?
  public/users/index.html?
  在 routes.js 里加路由？还是直接写在 app.js 里？
  API client 放 utils/？还是 services/？

**每次都会发生这种问题。**即使你把约定写进 `.cursorrules` 或 `CLAUDE.md`，项目特定规则的“强制力”也不如框架约定那么强。智能体会参考它们，但不会 100% 遵守。

到这里，我意识到了一件事。

我原以为框架约定是为了“帮助人类认知”的东西。但那只对了一半。

**框架约定其实是一种“项目所有参与者（人类和 AI）共同遵守同一套规则来运作的通用语言”。**

[](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#realization%E2%80%94the-value-of-frameworks-has-%22inverted%22) 领悟——框架的价值已经“反转”

通过这次实验，我对框架价值的认知发生了变化。

在人类独自开发的时代，框架的价值主要由三部分构成：

**防止重复造轮子**（路由、状态管理等）

**强制最佳实践**（安全、性能）
- **在团队开发中统一约定**

进入智能体时代后，1 和 2 的价值确实在变薄。Claude Code 可以从零写路由和状态管理，它也知道安全方面的最佳实践（很可能比普通人更懂）。

但是第三点——**“统一约定”——的价值反而在飙升。**

这是因为智能体时代的开发团队是“人类 + AI”的混编团队。

在人与人之间，我们可以依赖默认共识去推断，比如心里会想：“哦，原来这个项目的结构是这样的。”但 AI 智能体无法遵循那些没有被明确写出来的规则。框架约定对 AI 而言，就像是把“隐性知识显性化”。

当我切回 Next.js 继续开发后，体验明显不同了。

“创建 `app/settings/page.tsx`，并在 Server Component 里获取/展示用户设置。”

只凭这一句话，智能体就能在正确的位置生成正确格式的代码，并且与项目中其他页面保持一致。因为框架在充当一种“约束”，**智能体输出的可变性显著降低了。**

例如，看看使用 Next.js Server Actions 的表单处理：

```ts
// app/settings/actions.ts
"use server"

export async function updateSettings(formData: FormData) {
  const name = formData.get("name") as string
  // Validation, DB update...
  revalidatePath("/settings")
}
// app/settings/page.tsx
import { updateSettings } from "./actions"

export default function SettingsPage() {
  return (
    <form action={updateSettings}>
      <input name="name" />
      <button type="submit">Save</button>
    </form>
  )
}
```

只要有诸如“Server Actions 写在 `actions.ts`”以及“页面组件放在 `page.tsx`”这样的规则，就能让智能体的输出变得稳定。**框架约定正在替代提示词工程（prompt engineering）这一点——这是我最大的发现。**

[](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#conclusion%E2%80%94frameworks-are-not-dead%3B-their-roles-are-changing) 结论——框架不会死；它们的角色正在改变

“Coding agents 会杀死框架”——对于这个命题，我的回答如下。

框架不会消亡。但它们存在的理由会改变。

从“为人类提供便利工具”转变为“人类与 AI 协作的通用协议”。

路由实现大概率可以交给智能体。AI 很可能也会很快生成用于图片优化逻辑的最优代码。

但是，“页面放在这里”“API 要这样定义”“状态管理用这种模式”——这些“设计约束”不管团队成员是人还是 AI 都是必要的。事实上，当加入了一个容易“忘记上下文”的 AI 成员之后，显性规则的价值只会更高。

所以，如果你现在觉得“既然有智能体了，框架就不需要了”，我希望你去试试看。试着用智能体配合纯 HTML 开发两周。

我想你会得出和我一样的结论。

**框架并不是“给人类用的辅助轮（training wheels）”。它们是“整个团队的通用语言”。** 而现在 AI 也加入了团队，通用语言的重要性只会增长，绝不会减弱。

——当我把 Next.js 一层层剥离掉时，我才理解它真正的价值。这很讽刺，但我认为这种洞见只有在你真的亲手下场、把手弄脏之后才能看见。

[](<https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#references>) 参考资料

- [编码代理已经取代了我用过的每一个框架 - Hacker News](https://news.ycombinator.com/)

- [Next.js App Router 文档](https://nextjs.org/docs/app)

- [GitHub 热门趋势](https://github.com/trending)

[](<https://twitter.com/intent/tweet?url=https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth&text=Removing%20Next.js%20Taught%20Me%20Why%20Frameworks%20Are%20Still%20Essential%20Even%20for%20AI%EF%BD%9Czima&hashtags=zenn>)[](<http://www.facebook.com/sharer.php?u=https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth>)[](<https://b.hatena.ne.jp/add?mode=confirm&url=https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth&title=Removing%20Next.js%20Taught%20Me%20Why%20Frameworks%20Are%20Still%20Essential%20Even%20for%20AI%EF%BD%9Czima>)[![](<https://storage.googleapis.com/zenn-user-upload/avatar/763edd70bf.jpeg>)](<https://zenn.dev/smartvain>)[zima](https://zenn.dev/smartvain) Web 应用工程师。最近对使用 ComfyUI 进行创作很感兴趣  
[
](https://github.com/smartvain)[](<https://ryuichi-amejima-homepage.vercel.app/>) 赠送徽章以支持作者。获得徽章的作者将从 Zenn 获得现金或 Amazon 礼品卡返还。  
赠送徽章

### 讨论
![](<https://static.zenn.studio/images/drawing/discussion.png>)[![](<https://storage.googleapis.com/zenn-user-upload/avatar/763edd70bf.jpeg>)](<https://zenn.dev/smartvain>)[zima](https://zenn.dev/smartvain)[
](https://github.com/smartvain)[](<https://ryuichi-amejima-homepage.vercel.app/>) Web 应用工程师。最近对使用 ComfyUI 进行创作很感兴趣  
赠送徽章[什么是赠送徽章](https://zenn.dev/faq/badges)目录- [引言](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#introduction)
- [剥离 Next.js——问题的开始](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#stripping-away-next.js%E2%80%94the-beginning-of-the-problem)
- [公众反应——“反框架” vs. “支持框架”两派](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#public-reaction%E2%80%94the-%22anti-framework%22-vs.-%22pro-framework%22-camps)
- [第三条路——框架是“给 AI 的说明书”](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#the-third-way%E2%80%94frameworks-were-%22instructions-for-ai%22)
- [顿悟——框架的价值“倒转”了](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#realization%E2%80%94the-value-of-frameworks-has-%22inverted%22)
- [结论——框架没有死亡；它们的角色正在变化](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#conclusion%E2%80%94frameworks-are-not-dead%3B-their-roles-are-changing)
- [参考资料](https://zenn.dev/smartvain/articles/coding-agent-kills-framework-nextjs-reverse-truth?locale=en#references)