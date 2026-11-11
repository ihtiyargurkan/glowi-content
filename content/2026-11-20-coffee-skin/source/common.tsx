// Shared helpers for Glowi explainer scenes (2026-11-11): camera, pills, labels, citation, scan mesh, end card.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, ease, prog, rand} from './theme';
import {HORIZON} from './parts';

export const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

export const Pill: React.FC<{x: number; y: number; k: number; text: string; sub?: string; color?: string; fill?: string; size?: number; w?: number}> = ({
  x,
  y,
  k,
  text,
  sub,
  color = C.blush,
  fill = 'rgba(23,10,16,0.66)',
  size = 40,
  w,
}) => {
  if (k <= 0) return null;
  const ww = w ?? text.length * size * 0.62 + 90;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * k})`} opacity={k}>
      <rect x={-ww / 2} y={-size * 1.25} width={ww} height={size * 2.2} rx={size * 1.1} fill={fill} stroke={color} strokeWidth={3} />
      <text y={size * 0.35} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={size} fill={color} letterSpacing={2}>
        {text}
      </text>
      {sub && (
        <text y={size * 1.55 + 30} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={3} opacity={0.9}>
          {sub}
        </text>
      )}
    </g>
  );
};

export const Label: React.FC<{x: number; y: number; text: string; k?: number; color?: string; size?: number; anchor?: 'middle' | 'start' | 'end'}> = ({x, y, text, k = 1, color = C.blush, size = 26, anchor = 'middle'}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily="Poppins" fontWeight={700} fontSize={size} fill={color} letterSpacing={4} opacity={0.92 * k}>
    {text}
  </text>
);

export const Cite: React.FC<{text: string; k?: number; y?: number}> = ({text, k = 1, y = 1690}) => (
  <text x={W / 2} y={y} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={24} fill={C.blush} opacity={0.6 * k}>
    {text}
  </text>
);

// icon tile used in "fix" scenes
export const Tile: React.FC<{x: number; y: number; k: number; base: number; label: string; children: React.ReactNode; sc?: number}> = ({x, y, k, base, label, children, sc = 0.95}) => (
  <g transform={`translate(${x} ${y}) scale(${sc * (0.9 + 0.1 * k)})`} opacity={Math.max(base, k)}>
    <circle r={220} fill={C.goldHot} opacity={0.16 * k} filter="url(#blur30)" />
    <circle r={115} fill="rgba(23,10,16,0.62)" stroke={k > 0.5 ? 'rgba(238,221,226,0.7)' : 'rgba(238,221,226,0.35)'} strokeWidth={3} />
    {children}
    <text y={168} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={23} fill={C.blush} letterSpacing={2}>
      {label}
    </text>
  </g>
);

// Glowi scan mesh over a skin plane
export const ScanMesh: React.FC<{k: number; scan: number; top?: number}> = ({k, scan, top = 1000}) => {
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: top + rand(i * 7 + 2) * 820}));
  return (
    <g opacity={k}>
      {nodes.map((a, i) => {
        const b = nodes[(i * 5 + 3) % nodes.length];
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.blush} strokeWidth={1.5} opacity={0.55} />;
      })}
      {nodes.map((a, i) => (
        <circle key={i} cx={a.x} cy={a.y} r={7} fill={C.blush} opacity={a.y < HORIZON + (H - HORIZON) * scan ? 1 : 0} />
      ))}
    </g>
  );
};

// standard Glowi end card (same as the examples)
export const EndCard: React.FC<{s: number; tGlowi: number; cardK: number}> = ({s, tGlowi, cardK}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(circle at 50% 44%, rgba(75,46,57,${0.92 * cardK}) 0%, rgba(36,19,27,${0.97 * cardK}) 70%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div style={{position: 'relative', width: 420, height: 470, transform: `scale(${0.9 + 0.1 * cardK})`, opacity: cardK}}>
      <div style={{position: 'absolute', inset: -60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(238,221,226,0.35) 0%, rgba(238,221,226,0) 65%)'}} />
      <svg width={560} height={560} viewBox="0 0 560 560" style={{position: 'absolute', left: -70, top: -45}}>
        <circle cx={280} cy={280} r={262} fill="none" stroke={C.blush} strokeWidth={3} opacity={0.35} />
        <circle cx={280} cy={280} r={262} fill="none" stroke={C.blush} strokeWidth={5} strokeDasharray="300 1346" strokeLinecap="round" transform={`rotate(${(s - tGlowi) * 140} 280 280)`} />
      </svg>
      <Img src={staticFile('glowi-mark.png')} style={{position: 'absolute', inset: 0, width: 420, height: 470, objectFit: 'contain'}} />
    </div>
    <div
      style={{
        marginTop: 90,
        fontFamily: 'Lora',
        fontWeight: 600,
        fontSize: 120,
        color: C.blush,
        letterSpacing: 2,
        opacity: ease(prog(s, tGlowi + 0.2, tGlowi + 0.9)),
        transform: `translateY(${(1 - ease(prog(s, tGlowi + 0.2, tGlowi + 0.9))) * 20}px)`,
      }}
    >
      Glowi
    </div>
    <div style={{marginTop: 18, fontFamily: 'Poppins', fontWeight: 500, fontSize: 36, color: C.blush, opacity: 0.85 * ease(prog(s, tGlowi + 0.7, tGlowi + 1.4)), letterSpacing: 1}}>
      Know your skin, every day.
    </div>
    <div
      style={{
        marginTop: 40,
        padding: '16px 34px',
        borderRadius: 40,
        border: `2px solid rgba(238,221,226,0.5)`,
        fontFamily: 'Poppins',
        fontWeight: 600,
        fontSize: 28,
        color: C.blush,
        letterSpacing: 3,
        opacity: ease(prog(s, tGlowi + 1.2, tGlowi + 1.9)),
      }}
    >
      AI SKIN SCAN · DAILY ROUTINE
    </div>
  </div>
);
