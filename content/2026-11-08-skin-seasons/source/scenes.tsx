import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, HORIZON} from './parts';
import {cue, S} from './timeline';

// accent for this topic: ice blue (winter air); summer uses the brand gold light
const ICE = '#9FD8F5';
const ICE_DEEP = '#4F9CCB';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <radialGradient id="dropG" cx="0.35" cy="0.3">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.35" stopColor={ICE} />
        <stop offset="1" stopColor={ICE_DEEP} />
      </radialGradient>
      <linearGradient id="brickG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F8DCDC" />
        <stop offset="1" stopColor="#E2A9AF" />
      </linearGradient>
      <linearGradient id="coldSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0F1426" />
        <stop offset="0.6" stopColor="#25223A" />
        <stop offset="1" stopColor="#3D3550" />
      </linearGradient>
      <linearGradient id="warmSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2A1218" />
        <stop offset="0.6" stopColor="#5A2E34" />
        <stop offset="1" stopColor="#8A4A48" />
      </linearGradient>
      <radialGradient id="shineG">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="0.4" stopColor="#FFF4D6" stopOpacity="0.5" />
        <stop offset="1" stopColor="#FFF4D6" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="iceGlow">
        <stop offset="0" stopColor={ICE} stopOpacity="0.55" />
        <stop offset="1" stopColor={ICE} stopOpacity="0" />
      </radialGradient>
      <clipPath id="leftHalf">
        <rect x={-200} y={0} width={W / 2 + 200} height={H + 400} />
      </clipPath>
      <radialGradient id="redG">
        <stop offset="0" stopColor="#FF5A64" stopOpacity="0.7" />
        <stop offset="1" stopColor="#FF5A64" stopOpacity="0" />
      </radialGradient>
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

