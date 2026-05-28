'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface DailyEntry {
  date: string;
  displayDate: string;
  file: string;
  count: number;
  highlights: string[];
}

interface DailyManifest {
  list: DailyEntry[];
  latest: string;
}

export default function AiDailyBoard() {
  const [manifest, setManifest] = useState<DailyManifest | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/ai-daily-manifest.json')
      .then((res) => res.json())
      .then((data: DailyManifest) => {
        // 按日期排序（倒序，最新在前）
        const sorted = [...data.list].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setManifest({ list: sorted, latest: data.latest });
        // 默认选最新一期（index 0）
        setCurrentIndex(0);
      })
      .catch(() => {
        // manifest 不存在或损坏
        setManifest(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ---- 状态判断 ----
  if (loading) {
    return (
      <section className="mb-14">
        <HeaderStrip />
        <div className="flex h-[820px] items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
          <p className="text-sm text-gray-400">加载中...</p>
        </div>
      </section>
    );
  }

  if (!manifest || manifest.list.length === 0) {
    return (
      <section className="mb-14">
        <HeaderStrip />
        <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
          <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-400">早报数据正在赶来...</p>
          <p className="text-xs text-gray-300 dark:text-gray-600">每日 09:00 自动更新，敬请期待</p>
        </div>
      </section>
    );
  }

  const entry = manifest.list[currentIndex];
  const isLatest = entry.date === manifest.latest;
  const total = manifest.list.length;

  return (
    <section className="mb-14">
      <HeaderStrip />

      {/* ── 日期导航条 ── */}
      <div className="mb-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentIndex((p) => Math.min(p + 1, total - 1))}
          disabled={currentIndex >= total - 1}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-400 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200"
          aria-label="更早一期"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex min-w-[240px] flex-col items-center gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {entry.displayDate}
            </span>
            {isLatest && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                最新
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {total > 1 ? `第 ${total - currentIndex}/${total} 期 · ${entry.count} 条精选` : `${entry.count} 条精选`}
          </span>
        </div>

        <button
          onClick={() => setCurrentIndex((p) => Math.max(p - 1, 0))}
          disabled={currentIndex <= 0}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-400 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200"
          aria-label="更新一期"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── 今日摘要速览 ── */}
      <div className="mb-4 flex flex-wrap gap-2">
        {entry.highlights.slice(0, 4).map((h, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              {i + 1}
            </span>
            {h}
          </span>
        ))}
      </div>

      {/* ── 早报 iframe ── */}
      <div className="flex justify-center rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        <iframe
          src={entry.file}
          title={`AI 早报 ${entry.date}`}
          className="rounded-2xl"
          style={{ width: '500px', height: '820px', border: 'none' }}
          scrolling="no"
        />
      </div>
    </section>
  );
}

/** 板块头部 */
function HeaderStrip() {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
          AI Daily
        </p>
        <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          每日 AI 早报
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          精选 AI Coding &amp; 具身智能最新动态，每日 09:00 自动更新
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        自动同步中
      </span>
    </div>
  );
}
