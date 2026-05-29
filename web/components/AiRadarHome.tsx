import Link from 'next/link';
import { ArrowRight, CalendarDays, Map } from 'lucide-react';
import AiDailyBoard from '@/components/AiDailyBoard';
import LiveSignalBoard from '@/components/LiveSignalBoard';
import { getAllWeeklies } from '@/lib/weekly';
import { getAiHotFeed } from '@/lib/ai-hot-feed';
import { getDailyManifest, getLatestDaily } from '@/lib/ai-daily';

export const metadata = {
  description:
    '每日精选 AI Coding / Agent / 大模型动态，每周沉淀一份前端周刊。不做信息搬运，只做信号筛选。',
};

export default function AiRadarHome() {
  const weeklies = getAllWeeklies();
  const [featured, ...rest] = weeklies;
  const recent = rest.slice(0, 3);
  const feed = getAiHotFeed();
  const dailyManifest = getDailyManifest();
  const latestDaily = getLatestDaily();

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        {/* ── Hero ── */}
        <header className="mb-8 md:mb-10">
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-3xl md:text-4xl">
            站在前沿端点，
            <span className="text-blue-600 dark:text-blue-400">每周看世界所发生的变化</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-6 text-gray-500 dark:text-gray-400 md:text-sm">
            7×24 小时实时资讯，每日精选 AI Coding / Agent / 大模型动态，每周沉淀一份前端周刊。不做信息搬运，只做信号筛选——不求多，有一条能给你一点启发就够。
          </p>
        </header>

        {/* ── 1. 资讯：7×24 实时 ── */}
        <section id="live" className="scroll-mt-32 md:scroll-mt-20">
          <LiveSignalBoard items={feed.items} updatedAt={feed.updatedAt} />
        </section>

        {/* ── 2. 每日精选 ── */}
        <section id="daily" className="mt-10 scroll-mt-32 md:mt-16 md:scroll-mt-20">
          <AiDailyBoard manifest={dailyManifest.list} initial={latestDaily} />
        </section>

        {/* ── 3. 周刊 ── */}
        {featured && (
          <section id="weekly" className="mt-10 scroll-mt-32 md:mt-16 md:scroll-mt-20">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 md:text-sm">
                  本周周刊
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl md:text-3xl">
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

        {/* ── 4. 转型路线入口 ── */}
        <section className="mt-10 md:mt-16">
          <Link
            href="/roadmap"
            className="group flex flex-col gap-4 rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:from-gray-900 dark:to-gray-950 md:flex-row md:items-center md:justify-between md:p-8"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                <Map className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                  Roadmap
                </p>
                <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                  前端 → AI Agent 转型路线图
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  一张为 3-5 年前端打造的能力地图，把"写组件"到"构建 Agent"拆成可执行阶段。
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 transition group-hover:gap-2 dark:text-blue-400">
              查看路线图
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}
