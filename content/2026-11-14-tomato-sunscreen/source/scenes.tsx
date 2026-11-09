import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, Beam, wavePath, Sun, HORIZON} from './parts';
import {cue, S} from './timeline';
import {SkinSection, SkinMacro, RealPlane} from './realskin';

// accent for this topic: tomato red
const TOM = '#E8473A';
const TOM_HI = '#FF8A6E';
const TOM_DEEP = '#9E2420';

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <radialGradient id="tomG" cx="0.36" cy="0.32" r="0.75">
        <stop offset="0" stopColor="#FFB49A" />
        <stop offset="0.28" stopColor={TOM_HI} />
        <stop offset="0.62" stopColor={TOM} />
        <stop offset="1" stopColor={TOM_DEEP} />
      </radialGradient>
      <radialGradient id="lycoG" cx="0.35" cy="0.3">
        <stop offset="0" stopColor="#FFD2C4" />
        <stop offset="0.5" stopColor={TOM} />
        <stop offset="1" stopColor={TOM_DEEP} />
      </radialGradient>
      <radialGradient id="redGlow">
        <stop offset="0" stopColor={TOM} stopOpacity="0.75" />
        <stop offset="1" stopColor={TOM} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="sparkG">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
        <stop offset="0.4" stopColor={C.goldHot} stopOpacity="0.9" />
        <stop offset="1" stopColor={C.gold} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="cloche" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.45" stopColor="#D9CBD3" />
        <stop offset="1" stopColor="#8E7C86" />
      </linearGradient>
      <linearGradient id="tubeG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={TOM_DEEP} />
        <stop offset="0.35" stopColor={TOM_HI} />
        <stop offset="0.7" stopColor={TOM} />
        <stop offset="1" stopColor={TOM_DEEP} />
      </linearGradient>
      <radialGradient id="patchSkin" cx="0.5" cy="0.45">
        <stop offset="0" stopColor="#F6D7D3" />
        <stop offset="1" stopColor="#D99AA2" />
      </radialGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

