原文：Life’s too short to hand-write API types: OpenAPI-driven React  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 生命苦短，别再手写 API 类型：OpenAPI 驱动的 React
2026 年 2 月 25 日  
![](<https://evilmartians.com/static/c3f83a48b304ea39470f6394d2ab7ab9/3a9c5/cover.png>)  
![](<https://evilmartians.com/static/c3f83a48b304ea39470f6394d2ab7ab9/3a9c5/cover.png>)

## 主题
- [React](https://evilmartians.com/chronicles?skills=react)
- [TypeScript](https://evilmartians.com/chronicles?skills=typescript)
- [  
![](<https://evilmartians.com/static/8fea523845fea5a4dd3a2106245203a7/0b217/avatar.jpg>)  
![](<https://evilmartians.com/static/8fea523845fea5a4dd3a2106245203a7/0b217/avatar.jpg>)  
Yuri Mikhin

前端工程师  
](https://evilmartians.com/martians/yuri-mikhin)
- [  
![](<https://evilmartians.com/static/f5f99b921739d5fbe2cdbde1e934061b/0b217/avatar.jpg>)  
![](<https://evilmartians.com/static/f5f99b921739d5fbe2cdbde1e934061b/0b217/avatar.jpg>)  
Travis Turner

技术编辑  
](https://evilmartians.com/martians/travis-turner)

大多数 React 应用都有一个问题：前端类型和后端真实实现会逐渐偏离。你把 API 的数据结构复制到 TypeScript 文件里，后端改了点什么，你往往要到线上环境才发现。本文会通过把 OpenAPI 规范作为唯一事实来源来解决这个问题——自动生成类型、客户端和校验 schema，让契约不一致在构建阶段就直接报错，而不是等到生产环境才炸。你还会配置网络层的 mock，这样团队就能在无需等待后端部署的情况下，基于逼真的 API 行为开发和测试功能。

## 其他部分：
- [API 契约与我希望早知道的一切：前端生存指南](https://evilmartians.com/chronicles/api-contracts-and-everything-i-wish-i-knew-a-frontend-survival-guide)
- [契约冲击疗法：通往 API 优先文档幸福之路](https://evilmartians.com/chronicles/contract-shock-therapy-the-way-to-api-first-documentation-bliss)
- 生命苦短，别再手写 API 类型：OpenAPI 驱动的 React

这是我们“契约优先”系列的第三篇（[第一篇](https://evilmartians.com/chronicles/api-contracts-and-everything-i-wish-i-knew-a-frontend-survival-guide) | [第二篇](https://evilmartians.com/chronicles/contract-shock-therapy-the-way-to-api-first-documentation-bliss)），不过如果你只是想把 OpenAPI 接入 React，这篇也可以作为一份独立的指南使用。

在这个演示应用（[[在线](https://martian-hotel-booking-frontend.vercel.app/)] [[仓库](https://github.com/mikhin/martian-hotel-booking-frontend)]）中，我们会用 Hey API 生成 TypeScript 类型，用 Nanostores 做状态管理，用 MSW 来 mock API——这些就是构建“契约驱动”的 React 前端所需的一整套工具。

**雇用 Evil Martians**

我们会修复你的 API 工作流，让团队交付更快，让集成不再是件大事。  
[我们的服务](https://evilmartians.com/services)

**目录**：

- [搭建 React 项目并生成类型](https://evilmartians.com/chronicles/lifes-too-short-to-hand-write-api-types-openapi-driven-react#scaffolding-your-react-project-and-generating-types)

- [使用 Nanostores 与 Nanoquery 配置状态管理](https://evilmartians.com/chronicles/lifes-too-short-to-hand-write-api-types-openapi-driven-react#setting-up-state-management-with-nanostores-and-nanoquery)

- [构建一个功能：酒店管理流程](https://evilmartians.com/chronicles/lifes-too-short-to-hand-write-api-types-openapi-driven-react#building-a-feature-hotel-management-flow)

- [通过 Mock API 实现丝滑开发体验](https://evilmartians.com/chronicles/lifes-too-short-to-hand-write-api-types-openapi-driven-react#mocking-apis-for-seamless-development)

## 搭建你的 React 项目并生成类型

我们从零开始。首先，用 React 和 TypeScript 创建一个新的 Vite 项目：

```bash
$ pnpm create vite martian-hotel-frontend --template react-ts
$ cd martian-hotel-frontend
$ pnpm install
```

Vite 会给你一个干净的 React + TypeScript 初始化工程，支持热模块替换和快速构建。开箱即用，无需额外配置就能开始。

### 大多数团队是如何处理 API 的（剧透：很痛苦）

典型的 React + TypeScript 接入 API 的方式是这样的：你看着后端响应，手动写类型：

```ts
interface Hotel {
  id: string;
  name: string;
  status: string; // 哪些值才合法？谁知道呢？
}
```

再手写 fetch 封装：

```ts
async function getHotels(page: number): Promise<Hotel[]> {
  const response = await fetch(`/api/hotels?page=${page}`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

const hotels = await getHotels(1) as Hotel[];
```

然后你对各种东西做类型断言，并祈祷它们都是对的。

用这种方式，问题很快就会越堆越多：

- **类型会过期** —— 后端把 `status` 改成了枚举，你的类型仍然写的是 `string`
- **没有校验** —— 运行时数据与类型不匹配时，TypeScript 也只能“装作没看见”
- **无穷无尽的样板代码** —— 第 47 次复制粘贴同样的 fetch 封装
- **一切都得手工处理** —— 错误处理、请求构建、响应解析、请求头设置、重试逻辑……

而当后端新增必填字段或修改类型时，你往往要到生产环境才发现。于是，即便类型已经过时，TypeScript 依旧能“成功编译”。

### 解决方案：从契约生成一切

与其手写 API 代码，不如直接生成。与其复制类型，不如从唯一事实来源构建类型。当契约发生变化时，重新生成，TypeScript 会立刻指出所有需要更新的地方。

这就是 [Hey API](https://heyapi.dev/) 的用武之地。把你的 OpenAPI 规范交给它，它会生成：

- **与 API 完全一致的 TypeScript 类型**
- **SDK 函数**，包含正确的请求/响应处理——你只需要调用即可
- **用于运行时校验的 schema**，可配合 Zod 使用——在坏数据造成破坏前就把它拦下来
- **客户端配置**，包括 base URL 和鉴权

你可以像这样把 Hey API 作为开发依赖添加进来：

```
`$ pnpm add @hey-api/openapi-ts -D -E`
```

然后在项目根目录创建 `openapi-ts.config.ts`：

```ts
import { defineConfig } from "@hey-api/openapi-ts";
```

```js
export default defineConfig({
  input: "https://martian-hotel-booking-api.vercel.app/output.yml",
  output: "src/api",
  plugins: [
    "zod",
    {
      name: "@hey-api/sdk",
    },
  ],
});
```

这会告诉 Hey API：

- **input**：到哪里去找到你的 OpenAPI 规范（可以是 URL 或本地文件）

- **output**：把 SDK 生成到哪里（这里是 `src/api`）

- **plugins**：`zod` 用于生成运行时校验 schema，`@hey-api/sdk` 用于生成带类型的 API 函数

### 运行生成

在 `package.json` 里添加一个脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "openapi-ts": "openapi-ts"
  }
}
```

现在生成你的类型：

````
`$ pnpm openapi-ts`
````

Hey API 会读取你的 OpenAPI 规范，并在 `src/api/` 中生成 TypeScript 文件：

```text
src/api/
├── client/
│   ├── client.gen.ts      # HTTP 客户端配置
│   ├── types.gen.ts       # 客户端相关类型
│   └── utils.gen.ts       # 客户端工具
├── core/
│   ├── auth.gen.ts        # 认证处理
│   ├── types.gen.ts       # 核心类型工具
│   └── utils.gen.ts       # 核心工具
├── index.ts               # 主要导出
├── sdk.gen.ts             # API 端点函数
├── types.gen.ts           # 你的 API 类型
└── zod.gen.ts             # Zod 校验 schema
```

### 你会得到什么

打开 `src/api/types.gen.ts`，你会看到与 OpenAPI 契约匹配的类型：

```ts
export type Hotel = HotelUpsert & {
  id: string;
  createdAt: string;
};

export type HotelUpsert = {
  name: string;
  /**
   * 火星上的位置
   */
  location: string;
  status: HotelStatus;
};

export type HotelStatus = "active" | "maintenance" | "closed";

export type GetHotelsData = {
  body?: never;
  path?: never;
  query: {
    page: number;
    pageSize: number;
    status?: HotelStatus;
  };
  url: "/hotels";
};

export type GetHotelsResponses = {
  /**
   * 酒店的分页列表
   */
  200: PaginatedResponse & {
    items: Array<Hotel>;
  };
};

export type GetHotelsResponse = GetHotelsResponses[keyof GetHotelsResponses];
```

这些就是你的**业务领域类型（business domain types）**——也就是整个应用都会围绕其运作的核心数据形状：酒店、预订、用户，或任何你的 API 所管理的对象。你永远不需要手写这些类型。相反，它们是从契约生成出来的，并且会自动保持同步。

你唯一需要手写的类型是**UI 专用类型（UI-specific types）**：例如组件 props、表单状态、本地 UI 标记——这些只存在于前端，与后端无关。这样的分离非常强大：你的业务逻辑类型来自唯一可信来源（source of truth）；你的展示层类型则只包含 React 需要的内容，不多不少。

### 生成的 SDK 函数

打开 `src/api/sdk.gen.ts`，你会看到开箱即用的 API 函数：

```ts
/**
 * Get all hotels
 */
export const getHotels = <ThrowOnError extends boolean = false>(
  options: Options<GetHotelsData, ThrowOnError>,
) =>
  (options.client ?? client).get<GetHotelsResponses, unknown, ThrowOnError>({
    security: [{ scheme: "bearer", type: "http" }],
    url: "/hotels",
    ...options,
  });
```

这个函数会处理所有事情：构建请求、设置鉴权 header、解析响应并返回带类型的数据。你只需要调用它：

```ts
import { getHotels } from '@/api';

const response = await getHotels({
  query: { page: 1, pageSize: 10 }
});
// response.data 的类型是 GetHotelsResponse
```

不需要手写 fetch 封装、不需要自己拼 query string，也不需要对响应做类型断言（casting）。SDK 会把这一切都做好，并且基于你的契约提供完整的类型安全。

当契约发生变化时，再运行一次 `pnpm openapi-ts`。TypeScript 会立刻指出所有需要更新的地方：在你提交之前、在你部署之前、在生产环境出问题之前。

## 使用 nanostores 和 nanoquery 搭建状态管理

你生成的 SDK 已经给了你类型安全的 API 函数。现在你需要在 React 中使用它们；大多数开发者会采用这样的模式：

```tsx
function HotelList() {
  const [hotels, setHotels] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getHotels({ query: { page: 1, pageSize: 10 } })
      .then(response => setHotels(response.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Error />;
  return hotels.items.map(hotel => <HotelCard {...hotel} />);
}
```

这能用，但它是个陷阱。原因如下：

- **请求逻辑被困在组件里**——哪里都复用不了

- **没有缓存**——每次挂载都会再次猛打你的 API

- **无法共享 loading 状态**——其他组件不知道发生了什么

- **复制粘贴地狱**——要重新拉取数据？就得把整个模式再搭一遍

- **测试噩梦**——要么在组件层 mock，要么就崩溃

**声明式的替代方案：**把 API 数据当作和其他状态一样的东西来处理。把它存到组件之外。订阅它。让 store 去负责请求、缓存和更新。

```ts
// Store（在组件之外）
export const $hotels = createApiStore(getHotels, {
  storeKey: 'hotels',
  params: [/* pagination */],
});

// Component（只负责订阅）
function HotelList() {
  const hotels = useStore($hotels);

  if (hotels.loading) return <Spinner />;
  if (hotels.error) return <Error />;
  return hotels.data.items.map(hotel => <HotelCard {...hotel} />);
}
```

然后，看看会发生什么：

- **多个组件共享同一份数据**——请求一次，到处使用

- **自动缓存**——不再在每次渲染时狂打 API

- **一行代码触发重新拉取**——`$hotels.invalidate()` 就搞定

- **不糟糕的测试体验**——mock store，而不是 47 次 fetch 调用

- **全局可见的 loading 状态**——整个应用都知道发生了什么

我们使用的是 [**Nanostores**](https://github.com/nanostores/nanostores) 搭配 [**Nanoquery**](https://github.com/nanostores/query)——这是一个轻量级的 React Query 替代方案，并且与基于契约生成的类型配合得天衣无缝。

### 选择你的状态管理方案
```

你当然可以选择 React Query 或 SWR——它们都是非常优秀的库，能够处理缓存和加载状态。但关键区别在于：React Query 通过 hooks 将数据获取与 React 组件耦合在一起。我们的做法则把 API 响应当作完全存在于 React 之外的全局状态（类似 Redux 或 Zustand，但类型是从你的契约生成的）。

在这种设置下，路由器可以读取 API 状态，表单可以让它失效（invalidate），中间件也可以订阅它——完全不需要 React context。你不必把获取逻辑分散在各个组件里。store 会封装你生成的 SDK 函数，让你以声明式的方式管理状态，并且从契约中获得完整的类型安全。

### 创建一个 API store 包装器

我们要构建的这个包装器，可以让你用几行代码把任意 SDK 函数变成一个可响应的 store。最终效果如下——我们来创建 `src/stores/hotels.ts`：

```ts
import { computed } from "nanostores";
import { createApiStore } from "./api-store";
import { getHotels, getHotelById } from "@/api";
import { $router } from "./router";

export const $hotels = createApiStore(getHotels, {
  storeKey: "hotelsList",
  mapToOptions: () => ({
    query: { page: 1, pageSize: 10 },
  }),
});

export const $hotelContent = createApiStore(getHotelById, {
  storeKey: "hotelContent",
  params: [
    computed($router, (router) =>
      router?.route === "hotelEdit" ? router.params.id : null,
    ),
  ],
  mapToOptions: ([id]) => ({
    path: { id: id ?? "" },
  }),
});
```

这就是整个文件。两个 store，类型完全由你的 OpenAPI 契约推导而来——`$hotels.data` 的类型是 `GetHotelsResponse`，`$hotelContent.data` 的类型是 `Hotel`。当你修改契约并重新生成类型后，TypeScript 会告诉你哪些地方坏了。

第一个 store 使用固定的 query 参数去拉取酒店列表。第二个 store 会监听你的路由：当你导航到 `/hotels/:id` 时，它会自动获取该酒店的数据。`params` 数组接受 Nanostores 的 atom，所以只要路由发生变化，就会用新的 ID 触发一次重新请求（refetch）。

#### 这个包装器是如何工作的

`createApiStore` 函数位于 [`src/stores/api-store.ts`](https://github.com/mikhin/martian-hotel-booking-frontend/blob/main/src/stores/api-store.ts)。它在底层主要做了这些事：

- **从 SDK 函数进行类型推导**——`ExtractOptionsData<F>` 会直接从 SDK 函数签名推导出数据结构。当你传入 `getHotels` 时，包装器就能知道它接受哪些 options，而你不需要显式指定任何泛型参数。

- **用 `storeKey` + `params` 生成缓存 key**——Nanoquery 会使用组合后的 key 来缓存并对请求去重。当 `params` 改变时（例如路由 atom 更新），它会检测到新的 key，并自动重新请求。

- **`mapToOptions`**——把你的 params 转换成 SDK 的 `Options` 类型。对于带参数的 store，它会收到被字符串化的 params，然后返回带类型的 options（例如 `([id]) => ({ path: { id } })`）。

- **合理的默认值**——`onErrorRetry: false` 和 `revalidateOnFocus: false` 让开发过程中的行为更可预测。你可以在配置里覆盖任何 Nanoquery 的 `CommonSettings`。

### 在组件中使用 stores

当你定义好 stores 之后，在 React 中使用它们就很直接了：

```ts
import { useStore } from '@nanostores/react';
import { $hotels } from '../stores/hotels';

function HotelList() {
  const hotels = useStore($hotels);

  if (hotels.loading) return <Spinner />;
  if (hotels.error) return <Error message={hotels.error.message} />;

  return (
    <>
      {hotels.data.items.map(hotel => (
        <HotelCard key={hotel.id} {...hotel} />
      ))}
    </>
  );
}
```

`useStore` hook 会订阅 store 的变化并触发重新渲染。Nanoquery 会自动提供 loading 和 error 状态——不需要你手动跟踪。

## 构建一个功能：酒店管理流程

我们用契约驱动（contract-driven）的模式来构建一个酒店管理表单。我们将基于你的 OpenAPI 规范来创建和编辑酒店，并包含校验、加载状态与错误处理——所有这些都从你的 OpenAPI spec 流转而来。

因此，用户需要创建和编辑酒店。这意味着我们的表单需要：

- 酒店名称和火星位置  
- 状态下拉框（active/maintenance/closed）  
- 与 API 契约匹配的校验规则  
- 保存时的加载状态  
- 错误处理  

没有契约时，你需要手写类型，祈祷它们和后端一致，然后在生产环境里才发现问题。有了契约后，类型来自规范，并且校验会自动发生。

### 用校验来搭建表单

创建 `src/HotelForm.tsx`。这个组件同时负责创建和编辑酒店——React Hook Form 管理表单状态，生成的 Zod schema 负责所有校验：

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { createHotel, type HotelUpsert, updateHotel } from "@/api";
import { zHotelStatus, zHotelUpsert } from "@/api/zod.gen";
import { isValidationError } from "@/lib/is-validation-error";
import { $hotelContent, $hotels } from "@/stores/hotels";
import { $router } from "@/stores/router";

export function HotelForm() {
  const router = useStore($router);
  const hotelData = useStore($hotelContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = router?.route === "hotelEdit";
  const hotelId = isEditMode ? router.params.id : undefined;

  const form = useForm<HotelUpsert>({
    defaultValues: {
      name: undefined,
      location: undefined,
      status: undefined,
    },
    resolver: zodResolver(zHotelUpsert),
  });

  useEffect(() => {
    if (hotelData?.data) {
      form.reset({
        name: hotelData.data.name,
        location: hotelData.data.location,
        status: hotelData.data.status,
      });
    }
  }, [hotelData?.data, form]);
```

`zodResolver` 用来把生成的 Zod schema 连接到 React Hook Form。我们同时导入 TypeScript 类型（`HotelUpsert`）以获得编译期安全性，以及 Zod schema（`zHotelUpsert`）以进行运行时校验——每个字段都会按照你的 API 期望的精确规则来验证。`useEffect` 会在编辑时加载已有数据；当你导航到这个路由时，store 已经自动把数据取回来了。

### 处理提交（Handling submission）

提交处理函数会根据“新建”还是“编辑”走不同分支，然后让 store 失效，从而触发列表重新拉取数据：

```ts
  const onSubmit = async (data: HotelUpsert) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isEditMode && hotelId) {
        await updateHotel({
          path: { id: hotelId },
          body: data,
        });
      } else {
        await createHotel({
          body: data,
        });
      }

      alert("Hotel saved!");
      $hotels.invalidate();
      $router.set({ route: "hotelList" });
    } catch (error) {
      console.error(error);

      if (isValidationError(error)) {
        const { errors } = error;

        if (errors) {
          Object.entries(errors).forEach(([fieldName, errorMessage]) => {
            form.setError(fieldName as keyof HotelUpsert, {
              message: errorMessage,
              type: "server",
            });
          });
        }
      }

      alert("Failed to save hotel");
    } finally {
      setIsSubmitting(false);
    }
  };
```

`createHotel` 和 `updateHotel` 都是从 contract 生成出来的——它们清楚地知道自己需要哪些参数。`isValidationError` 这个类型守卫会把错误收窄为你的 API 的 `ValidationError` 类型，并把服务端的字段错误直接映射回表单字段。这之所以可行，是因为前后端共享同一份 contract。

### 构建表单 UI（Building the form UI）

这段 JSX 把每个字段都接入 React Hook Form：

```tsx
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <label>
        Hotel Name
        <input
          {...form.register('name')}
          placeholder="Olympus Mons Resort"
        />
        <FieldError error={form.formState.errors.name} />
      </label>

      <label>
        Location on Mars
        <input
          {...form.register('location')}
          placeholder="Valles Marineris"
        />
        <FieldError error={form.formState.errors.location} />
      </label>

      <label>
        Status
        <select {...form.register('status')}>
          <option value="">Select status</option>
          {zHotelStatus.options.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <FieldError error={form.formState.errors.status} />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Hotel'}
      </button>
    </form>
  );
}
```

注意，这里没有给任何字段手动写 `required: true`——所有校验规则都由 Zod schema 处理。状态下拉框的选项来自 `zHotelStatus.options`，因此会自动与 contract 保持同步——如果后端新增或移除某个状态，你只要重新生成代码，下拉框就会更新，完全不需要改动任何 JSX。

### 刚刚发生了什么？（What just happened?）

你构建了一个完整的 CRUD 功能：

- 类型从 Zod schemas 推断得出（运行时 + 编译期安全）

- 校验会根据你的 contract 自动发生

- 表单字段会针对 API 做类型检查

- 完全不需要手写任何类型

当后端在 contract 里新增一个 `pricePerNight` 字段时：

- 类型和 schemas 会被重新生成

- TypeScript 报错提示表单缺少一个字段

- 你把输入框补上

- Zod 会自动校验它

- 集成一次就能跑通

**这就是 contract-first development（契约优先开发）。** contract 是唯一可信来源（source of truth）。你的代码只是它的投影。改 contract、重新生成、修复报错，搞定。

## 通过 Mock API 实现无缝开发（Mocking APIs for seamless development）

还记得前面提到的“后端还没准备好”这个瓶颈吗？这就是我们把它彻底消除的地方！借助 MSW（Mock Service Worker），你可以基于真实的 API 响应形态来开发功能，而不必等待后端部署。

### 为什么要在网络层做 mock？（Why mock at the network level?）

大多数开发者会使用这种模式：

```js
// ❌ 组件级 mocking - 耦合紧
function HotelList() {
  const [hotels, setHotels] = useState(mockHotels); // 在组件里放假数据
  // ...
}
```

但这会带来一堆问题：

- **Mocks 放在组件里**——无法在整个应用里复用

- **没有真实的网络行为**——会漏掉 loading 状态、竞态条件、错误等情况

- **测试噩梦**——最后你会发现 mocks 散落得到处都是

- **无法在真实/模拟之间切换**——没法轻松切到 staging API

**MSW 在网络层进行拦截。** 你的应用照常发起真实的 `fetch()` 调用，MSW 会捕获请求并返回 mock 响应。你可以通过启用/禁用 MSW 来在 mock 和真实 API 之间切换——无需改动任何业务代码。

```js
// ✅ 你的应用代码保持完全一致
const response = await getHotels({ query: { page: 1, pageSize: 10 } });
// MSW 拦截并返回 mock 数据
```

### 一个由 contract 驱动的 mock 配置（A contract-driven mock setup）

因此，一切都从你的 OpenAPI contract 流出：类型、路径、响应结构——全部都是生成的。你的 mocks 会使用和真实 API 调用完全一致的类型。

安装 MSW：

```bash
`$ pnpm add msw -D`
```

在 `src/mocks/handlers.ts` 中创建 mock 配置。先从 imports 和应用配置开始：

```ts
import { http, HttpResponse } from "msw";
import { nanoid } from "nanoid";

import type {
  CreateHotelData,
  CreateHotelResponse,
  DeleteHotelData,
  GetHotelByIdData,
  GetHotelByIdResponse,
  GetHotelsData,
  GetHotelsResponse,
  Hotel,
  UpdateHotelData,
  UpdateHotelResponse,
} from "@/api/types.gen";
import { getAppConfig } from "@/config/app.config";

import type { MswPath } from "./types";
import { randomDelay } from "./utils";

const appConfig = getAppConfig();
```

注意，所有类型——`GetHotelsData`、`Hotel`、`CreateHotelResponse`——都来自你生成的 SDK，无需手动编写任何类型。再次强调：契约（contract）才是唯一的事实来源。

### 类型安全的路径定义

现在，用编译期校验来定义你的 API 路径：

```ts
const PATHS = {
  hotelById: "/hotels/:id" satisfies MswPath<GetHotelByIdData["url"]> &
    MswPath<UpdateHotelData["url"]> &
    MswPath<DeleteHotelData["url"]>,
  hotels: "/hotels" satisfies MswPath<GetHotelsData["url"]> &
    MswPath<CreateHotelData["url"]>,
} as const;
```

`MswPath` 这个工具类型会把 OpenAPI 的路径语法（`/hotels/{id}`）转换为 MSW 的语法（`/hotels/:id`）：

```ts
export type MswPath<T extends string> =
  T extends `${infer A}{${infer Param}}${infer B}`
    ? `${A}:${Param}${MswPath<B>}`
    : T;
```

`satisfies` 操作符确保你的路径与契约一致。如果契约从 `/hotels/{id}` 改成 `/hotels/{hotelId}`，TypeScript 会立刻报错。多个 `satisfies` 子句意味着同一个路径要覆盖多个操作：GET、PUT、DELETE 都使用 `/hotels/:id`。

### 构建逼真的 mock 数据

我们来写一些初始化逻辑，用来模拟真实数据库的初始状态：

```ts
const initializeMockHotels = (): Hotel[] => {
  return [
    {
      id: nanoid(),
      name: "Olympus Mons Resort",
      location: "Olympus Mons",
      status: "active",
      createdAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      name: "Valles Marineris Hotel",
      location: "Valles Marineris",
      status: "maintenance",
      createdAt: new Date().toISOString(),
    },
  ];
};

const mockHotels = initializeMockHotels();
```

这不只是静态的 JSON；它是**有状态的（stateful）**。你创建一个酒店后，它会在后续请求中持续存在；更新一个酒店后，列表接口也会反映出变化；删除一个酒店后，它就消失了。简单来说：你的 mock 行为会像一个真实数据库一样。

### 按路径组织 handlers

```ts
export const hotelHandlerMap = {
  [PATHS.hotelById]: [
    http.get<GetHotelByIdData["path"], never, GetHotelByIdResponse>(
      `${appConfig.backendUrl}${PATHS.hotelById}`,
      async ({ params }) => {
        await randomDelay(500, 1500);

        const hotel = mockHotels.find((h) => h.id === params.id);

        if (!hotel) {
          return HttpResponse.error();
        }

        return HttpResponse.json(hotel);
      },
    ),
    http.put<
      UpdateHotelData["path"],
      UpdateHotelData["body"],
      UpdateHotelResponse
    >(
      `${appConfig.backendUrl}${PATHS.hotelById}`,
      async ({ params, request }) => {
        await randomDelay(500, 1500);

        const { id } = params;
        const body = await request.json();

        const index = mockHotels.findIndex((h) => h.id === id);
        const existingHotel = mockHotels[index];

        if (index === -1 || !existingHotel) {
          return HttpResponse.error();
        }

        mockHotels[index] = {
          ...existingHotel,
          ...body,
          id: existingHotel.id,
          createdAt: existingHotel.createdAt,
        };

        return HttpResponse.json(mockHotels[index]);
      },
    ),
    http.delete<DeleteHotelData["path"], never, never>(
      `${appConfig.backendUrl}${PATHS.hotelById}`,
      async ({ params }) => {
        await randomDelay(500, 1500);

        const index = mockHotels.findIndex((h) => h.id === params.id);

        if (index === -1) {
          return HttpResponse.error();
        }

        mockHotels.splice(index, 1);

        return new HttpResponse(null, { status: 204 });
      },
    ),
  ],
  [PATHS.hotels]: [
    // ... collection handlers
  ],
} as const;
```

**关键模式：**

**用 `randomDelay` 模拟真实网络：**

```
`await randomDelay(500, 1500);`
```

当然，真实网络不会“秒回”：随机延迟能暴露竞态条件（race condition）、测试加载状态，并捕捉那些只有在生产环境才会出现的 bug。这里的延迟范围（500–1500ms）用来模拟典型的 API 响应时间。

**完整的泛型类型标注：**

```
`http.get<GetHotelByIdData["path"], never, GetHotelByIdResponse>`
```

三个类型参数：

- 路径参数（`{ id: string }`）
- 请求体（GET 用 `never`）
- 响应类型（`Hotel`）

TypeScript 会校验所有内容——参数是否与路径匹配、body 是否符合 schema、响应是否符合契约。

**不可变更新（Immutable updates）：**

```ts
mockHotels[index] = {
  ...existingHotel,
  ...body,
  id: existingHotel.id,
  createdAt: existingHotel.createdAt,
};
```

我们保留系统字段（`id`、`createdAt`），同时允许业务字段更新。这符合真实后端的行为：用户不能修改 ID 或创建时间戳。

### 实现集合类端点（collection endpoints）

列表与创建操作需要不同的处理方式：

```ts
[PATHS.hotels]: [
  http.get<never, never, GetHotelsResponse>(
    `${appConfig.backendUrl}${PATHS.hotels}`,
    async ({ request }) => {
      await randomDelay(500, 1500);

      const url = new URL(request.url);
      const page = +(url.searchParams.get("page") || 1);
      const pageSize = +(url.searchParams.get("pageSize") || 10);
      const status = url.searchParams.get("status");

      let filtered = mockHotels;

      if (status) {
        filtered = filtered.filter((h) => h.status === status);
      }

      const start = (page - 1) * pageSize;
      const response: GetHotelsResponse = {
        currentPage: page,
        items: filtered.slice(start, start + pageSize),
        pageSize,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      };

      return HttpResponse.json(response);
    },
  ),
  http.post<never, CreateHotelData["body"], CreateHotelResponse>(
    `${appConfig.backendUrl}${PATHS.hotels}`,
    async ({ request }) => {
      await randomDelay(500, 1500);

      const body = await request.json();

      const newHotel: Hotel = {
        id: nanoid(),
        ...body,
        createdAt: new Date().toISOString(),
      };

      mockHotels.push(newHotel);

      return HttpResponse.json(newHotel, { status: 201 });
    },
  ),
],
```

**分页逻辑：**

```ts
const start = (page - 1) * pageSize;
const response: GetHotelsResponse = {
  currentPage: page,
  items: filtered.slice(start, start + pageSize),
  pageSize,
  totalItems: filtered.length,
  totalPages: Math.ceil(filtered.length / pageSize),
};
```

这与真实 API 的分页方式一致。因此，前端可以请求第 2 页、每页 10 条数据，并且拿到的结果就是严格对应的 10 条。这样就解锁了一个能力：可以很容易地测试各种边界情况，例如最后一页条目不足、结果为空、页码越界等。

**筛选支持：**

```ts
const status = url.searchParams.get("status");

if (status) {
  filtered = filtered.filter((h) => h.status === status);
}
```

查询参数（query params）的行为和真实 API 完全一致。你请求 `?status=active`，就只会得到状态为 active 的酒店。随着接口契约（contract）的演进，你还可以继续添加更多筛选条件：位置、日期范围、搜索关键词等。

**创建操作与正确的状态码：**

```
`return HttpResponse.json(newHotel, { status: 201 });`
```

RESTful API 在 POST 成功时会返回 `201 Created`。MSW 让你能够测试对状态码的处理——例如，你的 UI 是否能正确区分并处理 201 和 200？

### 连接（Wiring up）MSW

创建 `src/mocks/browser.ts` 来初始化 service worker：

```ts
import { setupWorker } from "msw/browser";

import { hotelHandlerMap } from "./handlers";

export const createWorker = () => {
  const handlers = Object.values(hotelHandlerMap).flat();

  return setupWorker(...handlers);
};
```

在你的应用入口文件（`src/main.tsx`）中按条件启用 mocks：

```ts
import { createRoot } from "react-dom/client";

import { getAppConfig } from "@/config/app.config";

import "./index.css";
import { App } from "./App";

const appConfig = getAppConfig();

const enableMocking = async (): Promise<
  ServiceWorkerRegistration | undefined
> => {
  if (!appConfig.enableMocks) {
    return undefined;
  }

  try {
    const { createWorker } = await import("./mocks/browser");
    const worker = createWorker();

    return await worker.start({
      onUnhandledRequest: "bypass",
    });
  } catch (error) {
    console.warn("MSW failed to start:", error);

    return undefined;
  }
};

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
```

**该配置中的关键决策：**

**配置驱动的 Mock：** `enableMocks` 标志位控制 MSW 是否运行。它放在应用配置里，而不是写死的环境判断。你可以在开发环境开启 mocks、在 staging 环境关闭，甚至在生产环境里为演示场景按需切换。

**动态导入：** `await import("./mocks/browser")` 意味着当 mocks 被禁用时，mock 相关代码不会被打进生产构建产物里。Tree-shaking 会自动移除所有 MSW 代码。

**优雅失败：** 如果 MSW 启动失败（例如 service worker 注册问题、浏览器兼容性问题），应用仍然会渲染。`try/catch` 会记录一个 warning，但不会阻塞初始化——能在没有 mocks 的情况下运行，总比完全无法运行要好。

**在 Mock 与真实 API 之间切换：**

```ts
// config/app.config.ts
import { z } from "zod";

const AppConfigSchema = z.object({
  backendUrl: z.string().min(1),
  enableMocks: z
    .string()
    .transform((v) => v === "true")
    .pipe(z.boolean()),
  envMode: z.enum(["development", "production", "test"]),
});

export type ApplicationConfig = z.infer<typeof AppConfigSchema>;

const getEnv = (key: string, fallback = ""): string => {
  return import.meta.env[key] || fallback;
};

export const getAppConfig = (): ApplicationConfig => {
  try {
    return AppConfigSchema.parse({
      backendUrl: getEnv("VITE_BACKEND_URL"),
      enableMocks: getEnv("VITE_API_MOCKS", "false"),
      envMode: getEnv("MODE", "development"),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => {
          const path = issue.path.join(".") || "<root>";
          return `${path}: ${issue.message}`;
        })
        .join("; ");

      throw new Error(
        `Invalid application configuration from environment variables: ${issues}`,
      );
    }
    throw error;
  }
};
```

```bash
# Development - uses mocks
VITE_API_MOCKS=true

# Staging - uses real API
VITE_API_MOCKS=false
VITE_BACKEND_URL=https://staging-api.example.com
```

该配置使用 Zod 在启动时校验环境变量——如果缺少或写错，会立刻得到清晰的错误信息，而不是在运行时出现难以排查的问题。只要改变环境变量，你就在对不同的后端进行测试。同一份代码，不同的数据来源；不需要在应用各处散落条件判断逻辑。

### 开发流程

现在看看会发生什么：

- **契约变更**——后端给 `Hotel` 新增了 `pricePerNight` 字段  
- **重新生成类型**——运行 `pnpm openapi-ts`  
- **TypeScript 报错**——你的 mock 初始化里没有包含新字段  
- **更新 mocks**——给 mock 酒店加上 `pricePerNight: 100`  
- **更新 UI**——表单与展示会自动获得新字段  

一切都从契约出发。你的 mocks 无法与真实 API 脱节，因为它们基于同一套类型构建。

### 测试边界情况

Mocks 让你能够测试一些用真实 API 很难稳定复现的场景：

**模拟错误：**

```ts
http.get(`${appConfig.backendUrl}/hotels/:id`, async ({ params }) => {
  if (params.id === "error-test") {
    return HttpResponse.error();
  }
  // ... normal logic
});
```

**慢响应：**

```
`await randomDelay(5000, 10000); // Test loading states with slow networks`
```

**空状态：**

```
`const mockHotels: Hotel[] = []; // What happens when no data exists?`
```

**校验错误：**

```ts
http.post(`${appConfig.backendUrl}/hotels`, async ({ request }) => {
  const body = await request.json();

  if (!body.name) {
    return HttpResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }
  // ... create logic
});
```

真实后端并不容易让你随手触发这些场景；而使用 mocks，这些操作会变得非常简单。

### 为什么这件事真的重要？

**并行开发成为现实。** 后端负责实际实现。前端使用由契约生成的 mocks 来构建功能。两边团队在同一份规范上收敛一致。集成阶段只是“关闭 mocks 然后测试”——而不是一场持续一周的调试马拉松。

**你的代码质量会提升。** 加载态能正确工作，因为你会去测试它。错误处理能捕捉到真实问题。边界情况不会悄悄溜走。你是基于真实的行为在构建，而不是基于一厢情愿的假设。

**速度更快。** 不再有“等后端”的延误，也不会在集成时遭遇意外。功能在你完成构建时就能交付，而不是等后端完成部署之后才行。

再强调一次：契约就是约定。mocks 用来强制执行这份约定。甚至在后端还没写下任何一行代码之前，你的应用就已经能够工作。

## 回顾：我们构建了什么

我们从一个原始的 Vite + React 项目开始，最终得到一个完全由契约驱动的前端：Hey API 直接从 OpenAPI 规范生成 TypeScript 类型与 API 客户端，Nanostores 和 Nanoquery 在几乎不需要样板代码的情况下处理状态，MSW mocks 让你能在后端还未部署任何东西之前就构建和测试功能。当契约发生变化时，你只需要重新生成——TypeScript 会准确告诉你哪里出了问题。

这就覆盖了整个等式的前端部分。但契约服务于双方。在下一篇文章中，我们将切换到后端，把同一份 OpenAPI 规范接入一个 Node.js 的 Fastify 服务器——自动路由校验、生成类型，以及一种能让契约违规在启动时就失败、而不是在生产环境中才暴雷的配置方式。  
![](https://evilmartians.com/static/ira-a6db0f09d8c14693c5f73dcff15b70fa.webp)

**Irina Nazarova** Evil Martians 的 CEO

雇佣 Evil Martians 构建契约优先（contract-first）的工作流，消除集成混乱。  
[预约通话](https://cal.com/team/evilmartians/exploration) 或 [发送邮件](mailto:surrender@evilmartians.com)