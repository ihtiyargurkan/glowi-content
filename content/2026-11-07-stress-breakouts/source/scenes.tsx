import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, HORIZON} from './parts';
import {cue, S} from './timeline';

// accent for this topic: stress = hot coral (C.cortisol) ; inflammation = red
const HOT = C.cortisol;
const INFL = '#FF5A64';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <radialGradient id="bumpG" cx="0.4" cy="0.35">
        <stop offset="0" stopColor="#FFD3CF" />
        <stop offset="0.55" stopColor="#F08A8C" />
        <stop offset="1" stopColor="#C9505F" />
      </radialGradient>
      <radialGradient id="inflG">
        <stop offset="0" stopColor={INFL} stopOpacity="0.85" />
        <stop offset="0.6" stopColor={INFL} stopOpacity="0.3" />
        <stop offset="1" stopColor={INFL} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="hotG">
        <stop offset="0" stopColor={HOT} stopOpacity="0.8" />
        <stop offset="1" stopColor={HOT} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="oilFlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF1C2" />
        <stop offset="1" stopColor={C.oil} />
      </linearGradient>
      <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F6EDEF" />
        <stop offset="0.5" stopColor="#CDB8C0" />
        <stop offset="1" stopColor="#8E7580" />
      </linearGradient>
      <linearGradient id="brickG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F8DCDC" />
        <stop offset="1" stopColor="#E2A9AF" />
      </linearGradient>
      <linearGradient id="fingerG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#C98A86" />
        <stop offset="0.5" stopColor="#E9B7AE" />
        <stop offset="1" stopColor="#C98A86" />
      </linearGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

// ---------- a breakout bump on the perspective skin plane ----------
const Bump: React.FC<{x: number; y: number; r: number; k: number; heat?: number}> = ({x, y, r, k, heat = 1}) =>
  k > 0.01 ? (
    <g>
      <ellipse cx={x} cy={y} rx={r * 2.6 * k} ry={r * 1.2 * k} fill="url(#inflG)" opacity={0.85 * heat} />
      <ellipse cx={x} cy={y - r * 0.25 * k} rx={r * k} ry={r * 0.62 * k} fill="url(#bumpG)" />
      <ellipse cx={x - r * 0.25 * k} cy={y - r * 0.45 * k} rx={r * 0.32 * k} ry={r * 0.16 * k} fill="#fff" opacity={0.65} />
      {r > 22 && <ellipse cx={x} cy={y - r * 0.38 * k} rx={r * 0.22 * k} ry={r * 0.14 * k} fill="#FFF4E8" opacity={0.85} />}
    </g>
  ) : null;

const bumps = [
  {x: 330, y: 1290, r: 44},
  {x: 700, y: 1430, r: 58},
  {x: 500, y: 1660, r: 76},
  {x: 860, y: 1220, r: 36},
  {x: 190, y: 1530, r: 52},
];

// ---------- stress gauge ----------
const Gauge: React.FC<{x: number; y: number; v: number; s: number; sc?: number; o?: number}> = ({x, y, v, s, sc = 1, o = 1}) => {
  const R = 220;
  const segs = ['#EEDDE2', '#F2C879', HOT, INFL];
  const jitter = v > 0.6 ? Math.sin(s * 31) * 0.015 * v : 0;
  const a = Math.PI + (v + jitter) * Math.PI; // 180..360 deg
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={o}>
      <circle r={300} fill={v > 0.6 ? INFL : C.plum} opacity={0.18 + 0.12 * v} filter="url(#blur30)" />
      <path d={`M${-R - 40} 30 A ${R + 40} ${R + 40} 0 0 1 ${R + 40} 30 L ${R + 40} 60 L ${-R - 40} 60 Z`} fill="rgba(23,10,16,0.55)" />
      {segs.map((c, i) => {
        const a0 = Math.PI + (i / 4) * Math.PI + 0.03;
        const a1 = Math.PI + ((i + 1) / 4) * Math.PI - 0.03;
        return (
          <path
            key={i}
            d={`M${Math.cos(a0) * R} ${Math.sin(a0) * R} A ${R} ${R} 0 0 1 ${Math.cos(a1) * R} ${Math.sin(a1) * R}`}
            stroke={c}
            strokeWidth={30}
            fill="none"
            strokeLinecap="round"
            opacity={0.9}
          />
        );
      })}
      <line x1={0} y1={0} x2={Math.cos(a) * (R - 40)} y2={Math.sin(a) * (R - 40)} stroke={C.white} strokeWidth={12} strokeLinecap="round" />
      <circle r={26} fill={C.white} />
      <circle r={10} fill={C.plum} />
      <text y={52} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.blush} letterSpacing={8}>
        STRESS
      </text>
    </g>
  );
};

