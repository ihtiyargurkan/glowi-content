// Realistic skin building blocks for Glowi explainers (2026-11-09).
// SkinSection: anatomical cross-section (stratum corneum, keratinocytes, rete ridges, papillary capillaries,
//              collagen bundles, fibroblasts, a deeper vessel with red blood cells, optional follicles + oil glands,
//              melanocytes and melanin caps).
// SkinMacro:   close-up of the skin surface (mottled tone, grain, pores, fine lines, sheen, blotchy redness, spots).
// RealPlane:   the perspective skin "floor" without the tile grid: micro-relief furrows, pores, vellus hairs, texture.
import React from 'react';
import {C, W, H, clamp, ease, rand} from './theme';

const HZ = 900;

// ---------------------------------------------------------------- cross-section
export type SectionProps = {
  s: number;
  top: number; // surface y
  epi?: number; // epidermis thickness
  seed?: number;
  follicles?: number[]; // x positions of hair follicles (pores)
  flush?: number; // 0..1 dilated capillaries + redness
  melanocytes?: number[]; // x positions of melanocytes in the basal layer
  wake?: number; // 0..1 melanocyte activity glow
  melanin?: number; // 0..1 melanin caps over nuclei
  spotX?: number; // centre of a pigment spot (melanin concentrated here)
  spotK?: number; // 0..1
  bottom?: number;
};

export const surfY = (x: number, top: number) => top + 7 * Math.sin(x / 95) + 4 * Math.sin(x / 37 + 1.3);
export const dejY = (x: number, top: number, epi: number) => top + epi + 26 * Math.sin(x / 62 + 0.4) + 6 * Math.sin(x / 23);

