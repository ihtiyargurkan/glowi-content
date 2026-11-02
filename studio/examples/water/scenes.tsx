import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, HORIZON} from './parts';
import {cue, S} from './timeline';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#CFF0FB" stopOpacity="0.95" />
        <stop offset="1" stopColor={C.waterDeep} stopOpacity="0.85" />
      </linearGradient>
      <radialGradient id="dropG" cx="0.35" cy="0.3">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.35" stopColor={C.water} />
        <stop offset="1" stopColor={C.waterDeep} />
      </radialGradient>
      <linearGradient id="brickG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F8DCDC" />
        <stop offset="1" stopColor="#E2A9AF" />
      </linearGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

const Drop: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => (
  <g opacity={o}>
    <path d={`M${x} ${y - r * 1.6} C ${x + r * 0.9} ${y - r * 0.4}, ${x + r} ${y + r * 0.2}, ${x} ${y + r} C ${x - r} ${y + r * 0.2}, ${x - r * 0.9} ${y - r * 0.4}, ${x} ${y - r * 1.6} Z`} fill="url(#dropG)" />
    <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.22} fill="#fff" opacity={0.8} />
  </g>
);

const GlassCup: React.FC<{x: number; y: number; fill: number; o?: number; sc?: number}> = ({x, y, fill, o = 1, sc = 1}) => {
  const w = 90;
  const h = 150;
  const fh = h * 0.86 * fill;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${sc})`}>
      <clipPath id={`cup${Math.round(x)}`}>
        <path d={`M${-w / 2} ${-h} L ${w / 2} ${-h} L ${w * 0.38} 0 L ${-w * 0.38} 0 Z`} />
      </clipPath>
      <g clipPath={`url(#cup${Math.round(x)})`}>
        <rect x={-w} y={-fh - 6} width={w * 2} height={fh + 10} fill="url(#waterG)" />
        {fill > 0.05 && <path d={`M${-w} ${-fh - 6} q ${w / 2} -6 ${w} 0 t ${w} 0`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.7} />}
      </g>
      <path d={`M${-w / 2} ${-h} L ${-w * 0.38} 0 L ${w * 0.38} 0 L ${w / 2} ${-h}`} stroke="rgba(255,255,255,0.85)" strokeWidth={4} fill="rgba(255,255,255,0.06)" />
      <path d={`M${-w * 0.36} ${-h + 14} L ${-w * 0.28} -14`} stroke="#fff" strokeWidth={6} opacity={0.35} strokeLinecap="round" />
    </g>
  );
};

// dry cracked overlay for the skin plane
const DryCracks: React.FC<{k: number}> = ({k}) => (
  <g opacity={k} stroke="#9B5565" strokeWidth={2.5} fill="none">
    {Array.from({length: 14}).map((_, i) => {
      const x = 80 + rand(i * 3) * 920;
      const y = 1250 + rand(i * 5) * 600;
      const a = rand(i * 7) * Math.PI;
      const L = 60 + rand(i * 9) * 90;
      return (
        <path
          key={i}
          d={`M${x} ${y} l ${Math.cos(a) * L} ${Math.sin(a) * L * 0.4} l ${Math.cos(a + 0.8) * L * 0.6} ${Math.sin(a + 0.8) * L * 0.25} M${x + Math.cos(a) * L * 0.5} ${y + Math.sin(a) * L * 0.2} l ${Math.cos(a - 1.2) * L * 0.5} ${Math.sin(a - 1.2) * L * 0.3}`}
        />
      );
    })}
  </g>
);

