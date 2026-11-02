import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, FPS, ease, prog} from './theme';
import {Captions} from './Captions';
import {cue, voEnd} from './timeline';
import {SCENES, bounds} from './scenes';

export const END_PAD = 2.8;
export const totalSeconds = () => voEnd + END_PAD;

const fontCss = `
@font-face { font-family: 'Poppins'; font-weight: 500; src: url('${staticFile('fonts/Poppins-Medium.ttf')}'); }
@font-face { font-family: 'Poppins'; font-weight: 600 700; src: url('${staticFile('fonts/Poppins-Bold.ttf')}'); }
@font-face { font-family: 'Lora'; font-weight: 400 700; src: url('${staticFile('fonts/Lora-Variable.ttf')}'); }
`;

// scene k runs from b[k] to b[k+1]; scenes.tsx decides the boundaries (usually sentence starts S(i) or cue('word'))
export const schedule = () => bounds(totalSeconds());

const TR = 0.42; // transition length (s)

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  const s = f / FPS;
  const b = schedule();
  const end = b[b.length - 1];
  const comps = SCENES;
  const N = comps.length;
  const layers: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const a = i === 0 ? -1 : b[i] - 0.18 - TR / 2;
    const z = i === N - 1 ? end + 1 : b[i + 1] - 0.18 + TR / 2;
    if (s < a || s > z) continue;
    const inK = i === 0 ? 1 : ease(prog(s, a, a + TR));
    const outK = i === N - 1 ? 0 : ease(prog(s, z - TR, z));
    const scale = (0.94 + 0.06 * inK) * (1 + 0.16 * outK);
    const blur = 14 * (1 - inK) + 10 * outK;
    const op = inK * (1 - outK);
    const Comp = comps[i];
    layers.push(
      <AbsoluteFill key={i} style={{opacity: op, transform: `scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
        <Comp s={s} />
      </AbsoluteFill>,
    );
  }
  const tGlowi = cue('Glowi');
  const wmK = 1 - ease(prog(s, tGlowi - 0.3, tGlowi + 0.2));
  const fadeOut = 1 - prog(s, end - 0.5, end);
  return (
    <AbsoluteFill style={{background: C.plumInk}}>
      <style>{fontCss}</style>
      <AbsoluteFill style={{opacity: fadeOut}}>
        {layers}
        {/* soft vignette */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(23,10,16,0.55) 100%)'}} />
        {/* top gradient for caption legibility */}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(23,10,16,0.45) 0%, rgba(23,10,16,0) 26%)'}} />
        <Captions />
        {/* Glowi watermark */}
        <div style={{position: 'absolute', top: 120, right: 64, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.62 * wmK}}>
          <Img src={staticFile('glowi-mark-white.png')} style={{width: 46, height: 52, objectFit: 'contain'}} />
          <span style={{fontFamily: 'Lora', fontWeight: 600, fontSize: 36, color: '#fff', letterSpacing: 0.5}}>Glowi</span>
        </div>
      </AbsoluteFill>
      <Audio src={staticFile('vo.wav')} volume={1} />
      <Audio src={staticFile('bed.wav')} volume={1} />
    </AbsoluteFill>
  );
};
