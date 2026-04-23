import { NextResponse } from 'next/server';
import { markOrderConfirmed } from '@/lib/order-store';
import { verifyXunhuNotify } from '@/lib/payments/xunhu';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const payMethod = (url.searchParams.get('payMethod') === 'alipay' ? 'alipay' : 'wechat') as 'wechat' | 'alipay';
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body).entries());

  if (!verifyXunhuNotify(params, payMethod)) {
    return new NextResponse('fail', { status: 400 });
  }

  if (params.status === 'OD' && params.trade_order_id) {
    markOrderConfirmed(params.trade_order_id, {
      providerTradeNo: params.transaction_id || params.open_order_id,
      rawNotify: params,
    });
  }

  return new NextResponse('success');
}
