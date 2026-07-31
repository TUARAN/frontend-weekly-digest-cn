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

export async function fetchAiHot() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const response = await fetch(`https://aihot.virxact.com/api/public/items?mode=selected&since=${encodeURIComponent(since)}&take=60`, {
    headers: { 'User-Agent': 'frontend-weekly-digest-cn/2aran-pipeline' },
  })
  if (!response.ok) throw new Error(`AI HOT API returned ${response.status}`)
  const payload = await response.json()
  return Array.isArray(payload) ? payload : payload.items || payload.data || []
}

export function livePayload(items) {
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

export function dailyPayload(items, now = new Date()) {
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
