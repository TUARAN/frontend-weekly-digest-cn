# TanStack AI 对比 Vercel AI SDK：如何为 React 项目选择 AI 库

> 原文：[TanStack AI vs. Vercel AI SDK: Choosing the right AI library for React - LogRocket Blog](https://blog.logrocket.com/tanstack-vs-vercel-ai-library-react/)
>
> 翻译：[嘿嘿](https://blog.heyfe.org/blog)

你发布的每一个 AI 功能其实都有一项“隐形税”。

![](./assets/tanstack-ai-vs-vercel.png)

通常情况下，你得把同样的逻辑写两遍。想要个天气工具？你得在服务器上写 OpenWeatherMap 的获取逻辑，然后在客户端再写一遍 Schema 定义和校验。数据库查询工具？服务端实现一遍，客户端再复刻一遍接口。用户地理定位？也是一样的套路。

这不只是个烦人的小问题，更是一个昂贵的成本问题。代码库会变得臃肿，类型定义会逐渐产生偏差，几个月后你可能都搞不清哪个实现才是“标准答案”。刚开始可能只是一个带 10 个工具的简单 [AI 助手](https://blog.logrocket.com/ux-design/ive-designed-ai-assistants-heres-what-actually-works/)，但为了保持同步，最后可能会演变成散落在服务端和前端代码中的数百行重复代码。

TanStack AI 通过**同构工具（Isomorphic Tools）**解决了这个问题。你只需使用 `toolDefinition()` 定义一次工具，然后通过 `.server()` 或 `.client()` 明确指定它的执行位置。定义和类型在不同环境下保持一致，彻底消除了重复。在本文接下来的部分中，我们将通过构建一个 AI 助手示例来演示同构工具的工作原理，并将其与 [Vercel AI SDK](https://blog.logrocket.com/vercel-ai-elements/) 的方案进行对比。我们还会探讨 TanStack AI 如何减少厂商锁定并提供更强的类型安全性。

## 核心对比表

在深入技术细节之前，我们可以通过下表快速查看 TanStack AI 和 Vercel AI SDK 在生产级应用核心维度上的对比：

| 特性 | TanStack AI | Vercel AI SDK |
| :--- | :--- | :--- |
| **同构工具** | 定义一次，随处运行 (.server()/.client()) | 需要分别编写服务端/客户端实现 |
| **框架支持** | React, Solid, Vanilla JS，以及任何框架 | React (针对 Next.js 优化) |
| **模型商支持** | OpenAI, Anthropic, Gemini, Ollama | OpenAI, Anthropic, Google 等 20 多个模型商 |
| **类型安全** | 针对每个模型提供带 3 个泛型的 providerOptions | 灵活的类型系统，可选严格模式 |
| **厂商锁定** | 基于适配器，一行代码即可切换模型商 | 与模型商无关，但针对 Next.js 深度优化 |
| **包体积** | 支持 Tree-shaking 的适配器（仅引入所需内容） | 完整的 SDK 包 |
| **模态支持** | 文本、图像、视频、音频、TTS、转录、结构化输出 | 文本、结构化输出、嵌入 (Embeddings) |
| **协议** | 开放且文档完善的自定义传输协议 | 闭源实现 |
| **成熟度** | Alpha 阶段 (2025 年 12 月) | 稳定版 (v6, 2025 年 12 月已引入 Agents 和工具执行审批) |
| **MCP 支持** | 规划中 | 完全支持 |
| **开发者工具** | 适用于服务端 + 客户端的同构 DevTools | 内置，生产环境可用 |

现在，让我们来看看定义这一切的架构差异：同构工具。

## 同构工具的优势

TanStack AI 和 Vercel AI SDK 的区别，很大程度上取决于工具在哪里定义，以及你需要实现多少次。

在 Vercel AI SDK 中，工具实际上是被切分在不同环境下的。你在服务端定义工具供 LLM 执行，然后必须在客户端重新实现一遍相同的工具，以便 UI 能解析并展示其行为。这种重复为服务端逻辑和客户端状态之间产生偏差留下了隐患。

```typescript
// 服务端 (app/api/chat/route.ts)
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4'),
    messages,
    tools: {
      getWeather: tool({
        description: '获取指定位置的当前天气',
        parameters: z.object({
          location: z.string().describe('城市名称'),
        }),
        execute: async ({ location }) => {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.WEATHER_API_KEY}`
          );
          const data = await response.json();
          return {
            temperature: data.main.temp,
            description: data.weather[0].description,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
```

下面是客户端代码：

```tsx
// 客户端 (components/chat.tsx)
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          {m.role === 'user' ? '用户: ' : 'AI: '} {m.content}
          {m.toolInvocations?.map((tool, i) => (
            <div key={i}>
              正在调用 {tool.toolName}，参数： {JSON.stringify(tool.args)}
            </div>
          ))}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

服务端知道如何执行工具，客户端知道如何展示它，但它们是两套独立的实现。如果你想在两者之间实现类型安全，你得自己搭桥。

现在试想你再加 9 个工具。你的服务端文件会膨胀到 400 行。你的客户端需要处理每个工具的参数和结果。在服务端改个参数？客户端也得改。加个校验？写两遍。

TanStack AI 采取了不同的策略。你定义一次工具，然后告诉它在哪里运行。这是 TanStack AI 中同样的天气工具实现：

```typescript
// shared/tools.ts (共享代码)
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

export const weatherTool = toolDefinition({
  id: 'getWeather',
  description: '获取指定位置的当前天气',
  parameters: z.object({
    location: z.string().describe('城市名称'),
  }),
}).server(async ({ location }) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.WEATHER_API_KEY}`
  );
  const data = await response.json();
  return {
    temperature: data.main.temp,
    description: data.weather[0].description,
  };
});
```

服务端代码：

```typescript
// app/api/chat/route.ts
import { openaiText } from '@tanstack/ai-openai';
import { chat } from '@tanstack/ai';
import { weatherTool } from '@/shared/tools';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await chat({
    adapter: openaiText('gpt-4'),
    messages,
    tools: [weatherTool],
    temperature: 0.7,
  });

  return Response.json(result);
}
```

客户端代码：

```tsx
// components/chat.tsx
import { useChat, fetchServerSentEvents } from '@tanstack/react-ai';
import { weatherTool } from '@/shared/tools';

