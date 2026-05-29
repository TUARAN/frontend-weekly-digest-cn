'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Newspaper, QrCode, Radio } from 'lucide-react';
import AiDailyBoard from '@/components/AiDailyBoard';
import LiveSignalBoard from '@/components/LiveSignalBoard';
import type { FeedItem } from '@/lib/ai-hot-feed';
import type { DailyData, DailyMeta } from '@/lib/ai-daily';

interface HomeSignalTabsProps {
  feedItems: FeedItem[];
  feedUpdatedAt?: string | null;
  dailyManifest: DailyMeta[];
  latestDaily: DailyData | null;
}

export default function HomeSignalTabs({
  feedItems,
  feedUpdatedAt,
  dailyManifest,
  latestDaily,
}: HomeSignalTabsProps) {
  const [activeTab, setActiveTab] = useState<'live' | 'daily'>('live');
  const latestDailyMeta = dailyManifest[0] ?? null;
  const dashboardTabs = [
    {
      key: 'live',
      label: '7×24 资讯',
      description: `${feedItems.length} 条实时信号`,
      icon: Radio,
    },
    {
      key: 'daily',
      label: '每日精选',
      description: latestDailyMeta ? `${latestDailyMeta.displayDate} · ${latestDailyMeta.count} 条` : '每日 09:00 更新',
      icon: Newspaper,
    },
  ] as const;

  useEffect(() => {
    const syncTabWithHash = () => {
      if (window.location.hash === '#daily') setActiveTab('daily');
      if (window.location.hash === '#live') setActiveTab('live');
    };
    syncTabWithHash();
    window.addEventListener('hashchange', syncTabWithHash);
    return () => window.removeEventListener('hashchange', syncTabWithHash);
  }, []);

  return (
    <section className="mt-8" aria-label="首页情报看板">
      <div id="live" className="scroll-mt-28 md:scroll-mt-24" />
      <div id="daily" className="scroll-mt-28 md:scroll-mt-24" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div
            className="mb-5 grid gap-3 rounded-[2rem] border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:grid-cols-2"
            role="tablist"
            aria-label="首页内容切换"
          >
            {dashboardTabs.map(({ key, label, description, icon: Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`home-tab-${key}`}
                  aria-selected={isActive}
                  aria-controls={`home-panel-${key}`}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-3 rounded-[1.5rem] p-4 text-left transition ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-950'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isActive
                        ? 'bg-white/15 text-white dark:bg-gray-950/10 dark:text-gray-950'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{label}</span>
                    <span className={`mt-1 block text-xs ${isActive ? 'text-white/70 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                      {description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {activeTab === 'live' ? (
            <div id="home-panel-live" role="tabpanel" aria-labelledby="home-tab-live">
              <LiveSignalBoard items={feedItems} updatedAt={feedUpdatedAt} />
            </div>
          ) : (
            <div id="home-panel-daily" role="tabpanel" aria-labelledby="home-tab-daily">
              <AiDailyBoard manifest={dailyManifest} initial={latestDaily} />
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div id="plan" className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm dark:border-blue-900/40 dark:from-blue-950/30 dark:via-gray-950 dark:to-indigo-950/30">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">Plan</p>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">前端转 AI Agent 路线</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
              把「要不要转」「学什么」「做出什么作品」拆成 5 个阶段，作为每日信息之外的行动地图。
            </p>
            <Link
              href="/roadmap"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              查看计划
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div id="contact" className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white dark:bg-white dark:text-gray-950">
                <QrCode className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">QR Code</p>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">扫码获取更新</h2>
              </div>
            </div>
            <div className="mt-5 rounded-3xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/qrcode1.jpg" alt="前端周看二维码" className="mx-auto aspect-square w-40 rounded-2xl bg-white object-cover p-2" />
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
              关注后获取每日精选、路线图更新和周刊推送；需要 1v1 也可以直接留言。
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
