import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, Beam, wavePath, Sun, HORIZON} from './parts';
import {cue, S} from './timeline';
import {SkinSection, SkinMacro, RealPlane, dejY} from './realskin';

// accent for this topic: bronze (tan) + UV lilac
const BRONZE = '#C98B4E';
const BRONZE_D = '#8A5530';
const MEL = '#6E3E24';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <linearGradient id="shieldG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E7B07A" />
        <stop offset="1" stopColor={BRONZE_D} />
      </linearGradient>
      <radialGradient id="bronzeGlow">
        <stop offset="0" stopColor={BRONZE} stopOpacity="0.7" />
        <stop offset="1" stopColor={BRONZE} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="alarmG">
        <stop offset="0" stopColor={C.uvb} stopOpacity="0.9" />
        <stop offset="1" stopColor={C.uvb} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="cellG" cx="0.45" cy="0.4">
        <stop offset="0" stopColor="#F8E2DC" />
        <stop offset="0.7" stopColor="#EBC0BA" />
        <stop offset="1" stopColor="#D79A9F" />
      </radialGradient>
      <radialGradient id="nucG" cx="0.4" cy="0.35">
        <stop offset="0" stopColor="#C77D8E" />
        <stop offset="1" stopColor="#8E4257" />
      </radialGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

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
const Cite: React.FC<{text: string; k?: number; y?: number}> = ({text, k = 1, y = 1680}) => (
  <text x={W / 2} y={y} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={24} fill={C.blush} opacity={0.6 * k}>
    {text}
  </text>
);

// tan tint over the skin plane
const TanTint: React.FC<{k: number; y0?: number}> = ({k, y0 = HORIZON}) =>
  k > 0 ? (
    <g>
      <rect x={-200} y={y0} width={W + 400} height={H} fill={BRONZE} opacity={0.42 * k} style={{mixBlendMode: 'multiply'}} />
      <rect x={-200} y={y0} width={W + 400} height={H} fill="#E9A86A" opacity={0.12 * k} />
    </g>
  ) : null;

