import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

const JOBS_DIR = path.join(process.cwd(), '.tool-jobs');

function ensureJobsDir() {
  if (!fs.existsSync(JOBS_DIR)) fs.mkdirSync(JOBS_DIR, { recursive: true });
}

function jobFilePath(id: string) {
  return path.join(JOBS_DIR, `${id}.json`);
}

function saveJob(job: JobRecord) {
  ensureJobsDir();
  fs.writeFileSync(jobFilePath(job.id), JSON.stringify(job, null, 2));
}

const LLM_BASE_URL = process.env.OPENAI_BASE_URL || '';
const LLM_API_KEY = process.env.OPENAI_API_KEY || '';
const LLM_MODEL = process.env.OPENAI_MODEL || '';
const LLM_ENABLED = process.env.OPENAI_ENABLE_TRANSLATION === 'true';

async function translateWithLLM(text: string) {
  if (!LLM_ENABLED || !LLM_BASE_URL || !LLM_API_KEY || !LLM_MODEL) {
    return null;
  }

  const resp = await fetch(`${LLM_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: 'You are a professional translator.' },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    }),
  });

  if (!resp.ok) {
    const message = await resp.text();
    throw new Error(`LLM request failed: ${resp.status} ${message}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content : null;
}

function splitMarkdown(markdown: string, maxChars = 6000) {
  const blocks = markdown.split(/\n\n+/g);
  const chunks: string[] = [];
  let buffer = '';

  for (const block of blocks) {
    const next = buffer ? `${buffer}\n\n${block}` : block;
    if (next.length <= maxChars) {
      buffer = next;
      continue;
    }

    if (buffer) chunks.push(buffer);
    if (block.length > maxChars) {
      chunks.push(block);
      buffer = '';
    } else {
      buffer = block;
    }
  }

  if (buffer) chunks.push(buffer);
  return chunks;
}

async function translateMarkdown(markdown: string) {
  const chunks = splitMarkdown(markdown);
  const translated: string[] = [];

  for (const chunk of chunks) {
    const prompt = `请把下面 Markdown 翻译成中文。要求：\n- 保留 Markdown 结构、链接、代码块、内联代码、列表与引用\n- 不要添加多余内容\n- 保留专有名词，必要时加括号中文释义\n\n${chunk}`;
    const result = await translateWithLLM(prompt);
    translated.push(result || chunk);
  }

  return translated.join('\n\n');
}

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

function encodePathSegments(p: string) {
  return p.split(path.sep).map((part) => encodeURIComponent(part)).join('/');
}

function toFileUrl(filePath: string) {
  const repoRoot = getRepoRoot();
  const weeklyRoot = path.join(repoRoot, '..', 'weekly');
  const outputRoot = path.join(repoRoot, 'fetch-translate-tool', 'output');

  if (filePath.startsWith(weeklyRoot)) {
    const relative = path.relative(weeklyRoot, filePath);
    return `/api/tool/files?path=weekly/${encodePathSegments(relative)}`;
  }

  if (filePath.startsWith(outputRoot)) {
    const relative = path.relative(outputRoot, filePath);
    return `/api/tool/files?path=output/${encodePathSegments(relative)}`;
  }

  const relative = path.relative(repoRoot, filePath);
  return `/api/tool/files?path=${encodeURIComponent(relative)}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { urlsText, mode, issue, downloadImages, llmProvider, llmModel } = body || {};

  if (mode && mode !== 'weekly') {
    return NextResponse.json({ error: '仅支持 weekly 模式' }, { status: 400 });
  }

  const useWeekly = true;
  const urls = useWeekly ? [] : parseUrls(urlsText || '');

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
  saveJob(job);

  const llmSummary = LLM_ENABLED
    ? `AI 翻译：${llmProvider || 'openai'} / ${LLM_MODEL || llmModel || '未指定模型'} 已启用`
    : `AI 翻译：未启用（${llmProvider || 'openai'} / ${llmModel || '未指定模型'}）`;
  job.logs.push(llmSummary);
  job.logs.push(`输出目录：${path.join(getRepoRoot(), '..', 'weekly')}`);
  saveJob(job);

  // async run
  (async () => {
    try {
      const repoRoot = getRepoRoot();
      const weeklyRoot = path.join(repoRoot, '..', 'weekly');
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

          if (result.success && result.filename && LLM_ENABLED) {
            const filePath = path.join(issueDir, result.filename);
            try {
              const original = fs.readFileSync(filePath, 'utf-8');
              const translated = await translateMarkdown(original);
              fs.writeFileSync(filePath, translated);
              job.logs.push(`[${i + 1}/${tasks.length}] 翻译完成：${result.filename}`);
            } catch (error) {
              job.logs.push(`[${i + 1}/${tasks.length}] 翻译失败：${error instanceof Error ? error.message : String(error)}`);
            }
            saveJob(job);
          }

          const fileUrl = result.success && result.filename
            ? toFileUrl(path.join(issueDir, result.filename))
            : '';

          job.results.push({ issue: issueNumber, url, fileUrl, ...result });
          job.done = i + 1;
          if (!result.success) job.logs.push(`[${i + 1}/${tasks.length}] 失败：${result.error}`);
          saveJob(job);

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

          if (result.success && result.filename && LLM_ENABLED) {
            const filePath = path.join(outputRoot, result.filename);
            try {
              const original = fs.readFileSync(filePath, 'utf-8');
              const translated = await translateMarkdown(original);
              fs.writeFileSync(filePath, translated);
              job.logs.push(`[${i + 1}/${urls.length}] 翻译完成：${result.filename}`);
            } catch (error) {
              job.logs.push(`[${i + 1}/${urls.length}] 翻译失败：${error instanceof Error ? error.message : String(error)}`);
            }
            saveJob(job);
          }

          const fileUrl = result.success && result.filename
            ? toFileUrl(path.join(outputRoot, result.filename))
            : '';

          job.results.push({ url, fileUrl, ...result });
          job.done = i + 1;
          if (!result.success) job.logs.push(`[${i + 1}/${urls.length}] 失败：${result.error}`);
          saveJob(job);

          if (i < urls.length - 1) await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      const ok = job.results.filter((item) => item.success).length;
      job.logs.push(`完成：成功 ${ok}/${job.total}`);
      job.status = 'done';
      saveJob(job);
    } catch (error) {
      job.status = 'error';
      job.logs.push(`任务异常：${error instanceof Error ? error.message : String(error)}`);
      saveJob(job);
    }
  })();

  return NextResponse.json({ id });
}
