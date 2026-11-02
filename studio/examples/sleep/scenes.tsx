import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, Fiber, HORIZON} from './parts';
import {cue, cueAny, S} from './timeline';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.night} />
        <stop offset="0.6" stopColor="#24142E" />
        <stop offset="1" stopColor="#4B2E39" />
      </linearGradient>
      <radialGradient id="moonGlow">
        <stop offset="0" stopColor={C.moon} stopOpacity="0.9" />
        <stop offset="0.3" stopColor="#CDBBE8" stopOpacity="0.35" />
        <stop offset="1" stopColor="#24142E" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="faceG" cx="0.45" cy="0.4">
        <stop offset="0" stopColor="#F6D9D3" />
        <stop offset="1" stopColor="#E0A9A5" />
      </radialGradient>
      <radialGradient id="paleG" cx="0.45" cy="0.4">
        <stop offset="0" stopColor="#F1E8E6" />
        <stop offset="1" stopColor="#D8C9C8" />
      </radialGradient>
      <radialGradient id="circleG">
        <stop offset="0" stopColor="#5A3550" stopOpacity="0.8" />
        <stop offset="1" stopColor="#5A3550" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="puffG" cx="0.5" cy="0.3">
        <stop offset="0" stopColor="#F2D0CE" />
        <stop offset="1" stopColor="#D49A9C" />
      </radialGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

const Stars: React.FC<{s: number; o?: number; bottom?: number}> = ({s, o = 1, bottom = 900}) => (
  <g opacity={o}>
    {Array.from({length: 60}).map((_, i) => {
      const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(s * (1 + rand(i) * 2) + i));
      return <circle key={i} cx={rand(i * 3) * W} cy={rand(i * 5) * bottom} r={1.5 + rand(i * 7) * 2.5} fill="#fff" opacity={tw * 0.8} />;
    })}
  </g>
);

const Moon: React.FC<{x: number; y: number; r?: number; o?: number}> = ({x, y, r = 90, o = 1}) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r * 5} fill="url(#moonGlow)" />
    <mask id={`moonMask${Math.round(x)}`}>
      <circle cx={x} cy={y} r={r} fill="#fff" />
      <circle cx={x + r * 0.45} cy={y - r * 0.3} r={r * 0.9} fill="#000" />
    </mask>
    <circle cx={x} cy={y} r={r} fill={C.moon} mask={`url(#moonMask${Math.round(x)})`} />
  </g>
);

