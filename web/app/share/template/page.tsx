import type { Metadata } from 'next';
import ShareTemplateView from './ShareTemplateView';

export const metadata: Metadata = {
  title: '前端周看 · 分享卡片',
  description: '来自前端周看的内容分享，聚焦 AI、Agent、前端与科技动态。',
  openGraph: {
    title: '前端周看 · 分享卡片',
    description: '来自前端周看的内容分享，聚焦 AI、Agent、前端与科技动态。',
    type: 'article',
    siteName: '前端周看',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '前端周看 · 分享卡片',
    description: '来自前端周看的内容分享，聚焦 AI、Agent、前端与科技动态。',
  },
};

export default function GenericShareTemplatePage() {
  return <ShareTemplateView />;
}
