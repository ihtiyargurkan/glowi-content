#!/usr/bin/env python3
"""Original, royalty-free background bed for Glowi Reels (synthesized, so no licensing).

Soft lo-fi: warm pad chords + plucked arpeggio + gentle kick/hat. Seeded per post so each
Reel gets its own variation. Usage: python3 music.py out.wav seconds [seed] [bpm]
"""
import sys, wave
import numpy as np

SR = 44100
PROGRESSIONS = [
    [(53, 57, 60, 64), (57, 60, 64, 67), (50, 53, 57, 60), (55, 59, 62, 65)],  # Fmaj7 Am7 Dm7 G7
    [(48, 52, 55, 59), (45, 48, 52, 55), (53, 57, 60, 64), (55, 59, 62, 65)],  # Cmaj7 Am7 Fmaj7 G7
    [(50, 53, 57, 60), (55, 59, 62, 65), (48, 52, 55, 59), (57, 60, 64, 67)],  # Dm7 G7 Cmaj7 Am7
]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, r):
    e = np.ones(n)
    ai, ri = int(a * SR), int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e


def pad(freqs, dur, rng):
    n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            out += np.sin(2 * np.pi * ff * t + rng.random() * 6) * 0.5 + 0.18 * np.sin(4 * np.pi * ff * t)
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.25 * t)
    return out * lfo * env(n, 0.6, 0.6) / (len(freqs) * 3)


def pluck(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) + 0.1 * np.sin(6 * np.pi * f * t)
    return tone * np.exp(-t * 5.5) * env(n, 0.004, 0.05)


def kick(dur=0.35):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 110 * np.exp(-t * 18) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat(rng, dur=0.05):
    n = int(dur * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    x = np.diff(np.concatenate([[0], x]))  # crude high-pass
    return x * np.exp(-t * 70) * 0.18


def reverb(x, rng, secs=1.6, mix=0.22):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 3.2)
    ir /= np.abs(ir).sum() / 6
    wet = np.fft.irfft(np.fft.rfft(x, len(x) + n) * np.fft.rfft(ir, len(x) + n))[: len(x)]
    return x * (1 - mix) + wet * mix


def make(seconds, seed=1, bpm=84):
    rng = np.random.default_rng(seed)
    prog = PROGRESSIONS[seed % len(PROGRESSIONS)]
    beat = 60 / bpm; bar = beat * 4
    total = int((seconds + 2) * SR)
    mix = np.zeros(total)

    def add(sig, at, gain=1.0):
        i = int(at * SR)
        if i >= total: return
        j = min(total, i + len(sig))
        mix[i:j] += sig[: j - i] * gain

    tpos, bi = 0.0, 0
    while tpos < seconds + 1:
        chord = [hz(m) for m in prog[bi % len(prog)]]
        add(pad(chord, bar + 0.6, rng), tpos, 0.55)
        add(np.sin(2 * np.pi * chord[0] / 2 * np.arange(int(bar * SR)) / SR) * env(int(bar * SR), .05, .3) * .22, tpos)
        pattern = [0, 2, 1, 3, 2, 1, 3, 2]
        for k in range(8):
            if rng.random() < 0.85:
                add(pluck(chord[pattern[k]] * 2, beat * 0.9), tpos + k * beat / 2, 0.16)
        if bi > 0:  # let the first bar breathe, then the groove enters
            for b in range(4):
                if b in (0, 2): add(kick(), tpos + b * beat, 0.55)
                add(hat(rng), tpos + b * beat + beat / 2, 1.0)
        tpos += bar; bi += 1

    mix = reverb(mix, rng)
    mix = mix[: int(seconds * SR)]
    mix *= env(len(mix), 0.05, 1.2)
    mix = np.tanh(mix * 1.4) / np.tanh(1.4)
    mix /= max(1e-6, np.abs(mix).max()) / 0.7
    return mix


def write(path, seconds, seed=1, bpm=84):
    m = make(seconds, seed, bpm)
    st = np.stack([m, np.roll(m, 220) * 0.96], axis=1)  # tiny stereo width
    data = (st * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())


if __name__ == "__main__":
    write(sys.argv[1], float(sys.argv[2]), int(sys.argv[3]) if len(sys.argv) > 3 else 1,
          int(sys.argv[4]) if len(sys.argv) > 4 else 84)
