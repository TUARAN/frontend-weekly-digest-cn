import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BriefMeta {
  title: string;
  slug: string;
  date: string;
  category: string;
  tldr: string;
  readMinutes: number;
  pro: boolean;
  tags: string[];
}

export interface Brief extends BriefMeta {
  content: string;
}

const briefsDir = path.join(process.cwd(), 'content/briefs');

function parseFile(fullPath: string): Brief | null {
  try {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const { data, content } = matter(raw);
    const fileSlug = path.basename(fullPath, '.md');

    return {
      title: String(data.title ?? fileSlug),
      slug: String(data.slug ?? fileSlug),
      date: String(data.date ?? ''),
      category: String(data.category ?? '技术决策'),
      tldr: String(data.tldr ?? ''),
      readMinutes: Number(data.readMinutes ?? 5),
      pro: Boolean(data.pro ?? false),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      content,
    };
  } catch {
    return null;
  }
}

export function getAllBriefs(): BriefMeta[] {
  if (!fs.existsSync(briefsDir)) return [];
  const files = fs.readdirSync(briefsDir).filter((f) => f.endsWith('.md'));
  const briefs: BriefMeta[] = [];
  for (const file of files) {
    const brief = parseFile(path.join(briefsDir, file));
    if (brief) {
      const { content: _content, ...meta } = brief;
      briefs.push(meta);
    }
  }
  return briefs.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getBriefBySlug(slug: string): Brief | null {
  const fullPath = path.join(briefsDir, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  return parseFile(fullPath);
}

export function getAllBriefSlugs(): string[] {
  if (!fs.existsSync(briefsDir)) return [];
  return fs
    .readdirSync(briefsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}
