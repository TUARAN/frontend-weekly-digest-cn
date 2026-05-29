'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Download,
  Copy,
  Check,
  ArrowLeft,
  FileText,
  Loader2,
} from 'lucide-react';
import { toPng } from 'html-to-image';

interface DailyEntry {
  date: string;
  displayDate: string;
  file: string;
  count: number;
  highlights: string[];
}

function DailyContent() {
  const searchParams = useSearchParams();
  const date = searchParams.get('date');
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!date) {
      setLoading(false);
      return;
    }

    fetch('/ai-daily-manifest.json')
      .then((res) => res.json())
      .then((data) => {
        const found = data.list?.find((e: DailyEntry) => e.date === date);
        if (found) {
          setEntry(found);
        } else {
          const parts = date.split('-');
          const displayDate = new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          setEntry({
            date,
            displayDate,
            file: `/ai-daily-${parts[1]}${parts[2]}.html`,
            count: 0,
            highlights: [],
          });
        }
      })
      .catch(() => {
        const parts = date!.split('-');
        const displayDate = new Date(date!).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        setEntry({
          date: date!,
          displayDate,
          file: `/ai-daily-${parts[1]}${parts[2]}.html`,
          count: 0,
          highlights: [],
        });
      })
      .finally(() => setLoading(false));
  }, [date]);

  // 设置页面标题
  useEffect(() => {
    if (entry) {
      const displayDate = entry.date.replace(/-/g, '·');
      document.title = `每日精选 ${displayDate} · 前端周看`;
    }
  }, [entry]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const iframe = iframeRef.current;
      if (!iframe?.contentDocument) {
        alert('导出失败：无法读取内容');
        return;
      }
      await new Promise((r) => setTimeout(r, 300));
      const cardEl = iframe.contentDocument.querySelector('.card') as HTMLElement;
      if (!cardEl) {
        alert('导出失败：未找到卡片内容');
        return;
      }
      const dataUrl = await toPng(cardEl, {
        width: 500,
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#0d0d12',
        style: { margin: '0', padding: '0' },
      });
      const link = document.createElement('a');
      link.download = `前端周看-每日精选-${date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败');
    } finally {
      setExporting(false);
    }
  }, [date, exporting]);

  // 缺少 date 参数
  if (!date) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d12]">
        <div className="flex flex-col items-center gap-4 text-center">
          <FileText className="h-12 w-12 text-gray-600" />
          <p className="text-lg font-semibold text-white">缺少日期参数</p>
          <p className="text-sm text-gray-400">请通过分享链接访问</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // 加载中
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d12]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-sm text-gray-400">加载每日精选...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d12]">
        <div className="flex flex-col items-center gap-4 text-center">
          <FileText className="h-12 w-12 text-gray-600" />
          <p className="text-lg font-semibold text-white">未找到该期每日精选</p>
          <p className="text-sm text-gray-400">日期：{date}</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d12]">
      {/* ── 顶部导航 ── */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0d0d12]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            前端周看
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-gray-300 transition hover:border-white/25 hover:bg-white/10"
            >
              {copying ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copying ? '已复制' : '复制链接'}
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-900 transition hover:bg-gray-200 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? '导出中...' : '下载图片'}
            </button>
          </div>
        </div>
      </header>

      {/* ── 主内容 ── */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* 日期信息 */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400">
            <FileText className="h-3 w-3" />
            每日精选 · {entry.displayDate}
          </div>
          {entry.count > 0 && (
            <p className="mt-2 text-sm text-gray-500">{entry.count} 条精选</p>
          )}
        </div>

        {/* 每日精选卡片 iframe（原始大小展示） */}
        <div className="flex justify-center">
          <div
            className="overflow-hidden rounded-2xl shadow-2xl shadow-black/40"
            style={{ width: '500px', maxWidth: '100%' }}
          >
            <iframe
              ref={iframeRef}
              src={entry.file}
              title={`每日精选 ${date}`}
              style={{
                width: '100%',
                minHeight: '820px',
                border: 'none',
              }}
              scrolling="no"
            />
          </div>
        </div>

        {/* 摘要 */}
        {entry.highlights.length > 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
              本期摘要
            </p>
            <ul className="space-y-2.5">
              {entry.highlights.map((h, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-[11px] font-bold text-blue-400">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-5 text-gray-300">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 底部操作 */}
        <div className="mt-8 flex flex-col items-center gap-4 border-t border-white/10 pt-8">
          <p className="text-xs text-gray-500">
            分享这篇每日精选给你的朋友和团队
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-white/25 hover:bg-white/10"
            >
              {copying ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copying ? '链接已复制' : '复制分享链接'}
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-200 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? '导出中...' : '下载高清图片'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DailySharePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0d0d12]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      }
    >
      <DailyContent />
    </Suspense>
  );
}
