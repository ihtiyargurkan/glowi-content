import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, HORIZON} from './parts';
import {cue, S} from './timeline';

// accent for this topic: smog blue-grey + soot
const SMOG = '#A9B8D6';
const SOOT = '#2A2230';
const RUST = '#E07A3A';
const MEL = '#7A4A32';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <radialGradient id="pm" cx="0.35" cy="0.3">
        <stop offset="0" stopColor="#6E6478" />
        <stop offset="0.6" stopColor={SOOT} />
        <stop offset="1" stopColor="#120C14" />
      </radialGradient>
      <radialGradient id="rustG">
        <stop offset="0" stopColor="#FFB070" stopOpacity="0.95" />
        <stop offset="0.5" stopColor={RUST} stopOpacity="0.6" />
        <stop offset="1" stopColor={RUST} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="smogG">
        <stop offset="0" stopColor={SMOG} stopOpacity="0.55" />
        <stop offset="1" stopColor={SMOG} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="melG" cx="0.4" cy="0.35">
        <stop offset="0" stopColor="#C08A64" />
        <stop offset="1" stopColor={MEL} />
      </radialGradient>
      <radialGradient id="lensG" cx="0.4" cy="0.35">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.16" />
        <stop offset="1" stopColor="#C9D6F0" stopOpacity="0.05" />
      </radialGradient>
      <linearGradient id="bldG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3A2532" />
        <stop offset="1" stopColor="#1C1018" />
      </linearGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

const Particle: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill="url(#pm)" />
    <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.22} fill="#B9AFC4" opacity={0.6} />
  </g>
);

// city skyline on the horizon, with smog haze
const BLD = Array.from({length: 16}).map((_, i) => ({x: -60 + i * 76 + rand(i) * 20, w: 60 + rand(i * 3) * 50, h: 120 + rand(i * 7) * 300}));
const Skyline: React.FC<{s: number; base: number; lights?: number; smog?: number}> = ({s, base, lights = 1, smog = 1}) => (
  <g>
    <ellipse cx={W / 2} cy={base - 120} rx={900} ry={260} fill="url(#smogG)" opacity={0.7 * smog} />
    {BLD.map((b, i) => (
      <g key={i}>
        <rect x={b.x} y={base - b.h} width={b.w} height={b.h + 20} fill="url(#bldG)" />
        {Array.from({length: Math.floor(b.h / 46)}).map((_, j) =>
          [0, 1].map((c) => {
            const on = rand(i * 31 + j * 7 + c) > 0.45;
            const tw = 0.6 + 0.4 * Math.sin(s * 2 + i + j);
            return on ? <rect key={`${j}-${c}`} x={b.x + 12 + c * (b.w / 2)} y={base - b.h + 18 + j * 46} width={b.w / 2 - 22} height={14} rx={3} fill={C.goldHot} opacity={0.55 * lights * tw} /> : null;
          }),
        )}
      </g>
    ))}
    <rect x={-200} y={base - 260} width={W + 400} height={300} fill={SMOG} opacity={0.12 * smog} filter="url(#blur30)" />
  </g>
);

// drifting airborne particles (toward the viewer)
const Drift: React.FC<{s: number; n?: number; k?: number; top?: number; bottom?: number; seed?: number}> = ({s, n = 40, k = 1, top = 420, bottom = 1500, seed = 1}) => (
  <g opacity={k}>
    {Array.from({length: n}).map((_, i) => {
      const ph = (s * (0.06 + rand(i + seed) * 0.08) + rand(i * 3 + seed)) % 1;
      const x = (rand(i * 7 + seed) * W + Math.sin(s * 0.7 + i) * 40 + s * 30) % W;
      const y = top + (bottom - top) * ((rand(i * 5 + seed) + ph * 0.5) % 1);
      const r = 4 + rand(i * 11 + seed) * 12 + ph * 6;
      return <Particle key={i} x={x} y={y} r={r} o={0.85 * Math.sin(ph * Math.PI) + 0.15} />;
    })}
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

// =============== A: hook — city skyline, haze, particles drifting onto skin ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const push = 1 + 0.08 * ease(prog(s, 0, S(1)));
  const settle = ease(prog(s, 0.6, S(1)));
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={5} color={C.goldHot} o={0.5} />
      <Skyline s={s} base={HORIZON + 10} />
      <SkinPlane s={s} fx={{dull: 0.35}} />
      {/* soot settling on the skin plane */}
      {Array.from({length: 26}).map((_, i) => {
        const x = 120 + rand(i * 13) * 840;
        const y = 1150 + rand(i * 17) * 650;
        const k = clamp(settle * 1.8 - rand(i * 5) * 0.8);
        return <Particle key={i} x={x} y={y} r={5 + rand(i) * 9} o={0.7 * k} />;
      })}
      <Drift s={s} n={46} top={500} bottom={1700} seed={3} />
    </Svg>
  );
};