// glossy tomato with calyx
const Tomato: React.FC<{x: number; y: number; r: number; rot?: number; o?: number; glow?: number}> = ({x, y, r, rot = 0, o = 1, glow = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
    {glow > 0 && <circle r={r * 1.9} fill="url(#redGlow)" opacity={glow} />}
    <ellipse cx={0} cy={r * 0.98} rx={r * 0.85} ry={r * 0.16} fill="#170A10" opacity={0.35} filter="url(#blur12)" />
    <path
      d={`M0 ${-r * 0.82} C ${r * 0.62} ${-r * 0.98}, ${r * 1.08} ${-r * 0.5}, ${r * 1.04} ${r * 0.06} C ${r * 1.0} ${r * 0.66}, ${r * 0.52} ${r * 0.98}, 0 ${r * 0.96} C ${-r * 0.52} ${r * 0.98}, ${-r * 1.0} ${r * 0.66}, ${-r * 1.04} ${r * 0.06} C ${-r * 1.08} ${-r * 0.5}, ${-r * 0.62} ${-r * 0.98}, 0 ${-r * 0.82} Z`}
      fill="url(#tomG)"
    />
    <path d={`M${-r * 0.35} ${-r * 0.7} C ${-r * 0.5} ${-r * 0.1}, ${-r * 0.45} ${r * 0.5}, ${-r * 0.25} ${r * 0.9}`} stroke={TOM_DEEP} strokeWidth={r * 0.03} fill="none" opacity={0.35} />
    <path d={`M${r * 0.35} ${-r * 0.7} C ${r * 0.5} ${-r * 0.1}, ${r * 0.45} ${r * 0.5}, ${r * 0.25} ${r * 0.9}`} stroke={TOM_DEEP} strokeWidth={r * 0.03} fill="none" opacity={0.35} />
    <ellipse cx={-r * 0.42} cy={-r * 0.4} rx={r * 0.22} ry={r * 0.12} fill="#fff" opacity={0.75} transform={`rotate(-35 ${-r * 0.42} ${-r * 0.4})`} />
    <circle cx={-r * 0.2} cy={-r * 0.55} r={r * 0.05} fill="#fff" opacity={0.8} />
    <g transform={`translate(0 ${-r * 0.8})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={`M0 0 Q ${r * 0.12} ${-r * 0.05} ${r * 0.34} ${r * 0.06} Q ${r * 0.12} ${r * 0.08} 0 0 Z`} fill="#4E9A52" transform={`rotate(${a - 20}) scale(1 0.7)`} />
      ))}
      <rect x={-r * 0.035} y={-r * 0.2} width={r * 0.07} height={r * 0.2} rx={r * 0.03} fill="#3C7A40" />
    </g>
  </g>
);

// squeeze tube of tomato paste (sunscreen-style), nozzle at local (0, 230)
const Tube: React.FC<{x: number; y: number; rot: number; squeeze?: number; glow?: number}> = ({x, y, rot, squeeze = 0, glow = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {glow > 0 && <ellipse rx={260} ry={330} fill="url(#redGlow)" opacity={glow} />}
    <ellipse cx={30} cy={40} rx={130} ry={260} fill="#170A10" opacity={0.3} filter="url(#blur30)" />
    <g transform={`scale(${1 - 0.06 * squeeze} 1)`}>
      <path d="M-100 -230 L 100 -230 L 104 120 Q 104 170 40 196 L 26 206 L -26 206 L -40 196 Q -104 170 -104 120 Z" fill="url(#tubeG)" />
      <path d="M-70 -215 L -66 120" stroke="#fff" strokeWidth={16} opacity={0.35} strokeLinecap="round" />
      <rect x={-102} y={-60} width={204} height={150} fill="#FFF6EE" />
      <rect x={-102} y={-60} width={204} height={14} fill={C.goldHot} opacity={0.9} />
      <text y={-2} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={TOM_DEEP} letterSpacing={1}>
        TOMATO
      </text>
      <text y={38} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={TOM_DEEP} letterSpacing={1}>
        PASTE
      </text>
      <Tomato x={0} y={-130} r={42} />
    </g>
    {/* crimped end */}
    <rect x={-108} y={-262} width={216} height={36} rx={6} fill="#D9D0D4" />
    {Array.from({length: 10}).map((_, i) => (
      <line key={i} x1={-96 + i * 21} y1={-258} x2={-96 + i * 21} y2={-230} stroke="#A99AA2" strokeWidth={4} />
    ))}
    {/* nozzle */}
    <rect x={-26} y={200} width={52} height={34} rx={8} fill="#E9E0E4" />
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

// UVB-style beams from the sun towards the skin; `stopY` lets the film stop them
const RAYS = [
  [-380, 1650],
  [-150, 1720],
  [400, 1640],
];
const Rays: React.FC<{s: number; sx: number; sy: number; k: number; stopY?: number}> = ({s, sx, sy, k, stopY}) => (
  <g opacity={k}>
    {RAYS.map(([dx, ey], i) => {
      const y1 = stopY ?? ey;
      const t = (y1 - sy) / (ey - sy);
      const x1 = sx + dx * t;
      return <Beam key={i} d={wavePath(sx + dx * 0.1, sy + 60, x1, y1, 14, 60, s * 9 + i, 1)} color={C.uvb} o={0.85} w={6} />;
    })}
  </g>
);

// =============== A: hook — a tube of tomato paste squeezed onto skin like sunscreen ===============
const NOZ = {x: 518, y: 1188};
const DOL = {x: 420, y: 1440};
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tSun = cue('replace');
  const push = 1 + 0.08 * ease(prog(s, 0, S(1)));
  const flow = 0.75 + 0.25 * ease(prog(s, 0, 1.0));
  const dol = 0.75 + 0.25 * ease(prog(s, 0, 1.6));
  const tag = ease(prog(s, tSun - 0.3, tSun + 0.2));
  const sq = 0.5 + 0.5 * Math.sin(s * 5);
  const ribbon = `M${NOZ.x} ${NOZ.y} C ${NOZ.x - 30} ${NOZ.y + 90}, ${DOL.x + 40} ${DOL.y - 150}, ${DOL.x} ${DOL.y - 30}`;
  return (
    <Svg cam={camZoom(push, 540, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={5} color={C.goldHot} o={0.6} />
      <Sun x={W / 2 - 160} y={800} s={s} k={0.9} />
      <RealPlane s={s} seed={2} fx={{flush: 0.45 + 0.12 * Math.sin(s * 2)}} />
      <Rays s={s} sx={W / 2 - 160} sy={800} k={1} />
      {/* paste ribbon + dollop on the skin */}
      <path d={ribbon} stroke={TOM_DEEP} strokeWidth={46} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${flow} 1`} />
      <path d={ribbon} stroke={TOM} strokeWidth={36} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${flow} 1`} />
      <path d={ribbon} stroke={TOM_HI} strokeWidth={9} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${flow} 1`} transform="translate(-8 -2)" opacity={0.8} />
      <g transform={`translate(${DOL.x} ${DOL.y}) scale(${dol})`}>
        <ellipse cx={0} cy={18} rx={150} ry={36} fill="#170A10" opacity={0.25} filter="url(#blur12)" />
        <path d="M-140 10 C -150 -40, -80 -70, -20 -60 C 20 -110, 90 -80, 100 -40 C 160 -40, 170 20, 120 30 C 40 50, -100 50, -140 10 Z" fill={TOM} />
        <path d="M-90 -20 C -60 -50, -20 -50, 0 -40" stroke={TOM_HI} strokeWidth={12} fill="none" strokeLinecap="round" />
        <ellipse cx={30} cy={-66} rx={22} ry={9} fill="#fff" opacity={0.55} />
      </g>
      <Tube x={650} y={1000} rot={35} squeeze={sq} />
      {tag > 0 && (
        <g transform={`translate(860 720) scale(${0.8 + 0.2 * tag}) rotate(-8)`} opacity={tag}>
          <rect x={-120} y={-52} width={240} height={96} rx={48} fill={C.blush} />
          <text y={18} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={46} fill={C.plum}>
            SPF ?
          </text>
        </g>
      )}
    </Svg>
  );
};

