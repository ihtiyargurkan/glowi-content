import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, HORIZON} from './parts';
import {cue, S} from './timeline';

// accent for this topic: fresh mint (training)
const MT = '#8FD9C0';
const MUS = '#D9707E';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <radialGradient id="faceG" cx="0.45" cy="0.35">
        <stop offset="0" stopColor="#F6D6D0" />
        <stop offset="1" stopColor="#D99AA2" />
      </radialGradient>
      <radialGradient id="mtGlow">
        <stop offset="0" stopColor={MT} stopOpacity="0.5" />
        <stop offset="1" stopColor={MT} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="cheekG">
        <stop offset="0" stopColor="#F08A8C" stopOpacity="0.6" />
        <stop offset="1" stopColor="#F08A8C" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="musG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E88A96" />
        <stop offset="1" stopColor="#A8435A" />
      </linearGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

// stylised face: puff = cheek fullness 0..1, o = mouth "O" exercise 0..1, lift 0..1
const Face: React.FC<{x: number; y: number; sc?: number; puff?: number; mouthO?: number; lift?: number; ghost?: number}> = ({x, y, sc = 1, puff = 0, mouthO = 0, lift = 0, ghost = 0}) => {
  const cheekY = 90 - 25 * lift;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <ellipse cx={0} cy={-40} rx={300} ry={390} fill="#4A2230" />
      <path d={`M0 -330 C 190 -330, 260 -170, 255 0 C ${250 + 18 * puff} 150, ${170 + 10 * puff} 300, 0 340 C ${-170 - 10 * puff} 300, ${-250 - 18 * puff} 150, -255 0 C -260 -170, -190 -330, 0 -330 Z`} fill="url(#faceG)" />
      <path d="M-262 -40 C -250 -350, 250 -350, 262 -40 C 210 -230, -40 -280, -262 -40 Z" fill="#4A2230" />
      {/* brows + closed eyes */}
      <path d="M-170 -70 q 55 -26 110 -6 M60 -76 q 55 -20 110 6" stroke="#6E3442" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M-160 -18 q 50 24 100 0 M60 -18 q 50 24 100 0" stroke="#6E3442" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d="M10 0 q -20 90 -8 130 q 18 10 34 -4" stroke="#B9737F" strokeWidth={7} fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <ellipse cx={-150} cy={cheekY} rx={70 + 20 * puff} ry={50 + 14 * puff} fill="url(#cheekG)" />
      <ellipse cx={150} cy={cheekY} rx={70 + 20 * puff} ry={50 + 14 * puff} fill="url(#cheekG)" />
      {/* mouth */}
      {mouthO > 0.05 ? (
        <ellipse cx={0} cy={215} rx={30 + 8 * mouthO} ry={22 + 26 * mouthO} fill="#8E3F52" stroke="#A8566A" strokeWidth={6} />
      ) : (
        <path d={`M-60 210 q 60 ${26 + 10 * lift} 120 0`} stroke="#A8566A" strokeWidth={12} fill="none" strokeLinecap="round" />
      )}
      {ghost > 0 && <path d="M0 -330 C 190 -330, 260 -170, 255 0 C 250 150, 170 300, 0 340 C -170 300, -250 150, -255 0 C -260 -170, -190 -330, 0 -330 Z" fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="12 10" opacity={ghost} />}
    </g>
  );
};

