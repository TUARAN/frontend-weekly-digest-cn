'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-gray-900 dark:text-white">前端周刊</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <Link 
              href="/" 
              className={cn(
                "transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                pathname === "/" ? "text-blue-600 dark:text-blue-400 font-bold" : ""
              )}
            >
              首页
            </Link>
            <Link 
              href="/tool" 
              className={cn(
                "transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                pathname === "/tool" ? "text-blue-600 dark:text-blue-400 font-bold" : ""
              )}
            >
              工具
            </Link>
            <Link 
              href="/about" 
              className={cn(
                "transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                pathname === "/about" ? "text-blue-600 dark:text-blue-400 font-bold" : ""
              )}
            >
              关于
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/TUARAN/frontend-weekly-digest-cn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
