原文：Building Design Components with Action Props using Async React  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 使用 Async React 通过 Action Props 构建设计组件

发布：2026 年 2 月 23 日｜17:00  
React Conf 2025 确立了 [Async React](https://www.youtube.com/watch?v=B_2E96URooA) 这一概念，并引入了三个层次：异步设计（async design）、异步路由（async router）和异步数据（async data）。在这篇文章中，我们会把“设计层”落到实处：从零开始构建两个组件（一个标签列表，以及一个可内联编辑的文本字段），在异步工作进行时逐步改善用户体验，同时把乐观更新和加载状态都封装在组件内部，从而让组件使用方保持简单。

如果你想了解或复习 Async React 的基础原语（primitives），可以看看我在 LogRocket 上的文章《[The next era of React has arrived](https://blog.logrocket.com/the-next-era-of-react/)》。另一个例子可以看我的[上一篇文章](https://aurorascharff.no/posts/building-reusable-components-with-react19-actions)：在 Async React 还没有给出这套术语之前，我们就用这种模式构建了一个可复用的 `Select` 组件。

## 目录

打开目录

- [Actions 与 Action Prop 模式](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#actions-and-the-action-prop-pattern)

[示例 1：TabList](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#example-1-tablist)

- [跟踪 Pending 状态](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#tracking-the-pending-state)

- [添加乐观更新](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#adding-optimistic-updates)

- [最终版 TabList](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#the-final-tablist)

- [用法：博客后台中的 PostTabs](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#usage-posttabs-in-a-blog-dashboard)

- [加餐：自定义 Pending 状态](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#bonus-customizing-the-pending-state)

[示例 2：EditableText](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#example-2-editabletext)

- [添加乐观状态与 Pending 指示器](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#adding-optimistic-state-and-pending-indicators)

- [使用 displayValue 格式化乐观状态](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#formatting-optimistic-state-with-displayvalue)

- [最终版 EditableText](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#the-final-editabletext)

- [用法：销售看板中的 RevenueGoal](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#usage-revenuegoal-in-a-sales-dashboard)

- [关键要点](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#key-takeaways)

- [结论](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/#conclusion)

## Actions 与 Action Prop 模式

本文中的组件依赖 Async React 的两个原语：

- [`useTransition`](https://react.dev/reference/react/useTransition)：将异步工作作为一个 [Action](https://react.dev/reference/react/useTransition#starttransition)（也就是 transition 内部的函数）来运行，由 React 统一协调，保持 UI 的响应性，并提供一个 `isPending` 标志。错误会向上冒泡到错误边界（error boundaries）。

- [`useOptimistic`](https://react.dev/reference/react/useOptimistic)：展示与某个异步 Action 协同的临时状态，并在失败时自动回滚。

React 文档描述了一种模式：[暴露 action props](https://react.dev/reference/react/useTransition#exposing-action-props-from-components)：组件以 props 的形式接收 action 函数，并在组件内部把它们放到 transition 里执行。更新后的 [`useOptimistic` 文档](https://react.dev/reference/react/useOptimistic#using-optimistic-state-in-action-props) 则展示了如何把它与乐观状态结合起来。

基本模式如下：

```js
function DesignComponent({ value, action }) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [isPending, startTransition] = useTransition();

  function handleChange(newValue) {
    startTransition(async () => {
      setOptimistic(newValue);
      await action(newValue);
    });
  }
  // ...
}
```

组件自身负责 transition、乐观状态以及 pending 时的 UI。使用方只需要传入一个值和一个 action。

未来，组件库可以直接提供内置 action props 的组件；但在那之前（或者针对你自己的组件），我们可以自己把它们构建出来。

## 示例 1：TabList

我们先来构建一个可复用的标签列表组件。一个基础版本可能长这样：

```ts
type TabListProps = {
  tabs: { label: string; value: string }[];
  activeTab: string;
  onChange: (value: string) => void;
};

export function TabList({ tabs, activeTab, onChange }: TabListProps) {
  return (
    <div>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={tab.value === activeTab ? "active" : ""}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

使用方可能会用它通过 URL 来筛选内容：

```ts
import { useRouter, useSearchParams } from "next/navigation";

function FilterTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("filter") ?? "all";

  return (
    <TabList
      tabs={tabs}
      activeTab={currentTab}
      onChange={value => router.push(`/?filter=${value}`)}
    />
  );
}
```

当 `onChange` 会触发异步工作时（比如 Next.js 里的 `router.push`，此时 Server Component 会带着新的 search params 重新渲染），`activeTab` 要等到这些工作完成后才会更新。在慢网环境下，用户点击一个 tab，却什么反应都没有——得不到任何反馈来确认他们的交互已被记录。

### 跟踪 Pending 状态

我们来新增一个 `changeAction` prop，并用 `useTransition()` 来跟踪 pending 状态。“Action” 这个后缀表示该函数会在 transition 内运行。它同时接受同步和异步函数（`void | Promise<void>`），因此使用方可以直接传入任意一种，而不需要自己再包一层 `startTransition`：

```ts
type TabListProps = {
  tabs: { label: string; value: string }[];
  activeTab: string;
  changeAction: (value: string) => void | Promise<void>;
};

export function TabList({ tabs, activeTab, changeAction }: TabListProps) {
  const [isPending, startTransition] = useTransition();

  function handleTabChange(value: string) {
    startTransition(async () => {
      await changeAction(value);
    });
  }

  return (
    <div>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => handleTabChange(tab.value)}
          className={tab.value === activeTab ? "active" : ""}
        >
          {tab.label}
        </button>
      ))}
      {isPending && <Spinner />}
    </div>
  );
}
```

现在，当 Action 处于 pending 时会显示一个 spinner。由于加载指示器放在组件内部，反馈会聚焦在这次交互本身——这比全局 loading bar 的体验好得多。但 active tab 仍然不会立刻更新。

### 添加乐观更新（Optimistic Updates）

这就轮到 `useOptimistic()` 登场了。它会基于 `activeTab` 这个 prop 创建一个临时的客户端状态，我们可以在 Action 完成之前先在其中设置新值：

```ts
export function TabList({ tabs, activeTab, changeAction }: TabListProps) {
  const [optimisticTab, setOptimisticTab] = useOptimistic(activeTab);
  const [isPending, startTransition] = useTransition();

  function handleTabChange(value: string) {
    startTransition(async () => {
      setOptimisticTab(value);
      await changeAction(value);
    });
  }

  return (
    <div>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => handleTabChange(tab.value)}
          className={tab.value === optimisticTab ? "active" : ""}
        >
          {tab.label}
        </button>
      ))}
      {isPending && <Spinner />}
    </div>
  );
}
```

现在，点击后 tab 会立刻切换。`optimisticTab` 会在 Action pending 期间持有新值；一旦 `changeAction` 完成，并且父组件把 `activeTab` 更新为新的值之后，它就会回落（settle）到这个新的“真实来源”（source of truth）。

因为所有逻辑都运行在 transition 内，React 会把它们协调成一次稳定的 commit，从而避免中间态渲染和 UI 闪烁。使用方只需要传值和回调，而设计组件负责异步实现与 UI 表现。

### 最终版 TabList

使用方有时还需要一个 `onChange` 事件处理器，以便访问事件对象本身——例如做校验或调用 `event.preventDefault()`。`onChange` 会在 transition 开始之前同步触发。

下面是最终的 `TabList`：

```ts
import { useOptimistic, useTransition } from "react";

type TabListProps = {
  tabs: { label: string; value: string }[];
  activeTab: string;
  changeAction?: (value: string) => void | Promise<void>;
  onChange?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function TabList({
  tabs,
  activeTab,
  changeAction,
  onChange,
}: TabListProps) {
  const [optimisticTab, setOptimisticTab] = useOptimistic(activeTab);
  const [isPending, startTransition] = useTransition();

  function handleTabChange(
    e: React.MouseEvent<HTMLButtonElement>,
    value: string
  ) {
    onChange?.(e);
    startTransition(async () => {
      setOptimisticTab(value);
      await changeAction?.(value);
    });
  }

  return (
    <div>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={e => handleTabChange(e, tab.value)}
          className={tab.value === optimisticTab ? "active" : ""}
        >
          {tab.label}
        </button>
      ))}
      {isPending && <Spinner />}
    </div>
  );
}
```

上面的代码做了精简，以便聚焦在 action props 这种模式上。你可以在 GitHub 上查看 [`TabList`](https://github.com/aurorascharff/next16-async-react-blog/blob/main/components/design/TabList.tsx)。一个完整的设计组件还会处理诸如可访问性基础设施（accessibility primitives）、受控与非受控用法等更多内容。

### 用法：博客仪表盘中的 PostTabs

假设我们想在博客后台按状态筛选文章：每个 tab 都会更新一个 search param，并让页面在服务端用筛选后的数据重新渲染。

下面是使用方如何使用完成后的 `TabList`：

```ts
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TabList } from "@/components/design/TabList";

const tabs = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "drafts" },
  { label: "Archived", value: "archived" },
];

export function PostTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("filter") ?? "all";

  return (
    <TabList
      tabs={tabs}
      activeTab={currentTab}
      changeAction={value => router.push(`/dashboard?filter=${value}`)}
    />
  );
}
```

乐观更新、pending spinner 以及回滚（rollback）都由 `TabList` 在内部处理。tab 会立刻切换，而文章列表（包在 `Suspense` 里）会在后台加载新的筛选数据期间保持可见。你可以在 [next16-async-react-blog](https://next16-async-react-blog.vercel.app/dashboard) 上亲自试试。

![](https://aurorascharff.no/_astro/blogtabs.EFNx6L6y_cEXnP.webp)

### 加餐：自定义 Pending（进行中）状态

加载状态是一项一等的设计考量。把它封装在设计组件内部，有助于确保设计系统中所有组件都能提供一致的反馈，因此内置的 spinner 作为默认值是合理的。

但有时你希望对 pending UI 拥有完全的控制权。一种做法是接受一个 `hideSpinner` prop，让使用者可以抑制默认的指示器。这样使用者就能自己添加 `useTransition`，并以他们喜欢的方式使用 `isPending`。关于这里的最佳实践，目前还没有完全定型。

有了 `hideSpinner`，使用者可以在一个包裹层上设置 `data-pending` 属性，并使用 Tailwind 的 `group-has-data-pending:` 变体来为周围内容添加样式：

```tsx
export function PostTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("filter") ?? "all";
  const [isPending, startTransition] = useTransition();

  return (
    <div data-pending={isPending ? "" : undefined}>
      <TabList
        hideSpinner
        tabs={tabs}
        activeTab={currentTab}
        changeAction={value => {
          startTransition(() => {
            router.push(`/dashboard?filter=${value}`);
          });
        }}
      />
    </div>
  );
}
```

使用者的 `startTransition` 控制 `isPending`，而 `data-pending` 会沿着 DOM 级联，因此任何后代元素都可以用 CSS 对它做出响应。乐观的 Tab 切换仍然发生在 `TabList` 内部，而外层 UI 则展示自定义的加载样式。在一个共享的祖先元素上添加 `group` class，后代元素就可以用 `group-has-data-pending:` 来给自己加样式：

```tsx
<div className="space-y-4 group-has-data-pending:animate-pulse">
  {posts.map(post => ({
    /* ... */
  }))}
</div>
```

现在点击某个 Tab 会立刻切换激活的 Tab（在 `TabList` 内进行乐观更新），同时卡片列表通过 CSS 展示自定义的反馈效果。

![](https://aurorascharff.no/_astro/customize.BWsczyBN_2nGjJJ.webp)

## 示例 2：EditableText

让我们把同样的模式应用到一个行内可编辑的文本字段。用户点击进入编辑、输入值，然后按 Enter 或点击保存按钮提交。

一个基础版本可能长这样：

```tsx
type EditableTextProps = {
  value: string;
  onSave: (value: string) => void | Promise<void>;
};

export function EditableText({ value, onSave }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function handleCommit() {
    setIsEditing(false);
    onSave(draft);
  }

  function handleCancel() {
    setDraft(value);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") handleCommit();
          if (e.key === "Escape") handleCancel();
        }}
        autoFocus
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value);
        setIsEditing(true);
      }}
    >
      {value || "Click to edit..."}
    </button>
  );
}
```

使用者可能会用它来异步持久化一个值，并在展示时做自定义格式化：

```tsx
function EditablePrice({ price }) {
  return (
    <EditableText
      value={price}
      onSave={async newValue => {
        await savePrice(newValue);
      }}
      displayValue={formatCurrency(Number(price))}
    />
  );
}
```

当 `onSave` 是异步的，显示的文本在它完成之前不会更新，只有等父组件用新的 `value` prop 重新渲染后才会更新。格式化后的 `displayValue` 在那之前也同样是旧的，因为它是从父组件的 `price` 派生出来的。在慢网速下，用户点击保存后看到的仍是旧文本且没有任何反馈：这就是我们在 `TabList` 中遇到的同一个问题。

### 添加乐观状态与 Pending 指示器

就像 `TabList` 一样，我们把回调重命名为 `action`（表明它会在 transition 内运行），并加入 `useTransition` 和 `useOptimistic`：

```tsx
export function EditableText({ value, action }: EditableTextProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function handleCommit() {
    setIsEditing(false);
    if (draft === optimisticValue) return;
    startTransition(async () => {
      setOptimisticValue(draft);
      await action(draft);
    });
  }

  function handleCancel() {
    setDraft(optimisticValue);
    setIsEditing(false);
  }
  ...
}
```

现在我们获得了与 `TabList` 相同的收益：值会立刻更新，`isPending` 驱动一个 spinner，而失败会自动回滚。注意 `handleCancel` 会重置到 `optimisticValue` 而不是 `value`，这样如果某次保存仍在进行中，草稿值也会反映最新的 pending 保存结果。

### 用 displayValue 格式化乐观状态

上面的 `EditablePrice` 使用者传入了一个静态的 `displayValue`，它来自父组件的 `price` prop。但由于乐观状态存在于组件内部，这个静态值不会反映乐观更新。一种解决方案是让 `displayValue` 也支持传入一个函数：该函数接收当前值并返回格式化后的输出：

```tsx
<EditableText
  value={price}
  action={savePrice}
  displayValue={value => formatCurrency(Number(value))} // renders "$70,000"
