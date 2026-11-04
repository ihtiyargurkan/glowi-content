import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, Sun, Beam, wavePath, HORIZON} from './parts';
import {cue, S} from './timeline';

// accent for this topic: screen blue
const SB = '#7EA6FF';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <radialGradient id="sbGlow">
        <stop offset="0" stopColor={SB} stopOpacity="0.6" />
        <stop offset="1" stopColor={SB} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={SB} stopOpacity="0.55" />
        <stop offset="1" stopColor={SB} stopOpacity="0" />
      </linearGradient>
      <linearGradient id="screenG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#BFD3FF" />
        <stop offset="1" stopColor="#5B7FE0" />
      </linearGradient>
      <linearGradient id="waterB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#CFE0FF" />
        <stop offset="1" stopColor={SB} />
      </linearGradient>
      <linearGradient id="goldW" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.goldHot} />
        <stop offset="1" stopColor={C.gold} />
      </linearGradient>
      <linearGradient id="spectrum" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8A6CFF" />
        <stop offset="0.25" stopColor="#5B8CFF" />
        <stop offset="0.5" stopColor="#6FD6A0" />
        <stop offset="0.75" stopColor="#F2D25A" />
        <stop offset="1" stopColor="#F2785A" />
      </linearGradient>
      <radialGradient id="spotG2">
        <stop offset="0" stopColor="#6E4434" stopOpacity="0.85" />
        <stop offset="0.7" stopColor="#6E4434" stopOpacity="0.35" />
        <stop offset="1" stopColor="#6E4434" stopOpacity="0" />
      </radialGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

