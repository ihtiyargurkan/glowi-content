import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, Beam, wavePath, Tag, SkinPlane, Sun, Cloud, Glass, Fiber, coilPath, HORIZON} from './parts';
import {cue, cueAny, S, voEnd} from './timeline';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

// =============== A: hook — macro skin, then light ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tLight = cue('light', 1);
  const sunK = 0.22 + 0.78 * ease(prog(s, tLight - 0.3, tLight + 1.0));
  const push = 1 + 0.09 * ease(prog(s, 0, 7));
  const crease = ease(prog(s, cue('age?') - 0.2, cue('age?') + 0.8)) * (1 - ease(prog(s, cue('time.') , cue('time.') + 0.8)));
  // "time": faint clock ring that dissolves into light
  const tTime = cue('time.');
  const clockK = prog(s, tTime - 0.6, tTime) * (1 - prog(s, tLight - 0.2, tLight + 0.4));
  return (
    <Svg cam={camZoom(push, W / 2, 1300)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Sun x={W / 2} y={HORIZON - 40 - 260 * sunK} s={s} k={sunK} />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={3} />
      <SkinPlane s={s} fx={{crease, flush: 0.25 * sunK}} />
      {clockK > 0 && (
        <g opacity={clockK} transform={`translate(${W / 2} 650)`}>
          <circle r={170} fill="none" stroke={C.blush} strokeWidth={5} opacity={0.8} />
          {Array.from({length: 12}).map((_, i) => (
            <rect key={i} x={-3} y={-160} width={6} height={22} fill={C.blush} transform={`rotate(${i * 30})`} />
          ))}
          <rect x={-4} y={-110} width={8} height={110} rx={4} fill={C.blush} transform={`rotate(${s * 220})`} />
          <rect x={-3} y={-80} width={6} height={80} rx={3} fill={C.blush} transform={`rotate(${s * 30})`} />
        </g>
      )}
      <Bokeh s={s} top={HORIZON} bottom={H} n={14} seed={9} color={C.goldHot} o={0.5 * sunK} />
    </Svg>
  );
};

// =============== B: two kinds of UV, clouds, glass ===============
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tTwo = cue('two');
  const tUVB = cue('UVB');
  const tBurn = cue('burns');
  const tUVA = cue('UVA', 3);
  const t80 = cue('80%');
  const tCloud = cue('clouds');
  const tSlips = cue('slips');
  const tWindow = cue('window');
  const push = 1 + 0.05 * ease(prog(s, t0, S(4)));
  const sunX = W / 2;
  const sunY = 560;
  const groundY = 1520; // where beams land
  const beamsK = ease(prog(s, tTwo - 0.1, tTwo + 0.7));
  const uvbFocus = prog(s, tUVB - 0.1, tUVB + 0.3) * (1 - prog(s, tUVA - 0.2, tUVA + 0.3));
  const uvaFocus = prog(s, tUVA - 0.2, tUVA + 0.3);
  const flush = ease(prog(s, tBurn, tBurn + 0.5)) * (1 - prog(s, tUVA, tUVA + 1));
  const cloudK = ease(prog(s, tSlips - 0.6, tSlips + 0.4));
  const glassK = ease(prog(s, tWindow - 0.5, tWindow + 0.2));
  // beams
  const lenB = ease(prog(s, tTwo, tTwo + 0.9));
  const ph = s * 9;
  const uvbStop = glassK > 0 ? 1 - 0.42 * glassK : cloudK > 0 ? 1 - 0.0 : 1; // UVB blocked by glass
  const uvbD = wavePath(sunX - 70, sunY + 90, 330, groundY, 16, 34, ph, lenB * uvbStop);
  const uvaD = wavePath(sunX + 70, sunY + 90, 760, groundY, 26, 110, ph * 0.7, lenB);
  // counter
  const pct = Math.round(80 * easeOut(prog(s, t80 - 0.1, t80 + 0.7)));
  const pctK = ease(prog(s, t80 - 0.15, t80 + 0.25)) * (1 - prog(s, tWindow - 0.4, tWindow));
  return (
    <Svg cam={camZoom(push, W / 2, 900)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={0} bottom={1200} seed={5} o={0.8} />
      <Sun x={sunX} y={sunY} s={s} />
      <g transform="translate(0 420)">
        <SkinPlane s={s} fx={{flush}} />
      </g>
      {/* clouds */}
      <g opacity={cloudK}>
        <Cloud x={260 + s * 6} y={820} sc={1.05} />
        <Cloud x={820 - s * 5} y={760} sc={0.9} />
        <Cloud x={560 + s * 3} y={900} sc={0.8} o={0.9} />
      </g>
      {/* glass */}
      <g transform={`translate(${(1 - glassK) * 900} 0)`}>
        <Glass x={170} y={980} w={740} h={330} o={glassK} />
      </g>
      <Beam d={uvbD} color={C.uvb} o={beamsK * (0.35 + 0.65 * (1 - uvaFocus)) * (1 - 0.6 * cloudK * (1 - glassK))} w={7} />
      <Beam d={uvaD} color={C.uva} o={beamsK * (0.45 + 0.55 * (uvaFocus > 0 ? 1 : 1 - uvbFocus))} w={8} />
      {/* UVB bounce sparks at glass */}
      {glassK > 0.6 &&
        Array.from({length: 8}).map((_, i) => {
          const a = rand(i) * Math.PI - Math.PI;
          const k = ((s * 1.8 + rand(i * 3)) % 1);
          return <circle key={i} cx={470 + Math.cos(a) * 80 * k} cy={1000 + Math.sin(a) * 60 * k} r={6 * (1 - k)} fill={C.uvb} opacity={1 - k} />;
        })}
      <Tag x={250} y={1130 - 40 * glassK} text="UVB" color={C.uvb} o={beamsK * (0.5 + 0.5 * uvbFocus) * (1 - cloudK * 0.6) * (1 - pctK)} />
      <Tag x={860} y={1130 - 40 * glassK} text="UVA" color={C.uva} o={beamsK * (0.5 + 0.5 * uvaFocus) * (1 - pctK)} />
      {/* 80% badge */}
      {pctK > 0 && (
        <g opacity={pctK} transform={`translate(${W / 2} 1170) scale(${0.85 + 0.15 * pctK})`}>
          <rect x={-190} y={-88} width={380} height={150} rx={40} fill="rgba(23,10,16,0.62)" stroke={C.uva} strokeWidth={3} />
          <text x={0} y={30} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={104} fill={C.white}>
            {pct}%
          </text>
          <text x={0} y={100} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={26} fill={C.blush} letterSpacing={3}>
            PASSES LIGHT CLOUDS
          </text>
        </g>
      )}
    </Svg>
  );
};