// =============== B: a surprising food — tomato paste under a cloche ===============
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tTom = cue('tested');
  const tPaste = tTom + 0.45;
  const push = 1.06 - 0.06 * ease(prog(s, t0 - 0.2, S(2)));
  const lift = ease(prog(s, tTom - 0.35, tTom + 0.45));
  const tag = ease(prog(s, tPaste - 0.1, tPaste + 0.4));
  const cx = W / 2;
  const cy = 1150;
  const wob = Math.sin(s * 6) * 2 * (1 - lift);
  return (
    <Svg cam={camZoom(push * 1.28, W / 2, 1180)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={cx} cy={1050} r={780} fill={C.plum} opacity={0.75} filter="url(#blur30)" />
      <path d={`M${cx - 90} 560 L ${cx + 90} 560 L ${cx + 520} 1300 L ${cx - 520} 1300 Z`} fill={C.goldHot} opacity={0.07} filter="url(#blur30)" />
      <circle cx={cx} cy={760} r={300} fill={C.goldHot} opacity={0.12} filter="url(#blur30)" />
      {Array.from({length: 18}).map((_, i) => {
        const ph = (s * 0.12 + rand(i * 3)) % 1;
        return <circle key={i} cx={cx - 300 + rand(i * 7) * 600} cy={1150 - ph * 650} r={3 + rand(i) * 5} fill={C.goldHot} opacity={0.6 * Math.sin(ph * Math.PI)} />;
      })}
      <Bokeh s={s} seed={21} o={0.5} />
      <ellipse cx={cx} cy={cy + 120} rx={460} ry={70} fill={C.blush} opacity={0.12} filter="url(#blur12)" />
      <ellipse cx={cx} cy={cy + 70} rx={380} ry={74} fill="#EBDDE3" />
      <ellipse cx={cx} cy={cy + 62} rx={300} ry={52} fill="#F8F0F3" />
      <g opacity={0.25 + 0.75 * lift}>
        <path d={`M${cx - 210} ${cy - 10} Q ${cx - 200} ${cy + 110} ${cx} ${cy + 112} Q ${cx + 200} ${cy + 110} ${cx + 210} ${cy - 10} Z`} fill="#F3E6EA" stroke="#CDB8C1" strokeWidth={3} />
        <ellipse cx={cx} cy={cy - 10} rx={210} ry={46} fill={TOM_DEEP} />
        <ellipse cx={cx} cy={cy - 16} rx={190} ry={38} fill={TOM} />
        <path d={`M${cx - 120} ${cy - 18} q 60 -30 120 -6 q 50 18 100 -10`} stroke={TOM_HI} strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d={`M${cx - 70} ${cy - 2} q 50 -18 110 0`} stroke={TOM_DEEP} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.6} />
        <circle cx={cx - 60} cy={cy - 26} r={8} fill="#fff" opacity={0.7} />
      </g>
      <Tomato x={cx + 300} y={cy + 20} r={70} rot={12} o={lift} />
      <Tomato x={cx - 310} y={cy + 30} r={56} rot={-18} o={lift} />
      {lift > 0 &&
        lift < 1 &&
        Array.from({length: 14}).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const d = 160 + 260 * lift;
          return <circle key={i} cx={cx + Math.cos(a) * d} cy={cy - 120 + Math.sin(a) * d * 0.6} r={8 * (1 - lift)} fill={C.goldHot} />;
        })}
      <g transform={`translate(${cx + lift * 260} ${cy - 30 - lift * 720 + wob}) rotate(${lift * 24})`} opacity={1 - ease(prog(s, tTom + 0.2, tTom + 0.8))}>
        <path d="M-330 40 Q -330 -330 0 -330 Q 330 -330 330 40 Z" fill="url(#cloche)" />
        <path d="M-280 -40 Q -250 -260 -60 -300" stroke="#fff" strokeWidth={14} fill="none" opacity={0.7} strokeLinecap="round" />
        <rect x={-360} y={30} width={720} height={26} rx={13} fill="#CBBCC4" />
        <circle cx={0} cy={-350} r={30} fill="#E9E0E5" stroke="#B9A9B2" strokeWidth={3} />
        <text y={-90} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={130} fill={C.plum} opacity={0.55}>
          ?
        </text>
      </g>
      <Pill x={cx} y={1400} k={tag} text="TOMATO PASTE" color={TOM_HI} size={42} />
    </Svg>
  );
};

