> 原文：[Axe DevTools for Web now includes Axe MCP Server for earlier fixes and faster delivery](https://www.deque.com/blog/axe-devtools-for-web-now-includes-axe-mcp-server-for-earlier-fixes-and-faster-delivery/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Axe DevTools for Web 现已包含 Axe MCP Server

Deque 宣布：Axe MCP Server 现已作为 Axe DevTools for Web 套件的一部分提供，且无需额外费用。目标是把可访问性问题更早发现、更早修复，从而减少返工并提升交付速度。

![](https://www.deque.com/wp-content/uploads/2026/02/02.11.26-AI-announcement-MCP-Server-scaled.png)

文章提到，Axe MCP Server 最早在 Axe-con 2025 亮相；现在正式面向全部 Axe DevTools for Web 客户开放。

> “我们已经看到在 IDE 中接入 Axe MCP Server 的客户获得了非常积极的反馈。把 Axe MCP Server 纳入 Axe DevTools for Web 后，开发者可以在软件生命周期更早阶段参与可访问性修复，同时继续使用现有工具与偏好的 AI 编码 Agent。”
> —— Dylan Barrell（Deque CTO）

## 在开发者所在位置提供可信指导

原文这一节的核心是：把可访问性能力嵌入现有开发工作流，而不是额外增加流程负担。

### 与现有开发工具对齐，提高采用率

Axe MCP Server 可与支持 MCP 的工具协同使用，包括 GitHub Copilot、Cursor、Claude Code、VS Code 等。

通过在开发环境中配置对 Axe MCP Server 的调用，团队可以自动校验可访问性修复结果，减少手工步骤，降低摩擦并提升采用率。

### 通过真实测试给出可信修复建议

文章强调：想在开发早期修好无障碍问题，必须基于“真实渲染结果”做测试。

Axe MCP Server 直接连接 Axe Platform，把企业级准确性与真实浏览器测试能力带入开发流程。同时还能连接 Deque University 知识库，输出与标准对齐的修复指导。

![](https://www.deque.com/wp-content/uploads/2026/02/axe-platform-mcp-overview-2.png)

### 一个 AI 提示完成分析、修复与验证

作者给出的理想流程是：通过一次 AI 提示触发编码 Agent 调用 Axe MCP Server，完成

- 代码分析与测试
- 修复建议
- 修复后的验证

这样可以更早闭环可访问性测试流程，并以更高确定性完成修复。

## 影响：更早、可扩展、与团队工作流一致

如果可访问性问题没有在开发期处理，通常会流入生产环境，修复成本更高，合规风险也更大。

将 Axe MCP Server 纳入 Axe DevTools for Web 后，团队可以在保持现有开发方式不变的前提下，把可信的 Axe 能力前移到开发阶段，形成“更早修复 + 更少返工”的交付路径。

原文还提到，这只是开始：后续会继续把 Axe Platform 的更多能力（如 AI 驱动的智能引导测试与更高级自动化规则）通过 AI Agent 接口带入开发生命周期，以扩大自动化覆盖。

不论你已经在用 Axe DevTools for Web，还是正在评估，都可以通过官方 Demo 进一步了解：

- https://accessibility.deque.com/request-a-demo?utm_campaign=mcp-server