// =============== A: hook — the stress needle climbs, the skin breaks out ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tStressed = cue('out', 0);
  const push = 1 + 0.07 * ease(prog(s, 0, S(1)));
  const v = 0.18 + 0.75 * ease(prog(s, 0, tStressed + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={HOT} o={0.55} />
      <SkinPlane s={s} fx={{flush: 0.35 * v}} />
      {bumps.map((b, i) => (
        <Bump key={i} x={b.x} y={b.y} r={b.r} k={easeOut(prog(s, -0.25 + i * 0.4, 0.3 + i * 0.4))} />
      ))}
      <Gauge x={W / 2} y={790} v={v} s={s} />
    </Svg>
  );
};

// =============== B1: the popular answer — a tap of oil ===============
export const SceneB1: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tFloods = cue('floods');
  const push = 1.05 - 0.05 * ease(prog(s, t0 - 0.2, t0 + 1.2));
  const open = ease(prog(s, tFloods - 0.3, tFloods + 0.4));
  const quoteK = ease(prog(s, t0 + 0.1, t0 + 0.6));
  const tx = W / 2;
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={15} color={C.goldHot} o={0.55} />
      <SkinPlane s={s} />
      {/* oil puddle spreading on the skin */}
      <ellipse cx={tx} cy={1330} rx={70 + 380 * open} ry={22 + 120 * open} fill={C.oil} opacity={0.35 * open} filter="url(#blur12)" />
      <ellipse cx={tx - 30} cy={1310} rx={40 + 200 * open} ry={10 + 40 * open} fill="#FFF6D8" opacity={0.5 * open} filter="url(#blur4)" />
      {/* the tap */}
      <g transform={`translate(${tx} 730)`}>
        <rect x={-300} y={-40} width={300} height={80} rx={20} fill="url(#metal)" />
        <rect x={-340} y={-70} width={60} height={140} rx={16} fill="url(#metal)" />
        <path d="M0 -40 Q 120 -40 120 80 L 120 150 L 40 150 L 40 90 Q 40 40 0 40 Z" fill="url(#metal)" />
        <rect x={30} y={140} width={100} height={30} rx={10} fill="#8E7580" />
        {/* handle turns as it opens */}
        <g transform={`translate(-150 -40) rotate(${-70 * open})`}>
          <rect x={-12} y={-90} width={24} height={90} rx={10} fill="url(#metal)" />
          <rect x={-70} y={-110} width={140} height={34} rx={17} fill={HOT} />
        </g>
        <text x={-150} y={-180} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={26} fill={HOT} letterSpacing={6} opacity={0.9}>
          STRESS
        </text>
      </g>
      {/* oil stream */}
      {open > 0.02 && (
        <g>
          <rect x={tx + 80 - 22 * open} y={900} width={44 * open} height={430 * clamp(open * 1.6)} rx={20} fill="url(#oilFlow)" opacity={0.95} />
          <rect x={tx + 80 - 60 * open} y={900} width={120 * open} height={430 * clamp(open * 1.6)} fill={C.oil} opacity={0.25} filter="url(#blur12)" />
          {Array.from({length: 10}).map((_, i) => {
            const ph = (s * 1.4 + i / 10) % 1;
            return <circle key={i} cx={tx + 80 + Math.sin(i * 3) * 12 * open} cy={910 + ph * 420} r={8 * open} fill="#FFF6D8" opacity={0.8 * open} />;
          })}
        </g>
      )}
      <text x={W / 2} y={1560} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={46} fill={C.white} opacity={quoteK}>
        “Stress = more oil”
      </text>
    </Svg>
  );
};

