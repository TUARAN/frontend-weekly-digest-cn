#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const API = process.env.FRONTEND_WEEKLY_INGEST_URL || 'https://2aran.com/api/frontend-weekly/ingest'
const AUDIENCE = API
const MODE = process.argv.find((arg) => ['live', 'daily', 'weekly'].includes(arg))
const DRY_RUN = process.argv.includes('--dry-run')
const OUTPUT_ARG = process.argv.find((arg) => arg.startsWith('--output='))
const OUTPUT = OUTPUT_ARG ? resolve(OUTPUT_ARG.slice('--output='.length)) : ''
const CATEGORY = {
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
}
const KEYWORDS = ['Claude Code', 'Codex', 'Cursor', 'Copilot', 'Anthropic', 'OpenAI', 'DeepSeek', 'Agent', 'MCP', 'AI 编程', '代码', '编程', '具身智能', '机器人', 'Figure', '宇树']
const NEGATIVE = ['npm', 'pip install', 'release notes', 'patch', 'bugfix', 'dependabot']

function plain(text) {
  return String(text || '').replace(/!?(\[[^\]]*\])\([^)]*\)/g, '$1').replace(/[*_`>#]/g, '').replace(/\n{3,}/g, '\n\n').trim()
}

async function fetchAiHot() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const response = await fetch(`https://aihot.virxact.com/api/public/items?mode=selected&since=${encodeURIComponent(since)}&take=60`, {
    headers: { 'User-Agent': 'frontend-weekly-digest-cn/2aran-pipeline' },
  })
  if (!response.ok) throw new Error(`AI HOT API returned ${response.status}`)
  const payload = await response.json()
  return Array.isArray(payload) ? payload : payload.items || payload.data || []
}

function livePayload(items) {
  const seen = new Set()
  const normalized = items.filter((item) => {
    const key = item?.id || item?.url || item?.title
    if (!key || !item?.title || !item?.url || seen.has(key)) return false
    seen.add(key)
    return true
  }).map((item) => ({
    topic: CATEGORY[String(item.category || '').toLowerCase()] || '资讯',
    title: item.title,
    summary: item.summary || '',
    source: item.source || 'AI HOT',
    href: item.url,
    publishedAt: item.publishedAt || null,
  })).sort((a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0)).slice(0, 30)
  if (!normalized.length) throw new Error('No live items found')
  return { updatedAt: new Date().toISOString(), items: normalized }
}

function score(item) {
  const text = `${item.title || ''} ${item.summary || ''}`.toLowerCase()
  return KEYWORDS.reduce((total, keyword) => total + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0)
    - NEGATIVE.reduce((total, keyword) => total + (text.includes(keyword) ? 10 : 0), 0)
}

function dailyTopic(item) {
  const text = `${item.title || ''} ${item.summary || ''}`.toLowerCase()
  return /具身智能|机器人|embodied|figure|宇树/.test(text) ? '具身智能' : 'AI Coding'
}

function dailyReason(item) {
  const text = `${item.title || ''} ${item.summary || ''}`
  if (/发布|推出|开源|上线/.test(text)) return '新能力发布直接影响开发者工具链，值得第一时间关注'
  if (/融资|IPO|估值|亿美元/.test(text)) return '资本动向反映赛道景气度，影响长期技术投入'
  if (/报告|数据|调查|评测|基准|benchmark/i.test(text)) return '行业数据与评测为技术选型提供参考'
  return '对 AI 开发与前端工具链有潜在影响，值得持续跟踪'
}

function dailyPayload(items) {
  const selected = items
    .filter((item) => item?.title && item?.url)
    .map((item) => ({ item, score: score(item) }))
    .filter(({ score: value }) => value > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ item }, index) => ({
      num: String(index + 1).padStart(2, '0'),
      topic: dailyTopic(item),
      title: item.title,
      summary: item.summary || '',
      reason: dailyReason(item),
      href: item.url,
      source: item.source || 'AI HOT',
    }))
  if (!selected.length) throw new Error('No daily items found')
  const now = new Date()
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  return {
    date,
    displayDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Shanghai' }).format(now),
    count: selected.length,
    highlights: selected.map((item) => item.title.slice(0, 26)),
    items: selected,
  }
}

function parseIssue(file, markdown) {
  const id = Number(file.match(/weekly\/(\d+)\//)?.[1])
  const recommendation = plain((markdown.match(/💬\s*\*\*推荐语\*\*\s*([\s\S]*?)(?=^##\s)/m) || [])[1] || '').slice(0, 2500)
  const sections = [...markdown.matchAll(/^###\s+(.+?)\n([\s\S]*?)(?=^###\s+|^##\s+|(?![\s\S]))/gm)].map((match) => ({
    title: plain(match[1]),
    items: [...match[2].matchAll(/^\s*[*-]\s+\[([^\]]+)]\((https?:\/\/[^)]+)\)(?:：\s*(.*))?$/gm)].map((item) => ({
      title: item[1],
      href: item[2],
      summary: plain(item[3] || ''),
    })),
  })).filter((section) => section.items.length)
  return {
    id,
    title: `前端周刊第${id}期`,
    recommendation,
    sections,
    source: `https://github.com/TUARAN/frontend-weekly-digest-cn/blob/main/${file.split('/').map(encodeURIComponent).join('/')}`,
  }
}

function weeklyPayload() {
  const root = process.cwd()
  const files = readdirSync(join(root, 'weekly'), { recursive: true })
    .map((file) => `weekly/${String(file).replaceAll('\\', '/')}`)
    .filter((file) => /^weekly\/\d+\/前端周刊第\d+期\.md$/.test(file))
  const issues = files.map((file) => parseIssue(file, readFileSync(join(root, file), 'utf8'))).sort((a, b) => b.id - a.id)
  if (!issues.length) throw new Error('No weekly issues found')
  return { updatedAt: new Date().toISOString(), source: 'TUARAN/frontend-weekly-digest-cn', issues }
}

async function oidcToken() {
  const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN
  if (!requestUrl || !requestToken) throw new Error('GitHub Actions OIDC environment is missing')
  const separator = requestUrl.includes('?') ? '&' : '?'
  const response = await fetch(`${requestUrl}${separator}audience=${encodeURIComponent(AUDIENCE)}`, {
    headers: { Authorization: `bearer ${requestToken}` },
  })
  if (!response.ok) throw new Error(`OIDC token request returned ${response.status}`)
  const payload = await response.json()
  if (!payload.value) throw new Error('OIDC token response is empty')
  return payload.value
}

async function main() {
  if (!MODE) throw new Error('Usage: node scripts/publish-2aran-feed.mjs <live|daily|weekly> [--dry-run] [--output=file]')
  let data
  if (MODE === 'weekly') data = weeklyPayload()
  else {
    const items = await fetchAiHot()
    data = MODE === 'live' ? livePayload(items) : dailyPayload(items)
  }
  const body = { type: MODE, data }
  if (OUTPUT) writeFileSync(OUTPUT, `${JSON.stringify(body, null, 2)}\n`)
  if (DRY_RUN) {
    console.log(`Validated ${MODE} payload (${MODE === 'weekly' ? data.issues.length : data.items.length} items)`)
    return
  }
  const token = await oidcToken()
  const response = await fetch(API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const result = await response.text()
  if (!response.ok) throw new Error(`2aran ingest returned ${response.status}: ${result}`)
  console.log(result)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
