import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, HORIZON} from './parts';
import {cue, S} from './timeline';

// accent for this topic: milk-carton blue; milk itself is cream white
const MB = '#8EC8EE';
const MILK = '#FBF7EE';
const INFL = '#FF5A64';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <linearGradient id="milkG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#E9E1D4" />
        <stop offset="0.45" stopColor="#FFFDF8" />
        <stop offset="1" stopColor="#E3D9CA" />
      </linearGradient>
      <radialGradient id="bumpG" cx="0.4" cy="0.35">
        <stop offset="0" stopColor="#FFD3CF" />
        <stop offset="0.55" stopColor="#F08A8C" />
        <stop offset="1" stopColor="#C9505F" />
      </radialGradient>
      <radialGradient id="inflG">
        <stop offset="0" stopColor={INFL} stopOpacity="0.8" />
        <stop offset="0.6" stopColor={INFL} stopOpacity="0.25" />
        <stop offset="1" stopColor={INFL} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="mbGlow">
        <stop offset="0" stopColor={MB} stopOpacity="0.55" />
        <stop offset="1" stopColor={MB} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="oilStream" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={C.oil} stopOpacity="1" />
        <stop offset="1" stopColor="#FFF1C2" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

const Bump: React.FC<{x: number; y: number; r: number; k: number; heat?: number}> = ({x, y, r, k, heat = 1}) =>
  k > 0.01 ? (
    <g>
      <ellipse cx={x} cy={y} rx={r * 2.4 * k} ry={r * 1.1 * k} fill="url(#inflG)" opacity={0.85 * heat} />
      <ellipse cx={x} cy={y - r * 0.25 * k} rx={r * k} ry={r * 0.62 * k} fill="url(#bumpG)" />
      <ellipse cx={x - r * 0.25 * k} cy={y - r * 0.45 * k} rx={r * 0.32 * k} ry={r * 0.16 * k} fill="#fff" opacity={0.65} />
    </g>
  ) : null;
const bumps = [
  {x: 250, y: 1500, r: 40},
  {x: 830, y: 1280, r: 32},
  {x: 760, y: 1640, r: 52},
  {x: 330, y: 1250, r: 28},
];

// a glass of milk
const MilkGlass: React.FC<{x: number; y: number; sc?: number; fill?: number; s: number; o?: number}> = ({x, y, sc = 1, fill = 0.85, s, o = 1}) => {
  const w = 230;
  const h = 360;
  const top = -h + h * (1 - fill);
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={o}>
      <ellipse cx={0} cy={8} rx={150} ry={26} fill="#000" opacity={0.25} filter="url(#blur12)" />
      <clipPath id={`gl${Math.round(x)}${Math.round(y)}`}>
        <path d={`M${-w / 2} ${-h} L ${w / 2} ${-h} L ${w * 0.4} 0 L ${-w * 0.4} 0 Z`} />
      </clipPath>
      <g clipPath={`url(#gl${Math.round(x)}${Math.round(y)})`}>
        <rect x={-w} y={top} width={w * 2} height={h} fill="url(#milkG)" />
        <path d={`M${-w} ${top} q ${w / 4} ${-10 + Math.sin(s * 2) * 6} ${w / 2} 0 t ${w / 2} 0 t ${w / 2} 0 t ${w / 2} 0`} fill="#FFFFFF" />
      </g>
      <path d={`M${-w / 2} ${-h} L ${-w * 0.4} 0 L ${w * 0.4} 0 L ${w / 2} ${-h}`} stroke="rgba(255,255,255,0.85)" strokeWidth={5} fill="rgba(255,255,255,0.05)" />
      <ellipse cx={0} cy={-h} rx={w / 2} ry={14} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={4} />
      <path d={`M${-w * 0.36} ${-h + 30} L ${-w * 0.3} -24`} stroke="#fff" strokeWidth={10} opacity={0.35} strokeLinecap="round" />
    </g>
  );
};

