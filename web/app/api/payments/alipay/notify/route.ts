import { NextResponse } from 'next/server';
import { markOrderConfirmed } from '@/lib/order-store';
import { verifyAlipayNotify } from '@/lib/payments/alipay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const text = await req.text();
  const params = Object.fromEntries(new URLSearchParams(text).entries());

  if (!verifyAlipayNotify(params)) {
    return new NextResponse('fail', { status: 400 });
  }

  if (params.trade_status === 'TRADE_SUCCESS' || params.trade_status === 'TRADE_FINISHED') {
    markOrderConfirmed(params.out_trade_no, {
      providerTradeNo: params.trade_no,
      rawNotify: params,
    });
  }

  return new NextResponse('success');
}
