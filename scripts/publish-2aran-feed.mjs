#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { dailyPayload, fetchAiHot, livePayload } from '../feed-pipeline/payload.js'

const API = process.env.FRONTEND_WEEKLY_INGEST_URL || 'https://2aran.com/api/frontend-weekly/ingest'
const AUDIENCE = API
const MODE = process.argv.find((arg) => ['live', 'daily', 'weekly'].includes(arg))
const DRY_RUN = process.argv.includes('--dry-run')
const OUTPUT_ARG = process.argv.find((arg) => arg.startsWith('--output='))
const OUTPUT = OUTPUT_ARG ? resolve(OUTPUT_ARG.slice('--output='.length)) : ''
function plain(text) {
  return String(text || '').replace(/!?(\[[^\]]*\])\([^)]*\)/g, '$1').replace(/[*_`>#]/g, '').replace(/\n{3,}/g, '\n\n').trim()
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