// =============== C: lycopene in blood → skin; UV sparks; lycopene soaks them ===============
const SURF = 760;
const EPI = 230;
const VES = SURF + EPI + 330;
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tLyc = cue('lycopene', 2);
  const tBlood = cue('blood');
  const tUV = cue('UV', 2);
  const tSparks = cue('sparks', 2);
  const tSponge = cue('sponge');
  const push = 1.07 - 0.07 * ease(prog(s, t0 - 0.3, t0 + 1.4));
  const lycK = ease(prog(s, t0 - 0.2, t0 + 0.6));
  const flow = ease(prog(s, tBlood - 0.5, tBlood + 1.2));
  const uvK = ease(prog(s, tUV - 0.3, tUV + 0.3));
  const sparkK = ease(prog(s, tSparks - 0.4, tSparks + 0.3));
  const soak = ease(prog(s, tSponge - 0.9, tSponge + 0.8));
  const tagK = ease(prog(s, tLyc - 0.3, tLyc + 0.3));
  const drops = Array.from({length: 16}).map((_, i) => ({x: 90 + rand(i * 5 + 2) * 900, y: SURF + 50 + rand(i * 7 + 3) * 300, ph: rand(i * 11)}));
  const sparks = Array.from({length: 14}).map((_, i) => ({x: 120 + rand(i * 13 + 1) * 840, y: SURF + 30 + rand(i * 17 + 4) * 200}));
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={SURF + 200} fill="url(#sky)" />
      <Bokeh s={s} n={14} top={420} bottom={SURF} seed={9} color={C.goldHot} o={0.5} />
      <SkinSection s={s} top={SURF} epi={EPI} seed={4} flush={0.6 * sparkK * (1 - soak)} />
      <text x={56} y={SURF + 60} fontFamily="Poppins" fontWeight={700} fontSize={26} fill={C.plum} letterSpacing={5} opacity={0.85}>
        SKIN
      </text>
      <text x={56} y={VES + 100} fontFamily="Poppins" fontWeight={700} fontSize={26} fill={C.white} letterSpacing={5} opacity={0.85}>
        BLOOD
      </text>
      {Array.from({length: 14}).map((_, i) => {
        const x = ((rand(i * 3) * (W + 200) + s * 180) % (W + 200)) - 100;
        const y = VES + (rand(i) - 0.5) * 40;
        return <circle key={i} cx={x} cy={y} r={14} fill="url(#lycoG)" opacity={lycK} />;
      })}
      {drops.map((d, i) => {
        const k = clamp(flow * 1.5 - d.ph * 0.5);
        const y0 = VES;
        const yy = y0 + (d.y - y0) * easeOut(k);
        const hold = soak > 0 ? 1 + 0.35 * Math.sin(s * 5 + i) * soak : 1;
        return (
          <g key={i} opacity={k}>
            <circle cx={d.x} cy={yy} r={34 * hold} fill="url(#redGlow)" opacity={0.6} />
            <circle cx={d.x} cy={yy} r={16 * hold} fill="url(#lycoG)" />
          </g>
        );
      })}
      {[250, 560, 860].map((x, i) => (
        <Beam key={i} d={wavePath(x - 120, 440, x, SURF + 40, 14, 60, s * 9 + i, uvK)} color={C.uvb} o={uvK * (1 - 0.6 * soak)} w={7} />
      ))}
      {sparks.map((p, i) => {
        const appear = clamp(sparkK * 1.6 - rand(i * 3) * 0.6);
        const d = drops[i % drops.length];
        const m = ease(clamp(soak * 1.4 - rand(i * 7) * 0.4));
        const x = p.x + (d.x - p.x) * m;
        const y = p.y + Math.sin(s * 8 + i) * 6 + (d.y - p.y) * m;
        const r = 20 * (1 - m) + 4;
        const o = appear * (1 - m);
        return o > 0.01 ? (
          <g key={i} opacity={o}>
            <circle cx={x} cy={y} r={r * 2.4} fill="url(#sparkG)" />
            <path d={`M${x - r} ${y} L ${x + r} ${y} M${x} ${y - r} L ${x} ${y + r}`} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
          </g>
        ) : null;
      })}
      <g transform={`translate(${W - 230} ${SURF + EPI + 120})`} opacity={tagK}>
        <rect x={-170} y={-44} width={340} height={80} rx={40} fill="rgba(23,10,16,0.65)" stroke={TOM_HI} strokeWidth={3} />
        <text y={12} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={TOM_HI} letterSpacing={4}>
          LYCOPENE
        </text>
      </g>
      <g opacity={sparkK * (1 - soak)} transform={`translate(${W - 230} ${SURF - 90})`}>
        <rect x={-150} y={-40} width={300} height={74} rx={37} fill="rgba(23,10,16,0.6)" stroke={C.goldHot} strokeWidth={3} />
        <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.goldHot} letterSpacing={3}>
          DAMAGE
        </text>
      </g>
    </Svg>
  );
};

