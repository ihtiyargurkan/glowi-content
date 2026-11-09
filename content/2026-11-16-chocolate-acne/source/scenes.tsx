import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, HORIZON} from './parts';
import {cue, S} from './timeline';

// accent for this topic: cocoa brown
const CHOC = '#5E321F';
const CHOC_HI = '#9A5A36';
const CHOC_DEEP = '#3A1C10';
const BUMP = '#E2556A';
const BACT = '#B79CFF';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <linearGradient id="chocG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={CHOC_HI} />
        <stop offset="0.5" stopColor={CHOC} />
        <stop offset="1" stopColor={CHOC_DEEP} />
      </linearGradient>
      <linearGradient id="pieceG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#B06C44" />
        <stop offset="1" stopColor={CHOC} />
      </linearGradient>
      <linearGradient id="foilG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF1C9" />
        <stop offset="0.5" stopColor={C.gold} />
        <stop offset="1" stopColor="#B88A3C" />
      </linearGradient>
      <radialGradient id="bumpG" cx="0.45" cy="0.4">
        <stop offset="0" stopColor="#FF9AA6" />
        <stop offset="0.6" stopColor={BUMP} />
        <stop offset="1" stopColor={BUMP} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="cellG" cx="0.4" cy="0.35">
        <stop offset="0" stopColor="#FFF4F6" />
        <stop offset="1" stopColor="#E7B9C3" />
      </radialGradient>
      <radialGradient id="alarmG">
        <stop offset="0" stopColor={C.uvb} stopOpacity="0.6" />
        <stop offset="1" stopColor={C.uvb} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="cheekG" cx="0.5" cy="0.45">
        <stop offset="0" stopColor="#F6D7D3" />
        <stop offset="1" stopColor="#D99AA2" />
      </radialGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

