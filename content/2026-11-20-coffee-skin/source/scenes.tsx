import React from 'react';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, HORIZON} from './parts';
import {cue, S} from './timeline';
import {RealPlane, SkinMacro} from './realskin';
import {camZoom, Pill, Label, Cite, Tile, ScanMesh, EndCard} from './common';

// accent for this topic: coffee / crema
const CREMA = '#D9A066';
const ESPRESSO = '#3B2219';
const MUG = '#F3E6E2';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <linearGradient id="mugG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#CDB7B4" />
        <stop offset="0.3" stopColor={MUG} />
        <stop offset="0.7" stopColor="#FFF7F4" />
        <stop offset="1" stopColor="#BFA6A3" />
      </linearGradient>
      <radialGradient id="coffeeG" cx="0.45" cy="0.4">
        <stop offset="0" stopColor="#C88A55" />
        <stop offset="0.5" stopColor="#7A4A2C" />
        <stop offset="1" stopColor={ESPRESSO} />
      </radialGradient>
      <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#BDEFFA" />
        <stop offset="1" stopColor={C.waterDeep} />
      </linearGradient>
      <radialGradient id="cremaGlow">
        <stop offset="0" stopColor={CREMA} stopOpacity="0.6" />
        <stop offset="1" stopColor={CREMA} stopOpacity="0" />
      </radialGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);

// ---------- coffee mug with steam ----------
const Mug: React.FC<{x: number; y: number; sc?: number; s: number; steam?: number; o?: number}> = ({x, y, sc = 1, s, steam = 1, o = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={o}>
    <ellipse cx={0} cy={-120} rx={330} ry={260} fill="url(#cremaGlow)" opacity={0.45} />
    {/* steam */}
    {[-60, 0, 60].map((dx, i) => {
      const ph = s * 0.9 + i * 1.7;
      let d = '';
      for (let k = 0; k <= 20; k++) {
        const yy = -250 - k * 14;
        const xx = dx + Math.sin(k * 0.45 + ph) * (10 + k * 1.6);
        d += (k ? 'L' : 'M') + xx.toFixed(1) + ' ' + yy;
      }
      return (
        <g key={i} opacity={steam * (0.55 + 0.25 * Math.sin(s * 1.5 + i))}>
          <path d={d} stroke="#FFFFFF" strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.25} filter="url(#blur12)" />
          <path d={d} stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.5} />
        </g>
      );
    })}
    <ellipse cx={0} cy={190} rx={210} ry={30} fill="#000" opacity={0.25} filter="url(#blur12)" />
    {/* handle */}
    <path d="M150 -120 C 260 -130, 270 60, 150 70" stroke="#E3D2CE" strokeWidth={38} fill="none" strokeLinecap="round" />
    <path d="M150 -120 C 260 -130, 270 60, 150 70" stroke="#FFF7F4" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} transform="translate(-6 -6)" />
    {/* body */}
    <path d="M-170 -220 L 170 -220 L 150 150 C 150 185, -150 185, -150 150 Z" fill="url(#mugG)" />
    <ellipse cx={0} cy={-220} rx={170} ry={36} fill="#E8D8D4" />
    <ellipse cx={0} cy={-214} rx={150} ry={28} fill="url(#coffeeG)" />
    <path d={`M-90 -214 C -40 ${-234 + 6 * Math.sin(s * 1.3)}, 40 ${-194 - 6 * Math.sin(s * 1.3)}, 90 -214`} stroke={CREMA} strokeWidth={6} fill="none" opacity={0.7} />
    <ellipse cx={-60} cy={-220} rx={30} ry={6} fill="#FFFFFF" opacity={0.2} />
    <rect x={-130} y={-180} width={30} height={300} rx={15} fill="#FFFFFF" opacity={0.35} />
  </g>
);

