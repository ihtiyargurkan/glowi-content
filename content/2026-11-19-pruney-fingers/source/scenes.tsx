import React from 'react';
import {C, W, H, clamp, ease, easeOut, prog, rand} from './theme';
import {Defs, Bokeh} from './parts';
import {cue, S} from './timeline';
import {SkinSection, surfY} from './realskin';
import {camZoom, Pill, Label, Cite, Tile, ScanMesh, EndCard} from './common';

// accent for this topic: bath-water teal
const AQUA = '#7FD3E6';
const AQUA_D = '#2E7F99';
const NERVE = '#FFD27A';
const WATER_Y = 560; // water surface in the underwater scenes

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <defs>
      <linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5FA8C2" stopOpacity="0.22" />
        <stop offset="1" stopColor="#2E6A85" stopOpacity="0.38" />
      </linearGradient>
      <linearGradient id="padG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#C98E8E" />
        <stop offset="0.35" stopColor="#F2CFC6" />
        <stop offset="0.65" stopColor="#F4D6CD" />
        <stop offset="1" stopColor="#C38A8C" />
      </linearGradient>
      <radialGradient id="bubbleG" cx="0.35" cy="0.3">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
        <stop offset="0.5" stopColor={AQUA} stopOpacity="0.25" />
        <stop offset="1" stopColor={AQUA} stopOpacity="0.5" />
      </radialGradient>
      <radialGradient id="marbleG" cx="0.35" cy="0.3">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.4" stopColor={AQUA} />
        <stop offset="1" stopColor={AQUA_D} />
      </radialGradient>
    </defs>
    <g transform={cam}>{children}</g>
  </svg>
);

// ---------- fingertip pad seen from the palm side ----------
const FingerPad: React.FC<{cx: number; top: number; w?: number; wrinkle: number; s: number; id: string; bottom?: number}> = ({cx, top, w = 520, wrinkle, id, bottom = H + 100}) => {
  const shrink = 1 - 0.05 * wrinkle;
  const ww = w * shrink;
  const r = ww / 2;
  const d = `M${cx - r} ${bottom} L ${cx - r} ${top + r} A ${r} ${r * 1.08} 0 0 1 ${cx + r} ${top + r} L ${cx + r} ${bottom} Z`;
  const core = {x: cx + ww * 0.03, y: top + r * 1.25};
  const sc = w / 520;
  return (
    <g>
      <clipPath id={`${id}clip`}>
        <path d={d} />
      </clipPath>
      <path d={d} fill="#000" opacity={0.25} transform="translate(14 18)" filter="url(#blur12)" />
      <path d={d} fill="url(#padG)" />
      <g clipPath={`url(#${id}clip)`}>
        {Array.from({length: 26}).map((_, i) => (
          <ellipse key={i} cx={core.x} cy={core.y} rx={(18 + i * 15) * sc} ry={(14 + i * 12.5) * sc} fill="none" stroke="#B9787E" strokeWidth={2.2} opacity={0.32} />
        ))}
        {Array.from({length: 9}).map((_, i) => {
          const x0 = cx - ww * 0.42 + (i * ww * 0.84) / 8 + (rand(i * 3) - 0.5) * 20 * sc;
          const amp = (10 + rand(i * 7) * 14) * wrinkle * sc;
          let path = '';
          for (let k = 0; k <= 30; k++) {
            const y = top + 20 * sc + k * 40 * sc;
            const x = x0 + Math.sin(k * 0.55 + i * 1.7) * amp + Math.sin(k * 1.3 + i) * amp * 0.35;
            path += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
          }
          return (
            <g key={i} opacity={wrinkle}>
              <path d={path} stroke="#9A5A63" strokeWidth={(10 * wrinkle + 2) * sc} fill="none" strokeLinecap="round" opacity={0.55} filter="url(#blur4)" />
              <path d={path} stroke="#8A4A55" strokeWidth={3 * sc + 0.5} fill="none" opacity={0.7} />
              <path d={path} stroke="#FFF1EC" strokeWidth={4 * sc + 0.5} fill="none" opacity={0.55} transform={`translate(${9 * sc} 0)`} />
            </g>
          );
        })}
        <ellipse cx={cx - ww * 0.18} cy={top + r * 0.9} rx={ww * 0.16} ry={r * 0.8} fill="#FFFFFF" opacity={0.16} filter="url(#blur12)" />
      </g>
      <path d={d} fill="none" stroke="#FBE3DC" strokeWidth={3} opacity={0.5} />
    </g>
  );
};

