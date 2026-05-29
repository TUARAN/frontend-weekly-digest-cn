import LiveSignalBoard from '@/components/LiveSignalBoard';
import { getAiHotFeed } from '@/lib/ai-hot-feed';

export const metadata = {
  title: '7×24 资讯 · 前端周看',
  description: 'AI、Agent、前端、科技实时播报 · 每小时自动更新',
};

export default function LivePage() {
  const feed = getAiHotFeed();
  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl">
        <LiveSignalBoard items={feed.items} updatedAt={feed.updatedAt} />
      </div>
    </div>
  );
}
