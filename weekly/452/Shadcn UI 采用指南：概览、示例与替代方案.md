# Shadcn UI 采用指南：概览、示例与替代方案

原文：https://blog.logrocket.com/shadcn-ui-adoption-guide/

更新说明：本文在 2026 年 2 月被作者/编辑复审更新，以覆盖 Shadcn UI 生态的近期变化（如 Shadcn Create、Blocks 与 Lift mode 等）。

Shadcn UI 走了一条与传统组件库（Material UI、Chakra UI 等）不同的路：你不是安装一个“黑盒包”并从中 import 组件，而是把组件源码直接复制/生成到自己的代码库里。这样做的结果是——**你完全拥有 UI 代码**，可控、可改、可扩展。

本文会介绍 Shadcn UI 是什么、适合/不适合的场景、如何上手，并给出一个表单示例与与其他 UI 库的对比参考。

## Shadcn UI 是什么？

Shadcn UI 不是传统意义上的“组件库”或“UI 框架”。更准确的描述是：它是一组可复用的 UI 组件集合，你可以通过复制粘贴或 CLI，把组件**直接加入你的项目**。

它建立在 Tailwind CSS 之上，并允许你选择 Radix UI 或 Base UI 作为底层 primitives。官方目前对 Next.js、Remix、Astro、Laravel、Vite 等提供良好支持；对于其他技术栈也有手动集成指南。

Shadcn UI 在 2023 年 3 月发布后快速走红，在 React/Next.js 圈层的影响力尤其明显，后来甚至被 Vercel 的 v0 等工具广泛使用和推广。

## 优点与取舍

如果你在找一套更“开发者友好”、同时又足够灵活的 UI 方案，Shadcn UI 的优势很明显：

- 设计质量高：组件默认样式精致，不需要大量额外样式就能做出“看起来像产品”的界面。
- 组件覆盖面广：从按钮、输入框等基础控件，到 toast、下拉菜单、导航菜单等复杂组件都有。
- 上手成本低：会 HTML/CSS/JS 和常用框架即可快速开始，复制粘贴或 CLI 安装都很顺手。
- 基于 Tailwind CSS：适合习惯 utility-first 的团队，定制品牌风格也相对直接。
- 关注可访问性：组件通常考虑了键盘操作、读屏等可访问性要点。
- 可控且易扩展：源码在你仓库里，想改行为、改样式、加能力都不需要“等上游发版”。

但 Shadcn UI 也有明确的代价：

- 组件需要“逐个安装/拷贝”：对习惯 `import { Button } from 'xxx'` 的人来说，会觉得步骤多。
- 仓库体积与维护成本更高：源码都在你这里，意味着升级与维护要自己承担一部分成本。
- 打包体积与性能需要自己把控：你引入什么就会打进 bundle；做代码分割、按需加载等优化需要你自己规划。
- 需要 Tailwind CSS 经验：团队如果不熟 Tailwind，会影响效率与一致性。

本质上，Shadcn UI 用“便利性”换“控制权”。如果你更在意可控、可改、可演进，它很值得一试。

## 快速上手（以 Next.js 为例）

Shadcn UI 支持多个框架，这里以 Next.js 为例说明流程。

1) 创建带 TypeScript + Tailwind + ESLint 的 Next.js 项目：

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint
```

2) 初始化 Shadcn UI：

```bash
npx shadcn@latest init
```

CLI 会询问一些项目配置，典型问题例如：

- 是否使用 TypeScript
- 选择风格（`default` / `new-york`）
- 基础色（如 Slate）
- 全局 CSS 路径（如 `app/globals.css`）
- Tailwind 配置文件位置（如 `tailwind.config.js`）
- components/utils 的 import alias（如 `@/components`、`@/lib/utils`）
- 是否使用 React Server Components

3) 添加组件：

```bash
npx shadcn@latest add [component]
```

例如添加按钮：

```bash
npx shadcn@latest add button
```

然后在代码中使用：

```tsx
import { Button } from "@/components/ui/button"

