原文：Implementing the Temporal proposal in JavaScriptCore
翻译：TUARAN
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 在 JavaScriptCore 中实现 Temporal 提案

[原文链接：Implementing the Temporal proposal in JavaScriptCore](https://blogs.igalia.com/compilers/2026/01/31/implementing-the-temporal-proposal-in-javascriptcore/)

作者：Tim Chevalier

2026 年 1 月 31 日

过去一年里，作者一直在为 JavaScriptCore（JSC）实现 TC39 的 Temporal 提案。JSC 是 WebKit 浏览器引擎中的 JavaScript 引擎。

作者开始这项工作时，JSC 的 Temporal 处于“部分实现”状态：

- 已支持：`Duration`、`PlainDate`、`PlainDateTime`、`Instant`
- 但：大量 Temporal 相关的 test262 测试无法通过
- 且缺少：`PlainMonthDay`、`PlainYearMonth`、`ZonedDateTime`
- 还缺：`relativeTo` 参数
- 只支持：`iso8601` 日历

本文概述了实现过程中的关键点与当前进展。

## Duration 精度（已落地）

概念上，`Duration` 可以看作由多个时间分量组成的 10 元组（或记录）：

- years, months, weeks, days
- hours, seconds, milliseconds, microseconds, nanoseconds

`Duration` 的一个常见用途是表示两个日期之间的差值。例如，从某天到 2027 年末的时长：

```js
const duration = (new Temporal.PlainDate(2026, 1, 26))
  .until(new Temporal.PlainDate(2027, 12, 31), { largestUnit: 'years' });

duration;
// Temporal.Duration <P1Y11M5D>
```

得到的 duration 由“1 年 11 月 5 天”构成。

因为是日期差值，它也可以是负数：

```js
const duration = (new Temporal.PlainDate(2027, 12, 31))
  .until(new Temporal.PlainDate(2026, 1, 26), { largestUnit: 'years' });

// years: -1, months: -11, days: -5
```

### 为什么精度实现很棘手

把 duration 转成纳秒时，`days/hours/minutes/seconds/milliseconds/microseconds/nanoseconds` 的总和可能大到无法用 32 位整数或 64 位双精度浮点准确表示。

举个例子：

```js
duration.total({ unit: 'nanoseconds', relativeTo: new Temporal.PlainDate(2025, 12, 15) });
// 60912000000000000
```

这大约是 $6.1 \times 10^{16}$ 纳秒。

Temporal 允许的年份范围非常大（从 -271821 到 275760），因此这种总量可能进一步变得更大。

为了让实现更容易满足规范的要求，Temporal 规范内部把 duration 表示成 **Internal Duration Records**：

- 一部分是“日期分量”（years/months/weeks/days）
- 另一部分是“时间分量”（一个受范围约束的整数）

实现不一定必须照抄这种内部结构，但需要做到“可观察行为一致”。作者表示：此前 JSC 的实现不足以满足要求，因此他按规范思路重新实现了 duration。

这项工作已经合入 JSC。

## 新的日期类型

Temporal 的日期类型包括：

- `PlainDate`
- `PlainDateTime`
- `Instant`
- `ZonedDateTime`
- `PlainMonthDay`
- `PlainYearMonth`

其中 `PlainMonthDay` 与 `PlainYearMonth` 属于“部分日期”：

- 前者只表示某个月里的某一天
- 后者表示某一年中的某个月

它们比“用默认值填满的完整日期”更适合表达“只关心部分字段”的场景。

`ZonedDateTime` 则表示“日期 + 时区”，时区既可以是相对 UTC 的数值偏移，也可以是具名时区。

作者已实现 `PlainMonthDay` 和 `PlainYearMonth` 的全部操作；`ZonedDateTime` 也已完整实现，并开始以一系列 PR 的方式提交。

## `relativeTo` 参数

Temporal 能把“年/月”换算成“天”，但这需要额外信息。

因为在 ISO 8601（类似公历）中：

- 闰年会影响“1 年有多少天”
- 某些日历还有闰月
- 月的天数也不固定

因此，如果你只写：

```js
const duration = Temporal.Duration.from({ years: 1 });

duration.total({ unit: 'days' });
// RangeError: a starting point is required for years total
```

会抛错：缺少换算起点。

可以通过 `relativeTo` 指定起点：

```js
duration.total({ unit: 'days', relativeTo: '2025-01-01' });
// 365

duration.total({ unit: 'days', relativeTo: '2024-01-01' });
// 366
```

`relativeTo` 传入的字符串会自动被解析为 `PlainDate` 或 `ZonedDateTime`（取决于格式）。

作者已为所有涉及该参数的操作实现支持；等所有日期类型相关实现落地后，会继续以 PR 方式提交。

## 日历（Calendars）

非 ISO8601 日历的支持仍在进行中。

ICU 库已经能做基础日期计算，但要把它们正确地集成到 Temporal 的内部表示与行为中，还需要大量 glue code。

Temporal 规范本身并不强制实现必须支持非 ISO8601 日历；不过另一个提案 Intl Era Month Code 提议了一组“符合实现应支持”的日历集合。

## Temporal 的测试

JavaScript 的标准测试套件是 test262，新提案都需要配套 test262 测试。

Temporal 的测试有个特殊点：

- 并非所有 JS 实现都必须支持国际化（Intl）
- 因此涉及非 ISO 日历或具名时区（除 UTC 外）的测试被放在 test262 的 `intl402` 子目录

原文给出的数据：

- Temporal 相关测试总数：6,764
- 其中 2025 年新增：1,791
- Igalia 在过去一年投入大量时间提升测试覆盖

## 当前进度

这些能力目前在 JSC Technology Preview 中通过 flag 提供，需要启动参数：`--useTemporal=1`。

作者表示：除非 ISO 日历相关工作外，文中讨论的大部分实现已完成；他在 2025 年已合入约 40 个 PR，并预计还需要至少 25 个 PR 完成 `PlainYearMonth`、`ZonedDateTime`、`relativeTo` 等收尾。

基于目前的实现：

- Temporal 的非 intl402 test262 测试已 100% 通过
- 而 JSC 当前 HEAD 版本（未含这些实现）通过率不到一半

作者期待 Temporal 最终进入 JavaScript 标准，并在浏览器之间得到一致实现，让日期/时间处理更可靠。
