import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, HORIZON} from './parts';
import {cue, S} from './timeline';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <radialGradient id="shineG">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="0.4" stopColor="#FFF4D6" stopOpacity="0.5" />
        <stop offset="1" stopColor="#FFF4D6" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="bubbleG" cx="0.35" cy="0.3">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="0.6" stopColor="#F3E9F2" stopOpacity="0.55" />
        <stop offset="1" stopColor="#D9C8E6" stopOpacity="0.35" />
      </radialGradient>
      <linearGradient id="brickG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F8DCDC" />
        <stop offset="1" stopColor="#E2A9AF" />
      </linearGradient>
      <linearGradient id="oilStream" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={C.oil} stopOpacity="1" />
        <stop offset="1" stopColor="#FFF1C2" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

const Bubble: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill="url(#bubbleG)" stroke="#fff" strokeWidth={2} strokeOpacity={0.7} />
    <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.18} fill="#fff" />
  </g>
);

const Foam: React.FC<{s: number; k: number; y: number; seed?: number; spread?: number}> = ({s, k, y, seed = 1, spread = W}) => (
  <g opacity={k}>
    {Array.from({length: 34}).map((_, i) => {
      const r = 16 + rand(i * 3 + seed) * 34;
      const x = W / 2 + (rand(i * 7 + seed) - 0.5) * spread;
      const yy = y - rand(i * 5 + seed) * 70 - 10 * Math.sin(s * 2 + i);
      return <Bubble key={i} x={x} y={yy} r={r * (0.6 + 0.4 * k)} />;
    })}
  </g>
);

// shine highlights on the perspective skin plane
const Shine: React.FC<{k: number; s: number}> = ({k, s}) => (
  <g opacity={k}>
    {[
      [380, 1260, 160, 50],
      [700, 1400, 220, 70],
      [520, 1640, 300, 90],
      [860, 1180, 110, 34],
    ].map(([x, y, rx, ry], i) => (
      <ellipse key={i} cx={x + Math.sin(s * 0.6 + i) * 10} cy={y} rx={rx} ry={ry} fill="url(#shineG)" />
    ))}
  </g>
);

const Stamp: React.FC<{x: number; y: number; k: number; top: string; big: string; color: string}> = ({x, y, k, top, big, color}) =>
  k > 0 ? (
    <g transform={`translate(${x} ${y}) rotate(-12) scale(${1.6 - 0.6 * k})`} opacity={k}>
      <rect x={-260} y={-84} width={520} height={168} rx={24} fill="rgba(23,10,16,0.45)" stroke={color} strokeWidth={10} />
      <text x={0} y={-14} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={color} letterSpacing={6}>
        {top}
      </text>
      <text x={0} y={54} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={66} fill={color} letterSpacing={8}>
        {big}
      </text>
    </g>
  ) : null;

