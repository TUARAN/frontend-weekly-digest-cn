import Link from 'next/link';
import {
  FileText,
  Languages,
  BookOpen,
  ArrowRight,
  CalendarDays,
} from 'lucide-react';
import AiDailyBoard from '@/components/AiDailyBoard';
import LiveSignalBoard from '@/components/LiveSignalBoard';
import { getAllWeeklies } from '@/lib/weekly';
import { getAiHotFeed } from '@/lib/ai-hot-feed';

export const metadata = {
  description:
    '每日精选 AI Coding / Agent / 大模型动态，每周沉淀一份前端周刊。不做信息搬运，只做信号筛选。',
};

const moreFormats = [
  {
    icon: <FileText className="h-4 w-4" />,
    accent: 'text-orange-600 dark:text-orange-400',
    eyebrow: '每日速递',
    title: '短文速递 · 24h 快讯',
    desc: '300-500 字，每日 1-3 条。把关键信号转成中文判断，适合快速浏览和转发。',
  },
  {
    icon: <Languages className="h-4 w-4" />,
    accent: 'text-violet-600 dark:text-violet-400',
    eyebrow: '每周精译',
    title: '中文精译 · 优质长文翻译',
    desc: '1500-3000 字，每周 2-3 篇。重写标题、结构和表达，读起来像中文作者写的。',
  },
  {
    icon: <BookOpen className="h-4 w-4" />,
    accent: 'text-amber-600 dark:text-amber-400',
    eyebrow: '月度深读',
    title: '长文深读 · 论文级解读',
    desc: '5000+ 字，每月 1-2 篇。补足背景、画出技术关系图，给出明确行动建议。',
  },
];

export default function AiRadarHome() {
  const weeklies = getAllWeeklies();
  const [featured, ...rest] = weeklies;
  const recent = rest.slice(0, 3);
  const feed = getAiHotFeed();

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl">
        {/* ── Hero ── */}
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white md:text-4xl">
            站在前沿端点，
            <span className="text-blue-600 dark:text-blue-400">每周看世界所发生的变化</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            7×24 小时实时资讯，每日精选 AI Coding / Agent / 大模型动态，每周沉淀一份前端周刊。不做信息搬运，只做信号筛选——不求多，有一条能给你一点启发就够。
          </p>
        </header>

        {/* ── 7×24 小时资讯 ── */}
        <section>
          <LiveSignalBoard items={feed.items} updatedAt={feed.updatedAt} />
        </section>

        {/* ── 每日精选 ── */}
        <section className="mt-16">
          <AiDailyBoard />
        </section>

        {/* ── 更多内容形态：短文 / 中文 / 长文 ── */}
        <section className="mt-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            更多内容形态
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {moreFormats.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${f.accent}`}>
                  {f.icon}
                  {f.eyebrow}
                </p>
                <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 本周精选 ── */}
        {featured && (
          <section className="mt-16">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                  本周精选
                </p>
                <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  前端周刊 · 每周一份精选
                </h2>
              </div>
              <Link
                href="/weekly"
                className="hidden shrink-0 items-center gap-1 text-sm font-medium text-blue-600 transition hover:gap-2 dark:text-blue-400 sm:flex"
              >
                查看全部 {weeklies.length} 期
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* 最新一期：突出展示 */}
            <Link
              href={`/weekly/${featured.slug}`}
              className="group block overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition hover:shadow-md dark:border-blue-900/40 dark:from-blue-950/30 dark:to-gray-950 md:p-8"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
                <CalendarDays className="h-3.5 w-3.5" />
                最新一期
              </span>
              <h3 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {featured.title}
              </h3>
              {featured.date && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{featured.date}</p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition group-hover:gap-2 dark:text-blue-400">
                阅读本期
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            {/* 近期几期 */}
            {recent.length > 0 && (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {recent.map((w) => (
                  <Link
                    key={w.slug}
                    href={`/weekly/${w.slug}`}
                    className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {w.title}
                      </h3>
                      {w.date && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{w.date}</p>
                      )}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition group-hover:gap-2 dark:text-blue-400">
                      阅读
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/weekly"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:gap-2 dark:text-blue-400 sm:hidden"
            >
              查看全部 {weeklies.length} 期
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