// a phone, screen facing down toward the skin
const Phone: React.FC<{x: number; y: number; sc?: number; glow?: number; s: number; tilt?: number}> = ({x, y, sc = 1, glow = 1, s, tilt = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${sc})`}>
    <circle r={300} fill="url(#sbGlow)" opacity={0.7 * glow} />
    <rect x={-120} y={-230} width={240} height={460} rx={44} fill="#1C1420" stroke="#5C4A5E" strokeWidth={6} />
    <rect x={-104} y={-206} width={208} height={412} rx={32} fill="url(#screenG)" opacity={0.35 + 0.65 * glow} />
    {Array.from({length: 4}).map((_, i) => (
      <rect key={i} x={-80} y={-150 + i * 80} width={i % 2 ? 110 : 160} height={34} rx={12} fill="#fff" opacity={0.35 * glow} />
    ))}
    <rect x={-40} y={-222} width={80} height={14} rx={7} fill="#1C1420" />
    <rect x={-104} y={-206 + ((s * 0.3) % 1) * 412} width={208} height={6} fill="#fff" opacity={0.25 * glow} />
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

const Cite: React.FC<{text: string; o?: number; y?: number}> = ({text, o = 1, y = 1700}) => (
  <g opacity={o}>
    <rect x={W / 2 - text.length * 5.4 - 24} y={y - 26} width={text.length * 10.8 + 48} height={38} rx={19} fill="rgba(23,10,16,0.5)" />
    <text x={W / 2} y={y} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.85}>
      {text}
    </text>
  </g>
);

// =============== A: hook — a phone glowing over your skin ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tAging = cue('aging');
  const push = 1 + 0.07 * ease(prog(s, 0, S(1)));
  const q = ease(prog(s, tAging - 0.3, tAging + 0.4));
  return (
    <Svg cam={camZoom(push, W / 2, 1200)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#0E1230" opacity={0.35} />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={SB} o={0.6} />
      <SkinPlane s={s} fx={{dull: 0.15}} />
      {/* light cone onto skin */}
      <path d={`M${W / 2 - 100} 960 L ${W / 2 + 100} 960 L ${W / 2 + 460} 1780 L ${W / 2 - 460} 1780 Z`} fill="url(#cone)" opacity={0.6 + 0.15 * Math.sin(s * 3)} />
      <ellipse cx={W / 2} cy={1450} rx={420} ry={190} fill={SB} opacity={0.22} filter="url(#blur30)" />
      <Phone x={W / 2} y={760} sc={0.9} s={s} />
      <g transform={`translate(${W / 2 + 230} 560) scale(${0.6 + 0.4 * q})`} opacity={q}>
        <circle r={60} fill="rgba(23,10,16,0.7)" stroke={SB} strokeWidth={4} />
        <text y={24} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={68} fill={SB}>
          ?
        </text>
      </g>
    </Svg>
  );
};

// =============== B1: blue light serums say yes ===============
export const SceneB1: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tYes = cue('yes.');
  const push = 1.05 - 0.05 * ease(prog(s, t0 - 0.2, t0 + 1.2));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const yes = ease(prog(s, tYes - 0.3, tYes + 0.2));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1050} r={800} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={21} color={SB} o={0.5} />
      <g transform={`translate(${W / 2} ${1060 + (1 - inK) * 60}) rotate(${Math.sin(s * 1.5) * 3})`} opacity={inK}>
        <circle r={340} fill="url(#sbGlow)" opacity={0.6} />
        <rect x={-40} y={-330} width={80} height={90} rx={14} fill="#2A1D2C" />
        <rect x={-26} y={-400} width={52} height={80} rx={20} fill="#3A2A3C" />
        <rect x={-150} y={-250} width={300} height={500} rx={60} fill="rgba(190,210,255,0.35)" stroke="rgba(255,255,255,0.7)" strokeWidth={5} />
        <rect x={-150} y={-50} width={300} height={300} rx={60} fill={SB} opacity={0.55} />
        <rect x={-120} y={-150} width={240} height={150} rx={18} fill="#F6F2FA" />
        <text y={-92} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.plum} letterSpacing={2}>
          BLUE LIGHT
        </text>
        <text y={-48} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.plum} letterSpacing={2}>
          DEFENSE
        </text>
        {Array.from({length: 6}).map((_, i) => {
          const ph = (s * 0.6 + i / 6) % 1;
          return <path key={i} d={`M${-200 + i * 80} ${-200 - ph * 60} l 8 -16 l 8 16 l 16 8 l -16 8 l -8 16 l -8 -16 l -16 -8 Z`} fill="#fff" opacity={0.7 * Math.sin(ph * Math.PI)} />;
        })}
      </g>
      <Pill x={W / 2} y={1520} k={yes} text="“protects from screens”" color={SB} dark size={30} />
    </Svg>
  );
};

// =============== B2: the review — up to 1,000× weaker ===============
export const SceneB2: React.FC<{s: number}> = ({s}) => {
  const t0 = cue('review');
  const tScreens = cue('screens');
  const t1000 = cue('1,000', 1);
  const tSun = cue('sunlight.');
  const push = 1 + 0.05 * ease(prog(s, t0, S(2)));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const sunBar = ease(prog(s, t0, t0 + 1.2));
  const phoneK = ease(prog(s, tScreens - 0.4, tScreens + 0.3));
  const badge = ease(prog(s, t1000 - 0.15, t1000 + 0.3));
  const sunHi = ease(prog(s, tSun - 0.4, tSun + 0.3));
  const BX = 300;
  const BW = 680;
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} color={SB} o={0.45} />
      <g opacity={inK}>
        <text x={W / 2} y={620} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush} letterSpacing={5}>
          BLUE LIGHT REACHING YOUR SKIN
        </text>
        {/* sun row */}
        <g transform="translate(170 860)">
          <circle r={70} fill={C.goldHot} />
          <circle r={110} fill={C.gold} opacity={0.35 + 0.2 * sunHi} filter="url(#blur12)" />
        </g>
        <rect x={BX} y={830} width={BW} height={60} rx={30} fill="rgba(255,255,255,0.08)" />
        <rect x={BX} y={830} width={BW * sunBar} height={60} rx={30} fill={SB} />
        <text x={BX} y={940} fontFamily="Poppins" fontWeight={700} fontSize={32} fill={C.white}>
          Sunlight
        </text>
        {/* phone row */}
        <g opacity={phoneK}>
          <Phone x={170} y={1180} sc={0.32} s={s} glow={0.8} />
          <rect x={BX} y={1150} width={BW} height={60} rx={30} fill="rgba(255,255,255,0.08)" />
          <rect x={BX} y={1150} width={Math.max(4, BW / 1000) * 2} height={60} rx={3} fill={SB} />
          <circle cx={BX + 3} cy={1180} r={14} fill={SB} opacity={0.5 + 0.5 * Math.sin(s * 6)} filter="url(#blur4)" />
          <text x={BX} y={1260} fontFamily="Poppins" fontWeight={700} fontSize={32} fill={C.white}>
            Screen
          </text>
        </g>
      </g>
      <Pill x={W / 2} y={1460} k={badge} text="up to 1,000× weaker" color={SB} size={38} />
      <Cite text="Lim et al., JAAD, 2022 · 99–1,000× less · screen bar not to scale" o={inK} />
    </Svg>
  );
};

// =============== C: two buckets ===============
const Bucket: React.FC<{x: number; y: number; fill: number; col: string; id: string}> = ({x, y, fill, col, id}) => (
  <g transform={`translate(${x} ${y})`}>
    <clipPath id={`bk${id}`}>
      <path d="M-130 -170 L 130 -170 L 100 150 L -100 150 Z" />
    </clipPath>
    <g clipPath={`url(#bk${id})`}>
      <rect x={-140} y={150 - 320 * clamp(fill)} width={280} height={340} fill={col} opacity={0.9} />
      <rect x={-140} y={150 - 320 * clamp(fill) - 4} width={280} height={8} fill="#fff" opacity={0.6} />
    </g>
    <path d="M-130 -170 L -100 150 L 100 150 L 130 -170" stroke="rgba(255,255,255,0.85)" strokeWidth={8} fill="rgba(255,255,255,0.06)" strokeLinejoin="round" />
    <ellipse cx={0} cy={-170} rx={130} ry={18} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={6} />
    <path d="M-130 -170 Q 0 -330 130 -170" stroke="rgba(255,255,255,0.45)" strokeWidth={6} fill="none" />
  </g>
);
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tSun = cue('sun', 2);
  const tSec = cue('seconds.');
  const tDrip = cue('drips');
  const tWeek = cue('slower.');
  const push = 1.04 + 0.05 * ease(prog(s, t0, S(3)));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const sunFill = ease(prog(s, tSun - 0.2, tSec + 0.3));
  const dripFill = 0.02 * ease(prog(s, tDrip, tWeek + 0.6));
  const slowK = ease(prog(s, cue('1,000', 2) - 0.3, cue('1,000', 2) + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={300} bottom={1300} seed={61} color={C.goldHot} o={0.45} />
      <rect x={-200} y={1340} width={W + 400} height={700} fill="#3A2230" />
      <g opacity={inK}>
        {/* sun pouring */}
        <g transform="translate(290 620)">
          <circle r={90} fill={C.goldHot} />
          <circle r={140} fill={C.gold} opacity={0.4} filter="url(#blur12)" />
        </g>
        <rect x={290 - 34 * sunFill * (1 - prog(s, tSec + 0.3, tSec + 1))} y={720} width={68 * sunFill * (1 - prog(s, tSec + 0.3, tSec + 1))} height={420} fill="url(#goldW)" opacity={0.85} />
        <Bucket x={290} y={1190} fill={0.92 * sunFill} col={C.gold} id="sun" />
        <text x={290} y={1420} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.white}>
          SUN · SECONDS
        </text>
        {/* phone dripping */}
        <Phone x={790} y={640} sc={0.42} s={s} glow={0.8} tilt={180} />
        {s > tDrip - 0.3 &&
          Array.from({length: 3}).map((_, i) => {
            const ph = (s * 0.9 + i / 3) % 1;
            return <circle key={i} cx={790} cy={760 + ph * 420} r={10} fill={SB} opacity={1 - ph * 0.5} />;
          })}
        <Bucket x={790} y={1190} fill={dripFill} col={SB} id="ph" />
        <text x={760} y={1420} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.white}>
          {slowK > 0.5 ? 'UP TO 1,000× SLOWER' : 'SCREEN · DRIP'}
        </text>
      </g>
      <Cite text="illustrative · ratio from Lim et al., 2022" o={inK} y={1520} />
    </Svg>
  );
};

