import React from 'react';
import {C, W, H, rand, clamp, ease} from './theme';

// ---------- shared SVG defs ----------
export const Defs: React.FC = () => (
  <defs>
    <filter id="blur4" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" />
    </filter>
    <filter id="blur12" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" />
    </filter>
    <filter id="blur30" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="30" />
    </filter>
    <radialGradient id="sunGlow">
      <stop offset="0" stopColor={C.goldHot} stopOpacity="1" />
      <stop offset="0.25" stopColor={C.gold} stopOpacity="0.85" />
      <stop offset="0.6" stopColor="#E89A7A" stopOpacity="0.25" />
      <stop offset="1" stopColor={C.plum} stopOpacity="0" />
    </radialGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.plumInk} />
      <stop offset="0.55" stopColor="#3A1F2B" />
      <stop offset="1" stopColor="#6A3A4A" />
    </linearGradient>
    <linearGradient id="skinPlane" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#B9737F" />
      <stop offset="0.25" stopColor="#D99AA2" />
      <stop offset="1" stopColor="#F0C9C6" />
    </linearGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#6A3A4A" stopOpacity="1" />
      <stop offset="1" stopColor="#6A3A4A" stopOpacity="0" />
    </linearGradient>
    <radialGradient id="poreG">
      <stop offset="0" stopColor="#5E2735" stopOpacity="0.9" />
      <stop offset="0.6" stopColor="#8E4257" stopOpacity="0.5" />
      <stop offset="1" stopColor="#C88690" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="spotG">
      <stop offset="0" stopColor={C.spot} stopOpacity="0.85" />
      <stop offset="0.7" stopColor={C.spot} stopOpacity="0.35" />
      <stop offset="1" stopColor={C.spot} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="flushG">
      <stop offset="0" stopColor="#FF4F5E" stopOpacity="0.75" />
      <stop offset="1" stopColor="#FF4F5E" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="epi" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#F4D3D2" />
      <stop offset="1" stopColor="#E3A9AE" />
    </linearGradient>
    <linearGradient id="derm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#C9707F" />
      <stop offset="1" stopColor="#8A3B50" />
    </linearGradient>
    <linearGradient id="fatG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#7A3346" />
      <stop offset="1" stopColor="#4B2030" />
    </linearGradient>
    <radialGradient id="globule" cx="0.38" cy="0.32">
      <stop offset="0" stopColor="#FFF1C2" />
      <stop offset="0.45" stopColor="#F2C46A" />
      <stop offset="1" stopColor="#C98A2E" />
    </radialGradient>
    <linearGradient id="fiber" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFF4E6" />
      <stop offset="0.5" stopColor="#F2D7BE" />
      <stop offset="1" stopColor="#C99A86" />
    </linearGradient>
  </defs>
);

// ---------- floating bokeh ----------
export const Bokeh: React.FC<{s: number; n?: number; color?: string; top?: number; bottom?: number; seed?: number; o?: number}> = ({
  s,
  n = 26,
  color = C.blush,
  top = 0,
  bottom = H,
  seed = 1,
  o = 1,
}) => (
  <g opacity={o}>
    {Array.from({length: n}).map((_, i) => {
      const r = 3 + rand(i * 7 + seed) * 16;
      const x = (rand(i * 3 + seed) * W + s * (8 + rand(i + seed) * 20)) % W;
      const yy = top + rand(i * 5 + seed) * (bottom - top) - ((s * (6 + rand(i * 9) * 14)) % 160);
      const tw = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(s * 1.3 + i));
      return <circle key={i} cx={x} cy={yy} r={r} fill={color} opacity={tw * (r > 12 ? 0.35 : 0.6)} filter={r > 10 ? 'url(#blur4)' : undefined} />;
    })}
  </g>
);

// ---------- wave beam ----------
export const wavePath = (x0: number, y0: number, x1: number, y1: number, amp: number, wl: number, phase: number, len = 1) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy);
  const ux = dx / L;
  const uy = dy / L;
  const px = -uy;
  const py = ux;
  const steps = Math.max(2, Math.floor((L * len) / 6));
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * L * len;
    const off = Math.sin((t / wl) * Math.PI * 2 - phase) * amp;
    const x = x0 + ux * t + px * off;
    const y = y0 + uy * t + py * off;
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d;
};

export const Beam: React.FC<{d: string; color: string; o?: number; w?: number}> = ({d, color, o = 1, w = 7}) => (
  <g opacity={o}>
    <path d={d} stroke={color} strokeWidth={w * 4} fill="none" opacity={0.35} filter="url(#blur12)" strokeLinecap="round" />
    <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" />
    <path d={d} stroke="#fff" strokeWidth={w * 0.35} fill="none" opacity={0.75} strokeLinecap="round" />
  </g>
);