// =============== D: the 2001 study — oil only vs tomato paste + oil ===============
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const t40 = cue('40', 3);
  const t10 = cue('10', 3);
  const tLamp = cue('lamp');
  const tPct = cue('40%');
  const push = 1 + 0.05 * ease(prog(s, t0, S(4)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const doseK = ease(prog(s, t40 - 0.3, t40 + 0.3));
  const wk = Math.round(10 * ease(prog(s, t10 - 1.0, t10 + 0.6)));
  const lamp = ease(prog(s, tLamp - 0.3, tLamp + 0.2));
  const red = ease(prog(s, tLamp + 0.1, tPct + 0.1));
  const badge = ease(prog(s, tPct - 0.15, tPct + 0.3));
  const cards = [
    {x: 290, title: 'Oil only', redK: 1, hl: false},
    {x: 790, title: 'Tomato paste', redK: 0.6, hl: true},
  ];
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} o={0.5} />
      <g opacity={doseK}>
        <rect x={W / 2 - 300} y={548} width={600} height={70} rx={35} fill="rgba(23,10,16,0.6)" stroke={C.blush} strokeWidth={2.5} />
        <text x={W / 2} y={595} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={C.white}>
          40 g / day · week {wk}
        </text>
      </g>
      {cards.map((c, i) => {
        const hl = c.hl ? badge : 0;
        return (
          <g key={i} opacity={inK} transform={`translate(${c.x} 1060)`}>
            <rect x={-215} y={-340} width={430} height={640} rx={36} fill="rgba(238,221,226,0.07)" stroke={hl > 0 ? C.white : 'rgba(238,221,226,0.3)'} strokeWidth={hl > 0 ? 5 : 3} />
            <text y={-270} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={38} fill={C.white}>
              {c.title}
            </text>
            <text y={-228} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={24} fill={C.blush} opacity={0.75}>
              {i === 0 ? 'olive oil' : '+ olive oil'}
            </text>
            {i === 0 ? (
              <g transform="translate(0 -140)">
                <path d="M-26 -50 L 26 -50 L 34 40 Q 0 54 -34 40 Z" fill="#F2D27A" opacity={0.9} />
                <rect x={-14} y={-72} width={28} height={24} rx={6} fill="#C9A54A" />
              </g>
            ) : (
              <Tomato x={0} y={-140} r={52} rot={-8} />
            )}
            <g transform="translate(0 -30)" opacity={0.4 + 0.6 * lamp}>
              <rect x={-90} y={-22} width={180} height={34} rx={12} fill="#C7B2FF" opacity={0.85} />
              {lamp > 0 &&
                [-50, 0, 50].map((dx, j) => <line key={j} x1={dx} y1={18} x2={dx * 1.5} y2={110} stroke="#C7B2FF" strokeWidth={6} strokeLinecap="round" opacity={lamp * (0.5 + 0.5 * Math.sin(s * 12 + j))} />)}
            </g>
            <SkinMacro cx={0} cy={170} r={115} seed={11 + i} redness={red * c.redK} />
            <text y={330} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush} letterSpacing={3} opacity={0.85}>
              REDNESS AFTER UV
            </text>
          </g>
        );
      })}
      <Pill x={790} y={1480} k={badge} text="−40%" sub="LESS REDNESS" color={C.plum} fill={C.blush} size={54} w={300} />
      <text x={W / 2} y={1660} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={22} fill={C.blush} opacity={0.55 * inK}>
        Stahl et al., J Nutr, 2001 · 9 vs 10 adults · 10 weeks · illustrative patches
      </text>
    </Svg>
  );
};

