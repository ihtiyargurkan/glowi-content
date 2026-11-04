import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, Beam, wavePath, HORIZON} from './parts';
import {cue, S} from './timeline';

// accent for this topic: lilac = the collagen/elastic support ring
const LIL = C.uva;

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <radialGradient id="poreHole" cx="0.5" cy="0.42">
        <stop offset="0" stopColor="#2A0F18" />
        <stop offset="0.55" stopColor="#5E2735" />
        <stop offset="0.85" stopColor="#A85C6C" />
        <stop offset="1" stopColor="#D99AA2" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="macroSkin" cx="0.5" cy="0.4">
        <stop offset="0" stopColor="#F3CFCB" />
        <stop offset="1" stopColor="#D38E98" />
      </radialGradient>
      <radialGradient id="glare" cx="0.4" cy="0.35">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="0.5" stopColor="#FFF4D6" stopOpacity="0.45" />
        <stop offset="1" stopColor="#FFF4D6" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="lilGlow">
        <stop offset="0" stopColor={LIL} stopOpacity="0.5" />
        <stop offset="1" stopColor={LIL} stopOpacity="0" />
      </radialGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

// ---------- a pore seen from above: rx/ry = opening, rim shading ----------
const Pore: React.FC<{x: number; y: number; rx: number; ry: number; o?: number; rot?: number}> = ({x, y, rx, ry, o = 1, rot = 0}) => (
  <g opacity={o} transform={`rotate(${rot} ${x} ${y})`}>
    <ellipse cx={x} cy={y + ry * 0.12} rx={rx * 1.45} ry={ry * 1.45} fill="#B9737F" opacity={0.35} filter="url(#blur4)" />
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#poreHole)" />
    <path d={`M${x - rx * 0.9} ${y + ry * 0.35} Q ${x} ${y + ry * 1.05} ${x + rx * 0.9} ${y + ry * 0.35}`} stroke="#FBE3E0" strokeWidth={Math.max(2, rx * 0.08)} fill="none" opacity={0.6} strokeLinecap="round" />
  </g>
);

// coiled ring of springs around a pore
const SpringRing: React.FC<{x: number; y: number; rx: number; ry: number; loose: number; s: number; o?: number; bounce?: number}> = ({x, y, rx, ry, loose, s, o = 1, bounce = 0}) => {
  const n = 220;
  let d = '';
  const coils = 22;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const amp = 16 + 22 * loose + bounce * 10 * Math.sin(s * 14);
    const wob = Math.sin(t * coils) * amp * (1 - 0.6 * loose * (0.5 + 0.5 * Math.sin(t * 3 + 1)));
    const R1 = 1 + loose * 0.1 * Math.sin(t * 2 + s);
    const px = x + Math.cos(t) * (rx + 40 + wob) * R1;
    const py = y + Math.sin(t) * (ry + 40 + wob) * R1 + loose * 30 * Math.max(0, Math.sin(t));
    d += (i ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1);
  }
  return (
    <g opacity={o}>
      <path d={d} stroke={LIL} strokeWidth={22} fill="none" opacity={0.25} filter="url(#blur12)" />
      <path d={d} stroke={LIL} strokeWidth={7} fill="none" strokeLinejoin="round" opacity={1 - 0.45 * loose} strokeDasharray={loose > 0.5 ? `${60 - 30 * loose} ${10 + 40 * (loose - 0.5)}` : undefined} />
      <path d={d} stroke="#fff" strokeWidth={2} fill="none" opacity={0.5 * (1 - loose)} />
    </g>
  );
};

