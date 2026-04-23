'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Copy, Loader2, MessageCircle, ShieldCheck, Wallet } from 'lucide-react';
import { ORDER_PLANS } from '@/lib/order-plans';
import PaymentQrCode from '@/components/PaymentQrCode';

type Step = 'form' | 'pay' | 'done';
type OrderStatus = 'created' | 'payment_submitted' | 'confirmed';
type PayMethod = 'wechat' | 'alipay';
type PaymentProvider = 'xunhu' | 'official';
type PaymentPayload = {
  provider: PaymentProvider;
  payMethod: PayMethod;
  channel: 'alipay_page' | 'alipay_wap' | 'wechat_native' | 'wechat_h5' | 'xunhu_cashier';
  payUrl?: string;
  codeUrl?: string;
  qrcodeUrl?: string;
};

interface FormState {
  name: string;
  wechat: string;
  email: string;
  note: string;
}

interface StoredOrderResponse {
  orderNo: string;
  status: OrderStatus;
  payMethod?: PayMethod;
  paymentSession?: PaymentPayload;
}

function getApiErrorMessage(
  data: { ok: true } | { ok: false; message?: string } | null,
  fallback: string
) {
  if (data && data.ok === false && data.message) {
    return data.message;
  }
  return fallback;
}

function buildOrderNo() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `FN${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${rand}`;
}

function getPreferredPaymentProvider(): PaymentProvider {
  return process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'official' ? 'official' : 'xunhu';
}

function getPaymentProviderLabel(provider: PaymentProvider) {
  return provider === 'official' ? '官方直连' : '虎皮椒';
}

