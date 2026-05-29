'use client';

import { useMemo, useState } from 'react';
import { Copy, ExternalLink, Radio } from 'lucide-react';
import type { FeedItem } from '@/lib/ai-hot-feed';

// 固定按 UTC+8 格式化，保证服务端构建与客户端渲染一致（避免水合不匹配）。
function fmtCST(iso?: string | null): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const d = new Date(t + 8 * 60 * 60 * 1000);
  const M = d.getUTCMonth() + 1;
  const D = d.getUTCDate();
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${M}月${D}日 ${h}:${m}`;
}

function SignalCard({ item }: { item: FeedItem }) {
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
            {item.publishedAt && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{fmtCST(item.publishedAt)}</span>
            )}
          </div>
          <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">{item.title}</h3>
        </div>
      </div>

      {item.summary && (
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-gray-600 dark:text-gray-400">{item.summary}</p>
      )}

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

function SignalStream({ items }: { items: FeedItem[] }) {
  // 至少复制一遍以实现无缝循环滚动
  const loopItems = useMemo(() => (items.length > 0 ? [...items, ...items] : []), [items]);

  return (
    <div className="signal-marquee relative h-[640px] overflow-hidden">
      <div className="signal-track">
        {loopItems.map((item, index) => (
          <div key={`${item.href}-${index}`} className="mb-4">
            <SignalCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

interface LiveSignalBoardProps {
  items: FeedItem[];
  updatedAt?: string | null;
}

export default function LiveSignalBoard({ items, updatedAt }: LiveSignalBoardProps) {
  return (
    <section className="mx-auto max-w-6xl rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm dark:border-gray-800 dark:from-gray-950 dark:to-gray-900">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            <Radio className="h-4 w-4" />
            7×24H LIVE
          </p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">7×24 小时资讯</h2>
          <p className="mt-1.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
            AI、Agent、前端、科技实时播报 · 每小时自动更新
          </p>
        </div>
        {updatedAt && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            更新于 {fmtCST(updatedAt)}
          </span>
        )}
      </div>

      {items.length > 0 ? (
        <SignalStream items={items} />
      ) : (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">资讯即将上线，敬请期待</div>
      )}
    </section>
  );
}