const Woman: React.FC<{x: number; y: number; r?: number; col: string; o?: number}> = ({x, y, r = 18, col, o = 1}) => (
  <g opacity={o}>
    <circle cx={x} cy={y - r * 1.2} r={r} fill={col} />
    <path d={`M${x - r * 1.6} ${y + r * 2.2} q ${r * 1.6} ${-r * 3.4} ${r * 3.2} 0 Z`} fill={col} />
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

const Bg: React.FC<{s: number; seed: number; col?: string}> = ({s, seed, col = MT}) => (
  <>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
    <circle cx={W / 2} cy={1050} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
    <Bokeh s={s} seed={seed} color={col} o={0.45} />
  </>
);

// =============== A: hook — a face doing a face exercise ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tYoung = cue('younger?');
  const push = 1 + 0.07 * ease(prog(s, 0, S(1)));
  const rep = 0.5 - 0.5 * Math.cos(s * 4.2);
  const q = ease(prog(s, tYoung - 0.3, tYoung + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <Bg s={s} seed={5} />
      <circle cx={W / 2} cy={1080} r={460} fill="url(#mtGlow)" opacity={0.7} />
      {/* mirror frame */}
      <ellipse cx={W / 2} cy={1080} rx={400} ry={500} fill="rgba(246,233,236,0.06)" stroke="rgba(246,233,236,0.55)" strokeWidth={10} />
      <ellipse cx={W / 2} cy={1080} rx={380} ry={480} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={3} />
      <Face x={W / 2} y={1100} sc={1.05} puff={rep} mouthO={rep} />
      {/* rep arrows on the cheeks */}
      {[-1, 1].map((d) => (
        <path key={d} d={`M${W / 2 + d * 330} ${1140 - 60 * rep} l 0 -70 m -20 22 l 20 -22 l 20 22`} stroke={MT} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * rep} />
      ))}
      <g transform={`translate(${W / 2 + 300} 620) scale(${0.6 + 0.4 * q})`} opacity={q}>
        <circle r={62} fill="rgba(23,10,16,0.7)" stroke={MT} strokeWidth={4} />
        <text y={24} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={70} fill={MT}>
          ?
        </text>
      </g>
    </Svg>
  );
};

// =============== B: gimmick → put to the test ===============
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tG = cue('gimmick.');
  const tTest = cue('test.');
  const push = 1.05 - 0.05 * ease(prog(s, t0 - 0.2, t0 + 1.2));
  const gk = ease(prog(s, t0 - 0.3, tG + 0.2));
  const flip = ease(prog(s, tTest - 0.4, tTest + 0.3));
  const swing = Math.sin(s * 3) * 6 * (1 - flip);
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <Bg s={s} seed={21} />
      <Face x={W / 2} y={1150} sc={0.7} puff={0.5 + 0.5 * Math.sin(s * 4)} mouthO={0.5 + 0.5 * Math.sin(s * 4)} />
      {/* hanging tag */}
      <g transform={`translate(${W / 2} 560) rotate(${swing})`} opacity={gk}>
        <line x1={0} y1={-40} x2={0} y2={60} stroke={C.blush} strokeWidth={4} />
        <g transform={`translate(0 140) scale(${1 - 2 * Math.min(flip, 0.5) * (flip < 0.5 ? 1 : 0) + (flip >= 0.5 ? 2 * (flip - 0.5) : 0)} 1)`}>
          <rect x={-230} y={-70} width={460} height={140} rx={28} fill={flip >= 0.5 ? MT : 'rgba(23,10,16,0.75)'} stroke={flip >= 0.5 ? MT : '#FF7A80'} strokeWidth={6} />
          <text y={22} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={60} fill={flip >= 0.5 ? C.plum : '#FF7A80'} letterSpacing={4}>
            {flip >= 0.5 ? 'TESTED' : 'GIMMICK?'}
          </text>
        </g>
      </g>
      {/* clipboard appears on "test" */}
      <g transform={`translate(${W / 2 + 330} 1300) rotate(8) scale(${0.7 + 0.3 * flip})`} opacity={flip}>
        <rect x={-90} y={-120} width={180} height={240} rx={18} fill="#F6EDEF" />
        <rect x={-40} y={-136} width={80} height={32} rx={10} fill={C.plum} />
        {Array.from({length: 4}).map((_, i) => (
          <g key={i}>
            <path d={`M-66 ${-62 + i * 50} l 10 10 l 18 -20`} stroke={MT} strokeWidth={6} fill="none" strokeLinecap="round" />
            <rect x={-26} y={-66 + i * 50} width={90} height={10} rx={5} fill="#C9AEB6" />
          </g>
        ))}
      </g>
    </Svg>
  );
};

