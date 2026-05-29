'use client';

import { useMemo, useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';

interface SignalItem {
  topic: string;
  title: string;
  summary: string;
  source: string;
  href: string;
  time: string;
}

const signals: SignalItem[] = [
  {
    topic: 'AI Coding',
    title: 'Claude Opus 4.8 发布：代码漏检率降 75%，Agent 判断力全面升级',
    summary: 'Anthropic 发布 Opus 4.8，Online-Mind2Web 评测 84%，代码错误漏检率降约 75%，诚实度与对齐表现提升。2.5 倍速模式价格降至前代 1/3，已登陆 Claude Code 等全平台。',
    source: 'Anthropic Newsroom',
    href: 'https://www.anthropic.com/news/claude-opus-4-8',
    time: '今日',
  },
  {
    topic: 'AI Coding',
    title: 'Claude Code 推出"动态工作流"，单会话并行调度数百子 Agent',
    summary: '通过动态编写脚本在单次会话中并行运行数十至数百个子 Agent，用于跨代码库 bug 查找、Bun 从 Zig 到 Rust 语言移植等复杂任务，结果验证后呈现，研究预览阶段已可用。',
    source: 'Claude Blog',
    href: 'https://claude.com/blog/introducing-dynamic-workflows-in-claude-code',
    time: '今日',
  },
  {
    topic: 'AI Coding',
    title: '阶跃星辰开源 Step 3.7 Flash：198B MoE，兼容 Claude Code / MCP',
    summary: '198B 参数 MoE（11B 活跃），ClawEval-1.1 得分 67.1 分第一，兼容 Claude Code、MCP 协议，支持 Mac Studio M4 Max 本地运行，Apache 2.0 许可开源，工具调用 τ2-bench 超 98%。',
    source: 'X @StepFun_ai',
    href: 'https://x.com/StepFun_ai/status/2060149124117475791',
    time: '今日',
  },
  {
    topic: 'AI Coding',
    title: 'Cursor《开发者习惯报告》：周均代码产出翻倍，Agent 调用增 30%',
    summary: '周均代码产出从 3.6K 行增至 8.6K 行，AI Agent 单次会话工具调用数增约 30%，AI 代码 60 分钟留存率从 76% 升至 81%，数据表明 AI 正深刻重构软件开发工作形态。',
    source: 'X @shao__meng',
    href: 'https://x.com/shao__meng/status/2060167182777249886',
    time: '今日',
  },
  {
    topic: 'AI Coding',
    title: 'Anthropic 完成 650 亿美元 H 轮融资，年化收入突破 470 亿美元',
    summary: 'Altimeter Capital 领投，投后估值 9650 亿美元。Claude 年化收入突破 470 亿美元，已登陆 AWS、Google Cloud、Azure 三大云平台，资金将用于 AI 安全研究与算力扩展。',
    source: 'Anthropic Newsroom',
    href: 'https://www.anthropic.com/news/series-h',
    time: '今日',
  },
];

function SignalCard({ item }: { item: SignalItem }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `${item.topic}\n${item.title}\n${item.summary}\n原文：${item.href}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/85">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              {item.topic}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{item.time}</span>
          </div>
          <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">{item.title}</h3>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{item.summary}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="truncate text-xs text-gray-500 dark:text-gray-400">{item.source}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-200"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? '已复制' : '复制转发'}
          </button>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            查看出处
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

function SignalStream({ items }: { items: SignalItem[] }) {
  const loopItems = useMemo(() => [...items, ...items], [items]);

  return (
    <div className="signal-marquee relative h-[640px] overflow-hidden">
      <div className="signal-track">
        {loopItems.map((item, index) => (
          <div key={`${item.title}-${index}`} className="mb-4">
            <SignalCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LiveSignalBoard() {
  return (
    <section className="mx-auto mb-16 max-w-6xl rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm dark:border-gray-800 dark:from-gray-950 dark:to-gray-900">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">7×24h Feed</p>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">AI、Agent、前端、科技 实时播报</h2>
      </div>

      <SignalStream items={signals} />
    </section>
  );
}