// shield shape (with optional holes)
const shieldD = 'M0 -170 L 140 -120 C 140 20, 90 120, 0 175 C -90 120, -140 20, -140 -120 Z';
const Shield: React.FC<{x: number; y: number; sc?: number; o?: number; holes?: number; s: number; glow?: number}> = ({x, y, sc = 1, o = 1, holes = 0, s, glow = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={o}>
    {glow > 0 && <path d={shieldD} fill={BRONZE} opacity={0.35 * glow} filter="url(#blur30)" transform="scale(1.3)" />}
    <path d={shieldD} fill="url(#shieldG)" stroke="#FFE3C2" strokeWidth={6} opacity={0.9} />
    <path d="M0 -140 L 110 -100 C 110 10, 70 95, 0 140" stroke="#FFF1DE" strokeWidth={6} fill="none" opacity={0.45} />
    {holes > 0 &&
      Array.from({length: 9}).map((_, i) => {
        const hx = (rand(i * 3 + 2) - 0.5) * 180;
        const hy = (rand(i * 5 + 1) - 0.5) * 220;
        return <circle key={i} cx={hx} cy={hy} r={(10 + rand(i) * 16) * holes} fill={C.plumDeep} stroke="#FFE3C2" strokeWidth={2} opacity={0.95} />;
      })}
  </g>
);

const SunscreenBottle: React.FC<{x: number; y: number; sc?: number; rot?: number}> = ({x, y, sc = 1, rot = -12}) => (
  <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${rot})`}>
    <path d="M -34 -60 L 34 -60 L 30 50 L -30 50 Z" fill={C.blush} />
    <rect x={-18} y={50} width={36} height={22} rx={6} fill={C.plum} />
    <text y={-6} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={20} fill={C.plum}>
      SPF
    </text>
    <text y={22} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={22} fill={C.plum}>
      30+
    </text>
  </g>
);

// UV rays from the sun onto the plane
const Rays: React.FC<{s: number; sx: number; sy: number; k?: number; targets: number[][]; seedPh?: number}> = ({s, sx, sy, k = 1, targets, seedPh = 0}) => (
  <g>
    {targets.map(([tx, ty], i) => (
      <Beam key={i} d={wavePath(sx, sy, tx, ty, 14, 70, s * 8 + i + seedPh)} color={C.uva} o={k * (0.75 + 0.25 * Math.sin(s * 3 + i))} w={6} />
    ))}
  </g>
);

// =============== A: hook — sun on skin, skin turns tan, a "shield" that isn't ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tTan = cue('tan', 0);
  const tProt = cue('protect');
  const push = 1 + 0.08 * ease(prog(s, 0, S(1)));
  const tan = 0.15 + 0.85 * ease(prog(s, tTan - 0.6, tTan + 0.8));
  const sh = ease(prog(s, tProt - 0.4, tProt + 0.4));
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={C.goldHot} o={0.5} />
      <Sun x={760} y={600} s={s} k={0.9} />
      <RealPlane s={s} seed={2} />
      <TanTint k={tan} />
      <Rays s={s} sx={720} sy={640} targets={[[300, 1350], [520, 1500], [760, 1300]]} />
      <Shield x={540} y={1250} sc={1.1} o={sh * 0.9} holes={sh} s={s} glow={sh} />
    </Svg>
  );
};

// =============== B: tan first → burn less later? smaller than it looks ===============
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tFirst = cue('first,');
  const tLater = cue('later.');
  const tSmall = cue('smaller');
  const push = 1.06 - 0.06 * ease(prog(s, t0 - 0.3, S(2)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const step1 = ease(prog(s, tFirst - 0.4, tFirst + 0.3));
  const step2 = ease(prog(s, tLater - 0.6, tLater + 0.3));
  const shrink = ease(prog(s, tSmall - 0.4, tSmall + 0.7));
  const big = 2.6 - 1.85 * shrink;
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1100} r={800} fill={C.plum} opacity={0.75} filter="url(#blur30)" />
      <Bokeh s={s} seed={21} o={0.5} />
      <Sun x={W / 2} y={-40} s={s} k={0.55} />
      {/* steps */}
      <g opacity={inK}>
        <Pill x={300} y={640} k={Math.max(0.35, step1)} text="TAN FIRST" color={BRONZE} size={30} />
        <path d="M455 640 L 560 640 m -18 -16 l 18 16 l -18 16" stroke={C.blush} strokeWidth={5} fill="none" opacity={step2} strokeLinecap="round" />
        <Pill x={780} y={640} k={Math.max(0.35, step2)} text="BURN LESS?" color={C.uvb} size={30} />
      </g>
      {/* big "looks like" silhouette behind the real small shield */}
      <g opacity={inK}>
        <g transform={`translate(${W / 2} 1150) scale(${big})`} opacity={0.55 * (1 - shrink * 0.85)}>
          <path d={shieldD} fill="none" stroke="#FFE3C2" strokeWidth={3 / big} strokeDasharray={`${12 / big} ${10 / big}`} />
          <path d={shieldD} fill={BRONZE} opacity={0.18} />
        </g>
        <Shield x={W / 2} y={1150} sc={0.75} s={s} glow={1 - shrink} />
        <text x={W / 2} y={1150 + 330 * 0.75 + 0} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={4} opacity={0.8}>
          {shrink > 0.5 ? 'REAL SIZE' : 'HOW IT FEELS'}
        </text>
      </g>
      {/* rays hitting and slipping past */}
      <Rays s={s} sx={W / 2} sy={120} k={0.8 * inK} targets={[[240, 1700], [840, 1700], [W / 2 + 40, 1000]]} />
    </Svg>
  );
};

// =============== C: not a shield, an alarm: UV hits DNA → pigment cells make melanin ===============
const MELS = [170, 420, 670, 920];
const SURF = 760;
const EPI = 470;
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tAlarm = cue('alarm.');
  const tDNA = cue('DNA');
  const tPig = cue('pigment');
  const tMel = cue('melanin.');
  const push = 1.08 - 0.08 * ease(prog(s, t0 - 0.3, t0 + 2));
  const notShield = ease(prog(s, t0 - 0.2, t0 + 0.4)) * (1 - ease(prog(s, tAlarm - 0.5, tAlarm)));
  const alarm = ease(prog(s, tAlarm - 0.3, tAlarm + 0.3));
  const hit = ease(prog(s, tDNA - 0.5, tDNA + 0.2));
  const wake = ease(prog(s, tPig - 0.4, tPig + 0.5));
  const mel = ease(prog(s, tMel - 1.0, tMel + 0.8));
  const hits = [
    [250, SURF + 150],
    [540, SURF + 220],
    [820, SURF + 120],
  ];
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={SURF + 200} fill="url(#sky)" />
      <Bokeh s={s} n={14} top={430} bottom={SURF} seed={31} color={C.goldHot} o={0.5} />
      <SkinSection s={s} top={SURF} epi={EPI} seed={6} melanocytes={MELS} wake={wake} melanin={mel} spotX={540} spotK={0} />
      {/* UV rays into the skin */}
      {hits.map(([x, y], i) => (
        <Beam key={i} d={wavePath(x + 160, 380, x, y, 12, 60, s * 9 + i, clamp(0.3 + hit))} color={C.uva} o={0.85} w={6} />
      ))}
      {/* DNA damage sparks + alarm pulses */}
      {hits.map(([x, y], i) => (
        <g key={i} opacity={hit}>
          <circle cx={x} cy={y} r={30 + 8 * Math.sin(s * 8 + i)} fill="url(#alarmG)" />
          <g transform={`translate(${x} ${y}) rotate(${s * 30})`}>
            <path d="M-16 -16 C 16 -8, -16 8, 16 16 M16 -16 C -16 -8, 16 8, -16 16" stroke="#fff" strokeWidth={3} fill="none" />
          </g>
          {[0, 1, 2].map((j) => {
            const ph = (s * 0.8 + j / 3 + i * 0.2) % 1;
            return <circle key={j} cx={x} cy={y} r={20 + ph * 220} fill="none" stroke={C.uvb} strokeWidth={5 * (1 - ph)} opacity={alarm * (1 - ph)} />;
          })}
        </g>
      ))}
      {/* signal travelling down to the pigment cells */}
      {wake > 0 &&
        hits.map(([x, y], i) => {
          const tx = MELS[i + (i > 0 ? 1 : 0)] ?? 540;
          const ty = dejY(tx, SURF, EPI) - 12;
          const p = clamp(prog(s, tDNA + 0.2, tPig + 0.4) * 1.2 - i * 0.1);
          return <circle key={i} cx={x + (tx - x) * p} cy={y + (ty - y) * p} r={9} fill={C.uvb} opacity={(1 - wake * 0.7) * (p > 0 ? 1 : 0)} />;
        })}
      <Pill x={W / 2} y={SURF - 140} k={notShield} text="NOT A SHIELD" color={BRONZE} size={34} />
      <Pill x={W / 2} y={SURF - 140} k={alarm * (1 - wake)} text="DNA DAMAGE ALARM" color={C.uvb} size={34} />
      <Pill x={W / 2} y={SURF - 140} k={wake} text="MORE MELANIN" color={BRONZE} size={34} />
      <text x={W / 2} y={SURF + EPI + 100} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.white} letterSpacing={5} opacity={0.85 * wake}>
        PIGMENT CELLS
      </text>
      <Cite text="Cui et al., Cell, 2007 · illustrative" k={ease(prog(s, t0, t0 + 0.6))} y={1720} />
    </Svg>
  );
};

// =============== D: melanin = tiny umbrella over the core — thin, light gets through ===============
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const tCore = cue('core');
  const tUmb = cue('umbrella.');
  const tThin = cue('thin,');
  const tLight = cue('light');
  const push = 1.0 + 0.08 * ease(prog(s, t0, S(4)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const coreK = ease(prog(s, tCore - 0.4, tCore + 0.3));
  const form = ease(prog(s, t0 + 0.2, tUmb + 0.3));
  const thin = ease(prog(s, tThin - 0.3, tThin + 0.5));
  const through = ease(prog(s, tLight - 0.4, tLight + 0.6));
  const cx = W / 2;
  const cy = 1150;
  // umbrella granules on a dome above the nucleus
  const grains = Array.from({length: 90}).map((_, i) => {
    const a = Math.PI + (i / 89) * Math.PI;
    const layer = i % 3;
    const r = 175 + layer * 16 + (rand(i * 3) - 0.5) * 10;
    return {x: Math.cos(a) * r, y: Math.sin(a) * r * 0.75, r: 9 + rand(i) * 6, gone: rand(i * 7 + 1) < 0.45};
  });
  const gaps = [-110, -20, 85];
  return (
    <Svg cam={camZoom(push, cx, cy)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={cx} cy={cy} r={820} fill={C.plum} opacity={0.75} filter="url(#blur30)" />
      <Bokeh s={s} seed={41} o={0.5} />
      <Sun x={cx + 120} y={-80} s={s} k={0.5} />
      <g opacity={inK}>
        {/* neighbouring cells */}
        {[-560, 560].map((dx, i) => (
          <ellipse key={i} cx={cx + dx} cy={cy + 40} rx={330} ry={300} fill="url(#cellG)" opacity={0.35} />
        ))}
        {/* the cell */}
        <ellipse cx={cx} cy={cy + 40} rx={360} ry={330} fill="url(#cellG)" stroke="#C98A8E" strokeWidth={4} />
        <ellipse cx={cx} cy={cy + 40} rx={360} ry={330} fill="#FFFFFF" opacity={0.06} />
        {/* nucleus with DNA */}
        <g transform={`translate(${cx} ${cy + 60})`}>
          <circle r={130} fill="url(#nucG)" />
          <circle r={130} fill="none" stroke="#F2B6BE" strokeWidth={4} opacity={0.6} />
          {Array.from({length: 14}).map((_, i) => {
            const y = -90 + i * 13;
            const w = 70 * Math.sin(i * 0.6 + s * 1.5);
            return (
              <g key={i}>
                <line x1={-w} y1={y} x2={w} y2={y} stroke="#FFD6DE" strokeWidth={3} opacity={0.6} />
                <circle cx={-w} cy={y} r={5} fill="#FFE8EC" />
                <circle cx={w} cy={y} r={5} fill={C.uva} />
              </g>
            );
          })}
          {through > 0 && <circle r={150} fill="url(#alarmG)" opacity={through * (0.5 + 0.3 * Math.sin(s * 9))} />}
        </g>
        <text x={cx} y={cy + 270} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={26} fill={C.plum} letterSpacing={5} opacity={0.9 * coreK}>
          CORE · DNA
        </text>
        {/* melanin umbrella */}
        <g transform={`translate(${cx} ${cy + 40})`}>
          {grains.map((g, i) => {
            const k = clamp(form * 1.6 - (i / 90) * 0.6);
            const fade = g.gone ? 1 - thin : 1 - thin * 0.25;
            return <circle key={i} cx={g.x * (0.6 + 0.4 * k)} cy={g.y * (0.6 + 0.4 * k) - 40 * (1 - k)} r={g.r * k} fill={MEL} opacity={0.92 * k * fade} />;
          })}
          {/* umbrella handle hint */}
          <path d={`M0 ${-135} L 0 ${-30}`} stroke={MEL} strokeWidth={6} opacity={0.5 * form * (1 - thin)} strokeLinecap="round" />
        </g>
        <Pill x={cx + 250} y={cy - 300} k={ease(prog(s, tUmb - 0.4, tUmb + 0.3))} text={thin > 0.5 ? 'THIN, WITH GAPS' : 'MELANIN CAP'} color={BRONZE} size={30} />
      </g>
      {/* UV slipping through the gaps */}
      {gaps.map((gx, i) => (
        <Beam key={i} d={wavePath(cx + gx * 2.6, 420, cx + gx * 0.5, cy + 40, 12, 60, s * 9 + i, through)} color={C.uva} o={through} w={6} />
      ))}
      {/* rays bouncing off the umbrella */}
      {[-180, 180].map((gx, i) => (
        <Beam key={i} d={wavePath(cx + gx * 2, 420, cx + gx, cy - 120, 12, 60, s * 9 + i + 3, form)} color={C.uva} o={0.6 * form * (1 - through * 0.5)} w={5} />
      ))}
    </Svg>
  );
};

// =============== E: the study — 2 weeks of daily UV, about 2× harder to burn ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tWeeks = cue('weeks');
  const t16 = cue('16');
  const tTimes = cue('times');
  const push = 1 + 0.05 * ease(prog(s, t0, S(5)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const days = prog(s, t0 + 0.2, tWeeks + 0.6);
  const vK = ease(prog(s, t16 - 0.3, t16 + 0.3));
  const tanK = ease(prog(s, tWeeks - 0.3, tWeeks + 1.2));
  const barK = ease(prog(s, tTimes - 1.2, tTimes + 0.4));
  const badge = ease(prog(s, tTimes - 0.2, tTimes + 0.3));
  
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} o={0.5} />
      {/* 2 weeks of weekday UV */}
      <g opacity={inK} transform="translate(0 0)">
        <text x={W / 2} y={530} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={5} opacity={0.8}>
          10 UV SESSIONS · 2 WEEKS
        </text>
        {Array.from({length: 10}).map((_, i) => {
          const k = clamp(days * 10 - i);
          const x = 220 + (i % 5) * 160;
          const y = 600 + Math.floor(i / 5) * 90;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r={30} fill="rgba(238,221,226,0.08)" stroke="rgba(238,221,226,0.3)" strokeWidth={2} />
              <circle r={22 * k} fill={C.goldHot} opacity={k} />
              <circle r={36 * k} fill={C.gold} opacity={0.35 * k} filter="url(#blur4)" />
            </g>
          );
        })}
      </g>
      <Pill x={W / 2} y={850} k={vK} text="16 volunteers" color={C.blush} size={30} />
      {/* skin patches */}
      {[
        {x: 290, label: 'BEFORE', t: 0},
        {x: 790, label: 'AFTER · TANNED', t: tanK},
      ].map((p, i) => (
        <g key={i} opacity={inK}>
          <SkinMacro cx={p.x} cy={1080} r={150} seed={61 + i} />
          {p.t > 0 && <circle cx={p.x} cy={1080} r={150} fill={BRONZE} opacity={0.5 * p.t} style={{mixBlendMode: 'multiply'}} />}
          <text x={p.x} y={1270} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={4}>
            {p.label}
          </text>
        </g>
      ))}
      {/* UV needed to burn */}
      <g opacity={Math.max(inK * 0.35, barK)}>
        <text x={150} y={1360} fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={4} opacity={0.8}>
          UV NEEDED TO BURN
        </text>
        <rect x={150} y={1385} width={300} height={44} rx={22} fill={C.uvb} opacity={0.85} />
        <text x={470} y={1418} fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.white}>
          1×
        </text>
        <rect x={150} y={1455} width={300 + 390 * barK} height={44} rx={22} fill={BRONZE} opacity={0.45} />
        <rect x={150} y={1455} width={300 + 120 * barK} height={44} rx={22} fill={BRONZE} />
        <text x={470 + 390 * barK} y={1488} fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.white} opacity={barK}>
          1.4–2.3×
        </text>
      </g>
      <Pill x={790} y={1580} k={badge} text="AT MOST ~2×" color={C.plum} fill={C.blush} size={40} w={360} />
      <Cite text="Sheehan, Potten & Young, 1998 · solar-simulated UV · 1.4–2.3×" k={inK} y={1690} />
    </Svg>
  );
};

// =============== F: roughly SPF 2 vs SPF 30 = 15× ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const t2 = cue('2', 5);
  const t30 = cue('30', 5);
  const t15 = cue('15');
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(6)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const tanBar = ease(prog(s, t2 - 0.6, t2 + 0.3));
  const spfBar = ease(prog(s, t30 - 0.4, t30 + 1.0));
  const badge = ease(prog(s, t15 - 0.2, t15 + 0.3));
  const unit = 26; // px per SPF point
  const x0 = 140;
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={61} o={0.5} />
      <Sun x={W / 2} y={-60} s={s} k={0.5} />
      <g transform="translate(0 600)" opacity={0.9}>
        <RealPlane s={s} seed={5} fx={{film: spfBar, filmSheen: prog(s, t30, t30 + 2.5)}} />
        <TanTint k={0.7} />
      </g>
      <g opacity={inK}>
        {/* tan row */}
        <g transform="translate(0 820)">
          <circle cx={x0 + 50} cy={0} r={50} fill={BRONZE} opacity={0.9} />
          <circle cx={x0 + 50} cy={0} r={50} fill="none" stroke="#FFE3C2" strokeWidth={3} />
          <text x={x0 + 130} y={-38} fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white}>
            Base tan
          </text>
          <rect x={x0 + 130} y={-8} width={unit * 30} height={52} rx={26} fill="rgba(238,221,226,0.08)" />
          <rect x={x0 + 130} y={-8} width={Math.max(40, unit * 2 * tanBar)} height={52} rx={26} fill={BRONZE} opacity={tanBar} />
          <text x={x0 + 130 + unit * 2 + 30} y={24} fontFamily="Poppins" fontWeight={700} fontSize={30} fill={BRONZE} opacity={tanBar}>
            ≈ SPF 2 at best
          </text>
        </g>
        {/* SPF 30 row */}
        <g transform="translate(0 1100)">
          <SunscreenBottle x={x0 + 50} y={-5} sc={1.0} rot={0} />
          <text x={x0 + 130} y={-38} fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white}>
            Sunscreen
          </text>
          <rect x={x0 + 130} y={-8} width={unit * 30} height={52} rx={26} fill="rgba(238,221,226,0.08)" />
          <rect x={x0 + 130} y={-8} width={unit * 30 * spfBar} height={52} rx={26} fill={C.goldHot} />
          {spfBar > 0.95 && <rect x={x0 + 130} y={-8} width={unit * 30} height={52} rx={26} fill={C.goldHot} opacity={0.4} filter="url(#blur12)" />}
          <text x={x0 + 130 + unit * 30} y={78} textAnchor="end" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.goldHot} opacity={spfBar}>
            SPF 30
          </text>
        </g>
        {/* 15 tan-sized blocks inside the SPF bar */}
        {badge > 0 &&
          Array.from({length: 15}).map((_, i) => {
            const k = clamp(badge * 15 - i);
            return <rect key={i} x={x0 + 130 + i * unit * 2 + 2} y={1092} width={unit * 2 - 4} height={52} rx={12} fill={BRONZE} opacity={0.75 * k} stroke="#FFE3C2" strokeWidth={1.5} />;
          })}
      </g>
      <Pill x={W / 2} y={1420} k={badge} text="15× HIGHER RATING" color={C.plum} fill={C.blush} size={46} w={640} />
      <Cite text="Sheehan et al., 1998 · SPF 30 = label rating · illustrative" k={inK} y={1660} />
    </Svg>
  );
};

// =============== G: the fix ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tSkip = cue('skip');
  const tSpf = cue('broad-spectrum');
  const tDay = cue('day,');
  const tShade = cue('shade');
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const film = ease(prog(s, tSpf - 0.3, tSpf + 0.8));
  const item = (x: number, t: number, label: string, children: React.ReactNode) => {
    const k = ease(prog(s, t - 0.35, t + 0.25));
    const base = 0.55 * ease(prog(s, t0 - 0.3, t0 + 0.4));
    return (
      <g transform={`translate(${x} 740) scale(${0.95 * (0.9 + 0.1 * k)})`} opacity={Math.max(base, k)}>
        <circle r={115} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
        {children}
        <text y={165} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={22} fill={C.blush} letterSpacing={2}>
          {label}
        </text>
      </g>
    );
  };
  const skipK = ease(prog(s, tSkip - 0.2, tSkip + 0.4));
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={71} o={0.6} color={C.goldHot} />
      <g transform="translate(0 220)">
        <RealPlane s={s} seed={3} fx={{film, filmSheen: prog(s, tSpf, tSpf + 2.5)}} />
        <TanTint k={0.6 * (1 - film)} />
        {/* parasol shade sliding over the skin */}
        <ellipse cx={1300 - 760 * ease(prog(s, tShade - 0.6, tShade + 0.8))} cy={1350} rx={420} ry={150} fill={C.plumInk} opacity={0.35} filter="url(#blur30)" />
      </g>
      <Rays s={s} sx={1180} sy={900} k={0.8 * ease(prog(s, t0 - 0.2, t0 + 0.6))} targets={[[260, 1450], [540, 1650], [780, 1420]]} />
      {film > 0.3 &&
        [
          [260, 1450],
          [540, 1650],
          [780, 1420],
        ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={30 + 10 * Math.sin(s * 6 + i)} fill={C.goldHot} opacity={0.55 * film} filter="url(#blur4)" />)}
      {item(
        270,
        tSkip,
        'NO BASE TAN',
        <g>
          <Shield x={0} y={0} sc={0.42} s={s} holes={1} />
          <line x1={-70} y1={-70} x2={-70 + 140 * skipK} y2={-70 + 140 * skipK} stroke={C.uvb} strokeWidth={10} strokeLinecap="round" />
        </g>,
      )}
      {item(540, tSpf, 'SPF 30+ DAILY', <SunscreenBottle x={0} y={-6} sc={1.05} />)}
      {item(
        810,
        tShade,
        'SHADE',
        <g>
          <circle cx={40} cy={-50} r={26} fill={C.goldHot} opacity={0.8} />
          <path d="M-70 0 Q 0 -90 70 0 Z" fill={C.blush} />
          <path d="M-70 0 Q -47 -14 -23 0 Q 0 -14 23 0 Q 47 -14 70 0" fill={C.plum} opacity={0.4} />
          <path d="M0 0 L 0 60 q 0 14 -14 14" stroke={C.blush} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>,
      )}
      <Pill x={W / 2} y={1120} k={ease(prog(s, tDay - 0.3, tDay + 0.3))} text="EVERY DAY" color={C.goldHot} size={36} />
    </Svg>
  );
};

// =============== H: loop (sun on skin) + scan + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tHelp = cue('help.');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tHelp - 0.6, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tHelp - 0.4, tHelp + 0.6)) * (1 - cardK);
  const alarmK = ease(prog(s, t0, t0 + 0.8)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1150)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={C.goldHot} o={0.5} />
        <Sun x={760} y={600} s={s} k={0.9} />
        <RealPlane s={s} seed={2} fx={{scan}} />
        <TanTint k={0.8} />
        <Rays s={s} sx={720} sy={640} targets={[[300, 1350], [520, 1500], [760, 1300]]} />
        {[
          [300, 1350],
          [520, 1500],
          [760, 1300],
        ].map(([x, y], i) => (
          <g key={i} opacity={alarmK}>
            {[0, 1].map((j) => {
              const ph = (s * 0.8 + j / 2 + i * 0.3) % 1;
              return <ellipse key={j} cx={x} cy={y} rx={20 + ph * 160} ry={(20 + ph * 160) * 0.4} fill="none" stroke={C.uvb} strokeWidth={4 * (1 - ph)} opacity={1 - ph} />;
            })}
          </g>
        ))}
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

export const SCENES: React.FC<{s: number}>[] = [SceneA, SceneB, SceneC, SceneD, SceneE, SceneF, SceneG, SceneH];
export const bounds = (end: number) => [0, S(1), S(2), S(3), S(4), S(5), S(6), S(7), end];
