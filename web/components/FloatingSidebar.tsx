'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, List, History } from 'lucide-react';
import { WeeklyPost } from '@/lib/weekly';
import { cn } from '@/lib/utils';

export default function FloatingSidebar({ weeklies }: { weeklies: WeeklyPost[] }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <div 
        className={cn(
          "relative flex flex-col rounded-2xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur-md transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) dark:border-gray-800 dark:bg-gray-950/95 overflow-hidden",
          isOpen ? "w-36" : "w-12"
        )}
      >
        {/* Header / Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 outline-none",
            isOpen ? "h-10 justify-between px-3 border-b border-gray-100 dark:border-gray-800" : "h-12 justify-center"
          )}
          aria-label={isOpen ? "收起导航" : "展开导航"}
        >
           {isOpen ? (
             <>
               <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                 <History className="h-4 w-4" />
                 <span>导航</span>
               </div>
               <ChevronRight className="h-4 w-4 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200" />
             </>
           ) : (
             <History className="h-5 w-5 text-gray-600 dark:text-gray-400" />
           )}
        </button>

        {/* List */}
        <div className={cn(
          "transition-all duration-500 ease-in-out bg-transparent",
          isOpen ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="overflow-y-auto max-h-[60vh] p-2 custom-scrollbar">
            <ul className="space-y-1">
              {weeklies.map((post) => (
                <li key={post.slug}>
                  <Link 
                    href={`/weekly/${post.slug}`}
                    className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="font-medium">第 {post.slug} 期</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