// =============== B: not dirt you can see — magnifier: particles vs a hair ===============
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tTraffic = cue('Traffic');
  const tPart = cue('particles');
  const tHair = cue('hair');
  const push = 1.04 + 0.05 * ease(prog(s, t0, S(2)));
  const exhaust = ease(prog(s, tTraffic - 0.4, tTraffic + 0.6));
  const lens = ease(prog(s, t0 - 0.1, t0 + 0.7));
  const zoomIn = ease(prog(s, tPart - 0.4, tPart + 0.4));
  const hair = ease(prog(s, tHair - 0.4, tHair + 0.3));
  const lx = W / 2;
  const ly = 1040;
  const R = 300 * (0.75 + 0.25 * lens) * (1 + 0.12 * zoomIn);
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={1500} seed={11} color={C.goldHot} o={0.45} />
      <Skyline s={s} base={1650} smog={1 + exhaust} />
      {/* car + exhaust puffs */}
      <g opacity={exhaust} transform={`translate(${-200 + ((s - tTraffic) * 160) % 1500} 1640)`}>
        <rect x={-110} y={-60} width={220} height={60} rx={22} fill="#2A1820" />
        <rect x={-70} y={-100} width={130} height={50} rx={18} fill="#2A1820" />
        <circle cx={-60} cy={2} r={22} fill="#120A0F" />
        <circle cx={60} cy={2} r={22} fill="#120A0F" />
        <circle cx={110} cy={-30} r={10} fill={C.goldHot} />
      </g>
      {exhaust > 0 &&
        Array.from({length: 10}).map((_, i) => {
          const ph = (s * 0.4 + i / 10) % 1;
          return <circle key={i} cx={200 + ph * 500 + i * 20} cy={1600 - ph * 500} r={40 + ph * 120} fill={SMOG} opacity={0.25 * exhaust * (1 - ph)} filter="url(#blur12)" />;
        })}
      <Drift s={s} n={36} top={500} bottom={1600} seed={7} />
      {/* magnifier */}
      {lens > 0 && (
        <g opacity={lens}>
          <clipPath id="lensClip">
            <circle cx={lx} cy={ly} r={R} />
          </clipPath>
          <circle cx={lx} cy={ly} r={R} fill="#1E1018" opacity={0.85} />
          <g clipPath="url(#lensClip)">
            {/* giant hair strand */}
            <g opacity={hair} transform={`rotate(-24 ${lx} ${ly})`}>
              <rect x={lx - 900} y={ly - 120 - (1 - hair) * 200} width={1800} height={190} rx={95} fill="#4A2A22" />
              <rect x={lx - 900} y={ly - 100 - (1 - hair) * 200} width={1800} height={40} rx={20} fill="#8A5A44" opacity={0.6} />
              {Array.from({length: 14}).map((_, i) => (
                <path key={i} d={`M${lx - 860 + i * 130} ${ly - 120 - (1 - hair) * 200} l 40 190`} stroke="#2E1A16" strokeWidth={6} opacity={0.5} />
              ))}
            </g>
            {Array.from({length: 70}).map((_, i) => {
              const x = lx - R + rand(i * 3 + 1) * R * 2 + Math.sin(s + i) * 10;
              const y = ly - R + rand(i * 7 + 2) * R * 2 + Math.cos(s * 0.8 + i) * 10;
              const kk = i < 14 ? 1 : clamp(zoomIn * 1.6 - rand(i * 5) * 0.6);
              return kk > 0 ? <Particle key={i} x={x} y={y} r={(9 + rand(i) * 9) * kk} o={kk} /> : null;
            })}
            <circle cx={lx} cy={ly} r={R} fill={SMOG} opacity={0.12 * zoomIn} />
          </g>
          <circle cx={lx} cy={ly} r={R} fill="url(#lensG)" stroke={C.blush} strokeWidth={14} />
          <path d={`M${lx - R * 0.55} ${ly - R * 0.62} A ${R * 0.8} ${R * 0.8} 0 0 1 ${lx + R * 0.1} ${ly - R * 0.86}`} stroke="#fff" strokeWidth={10} fill="none" opacity={0.5} strokeLinecap="round" />
          <rect x={lx + R * 0.66} y={ly + R * 0.66} width={60} height={240} rx={26} fill={C.blush} transform={`rotate(-45 ${lx + R * 0.66} ${ly + R * 0.66})`} />
        </g>
      )}
      <g opacity={hair}>
        <text x={lx - 210} y={ly + R + 90} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.blush} letterSpacing={4}>
          ONE HAIR
        </text>
        <text x={lx + 160} y={ly + R + 90} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={SMOG} letterSpacing={4}>
          • PARTICLES
        </text>
      </g>
    </Svg>
  );
};

