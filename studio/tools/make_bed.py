import json, numpy as np, wave
tl = json.load(open('src/timeline.json'))
sr = 48000
S = [x['start'] for x in tl['sentences']]
W = tl['words']
def cue(t, n=0): return [w['start'] for w in W if w['text'] == t][n]
end = tl['voEnd'] + 2.8
N = int(end * sr); t = np.arange(N) / sr
rng = np.random.default_rng(7)
# --- ambient pad: Fmaj9-ish airy chord, slow swells
freqs = [87.31, 130.81, 174.61, 220.0, 261.63, 329.63, 392.0]
pad = np.zeros(N)
for i, f in enumerate(freqs):
    for det in (-0.6, 0.6):
        lfo = 0.6 + 0.4 * np.sin(2*np.pi*(0.05 + 0.013*i)*t + i)
        pad += np.sin(2*np.pi*(f+det)*t + i) * lfo / (1 + i*0.35)
# gentle chord change at the fix (sentence 8) -> brighter
cfg = json.load(open('tools/bed.json'))
bright = np.clip((t - S[cfg['brightSentence']]) / 1.5, 0, 1)
pad += bright * 0.5 * np.sin(2*np.pi*440*t) * (0.5+0.5*np.sin(2*np.pi*0.07*t))
pad /= np.max(np.abs(pad))
env = np.clip(t/2.0, 0, 1) * np.clip((end - t)/1.5, 0, 1)
pad *= env * 0.09
# soft pulse (heartbeat-like low thump every 1s, very quiet) to add drive
pulse = np.zeros(N)
for k in np.arange(0.5, end-1, 0.857):
    i0 = int(k*sr); L = int(0.25*sr)
    if i0+L < N:
        tt = np.arange(L)/sr
        pulse[i0:i0+L] += np.sin(2*np.pi*55*tt) * np.exp(-tt*18)
pad += pulse * 0.05
# --- scene-change transition sound (Gurkan, 2026-11-11): public/sfx/transition.mp3
#     "cinematic flashback transition" sample, its loudest moment (~0.85 s in) placed on the
#     visual zoom-through midpoint (scene bound - 0.18 s). Stereo, added on top of the mono bed.
import subprocess
_raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', 'public/sfx/transition.mp3', '-ac', '2', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
TR = np.frombuffer(_raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
TR_PEAK = int(np.argmax(np.abs(TR).max(1)))          # sample index of the hit
TR = TR / np.abs(TR).max() * cfg.get('transitionGain', 0.24)
trans = np.zeros((N, 2))
def transition(at):
    i0 = int(at * sr) - TR_PEAK
    a = max(0, i0); b = min(N, i0 + len(TR))
    if b > a: trans[a:b] += TR[a - i0:b - i0]
bounds = [S[i] for i in cfg['boundSentences']]
for b in bounds: transition(b - 0.18)
# --- chimes on data moments
def chime(at, f0=880, gain=0.10):
    L = int(1.4*sr); i0 = int(at*sr); tt = np.arange(L)/sr
    s = sum(np.sin(2*np.pi*f0*m*tt)/(m*m) for m in (1, 2.01, 3.02)) * np.exp(-tt*4)
    if i0+L < N: pad[i0:i0+L] += s*gain
for c in cfg['chimes']: chime(cue(c), 988)
chime(cue('Glowi'), 1318, 0.12); chime(cue('Glowi')+0.12, 1760, 0.07)
for c in cfg.get('ticks', []):
    L = int(0.08*sr); i0 = int(cue(c)*sr)
    pad[i0:i0+L] += rng.standard_normal(L) * np.exp(-np.arange(L)/sr*60) * 0.12
st = np.clip(np.stack([pad, pad], 1) + trans, -1, 1)
with wave.open('public/bed.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((st*32767).astype(np.int16).tobytes())
print('ok', end)
