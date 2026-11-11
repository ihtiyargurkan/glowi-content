import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, HORIZON} from './parts';
import {cue, S} from './timeline';
import {SkinSection, SkinMacro, RealPlane} from './realskin';

// accent for this topic: wine
const WINE = '#C2365A';
const WINE_D = '#7A1530';
const AMBER = '#F0A640';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <linearGradient id="wineG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E0566F" />
        <stop offset="0.5" stopColor={WINE} />
        <stop offset="1" stopColor={WINE_D} />
      </linearGradient>
      <radialGradient id="wineGlow">
        <stop offset="0" stopColor={WINE} stopOpacity="0.7" />
        <stop offset="1" stopColor={WINE} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ambG">
        <stop offset="0" stopColor="#FFD58A" stopOpacity="0.95" />
        <stop offset="0.5" stopColor={AMBER} stopOpacity="0.55" />
        <stop offset="1" stopColor={AMBER} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
        <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.05" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.16" />
      </linearGradient>
      <radialGradient id="dropG" cx="0.35" cy="0.3">
        <stop offset="0" stopColor="#E9F7FD" />
        <stop offset="0.6" stopColor={C.water} />
        <stop offset="1" stopColor={C.waterDeep} />
      </radialGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

// ---------- wine glass with sloshing wine ----------
const WineGlass: React.FC<{x: number; y: number; sc?: number; s: number; tilt?: number; fill?: number; o?: number; id: string}> = ({x, y, sc = 1, s, tilt = 0, fill = 0.55, o = 1, id}) => {
  const bowl = 'M-150 -330 C -160 -200, -140 -90, -60 -50 C -30 -36, 30 -36, 60 -50 C 140 -90, 160 -200, 150 -330 Z';
  const lvl = -50 - 280 * fill;
  const slosh = 14 * Math.sin(s * 2.1) + tilt * 1.2;
  let surf = `M-200 ${lvl - slosh}`;
  for (let i = 1; i <= 20; i++) {
    const xx = -200 + i * 20;
    surf += ` L ${xx} ${(lvl - slosh + (slosh * 2 * i) / 20 + 4 * Math.sin(s * 3 + i * 0.6)).toFixed(1)}`;
  }
  surf += ' L 200 40 L -200 40 Z';
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${tilt})`} opacity={o}>
      <ellipse cx={0} cy={-150} rx={260} ry={260} fill="url(#wineGlow)" opacity={0.55} />
      <clipPath id={`${id}bowl`}>
        <path d={bowl} />
      </clipPath>
      <path d={bowl} fill="rgba(255,255,255,0.05)" />
      <g clipPath={`url(#${id}bowl)`}>
        <path d={surf} fill="url(#wineG)" />
        <path d={surf} fill="none" stroke="#FF9AAE" strokeWidth={4} opacity={0.6} />
      </g>
      <path d={bowl} fill="url(#glassG)" stroke="rgba(255,255,255,0.75)" strokeWidth={5} />
      <path d="M-118 -300 C -126 -210, -112 -140, -80 -100" stroke="#fff" strokeWidth={10} fill="none" opacity={0.45} strokeLinecap="round" />
      <ellipse cx={0} cy={-330} rx={150} ry={18} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={4} />
      <rect x={-8} y={-44} width={16} height={230} fill="rgba(255,255,255,0.55)" />
      <ellipse cx={0} cy={190} rx={110} ry={20} fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.7)" strokeWidth={4} />
    </g>
  );
};