// =============== E: honest scale — UV getting through: tomato (≈SPF 2–3) vs daily SPF 30 ===============
const UVPanel: React.FC<{s: number; x: number; k: number; pass: (i: number) => boolean; shield: 'tomato' | 'spf'; flow: number; title: string; sub: string; big: string}> = ({
  s,
  x,
  k,
  pass,
  shield,
  flow,
  title,
  sub,
  big,
}) => {
  const top = 700;
  const sh = 1010;
  const skin = 1250;
  const w = 400;
  const N = 30;
  let hits = 0;
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const lx = x - w / 2 + 14 + (i / (N - 1)) * (w - 28);
    const ph = (s * 0.55 + rand(i * 7 + (shield === 'spf' ? 3 : 0))) % 1;
    const goes = pass(i);
    if (goes) hits++;
    const yEnd = goes ? skin + 10 : sh;
    const y = top + (yEnd - top) * ph;
    const blocked = !goes && ph > 0.9;
    dots.push(
      <g key={i} opacity={flow}>
        {!blocked && <circle cx={lx + Math.sin(ph * 12 + i) * 4} cy={y} r={7} fill={C.uva} />}
        {blocked && <circle cx={lx} cy={sh - 6} r={14 * (1 - (ph - 0.9) * 10) + 4} fill="url(#sparkG)" />}
      </g>,
    );
  }
  const red = flow * (hits / N);
  return (
    <g opacity={k}>
      <rect x={x - w / 2 - 20} y={560} width={w + 40} height={980} rx={36} fill="rgba(238,221,226,0.06)" stroke="rgba(238,221,226,0.28)" strokeWidth={3} />
      <text x={x} y={620} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={C.white}>
        {title}
      </text>
      <text x={x} y={660} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} opacity={0.85} letterSpacing={2}>
        {sub}
      </text>
      <rect x={x - w / 2} y={top - 14} width={w} height={14} rx={7} fill={C.uva} opacity={0.6} />
      {dots}
      {shield === 'tomato' ? (
        <g>
          <rect x={x - w / 2} y={sh} width={w} height={16} rx={8} fill={TOM} opacity={0.75} />
          <rect x={x - w / 2} y={sh} width={w} height={16} rx={8} fill={TOM} opacity={0.4} filter="url(#blur4)" />
        </g>
      ) : (
        <g>
          <rect x={x - w / 2} y={sh - 10} width={w} height={36} rx={14} fill={C.goldHot} opacity={0.95} />
          <rect x={x - w / 2} y={sh - 30} width={w} height={70} rx={20} fill={C.gold} opacity={0.35} filter="url(#blur12)" />
        </g>
      )}
      <SkinMacro cx={x} cy={skin + 75} r={0} shape="rect" w={w} h={150} seed={shield === 'tomato' ? 21 : 22} redness={Math.min(1, red * 1.6)} />
      <text x={x} y={skin + 92} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={44} fill={C.white} stroke="rgba(60,20,30,0.45)" strokeWidth={6} paintOrder="stroke">
        {big}
      </text>
      <text x={x} y={1500} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={24} fill={C.blush} letterSpacing={3} opacity={0.85}>
        {shield === 'tomato' ? 'A LOT STILL GETS IN' : 'ABOUT 3% GETS IN'}
      </text>
    </g>
  );
};

