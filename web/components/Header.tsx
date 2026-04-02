'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import BrandLogo from '@/components/BrandLogo';

interface HeaderProps {
  weeklyHref?: string;
}

export default function Header({ weeklyHref }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <Link 
              href="/" 
              className={cn(
                "transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                pathname === "/" ? "text-blue-600 dark:text-blue-400 font-bold" : ""
              )}
            >
              AI情报站
            </Link>
            {weeklyHref ? (
              <a
                href={weeklyHref}
                className={cn(
                  "transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                  pathname.startsWith('/weekly/') ? "text-blue-600 dark:text-blue-400 font-bold" : ""
                )}
              >
                原·前端周刊
              </a>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/TUARAN/frontend-weekly-digest-cn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            <Github className="h-5 w-5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