// chocolate bar: cols x rows of pieces, optional snap in the middle and gold foil
const Bar: React.FC<{x: number; y: number; w: number; h: number; rot?: number; snap?: number; foil?: number; o?: number; label?: string}> = ({x, y, w, h, rot = 0, snap = 0, foil = 0, o = 1, label}) => {
  const cols = 4;
  const rows = 6;
  const pw = w / cols;
  const ph = h / rows;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
      <ellipse cx={0} cy={h / 2 + 40} rx={w * 0.7} ry={30} fill="#170A10" opacity={0.4} filter="url(#blur12)" />
      {[0, 1].map((half) => {
        const dy = half === 0 ? -snap * 60 : snap * 60;
        const dr = half === 0 ? -snap * 8 : snap * 6;
        return (
          <g key={half} transform={`translate(${half === 0 ? -snap * 20 : snap * 20} ${dy}) rotate(${dr})`}>
            {Array.from({length: rows / 2}).map((_, r) =>
              Array.from({length: cols}).map((__, c) => {
                const px = -w / 2 + c * pw;
                const py = -h / 2 + (r + half * (rows / 2)) * ph;
                return (
                  <g key={`${r}-${c}`}>
                    <rect x={px + 3} y={py + 3} width={pw - 6} height={ph - 6} rx={10} fill={CHOC_DEEP} />
                    <rect x={px + 12} y={py + 10} width={pw - 24} height={ph - 24} rx={8} fill="url(#pieceG)" />
                    <rect x={px + 16} y={py + 14} width={pw - 40} height={8} rx={4} fill="#D9986A" opacity={0.6} />
                  </g>
                );
              }),
            )}
          </g>
        );
      })}
      {foil > 0 && (
        <g opacity={foil}>
          <path d={`M${-w / 2 - 8} ${h / 2 - h * 0.35} L ${w / 2 + 8} ${h / 2 - h * 0.45} L ${w / 2 + 8} ${h / 2 + 8} L ${-w / 2 - 8} ${h / 2 + 8} Z`} fill="url(#foilG)" />
          <path d={`M${-w / 2 - 8} ${h / 2 - h * 0.35} L ${w / 2 + 8} ${h / 2 - h * 0.45}`} stroke="#FFF7DE" strokeWidth={6} />
        </g>
      )}
      {label && (
        <g transform={`translate(0 ${h / 2 + 90})`}>
          <text textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

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

const Stamp: React.FC<{x: number; y: number; k: number; text: string; color: string; w?: number}> = ({x, y, k, text, color, w = 420}) =>
  k > 0 ? (
    <g transform={`translate(${x} ${y}) rotate(-10) scale(${1.5 - 0.5 * k})`} opacity={k}>
      <rect x={-w / 2} y={-52} width={w} height={104} rx={20} fill="#FFFFFF" stroke={color} strokeWidth={8} />
      <text y={18} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={52} fill={color} letterSpacing={6}>
        {text}
      </text>
    </g>
  ) : null;

// blemishes on the perspective skin plane
const BLEM = Array.from({length: 22}).map((_, i) => ({x: 160 + rand(i * 7 + 2) * 760, y: 1180 + rand(i * 11 + 3) * 560, kind: i % 2, d: rand(i * 5)}));
const Blemishes: React.FC<{s: number; bh: number; bump: number}> = ({s, bh, bump}) => (
  <g>
    {BLEM.map((b, i) => {
      const sc = 0.6 + ((b.y - 1180) / 560) * 0.8;
      if (b.kind === 0) {
        const k = clamp(bh * 1.5 - b.d * 0.5);
        return k > 0 ? <ellipse key={i} cx={b.x} cy={b.y} rx={14 * sc * k} ry={9 * sc * k} fill="#3A2028" opacity={0.9} /> : null;
      }
      const k = clamp(bump * 1.5 - b.d * 0.5);
      return k > 0 ? (
        <g key={i} opacity={k}>
          <ellipse cx={b.x} cy={b.y} rx={44 * sc * k} ry={22 * sc * k} fill={BUMP} opacity={0.35} filter="url(#blur4)" />
          <ellipse cx={b.x} cy={b.y} rx={24 * sc * k} ry={13 * sc * k} fill={BUMP} />
          <ellipse cx={b.x - 5 * sc} cy={b.y - 4 * sc} rx={7 * sc * k} ry={4 * sc * k} fill="#FFD3D9" opacity={0.8} />
        </g>
      ) : null;
    })}
  </g>
);

// =============== A: hook — chocolate bar over skin, it snaps, a bump appears ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tBreak = cue('break');
  const push = 1 + 0.07 * ease(prog(s, 0, S(1)));
  const snap = ease(prog(s, tBreak - 0.5, tBreak));
  const bump = ease(prog(s, tBreak - 0.3, tBreak + 0.4));
  return (
    <Svg cam={camZoom(push, W / 2, 1200)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={5} color={C.goldHot} o={0.6} />
      <circle cx={W / 2} cy={760} r={420} fill={C.goldHot} opacity={0.12} filter="url(#blur30)" />
      <SkinPlane s={s} />
      <Blemishes s={s} bh={0.25} bump={bump} />
      {/* crumbs falling */}
      {Array.from({length: 18}).map((_, i) => {
        const ph = (s * 0.5 + rand(i * 3)) % 1;
        const x = 320 + rand(i * 7) * 440 + ph * 40 * (rand(i) - 0.5);
        const y = 980 + ph * 700;
        return <rect key={i} x={x} y={y} width={10 + rand(i) * 10} height={8 + rand(i * 2) * 8} rx={3} fill={CHOC_HI} opacity={(1 - ph) * 0.9} transform={`rotate(${ph * 300 + i * 20} ${x} ${y})`} />;
      })}
      <Bar x={W / 2} y={760 + Math.sin(s * 1.6) * 12} w={380} h={520} rot={-14 + Math.sin(s) * 3} snap={snap} foil={1} />
    </Svg>
  );
};

// =============== B: 1969 "no link" — but the placebo bar was fat + sugar too ===============
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tNo = cue('no', 1);
  const tFake = cue('fake');
  const tFat = cue('fat');
  const tSugar = cue('sugar');
  const push = 1.05 - 0.05 * ease(prog(s, t0 - 0.2, S(2)));
  const paper = ease(prog(s, t0 - 0.2, t0 + 0.5));
  const stamp = ease(prog(s, tNo - 0.1, tNo + 0.3));
  const split = ease(prog(s, tFake - 0.5, tFake + 0.4));
  const fat = ease(prog(s, tFat - 0.3, tFat + 0.3));
  const sug = ease(prog(s, tSugar - 0.3, tSugar + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1050} r={800} fill={C.plum} opacity={0.75} filter="url(#blur30)" />
      <Bokeh s={s} seed={21} o={0.5} />
      {/* the 1969 paper, slides up and shrinks when the bars come in */}
      <g transform={`translate(${W / 2} ${1020 - 380 * split}) scale(${1 - 0.45 * split}) rotate(${-4 + 4 * split})`} opacity={paper}>
        <rect x={-300} y={-360} width={600} height={720} rx={18} fill="#F4ECE4" />
        <rect x={-300} y={-360} width={600} height={110} rx={18} fill="#E6D8CC" />
        <text x={0} y={-290} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={50} fill={C.plum}>
          1969 STUDY
        </text>
        {Array.from({length: 9}).map((_, i) => (
          <rect key={i} x={-240} y={-200 + i * 56} width={i % 3 === 2 ? 300 : 480} height={18} rx={9} fill="#CDBFB6" />
        ))}
        <Stamp x={0} y={130} k={stamp} text="NO LINK" color="#3E8E5A" />
      </g>
      {/* two bars: chocolate vs "placebo" */}
      {split > 0 && (
        <g opacity={split}>
          <Bar x={300} y={1180} w={250} h={360} rot={-6} label="Chocolate bar" />
          <g transform="translate(780 1180) rotate(6)">
            <rect x={-125} y={-180} width={250} height={360} rx={18} fill="#C9A88E" />
            {Array.from({length: 6}).map((_, r) =>
              Array.from({length: 4}).map((__, c) => <rect key={`${r}-${c}`} x={-125 + c * 62.5 + 8} y={-180 + r * 60 + 8} width={46} height={44} rx={8} fill="#DDBFA6" />),
            )}
            <text y={270} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white}>
              “Placebo” bar
            </text>
          </g>
          <g transform="translate(780 1110)">
            <Pill x={0} y={0} k={fat} text="FAT" color={C.plum} fill={C.goldHot} size={36} w={200} />
            <Pill x={0} y={130} k={sug} text="SUGAR" color={C.plum} fill={C.blush} size={36} w={240} />
          </g>
        </g>
      )}
      <text x={W / 2} y={1660} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={21} fill={C.blush} opacity={0.55 * paper}>
        Fulton et al., JAMA, 1969 · placebo bar critique: Caperton et al., J Clin Aesthet Dermatol, 2014
      </text>
    </Svg>
  );
};

// =============== C: real cocoa — 25 men, 25 g of 99% dark chocolate a day ===============
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const t2016 = cue('2016', 2);
  const tMen = cue('men', 2);
  const tPct = cue('99%');
  const tDay = cue('day', 2);
  const push = 1 + 0.06 * ease(prog(s, t0, S(3)));
  const barK = ease(prog(s, t0 - 0.2, t0 + 0.6));
  const menK = ease(prog(s, tMen - 0.5, tMen + 0.3));
  const pct = ease(prog(s, tPct - 0.2, tPct + 0.3));
  const days = Math.round(28 * ease(prog(s, tPct, cue('weeks', 2) + 0.3)));
  const beans = ease(prog(s, t0 + 0.6, t0 + 1.6));
  const tagK = ease(prog(s, t0 - 0.1, t0 + 0.5));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={800} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <circle cx={W / 2} cy={900} r={340} fill={C.goldHot} opacity={0.08} filter="url(#blur30)" />
      <Bokeh s={s} seed={31} o={0.5} />
      <Pill x={W / 2} y={590} k={tagK} text={s < t2016 - 0.2 ? 'newer studies' : '2016 study'} color={C.blush} size={32} w={330} />
      {/* 25 people icons */}
      <g opacity={menK}>
        {Array.from({length: 25}).map((_, i) => {
          const c = i % 13;
          const r = Math.floor(i / 13);
          const x = 120 + c * 70 + r * 35;
          const y = 720 + r * 90;
          const k = clamp(menK * 2 - (i / 25) * 1);
          return (
            <g key={i} opacity={k} transform={`translate(${x} ${y})`}>
              <circle cy={-18} r={14} fill={C.blush} />
              <path d="M-20 22 Q -20 0 0 0 Q 20 0 20 22 Z" fill={C.blush} />
            </g>
          );
        })}
      </g>
      {Array.from({length: 7}).map((_, i) => {
        const a = (i / 7) * Math.PI * 2 + s * 0.3;
        const x = W / 2 + Math.cos(a) * 270;
        const y = 1170 + Math.sin(a) * 230;
        return (
          <g key={i} opacity={beans * (1 - 0.6 * menK)} transform={`translate(${x} ${y}) rotate(${a * 57})`}>
            <ellipse rx={44} ry={28} fill="url(#chocG)" />
            <path d="M-34 0 Q 0 -10 34 0" stroke={CHOC_DEEP} strokeWidth={5} fill="none" />
          </g>
        );
      })}
      <Bar x={W / 2} y={1170} w={250} h={340} rot={-8 + Math.sin(s) * 2} foil={0} o={barK} />
      <Pill x={W / 2 + 250} y={1050} k={pct} text="99%" sub="25 g · 99% DARK" color={C.plum} fill={C.goldHot} size={50} w={230} />
      {/* 28-day strip */}
      <g opacity={barK} transform="translate(0 1480)">
        {Array.from({length: 28}).map((_, i) => {
          const x = 108 + (i % 14) * 62;
          const y = Math.floor(i / 14) * 62;
          const on = i < days;
          return <rect key={i} x={x} y={y} width={50} height={50} rx={10} fill={on ? CHOC_HI : 'rgba(238,221,226,0.1)'} stroke={on ? C.goldHot : 'none'} strokeWidth={2} />;
        })}
        <text x={W / 2} y={160} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={4} opacity={0.85}>
          EVERY DAY · 4 WEEKS
        </text>
      </g>
      <text x={W / 2} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={21} fill={C.blush} opacity={0.55 * barK}>
        Caperton et al., 2014 (cocoa, 14 men) · Vongraviopap & Asawanonda, 2016 (25 acne-prone men)
      </text>
    </Svg>
  );
};

