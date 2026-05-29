'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Search, X } from 'lucide-react';
import WeeklyCard from '@/components/WeeklyCard';
import type { WeeklyPost } from '@/lib/weekly';
import type { WeeklyTimeEntry } from '@/lib/weekly-time';

interface WeeklyKnowledgeBaseProps {
  weeklies: WeeklyPost[];
  timeEntries: WeeklyTimeEntry[];
}

export default function WeeklyKnowledgeBase({ weeklies, timeEntries }: WeeklyKnowledgeBaseProps) {
  const [query, setQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  const years = useMemo(
    () =>
      Array.from(new Set(timeEntries.map((entry) => entry.year)))
        .sort((a, b) => b - a)
        .map((year) => String(year)),
    [timeEntries]
  );

  const entryMap = useMemo(() => new Map(timeEntries.map((entry) => [entry.slug, entry])), [timeEntries]);

  const searchable = useMemo(
    () =>
      weeklies.map((post) => ({
        post,
        searchText: `${post.slug} ${post.title} ${post.date} ${post.content.slice(0, 1800)}`.toLowerCase(),
      })),
    [weeklies]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return searchable
      .filter(({ post, searchText }) => {
        if (q && !searchText.includes(q)) return false;
        const t = entryMap.get(post.slug);
        if (!t) return yearFilter === 'all' && monthFilter === 'all';
        if (yearFilter !== 'all' && String(t.year) !== yearFilter) return false;
        if (monthFilter !== 'all' && String(t.startMonth) !== monthFilter) return false;
        return true;
      })
      .map(({ post }) => post);
  }, [searchable, query, entryMap, yearFilter, monthFilter]);

  const hasActiveFilters = query.trim() || yearFilter !== 'all' || monthFilter !== 'all';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/80 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block w-full lg:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题、期号或内容关键词"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </label>

          <select
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="all">全部年份</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year} 年
              </option>
            ))}
          </select>

          <select
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="all">全部月份</option>
            {Array.from({ length: 12 }).map((_, idx) => (
              <option key={idx + 1} value={String(idx + 1)}>
                {idx + 1} 月
              </option>
            ))}
          </select>

          <Link
            href="/weekly/calendar"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300"
          >
            <Calendar className="h-4 w-4" />
            创作日历
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>
            共 <span className="font-semibold text-gray-700 dark:text-gray-200">{weeklies.length}</span> 期
          </span>
          <span>
            当前结果 <span className="font-semibold text-gray-700 dark:text-gray-200">{filtered.length}</span> 期
          </span>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setYearFilter('all');
                setMonthFilter('all');
              }}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
            >
              <X className="h-3 w-3" />
              清除筛选
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
          没有匹配的周刊，试试更短关键词或放宽时间筛选。
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <WeeklyCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

