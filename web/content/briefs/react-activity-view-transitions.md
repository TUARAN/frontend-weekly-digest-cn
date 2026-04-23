---
title: React Activity 和 ViewTransition：这次真的可以扔掉 Framer Motion 吗？
slug: react-activity-view-transitions
date: 2026-04-15
category: 框架决策
tldr: Activity 解决"卸载即丢状态"，ViewTransition 解决"过渡难编排"。两者组合覆盖 70% 的常见场景，但复杂编排和手势驱动动画仍需专门库。
readMinutes: 10
pro: false
tags:
  - React
  - 动画
  - ViewTransition
---

## 事实摘要

- React 19 引入 `<Activity>`，允许组件在"不可见"状态保留内部 state，类似"冷冻"。
- React 的 `<ViewTransition>` 元素把浏览器的 View Transitions API 包装成声明式组件。
- 两者组合后，切换路由 / 切换 Tab / 展开折叠等高频场景可以不依赖动画库。

## 能扔掉动画库的场景

- 路由切换 + 页面级转场
- Tab 切换保留滚动位置与表单状态
- 列表排序 / 增删时的位移动画
- Modal / Drawer 的开合

## 还不能扔掉的场景

- **手势驱动动画**：拖拽、橡皮筋、滑动回弹——这些需要 spring 物理和中断控制。
- **复杂编排**：多元素按序出现、交错停顿、基于滚动进度的连续插值。
- **SVG 逐帧**：ViewTransition 对 SVG 路径变换支持有限。

## 作者判断

- **新项目**：默认只引入原生能力，等到具体场景卡住再加库。
- **存量项目**：不建议立即下掉 Framer Motion，但在新功能里用原生实现，逐步迁移。
- **设计系统**：把 Activity 和 ViewTransition 作为底层原语暴露，动画库作为可选增强。

## 一个容易踩的坑

`<ViewTransition>` 在"首次渲染"不触发动画（浏览器的行为，不是 React 的 bug）。这会让"首屏欢迎动画"类需求仍然需要手动处理，不要指望组件开箱即用。

## 行动建议

1. 在下个迭代里选 2 个场景（推荐：Tab 切换 + 列表重排）用原生能力替换。
2. 测一次 bundle size，Framer Motion 大约 40KB gzipped，这是最直观的收益。
3. 把"哪些场景还必须用库"写进团队的动画规范，避免重复踩坑。

## 延伸阅读

- [React 用 Activity 组件重塑流媒体交互](/weekly/456/React%20用%20Activity%20组件重塑流媒体交互)
- [React 的 ViewTransition 元素](/weekly/451/React%20的%20ViewTransition%20元素/index)
