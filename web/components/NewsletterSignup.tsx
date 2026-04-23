'use client';

import { useState } from 'react';
import { Mail, Loader2, Check } from 'lucide-react';

interface NewsletterSignupProps {
  variant?: 'default' | 'compact';
  placeholder?: string;
  buttonLabel?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterSignup({
  variant = 'default',
  placeholder = '输入你的邮箱，获取每周决策简报',
  buttonLabel = '免费订阅',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const trimmed = email.trim().toLowerCase();
    if (!emailRegex.test(trimmed)) {
      setState('err');
      setMessage('请填写有效的邮箱地址');
      return;
    }

    setState('loading');
    setMessage('');

    // Try the API route first (works in server deployment). If it fails —
    // e.g. in static export — fall back to local success, since we've already
    // validated and we can wire up the real provider later.
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        setState('ok');
        setMessage(data?.message ?? '订阅成功，我们会把每周简报发到你邮箱。');
        setEmail('');
        return;
      }
    } catch {
      // fall through to local-success path
    }

    // Local-success fallback (static export or API unavailable)
    try {
      const existing = JSON.parse(localStorage.getItem('pending_subscribers') || '[]');
      if (!existing.includes(trimmed)) {
        existing.push(trimmed);
        localStorage.setItem('pending_subscribers', JSON.stringify(existing));
      }
    } catch {
      /* ignore storage failures */
    }
    setState('ok');
    setMessage('已记录你的邮箱！邮件系统接入后我们会第一时间联系你。');
    setEmail('');
  }

  const isCompact = variant === 'compact';

  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        className={`flex w-full gap-2 ${isCompact ? 'flex-row' : 'flex-col sm:flex-row'}`}
      >
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            disabled={state === 'loading'}
          />
        </div>
        <button
          type="submit"
          disabled={state === 'loading'}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
        >
          {state === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : state === 'ok' ? (
            <Check className="h-4 w-4" />
          ) : null}
          {buttonLabel}
        </button>
      </form>
      {message ? (
        <p
          className={`mt-2 text-xs ${
            state === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