export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tSPF = cue('SPF', 4);
  const tWeek = cue('week', 4);
  const tSun = cue('Sunscreen', 5);
  const t30 = cue('30', 5);
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(6)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.5));
  const flowT = ease(prog(s, t0, t0 + 0.8));
  const tagT = ease(prog(s, tSPF - 0.3, tSPF + 0.4));
  const wkK = ease(prog(s, tWeek - 0.3, tWeek + 0.3)) * (1 - ease(prog(s, tSun - 0.6, tSun - 0.1)));
  const sunK = ease(prog(s, tSun - 0.4, tSun + 0.3));
  const spfK = ease(prog(s, t30 - 0.3, t30 + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <circle cx={790} cy={1050} r={320} fill={C.goldHot} opacity={0.1 * sunK} filter="url(#blur30)" />
      <Bokeh s={s} seed={71} o={0.5} />
      <UVPanel s={s} x={290} k={inK} pass={(i) => rand(i * 13 + 2) < 0.4} shield="tomato" flow={flowT} title="Tomato paste" sub={tagT > 0.5 ? '≈ SPF 2–3 · 10 WEEKS' : '10 WEEKS'} big={tagT > 0.5 ? 'SPF 2–3' : ''} />
      {wkK > 0 && (
        <g transform="translate(290 1610)" opacity={wkK}>
          <rect x={-230} y={-40} width={460} height={78} rx={39} fill="rgba(23,10,16,0.7)" stroke={C.blush} strokeWidth={3} />
          <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.blush}>
            week 4: no difference yet
          </text>
        </g>
      )}
      {sunK > 0 ? (
        <UVPanel s={s} x={790} k={sunK} pass={(i) => i === 11} shield="spf" flow={sunK} title="Daily sunscreen" sub={spfK > 0.5 ? 'SPF 30 · BLOCKS 97% UVB' : 'NO WAITING'} big={spfK > 0.5 ? 'SPF 30' : ''} />
      ) : (
        <g opacity={inK * 0.5}>
          <rect x={790 - 220} y={560} width={440} height={980} rx={36} fill="rgba(238,221,226,0.04)" stroke="rgba(238,221,226,0.18)" strokeWidth={3} strokeDasharray="14 12" />
          <text x={790} y={1060} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={80} fill={C.blush} opacity={0.5}>
            ?
          </text>
        </g>
      )}
      <text x={W / 2} y={1700} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={21} fill={C.blush} opacity={0.6 * inK}>
        Stahl 2001 · W. Stahl in Science News 2001 · AAD (accessed 2026) · illustrative: UV through ≈ 1/SPF
      </text>
    </Svg>
  );
};