// =============== C: the protocol ===============
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const t16 = cue('16');
  const t40 = cue('40');
  const t30 = cue('30');
  const t8 = cue('8');
  const tOther = cue('other');
  const t20 = cue('20.');
  const push = 1 + 0.05 * ease(prog(s, t0, S(3)));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const women = prog(s, t0 - 0.3, t16 + 0.5);
  const ageK = ease(prog(s, t40 - 0.3, t40 + 0.3));
  const timer = ease(prog(s, t30 - 0.2, t30 + 1.0));
  const daily = ease(prog(s, t8 - 0.6, t8 + 0.4));
  const alt = ease(prog(s, tOther - 0.2, t20 + 0.3));
  const X0 = 140;
  const X1 = 940;
  const wx = (wk: number) => X0 + ((X1 - X0) * wk) / 20;
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <Bg s={s} seed={31} />
      {Array.from({length: 16}).map((_, i) => {
        const k = ease(clamp(women * 17 - i));
        return <Woman key={i} x={150 + (i % 8) * 112} y={600 + Math.floor(i / 8) * 130} col={i % 3 === 0 ? MT : C.blush} o={k * inK} />;
      })}
      <Pill x={W / 2} y={880} k={ageK} text="ages 40–65" color={MT} dark size={30} />
      {/* daily timer */}
      <g transform="translate(540 1080)" opacity={ease(prog(s, t30 - 0.4, t30))}>
        <circle r={95} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.3)" strokeWidth={10} />
        <circle r={95} fill="none" stroke={MT} strokeWidth={12} strokeDasharray={`${597 * timer} 597`} transform="rotate(-90)" strokeLinecap="round" />
        <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={48} fill={C.white}>
          30
        </text>
        <text y={46} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={20} fill={C.blush} letterSpacing={3}>
          MIN / DAY
        </text>
      </g>
      {/* 20-week timeline */}
      <g opacity={0.35 + 0.65 * ease(prog(s, t8 - 0.8, t8 - 0.2))}>
        <line x1={X0} y1={1340} x2={X1} y2={1340} stroke="rgba(238,221,226,0.25)" strokeWidth={18} strokeLinecap="round" />
        <line x1={X0} y1={1340} x2={X0 + (wx(8) - X0) * daily} y2={1340} stroke={MT} strokeWidth={18} strokeLinecap="round" />
        {Array.from({length: 12}).map((_, i) => {
          const k = clamp(alt * 12 - i);
          const x = wx(8) + 14 + i * ((wx(20) - wx(8) - 14) / 12);
          return <circle key={i} cx={x + 10} cy={1340} r={9 * k} fill={MT} />;
        })}
        {[0, 8, 20].map((w) => (
          <text key={w} x={wx(w)} y={1420} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.blush}>
            {w === 0 ? 'start' : `wk ${w}`}
          </text>
        ))}
        <text x={(X0 + wx(8)) / 2} y={1295} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={MT} letterSpacing={3}>
          DAILY
        </text>
        <text x={(wx(8) + wx(20)) / 2} y={1295} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={MT} letterSpacing={3} opacity={alt}>
          EVERY OTHER DAY
        </text>
      </g>
      <Cite text="Alam et al., JAMA Dermatology, 2018 · 16 women completed" o={inK} />
    </Svg>
  );
};

