React 生态系统多年来不乏挑战者，但偶尔会出现一些真正让人耳目一新的东西。RippleJS 不仅仅是又一个宣称“比 React 更好”的框架；它是对我们编写 UI 代码方式的一次彻底反思，而且它的构建者曾深入研究过 React 和 Svelte 的核心机制。

它的创建者是 [Dominic Gannaway](https://github.com/trueadm)（没错，就是那个在 Meta 参与 React Hooks 开发、创建了 Lexical、编写了 Inferno 并担任 Svelte 5 核心维护者的大佬）。当一个拥有如此深厚框架开发经验的人决定推倒重来，将所有经验教训毕其功于一役时，RippleJS 就诞生了。最疯狂的是什么？他仅用不到一周的时间就构建出了原型（“Vibe coding”在其中绝对功不可没）。

如果你想听听 Dominic 亲自讲述他对 RippleJS 的思考及其背后的理念，PodRocket 团队对他进行了专访。你可以在这里收听这期节目：[PodRocket 访谈：Dominic Gannaway 聊 RippleJS。](https://podrocket.logrocket.com/ripple-js-dominic-gannaway-logrocket-podrocket)

## 目标

在本文中，我们将探讨 RippleJS 的独特之处，通过[构建一个待办事项列表](https://github.com/marvelken/Ripple-JS-demo)（响应式编程界的“Hello World”）来观察它的实际运行情况，并讨论它是否值得你投入关注。

你需要具备：

-   基本的 [JavaScript](https://blog.logrocket.com/javascript-concepts-before-learning-react/) / [TypeScript](https://blog.logrocket.com/understanding-typescripts-benefits-pitfalls/) 知识
-   一定的 HTML/CSS 基础
-   React 经验（非常有帮助，因为我们稍后会将两者进行对比）

## 核心哲学：TypeScript 原生，而非后加

首先要澄清一点：使用 RippleJS 并不意味着你要停止编写 TypeScript。恰恰相反，它意味着 TypeScript 从第一天起就与框架融为一体，而不是事后强行“外挂”上去的。

### 在 React 中：

-   你编写 `.tsx` 文件（TypeScript + JSX）
-   TypeScript 负责检查类型
-   JSX 只是语法糖；React 在类型层面上并不真正“理解”你的响应式模式
-   你最终会得到像 `useState<number>` 这样的泛型类型，它对你的实际状态逻辑知之甚少

### 在 RippleJS 中：

-   你编写 `.ripple` 文件，本质上这是专为 TypeScript 设计的 JSX 超集
-   编译器既理解你的 TypeScript 类型，也理解你的响应式状态模式
-   你能获得更好的自动补全、错误检查和工具支持，因为框架知道 `track()` 到底意味着什么
-   `.ripple` 扩展名的设计初衷不仅是为了提供更好的开发体验（DX），“不仅是为了人类，也是为了 LLM（大语言模型）”

这是在工具链、错误提示和开发体验设计上的根本性转变，尤其是在当今 [TypeScript](https://blog.logrocket.com/react-typescript-10-patterns-writing-better-code/) 几乎已成为默认标配的世界里。

来看一个具体的例子：

```typescript
// React (.tsx) - TypeScript 游离于 React 的响应式系统之外
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0); // 泛型类型，React 并不"知道" count 的响应式本质
  const double = count * 2; // 非响应式，仅仅是一个计算值

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {double}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// RippleJS (.ripple) - TypeScript 与响应式系统集成
import { track } from 'ripple';

export component Counter() {
  let count = track(0); // 编译器知道这是响应式的
  let double = track(() => @count * 2); // 编译器知道这是由 count 派生而来的

  <div>
    <p>{"Count: "}{@count}</p>
    <p>{"Double: "}{@double}</p>
    <button onClick={() => @count++}>{"Increment"}</button>
  </div>
}
```

在 RippleJS 中，编译器理解 `double` 是从 `count` 派生出来的。如果你尝试在不合理的地方使用 `@double`，或者在访问被追踪的值时忘记加 `@`，编译器会立即通过精确的错误消息捕获它。

而在 React 中，TypeScript 大多时候看到的只是普通的变量和函数。它无法以同样的方式推断响应式逻辑。不过话说回来，我们也不能假装 Ripple 的语法乍一看没有 React 那么“清爽”；确实，它在视觉上稍微繁杂一些。

## RippleJS 目前的现状

咱们实话实说，看看 RippleJS 目前到底是个什么状态。

### 它拥有的：

-   极其优秀的性能和内存使用率
-   与类型检查完全集成的 TypeScript 支持
-   带有诊断和智能提示（IntelliSense）的 VSCode 扩展
-   Prettier 格式化支持
-   组件级作用域 CSS

### 它（暂时）缺少的：

-   [SSR](https://blog.logrocket.com/server-side-rendering-react-router-v7/)（服务端渲染）——目前仅支持 SPA（单页应用）
-   针对各种用例的全面生产环境测试
-   庞大的第三方库生态系统

不过，让它变得有趣的是它的发展方向。目前的计划包括集成 SSR，以及将 AI 接入开发服务器以帮助诊断“页面级”问题。在一个大家都在使用 AI 编码工具的世界里，一个从设计之初就考虑到 AI 辅助的框架是非常耐人寻味的。

## Ripple 的组件模型

如果你写 React 已经有一段时间了，RippleJS 会让你感觉很熟悉，但在某些方面又截然不同。最大的思维转变在于：组件不**返回** JSX；它们**本身就是** JSX。

让我演示一下这是什么意思：

```typescript
// React - 组件返回 JSX
function Button({ text, onClick }) {
  return (
    <button onClick={onClick}>
      {text}
    </button>
  );
}

function App() {
  return (
    <div>
      <Button text="Click me" onClick={() => console.log("Clicked!")} />
    </div>
  );
}
// RippleJS - 组件即 JSX (命令式风格)
component Button(props: { text: string, onClick: () => void }) {
  <button onClick={props.onClick}>
    {props.text}
  </button>
}

export component App() {
  <div>
    <Button text="Click me" onClick={() => console.log("Clicked!")} />
  </div>
}
```

注意到了吗？使用的是 `component` 关键字而不是 `function`。同时也请注意，这里没有 `return` 语句。这是因为在 RippleJS 中，模板是**语句（statements）而不是表达式（expressions）**。你不是在计算一个返回值；你是在声明组件是什么。

这种微小的语法变化可能会在编译器优化代码方面带来更好的结果。

### 为什么“无组件重渲染”很重要？

这正是 RippleJS 开始在某些方面超越 React 的地方。在 React 中，当状态改变时，整个组件函数会重新运行。当然，React 在更新 DOM 方面很聪明，但 JavaScript 依然执行了。

而在 RippleJS 中呢？响应式意味着只有依赖于变更状态的特定 DOM 部分会被更新。不存在组件重渲染或协调（reconciliation）。只有对需要变更的部分进行精准的手术式更新。

这在精神上与 [Solid](https://blog.logrocket.com/solidjs-vs-react/) 和 [Svelte 5](https://blog.logrocket.com/exploring-runes-svelte-5/) 相似，但 RippleJS 旨在通过更清晰、以 TypeScript 为中心的 API 来实现这一目标。

## 响应式原理：track() 与 @ 符号

RippleJS 的响应式系统围绕两个核心概念：

-   `track()` 用于创建响应式值
-   `@` 用于读取/写入这些值

<!-- end list -->

```typescript
import { track } from 'ripple';

export component Counter() {
  // 创建一个响应式值
  let count = track(0);

  // 创建一个派生的响应式值
  let double = track(() => @count * 2);
  let quadruple = track(() => @double * 2);

  <div>
    <p>{"Count: "}{@count}</p>
    <p>{"Double: "}{@double}</p>
    <p>{"Quadruple: "}{@quadruple}</p>
    <button onClick={() => @count++}>{"Increment"}</button>
  </div>
}
```

-   `track(0)` 创建一个初始值为 0 的响应式原语。
-   `track(()=>@count*2)` 创建一个计算值，当 `count` 变化时自动更新。
-   `@count` 是你读写被追踪值的方式。
-   `@count++` 变更该值，并触发 `double`、`quadruple` 以及 DOM 的更新。

这种命名约定是有意为之。早期版本称之为 `createSignal`（像 Solid 那样），但人们总是试图完全照搬 Solid 的用法，结果导致混淆。通过改名为 `track()`，RippleJS 团队明确表示：你是在追踪（track）一个值，而不是在创建 Solid 意义上的信号（signal）。

### 内存效率的故事

内存使用情况虽然不常被提及，但我们必须聊聊它。

在 React 中，每个组件实例都持有自己的状态、副作用和渲染逻辑。当组件数量达到成百上千时，这种内存开销就变得非常可观。

在 RippleJS 中，一切都是“块（block）”，在响应式值和依赖它的内容之间只有单一的关系。结果是每个响应式连接的开销大大降低。

对于具有深层树结构和许多组件的大型应用程序，这种内存使用上的差异会迅速累积。

### 响应式集合：\#\[\] 和 \#{}

引起我注意的是 RippleJS 处理响应式数组和对象的方式：

```typescript
export component TodoList() {
  const items = #[1, 2, 3]; // TrackedArray（被追踪的数组）
  const config = #{theme: 'dark', language: 'en'}; // TrackedObject（被追踪的对象）

  <div>
    <p>{"Items: "}{items.join(', ')}</p>
    <p>{"Theme: "}{config.theme}</p>
    <button onClick={() => items.push(items.length + 1)}>
      {"Add Item"}
    </button>
    <button onClick={() => config.theme = config.theme === 'dark' ? 'light' : 'dark'}>
      {"Toggle Theme"}
    </button>
  </div>
}
```

`#[]` 和 `#{}` 语法创建了完全响应式的数组和对象。当你向数组 push 元素或更新属性时，依赖于它的所有内容都会自动更新。不需要扩展运算符（spread operators）；直接修改数据，UI 就会更新。

相比 React 的不可变更新模式，这是一个很好的开发体验提升：

```typescript
// React - 不可变更新
const [items, setItems] = useState([1, 2, 3]);
setItems([...items, items.length + 1]); // 创建新数组

// RippleJS - 直接变更
const items = #[1, 2, 3];
items.push(items.length + 1); // 直接 push 即可
```

### 全局状态：刻意的“不”

这里有一个可能引起争议的有趣设计决策：RippleJS 不支持传统意义上的全局状态。

你不能像这样在组件外部创建被追踪的值：

```typescript
// 这行不通 - 编译错误
import { track } from 'ripple';

const globalCount = track(0);
// 错误: track 只能在响应式上下文中使用

export component App() {
  <div>
    <p>{"Global count: "}{@globalCount}</p>
    <button onClick={() => @globalCount++}>{"Increment"}</button>
  </div>
}
```

如果你这样做，代码会抛出类似这样的错误：

![](https://blog.logrocket.com/wp-content/uploads/2025/11/image4_845b07.png)

该[框架强制规定](https://www.ripplejs.com/docs/guide/reactivity) `track()` 必须在响应式上下文（组件、函数或由组件创建的类）中使用。这是一个有意的架构决策。

这是故意的。在 RippleJS 中，一切都关乎被追踪的值与使用它们的组件之间的直接关系。没有内置的“所有组件都可以接入的全局存储”这一概念。

如果你想要在组件间共享状态，你需要：

1.  让父组件拥有该状态
2.  通过 props 向下传递
3.  围绕该共享所有者组合组件

是的，这更显式。但也因此避开了大型 React 应用中常见的全局状态混乱。

## 组件级样式

RippleJS 内置了组件作用域的样式支持：

```typescript
export component StyledCounter() {
  let count = track(0);

  <div class="container">
    <h1>{"Counter App"}</h1>
    <div class="counter-display">
      <button class="btn btn-decrement" onClick={() => @count--}>{"-"}</button>
      <span class="count-value">{@count}</span>
      <button class="btn btn-increment" onClick={() => @count++}>{"+"}</button>
    </div>
  </div>

  <style>
    .container {
      text-align: center;
      font-family: "Arial", sans-serif;
      padding: 2rem;
    }

    .counter-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn {
      height: 3rem;
      width: 3rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-decrement {
      background-color: #ef4444;
      color: white;
    }

    .btn-decrement:hover {
      background-color: #dc2626;
    }

    .btn-increment {
      background-color: #10b981;
      color: white;
    }

    .btn-increment:hover {
      background-color: #059669;
    }

    .count-value {
      font-size: 2rem;
      font-weight: bold;
      min-width: 3rem;
      text-align: center;
    }
  </style>
}
```

样式效果如下所示：

![](https://blog.logrocket.com/wp-content/uploads/2025/11/image2_a9ab13.png)

这其中的美妙之处在于：

-   不需要 CSS-in-JS 库——`<style>` 标签在组件中是一等公民
-   自动作用域——这些样式只应用于当前组件，不会有类名冲突
-   逻辑共存——你的样式就住在从属于它的组件代码旁边
-   完整的 CSS 支持——不是子集或特殊语法，就是你熟悉的、功能完整的 CSS

### 全局 CSS 的“但是”

反过来说就是全局 CSS。目前，你无法在组件内部将样式标记为全局。目前还没有 `global` 属性或 `:global` 选择器（尽管 `:global` 已在计划中）。

所以对于全局样式，你有两个选择：

选择 1：在你的 `index.html` 中使用 `<style>` 标签

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My Ripple App</title>

        <style>
            /* 全局样式放这里 */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: system-ui, -apple-system, sans-serif;
                background-color: #f3f4f6;
                line-height: 1.6;
            }

            :root {
                --color-primary: #3b82f6;
                --color-secondary: #10b981;
                --color-danger: #ef4444;
            }
        </style>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/src/index.ts"></script>
    </body>
</html>
```

许多框架都将全局样式与组件分开处理。事实上，将全局样式集中管理而不是分散在各个组件中，通常被认为是一种更好的做法。

更重要的一点是：让样式与组件共存是一个微妙的 DX（开发体验）胜利。当你处于“构建功能”的心流中时，不必频繁地在文件之间来回切换。

## 内置的控制流 & 组件系统

RippleJS 最让人耳目一新的部分之一是，你可以像写普通 JavaScript 那样编写控制流，不需要 `.map()` 体操，也不需要在不想用的时候被迫使用嵌套三元表达式。

原生的 `for` 循环：

```typescript
// React - .map()
{
    users.map(user => (
        <div key={user.id}>
            <h3>{user.name}</h3>
        </div>
    ));
}

// RippleJS - 直接写循环
for (const user of props.users) {
    <div>
        <h3>{user.name}</h3>
    </div>;
}
```

没有 `key` 属性，不需要用括号包裹 JSX。就是一个循环。

`if` 语句：

```typescript
// React - 嵌套三元表达式的噩梦
{
    isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : user ? <div>Welcome, {user.name}</div> : <LoginPrompt />;
}

// RippleJS - 可读性极高的 if/else
if (props.isLoading) {
    <Spinner />;
} else if (props.error) {
    <ErrorMessage error={props.error} />;
} else if (props.user) {
    <div>{'Welcome, ' + props.user.name}</div>;
} else {
    <LoginPrompt />;
}
```

如果写得好，两者都具有可读性，但对于新手来说，Ripple 的控制流通常感觉更亲切，仅仅因为它是“纯粹的 JavaScript”。

### Try/catch 作为错误边界

你可以依靠 `try/catch` 来代替单独的 ErrorBoundary 组件：

```typescript
component SafeComponent(props: { data: any }) {
  <div>
    try {
      <RiskyComponent data={props.data} />
    } catch (error) {
      <div class="error-message">
        {"Something went wrong: " + error.message}
      </div>
    }
  </div>
}
```

这与你在 JavaScript 其他地方使用的心智模型完全一致。

### 带有 Props 和 Children 的组件

组件工作方式类似 React，但拥有更简洁的 TypeScript 优先语法：

```typescript
component Button(props: {
  text: string
  onClick: () => void
  variant?: 'primary' | 'danger'
}) {
  <button
    class={['btn', \`btn-${props.variant || 'primary'}\`]}
    onClick={props.onClick}
  >
    {props.text}
  </button>

  <style>
    .btn { padding: 0.75rem 1.5rem; border: none; cursor: pointer; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-danger { background: #ef4444; color: white; }
  </style>
}

// 强类型 - 编译器会捕获缺失或错误的 props
export component App() {
  <div>
    <h1>{"TypeScript Button Test"}</h1>
    <h2>{"Strongly Typed Component Props"}</h2>

    <div>
      <Button text="Primary Button" onClick={() => console.log("Primary clicked")} />
      <Button text="Delete" onClick={() => console.log("Deleted")} variant="danger" />
      <Button text="Save" onClick={() => alert("Saved!")} variant="primary" />
    </div>
  </div>
}
```

子组件（Children）的工作方式也一样：

```typescript
component Card(props: { title: string, children: Component }) {
  <div class="card">
    <h2>{props.title}</h2>
    <div class="card-body">
      <props.children />
    </div>
  </div>
}

<Card title="Stats">
  <p>{"Users: 1,234"}</p>
</Card>
<Card title="Dashboard">
    <p>{"Welcome to your dashboard"}</p>
    <p>{"You have 5 new notifications"}</p>
</Card>
```

再次强调，关键区别在于组件不返回 JSX；它们**就是**模板。这种命令式风格为编译器提供了更多的优化空间。

### 控制流对比

这并不是什么革命性的东西，只是更合乎常理。

| 任务     | React             | RippleJS         |
| -------- | ----------------- | ---------------- |
| 循环     | `.map()` + key    | `for` 循环       |
| 条件     | 三元表达式 / `&&` | `if/else`        |
| 多重条件 | 嵌套三元表达式    | `if/elseif/else` |
| 错误处理 | ErrorBoundary 类  | `try/catch`      |

## 让我们构建一些实用的东西

理论讲得够多了。让我们用 RippleJS 构建一个 Todo 应用，然后将其与 React 版本进行对比。

### 快速开始

```bash
# 创建一个新的 Ripple 项目
npm create ripple my-app

# 进入项目目录
cd my-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

你的应用应该运行在 `http://localhost:3000`。

#### 编辑器设置

为了获得最佳体验，请安装 RippleJS VS Code 扩展：

-   打开 VS Code
-   转到扩展 (`Ctrl+Shift+X` / `Cmd+Shift+X`)
-   搜索 "Ripple for VS Code"
-   安装官方扩展

![](https://blog.logrocket.com/wp-content/uploads/2025/11/image3_650503.png)

这将为你提供 `.ripple` 文件的语法高亮、智能提示、类型检查和实时诊断。

我们将构建的 Todo 列表展示了 RippleJS 的大多数核心理念：

-   使用 `track()` 的响应式状态
-   原生控制流（`if/else`, `for` 循环）
-   事件和表单处理
-   条件渲染和样式
-   组件组合

打开 `App.ripple` 并放入以下代码（为了保持简洁，这里省略了样式）：

```typescript
// TodoList.ripple
import { track } from 'ripple';

export component App() {
  // 响应式状态 - 这些会自动触发 UI 更新
  const todos = #[]; // TrackedArray 用于响应式列表
  let inputValue = track('');
  let filter = track('all'); // 'all' | 'active' | 'completed'
  let editingId = track(null);
  let editValue = track('');

  // 派生值 - 当依赖项变化时自动重新计算
  let filteredTodos = track(() => {
    const allTodos = todos;
    if (@filter === 'active') {
      return allTodos.filter(todo => !todo.completed);
    }
    if (@filter === 'completed') {
      return allTodos.filter(todo => todo.completed);
    }
    return allTodos;
  });

  let activeCount = track(() => todos.filter(t => !t.completed).length);
  let completedCount = track(() => todos.filter(t => t.completed).length);

  // 动作 (Actions) - 直接变更会自定更新 UI
  const addTodo = () => {
    const text = @inputValue.trim();
    if (!text) return;

    // 直接 push 即可 - 不需要 setState 或不可变模式
    todos.push({
      id: Date.now(),
      text,
      completed: false
    });

    @inputValue = '';
  };

  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed; // 直接变更
    }
  };

  const deleteTodo = (id) => {
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
      todos.splice(index, 1); // 直接变更
    }
  };

  const startEdit = (todo) => {
    @editingId = todo.id;
    @editValue = todo.text;
  };

  const saveEdit = () => {
    const todo = todos.find(t => t.id === @editingId);
    if (todo && @editValue.trim()) {
      todo.text = @editValue.trim();
    }
    @editingId = null;
    @editValue = '';
  };

  const cancelEdit = () => {
    @editingId = null;
    @editValue = '';
  };

  const clearCompleted = () => {
    const completed = todos.filter(t => t.completed);
    completed.forEach(todo => deleteTodo(todo.id));
  };

  <div class="todo-app">
    <div class="header">
      <h1>{"Ripple Todo List"}</h1>

      <div class="add-todo">
        <input
          type="text"
          value={@inputValue}
          onInput={(e) => @inputValue = e.target.value}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="What needs to be done?"
          class="todo-input"
        />
        <button onClick={addTodo} class="btn btn-primary">
          {"Add"}
        </button>
      </div>
    </div>

    {/* 统计栏 - 派生值自动更新 */}
    <div class="stats">
      <span class="stat">
        {"Active: "}<strong>{@activeCount}</strong>
      </span>
      <span class="stat">
        {"Completed: "}<strong>{@completedCount}</strong>
      </span>
      <span class="stat">
        {"Total: "}<strong>{todos.length}</strong>
      </span>
    </div>

    {/* 带有动态 class 的过滤按钮 */}
    <div class="filters">
      <button
        class={@filter === 'all' ? 'filter-btn active' : 'filter-btn'}
        onClick={() => @filter = 'all'}
      >
        {"All"}
      </button>
      <button
        class={@filter === 'active' ? 'filter-btn active' : 'filter-btn'}
        onClick={() => @filter = 'active'}
      >
        {"Active"}
      </button>
      <button
        class={@filter === 'completed' ? 'filter-btn active' : 'filter-btn'}
        onClick={() => @filter = 'completed'}
      >
        {"Completed"}
      </button>
    </div>

    <div class="todo-list">
      {/* 原生 for 循环 - 不需要 .map() */}
      for (const todo of @filteredTodos) {
        <div class={todo.completed ? 'todo-item completed' : 'todo-item'}>
          {/* 原生 if/else - 没有三元表达式 */}
          if (@editingId === todo.id) {
            <input
              type="text"
              value={@editValue}
              onInput={(e) => @editValue = e.target.value}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              class="edit-input"
            />
            <div class="edit-actions">
              <button onClick={saveEdit} class="btn-icon btn-save">
                {"✓"}
              </button>
              <button onClick={cancelEdit} class="btn-icon btn-cancel">
                {"✕"}
              </button>
            </div>
          } else {
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              class="todo-checkbox"
            />
            <span
              class="todo-text"
              onDblClick={() => startEdit(todo)}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              class="btn-icon btn-delete"
            >
              {""}
            </button>
          }
        </div>
      }

      {/* 带有条件消息的空状态 */}
      if (@filteredTodos.length === 0) {
        <div class="empty-state">
          {
            @filter === 'completed'
              ? "No completed todos yet!"
              : @filter === 'active'
              ? "No active todos. Great work!"
              : "No todos yet. Add one above!"
          }
        </div>
      }
    </div>

    {/* 清除按钮仅在需要时显示 */}
    if (@completedCount > 0) {
      <div class="footer">
        <button onClick={clearCompleted} class="btn btn-secondary">
          {"Clear completed (" + @completedCount + ")"}
        </button>
      </div>
    }
  </div>

  {/* 克隆该仓库以获取样式 */}
}
```

有趣的部分：

-   `for` 和 `if` 直接在模板中工作——没有 `.map()` 或三元链表。
-   你直接修改数据（`todos.push`, `todo.completed =!todo.completed`），UI 紧随其后。
-   `filteredTodos` 在 `todos` 或 `filter` 改变时自动重新计算——没有 `useMemo`，没有依赖数组。
-   动态 class 处理得很干净；在底层，Ripple 使用类似 `clsx` 的机制来合并它们。

这是我们应用程序的样子：

![](https://blog.logrocket.com/wp-content/uploads/2025/11/image1_47d80a.png)

### React 等效代码（用于对比）

这里是同一个应用的 React 版本，仅作概念对比：

```typescript
function TodoList() {
    const [todos, setTodos] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [filter, setFilter] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    // 所有这些都需要 useMemo 来避免每次渲染都重新计算
    const filteredTodos = useMemo(() => {
        if (filter === 'active') return todos.filter(t => !t.completed);
        if (filter === 'completed') return todos.filter(t => t.completed);
        return todos;
    }, [todos, filter]);

    const activeCount = useMemo(() => todos.filter(t => !t.completed).length, [todos]);

    const completedCount = useMemo(() => todos.filter(t => t.completed).length, [todos]);

    // 所有这些都需要 useCallback 来避免每次渲染都重新创建
    const addTodo = useCallback(() => {
        const text = inputValue.trim();
        if (!text) return;
        setTodos([
            ...todos,
            {
                id: Date.now(),
                text,
                completed: false
            }
        ]);
        setInputValue('');
    }, [inputValue, todos]);

    const toggleTodo = useCallback(
        id => {
            setTodos(todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
        },
        [todos]
    );

    // ... 等等

    return (
        <div className='todo-app'>
            {/* 带有 .map() 的 JSX 循环 */}
            {filteredTodos.map(todo => (
                <div key={todo.id}>{/* 用于条件的嵌套三元表达式 */}</div>
            ))}
        </div>
    );
}
```

数一数：5 个 `useState`，3 个 `useMemo`，如果你想“正确地”进行优化，还需要好几个 `useCallback` 调用。在 Ripple 中，你主要只需要使用 `track()` 并直接修改你的状态，根本无需考虑渲染周期。

## 公平的真相

RippleJS 还没准备好用于生产环境，Dominic 对此非常坦诚。它还很原始，有 bug，缺少 SSR 和成熟的生态系统。

那么为什么还要讨论它呢？因为这些想法确实很有趣。

### RippleJS 做对了什么

### 1\. 开发体验 (DX)

[React 的 Hooks](https://blog.logrocket.com/react-hooks-cheat-sheet-solutions-common-problems/) 虽然强大，但也引入了许多微妙的心智负担。你得时刻考虑何时使用 `useCallback`，`useMemo` 是否值得，以及为什么某些东西一直在重渲染。

在 RippleJS 中，你追踪值，用 `@` 访问它们，剩下的依赖管理交给框架。这种心理负担大部分都消失了。

### 2\. 真正契合框架的 TypeScript

很多框架“支持” TypeScript，但感觉往往像是事后诸葛亮。RippleJS 从第一天起就假设了 TypeScript 的存在——并围绕它设计了语法、编译器和 DX。

### 3\. 无需像带孩子一样小心呵护的性能

当只有真正依赖于某个值的 DOM 节点更新，且框架对内存更加吝啬时，你的应用运行得就是更快，无需你微管理渲染。没有虚拟 DOM diff，没有协调过程，没有组件重新运行。

### 更大的问题

RippleJS 会取代 [React](https://blog.logrocket.com/10-most-important-javascript-frameworks-past-decade/) 吗？几乎可以肯定不会。无论如何，这都不是一个有趣的问题。

RippleJS 所做的是探索一组不同的权衡，并提出疑问：如果我们让简单的事情回归简单，让已经简单的事情变得更简单，会怎么样？

这才是值得关注的地方。

## 框架需要你

RippleJS 是开源的，而且处于非常早期的阶段。Dominic 用一周时间构建了第一个版本，现在有几个人参与其中，但要将其变成一个生产就绪的框架，需要社区的力量。

需要帮助的领域：

-   实现 SSR
-   工具链和 DX 改进
-   编写文档和教程
-   错误报告和边缘情况测试
-   示例应用和组件库
-   为 [VS Code 扩展](https://blog.logrocket.com/writing-vs-code-extensions-in-javascript/) 做贡献
-   即将推出的 `:global` 样式选择器

你不需要成为编译器工程师。如果你曾为框架的复杂性而挣扎，你可能对什么是更好的方案有着敏锐的直觉。

如何参与：

-   GitHub – [https://github.com/trueadm/ripple](https://github.com/trueadm/ripple)
-   文档 – [https://www.ripplejs.com/docs/introduction](https://www.ripplejs.com/docs/introduction)
-   Twitter – 关注 [@ripple\_\_js](https://twitter.com/ripple__js) 获取更新
-   加入 [Discord](https://discord.gg/JBF2ySrh2W)

React、Vue 和 Svelte 的早期贡献者帮助塑造了今天数百万开发者使用的框架。RippleJS 目前正处于那个早期阶段。如果你曾想参与构建一些可能产生重要影响的东西，这就是你的机会。

## 结论

我们对 RippleJS 进行了一次相当深入的探索。

我不会在生产工作放弃使用 [React](https://blog.logrocket.com/react-why-you-should-continue-using-it/)。但我会密切关注 RippleJS，而且我绝对会在副业项目中使用它。开发体验感觉真的很清新，性能表现也很有说服力。

RippleJS 会“赢”吗？这不仅仅取决于巧妙的技术决策，更多取决于开发者是否采用它，用它构建东西，并回馈社区。

所以，这里有个挑战：请在一周内用 RippleJS 构建一个小东西——一个计数器、一个待办事项列表，随便什么。亲自看看炒作是否符合现实。如果你遇到 bug 或缺失的功能，不要只是在社交媒体上抱怨——去开一个 issue，或者提一个 PR。

React 的生态系统不是一天建成的，也绝对不是由一个人建成的。RippleJS 也不会是。

现在，去造点什么吧。
