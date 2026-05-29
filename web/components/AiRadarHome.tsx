import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Newspaper,
  QrCode,
  Radio,
} from 'lucide-react';
import HomeSignalTabs from '@/components/HomeSignalTabs';
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
  const boardCards = [
    {
      href: '#live',
      icon: Radio,
      label: '7×24 资讯',
      value: `${feed.items.length} 条`,
      desc: '实时捕捉 AI、Agent、前端和科技信号。',
    },
    {
      href: '#daily',
      icon: Newspaper,
      label: '每日精选',
      value: dailyManifest.latest ? dailyManifest.latest.slice(5) : '09:00',
      desc: '每天把噪音过滤成少量值得看的判断。',
    },
    {
      href: '#plan',
      icon: ClipboardList,
      label: '计划',
      value: '5 阶段',
      desc: '从信息摄入落到前端转 AI Agent 的行动路线。',
    },
    {
      href: '#contact',
      icon: QrCode,
      label: '二维码',
      value: '扫码',
      desc: '获取更新、联系作者或咨询 1v1。',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl">
        {/* ── Hero ── */}
        <header className="mb-10 overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Frontend Weekly Radar</p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white md:text-5xl">
                一个看板，串起资讯、精选、计划和联系入口
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400 md:text-base">
                先看 7×24 实时信号，再读每日精选判断；如果想把信息变成行动，就进入转型计划，最后通过二维码获取更新或联系作者。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#live"
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  进入看板
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/roadmap"
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-100"
                >
                  查看计划
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {boardCards.map(({ href, icon: Icon, label, value, desc }) => (
                <Link
                  key={label}
                  href={href}
                  className="group rounded-3xl border border-gray-200 bg-gray-50 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900/60 dark:hover:bg-blue-950/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-gray-950 dark:text-blue-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">{value}</span>
                  </div>
                  <h2 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">{label}</h2>
                  <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </header>

        <HomeSignalTabs
          feedItems={feed.items}
          feedUpdatedAt={feed.updatedAt}
          dailyManifest={dailyManifest.list}
          latestDaily={latestDaily}
        />

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