const MiniGlass: React.FC<{x: number; y: number; k?: number; full?: boolean}> = ({x, y, k = 1, full = true}) => (
  <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * clamp(k)})`} opacity={clamp(k)}>
    <path d="M-20 -46 C -22 -24, -16 -10, 0 -8 C 16 -10, 22 -24, 20 -46 Z" fill={full ? WINE : 'rgba(255,255,255,0.08)'} stroke="rgba(255,255,255,0.8)" strokeWidth={3} />
    <rect x={-2} y={-8} width={4} height={30} fill="rgba(255,255,255,0.8)" />
    <rect x={-14} y={20} width={28} height={5} rx={2} fill="rgba(255,255,255,0.8)" />
  </g>
);

const Pill: React.FC<{x: number; y: number; k: number; text: string; sub?: string; color?: string; fill?: string; size?: number; w?: number}> = ({
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

const Label: React.FC<{x: number; y: number; text: string; k?: number; color?: string; size?: number; anchor?: 'middle' | 'start'}> = ({x, y, text, k = 1, color = C.blush, size = 26, anchor = 'middle'}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily="Poppins" fontWeight={700} fontSize={size} fill={color} letterSpacing={5} opacity={0.9 * k}>
    {text}
  </text>
);

const Cite: React.FC<{text: string; k?: number; y?: number}> = ({text, k = 1, y = 1680}) => (
  <text x={W / 2} y={y} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={24} fill={C.blush} opacity={0.6 * k}>
    {text}
  </text>
);

// wine drops falling on the skin plane and blooming into redness
const Drips: React.FC<{s: number; t0: number; k?: number}> = ({s, t0, k = 1}) => (
  <g opacity={k}>
    {Array.from({length: 9}).map((_, i) => {
      const st = t0 + i * 0.32 + rand(i * 3) * 0.2;
      const p = clamp((s - st) / 0.7);
      if (p <= 0) return null;
      const x = 380 + rand(i * 7) * 320;
      const yEnd = 1180 + rand(i * 11) * 380;
      const y = 860 + (yEnd - 860) * p * p;
      const bloom = clamp((s - st - 0.7) / 1.6);
      return (
        <g key={i}>
          {p < 1 && <ellipse cx={x} cy={y} rx={9} ry={14} fill={WINE} />}
          {bloom > 0 && <ellipse cx={x} cy={yEnd} rx={30 + 120 * easeOut(bloom)} ry={(30 + 120 * easeOut(bloom)) * 0.4} fill="url(#flushG)" opacity={0.75 * (1 - 0.3 * bloom)} />}
        </g>
      );
    })}
  </g>
);

// =============== A: hook — wine glass over skin, redness blooming ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tFace = cue('face?');
  const push = 1 + 0.08 * ease(prog(s, 0, S(1)));
  const flush = 0.25 + 0.6 * ease(prog(s, tFace - 0.6, tFace + 0.6));
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={C.goldHot} o={0.6} />
      <RealPlane s={s} seed={2} fx={{flush}} />
      <Drips s={s} t0={-0.6} />
      <WineGlass x={W / 2} y={860} sc={0.95} s={s} tilt={-8 + 4 * Math.sin(s * 1.3)} id="ga" />
    </Svg>
  );
};

// =============== B: dehydration is only one part ===============
const arcPath = (r: number, a0: number, a1: number) => {
  const p = (a: number) => [Math.cos(((a - 90) * Math.PI) / 180) * r, Math.sin(((a - 90) * Math.PI) / 180) * r];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tDe = cue('dehydration.');
  const tPart = cue('part');
  const push = 1.06 - 0.06 * ease(prog(s, t0 - 0.3, S(2)));
  const dropK = ease(prog(s, t0 - 0.2, t0 + 0.5));
  const tagK = ease(prog(s, tDe - 0.3, tDe + 0.3));
  const ring = ease(prog(s, tPart - 0.5, tPart + 0.6));
  const cx = W / 2;
  const cy = 1030;
  const dropSc = 1 - 0.68 * ring;
  const segs = [
    {a0: 4, a1: 116, col: C.water},
    {a0: 124, a1: 236, col: WINE},
    {a0: 244, a1: 356, col: C.moon},
  ];
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={cx} cy={cy} r={780} fill={C.plum} opacity={0.75} filter="url(#blur30)" />
      <Bokeh s={s} seed={21} o={0.5} />
      <g transform={`translate(${cx} ${cy})`}>
        {/* ring of causes */}
        {segs.map((g, i) => {
          const k = i === 0 ? ring : clamp(ring * 1.6 - 0.3 - i * 0.15);
          const mid = ((g.a0 + g.a1) / 2 - 90) * (Math.PI / 180);
          return (
            <g key={i} opacity={k}>
              <path d={arcPath(330, g.a0, g.a0 + (g.a1 - g.a0) * Math.max(0.01, k))} stroke={g.col} strokeWidth={46} fill="none" strokeLinecap="round" opacity={i === 0 ? 0.95 : 0.4} />
              {i > 0 && <path d={arcPath(330, g.a0, g.a0 + (g.a1 - g.a0) * Math.max(0.01, k))} stroke={g.col} strokeWidth={46} fill="none" strokeLinecap="round" opacity={0.25 + 0.15 * Math.sin(s * 4 + i)} filter="url(#blur12)" />}
              {i > 0 && (
                <g transform={`translate(${Math.cos(mid) * 330} ${Math.sin(mid) * 330})`}>
                  <circle r={52} fill="rgba(23,10,16,0.85)" stroke={g.col} strokeWidth={4} />
                  <text y={22} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={60} fill={g.col}>
                    ?
                  </text>
                </g>
              )}
            </g>
          );
        })}
        <g opacity={ring}>
          <text y={-8} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.blush} letterSpacing={4}>MORNING-AFTER</text>
          <text y={40} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.blush} letterSpacing={4}>FACE</text>
        </g>
        {/* the big water drop people blame: shrinks into its slice */}
        <g transform={`translate(${286 * ring} ${-165 * ring}) scale(${dropSc * (0.85 + 0.15 * dropK)})`} opacity={dropK}>
          <circle r={260} fill={C.water} opacity={0.15} filter="url(#blur30)" />
          <path d="M0 -250 C 70 -150, 170 -40, 170 60 a 170 170 0 0 1 -340 0 c 0 -100 100 -210 170 -310 Z" fill="url(#dropG)" />
          <path d="M-90 30 C -100 -20, -70 -80, -40 -120" stroke="#fff" strokeWidth={18} fill="none" opacity={0.6} strokeLinecap="round" />
        </g>
      </g>
      <Pill x={cx} y={1520} k={tagK} text={ring > 0.5 ? 'DEHYDRATION = ONE PART' : 'DEHYDRATION?'} color={C.water} size={34} />
    </Svg>
  );
};

// =============== C: harsh byproduct opens the tiny vessels → flush ===============
const SURF = 700;
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tBy = cue('byproduct.');
  const tOpens = cue('opens');
  const tRed = cue('red.');
  const push = 1.1 - 0.1 * ease(prog(s, t0 - 0.3, t0 + 2));
  const inflow = prog(s, t0 - 0.2, tBy + 0.5);
  const conv = ease(prog(s, tBy - 0.8, tBy + 0.4));
  const flush = ease(prog(s, tOpens - 0.3, tRed + 0.3));
  const red = ease(prog(s, tRed - 0.4, tRed + 0.5));
  const epi = 250;
  const vy = SURF + epi + 330;
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={SURF + 200} fill="url(#sky)" />
      <Bokeh s={s} n={14} top={430} bottom={SURF} seed={31} color={C.goldHot} o={0.5} />
      <SkinSection s={s} top={SURF} epi={epi} seed={7} flush={flush} />
      <rect x={-60} y={SURF - 40} width={W + 120} height={160} fill="#FF3B55" opacity={0.5 * red} filter="url(#blur30)" />
      <rect x={-60} y={SURF + 180} width={W + 120} height={200} fill="#FF2848" opacity={0.3 * flush} filter="url(#blur30)" />
      <Label x={56} y={SURF + 64} text="SKIN" color={C.plum} anchor="start" />
      {Array.from({length: 18}).map((_, i) => {
        const x = ((rand(i * 3) * (W + 200) + s * 110) % (W + 200)) - 100;
        const rise = clamp(inflow * 1.4 - rand(i * 5) * 0.4);
        const y = vy - rise * (180 + rand(i * 7) * 120) + Math.sin(s * 2 + i) * 8;
        const c = clamp(conv * 1.5 - rand(i * 9) * 0.5);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${s * 40 + i * 30})`}>
            {c < 1 && (
              <g opacity={1 - c}>
                <circle r={13} fill={WINE} stroke="#FFB3C2" strokeWidth={2} />
                <circle cx={16} cy={-6} r={8} fill="#F4D7DE" />
                <circle cx={-15} cy={7} r={8} fill="#F4D7DE" />
              </g>
            )}
            {c > 0 && (
              <g opacity={c}>
                <circle r={34} fill="url(#ambG)" opacity={0.8} />
                <path d="M0 -18 L 6 -6 L 18 -6 L 9 3 L 13 16 L 0 8 L -13 16 L -9 3 L -18 -6 L -6 -6 Z" fill={AMBER} />
              </g>
            )}
          </g>
        );
      })}
      <Pill x={W / 2} y={1560} k={conv} text="ACETALDEHYDE" color={AMBER} size={34} sub="HARSH BYPRODUCT" />
      {flush > 0.05 &&
        [300, 780].map((x, i) => (
          <g key={i} opacity={flush * (1 - red * 0.6)} stroke={C.white} strokeWidth={5} strokeLinecap="round" fill="none">
            <path d={`M${x - 70} ${SURF + epi + 70} l -40 0 m 14 -14 l -14 14 l 14 14`} />
            <path d={`M${x + 70} ${SURF + epi + 70} l 40 0 m -14 -14 l 14 14 l -14 14`} />
          </g>
        ))}
      <Pill x={W / 2} y={SURF - 130} k={red} text="FLUSH" color={WINE} fill="rgba(23,10,16,0.7)" size={40} />
      <Cite text="DermNet NZ · alcohol & skin · illustrative" k={ease(prog(s, t0, t0 + 0.6))} y={1720} />
    </Svg>
  );
};

