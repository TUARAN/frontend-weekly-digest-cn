import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { WeeklyPost } from '@/lib/weekly';

interface WeeklyCardProps {
  post: WeeklyPost;
}

export default function WeeklyCard({ post }: WeeklyCardProps) {
  // Extract a brief summary or description if possible, otherwise just show title
  // For now, we just show title and a "Read more" link
  
  return (
    <Link 
      href={`/weekly/${post.slug}`}
      className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-900"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            第 {post.slug} 期
          </span>
          {post.date && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="mr-1 h-3 w-3" />
              {post.date}
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">
          {post.title}
        </h3>
        
        <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
          阅读周刊
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