// =============== A: 8 glasses, still dry ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const t8 = cue('8');
  const tStraight = cue('straight');
  const push = 1 + 0.06 * ease(prog(s, 0, S(2)));
  const dryK = ease(prog(s, cue('dry') - 0.2, cue('dry') + 0.6));
  // drop falls at sentence 1 and sinks below the surface instead of spreading
  const fall = prog(s, S(1) - 0.1, tStraight + 0.6);
  const dropY = 600 + 1100 * ease(fall);
  return (
    <Svg cam={camZoom(push, W / 2, 1200)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={7} color={C.water} o={0.6} />
      <SkinPlane s={s} fx={{dull: 0.5 * dryK}} />
      <DryCracks k={dryK * 0.8} />
      {Array.from({length: 8}).map((_, i) => {
        const appear = ease(prog(s, 0.1 + i * ((t8 - 0.3) / 8), 0.5 + i * ((t8 - 0.3) / 8)));
        const fillK = ease(prog(s, t8 + i * 0.08, t8 + 0.7 + i * 0.08));
        const row = i < 4 ? 0 : 1;
        const x = 210 + (i % 4) * 220 + (row ? 110 : 0) - (row ? 110 : 0);
        const y = row ? 1180 : 1010;
        return <GlassCup key={i} x={x} y={y + (1 - appear) * 40} fill={fillK} o={appear * (1 - 0.6 * prog(s, S(1) - 0.3, S(1) + 0.3))} sc={row ? 1.05 : 0.9} />;
      })}
      {fall > 0 && fall < 1 && <Drop x={W / 2} y={dropY} r={44} o={1 - prog(fall, 0.8, 1)} />}
      {fall > 0.62 && fall < 1 && <ellipse cx={W / 2} cy={HORIZON + 330} rx={160 * (fall - 0.62) * 3} ry={30 * (fall - 0.62) * 3} fill="none" stroke={C.water} strokeWidth={3} opacity={1 - fall} />}
    </Svg>
  );
};

// =============== B: blood -> organs -> skin from below ===============
const organs = [
  {x: 300, y: 1060, label: 'BRAIN', icon: 'brain'},
  {x: 790, y: 1140, label: 'HEART', icon: 'heart'},
  {x: 260, y: 1480, label: 'MUSCLE', icon: 'muscle'},
  {x: 820, y: 1560, label: 'KIDNEYS', icon: 'kidney'},
];
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const tBlood = cue('blood');
  const tOrgan = cue('organ.');
  const tBelow = cue('below.');
  const tShare = cue('share');
  const push = 1.04 - 0.04 * ease(prog(s, S(2), S(3)));
  const trunkK = ease(prog(s, S(2) - 0.2, tBlood + 0.3));
  // trunk from bottom center up to skin band at top
  const trunk = `M${W / 2} 1900 C ${W / 2 - 40} 1600, ${W / 2 + 40} 1200, ${W / 2} 700`;
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1200} r={760} fill={C.plum} opacity={0.75} filter="url(#blur30)" />
      {/* skin band at the top */}
      <rect x={-50} y={560} width={W + 100} height={110} fill="url(#epi)" opacity={0.95} />
      <rect x={-50} y={560} width={W + 100} height={8} fill="#fff" opacity={0.35} />
      <text x={56} y={625} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.plum} letterSpacing={5} opacity={0.8}>
        SKIN
      </text>
      {/* vessels */}
      <path d={trunk} stroke="#E0384E" strokeWidth={34} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - trunkK} strokeLinecap="round" />
      <path d={trunk} stroke="#FF8A96" strokeWidth={8} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - trunkK} opacity={0.7} />
      {organs.map((o, i) => {
        const k = ease(prog(s, tBlood + i * 0.25, tBlood + 0.5 + i * 0.25));
        const lit = ease(prog(s, tOrgan - 0.6 + i * 0.18, tOrgan - 0.1 + i * 0.18));
        const by = o.y - 40;
        const d = `M${W / 2} ${by + 60} Q ${(W / 2 + o.x) / 2} ${by + 90} ${o.x} ${o.y}`;
        return (
          <g key={i}>
            <path d={d} stroke="#D2334A" strokeWidth={14} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} strokeLinecap="round" />
            <g opacity={k}>
              <circle cx={o.x} cy={o.y} r={86} fill={C.water} opacity={0.25 * lit} filter="url(#blur12)" />
              <circle cx={o.x} cy={o.y} r={70} fill="rgba(23,10,16,0.55)" stroke={lit > 0.5 ? C.water : 'rgba(238,221,226,0.5)'} strokeWidth={3} />
              <OrganIcon kind={o.icon} x={o.x} y={o.y} lit={lit} />
              <text x={o.x} y={o.y + 112} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={4} opacity={0.75}>
                {o.label}
              </text>
            </g>
          </g>
        );
      })}
      {/* water particles flowing up the trunk */}
      {trunkK > 0.5 &&
        Array.from({length: 26}).map((_, i) => {
          const ph = (s * 0.45 + rand(i * 3)) % 1;
          const toSkin = s > tShare - 0.3 ? 1 : 0;
          const y = 1900 - ph * (toSkin ? 1260 : 900);
          if (!toSkin && y < 900) return null;
          const x = W / 2 + Math.sin(ph * 6 + i) * 14;
          return <circle key={i} cx={x} cy={y} r={7 + rand(i) * 5} fill={C.water} opacity={0.9 * (1 - ph * 0.3)} />;
        })}
      {/* skin receives a little from below */}
      {s > tShare &&
        Array.from({length: 7}).map((_, i) => {
          const g = ease(prog(s, tShare + i * 0.15, tBelow + 0.6 + i * 0.15));
          return <circle key={i} cx={220 + i * 110} cy={640 - g * 30} r={10 * g} fill={C.water} opacity={0.85 * g} />;
        })}
    </Svg>
  );
};

