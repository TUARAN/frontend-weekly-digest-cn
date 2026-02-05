import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tool = require('../../../../fetch-translate-tool/fetch-articles.js');

const {
  processUrl,
  extractUrlsFromMarkdown,
  findWeeklyIssues,
  findIssueMainMarkdown,
} = tool as {
  processUrl: (url: string, index: number, config?: Record<string, unknown>) => Promise<{ success: boolean; title?: string; filename?: string; error?: string }>;
  extractUrlsFromMarkdown: (markdown: string) => string[];
  findWeeklyIssues: (weeklyDir: string, issueFilter?: string | null) => string[];
  findIssueMainMarkdown: (issueDir: string, issueNumber: string) => string | null;
};

interface JobRecord {
  id: string;
  createdAt: number;
  status: 'running' | 'done' | 'error';
  total: number;
  done: number;
  logs: string[];
  results: Array<{
    issue?: string;
    url: string;
    success: boolean;
    title?: string;
    filename?: string;
    fileUrl?: string;
    error?: string;
  }>;
}

const jobStore = (globalThis as { __toolJobs?: Map<string, JobRecord> }).__toolJobs ?? new Map<string, JobRecord>();
(globalThis as { __toolJobs?: Map<string, JobRecord> }).__toolJobs = jobStore;

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function parseUrls(urlsText: string) {
  return (urlsText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.replace(/[\s\)\]\}>,.;:]+$/g, ''))
    .filter((line) => line && !line.startsWith('#') && /^https?:\/\//i.test(line));
}

function newJobId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getRepoRoot() {
  return process.cwd();
}

function toFileUrl(filePath: string) {
  const repoRoot = getRepoRoot();
  const relative = path.relative(repoRoot, filePath);
  return `/api/tool/files?path=${encodeURIComponent(relative)}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { urlsText, mode, issue, weeklyPath, downloadImages, llmProvider, llmModel } = body || {};

  const useWeekly = mode === 'weekly';
  const urls = useWeekly ? [] : parseUrls(urlsText || '');

  if (!useWeekly && urls.length === 0) {
    return NextResponse.json({ error: '没有找到有效的 URL' }, { status: 400 });
  }

  const id = newJobId();
  const job: JobRecord = {
    id,
    createdAt: Date.now(),
    status: 'running',
    total: useWeekly ? 0 : urls.length,
    done: 0,
    logs: [],
    results: [],
  };

  jobStore.set(id, job);

  const llmSummary = llmProvider || llmModel
    ? `AI 翻译（预留）：${llmProvider || '未指定服务'} / ${llmModel || '未指定模型'}（当前未启用）`
    : 'AI 翻译（预留）：未配置（当前未启用）';
  job.logs.push(llmSummary);

  // async run
  (async () => {
    try {
      const repoRoot = getRepoRoot();
      const weeklyRoot = weeklyPath ? path.resolve(weeklyPath) : path.join(repoRoot, 'weekly');
      const outputRoot = path.join(repoRoot, 'fetch-translate-tool', 'output');

      if (useWeekly) {
        const issueFilter = issue ? String(issue) : null;
        const issues = findWeeklyIssues(weeklyRoot, issueFilter);
        if (!issues.length) throw new Error('没有找到可处理的周刊目录');

        const tasks: Array<{ issue: string; url: string }> = [];
        for (const issueNumber of issues) {
          const issueDir = path.join(weeklyRoot, issueNumber);
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

        for (let i = 0; i < tasks.length; i += 1) {
          const { issue: issueNumber, url } = tasks[i];
          job.logs.push(`[${i + 1}/${tasks.length}] 第 ${issueNumber} 期：${url}`);

          const issueDir = path.join(weeklyRoot, issueNumber);
          const issueImagesDir = path.join(issueDir, 'images');
          ensureDir(issueDir);
          if (downloadImages) ensureDir(issueImagesDir);

          const result = await processUrl(url, i + 1, {
            outputDir: issueDir,
            imagesDir: issueImagesDir,
            downloadImages: Boolean(downloadImages),
          });

          const fileUrl = result.success && result.filename
            ? toFileUrl(path.join(issueDir, result.filename))
            : '';

          job.results.push({ issue: issueNumber, url, fileUrl, ...result });
          job.done = i + 1;
          if (!result.success) job.logs.push(`[${i + 1}/${tasks.length}] 失败：${result.error}`);

          if (i < tasks.length - 1) await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } else {
        ensureDir(outputRoot);
        job.logs.push(`开始处理：${urls.length} 个链接`);

        for (let i = 0; i < urls.length; i += 1) {
          const url = urls[i];
          job.logs.push(`[${i + 1}/${urls.length}] 抓取：${url}`);

          const result = await processUrl(url, i + 1, {
            outputDir: outputRoot,
            imagesDir: path.join(outputRoot, 'images'),
            downloadImages: Boolean(downloadImages),
          });

          const fileUrl = result.success && result.filename
            ? toFileUrl(path.join(outputRoot, result.filename))
            : '';

          job.results.push({ url, fileUrl, ...result });
          job.done = i + 1;
          if (!result.success) job.logs.push(`[${i + 1}/${urls.length}] 失败：${result.error}`);

          if (i < urls.length - 1) await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      const ok = job.results.filter((item) => item.success).length;
      job.logs.push(`完成：成功 ${ok}/${job.total}`);
      job.status = 'done';
    } catch (error) {
      job.status = 'error';
      job.logs.push(`任务异常：${error instanceof Error ? error.message : String(error)}`);
    }
  })();

  return NextResponse.json({ id });
}
