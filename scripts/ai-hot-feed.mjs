#!/usr/bin/env node
/**
 * 前端周看 · 7×24 小时资讯 — 抓取脚本
 *
 * 由 GitHub Action 每 30 分钟运行一次：
 *   1. 抓取 AI HOT API 近期动态
 *   2. 归一化 + 去重 + 按时间倒序
 *   3. 写入 web/public/ai-hot-feed.json（前端同源读取）
 *
 * AI HOT API 拒绝浏览器跨域请求，因此只能在服务端抓取后落地为静态 JSON。
 */
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'web/public/ai-hot-feed.json');

const TAKE = 60;
const MAX_ITEMS = 30;
const WINDOW_HOURS = 24;

const CATEGORY_LABEL = {
  tip: '技巧',
  industry: '行业',
  'ai-models': '模型',
  'ai-products': '产品',
  paper: '论文',
  news: '资讯',
  tool: '工具',
  opensource: '开源',
  funding: '融资',
  research: '研究',
  agent: 'Agent',
};

function topicOf(item) {
  const c = (item.category || '').toLowerCase();
  return CATEGORY_LABEL[c] || (c ? c.toUpperCase() : '资讯');
}

async function fetchItems() {
  const since = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const url = `https://aihot.virxact.com/api/public/items?mode=selected&since=${encodeURIComponent(since)}&take=${TAKE}`;
  console.log(`抓取 AI HOT API: since=${since}`);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'frontend-weekly-digest-cn/1.0' },
  });
  if (!res.ok) throw new Error(`API 返回 ${res.status}`);

  const data = await res.json();
  const items = Array.isArray(data) ? data : data.items || data.data || [];
  console.log(`  获取 ${items.length} 条`);
  return items;
}

function normalize(items) {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const key = item.id || item.url || item.title;
    if (!key || seen.has(key)) continue;
    if (!item.title || !item.url) continue;
    seen.add(key);

    out.push({
      topic: topicOf(item),
      title: item.title,
      summary: item.summary || '',
      source: item.source || 'AI HOT',
      href: item.url,
      publishedAt: item.publishedAt || null,
    });
  }

  out.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  return out.slice(0, MAX_ITEMS);
}

async function main() {
  console.log(`\n🛰️  前端周看 · 7×24 小时资讯 | ${new Date().toISOString()}\n`);
  const raw = await fetchItems();
  const items = normalize(raw);

  if (items.length === 0) {
    console.log('⚠️ 无可用动态，跳过写入（保留上一次结果）');
    return;
  }

  const payload = { updatedAt: new Date().toISOString(), count: items.length, items };
  writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n');
  console.log(`✅ 写入 ${items.length} 条 → ${OUT}\n`);
}

main().catch((err) => {
  console.error('\n❌ 执行失败:', err.message);
  process.exit(1);
});