// =============== D: blinded age guesses 51 → 49 ===============
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const tGuess = cue('guessed');
  const t51 = cue('50.8');
  const t49 = cue('48.1.');
  const push = 1.05 - 0.05 * ease(prog(s, t0 - 0.2, t0 + 1.2));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const shuffle = prog(s, t0, tGuess);
  const k51 = ease(prog(s, t51 - 0.2, t51 + 0.3));
  const k49 = ease(prog(s, t49 - 0.2, t49 + 0.3));
  const swap = Math.sin(shuffle * Math.PI * 2) * 60 * (1 - shuffle);
  const card = (x: number, label: string, puff: number, n: string, k: number, hi: boolean) => (
    <g transform={`translate(${x} 1060)`}>
      <rect x={-210} y={-300} width={420} height={600} rx={36} fill="#F6EDEF" />
      <rect x={-190} y={-280} width={380} height={460} rx={24} fill="#4B2E39" />
      <Face x={0} y={-50} sc={0.55} puff={puff} lift={puff} />
      {puff > 0 && [-1, 1].map((dd) => <ellipse key={dd} cx={dd * 82} cy={0} rx={56} ry={40} fill="#F2A0A4" opacity={0.3 + 0.2 * k} filter="url(#blur12)" />)}
      <text x={170} y={-250} textAnchor="end" fontFamily="Poppins" fontWeight={500} fontSize={18} fill={C.blush} opacity={0.6}>illustration</text>
      <text y={250} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.plum} letterSpacing={3}>
        {label}
      </text>
      {k > 0 && (
        <g transform={`translate(0 -330) scale(${0.7 + 0.3 * k})`} opacity={k}>
          <rect x={-120} y={-50} width={240} height={96} rx={48} fill={hi ? MT : 'rgba(23,10,16,0.75)'} stroke={MT} strokeWidth={4} />
          <text y={18} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={52} fill={hi ? C.plum : C.white}>
            {n}
          </text>
        </g>
      )}
    </g>
  );
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <Bg s={s} seed={41} />
      <g opacity={inK}>
        {card(290 + swap, 'BEFORE', 0, '50.8', k51, false)}
        {card(790 - swap, 'AFTER', 1, '48.1', k49, true)}
        {/* blinded doctor: eye with mask band */}
        <g transform="translate(540 600)" opacity={ease(prog(s, t0 + 0.4, t0 + 1))}>
          <circle r={0} />
        </g>
      </g>
      <Pill x={W / 2} y={1530} k={ease(prog(s, tGuess - 0.4, tGuess + 0.2))} text="blinded doctors' guesses" color={C.blush} dark size={28} />
      <Cite text="Alam et al., JAMA Dermatology, 2018 · mean perceived age, week 0 vs week 20" o={inK} />
    </Svg>
  );
};

// =============== E: muscles as cushions under a sheet ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tMus = cue('muscle.');
  const tCush = cue('cushions');
  const tTrain = cue('Train');
  const tFull = cue('fuller,');
  const tLift = cue('lifting');
  const push = 1.22 - 0.08 * ease(prog(s, t0 - 0.3, t0 + 1.2));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const musK = 0.55 + 0.45 * ease(prog(s, tMus - 0.4, tCush + 0.3));
  const grow = ease(prog(s, tTrain - 0.2, tFull + 0.4));
  const lift = ease(prog(s, tFull - 0.2, tLift + 0.5));
  const pump = s > tTrain - 0.2 && s < tFull + 0.4 ? 0.5 - 0.5 * Math.cos((s - tTrain) * 9) : 0;
  const cush = [
    {x: 270, w: 190},
    {x: 540, w: 210},
    {x: 810, w: 190},
  ];
  const base = 1380;
  const heightOf = (i: number) => 170 + 110 * grow + 16 * pump;
  // sheet path follows cushion tops
  let d = '';
  for (let i = 0; i <= 80; i++) {
    const x = -60 + (i / 80) * (W + 120);
    let top = base - 40;
    cush.forEach((c, j) => {
      const dx = (x - c.x) / (c.w * 0.95);
      top = Math.min(top, base - 30 - heightOf(j) * 1.15 * Math.exp(-dx * dx * 1.6) * musK);
    });
    top -= 40 * lift * Math.exp(-(((x - 540) / 520) ** 2));
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (top - 26).toFixed(1);
  }
  return (
    <Svg cam={camZoom(push, W / 2, 1180)}>
      <Bg s={s} seed={51} />
      <rect x={-200} y={base} width={W + 400} height={H} fill="#5A2A35" />
      <text x={120} y={base + 70} fontFamily="Poppins" fontWeight={600} fontSize={30} fill={C.blush} letterSpacing={5} opacity={0.85 * inK}>
        BONE
      </text>
      {cush.map((c, i) => {
        const h = heightOf(i) * musK;
        return (
          <g key={i} opacity={musK}>
            <ellipse cx={c.x} cy={base - h * 0.5} rx={c.w * (1 + 0.08 * grow)} ry={h * 0.62} fill="url(#musG)" />
            {Array.from({length: 5}).map((_, j) => (
              <path key={j} d={`M${c.x - c.w * 0.75} ${base - h * 0.5 + (j - 2) * h * 0.2} Q ${c.x} ${base - h * 0.5 + (j - 2) * h * 0.2 - 16} ${c.x + c.w * 0.75} ${base - h * 0.5 + (j - 2) * h * 0.2}`} stroke="#F7B5BE" strokeWidth={3} fill="none" opacity={0.6} />
            ))}
          </g>
        );
      })}
      {/* the skin sheet */}
      <path d={`${d} L ${W + 60} ${base - 10} L -60 ${base - 10} Z`} fill="url(#faceG)" opacity={0.25} />
      <path d={d} stroke="url(#faceG)" strokeWidth={46} fill="none" strokeLinecap="round" opacity={inK} />
      <path d={d} stroke="#fff" strokeWidth={4} fill="none" opacity={0.5 * inK} transform="translate(0 -16)" />
      <text x={W - 130} y={base - 380 - 40 * lift} textAnchor="end" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={C.white} letterSpacing={4} opacity={inK}>
        SKIN
      </text>
      {/* faint cheek silhouette behind */}

      <text x={W / 2} y={base + 70} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={MUS} letterSpacing={4} opacity={musK}>
        CHEEK MUSCLES
      </text>
      {lift > 0 &&
        [300, 540, 780].map((x, i) => <path key={i} d={`M${x} ${900 - 30 * lift} l 0 -70 m -20 22 l 20 -22 l 20 22`} stroke={MT} strokeWidth={8} fill="none" strokeLinecap="round" opacity={lift} />)}
      <Cite text="mechanism suggested by Alam et al., 2018 · illustrative" o={inK} y={1640} />
    </Svg>
  );
};

