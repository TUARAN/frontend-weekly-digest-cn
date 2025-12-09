import fs from 'fs';
import path from 'path';

const weeklyDirectory = path.join(process.cwd(), '../weekly');

export interface WeeklyPost {
  slug: string;
  title: string;
  date: string;
  content: string;
}

export interface WeeklyMenuItem {
  title: string;
  path: string;
  slug?: string;
  children?: WeeklyMenuItem[];
}

export function getWeeklyMenu(): WeeklyMenuItem[] {
  const readmePath = path.join(process.cwd(), '../README.md');
  
  if (!fs.existsSync(readmePath)) {
    return [];
  }
  
  const content = fs.readFileSync(readmePath, 'utf8');
  const lines = content.split('\n');
  
  const menu: WeeklyMenuItem[] = [];
  let currentYearItem: WeeklyMenuItem | null = null;
  let currentIssue: WeeklyMenuItem | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check for Year Header
    if (line.startsWith('### ') && line.includes('年')) {
        const yearTitle = line.replace('### ', '').trim();
        currentYearItem = {
            title: yearTitle,
            path: '#',
            children: []
        };
        menu.push(currentYearItem);
        currentIssue = null;
        continue;
    }

    if (!trimmed.startsWith('-')) continue;
    
    const isIndented = line.startsWith('  -') || line.startsWith('\t-');
    
    const match = trimmed.match(/^-\s+\[(.*?)\]\((.*?)\)/);
    if (!match) continue;
    
    const title = match[1];
    const link = match[2];
    
    if (!isIndented) {
      // It's an issue
      const slugMatch = link.match(/\/(\d+)\//);
      const slug = slugMatch ? slugMatch[1] : '';
      
      if (slug) {
        currentIssue = {
          title,
          path: `/weekly/${slug}`,
          slug,
          children: []
        };
        
        if (currentYearItem) {
            currentYearItem.children?.push(currentIssue);
        } else {
            menu.push(currentIssue);
        }
      }
    } else if (currentIssue) {
      // It's an article under the current issue
      let itemPath = link;
      if (!link.startsWith('http')) {
         const relative = link.replace(/^(\.\/)?weekly\//, '');
         const parts = relative.split('/');
         
         if (parts.length > 1) {
             const slug = parts[0];
             const rest = parts.slice(1).join('/');
             const routePath = rest.replace(/\.md$/, '');
             itemPath = `/weekly/${slug}/${routePath}`;
         }
      }
      
      currentIssue.children?.push({
        title,
        path: itemPath
      });
    }
  }
  
  return menu;
}

export function getArticleContent(slug: string, articlePath: string[]): string | null {
  const relativePath = articlePath.join('/');
  const fullPath = path.join(weeklyDirectory, slug, `${relativePath}.md`);
  
  if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8');
  }
  return null;
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
