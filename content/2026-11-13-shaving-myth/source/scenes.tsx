import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh, SkinPlane, HORIZON} from './parts';
import {cue, S} from './timeline';

// accent for this topic: razor steel aqua
const AQ = '#9ED8E6';
const HAIR = '#3B2026';

// ---------- quality helpers ----------
const backOut = (t: number) => {
  const x = clamp(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <filter id="drop" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#0B0408" floodOpacity="0.55" />
      </filter>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.35" stopColor="#D8E4EA" />
        <stop offset="0.55" stopColor="#9AAAB4" />
        <stop offset="1" stopColor="#E8F0F4" />
      </linearGradient>
      <linearGradient id="handle" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#3A2230" />
        <stop offset="0.45" stopColor="#7A4A5C" />
        <stop offset="1" stopColor="#2A1620" />
      </linearGradient>
      <linearGradient id="hairG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#24121A" />
        <stop offset="0.4" stopColor="#6A4048" />
        <stop offset="0.6" stopColor="#4A2A32" />
        <stop offset="1" stopColor="#1C0E14" />
      </linearGradient>
      <radialGradient id="aqGlow">
        <stop offset="0" stopColor={AQ} stopOpacity="0.55" />
        <stop offset="1" stopColor={AQ} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="bulbG" cx="0.4" cy="0.35">
        <stop offset="0" stopColor="#FFE3A8" />
        <stop offset="0.5" stopColor="#E8A06A" />
        <stop offset="1" stopColor="#9A4A3A" />
      </radialGradient>
      <linearGradient id="paperG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F7EBD8" />
        <stop offset="1" stopColor="#D9C4A4" />
      </linearGradient>
      <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF4E0" stopOpacity="0.32" />
        <stop offset="1" stopColor="#FFF4E0" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="legG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#C98A8E" />
        <stop offset="0.5" stopColor="#F2C9C2" />
        <stop offset="1" stopColor="#C98A8E" />
      </linearGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);
const camZoom = (k: number, cx = W / 2, cy = H / 2) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

// volumetric light rays behind content
const Rays: React.FC<{s: number; o?: number; x?: number}> = ({s, o = 1, x = 180}) => (
  <g opacity={o} style={{mixBlendMode: 'screen'}}>
    {[0, 1, 2, 3].map((i) => (
      <rect
        key={i}
        x={x + i * 150}
        y={-200}
        width={70 + i * 25}
        height={1900}
        fill="url(#ray)"
        opacity={0.45 + 0.25 * Math.sin(s * 0.9 + i * 1.7)}
        transform={`rotate(${-18 + i * 3} ${x} 0)`}
        filter="url(#blur12)"
      />
    ))}
  </g>
);
// large out-of-focus foreground bokeh + dust: adds depth in front of everything
const Front: React.FC<{s: number; seed?: number; col?: string}> = ({s, seed = 1, col = C.blush}) => (
  <g>
    {[
      [60, 520, 120],
      [1010, 760, 150],
      [80, 1560, 170],
      [1000, 1700, 120],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x + Math.sin(s * 0.4 + i + seed) * 20} cy={y + Math.cos(s * 0.3 + i) * 16} r={r} fill={col} opacity={0.07 + 0.03 * Math.sin(s + i)} filter="url(#blur30)" />
    ))}
    {Array.from({length: 26}).map((_, i) => {
      const x = (rand(i * 7 + seed) * W + s * 6 * (rand(i) - 0.5) * 4 + W) % W;
      const y = H - ((rand(i * 3 + seed) * H + s * (14 + rand(i * 5) * 20)) % H);
      return <circle key={'d' + i} cx={x} cy={y} r={1.5 + rand(i * 9) * 2.5} fill="#FFF4E8" opacity={0.25 + 0.3 * rand(i * 11)} />;
    })}
  </g>
);
const Stage: React.FC<{s: number; seed: number; col?: string}> = ({s, seed, col = AQ}) => (
  <>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
    <circle cx={W / 2} cy={1050} r={860} fill={C.plum} opacity={0.85} filter="url(#blur30)" />
    <Rays s={s} o={0.6} />
    <Bokeh s={s} seed={seed} color={col} o={0.45} />
  </>
);
const Cite: React.FC<{text: string; o?: number; y?: number}> = ({text, o = 1, y = 1700}) => (
  <g opacity={o}>
    <rect x={W / 2 - text.length * 5.4 - 24} y={y - 26} width={text.length * 10.8 + 48} height={38} rx={19} fill="rgba(23,10,16,0.55)" />
    <text x={W / 2} y={y} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={20} fill={C.blush} opacity={0.9}>
      {text}
    </text>
  </g>
);
const Pill: React.FC<{x: number; y: number; k: number; text: string; color: string; dark?: boolean; size?: number}> = ({x, y, k, text, color, dark, size = 34}) =>
  k > 0 ? (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * backOut(k)})`} opacity={clamp(k * 1.5)}>
      <rect x={-(text.length * size * 0.33 + 44)} y={-size * 1.3} width={2 * (text.length * size * 0.33 + 44)} height={size * 2.4} rx={size * 1.2} fill={dark ? 'rgba(23,10,16,0.75)' : color} stroke={color} strokeWidth={3} filter="url(#drop)" />
      <text y={size * 0.35} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={size} fill={dark ? color : C.plum} letterSpacing={2}>
        {text}
      </text>
    </g>
  ) : null;

// ---------- razor ----------
const Razor: React.FC<{x: number; y: number; rot?: number; sc?: number; o?: number}> = ({x, y, rot = 0, sc = 1, o = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={o} filter="url(#drop)">
    {/* handle */}
    <path d="M-34 40 L 34 40 L 26 520 Q 0 548 -26 520 Z" fill="url(#handle)" />
    <path d="M-12 70 L -8 500" stroke="#fff" strokeWidth={6} opacity={0.18} strokeLinecap="round" />
    {Array.from({length: 6}).map((_, i) => (
      <rect key={i} x={-26} y={300 + i * 26} width={52} height={8} rx={4} fill="#2A1620" opacity={0.6} />
    ))}
    {/* neck */}
    <rect x={-22} y={0} width={44} height={50} rx={10} fill="url(#steel)" />
    {/* head */}
    <rect x={-170} y={-70} width={340} height={80} rx={26} fill="#2A1620" />
    <rect x={-160} y={-62} width={320} height={64} rx={20} fill="url(#steel)" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-150} y={-54 + i * 18} width={300} height={6} rx={3} fill="#5C6A74" opacity={0.85} />
    ))}
    <rect x={-160} y={-62} width={320} height={14} rx={7} fill={AQ} opacity={0.65} />
  </g>
);

// ---------- a tapered hair (macro) ----------
const MacroHair: React.FC<{x0: number; y: number; len: number; w: number; cut?: number; tip?: number}> = ({x0, y, len, w, cut = 0, tip = 1}) => {
  // hair lies horizontally: root at x0 (left), tip at right; cut = position (0..1) along length where it's cut (0 = intact)
  const L = cut > 0 ? len * cut : len;
  const half = (u: number) => (w / 2) * (u < 0.55 ? 1 : 1 - Math.pow((u - 0.55) / 0.45, 1.6) * 0.96);
  let top = '';
  let bot = '';
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * (L / len);
    const x = x0 + u * len;
    top += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (y - half(u)).toFixed(1);
    bot = 'L' + x.toFixed(1) + ' ' + (y + half(u)).toFixed(1) + bot;
  }
  const endU = L / len;
  const endHalf = half(endU);
  return (
    <g filter="url(#drop)">
      <path d={`${top} ${bot.replace(/^L/, 'L')} Z`} fill="url(#hairG)" />
      <path d={top} stroke="#fff" strokeWidth={4} fill="none" opacity={0.18} transform="translate(0 6)" />
      {/* cuticle scales */}
      {Array.from({length: 14}).map((_, i) => {
        const u = (i + 0.5) / 14;
        if (u > endU - 0.02) return null;
        const xx = x0 + u * len;
        const hh = half(u);
        return <path key={i} d={`M${xx} ${y - hh} q 18 ${hh} 0 ${hh * 2}`} stroke="#8A5A62" strokeWidth={2} fill="none" opacity={0.45} />;
      })}
      {cut > 0 && (
        <g>
          <ellipse cx={x0 + L} cy={y} rx={endHalf * 0.32} ry={endHalf} fill="#6E4450" stroke="#B98A92" strokeWidth={3} />
          <ellipse cx={x0 + L} cy={y} rx={endHalf * 0.16} ry={endHalf * 0.45} fill="#4A2A32" />
        </g>
      )}
    </g>
  );
};

// hairs standing on the perspective skin plane
const plane = (u: number, z: number) => {
  const y = HORIZON + (H - HORIZON) * Math.pow(z, 1.5);
  const spread = W * (0.5 + 2.6 * Math.pow(z, 1.5));
  return {x: W / 2 + (u - 0.5) * spread, y, sc: 0.35 + 1.6 * Math.pow(z, 1.4)};
};
const hairsPlane = Array.from({length: 46}).map((_, i) => ({u: 0.08 + rand(i * 3 + 2) * 0.84, z: 0.18 + rand(i * 5 + 1) * 0.8, lean: (rand(i * 7) - 0.5) * 20}));
const PlaneHairs: React.FC<{s: number; shaveX: number; regrow: number}> = ({s, shaveX, regrow}) => (
  <g>
    {hairsPlane.map((h, i) => {
      const p = plane(h.u, h.z);
      const shaved = p.x < shaveX;
      const len = (shaved ? 16 + 12 * regrow : 150) * p.sc;
      const w = 6.5 * p.sc;
      const sway = shaved ? 0 : Math.sin(s * 1.2 + i) * 6 * p.sc;
      return (
        <g key={i}>
          <ellipse cx={p.x} cy={p.y} rx={w * 1.6} ry={w * 0.6} fill="#5E2735" opacity={0.6} />
          {shaved ? (
            <rect x={p.x - w / 2} y={p.y - len} width={w} height={len} rx={1} fill={HAIR} />
          ) : (
            <path d={`M${p.x - w / 2} ${p.y} Q ${p.x + h.lean * p.sc + sway} ${p.y - len * 0.6} ${p.x + h.lean * 1.6 * p.sc + sway} ${p.y - len} L ${p.x + w / 2} ${p.y} Z`} fill={HAIR} />
          )}
        </g>
      );
    })}
  </g>
);

// =============== A: hook — razor sweeps, stubble left, "thicker?" ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tThick = cue('thicker?');
  const push = 1 + 0.08 * ease(prog(s, 0, S(1)));
  const sweep = ease(prog(s, -0.2, 2.4));
  const shaveX = 260 + 690 * sweep;
  const q = ease(prog(s, tThick - 0.3, tThick + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Rays s={s} o={0.7} x={300} />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={AQ} o={0.55} />
      <SkinPlane s={s} />
      <PlaneHairs s={s} shaveX={shaveX} regrow={q} />
      {/* foam trail */}
      <rect x={-200} y={1230} width={shaveX + 200} height={60} fill="#FFFFFF" opacity={0.12} filter="url(#blur12)" />
      <Razor x={shaveX - 40} y={1180} rot={-8} sc={1.0} />
      <g transform={`translate(${W / 2 + 250} 640) scale(${0.5 + 0.5 * backOut(q)})`} opacity={clamp(q * 1.5)}>
        <circle r={66} fill="rgba(23,10,16,0.75)" stroke={AQ} strokeWidth={4} filter="url(#drop)" />
        <text y={26} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={74} fill={AQ}>
          ?
        </text>
      </g>
      <Front s={s} seed={3} />
    </Svg>
  );
};

// =============== B: the oldest myth — tested in 1928 and 1970 ===============
const OldDoc: React.FC<{x: number; y: number; rot: number; year: string; title: string; k: number; s: number}> = ({x, y, rot, year, title, k, s}) => (
  <g transform={`translate(${x} ${y + (1 - k) * 120}) rotate(${rot + Math.sin(s * 0.8) * 1.2}) scale(${0.85 + 0.15 * backOut(k)})`} opacity={clamp(k * 1.4)} filter="url(#drop)">
    <rect x={-190} y={-250} width={380} height={500} rx={12} fill="url(#paperG)" />
    <rect x={-190} y={-250} width={380} height={500} rx={12} fill="none" stroke="#B89A72" strokeWidth={3} />
    <text y={-170} textAnchor="middle" fontFamily="Lora" fontWeight={700} fontSize={72} fill="#5A3A2A">
      {year}
    </text>
    <line x1={-140} y1={-140} x2={140} y2={-140} stroke="#8A6A4A" strokeWidth={3} />
    <text y={-100} textAnchor="middle" fontFamily="Lora" fontWeight={600} fontSize={26} fill="#5A3A2A">
      {title}
    </text>
    {Array.from({length: 7}).map((_, i) => (
      <rect key={i} x={-140} y={-60 + i * 34} width={i % 3 === 2 ? 170 : 280} height={10} rx={5} fill="#B89A72" opacity={0.7} />
    ))}
    <circle cx={110} cy={180} r={46} fill="none" stroke="#B5532E" strokeWidth={5} opacity={0.75} />
    <text x={110} y={190} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill="#B5532E" opacity={0.8}>
      TEST
    </text>
  </g>
);
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tOld = cue('oldest');
  const t28 = cue('1928,');
  const t70 = cue('1970', 1);
  const push = 1.06 - 0.06 * ease(prog(s, t0 - 0.3, t0 + 1.4));
  const mythK = ease(prog(s, t0 - 0.3, tOld + 0.3));
  const k28 = ease(prog(s, t0 - 0.3, t0 + 0.5));
  const k70 = ease(prog(s, t0 + 0.1, t0 + 0.9));
  const y28 = ease(prog(s, t28 - 0.3, t28 + 0.3));
  const y70 = ease(prog(s, t70 - 0.3, t70 + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <Stage s={s} seed={21} col={C.goldHot} />
      {/* myth banner */}
      <g transform={`translate(${W / 2} 600) scale(${0.7 + 0.3 * backOut(mythK)})`} opacity={clamp(mythK * 1.4)}>
        <rect x={-290} y={-60} width={580} height={110} rx={55} fill="rgba(23,10,16,0.7)" stroke={C.gold} strokeWidth={3} filter="url(#drop)" />
        <text y={14} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={40} fill={C.gold} letterSpacing={3}>
          “SHAVE = THICKER”
        </text>
      </g>
      <OldDoc x={330} y={1120} rot={-7} year="1928" title="Hair growth and shaving" k={k28} s={s} />
      <OldDoc x={750} y={1160} rot={6} year="1970" title="Shaving and hair growth" k={k70} s={s} />
      {[
        [330, 1120, -7, y28],
        [750, 1160, 6, y70],
      ].map(([x, y, r, k], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity={k}>
          <rect x={-120} y={-230} width={240} height={86} rx={20} fill="none" stroke={C.gold} strokeWidth={6} filter="url(#glow)" />
        </g>
      ))}
      {/* magnifier sweeping over the docs */}
      <g transform={`translate(${330 + 420 * ease(prog(s, t28, S(2)))} ${1100 + Math.sin(s * 1.5) * 30})`} opacity={y28 * 0.95} filter="url(#drop)">
        <circle r={110} fill="rgba(158,216,230,0.14)" stroke="#F6F2F4" strokeWidth={14} />
        <path d="M78 78 L 160 160" stroke="#F6F2F4" strokeWidth={30} strokeLinecap="round" />
      </g>
      <Cite text="Trotter, Anat Rec, 1928 · Lynfield & Macwilliams, J Invest Dermatol, 1970" o={k28} />
      <Front s={s} seed={7} col={C.goldHot} />
    </Svg>
  );
};

// =============== C: five men, one leg shaved — nothing changed ===============
const Leg: React.FC<{x: number; s: number; shaved: boolean; label: string; k: number; weeks: number}> = ({x, s, shaved, label, k, weeks}) => (
  <g transform={`translate(${x} ${1080 + (1 - k) * 80})`} opacity={k}>
    <text y={-410} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={shaved ? AQ : C.white} letterSpacing={2}>
      {label}
    </text>
    <path d="M-95 -380 C -110 -100, -80 200, -60 380 L 70 380 C 90 200, 110 -100, 95 -380 Z" fill="url(#legG)" filter="url(#drop)" />
    <path d="M-40 -360 C -50 -100, -30 200, -20 360" stroke="#fff" strokeWidth={10} opacity={0.18} fill="none" strokeLinecap="round" />
    {Array.from({length: 34}).map((_, i) => {
      const yy = -340 + rand(i * 3 + (shaved ? 1 : 2)) * 700;
      const xx = (rand(i * 7) - 0.5) * 150;
      const len = shaved ? 8 + 10 * ((weeks % 1) + 0.2) : 34;
      return shaved ? (
        <rect key={i} x={xx - 2} y={yy - len} width={4} height={len} fill={HAIR} />
      ) : (
        <path key={i} d={`M${xx - 2} ${yy} q ${8 + Math.sin(s + i) * 3} ${-len * 0.6} ${16} ${-len} L ${xx + 2} ${yy} Z`} fill={HAIR} />
      );
    })}
  </g>
);
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tFive = cue('five');
  const tWeek = cue('week');
  const tWeight = cue('weight,');
  const tWidth = cue('width');
  const tSpeed = cue('speed');
  const tChange = cue('change.', 2);
  const push = 1 + 0.05 * ease(prog(s, t0, S(3)));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const legK = ease(prog(s, tFive - 0.5, tFive + 0.3));
  const weeks = prog(s, tWeek - 0.3, tWeight) * 12;
  const metrics = [
    {t: tWeight, label: 'WEIGHT', icon: 0},
    {t: tWidth, label: 'WIDTH', icon: 1},
    {t: tSpeed, label: 'SPEED', icon: 2},
  ];
  const eqK = ease(prog(s, tChange - 0.3, tChange + 0.3));
  return (
    <Svg cam={camZoom(push, W / 2, 1000)}>
      <Stage s={s} seed={31} />
      <g transform="translate(0 560)" opacity={0.85}>
        <SkinPlane s={s} />
      </g>
      <circle cx={330} cy={1080} r={300} fill="url(#aqGlow)" opacity={0.45} />
      <circle cx={750} cy={1080} r={300} fill={C.blush} opacity={0.08} filter="url(#blur30)" />
      {/* five men */}
      <g opacity={inK}>
        {Array.from({length: 5}).map((_, i) => {
          const k = backOut(clamp(prog(s, t0 + i * 0.12, t0 + 0.5 + i * 0.12)));
          const x = 300 + i * 120;
          return (
            <g key={i} transform={`translate(${x} 520) scale(${clamp(k, 0, 1.2)})`}>
              <circle cy={-24} r={20} fill={i % 2 ? C.blush : AQ} />
              <path d="M-32 34 q 32 -64 64 0 Z" fill={i % 2 ? C.blush : AQ} />
            </g>
          );
        })}
      </g>
      <Leg x={330} s={s} shaved={true} label="SHAVED WEEKLY" k={legK} weeks={weeks} />
      <Leg x={750} s={s} shaved={false} label="LEFT ALONE" k={legK} weeks={weeks} />
      {/* week counter */}
      <Pill x={W / 2} y={720} k={ease(prog(s, tWeek - 0.3, tWeek + 0.2)) * (1 - ease(prog(s, tWeight - 0.4, tWeight)))} text="every week" color={AQ} dark size={28} />
      {/* metric badges with equals */}
      {metrics.map((m, i) => {
        const k = ease(prog(s, m.t - 0.3, m.t + 0.3));
        const y = 820 + i * 250;
        return (
          <g key={i} transform={`translate(${W / 2} ${y}) scale(${0.6 + 0.4 * backOut(k)})`} opacity={clamp(k * 1.5)}>
            <circle r={78} fill="rgba(23,10,16,0.8)" stroke={eqK > 0.5 ? AQ : 'rgba(238,221,226,0.45)'} strokeWidth={4} filter="url(#drop)" />
            <text y={18} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={60} fill={eqK > 0.5 ? AQ : C.white}>
              =
            </text>
            <text y={118} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill={C.blush} letterSpacing={3}>
              {m.label}
            </text>
          </g>
        );
      })}
      <Cite text="Lynfield & Macwilliams, J Invest Dermatol, 1970 · 5 men, one leg shaved weekly" o={inK} />
      <Front s={s} seed={11} />
    </Svg>
  );
};

// =============== D: one hair, macro — tapered tip vs blunt cut (vertical, centred) ===============
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const tTip = cue('tip.');
  const tSlice = cue('slices');
  const tMid = cue('middle');
  const tBlunt = cue('blunt');
  const push = 1.0 + 0.12 * ease(prog(s, t0 - 0.3, cue('slices')));
  const inK = ease(prog(s, t0 - 0.5, t0 + 0.2));
  const grow = ease(prog(s, t0 - 0.4, t0 + 0.6));
  const tipK = ease(prog(s, tTip - 0.5, tTip + 0.3));
  const slice = prog(s, tSlice - 0.25, tSlice + 0.45);
  const cutOn = s > tSlice + 0.1;
  const tipFall = prog(s, tSlice + 0.1, tSlice + 1.5);
  const bluntK = ease(prog(s, tBlunt - 0.6, tBlunt));
  const midK = ease(prog(s, tMid - 0.3, tMid + 0.3));
  const rx = W / 2;
  const ry = 1500;
  const len = 860 * grow;
  const w = 150;
  const cutU = 0.52;
  const cutY = ry - len * cutU;
  const hair = (cut: number) => (
    <g transform={`rotate(-90 ${rx} ${ry})`}>
      <MacroHair x0={rx} y={ry} len={Math.max(1, len)} w={w} cut={cut} />
    </g>
  );
  return (
    <Svg cam={camZoom(push, W / 2, 900)}>
      <Stage s={s} seed={41} />
      {Array.from({length: 18}).map((_, i) => {
        const ph = (s * 0.12 + rand(i * 3)) % 1;
        return <circle key={'p' + i} cx={120 + rand(i * 7) * 840} cy={1400 - ph * 900} r={4 + rand(i) * 8} fill={AQ} opacity={0.35 * Math.sin(ph * Math.PI)} filter="url(#blur4)" />;
      })}
      <circle cx={rx} cy={1000} r={520} fill="url(#aqGlow)" opacity={0.35} />
      {/* skin surface with the pore */}
      <path d={`M-200 ${ry - 10} Q ${rx} ${ry - 40} ${W + 200} ${ry - 10} L ${W + 200} ${H + 200} L -200 ${H + 200} Z`} fill="url(#epi)" filter="url(#drop)" />
      <path d={`M-200 ${ry + 120} Q ${rx} ${ry + 90} ${W + 200} ${ry + 120} L ${W + 200} ${H + 200} L -200 ${H + 200} Z`} fill="url(#derm)" opacity={0.85} />
      <ellipse cx={rx} cy={ry - 18} rx={110} ry={26} fill="#7A3346" />
      <g opacity={inK}>
        {hair(cutOn ? cutU : 0)}
        {/* the cut-off tip falling away */}
        {cutOn && tipFall < 1 && (
          <g transform={`translate(${tipFall * 260} ${tipFall * tipFall * 520}) rotate(${tipFall * 70} ${rx} ${cutY})`} opacity={1 - tipFall}>
            <clipPath id="tipClipV">
              <rect x={rx - 200} y={0} width={400} height={cutY} />
            </clipPath>
            <g clipPath="url(#tipClipV)">{hair(0)}</g>
          </g>
        )}
        {cutOn && <ellipse cx={rx} cy={cutY} rx={w * 0.7} ry={28} fill={C.goldHot} opacity={0.35 * (1 - 0.5 * tipFall)} filter="url(#blur12)" />}
      </g>
      {/* tip callout */}
      <g opacity={tipK * (cutOn ? 0 : 1)}>
        <circle cx={rx} cy={ry - len + 40} r={70} fill="none" stroke={AQ} strokeWidth={4} strokeDasharray="10 8" />
        <path d={`M${rx + 74} ${ry - len + 40} L ${rx + 170} ${ry - len + 40}`} stroke={AQ} strokeWidth={4} />
        <text x={rx + 180} y={ry - len + 50} fontFamily="Poppins" fontWeight={700} fontSize={30} fill={AQ}>
          fine tip
        </text>
      </g>
      {/* blade slicing horizontally */}
      {slice > 0 && slice < 1 && (
        <g transform={`translate(${-260 + 1600 * ease(slice)} ${cutY})`}>
          <rect x={-240} y={-14} width={260} height={28} rx={6} fill="url(#steel)" filter="url(#drop)" />
          <rect x={10} y={-14} width={10} height={28} fill={AQ} />
          <circle cx={20} cy={0} r={34} fill={AQ} opacity={0.55} filter="url(#blur12)" />
        </g>
      )}
      {/* width marker at the cut */}
      <g opacity={midK}>
        <path d={`M${rx - w / 2} ${cutY + 70} L ${rx + w / 2} ${cutY + 70} M${rx - w / 2} ${cutY + 56} l 0 28 M${rx + w / 2} ${cutY + 56} l 0 28`} stroke={AQ} strokeWidth={5} />
        <text x={rx + w / 2 + 24} y={cutY + 82} fontFamily="Poppins" fontWeight={700} fontSize={30} fill={AQ}>
          thicker middle
        </text>
      </g>
      <Pill x={rx - 250} y={cutY - 40} k={bluntK} text="blunt end" color={AQ} size={32} />
      <Cite text="illustrative macro view" o={inK} y={1760} />
      <Front s={s} seed={13} />
    </Svg>
  );
};

// =============== E: blunt feels coarse, short regrowth looks darker ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tCoarse = cue('coarse.');
  const tDark = cue('darker');
  const push = 1.04 + 0.08 * ease(prog(s, t0, S(5)));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const touch = ease(prog(s, t0, tCoarse));
  const darkK = ease(prog(s, tDark - 0.3, tDark + 0.4));
  return (
    <Svg cam={camZoom(push, W / 2, 1200)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Rays s={s} o={0.6} x={260} />
      <Bokeh s={s} top={300} bottom={HORIZON} seed={51} color={AQ} o={0.5} />
      <SkinPlane s={s} />
      <PlaneHairs s={s} shaveX={W + 400} regrow={0.4} />
      {/* contrast lens on darker stubble */}
      <g opacity={darkK}>
        <circle cx={700} cy={1430} r={170} fill="none" stroke="#fff" strokeWidth={10} filter="url(#drop)" />
        <circle cx={700} cy={1430} r={160} fill="#3B2026" opacity={0.08} />
        <path d="M820 1550 L 900 1630" stroke="#fff" strokeWidth={26} strokeLinecap="round" />
      </g>
      {/* fingertip touching blunt stubble */}
      <g transform={`translate(${380 - 60 * touch} ${1050 + 230 * touch}) rotate(-30)`} opacity={inK} filter="url(#drop)">
        <rect x={-70} y={-420} width={140} height={440} rx={70} fill="url(#legG)" />
        <rect x={-42} y={-404} width={84} height={100} rx={36} fill="#F6D9D2" opacity={0.9} />
        <path d="M-50 -170 q 50 16 100 0 M-46 -150 q 46 12 92 0 M-50 -40 q 50 16 100 0" stroke="#B8787A" strokeWidth={4} fill="none" opacity={0.6} />
        <rect x={-58} y={-400} width={14} height={380} rx={7} fill="#fff" opacity={0.22} />
      </g>
      {/* prickle marks */}
      <g opacity={ease(prog(s, tCoarse - 0.4, tCoarse + 0.2)) * (1 - darkK * 0.6)}>
        {Array.from({length: 7}).map((_, i) => {
          const a = -Math.PI / 2 + (i - 3) * 0.32;
          return <line key={i} x1={330 + Math.cos(a) * 70} y1={1290 + Math.sin(a) * 70} x2={330 + Math.cos(a) * 120} y2={1290 + Math.sin(a) * 120} stroke={AQ} strokeWidth={8} strokeLinecap="round" />;
        })}
      </g>
      <Pill x={330} y={720} k={ease(prog(s, tCoarse - 0.3, tCoarse + 0.2))} text="feels coarse" color={AQ} dark size={30} />
      <Cite text="Trotter, Anat Rec, 1928 (via LiveScience) · blunt cut, darker contrast" o={inK} y={1640} />
      <Pill x={760} y={720} k={darkK} text="looks darker" color={AQ} dark size={30} />
      <Front s={s} seed={17} />
    </Svg>
  );
};

// =============== F: the root lives deep — the razor never reaches it ===============
const SURF = 820;
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const tRoot = cue('root');
  const tNever = cue('never');
  const push = 1.07 - 0.07 * ease(prog(s, t0 - 0.3, t0 + 1.3));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.3));
  const rootK = ease(prog(s, tRoot - 0.4, tRoot + 0.4));
  const neverK = ease(prog(s, tNever - 0.4, tNever + 0.3));
  const fx = W / 2;
  const bulbY = 1520;
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={SURF + 200} fill="url(#sky)" />
      <Rays s={s} o={0.5} x={240} />
      <rect x={-50} y={SURF} width={W + 100} height={180} fill="url(#epi)" />
      <rect x={-50} y={SURF + 180} width={W + 100} height={H} fill="url(#derm)" />
      <text x={70} y={SURF + 60} fontFamily="Poppins" fontWeight={700} fontSize={26} fill={C.plum} letterSpacing={5} opacity={0.85}>
        SKIN SURFACE
      </text>
      {/* follicle */}
      <path d={`M${fx - 40} ${SURF} C ${fx - 30} ${SURF + 300}, ${fx - 70} ${bulbY - 140}, ${fx - 80} ${bulbY} Q ${fx} ${bulbY + 90} ${fx + 80} ${bulbY} C ${fx + 70} ${bulbY - 140}, ${fx + 30} ${SURF + 300}, ${fx + 40} ${SURF} Z`} fill="#7A3346" />
      {/* hair shaft + stubble */}
      <rect x={fx - 14} y={SURF - 40} width={28} height={bulbY - SURF + 40} rx={10} fill={HAIR} />
      {/* bulb */}
      <g opacity={inK}>
        <circle cx={fx} cy={bulbY + 10} r={150} fill="#FFB38A" opacity={0.25 * rootK} filter="url(#blur30)" />
        <ellipse cx={fx} cy={bulbY + 10} rx={92} ry={70} fill="url(#bulbG)" filter="url(#glow)" />
        <ellipse cx={fx} cy={bulbY + 34} rx={40} ry={26} fill="#C2507A" opacity={0.8} />
        {/* new cells streaming up */}
        {Array.from({length: 8}).map((_, i) => {
          const ph = (s * 0.5 + i / 8) % 1;
          return <circle key={i} cx={fx + Math.sin(i * 2) * 6} cy={bulbY - 40 - ph * 520} r={9 * (1 - ph * 0.6)} fill="#FFE3A8" opacity={rootK * (1 - ph)} />;
        })}
        <text x={fx + 130} y={bulbY + 20} fontFamily="Poppins" fontWeight={700} fontSize={30} fill="#FFE3A8" letterSpacing={3} opacity={rootK}>
          ROOT
        </text>
      </g>
      {/* razor at the surface */}
      <g transform={`translate(${fx + 260 - 520 * ease(prog(s, t0, tNever + 0.6))} ${SURF - 70})`}>
        <Razor x={0} y={0} rot={-90} sc={0.7} />
      </g>
      {/* depth arrow */}
      <g opacity={neverK}>
        <path d={`M${fx - 230} ${SURF + 10} L ${fx - 230} ${bulbY}`} stroke={AQ} strokeWidth={6} strokeDasharray="16 12" />
        <path d={`M${fx - 254} ${bulbY - 30} l 24 30 l 24 -30`} stroke={AQ} strokeWidth={6} fill="none" />
        <g transform={`translate(${fx - 230} ${(SURF + bulbY) / 2})`}>
          <rect x={-150} y={-46} width={300} height={84} rx={42} fill="rgba(23,10,16,0.8)" stroke={AQ} strokeWidth={3} filter="url(#drop)" />
          <text y={12} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={AQ}>
            out of reach
          </text>
        </g>
      </g>
      <Cite text="illustrative cross-section" o={inK} y={1760} />
      <Front s={s} seed={19} />
    </Svg>
  );
};

// =============== G: shave for comfort ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const items = [
    {t: cue('Wet'), label: 'WET FIRST', x: 290, y: 760},
    {t: cue('gel,'), label: 'USE A GEL', x: 790, y: 760},
    {t: cue('grain,'), label: 'WITH THE GRAIN', x: 290, y: 1130},
    {t: cue('swap'), label: 'NEW BLADE 5–7×', x: 790, y: 1130},
  ];
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const inK = ease(prog(s, t0 - 0.4, t0 + 0.4));
  const icon = (i: number) => {
    switch (i) {
      case 0:
        return (
          <g>
            <path d="M0 -60 C 24 -24, 44 0, 44 22 a 44 44 0 0 1 -88 0 c 0 -22 20 -46 44 -82 Z" fill={AQ} />
            <ellipse cx={-14} cy={10} rx={10} ry={16} fill="#fff" opacity={0.7} />
          </g>
        );
      case 1:
        return (
          <g>
            <rect x={-34} y={-50} width={68} height={110} rx={16} fill="url(#steel)" />
            <rect x={-20} y={-74} width={40} height={28} rx={8} fill={AQ} />
            {[0, 1, 2].map((j) => (
              <circle key={j} cx={-30 + j * 30} cy={-80 - j * 6} r={14} fill="#fff" opacity={0.9} />
            ))}
          </g>
        );
      case 2:
        return (
          <g>
            {[-30, 0, 30].map((x, j) => (
              <path key={j} d={`M${x} 40 q 10 -40 22 -76`} stroke={HAIR} strokeWidth={8} fill="none" strokeLinecap="round" />
            ))}
            <path d="M-60 0 L 50 -40 M30 -54 l 22 14 l -14 22" stroke={AQ} strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        );
      default:
        return (
          <g>
            <rect x={-60} y={-24} width={120} height={48} rx={10} fill="url(#steel)" />
            <rect x={-60} y={-24} width={120} height={10} rx={5} fill={AQ} />
            <path d="M-20 44 a 26 26 0 1 0 40 0" stroke={C.blush} strokeWidth={6} fill="none" />
            <path d="M14 36 l 8 10 l 10 -12" stroke={C.blush} strokeWidth={6} fill="none" />
          </g>
        );
    }
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Rays s={s} o={0.6} x={220} />
      <Bokeh s={s} top={200} bottom={HORIZON + 300} seed={61} color={AQ} o={0.5} />
      <g transform="translate(0 -260)">
        <SkinPlane s={s} />
      </g>
      <Pill x={W / 2} y={560} k={inK} text="shave for comfort" color={AQ} size={32} />
      {items.map((it, i) => {
        const k = prog(s, it.t - 0.35, it.t + 0.3);
        const b = backOut(k);
        return (
          <g key={i} transform={`translate(${it.x} ${it.y}) scale(${0.5 + 0.5 * b})`} opacity={clamp(k * 1.6)}>
            <circle r={128} fill="url(#aqGlow)" opacity={0.6} />
            <circle r={112} fill="rgba(23,10,16,0.72)" stroke="rgba(238,221,226,0.45)" strokeWidth={3} filter="url(#drop)" />
            {icon(i)}
            <rect x={-it.label.length * 9.5 - 22} y={134} width={it.label.length * 19 + 44} height={42} rx={21} fill="rgba(23,10,16,0.72)" />
            <text y={163} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={26} fill={C.blush} letterSpacing={2}>
              {it.label}
            </text>
          </g>
        );
      })}
      <Cite text="American Academy of Dermatology · how to shave" o={inK} y={1560} />
      <Front s={s} seed={23} />
    </Svg>
  );
};

// =============== H: loop — razor over skin + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tTip = cue('tip', 7);
  const tGlowi = cue('Glowi');
  const scan = prog(s, tTip - 0.2, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const sweep = ease(prog(s, t0, tTip + 0.4));
  const nodes = Array.from({length: 22}).map((_, i) => ({x: 120 + rand(i * 3 + 1) * 840, y: 1000 + rand(i * 7 + 2) * 820}));
  const mesh = ease(prog(s, tTip, tTip + 1)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1300)}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
        <Rays s={s} o={0.7} x={300} />
        <Bokeh s={s} top={300} bottom={HORIZON} seed={5} color={AQ} o={0.55} />
        <SkinPlane s={s} fx={{scan}} />
        <g opacity={1 - cardK}>
          <PlaneHairs s={s} shaveX={-100 + 1300 * sweep} regrow={0.3} />
          <Razor x={-100 + 1300 * sweep - 150} y={1180} rot={-8} sc={1.0} />
        </g>
        <g opacity={mesh}>
          {nodes.map((a, i) => {
            const b = nodes[(i * 5 + 3) % nodes.length];
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.blush} strokeWidth={1.5} opacity={0.55} />;
          })}
          {nodes.map((a, i) => (
            <circle key={i} cx={a.x} cy={a.y} r={7} fill={AQ} opacity={a.y < HORIZON + (H - HORIZON) * scan ? 1 : 0} />
          ))}
        </g>
        <g opacity={1 - cardK}>
          <Front s={s} seed={3} />
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
      background: `radial-gradient(circle at 50% 44%, rgba(75,46,57,${0.96 * cardK}) 0%, rgba(36,19,27,${cardK}) 70%)`,
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
export const bounds = (end: number) => [0, S(1), S(2), S(3), S(4), S(5), S(6), S(7) + 0.3, end];
