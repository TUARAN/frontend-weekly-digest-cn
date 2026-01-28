# 适配 AI 的前端架构设计指南

> 原文：[A developer’s guide to designing AI-ready frontend architecture - LogRocket Blog](https://blog.logrocket.com/ai-ready-frontend-architecture-guide/)
>
> 翻译：[嘿嘿](https://blog.heyfe.org/blog)

前端代码已经不仅仅是写给人看的了。

![](./assets/A-developers-guide-to-designing-AI-ready-frontend-architecture.png)

现在的 AI 工具正活跃在我们的代码库中。它们通过嵌入在 [Cursor](https://cursor.com/) 和 [Antigravity](https://antigravity.google/) 等 IDE 中的智能代理，生成组件、提供重构建议并扩展功能。这些工具不只是助手，它们是开发的参与者，而且它们会放大你架构中所有的优缺点。当架构边界模糊时，AI 引入的不一致性会随时间累积，把细小的缺陷滚雪球般变成脆弱的系统，带来实打实的维护成本。

这让糟糕架构的代价变得非常直观。混乱的边界、隐晦的约定，以及那些“大家都懂怎么回事”的默认假设，再也无法被掩盖。当 AI 开始生成代码时，这些坑会自动化地蔓延成技术债。

核心理念其实很简单：前端必须优先考虑**可解释性（Interpretability）**和**可预测性（Predictability）**。AI 并没有我们人类的直觉，也不了解历史背景。它现在是代码库的一等公民消费者。结构混乱不仅会拖慢人类的进度，当 AI 误以为存在某些并不存在的模式，或违反了从未明确定义的规则时，架构就成了累赘。

在这篇文章中，我们将探讨如何设计一套[前端架构](https://blog.logrocket.com/guide-modern-frontend-architecture-patterns/)，将 AI 视为系统中的真正参与者，在保证健壮性的同时，避免写出那种虽然跑得通、但在语义上逐渐偏离预期的代码。

## AI 会放大代码库的弱点

[AI 工具](https://blog.logrocket.com/the-10-best-ai-coding-tools-for-2025/)极其擅长模式匹配，但如果你的模式本身就不统一，它就开始拉胯了。想象一个随处可见的前端代码库：处理表单提交，一个组件里叫 `handleSubmit`，另一个叫 `onFormSubmit`，还有一个叫 `submitForm`。当你让 AI 生成一个新的表单组件时，它可能会随便挑一个约定，导致你的代码库在同一个概念上出现多套词汇。久而久之，这种混乱会加剧，导致更多的样式重构，以及团队成员（无论是真人还是 AI）在代码冲突上浪费更多精力。

JSX 这种声明式的特性，在 AI 的驱动下特别容易变得臃肿。如果没有约束，AI 可能会直接把业务逻辑塞进组件里，比如在 `SubmitFeedback` 组件的 `useEffect` 钩子中直接调用 API。这种关注点泄漏会让 UI 变得难以测试和复用。打个比方，如果 API 接口变了，所有 AI 生成的相关组件都要打补丁，一个简单的更新活脱脱变成了一场全代码库的大搜捕。

业务逻辑渗入组件的影响可能很微妙但杀伤力巨大。当 AI 看到验证逻辑写在事件处理器里、权限检查散落在渲染函数里、API 调用和 UI 状态管理混在一起时，它就会“学到”这就是你的架构。它生成的下一个功能也会依葫芦画瓢。于是，当初几个不规范的案例就成了主导范式。

测试也会遭殃。如果你的测试写得很脆，且与实现细节紧密耦合，那 AI 生成的测试只会更糟。它们会给整个组件树拍快照、模拟内部函数，然后在你每次重构时准时崩溃。

这一切都不是一夜之间发生的，而是微小不一致的逐渐积累。每一次 AI 生成的 Pull Request 都会增加一点不确定性，合并冲突变多，重构变得风险重重。最终，你会发现团队花在修 AI 代码上的时间，比自己手写代码还要多。

## 告诉 AI 你的前端是怎么运作的

解决方案得从明确的文档开始。这文档不是给人类看的（人还能提问），而是给那些无法提问的机器看的。

一个简单却出奇有效的工具是在项目根目录下放一个 `guidelines.md` 文件。这不只是个风格指南，也不是 README 的翻版。它是人类与 AI 代理之间的契约，用直白的语言编码了架构决策。它不需要是本厚厚的手册，而应是一份简明的参考，概述技术栈、强制模式和明确的禁令。

```markdown
# 前端架构指南

你是一名资深前端工程师，使用 JavaScript、React.js、TypeScript、Next.js 进行开发。你应遵循 Next.js 和 JavaScript/TypeScript 的最佳实践，编写安全、可维护、可扩展且高性能的代码。

## 核心技术栈

框架：Next.js 14+，仅使用 App Router（不使用 Pages Router）。

语言：TypeScript 5+，开启 `strict: true`。除临时迁移外，禁止使用 `any` 类型。

UI 库：以 shadcn/ui 组件作为基础设计系统。所有新 UI 必须由这些原语组合或扩展而来。

样式：仅使用 Tailwind CSS。禁止使用 CSS Modules、SCSS 或 styled-components。

状态管理：
  - 本地/组件状态：React Hooks (`useState`, `useReducer`)。
  - 服务端状态：使用 TanStack Query (React Query) 进行缓存和失效处理。
  - 全局跨组件状态：Zustand（首选）或 React Context（仅限主题等真正的全局关注点）。

表单处理：React Hook Form + Zod 校验。

数据校验：运行时模式校验统一使用 Zod。Schema 文件应存放在对应的用例（use case）旁。

API 客户端：从 OpenAPI 规范生成的类型化客户端（通过 `openapi-fetch` 或类似工具）。除适配器外，禁止直接调用 `fetch`。
```

英文版

```markdown
# Frontend Architecture Guidelines

You are a staff level frontend engineer, working with JavaScript, React.js, TypeScript, Next.js. You write secure, maintainable, scalable and performant code following Next.js and JavaScript/TypeScript best practices.

## Core Stack

Framework: Next.js 14+ using the App Router exclusively (no Pages Router).

Language: TypeScript 5+ with `strict: true`. No `any` types allowed outside of temporary migration shims.

UI Library: shadcn/ui components as the base design system. All new UI must compose from or extend these primitives.

Styling: Tailwind CSS only. No CSS modules, SCSS or styled-components.

State Management:
  - Local/component state: React hooks (`useState`, `useReducer`).
  - Server state: TanStack Query (React Query) for caching and invalidation.
  - Global cross-component state: Zustand (preferred) or React Context (only for truly global concerns like theming).

Form Handling: React Hook Form + Zod resolvers.

Validation: Zod exclusively for runtime schemas. Schemas live next to their use cases.

API Client: Typed client generated from OpenAPI spec (via `openapi-fetch` or similar). Direct `fetch` calls forbidden outside of adapters.
```

这里还有另一个 [`guidelines.md`](https://github.com/JetBrains/junie-guidelines/blob/main/guidelines/typescript/vue/nuxt/guidelines-with-explanations.md) 的例子。

为什么这招有效？AI 模型是在有限的上下文窗口内运行的，而结构良好的 `guidelines.md` 能快速提供高信号的上下文。虽然这确实需要前期投入和持续维护，但长远来看这绝对不是负担。回报是你的代码库中，AI 生成的内容能自然地与人类代码对齐，而不会随着时间的推移而跑偏。

## 目录约定：为什么它现在更重要了

可预测的结构不只是为了美观，它是刚需。它的存在是为了减少人类和机器的搜索空间。

当 AI 代理添加新功能时，它必须决定代码放哪。如果你的目录结构一团糟，`utils/`、`helpers/`、`services/`、`lib/` 和 `shared/` 的职责各不相同又互相重叠，AI 是不会推理的，它只会猜。而且通常会猜错。

```text
src/
├── app/                  # Next.js App Router – 路由和页面组合
│   ├── auth/             # /auth/login, /auth/register 等
│   ├── dashboard/        # 受保护的仪表盘路由
│   ├── feedback/         # 公开反馈页面及相关路由
│   ├── checkout/         # 结账流程页面
│   └── layout.tsx        # 跨路由共享的根布局
├── components/           # 可复用的 UI 组件 – 按领域组织
│   ├── auth/             # LoginForm.tsx, RegisterForm.tsx 等
│   ├── feedback/         # FeedbackForm.tsx, RatingStars.tsx, FeedbackList.tsx
│   ├── checkout/         # CartSummary.tsx, PaymentForm.tsx, OrderSuccess.tsx
│   ├── products/         # ProductCard.tsx, ProductGrid.tsx
│   └── shared/           # 通用的 shadcn/ui 扩展 (Button.tsx, Modal.tsx 等)
├── use-cases/            # 业务逻辑 – 每个用户意图一个文件，按领域组织
│   ├── auth/             # RegisterUser.ts, LoginUser.ts, RefreshToken.ts
│   ├── feedback/         # SubmitFeedback.ts, LoadRecentFeedback.ts
│   ├── checkout/         # CreateOrder.ts, ValidateCart.ts, ApplyCoupon.ts
│   ├── products/         # SearchProducts.ts, GetProductDetails.ts
│   └── shared/           # 极少使用 – 仅用于真正的跨领域逻辑
├── services/             # 中间件和执行器（不设领域子文件夹）
│   ├── middleware/       # auth.ts, validation.ts, rateLimit.ts, analytics.ts 等
│   └── index.ts          # 导出的服务：publicService, authenticatedService 等
├── lib/                  # 工具和适配器（扁平或浅层子文件夹）
│   ├── api/              # 类型化的 OpenAPI 客户端
│   ├── auth/             # 会话工具
│   ├── cache/            # 缓存辅助工具
│   └── errors/           # 自定义错误类
```

每个目录的意图应该从名称和位置上一目了然。`use-cases/` 存放与框架无关的业务逻辑；`lib/` 存放所有杂乱的集成点；`components/` 则纯粹负责展示。

这种分离防止了 AI 犯常识性错误。理解了这种结构的工具不会把数据库查询塞进 UI 组件里，也不会把框架相关的代码和业务逻辑混在一起。

每个目录内部的一致性同样重要。如果每个用例（use case）都遵循相同的文件结构和命名模式，AI 就能通过范例生成新的用例。如果它们千奇百怪，AI 就会按它觉得最好的方式乱来。

## UI 层：AI 参与下的组件驱动开发

AI 生成的 [UI](https://blog.logrocket.com/designcoder-ai-ui/) 已经到来了。像 [v0.dev](https://v0.app/) 这样的工具可以通过文本提示直接生成整个组件。[Cursor](https://blog.logrocket.com/frontend-devs-heres-how-to-get-the-most-out-of-cursor/) 也可以根据视觉反馈重构 JSX。这种能力很强大，但如果没有约束，它就会变成负担。

核心问题在于，AI 优化的是“看起来对不对”，而不是“写得对不对”。它会毫不犹豫地生成渲染效果完美，但违反可访问性规则、忽略加载和错误状态、并假设一切环境都完美的组件。放任不管的话，你最终会得到一个只能走通“完美路径（happy path）”而其他情况一触即溃的 UI。

这就是为什么设计系统不再是“锦上添花”，而是架构上的硬性要求。一个文档齐全的设计系统为 AI 提供了词汇。它不再凭空捏造 JSX，而是从已知的原语中进行组合；它不再创建新的按钮变体，而是使用你已经定义好的那些。

从这个意义上说，设计系统充当了校验器的角色。你定义了一组具有严格 API 的受限类型组件，AI 的输出就被迫符合这些规范。

例如，一个 `Button` 组件可能会强制要求：

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  // 不允许随性的属性，防止属性爆炸
}
```

Storybook 将这一点推得更远，它把组件变成了机器可读的文档。每个 Story 都展示了组件该如何使用、哪些 Props 是有效的、支持哪些状态。当 AI 代理生成新组件时，它可以参考现有的 Story；当它修改现有组件时，可以验证这些 Story 是否依然通过。

核心见解是：设计系统不仅仅是给人看的，它们是 AI 工具可以对照校验的契约。每个组件都需要清晰的 Prop 类型、定义良好的变体和具体的示例。那种一个组件接受二十多个松散相关的 Prop 的“属性爆炸”是一个危险信号——人类很难理清，AI 仅靠推断也几乎不可能用对。

## 逻辑层：用例模式作为稳定性支柱

这是大多数 AI 生成的代码最容易崩盘的地方：业务逻辑。

当 AI 代理添加功能时，它需要一个清晰的地方来放置行为——校验、副作用、流程编排。如果架构没有提供这样一个“家”，逻辑就会一股脑塞进组件里。一旦逻辑住进了组件，它就与 UI 生命周期绑死了，不仅难以独立测试，如果不通过复制粘贴也难以复用。

“用例（Use case）”模式通过代表单一的用户意图解决了这个问题。它接受定义明确的输入，执行必要的工作，并返回明确的输出，所有这些都带有强类型以保证可预测性。

这里有一个具体的 `RegisterUser` 例子：

```typescript
import { z } from 'zod';

const RegisterUserInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type RegisterUserOutput = { userId: string; token: string };

export async function registerUser(input: z.infer<typeof RegisterUserInput>): Promise<RegisterUserOutput> {
  // 校验输入
  const validated = RegisterUserInput.parse(input);

  // 调用 API 或服务
  const response = await api.post('/register', validated);

  return { userId: response.userId, token: response.token };
}
```

为什么这配置对 AI 友好？因为用例是自包含的，具有清晰的输入/输出，AI 无需理解整个应用就能直接接入。代码生成器可以放心地创建一个调用 `registerUser` 的 UI，因为它知道校验和错误处理都在里面统一搞定了。

这种模式常见的误用有两种。第一种是过度工程：不必要地嵌套用例、增加间接层，为了没啥意义的收益付出了性能代价。第二种是没用透：把逻辑又塞回 Hooks 或组件里，这会教唆 AI 在整个 UI 中复制同样的 Bug 和不一致性。

如果应用得当，这种模式在重构时会大放异彩。修改一次实现，无论是人类写的还是 AI 生成的所有调用方都会自动受益。

## 胶水层：应对横切关注点的中间件链

即使有了简洁的组件和定义良好的用例，重复代码还是会悄悄溜进来。每个用例都需要错误处理，大多数需要日志记录，有些还需要授权或频率限制。

如果没有中间件层，AI 代理会在各处重新实现这些关注点。你会得到 20 个稍有不同的错误处理器，每个都以自己的方式记录日志，返回不一致的错误结构。这在出问题之前看起来都挺好。

中间件通过将横切关注点抽离到包装用例的小型、可组合函数中来解决这个问题。

这里有一个使用 `createUseCaseService` 来组合中间件的例子：

```typescript
type Middleware = (next: (input: any) => Promise<any>) => (input: any) => Promise<any>;

function errorHandler(next: (input: any) => Promise<any>) {
  return async (input: any) => {
    try {
      return await next(input);
    } catch (error) {
      console.error('用例执行出错:', error);
      throw error; // 或进行标准化处理
    }
  };
}

function logger(next: (input: any) => Promise<any>) {
  return async (input: any) => {
    console.log('正在执行，输入参数为:', input);
    const result = await next(input);
    console.log('执行结果:', result);
    return result;
  };
}

export function createUseCaseService(...middlewares: Middleware[]) {
  return function execute<TInput, TOutput>(useCase: (input: TInput) => Promise<TOutput>, input: TInput) {
    const composed = middlewares.reduceRight((acc, mw) => mw(acc), useCase as any);
    return composed(input);
  };
}

// 使用示例
const service = createUseCaseService(logger, errorHandler);
service(registerUser, { email: 'user@example.com', password: 'securepass' });
```

再看几个例子：

### 身份验证与授权中间件

```typescript
// services/middleware/auth.ts
import { getSession } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';

export function withAuth(next: any) {
  return async (input: any) => {
    const session = await getSession();
    if (!session?.user) {
      throw new UnauthorizedError('需要身份验证');
    }
    // 为下游用例增加用户上下文
    return next({ ...input, user: session.user });
  };
}

export function withRole(requiredRole: string) {
  return (next: any) => async (input: { user: { role: string } } & any) => {
    if (input.user.role !== requiredRole) {
      throw new UnauthorizedError(`需要 ${requiredRole} 角色`);
    }
    return next(input);
  };
}
```

用法：

```typescript
const adminService = createUseCaseService(
  logger,
  errorHandler,
  withAuth,
  withRole('admin')
);

// 只有管理员能执行此操作
await adminService(deleteUser, { userId: '123' });
```

### 带有 Zod Schema 的校验中间件

```typescript
// services/middleware/validation.ts
import { z } from 'zod';
import { ValidationError } from '@/lib/errors';

export function withValidation<T extends z.ZodType<any>>(schema: T) {
  return (next: any) => async (input: unknown) => {
    const parsed = await schema.safeParseAsync(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.format());
    }
    return next(parsed.data);
  };
}
```

用法：

```typescript
import { RegisterUserInput } from '@/use-cases/auth/RegisterUser';

const publicService = createUseCaseService(
  logger,
  errorHandler,
  withValidation(RegisterUserInput)
);

await publicService(registerUser, rawFormData); // 如果校验失败会提前抛错
```

在 AI 生成代码时，这种方法有几个好处：

1.  **一致性** —— 每个用例都获得相同的错误处理、日志和授权模式。AI 不需要记住添加它们，它们是自动应用的。
2.  **可发现性** —— 当 AI 代理需要为某个用例添加授权时，它可以参考现有的中间件。它不会凭空捏造一个新模式。
3.  **分离** —— 横切关注点在物理上与业务逻辑分离。当你修改错误日志记录方式时，只需改一个文件，而不是改 50 个用例。

要避免的错误是把中间件写得太“聪明”。每个中间件应该只做一件事。不要搞一个能同时处理错误、日志、权限和校验的“超级中间件”。保持职责单一，并有意识地进行组合。

## AI 压力下的业务级关注点

AI 生成的代码会放大隐藏的架构弱点，尤其是在安全性、测试和可观测性方面。

### 安全性

在 UI 组件中散落权限检查是一种常见的反模式，AI 会非常乐意复制这种做法。真正的授权属于后端，由包装用例的中间件强制执行。组件可以为了用户体验隐藏/禁用 UI，但用例本身必须拒绝越权执行。这种结构让 AI（或人类）几乎不可能意外绕过检查。

### 测试

过度依赖缓慢、脆弱的端到端测试是无法随 AI 的产出而扩展的。应优先对用例进行快速的单元测试，它们有清晰的输入/输出，能验证真实的业务逻辑。将 UI 测试限制在有意义的用户流上（例如表单校验错误），而不是纠结于实现细节（如类名、精确的样式）。

### 可观测性

当代码库的一部分是机器生成时，你需要对代码的来源和行为有可见性。结构化日志、分布式追踪和统一的错误处理变得至关重要。中间件层是实现这些的最佳场所，它可以自动对每个用例的执行进行打点，无论它是人类触发的还是 AI 代理触发的。

通过在中间件和用例中集中处理这些关注点，即使 AI 加速了功能开发，架构也能强制保证正确性。

## 总结

AI 并没有降低对优秀架构的需求。相反，它提高了门槛。

以前，含糊的约定和“以后再清理”的技术债可能还能忍。现在，它们是累赘。每一个不一致都会变成训练案例。每一个捷径都会变成默认设置。每一个模糊的边界都会随着 AI 的复制而呈倍数级增长。

优秀的架构不再是可选项，它是安全提速的前提。

如果 AI 要帮你跑得更快，你的架构就必须教它如何正确地构建。只要把架构搞对了，AI 就会成为你的力量倍增器，而不是混乱的源头。

## 参考资料

[AI-Ready Frontend Architecture. CodeMotion Magazine.](https://www.codemotion.com/magazine/frontend/web-developer/ai-ready-frontend-architecture/)