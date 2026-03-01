> 原文：[Building a Rich Text Editor in React](https://puckeditor.com/blog/building-a-rich-text-editor-in-react)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 在 React 中构建富文本编辑器

[富文本编辑](https://puckeditor.com/docs/integrating-puck/rich-text-editing)是现代 React 应用中的常见需求，但很少有“简单实现”的方案。允许用户使用标题、列表、强调等格式化能力，会带来状态管理、内容一致性和可维护性等方面的挑战。

很多应用依赖原始 HTML 字符串，或者直接使用 [`contenteditable`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/contenteditable)。这种方式一开始可能可行，但随着应用规模增长，经常会出现不可预测的行为。内容会变得更难校验、更难版本管理，在多用户或自动化系统参与时也更容易被破坏。

更可靠的做法是把富文本视为结构化数据，而不是仅仅当作标记字符串。显式的内容模型能让应用更好地控制内容创建、渲染与扩展，同时也天然契合 React 声明式、状态驱动的模型。

本文将讨论：为什么在 React 里做富文本很难，结构化内容如何缓解这些问题，以及基于扩展机制的编辑器如何支持安全定制。文章还会通过 [Puck](https://puckeditor.com/) 的富文本编辑器给出一个循序渐进的示例来展示这些概念。

## 为什么富文本在 React 中很难

富文本编辑与 React 应用设计中的一些核心原则存在冲突。很多传统方案依赖浏览器层 API，而不是显式的 React 状态；复杂度一上来就会更难控制。

- 许多实现依赖 `contentEditable` 和浏览器管理的 HTML 变更。这些行为发生在 React 状态模型之外，使编辑器行为更难推理。

- 在没有显式内容模型的情况下渲染用户生成 HTML，会限制应用长期可靠地校验、转换和理解内容的能力，进而让 diff、版本管理和审计变得困难，尤其在协作编辑或高频编辑场景中更明显。

- 很小的标记改动也可能轻易破坏布局，或违反设计与可访问性规则，而且应用本身并不会收到明确告警。

- 仅有原始 HTML 并不表达“意图（intent）”，因此在缺乏额外结构和控制层时，它并不适合自动化转换、程序化编辑或 AI 驱动工作流。

在实践中，很多编辑器对外暴露 HTML 接口，但内部维护的是结构化状态。核心问题并不在于“有没有 HTML”，而在于应用是否仍然掌握对 HTML 生成与演进过程的控制权与语义意图。

## 为什么用 Puck 做富文本编辑

![](https://res.cloudinary.com/die3nptcg/image/upload/v1769688333/blog-1_oulzw2.png)

[Puck 是一个面向 React 的开源可视化编辑器](https://puckeditor.com/)，团队可以基于自己的组件构建定制化页面编辑器。Puck 的核心就是一个 React 编辑器和一个渲染器，因此很容易接入任意 React 应用，并通过配置来定义编辑行为。

- **Schema 驱动字段：**在 Puck 中，富文本通过显式字段 schema 定义，允许的结构和行为在应用层清晰且可强制执行。

- **基于 TipTap：**Puck 的富文本编辑器由 [TipTap](https://tiptap.dev/docs) 驱动。TipTap 是一个广泛采用的编辑器引擎，以可扩展、状态驱动架构著称。

- **可定制：**可以开启或关闭格式化选项、标题级别与编辑器能力。

- **面向扩展设计：**可以通过扩展新增格式能力和行为，而不需要修改或 fork 编辑器核心。

- **天然适配 React：**Puck 的配置模型与 [React 组件驱动方式](https://puckeditor.com/docs/integrating-puck/component-configuration)一致，使富文本编辑更易理解和维护。

## 分步教程：使用 Puck 进行富文本编辑

完整可运行示例位于这个 [GitHub 仓库](https://github.com/Studio1HQ/puck_demo_richtext)。建议你 clone 仓库并在本地运行，以便查看完整实现；或者按下文步骤从零搭建。

在本地运行示例，请使用以下命令：

```bash
git clone https://github.com/Studio1HQ/puck_demo_richtext.git
cd puck_demo_richtext
npm install
npm run dev
```

然后访问 http://localhost:3000/edit 体验编辑器。

### 1）安装并初始化 Puck

如果你要把 Puck 接入现有项目，可以直接安装：

```bash
npm install @puckeditor/core
```

也可以通过官方 recipe 脚手架快速创建一个完整项目：

```bash
npx create-puck-app rich-text-demo
cd rich-text-demo
npm run dev
```

服务启动后，`/edit` 用于编辑页面，`/` 用于查看渲染结果。

![](https://res.cloudinary.com/die3nptcg/image/upload/v1769688332/blog-2_v6v5og.png)

Next.js 的 Puck recipe 通常包含：

- **Editor**：可视化编辑界面，用于添加和编辑内容块。
- **Renderer**：读取已保存数据并按同一套组件配置渲染出页面。
- **配置驱动**：通过单一配置文件定义可用区块、字段类型和编辑行为，而不是手写大量编辑器逻辑。

本文聚焦编辑器配置及富文本行为定义，路由、持久化和部署细节会刻意简化。

### 2）在 Puck 中添加富文本字段

Puck 的富文本编辑是通过配置声明式实现的。你不需要手写 DOM 更新逻辑，也不需要自己维护选区状态；只需在组件定义里添加 `richtext` 类型字段。

下面是 `puck.config.tsx` 的基础示例（含一个对照用标题块 + 一个富文本块）：

```tsx
import type { Config } from "@puckeditor/core";

type Props = {
	HeadingBlock: { title: string };
	RichTextBlock: { content: string };
};

export const config: Config<Props> = {
	components: {
		HeadingBlock: {
			fields: {
				title: { type: "text" },
			},
			defaultProps: {
				title: "Heading",
			},
			render: ({ title }) => (
				<div style={{ padding: 64 }}>
					<h1>{title}</h1>
				</div>
			),
		},
		RichTextBlock: {
			label: "Rich Text",
			fields: {
				content: {
					type: "richtext",
				},
			},
			render: ({ content }) => (
				<div style={{ padding: 64, maxWidth: 700, margin: "0 auto" }}>
					{content}
				</div>
			),
		},
	},
};

export default config;
```

要开启内联编辑，可在 `content` 字段上添加 `contentEditable: true`：

```tsx
RichTextBlock: {
	fields: {
		content: {
			type: "richtext",
			contentEditable: true,
		},
	},
}
```

![](https://res.cloudinary.com/die3nptcg/image/upload/v1769688332/blog-3_zs0o49.png)

内联编辑很适合简单改文案、快速微调，以及“在最终视觉上下文中直接编辑内容”的工作流。

### 3）定制编辑器行为（Control）

真实项目里，默认工具栏往往选项太多，容易造成内容风格不一致。多数团队需要“有限且明确”的格式能力，以保证可读性、可访问性和可维护性。

#### 关闭某个格式能力（以粗体为例）

在 `content` 字段的 `options` 中配置：

```tsx
content: {
	type: "richtext",
	options: {
		bold: false,
	},
}
```

这样会禁用粗体能力。

![](https://res.cloudinary.com/die3nptcg/image/upload/v1769688331/blog-4_gqnyxq.png)

#### 限制标题级别（Structure）

无限制地开放标题层级，往往会带来层级混乱与可访问性问题。很多应用只需要 H1、H2。

```tsx
content: {
	type: "richtext",
	options: {
		heading: {
			levels: [1, 2],
		},
	},
}
```

应用后，编辑器只允许 H1/H2，其他级别会从界面移除，快捷键也不能再应用它们。

![](https://res.cloudinary.com/die3nptcg/image/upload/v1769688332/blog-5_vn6a3m.png)

#### 自定义工具栏（UI Control）

你可以重写富文本菜单栏，只暴露需要的控件：

```tsx
import { RichTextMenu } from "@puckeditor/core";

content: {
	type: "richtext",
	renderMenu: () => (
		<RichTextMenu>
			<RichTextMenu.Group>
				<RichTextMenu.Bold />
			</RichTextMenu.Group>
		</RichTextMenu>
	),
}
```

这会把默认工具栏替换成“仅含粗体”的最小菜单。

![](https://res.cloudinary.com/die3nptcg/image/upload/v1769688332/blog-6_xsdpzw.png)

### 4）添加自定义扩展（Extensibility）

现代富文本编辑器不应是“所有功能都塞进核心”的单体系统。更常见的做法是：核心保持轻量，能力通过扩展注入。

Puck 的富文本基于 TipTap，因此可以通过配置注册扩展。下面以上标 `Superscript` 为例。

先安装扩展：

```bash
npm install @tiptap/extension-superscript
```

在 `puck.config.tsx` 里注册：

```tsx
import Superscript from "@tiptap/extension-superscript";

content: {
	type: "richtext",
	tiptap: {
		extensions: [Superscript],
	},
}
```

这一步只是在“编辑器引擎层”启用了能力，用户界面还没有按钮。

#### 通过自定义控件暴露扩展能力

要让用户可用，需要把该能力接到工具栏上。通常通过 `selector` 暴露编辑器状态，再由 `renderMenu` 渲染对应控件。

```tsx
RichTextBlock: {
	label: "Rich Text",
	fields: {
		content: {
			type: "richtext",
			tiptap: {
				extensions: [Superscript],
				selector: ({ editor }) => ({
					isSuperscript: editor?.isActive("superscript"),
					canSuperscript: editor?.can().chain().focus().toggleSuperscript().run(),
				}),
			},
			renderMenu: ({ children, editor, editorState }) => (
				<RichTextMenu>
					{children}
					<RichTextMenu.Group>
						<RichTextMenu.Control
							title="Superscript"
							onClick={() => editor?.chain().focus().toggleSuperscript().run()}
							active={editorState?.isSuperscript}
							disabled={!editorState?.canSuperscript}
						/>
					</RichTextMenu.Group>
				</RichTextMenu>
			),
		},
	},
}
```

![](https://res.cloudinary.com/die3nptcg/image/upload/v1769688333/blog-7_xfsmgb.png)

这份配置把 Superscript 扩展和界面打通了：`selector` 提供“当前是否激活、当前能否执行”的状态，工具栏控件据此展示并响应交互。

## 进一步探索（Further Exploration）

你可以在这个示例基础上继续扩展：

- 添加更多 TipTap 扩展
- 增加更多编辑约束（options）
- 试验不同工具栏布局
- 接入持久化或协作能力

## 关键结论（Key Takeaways）

富文本编辑最稳妥的方式，是把它当成“结构化系统”，而不是“自由输入框”。通过有意图的内容建模、明确规则约束和配置式扩展，团队可以构建能随应用规模稳定演进的编辑器。

Puck 与这种模式天然契合：它把结构化富文本引擎与配置驱动方式结合起来，且与现代 React 开发习惯一致。

- **结构优先于无约束标记：**富文本应编码语义与层级，而不是只依赖浏览器托管 HTML。
- **控制优先于放任自由：**编辑器应主动执行设计与内容规则，而非事后人工清理。
- **通过配置扩展：**新增能力无需修改核心逻辑，风险更可控。
- **关注点分离：**编辑行为、界面展示、最终渲染彼此解耦。

可继续查看完整示例仓库，基于你自己的业务约束扩展编辑器：

- https://github.com/Studio1HQ/puck_demo_richtext