// =============== D: muted signal → kidneys let water go; sleep turns light and broken ===============
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const tMutes = cue('mutes');
  const tKid = cue('kidneys');
  const tLose = cue('lose');
  const tSleep = cue('sleep');
  const tBroken = cue('broken.');
  const push = 1.04 + 0.06 * ease(prog(s, t0, S(4)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const mute = ease(prog(s, tMutes - 0.3, tMutes + 0.4));
  const kidK = ease(prog(s, tKid - 0.4, tKid + 0.3));
  const drain = prog(s, tLose - 1.4, tLose + 2.5);
  const sleepK = ease(prog(s, tSleep - 0.5, tSleep + 0.6));
  const graphK = Math.max(0.75 * inK, ease(prog(s, tSleep - 0.6, tSleep)));
  const broken = ease(prog(s, tSleep + 0.2, tBroken + 0.4));
  const sx = 250;
  const sy = 650;
  const kx = 770;
  const ky = 680;
  const sleepPath = () => {
    let d = '';
    for (let i = 0; i <= 140; i++) {
      const u = i / 140;
      const x = 130 + i * 5.9;
      const deep = Math.sin(u * Math.PI * 4 - Math.PI / 2) * 0.5 + 0.5;
      const choppy = (Math.sin(u * 70 + s * 2) * 0.5 + Math.sin(u * 31) * 0.5) * 0.35;
      const depth = deep * (1 - broken) + broken * clamp(0.15 + choppy + 0.2 * deep);
      const y = 1270 + depth * 230;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d || 'M130 1270';
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.night} />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} opacity={0.6} />
      <circle cx={W / 2} cy={950} r={760} fill={C.plum} opacity={0.6} filter="url(#blur30)" />
      <Bokeh s={s} seed={41} o={0.45} />
      <g opacity={inK}>
        <g transform={`translate(${sx} ${sy}) scale(1.25)`}>
          <circle r={110} fill="rgba(23,10,16,0.65)" stroke="rgba(238,221,226,0.4)" strokeWidth={3} />
          <path d="M-46 20 L -46 -20 L -16 -20 L 20 -54 L 20 54 L -16 20 Z" fill={C.blush} />
          {[0, 1, 2].map((j) => {
            const ph = (s * 0.9 + j / 3) % 1;
            return <path key={j} d={`M${130 + ph * 300} ${-40 - ph * 30} q 30 ${40 + ph * 30} 0 ${80 + ph * 60}`} stroke={C.blush} strokeWidth={6} fill="none" opacity={(1 - ph) * (1 - mute)} strokeLinecap="round" />;
          })}
          {mute > 0 && <line x1={-80} y1={-80} x2={-80 + 160 * mute} y2={-80 + 160 * mute} stroke={WINE} strokeWidth={12} strokeLinecap="round" />}
          <text y={160} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={C.blush} letterSpacing={4}>
            "HOLD WATER"
          </text>
        </g>
        <line x1={sx + 150} y1={sy} x2={kx - 170} y2={ky} stroke="rgba(238,221,226,0.3)" strokeWidth={4} strokeDasharray="10 12" />
        <g transform={`translate(${kx} ${ky}) scale(${1.1 + 0.2 * kidK})`} opacity={0.5 + 0.5 * kidK}>
          <circle r={130} fill="#B85E6C" opacity={0.15 * kidK} filter="url(#blur30)" />
          <path d="M20 -110 C 110 -120, 140 -20, 110 50 C 80 120, 0 130, -20 70 C -30 40, 10 20, -10 -10 C -30 -40, -50 -100, 20 -110 Z" fill="#B85E6C" stroke="#F2B6BE" strokeWidth={4} />
          <path d="M60 -60 C 90 -20, 80 40, 40 70" stroke="#8E3D50" strokeWidth={10} fill="none" opacity={0.6} />
          <text y={-150} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={C.blush} letterSpacing={4}>
            KIDNEYS
          </text>
        </g>
        {Array.from({length: 16}).map((_, i) => {
          const ph = (drain * 3 + i / 16) % 1;
          const on = drain > 0 && drain < 1 ? 1 : 0;
          return <path key={i} d="M0 -20 C 8 -8, 14 0, 14 8 a 14 14 0 0 1 -28 0 c 0 -8 6 -16 14 -28 Z" fill="url(#dropG)" transform={`translate(${kx + Math.sin(i * 2.1) * 60} ${ky + 210 + ph * 200}) scale(1.5)`} opacity={on * (1 - ph) * 0.9} />;
        })}
        <Pill x={kx - 260} y={960} k={ease(prog(s, tLose - 0.3, tLose + 0.3))} text="− FLUID" color={C.water} size={30} />
        <g opacity={graphK}>
          <g transform={`translate(160 1150)`}>
            <circle r={40} fill={C.moon} opacity={0.3} filter="url(#blur12)" />
            <circle r={30} fill="#FFF6E2" />
            <circle cx={14} cy={-8} r={26} fill={C.night} />
          </g>
          <text x={220} y={1162} fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.blush} letterSpacing={4}>
            SLEEP DEPTH
          </text>
          <line x1={130} y1={1270} x2={960} y2={1270} stroke="rgba(238,221,226,0.25)" strokeWidth={2} strokeDasharray="8 10" />
          <text x={960} y={1255} textAnchor="end" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} opacity={0.75} letterSpacing={3}>
            LIGHT
          </text>
          <text x={960} y={1535} textAnchor="end" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} opacity={0.75} letterSpacing={3}>
            DEEP
          </text>
          <path d={sleepPath()} stroke={C.moon} strokeWidth={20} fill="none" opacity={0.2} filter="url(#blur4)" />
          <path opacity={0.55 + 0.45 * sleepK} d={sleepPath()} stroke={broken > 0.3 ? C.uvb : C.moon} strokeWidth={8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </g>
      </g>
      <Cite text="NIAAA · Hangovers fact sheet · illustrative" k={inK} y={1700} />
    </Svg>
  );
};

