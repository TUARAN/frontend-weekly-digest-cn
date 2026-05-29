'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import type { WeeklyTimeEntry } from '@/lib/weekly-time';

interface WeeklyCreationCalendarProps {
  entries: WeeklyTimeEntry[];
}

function levelClass(count: number): string {
  if (count >= 2) return 'bg-emerald-600 dark:bg-emerald-500';
  if (count === 1) return 'bg-emerald-400 dark:bg-emerald-400';
  return 'bg-gray-200 dark:bg-gray-800';
}

function toDateInputValue(isoDate: string): string {
  return isoDate;
}

export default function WeeklyCreationCalendar({ entries }: WeeklyCreationCalendarProps) {
  const [query, setQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const years = useMemo(
    () =>
      Array.from(new Set(entries.map((entry) => entry.year)))
        .sort((a, b) => b - a)
        .map((year) => String(year)),
    [entries]
  );

  const selectedHeatmapYear = Number(yearFilter === 'all' ? years[0] : yearFilter);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromMs = fromDate ? Date.parse(fromDate) : null;
    const toMs = toDate ? Date.parse(toDate) : null;

    return entries.filter((entry) => {
      if (yearFilter !== 'all' && String(entry.year) !== yearFilter) return false;
      if (monthFilter !== 'all' && String(entry.startMonth) !== monthFilter) return false;
      if (q) {
        const text = `${entry.slug} ${entry.title} ${entry.dateLabel}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      const startMs = Date.parse(entry.startDate);
      if (fromMs !== null && startMs < fromMs) return false;
      if (toMs !== null && startMs > toMs) return false;
      return true;
    });
  }, [entries, query, yearFilter, monthFilter, fromDate, toDate]);

  const dateCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of entries) {
      if (entry.year !== selectedHeatmapYear) continue;
      map.set(entry.startDate, (map.get(entry.startDate) ?? 0) + 1);
    }
    return map;
  }, [entries, selectedHeatmapYear]);

  const heatmapColumns = useMemo(() => {
    if (!selectedHeatmapYear) return [];

    const yearStart = new Date(Date.UTC(selectedHeatmapYear, 0, 1));
    const yearEnd = new Date(Date.UTC(selectedHeatmapYear, 11, 31));
    const firstGridDay = new Date(yearStart);
    firstGridDay.setUTCDate(firstGridDay.getUTCDate() - firstGridDay.getUTCDay());

    const columns: Array<Array<{ iso: string; inYear: boolean; count: number }>> = [];
    const cursor = new Date(firstGridDay);

    while (cursor <= yearEnd || cursor.getUTCDay() !== 0) {
      const week: Array<{ iso: string; inYear: boolean; count: number }> = [];
      for (let i = 0; i < 7; i++) {
        const iso = cursor.toISOString().slice(0, 10);
        const inYear = cursor.getUTCFullYear() === selectedHeatmapYear;
        week.push({
          iso,
          inYear,
          count: inYear ? dateCountMap.get(iso) ?? 0 : 0,
        });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
      columns.push(week);
      if (cursor > yearEnd && cursor.getUTCDay() === 0) break;
    }

    return columns;
  }, [selectedHeatmapYear, dateCountMap]);

  const latest = entries[0];
  const coveredYears = years.length;

  return (
    <div className="container mx-auto px-4 py-10 md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Knowledge Base</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">创作日历</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">按时间观察周刊创作节奏，支持热力图和时间维度检索。</p>
          </div>
          <Link
            href="/weekly"
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            返回知识库
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="总期数" value={`${entries.length}`} helper="周刊总量" />
          <StatCard label="覆盖年份" value={`${coveredYears}`} helper={years.map((year) => `${year}年`).join(' · ')} />
          <StatCard label="最新一期" value={latest ? `#${latest.slug}` : '-'} helper={latest ? latest.dateLabel : '暂无数据'} />
          <StatCard label="筛选结果" value={`${filtered.length}`} helper="当前检索命中" />
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/70">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">创作热力图（GitHub 风格）</h2>
            <div className="text-xs text-gray-500 dark:text-gray-400">按每期起始日期计数</div>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-300">年份</label>
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="all">最新年份</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year} 年
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-flex min-w-full gap-1">
              {heatmapColumns.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      title={`${day.iso} · ${day.count} 期`}
                      className={`h-3.5 w-3.5 rounded-[2px] ${day.inYear ? levelClass(day.count) : 'bg-transparent'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>少</span>
            <span className="h-3.5 w-3.5 rounded-[2px] bg-gray-200 dark:bg-gray-800" />
            <span className="h-3.5 w-3.5 rounded-[2px] bg-emerald-400 dark:bg-emerald-400" />
            <span className="h-3.5 w-3.5 rounded-[2px] bg-emerald-600 dark:bg-emerald-500" />
            <span>多</span>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/70">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">时间维度检索</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="关键词（标题/期号）"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />

            <select
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="all">全部月份</option>
              {Array.from({ length: 12 }).map((_, idx) => (
                <option key={idx + 1} value={String(idx + 1)}>
                  {idx + 1} 月
                </option>
              ))}
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              max={toDate || undefined}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />

            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              min={fromDate || undefined}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />

            <button
              type="button"
              onClick={() => {
                setQuery('');
                setYearFilter('all');
                setMonthFilter('all');
                setFromDate('');
                setToDate('');
              }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
            >
              重置筛选
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 dark:bg-gray-900/70 dark:text-gray-400">
              <span className="col-span-2">期号</span>
              <span className="col-span-4">标题</span>
              <span className="col-span-3">时间区间</span>
              <span className="col-span-3">开始日期</span>
            </div>
            <div>
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">当前筛选无结果。</p>
              ) : (
                filtered.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/weekly/${entry.slug}`}
                    className="grid grid-cols-12 items-center border-t border-gray-100 px-4 py-3 text-sm transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/60"
                  >
                    <span className="col-span-2 font-medium text-gray-800 dark:text-gray-200">#{entry.slug}</span>
                    <span className="col-span-4 truncate text-gray-700 dark:text-gray-300">{entry.title}</span>
                    <span className="col-span-3 text-gray-500 dark:text-gray-400">{entry.dateLabel}</span>
                    <span className="col-span-3 text-gray-500 dark:text-gray-400">{toDateInputValue(entry.startDate)}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/70">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{helper}</p>
    </div>
  );
}

