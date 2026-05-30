import { getAllWeeklies } from '@/lib/weekly';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import WeeklyKnowledgeBase from '@/components/WeeklyKnowledgeBase';
import { getWeeklyTimeEntries } from '@/lib/weekly-time';
import { buildBrandUrl } from '@/lib/site-matrix';

export default function WeeklyIndexPage() {
  const weeklies = getAllWeeklies();
  const timeEntries = getWeeklyTimeEntries();

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">原·前端周刊</h1>
            <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
              这里保留原有周刊内容，并继续按周固定更新。你可以在这里按关键词搜索、按时间筛选，或通过创作日历观察更新节奏。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={buildBrandUrl('/')}
              className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300"
            >
              返回主站 frontendnext.com
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/weekly/calendar"
              className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300"
            >
              创作日历
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tool"
              className="inline-flex items-center gap-2 self-start rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-900 transition-all hover:border-gray-400 dark:border-gray-700 dark:text-gray-100"
            >
              周刊工作台
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <WeeklyKnowledgeBase weeklies={weeklies} timeEntries={timeEntries} />
      </div>
    </div>
  );
}
