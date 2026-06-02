import type { Metadata } from 'next';
import ShareTemplateView from './ShareTemplateView';

export const metadata: Metadata = {
  title: '前端周看 · 分享卡片',
  description: '来自前端周看的内容分享：不制造焦虑，不传播焦虑，但不拒绝新潮观点。',
  openGraph: {
    title: '前端周看 · 分享卡片',
    description: '来自前端周看的内容分享：不制造焦虑，不传播焦虑，但不拒绝新潮观点。',
    type: 'article',
    siteName: '前端周看',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '前端周看 · 分享卡片',
    description: '来自前端周看的内容分享：不制造焦虑，不传播焦虑，但不拒绝新潮观点。',
  },
};

export default function GenericShareTemplatePage() {
  return <ShareTemplateView />;
}