// ---------- stylised face ----------
const Face: React.FC<{x: number; y: number; sc?: number; pale?: number; puffy?: number; circles?: number; droop?: number; closed?: number}> = ({
  x,
  y,
  sc = 1,
  pale = 0,
  puffy = 0,
  circles = 0,
  droop = 0,
  closed = 0,
}) => {
  const eye = (ex: number) => {
    const lid = 14 + 10 * droop + 22 * closed;
    return (
      <g>
        {/* dark circle */}
        <ellipse cx={ex} cy={28} rx={46} ry={24} fill="url(#circleG)" opacity={circles} />
        {/* puffy bag */}
        <path d={`M${ex - 40} 22 Q ${ex} ${46 + 16 * puffy} ${ex + 40} 22`} fill="url(#puffG)" opacity={0.25 + 0.75 * puffy} stroke="#B9777E" strokeWidth={2} />
        {/* eye */}
        <path d={`M${ex - 38} 0 Q ${ex} -26 ${ex + 38} 0 Q ${ex} 22 ${ex - 38} 0 Z`} fill="#fff" />
        <circle cx={ex} cy={0} r={13} fill={C.plum} />
        <circle cx={ex + 4} cy={-4} r={4} fill="#fff" />
        {/* upper lid */}
        <path d={`M${ex - 40} 0 Q ${ex} ${-28 + lid} ${ex + 40} 0 L ${ex + 40} -30 L ${ex - 40} -30 Z`} fill={pale > 0.5 ? '#D6C6C5' : '#E8B7B2'} />
        <path d={`M${ex - 40} 0 Q ${ex} ${-28 + lid} ${ex + 40} 0`} stroke={C.plum} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d={`M${ex - 36} -40 Q ${ex} -56 ${ex + 40} -42`} stroke="#6A3A4A" strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <ellipse cx={0} cy={-150} rx={190} ry={150} fill="#4B2E39" />
      <ellipse cx={0} cy={0} rx={160} ry={205} fill="url(#faceG)" />
      <ellipse cx={0} cy={0} rx={160} ry={205} fill="url(#paleG)" opacity={pale} />
      <path d="M-170 -60 Q -150 -230 0 -215 Q 150 -230 170 -60 Q 120 -170 0 -165 Q -120 -170 -170 -60 Z" fill="#4B2E39" />
      <g transform="translate(0 -20)">
        {eye(-62)}
        {eye(62)}
      </g>
      <path d="M0 10 Q -14 60 -6 72 Q 4 78 14 70" stroke="#B9777E" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d={`M-44 ${118 + 6 * droop} Q 0 ${130 - 14 * droop} 44 ${118 + 6 * droop}`} stroke="#A8566A" strokeWidth={7} fill="none" strokeLinecap="round" />
      {/* cheek blush fades when pale */}
      <ellipse cx={-92} cy={70} rx={34} ry={20} fill="#F0A0A6" opacity={0.45 * (1 - pale)} />
      <ellipse cx={92} cy={70} rx={34} ry={20} fill="#F0A0A6" opacity={0.45 * (1 - pale)} />
    </g>
  );
};

// =============== A: hook — 3 AM ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tWorse = cue('worse');
  const tBad = cue('bad');
  const push = 1 + 0.07 * ease(prog(s, 0, S(1)));
  const dull = ease(prog(s, tWorse - 0.2, tWorse + 0.6));
  const clockK = ease(prog(s, tBad - 0.4, tBad + 0.2));
  const blink = Math.floor(s * 2) % 2;
  return (
    <Svg cam={camZoom(push, W / 2, 1200)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#nightSky)" />
      <Stars s={s} />
      <Moon x={760} y={560} />
      <SkinPlane s={s} fx={{dull: 0.15 + 0.6 * dull, crease: 0.6 * dull}} />
      <rect x={-200} y={HORIZON} width={W + 400} height={H} fill={C.night} opacity={0.35} />
      {clockK > 0 && (
        <g transform={`translate(${W / 2} 760)`} opacity={clockK}>
          <rect x={-200} y={-80} width={400} height={150} rx={30} fill="rgba(14,10,28,0.7)" stroke="rgba(238,221,226,0.25)" strokeWidth={2} />
          <text x={-20} y={30} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={92} fill={C.uvb} letterSpacing={4}>
            3{blink ? ':' : ' '}07
          </text>
          <text x={140} y={30} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={34} fill={C.uvb}>
            AM
          </text>
        </g>
      )}
    </Svg>
  );
};

// =============== B: 31 hours awake ===============
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const t31 = cue('31');
  const tPale = cue('paler,');
  const tPuff = cue('puffier,');
  const tDeep = cue('deeper.');
  const inK = ease(prog(s, t0 - 0.2, t0 + 0.5));
  const cardK = ease(prog(s, t31 - 0.5, t31 + 0.2));
  const pale = ease(prog(s, tPale - 0.1, tPale + 0.5));
  const puffy = ease(prog(s, tPuff - 0.1, tPuff + 0.5));
  const circles = ease(prog(s, tDeep - 0.2, tDeep + 0.5));
  const droop = ease(prog(s, t31, t31 + 1.5)) * 0.8;
  const hours = Math.round(31 * easeOut(prog(s, t31 - 0.4, t31 + 0.8)));
  const push = 1 + 0.06 * ease(prog(s, t0, S(2)));
  const card = (x: number, label: string, sub: string, k: number, child: React.ReactNode, hi: boolean) => (
    <g opacity={k} transform={`translate(${x} ${(1 - k) * 60})`}>
      <rect x={-225} y={600} width={450} height={900} rx={48} fill="rgba(238,221,226,0.07)" stroke={hi ? C.cortisol : 'rgba(238,221,226,0.35)'} strokeWidth={hi ? 4 : 2.5} />
      <text x={0} y={690} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={56} fill={hi ? C.cortisol : C.blush}>
        {label}
      </text>
      <text x={0} y={735} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={24} fill={C.blush} opacity={0.7} letterSpacing={3}>
        {sub}
      </text>
      {child}
    </g>
  );
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1050} r={800} fill={C.plum} opacity={0.75} filter="url(#blur30)" />
      <Bokeh s={s} seed={91} o={0.5} />
      <g opacity={inK}>
        {card(285, '8 h', 'SLEEP', 1, <Face x={0} y={1080} sc={0.95} />, false)}
        {card(795, `${hours} h`, 'AWAKE', cardK, <Face x={0} y={1080} sc={0.95} pale={pale} puffy={puffy} circles={circles} droop={droop} />, true)}
      </g>
      <text x={W / 2} y={1640} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.5 * inK}>
        Sundelin et al., Sleep, 2013 · faces rated by 40 strangers
      </text>
    </Svg>
  );
};

