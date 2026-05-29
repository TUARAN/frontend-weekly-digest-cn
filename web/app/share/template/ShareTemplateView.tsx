'use client';

import { Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, FileText, Sparkles } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { resolveShareKindLabel } from '@/lib/share-template';

interface SharePayload {
  kind: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  tier: string;
  href: string;
}

interface FeedItem {
  topic: string;
  title: string;
  summary: string;
  source: string;
  href: string;
  publishedAt?: string | null;
}

const EMPTY_PAYLOAD: SharePayload = {
  kind: 'other',
  title: '前端周看',
  summary: '',
  source: '',
  date: '',
  tier: '',
  href: '',
};

function fmtCST(iso?: string | null): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const d = new Date(t + 8 * 60 * 60 * 1000);
  const M = d.getUTCMonth() + 1;
  const D = d.getUTCDate();
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${M}月${D}日 ${h}:${m}`;
}

function parseLegacyPayload(params: URLSearchParams): SharePayload {
  const kind = params.get('kind') || 'other';
  const title = params.get('title') || '前端周看';
  const summary = params.get('summary') || '';
  const source = params.get('source') || '';
  const date = params.get('date') || '';
  const tier = params.get('tier') || '';
  const hrefParam = params.get('href') || '';
  const href = /^https?:\/\//.test(hrefParam) || hrefParam.startsWith('/') ? hrefParam : '';
  return { kind, title, summary, source, date, tier, href };
}

function payloadFromLiveItem(item: FeedItem): SharePayload {
  return {
    kind: 'live',
    title: item.title,
    summary: item.summary || '',
    source: item.source || '',
    date: fmtCST(item.publishedAt),
    tier: '7×24 实时资讯',
    href: item.href,
  };
}

function ShareTemplateBody() {
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<SharePayload>(EMPTY_PAYLOAD);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const shortKind = searchParams.get('k');

    // 短链：?k=l&u=<href> — 7×24 实时资讯
    if (shortKind === 'l') {
      const u = searchParams.get('u') || '';
      setResolving(true);
      setPayload({ ...EMPTY_PAYLOAD, kind: 'live', title: '加载中…', href: u });
      let cancelled = false;
      fetch('/ai-hot-feed.json', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { items?: FeedItem[] } | null) => {
          if (cancelled) return;
          const found = data?.items?.find((it) => it.href === u);
          if (found) {
            setPayload(payloadFromLiveItem(found));
          } else {
            // 该条目已滚出 feed —— 退化为只显示原文跳转
            setPayload({
              ...EMPTY_PAYLOAD,
              kind: 'live',
              title: '该条资讯已归档',
              summary: '点击下方按钮跳转到原文查看。',
              tier: '7×24 实时资讯',
              href: u,
            });
          }
        })
        .catch(() => {
          if (cancelled) return;
          setPayload({
            ...EMPTY_PAYLOAD,
            kind: 'live',
            title: '加载失败',
            summary: '请直接点击下方按钮查看原文。',
            tier: '7×24 实时资讯',
            href: u,
          });
        })
        .finally(() => !cancelled && setResolving(false));
      return () => {
        cancelled = true;
      };
    }

    // 旧长链兼容
    setPayload(parseLegacyPayload(searchParams));
    return undefined;
  }, [searchParams]);

  useEffect(() => {
    const heading = resolveShareKindLabel(payload.kind);
    document.title = `${payload.title} · ${heading}`;
  }, [payload.kind, payload.title]);

  const { kind, title, summary, source, date, tier, href } = payload;
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
            {resolving ? (
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-gray-300">
                加载中…
              </span>
            ) : null}
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

export default function ShareTemplateView() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
      <ShareTemplateBody />
    </Suspense>
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
