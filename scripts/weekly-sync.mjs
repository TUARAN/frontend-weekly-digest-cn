#!/usr/bin/env node
/**
 * 前端周看 · 周刊同步
 *
 * 数据源：Fresh Frontend Links / Frontend Weekly Digest (Medium RSS)
 * 生成：GitHub Models（GitHub Actions 自带 GITHUB_TOKEN，无需额外密钥）
 *
 * 默认只处理源站最新一期；设置 BACKFILL=true 时处理 RSS 中所有缺失期数。
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const README_PATH = resolve(ROOT, 'README.md');
const WEEKLY_DIR = resolve(ROOT, 'weekly');
const RSS_URL = process.env.WEEKLY_RSS_URL || 'https://medium.com/feed/@frontender-ua';
const MODEL = process.env.WEEKLY_MODEL || 'openai/gpt-4o';
const BACKFILL = process.env.BACKFILL === 'true';
const RSS_FILE = process.env.WEEKLY_RSS_FILE;

const SECTION_MAP = new Map([
  ['web dev', '🧭 Web Dev'],
  ['web development', '🧭 Web Dev'],
  ['tools', '🛠 Tools'],
  ['tooling', '🛠 Tools'],
  ['performance', '⚡ Performance'],
  ['css', '🎨 CSS'],
  ['javascript', '💡 JavaScripts'],
  ['javascripts', '💡 JavaScripts'],
  ['react', '⚛️ React'],
  ['vue', '🟢 Vue'],
  ['angular', '🅰️ Angular'],
  ['demo', '✨ Demo'],
  ['demos', '✨ Demo'],
]);

function decodeEntities(value = '') {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    hellip: '…',
    laquo: '«',
    ldquo: '“',
    lsquo: '‘',
    lt: '<',
    mdash: '—',
    nbsp: ' ',
    ndash: '–',
    quot: '"',
    raquo: '»',
    rdquo: '”',
    rsquo: '’',
  };

  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (entity, name) => named[name.toLowerCase()] ?? entity);
}

function stripTags(value = '') {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeEntities(match[1]).trim() : '';
}

function normalizeSection(value = '') {
  const plain = stripTags(value)
    .replace(/[^\p{L}\p{N}+#.\s-]/gu, '')
    .trim()
    .toLowerCase();

  for (const [key, label] of SECTION_MAP) {
    if (plain === key || plain.startsWith(`${key} `)) return label;
  }

  return '';
}

function extractLinks(html) {
  const tokens = html.match(/<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>|<a\s[^>]*>[\s\S]*?<\/a>/gi) || [];
  const categories = new Map();
  let currentSection = '🧭 Web Dev';

  for (const token of tokens) {
    if (/^<h[1-4]/i.test(token)) {
      const section = normalizeSection(token);
      if (section) currentSection = section;
      continue;
    }

    const hrefMatch = token.match(/href=(?:"([^"]+)"|'([^']+)')/i);
    const url = decodeEntities(hrefMatch?.[1] || hrefMatch?.[2] || '');
    const title = stripTags(token);

    if (!/^https?:\/\//i.test(url) || title.length < 4) continue;
    if (/medium\.com\/(?:@frontender-ua|m\/signin|tag\/)/i.test(url)) continue;
    if (/^(source|read more|open in app|fresh frontend links)$/i.test(title)) continue;

    if (!categories.has(currentSection)) categories.set(currentSection, []);
    const items = categories.get(currentSection);
    if (!items.some((item) => item.url === url)) items.push({ title, url });
  }

  return [...categories]
    .map(([section, items]) => ({ section, items }))
    .filter(({ items }) => items.length > 0);
}

function parseIssue(itemXml) {
  const title = stripTags(extractTag(itemXml, 'title'));
  const match = title.match(/Frontend Weekly Digest\s*#(\d+)\s*\(([^)]+)\)/i);
  if (!match) return null;

  const issue = Number(match[1]);
  const sourceUrl = extractTag(itemXml, 'link');
  const html = extractTag(itemXml, 'content:encoded') || extractTag(itemXml, 'description');
  const categories = extractLinks(html);

  if (!sourceUrl || categories.length === 0) {
    throw new Error(`第 ${issue} 期解析失败：缺少来源链接或文章目录`);
  }

  return {
    issue,
    sourceTitle: title,
    sourceUrl,
    dateText: match[2].trim(),
    categories,
  };
}

function parseRss(xml) {
  const items = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || [];
  return items
    .map(parseIssue)
    .filter(Boolean)
    .sort((a, b) => a.issue - b.issue);
}

async function fetchRss() {
  if (RSS_FILE) {
    console.log(`读取本地 RSS：${RSS_FILE}`);
    return readFileSync(resolve(ROOT, RSS_FILE), 'utf8');
  }

  console.log(`读取 RSS：${RSS_URL}`);
  const response = await fetch(RSS_URL, {
    headers: {
      Accept: 'application/rss+xml, application/xml, text/xml',
      'User-Agent': 'frontend-weekly-digest-cn/2.0 (+https://github.com/TUARAN/frontend-weekly-digest-cn)',
    },
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) throw new Error(`RSS 请求失败：HTTP ${response.status}`);
  return response.text();
}

function issuePath(issue) {
  return resolve(WEEKLY_DIR, String(issue), `前端周刊第${issue}期.md`);
}

function buildEditorialInput(issue) {
  return issue.categories.map(({ section, items }) => ({
    section,
    items: items.map(({ title, url }) => ({ title, url })),
  }));
}

function parseModelJson(content) {
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

async function generateEditorial(issue) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('未提供 GITHUB_TOKEN，使用不含 AI 翻译的安全降级模板');
    return null;
  }

  const system = [
    '你是一名中文前端技术周刊编辑。',
    '写作要清楚、克制、实用：短段落、少用口号，不夸大，不捏造原文信息。',
    '只根据输入的标题、分类和链接整理内容。',
    '不得删除、增加或改变链接，不得声称阅读了链接正文。',
    '输出必须是严格 JSON，不要 Markdown 代码围栏。',
  ].join('\n');

  const user = JSON.stringify({
    task: [
      `整理“前端周刊第 ${issue.issue} 期（${issue.dateText}）”。`,
      '为每个英文标题提供简明准确的中文标题和一句中文推荐语。',
      '写 2～3 段推荐语，总计 220～420 字。',
      '写 1 段结语，总计 80～160 字。',
      '推荐语和结语只能概括目录呈现的主题，不要虚构文章细节。',
      'items 必须与输入逐项对应，顺序、section、url 完全不变。',
    ],
    outputSchema: {
      recommendation: 'string',
      conclusion: 'string',
      items: [{ section: 'string', url: 'string', zhTitle: 'string', description: 'string' }],
    },
    source: buildEditorialInput(issue),
  });

  console.log(`调用 GitHub Models：${MODEL}`);
  const response = await fetch('https://models.github.ai/inference/chat/completions', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`GitHub Models 请求失败：HTTP ${response.status} ${detail}`);
  }

  const result = await response.json();
  return parseModelJson(result.choices?.[0]?.message?.content || '');
}

function indexEditorialItems(editorial) {
  const map = new Map();
  for (const item of editorial?.items || []) {
    if (item?.url) map.set(item.url, item);
  }
  return map;
}

function buildMarkdown(issue, editorial) {
  const translated = indexEditorialItems(editorial);
  const recommendation = editorial?.recommendation?.trim() ||
    `本期收录了 ${issue.categories.reduce((sum, category) => sum + category.items.length, 0)} 篇前端相关文章，覆盖 Web 开发、CSS、JavaScript、框架与工程工具。以下目录保留原始链接，方便按主题阅读。`;
  const conclusion = editorial?.conclusion?.trim() ||
    '这一期的内容已经按主题整理完毕。建议先从与你当前项目最相关的分类开始，再把值得深入研究的文章加入阅读清单。';

  const sections = issue.categories.map(({ section, items }) => {
    const lines = items.map((item) => {
      const translatedItem = translated.get(item.url);
      const title = translatedItem?.zhTitle?.trim() || item.title;
      const description = translatedItem?.description?.trim() || '一篇值得关注的前端技术文章。';
      return `* [${title}](${item.url})：${description}`;
    });
    return `### ${section}\n\n${lines.join('\n')}`;
  });

  return `> 📢 **宣言**：**每周整理国外前端社区值得阅读的文章，帮助你跟进技术变化，也为写作和探索新方向提供线索。**
>
> 项目地址：<https://github.com/TUARAN/frontend-weekly-digest-cn>
>
> 在线阅读：<https://frontendweekly.cn/>

![前端周刊封面](https://raw.githubusercontent.com/TUARAN/frontend-weekly-digest-cn/main/img/bannerv2.png)

---

💬 **推荐语**

${recommendation}

---

## 🗂 本期精选目录

${sections.join('\n\n')}

---

## 结语

${conclusion}

---

原刊：[${issue.sourceTitle}](${issue.sourceUrl})
`;
}

function formatChineseDate(dateText) {
  const months = {
    april: '4月',
    august: '8月',
    december: '12月',
    february: '2月',
    january: '1月',
    july: '7月',
    june: '6月',
    march: '3月',
    may: '5月',
    november: '11月',
    october: '10月',
    september: '9月',
  };
  const normalized = dateText.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

  // Medium 偶尔会把跨月范围写成 “29 June 5 July 2026”，中间没有连字符。
  const crossMonth = normalized.match(
    /(\d{1,2})\s+([A-Za-z]+)\s*(?:-\s*)?(\d{1,2})\s+([A-Za-z]+)(?:\s+\d{4})?/,
  );
  if (crossMonth) {
    const startMonth = months[crossMonth[2].toLowerCase()];
    const endMonth = months[crossMonth[4].toLowerCase()];
    if (startMonth && endMonth) {
      return `${startMonth}${Number(crossMonth[1])}日–${endMonth}${Number(crossMonth[3])}日`;
    }
  }

  const range = normalized.match(/(\d{1,2})\s*(?:-\s*(\d{1,2})\s*)?([A-Za-z]+)(?:\s+\d{4})?/);
  if (!range) return dateText;

  const startDay = Number(range[1]);
  const endDay = Number(range[2] || range[1]);
  const month = months[range[3].toLowerCase()];
  if (!month) return dateText;

  return `${month}${startDay}日–${month}${endDay}日`;
}

function updateReadme(issue) {
  let readme = readFileSync(README_PATH, 'utf8');
  const entryPattern = new RegExp(`^- \\[第${issue.issue}期(?:（[^\\n]*?）)?\\]\\([^\\n]+\\)(?: ⭐ \\*\\*最新\\*\\*)?$`, 'm');
  if (entryPattern.test(readme)) return;

  readme = readme.replace(/ ⭐ \*\*最新\*\*/g, '');

  const marker = '### 2026年\n';
  if (!readme.includes(marker)) throw new Error('README 中未找到“### 2026年”');

  const date = formatChineseDate(issue.dateText);
  const entry = `\n- [第${issue.issue}期（${date}）](./weekly/${issue.issue}/前端周刊第${issue.issue}期.md) ⭐ **最新**\n`;
  readme = readme.replace(marker, `${marker}${entry}`);
  writeFileSync(README_PATH, readme);
}

async function syncIssue(issue) {
  if (existsSync(issuePath(issue.issue))) {
    console.log(`跳过第 ${issue.issue} 期：文件已存在`);
    return false;
  }

  console.log(`生成第 ${issue.issue} 期：${issue.dateText}`);
  const editorial = await generateEditorial(issue);
  const markdown = buildMarkdown(issue, editorial);
  const target = issuePath(issue.issue);

  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, markdown);
  updateReadme(issue);
  console.log(`已写入 ${target}`);
  return true;
}

async function main() {
  const rss = await fetchRss();
  const issues = parseRss(rss);
  if (issues.length === 0) throw new Error('RSS 中没有识别到 Frontend Weekly Digest');

  const missing = issues.filter((issue) => !existsSync(issuePath(issue.issue)));
  const selected = BACKFILL ? missing : missing.slice(-1);

  console.log(`RSS 含 ${issues.length} 期，缺失 ${missing.length} 期，本次处理 ${selected.length} 期`);
  if (selected.length === 0) {
    console.log('没有新一期，正常结束');
    return;
  }

  for (const issue of selected) await syncIssue(issue);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
