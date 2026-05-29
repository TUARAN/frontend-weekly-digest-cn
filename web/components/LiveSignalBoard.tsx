'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Radio } from 'lucide-react';

interface SignalItem {
  topic: string;
  title: string;
  summary: string;
  source: string;
  href: string;
  publishedAt?: string | null;
}

interface FeedPayload {
  updatedAt: string;
  count: number;
  items: SignalItem[];
}

const POLL_MS = 30 * 60 * 1000; // 30 分钟

function relativeTime(iso?: string | null): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} 天前`;
  return new Date(t).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

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
            {item.publishedAt && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{relativeTime(item.publishedAt)}</span>
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

function SignalStream({ items }: { items: SignalItem[] }) {
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

export default function LiveSignalBoard() {
  const [items, setItems] = useState<SignalItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const res = await fetch(`/ai-hot-feed.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: FeedPayload = await res.json();
        if (!alive) return;
        setItems(Array.isArray(data.items) ? data.items : []);
        setUpdatedAt(data.updatedAt ?? null);
        setStatus('ready');
      } catch {
        if (alive) setStatus((s) => (s === 'ready' ? 'ready' : 'error'));
      }
    };

    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

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
            AI、Agent、前端、科技实时播报 · 每 30 分钟自动抓取
          </p>
        </div>
        {updatedAt && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            最近更新 {relativeTime(updatedAt)}
          </span>
        )}
      </div>

      {status === 'loading' && items.length === 0 && (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">资讯加载中...</div>
      )}
      {status === 'error' && items.length === 0 && (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">暂时无法加载资讯，请稍后再试</div>
      )}
      {items.length > 0 && <SignalStream items={items} />}
    </section>
  );
}