// =============== D: the melasma screen study ===============
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const tMel = cue('melasma');
  const t20 = cue('20');
  const t8 = cue('8');
  const t5 = cue('5');
  const tWorse = cue('worse.');
  const push = 1.06 - 0.06 * ease(prog(s, t0 - 0.3, t0 + 1.2));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const melK = ease(prog(s, tMel - 0.4, tMel + 0.3));
  const dist = ease(prog(s, t20 - 0.3, t20 + 0.3));
  const hrs = ease(prog(s, t8 - 0.3, t8 + 0.3));
  const dys = ease(prog(s, t5 - 0.3, t5 + 0.3));
  const ok = ease(prog(s, tWorse - 0.3, tWorse + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1100} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={71} color={SB} o={0.45} />
      <g opacity={inK}>
        {/* cheek patch */}
        <ellipse cx={330} cy={1100} rx={250} ry={330} fill="url(#skinPlane)" />
        <ellipse cx={330} cy={1100} rx={250} ry={330} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={4} />
        {/* face features: closed eyes, brows, nose, lips */}
        <path d="M230 930 q 40 20 80 0 M370 930 q 40 20 80 0" stroke="#7A3446" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M225 895 q 45 -20 90 -4 M365 891 q 45 -16 90 4" stroke="#7A3446" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.7} />
        <path d="M340 960 q -14 70 -4 110 q 14 8 26 -4" stroke="#B9737F" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M285 1260 q 45 22 90 0" stroke="#A8566A" strokeWidth={9} fill="none" strokeLinecap="round" />
        {[
          [240, 1080, 60],
          [430, 1070, 52],
          [260, 1170, 40],
        ].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx={r * melK} ry={r * 0.75 * melK} fill="url(#spotG2)" />
        ))}
        <text x={330} y={700} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.white} letterSpacing={3} opacity={melK}>
          MELASMA
        </text>
        {/* screen facing the cheek */}
        <g transform="translate(860 1100) rotate(90)">
          <Phone x={0} y={0} sc={0.62} s={s} />
        </g>
        <path d={`M${600} 1100 L ${720} 1100`} stroke={SB} strokeWidth={6} opacity={0.5} />
        <path d="M590 980 L 590 1220" stroke={SB} strokeWidth={0} />
        {/* 20 cm arrow */}
        <g opacity={dist}>
          <path d="M600 1290 L 720 1290 M600 1270 L 600 1310 M720 1270 L 720 1310" stroke={C.white} strokeWidth={5} />
          <text x={660} y={1350} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white}>
            20 cm
          </text>
        </g>
        <Pill x={330} y={1540} k={hrs} text="8 h / day" color={SB} dark size={32} />
        <Pill x={760} y={1540} k={dys} text="5 days" color={SB} dark size={32} />
      </g>
      {ok > 0 && (
        <g transform={`translate(330 ${880}) scale(${0.7 + 0.3 * ok})`} opacity={ok}>
          <rect x={-200} y={-46} width={400} height={84} rx={42} fill="#7BD3A0" />
          <text y={12} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.plum}>
            ✓ no worse
          </text>
        </g>
      )}
      <Cite text="Duteil et al., J Am Acad Dermatol, 2020 (as summarised by Lim et al., 2022)" o={inK} y={1700} />
    </Svg>
  );
};

