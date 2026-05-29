'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Download, Copy, Check, ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import DailyCard from '@/components/DailyCard';
import type { DailyData } from '@/lib/ai-daily';

function DailyContent() {
  const searchParams = useSearchParams();
  const date = searchParams.get('date');
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!date) {
      setLoading(false);
      return;
    }
    fetch(`/ai-daily/${date}.json`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((d: DailyData | null) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    if (data) document.title = `每日精选 ${data.date.replace(/-/g, '·')} · 前端周看`;
  }, [data]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  }, []);

  const handleExport = useCallback(async () => {
    if (exporting || !cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 500,
        height: cardRef.current.scrollHeight,
        pixelRatio: 2,
        backgroundColor: '#0d0d12',
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

  if (!date) {
    return <Centered title="缺少日期参数" sub="请通过分享链接访问" />;
  }
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
  if (!data) {
    return <Centered title="未找到该期每日精选" sub={`日期：${date}`} />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d12]">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0d0d12]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            前端周看
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-gray-300 transition hover:border-white/25 hover:bg-white/10"
            >
              {copying ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
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

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400">
            <FileText className="h-3 w-3" />
            每日精选 · {data.displayDate}
          </div>
          {data.count > 0 && <p className="mt-2 text-sm text-gray-500">{data.count} 条精选</p>}
        </div>

        <div className="flex justify-center overflow-x-auto">
          <div className="overflow-hidden rounded-2xl shadow-2xl shadow-black/40">
            <DailyCard ref={cardRef} data={data} />
          </div>
        </div>

        {data.highlights.length > 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">本期摘要</p>
            <ul className="space-y-2.5">
              {data.highlights.map((h, i) => (
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

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-white/10 pt-8">
          <p className="text-xs text-gray-500">分享这篇每日精选给你的朋友和团队</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-white/25 hover:bg-white/10"
            >
              {copying ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
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

function Centered({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0d12]">
      <div className="flex flex-col items-center gap-4 text-center">
        <FileText className="h-12 w-12 text-gray-600" />
        <p className="text-lg font-semibold text-white">{title}</p>
        <p className="text-sm text-gray-400">{sub}</p>
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