// =============== D: within 2 weeks — more blackheads, more red bumps ===============
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const t2 = cue('2', 3);
  const tBH = cue('blackheads');
  const tBump = cue('bumps');
  const push = 1.04 + 0.08 * ease(prog(s, t0, S(4)));
  const wk = ease(prog(s, t2 - 0.2, t2 + 0.3));
  const bh = ease(prog(s, tBH - 0.4, tBH + 0.6));
  const bump = ease(prog(s, tBump - 0.4, tBump + 0.6));
  return (
    <Svg cam={camZoom(push, W / 2, 1300)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={45} color={C.goldHot} o={0.5} />
      <SkinPlane s={s} />
      <Blemishes s={s} bh={0.3 + 0.7 * bh} bump={0.2 + 0.8 * bump} />
      <Pill x={W / 2} y={560} k={wk} text="within 2 weeks" color={C.plum} fill={C.blush} size={44} />
      {/* magnified close-up */}
      <g transform="translate(760 820)">
        <circle r={190} fill="url(#cheekG)" stroke={C.blush} strokeWidth={8} />
        <circle r={190} fill="none" stroke="#fff" strokeWidth={2} opacity={0.5} />
        {[
          [-70, -50],
          [40, 60],
          [90, -40],
        ].map(([x, y], i) => (
          <g key={i} opacity={clamp(bh * 1.5 - i * 0.25)}>
            <circle cx={x} cy={y} r={18} fill="#3A2028" />
            <circle cx={x - 5} cy={y - 5} r={5} fill="#7A5A62" />
          </g>
        ))}
        {[
          [-20, 20],
          [-100, 70],
        ].map(([x, y], i) => (
          <g key={i} opacity={clamp(bump * 1.5 - i * 0.3)}>
            <circle cx={x} cy={y} r={44} fill={BUMP} opacity={0.35} filter="url(#blur4)" />
            <circle cx={x} cy={y} r={26} fill={BUMP} />
            <circle cx={x - 8} cy={y - 8} r={7} fill="#FFD3D9" />
          </g>
        ))}
        <rect x={130} y={130} width={40} height={130} rx={18} fill={C.blush} transform="rotate(-45 130 130)" />
      </g>
      <g opacity={bh} transform="translate(130 760)">
        <circle r={14} fill="#3A2028" />
        <text x={30} y={10} fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.white} letterSpacing={2}>
          BLACKHEADS
        </text>
      </g>
      <g opacity={bump} transform="translate(130 840)">
        <circle r={16} fill={BUMP} />
        <text x={30} y={10} fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.white} letterSpacing={2}>
          RED BUMPS
        </text>
      </g>
      <text x={W / 2} y={1770} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={21} fill={C.white} opacity={0.6}>
        Vongraviopap & Asawanonda, 2016 · significant rise from week 2 · illustrative skin
      </text>
    </Svg>
  );
};