// sebaceous gland (cluster of oil cells)
const Gland: React.FC<{x: number; y: number; sc?: number; pulse?: number}> = ({x, y, sc = 1, pulse = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${sc * (1 + 0.04 * pulse)})`}>
    <circle r={150} fill={C.oil} opacity={0.25} filter="url(#blur30)" />
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

// =============== A: hook — the more you wash, the shinier ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tOil = cue('oilier');
  const tWash = cue('wash');
  const push = 1 + 0.07 * ease(prog(s, 0, S(1)));
  const shine = 0.35 + 0.65 * ease(prog(s, tOil - 0.3, tOil + 0.6));
  const foamK = ease(prog(s, tWash - 0.4, tWash + 0.1)) * (1 - ease(prog(s, tWash + 0.9, tWash + 1.4)));
  const n = 1 + Math.min(3, Math.floor(prog(s, 0.2, tWash + 0.4) * 4));
  return (
    <Svg cam={camZoom(push, W / 2, 1300)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={5} color={C.goldHot} o={0.6} />
      <SkinPlane s={s} />
      <Shine k={shine} s={s} />
      <Foam s={s} k={foamK} y={1500} seed={3} />
      <g transform={`translate(${W / 2} 700)`}>
        <rect x={-210} y={-56} width={420} height={100} rx={50} fill="rgba(23,10,16,0.6)" stroke={C.blush} strokeWidth={2.5} />
        <text x={0} y={14} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={40} fill={C.white}>
          wash #{n} today
        </text>
      </g>
    </Svg>
  );
};

// =============== B: the popular answer — and the evidence ===============
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tPanics = cue('panics');
  const tThin = cue('thin.');
  const panic = ease(prog(s, tPanics - 0.3, tPanics + 0.3));
  const stamp = ease(prog(s, tThin - 0.15, tThin + 0.25));
  const pulse = panic * (1 - stamp) * (0.5 + 0.5 * Math.sin(s * 14));
  const push = 1.04 - 0.04 * ease(prog(s, t0 - 0.2, t0 + 1));
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={760} fill={C.plum} opacity={0.75} filter="url(#blur30)" />
      <Bokeh s={s} seed={21} o={0.5} />
      <g opacity={1 - 0.45 * stamp}>
        <Gland x={W / 2} y={1050} sc={1.5} pulse={pulse} />
        {/* alarm rays */}
        <g opacity={panic * (1 - stamp)} stroke={C.uvb} strokeWidth={10} strokeLinecap="round">
          {Array.from({length: 8}).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const r0 = 260 + 20 * pulse;
            return <line key={i} x1={W / 2 + Math.cos(a) * r0} y1={1050 + Math.sin(a) * r0} x2={W / 2 + Math.cos(a) * (r0 + 60)} y2={1050 + Math.sin(a) * (r0 + 60)} />;
          })}
        </g>
        {/* oil gushing */}
        {panic > 0 &&
          Array.from({length: 18}).map((_, i) => {
            const ph = (s * 1.2 + rand(i)) % 1;
            const a = -Math.PI / 2 + (rand(i * 3) - 0.5) * 1.6;
            return <circle key={i} cx={W / 2 + Math.cos(a) * (180 + ph * 420)} cy={1050 + Math.sin(a) * (180 + ph * 420)} r={14 * (1 - ph)} fill={C.oil} opacity={panic * (1 - stamp) * (1 - ph)} />;
          })}
        <text x={W / 2} y={1480} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={44} fill={C.white} opacity={panic}>
          “Skin panics → more oil”
        </text>
      </g>
      <Stamp x={W / 2} y={1050} k={stamp} top="EVIDENCE" big="THIN" color={C.uvb} />
    </Svg>
  );
};

// =============== C: glands deep, hormones set the pace ===============
const SURF = 700;
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tGl = cue('glands');
  const tHorm = cue('hormones');
  const tReach = cue('reach');
  const push = 1.08 - 0.08 * ease(prog(s, t0 - 0.3, t0 + 1.2));
  const glK = ease(prog(s, tGl - 0.4, tGl + 0.3));
  const hK = ease(prog(s, tHorm - 0.3, tHorm + 0.4));
  const foamK = ease(prog(s, cue('Washing') - 0.3, cue('Washing') + 0.3));
  const blockK = ease(prog(s, tReach - 0.4, tReach + 0.2));
  const gx = 620;
  const gy = 1330;
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={SURF + 200} fill="url(#sky)" />
      <rect x={-50} y={SURF} width={W + 100} height={220} fill="url(#epi)" />
      <rect x={-50} y={SURF + 220} width={W + 100} height={H} fill="url(#derm)" />
      <text x={56} y={SURF + 50} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.plum} letterSpacing={5} opacity={0.8}>
        SURFACE
      </text>
      <text x={56} y={gy + 6} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.white} letterSpacing={5} opacity={0.8 * glK}>
        OIL GLAND
      </text>
      {/* follicle */}
      <path d={`M${gx - 34} ${SURF} L ${gx - 22} ${gy + 140} L ${gx + 22} ${gy + 140} L ${gx + 34} ${SURF} Z`} fill="#7A3346" opacity={0.9} />
      <path d={`M${gx} ${gy + 150} L ${gx} ${SURF - 200}`} stroke="#4B2030" strokeWidth={8} />
      {/* oil rising in the follicle */}
      <rect x={gx - 18} y={SURF + (gy - SURF) * (1 - 0.6 * glK)} width={36} height={(gy - SURF) * 0.6 * glK} fill="url(#oilStream)" opacity={0.9} />
      <g opacity={glK}>
        <Gland x={gx + 130} y={gy} sc={0.9} pulse={0.5 + 0.5 * Math.sin(s * 3)} />
      </g>
      {/* blood vessel + hormone messengers */}
      <path d={`M-50 1700 C 300 1640, 700 1760, ${W + 50} 1690`} stroke="#E0384E" strokeWidth={34} fill="none" opacity={0.9} />
      {hK > 0 &&
        Array.from({length: 12}).map((_, i) => {
          const ph = (s * 0.5 + rand(i)) % 1;
          const x0 = 150 + rand(i * 3) * 300;
          const x = x0 + (gx + 130 - x0) * ph;
          const y = 1690 + (gy - 1690) * ph;
          return (
            <g key={i} opacity={hK * (1 - ph * 0.3)}>
              <circle cx={x} cy={y} r={14} fill={C.cortisol} />
              <circle cx={x} cy={y} r={28} fill={C.cortisol} opacity={0.25} filter="url(#blur4)" />
            </g>
          );
        })}
      <text x={180} y={1790} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.cortisol} letterSpacing={4} opacity={hK}>
        HORMONES
      </text>
      {/* foam stays on top */}
      <Foam s={s} k={foamK} y={SURF - 10} seed={9} />
      {blockK > 0 && (
        <g opacity={blockK}>
          <line x1={-50} y1={SURF + 6} x2={W + 50} y2={SURF + 6} stroke="#fff" strokeWidth={6} strokeDasharray="20 16" />
          <g transform={`translate(${gx + 260} ${SURF + 120})`}>
            <circle r={44} fill="rgba(23,10,16,0.6)" stroke={C.uvb} strokeWidth={5} />
            <path d="M-18 -18 L 18 18 M18 -18 L -18 18" stroke={C.uvb} strokeWidth={8} strokeLinecap="round" />
          </g>
        </g>
      )}
    </Svg>
  );
};

// =============== D: barrier cracks, oil keeps flowing ===============
const ROWS = 4;
const BW = 200;
const BH = 70;
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const tStrip = cue('Strip');
  const tCracks = cue('cracks.');
  const tRed = cue('red');
  const tFlow = cue('flowing');
  const top = 820;
  const push = 1.05 - 0.05 * ease(prog(s, t0 - 0.3, t0 + 1));
  const foamK = ease(prog(s, tStrip - 0.4, tStrip + 0.2)) * (1 - ease(prog(s, tCracks, tCracks + 0.6)));
  const crack = ease(prog(s, tCracks - 0.3, tCracks + 0.4));
  const red = ease(prog(s, tRed - 0.3, tRed + 0.5));
  const flow = ease(prog(s, tFlow - 0.4, tFlow + 0.4));
  const bottom = top + ROWS * (BH + 14);
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={top + 200} fill="url(#sky)" />
      <rect x={-200} y={bottom} width={W + 400} height={H} fill="url(#derm)" />
      <text x={56} y={top - 30} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.white} letterSpacing={5} opacity={0.7}>
        SKIN BARRIER
      </text>
      <rect x={-40} y={top - 8} width={W + 80} height={ROWS * (BH + 14) + 8} fill={C.gold} opacity={0.85 * (1 - 0.5 * crack)} />
      {Array.from({length: ROWS}).map((_, r) =>
        Array.from({length: 7}).map((__, c) => {
          const x = -60 + c * (BW + 14) + (r % 2) * ((BW + 14) / 2);
          const y = top + r * (BH + 14);
          const loose = crack * (r === 0 ? 1 : 0.3) * rand(r * 7 + c);
          return (
            <g key={`${r}-${c}`} transform={`translate(${loose * 12} ${-loose * 26}) rotate(${loose * 8} ${x + BW / 2} ${y})`}>
              <rect x={x} y={y} width={BW} height={BH} rx={14} fill="url(#brickG)" stroke="#C98892" strokeWidth={2} />
              <rect x={x} y={y} width={BW} height={BH} rx={14} fill="#FF5A6A" opacity={0.35 * red} />
            </g>
          );
        }),
      )}
      {/* cracks */}
      {[1, 3, 5].map((c, i) => {
        const x = -60 + c * (BW + 14) - 7;
        return (
          <path
            key={i}
            d={`M${x} ${top - 8} L ${x + 30} ${top + 90} L ${x - 14} ${top + 170} L ${x + 100} ${top + 250} L ${x + 80} ${bottom}`}
            stroke={C.plumInk}
            strokeWidth={12 * crack}
            fill="none"
            opacity={crack}
            strokeLinejoin="round"
          />
        );
      })}
      {/* flakes lifting off */}
      {red > 0 &&
        Array.from({length: 14}).map((_, i) => {
          const ph = (s * 0.4 + rand(i)) % 1;
          const x = rand(i * 3) * W;
          const y = top - 20 - ph * 400;
          return <rect key={i} x={x} y={y} width={22} height={10} rx={3} fill="#FCEFEF" opacity={red * (1 - ph)} transform={`rotate(${ph * 200 + i * 30} ${x} ${y})`} />;
        })}
      <Foam s={s} k={foamK} y={top - 20} seed={13} />
      {/* oil keeps flowing from below */}
      {flow > 0 && (
        <g>
          <Gland x={W / 2 + 200} y={1520} sc={0.7} pulse={0.5 + 0.5 * Math.sin(s * 3)} />
          <path d={`M${W / 2 + 120} 1500 C ${W / 2 + 60} 1300, ${W / 2 + 40} 1100, ${W / 2 + 40} ${top - 60}`} stroke="url(#oilStream)" strokeWidth={26} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - flow} />
          {Array.from({length: 8}).map((_, i) => {
            const ph = (s * 0.8 + i / 8) % 1;
            return <circle key={i} cx={W / 2 + 40 + Math.sin(ph * 9) * 20} cy={top - 60 - ph * 220} r={14 * (1 - ph)} fill={C.oil} opacity={flow * (1 - ph)} />;
          })}
        </g>
      )}
    </Svg>
  );
};

// =============== E: oil returns within hours — restart the clock ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tHours = cue('hours');
  const tRestart = cue('restarts');
  const push = 1.04 + 0.05 * ease(prog(s, t0, S(5)));
  // clock runs 0 -> 3h during first sentence, then resets on "restarts" and runs again briefly
  const run1 = ease(prog(s, t0 + 0.2, tHours + 0.6));
  const reset = prog(s, tRestart - 0.2, tRestart + 0.3);
  const run2 = ease(prog(s, tRestart + 0.3, tRestart + 1.6));
  const hrs = reset < 1 ? 3 * run1 * (1 - ease(reset)) : 3 * run2;
  const shine = clamp(hrs / 3);
  const foamK = reset > 0 && reset < 1 ? Math.sin(reset * Math.PI) : 0;
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={41} color={C.goldHot} o={0.6} />
      <SkinPlane s={s} />
      <Shine k={0.1 + 0.9 * shine} s={s} />
      <Foam s={s} k={foamK} y={1500} seed={17} />
      <g transform={`translate(${W / 2} 690)`}>
        <circle r={150} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.35)" strokeWidth={6} />
        <circle r={150} fill="none" stroke={C.oil} strokeWidth={12} strokeDasharray={`${942 * (hrs / 3)} 942`} transform="rotate(-90)" strokeLinecap="round" />
        <text y={14} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={64} fill={C.white}>
          {hrs.toFixed(1)}h
        </text>
        <text y={60} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.oil} letterSpacing={4}>
          SINCE WASHING
        </text>
        {reset > 0 && reset < 1 && <path d="M-200 -40 A 200 200 0 1 1 -160 120" stroke={C.blush} strokeWidth={8} fill="none" strokeLinecap="round" opacity={Math.sin(reset * Math.PI)} />}
      </g>
    </Svg>
  );
};

// =============== F: the trial — 1x, 2x, 4x a day ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tTwice = cue('twice');
  const tOnce = cue('once');
  const tFour = cue('four');
  const tNothing = cue('nothing.');
  const push = 1 + 0.05 * ease(prog(s, t0, S(6)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const cols = [
    {x: 220, label: '1×', sub: 'a day', val: 0.78, t: tOnce, col: C.uvb},
    {x: 540, label: '2×', sub: 'a day', val: 0.42, t: tTwice, col: C.blush},
    {x: 860, label: '4×', sub: 'a day', val: 0.42, t: tFour, col: 'rgba(238,221,226,0.6)'},
  ];
  const nothingK = ease(prog(s, tNothing - 0.2, tNothing + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={950} r={800} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} o={0.5} />
      <text x={W / 2} y={560} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush} letterSpacing={5} opacity={0.8 * inK}>
        ACNE AFTER 6 WEEKS
      </text>
      <line x1={90} y1={1380} x2={990} y2={1380} stroke="rgba(238,221,226,0.4)" strokeWidth={3} opacity={inK} />
      {cols.map((c, i) => {
        const k = ease(prog(s, c.t - 0.3, c.t + 0.5));
        const h = 620 * c.val * k;
        const best = i === 1 ? ease(prog(s, tTwice, tTwice + 0.5)) : 0;
        return (
          <g key={i} opacity={inK}>
            <rect x={c.x - 90} y={1380 - h} width={180} height={h} rx={22} fill={c.col} opacity={0.9} />
            {best > 0 && <rect x={c.x - 100} y={1380 - h - 10} width={200} height={h + 10} rx={26} fill="none" stroke={C.white} strokeWidth={4} opacity={best} />}
            <text x={c.x} y={1450} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={56} fill={C.white}>
              {c.label}
            </text>
            <text x={c.x} y={1494} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={24} fill={C.blush} opacity={0.7}>
              {c.sub}
            </text>
          </g>
        );
      })}
      {nothingK > 0 && (
        <g transform={`translate(860 ${1380 - 620 * 0.42 - 90}) scale(${0.8 + 0.2 * nothingK})`} opacity={nothingK}>
          <rect x={-150} y={-46} width={300} height={84} rx={42} fill="rgba(23,10,16,0.7)" stroke={C.blush} strokeWidth={3} />
          <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.blush}>
            no extra benefit
          </text>
        </g>
      )}
      <text x={W / 2} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.5 * inK}>
        Choi et al., Pediatric Dermatology, 2006 · randomized, 6 weeks · illustrative scale
      </text>
    </Svg>
  );
};

// =============== G: the smarter routine ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const items = [
    {t: cue('twice', 6), label: '2× A DAY'},
    {t: cue('gentle'), label: 'GENTLE'},
    {t: cue('lukewarm'), label: 'LUKEWARM'},
    {t: cue('Blot'), label: 'BLOT'},
    {t: cue('moisturize.'), label: 'MOISTURIZE'},
  ];
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const calm = ease(prog(s, t0 - 0.2, t0 + 1.0));
  const pos = [
    [230, 720],
    [540, 720],
    [850, 720],
    [385, 1000],
    [695, 1000],
  ];
  const icon = (i: number) => {
    const st = {stroke: C.blush, strokeWidth: 6, fill: 'none', strokeLinecap: 'round' as const};
    switch (i) {
      case 0:
        return (
          <g>
            <circle cx={-26} cy={0} r={22} fill={C.goldHot} />
            <path d="M36 -26 a 26 26 0 1 0 0 52 a 20 20 0 1 1 0 -52 Z" fill={C.moon ?? '#F4EBD8'} />
          </g>
        );
      case 1:
        return (
          <g {...st}>
            <rect x={-30} y={-20} width={60} height={70} rx={12} />
            <path d="M-8 -20 L -8 -40 L 26 -40" />
            <circle cx={0} cy={18} r={8} fill={C.blush} />
          </g>
        );
      case 2:
        return (
          <g>
            <path d="M-10 -46 C 10 -16, 26 4, 26 22 a 36 36 0 0 1 -72 0 c 0 -18 16 -38 36 -68 Z" transform="translate(10 0)" fill={C.water} />
            <rect x={30} y={-36} width={14} height={60} rx={7} fill="none" stroke={C.cortisol} strokeWidth={4} />
            <circle cx={37} cy={30} r={12} fill={C.cortisol} />
          </g>
        );
      case 3:
        return (
          <g>
            <rect x={-40} y={-46} width={80} height={92} rx={8} fill="#FFF6E8" transform="rotate(-10)" />
            <circle cx={0} cy={0} r={18} fill={C.oil} opacity={0.6} />
          </g>
        );
      default:
        return (
          <g>
            <rect x={-44} y={-10} width={88} height={52} rx={14} fill={C.blush} />
            <rect x={-48} y={-30} width={96} height={24} rx={8} fill={C.plum} />
          </g>
        );
    }
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={61} o={0.6} />
      <g transform="translate(0 320)">
        <SkinPlane s={s} fx={{film: calm, filmSheen: prog(s, t0, S(7))}} />
      </g>
      <g transform="translate(0 320)">
        <Shine k={0.35 * (1 - calm)} s={s} />
      </g>
      {items.map((it, i) => {
        const k = ease(prog(s, it.t - 0.35, it.t + 0.25));
        const [x, y] = pos[i];
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * k})`} opacity={k}>
            <circle r={105} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
            {icon(i)}
            <text y={150} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={3}>
              {it.label}
            </text>
          </g>
        );
      })}
    </Svg>
  );
};

// =============== H: loop + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tRoutine = cue('routine.');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tRoutine - 0.3, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const balance = ease(prog(s, t0, tRoutine));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tRoutine, tRoutine + 1)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1300)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Bokeh s={s} top={200} bottom={HORIZON} seed={5} color={C.goldHot} o={0.6} />
        <SkinPlane s={s} fx={{scan, film: balance, filmSheen: prog(s, t0, t0 + 3)}} />
        <Shine k={0.9 * (1 - balance)} s={s} />
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