// =============== E: the survey — 8+ drinks a week ===============
const EyeCard: React.FC<{cx: number; label: string; glasses: number; puff: number; veins: number; hl: number; k: number; seed: number; gk: number}> = ({cx, label, glasses, puff, veins, hl, k, seed, gk}) => (
  <g transform={`translate(${cx} 1060)`} opacity={k}>
    <rect x={-225} y={-340} width={450} height={640} rx={36} fill="rgba(238,221,226,0.07)" stroke={hl > 0 ? C.white : 'rgba(238,221,226,0.3)'} strokeWidth={hl > 0 ? 5 : 3} />
    <text y={-276} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white}>
      {label}
    </text>
    {Array.from({length: glasses}).map((_, i) => (
      <MiniGlass key={i} x={-((glasses - 1) * 46) / 2 + i * 46} y={-185} k={gk * glasses - i} />
    ))}
    <text y={-118} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={20} fill={C.blush} letterSpacing={3} opacity={0.7}>
      DRINKS A WEEK
    </text>
    <SkinMacro cx={0} cy={50} r={0} shape="rect" w={380} h={300} seed={seed} redness={0.45 * veins} />
    <path d="M-130 -10 Q 0 50 130 -10" stroke="#6E3442" strokeWidth={7} fill="none" strokeLinecap="round" />
    {Array.from({length: 9}).map((_, i) => {
      const u = (i + 1) / 10;
      const x = -130 + 260 * u;
      const y = -10 + 120 * u * (1 - u);
      return <path key={i} d={`M${x} ${y} l ${(u - 0.5) * 18} 20`} stroke="#4A2028" strokeWidth={4} strokeLinecap="round" />;
    })}
    <ellipse cx={0} cy={92 + 26 * puff} rx={125 + 15 * puff} ry={8 + 50 * puff} fill="#E7B3B5" opacity={0.15 + 0.75 * puff} />
    <ellipse cx={0} cy={80 + 22 * puff} rx={90} ry={6 + 18 * puff} fill="#FFFFFF" opacity={0.25 * puff} filter="url(#blur4)" />
    <path d={`M-120 ${60 + 8 * puff} Q 0 ${110 + 80 * puff} 120 ${60 + 8 * puff}`} stroke="#A9656F" strokeWidth={4 + 3 * puff} fill="none" opacity={0.45 + 0.45 * puff} />
    {veins > 0.02 &&
      ['M-160 160 q 30 -20 60 -6 q 20 10 40 -10', 'M60 165 q 20 -30 50 -20 q 20 6 36 -20', 'M-40 180 q 10 -20 30 -14'].map((d, i) => (
        <path key={i} d={d} stroke="#D2384C" strokeWidth={3.5} fill="none" opacity={0.9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - veins} />
      ))}
    <text y={260} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={3} opacity={0.8}>
      UNDER-EYE
    </text>
  </g>
);
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tN = cue('3,267');
  const t8 = cue('8', 4);
  const tPuff = cue('puffiness');
  const tVes = cue('vessels.');
  const push = 1 + 0.05 * ease(prog(s, t0, S(5)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const nK = ease(prog(s, tN - 0.3, tN + 0.4));
  const gk = prog(s, t8 - 0.4, t8 + 0.9);
  const puff = ease(prog(s, tPuff - 0.4, tPuff + 0.5));
  const veins = ease(prog(s, tVes - 0.6, tVes + 0.6));
  const count = 3267;
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} o={0.5} />
      <Pill x={W / 2} y={570} k={Math.max(inK * 0.5, nK)} text={`${count.toLocaleString('en-US')} women · 4 countries`} color={C.blush} size={32} w={640} />
      <EyeCard cx={290} label="Fewer than 8" glasses={2} puff={0} veins={0} hl={0} k={inK} seed={31} gk={gk} />
      <EyeCard cx={790} label="8 or more" glasses={8} puff={puff} veins={veins} hl={puff} k={inK} seed={32} gk={gk} />
      <Pill x={790} y={1460} k={puff} text="MORE" sub={veins > 0.3 ? 'PUFFINESS · VESSELS' : 'PUFFINESS'} color={C.plum} fill={C.blush} size={44} w={250} />
      <Cite text="Goodman et al., PRS Global Open, 2019 · illustrative" k={inK} />
    </Svg>
  );
};

