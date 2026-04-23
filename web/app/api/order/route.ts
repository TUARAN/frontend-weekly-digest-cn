import { NextResponse } from 'next/server';
import {
  createOrder,
  isValidOrderPlan,
  isValidPayMethod,
  markOrderConfirmed,
  markOrderPaymentSubmitted,
  readOrder,
  setOrderPaymentSession,
} from '@/lib/order-store';
import { createAlipayPayment } from '@/lib/payments/alipay';
import { paymentEnvEnabled } from '@/lib/payments/config';
import { createWechatPayment } from '@/lib/payments/wechat';
import { createXunhuPayment, queryXunhuOrder } from '@/lib/payments/xunhu';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderNo = searchParams.get('orderNo')?.trim();
  if (!orderNo) {
    return NextResponse.json({ ok: false, message: '缺少订单号' }, { status: 400 });
  }

  let order = readOrder(orderNo);
  if (!order) {
    return NextResponse.json({ ok: false, message: '订单不存在' }, { status: 404 });
  }

  if (order.status !== 'confirmed' && order.paymentSession?.provider === 'xunhu' && order.payMethod) {
    try {
      const remote = await queryXunhuOrder(orderNo, order.payMethod);
      if (remote && remote.status === 'OD') {
        order =
          markOrderConfirmed(orderNo, {
            providerTradeNo:
              typeof remote.transaction_id === 'string'
                ? remote.transaction_id
                : typeof remote.open_order_id === 'string'
                ? remote.open_order_id
                : undefined,
            rawNotify: remote,
          }) || order;
      }
    } catch {
      /* ignore provider query failures */
    }
  }

  return NextResponse.json({ ok: true, order });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (
      !body ||
      typeof body.orderNo !== 'string' ||
      typeof body.name !== 'string' ||
      typeof body.wechat !== 'string' ||
      !isValidOrderPlan(body.plan)
    ) {
      return NextResponse.json({ ok: false, message: '缺少订单信息' }, { status: 400 });
    }

    const orderNo = body.orderNo.trim();
    const name = body.name.trim();
    const wechat = body.wechat.trim();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!orderNo || !name || !wechat) {
      return NextResponse.json({ ok: false, message: '请完整填写下单信息' }, { status: 400 });
    }
    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ ok: false, message: '邮箱格式不正确' }, { status: 400 });
    }

    const order = createOrder({
      orderNo,
      plan: body.plan,
      amount: Number(body.amount) || 0,
      name,
      wechat,
      email: email || undefined,
      note: typeof body.note === 'string' ? body.note : undefined,
    });

    console.log('[order:create]', order.orderNo, order.plan, order.wechat);

    return NextResponse.json({ ok: true, order });
  } catch {
    return NextResponse.json({ ok: false, message: '服务器异常' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.orderNo !== 'string' || typeof body.action !== 'string') {
      return NextResponse.json({ ok: false, message: '支付提交信息不完整' }, { status: 400 });
    }

    const orderNo = body.orderNo.trim();
    const order = readOrder(orderNo);
    if (!order) {
      return NextResponse.json({ ok: false, message: '订单不存在' }, { status: 404 });
    }

    if (body.action === 'submit_payment') {
      if (!isValidPayMethod(body.payMethod)) {
        return NextResponse.json({ ok: false, message: '支付方式不正确' }, { status: 400 });
      }
      const updated = markOrderPaymentSubmitted(orderNo, body.payMethod);
      if (!updated) {
        return NextResponse.json({ ok: false, message: '订单不存在' }, { status: 404 });
      }
      console.log('[order:payment_submitted]', updated.orderNo, updated.payMethod);
      return NextResponse.json({ ok: true, order: updated });
    }

    if (body.action === 'mark_confirmed') {
      const updated = markOrderConfirmed(orderNo, { providerTradeNo: undefined, rawNotify: { source: 'manual_admin' } });
      if (!updated) {
        return NextResponse.json({ ok: false, message: '订单不存在' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, order: updated });
    }

    if (body.action === 'create_payment') {
      if (!isValidPayMethod(body.payMethod)) {
        return NextResponse.json({ ok: false, message: '支付方式不正确' }, { status: 400 });
      }
      const device = body.device === 'mobile' ? 'mobile' : 'desktop';
      const enabled = paymentEnvEnabled();
      const provider = body.provider === 'official' ? 'official' : 'xunhu';
      const paymentOrder = {
        ...order,
        payMethod: body.payMethod,
      };

      if (provider === 'xunhu') {
        if (!enabled.xunhu) {
          return NextResponse.json({ ok: false, message: '虎皮椒支付尚未配置完成' }, { status: 503 });
        }
        const session = await createXunhuPayment(paymentOrder);
        const updated = setOrderPaymentSession(orderNo, session);
        return NextResponse.json({ ok: true, order: updated, payment: session });
      }

      if (body.payMethod === 'alipay') {
        if (!enabled.alipay) {
          return NextResponse.json({ ok: false, message: '支付宝支付尚未配置完成' }, { status: 503 });
        }
        const session = createAlipayPayment(paymentOrder, device);
        const updated = setOrderPaymentSession(orderNo, session);
        return NextResponse.json({ ok: true, order: updated, payment: session });
      }

      if (!enabled.wechat) {
        return NextResponse.json({ ok: false, message: '微信支付尚未配置完成' }, { status: 503 });
      }

      const forwardedFor = req.headers.get('x-forwarded-for') || '';
      const clientIp =
        (typeof body.clientIp === 'string' && body.clientIp.trim()) ||
        forwardedFor.split(',')[0]?.trim() ||
        '127.0.0.1';
      const session = await createWechatPayment(paymentOrder, { device, clientIp });
      const updated = setOrderPaymentSession(orderNo, session);
      return NextResponse.json({ ok: true, order: updated, payment: session });
    }

    return NextResponse.json({ ok: false, message: '不支持的操作' }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, message: '服务器异常' }, { status: 500 });
  }
}