export default function Chat() {
  const { messages, input, setInput, sendMessage } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    tools: [weatherTool], // 相同的工具，客户端自动识别类型
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          {m.role === 'user' ? '用户: ' : 'AI: '} {m.content}
          {m.toolCalls?.map((call, i) => (
            <div key={i}>
              正在调用 {call.name}，参数： {JSON.stringify(call.arguments)}
            </div>
          ))}
        </div>
      ))}

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />
    </div>
  );
}
```

一份定义，两个环境。工具本身知道自己的结构，因此服务端和客户端都会自动获得完整的类型安全。修改参数？TypeScript 会在所有地方报错。工具就是唯一的真理来源（Source of Truth）。

对于单个工具，这种节省可能不明显。但当你加到 10 个工具时，Vercel AI SDK 的代码量可能会达到 600 行，而 TanStack AI 可能只有 300 行（这还是保守估计）。真正的价值在于消除了维持两套实现同步的心智负担。

## 客户端工具：同构架构的大放异彩之处

在这里，这种架构的优势更加凸显。有些工具应该在客户端运行，例如获取用户地理位置、访问本地文件或调用浏览器 API。在 Vercel AI SDK 中，你仍然需要在服务端为 LLM 定义这些工具，然后在客户端手动实现它们。

而在 TanStack AI 中，你只需要把 `.server()` 换成 `.client()`：

```typescript
// shared/tools.ts
export const geolocationTool = toolDefinition({
  id: 'getUserLocation',
  description: '获取用户当前的 GPS 坐标',
  parameters: z.object({}),
}).client(async () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      reject
    );
  });
});
```

LLM 知道工具的存在，客户端知道如何执行它。不需要服务端中转，不需要 API 接口，更没有重复代码。

你可以在同一次对话中混用服务端和客户端工具：

```typescript
const result = await chat({
  adapter: openaiText('gpt-4'),
  messages,
  tools: [
    weatherTool,      // 服务端运行
    geolocationTool,  // 客户端运行
    databaseTool,     // 服务端运行
  ],
});
```

TanStack AI 会自动处理协调工作。LLM 可以调用运行在服务端或客户端的工具，结果会回流到同一个对话中，而工具定义本身只需要写一遍。

## 厂商锁定与框架无关性

TanStack AI 和 Vercel AI SDK 都声称自己不绑定特定模型商，但它们的实现路径不同。一个优先考虑真正的可移植性，另一个则针对特定生态系统进行了优化。

### TanStack AI 的适配器架构

TanStack AI 使用了一种拆分式的适配器系统。你不需要引入一个包揽万象的庞大适配器，只需引入你需要的模块：

```typescript
import { openaiText } from '@tanstack/ai-openai';
import { anthropicText } from '@tanstack/ai-anthropic';
import { geminiText } from '@tanstack/ai-gemini';
```

每个适配器各司其职。`openaiText` 处理 OpenAI 模型的文本生成，`openaiImage` 处理图像生成，`anthropicText` 处理 Claude。没有试图取悦所有人的统一抽象，也没有臃肿的引入。

这种架构带来了一个直接的好处：切换模型商只需改动一行代码。

### 切换模型商：从 OpenAI 到 Anthropic 再到 Gemini

这是使用 OpenAI 的聊天实现：

```typescript
import { openaiText } from '@tanstack/ai-openai';
import { chat } from '@tanstack/ai';

