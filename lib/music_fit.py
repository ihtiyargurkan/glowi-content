#!/usr/bin/env python3
"""Fit a real (licensed, royalty-free) track to a Reel.

Finds the most energetic section of the track, starts it on a beat, trims to the Reel length,
fades the tail, and normalizes loudness for Instagram (about -14 LUFS).

  python3 music_fit.py track.mp3 out.wav seconds [--offset S]
"""
import argparse, subprocess, tempfile, os
import numpy as np

SR = 44100


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def best_start(x, seconds):
    hop = SR // 10
    rms = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, mode="same")[::hop] + 1e-12)
    win = int(seconds * 10)
    if len(rms) <= win:
        return 0.0
    score = np.convolve(rms, np.ones(win), mode="valid")
    # skip intros (first 8%) and outros (last 10%) where tracks are usually thin
    lo, hi = int(len(score) * .08), int(len(score) * .9)
    i = lo + int(np.argmax(score[lo:hi])) if hi > lo else int(np.argmax(score))
    t = i / 10
    # snap to the nearest strong onset (likely a downbeat) within ±0.5s
    seg = x[int(max(0, t - .5) * SR): int((t + .5) * SR)]
    if len(seg) > 2048:
        env = np.abs(np.diff(np.convolve(np.abs(seg), np.ones(512) / 512, mode="same")))
        t = max(0, t - .5) + int(np.argmax(env)) / SR
    return round(t, 3)


def fit(track, out, seconds, offset=None, lufs=-14):
    """Cut the best section, repair clipped peaks (Pixabay masters are often clipped), soften the
    harsh top end and set loudness with a LINEAR gain (two-pass loudnorm), so nothing pumps or crackles."""
    x = decode(track)
    start = best_start(x, seconds) if offset is None else offset
    fade_out = min(1.2, seconds / 6)
    pre = (f"atrim=start={start}:duration={seconds},asetpts=PTS-STARTPTS,volume=0.7,"
           f"adeclip=window=55:overlap=75,lowpass=f=14500,"
           f"afade=t=in:d=0.04,afade=t=out:st={seconds - fade_out}:d={fade_out}")
    import json as _json
    m = subprocess.run(["ffmpeg", "-v", "info", "-i", track, "-af", pre + f",loudnorm=I={lufs}:TP=-2:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
    j = _json.loads(m[m.rindex("{"): m.rindex("}") + 1])
    ln = (f"loudnorm=I={lufs}:TP=-2:LRA=11:linear=true:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
          f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", track, "-af", pre + "," + ln, "-ar", str(SR), "-ac", "2",
                    "-c:a", "pcm_f32le", out], check=True)
    return start


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("track"); ap.add_argument("out"); ap.add_argument("seconds", type=float)
    ap.add_argument("--offset", type=float, default=None)
    ap.add_argument("--lufs", type=float, default=-14)
    a = ap.parse_args()
    print(fit(a.track, a.out, a.seconds, a.offset, a.lufs))