// ---------- season icons ----------
const SeasonIcon: React.FC<{k: number; sc?: number}> = ({k, sc = 1}) => {
  const i = ((k % 4) + 4) % 4;
  return (
    <g transform={`scale(${sc})`}>
      {i === 0 && (
        <g>
          <circle r={26} fill={C.goldHot} />
          {Array.from({length: 8}).map((_, j) => (
            <rect key={j} x={-4} y={-50} width={8} height={14} rx={4} fill={C.gold} transform={`rotate(${j * 45})`} />
          ))}
        </g>
      )}
      {i === 1 && (
        <g>
          <path d="M0 -44 C 34 -30, 34 26, 0 44 C -34 26, -34 -30, 0 -44 Z" fill="#E8935A" />
          <path d="M0 -36 L 0 44 M0 -6 L 16 -18 M0 12 L -16 0" stroke="#8A4B1C" strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
      {i === 2 && (
        <g stroke={ICE} strokeWidth={6} strokeLinecap="round">
          {[0, 60, 120].map((a) => (
            <g key={a} transform={`rotate(${a})`}>
              <line x1={0} y1={-44} x2={0} y2={44} />
              <path d="M-12 -32 L 0 -20 L 12 -32 M-12 32 L 0 20 L 12 32" fill="none" />
            </g>
          ))}
        </g>
      )}
      {i === 3 && (
        <g>
          {Array.from({length: 5}).map((_, j) => (
            <ellipse key={j} cx={0} cy={-20} rx={14} ry={22} fill={C.rose} transform={`rotate(${j * 72})`} />
          ))}
          <circle r={12} fill={C.goldHot} />
        </g>
      )}
    </g>
  );
};
const NAMES = ['SUMMER', 'AUTUMN', 'WINTER', 'SPRING'];

// rotating wheel: rot = number of quarter turns (float); the icon at the top is the "current" season
const SeasonWheel: React.FC<{x: number; y: number; rot: number; s: number; o?: number; sc?: number}> = ({x, y, rot, s, o = 1, sc = 1}) => {
  const R = 175;
  const cur = Math.round(rot);
  const coldness = 0.5 - 0.5 * Math.cos((rot * Math.PI) / 2); // 0 summer .. 1 winter
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={o}>
      <circle r={290} fill={coldness > 0.5 ? ICE : C.gold} opacity={0.16} filter="url(#blur30)" />
      <circle r={R} fill="rgba(23,10,16,0.45)" stroke="rgba(238,221,226,0.3)" strokeWidth={3} />
      {Array.from({length: 4}).map((_, j) => {
        const a = ((j - rot) * Math.PI) / 2 - Math.PI / 2;
        const m = ((((j - rot) % 4) + 4) % 4);
        const focus = clamp(1 - Math.min(m, 4 - m));
        return (
          <g key={j} transform={`translate(${Math.cos(a) * R} ${Math.sin(a) * R})`} opacity={0.55 + 0.45 * focus}>
            <circle r={62 + 14 * focus} fill="rgba(23,10,16,0.75)" stroke={focus > 0.5 ? C.blush : 'rgba(238,221,226,0.3)'} strokeWidth={3} />
            <SeasonIcon k={j} sc={0.85 + 0.25 * focus} />
          </g>
        );
      })}
      <text y={14} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={36} fill={C.blush} letterSpacing={6}>
        {NAMES[((cur % 4) + 4) % 4]}
      </text>
    </g>
  );
};

// skin-plane overlays
const Shine: React.FC<{k: number; s: number}> = ({k, s}) => (
  <g opacity={k}>
    {[
      [380, 1260, 160, 50],
      [700, 1400, 220, 70],
      [520, 1640, 300, 90],
      [860, 1180, 110, 34],
    ].map(([x, y, rx, ry], i) => (
      <ellipse key={i} cx={x + Math.sin(s * 0.6 + i) * 10} cy={y} rx={rx} ry={ry} fill="url(#shineG)" />
    ))}
  </g>
);
const DryCracks: React.FC<{k: number}> = ({k}) => (
  <g opacity={k} stroke="#9B5565" strokeWidth={3} fill="none">
    {Array.from({length: 16}).map((_, i) => {
      const x = 80 + rand(i * 3) * 920;
      const y = 1150 + rand(i * 5) * 700;
      const a = rand(i * 7) * Math.PI;
      const L = 60 + rand(i * 9) * 100;
      return (
        <path
          key={i}
          d={`M${x} ${y} l ${Math.cos(a) * L} ${Math.sin(a) * L * 0.4} l ${Math.cos(a + 0.8) * L * 0.6} ${Math.sin(a + 0.8) * L * 0.25} M${x + Math.cos(a) * L * 0.5} ${y + Math.sin(a) * L * 0.2} l ${Math.cos(a - 1.2) * L * 0.5} ${Math.sin(a - 1.2) * L * 0.3}`}
        />
      );
    })}
  </g>
);
const Snow: React.FC<{s: number; k: number; top?: number; bottom?: number}> = ({s, k, top = 300, bottom = 1100}) => (
  <g opacity={k}>
    {Array.from({length: 40}).map((_, i) => {
      const x = (rand(i * 3) * W + Math.sin(s * 0.8 + i) * 30) % W;
      const y = top + ((rand(i * 5) * (bottom - top) + s * (30 + rand(i) * 40)) % (bottom - top));
      const r = 3 + rand(i * 7) * 6;
      return <circle key={i} cx={x} cy={y} r={r} fill="#F4F8FF" opacity={0.75} />;
    })}
  </g>
);

// =============== A: hook — the season wheel turns, the skin changes with it ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const push = 1 + 0.07 * ease(prog(s, 0, S(1)));
  // quarter turns with holds: summer -> autumn -> winter -> spring -> summer...
  const step = 0.75;
  const n = Math.floor(s / step);
  const rot = n + ease(clamp((s - n * step) / 0.45));
  const cold = 0.5 - 0.5 * Math.cos((rot * Math.PI) / 2);
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#warmSky)" />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#coldSky)" opacity={cold} />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={C.goldHot} o={0.55 * (1 - cold)} />
      <Snow s={s} k={cold} top={300} bottom={HORIZON + 200} />
      <SkinPlane s={s} fx={{dull: 0.6 * cold}} />
      <Shine k={0.9 * (1 - cold)} s={s} />
      <DryCracks k={cold} />
      <SeasonWheel x={W / 2} y={790} rot={rot} s={s} sc={1.3} />
    </Svg>
  );
};

