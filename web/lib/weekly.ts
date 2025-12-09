import fs from 'fs';
import path from 'path';

const weeklyDirectory = path.join(process.cwd(), '../weekly');

export interface WeeklyPost {
  slug: string;
  title: string;
  date: string; // We might need to infer this or extract from content if not in filename
  content: string;
}

export function getAllWeeklies(): WeeklyPost[] {
  if (!fs.existsSync(weeklyDirectory)) {
    return [];
  }

  const folders = fs.readdirSync(weeklyDirectory).filter(folder => {
    return /^\d+$/.test(folder); // Only numeric folders
  });

  const weeklies = folders.map(folder => {
    const slug = folder;
    const fullPath = path.join(weeklyDirectory, folder, `前端周刊第${slug}期.md`);
    
    let content = '';
    try {
      if (fs.existsSync(fullPath)) {
        content = fs.readFileSync(fullPath, 'utf8');
      }
    } catch (e) {
      console.error(`Error reading weekly ${slug}`, e);
    }

    return {
      slug,
      title: `前端周刊第 ${slug} 期`,
      date: '', // TODO: Extract date from content or map it manually if needed
      content,
    };
  });

  // Sort by slug descending (newest first)
  return weeklies.sort((a, b) => parseInt(b.slug) - parseInt(a.slug));
}

export function getWeeklyBySlug(slug: string): WeeklyPost | null {
  const fullPath = path.join(weeklyDirectory, slug, `前端周刊第${slug}期.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  
  return {
    slug,
    title: `前端周刊第 ${slug} 期`,
    date: '',
    content,
  };
}
