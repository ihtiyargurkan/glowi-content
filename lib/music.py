#!/usr/bin/env python3
"""Original, royalty-free soundtrack for Glowi Reels (synthesized, so nothing to license).

Upbeat dance-pop at 120-126 BPM: four-on-the-floor kick, claps on 2 and 4, offbeat open hats,
a sidechained supersaw chord stab, a pumping bass line and a short hooky lead. Sound design is
synced to the edit: a riser + whoosh into every scene change and an impact on the hook's lock.

  python3 music.py out.wav seconds [seed] [bpm] [--beats 0,3.0,6.6] [--hit 1.05]
"""
import argparse, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100

# progressions as MIDI roots + chord tones (bright, major-leaning pop)
PROGS = [
    [(57, [57, 60, 64, 67]), (53, [53, 57, 60, 64]), (48, [55, 60, 64, 67]), (55, [55, 59, 62, 67])],  # Am7 F C/G G
    [(50, [62, 65, 69, 72]), (55, [62, 67, 71, 74]), (48, [60, 64, 67, 71]), (57, [60, 64, 69, 72])],  # Dm G C Am
    [(53, [60, 65, 69, 72]), (55, [62, 67, 71, 74]), (57, [60, 64, 69, 72]), (52, [59, 64, 67, 71])],  # F G Am Em
    [(48, [60, 64, 67, 72]), (55, [59, 62, 67, 71]), (57, [60, 64, 69, 72]), (53, [60, 65, 69, 72])],  # C G Am F
]
LEADS = [  # scale-degree offsets (semitones from chord top) per 8th note, None = rest
    [0, None, 3, 0, 5, None, 3, 0],
    [7, 5, None, 3, 5, None, 0, None],
    [0, 3, 5, 7, None, 5, 3, None],
    [12, None, 7, 5, 7, None, 3, 5],
]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, cutoff, order=2):
    return sosfilt(butter(order, min(cutoff, SR / 2 - 100) / (SR / 2), "low", output="sos"), x)


def hp(x, cutoff, order=2):
    return sosfilt(butter(order, cutoff / (SR / 2), "high", output="sos"), x)


def adsr(n, a=.005, d=.08, s=.6, r=.05):
    e = np.full(n, s, dtype=float)
    ai, di, ri = int(a * SR), int(d * SR), int(r * SR)
    ai = min(ai, n); e[:ai] = np.linspace(0, 1, ai)
    dj = min(n, ai + di); e[ai:dj] = np.linspace(1, s, dj - ai)
    if ri and n > ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e


def saw(f, n, phase=0.0):
    t = np.arange(n) / SR
    return 2 * ((f * t + phase) % 1) - 1


def supersaw(f, n, rng, voices=5, spread=.18):
    out = np.zeros(n)
    for v in range(voices):
        det = (v - (voices - 1) / 2) / ((voices - 1) / 2) * spread
        out += saw(f * 2 ** (det / 12), n, rng.random())
    return out / voices


def kick(n=int(.32 * SR)):
    t = np.arange(n) / SR
    f = 50 + 140 * np.exp(-t * 38)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    click = np.random.default_rng(0).standard_normal(n) * np.exp(-t * 300) * .3
    return np.tanh((body + click) * 1.8)


def clap(rng, n=int(.22 * SR)):
    t = np.arange(n) / SR
    noise = hp(rng.standard_normal(n), 900)
    env = np.zeros(n)
    for k, off in enumerate((0, .009, .018)):  # three quick hits = clap
        i = int(off * SR); env[i:] += np.exp(-(t[: n - i]) * (60 if k < 2 else 18))
    return noise * env * .55


def hat(rng, open_=False):
    n = int((.16 if open_ else .05) * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t * (22 if open_ else 90)) * (.32 if open_ else .22)


def riser(rng, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    sweep = np.zeros(n)
    # time-varying high-pass by blending progressively filtered copies
    for k, c in enumerate(np.linspace(300, 9000, 6)):
        seg = hp(noise, c)
        w = np.clip(1 - abs(t / dur * 5 - k), 0, 1)
        sweep += seg * w
    return sweep * (t / dur) ** 2 * .35


def whoosh(rng, dur=.45):
    n = int(dur * SR); t = np.arange(n) / SR
    x = lp(rng.standard_normal(n), 3500) * np.sin(np.pi * t / dur) ** 2
    return x * .45


def impact(n=int(.9 * SR)):
    t = np.arange(n) / SR
    f = 38 + 70 * np.exp(-t * 14)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4)
    return np.tanh(boom * 2.2) * .8


STYLES = {"house": 122, "garage": 132, "bounce": 142}