// milk carton icon
const Carton: React.FC<{x: number; y: number; sc?: number; label: string; col: string}> = ({x, y, sc = 1, label, col}) => (
  <g transform={`translate(${x} ${y}) scale(${sc})`}>
    <path d="M-70 -120 L 70 -120 L 70 140 L -70 140 Z" fill={MILK} />
    <path d="M-70 -120 L 0 -190 L 70 -120 Z" fill="#E8E0D2" />
    <rect x={-14} y={-214} width={28} height={30} rx={4} fill={col} />
    <rect x={-70} y={-40} width={140} height={110} fill={col} />
    <text y={28} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.plum}>
      {label}
    </text>
  </g>
);
const Yogurt: React.FC<{x: number; y: number; sc?: number}> = ({x, y, sc = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${sc})`}>
    <path d="M-80 -60 L 80 -60 L 60 120 L -60 120 Z" fill={MILK} />
    <rect x={-92} y={-84} width={184} height={30} rx={10} fill={MB} />
    <rect x={-72} y={0} width={144} height={60} fill={MB} opacity={0.6} />
    <text y={42} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.plum}>
      YOGURT
    </text>
  </g>
);

const Pill: React.FC<{x: number; y: number; k: number; text: string; color: string; dark?: boolean; size?: number}> = ({x, y, k, text, color, dark, size = 34}) =>
  k > 0 ? (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * k})`} opacity={k}>
      <rect x={-(text.length * size * 0.33 + 44)} y={-size * 1.3} width={2 * (text.length * size * 0.33 + 44)} height={size * 2.4} rx={size * 1.2} fill={dark ? 'rgba(23,10,16,0.72)' : color} stroke={color} strokeWidth={3} />
      <text y={size * 0.35} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={size} fill={dark ? color : C.plum} letterSpacing={2}>
        {text}
      </text>
    </g>
  ) : null;

// =============== A: hook — a glass of milk, a breakout ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tBreak = cue('breakouts?');
  const push = 1 + 0.07 * ease(prog(s, 0, S(1)));
  const q = ease(prog(s, tBreak - 0.4, tBreak + 0.2));
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={MB} o={0.55} />
      <SkinPlane s={s} fx={{flush: 0.3 * q}} />
      {bumps.map((b, i) => (
        <Bump key={i} x={b.x} y={b.y} r={b.r} k={easeOut(prog(s, -0.2 + i * 0.4, 0.3 + i * 0.4))} />
      ))}
      <circle cx={W / 2} cy={900} r={330} fill="url(#mbGlow)" />
      <MilkGlass x={W / 2} y={1200} sc={1.25} s={s} />
      {/* splash drops */}
      {Array.from({length: 8}).map((_, i) => {
        const ph = (s * 0.7 + i / 8) % 1;
        return <circle key={i} cx={W / 2 + Math.cos(i * 0.8 - 2.4) * (60 + 160 * ph)} cy={720 - Math.sin(ph * Math.PI) * 120 + 140 * ph} r={10 * (1 - ph)} fill={MILK} opacity={0.9 * (1 - ph)} />;
      })}
      <g transform={`translate(${W / 2 + 230} 640) scale(${0.6 + 0.4 * q})`} opacity={q}>
        <circle r={62} fill="rgba(23,10,16,0.7)" stroke={MB} strokeWidth={4} />
        <text y={24} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={70} fill={MB}>
          ?
        </text>
      </g>
    </Svg>
  );
};

