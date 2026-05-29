'use client';

import { useMemo, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { buildShareTemplatePath, type ShareTemplatePayload } from '@/lib/share-template';

interface UniversalShareButtonProps extends ShareTemplatePayload {
  className?: string;
  label?: string;
}

export default function UniversalShareButton({
  className,
  label = '分享',
  ...payload
}: UniversalShareButtonProps) {
  const [shared, setShared] = useState(false);
  const sharePath = useMemo(() => buildShareTemplatePath(payload), [payload]);

  async function handleShare() {
    const shareUrl = `${window.location.origin}${sharePath}`;
    const shareText = payload.summary || payload.title;

    if (navigator.share) {
      try {
        await navigator.share({
          title: payload.title,
          text: shareText,
          url: shareUrl,
        });
        setShared(true);
        window.setTimeout(() => setShared(false), 1800);
        return;
      } catch {
        // User might cancel native share dialog; fallback to clipboard below.
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setShared(true);
    window.setTimeout(() => setShared(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        className ??
        'inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-200'
      }
      title={shared ? '分享链接已准备好' : '分享'}
    >
      {shared ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
      {shared ? '已就绪' : label}
    </button>
  );
}