// =============== E: review of device studies ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tEv = cue('evidence');
  const tHarm = cue('harms');
  const push = 1 + 0.05 * ease(prog(s, t0, S(5)));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const scan = prog(s, t0 + 0.2, tEv);
  const stamp = ease(prog(s, tHarm - 0.2, tHarm + 0.2));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1050} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={81} color={SB} o={0.45} />
      {Array.from({length: 9}).map((_, i) => {
        const k = ease(clamp(inK * 1.4 - i * 0.06));
        const x = 250 + (i % 3) * 290;
        const y = 760 + Math.floor(i / 3) * 290;
        return (
          <g key={i} transform={`translate(${x} ${y + (1 - k) * 40}) rotate(${(rand(i) - 0.5) * 8})`} opacity={k * (1 - 0.35 * stamp)}>
            <rect x={-100} y={-120} width={200} height={240} rx={14} fill="#F6EDEF" />
            {Array.from({length: 6}).map((__, j) => (
              <rect key={j} x={-72} y={-90 + j * 32} width={j % 3 === 2 ? 80 : 144} height={10} rx={5} fill="#C9AEB6" />
            ))}
            <rect x={-72} y={60} width={50} height={36} rx={6} fill={SB} opacity={0.6} />
          </g>
        );
      })}
      {/* magnifier sweeping */}
      <g transform={`translate(${250 + 580 * scan} ${760 + 580 * (0.5 + 0.5 * Math.sin(scan * Math.PI * 2))})`} opacity={inK * (1 - stamp)}>
        <circle r={110} fill="rgba(190,210,255,0.15)" stroke="#fff" strokeWidth={10} />
        <path d="M78 78 L 150 150" stroke="#fff" strokeWidth={26} strokeLinecap="round" />
      </g>
      {stamp > 0 && (
        <g transform={`translate(${W / 2} 1050) rotate(-10) scale(${1.6 - 0.6 * stamp})`} opacity={stamp}>
          <rect x={-300} y={-90} width={600} height={180} rx={26} fill="rgba(23,10,16,0.65)" stroke="#7BD3A0" strokeWidth={10} />
          <text y={-16} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill="#7BD3A0" letterSpacing={6}>
            SCREEN LIGHT
          </text>
          <text y={56} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={56} fill="#7BD3A0" letterSpacing={5}>
            NO CLEAR HARM
          </text>
        </g>
      )}
      <Cite text="Ceresnie et al., Photochem Photobiol Sci, 2022 · systematic review of 9 device studies" o={inK} />
    </Svg>
  );
};