// =============== F: a link, not proof — same signs a big night leaves ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tLink = cue('link,');
  const tProof = cue('proof.');
  const tSigns = cue('fits');
  const tNight = cue('sleep', 5);
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(6)));
  const linkK = ease(prog(s, t0 - 0.3, tLink + 0.3));
  const proofK = ease(prog(s, tProof - 0.2, tProof + 0.3));
  const signK = ease(prog(s, tSigns - 0.4, tSigns + 0.4));
  const nightK = ease(prog(s, tNight - 0.5, tNight + 0.4));
  const iy = 800;
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.night} opacity={0.7 * nightK} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={61} o={0.5} />
      <g transform="translate(0 480)" opacity={0.85}>
        <RealPlane s={s} seed={4} fx={{flush: 0.3 + 0.4 * signK}} />
      </g>
      <g opacity={nightK} transform={`translate(${W / 2} ${1120 - 40 * nightK})`}>
        <circle r={150} fill={C.moon} opacity={0.18} filter="url(#blur30)" />
        <circle r={70} fill="#FFF6E2" />
        <circle cx={34} cy={-22} r={62} fill="#1E0F18" />
      </g>
      <g opacity={linkK}>
        <g transform={`translate(240 ${iy})`}>
          <circle r={115} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
          <WineGlass x={0} y={62} sc={0.3} s={s} id="gf" />
          <text y={165} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={4}>
            8+ DRINKS
          </text>
        </g>
        <g transform={`translate(840 ${iy})`}>
          <circle r={115} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
          <SkinMacro cx={0} cy={0} r={86} seed={44} redness={0.4 + 0.4 * signK} />
          <path d="M-50 -10 Q 0 15 50 -10" stroke="#6E3442" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`M-46 22 Q 0 ${46 + 18 * signK} 46 22`} stroke="#A9656F" strokeWidth={4} fill="none" />
          <text y={165} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={4}>
            SKIN SIGNS
          </text>
          {signK > 0 && <circle r={128} fill="none" stroke={C.goldHot} strokeWidth={5} opacity={signK * (0.6 + 0.4 * Math.sin(s * 6))} />}
        </g>
        <line x1={370} y1={iy} x2={370 + 340 * linkK} y2={iy} stroke={C.blush} strokeWidth={8} strokeDasharray="22 16" strokeLinecap="round" />
        <text x={540} y={iy - 34} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.blush} letterSpacing={4}>
          LINK
        </text>
      </g>
      {proofK > 0 && (
        <g transform={`translate(540 ${iy + 70}) rotate(-10) scale(${1.5 - 0.5 * proofK})`} opacity={proofK * (1 - 0.6 * signK)}>
          <rect x={-180} y={-46} width={360} height={92} rx={18} fill="rgba(23,10,16,0.55)" stroke={C.uvb} strokeWidth={7} />
          <text y={16} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={44} fill={C.uvb} letterSpacing={6}>
            NOT PROOF
          </text>
        </g>
      )}
      <g>
        {[
          {x: 230, t: 'WIDE VESSELS', c: WINE},
          {x: 540, t: 'FLUID LOSS', c: C.water},
          {x: 850, t: 'BROKEN SLEEP', c: C.moon},
        ].map((b, i) => {
          const k = Math.max(0.55 * linkK, clamp(signK * 2.2 - i * 0.5));
          return (
            <g key={i} transform={`translate(${b.x} ${1300 + (1 - k) * 30})`} opacity={k}>
              <rect x={-145} y={-38} width={290} height={76} rx={38} fill="rgba(23,10,16,0.65)" stroke={b.c} strokeWidth={3} />
              <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={b.c} letterSpacing={1}>
                {b.t}
              </text>
            </g>
          );
        })}
      </g>
      <Cite text="Goodman et al., 2019 · survey · association only" k={linkK} />
    </Svg>
  );
};