const OrganIcon: React.FC<{kind: string; x: number; y: number; lit: number}> = ({kind, x, y, lit}) => {
  const col = lit > 0.5 ? C.water : C.blush;
  const st = {stroke: col, strokeWidth: 5, fill: 'none', strokeLinecap: 'round' as const};
  return (
    <g transform={`translate(${x} ${y})`}>
      {kind === 'brain' && (
        <g {...st}>
          <path d="M-6 -30 C -40 -36 -46 -2 -30 8 C -44 22 -24 40 -6 30 Z" />
          <path d="M6 -30 C 40 -36 46 -2 30 8 C 44 22 24 40 6 30 Z" />
          <path d="M-22 -8 q 8 6 0 14 M22 -8 q -8 6 0 14" />
        </g>
      )}
      {kind === 'heart' && <path {...st} d="M0 30 C -46 0 -36 -36 -12 -30 C -4 -28 0 -20 0 -16 C 0 -20 4 -28 12 -30 C 36 -36 46 0 0 30 Z" />}
      {kind === 'muscle' && (
        <g {...st}>
          <path d="M-34 20 C -30 -10 -10 -30 10 -28 C 24 -26 26 -12 14 -6 C 30 -4 36 14 22 24 C 6 34 -20 30 -34 20 Z" />
        </g>
      )}
      {kind === 'kidney' && (
        <g {...st}>
          <path d="M-8 -30 C -40 -32 -42 30 -8 30 C 4 30 6 14 -2 6 C -10 -2 4 -10 4 -18 C 4 -26 0 -30 -8 -30 Z" />
          <path d="M14 -30 C 46 -32 48 30 14 30" />
        </g>
      )}
    </g>
  );
};