// =============== E: the clue — immune cells over-react to acne bacteria (smoke alarm) ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tChoc = cue('chocolate', 4);
  const tImm = cue('immune');
  const tBact = cue('bacteria');
  const tAlarm = cue('alarm');
  const tSens = cue('sensitive');
  const push = 1.05 - 0.05 * ease(prog(s, t0 - 0.3, S(5)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.5));
  const choc = ease(prog(s, tChoc - 0.3, tChoc + 0.4));
  const clue = ease(prog(s, t0 - 0.2, cue('clue') + 0.3));
  const imm = 0.55 + 0.45 * ease(prog(s, tImm - 0.4, tImm + 0.3));
  const bact = 0.5 + 0.5 * ease(prog(s, tBact - 0.4, tBact + 0.3));
  const react = ease(prog(s, tBact - 0.1, tBact + 0.8));
  const alarm = ease(prog(s, cue('smoke') - 0.3, cue('smoke') + 0.3));
  const dial = ease(prog(s, tSens - 0.6, tSens + 0.4));
  const blare = alarm * (0.5 + 0.5 * Math.sin(s * 14));
  const cells = [
    {x: 300, y: 1180},
    {x: 540, y: 1300},
    {x: 780, y: 1180},
  ];
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1100} r={800} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={81} o={0.5} />
      <circle cx={W / 2} cy={1150} r={520} fill="url(#alarmG)" opacity={0.6 * blare} />
      {/* magnifier ring framing the lab view */}
      <circle cx={W / 2} cy={1270} r={470} fill="rgba(238,221,226,0.04)" stroke={C.blush} strokeWidth={6} opacity={0.5 * clue} strokeDasharray="4 14" transform={`rotate(${s * 6} ${W / 2} 1270)`} />
      {/* bacteria */}
      {Array.from({length: 9}).map((_, i) => {
        const x = 200 + rand(i * 3) * 680 + Math.sin(s * 1.5 + i) * 14;
        const y = 1400 + rand(i * 7) * 180;
        const k = clamp(bact * 1.6 - rand(i) * 0.6);
        return (
          <g key={i} opacity={k * inK} transform={`translate(${x} ${y}) rotate(${rand(i * 5) * 180 + s * 10})`}>
            <rect x={-34} y={-14} width={68} height={28} rx={14} fill={BACT} opacity={0.9} />
            <rect x={-26} y={-8} width={30} height={8} rx={4} fill="#fff" opacity={0.4} />
          </g>
        );
      })}
      <text x={W / 2} y={1660} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={BACT} letterSpacing={5} opacity={bact}>
        ACNE BACTERIA
      </text>
      {/* immune cells */}
      {cells.map((c, i) => {
        const pulse = 1 + 0.06 * Math.sin(s * 6 + i) * (0.3 + choc);
        return (
          <g key={i} opacity={imm} transform={`translate(${c.x} ${c.y}) scale(${pulse})`}>
            <circle r={110} fill={C.blush} opacity={0.18 + 0.3 * choc * react} filter="url(#blur12)" />
            <circle r={78} fill="url(#cellG)" />
            <circle cx={-14} cy={-10} r={28} fill="#C98DA0" opacity={0.6} />
            {/* signal molecules fired at the bacteria */}
            {react > 0 &&
              Array.from({length: Math.round(4 + 8 * choc)}).map((_, j) => {
                const ph = (s * 0.9 + j / 8 + i * 0.3) % 1;
                const a = Math.PI / 2 + (rand(j * 3 + i) - 0.5) * 1.6;
                return <circle key={j} cx={Math.cos(a) * (90 + ph * 200)} cy={Math.sin(a) * (90 + ph * 200)} r={9 * (1 - ph)} fill={C.uvb} opacity={react * (1 - ph)} />;
              })}
          </g>
        );
      })}
      <text x={W / 2} y={1010} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={5} opacity={imm}>
        IMMUNE CELLS
      </text>
      {/* chocolate token */}
      <g opacity={choc} transform="translate(250 640) scale(1.2)">
        <rect x={-55} y={-70} width={110} height={140} rx={14} fill="url(#chocG)" />
        <path d="M-55 -20 L 55 -20 M-55 25 L 55 25 M0 -70 L 0 70" stroke={CHOC_DEEP} strokeWidth={6} />
        <text y={115} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={C.blush} letterSpacing={3}>
          AFTER CHOCOLATE
        </text>
      </g>
      {/* smoke alarm with sensitivity dial */}
      <g opacity={alarm} transform={`translate(700 610) scale(${1.6 * (0.85 + 0.15 * alarm)})`}>
        <circle r={120} fill="url(#alarmG)" opacity={blare} />
        <ellipse rx={100} ry={36} cy={20} fill="#D9CDD2" />
        <ellipse rx={100} ry={36} cy={0} fill="#F4EEF0" />
        <circle r={14} cy={0} fill={C.uvb} opacity={0.4 + 0.6 * blare} />
        {[0, 1, 2].map((j) => (
          <path key={j} d={`M${120 + j * 30} -40 q 20 40 0 80`} stroke={C.uvb} strokeWidth={6} fill="none" opacity={blare * (1 - j * 0.25)} strokeLinecap="round" />
        ))}
        {[0, 1, 2].map((j) => (
          <path key={j} d={`M${-120 - j * 30} -40 q -20 40 0 80`} stroke={C.uvb} strokeWidth={6} fill="none" opacity={blare * (1 - j * 0.25)} strokeLinecap="round" />
        ))}
        <g transform="translate(0 130)" opacity={dial}>
          <path d="M-80 0 A 80 80 0 0 1 80 0" stroke="rgba(238,221,226,0.3)" strokeWidth={14} fill="none" />
          <path d="M-80 0 A 80 80 0 0 1 80 0" stroke={C.uvb} strokeWidth={14} fill="none" pathLength={1} strokeDasharray={`${0.3 + 0.65 * dial} 1`} />
          <line x1={0} y1={0} x2={Math.cos(Math.PI * (1 - 0.3 - 0.65 * dial)) * 70} y2={-Math.sin(Math.PI * (1 - 0.3 - 0.65 * dial)) * 70} stroke={C.white} strokeWidth={6} strokeLinecap="round" />
          <text y={50} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush} letterSpacing={2}>
            TOO SENSITIVE
          </text>
        </g>
      </g>
      <text x={W / 2} y={1730} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={21} fill={C.blush} opacity={0.55 * inK}>
        Netea et al., Cytokine, 2013 · lab study on blood cells · illustrative
      </text>
    </Svg>
  );
};

