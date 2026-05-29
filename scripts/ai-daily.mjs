#!/usr/bin/env node
/**
 * 前端周看 · 每日精选 — GitHub Action 自动化脚本
 *
 * 工作流：
 *   1. 抓取 AI HOT API 过去 24h 精选动态
 *   2. 关键词筛选 AI Coding / 具身智能
 *   3. 模板化生成：HTML 卡片 + Manifest + LiveSignalBoard + MD Brief
 *
 * 运行：node scripts/ai-daily.mjs
 * 由 .github/workflows/ai-daily.yml 每日 09:00 CST 自动触发
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = resolve(ROOT, 'web/public');
const BRIEFS = resolve(ROOT, 'web/content/briefs');

// ============================================================
// 关键词配置
// ============================================================
// 正向关键词：匹配到得分+1
const AI_CODING_KW = [
  'Claude Code', 'Claude Opus', 'Codex', 'Cursor', 'GitHub Copilot',
  '代码Agent', '编程模型', '开发者工具', 'AI编程', 'AI 编程',
  'Anthropic', 'Copilot', 'IDE', '模型发布', '发布',
  'Step ', '阶跃星辰', 'DeepSeek', 'OpenAI', 'GPT-',
  'MCP', '工具调用', 'ClawEval', 'SWE-bench', '融资',
  'Agent', 'coding', 'benchmark', '代码', '编程',
];

const EMBODIED_KW = [
  '人形机器人', 'Figure', '宇树', '波士顿动力', '优必选',
  '具身智能', '机器人', 'embodied', 'Unitree',
  '智元', '傅利叶', '逐际动力', '银河通用',
];

// 负向关键词：匹配到得分-10（排除无关条目）
const NEGATIVE_KW = [
  'npm', 'pip install', 'release notes', 'patch', 'bugfix',
  'minor release', 'changelog', 'dependabot',
];

function classify(item) {
  const text = (item.title + ' ' + item.summary).toLowerCase();
  for (const kw of AI_CODING_KW) {
    if (text.includes(kw.toLowerCase())) return 'AI Coding';
  }
  for (const kw of EMBODIED_KW) {
    if (text.includes(kw.toLowerCase())) return '具身智能';
  }
  return null;
}

function relevanceScore(item) {
  const text = (item.title + ' ' + item.summary).toLowerCase();
  let score = 0;
  // 负向减分
  for (const kw of NEGATIVE_KW) {
    if (text.includes(kw.toLowerCase())) score -= 10;
  }
  // 版本号/库更新类型（如 "llm-anthropic 0.25.1"）→ 大幅减分
  if (/\d+\.\d+\.\d+/.test(text)) score -= 8;
  // 正向加分
  for (const kw of AI_CODING_KW) {
    if (text.includes(kw.toLowerCase())) score += 1;
  }
  for (const kw of EMBODIED_KW) {
    if (text.includes(kw.toLowerCase())) score += 1;
  }
  return score;
}

// ============================================================
// 关注原因模板（无 LLM，基于关键词匹配）
// ============================================================
function generateReason(item, topic) {
  const t = item.title + item.summary;
  if (t.includes('发布') || t.includes('推出') || t.includes('开源') || t.includes('上线'))
    return topic === 'AI Coding'
      ? '新能力发布直接影响开发者工具链，值得第一时间关注'
      : '新产品/模型发布可能改变具身智能竞争格局';
  if (t.includes('融资') || t.includes('IPO') || t.includes('估值') || t.includes('亿美元'))
    return '大额资本动向反映赛道景气度，影响长期技术投入';
  if (t.includes('报告') || t.includes('数据') || t.includes('调查'))
    return '行业数据揭示开发者行为趋势，辅助技术选型判断';
  if (t.includes('基准') || t.includes('评测') || t.includes('benchmark') || t.includes('得分'))
    return '评测结果为模型选型提供量化参考，影响实际落地决策';
  if (t.includes('收购') || t.includes('合并') || t.includes('合作'))
    return '行业整合信号值得关注，可能影响生态格局';
  return topic === 'AI Coding'
    ? '对 AI 开发者工具链有潜在影响，值得持续跟踪'
    : '具身智能领域关键信号，影响产业落地节奏';
}

// ============================================================
// Step 1: 抓取 AI HOT API
// ============================================================
async function fetchItems() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const url = `https://aihot.virxact.com/api/public/items?mode=selected&since=${encodeURIComponent(since)}&take=60`;

  console.log(`[1/6] 抓取 AI HOT API: since=${since}`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'frontend-weekly-digest-cn/1.0' },
  });

  if (!res.ok) throw new Error(`API 返回 ${res.status}`);
  const data = await res.json();
  const items = Array.isArray(data) ? data : (data.items || data.data || []);
  console.log(`  获取 ${items.length} 条动态`);
  return items;
}

// ============================================================
// Step 2: 关键词筛选
// ============================================================
function filterItems(items) {
  console.log('[2/6] 关键词筛选...');
  const scored = items
    .map(item => ({ item, topic: classify(item), score: relevanceScore(item) }))
    .filter(x => x.topic !== null)
    .sort((a, b) => b.score - a.score);

  const selected = scored.slice(0, 5);
  console.log(`  命中 ${scored.length} 条，选取前 ${selected.length} 条`);
  for (const s of selected) {
    console.log(`  [${s.topic}] ${s.item.title}`);
  }
  return selected;
}

// ============================================================
// Step 3: 模板化生成 HTML
// ============================================================
function getDayOfWeek(date) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[date.getDay()];
}

function getMMDD(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return m + d;
}

function getDisplayDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function getDateYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 提取所有数据的来源汇总
 */