const WaterGlass: React.FC<{x: number; y: number; sc?: number; level?: number; s: number}> = ({x, y, sc = 1, level = 0.8, s}) => (
  <g transform={`translate(${x} ${y}) scale(${sc})`}>
    <path d="M-60 -110 L 60 -110 L 48 110 L -48 110 Z" fill="rgba(168,221,242,0.15)" stroke="rgba(255,255,255,0.85)" strokeWidth={5} />
    <clipPath id={`wg${x}${y}`}>
      <path d="M-58 -108 L 58 -108 L 46 108 L -46 108 Z" />
    </clipPath>
    <g clipPath={`url(#wg${x}${y})`}>
      <path d={`M-70 ${110 - 220 * level + 5 * Math.sin(s * 2.5)} Q 0 ${110 - 220 * level - 8 * Math.sin(s * 2.5)} 70 ${110 - 220 * level + 5 * Math.sin(s * 2.5)} L 70 120 L -70 120 Z`} fill="url(#waterFill)" opacity={0.85} />
    </g>
    <rect x={-44} y={-96} width={14} height={180} rx={7} fill="#FFFFFF" opacity={0.35} />
  </g>
);

// hydration gauge (vertical tube)
const Gauge: React.FC<{x: number; y: number; h?: number; level: number; label?: string; color?: string}> = ({x, y, h = 360, level, label, color = C.water}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-40} y={-h} width={80} height={h} rx={40} fill="rgba(238,221,226,0.1)" stroke="rgba(238,221,226,0.45)" strokeWidth={3} />
    <rect x={-30} y={-10 - (h - 20) * level} width={60} height={(h - 20) * level} rx={30} fill={color} />
    <rect x={-30} y={-10 - (h - 20) * level} width={60} height={(h - 20) * level} rx={30} fill={color} opacity={0.5} filter="url(#blur12)" />
    {label && (
      <text y={50} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={C.blush} letterSpacing={3}>
        {label}
      </text>
    )}
  </g>
);

// =============== A: hook — morning coffee steaming over skin ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tSkin = cue('skin?');
  const push = 1 + 0.08 * ease(prog(s, 0, S(1)));
  const dull = 0.2 + 0.5 * ease(prog(s, tSkin - 0.6, tSkin + 0.6));
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <circle cx={860} cy={760} r={260} fill="url(#sunGlow)" opacity={0.6} />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={C.goldHot} o={0.6} />
      <RealPlane s={s} seed={2} fx={{dull}} />
      <Mug x={W / 2} y={1120} sc={1.0} s={s} />
    </Svg>
  );
};

// =============== B: "dehydrating" — gauge drains; mostly a myth ===============
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tDe = cue('dehydrating');
  const tMyth = cue('myth.');
  const push = 1.06 - 0.06 * ease(prog(s, t0 - 0.3, S(2)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const drain = ease(prog(s, tDe - 0.3, tDe + 1.0));
  const myth = ease(prog(s, tMyth - 0.45, tMyth + 0.1));
  const refill = ease(prog(s, tMyth - 1.4, tMyth));
  const level = 0.85 - 0.6 * drain + 0.6 * refill;
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1050} r={800} fill={C.plum} opacity={0.75} filter="url(#blur30)" />
      <Bokeh s={s} seed={21} o={0.5} />
      <g opacity={inK}>
        <Mug x={360} y={1210} sc={0.85} s={s} />
        <Gauge x={800} y={1400} h={620} level={clamp(level)} label="YOUR WATER" />
        {/* drips leaving the gauge while it drains */}
        {drain > 0 &&
          drain < 1 &&
          Array.from({length: 6}).map((_, i) => {
            const ph = (s * 1.2 + i / 6) % 1;
            return <circle key={i} cx={800 + Math.sin(i) * 20} cy={1420 + ph * 180} r={10} fill={C.water} opacity={(1 - ph) * (1 - refill)} />;
          })}
      </g>
      <Pill x={W / 2} y={620} k={ease(prog(s, tDe - 0.4, tDe + 0.2)) * (1 - 0.6 * myth)} text="DEHYDRATES YOU?" color={C.water} size={34} />
      {myth > 0 && <line x1={W / 2 - 230} y1={620} x2={W / 2 - 230 + 460 * myth} y2={620} stroke={CREMA} strokeWidth={8} strokeLinecap="round" />}
      {myth > 0 && (
        <g transform={`translate(${W / 2} 780) rotate(-8) scale(${1.4 - 0.4 * myth})`} opacity={myth}>
          <rect x={-250} y={-52} width={500} height={104} rx={20} fill="rgba(23,10,16,0.6)" stroke={CREMA} strokeWidth={7} />
          <text y={18} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={46} fill={CREMA} letterSpacing={5}>
            MOSTLY A MYTH
          </text>
        </g>
      )}
    </Svg>
  );
};

