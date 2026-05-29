'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import BrandLogo from '@/components/BrandLogo';

interface HeaderProps {
  weeklyHref?: string;
}

type NavItem = {
  href: string;
  label: string;
  mobileLabel?: string;
  match: (p: string, hash: string) => boolean;
};

export default function Header({ weeklyHref = '/weekly' }: HeaderProps) {
  const pathname = usePathname();
  const [hash, setHash] = useState('');
  const navItems: NavItem[] = [
    { href: '/', label: '情报看板', mobileLabel: '看板', match: (p, h) => (p === '/' && !h) || p.startsWith('/ai-radar') },
    { href: '/#live', label: '7×24 资讯', mobileLabel: '7×24', match: (p, h) => p === '/' && h === '#live' },
    { href: '/#daily', label: '每日精选', mobileLabel: '每日', match: (p, h) => p === '/' && h === '#daily' },
    { href: '/roadmap', label: '转型计划', mobileLabel: '计划', match: (p) => p.startsWith('/roadmap') },
    { href: weeklyHref, label: '前端周刊', mobileLabel: '周刊', match: (p) => p.startsWith('/weekly') },
  ];
  const mobileNavItems: NavItem[] = [
    ...navItems,
    { href: '/#contact', label: '联系/二维码', mobileLabel: '二维码', match: (p, h) => p === '/' && h === '#contact' },
  ];

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:h-16 md:px-6">
        <div className="flex items-center gap-6">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400">
            {navItems.map((item) => (
              <span key={item.label} className="inline-flex items-center">
                <Link
                  href={item.href}
                  className={cn(
                    'rounded-full px-3 py-1.5 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300',
                    item.match(pathname, hash) ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold' : ''
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
      <nav className="border-t border-gray-100 bg-white/90 dark:border-gray-900 dark:bg-gray-950/90 md:hidden" aria-label="H5 主导航">
        <div className="custom-scrollbar container mx-auto flex gap-2 overflow-x-auto px-4 py-2">
          {mobileNavItems.map((item) => {
            const isActive = item.match(pathname, hash);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'inline-flex min-h-9 shrink-0 items-center justify-center rounded-full border px-3.5 text-xs font-semibold transition',
                  isActive
                    ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:text-white'
                )}
              >
                {item.mobileLabel ?? item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
