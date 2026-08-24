原文：Modern Web Guidance — a set of skills that embed web platform expertise, best practices, and browser compatibility data directly into your coding agents
链接：<https://developer.chrome.com/docs/modern-web-guidance>
翻译：TUARAN

# Modern Web Guidance：让 AI Agent 写出更现代的 Web 代码

Modern Web Guidance 是一组技能，可将 Web 平台专业知识、最佳实践和浏览器兼容性数据直接嵌入到你的编码代理中。

**使用 `modern-web-guidance` CLI 安装（推荐）：**

```bash
npx modern-web-guidance@latest install
```

[开始使用](https://developer.chrome.com/docs/modern-web-guidance/get-started?hl=zh-cn) | [在 GitHub 上查看](https://github.com/GoogleChrome/modern-web-guidance-src)

---

## 支持你偏好的 AI 编码智能体

你可以将 Modern Web Guidance 与自己喜爱的 AI 编码智能体搭配使用，确保在偏好的工作流程中获得有关现代 Web 最佳实践的指导。

[查看所有安装选项](https://developer.chrome.com/docs/modern-web-guidance/get-started?hl=zh-cn#installation)

### `npx skills`

使用 Vercel 的 Agent Skills 在项目中安装 Modern Web Guidance：

```bash
npx skills add GoogleChrome/modern-web-guidance
```

### Claude Code

为 Claude Code 安装 Modern Web Guidance 技能：

```bash
# 1. 添加市场
/plugin marketplace add GoogleChrome/modern-web-guidance
# 2. 安装插件
/plugin install modern-web-guidance@googlechrome
# 3. 重载插件
/reload-plugins
```

### Copilot CLI

安装适用于 Copilot CLI 的 Modern Web Guidance 技能：

```bash
# 1. 添加市场
/plugin marketplace add GoogleChrome/modern-web-guidance
# 2. 安装插件
/plugin install modern-web-guidance@googlechrome
```

### Antigravity CLI

为 Antigravity CLI 安装 Modern Web Guidance 技能：

```bash
agy plugin install https://github.com/GoogleChrome/modern-web-guidance
```

#### [Google I/O 大会上的 Modern Web Guidance](https://www.youtube.com/watch?v=bo3i0FzDUYo&%3Bhl=zh-cn&hl=zh-cn)

观看 Google I/O 大会上的 Modern Web Guidance 讲座，详细了解这些技能以及它们如何改进 AI 辅助的 Web 开发工作流。

[立即观看](https://www.youtube.com/watch?v=bo3i0FzDUYo&%3Bhl=zh-cn&hl=zh-cn)

---

## 提示可带来更优质的用户体验

在 AI 辅助编码工作流程中，可以尝试以下几个示例提示来调用 Modern Web Guidance，以构建新功能、实现旧代码现代化并加快应用速度。

### 打造全新用户体验

> 创建一个手风琴风格的统计组件，在打开和关闭时平滑动画。
>
> 构建一个标签栏，使用 CSS Anchor Positioning 让高亮滑块跟踪当前项。
>
> 设计一个仪表板卡片，使用容器查询根据其自身宽度自适应布局。

### 对旧代码进行现代化改造

> 将旧版模态窗口实现更新为使用 `<dialog>` 元素，并用现代 CSS 特性为它们添加动画。
>
> 将旧版提示迁移到 Popover API 和 CSS Anchor Positioning。

### 提高安全性

> 使用最新的 WebAuthn 功能实现基于 passkey 的登录流程。
>
> 在不破坏应用的前提下实现一个入门级的 Content Security Policy（CSP）。
>
> 对我的站点进行安全审计并提出改进建议。

### 提升性能

> 设置当用户悬停在重要链接上时开始预加载页面。
>
> 我的应用长任务很多，INP 受到影响，帮我修复。
>
> 帮我改进应用的 LCP。

---

## 将 Modern Web Guidance 技能与 Chrome 开发者工具搭配使用（面向代理）

将 Chrome 开发者工具 for agents 与 Modern Web Guidance 技能相结合，可改进 Web 开发工作流程。运行实时性能审核、检查无障碍树并捕获控制台日志，然后自动应用精确的现代 Web 代码修复。

[了解详情](https://developer.chrome.com/docs/devtools/agents?hl=zh-cn)

---

## 了解如何贡献

你对如何改进 Modern Web Guidance 有任何想法吗？了解如何贡献内容！

[了解详情](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/CONTRIBUTING.md)

---

> 页面顶部标注该页面为 Modern Web Guidance 的**抢先体验版**，并欢迎用户在 GitHub 上提供[贡献或反馈](https://github.com/GoogleChrome/modern-web-guidance-src)。

![Modern Web Guidance 动画 Logo](https://developer.chrome.com/static/docs/modern-web-guidance/image/mwg-animated-logo-noloop.gif?hl=zh-cn)

![DevTools 配图](https://developer.chrome.com/static/docs/modern-web-guidance/image/dtfa-hero.png?hl=zh-cn)