// =============== F: only 16, no comparison group ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tComp = cue('comparison');
  const tHint = cue('hint,');
  const push = 1 + 0.05 * ease(prog(s, t0, S(6)));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const box = ease(prog(s, tComp - 0.4, tComp + 0.3));
  const stamp = ease(prog(s, tHint - 0.15, tHint + 0.25));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <Bg s={s} seed={61} />
      <g transform="translate(0 0)" opacity={inK}>
        <g transform={`translate(${250 * (1 - box)} 0)`}>
        <rect x={80} y={640} width={420} height={560} rx={36} fill="rgba(143,217,192,0.08)" stroke={MT} strokeWidth={4} />
        <text x={290} y={700} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={MT} letterSpacing={3}>
          EXERCISED
        </text>
        {Array.from({length: 16}).map((_, i) => (
          <Woman key={i} x={150 + (i % 4) * 92} y={790 + Math.floor(i / 4) * 105} r={15} col={MT} />
        ))}
        </g>
      </g>
      <Cite text="Alam et al., JAMA Dermatology, 2018 · 16 women, no control group" o={inK} />
      <g opacity={box}>
        <rect x={580} y={640} width={420} height={560} rx={36} fill="none" stroke="rgba(238,221,226,0.6)" strokeWidth={4} strokeDasharray="18 14" />
        <text x={790} y={700} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.blush} letterSpacing={3}>
          COMPARISON
        </text>
        <text x={790} y={940} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={96} fill="rgba(238,221,226,0.5)">
          ?
        </text>
        <text x={790} y={1040} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush} letterSpacing={2}>
          none in this study
        </text>
      </g>
      {stamp > 0 && (
        <g transform={`translate(${W / 2} 1400) rotate(-8) scale(${1.6 - 0.6 * stamp})`} opacity={stamp}>
          <rect x={-310} y={-84} width={620} height={168} rx={24} fill="rgba(23,10,16,0.65)" stroke={MT} strokeWidth={10} />
          <text y={-14} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={MT} letterSpacing={6}>
            PROMISING
          </text>
          <text y={54} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={56} fill={MT} letterSpacing={4}>
            HINT, NOT PROOF
          </text>
        </g>
      )}
    </Svg>
  );
};