def make(seconds, seed=1, bpm=None, beats=(), hit=None, style="house"):
    bpm = bpm or STYLES[style]
    rng = np.random.default_rng(seed)
    prog = PROGS[seed % len(PROGS)]
    lead = LEADS[(seed // 2) % len(LEADS)]
    beat = 60 / bpm; bar = beat * 4; e8 = beat / 2; s16 = beat / 4
    total = int((seconds + 1.5) * SR)
    drums, music, fx = np.zeros(total), np.zeros(total), np.zeros(total)

    def put(buf, sig, at, g=1.0):
        i = int(at * SR)
        if i >= total or i + len(sig) <= 0: return
        if i < 0: sig, i = sig[-i:], 0
        j = min(total, i + len(sig)); buf[i:j] += sig[: j - i] * g

    K = kick()
    nbars = int(np.ceil((seconds + 1) / bar))
    for b in range(nbars):
        t0 = b * bar
        root, chord = prog[b % len(prog)]
        if style == "house":
            for q in range(4):
                put(drums, K, t0 + q * beat, .95)
                if q in (1, 3): put(drums, clap(rng), t0 + q * beat, .9)
                put(drums, hat(rng, open_=True), t0 + q * beat + e8, .9)
                for s_ in (1, 3): put(drums, hat(rng), t0 + q * beat + s_ * s16, .7)
            kicks = [0, 1, 2, 3]
        elif style == "garage":  # swung 2-step
            kicks = [0, 2.75]
            for k_ in kicks: put(drums, K, t0 + k_ * beat, .95)
            for q in (1, 3): put(drums, clap(rng), t0 + q * beat, .95)
            for i16 in range(16):
                sw = s16 * (.28 if i16 % 2 else 0)
                put(drums, hat(rng, open_=(i16 % 4 == 2)), t0 + i16 * s16 + sw, .8 if i16 % 2 else .55)
        else:  # bounce: half-time hip-hop/pop with hat rolls
            kicks = [0, 1.75, 2.5]
            for k_ in kicks: put(drums, K, t0 + k_ * beat, 1.0)
            put(drums, clap(rng), t0 + 2 * beat, 1.1)
            for i16 in range(16):
                put(drums, hat(rng), t0 + i16 * s16, .75 if i16 % 2 == 0 else .45)
            if b % 2 == 1:  # triplet roll at the end of every other bar
                for r_ in range(6): put(drums, hat(rng), t0 + 3 * beat + r_ * beat / 6, .6)
        if style == "bounce":  # long 808 with a glide
            n = int(bar * .95 * SR); tt = np.arange(n) / SR
            f0, f1 = hz(root - 24), hz(root - 24 + (7 if b % 2 else 0))
            fr = f0 + (f1 - f0) * np.clip((tt - bar * .6) / .08, 0, 1)
            sub = np.tanh(np.sin(2 * np.pi * np.cumsum(fr) / SR) * 2.2) * np.exp(-tt * .6)
            put(music, sub * adsr(n, .005, .2, .9, .1), t0, .75)
        else:  # pumping offbeat bass (octave bounce)
            for k in range(8):
                n = int(e8 * .92 * SR)
                f = hz(root - 12 + (12 if k % 2 else 0))
                tone = lp(saw(f, n) * .7 + np.sin(2 * np.pi * f * np.arange(n) / SR) * .6, 900)
                put(music, tone * adsr(n, .003, .06, .7, .02), t0 + k * e8, .55)
        # supersaw chord stabs: syncopated pop rhythm
        for pos, ln in ((0, .9), (1.5, .45), (2.5, .45), (3, .9)):
            n = int(ln * beat * SR)
            stab = sum(supersaw(hz(m), n, rng) for m in chord) / len(chord)
            cut = 2200 + 2600 * (b % 2)
            put(music, lp(stab, cut) * adsr(n, .004, .12, .55, .05), t0 + pos * beat, .55)
        # lead hook: plucky square-ish line, only from bar 2 on so the hook has room
        if b >= 1:
            top = chord[-1] + 12
            for k, step in enumerate(lead):
                if step is None: continue
                n = int(e8 * .85 * SR)
                f = hz(top + step - 12)
                tt = np.arange(n) / SR
                sq = np.sign(np.sin(2 * np.pi * f * tt)) * .5 + saw(f * 2, n) * .25
                put(music, lp(sq, 4200) * np.exp(-tt * 9) * .9, t0 + k * e8, .3)

    # sidechain: duck music under every kick
    sc = np.ones(total)
    kick_times = [bb * bar + k_ * beat for bb in range(nbars) for k_ in kicks]
    for kt in kick_times:
        i = int(kt * SR); n = int(beat * SR * .85)
        j = min(total, i + n)
        if i < total: sc[i:j] = np.minimum(sc[i:j], 1 - .7 * np.exp(-np.arange(j - i) / SR * 9))
    music *= sc

    # edit-synced sound design
    for at in beats:
        if at <= 0: continue
        put(fx, riser(rng, .9), at - .9, .8)
        put(fx, whoosh(rng), at - .2, 1.0)
    if hit is not None:
        put(fx, impact(), hit, .9)
    put(fx, impact(), 0.0, .55)  # downbeat punch on frame 0

    mix = drums * .85 + music * .9 + fx
    mix = mix[: int(seconds * SR)]
    n = len(mix); fade = int(.8 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix = np.tanh(mix * 1.15)
    mix /= max(1e-6, np.abs(mix).max()) / .89
    return mix


def write(path, seconds, seed=1, bpm=None, beats=(), hit=None, style="house"):
    m = make(seconds, seed, bpm, beats, hit, style)
    l = m; r = np.concatenate([np.zeros(180), m[:-180]]) * .97 + m * .03
    data = (np.stack([l, r], axis=1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("out"); ap.add_argument("seconds", type=float)
    ap.add_argument("seed", type=int, nargs="?", default=1)
    ap.add_argument("bpm", type=int, nargs="?", default=0)
    ap.add_argument("--style", default="house", choices=["house", "garage", "bounce"])
    ap.add_argument("--beats", default="")
    ap.add_argument("--hit", type=float, default=None)
    a = ap.parse_args()
    beats = [float(x) for x in a.beats.split(",") if x.strip()]
    write(a.out, a.seconds, a.seed, a.bpm or None, beats, a.hit, a.style)