// =============== C: repair shift — cells divide around midnight ===============
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tRepair = cue('repair');
  const tDivide = cue('divide');
  const tMid = cue('midnight.');
  const push = 1.06 - 0.06 * ease(prog(s, t0 - 0.3, t0 + 1));
  // dial hand sweeps to midnight (top)
  const handA = -150 + 150 * ease(prog(s, t0, tMid + 0.2));
  const midK = ease(prog(s, tMid - 0.2, tMid + 0.4));
  const divK = prog(s, tDivide - 0.3, tDivide + 1.6);
  const cx = W / 2;
  const cy = 760;
  const R = 230;
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#nightSky)" />
      <Stars s={s} bottom={1100} o={0.7} />
      {/* 24h dial */}
      <circle cx={cx} cy={cy} r={R} fill="rgba(14,10,28,0.55)" stroke="rgba(238,221,226,0.3)" strokeWidth={4} />
      {Array.from({length: 24}).map((_, i) => (
        <rect key={i} x={cx - 2} y={cy - R + 10} width={4} height={i % 6 === 0 ? 30 : 14} fill={C.blush} opacity={0.6} transform={`rotate(${i * 15} ${cx} ${cy})`} />
      ))}
      {/* night arc highlight */}
      <path d={`M ${cx + Math.sin(-1.2) * (R - 40)} ${cy - Math.cos(-1.2) * (R - 40)} A ${R - 40} ${R - 40} 0 0 1 ${cx + Math.sin(1.2) * (R - 40)} ${cy - Math.cos(1.2) * (R - 40)}`} stroke={C.gold} strokeWidth={14} fill="none" opacity={0.25 + 0.6 * midK} strokeLinecap="round" />
      <Moon x={cx} y={cy - R - 70} r={40} o={0.6 + 0.4 * midK} />
      <g transform={`rotate(${handA} ${cx} ${cy})`}>
        <rect x={cx - 5} y={cy - R + 50} width={10} height={R - 50} rx={5} fill={C.goldHot} />
      </g>
      <circle cx={cx} cy={cy} r={14} fill={C.goldHot} />
      <text x={cx} y={cy + 90} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={40} fill={C.white} opacity={midK}>
        12:00 AM
      </text>
      <text x={cx} y={cy + 132} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.gold} letterSpacing={4} opacity={midK}>
        PEAK CELL DIVISION
      </text>
      {/* epidermis cells dividing */}
      <rect x={-50} y={1180} width={W + 100} height={760} fill="url(#epi)" opacity={0.95} />
      <text x={56} y={1230} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.plum} letterSpacing={5} opacity={0.75 * ease(prog(s, tRepair - 0.3, tRepair + 0.3))}>
        REPAIR SHIFT
      </text>
      {Array.from({length: 18}).map((_, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const x = 120 + col * 170 + (row % 2) * 60;
        const y = 1350 + row * 170;
        const d = ease(clamp(divK * 1.5 - rand(i) * 0.5));
        const split = 34 * d;
        const glow = d > 0 && d < 1 ? 1 : 0.4 * d;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={70} fill={C.goldHot} opacity={0.35 * glow} filter="url(#blur12)" />
            <ellipse cx={x - split} cy={y} rx={56 - 16 * d} ry={56 - 10 * d} fill="#F7DCDC" stroke="#D69AA2" strokeWidth={3} />
            <ellipse cx={x + split} cy={y} rx={56 - 16 * d} ry={56 - 10 * d} fill="#F7DCDC" stroke="#D69AA2" strokeWidth={3} opacity={d > 0 ? 1 : 0} />
            <circle cx={x - split} cy={y} r={14} fill="#C88690" />
            {d > 0 && <circle cx={x + split} cy={y} r={14} fill="#C88690" />}
          </g>
        );
      })}
    </Svg>
  );
};