// =============== C: only big doses flush water; tolerance; mug is mostly water ===============
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tBig = cue('big');
  const tWater = cue('water.');
  const tTol = cue('tolerance,');
  const tMost = cue('mostly', 2);
  const push = 1.05 + 0.05 * ease(prog(s, t0, S(3)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const big = ease(prog(s, tBig - 0.3, tBig + 0.5));
  const flushK = ease(prog(s, tWater - 1.0, tWater + 0.3)) * (1 - ease(prog(s, tTol - 0.3, tTol + 0.3)));
  const tol = ease(prog(s, tTol - 0.4, tTol + 0.4));
  const most = ease(prog(s, tMost - 0.4, tMost + 0.5));
  // dial needle: low → high (big dose) → low (daily drinker)
  const needle = -70 + 130 * big;
  const cx = W / 2;
  const cy = 940;
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={31} o={0.5} />
      <g opacity={inK * (1 - 0.75 * most)}>
        {/* caffeine dose dial */}
        <g transform={`translate(${cx} ${cy})`}>
          {Array.from({length: 24}).map((_, i) => {
            const a = -90 + (i / 23) * 180;
            const hot = i > 16;
            return <rect key={i} x={-6} y={-330} width={12} height={46} rx={6} fill={hot ? C.uvb : 'rgba(238,221,226,0.45)'} transform={`rotate(${a})`} opacity={hot ? 0.9 : 0.7} />;
          })}
          <text x={-300} y={60} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={C.blush} letterSpacing={3}>
            A MUG
          </text>
          <text x={300} y={60} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={C.uvb} letterSpacing={3}>
            BIG DOSE
          </text>
          <g transform={`rotate(${needle})`}>
            <path d="M-12 0 L 0 -270 L 12 0 Z" fill={CREMA} />
          </g>
          <circle r={40} fill={ESPRESSO} stroke={CREMA} strokeWidth={6} />
          <text y={130} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={26} fill={C.blush} letterSpacing={4}>
            CAFFEINE
          </text>
        </g>
        {/* kidney flushing water only on big dose */}
        <g transform="translate(540 1330)">
          <path d="M20 -90 C 100 -100, 125 -15, 98 42 C 70 100, 0 108, -16 58 C -25 34, 8 16, -8 -8 C -25 -34, -42 -84, 20 -90 Z" fill="#B85E6C" stroke="#F2B6BE" strokeWidth={4} transform="translate(-40 0)" />
          {Array.from({length: 8}).map((_, i) => {
            const ph = (s * 1.4 + i / 8) % 1;
            return <path key={i} d="M0 -16 C 7 -6, 11 0, 11 6 a 11 11 0 0 1 -22 0 c 0 -6 4 -12 11 -22 Z" fill={C.water} transform={`translate(${-10 + Math.sin(i * 2) * 30} ${110 + ph * 200}) scale(1.3)`} opacity={flushK * (1 - ph)} />;
          })}
          <text x={0} y={-130} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={C.blush} letterSpacing={4}>
            KIDNEYS
          </text>
        </g>
      </g>
      <Pill x={W / 2} y={560} k={tol * (1 - most)} text="DAILY DRINKERS: TOLERANCE" color={CREMA} size={30} />
      {/* mug x-ray: mostly water */}
      {most > 0 && (
        <g opacity={most} transform={`translate(${W / 2} 1060) scale(${0.9 + 0.1 * most})`}>
          <Mug x={0} y={0} sc={1.1} s={s} steam={0.6} />
          <clipPath id="xray">
            <path d="M-182 -236 L 182 -236 L 160 160 C 160 200, -160 200, -160 160 Z" />
          </clipPath>
          <g clipPath="url(#xray)">
            <rect x={-200} y={-240} width={400} height={460} fill="url(#waterFill)" opacity={0.85} />
            {Array.from({length: 16}).map((_, i) => {
              const ph = (s * 0.3 + rand(i)) % 1;
              return <circle key={i} cx={-150 + rand(i * 3) * 300} cy={180 - ph * 400} r={6 + rand(i * 5) * 8} fill="#FFFFFF" opacity={0.5} />;
            })}
            <rect x={-200} y={-240} width={400} height={30} fill={ESPRESSO} opacity={0.6} />
          </g>
          <text y={300} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={C.water} letterSpacing={5}>
            MOSTLY WATER
          </text>
        </g>
      )}
      <Cite text="Killer, Blannin & Jeukendrup, PLoS One, 2014 · illustrative dial" k={inK} y={1720} />
    </Svg>
  );
};