// =============== B1: honest answer — a meter that settles on "a little" ===============
export const SceneB1: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tMaybe = cue('maybe,');
  const tLittle = cue('little.');
  const push = 1.05 - 0.05 * ease(prog(s, t0 - 0.2, t0 + 1.2));
  // needle swings, then settles at ~0.3
  const swing = prog(s, t0, tLittle + 0.5);
  const v = 0.5 + 0.45 * Math.sin(swing * Math.PI * 3) * (1 - swing) * (1 - swing) - 0.2 * ease(prog(s, tMaybe - 0.2, tLittle + 0.4));
  const lit = ease(prog(s, tLittle - 0.3, tLittle + 0.3));
  const x0 = 160;
  const x1 = 920;
  const nx = x0 + (x1 - x0) * clamp(v);
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={800} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={21} color={MB} o={0.45} />
      <MilkGlass x={W / 2} y={880} sc={0.85} s={s} />
      <g transform="translate(0 1180)">
        <rect x={x0} y={-14} width={x1 - x0} height={28} rx={14} fill="rgba(238,221,226,0.18)" />
        <rect x={x0} y={-14} width={(x1 - x0) * 0.5} height={28} rx={14} fill={MB} opacity={0.35 + 0.4 * lit} />
        {[
          [x0, 'NO LINK'],
          [x0 + (x1 - x0) * 0.3, 'A LITTLE'],
          [x1, 'BIG CAUSE'],
        ].map(([x, l], i) => (
          <g key={i}>
            <line x1={x as number} y1={-36} x2={x as number} y2={36} stroke={C.blush} strokeWidth={4} opacity={0.6} />
            <text x={x as number} y={92} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={i === 1 ? 34 : 28} fill={i === 1 && lit > 0.5 ? MB : C.blush} letterSpacing={2} opacity={i === 1 ? 0.6 + 0.4 * lit : 0.7}>
              {l}
            </text>
          </g>
        ))}
        <g transform={`translate(${nx} 0)`}>
          <path d="M0 -80 L 26 -40 L -26 -40 Z" fill={C.white} />
          <circle r={30} fill={C.white} />
          <circle r={12} fill={C.plum} />
        </g>
      </g>
    </Svg>
  );
};

// =============== B2: the meta-analysis ===============
export const SceneB2: React.FC<{s: number}> = ({s}) => {
  const t0 = cue('review');
  const t14 = cue('14');
  const tN = cue('78,529');
  const t25 = cue('25%');
  const push = 1 + 0.05 * ease(prog(s, t0, S(2)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const papers = prog(s, t0 - 0.2, t14 + 0.6);
  const count = Math.round(78529 * easeOut(prog(s, tN - 0.9, tN)));
  const axisK = ease(prog(s, tN - 0.4, tN + 0.3));
  const barK = ease(prog(s, cue('dairy', 1) - 0.4, t25 + 0.3));
  const badge = ease(prog(s, t25 - 0.15, t25 + 0.3));
  const MAXH = 360;
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} color={MB} o={0.45} />
      {/* 14 study sheets fanned out */}
      {Array.from({length: 14}).map((_, i) => {
        const k = ease(clamp(papers * 15 - i));
        const x = 150 + (i % 7) * 130;
        const y = 560 + Math.floor(i / 7) * 150;
        return (
          <g key={i} transform={`translate(${x} ${y + (1 - k) * 40}) rotate(${(rand(i) - 0.5) * 10})`} opacity={k * (1 - 0.5 * barK)}>
            <rect x={-48} y={-62} width={96} height={124} rx={8} fill="#F6EDEF" />
            {Array.from({length: 5}).map((__, j) => (
              <rect key={j} x={-34} y={-44 + j * 20} width={j % 2 ? 50 : 68} height={8} rx={4} fill="#C9AEB6" />
            ))}
          </g>
        );
      })}
      <g opacity={inK}>
        <text x={W / 2} y={940} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={60} fill={C.white} opacity={ease(prog(s, tN - 0.9, tN - 0.4))}>
          {count.toLocaleString('en-US')} people
        </text>
        <text x={W / 2} y={985} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={5} opacity={ease(prog(s, tN - 0.9, tN - 0.4))}>
          14 STUDIES · AGES 7–30
        </text>
      </g>
      {/* odds bars */}
      <g opacity={axisK}>
        {[
          {x: 360, label: 'No dairy', v: 1.0, col: 'rgba(238,221,226,0.55)'},
          {x: 720, label: 'Dairy', v: 1.25, col: MB},
        ].map((b, i) => {
          const h = MAXH * (b.v / 1.3) * barK;
          return (
            <g key={i}>
              <rect x={b.x - 90} y={1540 - h} width={180} height={h} rx={24} fill={b.col} />
              <text x={b.x} y={1590} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={C.white}>
                {b.label}
              </text>
            </g>
          );
        })}
        <line x1={160} y1={1540} x2={920} y2={1540} stroke="rgba(238,221,226,0.45)" strokeWidth={3} />
        <text x={W / 2} y={1640} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={4}>
          ODDS OF ACNE
        </text>
      </g>
      <g transform={`translate(720 ${1540 - MAXH * (1.25 / 1.3) - 66}) scale(${0.7 + 0.3 * badge})`} opacity={badge}>
        <rect x={-130} y={-48} width={260} height={92} rx={46} fill={MB} />
        <text y={16} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={48} fill={C.plum}>
          +25%
        </text>
      </g>
      <text x={W / 2} y={1720} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.55 * inK}>
        Juhl et al., Nutrients, 2018 · 14 observational studies · pooled odds ratio 1.25
      </text>
    </Svg>
  );
};