// the stretchy net: threads bow down as support is lost
const Net: React.FC<{s: number; sag: number; k: number; cx: number; cy: number; hole: {rx: number; ry: number}}> = ({s, sag, k, cx, cy, hole}) => {
  const lines: React.ReactNode[] = [];
  const bend = (x: number, y: number) => {
    const dx = (x - cx) / 420;
    const dy = (y - cy) / 520;
    const g = Math.exp(-(dx * dx + dy * dy));
    return y + sag * 150 * g + Math.sin(s * 1.2 + x * 0.01) * 4;
  };
  const push = (x: number, y: number) => {
    // push threads out of the hole
    const dx = (x - cx) / (hole.rx + 70);
    const dy = (y - cy) / (hole.ry + 70);
    const r = Math.hypot(dx, dy);
    if (r < 1.25) {
      const f = 1.25 / Math.max(r, 0.01);
      return [cx + (x - cx) * f, cy + (y - cy) * f];
    }
    return [x, y];
  };
  for (let i = -2; i <= 14; i++) {
    let d = '';
    let d2 = '';
    for (let j = 0; j <= 60; j++) {
      const x = -60 + (j / 60) * (W + 120);
      const y0 = 420 + i * 100;
      const [px, py] = push(x, y0);
      d += (j ? 'L' : 'M') + px.toFixed(1) + ' ' + bend(px, py).toFixed(1);
      const yy = -100 + (j / 60) * (H + 200);
      const x0 = -60 + (i + 2) * 75;
      const [qx, qy] = push(x0, yy);
      d2 += (j ? 'L' : 'M') + qx.toFixed(1) + ' ' + bend(qx, qy).toFixed(1);
    }
    lines.push(<path key={'h' + i} d={d} stroke={C.blushWarm} strokeWidth={4} fill="none" opacity={0.55} />);
    lines.push(<path key={'v' + i} d={d2} stroke={C.blushWarm} strokeWidth={4} fill="none" opacity={0.55} />);
  }
  return <g opacity={k}>{lines}</g>;
};

// magnifying loupe showing one macro pore
const Loupe: React.FC<{x: number; y: number; r: number; rx: number; ry: number; o?: number; glare?: number; id: string; label?: string; s: number}> = ({x, y, r, rx, ry, o = 1, glare = 0, id, label, s}) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r + 40} fill="#000" opacity={0.25} filter="url(#blur12)" />
    <clipPath id={`lp${id}`}>
      <circle cx={x} cy={y} r={r} />
    </clipPath>
    <g clipPath={`url(#lp${id})`}>
      <rect x={x - r} y={y - r} width={r * 2} height={r * 2} fill="url(#macroSkin)" />
      {Array.from({length: 18}).map((_, i) => (
        <path key={i} d={`M${x - r + rand(i * 3 + 7) * 2 * r} ${y - r} q ${(rand(i) - 0.5) * 60} ${r} ${(rand(i * 5) - 0.5) * 40} ${2 * r}`} stroke="#C27D88" strokeWidth={2} fill="none" opacity={0.35} />
      ))}
      <Pore x={x} y={y} rx={rx} ry={ry} />
      {glare > 0 && (
        <g opacity={glare}>
          <ellipse cx={x - r * 0.15} cy={y - r * 0.1} rx={r * 0.85} ry={r * 0.6} fill="url(#glare)" opacity={0.75} />
          <ellipse cx={x} cy={y} rx={rx * 1.5} ry={ry * 1.5} fill="none" stroke="#FFF6E0" strokeWidth={10} opacity={0.6} filter="url(#blur4)" />
          <rect x={x - r * 1.2 + ((s * 0.4) % 1) * r * 2.4} y={y - r} width={r * 0.25} height={r * 2} fill="#fff" opacity={0.35} transform={`skewX(-20)`} filter="url(#blur12)" />
        </g>
      )}
    </g>
    <circle cx={x} cy={y} r={r} fill="none" stroke="#F6E9EC" strokeWidth={14} />
    <circle cx={x} cy={y} r={r - 10} fill="none" stroke="#fff" strokeWidth={2} opacity={0.5} />
    <path d={`M${x + r * 0.72} ${y + r * 0.72} L ${x + r * 1.15} ${y + r * 1.15}`} stroke="#F6E9EC" strokeWidth={34} strokeLinecap="round" />
    {label && (
      <text x={x} y={y - r - 34} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.white} letterSpacing={5}>
        {label}
      </text>
    )}
  </g>
);

