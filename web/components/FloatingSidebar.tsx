'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, History } from 'lucide-react';
import { WeeklyMenuItem } from '@/lib/weekly';
import { cn } from '@/lib/utils';

const SidebarItem = ({ item, isOpen }: { item: WeeklyMenuItem; isOpen: boolean }) => {
  // Default expand if it's a year (path is #)
  const isYear = item.path === '#';
  const [expanded, setExpanded] = useState(isYear);
  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded(!expanded);
  };

  return (
    <li className="mb-1">
      <div className={cn(
        "flex items-center justify-between rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
        isOpen ? "px-2 py-1.5" : "justify-center py-2"
      )}>
        {isYear ? (
             <div
                className={cn(
                    "flex flex-1 items-center gap-2 overflow-hidden text-left",
                    !isOpen && "justify-center"
                )}
                title={item.title}
            >
                 {!isOpen ? (
                    <span className="text-xs font-bold text-gray-500">
                        {item.title.replace('年', '')}
                    </span>
                 ) : (
                    <span className="truncate text-sm font-bold text-gray-900 dark:text-white">
                        {item.title}
                    </span>
                 )}
            </div>
        ) : (
            <>
            <Link
            href={item.path}
            className={cn(
                "flex flex-1 items-center gap-2 overflow-hidden",
                !isOpen && "justify-center"
            )}
            title={item.title}
            target={item.path.startsWith('http') ? '_blank' : undefined}
            >
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
              {!isOpen ? (
                  <span className="text-xs font-bold text-gray-500">
                  {item.path.split('/')[2] ? `#${item.path.split('/')[2]}` : ''}
                  </span>
              ) : (
                  <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                    {item.title}
                  </span>
              )}
            </div>
            </Link>
            
            {hasChildren && isOpen && (
              <div 
                className="ml-1 shrink-0 cursor-pointer rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
            )}
            </>
        )}
      </div>

      {/* Sub-menu (Recursive) */}
      {hasChildren && expanded && isOpen && (
        <ul className="mt-1 space-y-1 pl-2 ml-2">
          {item.children!.map((child, idx) => (
            <SidebarItem key={idx} item={child} isOpen={isOpen} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function FloatingSidebar({ menu }: { menu: WeeklyMenuItem[] }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <div 
        className={cn(
          "relative flex flex-col rounded-2xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur-md transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) dark:border-gray-800 dark:bg-gray-950/95 overflow-hidden",
          isOpen ? "w-48" : "w-16"
        )}
      >
        {/* Header / Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 outline-none",
            isOpen ? "h-12 justify-between px-4 border-b border-gray-100 dark:border-gray-800" : "h-12 justify-center"
          )}
          aria-label={isOpen ? "收起导航" : "展开导航"}
        >
           {isOpen ? (
             <>
               <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                 <History className="h-4 w-4" />
                 <span>周刊合集</span>
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
          isOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="overflow-y-auto max-h-[70vh] p-2 custom-scrollbar">
            <ul className="space-y-1">
              {menu.map((item) => (
                <SidebarItem key={item.path} item={item} isOpen={isOpen} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
