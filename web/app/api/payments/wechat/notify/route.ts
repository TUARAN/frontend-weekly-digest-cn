import { NextResponse } from 'next/server';
import { markOrderConfirmed } from '@/lib/order-store';
import { decryptWechatResource, verifyWechatSignature } from '@/lib/payments/wechat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();

  if (!verifyWechatSignature(body, req.headers)) {
    return NextResponse.json({ code: 'FAIL', message: 'invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body) as {
    resource?: {
      ciphertext: string;
      nonce: string;
      associated_data?: string;
    };
  };

  if (!payload.resource) {
    return NextResponse.json({ code: 'FAIL', message: 'missing resource' }, { status: 400 });
  }

  const data = decryptWechatResource(payload.resource);
  if (data.trade_state === 'SUCCESS' && typeof data.out_trade_no === 'string') {
    markOrderConfirmed(data.out_trade_no, {
      providerTradeNo: typeof data.transaction_id === 'string' ? data.transaction_id : undefined,
      rawNotify: data,
    });
  }

  return new NextResponse('', { status: 204 });
}
