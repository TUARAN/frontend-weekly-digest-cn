import crypto from 'node:crypto';
import type { StoredOrder } from '@/lib/order-store';
import { getSiteUrl, getWechatPayConfig } from '@/lib/payments/config';

function randomString(length = 32) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function signMessage(message: string, privateKey: string) {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(message);
  signer.end();
  return signer.sign(privateKey, 'base64');
}

function buildAuthorization(method: string, pathname: string, body: string) {
  const { mchId, serialNo, privateKey } = getWechatPayConfig();
  const nonceStr = randomString(32);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const message = `${method}\n${pathname}\n${timestamp}\n${nonceStr}\n${body}\n`;
  const signature = signMessage(message, privateKey);
  return `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",timestamp="${timestamp}",serial_no="${serialNo}",signature="${signature}"`;
}

async function wechatFetch<T>(pathname: string, payload: Record<string, unknown>) {
  const { baseUrl } = getWechatPayConfig();
  const body = JSON.stringify(payload);
  const res = await fetch(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: buildAuthorization('POST', pathname, body),
      'User-Agent': 'frontend-weekly-digest-cn/1.0',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WeChat Pay create order failed: ${res.status} ${text}`);
  }

  return (await res.json()) as T;
}

export async function createWechatPayment(order: StoredOrder, input: { device: 'desktop' | 'mobile'; clientIp: string }) {
  const { appId, mchId } = getWechatPayConfig();
  const siteUrl = getSiteUrl();
  const commonPayload = {
    appid: appId,
    mchid: mchId,
    description: order.plan === '1v1' ? '前端下一步 1v1 定制化交流' : '前端下一步 Pro 年度会员',
    out_trade_no: order.orderNo,
    notify_url: `${siteUrl}/api/payments/wechat/notify`,
    amount: {
      total: Math.round(order.amount * 100),
      currency: 'CNY',
    },
  };

  if (input.device === 'mobile') {
    const payload = {
      ...commonPayload,
      scene_info: {
        payer_client_ip: input.clientIp,
        h5_info: {
          type: 'Wap',
        },
      },
    };
    const response = await wechatFetch<{ h5_url: string }>('/v3/pay/transactions/h5', payload);
    const redirect = `${siteUrl}/order?plan=${encodeURIComponent(order.plan)}&orderNo=${encodeURIComponent(order.orderNo)}&provider=wechat`;
    const payUrl = `${response.h5_url}&redirect_url=${encodeURIComponent(redirect)}`;
    return {
      provider: 'official' as const,
      payMethod: 'wechat' as const,
      channel: 'wechat_h5' as const,
      payUrl,
      createdAt: new Date().toISOString(),
    };
  }

  const response = await wechatFetch<{ code_url: string }>('/v3/pay/transactions/native', commonPayload);
  return {
    provider: 'official' as const,
    payMethod: 'wechat' as const,
    channel: 'wechat_native' as const,
    codeUrl: response.code_url,
    createdAt: new Date().toISOString(),
  };
}

export function verifyWechatSignature(body: string, headers: Headers) {
  const { platformPublicKey } = getWechatPayConfig();
  const timestamp = headers.get('Wechatpay-Timestamp') || '';
  const nonce = headers.get('Wechatpay-Nonce') || '';
  const signature = headers.get('Wechatpay-Signature') || '';
  if (!timestamp || !nonce || !signature) return false;
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${timestamp}\n${nonce}\n${body}\n`);
  verifier.end();
  return verifier.verify(platformPublicKey, signature, 'base64');
}

export function decryptWechatResource(resource: {
  ciphertext: string;
  nonce: string;
  associated_data?: string;
}) {
  const { apiV3Key } = getWechatPayConfig();
  const cipher = Buffer.from(resource.ciphertext, 'base64');
  const authTag = cipher.subarray(cipher.length - 16);
  const data = cipher.subarray(0, cipher.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(apiV3Key), Buffer.from(resource.nonce));
  if (resource.associated_data) {
    decipher.setAAD(Buffer.from(resource.associated_data));
  }
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8')) as Record<string, unknown>;
}