// =============== G: the fix ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tQuit = cue('quit.');
  const t8 = cue('less', 6);
  const tWater = cue('water', 6);
  const tBed = cue('bed.');
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const calm = ease(prog(s, tQuit - 0.2, tBed + 0.6));
  const item = (x: number, t: number, label: string, children: React.ReactNode) => {
    const k = ease(prog(s, t - 0.35, t + 0.25));
    const base = 0.55 * ease(prog(s, t0 - 0.3, t0 + 0.4));
    return (
      <g transform={`translate(${x} 760) scale(${0.95 * (0.9 + 0.1 * k)})`} opacity={Math.max(base, k)}>
        <circle r={220} fill={C.goldHot} opacity={0.18 * k} filter="url(#blur30)" />
        <circle r={115} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
        {children}
        <text y={165} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={2}>
          {label}
        </text>
      </g>
    );
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={71} o={0.6} color={C.goldHot} />
      <g transform="translate(0 200)">
        <RealPlane s={s} seed={3} fx={{flush: 0.75 * (1 - calm)}} />
      </g>
      <WineGlass x={W / 2} y={1560} sc={0.75} s={s} fill={0.6 - 0.35 * calm} id="gg" />
      {item(
        270,
        t8,
        'DRINK LESS',
        <g>
          <MiniGlass x={-30} y={10} />
          <path d="M40 -40 L 40 40 m -18 -18 l 18 18 l 18 -18" stroke={C.blush} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>,
      )}
      {item(
        540,
        tWater,
        'WATER BETWEEN',
        <g>
          <MiniGlass x={-44} y={20} />
          <g transform="translate(36 0)">
            <path d="M-26 -44 L 26 -44 L 20 44 L -20 44 Z" fill="rgba(168,221,242,0.25)" stroke="rgba(255,255,255,0.8)" strokeWidth={3} />
            <path d={`M-23 ${-10 + 3 * Math.sin(s * 3)} L 23 ${-10 - 3 * Math.sin(s * 3)} L 20 44 L -20 44 Z`} fill={C.water} opacity={0.85} />
          </g>
        </g>,
      )}
      {item(
        810,
        tBed,
        'LAST ONE EARLY',
        <g>
          <g transform="translate(-24 -20)">
            <circle r={52} fill={C.moon} opacity={0.3} filter="url(#blur12)" />
            <circle r={40} fill="#FFF6E2" />
            <circle cx={20} cy={-12} r={34} fill="#2B1620" />
          </g>
          <MiniGlass x={36} y={28} />
        </g>,
      )}
      <Pill x={W / 2} y={1110} k={ease(prog(s, t0 - 0.2, t0 + 0.4)) * (1 - ease(prog(s, t8 - 0.6, t8)))} text="NO NEED TO QUIT" color={C.blush} size={40} />
    </Svg>
  );
};