// =============== C: dive into the skin (cross-section) ===============
const SURF = 640;
const EPI_B = 880;
const DERM_B = 1480;
const fibersC = Array.from({length: 9}).map((_, i) => ({
  y: EPI_B + 70 + i * 62 + rand(i) * 20,
  amp: 9 + rand(i * 2) * 8,
  wl: 70 + rand(i * 4) * 50,
  ph: rand(i * 6) * 6,
  x0: -40 + rand(i * 8) * 140,
  x1: W + 40 - rand(i * 10) * 160,
}));
export const CrossSection: React.FC<{s: number; uvaDepth: number; uvaK: number; uvbK: number; label: number; zoom?: number; hurt?: number}> = ({
  s,
  uvaDepth,
  uvaK,
  uvbK,
  label,
  hurt = 0,
}) => {
  const surf = (x: number) => SURF + Math.sin(x / 130 + 0.6) * 14;
  let surfD = `M-50 ${surf(-50)}`;
  for (let x = -50; x <= W + 50; x += 20) surfD += ` L${x} ${surf(x)}`;
  return (
    <g>
      <rect x={-200} y={-200} width={W + 400} height={SURF + 260} fill="url(#sky)" />
      <Sun x={W / 2} y={90} s={s} k={0.9} />
      <path d={`${surfD} L ${W + 50} ${EPI_B} L -50 ${EPI_B} Z`} fill="url(#epi)" />
      {/* epidermis cells */}
      {Array.from({length: 3}).map((_, r) =>
        Array.from({length: 11}).map((__, c) => {
          const x = c * 104 + (r % 2) * 52 - 20;
          const y = SURF + 60 + r * 62;
          return <rect key={`${r}-${c}`} x={x} y={y} width={92} height={46} rx={20} fill="#F7DCDC" stroke="#D69AA2" strokeWidth={2} opacity={0.75} />;
        }),
      )}
      <rect x={-50} y={EPI_B} width={W + 100} height={DERM_B - EPI_B} fill="url(#derm)" />
      {fibersC.map((f, i) => (
        <Fiber key={i} x0={f.x0} x1={f.x1} y={f.y} amp={f.amp} wl={f.wl} phase={f.ph + s * 0.8} w={14} o={0.95 - hurt * (i % 3 === 0 ? 0.6 : 0)} />
      ))}
      {/* vessel */}
      <path d={`M-50 ${DERM_B - 60} C 300 ${DERM_B - 120}, 700 ${DERM_B}, ${W + 50} ${DERM_B - 70}`} stroke="#E0384E" strokeWidth={36} fill="none" opacity={0.9} />
      <path d={`M-50 ${DERM_B - 68} C 300 ${DERM_B - 128}, 700 ${DERM_B - 8}, ${W + 50} ${DERM_B - 78}`} stroke="#FF8A96" strokeWidth={8} fill="none" opacity={0.7} />
      <rect x={-50} y={DERM_B} width={W + 100} height={H - DERM_B + 100} fill="url(#fatG)" />
      {Array.from({length: 16}).map((_, i) => (
        <circle key={i} cx={(i * 97 + rand(i) * 60) % (W + 60)} cy={DERM_B + 110 + rand(i * 3) * 300} r={50 + rand(i * 5) * 40} fill="url(#globule)" opacity={0.95} />
      ))}
      {/* labels */}
      <g fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.white} letterSpacing={5} opacity={0.75 * label}>
        <text x={56} y={SURF + 44}>EPIDERMIS</text>
        <text x={56} y={EPI_B + 44}>DERMIS · COLLAGEN</text>
      </g>
      {/* UVB stops at surface */}
      <Beam d={wavePath(330, 150, 330, SURF + 30, 14, 34, s * 9, 1)} color={C.uvb} o={uvbK} w={7} />
      {uvbK > 0 && <circle cx={330} cy={SURF + 20} r={40 + 8 * Math.sin(s * 9)} fill={C.uvb} opacity={0.35 * uvbK} filter="url(#blur12)" />}
      {/* UVA dives */}
      <Beam d={wavePath(720, 150, 720, 150 + (EPI_B + 330 - 150) * uvaDepth, 24, 110, s * 6, 1)} color={C.uva} o={uvaK} w={9} />
      {uvaK > 0 && uvaDepth > 0.9 && (
        <g>
          <circle cx={720} cy={EPI_B + 330} r={70 + 20 * Math.sin(s * 6)} fill={C.uva} opacity={0.45 * uvaK} filter="url(#blur30)" />
          <circle cx={720} cy={EPI_B + 330} r={16} fill="#fff" opacity={0.9 * uvaK} />
        </g>
      )}
    </g>
  );
};

