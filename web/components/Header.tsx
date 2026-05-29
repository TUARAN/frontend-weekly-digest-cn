'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import BrandLogo from '@/components/BrandLogo';

interface HeaderProps {
  weeklyHref?: string;
}

export default function Header({ weeklyHref = '/weekly' }: HeaderProps) {
  const pathname = usePathname();
  const navItems: { href: string; label: string; match: (p: string) => boolean }[] = [
    { href: '/', label: '情报看板', match: (p) => p === '/' || p.startsWith('/ai-radar') },
    { href: '/#live', label: '7×24 资讯', match: () => false },
    { href: '/#daily', label: '每日精选', match: () => false },
    { href: '/roadmap', label: '转型计划', match: (p) => p.startsWith('/roadmap') },
    { href: weeklyHref, label: '前端周刊', match: (p) => p.startsWith('/weekly') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400">
            {navItems.map((item) => (
              <span key={item.label} className="inline-flex items-center">
                <Link
                  href={item.href}
                  className={cn(
                    'rounded-full px-3 py-1.5 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300',
                    item.match(pathname) ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold' : ''
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
            href="/#contact"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            联系/二维码
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
