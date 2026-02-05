#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  processUrl,
  extractUrlsFromMarkdown,
  findWeeklyIssues,
  findIssueMainMarkdown,
} = require('./fetch-articles');

const PORT = Number(process.env.PORT || 3005);
const HOST = process.env.HOST || '127.0.0.1';

const app = express();
app.use(express.json({ limit: '2mb' }));

const TOOL_ROOT = __dirname;
const UI_DIR = path.join(TOOL_ROOT, 'ui');
const OUTPUT_DIR = path.join(TOOL_ROOT, 'output');
const WEEKLY_DIR = path.join(TOOL_ROOT, '..', 'weekly');

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
  const { urlsText, mode, issue, weeklyPath, downloadImages } = req.body || {};

  const useWeekly = mode === 'weekly';
  const urls = useWeekly ? [] : parseUrls(urlsText);

  if (!useWeekly && !urls.length) {
    return res.status(400).json({ error: '没有找到有效的 URL' });
  }

  const id = newJobId();
  const job = {
    id,
    createdAt: Date.now(),
    status: 'running', // running | done | error
    total: useWeekly ? 0 : urls.length,
    done: 0,
    logs: [],
    results: [],
  };
  jobs.set(id, job);

  res.json({ id });

  // async run
  (async () => {
    try {
      if (useWeekly) {
        const targetWeeklyPath = weeklyPath ? path.resolve(weeklyPath) : WEEKLY_DIR;
        const issueFilter = issue ? String(issue) : null;
        const issues = findWeeklyIssues(targetWeeklyPath, issueFilter);
        if (!issues.length) throw new Error('没有找到可处理的周刊目录');

        const tasks = [];
        for (const issueNumber of issues) {
          const issueDir = path.join(targetWeeklyPath, issueNumber);
          const mainMdPath = findIssueMainMarkdown(issueDir, issueNumber);
          if (!mainMdPath) {
            job.logs.push(`跳过第 ${issueNumber} 期：未找到周刊 Markdown 文件`);
            continue;
          }

          const markdown = fs.readFileSync(mainMdPath, 'utf-8');
          const issueUrls = extractUrlsFromMarkdown(markdown);
          if (!issueUrls.length) {
            job.logs.push(`跳过第 ${issueNumber} 期：未找到可抓取链接`);
            continue;
          }

          issueUrls.forEach((url) => tasks.push({ issue: issueNumber, url }));
        }

        if (!tasks.length) throw new Error('没有找到可抓取链接');

        job.total = tasks.length;
        job.logs.push(`开始处理：${tasks.length} 个链接`);

        for (let i = 0; i < tasks.length; i++) {
          const { issue: issueNumber, url } = tasks[i];
          job.logs.push(`[${i + 1}/${tasks.length}] 第 ${issueNumber} 期：${url}`);

          const issueDir = path.join(targetWeeklyPath, issueNumber);
          const issueImagesDir = path.join(issueDir, 'images');
          ensureDir(issueDir);
          if (downloadImages) ensureDir(issueImagesDir);

          const result = await processUrl(url, i + 1, {
            outputDir: issueDir,
            imagesDir: issueImagesDir,
            downloadImages: Boolean(downloadImages),
          });

          const fileUrl = result.success && result.filename
            ? `/weekly/${encodeURIComponent(issueNumber)}/${encodeURIComponent(result.filename)}`
            : '';

          job.results.push({ issue: issueNumber, url, fileUrl, ...result });
          job.done = i + 1;
          if (!result.success) job.logs.push(`[${i + 1}/${tasks.length}] 失败：${result.error}`);

          if (i < tasks.length - 1) await new Promise((r) => setTimeout(r, 1000));
        }
      } else {
        job.logs.push(`开始处理：${urls.length} 个链接`);
        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          job.logs.push(`[${i + 1}/${urls.length}] 抓取：${url}`);
          const result = await processUrl(url, i + 1, {
            outputDir: OUTPUT_DIR,
            imagesDir: path.join(OUTPUT_DIR, 'images'),
            downloadImages: Boolean(downloadImages),
          });
          const fileUrl = result.success && result.filename
            ? `/output/${encodeURIComponent(result.filename)}`
            : '';
          job.results.push({ url, fileUrl, ...result });
          job.done = i + 1;
          if (!result.success) job.logs.push(`[${i + 1}/${urls.length}] 失败：${result.error}`);

          if (i < urls.length - 1) await new Promise((r) => setTimeout(r, 1000));
        }
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
    res.end(`<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Output</title></head><body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif; padding: 16px;"><h1>fetch-translate-tool/output</h1><ul>${items || '<li>(empty)</li>'}</ul></body></html>`);
  } catch (e) {
    res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
});

app.get('/weekly/', (req, res) => {
  try {
    if (!fs.existsSync(WEEKLY_DIR)) {
      return res.status(404).json({ error: 'weekly 目录不存在' });
    }

    const entries = fs
      .readdirSync(WEEKLY_DIR, { withFileTypes: true })
      .filter((d) => d.name !== '.DS_Store')
      .map((d) => ({
        name: d.name,
        isDir: d.isDirectory(),
      }))
      .sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name));

    const items = entries
      .map((e) => {
        const href = `/weekly/${encodeURIComponent(e.name)}${e.isDir ? '/' : ''}`;
        return `<li><a href="${href}">${escapeHtml(e.name)}${e.isDir ? '/' : ''}</a></li>`;
      })
      .join('');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(`<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Weekly</title></head><body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif; padding: 16px;"><h1>weekly</h1><ul>${items || '<li>(empty)</li>'}</ul></body></html>`);
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

app.use('/weekly', express.static(WEEKLY_DIR, {
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