export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tDives = cue('dives');
  const tCol = cue('collagen', 4);
  const k = ease(prog(s, t0 - 0.3, t0 + 0.5));
  const depth = ease(prog(s, tDives - 0.1, tCol + 0.2));
  const push = 1.18 - 0.18 * ease(prog(s, t0 - 0.3, t0 + 1.2)) + 0.08 * ease(prog(s, tCol, tCol + 1.5));
  return (
    <Svg cam={camZoom(push, 720, 1150)}>
      <CrossSection s={s} uvaDepth={depth} uvaK={k} uvbK={k * (1 - prog(s, tDives, tDives + 1))} label={ease(prog(s, tCol - 0.6, tCol))} />
      <Bokeh s={s} n={12} top={EPI_B} bottom={DERM_B} seed={21} color={C.goldHot} o={0.5} />
    </Svg>
  );
};

// =============== D: collagen springs snap, partial repair ===============
const fibersD = Array.from({length: 6}).map((_, i) => ({
  y: 760 + i * 150 + rand(i * 3) * 30,
  amp: 26 + rand(i) * 10,
  wl: 120 + rand(i * 7) * 50,
  ph: rand(i * 9) * 6,
  cut: 0.3 + rand(i * 11) * 0.4,
}));
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tSpring = cue('spring');
  const tSnap = cue('snaps');
  const tFiber = cue('Fiber');
  const tRep = cue('repairs');
  const tNot = cue('not', 6);
  const push = 1.04 + 0.06 * ease(prog(s, t0, cue('gaps')));
  // breaking order & times
  const breakT = [tSnap, tFiber, tFiber + 0.25, tFiber + 0.5, tSnap + 0.35, tFiber + 0.75];
  const repaired = [true, false, true, false, true, false];
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#derm)" />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} opacity={0.35} />
      <Bokeh s={s} n={20} seed={33} color={C.blush} o={0.6} />
      {fibersD.map((f, i) => {
        // spring bounce on "spring"
        const bounce = Math.sin((s - tSpring) * 7) * Math.exp(-Math.max(0, s - tSpring) * 1.8) * (s > tSpring ? 1 : 0);
        const amp = f.amp * (1 + 0.5 * bounce);
        const b = ease(prog(s, breakT[i], breakT[i] + 0.35));
        const healK = repaired[i] ? ease(prog(s, tRep + i * 0.12, tRep + 0.7 + i * 0.12)) : 0;
        const gap = 90 * b * (1 - healK);
        const cx = f.cut * W;
        const ph = f.ph + s * 1.2;
        const sag = 30 * b * (1 - healK);
        const brokenPulse = !repaired[i] && s > tNot ? 0.5 + 0.5 * Math.sin((s - tNot) * 8) : 0;
        return (
          <g key={i}>
            <g transform={`translate(${-gap / 2} ${sag * 0.4}) rotate(${-4 * b * (1 - healK)} ${cx} ${f.y})`}>
              <Fiber x0={-60} x1={cx} y={f.y} amp={amp} wl={f.wl} phase={ph} w={30} />
            </g>
            <g transform={`translate(${gap / 2} ${sag}) rotate(${5 * b * (1 - healK)} ${cx} ${f.y})`}>
              <Fiber x0={cx} x1={W + 60} y={f.y} amp={amp} wl={f.wl} phase={ph + ((cx + 60) / f.wl) * Math.PI * 2 * 0} w={30} />
            </g>
            {/* snap sparks */}
            {b > 0 && b < 1 &&
              Array.from({length: 10}).map((_, j) => {
                const a = rand(i * 20 + j) * Math.PI * 2;
                const r = 30 + 120 * b;
                return <circle key={j} cx={cx + Math.cos(a) * r} cy={f.y + Math.sin(a) * r} r={7 * (1 - b)} fill={C.uva} />;
              })}
            {/* repair glow */}
            {healK > 0 && healK < 1 && <circle cx={cx} cy={f.y} r={60 + 40 * healK} fill={C.goldHot} opacity={0.6 * (1 - healK)} filter="url(#blur12)" />}
            {repaired[i] && healK >= 1 && s < tNot + 2 && <circle cx={cx} cy={f.y} r={26} fill={C.goldHot} opacity={0.25} filter="url(#blur12)" />}
            {brokenPulse > 0 && b >= 1 && (
              <g>
                <circle cx={cx} cy={f.y + sag * 0.7} r={46} fill="none" stroke={C.uvb} strokeWidth={4} opacity={0.4 + 0.5 * brokenPulse} />
              </g>
            )}
          </g>
        );
      })}
      {/* UVA beam slicing in on snaps */}
      <Beam
        d={wavePath(W / 2 + 60, -100, W / 2 - 40, 1900, 30, 130, s * 7, 1)}
        color={C.uva}
        o={ease(prog(s, tSnap - 0.6, tSnap)) * (1 - prog(s, tRep - 0.4, tRep))}
        w={10}
      />
    </Svg>
  );
};

