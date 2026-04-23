import { NextResponse } from 'next/server';

// Stub subscribe endpoint. Replace with real provider (Resend / Mailchimp / ConvertKit) when ready.
// For now, validate input and respond with success so the UI flow is exercisable end-to-end.

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.email !== 'string') {
      return NextResponse.json({ ok: false, message: '邮箱格式有误' }, { status: 400 });
    }
    const email = body.email.trim().toLowerCase();
    if (!emailRegex.test(email)) {
      return NextResponse.json({ ok: false, message: '请填写有效的邮箱地址' }, { status: 400 });
    }

    // TODO: integrate with an ESP. For now, just log on the server.
    console.log('[subscribe]', email, 'plan=', body.plan ?? 'newsletter');

    return NextResponse.json({
      ok: true,
      message: '已收到，请查收确认邮件（当前为开发期，真实邮件服务接入后生效）。',
    });
  } catch {
    return NextResponse.json({ ok: false, message: '服务器异常' }, { status: 500 });
  }
}
