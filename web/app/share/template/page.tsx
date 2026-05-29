import type { Metadata } from 'next';
import { Suspense } from 'react';
import ShareTemplateClient from '@/components/ShareTemplateClient';

const description = '来自前端周看的分享卡片，聚焦 AI、Agent、前端与科技动态，帮助你快速抓到高价值信号。';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '分享模板 · 前端周看',
  description,
  openGraph: {
    title: '分享模板 · 前端周看',
    description,
    type: 'article',
    siteName: '前端周看',
    locale: 'zh_CN',
    images: [
      {
        url: '/api/og/share',
        width: 1200,
        height: 630,
        alt: '前端周看分享模板',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '分享模板 · 前端周看',
    description,
    images: ['/api/og/share'],
  },
};

export default function GenericShareTemplatePage() {
  return (
    <Suspense fallback={<ShareTemplateFallback />}>
      <ShareTemplateClient />
    </Suspense>
  );
}

function ShareTemplateFallback() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,#172554_0%,#020617_45%,#020617_100%)] px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm text-gray-300 shadow-2xl shadow-blue-950/60 backdrop-blur sm:p-8">
        正在生成分享卡片...
      </div>
    </div>
  );
}