// =============== E: the gaps add up on the surface ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = cue('gaps');
  const crease = ease(prog(s, cue('Fine') - 0.1, cue('Fine') + 0.7));
  const spots = ease(prog(s, cue('dark') - 0.1, cue('dark') + 0.8));
  const dull = ease(prog(s, cue('dull') - 0.1, cue('dull') + 0.8));
  const push = 1.12 - 0.1 * ease(prog(s, t0 - 0.3, t0 + 1.2)) + 0.05 * ease(prog(s, t0 + 1.2, S(7)));
  return (
    <Svg cam={camZoom(push, W / 2, 1350)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={41} o={0.7 * (1 - dull * 0.5)} />
      <Sun x={W / 2} y={HORIZON - 300} s={s} k={0.5} />
      <SkinPlane s={s} fx={{crease, spots, dull}} />
    </Svg>
  );
};

// =============== F: the study ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tSun = cue('sunscreen');
  const tFour = cueAny(['four', '4.5']);
  const t24 = cue('24%');
  const inK = ease(prog(s, t0 - 0.2, t0 + 0.6));
  const years = ease(prog(s, tFour - 0.2, cue('showed')));
  const meterL = 0.32 + 0.12 * years; // daily sunscreen
  const meterR = 0.32 + 0.48 * years; // occasional
  const badge = ease(prog(s, t24 - 0.15, t24 + 0.3));
  const val = Math.round(24 * easeOut(prog(s, t24 - 0.1, t24 + 0.8)));
  const push = 1 + 0.05 * ease(prog(s, t0, S(8)));
  const card = (x: number, title: string, meter: number, shield: boolean, delay: number) => {
    const k = ease(prog(s, t0 + delay, t0 + delay + 0.6));
    return (
      <g transform={`translate(${x} ${820 + (1 - k) * 80})`} opacity={k}>
        <rect x={-210} y={-200} width={420} height={760} rx={44} fill="rgba(238,221,226,0.08)" stroke="rgba(238,221,226,0.35)" strokeWidth={2.5} />
        <text x={0} y={-130} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white}>
          {title}
        </text>
        {/* skin swatch */}
        <clipPath id={`sw${x}`}>
          <circle cx={0} cy={80} r={150} />
        </clipPath>
        <g clipPath={`url(#sw${x})`}>
          <rect x={-160} y={-80} width={320} height={320} fill={shield ? '#F2CCCB' : '#D9A3A2'} />
          {Array.from({length: 7}).map((_, i) => (
            <path
              key={i}
              d={`M-160 ${-20 + i * 46} C -60 ${-40 + i * 46 + (shield ? 0 : 18) * years}, 60 ${i * 46}, 160 ${-30 + i * 46}`}
              stroke={shield ? '#D9A0A6' : '#9A5462'}
              strokeWidth={shield ? 2 : 2 + 4 * years}
              fill="none"
              opacity={0.7}
            />
          ))}
          {!shield &&
            [
              [-50, 40, 34],
              [60, 130, 26],
              [40, -10, 20],
            ].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r * years} fill="url(#spotG)" />)}
          {shield && <rect x={-160} y={-80} width={320} height={320} fill="#fff" opacity={0.12} />}
        </g>
        <circle cx={0} cy={80} r={150} fill="none" stroke={shield ? C.blush : 'rgba(238,221,226,0.4)'} strokeWidth={4} />
        {/* aging meter */}
        <text x={-170} y={330} fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={3} opacity={0.8}>
          SKIN AGING
        </text>
        <rect x={-170} y={350} width={340} height={22} rx={11} fill="rgba(255,255,255,0.12)" />
        <rect x={-170} y={350} width={340 * meter} height={22} rx={11} fill={shield ? C.blush : C.uvb} />
      </g>
    );
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={900} r={800} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} o={0.6} />
      {/* timeline */}
      <g opacity={inK} transform="translate(0 0)">
        <rect x={160} y={500} width={760} height={10} rx={5} fill="rgba(255,255,255,0.15)" />
        <rect x={160} y={500} width={760 * years} height={10} rx={5} fill={C.gold} />
        <circle cx={160 + 760 * years} cy={505} r={16} fill={C.goldHot} />
        <text x={W / 2} y={460} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={40} fill={C.white}>
          {(4.5 * years).toFixed(1)} years
        </text>
      </g>
      {card(300, 'Daily SPF', meterL, true, 0.3)}
      {card(780, 'Now & then', meterR, false, 0.5)}
      {/* -24% badge */}
      {badge > 0 && (
        <g transform={`translate(300 1490) scale(${0.7 + 0.3 * badge})`} opacity={badge}>
          <rect x={-170} y={-70} width={340} height={124} rx={62} fill={C.blush} />
          <text x={0} y={20} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={70} fill={C.plum}>
            −{val}%
          </text>
          <text x={0} y={100} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={3}>
            LESS AGING
          </text>
        </g>
      )}
      <text x={W / 2} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.5 * inK}>
        Hughes et al., Annals of Internal Medicine, 2013 · 903 adults
      </text>
    </Svg>
  );
};

