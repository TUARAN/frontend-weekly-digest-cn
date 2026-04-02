import WeeklyCard from '@/components/WeeklyCard';
import { getAllWeeklies } from '@/lib/weekly';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function WeeklyIndexPage() {
  const weeklies = getAllWeeklies();

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">原·前端周刊</h1>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
            这里保留原有周刊内容，并继续按周固定更新。
          </p>
          </div>
          <Link
            href="/tool"
            className="inline-flex items-center gap-2 self-start rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-900 transition-all hover:border-gray-400 dark:border-gray-700 dark:text-gray-100"
          >
            周刊工作台
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {weeklies.map((post) => (
            <WeeklyCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
