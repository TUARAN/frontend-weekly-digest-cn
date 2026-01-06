import fs from 'fs';
import path from 'path';

const weeklyDirectory = path.join(process.cwd(), '../weekly');
const repoRoot = path.join(process.cwd(), '..');

function canonicalizePathPart(part: string): string {
  return part
    .normalize('NFKC')
    // remove whitespace and common separators
    .replace(/[\s\-_]+/g, '')
    // remove common punctuation (both ASCII and CJK)
    .replace(/["'“”‘’`·•.,，。．、:：;；!！?？()（）【】\[\]{}<>《》]/g, '');
}

function fuzzyResolveWithinWeekly(relativePath: string): string | null {
  // Only attempt fuzzy resolution for paths under weekly/<digits>/...
  const normalized = relativePath.replace(/\\/g, '/');
  const match = normalized.match(/^weekly\/(\d+)\/(.+)$/);
  if (!match) return null;

  const slug = match[1];
  const rest = match[2].replace(/\/$/, '');

  const baseDir = path.join(repoRoot, 'weekly', slug);
  if (!fs.existsSync(baseDir)) return null;

  const parts = rest.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  // Walk directories, fuzzy-matching each segment when needed.
  let currentAbs = baseDir;
  const resolvedParts: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLast = i === parts.length - 1;

    const tryExact = path.join(currentAbs, part);
    if (fs.existsSync(tryExact)) {
      currentAbs = tryExact;
      resolvedParts.push(part);
      continue;
    }

    // If this is the last segment and looks like a markdown file, we allow matching against files.
    const wantMarkdownFile = isLast && part.toLowerCase().endsWith('.md');

    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(currentAbs, { withFileTypes: true });
    } catch {
      return null;
    }

    const targetCanon = canonicalizePathPart(part);
    const matches = entries.filter((ent) => {
      if (wantMarkdownFile) {
        return ent.isFile() && canonicalizePathPart(ent.name) === targetCanon;
      }
      return ent.isDirectory() && canonicalizePathPart(ent.name) === targetCanon;
    });

    if (matches.length !== 1) {
      return null;
    }

    const chosen = matches[0].name;
    currentAbs = path.join(currentAbs, chosen);
    resolvedParts.push(chosen);
  }

  const resolvedRelative = path.posix.join('weekly', slug, ...resolvedParts);

  // If the resolved path is a directory, prefer its index.md.
  const resolvedAbs = path.join(repoRoot, resolvedRelative);
  if (fs.existsSync(resolvedAbs) && fs.statSync(resolvedAbs).isDirectory()) {
    const indexAbs = path.join(resolvedAbs, 'index.md');
    if (fs.existsSync(indexAbs)) {
      return path.posix.join(resolvedRelative, 'index.md');
    }
  }

  // If the resolved path is already a markdown file, keep it.
  if (resolvedRelative.toLowerCase().endsWith('.md')) {
    return resolvedRelative;
  }

  // Otherwise, try the two conventional markdown variants.
  const indexCandidate = path.posix.join(resolvedRelative, 'index.md');
  if (fs.existsSync(path.join(repoRoot, indexCandidate))) return indexCandidate;

  const mdCandidate = `${resolvedRelative}.md`;
  if (fs.existsSync(path.join(repoRoot, mdCandidate))) return mdCandidate;

  return null;
}

function resolveRepoMarkdownPathFromLink(link: string): string {
  // link is already decodeURIComponent()'d and NFC-normalized.
  const cleanLink = link.replace(/^\.\//, '');
  const withoutTrailingSlash = cleanLink.replace(/\/$/, '');

  const candidates: string[] = [];

  if (withoutTrailingSlash.endsWith('.md')) {
    candidates.push(withoutTrailingSlash);
  } else {
    // Prefer directory-style content first, then single-file markdown.
    candidates.push(`${withoutTrailingSlash}/index.md`);
    candidates.push(`${withoutTrailingSlash}.md`);
    candidates.push(withoutTrailingSlash);
  }

  for (const candidate of candidates) {
    const abs = path.join(repoRoot, candidate);
    if (fs.existsSync(abs)) {
      return candidate;
    }
  }

  // Fallback: try fuzzy resolution for weekly paths (e.g., spaces vs hyphens).
  for (const candidate of candidates) {
    const fuzzy = fuzzyResolveWithinWeekly(candidate);
    if (fuzzy) return fuzzy;
  }

  // Fall back to whatever was in README.
  return withoutTrailingSlash;
}

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
  date?: string;
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
    
    const rawTitle = match[1];
    let link = match[2];
    try {
        // Decode URI component to handle %20 etc.
        link = decodeURIComponent(link);
        // Normalize to NFC to ensure consistency with file system and URL
        link = link.normalize('NFC');
    } catch (e) {
        console.error('Error decoding link:', link, e);
    }
    
    if (!isIndented) {
      // It's an issue
      const slugMatch = link.match(/\/(\d+)\//);
      const slug = slugMatch ? slugMatch[1] : '';
      
      if (slug) {
        // Extract date from title: "第443期（12月1日–12月7日）" -> title: "第443期", date: "12月1日–12月7日"
        let title = rawTitle;
        let date = '';
        const dateMatch = rawTitle.match(/^(.+?)(?:（(.+?)）)?$/);
        if (dateMatch) {
            title = dateMatch[1];
            date = dateMatch[2] || '';
        }

        currentIssue = {
          title,
          path: `/weekly/${slug}`,
          slug,
          date,
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

      // For static export, link per-article entries directly to GitHub blob URLs
      if (!link.startsWith('http')) {
          const resolved = resolveRepoMarkdownPathFromLink(link);
          const encodedPath = resolved.split('/').map(p => encodeURIComponent(p)).join('/');
          itemPath = `https://github.com/TUARAN/frontend-weekly-digest-cn/blob/main/${encodedPath}`;
      }
      
      currentIssue.children?.push({
        title: rawTitle,
        path: itemPath
      });
    }
  }
  
  return menu;
}

export function getArticleContent(slug: string, articlePath: string[]): string | null {
  const relativePath = articlePath.join('/').replace(/\/$/, '');
  const basePath = path.join(weeklyDirectory, slug, relativePath);

  const candidates: string[] = [];

  if (relativePath.endsWith('.md')) {
    candidates.push(basePath);
  } else {
    // Prefer directory index first, then single-file markdown.
    candidates.push(path.join(basePath, 'index.md'));
    candidates.push(`${basePath}.md`);
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, 'utf8');
    }
  }

  return null;
}

export function getAllWeeklies(): WeeklyPost[] {
  if (!fs.existsSync(weeklyDirectory)) {
    return [];
  }

  // Get date mapping from menu
  const menu = getWeeklyMenu();
  const dateMap = new Map<string, string>();
  
  const traverse = (items: WeeklyMenuItem[]) => {
    for (const item of items) {
        if (item.slug && item.date) {
            dateMap.set(item.slug, item.date);
        }
        if (item.children) {
            traverse(item.children);
        }
    }
  };
  traverse(menu);

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
      date: dateMap.get(slug) || '',
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

  // Get date from menu
  const menu = getWeeklyMenu();
  let date = '';
  const traverse = (items: WeeklyMenuItem[]) => {
    for (const item of items) {
        if (item.slug === slug && item.date) {
            date = item.date;
            return;
        }
        if (item.children) {
            traverse(item.children);
        }
    }
  };
  traverse(menu);

  const content = fs.readFileSync(fullPath, 'utf8');
  
  return {
    slug,
    title: `前端周刊第 ${slug} 期`,
    date,
    content,
  };
}
