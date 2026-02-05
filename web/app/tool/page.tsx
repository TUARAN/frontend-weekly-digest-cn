'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface JobResult {
  issue?: string;
  url: string;
  title?: string;
  filename?: string;
  fileUrl?: string;
  success: boolean;
  error?: string;
}

interface JobResponse {
  id: string;
  status: 'idle' | 'running' | 'done' | 'error' | 'creating';
  total: number;
  done: number;
  logs: string[];
  results: JobResult[];
}

export default function ToolPage() {
  const [issue, setIssue] = useState('');
  const [urlsText, setUrlsText] = useState('');
  const [downloadImages, setDownloadImages] = useState(false);
  const [llmProvider] = useState('openai');
  const [llmModel, setLlmModel] = useState('gpt-5.2');
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error' | 'creating'>('idle');
  const [progress, setProgress] = useState('0/0');
  const [jobId, setJobId] = useState('-');
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<JobResult[]>([]);
  const pollingRef = useRef<number | null>(null);

  const canStart = status !== 'running' && status !== 'creating';
  const progressValue = Number(progress.split('/')[0]);
  const progressTotal = Number(progress.split('/')[1]);
  const progressPercent = progressTotal > 0 ? Math.round((progressValue / progressTotal) * 100) : 0;

  const logsText = useMemo(() => logs.join('\n'), [logs]);

  async function createJob() {
    setStatus('creating');
    const resp = await fetch('/api/tool/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'weekly',
        issue: issue.trim() || null,
        urlsText,
        downloadImages,
        llmProvider,
        llmModel,
      }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${resp.status}`);
    }

    return resp.json() as Promise<{ id: string }>;
  }

  async function fetchJob(id: string) {
    const resp = await fetch(`/api/tool/jobs/${encodeURIComponent(id)}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json() as Promise<JobResponse>;
  }

  function stopPolling() {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  function startPolling(id: string) {
    stopPolling();
    pollingRef.current = window.setInterval(async () => {
      try {
        const job = await fetchJob(id);
        setStatus(job.status);
        setProgress(`${job.done}/${job.total}`);
        setLogs(job.logs || []);
        setResults(job.results || []);

        if (job.status === 'done' || job.status === 'error') {
          stopPolling();
        }
      } catch {
        // ignore polling errors
      }
    }, 1000);
  }

  async function handleStart() {
    setResults([]);
    setLogs([]);
    setProgress('0/0');
    setStatus('creating');
    setLogs(['正在创建任务...']);

    try {
      const { id } = await createJob();
      setJobId(id);
      setStatus('running');
      setLogs([`任务已创建：${id}`]);
      startPolling(id);
    } catch (error) {
      setStatus('error');
      setLogs([`创建任务失败：${(error as Error).message}`]);
    }
  }

  useEffect(() => () => stopPolling(), []);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/70">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">批量链接解析工具</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            支持从 weekly 周刊 Markdown 自动提取链接，或手动粘贴 URL 列表。默认保留图片外链；如需下载图片到本地可手动勾选。
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            本页面为在线版入口，本地运行工具位于 web/fetch-translate-tool/。
          </p>
          <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
            <p className="font-medium">提示：</p>
            <p className="mt-1">
              抓取与 AI 翻译只是辅助，最终质量依赖人工 Review。更好的译文应体现个性化观点、故事化表达与上下文补充，避免机械直译。
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="font-medium text-gray-700 dark:text-gray-200">期号</label>
              <input
                value={issue}
                onChange={(event) => setIssue(event.target.value)}
                placeholder="例如 451（留空则处理全部）"
                className="w-56 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">留空会处理全部期数</span>
            </div>



            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={downloadImages}
                  onChange={(event) => setDownloadImages(event.target.checked)}
                />
                抓取图片到本地（默认不勾选）
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">勾选后图片会写入 images/，未勾选则保持原始外链</span>
            </div>

            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-200">
              <div className="font-medium">AI 翻译（预留）</div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                在线运行时将支持接入大模型翻译，此处先预留配置。当前仅抓取与整理，不会实际调用模型。
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">模型服务</label>
                  <input
                    value="OpenAI"
                    readOnly
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">模型名称</label>
                  <input
                    value={llmModel}
                    onChange={(event) => setLlmModel(event.target.value)}
                    placeholder="例如 gpt-5.2"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleStart}
                disabled={!canStart}
                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                开始抓取与翻译
              </button>
              <button
                type="button"
                onClick={() => setUrlsText('')}
                className="rounded-full border border-gray-200 px-6 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
              >
                清空
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/70">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">状态</h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {status}
              </span>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>进度</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{progress}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>任务 ID</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{jobId}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/70">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">日志</h2>
            <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-gray-900/90 p-4 text-xs text-gray-100">
              {logsText || '暂无日志'}
            </pre>
          </section>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/70">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">结果</h2>
          {results.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">暂无结果</p>
          ) : (
            <div className="mt-4 space-y-4">
              {results.map((result, index) => (
                <div
                  key={`${result.url}-${index}`}
                  className={`rounded-xl border px-4 py-3 text-sm ${result.success ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-100' : 'border-red-200 bg-red-50/60 text-red-900 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-100'}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">{result.title || '(无标题)'}</div>
                    <span className="text-xs uppercase tracking-wide">{result.success ? 'success' : 'failed'}</span>
                  </div>
                  {result.issue && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">第 {result.issue} 期</div>
                  )}
                  <div className="mt-2 break-all text-xs text-gray-600 dark:text-gray-300">{result.url}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    <a className="underline" href={result.url} target="_blank" rel="noreferrer">
                      打开原文
                    </a>
                    {result.success && result.fileUrl && (
                      <a className="underline" href={result.fileUrl} target="_blank" rel="noreferrer">
                        下载 Markdown
                      </a>
                    )}
                  </div>
                  {!result.success && result.error && (
                    <div className="mt-2 text-xs">失败原因：{result.error}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