function collectSources(selected) {
  const sources = new Set();
  for (const s of selected) {
    if (s.item.source) sources.add(s.item.source);
  }
  const arr = [...sources];
  if (arr.length <= 3) return arr.join(' · ');
  return arr.slice(0, 3).join(' · ') + ' 等';
}

// ============================================================
// Step 3: 构建结构化 JSON（前端用 DailyCard 组件渲染）
// ============================================================
function buildDayData(selected, date) {
  return {
    date: getDateYMD(date),
    displayDate: getDisplayDate(date),
    dateNum: getMMDD(date),
    year: date.getFullYear(),
    dayOfWeek: getDayOfWeek(date),
    topics: [...new Set(selected.map(s => s.topic))],
    sources: collectSources(selected),
    count: selected.length,
    highlights: selected.map(s => s.item.title.slice(0, 20)),
    items: selected.map((s, i) => ({
      num: String(i + 1).padStart(2, '0'),
      topic: s.topic,
      title: s.item.title,
      summary: s.item.summary || '',
      reason: generateReason(s.item, s.topic),
    })),
  };
}

// ============================================================
// Step 4: 更新 Manifest
// ============================================================
function updateManifest(selected, date) {
  console.log('[4/6] 更新 manifest.json...');
  const manifestPath = resolve(PUBLIC, 'ai-daily-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  const ymd = getDateYMD(date);
  const displayDate = getDisplayDate(date);
  const json = `/ai-daily/${ymd}.json`;
  const highlights = selected.map(s => s.item.title.slice(0, 20));

  const entry = { date: ymd, displayDate, json, count: selected.length, highlights };

  // 幂等：同日期替换，否则追加
  const idx = manifest.list.findIndex(e => e.date === ymd);
  if (idx >= 0) {
    manifest.list[idx] = entry;
    console.log(`  替换已有条目: ${ymd}`);
  } else {
    manifest.list.push(entry);
    console.log(`  追加新条目: ${ymd}`);
  }

  // 按日期排序（最新在前）
  manifest.list.sort((a, b) => b.date.localeCompare(a.date));
  manifest.latest = ymd;

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`  共 ${manifest.list.length} 期，latest=${manifest.latest}`);
  return { entry, manifest };
}


// ============================================================
// Step 6: 生成 MD Brief
// ============================================================
function generateBriefMD(selected, date) {
  console.log('[6/6] 生成 MD brief...');
  const ymd = getDateYMD(date);
  const mmdd = getMMDD(date);
  const year = date.getFullYear();
  const count = selected.length;

  // tldr
  const coreKeywords = selected.map(s => {
    const t = s.item.title;
    if (t.length <= 15) return t;
    return t.slice(0, 15) + '…';
  }).join('、');

  const tags = ['AI Coding'];
  if (selected.some(s => s.topic === '具身智能')) tags.push('具身智能');
  tags.push('每日精选');

  const itemsMd = selected.map((s, i) => {
    const item = s.item;
    const reason = generateReason(item, s.topic);
    return `### ${i + 1}. ${item.title}

**分类**：${s.topic} · **来源**：${item.source || 'AI HOT'}

${item.summary}

> ${reason}

[阅读原文](${item.url || '#'})

---`;
  }).join('\n\n');

  return `---
title: 每日精选 · ${year}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日
slug: ai-daily-${ymd.replace(/-/g, '')}
date: ${ymd}
category: 每日精选
tldr: 今日精选 ${count} 条 AI 动态：${coreKeywords}
readMinutes: 3
pro: false
tags:
  - ${tags.join('\n  - ')}
---

> 每日精选 AI Coding & 具身智能领域最值得关注的动态，by 安东尼 · 前端周看

## 今日精选

${itemsMd}

## 关于本栏目

「前端周看 · 每日精选」每天精选 AI Coding & 具身智能领域的核心动态，帮助前端开发者高效追踪 AI 进展。

by 安东尼 · [前端周看](https://frontend-weekly-digest-cn.vercel.app)
`;
}

// ============================================================
// 写入文件
// ============================================================
function writeOutputs(selected, date) {
  const ymd = getDateYMD(date);

  // 结构化 JSON（前端 DailyCard 组件渲染）
  const jsonDir = resolve(PUBLIC, 'ai-daily');
  mkdirSync(jsonDir, { recursive: true });
  const jsonPath = resolve(jsonDir, `${ymd}.json`);
  writeFileSync(jsonPath, JSON.stringify(buildDayData(selected, date), null, 2) + '\n');
  console.log(`  ✅ JSON → ${jsonPath}`);

  // MD Brief
  const mdPath = resolve(BRIEFS, `ai-daily-${ymd.replace(/-/g, '')}.md`);
  const md = generateBriefMD(selected, date);
  writeFileSync(mdPath, md);
  console.log(`  ✅ MD Brief → ${mdPath}`);
}

// ============================================================
// 主流程
// ============================================================
async function main() {
  const date = new Date();
  console.log(`\n🚀 前端周看 · 每日精选 | ${date.toISOString()}\n`);

  // 1. 抓取
  const items = await fetchItems();

  // 2. 筛选
  const selected = filterItems(items);

  if (selected.length === 0) {
    console.log('\n⚠️ 今日无匹配内容，跳过生成');
    // 写入空标记，避免后续步骤报错
    return;
  }

  // 3. 生成 & 写入
  writeOutputs(selected, date);

  // 4. 更新 Manifest
  updateManifest(selected, date);

  console.log(`\n✅ 完成！共 ${selected.length} 条动态\n`);
}

main().catch(err => {
  console.error('\n❌ 执行失败:', err.message);
  process.exit(1);
});
