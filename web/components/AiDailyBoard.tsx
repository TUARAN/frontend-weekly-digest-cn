'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Download, Share2, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import DailyCard from '@/components/DailyCard';
import type { DailyData, DailyItem, DailyMeta } from '@/lib/ai-daily';

interface AiDailyBoardProps {
  manifest: DailyMeta[];
  initial: DailyData | null;
}

const TOPIC_STYLE: Record<string, { accent: string; chip: string; chipText: string; bar: string }> = {
  '具身智能': {
    accent: '#10b981',
    chip: 'bg-emerald-50 dark:bg-emerald-900/20',
    chipText: 'text-emerald-700 dark:text-emerald-300',
    bar: 'bg-emerald-500',
  },
  default: {
    accent: '#3b82f6',
    chip: 'bg-blue-50 dark:bg-blue-900/20',
    chipText: 'text-blue-700 dark:text-blue-300',
    bar: 'bg-blue-500',
  },
};

function topicStyle(topic: string) {
  return TOPIC_STYLE[topic] ?? TOPIC_STYLE.default;
}

function ItemCard({ item }: { item: DailyItem }) {
  const s = topicStyle(item.topic);
  return (
    <article className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700">
      <span className={`absolute left-0 top-5 bottom-5 w-0.5 rounded-r ${s.bar}`} aria-hidden />
      <div className="mb-2 flex items-center gap-2 pl-2">
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${s.chip} ${s.chipText}`}>
          {item.num}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.chip} ${s.chipText}`}>
          {item.topic}
        </span>
      </div>
      <h3 className="pl-2 text-base font-semibold leading-6 text-gray-900 dark:text-white">{item.title}</h3>
      {item.summary && (
        <p className="mt-2 pl-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{item.summary}</p>
      )}
      {item.reason && (
        <p className="mt-3 ml-2 flex gap-1.5 rounded-lg border border-amber-200/60 bg-amber-50/60 px-3 py-2 text-xs italic leading-5 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300/90">
          <span className="shrink-0">→</span>
          <span>{item.reason}</span>
        </p>
      )}
    </article>
  );
}

export default function AiDailyBoard({ manifest, initial }: AiDailyBoardProps) {
  const list = manifest;
  const [cache, setCache] = useState<Record<string, DailyData>>(
    initial ? { [initial.date]: initial } : {},
  );
  const [index, setIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const total = list.length;
  const meta = list[index] ?? null;
  const data = meta ? cache[meta.date] ?? null : null;
  const isLatest = index === 0;

  useEffect(() => {
    if (!meta || cache[meta.date]) return;
    let alive = true;
    fetch(`/ai-daily/${meta.date}.json`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: DailyData | null) => {
        if (alive && d) setCache((c) => ({ ...c, [d.date]: d }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [meta, cache]);

  const goPrev = useCallback(() => setIndex((p) => Math.min(p + 1, total - 1)), [total]);
  const goNext = useCallback(() => setIndex((p) => Math.max(p - 1, 0)), []);

  const handleExport = async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0d0d12',
        width: 500,
        height: cardRef.current.scrollHeight,
      });
      const link = document.createElement('a');
      link.download = `前端周看-每日精选-${meta?.date ?? ''}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败，请稍后重试');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!meta || sharing) return;
    const shareUrl = `${window.location.origin}/share/ai-daily?date=${meta.date}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `每日精选 · ${meta.displayDate}`,
          text: meta.highlights.slice(0, 1).join('；') || '前端周看每日精选',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setSharing(true);
    setTimeout(() => setSharing(false), 2000);
  };

  return (
    <section className="mx-auto max-w-6xl rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm dark:border-gray-800 dark:from-gray-950 dark:to-gray-900 sm:rounded-3xl sm:p-8">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 md:text-sm">
            AI DAILY
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl md:text-3xl">
            每日精选
          </h2>
          <p className="mt-1.5 text-[13px] leading-6 text-gray-500 dark:text-gray-400 md:text-sm">
            精选 AI Coding &amp; 具身智能最新动态 · 每日 09:00 自动更新
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            自动同步中
          </span>
          {data && (
            <>
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {sharing ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                {sharing ? '已复制' : '分享'}
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                title="导出为竖版海报图片，便于在社交平台分享"
              >
                <Download className="h-3.5 w-3.5" />
                {exporting ? '导出中...' : '导出海报'}
              </button>
            </>
          )}
        </div>
      </div>

      {total === 0 || !meta ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30">
          <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-400">每日精选即将上线，敬请期待</p>
        </div>
      ) : (
        <>
          {/* 日期导航 */}
          <div className="mb-5 flex items-center gap-3 border-y border-gray-200 py-3 dark:border-gray-800">
            <button
              onClick={goPrev}
              disabled={index >= total - 1}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-25 dark:border-gray-700 dark:text-gray-500"
              aria-label="更早一期"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex flex-1 flex-wrap items-center gap-2 overflow-hidden">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{meta.displayDate}</span>
              {isLatest && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  最新
                </span>
              )}
              <span className="text-xs text-gray-400">
                {meta.count} 条精选{total > 1 && ` · ${index + 1}/${total}`}
              </span>
              {total > 1 && (
                <div className="ml-auto flex gap-1">
                  {list.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`rounded-full transition-all ${
                        i === index ? 'h-1.5 w-5 bg-blue-500' : 'h-1.5 w-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600'
                      }`}
                      aria-label={`第 ${i + 1} 期`}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={goNext}
              disabled={index <= 0}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-25 dark:border-gray-700 dark:text-gray-500"
              aria-label="更新一期"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* TL;DR 摘要 */}
          {meta.highlights.length > 0 && (
            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 dark:border-blue-900/30 dark:bg-blue-950/20 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                TL;DR · 本期速读
              </p>
              <ul className="mt-3 space-y-2">
                {meta.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-6 text-gray-700 dark:text-gray-300">
                    <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 内容主体 - 响应式网格 */}
          {data ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.items.map((item) => (
                <ItemCard key={item.num} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">加载中...</div>
          )}
        </>
      )}

      {/* 离屏渲染：用于导出海报 PNG */}
      {data && (
        <div
          aria-hidden
          className="pointer-events-none fixed -left-[9999px] top-0 opacity-0"
          style={{ zIndex: -1 }}
        >
          <DailyCard ref={cardRef} data={data} />
        </div>
      )}
    </section>
  );
}
