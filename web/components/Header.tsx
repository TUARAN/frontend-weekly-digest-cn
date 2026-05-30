'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import BrandLogo from '@/components/BrandLogo';
import { buildWeeklyUrl } from '@/lib/site-matrix';

interface HeaderProps {
  weeklyHref?: string;
}

type NavItem = { href: string; label: string; match: (p: string) => boolean };

export default function Header({ weeklyHref = '/weekly' }: HeaderProps) {
  const pathname = usePathname();
  const resolvedWeeklyHref = weeklyHref === '/weekly' ? buildWeeklyUrl('/weekly') : weeklyHref;
  const contentNav: NavItem[] = [
    { href: '/live', label: '资讯', match: (p) => p.startsWith('/live') },
    { href: '/daily', label: '每日', match: (p) => p.startsWith('/daily') },
    { href: resolvedWeeklyHref, label: '周刊', match: (p) => p.startsWith('/weekly') },
  ];
  const serviceNav: NavItem[] = [
    { href: '/roadmap', label: '路线图', match: (p) => p.startsWith('/roadmap') },
  ];
  const mobileNav: NavItem[] = [
    ...contentNav,
    ...serviceNav,
    { href: '/pro', label: '1v1', match: (p) => p.startsWith('/pro') },
  ];

  const renderDesktopLink = (item: NavItem) => (
    <Link
      key={item.label}
      href={item.href}
      className={cn(
        'transition-colors hover:text-blue-600 dark:hover:text-blue-400',
        item.match(pathname) ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
      )}
    >
      {item.label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/85 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/85">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:h-16 md:px-6">
        <div className="flex items-center gap-6">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600 dark:text-gray-400">
            {contentNav.map((item, idx) => (
              <span key={item.label} className="inline-flex items-center gap-5">
                {idx > 0 ? (
                  <span className="select-none text-gray-300 dark:text-gray-700">·</span>
                ) : null}
                {renderDesktopLink(item)}
              </span>
            ))}
            <span className="select-none text-gray-300 dark:text-gray-700">|</span>
            {serviceNav.map(renderDesktopLink)}
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
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:text-white md:px-3"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>

      {/* 移动端：横向 pill 导航条 */}
      <nav
        className="md:hidden border-t border-gray-100 dark:border-gray-900"
        aria-label="移动端导航"
      >
        <div className="container mx-auto flex items-center gap-2 overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {mobileNav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