// =============== D: study — 50 men, 4 mugs a day, as hydrated as water ===============
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const t50 = cue('50');
  const t4 = cue('4');
  const tHyd = cue('hydrated');
  const push = 1 + 0.05 * ease(prog(s, t0, S(4)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const k50 = ease(prog(s, t50 - 0.3, t50 + 0.3));
  const cups = prog(s, t4 - 0.3, t4 + 1.0);
  const fill = ease(prog(s, t4 + 0.3, tHyd + 0.3));
  const badge = ease(prog(s, tHyd - 0.2, tHyd + 0.4));
  const col = (cx: number, label: string, kind: 'coffee' | 'water', hl: boolean) => (
    <g transform={`translate(${cx} 1090)`}>
      <rect x={-225} y={-360} width={450} height={700} rx={36} fill="rgba(238,221,226,0.07)" stroke={hl && badge > 0 ? C.white : 'rgba(238,221,226,0.3)'} strokeWidth={hl && badge > 0 ? 5 : 3} />
      <text y={-296} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white}>
        {label}
      </text>
      {Array.from({length: 4}).map((_, i) => {
        const k = clamp(cups * 4 - i);
        const x = -150 + i * 100;
        return (
          <g key={i} opacity={Math.max(0.25, k)} transform={`translate(${x} -170) scale(${0.85 + 0.15 * k})`}>
            {kind === 'coffee' ? <Mug x={0} y={0} sc={0.2} s={s} steam={k} /> : <WaterGlass x={0} y={0} sc={0.32} s={s} />}
          </g>
        );
      })}
      <text y={-90} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={3} opacity={0.75}>
        4 A DAY · 3 DAYS
      </text>
      <Gauge x={0} y={270} h={300} level={0.45 + 0.4 * fill} label="HYDRATION" />
    </g>
  );
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={41} o={0.5} />
      <Pill x={W / 2} y={580} k={Math.max(0.5 * inK, k50)} text="50 men · daily coffee drinkers" color={C.blush} size={28} w={640} />
      <g opacity={inK}>
        {col(290, 'Coffee', 'coffee', true)}
        {col(790, 'Water', 'water', true)}
      </g>
      <Pill x={W / 2} y={1520} k={badge} text="SAME HYDRATION" color={C.plum} fill={C.blush} size={46} w={560} />
      <Cite text="Killer et al., PLoS One, 2014 · men only · coffee-industry funded · illustrative" k={inK} y={1700} />
    </Svg>
  );
};