// =============== C: particles settle, slip into pores, spark rust-like stress ===============
const SURF = 820;
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tPores = cue('pores');
  const tSpark = cue('spark');
  const tRust = cue('rust');
  const push = 1.08 - 0.08 * ease(prog(s, t0 - 0.3, t0 + 1.5));
  const settle = ease(prog(s, t0 - 0.2, t0 + 1.4));
  const slip = ease(prog(s, tPores - 0.6, tPores + 0.6));
  const spark = ease(prog(s, tSpark - 0.3, tSpark + 0.5));
  const rust = ease(prog(s, tRust - 0.6, tRust + 0.8));
  const pores = [270, 810];
  const parts = Array.from({length: 20}).map((_, i) => {
    const p = pores[i % 2];
    const tx = p + (rand(i * 3) - 0.5) * 60;
    const ty = SURF + 60 + rand(i * 5) * 300;
    const sx = 80 + rand(i * 7) * 920;
    return {sx, tx, ty, inPore: i % 3 !== 0};
  });
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={SURF + 200} fill="url(#sky)" />
      <Skyline s={s} base={SURF - 10} lights={0.6} />
      <rect x={-50} y={SURF} width={W + 100} height={260} fill="url(#epi)" />
      <rect x={-50} y={SURF + 260} width={W + 100} height={H} fill="url(#derm)" />
      <text x={W / 2} y={SURF + 200} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.plum} letterSpacing={5} opacity={0.75}>
        SKIN
      </text>
      {/* dermis depth: fibers, capillary, bokeh */}
      {Array.from({length: 5}).map((_, i) => (
        <path key={i} d={`M-40 ${SURF + 520 + i * 90} q 135 -40 270 0 t 270 0 t 270 0 t 270 0`} stroke="#F2D7BE" strokeWidth={14} fill="none" opacity={0.35} />
      ))}
      <path d={`M-50 1760 C 300 1720, 700 1800, ${W + 50} 1740`} stroke="#E0384E" strokeWidth={40} fill="none" opacity={0.8} />
      <Bokeh s={s} n={14} top={SURF + 450} bottom={1800} seed={19} color={C.blush} o={0.4} />
      {/* pores (follicle openings) */}
      {pores.map((x, i) => (
        <g key={i}>
          <path d={`M${x - 70} ${SURF} Q ${x - 40} ${SURF + 40} ${x - 34} ${SURF + 420} L ${x + 34} ${SURF + 420} Q ${x + 40} ${SURF + 40} ${x + 70} ${SURF} Z`} fill="#7A3346" opacity={0.85} />
          <path d={`M${x - 70} ${SURF} Q ${x - 40} ${SURF + 40} ${x - 34} ${SURF + 420} L ${x + 34} ${SURF + 420} Q ${x + 40} ${SURF + 40} ${x + 70} ${SURF} Z`} fill={RUST} opacity={0.75 * rust} />
          <path d={`M${x - 70} ${SURF} Q ${x - 40} ${SURF + 40} ${x - 34} ${SURF + 420} L ${x + 34} ${SURF + 420} Q ${x + 40} ${SURF + 40} ${x + 70} ${SURF} Z`} fill="none" stroke="#FFB070" strokeWidth={6} opacity={rust} strokeDasharray="10 8" />
          <path d={`M${x} ${SURF + 430} L ${x + 10} ${SURF - 160}`} stroke="#4B2030" strokeWidth={8} />
          <text x={x} y={SURF + 480} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.white} letterSpacing={5} opacity={0.75 * slip}>
            PORE
          </text>
        </g>
      ))}
      {/* rust stress halos */}
      {parts.map((p, i) => {
        const m = p.inPore ? slip : 0;
        const fall = easeOut(clamp(settle * 1.5 - rand(i) * 0.5));
        const x = p.sx + (p.tx - p.sx) * m;
        const y0 = 420 + rand(i * 9) * 200;
        const ySurf = SURF - 8;
        const y = (y0 + (ySurf - y0) * fall) + (p.ty - ySurf) * (p.inPore ? m : 0);
        const halo = clamp(spark * 1.4 - rand(i * 11) * 0.4);
        return (
          <g key={i}>
            {halo > 0 && <circle cx={x} cy={y} r={(40 + 70 * rust) * halo + 6 * Math.sin(s * 6 + i)} fill="url(#rustG)" opacity={halo * (0.6 + 0.4 * rust)} />}
            <Particle x={x} y={y} r={13} o={clamp(fall * 2)} />
          </g>
        );
      })}
      {/* rust texture creeping into the surface */}
      {rust > 0 &&
        Array.from({length: 30}).map((_, i) => {
          const x = 60 + rand(i * 19) * 960;
          const y = SURF + 10 + rand(i * 23) * 230;
          return <circle key={i} cx={x} cy={y} r={(6 + rand(i) * 14) * rust} fill={RUST} opacity={0.35 * rust} filter="url(#blur4)" />;
        })}
      <Pill x={W / 2} y={1500} k={rust} text="OXIDATIVE STRESS" color={RUST} size={36} />
      <text x={W / 2} y={1690} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={22} fill={C.white} opacity={0.65}>
        Bouchard & Costin, Front Toxicol, 2023 · lab studies · illustrative
      </text>
    </Svg>
  );
};