// =============== G: the boring fix — sunscreen film ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(8);
  const tBroad = cue('Broad-spectrum');
  const tSpf = cue('SPF 30+');
  const tMorning = cue('morning,');
  const tCloudy = cue('cloudy');
  const film = ease(prog(s, tBroad - 0.2, tBroad + 1.2));
  const sheen = prog(s, tSpf, tSpf + 1.6);
  const tubeK = ease(prog(s, t0 + 0.2, t0 + 0.9)) * (1 - ease(prog(s, tBroad + 0.6, tBroad + 1.2)));
  const morningK = ease(prog(s, tMorning - 0.4, tMorning + 0.6));
  const cloudK = ease(prog(s, tCloudy - 0.3, tCloudy + 0.5));
  const push = 1.06 - 0.06 * ease(prog(s, t0, S(9)));
  const groundY = 1450;
  const ph = s * 9;
  // beams that bounce off the film
  const lenIn = ease(prog(s, tBroad + 0.4, tBroad + 1.2));
  return (
    <Svg cam={camZoom(push, W / 2, 1200)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Sun x={W / 2} y={620 + 120 * (1 - morningK)} s={s} k={0.6 + 0.4 * morningK} />
      <Bokeh s={s} top={0} bottom={1100} seed={61} o={0.7} />
      <g opacity={cloudK}>
        <Cloud x={300 + s * 5} y={700} sc={0.9} />
        <Cloud x={800 - s * 4} y={640} sc={0.75} />
      </g>
      <g transform="translate(0 340)">
        <SkinPlane s={s} fx={{film, filmSheen: sheen}} />
      </g>
      {/* beams hitting the film and scattering */}
      {[
        [C.uvb, 330, 16, 34],
        [C.uva, 750, 24, 110],
      ].map(([col, x, amp, wl], i) => {
        const xx = x as number;
        const d = wavePath(W / 2 + (i ? 60 : -60), 720, xx, groundY - 40, amp as number, wl as number, ph * (i ? 0.7 : 1), lenIn);
        const bounce = prog(s, tBroad + 1.2, tBroad + 2.0);
        const d2 = wavePath(xx, groundY - 40, xx + (i ? 360 : -360), groundY - 520, (amp as number) * 0.7, wl as number, ph, ease(bounce));
        return (
          <g key={i}>
            <Beam d={d} color={col as string} o={0.85 * lenIn} w={7} />
            {bounce > 0 && <Beam d={d2} color={col as string} o={0.6 * (1 - prog(s, tCloudy + 0.6, tCloudy + 1.4))} w={6} />}
            {lenIn >= 1 && <circle cx={xx} cy={groundY - 40} r={30 + 6 * Math.sin(s * 12 + i)} fill="#fff" opacity={0.6} filter="url(#blur12)" />}
          </g>
        );
      })}
      {/* sunscreen tube */}
      {tubeK > 0 && (
        <g transform={`translate(${W / 2} ${980 - 60 * tubeK}) rotate(-18)`} opacity={tubeK}>
          <path d="M -110 -260 L 110 -260 L 90 150 L -90 150 Z" fill={C.blush} />
          <path d="M -110 -260 L 110 -260 L 104 -230 L -104 -230 Z" fill="#fff" opacity={0.7} />
          <rect x={-60} y={150} width={120} height={70} rx={14} fill={C.plum} />
          <rect x={-100} y={-200} width={30} height={300} rx={15} fill="#fff" opacity={0.35} />
          <text x={0} y={-60} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={54} fill={C.plum}>
            SPF
          </text>
          <text x={0} y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={64} fill={C.plum}>
            30+
          </text>
        </g>
      )}
    </Svg>
  );
};

