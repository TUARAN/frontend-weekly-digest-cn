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

import { writeFileSync, readFileSync } from 'fs';
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

function renderNewsItem(item, topic, index) {
  const num = String(index + 1).padStart(2, '0');
  const cls = topic === 'AI Coding' ? 'coding' : 'embodied';
  const catLabel = topic === 'AI Coding' ? 'AI Coding' : '具身智能';
  const reason = generateReason(item, topic);

  // 提取来源名称
  const source = item.source || 'AI HOT';

  return `
    <!-- ${num} -->
    <div class="news-item ${cls}">
      <div class="news-meta">
        <div class="news-num">${num}</div>
        <span class="news-cat">${catLabel}</span>
      </div>
      <div class="news-title">${escapeHtml(item.title)}</div>
      <div class="news-desc">
        ${highlightNumbers(escapeHtml(item.summary))}
      </div>
      <div class="reason-row">
        <span class="reason-icon">→</span>
        <span class="reason-text">${escapeHtml(reason)}</span>
      </div>
    </div>`;
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightNumbers(text) {
  // 高亮数字、百分比、金额
  return text.replace(
    /(\d[\d,.]*(?:%|亿|万|倍|美元|分|行)?)/g,
    '<span class="news-highlight">$1</span>'
  );
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

function generateHTML(selected, date) {
  const mmdd = getMMDD(date);
  const weekday = getDayOfWeek(date);
  const year = date.getFullYear();
  const sources = collectSources(selected);
  const newsHtml = selected.map((s, i) => renderNewsItem(s.item, s.topic, i)).join('\n');
  const totalCount = selected.length;
  const codingCount = selected.filter(s => s.topic === 'AI Coding').length;
  const embodiedCount = selected.filter(s => s.topic === '具身智能').length;

  // 动态标签行
  let tagRow = '';
  if (codingCount > 0) {
    tagRow += '    <span class="tag tag-coding"># AI CODING</span>\n';
  }
  if (embodiedCount > 0) {
    tagRow += '    <span class="tag tag-embodied"># 具身智能</span>\n';
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>每日精选 ${year}·${mmdd}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 500px;
    min-height: 100%;
    background: #0d0d12;
    font-family: -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif;
    color: #fff;
    padding: 0;
  }

  .card {
    width: 500px;
    background: #0d0d12;
    position: relative;
    overflow: hidden;
    padding: 40px 36px 44px;
  }

  /* 装饰性光斑 */
  .glow-1 {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(100,120,255,0.13) 0%, transparent 70%);
    top: -80px;
    right: -60px;
    pointer-events: none;
  }
  .glow-2 {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,210,150,0.09) 0%, transparent 70%);
    bottom: 60px;
    left: -40px;
    pointer-events: none;
  }

  /* 顶部 header */
  .header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 28px;
    position: relative;
    z-index: 2;
  }

  .badge {
    display: inline-block;
    background: linear-gradient(135deg, #5c6ef8, #7c5cf8);
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    padding: 3px 10px;
    border-radius: 20px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .main-title {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.15;
    color: #fff;
    letter-spacing: -0.5px;
  }
  .main-title span {
    color: #6c7ff8;
  }

  .date-block {
    text-align: right;
  }
  .date-num {
    font-size: 36px;
    font-weight: 700;
    color: rgba(255,255,255,0.08);
    line-height: 1;
    letter-spacing: -1px;
  }
  .date-label {
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  /* 分割线 */
  .divider {
    height: 1px;
    background: linear-gradient(to right, rgba(108,127,248,0.6), rgba(108,127,248,0.1), transparent);
    margin-bottom: 24px;
    position: relative;
    z-index: 2;
  }

  /* 标签区 */
  .tag-row {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    position: relative;
    z-index: 2;
  }
  .tag {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.8px;
    padding: 3px 10px;
    border-radius: 12px;
    border: 1px solid;
  }
  .tag-coding {
    color: #6c9af8;
    border-color: rgba(108,154,248,0.35);
    background: rgba(108,154,248,0.08);
  }
  .tag-embodied {
    color: #50d4a0;
    border-color: rgba(80,212,160,0.35);
    background: rgba(80,212,160,0.08);
  }

  /* 新闻列表 */
  .news-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
    z-index: 2;
  }

  .news-item {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 16px 18px;
    position: relative;
    overflow: hidden;
  }

  .news-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    border-radius: 12px 0 0 12px;
  }
  .news-item.coding::before { background: #6c9af8; }
  .news-item.embodied::before { background: #50d4a0; }

  .news-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .news-num {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .coding .news-num { background: rgba(108,154,248,0.2); color: #6c9af8; }
  .embodied .news-num { background: rgba(80,212,160,0.2); color: #50d4a0; }

  .news-cat {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.6px;
    padding: 2px 7px;
    border-radius: 8px;
  }
  .coding .news-cat { color: #6c9af8; background: rgba(108,154,248,0.1); }
  .embodied .news-cat { color: #50d4a0; background: rgba(80,212,160,0.1); }

  .news-title {
    font-size: 13.5px;
    font-weight: 600;
    color: #f0f0f4;
    line-height: 1.45;
    margin-bottom: 7px;
  }

  .news-desc {
    font-size: 11.5px;
    color: rgba(255,255,255,0.45);
    line-height: 1.6;
    word-break: break-word;
  }

  .news-highlight {
    display: inline;
    color: rgba(255,255,255,0.7);
    font-weight: 500;
  }

  /* 原因标签 */
  .reason-row {
    margin-top: 9px;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }
  .reason-icon {
    font-size: 10px;
    color: rgba(255,200,60,0.8);
    flex-shrink: 0;
    margin-top: 1px;
  }
  .reason-text {
    font-size: 11px;
    color: rgba(255,200,60,0.65);
    line-height: 1.5;
    font-style: italic;
  }

  /* 底部 */
  .footer {
    margin-top: 24px;
    position: relative;
    z-index: 2;
  }
  .footer-ip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 10px 14px;
    background: rgba(108,127,248,0.08);
    border: 1px solid rgba(108,127,248,0.2);
    border-radius: 10px;
  }
  .ip-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ip-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6c7ff8, #50d4a0);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }
  .ip-name {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.8);
    letter-spacing: 0.3px;
  }
  .ip-slogan {
    font-size: 10px;
    color: rgba(255,255,255,0.35);
    margin-top: 1px;
    letter-spacing: 0.2px;
  }
  .ip-tag {
    font-size: 10px;
    color: #6c9af8;
    background: rgba(108,154,248,0.12);
    border: 1px solid rgba(108,154,248,0.25);
    padding: 2px 8px;
    border-radius: 8px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .footer-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .footer-left {
    font-size: 10px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.5px;
  }
  .footer-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #6c7ff8;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .footer-brand {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.5px;
  }
</style>
</head>
<body>
<div class="card">
  <div class="glow-1"></div>
  <div class="glow-2"></div>

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="badge">AI DAILY</div>
      <div class="main-title">每日<span>精选</span></div>
    </div>
    <div class="date-block">
      <div class="date-num">${mmdd}</div>
      <div class="date-label">${year} · ${weekday}</div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- Tags -->
  <div class="tag-row">
${tagRow}  </div>

  <!-- News -->
  <div class="news-list">
${newsHtml}
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-ip">
      <div class="ip-left">
        <div class="ip-avatar">安</div>
        <div>
          <div class="ip-name">前端周看 · 每日精选</div>
          <div class="ip-slogan">by 安东尼 · 每日精选 AI Coding &amp; 具身智能动态</div>
        </div>
      </div>
      <span class="ip-tag">Daily</span>
    </div>
    <div class="footer-meta">
      <span class="footer-left">数据来源：${escapeHtml(sources)} · AI HOT</span>
      <div class="footer-right">
        <div class="dot"></div>
        <span class="footer-brand">Auto Generated</span>
      </div>
    </div>
  </div>
</div>
</body>
</html>
`;
}

// ============================================================
// Step 4: 更新 Manifest
// ============================================================
function updateManifest(selected, date) {
  console.log('[4/6] 更新 manifest.json...');
  const manifestPath = resolve(PUBLIC, 'ai-daily-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  const ymd = getDateYMD(date);
  const mmdd = getMMDD(date);
  const displayDate = getDisplayDate(date);
  const file = `/ai-daily-${mmdd}.html`;
  const highlights = selected.map(s => s.item.title.slice(0, 20));

  const entry = { date: ymd, displayDate, file, count: selected.length, highlights };

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
  const mmdd = getMMDD(date);
  const ymd = getDateYMD(date);

  // HTML
  const htmlPath = resolve(PUBLIC, `ai-daily-${mmdd}.html`);
  const html = generateHTML(selected, date);
  writeFileSync(htmlPath, html);
  console.log(`  ✅ HTML → ${htmlPath}`);

  // Manifest（在 updateManifest 内部已写入）
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
