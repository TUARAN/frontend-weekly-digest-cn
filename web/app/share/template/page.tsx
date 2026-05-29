import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ArrowLeft, ExternalLink, FileText, Sparkles } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { resolveShareKindLabel } from '@/lib/share-template';

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function parseSharePayload(searchParams: SearchParams) {
  const kind = firstValue(searchParams.kind) || 'other';
  const title = firstValue(searchParams.title) || '前端周看';
  const summary = firstValue(searchParams.summary);
  const source = firstValue(searchParams.source);
  const date = firstValue(searchParams.date);
  const tier = firstValue(searchParams.tier);
  const hrefParam = firstValue(searchParams.href);
  const href = /^https?:\/\//.test(hrefParam) || hrefParam.startsWith('/') ? hrefParam : '';

  return { kind, title, summary, source, date, tier, href };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const payload = parseSharePayload(await searchParams);
  const heading = resolveShareKindLabel(payload.kind);
  const pageTitle = `${payload.title} · ${heading}`;
  const description =
    payload.summary ||
    `来自前端周看的 ${heading}，聚焦 AI、Agent、前端与科技动态，帮助你快速抓到高价值信号。`;
  const ogQuery = new URLSearchParams({
    kind: payload.kind,
    title: payload.title,
    summary: payload.summary || description,
  });
  const ogImageUrl = `/api/og/share?${ogQuery.toString()}`;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      type: 'article',
      siteName: '前端周看',
      locale: 'zh_CN',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [ogImageUrl],
    },
    other: {
      'og:locale:alternate': 'zh_CN',
    },
  };
}

export default async function GenericShareTemplatePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { kind, title, summary, source, date, tier, href } = parseSharePayload(await searchParams);

  const heading = resolveShareKindLabel(kind);
  const theme = resolveShareTheme(kind);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,#172554_0%,#020617_45%,#020617_100%)] px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo href="/" />
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-300 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            返回前端周看
          </Link>
        </div>

        <article className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-blue-950/60 backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${theme.badgeClass}`}>
              <FileText className="h-3.5 w-3.5" />
              {heading}
            </p>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-gray-300">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              Signals over noise.
            </p>
          </div>

          <h1 className="mt-5 text-2xl font-black leading-tight text-white sm:text-4xl">{title}</h1>
          <p className={`mt-3 text-sm font-medium ${theme.eyebrowClass}`}>前端周看 · 给忙碌开发者的高信噪比信息流</p>

          {summary ? <p className="mt-4 text-sm leading-7 text-gray-200 sm:text-base">{summary}</p> : null}

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-gray-300">
            {tier ? <MetaPill>{tier}</MetaPill> : null}
            {date ? <MetaPill>{date}</MetaPill> : null}
            {source ? <MetaPill>{source}</MetaPill> : null}
          </div>

          <div className={`mt-8 rounded-2xl border ${theme.panelClass} p-4 sm:p-5`}>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-300">为什么分享这条</p>
            <p className="mt-2 text-sm leading-6 text-gray-100">
              这是一条经过筛选的关键信号，不追求信息堆叠，而是帮助你更快理解变化、判断影响并转化为行动。
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {href ? (
              <Link
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
              >
                查看原文
                <ExternalLink className="h-4 w-4" />
              </Link>
            ) : null}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-white/30 hover:bg-white/5"
            >
              浏览首页
            </Link>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5 text-xs text-gray-400">
            <p>前端周看 · 站在前沿端点，每周看世界所发生的变化</p>
          </div>
        </article>
      </div>
    </div>
  );
}

function resolveShareTheme(kind: string): { badgeClass: string; eyebrowClass: string; panelClass: string } {
  switch (kind) {
    case 'live':
      return {
        badgeClass: 'bg-emerald-500/20 text-emerald-200 border border-emerald-300/30',
        eyebrowClass: 'text-emerald-200/90',
        panelClass: 'border-emerald-300/25 bg-emerald-500/10',
      };
    case 'daily':
      return {
        badgeClass: 'bg-blue-500/20 text-blue-200 border border-blue-300/30',
        eyebrowClass: 'text-blue-200/90',
        panelClass: 'border-blue-300/25 bg-blue-500/10',
      };
    case 'format':
      return {
        badgeClass: 'bg-violet-500/20 text-violet-200 border border-violet-300/30',
        eyebrowClass: 'text-violet-200/90',
        panelClass: 'border-violet-300/25 bg-violet-500/10',
      };
    default:
      return {
        badgeClass: 'bg-gray-500/20 text-gray-100 border border-gray-300/25',
        eyebrowClass: 'text-gray-200/90',
        panelClass: 'border-gray-300/20 bg-white/[0.03]',
      };
  }
}

function MetaPill({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1">{children}</span>;
}