// =============== C: not only whole milk ===============
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tWhole = cue('whole');
  const tSkim = cue('Skim');
  const tYog = cue('yogurt');
  const push = 1.04 + 0.05 * ease(prog(s, t0, S(3)));
  const items = [
    {x: 220, t: tWhole, or: 1.22, el: (k: number) => <Carton x={0} y={0} sc={0.95} label="WHOLE" col={MB} />},
    {x: 540, t: tSkim, or: 1.32, el: (k: number) => <Carton x={0} y={0} sc={0.95} label="SKIM" col="#C9E4F6" />},
    {x: 860, t: tYog, or: 1.36, el: (k: number) => <Yogurt x={0} y={40} sc={1.1} />},
  ];
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1050} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={61} color={MB} o={0.45} />
      <rect x={60} y={1080} width={W - 120} height={14} rx={7} fill="rgba(238,221,226,0.25)" />
      {items.map((it, i) => {
        const k = ease(prog(s, it.t - 0.4, it.t + 0.3));
        const pre = ease(prog(s, t0 - 0.4, t0 + 0.3 + i * 0.15));
        const bk = ease(prog(s, it.t, it.t + 0.8));
        return (
          <g key={i} transform={`translate(${it.x} ${880 + (1 - pre) * 60}) scale(${0.92 + 0.08 * k})`} opacity={pre * (0.45 + 0.55 * k)}>
            <circle cx={0} cy={-20} r={170} fill="url(#mbGlow)" opacity={0.6} />
            {it.el(k)}
            <g transform="translate(0 300)">
              <rect x={-110} y={0} width={220} height={22} rx={11} fill="rgba(238,221,226,0.15)" />
              <rect x={-110} y={0} width={220 * ((it.or - 1) / 0.45) * bk} height={22} rx={11} fill={MB} />
              <text y={80} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={40} fill={C.white}>
                {(1 + (it.or - 1) * bk).toFixed(2)}
              </text>
            </g>
          </g>
        );
      })}
      <text x={W / 2} y={1520} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={4} opacity={ease(prog(s, tWhole, tWhole + 0.5))}>
        ODDS RATIO FOR ACNE (1.00 = NO LINK)
      </text>
      <text x={W / 2} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.55}>
        Juhl et al., Nutrients, 2018 · pooled, unadjusted · observational studies
      </text>
    </Svg>
  );
};

