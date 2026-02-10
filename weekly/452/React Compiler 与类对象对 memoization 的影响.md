原文：React Compiler and why class objects can work against memoization
翻译：TUARAN
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# React Compiler 与类对象对 memoization 的影响

[原文链接：React Compiler and why class objects can work against memoization](https://anita-app.com/blog/articles/react-compiler-and-why-class-objects-work-against-memoization.html)

作者：ilDon

2026 年 2 月 6 日

React Compiler 已经稳定可用（React Blog，2025-10-07）。它能显著减少我们手写 `useMemo`、`useCallback`、`React.memo` 的需求。

对大多数以函数组件 + 不可变数据为主的代码库来说，这是个好消息。但有一种模式会变得越来越别扭：

- 组件渲染依赖“带方法的类实例”
- 方法内部根据实例的私有字段计算派生值

当你的渲染路径里充斥这类类实例时，Compiler 的自动 memoization 可能没有你想要的那么“精确”，你往往会为了重新获得可控性而把手动 memoization 又加回来。

## React Compiler 的优化依赖“可观察的依赖”

React Compiler 会基于静态分析与启发式自动为组件与中间值注入 memoization。

- React Compiler 介绍：<https://react.dev/learn/react-compiler/introduction>
- React Compiler v1.0 博文：<https://react.dev/blog/2025/10/07/react-compiler-1>

但关键细节是：memoization 仍然依赖 React 能“观察到”的输入。

在 React 中，对象的比较是基于引用的（`Object.is` 语义）。这在 `memo` 与 `useMemo` 的文档里都明确写过：

- `memo`：<https://react.dev/reference/react/memo>
- `useMemo`：<https://react.dev/reference/react/useMemo>

因此，如果真正有意义的值藏在对象实例内部，而实例引用又频繁变化，那么 React（以及 Compiler）只能保守地认为值变了，于是重算也就不可避免。

## 一个例子：`ElementClass`

假设你用一个类来建模元素：

```ts
class ElementClass {
  constructor(private readonly isoDate: string) {}

  public getFormattedDate(): string {
    const date = new Date(this.isoDate);

    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  }
}
```

组件里直接调用方法：

```tsx
export function Row({
  elementInstance,
}: {
  elementInstance: ElementClass;
}) {
  const formattedDate = elementInstance.getFormattedDate();
  return <span>{formattedDate}</span>;
}
```

这段代码很可读。但从“React 能观察到的依赖”角度看，真正的输入几乎只能是 `elementInstance` 这个引用。

如果你的状态管理层每次都返回一个新的 `ElementClass` 实例，那么即使底层 `isoDate` 没变，React/Compiler 也会认为依赖变了，于是派生值会被重复计算。

## 手动逃生舱：可用，但很吵

你可以强行让依赖更“窄”：把 `isoDate` 暴露出来，并用 `useMemo` 以它作为依赖。

```ts
class ElementClass {
  constructor(public readonly isoDate: string) {}
  // 其他不变
}

export function Row({ elementInstance }: { elementInstance: ElementClass }) {
  const formattedDate = useMemo(
    () => elementInstance.getFormattedDate(),
    [elementInstance.isoDate],
  );

  return <span>{formattedDate}</span>;
}
```

React 也明确把 `useMemo`/`useCallback`/`React.memo` 视作 Compiler 时代仍可用的 escape hatch：

<https://react.dev/blog/2025/10/07/react-compiler-1#what-should-i-do-about-usememo-usecallback-and-reactmemo>

但代价是：

- 又回到了手动“依赖接线”的世界
- UI 层不得不暴露/依赖领域对象的内部字段

## 更“编译器友好”的替代：纯数据 + 纯函数

如果 UI 只接收不可变的 plain data，依赖就会变得显式而廉价：

```ts
type Element = {
  isoDate: string;
};

export function Row({ element }: { element: Element }) {
  const formattedDate = DateHelpers.formatDate(element.isoDate);
  return <span>{formattedDate}</span>;
}
```

此时 `formatDate` 的输入是原始类型（`isoDate`），不是藏在类实例里的隐式状态。这样 Compiler 更容易围绕一个明确、稳定的 primitive 依赖做 memoization。

你可能会反驳：即使换成 plain object，只要 `element` 引用变了，`Row` 仍会 re-render。

没错：对象引用变化会触发 re-render，这点对类实例与 plain object 都成立。区别在于：至少“派生值的重复计算”更容易被 Compiler 或你自己控制。

如果你真的想减少因对象 identity churn 导致的无意义 re-render，可以只把子组件真正需要的 primitive 往下传：

```tsx
export function Row({ isoDate }: { isoDate: string }) {
  const formattedDate = DateHelpers.formatIsoDate(isoDate);
  return <span>{formattedDate}</span>;
}
```

这样组件只会在 `isoDate` 变化时才重新渲染。

当然，你也可以在父组件里直接传 `formattedDate`（字符串）给子组件：

```tsx
function Parent({ element }: { element: ElementClass }) {
  return <Row formattedDate={element.getFormattedDate()} />;
}

function Row({ formattedDate }: { formattedDate: string }) {
  return <span>{formattedDate}</span>;
}
```

此时子组件拿到 primitive prop，但昂贵计算只是从子组件搬到了父组件；如果 `element` 引用频繁变化，`getFormattedDate()` 依然会频繁执行。

## 一个实用的经验法则

在 React 的渲染路径里，优先选择“数据优先（data-first）”模型，而不是“行为丰富的类实例”。

类可以放在边界（领域层、解析、适配器等）来提供价值，但进入组件树时，尽量传可序列化的 plain data；渲染时的派生计算尽量写成纯函数。

配合 React Compiler，这通常意味着：

- 更高的自动 memoization 命中率
- 更少需要手写 `useMemo` 逃生舱
- 依赖更清晰、更好推理
- 更少因对象 identity churn 导致的意外重算

React Compiler 的确减少了大量优化工作，但它仍然奖励“依赖显式”的代码形态。对现代 React 的 UI 渲染来说，plain objects + pure helpers 往往是更可扩展的选择。