// ---------- underwater backdrop ----------
const Underwater: React.FC<{s: number; seed?: number; surf?: number}> = ({s, seed = 1, surf = WATER_Y}) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
    <Bokeh s={s} top={200} bottom={surf} seed={seed} color={C.goldHot} o={0.5} />
  </g>
);
const WaterOver: React.FC<{s: number; surf?: number; k?: number}> = ({s, surf = WATER_Y, k = 1}) => {
  let wave = `M-200 ${surf}`;
  for (let i = 0; i <= 40; i++) wave += ` L ${-200 + i * 37} ${(surf + 9 * Math.sin(i * 0.7 + s * 2.2) + 5 * Math.sin(i * 1.9 - s * 1.4)).toFixed(1)}`;
  return (
    <g opacity={k}>
      <path d={`${wave} L ${W + 200} ${H + 200} L -200 ${H + 200} Z`} fill="url(#waterG)" />
      {Array.from({length: 7}).map((_, i) => (
        <path key={i} d={`M${-100 + i * 190 + 40 * Math.sin(s * 0.8 + i)} ${surf} L ${-260 + i * 190 + 60 * Math.sin(s * 0.6 + i)} ${H}`} stroke="#BDEFFA" strokeWidth={30 + 20 * Math.sin(s + i)} opacity={0.07} filter="url(#blur12)" />
      ))}
      <path d={wave} stroke="#D7F6FF" strokeWidth={5} fill="none" opacity={0.8} />
      {Array.from({length: 22}).map((_, i) => {
        const ph = (s * (0.1 + rand(i) * 0.12) + rand(i * 3)) % 1;
        const x = rand(i * 7) * W + Math.sin(s * 2 + i) * 14;
        const y = H - ph * (H - surf - 30);
        const r = 5 + rand(i * 11) * 12;
        if (y > 1640) return null;
        return <circle key={i} cx={x} cy={y} r={r} fill="url(#bubbleG)" stroke="#E8FBFF" strokeWidth={1.5} opacity={0.75} />;
      })}
    </g>
  );
};

// =============== A: hook — fingertip under bath water, wrinkling ===============
export const SceneA: React.FC<{s: number}> = ({s}) => {
  const tW = cue('wrinkle');
  const push = 1 + 0.07 * ease(prog(s, 0, S(1)));
  const wr = 0.25 + 0.75 * ease(prog(s, tW - 0.6, tW + 0.8));
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <Underwater s={s} seed={5} />
      <FingerPad cx={W / 2} top={760} wrinkle={wr} s={s} id="fa" />
      <WaterOver s={s} />
    </Svg>
  );
};

