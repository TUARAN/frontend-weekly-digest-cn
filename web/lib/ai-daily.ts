import { readFileSync } from 'fs';
import { join } from 'path';

export interface DailyItem {
  num: string;
  topic: string; // 'AI Coding' | '具身智能'
  title: string;
  summary: string;
  reason: string;
}

export interface DailyData {
  date: string;
  displayDate: string;
  dateNum: string;
  year: number;
  dayOfWeek: string;
  topics: string[];
  sources: string;
  count: number;
  highlights: string[];
  items: DailyItem[];
}

export interface DailyMeta {
  date: string;
  displayDate: string;
  count: number;
  highlights: string[];
  json?: string;
  file?: string;
}

export interface DailyManifest {
  list: DailyMeta[];
  latest: string;
}

const PUBLIC = join(process.cwd(), 'public');

export function getDailyManifest(): DailyManifest {
  try {
    const raw = readFileSync(join(PUBLIC, 'ai-daily-manifest.json'), 'utf-8');
    const data = JSON.parse(raw);
    return { list: Array.isArray(data.list) ? data.list : [], latest: data.latest ?? '' };
  } catch {
    return { list: [], latest: '' };
  }
}

export function getDailyEntry(date: string): DailyData | null {
  try {
    const raw = readFileSync(join(PUBLIC, 'ai-daily', `${date}.json`), 'utf-8');
    return JSON.parse(raw) as DailyData;
  } catch {
    return null;
  }
}

export function getLatestDaily(): DailyData | null {
  const { latest } = getDailyManifest();
  return latest ? getDailyEntry(latest) : null;
}
