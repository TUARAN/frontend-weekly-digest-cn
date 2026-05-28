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
    title: 'GPT-5.6 泄露：150 万上下文，6 月上线在即',
    summary: '多名开发者在 OpenAI Codex 后端日志中发现未官宣模型 GPT-5.6，内部代号 iris-alpha，支持 150 万 Token 上下文窗口，较当前版本大幅提升，预计 6 月正式发布。系列还含 ember-alpha、beacon-alpha 等变体版本。',
    source: 'IT之家 / OpenAI',
    href: 'https://news.qq.com/rain/a/20260526A0255700',
    time: '今日',
  },
  {
    topic: 'AI Coding',
    title: 'Antigravity 2.0：93 个 Agent、不到千刀构建完整操作系统',
    summary: 'Google I/O 2026 重磅演示：Antigravity 2.0 编程平台用 93 个子 Agent、耗时 12 小时、花费不到 1000 美元，从零构建了一个完整操作系统。这是 Google 对标 Claude Code 的正面回应。',
    source: 'Google I/O 2026',
    href: 'https://finance.sina.com.cn/wm/2026-05-21/doc-inhysnxc6270970.shtml',
    time: '今日',
  },
  {
    topic: '具身智能',
    title: '宇树科技 6 月 1 日 IPO 上会，募资 42 亿冲 A 股第一股',
    summary: '上交所公告，宇树科技将于 2026 年 6 月 1 日接受科创板上市审核，拟募资 42.02 亿元。2025 年实现营收 16.99 亿元，人形机器人出货量全球第一，上半年营收预计同比增长 35%-45%。',
    source: '上交所 / 同花顺',
    href: 'https://stock.10jqka.com.cn/20260526/c676971235.shtml',
    time: '今日',
  },
  {
    topic: '具身智能',
    title: '2026 世界智能产业博览会今日天津开幕，具身智能首次独立成馆',
    summary: '5 月 28 日，2026 世界智能产业博览会于天津开幕（持续至 31 日），主题"智行天下 能动未来"。具身智能展馆首次独立成馆，宇树、京东等头部企业集体亮相，展览面积 13 万平方米。',
    source: '新华网 / 中新社',
    href: 'https://www.chinanews.com.cn/cj/2026/05-27/10629195.shtml',
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