// ---------- the cross-section used by B, C, D ----------
const TOP = 960; // top of the outer layer
const ROWS = 3;
const BW = 170;
const BH = 64;
type SecP = {warm: number; cold: number; humid: number; out: number; plump: number; brittle: number; oil: number; heat: number; trade: number; labels: number};
const Section: React.FC<{s: number; p: SecP}> = ({s, p}) => {
  const bh = BH * (1 + 0.14 * p.plump - 0.1 * p.brittle);
  const bottom = TOP + ROWS * (bh + 12);
  return (
    <g>
      <rect x={-200} y={-200} width={W + 400} height={TOP + 220} fill="url(#sky)" />
      <rect x={-200} y={-200} width={W + 400} height={TOP + 220} fill="url(#warmSky)" opacity={p.warm} />
      <rect x={-200} y={-200} width={W + 400} height={TOP + 220} fill="url(#coldSky)" opacity={p.cold} />
      {/* warm sun glow */}
      <circle cx={860} cy={640} r={380} fill="url(#sunGlow)" opacity={0.7 * p.warm} />
      <Snow s={s} k={p.cold} top={420} bottom={TOP - 20} />
      <rect x={-200} y={bottom} width={W + 400} height={H} fill="url(#derm)" />
      {/* water in the air (humidity) */}
      {Array.from({length: 36}).map((_, i) => {
        const vis = clamp(p.humid * 36 - i);
        if (vis <= 0) return null;
        const x = (rand(i * 3 + 1) * W + s * 14 * (rand(i) - 0.5) * 4 + W) % W;
        const y = 470 + rand(i * 5 + 2) * (TOP - 540) + Math.sin(s * 1.3 + i) * 10;
        return <Drop key={i} x={x} y={y} r={9 + rand(i * 7) * 8} o={0.75 * vis} />;
      })}
      {/* water reservoir below */}
      {Array.from({length: 18}).map((_, i) => {
        const x = (rand(i * 11) * W + s * 10 * (rand(i * 2) - 0.5) + W) % W;
        const y = bottom + 90 + rand(i * 13) * 520 + Math.sin(s * 1.2 + i) * 8;
        return <Drop key={i} x={x} y={y} r={14 + rand(i * 17) * 9} o={0.85} />;
      })}
      <text x={90} y={TOP - 34} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.white} letterSpacing={5} opacity={0.75 * p.labels}>
        OUTER LAYER
      </text>
      <text x={90} y={520} fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.white} letterSpacing={5} opacity={0.75 * p.labels}>
        AIR
      </text>
      {/* mortar */}
      <rect x={-40} y={TOP - 8} width={W + 80} height={bottom - TOP + 4} fill={p.brittle > 0.5 ? '#B89A6A' : C.gold} opacity={0.85 - 0.3 * p.brittle} />
      {Array.from({length: ROWS}).map((_, r) =>
        Array.from({length: 7}).map((__, c) => {
          const x = -60 + c * (BW + 12) + (r % 2) * ((BW + 12) / 2);
          const y = TOP + r * (bh + 12);
          const lift = p.brittle * (r === 0 ? 1 : 0.35) * rand(r * 7 + c);
          return (
            <g key={`${r}-${c}`} transform={`translate(${lift * 10} ${-lift * 22}) rotate(${lift * 7} ${x + BW / 2} ${y})`}>
              <rect x={x} y={y} width={BW} height={bh} rx={16} fill="url(#brickG)" stroke="#C98892" strokeWidth={2} />
              <rect x={x + 14} y={y + 8} width={BW - 28} height={8} rx={4} fill="#fff" opacity={0.25 + 0.25 * p.plump} />
            </g>
          );
        }),
      )}
      {/* cracks when brittle */}
      {[1, 3, 5].map((c, i) => {
        const x = -60 + c * (BW + 12) - 6;
        return (
          <path
            key={i}
            d={`M${x} ${TOP - 8} L ${x + 26} ${TOP + bh} L ${x - 12} ${TOP + 2 * bh} L ${x + 90} ${bottom}`}
            stroke={C.plumInk}
            strokeWidth={11 * p.brittle}
            fill="none"
            opacity={p.brittle}
            strokeLinejoin="round"
          />
        );
      })}
      {/* trading: water crossing both ways; `out` biases the flow upward */}
      {p.trade > 0 &&
        Array.from({length: 16}).map((_, i) => {
          const up = rand(i * 19) < 0.5 + 0.5 * p.out - 0.35 * p.humid;
          const ph = (s * 0.55 + rand(i * 23)) % 1;
          const x = 70 + (i / 16) * 940 + Math.sin(ph * 6 + i) * 14;
          const y0 = bottom + 60;
          const y1 = TOP - 260;
          const y = up ? y0 + (y1 - y0) * ph : y1 + (y0 - y1) * ph;
          const drift = up ? p.heat * ph * ph * 160 : 0;
          const big = up ? 1 + 0.5 * p.out : 1;
          return (
            <g key={i}>
              {up && p.out > 0.2 && <path d={`M${x + drift} ${y + 20} L ${x + drift * 0.7} ${y + 110}`} stroke={ICE} strokeWidth={8} strokeLinecap="round" opacity={0.35 * p.out * Math.sin(ph * Math.PI)} />}
              <Drop x={x + drift} y={y} r={13 * big} o={p.trade * Math.sin(ph * Math.PI)} />
            </g>
          );
        })}
      {/* exchange arrows */}
      <g opacity={p.trade * p.labels} transform={`translate(${W - 150} ${TOP - 140})`} stroke={C.white} strokeWidth={6} strokeLinecap="round" fill="none">
        <path d="M-24 50 L -24 -50 M-44 -30 L -24 -50 L -4 -30" />
        <path d="M24 -50 L 24 50 M4 30 L 24 50 L 44 30" />
      </g>
      {/* oil rising to the surface in summer */}
      {p.oil > 0 && (
        <g opacity={p.oil}>
          {Array.from({length: 10}).map((_, i) => {
            const ph = (s * 0.5 + i / 10) % 1;
            const x = 160 + (i % 5) * 190 + 40;
            const y = bottom + 300 - ph * (bottom + 300 - TOP + 30);
            return <circle key={i} cx={x} cy={y} r={14 * (1 - 0.4 * ph)} fill="url(#globule)" opacity={1 - ph * 0.3} />;
          })}
          <rect x={-40} y={TOP - 30} width={W + 80} height={22} rx={11} fill={C.oil} opacity={0.55} />
          <rect x={-40} y={TOP - 34} width={W + 80} height={6} rx={3} fill="#FFF6D8" opacity={0.8} />
        </g>
      )}
      {/* indoor heater */}
      {p.heat > 0 && (
        <g opacity={p.heat} transform="translate(170 790)">
          <rect x={-110} y={-70} width={220} height={140} rx={18} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.6)" strokeWidth={3} />
          {Array.from({length: 5}).map((_, j) => (
            <rect key={j} x={-90 + j * 38} y={-52} width={24} height={104} rx={12} fill="#E9A07A" opacity={0.85} />
          ))}
          {Array.from({length: 3}).map((_, j) => {
            const ph = (s * 0.8 + j / 3) % 1;
            return <path key={j} d={`M${-50 + j * 50} ${-90 - ph * 160} q 16 -20 0 -40 q -16 -20 0 -40`} stroke="#FFB38A" strokeWidth={6} fill="none" strokeLinecap="round" opacity={1 - ph} />;
          })}
        </g>
      )}
    </g>
  );
};