const result = await chat({
  adapter: openaiText('gpt-4'),
  messages: [{ role: 'user', content: '解释一下量子计算' }],
  temperature: 0.7,
});
```

切到 Anthropic 的 Claude：

```typescript
import { anthropicText } from '@tanstack/ai-anthropic';
import { chat } from '@tanstack/ai';

const result = await chat({
  adapter: anthropicText('claude-sonnet-4-20250514'),
  messages: [{ role: 'user', content: '解释一下量子计算' }],
  temperature: 0.7,
});
```

切到 Google 的 Gemini：

```typescript
import { geminiText } from '@tanstack/ai-gemini';
import { chat } from '@tanstack/ai';

const result = await chat({
  adapter: geminiText('gemini-2.0-flash-exp'),
  messages: [{ role: 'user', content: '解释一下量子计算' }],
  temperature: 0.7,
});
```

API 没变，选项没变，工具定义也没变。变的只是 import 语句和适配器行。你的工具、UI 和类型都保持原样。

对比 Vercel AI SDK：

```typescript
// OpenAI
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const result = await streamText({
  model: openai('gpt-4'),
  messages,
});

// Anthropic
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

const result = await streamText({
  model: anthropic('claude-sonnet-4-20250514'),
  messages,
});
```

Vercel AI SDK 做得也很简单。但当你使用特定模型商的功能时，区别就显现出来了。

## 针对特定模型的类型安全：TanStack AI 的杀手锏

每个模型商提供的选项都不同。OpenAI 的推理模型支持 `reasoning_effort`；Anthropic 的 Claude 支持 `thinking` 预算；Gemini 有 `safetySettings`。这些选项并不是通用的，而是特定于模型商，甚至特定于某个模型的。

TanStack AI 通过 `modelOptions` 为这些选项提供编译时的类型安全：

```typescript
import { openaiText } from '@tanstack/ai-openai';

const result = await chat({
  adapter: openaiText('o1-preview'),
  messages,
  modelOptions: {
    reasoning_effort: 'high', // TypeScript 知道 o1 模型支持这个选项
  },
});
```

想在 GPT-4 上用 `reasoning_effort`？TypeScript 会报错。想在 OpenAI 上用 Claude 的专属选项？同样会报错。适配器知道哪些模型支持哪些选项，你的 IDE 会准确地提示你可用内容。

```typescript
import { anthropicText } from '@tanstack/ai-anthropic';

const result = await chat({
  adapter: anthropicText('claude-sonnet-4-20250514'),
  messages,
  modelOptions: {
    thinking: {
      type: 'enabled',
      budget_tokens: 5000, // Claude 特有的深度思考配置
    },
  },
});
```

Vercel AI SDK 的处理方式不同，特定模型商的选项被放在了一个实验性字段里：

```typescript
import { openai } from '@ai-sdk/openai';

