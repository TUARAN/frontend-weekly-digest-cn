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
    topic: 'AI Agent',
    title: 'Manus 平替工具 AnyGen 发布，支持设计图、视频与多平台 AI 搭档',
    summary: '字节出品的 AnyGen 已支持 Nano Banana 2/Pro 生成设计图，接入 Seedance 2.0 可实测生成 10 秒视频，AI 搭档还能连接 Lark、Telegram 和 Discord。',
    source: 'AnyGen / ByteDance',
    href: 'https://anygen.io/home',
    time: '刚刚',
  },
  {
    topic: 'AI Agent',
    title: 'Claude Code 原理可视化站点上线，Agent Loop 动画讲得很直观',
    summary: '这个交互式网页把 Claude Code 的 agent loop、工具系统和多 Agent 编排拆开讲清楚了，重点是动画和点击式探索明显比 PDF 教程更容易看懂，也更适合反复对照理解。',
    source: 'Claude Code Unpacked',
    href: 'https://ccunpacked-zh.pages.dev/',
    time: '6 分钟前',
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
