export interface ShareTemplatePayload {
  kind: 'live' | 'daily' | 'format' | 'weekly' | 'other';
  title: string;
  summary?: string;
  source?: string;
  date?: string;
  tier?: string;
  href?: string;
}

/**
 * Build a short share URL.
 *
 * `live`: ?k=l&u=<href> — share page looks up item in /ai-hot-feed.json
 * `daily`: callers should share /share/ai-daily?date=... directly (don't use this)
 * other kinds: fall back to legacy long format (still supported for backward compat)
 */
export function buildShareTemplatePath(payload: ShareTemplatePayload): string {
  if (payload.kind === 'live' && payload.href) {
    const p = new URLSearchParams();
    p.set('k', 'l');
    p.set('u', payload.href);
    return `/share/template?${p.toString()}`;
  }

  const params = new URLSearchParams();
  params.set('kind', payload.kind);
  params.set('title', payload.title);
  if (payload.summary) params.set('summary', payload.summary);
  if (payload.source) params.set('source', payload.source);
  if (payload.date) params.set('date', payload.date);
  if (payload.tier) params.set('tier', payload.tier);
  if (payload.href) params.set('href', payload.href);
  return `/share/template?${params.toString()}`;
}

export function resolveShareKindLabel(kind: string): string {
  switch (kind) {
    case 'live':
      return '7×24 实时资讯';
    case 'daily':
      return '每日精选';
    case 'format':
      return '内容形态';
    case 'weekly':
      return '前端周刊';
    default:
      return '前端周看分享';
  }
}