// =============== E: timing — caffeine 6 h before bed cut sleep by 1 h+ ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tTime = cue('timing.');
  const t6 = cue('6');
  const tHour = cue('hour.');
  const push = 1.04 - 0.04 * ease(prog(s, t0, S(5)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const arc = ease(prog(s, t6 - 0.4, t6 + 0.8));
  const cut = ease(prog(s, tHour - 1.2, tHour + 0.3));
  const cx = W / 2;
  const cy = 860;
  const R = 250;
  // clock: bed at 12 o'clock position (angle -90), coffee 6 hours earlier (= half a turn on a 12 h dial)
  const angBed = -90;
  const angCup = angBed - 180 * arc;
  const pt = (a: number, r = R) => ({x: cx + Math.cos((a * Math.PI) / 180) * r, y: cy + Math.sin((a * Math.PI) / 180) * r});
  const cupP = pt(angCup, R + 2);
  const arcD = `M ${pt(angBed).x} ${pt(angBed).y} A ${R} ${R} 0 0 0 ${pt(angCup).x} ${pt(angCup).y}`;
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.night} />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} opacity={0.6} />
      <circle cx={W / 2} cy={950} r={760} fill={C.plum} opacity={0.6} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} o={0.45} />
      <g opacity={inK}>
        <circle cx={cx} cy={cy} r={R + 40} fill="rgba(23,10,16,0.55)" stroke="rgba(238,221,226,0.4)" strokeWidth={4} />
        {Array.from({length: 12}).map((_, i) => {
          const a = (i / 12) * 360 - 90;
          const p1 = pt(a, R + 20);
          const p2 = pt(a, R - 4);
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={C.blush} strokeWidth={i % 3 ? 3 : 7} opacity={0.6} />;
        })}
        {/* hands slowly turning */}
        <line x1={cx} y1={cy} x2={pt(-90 + s * 6, 150).x} y2={pt(-90 + s * 6, 150).y} stroke={C.blush} strokeWidth={10} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={pt(-90 + s * 60, 210).x} y2={pt(-90 + s * 60, 210).y} stroke={C.blush} strokeWidth={6} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={14} fill={C.blush} />
        {arc > 0 && <path d={arcD} stroke={CREMA} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.85} />}
        {/* bed / moon at the top */}
        <g transform={`translate(${pt(angBed, R + 110).x} ${pt(angBed, R + 110).y})`}>
          <circle r={44} fill={C.moon} opacity={0.3} filter="url(#blur12)" />
          <circle r={34} fill="#FFF6E2" />
          <circle cx={16} cy={-10} r={30} fill="#1E0F18" />
        </g>
        <Label x={cx + 120} y={pt(angBed, R + 110).y + 10} text="BED" anchor="start" size={26} />
        {/* coffee cup travelling to 6 h before */}
        {arc > 0.05 && (
          <g>
            <Mug x={cupP.x} y={cupP.y + 20} sc={0.22} s={s} steam={1} />
            <Pill x={cx} y={cy + R + 95} k={arc} text="6 H BEFORE BED · 400 MG" color={CREMA} size={26} />
          </g>
        )}
      </g>
      {/* sleep bars */}
      <g opacity={Math.max(0.4 * inK, ease(prog(s, tTime + 0.5, t6)))}>
        <Label x={130} y={1300} text="NO CAFFEINE" anchor="start" size={24} />
        <rect x={130} y={1320} width={820} height={50} rx={25} fill={C.moon} opacity={0.85} />
        <Label x={130} y={1430} text="CAFFEINE 6 H BEFORE BED" anchor="start" size={24} color={CREMA} />
        <rect x={130} y={1450} width={820 - 160 * cut} height={50} rx={25} fill={C.moon} opacity={0.85} />
        {cut > 0 && <rect x={950 - 160 * cut} y={1450} width={160 * cut} height={50} rx={25} fill="none" stroke={C.uvb} strokeWidth={4} strokeDasharray="10 8" />}
      </g>
      <Pill x={810} y={1580} k={cut} text="−1 H+ SLEEP" color={C.plum} fill={C.blush} size={34} w={300} />
      <Cite text="Drake et al., J Clin Sleep Med, 2013 · 400 mg · bars illustrative" k={inK} y={1700} />
    </Svg>
  );
};