const result = await streamText({
  model: openai('o1-preview'),
  experimental_providerMetadata: {
    openai: {
      reasoning_effort: 'high',
    },
  },
});
```

虽然能用，但 TypeScript 无法保证这些选项是否有效。你又得回去翻文档，并祈祷自己没拼错单词。

## 框架灵活性：React, Solid, Vanilla JS 对比 Next.js 优化

TanStack AI 开箱即支持三种客户端库：

```typescript
// React
import { useChat } from '@tanstack/react-ai';

// Solid
import { useChat } from '@tanstack/solid-ai';

// 也支持原生 JavaScript (Vanilla JS)
```

这三者共享相同的服务端协议，因此后端完全不依赖于你选择的前端框架。你可以将原生 JavaScript 客户端与 Python 后端无缝配对。由于协议是公开且有文档支撑的，你可以自由选择任何传输层，无论是 HTTP、WebSockets，甚至是自定义的 [RPC 协议](https://blog.logrocket.com/introduction-to-rpc-using-go-and-node/)。

Vercel AI SDK 虽然也支持多种框架，但它是为 Next.js 量身定制的：

```typescript
// Next.js App Router (深度优化)
import { streamText } from 'ai';
import { createStreamableUI } from 'ai/rsc';

// React (可用，但功能较少)
import { useChat } from 'ai/react';

// 其他框架 (社区适配器)
import { useChat } from 'ai/vue';
import { useChat } from 'ai/svelte';
```

它与 Next.js 的集成非常强悍，支持 React Server Components (RSC)、流式 UI 和内置缓存。然而，这些优势在其他框架中并不复存在。如果你在用 Remix、Express 或 FastAPI，你基本上只能用到基础的 `useChat` hook，体验不到那些 Next.js 专属的打磨细节。

TanStack AI 走的是另一条路：它拒绝为单一框架做过度优化。React、Solid 和原生 JS 都是一等公民。如果你笃定使用 Next.js 生态，Vercel AI SDK 提供了更多现成的便利；如果你想保留切换框架的可能性，TanStack AI 让你无需在项目早期就做“生死抉择”。

## 该选择哪个 SDK？

**在以下情况下选择 TanStack AI：** 你需要同构工具来避免逻辑重复；希望在不重构的情况下灵活切换模型商；或者预计会使用 Next.js 以外的框架。它的架构围绕可移植性和长期灵活性设计，倾向于持久的抽象而非特定框架的便利。

**在以下情况下选择 Vercel AI SDK：** 你正在 Vercel 上构建 Next.js 应用，并且需要一个立即可用的、成熟的生产级方案。它的功能非常完备，与 Next.js 和 Vercel 生态深度绑定，非常适合那些追求稳定性和开箱即用、而非跨框架灵活性的团队。

## 总结

TanStack AI 解决了一个大多数 AI 应用迟早会遇到的架构问题：服务端和客户端边界之间的工具重复。通过允许工具只定义一次，并利用 `.server()` 和 `.client()` 在合适的环境中执行，它消除了整整一类同步问题。

再加上针对特定模型的类型安全和不绑定厂商的适配器，这种架构更倾向于明确的控制、可移植性和长期可维护性。这使得 TanStack AI 非常适合那些预见技术栈会不断演进的团队，无论是更换模型商、引入新框架，还是支持异构后端。

相比之下，Vercel AI SDK 是为深耕 Next.js 和 Vercel 生态的团队优化的。它提供了一种经过打磨的、生产就绪的体验，并与 React Server Components、流式 UI 和平台级优化紧密结合。

这些便利也伴随着权衡：工具必须在多个地方实现，且架构假设你会长期使用 Next.js。对于优先考虑上线速度以及与 Vercel 平台深度对齐的团队来说，这通常是一个可以接受、甚至是理想的约束。

最终的决定取决于你的业务限制和优先级。如果减少重复、保持架构灵活性和降低长期维护风险是你的核心关注点，TanStack AI 是更强的选择。如果 Next.js 下的即时生产力、生态集成和经过验证的稳定性对你更重要，那么 Vercel AI SDK 可能更适合。两种方案都可行，只是它们优化了不同的“成功定义”。