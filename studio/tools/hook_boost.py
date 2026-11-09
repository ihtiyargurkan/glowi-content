# Brighter, louder hook: +1 semitone pitch (duration kept) and +4 dB on paragraph 0 of the voiceover.
import json, subprocess, sys, numpy as np, soundfile as sf
wav, aligned = sys.argv[1], sys.argv[2]
SEMI, GAIN_DB = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0, float(sys.argv[4]) if len(sys.argv) > 4 else 4.0
TEMPO = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
a, sr = sf.read(wav)
words = json.load(open(aligned))
end = max(w['end'] for w in words if w['para'] == 0)
nxt = min(w['start'] for w in words if w['para'] == 1)
cut = int(sr * (end + nxt) / 2)
hook = a[:cut].astype(np.float32)
r = 2 ** (SEMI / 12)
p = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', 'pipe:0',
                    '-af', f'asetrate={sr * r:.0f},aresample={sr},atempo={TEMPO / r:.6f}', '-f', 'f32le', '-ar', str(sr), '-ac', '1', 'pipe:1'],
                   input=hook.tobytes(), capture_output=True, check=True)
h = np.frombuffer(p.stdout, dtype=np.float32).astype(np.float64)
newlen = int(round(cut / TEMPO))
h = np.pad(h, (0, max(0, newlen - len(h))))[:newlen] * 10 ** (GAIN_DB / 20)
f = int(0.03 * sr)  # fade the boost back to normal over 30 ms at the cut (inside the pause)
ramp = np.linspace(1, 0, f)
h[-f:] = h[-f:] * ramp + a[cut - f:cut] * (1 - ramp)  # tail is silence
out = np.concatenate([h, a[cut:]])
pk = np.max(np.abs(out))
if pk > 0.99: out *= 0.99 / pk
sf.write(wav, out, sr)
delta = (cut - newlen) / sr
for w in words:
    if w['para'] == 0:
        w['start'] = round(w['start'] / TEMPO, 3); w['end'] = round(w['end'] / TEMPO, 3)
    else:
        w['start'] = round(w['start'] - delta, 3); w['end'] = round(w['end'] - delta, 3)
json.dump(words, open(aligned, 'w'))
print(f'hook boosted: 0–{cut / sr:.2f}s, +{SEMI} st, +{GAIN_DB} dB, peak {pk:.2f}')