// =============== H: loop back + Glowi ===============
export const SceneH: React.FC<{s: number; end: number}> = ({s, end}) => {
  const t0 = S(9);
  const tRec = cue('record');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tRec - 0.2, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const mesh = ease(prog(s, tRec, tRec + 1.2)) * (1 - cardK);
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1300)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Sun x={W / 2} y={HORIZON - 300} s={s} k={0.7} />
        <Bokeh s={s} top={200} bottom={HORIZON} seed={3} />
        <SkinPlane s={s} fx={{scan, crease: 0.0}} />
        {/* glowi analysis mesh */}
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
      {/* end card */}
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
            <div
              style={{
                position: 'absolute',
                inset: -60,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(238,221,226,0.35) 0%, rgba(238,221,226,0) 65%)',
              }}
            />
            {/* scan ring */}
            <svg width={560} height={560} viewBox="0 0 560 560" style={{position: 'absolute', left: -70, top: -45}}>
              <circle cx={280} cy={280} r={262} fill="none" stroke={C.blush} strokeWidth={3} opacity={0.35} />
              <circle
                cx={280}
                cy={280}
                r={262}
                fill="none"
                stroke={C.blush}
                strokeWidth={5}
                strokeDasharray="300 1346"
                strokeLinecap="round"
                transform={`rotate(${(s - tGlowi) * 140} 280 280)`}
              />
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
          <div
            style={{
              marginTop: 18,
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: 36,
              color: C.blush,
              opacity: 0.85 * ease(prog(s, tGlowi + 0.7, tGlowi + 1.4)),
              letterSpacing: 1,
            }}
          >
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

export {voEnd};