// =============== B: myth — skin soaks up water and swells; only step 1 ===============
const SURF = 760;
export const SceneB: React.FC<{s: number}> = ({s}) => {
  const t0 = S(1);
  const tSoak = cue('soaks');
  const tSwell = cue('swells.');
  const tFirst = cue('first');
  const push = 1.06 - 0.06 * ease(prog(s, t0 - 0.3, S(2)));
  const soak = prog(s, t0, tSoak + 1.2);
  const swell = ease(prog(s, tSwell - 0.5, tSwell + 0.5));
  const firstK = ease(prog(s, tFirst - 0.4, tFirst + 0.3));
  const epi = 240 + 50 * swell;
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <Underwater s={s} seed={11} surf={SURF - 60} />
      <SkinSection s={s} top={SURF - 30 * swell} epi={epi} seed={8} />
      <Label x={56} y={SURF + 70} text="FINGERTIP SKIN" color={C.plum} anchor="start" size={24} />
      {Array.from({length: 24}).map((_, i) => {
        const st = rand(i * 3) * 0.7;
        const p = clamp((soak - st) / 0.5);
        const x = 60 + rand(i * 7) * 960;
        const y0 = 470 + rand(i * 5) * 120;
        const y1 = surfY(x, SURF) + 30 + rand(i * 9) * 110;
        const y = y0 + (y1 - y0) * easeOut(p);
        return <path key={i} d="M0 -16 C 7 -6, 11 0, 11 6 a 11 11 0 0 1 -22 0 c 0 -6 4 -12 11 -22 Z" fill={AQUA} stroke="#E8FBFF" strokeWidth={1.5} transform={`translate(${x} ${y})`} opacity={0.9 * (1 - 0.6 * clamp((p - 0.85) / 0.15))} />;
      })}
      {swell > 0.05 &&
        [240, 540, 840].map((x, i) => (
          <path key={i} d={`M${x} ${SURF - 70} l 0 -70 m -18 18 l 18 -18 l 18 18`} stroke={C.white} strokeWidth={6} fill="none" strokeLinecap="round" opacity={swell * (0.7 + 0.3 * Math.sin(s * 5 + i))} />
        ))}
      <Pill x={300} y={1560} k={Math.max(0.4 * swell, firstK)} text="1 · WATER IN" color={AQUA} size={30} />
      <Pill x={780} y={1560} k={firstK} text="2 · ?" color={NERVE} size={30} w={200} />
      <Pill x={W / 2} y={540} k={swell * (1 - firstK)} text="SWELLING" color={AQUA} size={34} />
    </Svg>
  );
};

// =============== C: nerves tighten vessels → pads shrink → ridges ===============
export const SceneC: React.FC<{s: number}> = ({s}) => {
  const t0 = S(2);
  const tN = cue('nerves.');
  const tT = cue('tighten,');
  const tSh = cue('above');
  const tR = cue('ridges.');
  const push = 1.08 - 0.08 * ease(prog(s, t0 - 0.3, t0 + 2));
  const nK = ease(prog(s, tN - 0.5, tN + 0.3));
  const tight = ease(prog(s, tT - 0.3, tT + 0.5));
  const shrink = ease(prog(s, tSh - 0.3, tSh + 0.5));
  const ridge = ease(prog(s, tR - 0.9, tR + 0.4));
  const top = 760;
  const epi = 250;
  const vy = top + epi + 190;
  // nerve: sampled curve from bottom-left up to the vessel
  const nP = (u: number) => ({x: -40 + u * 820, y: vy + 40 + (H - 160 - vy) * (1 - u) * (1 - u) + 30 * Math.sin(u * 7)});
  let nerveD = '';
  for (let i = 0; i <= 50; i++) {
    const p = nP(i / 50);
    nerveD += (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
  }
  let fold = '';
  for (let i = 0; i <= 60; i++) {
    const x = -60 + i * 20;
    const y = top - 6 - 34 * ridge * Math.abs(Math.sin(x / 70)) + 4 * Math.sin(x / 23);
    fold += (i ? ' L ' : 'M') + x + ' ' + y.toFixed(1);
  }
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={top + 200} fill="url(#sky)" />
      <Bokeh s={s} n={14} top={430} bottom={top} seed={31} color={C.goldHot} o={0.5} />
      <g transform={`translate(${W / 2} ${top}) scale(1 ${1 - 0.06 * shrink}) translate(${-W / 2} ${-top})`}>
        <SkinSection s={s} top={top} epi={epi} seed={9} />
      </g>
      {ridge > 0.02 && (
        <g>
          <path d={`${fold} L ${W + 60} ${top + 30} L -60 ${top + 30} Z`} fill="#F6DCD5" />
          <path d={fold} stroke="#FFF6F2" strokeWidth={5} fill="none" />
          <path d={fold} stroke="#B9707C" strokeWidth={2} fill="none" transform="translate(0 10)" opacity={0.6} />
        </g>
      )}
      <path d={`M-60 ${vy} C 300 ${vy - 30}, 700 ${vy + 30}, ${W + 60} ${vy - 10}`} stroke="#B32A3E" strokeWidth={64 - 38 * tight} fill="none" strokeLinecap="round" />
      <path d={`M-60 ${vy} C 300 ${vy - 30}, 700 ${vy + 30}, ${W + 60} ${vy - 10}`} stroke="#F2A0AA" strokeWidth={(64 - 38 * tight) * 0.3} fill="none" opacity={0.6} transform="translate(0 -6)" />
      {tight > 0.05 &&
        [300, 700].map((x, i) => (
          <g key={i} opacity={tight} stroke={C.white} strokeWidth={5} strokeLinecap="round" fill="none">
            <path d={`M${x} ${vy - 90} l 0 40 m -14 -14 l 14 14 l 14 -14`} />
            <path d={`M${x} ${vy + 90} l 0 -40 m -14 14 l 14 -14 l 14 14`} />
          </g>
        ))}
      <g opacity={nK}>
        <path d={nerveD} stroke={NERVE} strokeWidth={26} fill="none" opacity={0.25} filter="url(#blur12)" />
        <path d={nerveD} stroke={NERVE} strokeWidth={9} fill="none" strokeLinecap="round" />
        {Array.from({length: 5}).map((_, i) => {
          const p = nP((s * 0.7 + i / 5) % 1);
          return <circle key={i} cx={p.x} cy={p.y} r={13} fill="#FFFFFF" opacity={0.9} />;
        })}
      </g>
      <Label x={110} y={H - 250} text="NERVE" color={NERVE} anchor="start" k={nK} size={30} />
      <Pill x={W / 2} y={540} k={tight * (1 - ridge)} text="VESSELS TIGHTEN" color={C.uvb} size={32} />
      <Pill x={W / 2} y={540} k={ridge} text="SKIN FOLDS INTO RIDGES" color={AQUA} size={32} />
    </Svg>
  );
};