// =============== H: loop (wine glass over skin) + scan + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tWeek = cue('weekend.');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tWeek - 0.6, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tWeek - 0.4, tWeek + 0.6)) * (1 - cardK);
  const days = ['FRI', 'SAT', 'SUN', 'MON'];
  const dk = ease(prog(s, t0 - 0.2, t0 + 0.8)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1150)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={C.goldHot} o={0.6} />
        <RealPlane s={s} seed={2} fx={{flush: 0.4, scan}} />
        <WineGlass x={W / 2} y={880} sc={0.95} s={s} tilt={-8 + 4 * Math.sin(s * 1.3)} id="gh" />
        <g opacity={dk}>
          {days.map((d, i) => {
            const x = 240 + i * 200;
            const lit = i === 1 || i === 2;
            return (
              <g key={i} transform={`translate(${x} 1500)`}>
                <rect x={-80} y={-40} width={160} height={80} rx={40} fill="rgba(23,10,16,0.6)" stroke={lit ? WINE : 'rgba(238,221,226,0.35)'} strokeWidth={lit ? 4 : 2} />
                <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={26} fill={lit ? C.white : C.blush} letterSpacing={3}>
                  {d}
                </text>
              </g>
            );
          })}
        </g>
        <g opacity={mesh}>
          {nodes.map((a, i) => {
            const b = nodes[(i * 5 + 3) % nodes.length];
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.blush} strokeWidth={1.5} opacity={0.55} />;
          })}
          {nodes.map((a, i) => (
            <circle key={i} cx={a.x} cy={a.y} r={7} fill={C.blush} opacity={a.y < HORIZON + (H - HORIZON) * scan ? 1 : 0} />
          ))}
        </g>
      </Svg>
      {cardK > 0 && <EndCard s={s} tGlowi={tGlowi} cardK={cardK} />}
    </>
  );
};

const EndCard: React.FC<{s: number; tGlowi: number; cardK: number}> = ({s, tGlowi, cardK}) => (
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

export const SCENES: React.FC<{s: number}>[] = [SceneA, SceneB, SceneC, SceneD, SceneE, SceneF, SceneG, SceneH];
export const bounds = (end: number) => [0, S(1), S(2), S(3), S(4), S(5), S(6), S(7), end];
