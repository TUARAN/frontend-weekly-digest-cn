'use client';

import { ReactNode, useCallback, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PageDefinition {
  key: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface Props {
  pages: PageDefinition[];
  /** 额外的 header 右侧插槽（如外部链接） */
  headerExtra?: ReactNode;
}

export default function PageCarousel({ pages, headerExtra }: Props) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const containerRef = useRef<HTMLDivElement>(null);

  const total = pages.length;

  const goTo = useCallback(
    (index: number, dir: 'left' | 'right') => {
      if (animating || index < 0 || index >= total || index === current) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 150);
    },
    [animating, current, total],
  );

  const goNext = () => goTo(current + 1, 'right');
  const goPrev = () => goTo(current - 1, 'left');

  const page = pages[current];

  return (
    <section className="mb-14">
      {/* ── 页面导航 Tab 栏 ── */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
        {pages.map((p, i) => (
          <button
            key={p.key}
            onClick={() => goTo(i, i > current ? 'right' : 'left')}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              i === current
                ? 'bg-gray-900 text-white shadow dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {p.icon}
            {p.label}
          </button>
        ))}

        {headerExtra && <div className="ml-auto shrink-0">{headerExtra}</div>}
      </div>

      {/* ── 内容区域 + 翻页箭头 ── */}
      <div className="relative">
        {/* 左箭头 */}
        {current > 0 && (
          <button
            onClick={goPrev}
            className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-500 shadow-md transition hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200 lg:flex"
            aria-label="上一页"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* 右箭头 */}
        {current < total - 1 && (
          <button
            onClick={goNext}
            className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-500 shadow-md transition hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200 lg:flex"
            aria-label="下一页"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* 页面内容（带进出动画） */}
        <div
          ref={containerRef}
          className="overflow-hidden"
          style={{ minHeight: '200px', overscrollBehaviorX: 'none' }}
        >
          <div
            key={page.key}
            className={`transition-all duration-200 ${
              animating
                ? direction === 'right'
                  ? '-translate-x-6 opacity-0'
                  : 'translate-x-6 opacity-0'
                : 'translate-x-0 opacity-100'
            }`}
          >
            {page.content}
          </div>
        </div>
      </div>

      {/* ── 页面圆点指示器 + 页码 ── */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-25 dark:border-gray-700 dark:text-gray-500 dark:hover:border-gray-500 dark:hover:text-gray-300 lg:hidden"
          aria-label="上一页"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {pages.map((p, i) => (
            <button
              key={p.key}
              onClick={() => goTo(i, i > current ? 'right' : 'left')}
              className={`rounded-full transition-all ${
                i === current
                  ? 'h-2.5 w-8 bg-blue-500'
                  : 'h-2.5 w-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
              }`}
              aria-label={p.label}
            />
          ))}
        </div>
        <span className="text-xs tabular-nums text-gray-400">
          {current + 1}/{total}
        </span>

        <button
          onClick={goNext}
          disabled={current >= total - 1}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-25 dark:border-gray-700 dark:text-gray-500 dark:hover:border-gray-500 dark:hover:text-gray-300 lg:hidden"
          aria-label="下一页"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
