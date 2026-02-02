#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');
const { processUrl } = require('./fetch-articles');

const PORT = Number(process.env.PORT || 3005);
const HOST = process.env.HOST || '127.0.0.1';

const app = express();
app.use(express.json({ limit: '2mb' }));

const TOOL_ROOT = __dirname;
const UI_DIR = path.join(TOOL_ROOT, 'ui');
const OUTPUT_DIR = path.join(TOOL_ROOT, 'output');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

ensureDir(OUTPUT_DIR);

// In-memory job store (适用于本地工具；重启服务后会丢失)
const jobs = new Map();

function newJobId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseUrls(urlsText) {
  return (urlsText || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .map((l) => l.replace(/[\s\)\]\}>,.;:]+$/g, ''))
    .filter((l) => l && !l.startsWith('#') && /^https?:\/\//i.test(l));
}

app.get('/healthz', (req, res) => res.json({ ok: true }));

app.post('/api/jobs', async (req, res) => {
  const { urlsText } = req.body || {};
  const urls = parseUrls(urlsText);
  if (!urls.length) return res.status(400).json({ error: '没有找到有效的 URL' });

  const id = newJobId();
  const job = {
    id,
    createdAt: Date.now(),
    status: 'running', // running | done | error
    total: urls.length,
    done: 0,
    logs: [],
    results: [],
  };
  jobs.set(id, job);

  res.json({ id });

  // async run
  (async () => {
    try {
      job.logs.push(`开始处理：${urls.length} 个链接`);
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        job.logs.push(`[${i + 1}/${urls.length}] 抓取：${url}`);
        const result = await processUrl(url, i + 1, {
          outputDir: OUTPUT_DIR,
          imagesDir: path.join(OUTPUT_DIR, 'images'),
        });
        job.results.push({ url, ...result });
        job.done = i + 1;
        if (!result.success) job.logs.push(`[${i + 1}/${urls.length}] 失败：${result.error}`);

        if (i < urls.length - 1) await new Promise((r) => setTimeout(r, 1000));
      }
      const ok = job.results.filter((r) => r.success).length;
      job.logs.push(`完成：成功 ${ok}/${job.total}`);
      job.status = 'done';
    } catch (e) {
      job.status = 'error';
      job.logs.push(`任务异常：${e && e.message ? e.message : String(e)}`);
    }
  })();
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'job not found' });
  res.json(job);
});

// UI
app.use('/', express.static(UI_DIR));

// Output directory listing (simple HTML)
app.get('/output/', (req, res) => {
  try {
    ensureDir(OUTPUT_DIR);
    const entries = fs
      .readdirSync(OUTPUT_DIR, { withFileTypes: true })
      .filter((d) => d.name !== '.DS_Store')
      .map((d) => ({
        name: d.name,
        isDir: d.isDirectory(),
      }))
      .sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name));

    const items = entries
      .map((e) => {
        const href = `/output/${encodeURIComponent(e.name)}${e.isDir ? '/' : ''}`;
        return `<li><a href="${href}">${escapeHtml(e.name)}${e.isDir ? '/' : ''}</a></li>`;
      })
      .join('');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(`<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Output</title></head><body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif; padding: 16px;"><h1>tool/output</h1><ul>${items || '<li>(empty)</li>'}</ul></body></html>`);
  } catch (e) {
    res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
});

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Serve generated files (no index.html required)
app.use('/output', express.static(OUTPUT_DIR, {
  fallthrough: true,
  index: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store');
  },
}));

app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`UI: http://${HOST}:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Output: http://${HOST}:${PORT}/output/`);
});