// =============== D: stress wakes pigment cells → melanin → dark spot ===============
const MELS = [180, 420, 660, 900];
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const tPig = cue('pigment');
  const tColor = cue('color');
  const tSpots = cue('spots', 3);
  const push = 1.04 + 0.06 * ease(prog(s, t0, S(4)));
  const wake = ease(prog(s, tPig - 0.4, tPig + 0.5));
  const mel = prog(s, tColor - 0.3, tSpots + 0.3);
  const spot = ease(prog(s, tSpots - 0.5, tSpots + 0.6));
  const base = 1280;
  const surf = 760;
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={surf + 200} fill="url(#sky)" />
      <Bokeh s={s} n={14} top={430} bottom={surf} seed={41} color={C.goldHot} o={0.45} />
      <rect x={-50} y={surf} width={W + 100} height={base - surf + 30} fill="url(#epi)" />
      <rect x={-50} y={base + 30} width={W + 100} height={H} fill="url(#derm)" />
      {/* skin cells (keratinocytes) */}
      {Array.from({length: 6}).map((_, r) =>
        Array.from({length: 8}).map((__, c) => {
          const x = -40 + c * 160 + (r % 2) * 80;
          const y = surf + 30 + r * 82;
          return <rect key={`${r}-${c}`} x={x} y={y} width={146} height={70} rx={30} fill="#F6D9D7" stroke="#D9A3AA" strokeWidth={2} opacity={0.85} />;
        }),
      )}
      {/* rust stress lingering on top */}
      {Array.from({length: 8}).map((_, i) => (
        <circle key={i} cx={100 + i * 130} cy={surf - 6} r={36 + 8 * Math.sin(s * 3 + i)} fill="url(#rustG)" opacity={0.45 * (1 - spot)} />
      ))}
      {Array.from({length: 4}).map((_, i) => (
        <path key={i} d={`M-40 ${base + 200 + i * 100} q 135 -40 270 0 t 270 0 t 270 0 t 270 0`} stroke="#F2D7BE" strokeWidth={14} fill="none" opacity={0.3} />
      ))}
      <path d={`M-50 1720 C 300 1680, 700 1760, ${W + 50} 1700`} stroke="#E0384E" strokeWidth={40} fill="none" opacity={0.8} />
      <circle cx={W / 2} cy={base} r={500} fill={C.goldHot} opacity={0.08 * wake} filter="url(#blur30)" />
      <text x={W / 2} y={1800} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={22} fill={C.white} opacity={0.65}>
        Bouchard & Costin, Front Toxicol, 2023 · lab studies · illustrative
      </text>
      {/* melanocytes at the base */}
      {MELS.map((x, i) => {
        const g = wake * (0.6 + 0.4 * Math.sin(s * 5 + i));
        return (
          <g key={i} transform={`translate(${x} ${base})`}>
            <circle r={110} fill={C.goldHot} opacity={0.18 * g} filter="url(#blur12)" />
            {[-150, -110, -70, -30, 20].map((a, j) => (
              <path key={j} d={`M0 0 Q ${Math.cos((a * Math.PI) / 180) * 50} ${Math.sin((a * Math.PI) / 180) * 50 - 20} ${Math.cos((a * Math.PI) / 180) * 110} ${Math.sin((a * Math.PI) / 180) * 110}`} stroke={MEL} strokeWidth={14} strokeLinecap="round" fill="none" />
            ))}
            <ellipse rx={56} ry={40} fill="url(#melG)" />
            <circle r={16} fill="#4A2A1C" />
          </g>
        );
      })}
      <text x={W / 2} y={base + 110} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.white} letterSpacing={5} opacity={0.85 * wake}>
        PIGMENT CELLS
      </text>
      {/* melanin granules rising and gathering under one spot */}
      {Array.from({length: 40}).map((_, i) => {
        const src = MELS[i % 4];
        const k = clamp(mel * 1.6 - rand(i * 3) * 0.6);
        if (k <= 0) return null;
        const tx = 540 + (rand(i * 7) - 0.5) * 220 * (1 - spot * 0.4);
        const ty = surf + 40 + rand(i * 5) * 120;
        const x = src + (tx - src) * easeOut(k);
        const y = base - 40 + (ty - base + 40) * easeOut(k);
        return <circle key={i} cx={x} cy={y} r={9 + rand(i) * 5} fill={MEL} opacity={0.9} />;
      })}
      {/* the visible dark spot at the surface */}
      <ellipse cx={540} cy={surf + 4} rx={170 * spot} ry={22 * spot} fill="#5A3020" opacity={0.75 * spot} filter="url(#blur4)" />
      <Pill x={540} y={surf - 120} k={spot} text="DARK SPOT" color={C.blush} size={34} />
    </Svg>
  );
};

