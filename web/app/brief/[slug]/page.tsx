import { getBriefBySlug, getAllBriefSlugs } from '@/lib/briefs';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ArrowLeft, Clock, Lock, Sparkles } from 'lucide-react';

interface PageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllBriefSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const brief = getBriefBySlug(slug);
  if (!brief) return { title: '简报未找到' };
  return {
    title: `${brief.title} · 决策简报`,
    description: brief.tldr,
  };
}

export default async function BriefPage({ params }: PageProps) {
  const { slug } = await params;
  const brief = getBriefBySlug(slug);

  if (!brief) {
    notFound();
  }

  // Pro gating: free preview shows TL;DR + first section, then prompts to unlock.
  const content = brief.content;
  const previewSplit = content.split(/\n## /);
  const freePreview = brief.pro && previewSplit.length > 2
    ? previewSplit.slice(0, 2).join('\n## ')
    : content;

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/brief"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            返回决策简报
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {brief.category}
          </span>
          {brief.pro ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-300">
              <Lock className="h-3 w-3" />
              Pro
            </span>
          ) : null}
          <span className="text-xs text-gray-500">{brief.date}</span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {brief.readMinutes} 分钟
          </span>
        </div>

        <h1 className="mb-5 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
          {brief.title}
        </h1>

        <div className="mb-8 rounded-2xl border-l-4 border-blue-500 bg-blue-50/60 p-5 text-base leading-7 text-gray-700 dark:bg-blue-950/30 dark:text-gray-200">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700 dark:text-blue-300">TL;DR</p>
          <p className="mt-2">{brief.tldr}</p>
        </div>

        <article className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{freePreview}</ReactMarkdown>
        </article>

        {brief.pro && previewSplit.length > 2 ? (
          <div className="mt-10 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-8 dark:border-amber-900/50 dark:from-amber-950/30 dark:via-gray-950 dark:to-yellow-950/30">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <Lock className="h-3 w-3" />
              Pro 内容
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">这一篇的完整判断留给过滤器会员</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">
              公开部分说清楚"是什么"；作者的具体判断、容易踩的坑、以及"如果是你该怎么做"在会员版。
              如果你更想针对你自己的情况聊，可以直接预约 1v1。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/pro"
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                <Sparkles className="h-4 w-4" />
                看过滤器 / 1v1 详情
              </Link>
              <Link
                href="/brief"
                className="inline-flex items-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-100"
              >
                先看其他免费简报
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            喜欢这篇简报？每周一封邮件，只发那些值得你停下来读的技术决策。
          </p>
          <Link
            href="/subscribe"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-100"
          >
            订阅邮件周报 →
          </Link>
        </div>
      </div>
    </div>
  );
}
