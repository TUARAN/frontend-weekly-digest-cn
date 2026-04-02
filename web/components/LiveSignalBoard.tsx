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
    topic: '前端',
    title: '框架发布与浏览器能力持续影响前端工程选型',
    summary: '关注 React、Vite、浏览器 API 与构建工具的版本变化，优先判断哪些更新会真正影响团队交付效率。',
    source: 'React / Vite / Web Platform',
    href: 'https://react.dev/blog',
    time: '刚刚',
  },
  {
    topic: 'AI Agent',
    title: 'Agent 工作流正在从 Demo 走向可交付的工程系统',
    summary: '重点跟踪工具调用、上下文管理、MCP 接入和任务编排，判断哪些模式适合前端团队落地。',
    source: 'Agent Ecosystem',
    href: 'https://modelcontextprotocol.io/',
    time: '12 分钟前',
  },
  {
    topic: '大模型',
    title: '模型迭代重点转向推理、工具使用与成本效率',
    summary: '除了看榜单，更要看模型在真实业务中的延迟、稳定性、调用成本和可接入性。',
    source: 'Model Providers',
    href: 'https://platform.openai.com/docs/overview',
    time: '28 分钟前',
  },
  {
    topic: '科技',
    title: '产品与平台正在把 AI 能力嵌入开发流程本身',
    summary: '观察从代码生成到知识检索、自动测试、文档更新的整链路变化，避免只盯单点功能。',
    source: 'Developer Platforms',
    href: 'https://github.blog/',
    time: '41 分钟前',
  },
  {
    topic: '前端',
    title: '性能与交互体验仍是前端价值判断的主战场',
    summary: '新框架很多，但最终仍要回到 Core Web Vitals、交互延迟和渲染成本这些硬指标。',
    source: 'Web Performance',
    href: 'https://web.dev/explore/learn-performance',
    time: '1 小时前',
  },
  {
    topic: 'AI Agent',
    title: '前端转向 Agent 开发，核心门槛在系统设计而不是 Prompt',
    summary: '能力重点正在转向任务拆解、状态设计、工具边界、评估指标和故障恢复机制。',
    source: 'Agent Engineering',
    href: 'https://platform.openai.com/docs/guides/agents',
    time: '1 小时前',
  },
  {
    topic: '大模型',
    title: 'RAG、长上下文与知识管理逐渐回到“可维护性”问题',
    summary: '不是上下文越长越好，而是知识如何更新、命中、追踪与复用更关键。',
    source: 'LLM Engineering',
    href: 'https://platform.openai.com/docs/guides/retrieval',
    time: '2 小时前',
  },
  {
    topic: '科技',
    title: '开发者工具的竞争点正在从功能堆叠转向工作流整合',
    summary: '真正有价值的产品，不是多一个按钮，而是能否嵌进团队现有研发流程。',
    source: 'Tooling Landscape',
    href: 'https://vercel.com/blog',
    time: '2 小时前',
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
        <p className="max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-400">
          以滚动卡片持续追踪关键信号，不做展开阅读；每条信息支持直接复制，也保留原文跳转，方便继续深挖。
        </p>
      </div>

      <SignalStream items={signals} />
    </section>
  );
}