// =============== D: cortisol stays high, collagen slows ===============
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const tCort = cue('cortisol,');
  const tEvening = cue('evening.');
  const tSlows = cue('slows');
  const tColl = cue('production.');
  const push = 1 + 0.05 * ease(prog(s, t0, S(4)));
  const draw = ease(prog(s, t0 - 0.1, tEvening + 0.2));
  const bandK = ease(prog(s, tEvening - 0.3, tEvening + 0.3));
  const fibK = ease(prog(s, tSlows - 0.6, tSlows));
  const slow = prog(s, tSlows, tColl + 1.2);
  const gx0 = 110;
  const gx1 = 970;
  const gy0 = 1060;
  const gh = 380;
  const curve = (f: (u: number) => number) => {
    let d = '';
    const n = 80;
    for (let i = 0; i <= n * draw; i++) {
      const u = i / n;
      d += (i ? 'L' : 'M') + (gx0 + (gx1 - gx0) * u).toFixed(1) + ' ' + (gy0 - gh * f(u)).toFixed(1);
    }
    return d;
  };
  // morning peak, evening low (normal) vs. evening stays elevated (sleep loss)
  const normal = (u: number) => 0.15 + 0.75 * Math.exp(-Math.pow((u - 0.12) / 0.12, 2)) + 0.12 * (1 - u);
  const lost = (u: number) => normal(u) + 0.38 * Math.exp(-Math.pow((u - 0.75) / 0.18, 2));
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={900} r={760} fill={C.plum} opacity={0.75} filter="url(#blur30)" />
      <Bokeh s={s} seed={101} o={0.5} />
      <text x={gx0} y={gy0 - gh - 50} fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush} letterSpacing={5} opacity={0.8}>
        CORTISOL · NEXT DAY
      </text>
      <line x1={gx0} y1={gy0} x2={gx1} y2={gy0} stroke="rgba(238,221,226,0.4)" strokeWidth={3} />
      {['MORNING', 'NOON', 'EVENING'].map((l, i) => (
        <text key={l} x={gx0 + (gx1 - gx0) * [0.1, 0.45, 0.78][i]} y={gy0 + 46} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} opacity={0.6} letterSpacing={3}>
          {l}
        </text>
      ))}
      <rect x={gx0 + (gx1 - gx0) * 0.6} y={gy0 - gh - 10} width={(gx1 - gx0) * 0.35} height={gh + 10} rx={20} fill={C.cortisol} opacity={0.12 * bandK} />
      <path d={curve(normal)} stroke={C.blush} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />
      <path d={curve(lost)} stroke={C.cortisol} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d={curve(lost)} stroke={C.cortisol} strokeWidth={30} fill="none" opacity={0.25} filter="url(#blur12)" />
      <g fontFamily="Poppins" fontWeight={600} fontSize={24} opacity={draw}>
        <circle cx={gx0 + 10} cy={gy0 + 110} r={10} fill={C.blush} />
        <text x={gx0 + 34} y={gy0 + 118} fill={C.blush}>
          good sleep
        </text>
        <circle cx={gx0 + 320} cy={gy0 + 110} r={10} fill={C.cortisol} />
        <text x={gx0 + 344} y={gy0 + 118} fill={C.cortisol}>
          after a bad night
        </text>
      </g>
      {/* collagen being built slowly */}
      <g opacity={fibK}>
        <text x={gx0} y={1370} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={5} opacity={0.8}>
          NEW COLLAGEN
        </text>
        {Array.from({length: 4}).map((_, i) => {
          const target = 0.35 + 0.55 * easeOut(clamp(slow * 2.2 - i * 0.25)) * (1 - 0.65 * slow);
          const len = clamp(0.15 + target);
          return (
            <g key={i}>
              <Fiber x0={gx0} x1={gx0 + (gx1 - gx0) * len} y={1440 + i * 95} amp={14} wl={80} phase={s * 1.5 + i} w={22} />
            </g>
          );
        })}
        <path d={`M ${gx1 - 40} 1420 l 0 300`} stroke={C.cortisol} strokeWidth={4} strokeDasharray="10 12" opacity={0.6 * prog(s, tSlows, tSlows + 0.5)} />
      </g>
    </Svg>
  );
};