// =============== D: since the 1930s — damaged nerves, no wrinkles ===============
export const SceneD: React.FC<{s: number}> = ({s}) => {
  const t0 = S(3);
  const t30 = cue('1930s');
  const tDam = cue('damaged');
  const tSw = cue('swelling');
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(4)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const yearK = ease(prog(s, t30 - 0.4, t30 + 0.3));
  const dam = ease(prog(s, tDam - 0.4, tDam + 0.4));
  const swK = ease(prog(s, tSw - 0.3, tSw + 0.4));
  const fx = [300, 780];
  return (
    <Svg cam={camZoom(push, W / 2, 1150)}>
      <Underwater s={s} seed={41} />
      <g opacity={inK}>
        <FingerPad cx={fx[0]} top={880} w={360} wrinkle={0.95} s={s} id="fd1" bottom={1650} />
        <FingerPad cx={fx[1]} top={880} w={360} wrinkle={0.08} s={s} id="fd2" bottom={1650} />
        {fx.map((x, i) => {
          const d = `M${x - 40} 1650 C ${x - 30} 1450, ${x + 30} 1250, ${x} 1050`;
          return (
            <g key={i}>
              <path d={d} stroke={NERVE} strokeWidth={22} fill="none" opacity={0.3} filter="url(#blur12)" />
              <path d={d} stroke={NERVE} strokeWidth={7} fill="none" strokeDasharray={i === 1 && dam > 0 ? `${40 - 30 * dam} ${8 + 30 * dam}` : undefined} opacity={i === 1 ? 1 - 0.5 * dam : 1} />
            </g>
          );
        })}
        {dam > 0 && (
          <g transform={`translate(${fx[1]} 1330)`} opacity={dam} stroke={C.uvb} strokeWidth={12} strokeLinecap="round">
            <circle r={58} fill="rgba(23,10,16,0.7)" stroke={C.uvb} strokeWidth={6} />
            <line x1={-24} y1={-24} x2={24} y2={24} />
            <line x1={24} y1={-24} x2={-24} y2={24} />
          </g>
        )}
      </g>
      <WaterOver s={s} />
      <g opacity={inK}>
        <Label x={fx[0]} y={830} text="NERVES OK" color={C.white} size={28} />
        <Label x={fx[1]} y={830} text="NERVE DAMAGED" color={dam > 0.3 ? C.uvb : C.white} size={28} k={Math.max(0.4, dam)} />
      </g>
      <Pill x={W / 2} y={690} k={yearK * (1 - swK)} text="KNOWN SINCE THE 1930s" color={C.goldHot} size={30} />
      <Pill x={W / 2} y={690} k={swK} text="NOT JUST SWELLING" color={AQUA} size={32} />
      <Cite text="Nature News, 2013 · nerve observations since the 1930s" k={inK} y={1730} />
    </Svg>
  );
};