export const Tag: React.FC<{x: number; y: number; text: string; color: string; o?: number; size?: number}> = ({x, y, text, color, o = 1, size = 30}) => {
  const w = text.length * size * 0.66 + 36;
  return (
    <g opacity={o} transform={`translate(${x},${y})`}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.7} rx={size * 0.85} fill="rgba(23,10,16,0.55)" stroke={color} strokeWidth={2.5} />
      <text x={0} y={size * 0.33} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={size} fill={color} letterSpacing={2}>
        {text}
      </text>
    </g>
  );
};

// ---------- perspective skin plane ----------
export const HORIZON = 900;
const pores = Array.from({length: 120}).map((_, i) => {
  const z = Math.pow(rand(i * 11 + 3), 0.8);
  const u = rand(i * 17 + 5);
  return {z, u};
});
const planeXY = (u: number, z: number) => {
  const y = HORIZON + (H - HORIZON) * Math.pow(z, 1.5);
  const spread = W * (0.5 + 2.6 * Math.pow(z, 1.5));
  return {x: W / 2 + (u - 0.5) * spread, y};
};

export type SkinFx = {crease?: number; spots?: number; dull?: number; flush?: number; film?: number; filmSheen?: number; scan?: number; heal?: number};

export const SkinPlane: React.FC<{s: number; fx?: SkinFx}> = ({s, fx = {}}) => {
  const {crease = 0, spots = 0, dull = 0, flush = 0, film = 0, filmSheen = 0, scan = 0} = fx;
  // perspective grid (cell lines)
  const lines: string[] = [];
  for (let i = -14; i <= 14; i++) {
    const a = planeXY(0.5 + i * 0.045, 0.02);
    const b = planeXY(0.5 + i * 0.045 + Math.sin(i) * 0.01, 1.05);
    lines.push(`M${a.x} ${a.y} Q ${(a.x + b.x) / 2 + Math.sin(i * 2.3) * 30} ${(a.y + b.y) / 2} ${b.x} ${b.y}`);
  }
  for (let j = 1; j < 16; j++) {
    const z = j / 16;
    const a = planeXY(-0.4, z);
    const b = planeXY(1.4, z);
    lines.push(`M${a.x} ${a.y + Math.sin(j) * 6} Q ${W / 2} ${a.y + Math.cos(j * 1.7) * 14} ${b.x} ${b.y}`);
  }
  return (
    <g>
      <rect x={-200} y={HORIZON - 4} width={W + 400} height={H - HORIZON + 400} fill="url(#skinPlane)" />
      <g stroke="#B76F7C" strokeWidth={1.4} fill="none" opacity={0.35}>
        {lines.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {pores.map((p, i) => {
        const {x, y} = planeXY(p.u, p.z);
        const r = 3 + 20 * Math.pow(p.z, 1.6);
        return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.42} fill="url(#poreG)" />;
      })}
      {/* hairs */}
      {[0.22, 0.71, 0.86].map((u, i) => {
        const {x, y} = planeXY(u, 0.55 + i * 0.12);
        const sway = Math.sin(s * 0.8 + i) * 8;
        return <path key={i} d={`M${x} ${y} q ${20 + sway} -120 ${-30 + sway} -260`} stroke="#5A2A35" strokeWidth={3} fill="none" opacity={0.55} />;
      })}
      {/* flush (UVB burn) */}
      {flush > 0 && <ellipse cx={W / 2} cy={1330} rx={520} ry={240} fill="url(#flushG)" opacity={flush} />}
      {/* dark spots */}
      {spots > 0 &&
        [
          [0.36, 0.62, 1],
          [0.63, 0.5, 0.75],
          [0.55, 0.8, 1.3],
        ].map(([u, z, k], i) => {
          const {x, y} = planeXY(u, z);
          const g = ease(clamp(spots * 1.4 - i * 0.2));
          return <ellipse key={i} cx={x} cy={y} rx={70 * k * g} ry={30 * k * g} fill="url(#spotG)" />;
        })}
      {/* fine line crease */}
      {crease > 0 && (
        <g>
          <path
            d="M250 1420 C 420 1380, 560 1450, 830 1395"
            stroke="#7A3446"
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - crease}
            opacity={0.85}
          />
          <path
            d="M250 1428 C 420 1388, 560 1458, 830 1403"
            stroke="#FFE6E6"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - crease}
            opacity={0.5}
          />
        </g>
      )}
      {/* dull texture */}
      {dull > 0 && <rect x={-200} y={HORIZON} width={W + 400} height={H} fill="#8D7A80" opacity={0.38 * dull} style={{mixBlendMode: 'saturation'}} />}
      {/* sunscreen film */}
      {film > 0 && (
        <g>
          <clipPath id="filmClip">
            <ellipse cx={W / 2} cy={1500} rx={1400 * ease(film)} ry={760 * ease(film)} />
          </clipPath>
          <g clipPath="url(#filmClip)">
            <rect x={-200} y={HORIZON} width={W + 400} height={H} fill="#FFF7F2" opacity={0.3} />
            <rect x={-200} y={HORIZON} width={W + 400} height={H} fill="#FFE9C9" opacity={0.12} />
            <rect
              x={-600 + filmSheen * 2200}
              y={HORIZON}
              width={260}
              height={H}
              fill="#FFFFFF"
              opacity={0.55}
              transform={`skewX(-28)`}
              filter="url(#blur30)"
            />
            <path d={`M-200 ${HORIZON + 6} L ${W + 200} ${HORIZON + 6}`} stroke="#FFF" strokeWidth={6} opacity={0.8} />
          </g>
        </g>
      )}
      {/* glowi scan line */}
      {scan > 0 && scan < 1 && (
        <g>
          <rect x={-200} y={HORIZON + (H - HORIZON) * scan - 3} width={W + 400} height={6} fill={C.blush} opacity={0.9} />
          <rect x={-200} y={HORIZON + (H - HORIZON) * scan - 60} width={W + 400} height={120} fill={C.blush} opacity={0.25} filter="url(#blur12)" />
        </g>
      )}
      {/* horizon haze */}
      <rect x={-200} y={HORIZON - 40} width={W + 400} height={320} fill="url(#haze)" />
    </g>
  );
};