<Button variant="outline">Button</Button>
```

## 主要能力一览

### 主题、主题编辑器与明暗模式

Shadcn UI 提供了一组挑选过的主题 token，你既可以手动把 token 写进项目，也可以使用主题编辑器生成配置。

主题编辑器支持配置：颜色、圆角、明暗模式等，并可在 `default` 与 `new-york` 两套风格之间切换：

- `default`：输入框更大，常用 `lucide-react` 图标与 `tailwindcss-animate` 动画。
- `new-york`：按钮更紧凑，卡片有阴影，常用 Radix Icons。

编辑器会输出一段包含 light/dark token 的 CSS 代码，你复制到项目即可：

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.3rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

在 Next.js 等场景中，Shadcn UI 常配合 `next-themes` 来实现暗色模式切换：当用户切换主题时，就切换到对应的 token 集。

### Open in v0

v0 是 Vercel 的生成式 UI 工具：用自然语言生成可投入生产的 React 组件代码，底层常基于 Shadcn UI + Tailwind CSS。

“Open in v0”允许你把某个现有 Shadcn UI 组件直接打开到 v0 的界面里，用提示词调整布局/样式/结构，然后把更新后的代码拷回项目中（通常需要 v0 账号）。

### Blocks（模板）与 Lift mode

Blocks 是由多个组件组合起来的“页面级模板”，例如表单页、Dashboard 布局等。相比自己拼装按钮、输入框、导航等基础组件，Blocks 能让你更快落地一个完整页面，然后再在代码里按需改造。

Lift mode 则进一步提高 Blocks 的可复用性：你可以从一个 Block 里“提取”局部组件（例如卡片、按钮、表单片段）来复用，而不用把整个模板都加入项目。

### Shadcn Create

早期 Shadcn UI 常被吐槽“同质化”：默认主题与组件组合太容易让不同产品看起来像一个模子刻出来的。Shadcn Create 的思路是把“个性化”前置：一开始就选好颜色、间距、字体、图标等预设，然后生成一份已经带着你偏好的项目配置。

这样你得到的不是一个“先通用后改”的模板，而是从第一天起就更贴近目标风格的起点。

## 示例：用 Shadcn UI 做一个登录/输入表单

Shadcn UI 不只提供 `Input`、`Textarea`、`Checkbox`、`RadioGroup` 这类表单控件，还提供了 `Form` 组件（对 `react-hook-form` 的封装），用于更结构化地组织表单字段与校验。

它通常包括：

- `<FormField />`：用于受控字段
- 与 Valibot / Yup / Zod 等校验库集成
- 错误消息展示

先安装相关组件：

```bash
npx shadcn@latest add form input
```

然后写一个最小示例（使用 Zod 做校验）：

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "用户名至少需要 2 个字符。",
  }),
});

export function ComponentExample() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
  }

  return (
    <div className="max-w-4xl flex items-center justify-center min-h-screen">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>用户名</FormLabel>
                <FormControl>
                  <Input placeholder="请输入用户名" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">提交</Button>
        </form>
      </Form>
    </div>
  );
}
```

## 适用场景

Shadcn UI 特别适合这类需求：

- 做“看起来很完整”的网站与应用：默认设计质量较高。
- 快速原型与产品迭代：组件现成、可改，能把时间花在业务上。
- 构建内部组件库/设计系统：组件就在仓库里，方便团队根据自身规范持续演进。

## 与其他 UI 组件库的简单对比

下面是一个偏“选型参考”的粗粒度对比（bundle 大小等会随你实际使用方式不同而变化）：

| 维度 | Shadcn UI | Material UI (MUI) | Chakra UI | Ant Design |
| --- | --- | --- | --- | --- |
| GitHub Stars | 105k | 97k | 40k | 97k |
| 框架支持 | React（也有其他框架版本） | React（也有其他框架版本） | React（也有 Vue/Svelte 版本） | React（也有 Vue 版本） |
| 打包体积（min+gzip） | 取决于你加入了哪些组件 | 93.7kb | 89kb | 429kb |
| 成熟度 | 年轻、发展快 | 成熟、生态稳定 | 年轻、发展快 | 成熟、生态稳定 |
| 更适合 | 希望自定义 UI、追求可控的中大型项目 | 中小到大型项目 | 中小到大型项目 | 中小到大型项目 |
| 设计系统 | 由你定义 | Material Design | Chakra 设计系统 | Ant Design 设计系统 |
| Figma Kit | 否 | 是 | 是 | 是 |

## 总结

Shadcn UI 改写了“组件库”的常见交付形态：不把组件封装成依赖包，而是把源码交给你，让你直接在项目里拥有并维护它。

如果你的团队更重视可控性、可扩展性、以及对 UI 细节的把握，Shadcn UI 会是一个很扎实的选择；如果你更希望“装上就用、升级无感”，传统组件库也仍然有它们的优势。
