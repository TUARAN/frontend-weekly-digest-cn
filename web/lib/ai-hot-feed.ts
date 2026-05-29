import { readFileSync } from 'fs';
import { join } from 'path';

export interface FeedItem {
  topic: string;
  title: string;
  summary: string;
  source: string;
  href: string;
  publishedAt?: string | null;
}

export interface AiHotFeed {
  updatedAt: string | null;
  items: FeedItem[];
}

// 构建时读取 GitHub Action 落地的静态 JSON（浏览器不参与抓取）。
export function getAiHotFeed(): AiHotFeed {
  try {
    const raw = readFileSync(join(process.cwd(), 'public/ai-hot-feed.json'), 'utf-8');
    const data = JSON.parse(raw);
    return {
      updatedAt: data.updatedAt ?? null,
      items: Array.isArray(data.items) ? data.items : [],
    };
  } catch {
    return { updatedAt: null, items: [] };
  }
}