// =============== C: bricks and mortar barrier ===============
const ROWS = 5;
const BW = 200;
const BH = 70;
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const tWall = cue('wall');
  const tMortar = cue('mortar.');
  const tHealthy = cue('healthy,');
  const tCracks = cue('cracks,');
  const tAir = cue('air,');
  const tFaster = cue('faster.');
  const build = (r: number, c: number) => ease(prog(s, t0 - 0.1 + (ROWS - r) * 0.14 + c * 0.03, t0 + 0.5 + (ROWS - r) * 0.14 + c * 0.03));
  const mortarK = ease(prog(s, tMortar - 0.5, tMortar + 0.3));
  const crack = ease(prog(s, tCracks - 0.2, tCracks + 0.6));
  const windK = ease(prog(s, tAir - 0.2, tAir + 0.6));
  const fast = s > tFaster - 0.6 ? 1.8 : 1;
  const push = 1.08 - 0.08 * ease(prog(s, t0 - 0.3, t0 + 1.2)) + 0.05 * ease(prog(s, tCracks, S(5)));
  const top = 760;
  const crackCols = [1, 3, 4];
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={top + 200} fill="url(#sky)" />
      <rect x={-200} y={top + ROWS * (BH + 14)} width={W + 400} height={H} fill="url(#derm)" />
      {/* water reservoir below the wall */}
      {Array.from({length: 22}).map((_, i) => {
        const x = (rand(i * 3) * W + s * 12 * (rand(i) - 0.5)) % W;
        const y = top + ROWS * (BH + 14) + 90 + rand(i * 5) * 520 + Math.sin(s * 1.5 + i) * 8;
        return <Drop key={i} x={x} y={y} r={14 + rand(i * 7) * 10} o={0.9} />;
      })}
      <text x={56} y={top - 30} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.white} letterSpacing={5} opacity={0.7 * build(0, 0)}>
        OUTER LAYER · STRATUM CORNEUM
      </text>
      {/* mortar bed */}
      <rect x={-40} y={top - 8} width={W + 80} height={ROWS * (BH + 14) + 8} fill={C.gold} opacity={0.9 * mortarK} />
      {Array.from({length: ROWS}).map((_, r) =>
        Array.from({length: 7}).map((__, c) => {
          const k = build(r, c);
          const x = -60 + c * (BW + 14) + (r % 2) * ((BW + 14) / 2);
          const y = top + r * (BH + 14);
          return (
            <g key={`${r}-${c}`} opacity={k} transform={`translate(0 ${(1 - k) * -60})`}>
              <rect x={x} y={y} width={BW} height={BH} rx={14} fill="url(#brickG)" stroke="#C98892" strokeWidth={2} />
              <rect x={x + 12} y={y + 8} width={BW - 24} height={8} rx={4} fill="#fff" opacity={0.35} />
            </g>
          );
        }),
      )}
      {/* mortar shine when healthy */}
      {mortarK > 0 && (
        <rect x={-40} y={top - 8} width={W + 80} height={ROWS * (BH + 14) + 8} fill="url(#sunGlow)" opacity={0.18 * mortarK * (1 - crack)} />
      )}
      {/* cracks: dark gaps in the mortar */}
      {crackCols.map((c, i) => {
        const x = -60 + c * (BW + 14) - 7;
        return (
          <g key={i} opacity={crack}>
            <path
              d={`M${x} ${top + ROWS * (BH + 14)} L ${x + 18} ${top + 3 * (BH + 14) + 30} L ${x - 10} ${top + 2 * (BH + 14)} L ${x + 120} ${top + (BH + 14) + 40} L ${x + 100} ${top - 8}`}
              stroke={C.plumInk}
              strokeWidth={12 * crack}
              fill="none"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
      {/* water escaping through cracks */}
      {crack > 0.3 &&
        crackCols.map((c, i) =>
          Array.from({length: 5}).map((_, j) => {
            const ph = (s * 0.5 * fast + rand(i * 10 + j)) % 1;
            const x0 = -60 + c * (BW + 14) + 50;
            const y = top + ROWS * (BH + 14) - ph * 700;
            const drift = windK * ph * ph * 260;
            return <Drop key={`${i}-${j}`} x={x0 + drift + Math.sin(ph * 8) * 10} y={y} r={14 * (1 - 0.5 * ph)} o={(1 - ph) * crack} />;
          }),
        )}
      {/* dry air wind lines */}
      <g opacity={windK} stroke={C.blush} strokeWidth={4} fill="none" strokeLinecap="round">
        {Array.from({length: 6}).map((_, i) => {
          const y = 250 + i * 80;
          const x = ((s * 340 * fast + i * 170) % (W + 400)) - 300;
          return <path key={i} d={`M${x} ${y} q 90 -20 180 0 t 180 0`} opacity={0.5} />;
        })}
      </g>
    </Svg>
  );
};

// =============== D: the study + the review ===============
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const t2 = cue('2');
  const tMonth = cue('month');
  const tEsp = cue('especially');
  const tReview = cue('review');
  const tWeak = cue('weak.');
  const inK = ease(prog(s, t0 - 0.2, t0 + 0.6));
  const days = ease(prog(s, tMonth - 0.3, tEsp));
  const lowGain = 0.3 + 0.4 * days;
  const highGain = 0.62 + 0.12 * days;
  const lowFocus = ease(prog(s, tEsp, tEsp + 0.5));
  const reviewK = ease(prog(s, tReview - 0.4, tReview + 0.4));
  const stamp = ease(prog(s, cue('evidence') - 0.1, cue('evidence') + 0.25));
  const push = 1 + 0.05 * ease(prog(s, t0, S(7)));
  const card = (x: number, title: string, sub: string, meter: number, hi: number, delay: number) => {
    const k = ease(prog(s, t0 - 0.3 + delay, t0 + delay + 0.3));
    return (
      <g transform={`translate(${x} ${880 + (1 - k) * 80}) scale(${1 + 0.05 * hi})`} opacity={k * (1 - 0.75 * reviewK)}>
        <rect x={-210} y={-200} width={420} height={640} rx={44} fill="rgba(238,221,226,0.08)" stroke={hi > 0.5 ? C.water : 'rgba(238,221,226,0.35)'} strokeWidth={hi > 0.5 ? 4 : 2.5} />
        <text x={0} y={-130} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white}>
          {title}
        </text>
        <text x={0} y={-88} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={22} fill={C.blush} opacity={0.7}>
          {sub}
        </text>
        {/* tall hydration tube */}
        <rect x={-50} y={-50} width={100} height={340} rx={50} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
        <clipPath id={`tube${x}`}>
          <rect x={-50} y={-50} width={100} height={340} rx={50} />
        </clipPath>
        <g clipPath={`url(#tube${x})`}>
          <rect x={-50} y={290 - 340 * meter} width={100} height={340} fill="url(#waterG)" />
        </g>
        <text x={0} y={350} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={3} opacity={0.8}>
          SKIN HYDRATION
        </text>
      </g>
    );
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={950} r={800} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={71} color={C.water} o={0.5} />
      <g opacity={inK * (1 - 0.75 * reviewK)}>
        <rect x={250} y={470} width={580} height={86} rx={43} fill="rgba(168,221,242,0.14)" stroke={C.water} strokeWidth={2.5} opacity={ease(prog(s, t2 - 0.3, t2 + 0.3))} />
        <text x={W / 2} y={527} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={38} fill={C.white} opacity={ease(prog(s, t2 - 0.3, t2 + 0.3))}>
          +2 L / day · {Math.round(30 * days)} days
        </text>
      </g>
      {card(300, 'Drank little', 'before the study', lowGain, lowFocus, 0.3)}
      {card(780, 'Drank a lot', 'before the study', highGain, 0, 0.5)}
      {lowFocus > 0 && reviewK < 1 && (
        <g opacity={lowFocus * (1 - reviewK)} transform="translate(300 1440)">
          <rect x={-120} y={-44} width={240} height={80} rx={40} fill={C.water} />
          <text x={0} y={12} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={36} fill={C.plum}>
            biggest gain
          </text>
        </g>
      )}
      {/* review: 6 papers + stamp */}
      {reviewK > 0 && (
        <g opacity={reviewK}>
          {Array.from({length: 6}).map((_, i) => {
            const k = ease(prog(s, tReview - 0.2 + i * 0.1, tReview + 0.3 + i * 0.1));
            const x = 230 + (i % 3) * 310;
            const y = 820 + Math.floor(i / 3) * 400;
            return (
              <g key={i} transform={`translate(${x} ${y + (1 - k) * 60}) rotate(${(rand(i) - 0.5) * 8})`} opacity={k}>
                <rect x={-120} y={-160} width={240} height={320} rx={16} fill="#F6EDEF" />
                {Array.from({length: 7}).map((__, j) => (
                  <rect key={j} x={-90} y={-120 + j * 36} width={j % 3 === 2 ? 110 : 180} height={12} rx={6} fill="#C9AEB6" />
                ))}
              </g>
            );
          })}
          {stamp > 0 && (
            <g transform={`translate(${W / 2} 1030) rotate(-12) scale(${1.6 - 0.6 * stamp})`} opacity={stamp}>
              <rect x={-250} y={-80} width={500} height={160} rx={24} fill="rgba(23,10,16,0.35)" stroke={C.uvb} strokeWidth={10} />
              <text x={0} y={-12} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.uvb} letterSpacing={6}>
                EVIDENCE
              </text>
              <text x={0} y={52} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={64} fill={C.uvb} letterSpacing={8}>
                WEAK
              </text>
            </g>
          )}
        </g>
      )}
      <text x={W / 2} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.5 * inK}>
        {reviewK > 0.5 ? 'Akdeniz et al., Skin Research & Technology, 2018 · 6 studies' : 'Palma et al., Clin Cosmet Investig Dermatol, 2015 · 49 women'}
      </text>
    </Svg>
  );
};