// =============== F: bonus vs shield ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tTom = cue('tomatoes');
  const tBonus = cue('bonus');
  const tSun = cue('sunscreen', 6);
  const tShield = cue('shield', 6);
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const film = ease(prog(s, tSun - 0.2, tShield + 0.2));
  const item = (x: number, t: number, label: string, tag: string, tagT: number, col: string, children: React.ReactNode) => {
    const k = 0.35 + 0.65 * ease(prog(s, t - 0.35, t + 0.25));
    const tk = ease(prog(s, tagT - 0.25, tagT + 0.25));
    return (
      <g transform={`translate(${x} 760) scale(${0.85 + 0.15 * k})`} opacity={k}>
        <circle r={130} fill="rgba(23,10,16,0.6)" stroke="rgba(238,221,226,0.35)" strokeWidth={3} />
        {children}
        <text y={180} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={26} fill={C.blush} letterSpacing={3}>
          {label}
        </text>
        <g opacity={tk} transform={`translate(0 250) scale(${0.85 + 0.15 * tk})`}>
          <rect x={-120} y={-38} width={240} height={70} rx={35} fill={col} />
          <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={C.plum} letterSpacing={3}>
            {tag}
          </text>
        </g>
      </g>
    );
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={HORIZON} seed={61} o={0.6} color={C.goldHot} />
      <g transform="translate(0 320)">
        <RealPlane s={s} seed={3} fx={{film, filmSheen: prog(s, tSun, tSun + 2.2)}} />
      </g>
      {item(
        300,
        tTom,
        'TOMATOES + OIL',
        'BONUS',
        tBonus,
        TOM_HI,
        <g>
          <Tomato x={-10} y={10} r={62} rot={-10} />
          <path d="M44 30 L 70 -40 L 92 30 Z" fill="#F2D27A" opacity={0.9} />
        </g>,
      )}
      {item(
        780,
        tSun,
        'SUNSCREEN',
        'SHIELD',
        tShield,
        C.goldHot,
        <g transform="rotate(-12)">
          <path d="M -40 -72 L 40 -72 L 34 52 L -34 52 Z" fill={C.blush} />
          <rect x={-22} y={52} width={44} height={26} rx={6} fill={C.plum} />
          <text y={0} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={C.plum}>
            SPF
          </text>
        </g>,
      )}
    </Svg>
  );
};

// =============== H: loop (sun, tomato, skin) + film + scan + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tIn = cue('inside');
  const tOut = cue('outside');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tOut, tGlowi - 0.1);
  const push = 1 + 0.1 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const glow = ease(prog(s, tIn - 0.3, tIn + 0.4));
  const film = ease(prog(s, tOut - 0.4, tOut + 0.6));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tOut + 0.3, tOut + 1.3)) * (1 - cardK);
  const bob = Math.sin(s * 2.2) * 10;
  const stopY = 1650 - 640 * film;
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1300)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Bokeh s={s} top={200} bottom={HORIZON} seed={5} color={C.goldHot} o={0.6} />
        <Sun x={W / 2 - 160} y={800} s={s} k={0.9} />
        <RealPlane s={s} seed={2} fx={{flush: 0.45 * (1 - film), film, filmSheen: prog(s, tOut, tOut + 2.4), scan}} />
        <Rays s={s} sx={W / 2 - 160} sy={800} k={1} stopY={film > 0.02 ? stopY : undefined} />
        {film > 0.2 &&
          RAYS.map(([dx, ey], i) => {
            const t = (stopY - 800) / (ey - 800);
            return <circle key={i} cx={W / 2 - 160 + dx * t} cy={stopY} r={34 + 8 * Math.sin(s * 10 + i)} fill="url(#sparkG)" opacity={film} />;
          })}
        <Tube x={650} y={1000 + bob * 0.5} rot={35} glow={0.3 + 0.7 * glow} />
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
export const SCENES: React.FC<{s: number}>[] = [SceneA, SceneB, SceneC, SceneD, SceneE, SceneF, SceneH];
export const bounds = (end: number) => [0, S(1), S(2), S(3), S(4), S(6), S(7), end];