// =============== B2: the study — 94 students, oil the same, acne worse ===============
export const SceneB2: React.FC<{s: number}> = ({s}) => {
  const t0 = cue('researchers');
  const t94 = cue('94');
  const tExam = cue('exam');
  const tStud = cue('students', 1);
  const tOil = cue('oil', 1, 1);
  const tSame = cue('same.');
  const tWorse = cue('worse.');
  const tTrig = cue('trigger');
  const push = 1 + 0.05 * ease(prog(s, t0, S(3)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const dotsK = prog(s, t0 - 0.5, t0 + 0.7);
  const countK = prog(s, t0 - 0.2, t94 + 0.2);
  const examK = ease(prog(s, tExam - 0.3, tExam + 0.5));
  const oilK = ease(prog(s, tOil - 0.4, tOil + 0.5));
  const sameK = ease(prog(s, tSame - 0.2, tSame + 0.3));
  const worseK = ease(prog(s, tWorse - 0.5, tWorse + 0.6));
  const trigK = ease(prog(s, tTrig - 0.2, tTrig + 0.5));
  const panel = (x: number, title: string, sub: string, hot: number, acne: number, delay: number) => {
    const k = ease(prog(s, tStud - 0.3 + delay, tStud + 0.3 + delay));
    return (
      <g transform={`translate(${x} ${1010 + (1 - k) * 60})`} opacity={k}>
        <rect x={-215} y={-150} width={430} height={680} rx={44} fill="rgba(238,221,226,0.08)" stroke={hot > 0.5 ? HOT : 'rgba(238,221,226,0.35)'} strokeWidth={hot > 0.5 ? 4 : 2.5} />
        <text y={-82} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={36} fill={hot > 0.5 ? HOT : C.white}>
          {title}
        </text>
        <text y={-42} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={22} fill={C.blush} opacity={0.7}>
          {sub}
        </text>
        {/* oil tube */}
        <g opacity={1 - 0.55 * trigK}>
          <rect x={-130} y={0} width={80} height={300} rx={40} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
          <clipPath id={`oilTube${x}`}>
            <rect x={-130} y={0} width={80} height={300} rx={40} />
          </clipPath>
          <g clipPath={`url(#oilTube${x})`}>
            <rect x={-130} y={300 - 300 * 0.5 * oilK} width={80} height={300} fill="url(#oilFlow)" />
          </g>
          <text x={-90} y={350} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.oil} letterSpacing={3}>
            OIL
          </text>
        </g>
        {/* acne tube */}
        <g opacity={worseK}>
          <rect x={50} y={0} width={80} height={300} rx={40} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
          <clipPath id={`acTube${x}`}>
            <rect x={50} y={0} width={80} height={300} rx={40} />
          </clipPath>
          <g clipPath={`url(#acTube${x})`}>
            <rect x={50} y={300 - 300 * acne * worseK} width={80} height={300} fill={INFL} opacity={0.9} />
          </g>
          <text x={90} y={350} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={INFL} letterSpacing={3}>
            ACNE
          </text>
        </g>
      </g>
    );
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={950} r={800} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} color={HOT} o={0.45} />
      {/* 94 students */}
      {Array.from({length: 94}).map((_, i) => {
        const col = i % 16;
        const row = Math.floor(i / 16);
        const k = clamp(dotsK * 1.5 - (i / 94) * 0.5);
        const x = 190 + col * 46.5;
        const y = 560 + row * 42;
        return (
          <g key={i} opacity={k * (0.35 + 0.65 * (1 - examK * 0.4))}>
            <circle cx={x} cy={y - 8} r={9} fill={examK > 0.5 ? HOT : C.blush} />
            <path d={`M${x - 13} ${y + 16} q 13 -22 26 0 Z`} fill={examK > 0.5 ? HOT : C.blush} />
          </g>
        );
      })}
      <g opacity={inK * (1 - ease(prog(s, tStud - 0.35, tStud + 0.05)))}>
        <text x={W / 2} y={900} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={84} fill={C.white} opacity={ease(dotsK)}>
          {Math.round(94 * easeOut(countK))}
        </text>
        <text x={W / 2} y={950} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush} letterSpacing={6} opacity={ease(dotsK)}>
          STUDENTS
        </text>
      </g>
      {panel(295, 'Holidays', 'low stress', 0, 0.45, 0)}
      {panel(785, 'Exams', 'high stress', examK, 0.62, 0.15)}
      {/* oil ≈ same badge */}
      {sameK > 0 && (
        <g transform={`translate(${W / 2} 1500) scale(${0.8 + 0.2 * sameK})`} opacity={sameK * (1 - 0.6 * trigK)}>
          <rect x={-190} y={-48} width={380} height={88} rx={44} fill={C.oil} />
          <text y={12} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={38} fill={C.plum}>
            oil ≈ same
          </text>
        </g>
      )}
      {trigK > 0 && (
        <g transform={`translate(${W / 2} 1612) scale(${0.8 + 0.2 * trigK})`} opacity={trigK}>
          <rect x={-230} y={-44} width={460} height={80} rx={40} fill="rgba(23,10,16,0.7)" stroke={INFL} strokeWidth={3} />
          <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={INFL}>
            acne still worse
          </text>
        </g>
      )}
      <text x={W / 2} y={1730} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.55 * inK}>
        Yosipovitch et al., Acta Derm Venereol, 2007 · 94 students · illustrative scale
      </text>
    </Svg>
  );
};