// =============== F: small studies → possible trigger, not proven cause ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tSmall = cue('studies', 5);
  const tMen = cue('men', 5);
  const tComp = cue('comparison');
  const tTrig = cue('trigger');
  const tCause = cue('cause');
  const push = 1.04 - 0.04 * ease(prog(s, t0, S(6)));
  const chips = [
    {t: tSmall, text: 'SMALL STUDIES', y: 640},
    {t: tMen, text: 'MOSTLY MEN', y: 760},
    {t: tComp, text: 'NO COMPARISON GROUP (2016)', y: 880},
  ];
  const trig = ease(prog(s, tTrig - 0.3, tTrig + 0.3));
  const cause = ease(prog(s, tCause - 0.3, tCause + 0.3));
  const sway = Math.sin(s * 1.6) * 3;
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1050} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={91} o={0.5} />
      {chips.map((c, i) => {
        const k = ease(prog(s, c.t - 0.35, c.t + 0.25));
        const w = c.text.length * 22 + 120;
        return (
          <g key={i} opacity={k} transform={`translate(${W / 2 + (1 - k) * 60} ${c.y})`}>
            <rect x={-w / 2} y={-42} width={w} height={84} rx={42} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.4)" strokeWidth={3} />
            <circle cx={-w / 2 + 44} cy={0} r={18} fill={C.goldHot} />
            <path d={`M${-w / 2 + 44} -9 L ${-w / 2 + 44} 3 M${-w / 2 + 44} 10 L ${-w / 2 + 44} 11`} stroke={C.plum} strokeWidth={5} strokeLinecap="round" />
            <text x={20} y={11} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.white} letterSpacing={2}>
              {c.text}
            </text>
          </g>
        );
      })}
      {/* verdict scale */}
      <g transform={`translate(${W / 2} 1200) rotate(${sway * (1 - trig) - 8 * trig})`}>
        <rect x={-320} y={-8} width={640} height={16} rx={8} fill={C.blush} opacity={0.8} />
        <g transform={`translate(-240 0) rotate(${-(sway * (1 - trig) - 8 * trig)})`}>
          <line x1={0} y1={0} x2={0} y2={80} stroke={C.blush} strokeWidth={4} />
          <g opacity={trig} transform={`translate(0 140) scale(${0.85 + 0.15 * trig})`}>
            <rect x={-170} y={-50} width={340} height={100} rx={50} fill={C.goldHot} />
            <text y={-2} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.plum}>
              POSSIBLE
            </text>
            <text y={30} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.plum}>
              TRIGGER
            </text>
          </g>
        </g>
        <g transform={`translate(240 0) rotate(${-(sway * (1 - trig) - 8 * trig)})`}>
          <line x1={0} y1={0} x2={0} y2={80} stroke={C.blush} strokeWidth={4} />
          <g opacity={0.7 + 0.3 * cause} transform="translate(0 140)">
            <rect x={-170} y={-50} width={340} height={100} rx={50} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.4)" strokeWidth={3} />
            <text y={-2} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.blush} opacity={1}>
              PROVEN
            </text>
            <text y={30} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.blush} opacity={1}>
              CAUSE
            </text>
            <line x1={-150} y1={30} x2={150} y2={-30} stroke={C.uvb} strokeWidth={8 * cause} strokeLinecap="round" opacity={cause} />
          </g>
        </g>
      </g>
      <path d={`M${W / 2 - 60} 1500 L ${W / 2} 1200 L ${W / 2 + 60} 1500 Z`} fill={C.blush} opacity={0.5} />
      <text x={W / 2} y={1660} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={21} fill={C.blush} opacity={0.6}>
        Caperton et al. 2014 (14 men) · Vongraviopap & Asawanonda 2016 (25 men, no control group)
      </text>
    </Svg>
  );
};

