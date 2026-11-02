import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FPS, clamp, easeOut} from './theme';
import {words} from './timeline';

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const s = f / FPS;
  // active line = line of the latest word that has started (hold until next line starts)
  let cur = -1;
  for (let i = 0; i < words.length; i++) if (words[i].start <= s + 0.02) cur = i;
  if (cur < 0) return null;
  const line = words[cur].line;
  // hide during long silences after a sentence end (> 0.9s gap)
  const lastInLine = words.filter((w) => w.line === line).slice(-1)[0];
  if (s > lastInLine.end + 0.9 && cur === words.indexOf(lastInLine)) return null;
  const lw = words.filter((w) => w.line === line && w.start <= s + 0.02);

  return (
    <div
      style={{
        position: 'absolute',
        top: 270,
        left: 90,
        right: 90,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: 6,
        columnGap: 14,
        fontFamily: 'Poppins',
        fontWeight: 700,
        fontSize: 50,
        lineHeight: 1.18,
        letterSpacing: -0.3,
      }}
    >
      {lw.map((w, i) => {
        const isCur = i === lw.length - 1;
        const age = s - w.start;
        const pop = easeOut(clamp(age / 0.16));
        const base: React.CSSProperties = {
          display: 'inline-block',
          transform: `translateY(${(1 - pop) * 10}px) scale(${0.94 + 0.06 * pop})`,
          opacity: 0.25 + 0.75 * pop,
          color: isCur ? C.white : 'rgba(255,255,255,0.62)',
          textShadow: '0 2px 18px rgba(23,10,16,0.55), 0 1px 2px rgba(23,10,16,0.6)',
        };
        if (w.key) {
          const k = easeOut(clamp(age / 0.22));
          return (
            <span
              key={i}
              style={{
                ...base,
                color: C.plum,
                opacity: 1,
                textShadow: 'none',
                background: `rgba(238,221,226,${0.35 + 0.65 * k})`,
                padding: '0 16px',
                borderRadius: 16,
                boxShadow: `0 0 ${24 * k}px rgba(238,221,226,${0.45 * k})`,
                transform: `translateY(${(1 - k) * 10}px) scale(${0.86 + 0.14 * k + (isCur ? 0.03 : 0)})`,
              }}
            >
              {w.text}
            </span>
          );
        }
        return (
          <span key={i} style={base}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
