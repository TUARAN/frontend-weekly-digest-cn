import crypto from 'node:crypto';
import type { StoredOrder } from '@/lib/order-store';
import { getAlipayConfig, getSiteUrl } from '@/lib/payments/config';

function buildSignContent(params: URLSearchParams) {
  return Array.from(params.entries())
    .filter(([, value]) => value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

function signWithRsaSha256(content: string, privateKey: string) {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(content, 'utf8');
  signer.end();
  return signer.sign(privateKey, 'base64');
}

export function verifyAlipayNotify(params: Record<string, string>) {
  const { publicKey } = getAlipayConfig();
  const sign = params.sign;
  if (!sign) return false;

  const signParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === 'sign' || key === 'sign_type' || value === '') continue;
    signParams.set(key, value);
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(buildSignContent(signParams), 'utf8');
  verifier.end();
  return verifier.verify(publicKey, sign, 'base64');
}

export function createAlipayPayment(order: StoredOrder, device: 'desktop' | 'mobile') {
  const { appId, gateway, privateKey } = getAlipayConfig();
  const siteUrl = getSiteUrl();
  const method = device === 'mobile' ? 'alipay.trade.wap.pay' : 'alipay.trade.page.pay';
  const productCode = device === 'mobile' ? 'QUICK_WAP_PAY' : 'FAST_INSTANT_TRADE_PAY';
  const returnUrl = `${siteUrl}/order?plan=${encodeURIComponent(order.plan)}&orderNo=${encodeURIComponent(order.orderNo)}&provider=alipay`;
  const notifyUrl = `${siteUrl}/api/payments/alipay/notify`;

  const params = new URLSearchParams({
    app_id: appId,
    method,
    format: 'JSON',
    charset: 'utf-8',
    sign_type: 'RSA2',
    version: '1.0',
    notify_url: notifyUrl,
    return_url: returnUrl,
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    biz_content: JSON.stringify({
      out_trade_no: order.orderNo,
      total_amount: order.amount.toFixed(2),
      subject: order.plan === '1v1' ? '前端下一步 1v1 定制化交流' : '前端下一步 Pro 年度会员',
      product_code: productCode,
      quit_url: returnUrl,
    }),
  });

  params.set('sign', signWithRsaSha256(buildSignContent(params), privateKey));

  return {
    provider: 'official' as const,
    payMethod: 'alipay' as const,
    channel: device === 'mobile' ? 'alipay_wap' as const : 'alipay_page' as const,
    payUrl: `${gateway}?${params.toString()}`,
    createdAt: new Date().toISOString(),
  };
}