// =============== F: short sleep shows on the face ===============
const EyeCard: React.FC<{cx: number; label: string; pale: number; circles: number; puff: number; hl: number; k: number; seed: number}> = ({cx, label, pale, circles, puff, hl, k, seed}) => (
  <g transform={`translate(${cx} 1050)`} opacity={k}>
    <rect x={-225} y={-330} width={450} height={620} rx={36} fill="rgba(238,221,226,0.07)" stroke={hl > 0 ? C.white : 'rgba(238,221,226,0.3)'} strokeWidth={hl > 0 ? 5 : 3} />
    <text y={-262} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white}>
      {label}
    </text>
    <SkinMacro cx={0} cy={0} r={0} shape="rect" w={380} h={420} seed={seed} />
    <rect x={-190} y={-210} width={380} height={420} rx={24} fill="#D9CFD2" opacity={0.45 * pale} style={{mixBlendMode: 'saturation'}} />
    <rect x={-190} y={-210} width={380} height={420} rx={24} fill="#FFFFFF" opacity={0.12 * pale} />
    {/* eye */}
    <path d="M-130 -50 Q 0 10 130 -50" stroke="#6E3442" strokeWidth={7} fill="none" strokeLinecap="round" />
    {Array.from({length: 9}).map((_, i) => {
      const u = (i + 1) / 10;
      const x = -130 + 260 * u;
      const y = -50 + 120 * u * (1 - u);
      return <path key={i} d={`M${x} ${y} l ${(u - 0.5) * 18} 20`} stroke="#4A2028" strokeWidth={4} strokeLinecap="round" />;
    })}
    {/* dark circle */}
    <ellipse cx={0} cy={45} rx={135} ry={40} fill="#6E4A5A" opacity={0.55 * circles} filter="url(#blur12)" />
    {/* puffiness */}
    {/* under-eye bag: soft raised fold below the lashes */}
    <path d={`M-125 20 Q 0 ${70 + 55 * puff} 125 20 Q 0 ${40 + 20 * puff} -125 20 Z`} fill="#F1CFCB" opacity={0.85 * puff} />
    <path d={`M-125 20 Q 0 ${70 + 55 * puff} 125 20`} stroke="#9A5E68" strokeWidth={3 + 4 * puff} fill="none" opacity={0.25 + 0.6 * puff} filter="url(#blur4)" />
    <path d={`M-90 ${34 + 6 * puff} Q 0 ${52 + 26 * puff} 90 ${34 + 6 * puff}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.45 * puff} />
    <text y={255} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={3} opacity={0.8}>
      UNDER-EYE
    </text>
  </g>
);
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tPale = cue('paler');
  const tCirc = cue('circles');
  const tPuff = cue('puffier');
  const push = 1 + 0.05 * ease(prog(s, t0, S(6)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const pale = ease(prog(s, tPale - 0.3, tPale + 0.4));
  const circ = ease(prog(s, tCirc - 0.3, tCirc + 0.4));
  const puff = ease(prog(s, tPuff - 0.3, tPuff + 0.5));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={61} o={0.5} />
      <g opacity={inK} transform="translate(540 600)">
        <circle r={44} fill={C.moon} opacity={0.3} filter="url(#blur12)" />
        <circle r={34} fill="#FFF6E2" />
        <circle cx={16} cy={-10} r={30} fill={C.plumDeep} />
      </g>
      <EyeCard cx={290} label="8 h sleep" pale={0} circles={0} puff={0} hl={0} k={inK} seed={71} />
      <EyeCard cx={790} label="31 h awake" pale={pale} circles={circ} puff={puff} hl={pale} k={inK} seed={72} />
      <g>
        {[
          {t: 'PALER', k: pale},
          {t: 'DARKER CIRCLES', k: circ},
          {t: 'PUFFIER EYES', k: puff},
        ].map((b, i) => (
          <Pill key={i} x={[230, 540, 850][i]} y={1480} k={b.k} text={b.t} color={C.blush} size={22} w={280} />
        ))}
      </g>
      <Cite text="Sundelin et al., Sleep, 2013 · 31 h awake vs 8 h sleep · illustrative" k={inK} y={1700} />
    </Svg>
  );
};

// =============== G: the fix ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tKeep = cue('keep');
  const tAft = cue('last', 6);
  const tWater = cue('water', 6);
  const tMo = cue('moisturize');
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const base = 0.55 * ease(prog(s, t0 - 0.3, t0 + 0.4));
  const k = (t: number) => ease(prog(s, t - 0.35, t + 0.25));
  const fresh = ease(prog(s, tMo - 0.4, tMo + 0.8));
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={1000} seed={71} o={0.6} color={C.goldHot} />
      <g transform="translate(0 200)">
        <RealPlane s={s} seed={3} fx={{dull: 0.45 * (1 - fresh)}} />
      </g>
      <Mug x={400} y={1500} sc={0.62} s={s} o={ease(prog(s, tKeep - 0.4, tKeep + 0.3))} />
      <WaterGlass x={720} y={1520} sc={0.9} s={s} level={0.2 + 0.6 * k(tWater)} />
      <Tile x={270} y={740} k={k(tAft)} base={base} label="6 H+ BEFORE BED">
        <g>
          <circle cx={-24} cy={-26} r={30} fill={C.goldHot} />
          <g transform="translate(18 18) scale(0.22)">
            <Mug x={0} y={0} s={s} steam={0.6} />
          </g>
        </g>
      </Tile>
      <Tile x={540} y={740} k={k(tWater)} base={base} label="+ WATER">
        <WaterGlass x={0} y={0} sc={0.45} s={s} />
      </Tile>
      <Tile x={810} y={740} k={k(tMo)} base={base} label="MOISTURIZE">
        <g>
          <rect x={-30} y={-50} width={60} height={86} rx={14} fill={C.blush} />
          <rect x={-18} y={-66} width={36} height={18} rx={5} fill={C.plum} />
          <path d="M0 46 C 8 56, 12 62, 12 68 a 12 12 0 0 1 -24 0 c 0 -6 4 -12 12 -22 Z" fill="#FFFFFF" opacity={0.9} />
        </g>
      </Tile>
      <Pill x={W / 2} y={1080} k={k(tKeep) * (1 - k(tAft))} text="KEEP YOUR COFFEE" color={CREMA} size={36} />
    </Svg>
  );
};

// =============== H: loop (coffee over skin) + scan + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tAf = cue('afraid');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tAf - 0.3, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const mesh = ease(prog(s, tAf - 0.2, tAf + 0.8)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1150)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <circle cx={860} cy={760} r={260} fill="url(#sunGlow)" opacity={0.6} />
        <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={C.goldHot} o={0.6} />
        <RealPlane s={s} seed={2} fx={{scan}} />
        <Mug x={W / 2} y={1120} sc={1.0} s={s} />
        <ScanMesh k={mesh} scan={scan} />
      </Svg>
      {cardK > 0 && <EndCard s={s} tGlowi={tGlowi} cardK={cardK} />}
    </>
  );
};

export const SCENES: React.FC<{s: number}>[] = [SceneA, SceneB, SceneC, SceneD, SceneE, SceneF, SceneG, SceneH];
export const bounds = (end: number) => [0, S(1), S(2) + 0.3, S(3), S(4), S(5), S(6), S(7), end];