export const SkinSection: React.FC<SectionProps> = ({s, top, epi = 230, seed = 1, follicles = [], flush = 0, melanocytes = [], wake = 0, melanin = 0, spotX = 540, spotK = 0, bottom = H + 200}) => {
  const id = `sec${seed}`;
  const xs = Array.from({length: 61}).map((_, i) => -60 + i * 20);
  const surf = xs.map((x) => `${x},${surfY(x, top).toFixed(1)}`).join(' L ');
  const dej = xs.map((x) => `${x},${dejY(x, top, epi).toFixed(1)}`).join(' L ');
  const dejRev = [...xs].reverse().map((x) => `${x},${dejY(x, top, epi).toFixed(1)}`).join(' L ');
  const epiPath = `M ${surf} L ${dejRev} Z`;
  const dermPath = `M ${dej} L ${W + 60},${bottom} L -60,${bottom} Z`;
  // keratinocytes: jittered rows, flatter near the top
  const cells: {x: number; y: number; rx: number; ry: number; r: number}[] = [];
  for (let row = 0; row < 9; row++) {
    const depth = row / 8;
    const ry = 9 + 11 * depth;
    const rx = 30 - 8 * depth;
    for (let c = 0; c < 26; c++) {
      const x = -40 + c * (rx * 2 + 4) + (row % 2) * rx + (rand(row * 31 + c * 7 + seed) - 0.5) * 8;
      const y = surfY(x, top) + 26 + row * (epi / 9.2) + (rand(row * 13 + c + seed) - 0.5) * 6;
      if (y + ry > dejY(x, top, epi) - 4) continue;
      cells.push({x, y, rx, ry, r: rand(row * 5 + c * 3 + seed)});
    }
  }
  // basal cells along the junction
  for (let c = 0; c < 40; c++) {
    const x = -50 + c * 30;
    const y = dejY(x, top, epi) - 16;
    cells.push({x, y, rx: 14, ry: 17, r: rand(c * 11 + seed)});
  }
  // papillae (dermis reaching up): local minima of the DEJ
  const papillae = xs.filter((x, i) => i > 0 && i < xs.length - 1 && dejY(x, top, epi) < dejY(x - 20, top, epi) && dejY(x, top, epi) <= dejY(x + 20, top, epi));
  const vy = top + epi + 330;
  const melK = (x: number) => clamp(melanin * (0.35 + 0.65 * spotK * Math.exp(-((x - spotX) ** 2) / (2 * 120 ** 2)) * 1.6));
  return (
    <g>
      <defs>
        <linearGradient id={`${id}epi`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6DCD5" />
          <stop offset="1" stopColor="#E7B3AE" />
        </linearGradient>
        <linearGradient id={`${id}der`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E0A0A2" />
          <stop offset="0.45" stopColor="#C9787F" />
          <stop offset="1" stopColor="#8E4257" />
        </linearGradient>
        <radialGradient id={`${id}rbc`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#9E1F2E" />
          <stop offset="0.55" stopColor="#D8384A" />
          <stop offset="1" stopColor="#B82638" />
        </radialGradient>
        <linearGradient id={`${id}vessel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E86A78" />
          <stop offset="0.5" stopColor="#B32A3E" />
          <stop offset="1" stopColor="#E86A78" />
        </linearGradient>
        <filter id={`${id}grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.08" numOctaves={3} seed={seed} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.15  0 0 0 0 0.2  0 0 0 0.55 -0.18" />
        </filter>
        <filter id={`${id}fine`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={1} seed={seed + 3} />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 -0.12" />
        </filter>
        <clipPath id={`${id}epiClip`}>
          <path d={epiPath} />
        </clipPath>
        <clipPath id={`${id}derClip`}>
          <path d={dermPath} />
        </clipPath>
        <radialGradient id={`${id}sg`} cx="0.38" cy="0.32">
          <stop offset="0" stopColor="#FFF1C2" />
          <stop offset="0.5" stopColor="#F0C674" />
          <stop offset="1" stopColor="#C6893A" />
        </radialGradient>
      </defs>
      {/* ---------- dermis ---------- */}
      <path d={dermPath} fill={`url(#${id}der)`} />
      <g clipPath={`url(#${id}derClip)`}>
        {/* collagen bundles */}
        {Array.from({length: 16}).map((_, i) => {
          const y0 = top + epi + 70 + i * 34 + rand(i + seed) * 20;
          const amp = 10 + rand(i * 3 + seed) * 10;
          const ph = rand(i * 7 + seed) * 6 + s * 0.15;
          let d = '';
          for (let k = 0; k <= 60; k++) {
            const x = -60 + k * 20;
            const y = y0 + Math.sin(x / (70 + i * 3) + ph) * amp + Math.sin(x / 31 + i) * 4;
            d += (k ? 'L' : 'M') + x + ' ' + y.toFixed(1);
          }
          return (
            <g key={i} opacity={0.55 - (i / 16) * 0.2}>
              <path d={d} stroke="#F6D2C8" strokeWidth={13 + rand(i) * 6} fill="none" strokeLinecap="round" opacity={0.42} />
              <path d={d} stroke="#FFF0EA" strokeWidth={3} fill="none" opacity={0.5} transform="translate(0 -3)" />
            </g>
          );
        })}
        {/* fibroblasts */}
        {Array.from({length: 18}).map((_, i) => {
          const x = rand(i * 17 + seed) * W;
          const y = top + epi + 80 + rand(i * 23 + seed) * 420;
          return <ellipse key={i} cx={x} cy={y} rx={22} ry={6} fill="#9C4A5E" opacity={0.55} transform={`rotate(${(rand(i) - 0.5) * 30} ${x} ${y})`} />;
        })}
        {/* papillary capillary loops */}
        {papillae.map((x, i) => {
          const yt = dejY(x, top, epi) + 14;
          const yb = yt + 120;
          const wdt = 7 + 5 * flush;
          return (
            <g key={i}>
              <path d={`M${x - 14} ${yb} C ${x - 16} ${yt + 30}, ${x - 10} ${yt}, ${x} ${yt} C ${x + 10} ${yt}, ${x + 16} ${yt + 30}, ${x + 14} ${yb}`} stroke="#C8283C" strokeWidth={wdt} fill="none" strokeLinecap="round" opacity={0.75 + 0.25 * flush} />
              <path d={`M${x - 14} ${yb} C ${x - 16} ${yt + 30}, ${x - 10} ${yt}, ${x} ${yt} C ${x + 10} ${yt}, ${x + 16} ${yt + 30}, ${x + 14} ${yb}`} stroke="#FF8E9A" strokeWidth={2} fill="none" opacity={0.6} />
            </g>
          );
        })}
        {flush > 0 && <rect x={-60} y={top + epi - 40} width={W + 120} height={260} fill="#FF3B55" opacity={0.22 * flush} filter="url(#blur30)" />}
        {/* deeper vessel with red blood cells */}
        <path d={`M-60 ${vy} C 300 ${vy - 40}, 700 ${vy + 50}, ${W + 60} ${vy - 10}`} stroke={`url(#${id}vessel)`} strokeWidth={84} fill="none" />
        <path d={`M-60 ${vy} C 300 ${vy - 40}, 700 ${vy + 50}, ${W + 60} ${vy - 10}`} stroke="#F2A0AA" strokeWidth={84} fill="none" opacity={0.25} strokeDasharray="2 10" />
        {Array.from({length: 22}).map((_, i) => {
          const x = ((rand(i * 3 + seed) * (W + 200) + s * 120) % (W + 200)) - 100;
          const u = x / W;
          const yy = vy + (-40 * 3 * u * (1 - u) * (1 - u) + 50 * 3 * u * u * (1 - u) - 10 * u * u * u) + (rand(i * 7) - 0.5) * 40;
          return <ellipse key={i} cx={x} cy={yy} rx={16} ry={10} fill={`url(#${id}rbc)`} transform={`rotate(${rand(i) * 60 - 30} ${x} ${yy})`} />;
        })}
        <rect x={-60} y={top} width={W + 120} height={bottom - top} filter={`url(#${id}grain)`} opacity={0.9} />
      </g>
      {/* ---------- epidermis ---------- */}
      <path d={epiPath} fill={`url(#${id}epi)`} />
      <g clipPath={`url(#${id}epiClip)`}>
        {cells.map((c, i) => {
          const tone = 240 - Math.round(c.r * 14);
          const cap = melK(c.x);
          return (
            <g key={i}>
              <ellipse cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} fill={`rgb(${tone},${tone - 42},${tone - 44})`} stroke="#C98A8E" strokeWidth={1.6} strokeOpacity={0.55} />
              <ellipse cx={c.x + (c.r - 0.5) * 6} cy={c.y + 1} rx={Math.min(7, c.rx * 0.3)} ry={Math.min(6, c.ry * 0.38)} fill="#B06A78" opacity={0.55} />
              {cap > 0.03 && <path d={`M${c.x - 9} ${c.y - 2} Q ${c.x} ${c.y - 14} ${c.x + 9} ${c.y - 2}`} stroke="#6E3B26" strokeWidth={5} fill="none" strokeLinecap="round" opacity={cap} />}
            </g>
          );
        })}
        {/* stratum corneum: flattened flakes on top */}
        {Array.from({length: 60}).map((_, i) => {
          const x = -40 + i * 19 + rand(i + seed) * 6;
          const y = surfY(x, top) + 4 + rand(i * 3) * 8;
          return <rect key={i} x={x} y={y} width={26} height={5} rx={2.5} fill="#FBEDE8" opacity={0.85} transform={`rotate(${(rand(i * 5) - 0.5) * 8} ${x} ${y})`} />;
        })}
        <rect x={-60} y={top - 20} width={W + 120} height={epi + 80} filter={`url(#${id}fine)`} opacity={0.5} />
      </g>
      <path d={`M ${surf}`} stroke="#FFF6F2" strokeWidth={4} fill="none" opacity={0.8} />
      <path d={`M ${dej}`} stroke="#B9707C" strokeWidth={3} fill="none" opacity={0.55} />
      {/* pigment gathering along the basal layer under a dark spot */}
      {spotK > 0.02 &&
        Array.from({length: 26}).map((_, i) => {
          const x = spotX + (rand(i * 7 + seed) - 0.5) * 300;
          const fall = Math.exp(-((x - spotX) ** 2) / (2 * 110 ** 2));
          const y = dejY(x, top, epi) - 14 - rand(i * 3) * 70 * fall;
          return <ellipse key={i} cx={x} cy={y} rx={(16 + rand(i) * 22) * fall} ry={(8 + rand(i * 5) * 8) * fall} fill="#6A3A24" opacity={0.55 * spotK * fall} filter="url(#blur4)" />;
        })}
      {/* melanocytes in the basal layer */}
      {melanocytes.map((x, i) => {
        const y = dejY(x, top, epi) - 12;
        const g = wake * (0.6 + 0.4 * Math.sin(s * 5 + i));
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r={80} fill={C.goldHot} opacity={0.22 * g} filter="url(#blur12)" />
            <circle r={46} fill="#7A4630" opacity={0.25} filter="url(#blur4)" />
            {[-162, -128, -96, -64, -30].map((a, j) => {
              const rr = 72 + rand(j + i * 5) * 34;
              const ca = Math.cos((a * Math.PI) / 180);
              const sa = Math.sin((a * Math.PI) / 180);
              const px = -sa;
              const py = ca;
              const bend = (rand(j * 3 + i) - 0.5) * 30;
              const mx = ca * rr * 0.55 + px * bend;
              const my = sa * rr * 0.55 + py * bend;
              return (
                <g key={j}>
                  <path d={`M${px * 8} ${py * 8} Q ${mx} ${my} ${ca * rr} ${sa * rr} Q ${mx - px * 2} ${my - py * 2} ${-px * 8} ${-py * 8} Z`} fill="#7A4630" opacity={0.92} />
                  <circle cx={ca * rr} cy={sa * rr} r={4} fill="#5A2E1C" />
                  <circle cx={mx} cy={my} r={3} fill="#4A2618" opacity={0.8} />
                </g>
              );
            })}
            <path d="M-24 4 C -26 -12, -8 -20, 4 -17 C 18 -16, 26 -6, 22 6 C 18 16, -14 18, -24 4 Z" fill="#8A5136" />
            <ellipse rx={8} ry={7} fill="#4A2618" />
          </g>
        );
      })}
      {/* follicles: canal + hair + sebaceous gland */}
      {follicles.map((x, i) => {
        const y0 = surfY(x, top);
        const yb = top + epi + 420;
        return (
          <g key={i}>
            <path d={`M${x - 62} ${y0 - 2} C ${x - 40} ${y0 + 30}, ${x - 30} ${y0 + 80}, ${x - 30} ${yb} L ${x + 30} ${yb} C ${x + 30} ${y0 + 80}, ${x + 40} ${y0 + 30}, ${x + 62} ${y0 - 2} Z`} fill="#E9B9B4" stroke="#C98A8E" strokeWidth={3} />
            <path d={`M${x - 40} ${y0 + 4} C ${x - 22} ${y0 + 40}, ${x - 16} ${y0 + 90}, ${x - 16} ${yb - 10} L ${x + 16} ${yb - 10} C ${x + 16} ${y0 + 90}, ${x + 22} ${y0 + 40}, ${x + 40} ${y0 + 4} Z`} fill="#7E3A4C" opacity={0.85} />
            <ellipse cx={x} cy={yb + 10} rx={34} ry={40} fill="#B85E6C" />
            <path d={`M${x} ${yb + 20} C ${x + 2} ${y0 + 120}, ${x + 4} ${y0}, ${x + 18} ${y0 - 160}`} stroke="#3E2219" strokeWidth={9} fill="none" strokeLinecap="round" />
            <path d={`M${x} ${yb + 20} C ${x + 2} ${y0 + 120}, ${x + 4} ${y0}, ${x + 18} ${y0 - 160}`} stroke="#8A5A44" strokeWidth={3} fill="none" opacity={0.6} transform="translate(-2 0)" />
            <path d={`M${x + 18} ${top + epi + 110} q 22 -6 40 6`} stroke="#E9B9B4" strokeWidth={12} fill="none" strokeLinecap="round" />
            <g opacity={0.92}>
              {[
                [62, 96, 28],
                [92, 118, 24],
                [70, 140, 26],
                [100, 156, 20],
                [78, 176, 18],
              ].map(([dx, dy, rr], j) => (
                <g key={j}>
                  <circle cx={x + dx} cy={top + epi + dy} r={rr} fill={`url(#${id}sg)`} stroke="#C99A5A" strokeWidth={2} />
                  <circle cx={x + dx - rr * 0.3} cy={top + epi + dy - rr * 0.3} r={rr * 0.25} fill="#FFF6DA" opacity={0.7} />
                  {[0, 1, 2].map((k) => (
                    <circle key={k} cx={x + dx + (rand(j * 3 + k) - 0.5) * rr} cy={top + epi + dy + (rand(j * 5 + k) - 0.5) * rr} r={3} fill="#D9A04E" opacity={0.7} />
                  ))}
                </g>
              ))}
            </g>
          </g>
        );
      })}
      {/* soft top light */}
      <rect x={-60} y={top + 12} width={W + 120} height={epi + 300} fill="#FFFFFF" opacity={0.05} />
    </g>
  );
};

// ---------------------------------------------------------------- surface close-up
export type MacroProps = {
  cx: number;
  cy: number;
  r: number;
  seed?: number;
  redness?: number;
  spots?: {x: number; y: number; r: number; k: number}[]; // relative to centre
  shape?: 'circle' | 'rect';
  w?: number;
  h?: number;
  rim?: string;
};

export const SkinMacro: React.FC<MacroProps> = ({cx, cy, r, seed = 1, redness = 0, spots = [], shape = 'circle', w = 0, h = 0, rim = 'rgba(255,255,255,0.45)'}) => {
  const id = `mac${seed}`;
  const ww = shape === 'rect' ? w : r * 2;
  const hh = shape === 'rect' ? h : r * 2;
  const x0 = cx - ww / 2;
  const y0 = cy - hh / 2;
  const pores = Array.from({length: Math.round((ww * hh) / 2600)}).map((_, i) => ({x: x0 + rand(i * 3 + seed) * ww, y: y0 + rand(i * 7 + seed) * hh, s: 0.6 + rand(i * 11 + seed) * 0.8}));
  return (
    <g>
      <defs>
        <clipPath id={`${id}clip`}>{shape === 'rect' ? <rect x={x0} y={y0} width={ww} height={hh} rx={24} /> : <circle cx={cx} cy={cy} r={r} />}</clipPath>
        <radialGradient id={`${id}base`} cx="0.42" cy="0.38" r="0.75">
          <stop offset="0" stopColor="#F6DAD2" />
          <stop offset="0.6" stopColor="#E9BDB4" />
          <stop offset="1" stopColor="#D49C97" />
        </radialGradient>
        <filter id={`${id}mottle`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={3} seed={seed} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.75  0 0 0 0 0.35  0 0 0 0 0.38  0 0 0 0.9 -0.3" />
        </filter>
        <filter id={`${id}grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={2} seed={seed + 9} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.25  0 0 0 0 0.28  0 0 0 0.6 -0.22" />
        </filter>
        <filter id={`${id}red`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={seed + 4} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.92  0 0 0 0 0.2  0 0 0 0 0.28  0 0 0 1.6 -0.35" />
        </filter>
        <filter id={`${id}spot`} x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves={2} seed={seed + 2} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={18} />
          <feGaussianBlur stdDeviation={2.2} />
        </filter>
      </defs>
      <g clipPath={`url(#${id}clip)`}>
        <rect x={x0} y={y0} width={ww} height={hh} fill={`url(#${id}base)`} />
        <rect x={x0} y={y0} width={ww} height={hh} filter={`url(#${id}mottle)`} opacity={0.55} />
        {redness > 0 && (
          <g opacity={redness}>
            <ellipse cx={cx} cy={cy} rx={ww * 0.42} ry={hh * 0.4} fill="#E9505F" opacity={0.45} filter="url(#blur30)" />
            <rect x={x0} y={y0} width={ww} height={hh} filter={`url(#${id}red)`} opacity={0.85} />
          </g>
        )}
        {/* fine lines (skin relief) */}
        {Array.from({length: 10}).map((_, i) => {
          const yy = y0 + (i + 0.5) * (hh / 10) + (rand(i + seed) - 0.5) * 12;
          return <path key={i} d={`M${x0 - 10} ${yy} q ${ww / 4} ${(rand(i * 3) - 0.5) * 30} ${ww / 2} ${(rand(i * 7) - 0.5) * 16} t ${ww / 2 + 20} ${(rand(i * 9) - 0.5) * 16}`} stroke="#B97A80" strokeWidth={1.2} fill="none" opacity={0.18} />;
        })}
        {Array.from({length: 8}).map((_, i) => {
          const xx = x0 + (i + 0.5) * (ww / 8);
          return <path key={i} d={`M${xx} ${y0 - 10} q ${(rand(i * 5) - 0.5) * 60} ${hh / 2} ${(rand(i * 2) - 0.5) * 40} ${hh + 20}`} stroke="#B97A80" strokeWidth={1} fill="none" opacity={0.1} />;
        })}
        {pores.map((p, i) => (
          <g key={i}>
            <ellipse cx={p.x} cy={p.y + 1} rx={3.6 * p.s} ry={3 * p.s} fill="#FFFFFF" opacity={0.35} />
            <ellipse cx={p.x} cy={p.y} rx={3 * p.s} ry={2.4 * p.s} fill="#8E4E5A" opacity={0.6} />
          </g>
        ))}
        {spots.map((sp, i) =>
          sp.k > 0.02 ? (
            <g key={i} filter={`url(#${id}spot)`} opacity={sp.k}>
              <ellipse cx={cx + sp.x} cy={cy + sp.y} rx={sp.r} ry={sp.r * 0.8} fill="#8A5238" opacity={0.75} />
              <ellipse cx={cx + sp.x + sp.r * 0.15} cy={cy + sp.y} rx={sp.r * 0.6} ry={sp.r * 0.5} fill="#6E3E28" opacity={0.6} />
            </g>
          ) : null,
        )}
        <rect x={x0} y={y0} width={ww} height={hh} filter={`url(#${id}grain)`} opacity={0.6} />
        {/* soft specular sheen */}
        <ellipse cx={cx - ww * 0.18} cy={cy - hh * 0.22} rx={ww * 0.28} ry={hh * 0.14} fill="#FFFFFF" opacity={0.18} filter="url(#blur12)" />
      </g>
      {shape === 'rect' ? <rect x={x0} y={y0} width={ww} height={hh} rx={24} fill="none" stroke={rim} strokeWidth={3} /> : <circle cx={cx} cy={cy} r={r} fill="none" stroke={rim} strokeWidth={3} />}
    </g>
  );
};

// ---------------------------------------------------------------- perspective plane (no tile grid)
const planeXY = (u: number, z: number) => {
  const y = HZ + (H - HZ) * Math.pow(z, 1.5);
  const spread = W * (0.5 + 2.6 * Math.pow(z, 1.5));
  return {x: W / 2 + (u - 0.5) * spread, y};
};
const PORES = Array.from({length: 170}).map((_, i) => ({z: Math.pow(rand(i * 11 + 3), 0.8), u: rand(i * 17 + 5)}));
const FURROWS = Array.from({length: 150}).map((_, i) => ({z: 0.08 + Math.pow(rand(i * 5 + 1), 0.9) * 0.95, u: rand(i * 9 + 2) * 1.4 - 0.2, a: (i % 2 ? 1 : -1) * (0.5 + rand(i * 3) * 0.4)}));

export type PlaneFx = {flush?: number; film?: number; filmSheen?: number; scan?: number; dull?: number};

export const RealPlane: React.FC<{s: number; fx?: PlaneFx; seed?: number}> = ({s, fx = {}, seed = 1}) => {
  const {flush = 0, film = 0, filmSheen = 0, scan = 0, dull = 0} = fx;
  const id = `pl${seed}`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}base`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B9737F" />
          <stop offset="0.22" stopColor="#D79A9F" />
          <stop offset="0.65" stopColor="#EDC2BC" />
          <stop offset="1" stopColor="#F4D2CA" />
        </linearGradient>
        <filter id={`${id}mottle`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.018" numOctaves={3} seed={seed} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.7  0 0 0 0 0.3  0 0 0 0 0.35  0 0 0 0.9 -0.32" />
        </filter>
        <filter id={`${id}grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.12 0.45" numOctaves={2} seed={seed + 5} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.2  0 0 0 0 0.25  0 0 0 0.5 -0.2" />
        </filter>
        <clipPath id={`${id}film`}>
          <ellipse cx={W / 2} cy={1500} rx={1400 * ease(film)} ry={760 * ease(film)} />
        </clipPath>
      </defs>
      <rect x={-200} y={HZ - 4} width={W + 400} height={H - HZ + 400} fill={`url(#${id}base)`} />
      <rect x={-200} y={HZ - 4} width={W + 400} height={H - HZ + 400} filter={`url(#${id}mottle)`} opacity={0.6} />
      {/* micro-relief: crossing furrows that form the skin's diamond pattern */}
      <g stroke="#A8616E" fill="none" strokeLinecap="round">
        {FURROWS.map((f, i) => {
          const a = planeXY(f.u, f.z);
          const len = 0.05 + 0.05 * rand(i);
          const b = planeXY(f.u + f.a * len, f.z + len * 0.6);
          return <path key={i} d={`M${a.x} ${a.y} Q ${(a.x + b.x) / 2 + 6} ${(a.y + b.y) / 2 - 4} ${b.x} ${b.y}`} strokeWidth={0.8 + 2.4 * Math.pow(f.z, 1.5)} opacity={0.32} />;
        })}
      </g>
      {PORES.map((p, i) => {
        const {x, y} = planeXY(p.u, p.z);
        const r = 2 + 13 * Math.pow(p.z, 1.6);
        return (
          <g key={i}>
            <ellipse cx={x} cy={y + r * 0.18} rx={r * 1.15} ry={r * 0.5} fill="#FFFFFF" opacity={0.28} />
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.42} fill="url(#poreG)" />
          </g>
        );
      })}
      {/* vellus hairs */}
      {Array.from({length: 26}).map((_, i) => {
        const {x, y} = planeXY(rand(i * 13 + 7), 0.25 + rand(i * 19) * 0.75);
        const k = (y - HZ) / (H - HZ);
        const sway = Math.sin(s * 0.8 + i) * 4 * k;
        return <path key={i} d={`M${x} ${y} q ${8 * k + sway} ${-30 * k} ${16 * k + sway} ${-62 * k}`} stroke="#C79A92" strokeWidth={1 + 1.6 * k} fill="none" opacity={0.6} />;
      })}
      <rect x={-200} y={HZ} width={W + 400} height={H} filter={`url(#${id}grain)`} opacity={0.55} />
      {/* soft sheen */}
      <ellipse cx={W * 0.62} cy={1250} rx={420} ry={90} fill="#FFFFFF" opacity={0.12} filter="url(#blur30)" />
      {flush > 0 && <ellipse cx={W / 2} cy={1360} rx={560} ry={260} fill="url(#flushG)" opacity={flush} />}
      {dull > 0 && <rect x={-200} y={HZ} width={W + 400} height={H} fill="#8D7A80" opacity={0.38 * dull} style={{mixBlendMode: 'saturation'}} />}
      {film > 0 && (
        <g clipPath={`url(#${id}film)`}>
          <rect x={-200} y={HZ} width={W + 400} height={H} fill="#FFF7F2" opacity={0.3} />
          <rect x={-200} y={HZ} width={W + 400} height={H} fill="#FFE9C9" opacity={0.12} />
          <rect x={-600 + filmSheen * 2200} y={HZ} width={260} height={H} fill="#FFFFFF" opacity={0.55} transform="skewX(-28)" filter="url(#blur30)" />
          <path d={`M-200 ${HZ + 6} L ${W + 200} ${HZ + 6}`} stroke="#FFF" strokeWidth={6} opacity={0.8} />
        </g>
      )}
      {scan > 0 && scan < 1 && (
        <g>
          <rect x={-200} y={HZ + (H - HZ) * scan - 3} width={W + 400} height={6} fill={C.blush} opacity={0.9} />
          <rect x={-200} y={HZ + (H - HZ) * scan - 60} width={W + 400} height={120} fill={C.blush} opacity={0.25} filter="url(#blur12)" />
        </g>
      )}
      <rect x={-200} y={HZ - 40} width={W + 400} height={320} fill="url(#haze)" />
    </g>
  );
};