// =============== G: consistent + sunscreen ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tCons = cue('consistent,');
  const tBasics = cue('basics.');
  const tSpf = cue('sunscreen');
  const tProven = cue('proof', 6);
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const cons = prog(s, tCons - 0.5, tBasics);
  const spf = ease(prog(s, tSpf - 0.4, tSpf + 0.3));
  const best = ease(prog(s, tProven - 0.3, tProven + 0.3));
  const citeK = ease(prog(s, tSpf - 0.3, tSpf + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON + 300} seed={71} color={C.goldHot} o={0.5} />
      <g transform="translate(0 420)">
        <SkinPlane s={s} fx={{film: spf, filmSheen: prog(s, tSpf, tSpf + 2)}} />
      </g>
      {/* consistency streak */}
      <g opacity={inK} transform="translate(0 0)">
        {Array.from({length: 7}).map((_, i) => {
          const k = ease(clamp(cons * 8 - i));
          const x = 180 + i * 120;
          return (
            <g key={i} transform={`translate(${x} ${700 - 60 * spf}) scale(1.15)`}>
              <rect x={-44} y={-44} width={88} height={88} rx={18} fill="rgba(23,10,16,0.65)" stroke={k > 0.5 ? MT : 'rgba(238,221,226,0.35)'} strokeWidth={3} />
              <text y={-56} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={20} fill={C.blush}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </text>
              <path d="M-16 0 l 10 12 l 22 -26" stroke={MT} strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
            </g>
          );
        })}
      </g>
      {/* sunscreen */}
      <g transform={`translate(${W / 2} 990) rotate(-12) scale(${0.8 + 0.2 * spf})`} opacity={spf}>
        <circle r={190} fill={C.gold} opacity={0.2} filter="url(#blur30)" />
        <path d="M -70 -150 L 70 -150 L 58 110 L -58 110 Z" fill={C.blush} />
        <rect x={-36} y={110} width={72} height={44} rx={10} fill={C.plum} />
        <text y={-10} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={48} fill={C.plum}>
          SPF
        </text>
      </g>
      <Pill x={W / 2} y={1270} k={best} text="far stronger proof" color={MT} size={32} />
      <Cite text="Hughes et al., Ann Intern Med, 2013 · 903 adults, 4.5 years" o={citeK} y={1420} />
    </Svg>
  );
};

// =============== H: loop — the face, held up from below + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tBelow = cue('below.');
  const tGlowi = cue('Glowi');
  const scanK = prog(s, tBelow - 0.3, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const under = ease(prog(s, t0 + 0.3, tBelow));
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1100)}>
        <Bg s={s} seed={5} />
        <g opacity={1 - cardK}>
          <circle cx={W / 2} cy={1080} r={460} fill="url(#mtGlow)" opacity={0.7} />
          <ellipse cx={W / 2} cy={1080} rx={400} ry={500} fill="rgba(246,233,236,0.06)" stroke="rgba(246,233,236,0.55)" strokeWidth={10} />
          {/* cushions glowing under the cheeks */}
          {[-1, 1].map((d) => (
            <ellipse key={d} cx={W / 2 + d * 150} cy={1200} rx={120} ry={80} fill={MUS} opacity={0.45 * under} filter="url(#blur12)" />
          ))}
          <Face x={W / 2} y={1100} sc={1.05} puff={0.4 * under} lift={under} />
          {[-1, 1].map((d) => (
            <path key={d} d={`M${W / 2 + d * 150} ${1420} l 0 -80 m -20 22 l 20 -22 l 20 22`} stroke={MT} strokeWidth={8} fill="none" strokeLinecap="round" opacity={under} />
          ))}
          {/* scan line */}
          {scanK > 0 && scanK < 1 && <rect x={W / 2 - 400} y={580 + 1000 * scanK} width={800} height={6} fill={MT} opacity={0.85} />}
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
export const SCENES: React.FC<{s: number}>[] = [SceneA, SceneB, SceneC, SceneD, SceneE, SceneF, SceneG, SceneH];
export const bounds = (end: number) => [0, S(1), S(2), S(3), S(4) + 0.6, S(5), S(6), S(7) + 0.3, end];
