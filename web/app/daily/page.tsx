import AiDailyBoard from '@/components/AiDailyBoard';
import { getDailyManifest, getLatestDaily } from '@/lib/ai-daily';

export const metadata = {
  title: '每日精选 · 前端周看',
  description: '精选 AI Coding & 具身智能最新动态 · 每日 09:00 自动更新',
};

export default function DailyPage() {
  const manifest = getDailyManifest();
  const latest = getLatestDaily();
  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl">
        <AiDailyBoard manifest={manifest.list} initial={latest} />
      </div>
    </div>
  );
}