// =============== E: under-eye fluid + color loss ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tPools = cue('pools');
  const tColor = cue('color.');
  const push = 1.15 + 0.08 * ease(prog(s, t0, S(5)));
  const pool = ease(prog(s, tPools - 0.2, tPools + 1.2));
  const pale = ease(prog(s, tColor - 0.4, tColor + 0.4));
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={760} fill={C.plum} opacity={0.75} filter="url(#blur30)" />
      <Face x={W / 2} y={1050} sc={2.3} pale={pale} puffy={pool} circles={0.4 + 0.5 * pool} droop={0.4} />
      {/* fluid droplets drifting into the under-eye area */}
      {pool > 0 &&
        [-62, 62].map((ex, j) =>
          Array.from({length: 7}).map((_, i) => {
            const ph = (s * 0.7 + rand(i + j * 10)) % 1;
            const x = W / 2 + ex * 2.3 + (rand(i * 3 + j) - 0.5) * 160 * (1 - ph);
            const y = 1050 + (-20 + 40) * 2.3 + 140 * (1 - ph);
            return <circle key={`${j}-${i}`} cx={x} cy={y} r={9 * (1 - ph * 0.5)} fill={C.water} opacity={pool * (1 - ph) * 0.9} />;
          }),
        )}
    </Svg>
  );
};

// =============== F: the study — 60 women ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const t60 = cue('60');
  const tRep = cue('repaired');
  const t30 = cue('30%');
  const tAging = cue('aging.');
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const rec = ease(prog(s, tRep - 0.2, t30 + 0.4));
  const badge = ease(prog(s, t30 - 0.15, t30 + 0.3));
  const val = Math.round(30 * easeOut(prog(s, t30 - 0.1, t30 + 0.7)));
  const agingK = ease(prog(s, tAging - 0.5, tAging + 0.2));
  const push = 1 + 0.05 * ease(prog(s, t0, S(6)));
  const card = (x: number, title: string, recovery: number, good: boolean, delay: number) => {
    const k = ease(prog(s, t0 - 0.2 + delay, t0 + 0.4 + delay));
    const bricks = Math.round(12 * recovery);
    return (
      <g transform={`translate(${x} ${820 + (1 - k) * 70})`} opacity={k}>
        <rect x={-210} y={-200} width={420} height={700} rx={44} fill="rgba(238,221,226,0.07)" stroke={good ? C.blush : 'rgba(238,221,226,0.3)'} strokeWidth={good ? 4 : 2.5} />
        {good ? <Moon x={0} y={-110} r={34} /> : <text x={0} y={-90} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={56} fill={C.uvb}>3:07</text>}
        <text x={0} y={-10} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white}>
          {title}
        </text>
        {/* barrier rebuilding */}
        {Array.from({length: 12}).map((_, i) => {
          const r = Math.floor(i / 3);
          const c = i % 3;
          const on = i < bricks;
          return <rect key={i} x={-150 + c * 102 + (r % 2) * 20} y={60 + r * 62} width={92} height={50} rx={12} fill={on ? '#F8DCDC' : 'rgba(255,255,255,0.08)'} stroke={on ? '#C98892' : 'rgba(255,255,255,0.2)'} strokeWidth={2} />;
        })}
        <text x={0} y={350} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={3} opacity={0.8}>
          BARRIER RECOVERY
        </text>
      </g>
    );
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={950} r={800} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={111} o={0.5} />
      <g opacity={ease(prog(s, t60 - 0.3, t60 + 0.3))}>
        <rect x={290} y={470} width={500} height={86} rx={43} fill="rgba(238,221,226,0.1)" stroke={C.blush} strokeWidth={2.5} />
        <text x={W / 2} y={527} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={38} fill={C.white}>
          60 women · 30–49 y
        </text>
      </g>
      {card(300, 'Good sleepers', 0.25 + 0.75 * rec, true, 0)}
      {card(780, 'Poor sleepers', 0.25 + 0.5 * rec, false, 0.2)}
      {badge > 0 && (
        <g transform={`translate(300 1430) scale(${0.7 + 0.3 * badge})`} opacity={badge}>
          <rect x={-150} y={-62} width={300} height={110} rx={55} fill={C.blush} />
          <text x={0} y={16} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={64} fill={C.plum}>
            +{val}%
          </text>
        </g>
      )}
      {agingK > 0 && (
        <g transform="translate(780 1430)" opacity={agingK}>
          <rect x={-190} y={-50} width={380} height={86} rx={43} fill="rgba(255,116,104,0.18)" stroke={C.uvb} strokeWidth={2.5} />
          <text x={0} y={8} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.uvb}>
            more signs of aging
          </text>
        </g>
      )}
      <text x={W / 2} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.5 * inK}>
        Oyetakin-White et al., Clin Exp Dermatol, 2015 · 72 h after barrier disruption
      </text>
    </Svg>
  );
};