// =============== E: the study — more soot, more spots ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const t400 = cue('400');
  const tSoot = cue('soot');
  const tPct = cue('20%');
  const tCheeks = cue('cheeks');
  const push = 1 + 0.05 * ease(prog(s, t0, S(5)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const popK = ease(prog(s, t400 - 0.3, t400 + 0.4));
  const step = ease(prog(s, tSoot - 0.3, tSoot + 0.5));
  const extra = ease(prog(s, tPct - 0.2, tCheeks + 0.3));
  const badge = ease(prog(s, tPct - 0.15, tPct + 0.3));
  const base = Array.from({length: 10}).map((_, i) => ({x: (rand(i * 3 + 5) - 0.5) * 230, y: (rand(i * 7 + 1) - 0.5) * 200}));
  const more = [
    {x: -70, y: 75},
    {x: 85, y: -55},
  ];
  const cheek = (cx: number, label: string, sootLvl: number, extraK: number, hl: number) => (
    <g transform={`translate(${cx} 1060)`} opacity={inK}>
      <rect x={-225} y={-330} width={450} height={620} rx={36} fill="rgba(238,221,226,0.07)" stroke={hl > 0 ? C.white : 'rgba(238,221,226,0.3)'} strokeWidth={hl > 0 ? 5 : 3} />
      <text y={-262} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={36} fill={C.white}>
        {label}
      </text>
      {/* soot meter */}
      <g transform="translate(0 -200)">
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={-120 + j * 62} y={-14} width={52} height={28} rx={10} fill={j < sootLvl ? '#4A3E52' : 'rgba(238,221,226,0.12)'} stroke={j < sootLvl ? SMOG : 'none'} strokeWidth={2} />
        ))}
        <text x={0} y={52} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={SMOG} letterSpacing={4}>
          SOOT IN THE AIR
        </text>
      </g>
      {/* cheek */}
      <ellipse cx={0} cy={60} rx={170} ry={150} fill="url(#patchSkin)" />
      <ellipse cx={-40} cy={20} rx={60} ry={30} fill="#fff" opacity={0.2} />
      {base.map((p, i) => (
        <ellipse key={i} cx={p.x * 0.6} cy={60 + p.y * 0.55} rx={10} ry={8} fill={MEL} opacity={0.75} />
      ))}
      {more.map((p, i) => (
        <g key={i}>
          <ellipse cx={p.x} cy={60 + p.y} rx={13 * extraK} ry={10 * extraK} fill={MEL} opacity={0.9} />
          {extraK > 0.05 && <circle cx={p.x} cy={60 + p.y} r={30} fill="none" stroke={C.goldHot} strokeWidth={4} opacity={extraK * (0.6 + 0.4 * Math.sin(s * 6))} />}
        </g>
      ))}
      <text y={260} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={3} opacity={0.8}>
        DARK SPOTS · CHEEK
      </text>
    </g>
  );
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <defs>
        <radialGradient id="patchSkin" cx="0.5" cy="0.45">
          <stop offset="0" stopColor="#F6D7D3" />
          <stop offset="1" stopColor="#D99AA2" />
        </radialGradient>
      </defs>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} o={0.5} />
      <Pill x={W / 2} y={590} k={popK} text="400 women · Germany" color={C.blush} size={32} />
      {cheek(290, 'Less soot', 1, 0, 0)}
      {cheek(790, 'One step more', 1 + step, extra, badge)}
      <Pill x={790} y={1470} k={badge} text="+20%" sub="DARK SPOTS" color={C.plum} fill={C.blush} size={54} w={290} />
      <text x={W / 2} y={1660} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={21} fill={C.blush} opacity={0.55 * inK}>
        Vierkötter et al., J Invest Dermatol, 2010 · per interquartile step in soot · illustrative faces
      </text>
    </Svg>
  );
};

