import crypto from 'node:crypto';
import type { OrderPayMethod, StoredOrder } from '@/lib/order-store';
import { getSiteUrl } from '@/lib/payments/config';

const XUNHU_GATEWAY_URL = process.env.XUNHU_GATEWAY_URL?.trim() || 'https://api.xunhupay.com/payment/do.html';
const XUNHU_QUERY_URL = process.env.XUNHU_QUERY_URL?.trim() || 'https://api.xunhupay.com/payment/query.html';

function getXunhuCredentials(payMethod: OrderPayMethod) {
  const appIdEnv = payMethod === 'wechat' ? 'XUNHU_WECHAT_APP_ID' : 'XUNHU_ALIPAY_APP_ID';
  const appSecretEnv = payMethod === 'wechat' ? 'XUNHU_WECHAT_APP_SECRET' : 'XUNHU_ALIPAY_APP_SECRET';
  const appid = process.env[appIdEnv]?.trim();
  const secret = process.env[appSecretEnv]?.trim();
  if (!appid || !secret) {
    throw new Error(`Missing env: ${appid ? appSecretEnv : appIdEnv}`);
  }
  return { appid, secret };
}

function signXunhuParams(params: Record<string, string>, secret: string) {
  const content = Object.entries(params)
    .filter(([, value]) => value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return crypto.createHash('md5').update(`${content}${secret}`, 'utf8').digest('hex');
}

function nonce(length = 16) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

export function verifyXunhuNotify(params: Record<string, string>, payMethod: OrderPayMethod) {
  const { secret } = getXunhuCredentials(payMethod);
  const source = Object.fromEntries(Object.entries(params).filter(([key]) => key !== 'hash'));
  return signXunhuParams(source, secret) === params.hash;
}

export async function createXunhuPayment(order: StoredOrder) {
  const payMethod = order.payMethod || 'wechat';
  const { appid, secret } = getXunhuCredentials(payMethod);
  const siteUrl = getSiteUrl();
  const basePayload = {
    version: '1.1',
    appid,
    trade_order_id: order.orderNo,
    total_fee: order.amount.toFixed(2),
    title: order.plan === '1v1' ? '前端下一步 1v1 定制化交流' : '前端下一步 Pro 年度会员',
    time: String(Math.floor(Date.now() / 1000)),
    notify_url: `${siteUrl}/api/payments/xunhu/notify?payMethod=${encodeURIComponent(payMethod)}`,
    return_url: `${siteUrl}/order?plan=${encodeURIComponent(order.plan)}&orderNo=${encodeURIComponent(order.orderNo)}&provider=xunhu`,
    callback_url: `${siteUrl}/order?plan=${encodeURIComponent(order.plan)}&orderNo=${encodeURIComponent(order.orderNo)}`,
    nonce_str: nonce(16),
    plugins: 'frontend-weekly-digest-cn',
    attach: order.plan,
  };
  const payload = {
    ...basePayload,
    hash: signXunhuParams(basePayload, secret),
  };

  const res = await fetch(XUNHU_GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(payload).toString(),
  });
  const json = (await res.json().catch(() => null)) as
    | {
        errcode: number;
        errmsg?: string;
        url?: string;
        url_qrcode?: string;
      }
    | null;

  if (!res.ok || !json || json.errcode !== 0) {
    throw new Error(json?.errmsg || `Xunhu create payment failed: ${res.status}`);
  }

  return {
    provider: 'xunhu' as const,
    payMethod,
    channel: 'xunhu_cashier' as const,
    payUrl: json.url,
    qrcodeUrl: json.url_qrcode,
    createdAt: new Date().toISOString(),
  };
}

export async function queryXunhuOrder(orderNo: string, payMethod: OrderPayMethod) {
  const { appid, secret } = getXunhuCredentials(payMethod);
  const basePayload = {
    appid,
    out_trade_order: orderNo,
    time: String(Math.floor(Date.now() / 1000)),
    nonce_str: nonce(16),
  };
  const payload = {
    ...basePayload,
    hash: signXunhuParams(basePayload, secret),
  };
  const res = await fetch(XUNHU_QUERY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(payload).toString(),
  });
  if (!res.ok) return null;
  return (await res.json().catch(() => null)) as Record<string, unknown> | null;
}
