import assert from 'node:assert/strict'
import test from 'node:test'

import { publishRuntimeFeeds } from './src/index.js'

class FakeBucket {
  constructor() {
    this.objects = new Map()
  }

  async get(key) {
    const value = this.objects.get(key)
    return value ? { text: async () => value.body } : null
  }

  async put(key, body, options) {
    this.objects.set(key, { body, options })
  }
}

const sourceItems = [
  {
    id: '1',
    category: 'agent',
    title: 'OpenAI 发布 Agent 编程工具',
    summary: '开发者可以在代码仓库中运行任务。',
    source: 'Example',
    url: 'https://example.com/agent',
    publishedAt: '2026-07-31T00:30:00.000Z',
  },
]

test('hourly run writes live data and 01:00 UTC run also writes daily data', async (t) => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => Response.json({ items: sourceItems })
  t.after(() => {
    globalThis.fetch = originalFetch
  })

  const bucket = new FakeBucket()
  const env = { CONTENT_FEED: bucket }

  const hourly = await publishRuntimeFeeds(env, Date.parse('2026-07-31T00:00:00.000Z'))
  assert.deepEqual(hourly, { live: 1, daily: null })
  assert.ok(bucket.objects.has('frontend-weekly/live/current.json'))
  assert.equal(bucket.objects.has('frontend-weekly/daily/index.json'), false)

  const daily = await publishRuntimeFeeds(env, Date.parse('2026-07-31T01:00:00.000Z'))
  assert.deepEqual(daily, { live: 1, daily: 1 })
  assert.ok(bucket.objects.has('frontend-weekly/daily/2026-07-31.json'))
  assert.equal(
    JSON.parse(bucket.objects.get('frontend-weekly/daily/index.json').body).latest,
    '2026-07-31',
  )
})