function OrderContent() {
  const params = useSearchParams();
  const planId = params.get('plan') ?? 'yearly';
  const plan = ORDER_PLANS[planId as keyof typeof ORDER_PLANS] ?? ORDER_PLANS.yearly;
  const orderNoFromQuery = params.get('orderNo') ?? '';

  const [step, setStep] = useState<Step>('form');
  const [payMethod, setPayMethod] = useState<PayMethod>('wechat');
  const [form, setForm] = useState<FormState>({
    name: '',
    wechat: '',
    email: '',
    note: '',
  });
  const [orderNo, setOrderNo] = useState(() => orderNoFromQuery || buildOrderNo());
  const [copied, setCopied] = useState(false);
  const [qrSrc, setQrSrc] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState<OrderStatus | null>(null);
  const [payment, setPayment] = useState<PaymentPayload | null>(null);
  const preferredProvider = getPreferredPaymentProvider();

  useEffect(() => {
    if (orderNoFromQuery) setOrderNo(orderNoFromQuery);
  }, [orderNoFromQuery]);

  // Try real photo (jpg → png) first, fall back to placeholder svg.
  useEffect(() => {
    const base = payMethod === 'wechat' ? '/wechat-pay-qr' : '/alipay-qr';
    const candidates = [`${base}.jpg`, `${base}.png`, `${base}.svg`];
    let cancelled = false;
    const tryNext = (i: number) => {
      if (cancelled || i >= candidates.length) return;
      const img = new window.Image();
      img.onload = () => {
        if (!cancelled) setQrSrc(candidates[i]);
      };
      img.onerror = () => tryNext(i + 1);
      img.src = candidates[i];
    };
    tryNext(0);
    return () => {
      cancelled = true;
    };
  }, [payMethod]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(`manual_order:${orderNo}`);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as {
        step?: Step;
        form?: Partial<FormState>;
        payMethod?: PayMethod;
        status?: OrderStatus;
        payment?: PaymentPayload | null;
      };
      if (saved.form) {
        setForm((prev) => ({ ...prev, ...saved.form }));
      }
      if (saved.payMethod) setPayMethod(saved.payMethod);
      if (saved.status) setServerStatus(saved.status);
      if (saved.payment) setPayment(saved.payment);
      if (saved.step) setStep(saved.step);
    } catch {
      /* ignore corrupted cache */
    }
  }, [orderNo]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      `manual_order:${orderNo}`,
      JSON.stringify({
        step,
        form,
        payMethod,
        status: serverStatus,
        payment,
      })
    );
  }, [form, orderNo, payMethod, serverStatus, step, payment]);

  useEffect(() => {
    if (!orderNoFromQuery) return;
    let cancelled = false;
    fetch(`/api/order?orderNo=${encodeURIComponent(orderNoFromQuery)}`)
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { ok: true; order: StoredOrderResponse & { name?: string; wechat?: string; email?: string; note?: string } };
      })
      .then((data) => {
        if (!data || cancelled) return;
        setServerStatus(data.order.status);
        if (data.order.payMethod) setPayMethod(data.order.payMethod);
        if (data.order.paymentSession) {
          setPayment(data.order.paymentSession);
        }
        setStep(data.order.status === 'confirmed' ? 'done' : 'pay');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [orderNoFromQuery]);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.wechat.trim()) {
      setError('请至少填写称呼和微信号');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo, plan: plan.id, amount: plan.price, ...form }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; order: StoredOrderResponse }
        | { ok: false; message?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setError(getApiErrorMessage(data, '下单失败，请稍后再试'));
        return;
      }

      setServerStatus(data.order.status);
      setStep('pay');
    } catch {
      setError('下单请求失败，请检查网络后重试');
    } finally {
      setSubmitting(false);
    }
  }

  async function ensurePaymentSession(nextMethod: PayMethod = payMethod) {
    if (serverStatus === 'confirmed') {
      setStep('done');
      return;
    }
    setCreatingPayment(true);
    setError('');
    const device = /Mobi|Android|iPhone|iPad/i.test(window.navigator.userAgent) ? 'mobile' : 'desktop';
    try {
      const res = await fetch('/api/order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNo,
          action: 'create_payment',
          payMethod: nextMethod,
          device,
          provider: getPreferredPaymentProvider(),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; order: { status: OrderStatus }; payment: PaymentPayload }
        | { ok: false; message?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setError(getApiErrorMessage(data, '拉起支付失败，请稍后再试'));
        return;
      }
      setServerStatus(data.order.status);
      setPayment(data.payment);
      if (
        data.payment.payUrl &&
        (data.payment.provider === 'xunhu' ||
          data.payment.channel === 'alipay_page' ||
          data.payment.channel === 'alipay_wap' ||
          data.payment.channel === 'wechat_h5')
      ) {
        window.location.href = data.payment.payUrl;
      }
    } catch {
      setError('拉起支付失败，请稍后再试');
    } finally {
      setCreatingPayment(false);
    }
  }

  useEffect(() => {
    if (step !== 'pay' || !orderNo) return;
    if (payment && payment.payMethod === payMethod) return;
    ensurePaymentSession(payMethod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, payMethod, orderNo]);

  useEffect(() => {
    if (step !== 'pay' || serverStatus === 'confirmed') return;
    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/order?orderNo=${encodeURIComponent(orderNo)}`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          ok: true;
          order: StoredOrderResponse;
        };
        if (data.order.paymentSession) setPayment(data.order.paymentSession);
        if (data.order.status === 'confirmed') {
          setServerStatus('confirmed');
          setStep('done');
        }
      } catch {
        /* ignore polling errors */
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [orderNo, serverStatus, step]);

  async function submitPayment() {
    setConfirmingPayment(true);
    setError('');
    try {
      const res = await fetch('/api/order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo, action: 'submit_payment', payMethod }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; order: StoredOrderResponse }
        | { ok: false; message?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setError(getApiErrorMessage(data, '支付登记失败，请稍后重试'));
        return;
      }

      setServerStatus(data.order.status);
      setStep('done');
    } catch {
      setError('支付登记失败，请稍后重试');
    } finally {
      setConfirmingPayment(false);
    }
  }

  async function copyOrderNo() {
    try {
      await navigator.clipboard.writeText(orderNo);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/pro"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        返回定价页
      </Link>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-2 text-xs font-semibold">
        {['填写信息', '扫码支付', '完成'].map((label, idx) => {
          const active = (idx === 0 && step === 'form') || (idx === 1 && step === 'pay') || (idx === 2 && step === 'done');
          const done =
            (idx === 0 && step !== 'form') || (idx === 1 && step === 'done');
          return (
            <span key={label} className="flex items-center gap-2">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : idx + 1}
              </span>
              <span className={active ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>{label}</span>
              {idx < 2 ? <span className="text-gray-300 dark:text-gray-700">—</span> : null}
            </span>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.5fr_1fr]">
        {/* Main step content */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          {step === 'form' ? (
            <form onSubmit={submitForm} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">下单信息</h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  信息用于开通权益和后续联系，不会用于任何其他用途。
                </p>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">称呼 *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="你的昵称或姓名"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">微信号 *</label>
                <input
                  type="text"
                  required
                  value={form.wechat}
                  onChange={(e) => setForm({ ...form, wechat: e.target.value })}
                  placeholder="支付后我们通过微信发开通凭证"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">邮箱</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="可选，用于发送会员信"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>

              {plan.needsQuestionnaire ? (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                    你现在最想聊的 1-2 件事
                  </label>
                  <textarea
                    rows={4}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="你的岗位、团队规模、当前技术栈，以及你现在最纠结的决策。越具体越值钱。"
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">我会在连麦前读完，不浪费你的 1 小时。</p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                下一步 · 去支付
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : null}

          {step === 'pay' ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">扫码支付</h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  请扫码后点击“我已完成支付”。系统会把订单标记为“已付款待核销”，方便后续人工确认。
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  当前支付通道：<span className="font-semibold text-gray-700 dark:text-gray-300">{getPaymentProviderLabel(payment?.provider || preferredProvider)}</span>
                </p>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              ) : null}

              {/* Order number */}
              <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
                <p className="text-xs text-gray-500 dark:text-gray-400">订单号（支付时请填入备注）</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <code className="truncate font-mono text-sm font-semibold text-gray-900 dark:text-white">{orderNo}</code>
                  <button
                    onClick={copyOrderNo}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-300"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
              </div>

              {/* Pay tabs */}
              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
                {[
                  { id: 'wechat', label: '微信支付', color: 'text-emerald-600' },
                  { id: 'alipay', label: '支付宝', color: 'text-blue-600' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setPayMethod(m.id as 'wechat' | 'alipay');
                      setPayment(null);
                    }}
                    className={`relative px-4 py-2 text-sm font-semibold transition ${
                      payMethod === m.id
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    {m.label}
                    {payMethod === m.id ? (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
                    ) : null}
                  </button>
                ))}
              </div>

              <div className="flex flex-col items-center">
                <div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-white">
                  {creatingPayment ? <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />支付载入中...</div> : null}
                  {!creatingPayment && payMethod === 'wechat' && payment?.channel === 'wechat_native' && payment.codeUrl ? (
                    <PaymentQrCode value={payment.codeUrl} />
                  ) : null}
                  {!creatingPayment && payment?.provider === 'xunhu' && payment.qrcodeUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={payment.qrcodeUrl} alt="支付二维码" className="h-full w-full object-contain" />
                  ) : null}
                  {!creatingPayment && payMethod === 'alipay' && qrSrc && !payment?.payUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrSrc}
                      alt="支付宝收款码"
                      className="h-full w-full object-contain"
                    />
                  ) : null}
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  {payMethod === 'wechat'
                    ? <>使用<span className="font-semibold"> 微信 </span>扫描二维码，支付 <span className="font-bold text-gray-900 dark:text-white">{plan.priceLabel}</span></>
                    : <>{payment?.provider === 'xunhu' ? '支付宝将拉起虎皮椒收银台，完成支付 ' : '支付宝将拉起官方收银台，支付 '}<span className="font-bold text-gray-900 dark:text-white">{plan.priceLabel}</span></>}
                </p>
                {payMethod === 'wechat' ? (
                  <p className="mt-1 text-xs text-gray-500">
                    支付成功后页面会自动更新；若未自动跳转，可稍等几秒或手动刷新。
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    如果没有自动跳转，请点击下方按钮重新拉起支付宝。
                  </p>
                )}
              </div>

              {payMethod === 'alipay' ? (
                <button
                  onClick={() => ensurePaymentSession('alipay')}
                  disabled={creatingPayment}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  {creatingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  前往支付宝支付
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={submitPayment}
                  disabled={confirmingPayment}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-400 disabled:opacity-60 dark:border-gray-700 dark:text-gray-100"
                >
                  {confirmingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  手动标记已支付（兜底）
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : null}

          {step === 'done' ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Check className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">已提交！</h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-600 dark:text-gray-300">
                  订单已经登记为
                  <span className="mx-1 font-semibold text-amber-600 dark:text-amber-400">
                    {serverStatus === 'confirmed' ? '已确认' : '已付款待核销'}
                  </span>
                  ，我们会在 24 小时内通过微信 <span className="font-mono font-semibold">atar24</span> 联系你开通权益。
                </p>
                <p className="mt-2 text-xs text-gray-500">订单号：{orderNo}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-5 text-left text-sm leading-6 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                <p className="font-semibold">如果你是 1v1 用户：</p>
                <p className="mt-2">我会在 1 个工作日内把问卷模板发给你；你填完后约首次连麦时间。</p>
              </div>
              <Link
                href="/brief"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-100"
              >
                回去看简报
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </div>

        {/* Plan summary sidebar */}
        <aside className="rounded-3xl border border-gray-200 bg-gray-50/60 p-6 dark:border-gray-800 dark:bg-gray-900/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">订单摘要</p>
          <h2 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{plan.subtitle}</p>
          <div className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">{plan.priceLabel}</div>

          <ul className="mt-5 space-y-2 border-t border-gray-200 pt-5 dark:border-gray-800">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3 border-t border-gray-200 pt-5 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <span>30 天无理由退款</span>
            </div>
            <div className="flex items-start gap-2">
              <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span>支付后通过微信 atar24 开通</span>
            </div>
            <div className="flex items-start gap-2">
              <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
              <span>支持微信 / 支付宝 扫码支付</span>
            </div>
            {serverStatus ? (
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>当前状态：{serverStatus === 'created' ? '已创建待支付' : serverStatus === 'payment_submitted' ? '已付款待核销' : '已确认'}</span>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Suspense fallback={<div className="mx-auto max-w-3xl text-center text-gray-500">加载中...</div>}>
        <OrderContent />
      </Suspense>
    </div>
  );
}