const Pill: React.FC<{x: number; y: number; k: number; text: string; color: string; dark?: boolean; size?: number}> = ({x, y, k, text, color, dark, size = 34}) =>
  k > 0 ? (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * k})`} opacity={k}>
      <rect x={-(text.length * size * 0.36 + 44)} y={-size * 1.3} width={2 * (text.length * size * 0.36 + 44)} height={size * 2.4} rx={size * 1.2} fill={dark ? 'rgba(23,10,16,0.7)' : color} stroke={color} strokeWidth={3} />
      <text y={size * 0.35} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={size} fill={dark ? color : C.plum} letterSpacing={2}>
        {text}
      </text>
    </g>
  ) : null;

// =============== A: hook — a loupe on a pore that grows with age ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tOld = cue('older?');
  const push = 1 + 0.07 * ease(prog(s, 0, S(1)));
  const a = ease(prog(s, 0, tOld + 0.4));
  return (
    <Svg cam={camZoom(push, W / 2, 1200)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={LIL} o={0.55} />
      <SkinPlane s={s} />
      <Loupe x={W / 2} y={1180} r={300} rx={60 + 14 * a} ry={60 + 46 * a} id="a" s={s} />
      <g transform={`translate(${W / 2} 700)`}>
        <rect x={-210} y={-56} width={420} height={100} rx={50} fill="rgba(23,10,16,0.65)" stroke={LIL} strokeWidth={3} />
        <text x={-120} y={14} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white} letterSpacing={3}>
          AGE
        </text>
        <rect x={-50} y={-6} width={210} height={12} rx={6} fill="rgba(238,221,226,0.25)" />
        <rect x={-50} y={-6} width={210 * a} height={12} rx={6} fill={LIL} />
        <circle cx={-50 + 210 * a} cy={0} r={16} fill={C.white} />
      </g>
    </Svg>
  );
};

// =============== B: the 3D study — pores grow larger and longer ===============
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tLarger = cue('larger');
  const tLonger = cue('longer');
  const push = 1.06 - 0.06 * ease(prog(s, t0 - 0.2, t0 + 1.2));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.5));
  const grow = ease(prog(s, tLarger - 0.4, tLarger + 0.5));
  const long = ease(prog(s, tLonger - 0.6, tLonger + 0.3));
  const slider = ease(prog(s, cue('found') - 0.2, S(2) - 0.4));
  // perspective terrain
  const gx = (u: number, v: number) => {
    const y = 820 + Math.pow(v, 1.4) * 780;
    const spread = 700 + v * 900;
    return [W / 2 + (u - 0.5) * spread, y];
  };
  const rows: React.ReactNode[] = [];
  for (let j = 0; j <= 14; j++) {
    let d = '';
    for (let i = 0; i <= 40; i++) {
      const [x, y] = gx(i / 40, j / 14);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (y + Math.sin(i * 0.7 + j) * 6).toFixed(1);
    }
    rows.push(<path key={'r' + j} d={d} stroke="#F7D5D5" strokeWidth={2} fill="none" opacity={0.35 + 0.3 * (j / 14)} />);
  }
  for (let i = 0; i <= 16; i++) {
    let d = '';
    for (let j = 0; j <= 30; j++) {
      const [x, y] = gx(i / 16, j / 30);
      d += (j ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    rows.push(<path key={'c' + i} d={d} stroke="#F7D5D5" strokeWidth={2} fill="none" opacity={0.3} />);
  }
  const pores = Array.from({length: 15}).map((_, i) => {
    const u = 0.12 + (i % 5) * 0.19 + (rand(i) - 0.5) * 0.05;
    const v = 0.2 + Math.floor(i / 5) * 0.3 + (rand(i * 3) - 0.5) * 0.06;
    const [x, y] = gx(u, v);
    const sc = 0.5 + v * 0.9;
    return {x, y, sc};
  });
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1200} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={21} color={LIL} o={0.4} />
      <g opacity={inK}>
        <path d={`M${gx(0, 0)[0]} ${gx(0, 0)[1]} L ${gx(1, 0)[0]} ${gx(1, 0)[1]} L ${gx(1, 1)[0]} ${gx(1, 1)[1]} L ${gx(0, 1)[0]} ${gx(0, 1)[1]} Z`} fill="url(#skinPlane)" opacity={0.92} />
        {rows}
        {/* connecting channels between neighbours as they lengthen */}
        {pores.map((p, i) =>
          i % 5 < 4 && long > 0 ? (
            <path key={'ch' + i} d={`M${p.x} ${p.y} L ${pores[i + 1].x} ${pores[i + 1].y}`} stroke="#7A3446" strokeWidth={6 * p.sc * long} opacity={0.5 * long} strokeLinecap="round" strokeDasharray={`${40 * long} 40`} />
          ) : null,
        )}
        {pores.map((p, i) => (
          <Pore key={i} x={p.x} y={p.y} rx={(20 + 16 * grow) * p.sc} ry={(15 + 10 * grow + 40 * long) * p.sc} rot={12 * long * (rand(i) - 0.5)} />
        ))}
        <text x={W / 2} y={760} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.white} letterSpacing={6} opacity={0.75}>
          CHEEK · 3D SKIN SCAN
        </text>
      </g>
      {/* age slider */}
      <g opacity={inK} transform="translate(0 600)">
        <line x1={190} y1={0} x2={890} y2={0} stroke="rgba(238,221,226,0.35)" strokeWidth={8} strokeLinecap="round" />
        <line x1={190} y1={0} x2={190 + 700 * slider} y2={0} stroke={LIL} strokeWidth={8} strokeLinecap="round" />
        <circle cx={190 + 700 * slider} cy={0} r={22} fill={C.white} />
        <text x={190} y={-34} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush}>
          20s
        </text>
        <text x={890} y={-34} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush}>
          60s
        </text>
      </g>
      <text x={W / 2} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.6 * inK}>
        Lee et al., Skin Res Technol, 2021 · 101 women · 3D cheek scans
      </text>
    </Svg>
  );
};

// =============== C + D: the stretchy net, the springy ring, loosening with years ===============
const NCX = W / 2;
const NCY = 1120;
const NetScene: React.FC<{s: number; phase: 'C' | 'D'}> = ({s, phase}) => {
  const tNet = cue('net.');
  const tRing = cue('ring', 2);
  const tSpringy = cue('springy');
  const tFibers = cue('fibers.');
  const tYears = cue('years,');
  const tSun = cue('sun,');
  const tLoose = cue('loosens.');
  const tSags = cue('sags');
  const tOval = cue('oval.');
  const netK = phase === 'C' ? ease(prog(s, S(2) - 0.5, S(2) + 0.2)) : 1;
  const ringK = phase === 'C' ? ease(prog(s, tRing - 0.4, tRing + 0.3)) : 1;
  const bounce = phase === 'C' ? Math.max(0, Math.sin(prog(s, tSpringy - 0.1, tSpringy + 1.2) * Math.PI)) : 0;
  const loose = phase === 'D' ? ease(prog(s, tSun - 0.2, tLoose + 0.5)) : 0;
  const sag = phase === 'D' ? ease(prog(s, tSags - 0.5, tOval + 0.4)) : 0;
  const sunK = phase === 'D' ? ease(prog(s, tSun - 0.3, tSun + 0.3)) * (1 - ease(prog(s, tLoose + 0.4, tLoose + 1))) : 0;
  const yearsK = phase === 'D' ? ease(prog(s, S(3) - 0.2, tYears + 0.2)) : 0;
  const rx = 110 - 18 * sag;
  const ry = 110 + 120 * sag;
  const push = phase === 'C' ? 1.04 + 0.06 * ease(prog(s, S(2), S(3))) : 1.1 - 0.06 * ease(prog(s, S(3), S(4)));
  const labelK = phase === 'C' ? ease(prog(s, tFibers - 0.5, tFibers + 0.2)) : 0;
  return (
    <Svg cam={camZoom(push, NCX, NCY)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#derm)" />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} opacity={0.45} />
      <Bokeh s={s} seed={33} color={LIL} o={0.45} />
      <Net s={s} sag={sag} k={netK} cx={NCX} cy={NCY} hole={{rx, ry}} />
      <circle cx={NCX} cy={NCY} r={300} fill="url(#lilGlow)" opacity={ringK * (1 - 0.6 * loose)} />
      <ellipse cx={NCX} cy={NCY + sag * 20} rx={rx} ry={ry} fill="#1A0910" opacity={netK} />
      <ellipse cx={NCX} cy={NCY + sag * 20} rx={rx} ry={ry} fill="url(#poreHole)" opacity={netK * 0.9} />
      <SpringRing x={NCX} y={NCY + sag * 20} rx={rx} ry={ry} loose={loose} s={s} o={ringK} bounce={bounce} />
      {labelK > 0 && (
        <g opacity={labelK}>
          <text x={NCX} y={NCY + 330} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={LIL} letterSpacing={4}>
            COLLAGEN + ELASTIC FIBERS
          </text>
        </g>
      )}
      {phase === 'C' && (
        <text x={NCX} y={NCY + 8} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.blush} letterSpacing={6} opacity={ringK * 0.9}>
          PORE
        </text>
      )}
      {/* sun beam */}
      <Beam d={wavePath(W + 40, 560, NCX + 140, NCY - 40, 20, 110, s * 7, ease(prog(s, tSun - 0.3, tSun + 0.4)))} color={C.gold} o={sunK} w={9} />
      {phase === 'D' && yearsK > 0 && (
        <g transform="translate(540 620)" opacity={yearsK}>
          <rect x={-230} y={-50} width={460} height={92} rx={46} fill="rgba(23,10,16,0.7)" stroke={LIL} strokeWidth={3} />
          <text x={-110} y={12} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.white} letterSpacing={3}>
            YEARS
          </text>
          <rect x={-20} y={-6} width={200} height={12} rx={6} fill="rgba(238,221,226,0.25)" />
          <rect x={-20} y={-6} width={200 * ease(prog(s, S(3), tOval))} height={12} rx={6} fill={LIL} />
        </g>
      )}
    </Svg>
  );
};
export const SceneC: React.FC<{s: number}> = ({s}) => <NetScene s={s} phase="C" />;
export const SceneD: React.FC<{s: number}> = ({s}) => <NetScene s={s} phase="D" />;

// =============== E: the multiethnic study — ethnicity > age ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tStory = cue('story.');
  const tN = cue('2,585');
  const tSize = cue('size');
  const tEth = cue('ethnicity');
  const tAge = cue('age', 4, 1);
  const push = 1 + 0.05 * ease(prog(s, t0, S(5)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const count = Math.round(2585 * easeOut(prog(s, tN - 1.0, tN + 0.4)));
  const dotsK = prog(s, tN - 1.0, tN + 0.6);
  const ethK = ease(prog(s, tEth - 0.4, tEth + 0.4));
  const ageK = ease(prog(s, tSize - 0.3, tSize + 0.4));
  const ageFocus = ease(prog(s, tAge - 0.3, tAge + 0.3));
  // illustrative sizes
  const ageSizes = [0.9, 0.98, 1.04, 1.07];
  const ethSizes = [0.55, 0.85, 1.05, 1.3, 1.6];
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} color={LIL} o={0.45} />
      {/* opening line: age on a scale that barely tips */}
      <g opacity={inK * (1 - ease(prog(s, tN - 1.0, tN - 0.5)))}>
        <g transform={`translate(${W / 2} 1000) rotate(${-6 * ease(prog(s, tStory - 0.6, tStory + 0.3))})`}>
          <rect x={-330} y={-8} width={660} height={16} rx={8} fill={C.blush} />
          <circle cx={-260} cy={-60} r={52} fill="rgba(23,10,16,0.6)" stroke={LIL} strokeWidth={4} />
          <text x={-260} y={-50} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.white}>
            AGE
          </text>
          <circle cx={260} cy={-60} r={52} fill="rgba(23,10,16,0.6)" stroke={C.blush} strokeWidth={4} />
          <text x={260} y={-50} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={44} fill={C.white}>
            ?
          </text>
        </g>
        <path d={`M${W / 2} 1010 L ${W / 2 - 70} 1180 L ${W / 2 + 70} 1180 Z`} fill={C.blush} opacity={0.8} />
      </g>
      {/* 2,585 women as a field of dots */}
      {Array.from({length: 120}).map((_, i) => {
        const k = clamp(dotsK * 1.6 - rand(i * 7) * 0.6);
        const x = 130 + (i % 20) * 43;
        const y = 560 + Math.floor(i / 20) * 34;
        return <circle key={i} cx={x} cy={y} r={8 * k} fill={i % 5 === 0 ? LIL : C.blush} opacity={0.6 * k} />;
      })}
      <g opacity={ease(dotsK)}>
        <text x={W / 2} y={830} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={64} fill={C.white}>
          {count.toLocaleString('en-US')} women
        </text>
        <text x={W / 2} y={876} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={5}>
          5 COUNTRIES
        </text>
      </g>
      {/* rows of pores */}
      <g opacity={ageK} transform={`translate(0 ${(1 - ageK) * 40})`}>
        <text x={110} y={1010} fontFamily="Poppins" fontWeight={700} fontSize={28} fill={ageFocus > 0.5 ? LIL : C.white} letterSpacing={3}>
          BY AGE
        </text>
        {ageSizes.map((k, i) => (
          <g key={i}>
            <circle cx={210 + i * 220} cy={1120} r={78} fill="url(#macroSkin)" />
            <Pore x={210 + i * 220} y={1120} rx={30 * k} ry={30 * k} />
            <text x={210 + i * 220} y={1240} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} opacity={0.8}>
              {['20s', '30s', '40s', '50s+'][i]}
            </text>
          </g>
        ))}
      </g>
      <g opacity={ethK} transform={`translate(0 ${(1 - ethK) * 40})`}>
        <text x={110} y={1330} fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.white} letterSpacing={3}>
          BY ETHNIC GROUP
        </text>
        {ethSizes.map((k, i) => (
          <g key={i}>
            <circle cx={170 + i * 185} cy={1450} r={78} fill="url(#macroSkin)" />
            <Pore x={170 + i * 185} y={1450} rx={30 * k} ry={30 * k} />
          </g>
        ))}
        <Pill x={W / 2} y={1620} k={ethK} text="much bigger spread" color={LIL} size={30} />
      </g>
      <text x={W / 2} y={1730} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.55 * inK}>
        Flament et al., Clin Cosmet Investig Dermatol, 2015 · 2,585 women · illustrative scale
      </text>
    </Svg>
  );
};

// =============== F: shine plays tricks ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tOil = cue('Oil');
  const tBig = cue('bigger', 5);
  const push = 1.04 + 0.05 * ease(prog(s, t0, S(6)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.5));
  const glare = ease(prog(s, tOil - 0.3, tOil + 0.5));
  const big = ease(prog(s, tBig - 0.3, tBig + 0.4));
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={61} color={C.goldHot} o={0.55} />
      <SkinPlane s={s} />
      <ellipse cx={780} cy={1400} rx={360} ry={130} fill="url(#glare)" opacity={0.6 * glare} />
      <Loupe x={290} y={1050} r={210} rx={46} ry={52} id="m" label="MATTE" s={s} o={inK} />
      <Loupe x={790} y={1050} r={210} rx={46 * (1 + 0.25 * big)} ry={52 * (1 + 0.25 * big)} glare={glare} id="g" label="SHINY" s={s} o={inK} />
      <Pill x={W / 2} y={1450} k={big} text="same pore" color={C.gold} size={32} />
      <text x={W / 2} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.plum} opacity={0.75 * inK}>
        Flament et al., Clin Cosmet Investig Dermatol, 2015 · shine can make pores more visible
      </text>
    </Svg>
  );
};

// =============== G: support the net ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const items = [
    {t: cue('sunscreen'), label: 'DAILY SPF', x: 230, y: 720, i: 0},
    {t: cue('retinoid,'), label: 'ASK: RETINOID', x: 850, y: 720, i: 1},
    {t: cue('blot'), label: 'BLOT SHINE', x: 230, y: 1060, i: 2},
    {t: cue('Toners'), label: 'TONER: SHORT-LIVED', x: 850, y: 1060, i: 3},
  ];
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const shieldK = ease(prog(s, t0 + 0.2, t0 + 1.2));
  const steady = ease(prog(s, t0 + 0.4, t0 + 1.8));
  const icon = (i: number) => {
    switch (i) {
      case 0:
        return (
          <g transform="rotate(-15)">
            <path d="M -34 -64 L 34 -64 L 28 46 L -28 46 Z" fill={C.blush} />
            <rect x={-18} y={46} width={36} height={22} rx={6} fill={C.plum} />
            <text y={-2} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={C.plum}>
              SPF
            </text>
          </g>
        );
      case 1:
        return (
          <g>
            <rect x={-20} y={-44} width={40} height={20} rx={6} fill={LIL} />
            <rect x={-30} y={-26} width={60} height={76} rx={14} fill="none" stroke={C.blush} strokeWidth={6} />
            <text y={22} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.blush}>
              A
            </text>
          </g>
        );
      case 2:
        return (
          <g>
            <rect x={-40} y={-46} width={80} height={92} rx={8} fill="#FFF6E8" transform="rotate(-10)" />
            <circle cx={0} cy={0} r={18} fill={C.oil} opacity={0.6} />
          </g>
        );
      default:
        return (
          <g>
            <rect x={-26} y={-40} width={52} height={86} rx={12} fill="none" stroke={C.blush} strokeWidth={6} />
            <rect x={-12} y={-56} width={24} height={16} rx={4} fill={C.blush} />
            <path d="M-60 60 L 60 -60" stroke="#FF7A80" strokeWidth={9} strokeLinecap="round" />
          </g>
        );
    }
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#derm)" />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} opacity={0.55} />
      <Bokeh s={s} seed={81} color={LIL} o={0.45} />
      <Net s={s} sag={0.6} k={0.85} cx={NCX} cy={NCY + 60} hole={{rx: 92, ry: 230}} />
      <ellipse cx={NCX} cy={NCY + 80} rx={92} ry={230} fill="#1A0910" />
      <ellipse cx={NCX} cy={NCY + 80} rx={92} ry={230} fill="url(#poreHole)" opacity={0.9} />
      <SpringRing x={NCX} y={NCY + 80} rx={92} ry={230} loose={0.75 - 0.35 * steady} s={s} />
      {/* sun beam stopped by a protective film (sunscreen) */}
      <Beam d={wavePath(W + 40, 560, NCX + 170, 900, 20, 110, s * 7, 1)} color={C.gold} o={0.9 * (1 - 0.3 * shieldK)} w={9} />
      <g opacity={shieldK}>
        <path d={`M${NCX - 200} 960 Q ${NCX} 830 ${NCX + 200} 960`} stroke="#FFF4E0" strokeWidth={16} fill="none" opacity={0.85} strokeLinecap="round" />
        <path d={`M${NCX - 200} 960 Q ${NCX} 830 ${NCX + 200} 960`} stroke={C.gold} strokeWidth={50} fill="none" opacity={0.2} filter="url(#blur12)" />
        <circle cx={NCX + 170} cy={900} r={30 + 8 * Math.sin(s * 9)} fill={C.goldHot} opacity={0.6} filter="url(#blur12)" />
      </g>
      {items.map((it) => {
        const k = ease(prog(s, it.t - 0.35, it.t + 0.25));
        return (
          <g key={it.i} transform={`translate(${it.x} ${it.y}) scale(${0.85 + 0.15 * k})`} opacity={k}>
            <circle r={115} fill="rgba(23,10,16,0.72)" stroke="rgba(238,221,226,0.4)" strokeWidth={3} />
            {icon(it.i)}
            <text y={160} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={3}>
              {it.label}
            </text>
          </g>
        );
      })}
    </Svg>
  );
};

// =============== H: loop back to the loupe + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tSupport = cue('support.', 7);
  const tGlowi = cue('Glowi');
  const scan = prog(s, tSupport - 0.3, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const ringK = ease(prog(s, tSupport - 0.6, tSupport + 0.2));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tSupport, tSupport + 1)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1300)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={LIL} o={0.55} />
        <SkinPlane s={s} fx={{scan}} />
        <g opacity={1 - cardK}>
          <Loupe x={W / 2} y={1180} r={300} rx={98} ry={150} id="h" s={s} />
          <g opacity={ringK}>
            <SpringRing x={W / 2} y={1180} rx={98} ry={150} loose={0.7 * (1 - ringK)} s={s} />
          </g>
        </g>
        <g opacity={mesh}>
          {nodes.map((a, i) => {
            const b = nodes[(i * 5 + 3) % nodes.length];
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.blush} strokeWidth={1.5} opacity={0.55} />;
          })}
          {nodes.map((a, i) => (
            <circle key={i} cx={a.x} cy={a.y} r={7} fill={LIL} opacity={a.y < HORIZON + (H - HORIZON) * scan ? 1 : 0} />
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
export const SCENES: React.FC<{s: number}>[] = [SceneA, SceneB, SceneC, SceneD, SceneE, SceneF, SceneG, SceneH];
export const bounds = (end: number) => [0, S(1), S(2), S(3), S(4) + 0.5, S(5), S(6), S(7) + 0.3, end];
