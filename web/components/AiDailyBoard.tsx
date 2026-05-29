'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, FileText, Download, Share2, Check } from 'lucide-react';
import { toPng } from 'html-to-image';

interface DailyEntry {
  date: string;
  displayDate: string;
  file: string;
  count: number;
  highlights: string[];
}

interface DailyManifest {
  list: DailyEntry[];
  latest: string;
}

export default function AiDailyBoard() {
  const [manifest, setManifest] = useState<DailyManifest | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const touchStartX = useRef<number | null>(null);
  const lastWheelTime = useRef<number>(0);

  useEffect(() => {
    fetch('/ai-daily-manifest.json')
      .then((res) => res.json())
      .then((data: DailyManifest) => {
        const sorted = [...data.list].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setManifest({ list: sorted, latest: data.latest });
        setCurrentIndex(0);
      })
      .catch(() => setManifest(null))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    if (!entry || exporting) return;
    setExporting(true);

    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument) {
        alert('导出失败：无法读取内容');
        return;
      }

      // 等待 iframe 内容渲染完成
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 直接针对 iframe 内的 .card 元素截图
      const cardEl = iframe.contentDocument.querySelector('.card') as HTMLElement;
      if (!cardEl) {
        alert('导出失败：未找到卡片内容');
        return;
      }

      // 临时解除外层容器高度限制，避免卡片底部被截断
      const wrapperEl = iframe.parentElement as HTMLElement | null;
      const origHeight = wrapperEl?.style.height;
      const origOverflow = wrapperEl?.style.overflow;
      if (wrapperEl) {
        wrapperEl.style.height = 'auto';
        wrapperEl.style.overflow = 'visible';
      }

      // 获取 card 实际完整高度后再截图
      const cardHeight = cardEl.scrollHeight;

      const dataUrl = await toPng(cardEl, {
        width: 500,
        height: cardHeight,
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#0d0d12',
        style: { margin: '0', padding: '0' },
      });

      // 恢复外层容器原始样式
      if (wrapperEl) {
        wrapperEl.style.height = origHeight || '';
        wrapperEl.style.overflow = origOverflow || '';
      }

      // 触发下载
      const link = document.createElement('a');
      link.download = `前端周看-每日精选-${entry.date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败，请稍后重试');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!entry || sharing) return;
    const shareUrl = `${window.location.origin}/share/ai-daily?date=${entry.date}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSharing(true);
      setTimeout(() => setSharing(false), 2000);
    } catch {
      // 降级方案
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setSharing(true);
      setTimeout(() => setSharing(false), 2000);
    }
  };

  // ── 提前计算（必须在所有 early return 之前） ──
  const entry = manifest?.list?.[currentIndex] ?? null;
  const total = manifest?.list?.length ?? 0;
  const isLatest = entry ? entry.date === manifest?.latest : false;

  const goPrev = useCallback(() => {
    setCurrentIndex((p) => Math.min(p + 1, total - 1));
  }, [total]);

  const goNext = useCallback(() => {
    setCurrentIndex((p) => Math.max(p - 1, 0));
  }, []);

  // ── 手势：触摸滑动切换日期 ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      if (touchStartX.current === null) return;
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goNext();
        else goPrev();
      }
      touchStartX.current = null;
    },
    [goNext, goPrev],
  );

  // ── 手势：Mac 触控板双指水平滑动切换日期 ──
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      // 防抖：200ms 内忽略重复滑动
      if (now - lastWheelTime.current < 200) return;
      // 只处理水平方向为主的滑动
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      if (Math.abs(e.deltaX) < 30) return;

      e.preventDefault();
      e.stopPropagation();
      lastWheelTime.current = now;
      if (e.deltaX > 0) goNext();
      else goPrev();
    },
    [goNext, goPrev],
  );

  // ---- 状态判断 ----
  if (loading) {
    return (
      <section>
        <HeaderStrip onExport={handleExport} onShare={handleShare} exporting={exporting} sharing={sharing} hasContent={false} />
        <div className="flex h-80 items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
          <p className="text-sm text-gray-400">加载中...</p>
        </div>
      </section>
    );
  }

  if (!manifest || manifest.list.length === 0) {
    return (
      <section>
        <HeaderStrip onExport={handleExport} onShare={handleShare} exporting={exporting} sharing={sharing} hasContent={false} />
        <div className="flex h-80 flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
          <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-400">每日精选正在赶来...</p>
          <p className="text-xs text-gray-300 dark:text-gray-600">每日 09:00 自动更新，敬请期待</p>
        </div>
      </section>
    );
  }

  // 理论上不会到这里，但让 TypeScript 满意
  if (!entry) return null;

  return (
    <section>
      <HeaderStrip onExport={handleExport} onShare={handleShare} exporting={exporting} sharing={sharing} hasContent={true} />

      {/* ── 日期导航栏 ── */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={goPrev}
          disabled={currentIndex >= total - 1}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-25 dark:border-gray-700 dark:text-gray-500 dark:hover:border-gray-500 dark:hover:text-gray-300"
          aria-label="更早一期"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {entry.displayDate}
          </span>
          {isLatest && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              最新
            </span>
          )}
          <span className="text-xs text-gray-400">
            {entry.count} 条精选
            {total > 1 && ` · ${total - currentIndex}/${total}`}
          </span>

          {total > 1 && (
            <div className="ml-auto flex gap-1">
              {manifest.list.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`rounded-full transition-all ${
                    i === currentIndex
                      ? 'h-1.5 w-5 bg-blue-500'
                      : 'h-1.5 w-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`第 ${total - i} 期`}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={goNext}
          disabled={currentIndex <= 0}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-25 dark:border-gray-700 dark:text-gray-500 dark:hover:border-gray-500 dark:hover:text-gray-300"
          aria-label="更新一期"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── 主内容：iframe + 侧边摘要 ── */}
      <div
        className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-900/50"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div className="flex flex-col lg:flex-row">
          {/* 左侧：每日精选 iframe（全显示，无滚动条） */}
          <div className="flex justify-center p-4 sm:p-6 lg:flex-1">
            <div
              className="rounded-2xl"
              style={{
                width: '355px',
                maxWidth: '100%',
                height: '820px',
                overflow: 'hidden',
              }}
            >
              <iframe
                ref={iframeRef}
                src={entry.file}
                title={`每日精选 ${entry.date}`}
                style={{
                  width: '500px',
                  height: '1150px',
                  border: 'none',
                  transform: 'scale(0.71)',
                  transformOrigin: 'top left',
                }}
                scrolling="no"
              />
            </div>
          </div>

          {/* 右侧：摘要面板 */}
          <div className="border-t border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900 lg:w-72 lg:border-l lg:border-t-0 lg:shrink-0">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
              本期摘要
            </p>
            <ul className="mt-4 space-y-3">
              {entry.highlights.map((h, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-5 text-gray-600 dark:text-gray-300">
                    {h}
                  </span>
                </li>
              ))}
            </ul>

            {total > 1 && (
              <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  共 <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span> 期 · 左右箭头切换
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** 板块头部：标题 + 分享/导出按钮 */
function HeaderStrip({
  onExport,
  onShare,
  exporting,
  sharing,
  hasContent,
}: {
  onExport: () => void;
  onShare: () => void;
  exporting: boolean;
  sharing: boolean;
  hasContent: boolean;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
          AI Daily
        </p>
        <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          每日精选
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
          精选 AI Coding &amp; 具身智能最新动态 · 每日 09:00 自动更新
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          自动同步中
        </span>
        {hasContent && (
          <>
            <button
              onClick={onShare}
              disabled={sharing}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800"
            >
              {sharing ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
              {sharing ? '已复制' : '分享'}
            </button>
            <button
              onClick={onExport}
              disabled={exporting}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? '导出中...' : '导出图片'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