// =============== F: the real source is the sky ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tSky = cue('sky.');
  const tVis = cue('Visible');
  const tDark = cue('darken');
  const tLong = cue('longer');
  const push = 1.05 - 0.05 * ease(prog(s, t0 - 0.2, t0 + 1.2));
  const sunK = ease(prog(s, t0 - 0.4, tSky + 0.2));
  const band = ease(prog(s, tVis - 0.3, tVis + 0.6));
  const dark = ease(prog(s, tDark - 0.3, tDark + 0.8));
  const longK = ease(prog(s, tLong - 0.6, tLong + 0.3));
  const tfade = prog(s, tLong - 0.4, S(6) - 0.3);
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={C.goldHot} o={0.55} />
      <Sun x={W / 2 + 230} y={560} s={s} k={sunK} />
      <SkinPlane s={s} />
      {/* visible-light band */}
      <g opacity={band}>
        <path d={`M${W / 2 + 160} 620 L ${W / 2 + 300} 620 L ${W / 2 + 120} 1420 L ${W / 2 - 220} 1420 Z`} fill="url(#spectrum)" opacity={0.4} />
        <text x={120} y={760} fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.white} letterSpacing={4}>
          VISIBLE LIGHT
        </text>
      </g>
      {/* deeper-toned skin patch darkening */}
      <ellipse cx={W / 2 - 60} cy={1440} rx={330} ry={130} fill="#8E5A48" opacity={0.55} />
      <ellipse cx={W / 2 - 60} cy={1440} rx={250 * dark} ry={96 * dark} fill="url(#spotG2)" />
      {/* longer than UVA tan: two fading timers */}
      <g opacity={longK}>
        {[
          {x: 330, label: 'UVA TAN', fade: 0.85},
          {x: 750, label: 'LIGHT MARK', fade: 0.25},
        ].map((m, i) => (
          <g key={i} transform={`translate(${m.x} 1580)`}>
            <rect x={-190} y={-60} width={380} height={130} rx={26} fill="rgba(23,10,16,0.65)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
            <circle cx={-130} cy={4} r={34} fill="#6E4434" opacity={1 - m.fade * tfade} />
            <text x={-70} y={14} fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.white} letterSpacing={2}>
              {m.label}
            </text>
          </g>
        ))}
      </g>
      <Cite text="Mahmoud et al., J Invest Dermatol, 2010 · skin types IV–VI" o={band} y={1720} />
    </Svg>
  );
};

