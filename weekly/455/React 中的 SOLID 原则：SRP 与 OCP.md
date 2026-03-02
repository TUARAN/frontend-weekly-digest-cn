原文：SOLID Principles in React: SRP and OCP  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## React 中的 SOLID 原则：SRP 与 OCP

- [ 首页 ](https://jsdev.space/) ›  
- [ 分类 ](https://jsdev.space/categories/) ›  
- [ react ](https://jsdev.space/react/) ›  
- SOLID Principles in React: SRP and OCP  

# 在 React 中应用 SRP 与开闭原则
2026 年 2 月 26 日 · 阅读 4 分钟

## 目录
- [ React 架构中的 SOLID 原则 ](https://jsdev.space/react-solid-srp-ocp/#solid-principles-in-react-architecture)
- [ 为什么 SOLID 在 React 中仍然重要 ](https://jsdev.space/react-solid-srp-ocp/#why-solid-still-matters-in-react)
- [ React 中的单一职责原则（SRP） ](https://jsdev.space/react-solid-srp-ocp/#single-responsibility-principle-srp-in-react)
- [ 反例 ](https://jsdev.space/react-solid-srp-ocp/#bad-example)
- [ 正确的 SRP 架构 ](https://jsdev.space/react-solid-srp-ocp/#correct-srp-architecture)
- [ 数据 Hook ](https://jsdev.space/react-solid-srp-ocp/#data-hook)
- [ 视图组件 ](https://jsdev.space/react-solid-srp-ocp/#view-component)
- [ 容器（Container） ](https://jsdev.space/react-solid-srp-ocp/#container)
- [ SRP 的真实收益 ](https://jsdev.space/react-solid-srp-ocp/#real-srp-benefit)
- [ React 中的开闭原则（OCP） ](https://jsdev.space/react-solid-srp-ocp/#open-closed-principle-ocp-in-react)
- [ 典型的违背方式 ](https://jsdev.space/react-solid-srp-ocp/#typical-violation)
- [ 更符合 OCP 的做法 ](https://jsdev.space/react-solid-srp-ocp/#ocp-friendly-approach)
- [ 基于组合的扩展方式 ](https://jsdev.space/react-solid-srp-ocp/#composition-based-extension)
- [ 依赖倒置原则（DIP） ](https://jsdev.space/react-solid-srp-ocp/#dependency-inversion-principle-dip)
- [ 隐式依赖问题 ](https://jsdev.space/react-solid-srp-ocp/#hidden-dependency-problem)
- [ 引入抽象 ](https://jsdev.space/react-solid-srp-ocp/#introducing-abstraction)
- [ Provider 接口 ](https://jsdev.space/react-solid-srp-ocp/#provider-interface)
- [ 具体实现 ](https://jsdev.space/react-solid-srp-ocp/#concrete-implementation)
- [ Hook 依赖抽象 ](https://jsdev.space/react-solid-srp-ocp/#hook-depends-on-abstraction)
- [ 使用层 ](https://jsdev.space/react-solid-srp-ocp/#usage-layer)
- [ 为什么 DIP 在现代 React 中很重要 ](https://jsdev.space/react-solid-srp-ocp/#why-dip-matters-in-modern-react)
- [ SRP、OCP 与 DIP 如何协同工作 ](https://jsdev.space/react-solid-srp-ocp/#how-srp-ocp-and-dip-work-together)
- [ 最后的一些想法 ](https://jsdev.space/react-solid-srp-ocp/#final-thoughts)

![](https://jsdev.space/.netlify/images?url=_astro%2Freact-solid-srp-ocp.CRz_kC6B.png&#38;w=800&#38;h=539&#38;dpl=69a197e2756cc3000907f49b)

## React 架构中的 SOLID 原则

软件架构几乎从来不会在一瞬间崩塌。

大多数 React 应用一开始都处在一个完全合理的状态。

- 少量组件。  
- 一些 hooks。  
- 干净的目录结构。  
- 可读的业务逻辑。  

一切看起来都很简单。

然后现实出现了。

- 新的产品需求不断出现。  
- API 在演进。  
- 设计变体越来越多。  
- 状态管理逐渐扩散到整个应用。  

接着，某些奇怪的事情突然发生：

改动一个功能，却意外地弄坏了三个毫不相关的页面。

到了这个阶段，开发者通常会怪 React、怪状态管理方案、或者怪框架选型。但真正的问题几乎总是出在架构上。

系统不再尊重**职责边界**了。

## 为什么 SOLID 在 React 中仍然重要

SOLID 原则最初由 Robert C. Martin 为面向对象编程提出。

React 在传统意义上并不是面向对象的。

但现代 React 应用与 SOLID 的思想却出奇地契合：

OOP 概念 | React 对应物
---|---
类（Class） | 组件（Component）
方法（Method） | Hook / 事件处理函数（handler）
依赖（Dependency） | 服务（Service）/ API
组合（Composition） | 组件组合（Component composition）
抽象（Abstraction） | Hook 接口（Hook interface）

React 并没有消除架构问题。

它只是改变了这些问题出现的位置。

下面我们来看看在 React 系统中，现实影响最大的三个 SOLID 原则。

## React 中的单一职责原则（SRP）

在项目开始变大之前，软件架构往往听起来很抽象。随着项目增长，混乱的组件、重复的逻辑、以及难以预测的 bug 会开始出现。

单一职责原则的表述是：

一个模块应该只有一个引起它变化的原因。

在 React 中，职责通常会拆分为：

- 数据逻辑  
- 渲染  
- 组合  

SRP **并不意味着**：

- 一个函数  
- 小组件  
- 最少的代码行数  

相反，它的意思是：

一个模块应该只会因为**同一类原因**而改变。

### 反例

```tsx
export function AccountProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <section>
      <h2>{profile.name}</h2>
      <p>{profile.email}</p>
    </section>
  );
}
```

组件的职责包括：

- 拉取数据  
- 管理状态  
- 渲染 UI  

这就带来了多个需要修改它的原因。

### 正确的 SRP 架构

一个可扩展的 React 架构，会把**逻辑与展示**分离开来。

### 数据 Hook

```tsx
export function useProfileData() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then(res => res.json())
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  return { profile, loading };
}
```

这个 Hook 只回答一个问题：

我们如何获取数据？

除此之外没有别的。

### 视图组件（View Component）

```tsx
export function ProfileView({ profile, loading }) {
  if (loading) return <p>Loading...</p>;

  return (
    <section>
      <h2>{profile.name}</h2>
      <p>{profile.email}</p>
    </section>
  );
}
```

纯 UI。

不需要了解 API 或存储相关的任何信息。

### 容器（Container）

```tsx
export function ProfileContainer() {
  const state = useProfileData();
  return <ProfileView {...state} />;
}
```

现在，每个部分都只有一个职责。

更改后端逻辑永远不会影响渲染。

## SRP 的真实收益

SRP 使你能够：

 
-  更安全地重构 

-  复用 UI 组件 

-  独立测试 

-  可预测地扩展 

 

大型 React 应用之所以能长期存活，主要就是因为这种拆分与分离。

## React 中的开闭原则（OCP）

开闭原则指出：

软件实体应该对扩展开放，但对修改关闭。

你应该在不重写现有组件的情况下添加新行为。

### 常见违背方式

```tsx
export function ActionButton({ type, onClick }) {
  if (type === "primary") {
    return <button className="primary" onClick={onClick}>Primary</button>;
  }

  if (type === "danger") {
    return <button className="danger" onClick={onClick}>Danger</button>;
  }

  if (type === "success") {
    return <button className="success" onClick={onClick}>Success</button>;
  }

  return null;
}
```

每增加一种变体，都需要修改组件本身。

时间一长，这会变得脆弱且容易出错。

### 更符合 OCP 的做法

```tsx
const buttonVariants = {
  primary: "primary",
  danger: "danger",
  success: "success",
};

export function ActionButton({ variant, onClick, children }) {
  return (
    <button
      className={buttonVariants[variant]}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

添加新行为：

```ts
buttonVariants.warning = "warning";
```
   

不需要修改组件。

### 基于组合的扩展

现代 React 强烈偏向使用组合（composition）。

```tsx
export function Button({ className, ...props }) {
  return <button className={className} {...props} />;
}

export function DangerButton(props) {
  return <Button className="danger" {...props} />;
}

export function PrimaryButton(props) {
  return <Button className="primary" {...props} />;
}
```

基础抽象保持稳定，而功能在外部不断增长。

这就是以一种很自然的方式应用了 OCP。

## 依赖倒置原则（DIP）

这个原则将可扩展的架构，与紧耦合的应用区分开来。

定义：

高层模块不应该依赖低层模块。

换成 React 的说法：

UI 不应该直接依赖基础设施层。

## 隐式依赖问题

```tsx
export function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/orders")
      .then(r => r.json())
      .then(setOrders);
  }, []);
}
```

这个组件直接依赖于：

 
-  传输层 

-  后端结构 

-  API 实现 

 

后端一改 → UI 就得重写。

## 引入抽象

### Provider 接口

```ts
export interface OrdersProvider {
  getOrders(): Promise<any[]>;
}
```

### 具体实现

```ts
export class ApiOrdersProvider implements OrdersProvider {
  async getOrders() {
    const res = await fetch("/api/orders");
    return res.json();
  }
}
```

### Hook 依赖抽象

```tsx
export function useOrders(provider: OrdersProvider) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    provider.getOrders().then(setOrders);
  }, [provider]);

  return orders;
}
```

### 使用层

```tsx
const provider = new ApiOrdersProvider();

export function OrdersPage() {
  const orders = useOrders(provider);
  return <OrdersList orders={orders} />;
}
```

现在 UI 依赖的是抽象，而不是基础设施。

## 为什么 DIP 在现代 React 中很重要

依赖倒置带来：

 
-  轻松做 Mock 

-  脱离 API 的测试 

-  切换数据源 

-  SSR / CSR 的灵活性 

-  离线优先应用 

 

大多数企业级 React 架构在不自知的情况下都遵循了这条规则。

## SRP、OCP 和 DIP 如何协同工作

原则React 对应解释SRP拆分逻辑与 UIOCP通过组合来扩展DIP依赖抽象

它们结合在一起，会产出能够安全演进的系统。

## 最后想法

React 本身很少导致架构问题。问题往往出现在职责混杂的时候。
```

如果添加一个功能就迫使你去编辑已有的稳定代码，
那么你的架构很可能违反了 OCP（开闭原则）。

如果修改数据逻辑会破坏 UI，那么很可能违反了 SRP（单一职责原则）。

当组件：

- 承担了过多的逻辑  
- 依赖基础设施（infrastructure）  
- 为了扩展而必须修改  

变化就会变得危险。

现代 React 架构与其说是打造“聪明”的组件，不如说是围绕可控的职责划分与安全的扩展机制来设计。  
[react](https://jsdev.space/react/) [architecture](https://jsdev.space/tag/architecture/) [solid](https://jsdev.space/tag/solid/) [srp](https://jsdev.space/tag/srp/) [ocp](https://jsdev.space/tag/ocp/)

### 相关文章

[面向可持续前端开发的干净 React 架构（Clean React Architecture）](https://jsdev.space/maintainable-react-code/)  
[React 中的多态装饰器：增强版 HOC（HOCs on Steroids）](https://jsdev.space/polymorphic-hocs-ts/)  
[使用原语（Primitives）构建可维护的 React 表单](https://jsdev.space/react-form-primitives/)  
[像专业人士一样写代码：在 React 生态中实践 SOLID 设计](https://jsdev.space/solid-design-react/)  
[10 个必备的自定义 React Hooks，让你的项目火力全开](https://jsdev.space/10-custom-react-hooks/)  
[25 条 React 优化建议：提升性能与代码质量](https://jsdev.space/25-react-tips/)