import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, Beam, wavePath, coilPath, HORIZON} from './parts';
import {cue, S} from './timeline';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#EDE6EA" />
      </linearGradient>
      <radialGradient id="caramelGlow">
        <stop offset="0" stopColor={C.age} stopOpacity="0.7" />
        <stop offset="1" stopColor={C.age} stopOpacity="0" />
      </radialGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp(t))).join(',')})`;
};

// sugar cube / crystal
const Cube: React.FC<{x: number; y: number; r: number; rot?: number; o?: number}> = ({x, y, r, rot = 0, o = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
    <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={r * 0.22} fill="url(#cubeTop)" stroke="#D9CBD3" strokeWidth={Math.max(1, r * 0.06)} />
    {r > 14 &&
      Array.from({length: 6}).map((_, i) => (
        <circle key={i} cx={(rand(i * 3 + r) - 0.5) * r * 1.4} cy={(rand(i * 5 + r) - 0.5) * r * 1.4} r={r * 0.08} fill="#fff" opacity={0.9} />
      ))}
  </g>
);

// collagen fiber that can caramelize and stiffen
const CFiber: React.FC<{x0: number; x1: number; y: number; amp: number; wl: number; phase: number; w: number; car?: number; o?: number}> = ({
  x0,
  x1,
  y,
  amp,
  wl,
  phase,
  w,
  car = 0,
  o = 1,
}) => {
  const d = coilPath(x0, x1, y, amp, wl, phase);
  const body = mix('#F2D7BE', '#C47A35', car);
  const hi = mix('#FFF8EE', '#F7C98A', car);
  return (
    <g opacity={o}>
      {car > 0.2 && <path d={d} stroke={C.age} strokeWidth={w + 30} fill="none" opacity={0.18 * car} filter="url(#blur12)" />}
      <path d={d} stroke="#5E2232" strokeWidth={w + 6} fill="none" strokeLinecap="round" opacity={0.35} />
      <path d={d} stroke={body} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={coilPath(x0, x1, y - w * 0.22, amp, wl, phase)} stroke={hi} strokeWidth={w * 0.28} fill="none" strokeLinecap="round" opacity={0.85} />
    </g>
  );
};

const fibers = Array.from({length: 6}).map((_, i) => ({
  y: 760 + i * 150 + rand(i * 3) * 20,
  amp: 26 + rand(i) * 8,
  wl: 140,
  ph: (i % 2) * Math.PI,
}));
// y of fiber i at x (for placing bonds)
const fy = (i: number, x: number, phase: number, ampK: number) => fibers[i].y + Math.sin(((x + 60) / fibers[i].wl) * Math.PI * 2 + fibers[i].ph + phase) * fibers[i].amp * ampK;

// =============== A: hook — sugar raining on skin ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tAge = cue('age');
  const push = 1 + 0.08 * ease(prog(s, 0, S(1)));
  const dull = ease(prog(s, tAge - 0.2, tAge + 0.6));
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={5} color={C.goldHot} o={0.6} />
      <SkinPlane s={s} fx={{crease: dull, dull: 0.3 * dull}} />
      {Array.from({length: 16}).map((_, i) => {
        const t0 = rand(i * 3) * 1.6;
        const p = clamp((s - t0) / 1.4);
        const x = 120 + rand(i * 7) * 840;
        const yEnd = 1200 + rand(i * 11) * 600;
        const y = 300 + (yEnd - 300) * easeOut(p);
        const r = 18 + rand(i * 13) * 26 * (yEnd > 1500 ? 1.4 : 1);
        return p > 0 ? <Cube key={i} x={x} y={y} r={r} rot={rand(i) * 90 + s * 30 * (1 - p)} o={0.95} /> : null;
      })}
    </Svg>
  );
};

// =============== B: slowly — glycation ===============
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tGly = cue('glycation.');
  const push = 1.05 - 0.05 * ease(prog(s, t0 - 0.2, t0 + 1));
  const flow = prog(s, t0, S(2));
  const tagK = ease(prog(s, tGly - 0.3, tGly + 0.3));
  const cx = W / 2;
  const cy = 1050;
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={cx} cy={cy} r={760} fill={C.plum} opacity={0.75} filter="url(#blur30)" />
      <Bokeh s={s} seed={21} o={0.5} />
      {/* hourglass */}
      <g transform={`translate(${cx} ${cy})`}>
        <path d="M-200 -330 L 200 -330 L 30 0 L 200 330 L -200 330 L -30 0 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.75)" strokeWidth={6} strokeLinejoin="round" />
        <clipPath id="hgTop">
          <path d="M-190 -320 L 190 -320 L 26 -4 L -26 -4 Z" />
        </clipPath>
        <clipPath id="hgBot">
          <path d="M-26 4 L 26 4 L 190 320 L -190 320 Z" />
        </clipPath>
        <g clipPath="url(#hgTop)">
          <rect x={-200} y={-320 + 300 * flow} width={400} height={330} fill="#FBF6F8" />
        </g>
        <g clipPath="url(#hgBot)">
          <path d={`M-190 320 L ${-20 - 170 * flow} ${320 - 60 * flow} Q 0 ${320 - 220 * flow} ${20 + 170 * flow} ${320 - 60 * flow} L 190 320 Z`} fill="#FBF6F8" />
        </g>
        <rect x={-3} y={-4} width={6} height={320 - 200 * flow} fill="#FBF6F8" opacity={0.9} />
        <rect x={-230} y={-350} width={460} height={26} rx={10} fill={C.blush} />
        <rect x={-230} y={324} width={460} height={26} rx={10} fill={C.blush} />
      </g>
      {tagK > 0 && (
        <g transform={`translate(${cx} 1520) scale(${0.85 + 0.15 * tagK})`} opacity={tagK}>
          <rect x={-200} y={-52} width={400} height={96} rx={48} fill="rgba(23,10,16,0.65)" stroke={C.age} strokeWidth={3} />
          <text y={14} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={42} fill={C.age} letterSpacing={4}>
            GLYCATION
          </text>
        </g>
      )}
    </Svg>
  );
};

// =============== C+D+E: collagen springs → sugar sticks → bonds → caramel ===============
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tSpring = cue('spring');
  const tSugar = cue('sugar', 2);
  const tSticks = cue('sticks');
  const tGlues = cue('glues');
  const tAGEs = cue('AGEs,');
  const tStretch = cue('stretch,');
  const tStiff = cue('stiff,');
  const tCaramel = cue('caramel');
  const tSun = cue('Sunlight');
  const end = S(5);
  const push = 1.04 + 0.08 * ease(prog(s, t0, end));
  // spring bounce until glued
  const glue = ease(prog(s, tGlues - 0.2, tAGEs + 0.6));
  const stiff = ease(prog(s, tStretch - 0.3, tStiff + 0.4));
  const car = ease(prog(s, tStiff - 0.4, tCaramel + 0.8));
  const sunK = ease(prog(s, tSun - 0.3, tSun + 0.3)) * (1 - prog(s, end - 0.6, end));
  const bounce = Math.sin((s - tSpring) * 7) * Math.exp(-Math.max(0, s - tSpring) * 1.6) * (s > tSpring ? 1 : 0);
  const ampK = (1 + 0.5 * bounce) * (1 - 0.0 * stiff);
  const phase = s * 1.2 * (1 - stiff); // motion freezes as fibers stiffen
  const frozenPhase = (tStiff + 0.4) * 1.2 * 0 + phase;
  const sugarIn = prog(s, tSugar - 0.5, tSticks + 1.0);
  // stretch test: pull one fiber; healthy stretches, glued doesn't
  const pull = Math.sin(clamp(prog(s, tStretch - 0.4, tStretch + 0.8)) * Math.PI) * (s < tStiff ? 1 : 0);
  const bondsN = Math.round(18 * glue + 18 * ease(prog(s, tSun, tSun + 1.2)));
  const bonds = Array.from({length: 36}).map((_, i) => ({row: i % 5, x: 80 + rand(i * 7 + 1) * 920}));
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#derm)" />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} opacity={0.35} />
      <Bokeh s={s} n={20} seed={33} color={C.blush} o={0.5} />
      <text x={56} y={690} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.white} letterSpacing={5} opacity={0.75 * ease(prog(s, t0, t0 + 0.6))}>
        COLLAGEN · DERMIS
      </text>
      {/* blood vessel carrying sugar */}
      <path d={`M-50 1720 C 300 1680, 700 1770, ${W + 50} 1710`} stroke="#E0384E" strokeWidth={50} fill="none" opacity={0.85} />
      {sugarIn > 0 &&
        Array.from({length: 22}).map((_, i) => {
          const ph = (s * 0.35 + rand(i)) % 1;
          const x = ((rand(i * 3) * W + s * 140) % (W + 100)) - 50;
          const rise = clamp(sugarIn * 1.4 - rand(i * 5) * 0.4);
          const targetRow = i % 6;
          const y = 1715 - rise * (1715 - fibers[targetRow].y - 30);
          return <Cube key={i} x={x} y={y + Math.sin(ph * 6) * 6} r={13} rot={ph * 180} o={0.95} />;
        })}
      {fibers.map((f, i) => {
        const pullK = i === 2 ? pull : 0;
        return (
          <g key={i} transform={`translate(0 ${-pullK * 40 * (1 - glue)})`}>
            <CFiber x0={-60} x1={W + 60} y={f.y} amp={f.amp * ampK * (1 + pullK * (glue > 0.5 ? 0 : -0.6))} wl={f.wl} phase={f.ph + frozenPhase} w={30} car={car} />
          </g>
        );
      })}
      {/* AGE bonds bridging neighbouring fibers */}
      {bonds.slice(0, bondsN).map((b, i) => {
        const y1 = fy(b.row, b.x, frozenPhase, ampK) + 14;
        const y2 = fy(b.row + 1, b.x, frozenPhase, ampK) - 14;
        const k = 1;
        return (
          <g key={i} opacity={k}>
            <line x1={b.x} y1={y1} x2={b.x} y2={y2} stroke={C.age} strokeWidth={9} strokeLinecap="round" />
            <circle cx={b.x} cy={(y1 + y2) / 2} r={12} fill={C.age} />
            <circle cx={b.x} cy={(y1 + y2) / 2} r={26} fill="url(#caramelGlow)" />
          </g>
        );
      })}
      {/* AGEs label */}
      {(() => {
        const k = ease(prog(s, tAGEs - 0.3, tAGEs + 0.3)) * (1 - ease(prog(s, tStretch - 0.5, tStretch)));
        return k > 0 ? (
          <g transform={`translate(${W / 2} 590) scale(${0.85 + 0.15 * k})`} opacity={k}>
            <rect x={-180} y={-50} width={360} height={92} rx={46} fill="rgba(23,10,16,0.7)" stroke={C.age} strokeWidth={3} />
            <text y={14} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={44} fill={C.age} letterSpacing={6}>
              AGEs
            </text>
          </g>
        ) : null;
      })()}
      {/* stretch arrows */}
      {pull > 0.05 && (
        <g opacity={pull} stroke={C.white} strokeWidth={6} strokeLinecap="round" fill="none">
          <path d={`M${W / 2} ${fibers[2].y - 120} l 0 -90 m -24 24 l 24 -24 l 24 24`} />
          {glue > 0.5 && (
            <g transform={`translate(${W / 2 + 120} ${fibers[2].y - 150})`}>
              <circle r={40} fill="rgba(23,10,16,0.7)" stroke={C.uvb} strokeWidth={5} />
              <path d="M-16 -16 L 16 16 M16 -16 L -16 16" stroke={C.uvb} strokeWidth={7} />
            </g>
          )}
        </g>
      )}
      {/* sunlight speeds it up */}
      <Beam d={wavePath(W / 2 + 200, -100, W / 2 - 60, 1700, 26, 120, s * 7, ease(prog(s, tSun - 0.3, tSun + 0.4)))} color={C.uva} o={sunK} w={9} />
    </Svg>
  );
};

// =============== F: the study — glucose vs perceived age ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const t600 = cue('600');
  const tUnit = cue('unit');
  const t5 = cue('5');
  const push = 1 + 0.05 * ease(prog(s, t0, S(6)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const dotsK = ease(prog(s, t600 - 0.3, t600 + 0.8));
  const lineK = ease(prog(s, tUnit - 0.3, t5 + 0.2));
  const badge = ease(prog(s, t5 - 0.15, t5 + 0.3));
  const val = Math.round(5 * easeOut(prog(s, t5 - 0.1, t5 + 0.6)));
  const gx0 = 150;
  const gx1 = 950;
  const gy0 = 1350;
  const gh = 600;
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={950} r={800} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} o={0.5} />
      <g opacity={inK}>
        <line x1={gx0} y1={gy0} x2={gx1} y2={gy0} stroke="rgba(238,221,226,0.5)" strokeWidth={3} />
        <line x1={gx0} y1={gy0} x2={gx0} y2={gy0 - gh} stroke="rgba(238,221,226,0.5)" strokeWidth={3} />
        <text x={(gx0 + gx1) / 2} y={gy0 + 60} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={4}>
          BLOOD SUGAR →
        </text>
        <text x={gx0 - 30} y={gy0 - gh / 2} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={4} transform={`rotate(-90 ${gx0 - 30} ${gy0 - gh / 2})`}>
          LOOKS OLDER →
        </text>
      </g>
      {Array.from({length: 90}).map((_, i) => {
        const u = rand(i * 3);
        const v = clamp(0.2 + 0.5 * u + (rand(i * 7) - 0.5) * 0.45);
        const k = clamp(dotsK * 1.6 - rand(i * 11) * 0.6);
        return <circle key={i} cx={gx0 + 30 + u * (gx1 - gx0 - 60)} cy={gy0 - 30 - v * (gh - 60)} r={9 * k} fill={C.blush} opacity={0.55 * k} />;
      })}
      <line x1={gx0 + 30} y1={gy0 - 30 - 0.22 * (gh - 60)} x2={gx0 + 30 + (gx1 - gx0 - 60) * lineK} y2={gy0 - 30 - (0.22 + 0.5 * lineK) * (gh - 60)} stroke={C.age} strokeWidth={10} strokeLinecap="round" />
      {badge > 0 && (
        <g transform={`translate(${W / 2 + 120} 640) scale(${0.7 + 0.3 * badge})`} opacity={badge}>
          <rect x={-250} y={-70} width={500} height={124} rx={62} fill={C.blush} />
          <text x={0} y={18} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={58} fill={C.plum}>
            +{val} months
          </text>
          <text x={0} y={96} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={3}>
            PER 1 MMOL/L GLUCOSE
          </text>
        </g>
      )}
      <text x={W / 2} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.5 * inK}>
        Noordam et al., AGE, 2013 · 602 adults · perceived age from photos · illustrative data
      </text>
    </Svg>
  );
};

// =============== G: keep it steady ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tSteady = cue('steady.');
  const tSweet = cue('sweet');
  const tFiber = cue('fiber');
  const tSun = cue('sunscreen');
  const push = 1.04 - 0.04 * ease(prog(s, t0, S(7)));
  const smooth = ease(prog(s, tSteady - 0.4, tSteady + 0.8));
  const gx0 = 110;
  const gx1 = 970;
  const gy = 820;
  let d = '';
  for (let i = 0; i <= 120; i++) {
    const u = i / 120;
    const spikes = Math.max(0, Math.sin(u * Math.PI * 6)) ** 6 * 220 + Math.sin(u * 40) * 10;
    const calm = Math.sin(u * Math.PI * 6) * 26;
    const y = gy - (spikes * (1 - smooth) + calm * smooth);
    d += (i ? 'L' : 'M') + (gx0 + (gx1 - gx0) * u).toFixed(1) + ' ' + y.toFixed(1);
  }
  const item = (x: number, t: number, label: string, children: React.ReactNode) => {
    const k = ease(prog(s, t - 0.35, t + 0.25));
    return (
      <g transform={`translate(${x} 1300) scale(${0.85 + 0.15 * k})`} opacity={k}>
        <circle r={115} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
        {children}
        <text y={165} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={3}>
          {label}
        </text>
      </g>
    );
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={800} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={61} o={0.5} />
      <text x={gx0} y={560} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={5} opacity={0.8}>
        BLOOD SUGAR · ONE DAY
      </text>
      <path d={d} stroke={smooth > 0.5 ? C.blush : C.age} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={smooth > 0.5 ? C.blush : C.age} strokeWidth={30} fill="none" opacity={0.2} filter="url(#blur12)" />
      {item(
        240,
        tSweet,
        'FEWER SWEET DRINKS',
        <g>
          <path d="M-40 -60 L 40 -60 L 30 60 L -30 60 Z" fill="rgba(255,255,255,0.15)" stroke={C.white} strokeWidth={5} />
          <rect x={-34} y={-30} width={68} height={86} fill={C.caramel} opacity={0.8} />
          <path d="M-70 70 L 70 -70" stroke={C.uvb} strokeWidth={9} strokeLinecap="round" />
        </g>,
      )}
      {item(
        540,
        tFiber,
        'FIBER + PROTEIN',
        <g>
          <path d="M-70 0 a 70 50 0 0 0 140 0 Z" fill={C.blush} />
          <path d="M-30 -10 q 10 -50 50 -50 q -10 40 -50 50 Z" fill="#7BC47F" />
          <ellipse cx={30} cy={-10} rx={22} ry={28} fill="#FFF6E8" />
          <circle cx={30} cy={-6} r={10} fill={C.oil ?? '#F2C46A'} />
        </g>,
      )}
      {item(
        840,
        tSun,
        'DAILY SPF',
        <g transform="rotate(-15)">
          <path d="M -36 -70 L 36 -70 L 30 50 L -30 50 Z" fill={C.blush} />
          <rect x={-20} y={50} width={40} height={24} rx={6} fill={C.plum} />
          <text y={0} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={26} fill={C.plum}>
            SPF
          </text>
        </g>,
      )}
    </Svg>
  );
};

// =============== H: loop + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tSteady = cue('steady', 7);
  const tGlowi = cue('Glowi');
  const scan = prog(s, tSteady - 0.3, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tSteady, tSteady + 1)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1300)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Bokeh s={s} top={200} bottom={HORIZON} seed={5} color={C.goldHot} o={0.6} />
        <SkinPlane s={s} fx={{scan, film: 1, filmSheen: prog(s, t0, t0 + 3)}} />
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

// ---- wiring read by Main.tsx: scene components in order + their start times (last entry = video end) ----
export const SCENES: React.FC<{s: number}>[] = [SceneA, SceneB, SceneC, SceneF, SceneG, SceneH];
export const bounds = (end: number) => [0, S(1), S(2), S(5), S(6), S(7), end];