// =============== G: protect the night shift ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tAim = cue('Aim');
  const tBed = cue('bedtime,');
  const tScreen = cue('screen');
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const ringK = ease(prog(s, tAim - 0.3, tAim + 1.2));
  const bedK = ease(prog(s, tBed - 0.4, tBed + 0.3));
  const scrK = ease(prog(s, tScreen - 0.4, tScreen + 0.3));
  const dim = ease(prog(s, tScreen + 0.2, tScreen + 1.2));
  const item = (x: number, k: number, children: React.ReactNode, label: string) => (
    <g transform={`translate(${x} 800) scale(${0.85 + 0.15 * k})`} opacity={k}>
      <circle r={120} fill="rgba(14,10,28,0.6)" stroke="rgba(238,221,226,0.3)" strokeWidth={3} />
      {children}
      <text y={170} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={3}>
        {label}
      </text>
    </g>
  );
  return (
    <Svg cam={camZoom(push, W / 2, 1200)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#nightSky)" />
      <Stars s={s} o={0.9} />
      <Moon x={W / 2} y={470} r={60} o={0.9} />
      <SkinPlane s={s} fx={{film: ringK, filmSheen: prog(s, tAim, tAim + 3)}} />
      <rect x={-200} y={HORIZON} width={W + 400} height={H} fill={C.night} opacity={0.25 * (1 - ringK)} />
      {item(
        210,
        ringK,
        <g>
          <circle r={96} fill="none" stroke="rgba(238,221,226,0.2)" strokeWidth={14} />
          <circle r={96} fill="none" stroke={C.gold} strokeWidth={14} strokeDasharray={`${603 * 0.36 * ringK} 603`} transform="rotate(-90)" strokeLinecap="round" />
          <text y={18} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={50} fill={C.white}>
            7–9h
          </text>
        </g>,
        'EVERY NIGHT',
      )}
      {item(
        540,
        bedK,
        <g>
          <circle r={70} fill="none" stroke={C.blush} strokeWidth={6} />
          <rect x={-3} y={-56} width={6} height={56} rx={3} fill={C.blush} />
          <rect x={-3} y={-3} width={44} height={6} rx={3} fill={C.blush} transform="rotate(40)" />
        </g>,
        'SAME BEDTIME',
      )}
      {item(
        870,
        scrK,
        <g>
          <rect x={-46} y={-80} width={92} height={160} rx={18} fill={`rgba(168,221,242,${0.9 * (1 - dim)})`} stroke={C.blush} strokeWidth={5} />
          <rect x={-46} y={-80} width={92} height={160} rx={18} fill={C.night} opacity={dim} />
          <path d={`M-70 70 L 70 -70`} stroke={C.uvb} strokeWidth={8} strokeLinecap="round" opacity={dim} />
        </g>,
        '1 H SCREEN-FREE',
      )}
    </Svg>
  );
};

// =============== H: loop to dawn + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tHours = cue('hours.');
  const tGlowi = cue('Glowi');
  const dawn = ease(prog(s, t0 + 0.2, tHours));
  const scan = prog(s, tHours - 0.2, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tHours, tHours + 1)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1300)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#nightSky)" />
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" opacity={dawn} />
        <Stars s={s} o={1 - dawn} />
        <Moon x={760} y={560 - 300 * dawn} o={1 - dawn} />
        <g opacity={dawn}>
          <circle cx={W / 2} cy={HORIZON - 40 - 200 * dawn} r={520} fill="url(#sunGlow)" opacity={0.7} />
          <circle cx={W / 2} cy={HORIZON - 40 - 200 * dawn} r={100} fill={C.goldHot} />
        </g>
        <SkinPlane s={s} fx={{scan, film: dawn, filmSheen: prog(s, t0, t0 + 3)}} />
        <rect x={-200} y={HORIZON} width={W + 400} height={H} fill={C.night} opacity={0.35 * (1 - dawn)} />
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
      {cardK > 0 && (
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
      )}
    </>
  );
};

export {cueAny};
