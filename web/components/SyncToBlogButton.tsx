'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { RefreshCw, Check, Copy } from 'lucide-react';

interface SyncToBlogButtonProps {
  title: string;
  markdown: string;
  canonicalUrl: string;
  tags?: string[];
  variant?: 'default' | 'compact';
}

const SYNCBLOG_ORIGIN = 'https://syncblog.cn';
const SYNCBLOG_URL = 'https://syncblog.cn/md/#content-sync';
const HANDSHAKE_TIMEOUT = 30000; // 30s
const FEEDBACK_DURATION = 2000; // 2s

export default function SyncToBlogButton({
  title,
  markdown,
  canonicalUrl,
  tags = ['前端周刊'],
  variant = 'default',
}: SyncToBlogButtonProps) {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'synced' | 'copied'>('idle');
  const popupRef = useRef<Window | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (feedbackRef.current) {
      clearTimeout(feedbackRef.current);
      feedbackRef.current = null;
    }
  }, []);

  const resetStatus = useCallback(() => {
    setStatus('idle');
  }, []);

  const fallbackToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus('copied');
    } catch {
      // 降级方案
      const input = document.createElement('input');
      input.value = markdown;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setStatus('copied');
    }
    feedbackRef.current = setTimeout(resetStatus, FEEDBACK_DURATION);
  }, [markdown, resetStatus]);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== SYNCBLOG_ORIGIN) return;
      if (event.data?.type !== 'SYNCBLOG_IMPORT_READY') return;

      cleanup();

      const popup = popupRef.current;
      if (!popup || popup.closed) {
        fallbackToClipboard();
        return;
      }

      const payload = {
        type: 'SYNCBLOG_IMPORT_ARTICLE',
        title,
        markdown,
        canonicalUrl,
        tags,
      };

      popup.postMessage(payload, SYNCBLOG_ORIGIN);
      setStatus('synced');
      feedbackRef.current = setTimeout(resetStatus, FEEDBACK_DURATION);
    },
    [title, markdown, canonicalUrl, tags, cleanup, fallbackToClipboard, resetStatus]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      cleanup();
    };
  }, [handleMessage, cleanup]);

  const handleSync = useCallback(() => {
    if (status !== 'idle') return;

    cleanup();
    setStatus('syncing');

    const popup = window.open(SYNCBLOG_URL, 'syncblog-distribute');
    popupRef.current = popup;

    if (!popup) {
      // 弹窗被拦截，直接降级到剪贴板
      fallbackToClipboard();
      return;
    }

    // 启动超时计时器
    // 使用 ref 保存当前状态，避免闭包捕获旧值
    const currentStatusRef = { current: 'syncing' as const };
    timeoutRef.current = setTimeout(() => {
      if (currentStatusRef.current === 'syncing') {
        fallbackToClipboard();
      }
    }, HANDSHAKE_TIMEOUT);
  }, [cleanup, fallbackToClipboard]);

  const isCompact = variant === 'compact';

  // 按钮文案和图标
  const getButtonContent = () => {
    switch (status) {
      case 'syncing':
        return (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            {!isCompact && <span>同步中...</span>}
          </>
        );
      case 'synced':
        return (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            {!isCompact && <span>已发送</span>}
          </>
        );
      case 'copied':
        return (
          <>
            <Copy className="h-3.5 w-3.5 text-emerald-500" />
            {!isCompact && <span>已复制</span>}
          </>
        );
      default:
        return (
          <>
            <RefreshCw className="h-3.5 w-3.5" />
            {!isCompact && <span>同步到 syncblog</span>}
          </>
        );
    }
  };

  if (isCompact) {
    return (
      <button
        onClick={handleSync}
        disabled={status !== 'idle'}
        title={status === 'idle' ? '同步到 syncblog' : status === 'syncing' ? '同步中...' : status === 'synced' ? '已发送' : '已复制到剪贴板'}
        className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-1.5 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      >
        {getButtonContent()}
      </button>
    );
  }

  return (
    <button
      onClick={handleSync}
      disabled={status !== 'idle'}
      className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800"
    >
      {getButtonContent()}
    </button>
  );
}
