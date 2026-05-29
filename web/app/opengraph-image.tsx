import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-static';
export const alt = '前端周看 · 站在前沿端点，每周看世界所发生的变化';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  const font = readFileSync(join(process.cwd(), 'assets/NotoSansSC-subset.ttf'));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '88px 96px',
          background:
            'radial-gradient(900px 600px at 78% 18%, rgba(56,189,248,0.22), transparent 60%), linear-gradient(135deg, #020617 0%, #0b1f4d 60%, #0a3358 100%)',
          color: '#ffffff',
          fontFamily: 'Noto Sans SC',
        }}
      >
        {/* brand row: mark + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #020617 0%, #1d4ed8 58%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '999px',
                border: '5px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: '12px', height: '12px', borderRadius: '999px', background: '#ffffff' }} />
            </div>
          </div>
          <div style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-1px' }}>前端周看</div>
        </div>

        {/* slogan as hero */}
        <div
          style={{
            display: 'flex',
            marginTop: '56px',
            fontSize: '76px',
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '-2px',
            maxWidth: '900px',
          }}
        >
          站在前沿端点，每周看世界所发生的变化
        </div>

        {/* footer tags */}
        <div
          style={{
            display: 'flex',
            marginTop: '56px',
            fontSize: '30px',
            color: '#9fc4f0',
            letterSpacing: '0.5px',
          }}
        >
          AI Coding · AI Agent · 大模型 · 前端工程
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Noto Sans SC', data: font, weight: 700, style: 'normal' }],
    },
  );
}