// =============== C: alarm in a clogged pore → spark → swollen bump ===============
const SURF = 760;
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const tAlert = cue('alert.');
  const tClog = cue('clogged');
  const tSpark = cue('spark');
  const tRed = cue('red,');
  const tSwollen = cue('swollen');
  const push = 1.08 - 0.08 * ease(prog(s, t0 - 0.3, t0 + 1.2)) + 0.06 * ease(prog(s, tSpark, S(4)));
  const hormK = ease(prog(s, t0 - 0.2, t0 + 0.8));
  const alertK = ease(prog(s, tAlert - 0.3, tAlert + 0.3));
  const plugK = ease(prog(s, tClog - 0.4, tClog + 0.3));
  const spark = prog(s, tSpark - 0.1, tSpark + 0.6);
  const inflK = ease(prog(s, tRed - 0.4, tSwollen + 0.5));
  const swell = ease(prog(s, tSwollen - 0.3, tSwollen + 0.6));
  const px = W / 2;
  const base = 1300;
  // surface line that bulges over the pore
  let surf = '';
  for (let i = 0; i <= 80; i++) {
    const x = -60 + (i / 80) * (W + 120);
    const d = (x - px) / 230;
    surf += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (SURF - 120 * swell * Math.exp(-d * d)).toFixed(1);
  }
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={420} bottom={SURF - 60} seed={31} color={HOT} o={0.5} />
      {/* skin layers */}
      <path d={`${surf} L ${W + 60} ${H + 200} L -60 ${H + 200} Z`} fill="url(#derm)" />
      <path d={`${surf} L ${W + 60} ${SURF + 200} L -60 ${SURF + 200} Z`} fill="url(#epi)" />
      <rect x={-60} y={SURF + 200} width={W + 120} height={10} fill="#B9606F" opacity={0.6} />
      <text x={56} y={SURF + 60} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.plum} letterSpacing={5} opacity={0.8}>
        SURFACE
      </text>
      {/* follicle */}
      <path d={`M${px - 60} ${SURF - 100 * swell} C ${px - 40} ${SURF + 200}, ${px - 90} ${base - 120}, ${px - 70} ${base} Q ${px} ${base + 70} ${px + 70} ${base} C ${px + 90} ${base - 120}, ${px + 40} ${SURF + 200}, ${px + 60} ${SURF - 100 * swell} Z`} fill="#7A3346" />
      {/* plug */}
      <g opacity={plugK}>
        <path d={`M${px - 52} ${SURF - 110 * swell + 10} Q ${px} ${SURF - 110 * swell - 30} ${px + 52} ${SURF - 110 * swell + 10} L ${px + 44} ${SURF + 150} Q ${px} ${SURF + 175} ${px - 44} ${SURF + 150} Z`} fill="#F4E6D6" />
        <path d={`M${px - 30} ${SURF - 110 * swell + 6} Q ${px} ${SURF - 110 * swell - 14} ${px + 30} ${SURF - 110 * swell + 6}`} stroke="#8A5A44" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
        <text x={px + 110} y={SURF + 110} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.white} letterSpacing={4} opacity={0.85 * (1 - swell * 0.6)}>
          CLOGGED PORE
        </text>
      </g>
      {/* inflammation glow */}
      <circle cx={px} cy={base - 180} r={120 + 300 * inflK} fill="url(#inflG)" opacity={inflK} />
      {/* alarm rings */}
      {alertK > 0 &&
        Array.from({length: 3}).map((_, i) => {
          const ph = (s * 0.9 + i / 3) % 1;
          return <circle key={i} cx={px} cy={base - 180} r={140 + ph * 340} fill="none" stroke={HOT} strokeWidth={6} opacity={alertK * (1 - ph) * (1 - 0.5 * inflK)} />;
        })}
      {alertK > 0 && (
        <g transform={`translate(${px + 190} ${base - 330}) scale(${0.7 + 0.3 * alertK})`} opacity={alertK * (1 - inflK) * (0.75 + 0.25 * Math.sin(s * 12))}>
          <circle r={58} fill={HOT} opacity={0.3} filter="url(#blur12)" />
          <path d="M0 -50 L 48 36 L -48 36 Z" fill="rgba(23,10,16,0.75)" stroke={HOT} strokeWidth={7} strokeLinejoin="round" />
          <rect x={-5} y={-22} width={10} height={34} rx={5} fill={HOT} />
          <circle cy={24} r={6} fill={HOT} />
        </g>
      )}
      {/* spark */}
      {spark > 0 && spark < 1 && (
        <g transform={`translate(${px} ${base - 60})`} opacity={Math.sin(spark * Math.PI)}>
          <circle r={90 * spark + 20} fill={C.goldHot} opacity={0.6} filter="url(#blur12)" />
          {Array.from({length: 10}).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 30} y1={Math.sin(a) * 30} x2={Math.cos(a) * (60 + 120 * spark)} y2={Math.sin(a) * (60 + 120 * spark)} stroke={C.goldHot} strokeWidth={7} strokeLinecap="round" />;
          })}
        </g>
      )}
      {/* blood vessel + stress hormones rising */}
      <path d={`M-50 1720 C 300 1660, 700 1780, ${W + 50} 1700`} stroke="#E0384E" strokeWidth={40} fill="none" opacity={0.9} />
      {hormK > 0 &&
        Array.from({length: 14}).map((_, i) => {
          const ph = (s * 0.45 + rand(i)) % 1;
          const x0 = 80 + rand(i * 3) * 920;
          const x = x0 + (px - x0) * ph * 0.85;
          const y = 1700 + (base - 140 - 1700) * ph;
          return (
            <g key={i} opacity={hormK * (1 - ph * 0.4)}>
              <circle cx={x} cy={y} r={26} fill="url(#hotG)" />
              <circle cx={x} cy={y} r={12} fill={HOT} />
            </g>
          );
        })}
      <text x={56} y={1800} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={HOT} letterSpacing={4} opacity={hormK}>
        STRESS HORMONES
      </text>
    </Svg>
  );
};