/>
```

下面是该 prop 的类型定义：

```tsx
type EditableTextProps = {
  value: string;
  action: (value: string) => void | Promise<void>;
  onChange?: (e: React.SyntheticEvent) => void;
  displayValue?: ((value: string) => React.ReactNode) | React.ReactNode;
};
```

它既接受函数，也接受静态的 `ReactNode`。在组件内部，我们会基于乐观值来解析它：

```tsx
const resolvedDisplay = optimisticValue
  ? typeof displayValue === "function"
    ? displayValue(optimisticValue)
    : (displayValue ?? optimisticValue)
  : null;
```

当 `displayValue` 是一个函数时，组件会用乐观值调用它，因此格式化后的显示内容会在提交（commit）时立即更新，而无需调用方访问乐观状态。

### 最终版 EditableText

和 `TabList` 一样，最终版本也接受一个 `onChange` 事件处理器，用于当调用方需要访问事件对象时的场景。

下面是最终实现：

```ts
import { useOptimistic, useState, useTransition } from "react";

type EditableTextProps = {
  value: string;
  displayValue?: ((value: string) => React.ReactNode) | React.ReactNode;
  onChange?: (e: React.SyntheticEvent) => void;
  action: (value: string) => void | Promise<void>;
};

export function EditableText({
  value,
  displayValue,
  action,
  onChange,
}: EditableTextProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function handleCommit(e: React.SyntheticEvent) {
    setIsEditing(false);
    if (draft === optimisticValue) return;
    onChange?.(e);
    startTransition(async () => {
      setOptimisticValue(draft);
      await action(draft);
    });
  }

  function handleCancel() {
    /* ... */
  }

  const resolvedDisplay = optimisticValue
    ? typeof displayValue === "function"
      ? displayValue(optimisticValue)
      : (displayValue ?? optimisticValue)
    : null;

  if (isEditing) {
    return (
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") handleCommit(e);
          if (e.key === "Escape") handleCancel();
        }}
        autoFocus
      />
      // ... save/cancel buttons
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setDraft(optimisticValue);
          setIsEditing(true);
        }}
      >
        {resolvedDisplay || "Click to edit..."}
      </button>
      {isPending && <Spinner />}
    </>
  );
}
```

和 `TabList` 一样，上面的代码是精简版。你可以在 GitHub 上查看 [`EditableText`](https://github.com/aurorascharff/next16-chart-dashboard/blob/main/components/design/EditableText.tsx)。一个完整的设计组件还会处理更多内容，比如扩展的输入属性、受控与非受控用法等。

### 用法：销售仪表盘中的 RevenueGoal

假设我们想让用户在销售仪表盘里以内联方式编辑一个营收目标：原始数字以字符串形式存储，但显示时要格式化为货币。

下面是调用方使用完成版 `EditableText` 的方式：

```ts
"use client";