const Pill: React.FC<{x: number; y: number; k: number; text: string; color: string; dark?: boolean}> = ({x, y, k, text, color, dark}) =>
  k > 0 ? (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * k})`} opacity={k}>
      <rect x={-(text.length * 13 + 50)} y={-44} width={2 * (text.length * 13 + 50)} height={82} rx={41} fill={dark ? 'rgba(23,10,16,0.7)' : color} stroke={color} strokeWidth={3} />
      <text y={12} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={dark ? color : C.plum} letterSpacing={3}>
        {text}
      </text>
    </g>
  ) : null;

// =============== B: skin trades water with the air ===============
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tTrade = cue('trading');
  const push = 1.06 - 0.06 * ease(prog(s, t0 - 0.2, t0 + 1.2));
  const trade = ease(prog(s, tTrade - 0.5, tTrade + 0.4));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <Section s={s} p={{warm: 0, cold: 0, humid: 0.5, out: 0, plump: 0.3, brittle: 0, oil: 0, heat: 0, trade, labels: ease(prog(s, t0 - 0.2, t0 + 0.5))}} />
    </Svg>
  );
};

// =============== C: summer — humid air, plump layer, oil flows ===============
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tHumid = cue('humid');
  const tPlump = cue('plump.');
  const tOil = cue('Oil');
  const push = 1.04 + 0.05 * ease(prog(s, t0, S(3)));
  const warm = ease(prog(s, t0 - 0.3, t0 + 0.6));
  const humid = 0.5 + 0.5 * ease(prog(s, tHumid - 0.3, tHumid + 0.6));
  const plump = 0.3 + 0.7 * ease(prog(s, tPlump - 0.5, tPlump + 0.3));
  const oil = ease(prog(s, tOil - 0.3, tOil + 0.6));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <Section s={s} p={{warm, cold: 0, humid, out: 0, plump, brittle: 0, oil, heat: 0, trade: 0.8, labels: 0.6}} />
      {(() => {
        const sh = prog(s, cue('flows') - 0.2, cue('shinier.') + 0.6);
        const k = ease(prog(s, cue('flows') - 0.3, cue('flows') + 0.4));
        return k > 0 ? (
          <g opacity={k}>
            <rect x={-200} y={TOP - 40} width={W + 400} height={260} fill="#FFF4D6" opacity={0.18} />
            <rect x={-500 + sh * 1900} y={TOP - 60} width={220} height={320} fill="#FFFFFF" opacity={0.6} transform="skewX(-25)" filter="url(#blur12)" />
            {[180, 480, 800].map((x, i) => (
              <ellipse key={i} cx={x} cy={TOP - 22} rx={120} ry={18} fill="url(#shineG)" />
            ))}
          </g>
        ) : null;
      })()}
      <g transform="translate(330 0)">
        <Pill x={W / 2 - 330} y={600} k={ease(prog(s, tHumid - 0.3, tHumid + 0.2))} text="WARM · HUMID" color={C.gold} />
      </g>
    </Svg>
  );
};

// =============== D: winter — dry air, heating, water pulled out, brittle ===============
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const tLittle = cue('little');
  const tHeat = cue('heating');
  const tPulls = cue('pulls');
  const tBrittle = cue('brittle.');
  const push = 1.05 - 0.05 * ease(prog(s, t0 - 0.2, t0 + 1)) + 0.05 * ease(prog(s, tBrittle - 0.5, S(4)));
  const cold = ease(prog(s, t0 - 0.3, t0 + 0.6));
  const humid = 0.55 * (1 - ease(prog(s, tLittle - 0.4, tLittle + 0.5))) + 0.08 - 0.08 * ease(prog(s, tHeat, tHeat + 0.8));
  const heat = ease(prog(s, tHeat - 0.4, tHeat + 0.3));
  const out = ease(prog(s, tPulls - 0.4, tPulls + 0.4));
  const brittle = ease(prog(s, tBrittle - 0.5, tBrittle + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <Section s={s} p={{warm: 0, cold, humid: Math.max(0, humid), out, plump: 0.3 * (1 - brittle), brittle, oil: 0, heat, trade: 0.5 + 0.5 * out, labels: 0.6}} />
      <Pill x={W / 2 + 170} y={600} k={ease(prog(s, tLittle - 0.4, tLittle + 0.1))} text="COLD · DRY" color={ICE} dark />
    </Svg>
  );
};

// =============== E1: winter skin is more reactive ===============
export const SceneE1: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tReact = cue('reactive.');
  const push = 1.06 - 0.06 * ease(prog(s, t0 - 0.2, t0 + 1.5));
  const red = ease(prog(s, cue('winter', 4) - 0.2, tReact + 0.5));
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#coldSky)" />
      <Snow s={s} k={1} top={300} bottom={HORIZON + 300} />
      <SkinPlane s={s} fx={{dull: 0.5}} />
      <DryCracks k={1} />
      {[
        [330, 1300, 1],
        [700, 1440, 1.3],
        [520, 1680, 1.6],
        [850, 1220, 0.8],
      ].map(([x, y, k], i) => {
        const g = ease(clamp(red * 1.6 - i * 0.2));
        return <ellipse key={i} cx={x} cy={y} rx={150 * k * g} ry={60 * k * g} fill="url(#redG)" />;
      })}
      {/* a drop of irritant landing */}
      {(() => {
        const f = prog(s, t0 + 0.2, tReact);
        return f > 0 && f < 1 ? (
          <g>
            <circle cx={W / 2} cy={500 + 900 * ease(f)} r={24} fill="#C7F2C2" opacity={0.9 * (1 - prog(f, 0.85, 1))} />
            <circle cx={W / 2 - 7} cy={493 + 900 * ease(f)} r={7} fill="#fff" opacity={0.8} />
          </g>
        ) : null;
      })()}
      <Pill x={W / 2} y={720} k={ease(prog(s, cue('winter', 4) - 0.1, cue('winter', 4) + 0.4))} text="MORE REACTIVE" color="#FF7A80" dark />
    </Svg>
  );
};

// =============== E2: the study — January vs August ===============
export const SceneE2: React.FC<{s: number}> = ({s}) => {
  const t0 = cue('study');
  const t487 = cue('487');
  const tLost = cue('raised');
  const t3 = cue('3×');
  const tIrr = cue('irritant');
  const tJan = cue('January');
  const tAug = cue('August.');
  const push = 1 + 0.05 * ease(prog(s, t0, S(5)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const count = Math.round(487 * easeOut(prog(s, t0, t487 + 0.3)));
  const dropF = prog(s, tLost - 0.2, tLost + 0.8);
  const janK = ease(prog(s, tLost, t3 + 0.4));
  const augK = ease(prog(s, tLost, t3 + 0.4));
  const badge = ease(prog(s, t3 - 0.15, t3 + 0.3));
  const janFocus = ease(prog(s, tJan - 0.3, tJan + 0.3));
  const augFocus = ease(prog(s, tAug - 0.3, tAug + 0.3));
  // monthly medians of the TEWL increase (g/m²h): January 33.3, August 11.2 (Löffler & Happle 2003)
  const MAXH = 520;
  const card = (x: number, title: string, icon: number, val: number, k: number, focus: number, col: string) => (
    <g transform={`translate(${x} 1010) scale(${1 + 0.04 * focus})`} opacity={inK}>
      <rect x={-215} y={-330} width={430} height={860} rx={44} fill="rgba(238,221,226,0.08)" stroke={focus > 0.5 ? col : 'rgba(238,221,226,0.35)'} strokeWidth={focus > 0.5 ? 5 : 2.5} />
      <g transform="translate(0 -250)">
        <SeasonIcon k={icon} sc={0.9} />
      </g>
      <text y={-160} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={40} fill={focus > 0.5 ? col : C.white}>
        {title}
      </text>
      {/* skin patch with irritant drop */}
      <rect x={-150} y={430} width={300} height={40} rx={14} fill="url(#epi)" />
      {dropF > 0 && dropF < 1 && <circle cx={0} cy={300 + 120 * ease(dropF)} r={16} fill="#C7F2C2" opacity={1 - prog(dropF, 0.8, 1)} />}
      {/* water-loss column */}
      <rect x={-70} y={410 - MAXH} width={140} height={MAXH} rx={30} fill="rgba(255,255,255,0.07)" />
      <rect x={-70} y={410 - MAXH * val * k} width={140} height={MAXH * val * k} rx={30} fill={col} opacity={0.9} />
      {Array.from({length: 4}).map((_, j) => {
        const ph = (s * 0.7 + j / 4) % 1;
        return k > 0.2 ? <Drop key={j} x={-40 + j * 27} y={410 - MAXH * val * k - 30 - ph * 80 * val} r={9} o={(1 - ph) * k} /> : null;
      })}
    </g>
  );
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={980} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} color={ICE} o={0.45} />
      <g opacity={inK}>
        <text x={W / 2} y={540} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={56} fill={C.white}>
          {count} people
        </text>
      </g>
      {card(295, 'January', 2, 1, janK, janFocus, ICE)}
      {card(785, 'August', 0, 11.2 / 33.3, augK, augFocus, C.gold)}
      <text x={W / 2} y={1600} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={4} opacity={0.8 * ease(prog(s, tIrr - 0.5, tIrr))}>
        RISE IN WATER LOSS AFTER A MILD IRRITANT
      </text>
      {badge > 0 && (
        <g transform={`translate(295 520) scale(${0.7 + 0.3 * badge})`} opacity={badge}>
          <circle r={0} />
        </g>
      )}
      {badge > 0 && (
        <g transform={`translate(${W / 2} 618) scale(${0.7 + 0.3 * badge})`} opacity={badge}>
          <rect x={-150} y={-56} width={300} height={104} rx={52} fill={ICE} />
          <text y={22} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={64} fill={C.plum}>
            ≈3×
          </text>
        </g>
      )}
      <text x={W / 2} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.55 * inK}>
        Löffler & Happle, Acta Derm Venereol, 2003 · 487 adults · monthly medians
      </text>
    </Svg>
  );
};

// =============== F: let the routine follow the weather ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tWeather = cue('weather.');
  const tRich = cue('richer');
  const items = [
    {t: tRich, label: 'RICHER CREAM', x: 300, y: 820, i: 0},
    {t: cue('gentler'), label: 'GENTLE CLEANSER', x: 300, y: 1130, i: 1},
    {t: cue('lighter,'), label: 'LIGHTER LAYERS', x: 780, y: 820, i: 2},
    {t: cue('sunscreen'), label: 'SPF ALL YEAR', x: 780, y: 1130, i: 3},
  ];
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(6)));
  const wheelK = 1 - ease(prog(s, tRich - 0.6, tRich - 0.1));
  const rot = 2 * ease(prog(s, t0 + 0.3, tWeather + 0.4));
  const headK = ease(prog(s, tRich - 0.6, tRich));
  const icon = (i: number) => {
    const st = {stroke: C.blush, strokeWidth: 6, fill: 'none', strokeLinecap: 'round' as const};
    switch (i) {
      case 0:
        return (
          <g>
            <rect x={-48} y={-10} width={96} height={56} rx={16} fill={C.blush} />
            <rect x={-52} y={-34} width={104} height={28} rx={10} fill={ICE_DEEP} />
            <path d="M-20 18 q 20 -18 40 0" stroke={C.plum} strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
        );
      case 1:
        return (
          <g {...st}>
            <rect x={-30} y={-24} width={60} height={74} rx={14} />
            <path d="M-8 -24 L -8 -44 L 26 -44" />
            <path d="M-14 12 q 14 -16 28 0" />
          </g>
        );
      case 2:
        return (
          <g>
            <path d="M0 -50 C 20 -20, 34 0, 34 18 a 34 34 0 0 1 -68 0 c 0 -18 14 -38 34 -68 Z" fill="none" stroke={C.gold} strokeWidth={6} />
            <path d="M-14 14 q 14 12 28 0" stroke={C.gold} strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
        );
      default:
        return (
          <g transform="rotate(-15)">
            <path d="M -34 -64 L 34 -64 L 28 46 L -28 46 Z" fill={C.blush} />
            <rect x={-18} y={46} width={36} height={22} rx={6} fill={C.plum} />
            <text y={-2} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={C.plum}>
              SPF
            </text>
          </g>
        );
    }
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={60} cy={900} r={440} fill={ICE_DEEP} opacity={0.22 * headK + 0.06} filter="url(#blur30)" />
      <circle cx={1020} cy={900} r={440} fill={C.gold} opacity={0.16 * headK + 0.05} filter="url(#blur30)" />
      <g transform="translate(0 520)">
        <SkinPlane s={s} fx={{film: ease(prog(s, cue('sunscreen') - 0.4, cue('sunscreen') + 0.8)), filmSheen: prog(s, cue('sunscreen'), cue('sunscreen') + 2)}} />
        <g clipPath="url(#leftHalf)">
          <DryCracks k={0.8 * (1 - ease(prog(s, tRich, tRich + 1.2)))} />
        </g>
        <Shine k={0.5 * (1 - ease(prog(s, cue('lighter,'), cue('lighter,') + 1)))} s={s} />
      </g>
      <Bokeh s={s} seed={81} o={0.5} />
      <SeasonWheel x={W / 2} y={960} rot={rot} s={s} o={wheelK} sc={1.15} />
      <Pill x={300} y={590} k={headK} text="COLD · DRY" color={ICE} dark />
      <Pill x={780} y={590} k={headK} text="HUMID" color={C.gold} dark />
      {items.filter((it) => it.x > W / 2).map((it) => (
        <circle key={'ph' + it.i} cx={it.x} cy={it.y} r={110} fill="rgba(242,200,121,0.06)" stroke="rgba(242,200,121,0.35)" strokeWidth={3} strokeDasharray="12 12" opacity={headK * (1 - ease(prog(s, it.t - 0.35, it.t + 0.25)))} />
      ))}
      {items.map((it) => {
        const k = ease(prog(s, it.t - 0.35, it.t + 0.25));
        return (
          <g key={it.i} transform={`translate(${it.x} ${it.y}) scale(${0.85 + 0.15 * k})`} opacity={k}>
            <circle r={110} fill="rgba(23,10,16,0.62)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
            {icon(it.i)}
            <text y={155} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={3}>
              {it.label}
            </text>
          </g>
        );
      })}
    </Svg>
  );
};

// =============== G: loop back to the wheel over the skin + Glowi ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tAir = cue('air.');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tAir - 0.3, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const rot = 2 + 2 * ease(prog(s, t0, tAir + 0.3));
  const cold = 0.5 - 0.5 * Math.cos((rot * Math.PI) / 2);
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tAir, tAir + 1)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1300)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#warmSky)" />
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#coldSky)" opacity={cold} />
        <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={C.goldHot} o={0.55 * (1 - cold)} />
        <Snow s={s} k={cold * (1 - cardK)} top={300} bottom={HORIZON + 200} />
        <SkinPlane s={s} fx={{scan, dull: 0.5 * cold}} />
        <Shine k={0.6 * (1 - cold)} s={s} />
        <DryCracks k={cold} />
        <SeasonWheel x={W / 2} y={720} rot={rot} s={s} o={1 - cardK} />
        <g opacity={mesh}>
          {nodes.map((a, i) => {
            const b = nodes[(i * 5 + 3) % nodes.length];
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.blush} strokeWidth={1.5} opacity={0.55} />;
          })}
          {nodes.map((a, i) => (
            <circle key={i} cx={a.x} cy={a.y} r={7} fill={ICE} opacity={a.y < HORIZON + (H - HORIZON) * scan ? 1 : 0} />
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
export const SCENES: React.FC<{s: number}>[] = [SceneA, SceneB, SceneC, SceneD, SceneE1, SceneE2, SceneF, SceneG];
export const bounds = (end: number) => [0, S(1), S(2), S(3), S(4), cue('study'), S(5) + 0.35, S(6) + 0.45, end];