// =============== F: a link, not proof — the clearest signal is spots ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tLink = cue('link');
  const tProof = cue('proof');
  const t70 = cue('70');
  const tClear = cue('clearest');
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(6)));
  const linkK = ease(prog(s, tLink - 0.4, tLink + 0.3));
  const proofK = ease(prog(s, tProof - 0.2, tProof + 0.3));
  const ageK = ease(prog(s, t70 - 0.3, t70 + 0.3)) * 0 + ease(prog(s, tProof, tProof + 0.6));
  const barIn = ease(prog(s, t0 + 0.3, t0 + 1.2));
  const barK = ease(prog(s, tClear - 1.0, tClear + 0.4));
  const iconY = 760;
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={61} o={0.5} />
      {/* soot ---- spots, dashed link */}
      <g opacity={linkK}>
        <g transform={`translate(240 ${iconY})`}>
          <circle r={105} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
          {Array.from({length: 7}).map((_, i) => (
            <Particle key={i} x={(rand(i * 3) - 0.5) * 110} y={(rand(i * 5) - 0.5) * 110} r={14 + rand(i) * 8} />
          ))}
          <text y={150} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={SMOG} letterSpacing={4}>
            SOOT
          </text>
        </g>
        <g transform={`translate(840 ${iconY})`}>
          <circle r={105} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
          <circle r={70} fill="url(#patchSkin2)" />
          {[
            [-20, -10],
            [24, 18],
            [6, -30],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx={11} ry={9} fill={MEL} />
          ))}
          <text y={150} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={4}>
            SPOTS
          </text>
        </g>
        <line x1={360} y1={iconY} x2={360 + 360 * linkK} y2={iconY} stroke={C.blush} strokeWidth={8} strokeDasharray="22 16" strokeLinecap="round" />
        <text x={540} y={iconY - 30} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.blush} letterSpacing={4}>
          LINK
        </text>
      </g>
      {/* not proof stamp */}
      {proofK > 0 && (
        <g transform={`translate(540 ${iconY + 50}) rotate(-10) scale(${1.5 - 0.5 * proofK})`} opacity={proofK}>
          <rect x={-180} y={-46} width={360} height={92} rx={18} fill="rgba(23,10,16,0.55)" stroke={C.uvb} strokeWidth={7} />
          <text y={16} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={44} fill={C.uvb} letterSpacing={6}>
            NOT PROOF
          </text>
        </g>
      )}
      <Pill x={W / 2} y={1020} k={ageK} text="women aged 70–80" color={C.blush} size={32} />
      {/* signals */}
      <g opacity={Math.max(barIn * 0.6, barK)}>
        <text x={W / 2} y={1150} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={5} opacity={0.8}>
          LINK TO SOOT IN THE STUDY
        </text>
        {[
          {label: 'Dark spots', v: 1, col: C.goldHot},
          {label: 'Wrinkles', v: 0.32, col: 'rgba(238,221,226,0.45)'},
        ].map((b, i) => (
          <g key={i} transform={`translate(150 ${1210 + i * 130})`}>
            <text x={0} y={0} fontFamily="Poppins" fontWeight={700} fontSize={32} fill={C.white}>
              {b.label}
            </text>
            <rect x={0} y={22} width={780} height={46} rx={23} fill="rgba(238,221,226,0.08)" />
            <rect x={0} y={22} width={Math.max(46, 780 * b.v * (0.15 + 0.85 * barK))} height={46} rx={23} fill={b.col} />
            {i === 0 && <rect x={0} y={22} width={780 * barK} height={46} rx={23} fill={b.col} opacity={0.4} filter="url(#blur12)" />}
          </g>
        ))}
      </g>
      <defs>
        <radialGradient id="patchSkin2" cx="0.5" cy="0.45">
          <stop offset="0" stopColor="#F6D7D3" />
          <stop offset="1" stopColor="#D99AA2" />
        </radialGradient>
      </defs>
      <text x={W / 2} y={1660} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={21} fill={C.blush} opacity={0.55 * linkK}>
        Vierkötter et al., 2010 · observational · bars illustrative: spots strong, wrinkles weaker
      </text>
    </Svg>
  );
};