import { use } from "react";
import { saveRevenueGoal } from "@/data/actions/preferences";
import { formatCurrency } from "@/lib/utils";
import { EditableText } from "./design/EditableText";

export function RevenueGoal({
  goalPromise,
}: {
  goalPromise: Promise<number | null>;
}) {
  const goal = use(goalPromise);

  return (
    <EditableText
      value={goal?.toString() ?? ""}
      action={saveRevenueGoal}
      displayValue={value => formatCurrency(Number(value))}
      prefix="$"
      type="number"
      placeholder="Set a target..."
    />
  );
}
```

调用方传入当前值、一个作为 `action` 的 Server Function，以及一个用于货币格式化的 `displayValue` 格式化器。其余工作都由组件内部处理。你可以在 [next16-chart-dashboard](https://next16-chart-dashboard.vercel.app/) 上亲自试用。

![](https://aurorascharff.no/_astro/revenuegoal.CNSdy7Nr_1hAdOt.webp)

## 关键要点

- Actions 将多个异步操作协调为稳定的提交（commit），避免中间态渲染和 UI 闪烁。

- 乐观状态会与“真实来源（source of truth）”保持同步，并在 Action 失败时自动回滚。

- 在 Actions 内部抛出的错误会冒泡到最近的错误边界（error boundary），因此组件不需要手动做错误处理。

- 设计组件在内部使用 `useTransition` 与 `useOptimistic` 封装异步协调逻辑，因此调用方只需要使用 `action` 这个 prop。

- 给 action 类型的 props 以 “Action” 作为后缀命名，以遵循 Async React 的约定。

## 结论

action props 模式适用于任何交互组件：下拉选择（select）、复选框（checkbox）、搜索输入框（search input）、开关（toggle）。理想情况下，这类逻辑应该放在我们已经使用的组件库里。Async React 已经在很大程度上标准化了异步路由与加载层，而 [Async React Working Group](https://github.com/reactwg/async-react/discussions) 也正在与 UI 框架合作，把同样的协调能力带到设计层；但在那之前，我们也可以先构建自己的方案。

希望这篇文章对你有所帮助。如果你有任何问题或评论，请告诉我；也欢迎在 [Bluesky](https://bsky.app/profile/aurorascharff.no) 或 [X](https://x.com/aurorascharff) 关注我以获取更多更新。编码愉快！

async-react  
actions  
react-19  
nextjs  
app-router  
component-libraries  

返回顶部｜在以下平台分享这篇文章：  

通过 WhatsApp 分享这篇文章  
在 Facebook 分享这篇文章  
在 Twitter 转发这篇文章  
通过 Telegram 分享这篇文章  
在 Pinterest 分享这篇文章  
通过电子邮件分享这篇文章