// =============== D: barrier repair — calm weeks vs final exams ===============
const BW = 150;
const BH = 56;
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tRepair = cue('repair.');
  const tBarrier = cue('barrier');
  const tSlow = cue('slowly');
  const push = 1.04 - 0.04 * ease(prog(s, t0 - 0.2, t0 + 1)) + 0.04 * ease(prog(s, tSlow, S(5)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const run = prog(s, tRepair - 0.2, S(5) - 0.3);
  const slowFocus = ease(prog(s, tSlow - 0.3, tSlow + 0.4));
  const missing = [
    [0, 1],
    [0, 4],
    [1, 2],
    [1, 5],
    [2, 0],
    [2, 3],
  ];
  const wall = (y: number, label: string, speed: number, hot: number) => {
    const done = clamp(run * speed);
    return (
      <g opacity={inK}>
        <text x={70} y={y - 70} fontFamily="Poppins" fontWeight={700} fontSize={30} fill={hot > 0.5 ? HOT : C.white} letterSpacing={2}>
          {label}
        </text>
        <rect x={40} y={y - 6} width={W - 80} height={3 * (BH + 10) + 6} rx={14} fill={C.gold} opacity={0.75} />
        {Array.from({length: 3}).map((_, r) =>
          Array.from({length: 7}).map((__, c) => {
            const idx = missing.findIndex(([mr, mc]) => mr === r && mc === c);
            const x = 50 + c * (BW + 10) - (r % 2) * ((BW + 10) / 2);
            if (x < 20 || x + BW > W - 20) return null;
            const yy = y + r * (BH + 10);
            let k = 1;
            if (idx >= 0) k = ease(clamp(done * missing.length - idx));
            return (
              <g key={`${r}-${c}`} opacity={idx >= 0 ? 0.25 + 0.75 * k : 1} transform={`translate(0 ${idx >= 0 ? -(1 - k) * 34 : 0})`}>
                <rect x={x} y={yy} width={BW} height={BH} rx={12} fill={idx >= 0 && k < 1 ? 'rgba(248,220,220,0.5)' : 'url(#brickG)'} stroke="#C98892" strokeWidth={2} strokeDasharray={idx >= 0 && k < 1 ? '8 6' : undefined} />
              </g>
            );
          }),
        )}
        {/* repair meter */}
        <rect x={70} y={y + 3 * (BH + 10) + 36} width={W - 140} height={22} rx={11} fill="rgba(255,255,255,0.12)" />
        <rect x={70} y={y + 3 * (BH + 10) + 36} width={(W - 140) * done} height={22} rx={11} fill={hot > 0.5 ? HOT : C.blush} />
        <text x={W - 70} y={y + 3 * (BH + 10) + 100} textAnchor="end" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={3} opacity={0.8}>
          BARRIER REPAIR
        </text>
      </g>
    );
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1050} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={61} o={0.45} />
      <g opacity={1 - 0.45 * slowFocus}>{wall(620, 'Calm weeks', 1.7, 0)}</g>
      <g transform={`translate(${W / 2} 1150) scale(${1 + 0.04 * slowFocus}) translate(${-W / 2} -1150)`}>{wall(1080, 'Final exams', 0.75, ease(prog(s, tBarrier - 0.3, tBarrier + 0.3)))}</g>
      {slowFocus > 0 && (
        <g transform={`translate(${W / 2} 1540) scale(${0.8 + 0.2 * slowFocus})`} opacity={slowFocus}>
          <rect x={-170} y={-46} width={340} height={84} rx={42} fill={HOT} />
          <text y={12} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={36} fill={C.plum}>
            slower repair
          </text>
        </g>
      )}
      <text x={W / 2} y={1730} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.55 * inK}>
        Garg et al., Arch Dermatol, 2001 · 27 students · illustrative scale
      </text>
    </Svg>
  );
};