// =============== E: ridges like tire treads — channel water, better grip ===============
export const SceneE: React.FC<{s: number}> = ({s}) => {
  const t0 = S(4);
  const tTread = cue('treads,');
  const tChan = cue('channeling');
  const tGrip = cue('grip.');
  const push = 1.04 + 0.05 * ease(prog(s, t0, S(5)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const treadK = Math.max(0.85 * inK, ease(prog(s, tTread - 0.5, tTread + 0.3)));
  const flow = ease(prog(s, tChan - 0.4, tChan + 0.5));
  const gripK = ease(prog(s, tGrip - 0.4, tGrip + 0.4));
  return (
    <Svg cam={camZoom(push, W / 2, 1100)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1050} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={51} o={0.5} />
      <g opacity={treadK}>
        <rect x={110} y={560} width={860} height={300} rx={40} fill="#2A1C22" stroke="#5A4048" strokeWidth={4} />
        <clipPath id="tireClip">
          <rect x={110} y={560} width={860} height={300} rx={40} />
        </clipPath>
        <g clipPath="url(#tireClip)">
          {Array.from({length: 11}).map((_, i) => {
            const x = 70 + i * 95 + ((s * 60) % 95);
            return <path key={i} d={`M${x} 560 l 40 75 l -40 75 l 40 75 l -40 75`} stroke="#120A0E" strokeWidth={22} fill="none" strokeLinejoin="round" />;
          })}
          {flow > 0 &&
            Array.from({length: 11}).map((_, i) => {
              const ph = (s * 0.8 + i / 11) % 1;
              return <circle key={i} cx={140 + i * 80} cy={560 + ph * 300} r={7} fill={AQUA} opacity={0.8 * flow} />;
            })}
        </g>
        <Label x={W / 2} y={915} text="TIRE TREAD" size={26} />
      </g>
      <g opacity={inK}>
        <clipPath id="ridgeClip">
          <rect x={110} y={990} width={860} height={520} rx={60} />
        </clipPath>
        <g clipPath="url(#ridgeClip)">
          <rect x={110} y={990} width={860} height={520} fill="url(#padG)" />
          {Array.from({length: 6}).map((_, i) => {
            const x0 = 160 + i * 150;
            let d = '';
            for (let k = 0; k <= 14; k++) d += (k ? 'L' : 'M') + (x0 + Math.sin(k * 0.8 + i) * 22).toFixed(1) + ' ' + (980 + k * 40);
            return (
              <g key={i}>
                <path d={d} stroke="#8A4A55" strokeWidth={30} fill="none" opacity={0.45} filter="url(#blur4)" />
                <path d={d} stroke={AQUA} strokeWidth={14} fill="none" opacity={0.75 * flow} />
                <path d={d} stroke="#FFF1EC" strokeWidth={6} fill="none" opacity={0.6} transform="translate(24 0)" />
                {flow > 0 &&
                  Array.from({length: 4}).map((_, j) => {
                    const ph = (s * 0.6 + j / 4 + i * 0.13) % 1;
                    const y = 1000 + ph * 520;
                    const kk = (y - 980) / 40;
                    const x = x0 + Math.sin(kk * 0.8 + i) * 22;
                    return <circle key={j} cx={x} cy={y} r={9} fill="#E8FBFF" opacity={flow * 0.9} />;
                  })}
              </g>
            );
          })}
        </g>
        <rect x={110} y={990} width={860} height={520} rx={60} fill="none" stroke="rgba(238,221,226,0.5)" strokeWidth={3} />
        <Label x={W / 2} y={1570} text={flow > 0.4 ? 'IDEA: GROOVES DRAIN WATER' : 'WRINKLED FINGERTIP'} size={24} />
      </g>
      <Pill x={W / 2} y={1250} k={gripK} text="BETTER GRIP?" color={C.white} fill="rgba(23,10,16,0.8)" size={36} />
      <Cite text="Changizi et al. 2011 (idea) · Kareklas et al. 2013 (test)" k={inK} y={1700} />
    </Svg>
  );
};

// =============== F: the test — 20 volunteers, 30 min soak, 12% faster ===============
export const SceneF: React.FC<{s: number}> = ({s}) => {
  const t0 = S(5);
  const t20 = cue('20');
  const t30 = cue('30');
  const tWr = cue('wrinkled');
  const t12 = cue('12%');
  const push = 1 + 0.05 * ease(prog(s, t0, S(6)));
  const inK = ease(prog(s, t0 - 0.3, t0 + 0.4));
  const k20 = ease(prog(s, t20 - 0.3, t20 + 0.3));
  const k30 = ease(prog(s, t30 - 0.3, t30 + 0.3));
  const race = prog(s, tWr - 0.3, t12 + 0.6);
  const badge = ease(prog(s, t12 - 0.2, t12 + 0.3));
  const lane = (y: number, label: string, speed: number, wr: number, hl: boolean, seed: number) => {
    const p = clamp(race * speed);
    return (
      <g transform={`translate(0 ${y})`}>
        <rect x={90} y={-150} width={900} height={300} rx={36} fill="rgba(238,221,226,0.07)" stroke={hl && badge > 0 ? C.white : 'rgba(238,221,226,0.3)'} strokeWidth={hl && badge > 0 ? 5 : 3} />
        <text x={130} y={-80} fontFamily="Poppins" fontWeight={700} fontSize={32} fill={C.white}>
          {label}
        </text>
        {[230, 850].map((bx, i) => (
          <g key={i}>
            <path d={`M${bx - 90} 10 Q ${bx} 130 ${bx + 90} 10 Z`} fill="rgba(127,211,230,0.25)" stroke={AQUA} strokeWidth={4} />
            <ellipse cx={bx} cy={10} rx={90} ry={16} fill="rgba(127,211,230,0.3)" stroke={AQUA} strokeWidth={3} />
          </g>
        ))}
        {Array.from({length: 6}).map((_, i) => {
          const m = clamp(p * 6 - i);
          const x = 196 + (i % 3) * 34 + m * 620;
          const yy = 40 - (i > 2 ? 22 : 0) - Math.sin(m * Math.PI) * 120;
          return <circle key={i} cx={x} cy={yy} r={22} fill="url(#marbleG)" stroke="#E8FBFF" strokeWidth={2} />;
        })}
        <g transform={`translate(${880} ${-88})`}>
          <FingerPad cx={0} top={-34} w={64} wrinkle={wr} s={s} id={`ff${seed}`} bottom={40} />
        </g>
        <rect x={130} y={100} width={820} height={12} rx={6} fill="rgba(238,221,226,0.12)" />
        <rect x={130} y={100} width={820 * p} height={12} rx={6} fill={hl ? AQUA : C.blush} />
      </g>
    );
  };
  return (
    <Svg cam={camZoom(push, W / 2, 1050)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.plumDeep} />
      <circle cx={W / 2} cy={1000} r={820} fill={C.plum} opacity={0.8} filter="url(#blur30)" />
      <Bokeh s={s} seed={61} o={0.5} />
      <g opacity={inK}>
        <Pill x={320} y={580} k={Math.max(0.45, k20)} text="20 volunteers" color={C.blush} size={28} />
        <Pill x={770} y={580} k={Math.max(0.45, k30)} text="30 min soak" color={AQUA} size={28} />
        {lane(860, 'Smooth fingers', 1.0, 0, false, 1)}
        {lane(1220, 'Wrinkled fingers', 1.12, 1, true, 2)}
      </g>
      <Pill x={W / 2} y={1520} k={badge} text="12% FASTER" sub="WET OBJECTS ONLY" color={C.plum} fill={C.blush} size={50} w={430} />
      <Cite text="Kareklas, Nettle & Smulders, Biol Lett, 2013 · illustrative race" k={inK} y={1710} />
    </Svg>
  );
};

// =============== G: not damage — nerves at work; pat dry, moisturize ===============
export const SceneG: React.FC<{s: number}> = ({s}) => {
  const t0 = S(6);
  const tDam = cue('damage.');
  const tJob = cue('job.');
  const tMo = cue('moisturize.');
  const push = 1.05 - 0.05 * ease(prog(s, t0, S(7)));
  const base = 0.55 * ease(prog(s, t0 - 0.3, t0 + 0.4));
  const k = (t: number) => ease(prog(s, t - 0.35, t + 0.25));
  const cream = ease(prog(s, tMo - 0.4, tMo + 0.8));
  return (
    <Svg cam={camZoom(push, W / 2, 1250)}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sky)" />
      <Bokeh s={s} top={200} bottom={1000} seed={71} o={0.6} color={C.goldHot} />
      <ellipse cx={W / 2} cy={1500} rx={520} ry={380} fill={AQUA} opacity={0.12} filter="url(#blur30)" />
      <FingerPad cx={W / 2} top={1080} w={460} wrinkle={0.9 * (1 - 0.6 * cream)} s={s} id="fg" />
      {cream > 0 && <ellipse cx={W / 2 - 60} cy={1320} rx={150 * cream} ry={260 * cream} fill="#FFFFFF" opacity={0.25} filter="url(#blur12)" />}
      <Tile x={270} y={740} k={k(tDam)} base={base} label="NOT DAMAGE">
        <path d="M-40 0 l 26 28 l 56 -60" stroke={AQUA} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Tile>
      <Tile x={540} y={740} k={k(tJob)} base={base} label="NERVES AT WORK">
        <path d="M10 -60 L -26 6 L 4 6 L -12 60 L 30 -10 L 2 -10 Z" fill={NERVE} />
      </Tile>
      <Tile x={810} y={740} k={k(tMo)} base={base} label="DRY · MOISTURIZE">
        <g>
          <rect x={-30} y={-50} width={60} height={86} rx={14} fill={C.blush} />
          <rect x={-18} y={-66} width={36} height={18} rx={5} fill={C.plum} />
          <path d="M0 46 C 8 56, 12 62, 12 68 a 12 12 0 0 1 -24 0 c 0 -6 4 -12 12 -22 Z" fill="#FFFFFF" opacity={0.9} />
        </g>
      </Tile>
    </Svg>
  );
};

// =============== H: loop (fingertip under water) + scan + Glowi ===============
export const SceneH: React.FC<{s: number}> = ({s}) => {
  const t0 = S(7);
  const tReact = cue('reacting.');
  const tGlowi = cue('Glowi');
  const scan = prog(s, tReact - 0.6, tGlowi - 0.1);
  const push = 1 + 0.12 * ease(prog(s, t0, tGlowi));
  const cardK = ease(prog(s, tGlowi - 0.2, tGlowi + 0.6));
  const mesh = ease(prog(s, tReact - 0.4, tReact + 0.6)) * (1 - cardK);
  return (
    <>
      <Svg cam={camZoom(push, W / 2, 1150)}>
        <Underwater s={s} seed={5} />
        <FingerPad cx={W / 2} top={760} wrinkle={0.7 + 0.2 * Math.sin(s * 0.8)} s={s} id="fh" />
        <WaterOver s={s} />
        {scan > 0 && scan < 1 && (
          <g>
            <rect x={-200} y={760 + 1160 * scan - 3} width={W + 400} height={6} fill={C.blush} opacity={0.9} />
            <rect x={-200} y={760 + 1160 * scan - 60} width={W + 400} height={120} fill={C.blush} opacity={0.22} filter="url(#blur12)" />
          </g>
        )}
        <ScanMesh k={mesh} scan={scan} top={900} />
      </Svg>
      {cardK > 0 && <EndCard s={s} tGlowi={tGlowi} cardK={cardK} />}
    </>
  );
};

export const SCENES: React.FC<{s: number}>[] = [SceneA, SceneB, SceneC, SceneD, SceneE, SceneF, SceneG, SceneH];
export const bounds = (end: number) => [0, S(1), S(2), S(3), S(4), S(5), S(6), S(7), end];
