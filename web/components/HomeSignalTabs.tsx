'use client';

import { useState } from 'react';
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

  return (
    <section className="mt-2">
      <div className="mb-5 border-b border-gray-200 dark:border-gray-800">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">内容分区</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist" aria-label="首页内容切换">
          <button
            type="button"
            role="tab"
            id="home-tab-live"
            aria-selected={activeTab === 'live'}
            aria-controls="home-panel-live"
            onClick={() => setActiveTab('live')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeTab === 'live'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            7×24 小时资讯
          </button>
          <button
            type="button"
            role="tab"
            id="home-tab-daily"
            aria-selected={activeTab === 'daily'}
            aria-controls="home-panel-daily"
            onClick={() => setActiveTab('daily')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeTab === 'daily'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            每日精选
          </button>
        </div>
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
    </section>
  );
}

