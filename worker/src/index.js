import { dailyPayload, fetchAiHot, livePayload } from '../../feed-pipeline/payload.js'

const KEYS = {
  live: 'frontend-weekly/live/current.json',
  dailyIndex: 'frontend-weekly/daily/index.json',
}

async function readJson(bucket, key, fallback) {
  const object = await bucket.get(key)
  if (!object) return fallback
  try {
    return JSON.parse(await object.text())
  } catch {
    return fallback
  }
}

async function writeJson(bucket, key, value, cacheControl) {
  await bucket.put(key, JSON.stringify(value), {
    httpMetadata: {
      contentType: 'application/json; charset=utf-8',
      cacheControl,
    },
  })
}

function mergeDailyManifest(current, daily) {
  const previous = Array.isArray(current?.list) ? current.list : []
  const entry = {
    date: daily.date,
    displayDate: daily.displayDate,
    count: daily.count,
    highlights: daily.highlights,
  }
  return {
    latest: daily.date,
    list: [entry, ...previous.filter((item) => item?.date !== daily.date)]
      .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item?.date || ''))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 400),
  }
}

export async function publishRuntimeFeeds(env, scheduledTime = Date.now()) {
  const items = await fetchAiHot()
  const live = livePayload(items)
  await writeJson(env.CONTENT_FEED, KEYS.live, live, 'public, max-age=300')

  const scheduledAt = new Date(scheduledTime)
  if (scheduledAt.getUTCHours() !== 1) {
    return { live: live.items.length, daily: null }
  }

  const daily = dailyPayload(items, scheduledAt)
  const current = await readJson(env.CONTENT_FEED, KEYS.dailyIndex, { latest: '', list: [] })
  const manifest = mergeDailyManifest(current, daily)
  await Promise.all([
    writeJson(env.CONTENT_FEED, `frontend-weekly/daily/${daily.date}.json`, daily, 'public, max-age=31536000, immutable'),
    writeJson(env.CONTENT_FEED, KEYS.dailyIndex, manifest, 'public, max-age=3600'),
  ])
  return { live: live.items.length, daily: daily.items.length }
}

export default {
  async fetch() {
    return Response.json({
      ok: true,
      service: 'frontend-weekly-feed',
      schedule: 'hourly; daily snapshot at 01:00 UTC',
    })
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(publishRuntimeFeeds(env, controller.scheduledTime))
  },
}