// =============== D: hormones — insulin and IGF-1 reach the oil gland ===============
const Gland: React.FC<{x: number; y: number; sc?: number; pulse?: number}> = ({x, y, sc = 1, pulse = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${sc * (1 + 0.05 * pulse)})`}>
    <circle r={160} fill={C.oil} opacity={0.22 + 0.2 * pulse} filter="url(#blur30)" />
    {[
      [0, 0, 62],
      [-70, -30, 48],
      [66, -36, 50],
      [-46, 54, 46],
      [52, 50, 48],
      [0, -78, 40],
      [-100, 30, 34],
      [98, 20, 34],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill="url(#globule)" />
    ))}
  </g>
);
const SURF = 700;
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const tIns = cue('insulin');
  const tIgf = cue('IGF-1,');
  const tPush = cue('push');
  const push = 1.07 - 0.07 * ease(prog(s, t0 - 0.3, t0 + 1.2));
  const insK = ease(prog(s, tIns - 0.4, tIns + 0.4));
  const igfK = ease(prog(s, tIgf - 0.4, tIgf + 0.4));
  const work = ease(prog(s, tPush - 0.3, S(4) - 0.5));
  const gx = 640;
  const gy = 1250;
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={SURF + 200} fill="url(#sky)" />
      <rect x={-50} y={SURF} width={W + 100} height={200} fill="url(#epi)" />
      <rect x={-50} y={SURF + 200} width={W + 100} height={H} fill="url(#derm)" />
      <text x={70} y={SURF + 56} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.plum} letterSpacing={5} opacity={0.8}>
        SKIN
      </text>
      <MilkGlass x={170} y={690} sc={0.48} s={s} />
      <rect x={W / 2 - 290} y={1582} width={580} height={40} rx={20} fill="rgba(23,10,16,0.55)" />
      <text x={W / 2} y={1609} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.85}>
        illustrative · proposed mechanism (Juhl et al., 2018)
      </text>
      {/* follicle + oil */}
      <path d={`M${gx - 34} ${SURF} L ${gx - 22} ${gy + 120} L ${gx + 22} ${gy + 120} L ${gx + 34} ${SURF} Z`} fill="#7A3346" />
      <rect x={gx - 18} y={SURF + (gy - SURF) * (1 - (0.35 + 0.6 * work))} width={36} height={(gy - SURF) * (0.35 + 0.6 * work)} fill="url(#oilStream)" opacity={0.95} />
      {work > 0.6 && <ellipse cx={gx} cy={SURF - 6} rx={80 * work} ry={16} fill={C.oil} opacity={0.6 * work} />}
      <Gland x={gx + 150} y={gy} sc={0.85 + 0.15 * work} pulse={work * (0.5 + 0.5 * Math.sin(s * 5))} />
      <text x={gx + 150} y={gy + 210} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.white} letterSpacing={5} opacity={0.8}>
        OIL GLAND
      </text>
      {/* blood vessel */}
      <path d={`M-50 1720 C 300 1660, 700 1780, ${W + 50} 1700`} stroke="#E0384E" strokeWidth={40} fill="none" opacity={0.9} />
      {/* messengers */}
      {[
        {k: insK, col: MB, label: 'INSULIN', seed: 1, lx: 70},
        {k: igfK, col: C.goldHot, label: 'IGF-1', seed: 7, lx: 330},
      ].map((m, j) => (
        <g key={j}>
          {m.k > 0 &&
            Array.from({length: 9}).map((_, i) => {
              const ph = (s * 0.5 + rand(i * 3 + m.seed)) % 1;
              const x0 = 60 + rand(i * 5 + m.seed) * 500;
              const x = x0 + (gx + 150 - x0) * ph;
              const y = 1700 + (gy + 40 - 1700) * ph;
              return (
                <g key={i} opacity={m.k * (1 - 0.4 * ph)}>
                  <circle cx={x} cy={y} r={26} fill={m.col} opacity={0.25} filter="url(#blur4)" />
                  {j === 0 ? <circle cx={x} cy={y} r={13} fill={m.col} /> : <rect x={x - 12} y={y - 12} width={24} height={24} rx={5} fill={m.col} transform={`rotate(45 ${x} ${y})`} />}
                </g>
              );
            })}
          <text x={m.lx} y={1810} fontFamily="Poppins" fontWeight={700} fontSize={26} fill={m.col} letterSpacing={4} opacity={m.k}>
            {m.label}
          </text>
        </g>
      ))}
    </Svg>
  );
};

// =============== E: a dimmer switch, turned up a notch ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tDim = cue('dimmer');
  const tNotch = cue('notch,');
  const tFull = cue('full');
  const push = 1.05 - 0.05 * ease(prog(s, t0 - 0.2, t0 + 1.2));
  const inK = ease(prog(s, t0 - 0.5, t0 + 0.3));
  const turn = 0.25 + 0.15 * ease(prog(s, tNotch - 0.4, tNotch + 0.3));
  const ghost = ease(prog(s, tFull - 0.3, tFull + 0.3));
  const a = (v: number) => -225 + 270 * v; // degrees
  const cx = W / 2;
  const cy = 1060;
  const R = 230;
  return (
    <Svg cam={camZoom(push, cx, cy)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={cx} cy={cy} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={71} color={C.goldHot} o={0.45} />
      {/* gland glow above */}
      <g transform="translate(540 600)" opacity={inK}>
        <Gland x={0} y={0} sc={0.55} pulse={turn} />
      </g>
      <g opacity={inK}>
        <rect x={cx - 330} y={cy - 330} width={660} height={660} rx={60} fill="rgba(246,233,236,0.1)" stroke="rgba(246,233,236,0.35)" strokeWidth={3} />
        {Array.from({length: 11}).map((_, i) => {
          const v = i / 10;
          const ang = (a(v) * Math.PI) / 180;
          const on = v <= turn + 0.001;
          return <line key={i} x1={cx + Math.cos(ang) * (R + 30)} y1={cy + Math.sin(ang) * (R + 30)} x2={cx + Math.cos(ang) * (R + 60)} y2={cy + Math.sin(ang) * (R + 60)} stroke={on ? C.gold : 'rgba(238,221,226,0.4)'} strokeWidth={on ? 10 : 6} strokeLinecap="round" />;
        })}
        <circle cx={cx} cy={cy} r={R} fill="#3A2230" stroke="rgba(255,255,255,0.4)" strokeWidth={6} />
        <circle cx={cx} cy={cy} r={R - 30} fill="#4B2E39" />
        <g transform={`rotate(${a(turn) + 90} ${cx} ${cy})`}>
          <rect x={cx - 14} y={cy - R + 24} width={28} height={100} rx={14} fill={C.gold} />
        </g>
        {/* ghost "full" position, crossed out */}
        <g opacity={ghost} transform={`rotate(${a(1) + 90} ${cx} ${cy})`}>
          <rect x={cx - 14} y={cy - R + 24} width={28} height={100} rx={14} fill="none" stroke={INFL} strokeWidth={4} strokeDasharray="8 6" />
        </g>
        <text x={cx - 300} y={cy + 330} fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush} letterSpacing={3}>
          LOW
        </text>
        <text x={cx + 300} y={cy + 330} textAnchor="end" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush} letterSpacing={3}>
          FULL
        </text>
      </g>
      <Pill x={cx} y={1520} k={ease(prog(s, tNotch - 0.2, tNotch + 0.3))} text="a notch, not full" color={C.gold} size={32} />
      <text x={cx} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.5 * inK}>
        illustrative · proposed mechanism (Juhl et al., 2018)
      </text>
    </Svg>
  );
};

// =============== F: only watched people — not proof ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tWatch = cue('watched');
  const tProved = cue('proved');
  const tSens = cue('sensitive.');
  const push = 1.04 + 0.05 * ease(prog(s, t0, S(6)));
  const inK = ease(prog(s, t0 - 0.5, t0 + 0.2));
  const eyeK = ease(prog(s, tWatch - 0.4, tWatch + 0.3));
  const stamp = ease(prog(s, tProved - 0.1, tProved + 0.25));
  const sens = ease(prog(s, tSens - 0.5, tSens + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1050} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={81} color={MB} o={0.45} />
      {/* observing eye */}
      <g transform={`translate(${W / 2} 620) scale(${0.8 + 0.2 * eyeK})`} opacity={inK}>
        <path d="M-150 0 Q 0 -110 150 0 Q 0 110 -150 0 Z" fill="rgba(246,233,236,0.12)" stroke={C.blush} strokeWidth={6} />
        <circle r={46} fill={MB} />
        <circle r={20} fill={C.plumInk} />
        <circle cx={-12} cy={-14} r={8} fill="#fff" />
      </g>
      {/* crowd */}
      {Array.from({length: 40}).map((_, i) => {
        const x = 150 + (i % 8) * 112;
        const y = 860 + Math.floor(i / 8) * 150;
        const k = clamp(inK * 1.5 - rand(i) * 0.5);
        const hi = [3, 12, 21, 30, 37].includes(i) ? sens : 0;
        const col = hi > 0.5 ? INFL : C.blush;
        return (
          <g key={i} opacity={k * (0.55 + 0.45 * hi)}>
            {hi > 0 && <circle cx={x} cy={y + 10} r={60 * hi} fill="url(#inflG)" />}
            <circle cx={x} cy={y - 22} r={20} fill={col} />
            <path d={`M${x - 32} ${y + 50} q 32 -62 64 0 Z`} fill={col} />
          </g>
        );
      })}
      {stamp > 0 && (
        <g transform={`translate(${W / 2} 1180) rotate(-10) scale(${1.6 - 0.6 * stamp})`} opacity={stamp * (1 - 0.5 * sens)}>
          <rect x={-290} y={-84} width={580} height={168} rx={24} fill="rgba(23,10,16,0.6)" stroke={INFL} strokeWidth={10} />
          <text y={-14} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={INFL} letterSpacing={6}>
            CAUSE
          </text>
          <text y={54} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={60} fill={INFL} letterSpacing={6}>
            NOT PROVEN
          </text>
        </g>
      )}
      <text x={W / 2} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.55 * inK}>
        Juhl et al., 2018 · all 14 studies observational · no randomized trials
      </text>
    </Svg>
  );
};

// =============== G: a few-week test ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tLess = cue('less');
  const tWeeks = cue('weeks,');
  const tSame = cue('same,');
  const tTrack = cue('track');
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.5));
  const weeks = [0, 1, 2, 3];
  const wk = prog(s, tLess - 0.3, tTrack + 0.8);
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON + 300} seed={91} color={MB} o={0.5} />
      <g transform="translate(0 520)">
        <SkinPlane s={s} fx={{film: ease(prog(s, tTrack - 0.3, tTrack + 1)), filmSheen: prog(s, tTrack, tTrack + 2)}} />
      </g>
      {/* calendar strip */}
      {weeks.map((w, i) => {
        const k = ease(clamp(wk * 4.4 - i));
        const x = 165 + i * 250;
        return (
          <g key={i} transform={`translate(${x} 1000) scale(${1.0 + 0.1 * k})`} opacity={inK * (0.6 + 0.4 * k)}>
            <rect x={-105} y={-150} width={210} height={300} rx={28} fill="rgba(23,10,16,0.62)" stroke={k > 0.5 ? MB : 'rgba(238,221,226,0.35)'} strokeWidth={3} />
            <text y={-100} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.white} letterSpacing={2}>
              WEEK {i + 1}
            </text>
            <MilkGlass x={0} y={40} sc={0.32} fill={0.85 - 0.45 * ease(prog(s, tLess - 0.4, tLess + 0.3))} s={s} />
            <g transform="translate(0 100)" opacity={ease(prog(s, tTrack - 0.4 + i * 0.15, tTrack + i * 0.15))}>
              <circle r={26} fill={MB} />
              <path d="M-11 0 l 8 9 l 15 -18" stroke={C.plum} strokeWidth={6} fill="none" strokeLinecap="round" />
            </g>
          </g>
        );
      })}
      <g opacity={ease(prog(s, tSame - 0.4, tSame + 0.2))}>
        <Pill x={W / 2} y={1250} k={1} text="same routine" color={C.blush} dark size={30} />
      </g>
      {(() => {
        const tCut = cue('cut');
        const tMilk = cue('milk,', 6);
        const rowK = ease(prog(s, t0 - 0.3, tCut + 0.2));
        const pick = ease(prog(s, tMilk - 0.3, tMilk + 0.3));
        const foods = ['milk', 'bread', 'choc', 'cheese', 'fruit'];
        return foods.map((f, i) => {
          const x = 140 + i * 200;
          const isMilk = i === 0;
          const k = ease(clamp(rowK * 1.6 - i * 0.12));
          const dim = isMilk ? 1 : 1 - 0.6 * pick;
          return (
            <g key={f} transform={`translate(${x} 640) scale(${(0.85 + 0.15 * k) * (isMilk ? 1 + 0.15 * pick : 1)})`} opacity={k * dim}>
              <circle r={78} fill="rgba(23,10,16,0.65)" stroke={isMilk && pick > 0.5 ? MB : 'rgba(238,221,226,0.35)'} strokeWidth={isMilk && pick > 0.5 ? 5 : 3} />
              {f === 'milk' && <MilkGlass x={0} y={46} sc={0.26} s={s} />}
              {f === 'bread' && <path d="M-40 30 L -40 -10 a 40 30 0 0 1 80 0 L 40 30 Z" fill="#E9B97A" stroke="#B9824A" strokeWidth={4} />}
              {f === 'choc' && (
                <g>
                  <rect x={-34} y={-40} width={68} height={80} rx={8} fill="#6B3A2A" />
                  <path d="M-34 -13 L 34 -13 M-34 13 L 34 13 M0 -40 L 0 40" stroke="#4A2419" strokeWidth={4} />
                </g>
              )}
              {f === 'cheese' && <path d="M-44 28 L 44 28 L 44 -6 L -44 -30 Z" fill="#F2C879" stroke="#C99A3E" strokeWidth={4} />}
              {f === 'fruit' && (
                <g>
                  <circle r={34} fill="#E0565E" />
                  <path d="M0 -34 q 10 -16 24 -14" stroke="#7BC47F" strokeWidth={6} fill="none" strokeLinecap="round" />
                </g>
              )}
              {!isMilk && pick > 0 && <path d="M-50 50 L 50 -50" stroke="rgba(238,221,226,0.0)" />}
            </g>
          );
        });
      })()}
      <g opacity={ease(prog(s, tWeeks - 0.4, tWeeks + 0.2))}>
        <text x={W / 2} y={772} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush} letterSpacing={5}>
          LESS MILK · A FEW WEEKS
        </text>
      </g>
    </Svg>
  );
};

// =============== H: loop + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tDiary = cue('diary.');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tDiary - 0.3, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const calm = ease(prog(s, t0, tGlowi));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tDiary, tDiary + 1)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1300)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={MB} o={0.55} />
        <SkinPlane s={s} fx={{scan}} />
        {bumps.map((b, i) => (
          <Bump key={i} x={b.x} y={b.y} r={b.r} k={1 - 0.6 * calm} heat={1 - calm} />
        ))}
        <g opacity={1 - cardK}>
          <circle cx={W / 2} cy={900} r={330} fill="url(#mbGlow)" />
          <MilkGlass x={W / 2} y={1200} sc={1.25} s={s} />
        </g>
        <g opacity={(1 - cardK) * ease(prog(s, cue('food', 7) - 0.4, cue('food', 7) + 0.2))}>
          {Array.from({length: 7}).map((_, i) => {
            const k = ease(prog(s, cue('food', 7) + i * 0.12, cue('food', 7) + 0.3 + i * 0.12));
            const x = 210 + i * 110;
            return (
              <g key={i} transform={`translate(${x} 560)`}>
                <rect x={-42} y={-42} width={84} height={84} rx={16} fill="rgba(23,10,16,0.65)" stroke="rgba(238,221,226,0.4)" strokeWidth={3} />
                <path d="M-16 0 l 10 12 l 22 -26" stroke={MB} strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
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
            <circle key={i} cx={a.x} cy={a.y} r={7} fill={MB} opacity={a.y < HORIZON + (H - HORIZON) * scan ? 1 : 0} />
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
      background: `radial-gradient(circle at 50% 44%, rgba(75,46,57,${0.95 * cardK}) 0%, rgba(36,19,27,${cardK}) 70%)`,
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

// ---- wiring read by Main.tsx ----
export const SCENES: React.FC<{s: number}>[] = [SceneA, SceneB1, SceneB2, SceneC, SceneD, SceneE, SceneF, SceneG, SceneH];
export const bounds = (end: number) => [0, S(1), cue('review'), S(2), S(3), S(4), S(5), S(6), S(7) + 0.3, end];
