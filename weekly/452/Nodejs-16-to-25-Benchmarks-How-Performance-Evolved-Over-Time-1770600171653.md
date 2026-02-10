# Node.js 16 到 25 基准测试：性能演进如何变化

# Node.js 16 到 25 性能基准

## **我们跑了 Node.js 16 到 25 的基准，看看到底变了什么。**

我们最近对多个 Node.js 版本做了 [Express 基准测试](https://www.repoflow.io/blog/express-4-vs-express-5-benchmark-node-18-24)，注意到在 Node 24 上出现了一次明显的性能跃升。这个发现促使我们进一步直接对 Node.js 自身做测试：使用相同的 Express 工作负载，在 16 到 25 的版本范围内跑一遍，观察性能曲线如何随版本演进。

本文所有基准覆盖以下 Node.js 版本：

16.0.0、16.20.2、17.0.0、17.9.1、18.0.0、18.20.8、19.0.0、19.9.0、20.0.0、20.20.0、21.0.0、21.7.3、22.0.0、22.22.0、23.0.0、23.11.1、24.0.0、24.13.0、25.0.0、25.3.0

其中既包含 LTS，也包含非 LTS 版本，用来展示完整的性能轨迹，而不是零散的快照。

### HTTP GET 吞吐量

在一个简单的本地 HTTP 服务器（keep-alive + 32 并发请求）中，Node 每秒能处理多少请求。

### JSON.parse 速度

衡量 Node 解析一个小 JSON payload 的速度。

### JSON.stringify 速度

衡量 Node 把一个小对象序列化为 JSON 的速度。

### SHA-256 哈希

使用 `crypto.createHash("sha256")` 的哈希吞吐量。

### Buffer 拷贝（64 KB）

使用 `Buffer.copy` 拷贝 64 KB buffer 的内存吞吐量。

### Array map + reduce

常见的 JavaScript 模式：先 map 再 reduce。

### 字符串拼接

反复进行字符串拼接构建。

### 整数循环 + 算术

一个紧凑的整数循环，执行简单算术运算。这个测试用于体现 JavaScript 引擎执行高度优化的数值代码时的效率。

### 带随机输入的整数循环

为了验证 Node 25 在整数循环测试中观察到的“异常大”的性能提升，我们又跑了一个版本：在循环里引入 `Math.random()` 的随机性。

这样会让计算变成“数据相关”，引擎更难进行激进优化，从而帮助区分：到底是运行时的真实改进，还是只对高度可预测代码生效的优化。

### 测试方法

每个测试都会运行 5 次，结果使用吞吐量的中位数（p50）汇报。每轮测试之间会让系统冷却，以避免温控偏差。

- 硬件：Apple M4，10 核，macOS 25.0.0（arm64）
- 工具：自定义 Node.js benchmark harness，不依赖外部框架

### 结论

Node.js 的性能在各个版本中持续稳步提升，但 Node 25 尤其突出，特别是在数值运算与循环密集型负载上。

并非所有应用都会获得“肉眼可见”的巨大提升，但如果你的工作负载包含紧密循环、计算密集逻辑或转换流水线，那么升级到较新的 Node 版本可能会带来有意义的收益。

当然，合成基准测试总是偏向“最佳情况”。真实世界的性能还取决于 I/O、内存访问模式以及应用结构。即便如此，这些结果仍清晰地表明：近期的 Node 版本确实带来了实打实的运行时级别改进。

欢迎告诉我们，你希望下一次我们测哪类基准！

### **分享文章（原文页面区块）**

[![](https://cdn.prod.website-files.com/671c6c9cb0729bd414d7529e/6851924268c38b3087b826ac_twitter-color-icon.svg)](https://twitter.com/share?text=RepoFlow-Blog&url=)
[![](https://cdn.prod.website-files.com/671c6c9cb0729bd414d7529e/6851923f0d892a6ec193382f_facebook-round-color-icon.svg)](https://www.facebook.com/sharer/sharer.php?u=)
[![](https://cdn.prod.website-files.com/671c6c9cb0729bd414d7529e/68519238882b191cbbc27b7d_linkedin-app-icon.svg)](https://www.linkedin.com/shareArticle?url=)
[![](https://cdn.prod.website-files.com/671c6c9cb0729bd414d7529e/6851935db22c477677203646_reddit-icon.svg)](https://www.reddit.com/submit?url=)

![](https://cdn.prod.website-files.com/671c6c9cb0729bd414d7529e/695bd9b8a686cdd46feee3ae_5fbfefa1fffca65cf2330622110119e0_express-banchmark-thumbnail.svg)

Benchmark：[Express 4 vs Express 5 Performance Benchmark](https://www.repoflow.io/blog/express-4-vs-express-5-benchmark-node-18-24)

![](https://cdn.prod.website-files.com/671c6c9cb0729bd414d7529e/68120802e0a8987c507d372a_github-thumbnail.svg)

Product：[Cache GitHub Releases with a Universal Repository](https://www.repoflow.io/blog/cache-github-releases-with-a-universal-repository)

![](https://cdn.prod.website-files.com/671c6c9cb0729bd414d7529e/68093170acfd0cbeabef5c81_imgonline-com-ua-progressiveNA4EZmDmSsWr.avif)

Release：[Run a Private Docker Registry on Your iPhone](https://www.repoflow.io/blog/run-a-private-docker-registry-on-your-iphone)

[RepoFlow Blog](https://www.repoflow.io/blog)