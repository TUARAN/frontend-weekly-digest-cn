'use client';

import { useEffect, useState } from 'react';

type Snapshot = { version: number; user: { id: string; name: string } | null; balance: number; checkedInToday: boolean };
const HOME = 'https://2aran.com';

export default function PlatformAccount() {
  const [enabled, setEnabled] = useState(false);
  const [account, setAccount] = useState<Snapshot | null>(null);
  const [hint, setHint] = useState('');
  const [busy, setBusy] = useState(false);
  const [returnTo, setReturnTo] = useState('https://weekly.2aran.com/');

  useEffect(() => {
    if (window.location.hostname !== 'weekly.2aran.com') return;
    setEnabled(true);
    let sequence = 0;
    const refresh = async () => {
      if (document.visibilityState !== 'visible') return;
      setReturnTo(window.location.href);
      const current = ++sequence;
      try {
        const response = await fetch(`${HOME}/api/subsites/session`, { credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error('账号暂不可用');
        const data = await response.json() as Snapshot;
        if (data.version !== 1 || !Number.isSafeInteger(data.balance)) throw new Error('账号响应无效');
        if (current === sequence) { setAccount(data); setHint(''); }
      } catch { if (current === sequence) { setAccount(null); setHint('账号暂不可用，点击重试'); } }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('platform-account-refresh', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      sequence++;
      window.removeEventListener('focus', refresh);
      window.removeEventListener('platform-account-refresh', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  async function checkin() {
    setBusy(true);
    try {
      const response = await fetch(`${HOME}/api/subsites/checkin`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '签到失败');
      setAccount(current => current ? { ...current, balance: result.balance, checkedInToday: true } : current);
      setHint(result.awarded ? `签到 +${result.gained} 燃币` : '今天已签到');
    } catch (error) { setHint(error instanceof Error ? error.message : '签到失败'); }
    finally { setBusy(false); }
  }

  if (!enabled) return <a href="https://weekly.2aran.com/" className="text-xs text-blue-600">2aran 子站 ↗</a>;
  return <details className="relative text-sm">
    <summary className="cursor-pointer rounded-full border border-gray-200 px-3 py-1.5 dark:border-gray-700">
      {account ? `🔥 ${account.balance} 燃币` : '2aran 账户'}
    </summary>
    <div className="absolute right-0 z-50 mt-2 w-64 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p>{account?.user?.name || (account ? '游客' : '加载账户中')}</p>
      {account?.user ? <>
        <button type="button" onClick={checkin} disabled={busy || account.checkedInToday} className="rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-50">{account.checkedInToday ? '今天已签到' : busy ? '签到中…' : '每日签到'}</button>
        <a className="ml-3 underline" href={`${HOME}/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`}>退出</a>
      </> : <a className="block text-blue-600 underline" href={`${HOME}/login?returnTo=${encodeURIComponent(returnTo)}`}>使用主站账号登录</a>}
      <div className="flex gap-3 text-xs"><a href={`${HOME}/account`} className="underline">统一账户</a><a href={`${HOME}/ranbi`} className="underline">燃币说明</a></div>
      <p className="text-xs text-gray-500">余额、签到与主站共用。周刊阅读保持免费。</p>
      {hint && <button type="button" role="status" className="text-xs" onClick={() => window.dispatchEvent(new Event('platform-account-refresh'))}>{hint}</button>}
    </div>
  </details>;
}
