function sanitizeUrl(raw) {
  return raw.replace(/[\s)\]}>.,;:]+$/g, '').trim();
}

function isLikelyArticleUrl(url) {
  const lower = (url || '').toLowerCase();
  if (!/^https?:\/\//i.test(lower)) return false;
  if (/\.(png|jpe?g|gif|webp|svg|mp4|mov|webm|mp3|pdf|zip)(\?|#|$)/i.test(lower)) return false;
  return true;
}

function extractUrlsFromMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') return [];
  // regex to match http(s) URLs, avoid trailing punctuation
  const regex = /https?:\/\/[\w\-./?%&=#~:+@!,$'()\[\]*;]+/gi;
  const urls = new Set();
  for (const match of markdown.matchAll(regex)) {
    const cleaned = sanitizeUrl(match[0]);
    if (isLikelyArticleUrl(cleaned)) urls.add(cleaned);
  }
  return Array.from(urls);
}

function extractLinksWithText(markdown) {
  // Support Markdown link syntax [text](url) and bare urls
  const result = [];
  if (!markdown || typeof markdown !== 'string') return result;

  // first, capture markdown links [text](url)
  const mdLinkRe = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gi;
  for (const m of markdown.matchAll(mdLinkRe)) {
    const text = (m[1] || '').trim();
    const url = sanitizeUrl(m[2] || '');
    if (isLikelyArticleUrl(url)) result.push({ text, url });
  }

  // capture bare urls not already captured
  const urlRe = /https?:\/\/[\w\-./?%&=#~:+@!,$'()\[\]*;]+/gi;
  const seen = new Set(result.map(r => r.url));
  for (const m of markdown.matchAll(urlRe)) {
    const url = sanitizeUrl(m[0] || '');
    if (isLikelyArticleUrl(url) && !seen.has(url)) {
      // try to extract a nearby title by searching the same line
      const idx = m.index || 0;
      const before = markdown.slice(Math.max(0, idx - 80), idx).split('\n').pop().trim();
      const after = markdown.slice(idx + url.length, idx + url.length + 80).split('\n')[0].trim();
      const inferred = before || after || '';
      result.push({ text: inferred, url });
      seen.add(url);
    }
  }

  return result;
}

module.exports = { extractUrlsFromMarkdown, sanitizeUrl, isLikelyArticleUrl, extractLinksWithText };
