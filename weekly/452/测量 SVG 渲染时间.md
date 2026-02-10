原文：Measuring SVG rendering time
翻译：TUARAN
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 测量 SVG 渲染时间

[原文链接：Measuring SVG rendering time](https://www.phpied.com/measuring-svg-rendering-time/)

作者：Stoyan Stefanov

本文想回答两个很直接的问题：

- 大型 SVG 的渲染是否显著比小 SVG 慢？有没有一个“超过就很糟糕”的尺寸阈值？
- 如果把这些 SVG 转成 PNG，渲染表现会怎样？

为此，作者生成了一批测试图片，并用自动化脚本测量“点击插入图片到下一次绘制”的时间（INP 相关）。

## 测试图片

一个 Python 脚本（`gen.py`）生成了 199 个 SVG 文件：

- 1KB 到 100KB：每 1KB 一个
- 200KB 到 10MB：每 100KB 一个

每个 SVG 都是 1000×1000，包含随机的路径、圆、矩形等形状；颜色、位置、线宽随机化。

然后用 `convert-to-png.js`（Puppeteer）把所有 SVG 转成 PNG：

- `omitBackground: true`（保持透明背景）
- 转完再过一遍 ImageOptim

作者用 `chart-sizes.html` 展示了 SVG 与 PNG 的文件大小分布：SVG 一路可以到 10MB，但 PNG 很少到那么大；在小尺寸区间往往 SVG 更小，而超过约 2MB 后，PNG 反而更小。

（原文附图）

![](https://www.phpied.com/files/svgtest/chart-sizes.png)

接下来是渲染测试页：一次只渲染一张图。

## 测试页面

`test.html` 接受文件名参数，例如：`?file=test_100KB&type=svg`。

页面逻辑：

- 用 `new Image()` 预加载图片（因为我们不关心下载时间，只关心渲染）
- 预加载完成后显示一个 “inject” 按钮
- 点击按钮后，把图片 append 到 DOM

为了捕获交互到绘制的成本，用 `PerformanceObserver` 监听 event entries，并计算 INP 分解：

- input delay
- processing duration
- presentation delay

其中 **presentation delay** 指点击处理结束到浏览器实际绘制的时间；作者主要关注最终的 INP。

```js
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'pointerup' || entry.name === 'click') {
      const inputDelay = entry.processingStart - entry.startTime;
      const processingDuration = entry.processingEnd - entry.processingStart;
      const presentationDelay =
        entry.duration - (entry.processingEnd - entry.startTime);
      const totalINP = entry.duration;
      // ...
    }
  }
}).observe({ type: 'event', buffered: true, durationThreshold: 16 });
```

## 自动化测量

`measure.js` 是一个 Puppeteer 脚本，流程大致是：

- 启动 Chrome
- 对每个测试文件：
  - 先打开 `blank.html` 重置状态
  - 再打开带参数的 `test.html`
  - 等预加载完成
  - 开始 DevTools trace
  - 点击 inject，把图片插入 DOM
  - 等待 `PerformanceObserver` 回报
  - 停止 trace
  - 从 observer 与 trace 中提取 INP
- 每个文件跑 3 次，取中位数
- 输出 JSON 结果

命令行参数：

- `--png`：测 PNG（默认测 SVG）
- `--throttle=N`：CPU 降速（例如 `--throttle=4` 表示 4× 变慢）
- `--output=file.json`：输出文件名

作者试过开/不开 throttle，整体趋势不变，差别主要体现在绝对耗时变大。

## 开跑

```bash
node measure.js --svg --output=results-svg.json
node measure.js --png --output=results-png.json
```

## 结果

可以在 `chart.html` 查看完整图表。

SVG 结果（全量）：

![](https://www.phpied.com/files/svgtest/chart-svg-all.png)

SVG 结果（<= 1MB）：

![](https://www.phpied.com/files/svgtest/chart-svg-small.png)

PNG 结果：

![](https://www.phpied.com/files/svgtest/chart-png.png)

作者观察到：

- PerformanceObserver 的 INP 与 profiler 的 INP 很接近
- SVG 的渲染时间呈现一种“阶梯式”增长：
  - 小于约 400KB 的 SVG，渲染耗时差不多
  - 之后会在某些区间出现明显跃迁（例如约 1.2MB）
- PNG 也似乎有类似阶梯，但由于 1–2MB 区间样本较少，不如 SVG 明显
- 不管格式如何，**400KB 以下基本都在同一渲染档位**；当文件更大时，尤其是非常大时，PNG 倾向更快

作者还展示了生成图片的样子（例如 60KB 的 SVG），更大文件只是叠加更多形状以提高体积：

![](https://www.phpied.com/files/svgtest/test_60KB.svg)