// =============== E: stressed hands find your face ===============
const Finger: React.FC<{x: number; y: number; rot: number; len: number; w?: number}> = ({x, y, rot, len, w = 130}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 - 4} y={-8} width={w + 8} height={len + 20} rx={w / 2} fill="#7A4A52" opacity={0.35} filter="url(#blur12)" />
    <rect x={-w / 2} y={0} width={w} height={len} rx={w / 2} fill="url(#fingerG)" />
    <rect x={-w * 0.3} y={10} width={w * 0.6} height={w * 0.75} rx={w * 0.25} fill="#F6D9D2" opacity={0.9} />
    <path d={`M${-w * 0.3} ${len * 0.42} q ${w * 0.3} 12 ${w * 0.6} 0 M${-w * 0.26} ${len * 0.46} q ${w * 0.26} 9 ${w * 0.52} 0`} stroke="#B8787A" strokeWidth={4} fill="none" opacity={0.6} />
    <path d={`M${-w * 0.3} ${len * 0.75} q ${w * 0.3} 12 ${w * 0.6} 0`} stroke="#B8787A" strokeWidth={4} fill="none" opacity={0.5} />
    <rect x={-w / 2 + 10} y={30} width={10} height={len - 60} rx={5} fill="#fff" opacity={0.25} />
  </g>
);
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tHands = cue('hands');
  const tPick = cue('picking');
  const tBig = cue('slower', 5);
  const push = 1.04 + 0.08 * ease(prog(s, t0, S(6)));
  const reach = ease(prog(s, tHands - 0.6, tHands + 0.6));
  const pinch = Math.max(0, Math.sin(prog(s, tPick - 0.2, tBig + 0.4) * Math.PI * 3)) * (s > tPick - 0.2 ? 1 : 0);
  const grow = ease(prog(s, tPick, tBig + 0.4));
  const sx = W / 2;
  const sy = 1360;
  const gap = 70 + 130 * (1 - pinch * 0.7);
  return (
    <Svg cam={camZoom(push, sx, sy)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={71} color={HOT} o={0.55} />
      <SkinPlane s={s} fx={{flush: 0.25 + 0.4 * grow}} />
      <Bump x={230} y={1600} r={40} k={1} heat={0.6} />
      <Bump x={840} y={1240} r={30} k={1 - 0.5 * grow} heat={0.6 * (1 - grow)} />
      <Bump x={sx} y={sy} r={40 + 22 * grow} k={1} heat={0.7 + 0.8 * grow} />
      {/* pressure ring when picking */}
      {grow > 0 && <circle cx={sx} cy={sy - 10} r={90 + 80 * grow} fill="none" stroke={INFL} strokeWidth={5} opacity={0.6 * grow} strokeDasharray="14 12" />}
      {/* two fingers coming in */}
      <g opacity={reach}>
        <Finger x={sx - gap - 380 * (1 - reach)} y={sy + 40 + 300 * (1 - reach)} rot={52} len={560} />
        <Finger x={sx + gap + 380 * (1 - reach)} y={sy + 40 + 300 * (1 - reach)} rot={-52} len={560} />
      </g>
    </Svg>
  );
};

