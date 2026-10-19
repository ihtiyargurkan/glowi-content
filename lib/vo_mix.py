#!/usr/bin/env python3
"""Mix a voiceover onto a rendered Reel (which already carries its music bed).

  python3 lib/vo_mix.py content/<post> [out.mp4]

- every line is levelled to the same loudness and scaled (never clipped) to a safe peak
- the music ducks smoothly under the voice
- final loudness ≈ -15 LUFS with a hard ceiling at about -1.5 dBFS, so nothing distorts after AAC
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import resample_poly

SR = 44100


def lufs(path):
    m = subprocess.run(["ffmpeg", "-v", "info", "-i", path, "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    return float([l for l in m.splitlines() if l.strip().startswith("I:")][-1].split()[1])


def main(post_dir, out=None):
    spec = json.load(open(os.path.join(post_dir, "vo.json")))
    video = os.path.join(post_dir, "reel.mp4")
    out = out or os.path.join(post_dir, "final.mp4")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video],
                               capture_output=True, text=True).stdout)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    bed = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    n = int(dur * SR); bed = np.pad(bed, ((0, max(0, n - len(bed))), (0, 0)))[:n]
    vox = np.zeros(n)
    for i, o in enumerate(spec["offsets"]):
        a, sr = sf.read(os.path.join(post_dir, f"vo_{i:02d}.wav")); a = resample_poly(a, SR, sr)
        a = a / (np.sqrt((a ** 2).mean()) + 1e-9) * 0.12
        a = a * min(1.0, 0.6 / np.abs(a).max())          # scale, never clip
        f_in, f_out = int(.01 * SR), int(.03 * SR)
        a[:f_in] *= np.linspace(0, 1, f_in); a[-f_out:] *= np.linspace(1, 0, f_out)
        s = int(o * SR); e = min(n, s + len(a)); vox[s:e] += a[: e - s]
    act = np.convolve(np.abs(vox), np.ones(int(.05 * SR)) / int(.05 * SR), mode="same") > 0.01
    k = int(.12 * SR); env = np.convolve(np.where(act, spec.get("duck", 0.45), 1.0), np.ones(k) / k, mode="same")
    mix = bed * env[:, None] + vox[:, None]
    mix *= 0.70 / np.abs(mix).max()
    tmp = out + ".premix.wav"; sf.write(tmp, mix.astype(np.float32), SR)
    g = min(10 ** ((-15 - lufs(tmp)) / 20), 0.78 / np.abs(mix).max())  # ≤ -1 dBTP after AAC
    sf.write(tmp, (mix * g).astype(np.float32), SR)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-i", tmp, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "256k", "-ar", "44100", "-movflags", "+faststart", "-t", str(dur), out], check=True)
    os.remove(tmp)
    print(out)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
