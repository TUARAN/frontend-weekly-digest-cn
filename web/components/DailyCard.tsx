import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import type { DailyData, DailyItem } from '@/lib/ai-daily';

// 高亮数字/百分比/金额（与脚本 highlightNumbers 一致）
function highlightNumbers(text: string) {
  const parts = text.split(/(\d[\d,.]*(?:%|亿|万|倍|美元|分|行)?)/g);
  return parts.map((p, i) =>
    /^\d[\d,.]*(?:%|亿|万|倍|美元|分|行)?$/.test(p) ? (
      <span key={i} style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

const COLORS = {
  coding: { accent: '#6c9af8', soft: 'rgba(108,154,248,0.2)', faint: 'rgba(108,154,248,0.1)' },
  embodied: { accent: '#50d4a0', soft: 'rgba(80,212,160,0.2)', faint: 'rgba(80,212,160,0.1)' },
};

function NewsItem({ item }: { item: DailyItem }) {
  const isEmbodied = item.topic === '具身智能';
  const c = isEmbodied ? COLORS.embodied : COLORS.coding;

  const itemStyle: CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '16px 18px',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={itemStyle}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          borderRadius: '12px 0 0 12px',
          background: c.accent,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
            background: c.soft,
            color: c.accent,
          }}
        >
          {item.num}
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.6px',
            padding: '2px 7px',
            borderRadius: 8,
            color: c.accent,
            background: c.faint,
          }}
        >
          {item.topic}
        </span>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f0f0f4', lineHeight: 1.45, marginBottom: 7 }}>
        {item.title}
      </div>
      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
        {highlightNumbers(item.summary)}
      </div>
      {item.reason && (
        <div style={{ marginTop: 9, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,200,60,0.8)', flexShrink: 0, marginTop: 1 }}>→</span>
          <span style={{ fontSize: 11, color: 'rgba(255,200,60,0.65)', lineHeight: 1.5, fontStyle: 'italic' }}>
            {item.reason}
          </span>
        </div>
      )}
    </div>
  );
}

const DailyCard = forwardRef<HTMLDivElement, { data: DailyData }>(function DailyCard({ data }, ref) {
  const hasCoding = data.items.some((i) => i.topic !== '具身智能');
  const hasEmbodied = data.items.some((i) => i.topic === '具身智能');

  return (
    <div
      ref={ref}
      style={{
        width: 500,
        background: '#0d0d12',
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 36px 44px',
        fontFamily: "-apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif",
        color: '#fff',
        boxSizing: 'border-box',
      }}
    >
      {/* 装饰光斑 */}
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100,120,255,0.13) 0%, transparent 70%)',
          top: -80,
          right: -60,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,210,150,0.09) 0%, transparent 70%)',
          bottom: 60,
          left: -40,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 28,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #5c6ef8, #7c5cf8)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '1.5px',
              padding: '3px 10px',
              borderRadius: 20,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            AI DAILY
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15, color: '#fff', letterSpacing: '-0.5px' }}>
            每日<span style={{ color: '#6c7ff8' }}>精选</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'rgba(255,255,255,0.08)', lineHeight: 1, letterSpacing: '-1px' }}>
            {data.dateNum}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px', marginTop: 2 }}>
            {data.year} · {data.dayOfWeek}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: 'linear-gradient(to right, rgba(108,127,248,0.6), rgba(108,127,248,0.1), transparent)',
          marginBottom: 24,
          position: 'relative',
          zIndex: 2,
        }}
      />

      {/* Tags */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, position: 'relative', zIndex: 2 }}>
        {hasCoding && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.8px',
              padding: '3px 10px',
              borderRadius: 12,
              border: '1px solid rgba(108,154,248,0.35)',
              color: '#6c9af8',
              background: 'rgba(108,154,248,0.08)',
            }}
          >
            # AI CODING
          </span>
        )}
        {hasEmbodied && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.8px',
              padding: '3px 10px',
              borderRadius: 12,
              border: '1px solid rgba(80,212,160,0.35)',
              color: '#50d4a0',
              background: 'rgba(80,212,160,0.08)',
            }}
          >
            # 具身智能
          </span>
        )}
      </div>

      {/* News */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 2 }}>
        {data.items.map((item) => (
          <NewsItem key={item.num} item={item} />
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, position: 'relative', zIndex: 2 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            padding: '10px 14px',
            background: 'rgba(108,127,248,0.08)',
            border: '1px solid rgba(108,127,248,0.2)',
            borderRadius: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6c7ff8, #50d4a0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              安
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.3px' }}>
                前端周看 · 每日精选
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1, letterSpacing: '0.2px' }}>
                by 安东尼 · 每日精选 AI Coding &amp; 具身智能动态
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: 10,
              color: '#6c9af8',
              background: 'rgba(108,154,248,0.12)',
              border: '1px solid rgba(108,154,248,0.25)',
              padding: '2px 8px',
              borderRadius: 8,
              fontWeight: 600,
              letterSpacing: '0.3px',
            }}
          >
            Daily
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.5px' }}>
            数据来源：{data.sources} · AI HOT
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.5px' }}>
            Auto Generated
          </span>
        </div>
      </div>
    </div>
  );
});

export default DailyCard;