// =============== F: the calm routine ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const items = [
    {t: cue('gentle,'), label: 'GENTLE ROUTINE'},
    {t: cue('hands', 6), label: 'HANDS OFF'},
    {t: cue('sleep,'), label: 'PROTECT SLEEP'},
    {t: cue('time.'), label: 'GIVE IT TIME'},
  ];
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const calm = ease(prog(s, t0 - 0.2, S(7)));
  const pos = [
    [300, 660],
    [780, 660],
    [300, 990],
    [780, 990],
  ];
  const icon = (i: number) => {
    const st = {stroke: C.blush, strokeWidth: 6, fill: 'none', strokeLinecap: 'round' as const};
    switch (i) {
      case 0:
        return (
          <g {...st}>
            <rect x={-30} y={-24} width={60} height={74} rx={14} />
            <path d="M-8 -24 L -8 -44 L 26 -44" />
            <path d="M-14 12 q 14 -16 28 0" />
          </g>
        );
      case 1:
        return (
          <g>
            <g {...st}>
              <path d="M-20 40 L -20 -10 q 0 -12 10 -12 q 10 0 10 12 L 0 -36 q 0 -12 10 -12 q 10 0 10 12 L 20 0 q 10 -10 20 0 L 30 40 Z" />
            </g>
            <path d="M-60 60 L 60 -60" stroke={INFL} strokeWidth={9} strokeLinecap="round" />
          </g>
        );
      case 2:
        return <path d="M18 -48 a 50 50 0 1 0 30 84 a 40 40 0 1 1 -30 -84 Z" fill={C.moon} transform="translate(-10 4)" />;
      default:
        return (
          <g {...st}>
            <rect x={-44} y={-36} width={88} height={80} rx={12} />
            <path d="M-44 -12 L 44 -12 M-22 -50 L -22 -26 M22 -50 L 22 -26" />
            <path d="M-20 16 l 12 12 l 26 -26" stroke={C.gold} />
          </g>
        );
    }
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON + 300} seed={81} color={C.goldHot} o={0.55} />
      <g transform="translate(0 300)">
        <SkinPlane s={s} fx={{film: calm, filmSheen: prog(s, t0, S(7)), flush: 0.3 * (1 - calm)}} />
        {bumps.slice(0, 3).map((b, i) => (
          <Bump key={i} x={b.x} y={b.y - 120} r={b.r * 0.55} k={1 - 0.75 * calm} heat={1 - calm} />
        ))}
      </g>
      {(() => {
        const gOut = ease(prog(s, items[0].t - 0.6, items[0].t));
        const gv = 0.88 - 0.6 * ease(prog(s, t0 + 0.2, cue('mind.') + 0.3));
        return gOut < 1 ? <Gauge x={W / 2} y={820} v={gv} s={s} o={1 - gOut} sc={1 - 0.15 * gOut} /> : null;
      })()}
      {items.map((it, i) => {
        const k = ease(prog(s, it.t - 0.35, it.t + 0.25));
        const [x, y] = pos[i];
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * k})`} opacity={k}>
            <circle r={110} fill="rgba(23,10,16,0.62)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
            {icon(i)}
            <text y={155} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={3}>
              {it.label}
            </text>
          </g>
        );
      })}
    </Svg>
  );
};

// =============== G: loop back to the gauge + Glowi ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tPress = cue('pressure.');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tPress - 0.3, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const v = 0.85 - 0.6 * ease(prog(s, tPress - 0.2, tGlowi));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tPress, tPress + 1)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1300)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={HOT} o={0.55} />
        <SkinPlane s={s} fx={{scan, flush: 0.3 * v}} />
        {bumps.map((b, i) => (
          <Bump key={i} x={b.x} y={b.y} r={b.r} k={1 - 0.6 * (1 - v)} heat={v} />
        ))}
        <Gauge x={W / 2} y={790} v={v} s={s} />
        <g opacity={mesh}>
          {nodes.map((a, i) => {
            const b = nodes[(i * 5 + 3) % nodes.length];
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.blush} strokeWidth={1.5} opacity={0.55} />;
          })}
          {nodes.map((a, i) => (
            <circle key={i} cx={a.x} cy={a.y} r={7} fill={HOT} opacity={a.y < HORIZON + (H - HORIZON) * scan ? 1 : 0} />
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

// ---- wiring read by Main.tsx ----
export const SCENES: React.FC<{s: number}>[] = [SceneA, SceneB1, SceneB2, SceneC, SceneD, SceneE, SceneF, SceneG];
export const bounds = (end: number) => [0, S(1), cue('researchers'), S(3), S(4), S(5), S(6), S(7), end];
