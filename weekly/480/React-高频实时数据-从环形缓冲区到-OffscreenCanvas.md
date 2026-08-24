原文：High-Frequency Real-Time Data in React: From Ring Buffers to OffscreenCanvas
链接：<https://www.freecodecamp.org/news/high-frequency-real-time-data-in-react-from-ring-buffers-to-offscreencanvas>
翻译：TUARAN

# React 高频实时数据：从环形缓冲区到 OffscreenCanvas

[](https://www.freecodecamp.org/)

# High-Frequency Real-Time Data in React: From Ring Buffers to OffscreenCanvas

[Vineeth Pawar](https://www.freecodecamp.org/news/author/vpawar/)

React 擅长很多事情。但如果你曾经尝试过每秒推送数千个数据点穿过它，你会很快意识到 React 不是消防水带，它更像一根花园水管。

强行塞太多东西进去，要么草坪被淹没（你的 DOM），要么水管爆裂（你的应用）。

还有第二个观察与第一个相伴。你的笔记本有 8 到 16 个 CPU 核心。你的 React 应用几乎只使用其中一个。主线程负责 JavaScript、DOM、布局以及绘制准备。其他核心空闲着，而主线程却在努力为 60fps 的帧预算挣扎。

两个问题形状相同：你需要让 React 离开热路径，你需要使用不止一个线程。而通向那里的模式，也正是 Figma 的画布引擎、Bloomberg 的交易仪表盘以及你看过的每一个生物信号查看器背后的模式。

在一个项目中，我不得不可视化 19 个 EEG（脑电波）通道，每个通道每秒发送约 1,000 个数据点。那就是每秒近 19,000 次更新。如果你把所有这些都直接塞进 React，UI 不只是变慢，而是戏剧性崩溃。

本文是我最终落地的端到端架构：环形缓冲区、Worker、共享内存、离主线程渲染，以及具体能在持续数小时高负载下保持稳定的模式。

## 目录

- [前置知识](#前置知识)
- [谁已经在这样做？](#谁已经在这样做)
- [1kHz 的数学](#1khz-的数学)
- [通常哪里会出错](#通常哪里会出错)
- [心智模型：空中交通管制 + 厨房旅](#心智模型空中交通管制--厨房旅)
- [第一步：不要把样本放进 React State](#第一步不要把样本放进-react-state)
- [第二步：把形状与值分开](#第二步把形状与值分开)
- [第三步：把繁重工作移出主线程](#第三步把繁重工作移出主线程)
- [第四步：用 OffscreenCanvas 离主线程渲染](#第四步用-offscreencanvas-离主线程渲染)
- [第五步：绘制前先降采样](#第五步绘制前先降采样)
- [第六步：包装外部渲染器](#第六步包装外部渲染器)
- [第七步：当 Canvas 不够用时，求助于 WebGL](#第七步当-canvas-不够用时求助于-webgl)
- [第八步：保持内存扁平](#第八步保持内存扁平)
- [第九步：调度策略](#第九步调度策略)
- [第十步：测量持续性能](#第十步测量持续性能)
- [案例研究：19 个 EEG 通道](#案例研究19-个-eeg-通道)
- [基准测试：单线程 vs 多线程](#基准测试单线程-vs-多线程)
- [COOP/COEP 的陷阱](#coopcoep-的陷阱)
- [生产权衡](#生产权衡)
- [你应该这样构建吗？](#你应该这样构建吗)
- [总结](#总结)
- [参考资料](#参考资料)

## 前置知识

要最大程度从本文获益，你需要：

- **掌握 React 18 或 19**。你应该熟悉 `useState`、`useEffect`、`useRef`，以及挂载与重新渲染的区别。
- **TypeScript 基础**。大多数示例使用 TypeScript。你应该能无障碍阅读类型注解。
- **对浏览器主线程和事件循环有粗略了解**。你不必写过 Web Worker，但知道“阻塞主线程”意味着什么会让第三步更容易。
- **熟悉 Canvas 2D 或图表库**是加分项，不是必需项。如果你曾在 canvas 上画过东西，你就已经准备好了。
- **一台能运行现代 Chrome 或 Edge 的笔记本**。示例依赖 `SharedArrayBuffer`、`OffscreenCanvas` 和 Atomics，需要基于 Chromium 的浏览器以及跨源隔离（后文会讲）。

你不需要有 Web Worker、环形缓冲区或 WebGL 的经验。本文会在真实问题的背景下逐一介绍它们。

## 谁已经在这样做？

本文中的模式并不实验性。它们是生产级应用摄取和渲染高频数据背后的架构：

- **交易和金融仪表盘**（Bloomberg、Hyperliquid、dYdX、每一个严肃的市场查看器）每秒推送数千个价格 tick，通过 canvas 渲染的网格展示。
- **Figma** 在 Worker 内的 WebAssembly 中运行整个画布引擎。主线程只为 chrome 渲染 React。
- **Google Docs 和 Microsoft Loop** 在 Worker 中运行文档模型，DOM 只是投影。
- **图表库**如 LightningChart、uPlot、Plotly 和 ECharts 在 Canvas 或 WebGL 上绘制，把 React 当作包装器。
- **生物信号、ECG、EEG 和运动捕捉应用**通常以 1kHz 或更高频率处理样本，并流式传输到实时绘图。
- **可观测性和 APM 工具**（Datadog live tail、Grafana 实时面板）解耦摄取与渲染，以保持标签页响应。
- **音频编辑器和可视化器**，以及任何结合 Web Audio API 与波形显示的应用。
- **transformers.js 和 ONNX Runtime Web** 默认把 ML 推理放在 Worker 中。

不同领域，同一技巧：React 拥有变化稀少的东西，其他东西拥有以刷新率变化的东西，繁重工作发生在非主线程上。

## 1kHz 的数学

一些数字让问题具体化。

- 样本每 1ms 到达一次。
- 60Hz 显示器每 16.67ms 刷新一次。
- 所以在一帧内，每个流大约会收到 **16 到 17 个样本**。
- 有 19 个活动流（EEG 案例），那就是每帧 **300 到 320 个样本**。

如果你在每个样本上都 `setState`，React 每秒会尝试渲染约 19,000 次。它做不到，所以会跳帧。UI 卡顿，笔记本风扇起飞。

如果你每帧 `setState` 一次，带上约 320 个样本的批次，React 每秒渲染 60 次，这很轻松。

这个单一重构就是全部诀窍，它会在下面的每一步中回响。

## 通常哪里会出错

下面是我在大多数实时 React 应用第一次尝试时看到的代码版本。它看起来合理，也是团队接下来两周会追踪的所有卡顿的根源。

```tsx
import { useEffect, useState } from "react";

export default function NaiveChart({ socket }) {
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    socket.on("newPoint", (point: number) => {
      setData((prev) => [...prev, point]); // 每次都会重新渲染
    });
  }, [socket]);

  return <div>{data.length} points</div>;
}
```

短短七行里埋下了三个问题：

1. **每个传入样本都触发重新渲染**：在 1kHz 下就是每秒 1,000 次渲染。React 永远不会开心。
2. `[...prev, point]` **每次 push 都分配新数组**：在 1kHz 下就是每毫秒一个新数组，垃圾回收器要全部清理。堆内存攀升，GC 暂停变长，风扇启动。
3. **数组没有上限**：运行一小时，内存中有 360 万个数字，React 每次渲染都要考虑它们。

修复不是单一技巧，而是一堆小技巧，每个解决一种失败模式，并最终解决主线程是单线程这个更深层的问题。

## 心智模型：空中交通管制 + 厨房旅

在代码之前，两个比喻能帮你理清各个部分。

**第一个，空中交通管制**：三个角色，一个机场。

- **控制塔**（你的 store）看到每一架飞机（每个样本），并跟踪它的位置。
- **地勤**（React）设置跑道和登机口：飞机使用的布局。
- **飞行员**（绘制循环）实际飞行。他们看塔台获取许可，每隔几秒行动一次。

控制塔不会每次飞机移动都向地勤要登机口。它只是保存数据。地勤在时刻表变化时重新安排登机口，这很少发生。飞行员以他们自己的速率不断行动，基于塔台的数据。

**第二个，厨房旅**：高峰时段的餐厅厨房。一位主厨无法做每道菜。经典厨房旅有各个岗位：酱汁、鱼类、糕点、冷盘、摆盘、上菜。每个岗位负责餐食的一部分。出菜员协调时间。

- **出菜员**是你的主线程。
- **各个岗位**是你的 Worker。
- **摆盘窗口**是你的共享内存。
- **送往餐桌的菜肴**是你的渲染帧。

一位主厨试图按顺序做所有事，这就是只跑主线程的前端。厨房旅是你的基于 Worker 的前端。厨房旅更快，因为切配、酱汁和煎烤是并行发生的，而不是因为某个厨师比 soloist 更快。出菜员不做饭，他们指挥。

下面的一切都是这两个想法的具体应用。

## 第一步：不要把样本放进 React State

实时 React 应用中最大的错误是把每个样本都当作 state。state 是决定*哪些组件存在以及如何排列*的东西。实时图表是一个组件。在上面滚动的 60,000 个样本不是 60,000 个 state 片段。它们是一个缓冲区。

你需要一个存在于 React 外部的 store。一个在类型化数组上的环形缓冲区可以提供常数时间插入和有界堆：

```ts
type Listener = () => void;

export function createSampleStore(capacity: number) {
  const buf = new Float32Array(capacity);
  let head = 0;
  let size = 0;
  const listeners = new Set<Listener>();

  return {
    push(sample: number) {
      buf[head] = sample;
      head = (head + 1) % capacity;
      if (size < capacity) size++;
    },
    pushBatch(samples: Float32Array) {
      for (let i = 0; i < samples.length; i++) {
        buf[head] = samples[i];
        head = (head + 1) % capacity;
        if (size < capacity) size++;
      }
    },
    read(): Float32Array {
      if (size < capacity) return buf.subarray(0, size);
      const out = new Float32Array(capacity);
      out.set(buf.subarray(head));
      out.set(buf.subarray(0, head), capacity - head);
      return out;
    },
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}
```

注意这里没有什么：没有 `useState`、没有 setter、没有 React 任何东西。它只是普通 JavaScript。store 每秒可以接受一百万次 push，React 不会在意，因为 React 没有订阅它。

环形缓冲区的机制可视化如下：

head 每次 push 前进，到达容量时回绕。读取按时间顺序拉取最近 N 个样本的窗口。结果是常数时间和有界堆。

一个更简单的权宜之计，在你还不想用类型化缓冲区时，是把滚动窗口放进 ref 而不是 state：

```tsx
import { useEffect, useRef } from "react";

export default function RefChart({ socket }) {
  const bufferRef = useRef<number[]>([]);

  useEffect(() => {
    socket.on("newPoint", (point: number) => {
      bufferRef.current.push(point);
      if (bufferRef.current.length > 1000) {
        bufferRef.current.shift();
      }
    });
  }, [socket]);

  return <div>Streaming {bufferRef.current.length} points</div>;
}
```

这是“比 `NaiveChart` 快 10 倍，仍然不够好”的版本。渲染不会在每次 push 时触发，但除非有其他东西重新渲染，否则你也看不到更新。对于真实绘图，把 ref 与 `requestAnimationFrame` 绘制循环配对（见第二步）。

## 第二步：把形状与值分开

React 在 UI 的*形状*变化时重新渲染。新图表？重新渲染。移除图表？重新渲染。从折线切换到柱状？重新渲染。这些都不会以 1000Hz 发生。它们每分钟发生几次，当用户点击某处时。

每个图表内部的*值*以数据速率变化。这些永远不应该触碰 React。

具体来说：

```tsx
function LivePlot({ store }: { store: SampleStore }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let raf = 0;
    const draw = () => {
      const samples = store.read();
      drawSeries(ctx, samples);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [store]);

  return <canvas ref={canvasRef} width={1200} height={300} />;
}
```

React 只渲染这个组件一次。`useEffect` 只运行一次。`requestAnimationFrame` 循环每帧从 store 读取。

store 可以以源能处理的任何速率被 push。用户看到平滑的 60fps 折线，无论源是每秒发送 100 个样本还是 100,000 个。把 `samples` 接进 `useState` 的本能是错误的，要抵制它。

### 当你确实需要 React 参与循环时的选择性订阅

有时组件真正依赖数据（汇总统计、轴标签或实时值徽章）。这时使用带有选择性订阅的 store，这样只有关心的组件才重新渲染。Zustand 让这变得轻而易举：

```ts
import { create } from "zustand";

const useDataStore = create<{ latest: number | null; setLatest: (v: number) => void }>((set) => ({
  latest: null,
  setLatest: (v) => set({ latest: v }),
}));

function LatestBadge() {
  // 只在 latest 变化时重新渲染，而不是当 store 其他字段变化时。
  const latest = useDataStore((state) => state.latest);
  return <div>Latest: {latest?.toFixed(2)}</div>;
}
```

把它与写入时的 RAF 合并配对（每帧调用一次 `setLatest`，而不是每个样本一次），你就得到一个无论数据速率如何都能以 60fps 平滑更新的 React 组件。

`useSyncExternalStore` 是原生等价物，适用于任何 pub-sub store，包括上面的环形缓冲区。用你觉得对团队更轻量的那个。

## 第三步：把繁重工作移出主线程

store 和命令式绘制循环解决了 React 对瓶颈的贡献。但主线程本身仍在做所有摄取、解析和计算。超过每个流每秒约 50,000 个样本后，就需要更多。

浏览器给你四个逃生舱口：Web Workers、可传输对象、`SharedArrayBuffer` + Atomics，以及 `OffscreenCanvas`。每个解决特定问题。

主线程运行 JavaScript、DOM、布局和绘制准备。Worker 是拥有自己事件循环的隔离 JavaScript 上下文。它们不能碰 DOM，默认不能共享内存，每次跨线程消息都是异步的，除非转移对象，否则会被复制。

设计时要记住三个属性：

- **Worker 不能碰 DOM**：这就是重点。它们运行纯 JavaScript。非常适合数据工作、网络解析、数学、编解码器、ML 推理。
- **通信是异步的**：没有可以在函数中间读取的共享变量。围绕请求和事件设计 API。
- **数据会被复制，除非转移或共享**：结构化克隆是默认行为；可传输对象跳过复制；`SharedArrayBuffer` 永久跳过复制。

### 实际使用 Dedicated Worker

下面是一个最小化的摄取 Worker：

```ts
// worker.ts
self.onmessage = (event) => {
  const { samples } = event.data;
  // 解码、过滤、降采样。主线程看不到这些。
  const summary = computeStats(samples);
  postMessage(summary);
};
```

```tsx
// 主线程
import { useEffect, useRef } from "react";

export default function WorkerChart({ socket, store }) {
  const workerRef = useRef<Worker>();

  useEffect(() => {
    workerRef.current = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current.onmessage = (event) => {
      store.pushBatch(event.data); // 已预处理，摄取成本低
    };

    socket.on("newPoint", (point: number) => {
      workerRef.current?.postMessage({ point });
    });

    return () => workerRef.current?.terminate();
  }, [socket, store]);

  return <LivePlot store={store} />;
}
```

关于 Worker，要内化三件事。

第一，从运行时角度看，Worker 是真实进程。每个 Worker 有自己的堆、事件循环和 `globalThis`。启动一个 Worker 大约花费 1 到 5ms。不要在热路径里创建它们。

第二，模块 Worker 是现代默认。`type: "module"` 允许在 Worker 内部使用 ES 模块，包括 `import`。传统的 `importScripts` 用于 classic worker，新代码应避免。

最后，打包工具认识 Worker。Vite、Webpack、esbuild 和 Rspack 都能识别 `new Worker(new URL("./x.ts", import.meta.url))` 模式，并生成单独的 chunk。

### 随核心数扩展的 Worker 池

对于 CPU 密集型工作（解析二进制帧、解码音频、计算 FFT），worker 池把任务分散到所有可用核心：

```ts
class WorkerPool {
  private workers: Worker[];
  private next = 0;
  private pending = new Map<string, (result: unknown) => void>();

  constructor(scriptUrl: URL, size = Math.max(1, navigator.hardwareConcurrency - 1)) {
    this.workers = Array.from({ length: size }, () => {
      const w = new Worker(scriptUrl, { type: "module" });
      w.onmessage = (event) => {
        const cb = this.pending.get(event.data.id);
        if (!cb) return;
        this.pending.delete(event.data.id);
        cb(event.data.result);
      };
      return w;
    });
  }

  async run<T>(kind: string, payload: unknown, transferables: Transferable[] = []): Promise<T> {
    const id = crypto.randomUUID();
    const result = new Promise<T>((resolve) => this.pending.set(id, resolve as (r: unknown) => void));
    const worker = this.workers[this.next];
    this.next = (this.next + 1) % this.workers.length;
    worker.postMessage({ id, kind, payload }, transferables);
    return result;
  }
}

export const pool = new WorkerPool(new URL("./decoder.worker.ts", import.meta.url));
```

轮询分发，每个核心一个 worker，减一。待处理请求在匹配响应到达时解析。它便宜、可预测，并且在遇到内存带宽限制之前线性扩展。

### 可传输对象：零复制路径

`postMessage` 默认会克隆 payload。克隆一个 10MB 缓冲区需要毫秒级时间，并使内存使用量翻倍。修复方式是**转移**缓冲区。

语义：当你转移一个缓冲区时，发送方失去访问权。接收方获得访问权，无需复制，O(1) 交接。

```ts
const buf = new ArrayBuffer(10 * 1024 * 1024); // 10 MB
new Uint8Array(buf).set(somePayload);

worker.postMessage({ buf }, [buf]); // 第二个参数 = 可传输列表
// `buf` 现在在这边被 detached。访问它会抛出异常。
```

2026 年的可传输类型列表包括 `ArrayBuffer`（以及任何由它支撑的 typed-array 视图）、`MessagePort`、`ImageBitmap`、`OffscreenCanvas`、流类型（`ReadableStream`、`WritableStream`、`TransformStream`）、`RTCDataChannel`、`VideoFrame`、`AudioData` 以及 WebTransport 流。对 React + 实时工作最有用的是 `ArrayBuffer`、`OffscreenCanvas` 和 `MessagePort`。

一个常见陷阱是忘记转移会导致静默变慢。应用能工作，但每条消息都在复制。分析 worker `postMessage` 调用。如果“小”payload 的调用显示耗时毫秒级，说明你该转移时却在克隆。

```ts
// 不好：每帧都复制。
worker.postMessage({ samples: float32Array });

// 好：转移底层缓冲区。
worker.postMessage({ samples: float32Array }, [float32Array.buffer]);
```

缓冲区转移后会被 detached，因此如果发送方想继续生产，需要重新分配（或从预分配缓冲区池中拉取）。

### SharedArrayBuffer 和 Atomics

转移把缓冲区交出去。**共享**让两个线程同时看到同一块内存。

```ts
const sab = new SharedArrayBuffer(1024 * 1024); // 1 MB 共享内存
worker.postMessage({ sab });

// 主线程和 worker 现在都持有同一块内存的引用。
const viewMain = new Int32Array(sab);
// worker 内部：
// const viewWorker = new Int32Array(event.data.sab);
```

三个属性很重要。

`SharedArrayBuffer` 需要跨源隔离。你的页面必须设置这两个 HTTP 响应头：`Cross-Origin-Opener-Policy: same-origin` 和 `Cross-Origin-Embedder-Policy: require-corp`。没有这些头，`SharedArrayBuffer` 在浏览器中未定义。后文会详细讲。

你还需要 `Atomics` 进行同步。多个线程无协调地写入同一块内存会产生未定义结果。`Atomics` 提供 compare-and-swap、load、store、add、sub、wait、notify 等操作。

```ts
const sab = new SharedArrayBuffer(8);
const view = new Int32Array(sab);

// 主线程：唤醒任何在 slot 0 等待的 worker。
Atomics.store(view, 0, 1);
Atomics.notify(view, 0, 1);

// Worker：阻塞，直到 slot 0 从 0 改变。
const result = Atomics.wait(view, 0, 0); // "ok"、"not-equal" 或 "timed-out"
```

而无锁环形缓冲区是杀手级应用。一个生产者和一个消费者之间的队列，无需加锁、无需 `postMessage` 往返、无 GC 压力。数据 sits 在共享缓冲区中，Atomics 协调读写位置。

下面是一个最小化的 SPSC（单生产者单消费者）环形缓冲区：

```ts
type SharedRing = {
  data: Float32Array;          // 载荷
  control: Int32Array;         // [head, tail]
};

function createSharedRing(capacity: number): SharedRing {
  const sab = new SharedArrayBuffer(capacity * 4 + 16);
  const control = new Int32Array(sab, 0, 4);   // [head, tail, ...]
  const data = new Float32Array(sab, 16, capacity);
  return { data, control };
}

function push(ring: SharedRing, value: number): boolean {
  const head = Atomics.load(ring.control, 0);
  const tail = Atomics.load(ring.control, 1);
  const next = (head + 1) % ring.data.length;
  if (next === tail) return false; // 满
  ring.data[head] = value;
  Atomics.store(ring.control, 0, next);
  return true;
}

function pop(ring: SharedRing): number | null {
  const tail = Atomics.load(ring.control, 1);
  const head = Atomics.load(ring.control, 0);
  if (tail === head) return null; // 空
  const value = ring.data[tail];
  Atomics.store(ring.control, 1, (tail + 1) % ring.data.length);
  return value;
}
```

生产者在一个线程写入，消费者在另一个线程读取，双方都不阻塞，两者之间没有 `postMessage`。在高信号速率下，这是唯一可扩展的架构。

对于多生产者或多消费者队列，你需要 compare-and-swap 循环（`Atomics.compareExchange`）。它们很快变得复杂。大多数生产环境在可能时使用 SPSC，在不能使用时回退到消息传递。

### 在 Electron 中，在主进程摄取

同样的思路可以向上应用一层。在 Electron 和原生 SDK 中，你可以在**主进程**摄取样本，在那里缓冲，然后按渲染进程的刷新节奏批量通过 IPC 转发。每个样本一条 IPC 消息在 1kHz 下会饱和 IPC。每帧一条 IPC 消息，包含 16 个样本的批次，则轻而易举。

```ts
// electron main：在 Node 中缓冲，以 60Hz 刷新
let pending: number[] = [];

device.on("sample", (value) => pending.push(value));

setInterval(() => {
  if (pending.length === 0) return;
  const batch = new Float32Array(pending);
  pending = [];
  // 使用可传输对象避免 structured-clone 复制。
  mainWindow.webContents.send("device:samples", batch.buffer, [batch.buffer]);
}, 1000 / 60);
```

```ts
// preload：向渲染进程暴露一个薄的订阅 API
contextBridge.exposeInMainWorld("device", {
  onSamples: (cb: (samples: Float32Array) => void) => {
    const handler = (_: unknown, buf: ArrayBuffer) => cb(new Float32Array(buf));
    ipcRenderer.on("device:samples", handler);
    return () => ipcRenderer.removeListener("device:samples", handler);
  },
});
```

```tsx
// 渲染进程：通过 bridge 喂给 store
useEffect(() => {
  return window.device.onSamples((batch) => store.pushBatch(batch));
}, []);
```

渲染进程的渲染线程每帧只接触一个批次，无论设备有多快。数据工作在上游完成。

## 第四步：渲染离主线程 with OffscreenCanvas

DOM 是单线程的。Canvas API 过去也是。`OffscreenCanvas` 打破了这一点：你可以把一个 canvas 转移给 worker，在那里独立于主线程绘制。

```ts
// 主线程
const canvas = canvasRef.current!;
const offscreen = canvas.transferControlToOffscreen();
worker.postMessage({ canvas: offscreen }, [offscreen]);
```

```ts
// Worker
let ctx: OffscreenCanvasRenderingContext2D | null = null;

self.onmessage = (event) => {
  if (event.data.canvas) {
    ctx = event.data.canvas.getContext("2d");
    return;
  }
  if (event.data.samples && ctx) {
    drawSeries(ctx, event.data.samples);
  }
};
```

主线程现在可以自由处理点击、悬停和其他交互，而无需与绘制循环竞争。Worker 以自己的速率绘制，基于它拥有的任何数据。

与 `SharedArrayBuffer` 结合，你就得到了浏览器中最干净的实时渲染流水线：

摄取 worker 把样本写入共享缓冲区。渲染 worker 读取并绘制。主线程只读取汇总信息（FPS、最新值、通道标签）并渲染 chrome。没有任何数据穿过主线程的事件循环。

对于 19 通道 1kHz 信号，这是唯一能在笔记本上保证 60fps 的架构，而且还有余量。

## 第五步：绘制前先降采样

一个 1200 像素宽的 canvas 最多只能显示 1200 个不同的 X 位置。如果你的窗口中有 60,000 个样本，而你全部绘制，你做了 50 倍于用户能看到的工作。

为每个像素列选择正确的点。对信号来说，“min-max”模式效果很好：对每个像素列，找出该范围内最小值和最大值，并画一条连接它们的竖线。这在视觉上与绘制每个点相同，但成本低得多。

```ts
function drawDecimated(
  ctx: CanvasRenderingContext2D,
  samples: Float32Array,
  width: number,
) {
  const samplesPerPixel = samples.length / width;
  ctx.beginPath();
  for (let x = 0; x < width; x++) {
    const start = Math.floor(x * samplesPerPixel);
    const end = Math.floor((x + 1) * samplesPerPixel);
    let min = Infinity;
    let max = -Infinity;
    for (let i = start; i < end; i++) {
      const v = samples[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    ctx.moveTo(x, scale(min));
    ctx.lineTo(x, scale(max));
  }
  ctx.stroke();
}
```

降采样是实时可视化中最大的 CPU 收益，而且几乎没人做。

一个视觉上更忠实的变体是 **LTTB（Largest Triangle Three Buckets）**，一种在每个桶中选择一个代表性样本的算法，同时比 min-max 更好地保留视觉形状。如果你绘制的是非信号数据（如股票图表，每个峰值和谷值 individually 重要），它值得一读。大多数好图表库（uPlot、Plotly、ECharts）都内置了降采样。

## 第六步：包装外部渲染器

你并不总是需要自己动手写绘制循环。React 擅长生命周期管理。命令式图表库擅长原始性能。正确的做法通常是让 React 挂载和卸载图表，而库处理快速内循环。

```tsx
import Uplot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useEffect, useRef } from "react";

export default function UPlotChart({ data }: { data: AlignedData }) {
  const ref = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Uplot | null>(null);

  useEffect(() => {
    const opts = {
      title: "Realtime Chart",
      width: 600,
      height: 300,
      series: [{}, { label: "Signal" }],
    };
    plotRef.current = new Uplot(opts, data, ref.current!);
    return () => plotRef.current?.destroy();
  }, []);

  useEffect(() => {
    plotRef.current?.setData(data); // 命令式更新，不触发 React 渲染
  }, [data]);

  return <div ref={ref} />;
}
```

uPlot、TimeChart、ECharts、Plotly、LightningChart 等都遵循这个模式：在 `useEffect` 中实例化，调用 `setData` 命令式更新，卸载时销毁。React 负责编排，库负责渲染。

对于任何命令式渲染器，通用模式如下：

```tsx
function ChartWrapper({ config, data }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chart = new SomeFastChartLib(ref.current, config);
    chart.setData(data);
    return () => chart.destroy();
  }, [config, data]);

  return <div ref={ref} />;
}
```

如果你不是处于需要像素级控制绘制的领域，这是投资回报率最高的选择。先选库，只有当没有库适合时才自己写绘制循环。

## 第七步：当 Canvas 不够用时，求助于 WebGL

Canvas 2D 每帧可以轻松处理几千条线段。超过这个数量后，你会在 `stroke()` 本身上花费毫秒级时间。

WebGL（或更高级的封装如 `regl`、`twgl`、`pixi.js`、`deck.gl`）把渲染移到 GPU。你支付 upfront 成本（编写着色器、管理缓冲区），以换取绘制数百万点而不费力的能力。

下面是一个最小化的 WebGL “单顶点着色器折线”草图：

```ts
const gl = canvas.getContext("webgl2")!;

const program = gl.createProgram()!;
// ... 编译顶点和片段着色器，链接，获取 attribute location ...

const samplesBuffer = gl.createBuffer();
function drawWebGL(samples: Float32Array) {
  gl.bindBuffer(gl.ARRAY_BUFFER, samplesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, samples, gl.STREAM_DRAW);
  gl.useProgram(program);
  gl.drawArrays(gl.LINE_STRIP, 0, samples.length);
}
```

模式与 Canvas 2D 相同：RAF 循环中的命令式绘制调用。区别是 GPU 负责实际光栅化。大多数声称能绘制“数百万点”的实时图表库，底层正是这样做的。

默认使用 Canvas 2D，只有当你能在 Profiler 上证明 Canvas 是瓶颈时，才升级到 WebGL。

## 第八步：保持内存扁平

实时应用是缓慢死亡的。它们能流畅运行一小时，然后笔记本风扇开始转。原因几乎总是内存。

有三条规则能保持堆内存稳定。

第一，对数值数据使用类型化数组。60,000 个浮点数的 `Float32Array` 是 240KB。同样大小的普通 JavaScript 数组大约 1.4MB，而且每次 push 都会产生 GC 压力。

第二，给一切设上限。使用环形缓冲区，而不是不断增长的数组。对历史、队列和待处理工作都设置上限。任何*可能*无界增长的东西最终都会增长。

第三，重用缓冲区。在初始化时分配一次，然后跨帧重用。每帧都分配新数组在 60fps 下是每个图表每秒 60 次分配。乘以图表数量。

```ts
// 不好：每帧都分配新数组。
function drawFrame() {
  const snapshot = store.read(); // 返回新的 Float32Array
  drawDecimated(ctx, snapshot, width);
}

// 更好：重用一个绘制缓冲区。
const drawBuf = new Float32Array(WINDOW_SIZE);

function drawFrame() {
  store.readInto(drawBuf); // 写入已有缓冲区
  drawDecimated(ctx, drawBuf, width);
}
```

这些规则不是 React 特有的。它们是任何实时系统都遵循的规则。之所以需要特别说明，是因为 React 式的思维（“每次渲染都派生一个新数组”）与实时需求正好相反。

## 第九步：调度策略

一个没有调度的 worker 池只是一个队列。有时你想要优先级：用户驱动的操作应该跳到后台扫描前面。

### 优先级队列

一个小型优先级调度器：

```ts
type Priority = "high" | "normal" | "low";

class PriorityPool {
  private queues: Record<Priority, Job[]> = { high: [], normal: [], low: [] };
  private idle: Worker[];

  enqueue(job: Job, priority: Priority = "normal") {
    if (this.idle.length > 0) {
      const worker = this.idle.pop()!;
      this.dispatch(worker, job);
    } else {
      this.queues[priority].push(job);
    }
  }

  private next(): Job | null {
    for (const p of ["high", "normal", "low"] as const) {
      const j = this.queues[p].shift();
      if (j) return j;
    }
    return null;
  }

  private dispatch(worker: Worker, job: Job) {
    worker.postMessage(job.payload, job.transferables);
    worker.onmessage = (event) => {
      job.resolve(event.data);
      const next = this.next();
      if (next) this.dispatch(worker, next);
      else this.idle.push(worker);
    };
  }
}
```

三个桶通常就够了：high（用户发起）、normal（稳态工作）、low（后台扫描、预取、遥测刷新）。

### 可切分工作

一个耗时 2 秒的任务会阻塞一个 worker 2 秒。如果你想让 worker 对高优先级任务保持响应，任务必须是可切分的。

```ts
// Worker 内部：
self.onmessage = async (event) => {
  const { id, kind, payload } = event.data;
  if (kind === "decode_large") {
    const total = payload.byteLength;
    for (let i = 0; i < total; i += CHUNK) {
      const chunk = decodeChunk(payload, i, Math.min(i + CHUNK, total));
      self.postMessage({ id, kind: "progress", chunk, offset: i });
      // 让步，让 worker 可以检查消息队列。
      await new Promise((r) => setTimeout(r, 0));
    }
    self.postMessage({ id, kind: "done" });
  }
  if (kind === "cancel") {
    // ... 中止当前任务
  }
};
```

在 worker 内部让步并非没有成本，但它让 worker 可以处理取消消息或与高优先级任务交错执行。对于长时间任务（如固件烧录、大文件解码、大渲染），这是必不可少的。

### 扇出与扇入

把大任务拆成 N 块，分发给不同 worker，然后汇总结果。

```ts
async function decodeFile(buffer: ArrayBuffer): Promise<DecodedFrame[]> {
  const chunks = splitBuffer(buffer, 8);
  const results = await Promise.all(
    chunks.map((chunk) => pool.run<DecodedFrame[]>("decode", chunk, [chunk])),
  );
  return results.flat();
}
```

这在可并行工作负载上提供线性加速，直到 worker 数量上限。对于批处理操作（如解码录音、总结长文档、计算文件夹的 embeddings），它至关重要。

## 第十步：测量持续性能

Profiler 上的尖峰是一回事。一小时内的堆内存缓慢攀升是另一回事。对于实时应用，你要测量两件事。

第一，帧一致性。你是否稳定保持 60fps，还是偶尔掉帧？一个简单的 FPS 计：

```ts
let lastTime = performance.now();
let frames = 0;

function rafLoop(now: number) {
  frames++;
  if (now - lastTime >= 1000) {
    const fps = (frames * 1000) / (now - lastTime);
    frames = 0;
    lastTime = now;
    console.log(`fps: ${fps.toFixed(1)}`);
  }
  requestAnimationFrame(rafLoop);
}
requestAnimationFrame(rafLoop);
```

更诚实的指标是一个窗口内的最差帧。平均帧时间会隐藏卡顿。

第二，堆稳定性。打开 DevTools Memory 标签，拍一张堆快照，运行应用十分钟，再拍一张，然后对比。diff 应该是平的。如果增长，说明有泄漏：保留的监听器、增长的数组、或闭包持有大对象。

对于真实应用，把堆使用量和 FPS 接入你的分析系统，这样用户抱怨之前就能发现回退。

## 案例研究：19 个 EEG 通道

回到启发本文的项目：我们有 19 个通道，每个 1kHz，同时渲染，并且需要在多小时记录会话中保持流畅。

第一版使用了 **LightningChart**。它强大、 capable、漂亮。但它也很重。内存使用量明显攀升，图表内部为我们的用例（19 条简单折线，而不是完整的多轴金融图表）做了大量工作，而且授权也是个摩擦点。

我们 switched 到 **uPlot**。它小巧、快速，专门为时间序列编写。内存使用量下降，每帧渲染时间从“偶尔超预算”变成“总是低于预算”，我的机器也不再像要起飞一样。单单更换图表库就为我们赢得了大部分所需余量。

图表周围的架构完成了其余部分。流水线运行在四个线程上：

- **一个摄取 worker** 从设备 SDK 通过 IPC 读取（Electron 主进程到渲染进程）。
- **一个 `SharedArrayBuffer`** 保存所有 19 个通道的滚动窗口。
- **一个渲染 worker** 读取 SAB 并绘制到 `OffscreenCanvas`。
- **主线程** 渲染 chrome：通道标签、控件、FPS 计。

共享缓冲区布局是一个大的 `Float32Array`，索引为 `[channel * samplesPerChannel + sampleIndex]`。摄取 worker 写入新样本并推进每个通道的 head 指针（存储在 SAB 的一个 `Int32Array` 切片中）。渲染 worker 每帧读取最新窗口。

```ts
const CHANNELS = 19;
const WINDOW_SAMPLES = 60_000;

const sab = new SharedArrayBuffer(CHANNELS * WINDOW_SAMPLES * 4 + CHANNELS * 4);
const heads = new Int32Array(sab, 0, CHANNELS);
const samples = new Float32Array(sab, CHANNELS * 4, CHANNELS * WINDOW_SAMPLES);

function writeSample(channel: number, value: number) {
  const head = Atomics.load(heads, channel);
  samples[channel * WINDOW_SAMPLES + head] = value;
  Atomics.store(heads, channel, (head + 1) % WINDOW_SAMPLES);
}
```

渲染器读取通道缓冲区，按像素列降采样，并绘制：

```ts
// render.worker.ts
function drawFrame() {
  const ctx = offscreenCtx;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let ch = 0; ch < CHANNELS; ch++) {
    const start = ch * WINDOW_SAMPLES;
    drawDecimatedRow(ctx, samples.subarray(start, start + WINDOW_SAMPLES), ch);
  }
  requestAnimationFrame(drawFrame);
}
```

在 2024 M3 MacBook Pro 上，这套方案在 19 通道 1kHz 下保持 60fps，如果显示器支持还能到 144fps。主线程利用率低于 1%。Worker 消耗空闲核心。用户感受到的东西，过去需要原生应用才能实现。

简而言之，教训是：大部分工作是选对内循环工具，并不要挡它的路。

## 基准测试：单线程 vs 多线程

以下是在 2024 M3 MacBook Pro 上运行相当工作负载得到的数字。它们是参考，不是承诺。

| 工作负载 | 仅主线程 | Worker 池 | Workers + SAB | Workers + SAB + OffscreenCanvas |
| --- | --- | --- | --- | --- |
| 解析 100MB 二进制文件 | 4.2s（UI 冻结） | 1.1s | 1.0s | 1.0s |
| 解码 1,000 帧 | 920ms | 280ms | 240ms | 240ms |
| 渲染 100 万点图表 | 24fps | 24fps | 28fps | 60fps |
| 遥测：4 流 × 1000Hz | 22fps | 38fps | 55fps | 60fps |
| EEG：19 通道 × 1kHz | 12fps | 25fps | 48fps | 60fps（可到 144fps） |
| 每帧主线程 JS 时间 | 22ms | 8ms | 4ms | < 1ms |
| 内存开销 | baseline | +50MB | +20MB | +20MB |
| Worker 首次调用启动延迟 | 0 | 2-5ms | 2-5ms | 5-10ms |

模式是：单独的 Worker 有帮助，Worker + 共享内存帮助更大。Worker + 共享内存 + `OffscreenCanvas` 才能达到“主线程什么都不做，图表依然流畅”的状态。

对于图表密集型应用，从“Worker”到“Worker + OffscreenCanvas”的跳跃是浏览器中最大的单一架构提升，而且无需离开浏览器。

## COOP/COEP 的陷阱

2020 年 Spectre/Meltdown 之后，`SharedArrayBuffer` 和高精度计时器被收紧。要使用它们，页面必须设置两个 HTTP 头：

```plaintext
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

这会让你的页面进入“跨源隔离”状态。在隔离上下文中，`SharedArrayBuffer` 存在，`performance.now()` 是高精度的，各种其他受限 API 也能工作。

在非隔离上下文中，`SharedArrayBuffer` 未定义，`performance.now()` 精度被限制到约 1ms，Atomics 会抛出异常。

代价是显著的。`require-corp` 意味着每个跨源资源（来自 CDN 的图片、嵌入的 YouTube 视频、第三方字体、分析脚本）必须显式通过设置 `Cross-Origin-Resource-Policy: cross-origin` 或 `Cross-Origin-Embedder-Policy: credentialless` 来加入。许多第三方服务不设置这些，会破坏嵌入。

有两个实际选择：

- **对于 Electron 应用**：渲染进程可以很容易配置这些头。大多数需要实时可视化的生产 Electron 应用默认启用它们。
- **对于浏览器应用**：权衡你会失去的嵌入内容与你会获得的性能。如果你的应用是主角（Figma、Google Docs），就加入。如果你依赖第三方 widget，代价是真实的。

对于需要 SAB 的图表密集型或信号密集型应用，Electron 路径通常更干净。

## 生产权衡

以上是以上所有内容的五个真实成本。

- **代码复杂度**：基于 Worker 的应用的源文件数量是单线程应用的 2 到 4 倍（主线程 + worker + 共享类型）。对于合适规模的应用值得，但对小应用来说很痛苦。
- **调试**：堆栈跟踪跨线程分裂。Chrome DevTools 在 2026 年处理得很好（每个 worker 有自己的调试器面板），但仍然比单线程 bug 更麻烦。
- **打包体积**：每个 worker 是单独的 chunk。Worker 内部的 tree-shaking 有时比主线程差（成熟度较低）。单独审计 worker 包。
- **启动延迟**：在应用启动时创建 worker 会增加 50 到 200ms。在启动画面期间预热它们，或接受第一帧延迟。
- **浏览器 API 缺口**：`localStorage`、`document` 和大多数 DOM API 在 worker 中不可用。有些库静默依赖它们并会崩溃。在 worker 环境中测试你未用过的库。

命令式渲染模式还有三个特有权衡：

- **数据的声明式动画**：图表框架、标签和控件保持声明式。图表内部的数据变成命令式。
- **渲染输出的快照测试变难**：canvas 没有可查询的 DOM。单独测试数据路径和绘制路径。对 store 输出做快照，而不是像素。
- **React 内循环的组件故事**：绘制循环是闭包。组合绘制循环比组合组件更难。仔细选择组件边界，让每个 canvas 只做一件事。

对大多数应用来说，这些成本不值得。对于必须流畅渲染 1kHz 数据的应用，它们是入场券。

## 你应该这样构建吗？

如果你的数据速率低于每秒每个流 30 次更新，以上都不需要。朴素的每批次 `setState` 就能工作。先分析，再优化。

这种架构在以下情况物有所值：

- 你有多个流或传感器
- 摄取是持续的，不是突发的
- 用户体验承诺是数小时的平滑运动，而不是几秒
- 你不想为此把 UI 重写成原生语言

无聊的规则：从 `requestAnimationFrame` 合并和外部 store 开始。不够时再升级到 worker。worker `postMessage` 是瓶颈时再升级到共享内存。渲染循环本身是瓶颈时再升级到 `OffscreenCanvas`。每一步都是真实的架构投资。按顺序进行。

## 总结

如果方式正确，React 可以处理实时可视化。不是把 React 推去做所有事，而是把它当作指挥。让专门的库和 worker 处理重活。

以下三条规则在我构建的每个高频 React 应用中都成立：

1. **Worker 干活，主线程做 UI。** 如果主线程在做数学运算，你把数学放错了地方。
2. **能转移就转移，必须共享才共享。** 两者都优于克隆。共享比转移复杂。
3. **让 React 编排。让专门工具渲染。** store 拥有数据，绘制循环拥有值，React 拥有形状。

把这些做对，你的 React 应用就不再是一个一看到高频数据就畏缩的单核系统。它会变成一个随硬件扩展的多核系统，摄取不掉数据，渲染不卡顿。

核心就在那里。用上它们。

## 参考资料

- [uPlot](https://github.com/leeoniya/uPlot)：小巧、快速、专注于时间序列。
- [TimeChart](https://github.com/huww98/TimeChart)：基于 WebGL 的高性能实时图表。
- [Using Web Workers in React](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)：MDN 参考。
- [SharedArrayBuffer on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)：共享内存原语。
- [OffscreenCanvas on MDN](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)：离主线程渲染。
- [COOP and COEP explainer](https://web.dev/articles/coop-coep)：跨源隔离能带来什么。