// =============== G: test it yourself — skip, bring back, watch ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tSkip = cue('Skip');
  const tBack = cue('back');
  const tWatch = cue('watch');
  const push = 1.04 + 0.05 * ease(prog(s, t0, S(7)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.5));
  const skip = prog(s, tSkip - 0.3, tBack - 0.2);
  const back = prog(s, tBack - 0.3, tWatch + 0.2);
  const watch = ease(prog(s, tWatch - 0.3, tWatch + 0.4));
  const cw = 108;
  const gx = W / 2 - (7 * cw) / 2;
  const gy = 600;
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={61} o={0.6} color={C.goldHot} />
      <g transform="translate(0 420)">
        <SkinPlane s={s} />
      </g>
      <g opacity={inK}>
        <rect x={gx - 30} y={gy - 70} width={7 * cw + 60} height={6 * 74 + 110} rx={30} fill="rgba(23,10,16,0.55)" stroke="rgba(238,221,226,0.3)" strokeWidth={3} />
        <text x={W / 2} y={gy - 22} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.blush} letterSpacing={5}>
          YOUR OWN TEST · ILLUSTRATIVE
        </text>
        {Array.from({length: 42}).map((_, i) => {
          const r = Math.floor(i / 7);
          const c = i % 7;
          const x = gx + c * cw + 8;
          const y = gy + r * 74;
          const isSkip = r < 3;
          const k = isSkip ? clamp(skip * 21 - i) : clamp(back * 21 - (i - 21));
          return (
            <g key={i}>
              <rect x={x} y={y} width={cw - 16} height={62} rx={14} fill="rgba(238,221,226,0.08)" />
              {k > 0 &&
                (isSkip ? (
                  <g opacity={k}>
                    <rect x={x} y={y} width={cw - 16} height={62} rx={14} fill={C.blush} opacity={0.85} />
                    <line x1={x + 30} y1={y + 46} x2={x + cw - 46} y2={y + 16} stroke={C.uvb} strokeWidth={5} strokeLinecap="round" />
                  </g>
                ) : (
                  <g opacity={k}>
                    <rect x={x} y={y} width={cw - 16} height={62} rx={14} fill="url(#chocG)" />
                    <path d={`M${x + (cw - 16) / 2} ${y + 8} L ${x + (cw - 16) / 2} ${y + 54} M${x + 10} ${y + 31} L ${x + cw - 26} ${y + 31}`} stroke={CHOC_DEEP} strokeWidth={4} />
                  </g>
                ))}
            </g>
          );
        })}
        <g opacity={clamp(skip * 3)}>
          <text x={gx - 10} y={gy + 3 * 74 + 34} fontFamily="Poppins" fontWeight={700} fontSize={26} fill={C.blush} letterSpacing={2} />
        </g>
        <text x={W / 2} y={gy + 6 * 74 + 20} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.white} letterSpacing={3}>
          {back > 0.02 ? 'SKIP  →  BRING IT BACK' : 'SKIP A FEW WEEKS'}
        </text>
      </g>
      {/* magnifier watching the skin */}
      <g opacity={watch} transform={`translate(${W / 2} 1390) scale(${0.85 + 0.15 * watch})`}>
        <circle r={150} fill="url(#cheekG)" stroke={C.blush} strokeWidth={8} />
        <path d="M-80 0 Q 0 -66 80 0 Q 0 66 -80 0 Z" fill="#fff" opacity={0.95} />
        <circle r={30} fill={C.plum} />
        <circle cx={-9} cy={-9} r={9} fill="#fff" />
        <rect x={100} y={100} width={40} height={120} rx={18} fill={C.blush} transform="rotate(-45 100 100)" />
        <text y={210} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.white} letterSpacing={4}>
          WATCH YOUR SKIN
        </text>
      </g>
    </Svg>
  );
};

// =============== H: loop (bar over skin) + scan + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tScore = cue('score');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tScore - 0.3, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tScore, tScore + 1)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1200)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Bokeh s={s} top={200} bottom={HORIZON} seed={5} color={C.goldHot} o={0.6} />
        <circle cx={W / 2} cy={760} r={420} fill={C.goldHot} opacity={0.12} filter="url(#blur30)" />
        <SkinPlane s={s} fx={{scan}} />
        <Blemishes s={s} bh={0.3} bump={0.35} />
        <Bar x={W / 2} y={760 + Math.sin(s * 1.6) * 12} w={380} h={520} rot={-14 + Math.sin(s) * 3} foil={1} />
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
