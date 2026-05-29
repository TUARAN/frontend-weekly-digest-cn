import { readFileSync } from 'fs';
import { join } from 'path';
import { ImageResponse } from 'next/og';
import QRCode from 'qrcode';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

function clip(text: string, max = 72): string {
  const clean = text.trim();
  if (!clean) return '';
  return clean.length <= max ? clean : `${clean.slice(0, max)}...`;
}

function kindLabel(kind: string): string {
  switch (kind) {
    case 'live':
      return '7×24 实时资讯';
    case 'daily':
      return '每日精选';
    case 'format':
      return '内容形态';
    case 'weekly':
      return '前端周刊';
    default:
      return '前端周看分享';
  }
}

export async function GET() {
  // Static export cannot inspect per-request query params; use a generic share image.
  const kind = 'other';
  const title = clip('前端周看');
  const summary = clip('给忙碌开发者的高信噪比信息流', 100);
  const target = 'https://frontendweekly.cn';
  const qrDataUrl = await QRCode.toDataURL(target, {
    margin: 1,
    width: 170,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
  const font = readFileSync(join(process.cwd(), 'assets/NotoSansSC-subset.ttf'));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background:
            'radial-gradient(700px 500px at 88% 15%, rgba(56,189,248,0.24), transparent 60%), linear-gradient(135deg, #020617 0%, #0b1f4d 60%, #0a3358 100%)',
          color: '#ffffff',
          fontFamily: 'Noto Sans SC',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '58px',
                height: '58px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #020617 0%, #1d4ed8 58%, #38bdf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '999px',
                  border: '4px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: '9px', height: '9px', borderRadius: '999px', background: '#ffffff' }} />
              </div>
            </div>
            <div style={{ fontSize: '34px', fontWeight: 700 }}>前端周看</div>
          </div>
          <div
            style={{
              display: 'flex',
              border: '1px solid rgba(148,163,184,0.4)',
              borderRadius: '999px',
              padding: '8px 16px',
              fontSize: '22px',
              color: '#bfdbfe',
            }}
          >
            {kindLabel(kind)}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: '60px', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-1.5px' }}>
            {title}
          </div>
          <div style={{ display: 'flex', marginTop: '22px', fontSize: '30px', lineHeight: 1.45, color: '#dbeafe' }}>
            {summary}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: '24px', color: '#93c5fd' }}>Signals over noise.</div>
            <div style={{ display: 'flex', marginTop: '6px', fontSize: '20px', color: '#cbd5e1' }}>frontendweekly.cn</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(148,163,184,0.38)',
              borderRadius: '16px',
              padding: '10px 10px 8px',
              background: 'rgba(255,255,255,0.95)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="前端周看二维码" width={86} height={86} />
            <div style={{ display: 'flex', fontSize: '14px', color: '#334155', letterSpacing: '0.4px' }}>扫码直达</div>
          </div>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts: [{ name: 'Noto Sans SC', data: font, weight: 700, style: 'normal' }],
    }
  );
}