// =============== G: wash it off at night, sunscreen in the morning ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tNight = cue('night');
  const tSun = cue('sunscreen');
  const tSunlight = cue('sunlight');
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const wash = ease(prog(s, t0 + 0.3, tNight + 0.8));
  const film = ease(prog(s, tSun - 0.3, tSun + 0.8));
  const sunK = ease(prog(s, tSunlight - 0.3, tSunlight + 0.4));
  const item = (x: number, t: number, label: string, children: React.ReactNode) => {
    const k = ease(prog(s, t - 0.35, t + 0.25));
    return (
      <g transform={`translate(${x} 720) scale(${1.25 * (0.85 + 0.15 * k)})`} opacity={k}>
        <circle r={115} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
        {children}
        <text y={165} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={3}>
          {label}
        </text>
      </g>
    );
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={71} o={0.6} color={C.goldHot} />
      <g transform="translate(0 320)">
        <SkinPlane s={s} fx={{film, filmSheen: prog(s, tSun, tSun + 2.5), dull: 0.35 * (1 - wash)}} />
      </g>
      {/* sunlight beam on "sunlight" */}
      {sunK > 0 && (
        <g opacity={sunK}>
          <circle cx={880} cy={1020} r={120} fill="url(#sunGlow)" />
          <circle cx={880} cy={1020} r={56} fill={C.goldHot} />
          <path d={`M840 1050 L 380 1500 L 560 1560 L 920 1070 Z`} fill={C.goldHot} opacity={0.25} filter="url(#blur12)" />
          <ellipse cx={470} cy={1540} rx={70 * sunK} ry={26 * sunK} fill="#7A4A32" opacity={0.5 * sunK * (1 - film * 0.6)} filter="url(#blur4)" />
        </g>
      )}
      {/* particles on the skin, rinsed away */}
      {Array.from({length: 24}).map((_, i) => {
        const x = 100 + rand(i * 13) * 880;
        const y = 1350 + rand(i * 17) * 480;
        const k = clamp(wash * 1.6 - rand(i * 5) * 0.6);
        return <Particle key={i} x={x + k * 60} y={y + k * 300} r={6 + rand(i) * 9} o={0.75 * (1 - k)} />;
      })}
      {wash > 0 &&
        wash < 1 &&
        Array.from({length: 24}).map((_, i) => {
          const x = 80 + rand(i * 3) * 920;
          const y = 1320 + rand(i * 9) * 420 - 10 * Math.sin(s * 2 + i);
          const r = 16 + rand(i * 7) * 28;
          return <circle key={i} cx={x} cy={y} r={r * Math.sin(wash * Math.PI)} fill="#F7F3F5" opacity={0.6} stroke="#fff" strokeWidth={2} />;
        })}
      {item(
        300,
        tNight - 0.4,
        'WASH · EVERY NIGHT',
        <g>
          <g transform="translate(-22 -18)">
            <circle r={62} fill={C.moon} opacity={0.3} filter="url(#blur12)" />
            <circle r={44} fill="#FFF6E2" />
            <circle cx={22} cy={-14} r={38} fill="#2B1620" />
          </g>
          <path d="M0 -34 C 14 -12, 26 2, 26 16 a 26 26 0 0 1 -52 0 c 0 -14 12 -28 26 -50 Z" fill={C.water} transform="translate(36 22)" />
        </g>,
      )}
      {item(
        780,
        tSun,
        'SPF · EVERY MORNING',
        <g>
          <circle cx={-28} cy={-28} r={34} fill={C.goldHot} opacity={0.5 + 0.5 * sunK} />
          <g transform="translate(20 10) rotate(-12)">
            <path d="M -30 -52 L 30 -52 L 26 40 L -26 40 Z" fill={C.blush} />
            <rect x={-16} y={40} width={32} height={18} rx={5} fill={C.plum} />
            <text y={0} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={20} fill={C.plum}>
              SPF
            </text>
          </g>
        </g>,
      )}
    </Svg>
  );
};

// =============== H: loop (city + skin) + scan + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tTrace = cue('trace');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tTrace - 0.2, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tTrace, tTrace + 1)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1250)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Bokeh s={s} top={200} bottom={HORIZON} seed={5} color={C.goldHot} o={0.5} />
        <Skyline s={s} base={HORIZON + 10} />
        <SkinPlane s={s} fx={{scan, dull: 0.2}} />
        {Array.from({length: 26}).map((_, i) => {
          const x = 120 + rand(i * 13) * 840;
          const y = 1150 + rand(i * 17) * 650;
          return <Particle key={i} x={x} y={y} r={5 + rand(i) * 9} o={0.45} />;
        })}
        <Drift s={s} n={30} top={500} bottom={1700} seed={3} />
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

// standard Glowi end card (same as the examples)
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

// ---- wiring read by Main.tsx: scene components in order + their start times (last entry = video end) ----
export const SCENES: React.FC<{s: number}>[] = [SceneA, SceneB, SceneC, SceneD, SceneE, SceneF, SceneG, SceneH];
export const bounds = (end: number) => [0, S(1), S(2), S(3), S(4), S(5), S(6), S(7), end];