// =============== E: seal it in ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tSeal = cue('seal');
  const tMoist = cue('Moisturize');
  const tGly = cue('glycerin');
  const tHya = cue('hyaluronic');
  const tShowers = cue('showers');
  const film = ease(prog(s, tSeal - 0.2, tMoist + 0.8));
  const sheen = prog(s, tMoist, tMoist + 1.8);
  const humK = ease(prog(s, tGly - 0.3, tHya + 0.3));
  const showerK = ease(prog(s, tShowers - 0.3, tShowers + 0.3));
  const push = 1.06 - 0.06 * ease(prog(s, t0, S(8)));
  return (
    <Svg cam={camZoom(push, W / 2, 1300)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={81} color={C.water} o={0.6} />
      <SkinPlane s={s} fx={{film, filmSheen: sheen}} />
      {/* droplets resting on damp skin */}
      {Array.from({length: 16}).map((_, i) => {
        const x = 120 + rand(i * 3) * 840;
        const y = 1150 + rand(i * 5) * 650;
        const r = 8 + (y - 1150) / 650 * 14;
        const k = ease(prog(s, t0 + i * 0.05, t0 + 0.6 + i * 0.05));
        return <Drop key={i} x={x} y={y} r={r * k} o={0.85} />;
      })}
      {/* humectants: small magnets pulling water in */}
      {humK > 0 &&
        Array.from({length: 7}).map((_, i) => {
          const x = 180 + i * 120;
          const y = 1050 + Math.sin(i * 1.7) * 60;
          const pull = ((s * 0.9 + i * 0.13) % 1);
          return (
            <g key={i} opacity={humK}>
              <polygon
                points={Array.from({length: 6}).map((__, j) => `${x + Math.cos((j * Math.PI) / 3 + s) * 26},${y + Math.sin((j * Math.PI) / 3 + s) * 26}`).join(' ')}
                fill="rgba(238,221,226,0.85)"
                stroke="#fff"
                strokeWidth={2}
              />
              <circle cx={x + (1 - pull) * 70} cy={y - (1 - pull) * 90} r={9} fill={C.water} opacity={pull} />
              <circle cx={x - (1 - pull) * 60} cy={y - (1 - pull) * 110} r={7} fill={C.water} opacity={pull} />
            </g>
          );
        })}
      {/* short-shower timer */}
      {showerK > 0 && (
        <g transform={`translate(${W / 2} 700) scale(${0.85 + 0.15 * showerK})`} opacity={showerK}>
          <circle r={110} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.35)" strokeWidth={8} />
          <circle r={110} fill="none" stroke={C.water} strokeWidth={10} strokeDasharray={`${691 * (1 - 0.65 * prog(s, tShowers, tShowers + 1.5))} 691`} transform="rotate(-90)" strokeLinecap="round" />
          <text y={16} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={50} fill={C.white}>
            5–10
          </text>
          <text y={56} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={4}>
            MIN
          </text>
        </g>
      )}
    </Svg>
  );
};

// =============== F: loop + Glowi ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(8);
  const tHold = cue('hold.');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tHold - 0.4, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const holdK = ease(prog(s, tHold - 0.5, tHold + 0.4));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tHold, tHold + 1)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1300)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Bokeh s={s} top={200} bottom={HORIZON} seed={3} color={C.water} />
        <SkinPlane s={s} fx={{scan, film: 0.5 * holdK, filmSheen: prog(s, tHold, tHold + 2)}} />
        {/* glass from the opening, now with water held in the skin */}
        <g opacity={1 - holdK}>
          <GlassCup x={W / 2} y={1100} fill={1} sc={1.4} />
        </g>
        <g opacity={mesh}>
          {nodes.map((a, i) => {
            const b = nodes[(i * 5 + 3) % nodes.length];
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.blush} strokeWidth={1.5} opacity={0.55} />;
          })}
          {nodes.map((a, i) => (
            <circle key={i} cx={a.x} cy={a.y} r={7} fill={C.water} opacity={a.y < HORIZON + (H - HORIZON) * scan ? 1 : 0} />
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
