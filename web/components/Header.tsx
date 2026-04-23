'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import BrandLogo from '@/components/BrandLogo';

interface HeaderProps {
  weeklyHref?: string;
}

const navItems: { href: string; label: string; match: (p: string) => boolean }[] = [
  { href: '/', label: '每日情报', match: (p) => p === '/' },
  { href: '/brief', label: '决策简报', match: (p) => p.startsWith('/brief') },
  { href: '/roadmap', label: '转型路线', match: (p) => p.startsWith('/roadmap') },
  { href: '/weekly', label: '前端周刊', match: (p) => p.startsWith('/weekly') },
];

export default function Header({ weeklyHref: _weeklyHref }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600 dark:text-gray-400">
            {navItems.map((item, idx) => (
              <span key={item.href} className="inline-flex items-center gap-5">
                {idx > 0 ? (
                  <span className="select-none text-gray-300 dark:text-gray-700">|</span>
                ) : null}
                <Link
                  href={item.href}
                  className={cn(
                    'transition-colors hover:text-blue-600 dark:hover:text-blue-400',
                    item.match(pathname) ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                  )}
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/pro"
            className={cn(
              'hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200',
              pathname.startsWith('/pro') ? 'ring-2 ring-gray-400 dark:ring-gray-600' : ''
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            1v1 交流
          </Link>
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
