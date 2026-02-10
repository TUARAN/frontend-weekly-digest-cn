原文：[Node.js 16 to 25 Benchmarks: How Performance Evolved Over Time](https://www.repoflow.io/blog/node-js-16-to-25-benchmarks-how-performance-evolved-over-time)
翻译：TUARAN
欢迎关注 [{{前端周刊}}](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# Node.js 16 到 25 的性能基准


作者：RepoFlow

本文用同一套 Express 工作负载/基准框架，跑了一遍 Node.js 16 到 25 的多个版本，想回答一个更“落地”的问题：Node 在这些版本演进中，性能曲线到底发生了什么变化？

作者此前做过 Express 4/5 的基准测试，并注意到 Node 24 有一次明显跃升，因此进一步把焦点放到 Node 运行时本身。

## 覆盖版本

基准覆盖以下 Node.js 版本（包含 LTS 与非 LTS，用于观察整体轨迹）：

16.0.0、16.20.2、17.0.0、17.9.1、18.0.0、18.20.8、19.0.0、19.9.0、20.0.0、20.20.0、21.0.0、21.7.3、22.0.0、22.22.0、23.0.0、23.11.1、24.0.0、24.13.0、25.0.0、25.3.0

## 基准项目

- **HTTP GET 吞吐量**：本地 HTTP server（keep-alive + 32 并发）每秒处理请求数。
- **JSON.parse 速度**：解析小 JSON payload 的吞吐。
- **JSON.stringify 速度**：序列化小对象为 JSON 的吞吐。
- **SHA-256 哈希**：`crypto.createHash('sha256')` 的吞吐。
- **Buffer 拷贝（64KB）**：`Buffer.copy` 的内存吞吐。
- **Array map + reduce**：常见 map 再 reduce 的计算模式。
- **字符串拼接**：反复拼接构建字符串。
- **整数循环 + 算术**：紧凑数值循环，体现引擎对数值代码的优化能力。
- **带随机输入的整数循环**：在循环里引入 `Math.random()`，降低“可预测性”，用于区分真实改进与只对高度可预测代码生效的优化。

## 测试方法

- 每个测试运行 5 次，取吞吐量中位数（p50）。
- 每轮之间做冷却，减少温控带来的偏差。

环境：

- 硬件：Apple M4（10 核），macOS 25.0.0（arm64）
- 工具：自定义 Node.js benchmark harness

## 结论

- Node.js 的性能总体随版本迭代稳步提升。
- Node 25 在部分场景尤其突出（作者特别指出数值运算与循环密集型负载）。

这些是合成基准，真实应用的表现还会受到 I/O、内存访问模式与应用结构等影响；但整体趋势仍能说明：近期 Node 版本在运行时层面确实带来了可观改进。
