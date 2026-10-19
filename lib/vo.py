#!/usr/bin/env python3
"""Generate a Reel voiceover with Kokoro (Apache-2.0 open-weights TTS), one file per line.

  python3 lib/vo.py content/<post>        # reads content/<post>/vo.json, writes vo_00.wav …

vo.json: {"voice": "af_heart", "speed": 1.1, "lines": [...], "offsets": [...]}
Model files are downloaded once into $KOKORO_DIR (default ~/.kokoro). Needs `pip install kokoro-onnx soundfile`.
Prints the duration of each line so a reel's timeline (B / offsets) can be set from real speech.
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf

BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
MODEL, VOICES = "kokoro-v1.0.int8.onnx", "voices-v1.0.bin"


def ensure_models(d):
    os.makedirs(d, exist_ok=True)
    for f in (MODEL, VOICES):
        p = os.path.join(d, f)
        if not os.path.exists(p) or os.path.getsize(p) < 1_000_000:
            subprocess.run(["curl", "-sSL", "-o", p, BASE + f], check=True)
    return os.path.join(d, MODEL), os.path.join(d, VOICES)


def main(post_dir):
    spec = json.load(open(os.path.join(post_dir, "vo.json")))
    from kokoro_onnx import Kokoro
    m, v = ensure_models(os.environ.get("KOKORO_DIR", os.path.expanduser("~/.kokoro")))
    k = Kokoro(m, v)
    durs = []
    for i, line in enumerate(spec["lines"]):
        a, sr = k.create(line, voice=spec.get("voice", "af_heart"), speed=spec.get("speed", 1.1), lang="en-us")
        a = np.asarray(a, dtype=np.float32)
        thr = 0.01 * np.abs(a).max(); idx = np.where(np.abs(a) > thr)[0]
        a = a[max(0, idx[0] - int(.03 * sr)): idx[-1] + int(.08 * sr)]  # trim silence
        sf.write(os.path.join(post_dir, f"vo_{i:02d}.wav"), a, sr)
        durs.append(round(len(a) / sr, 2))
    print(json.dumps({"durations": durs, "total": round(sum(durs), 2)}))


if __name__ == "__main__":
    main(sys.argv[1])