// =============== G: protect against the sun — tinted SPF ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tPanic = cue('panic');
  const tSun = cue('sun.', 6);
  const tTint = cue('tinted');
  const tOx = cue('pigments');
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const panic = ease(prog(s, tPanic - 0.3, tPanic + 0.3));
  const sunK = 0.35 + 0.65 * ease(prog(s, tSun - 0.5, tSun + 0.2));
  const tint = ease(prog(s, tTint - 0.4, tTint + 0.3));
  const ox = ease(prog(s, tOx - 0.4, tOx + 0.4));
  const blocked = tint;
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={91} color={C.goldHot} o={0.5} />
      <g transform="translate(0 260)">
        <SkinPlane s={s} fx={{film: tint, filmSheen: prog(s, tTint, tTint + 2)}} />
      </g>
      {/* phone calmed */}
      <g transform="translate(310 700)" opacity={inK * (1 - 0.6 * sunK)}>
        <Phone x={0} y={0} sc={0.45} s={s} glow={1 - 0.6 * panic} />
        <path d="M-120 120 L 120 -120" stroke="#FF7A80" strokeWidth={10} strokeLinecap="round" opacity={panic} />
      </g>
      <g opacity={sunK}>
        <Sun x={850} y={560} s={s} k={1} />
        <Beam d={wavePath(820, 640, 560, 1180 - 80 * blocked, 22, 120, s * 7, 1 - 0.25 * blocked)} color={C.gold} o={1} w={9} />
      </g>
      {/* tinted film with iron-oxide pigment */}
      <g opacity={tint}>
        <path d="M200 1150 Q 540 1070 900 1150" stroke="#C9926E" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d="M200 1150 Q 540 1070 900 1150" stroke="#F2C9A8" strokeWidth={8} fill="none" strokeLinecap="round" />
        {Array.from({length: 14}).map((_, i) => {
          const x = 230 + i * 48;
          const y = 1150 - Math.sin(((x - 200) / 700) * Math.PI) * 80;
          return <circle key={i} cx={x} cy={y} r={9 * ox} fill={['#B5532E', '#D8A24A', '#3C2A22'][i % 3]} />;
        })}
      </g>
      <Pill x={W / 2} y={1420} k={tint} text="tinted SPF" color="#F2C9A8" size={32} />
      <g opacity={ox}>
        <text x={W / 2} y={1520} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.white} letterSpacing={4}>
          PIGMENTS CAN BLOCK VISIBLE LIGHT
        </text>
      </g>
      <Cite text="Eadie et al., Br J Dermatol, 2023 · visible-light protection needs pigments" o={tint} y={1640} />
    </Svg>
  );
};

// =============== H: loop — phone over skin, then the sun + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tSunIs = cue('still');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tSunIs - 0.3, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const phoneOut = ease(prog(s, tSunIs - 0.8, tSunIs));
  const sunIn = ease(prog(s, tSunIs - 0.6, tSunIs + 0.3));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tSunIs, tSunIs + 1)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1300)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#0E1230" opacity={0.35 * (1 - sunIn)} />
        <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={SB} o={0.6} />
        <g opacity={1 - cardK}>
          <Sun x={W / 2} y={560} s={s} k={sunIn} />
        </g>
        <SkinPlane s={s} fx={{scan}} />
        <g opacity={(1 - phoneOut) * (1 - cardK)}>
          <path d={`M${W / 2 - 100} 960 L ${W / 2 + 100} 960 L ${W / 2 + 460} 1780 L ${W / 2 - 460} 1780 Z`} fill="url(#cone)" opacity={0.6} />
          <Phone x={W / 2} y={760} sc={0.9} s={s} />
        </g>
        <g opacity={mesh}>
          {nodes.map((a, i) => {
            const b = nodes[(i * 5 + 3) % nodes.length];
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.blush} strokeWidth={1.5} opacity={0.55} />;
          })}
          {nodes.map((a, i) => (
            <circle key={i} cx={a.x} cy={a.y} r={7} fill={C.gold} opacity={a.y < HORIZON + (H - HORIZON) * scan ? 1 : 0} />
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
