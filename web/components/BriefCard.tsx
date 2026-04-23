import Link from 'next/link';
import { Clock, Lock } from 'lucide-react';
import type { BriefMeta } from '@/lib/briefs';

interface BriefCardProps {
  brief: BriefMeta;
}

export default function BriefCard({ brief }: BriefCardProps) {
  return (
    <Link
      href={`/brief/${brief.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {brief.category}
        </span>
        {brief.pro ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-300">
            <Lock className="h-3 w-3" />
            Pro
          </span>
        ) : null}
      </div>
      <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
        {brief.title}
      </h3>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-gray-600 dark:text-gray-400">{brief.tldr}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
        <span>{brief.date}</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {brief.readMinutes} 分钟
        </span>
      </div>
    </Link>
  );
}