// ---------- sun ----------
export const Sun: React.FC<{x: number; y: number; s: number; k?: number}> = ({x, y, s, k = 1}) => (
  <g opacity={k}>
    <circle cx={x} cy={y} r={520} fill="url(#sunGlow)" opacity={0.75} />
    <g transform={`rotate(${s * 6} ${x} ${y})`} opacity={0.35}>
      {Array.from({length: 14}).map((_, i) => (
        <rect key={i} x={x - 3} y={y - 380} width={6} height={160} fill={C.goldHot} transform={`rotate(${(i * 360) / 14} ${x} ${y})`} filter="url(#blur4)" />
      ))}
    </g>
    <circle cx={x} cy={y} r={110} fill={C.goldHot} />
    <circle cx={x} cy={y} r={150} fill={C.gold} opacity={0.5} filter="url(#blur12)" />
  </g>
);

// ---------- cloud ----------
export const Cloud: React.FC<{x: number; y: number; sc?: number; o?: number}> = ({x, y, sc = 1, o = 1}) => (
  <g transform={`translate(${x},${y}) scale(${sc})`} opacity={o}>
    <g filter="url(#blur4)">
      {[
        [-150, 20, 90],
        [-60, -30, 120],
        [60, -10, 110],
        [150, 25, 80],
        [0, 40, 110],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#F6E9EC" opacity={0.92} />
      ))}
    </g>
    <ellipse cx={0} cy={95} rx={230} ry={30} fill="#C9A9B4" opacity={0.35} filter="url(#blur12)" />
  </g>
);

// ---------- window glass ----------
export const Glass: React.FC<{x: number; y: number; w: number; h: number; o?: number}> = ({x, y, w, h, o = 1}) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(220,235,255,0.12)" stroke="rgba(255,255,255,0.75)" strokeWidth={6} />
    <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} rx={10} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2} />
    <path d={`M${x + 40} ${y + h - 60} L ${x + w * 0.45} ${y + 50}`} stroke="#fff" strokeWidth={10} opacity={0.35} />
    <path d={`M${x + 90} ${y + h - 40} L ${x + w * 0.62} ${y + 70}`} stroke="#fff" strokeWidth={4} opacity={0.3} />
  </g>
);

// ---------- collagen coil ----------
export const coilPath = (x0: number, x1: number, y: number, amp: number, wl: number, phase: number) => {
  let d = '';
  const n = Math.max(2, Math.floor((x1 - x0) / 5));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const yy = y + Math.sin(((x - x0) / wl) * Math.PI * 2 + phase) * amp;
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + yy.toFixed(1);
  }
  return d;
};

export const Fiber: React.FC<{x0: number; x1: number; y: number; amp: number; wl: number; phase: number; w: number; o?: number}> = ({x0, x1, y, amp, wl, phase, w, o = 1}) => {
  const d = coilPath(x0, x1, y, amp, wl, phase);
  return (
    <g opacity={o}>
      <path d={d} stroke="#5E2232" strokeWidth={w + 6} fill="none" strokeLinecap="round" opacity={0.35} />
      <path d={d} stroke="#F2D7BE" strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={coilPath(x0, x1, y - w * 0.22, amp, wl, phase)} stroke="#FFF8EE" strokeWidth={w * 0.28} fill="none" strokeLinecap="round" opacity={0.85} />
    </g>
  );
};
