'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Download, Share2, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import DailyCard from '@/components/DailyCard';
import type { DailyData, DailyMeta } from '@/lib/ai-daily';

interface AiDailyBoardProps {
  manifest: DailyMeta[];
  initial: DailyData | null;
}

export default function AiDailyBoard({ manifest, initial }: AiDailyBoardProps) {
  const list = manifest;
  const tabs = [
    { key: 'card', label: '精选卡片' },
    { key: 'highlights', label: '本期摘要' },
  ] as const;
  type TabKey = (typeof tabs)[number]['key'];
  const [cache, setCache] = useState<Record<string, DailyData>>(
    initial ? { [initial.date]: initial } : {},
  );
  const [index, setIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('card');
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
      await navigator.clipboard.writeText(shareUrl);
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

  if (total === 0 || !meta) {
    return (
      <section>
        <HeaderStrip onExport={handleExport} onShare={handleShare} exporting={exporting} sharing={sharing} hasContent={false} />
        <div className="flex h-80 flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
          <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-400">每日精选即将上线，敬请期待</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <HeaderStrip onExport={handleExport} onShare={handleShare} exporting={exporting} sharing={sharing} hasContent={!!data} />

      <div className="mb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                aria-selected={isActive}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 日期导航 */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={goPrev}
          disabled={index >= total - 1}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-25 dark:border-gray-700 dark:text-gray-500"
          aria-label="更早一期"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex flex-1 items-center gap-2 overflow-hidden">
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

      {activeTab === 'card' ? (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex justify-center overflow-x-auto p-4 sm:p-6">
            {data ? (
              <div className="overflow-hidden rounded-2xl">
                <DailyCard ref={cardRef} data={data} />
              </div>
            ) : (
              <div className="flex h-[600px] w-[500px] max-w-full items-center justify-center text-sm text-gray-400">
                加载中...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">本期摘要</p>
          <ul className="mt-4 space-y-3">
            {meta.highlights.map((h, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                  {i + 1}
                </span>
                <span className="text-sm leading-6 text-gray-600 dark:text-gray-300">{h}</span>
              </li>
            ))}
          </ul>

          {data && data.items.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">条目速览</p>
              <ul className="mt-3 space-y-2">
                {data.items.map((item) => (
                  <li key={item.num} className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      {item.topic}
                    </span>
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {total > 1 && (
            <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                共 <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span> 期 · 左右箭头切换
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function HeaderStrip({
  onExport,
  onShare,
  exporting,
  sharing,
  hasContent,
}: {
  onExport: () => void;
  onShare: () => void;
  exporting: boolean;
  sharing: boolean;
  hasContent: boolean;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">AI Daily</p>
        <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">每日精选</h2>
        <p className="mt-1.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
          精选 AI Coding &amp; 具身智能最新动态 · 每日 09:00 自动更新
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          自动同步中
        </span>
        {hasContent && (
          <>
            <button
              onClick={onShare}
              disabled={sharing}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {sharing ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
              {sharing ? '已复制' : '分享'}
            </button>
            <button
              onClick={onExport}
              disabled={exporting}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? '导出中...' : '导出图片'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
