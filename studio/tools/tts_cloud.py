#!/usr/bin/env python3
"""Cloud voiceover for a Glowi explainer (no Whisper, no Mac needed).

  python3 tools/tts_cloud.py tools/script_tts.txt tools/script_display.txt public/vo_raw.wav tools/aligned.json

- script_tts.txt     : what Kokoro reads (abbreviations hyphenated: U-V-A, S-P-F; brand spelled "Glowee").
- script_display.txt : what the captions show (UVA, SPF 30+, Glowi, 80% ...).
  Both files: one paragraph per scene/sentence group, blank line between paragraphs, and the SAME
  number of sentences per paragraph (sentences end with . ? or !).
Every sentence is synthesised separately (so sentences never run together), trimmed, and joined with
0.32 s pauses (0.5 s between paragraphs). Word timings are derived from the real audio: inside a sentence,
comma chunks are matched to detected pauses when the counts agree, and words are spread by syllable
weight inside each chunk. Output aligned.json is the input of build_timeline2.py.
Needs: pip install kokoro-onnx soundfile ; models in $KOKORO_DIR (default ~/.kokoro), see ensure_models().
"""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf

BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
MODEL, VOICES = "kokoro-v1.0.fp16.onnx", "voices-v1.0.bin"
SR = 24000
VOICE = os.environ.get("VOICE", "af_heart")
SPEED = float(os.environ.get("SPEED", "1.05"))
GAP_SENT, GAP_PARA = 0.32, 0.50


def ensure_models(d):
    os.makedirs(d, exist_ok=True)
    for f in (MODEL, VOICES):
        p = os.path.join(d, f)
        if not os.path.exists(p) or os.path.getsize(p) < 1_000_000:
            subprocess.run(["curl", "-sSL", "-o", p, BASE + f], check=True)
    return os.path.join(d, MODEL), os.path.join(d, VOICES)


def paragraphs(path):
    paras = [p.strip() for p in open(path).read().split("\n\n") if p.strip()]
    return [[s.strip() for s in re.split(r"(?<=[.?!])\s+", p) if s.strip()] for p in paras]


def syl(w):
    w = re.sub(r"[^a-z0-9]", "", w.lower())
    if re.fullmatch(r"\d+(\.\d+)?%?", w or "x"):
        return 3
    return max(1, len(re.findall(r"[aeiouy]+", w))) + 0.3


def voiced_intervals(a, min_gap=0.12):
    env = np.convolve(np.abs(a), np.ones(240) / 240, mode="same")
    on = env > 0.02 * env.max()
    segs, start = [], None
    for i, v in enumerate(on):
        if v and start is None:
            start = i
        if not v and start is not None:
            segs.append([start, i]); start = None
    if start is not None:
        segs.append([start, len(a)])
    merged = []
    for s in segs:
        if merged and (s[0] - merged[-1][1]) / SR < min_gap:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    return [(s / SR, e / SR) for s, e in merged]


def spread(words, t0, t1):
    w = [syl(x) for x in words]; tot = sum(w); out = []; t = t0
    for x, k in zip(words, w):
        d = (t1 - t0) * k / tot
        out.append((x, t, t + d)); t += d
    return out


def main(tts_path, disp_path, out_wav, out_json):
    from kokoro_onnx import Kokoro
    m, v = ensure_models(os.environ.get("KOKORO_DIR", os.path.expanduser("~/.kokoro")))
    k = Kokoro(m, v)
    T, D = paragraphs(tts_path), paragraphs(disp_path)
    assert len(T) == len(D), f"paragraph count differs: tts {len(T)} vs display {len(D)}"
    audio, words, t = [], [], 0.0
    for pi, (tp, dp) in enumerate(zip(T, D)):
        assert len(tp) == len(dp), f"paragraph {pi}: sentence count differs ({len(tp)} vs {len(dp)})"
        for si, (ts, ds) in enumerate(zip(tp, dp)):
            a, sr = k.create(ts, voice=VOICE, speed=SPEED, lang="en-us")
            a = np.asarray(a, dtype=np.float32)
            idx = np.where(np.abs(a) > 0.01 * np.abs(a).max())[0]
            a = a[max(0, idx[0] - int(.02 * SR)): idx[-1] + int(.06 * SR)]
            dur = len(a) / SR
            toks = ds.split()
            chunks, cur = [], []
            for w in toks:
                cur.append(w)
                if w[-1] in ",;:":
                    chunks.append(cur); cur = []
            if cur:
                chunks.append(cur)
            iv = voiced_intervals(a)
            if len(chunks) > 1 and len(iv) == len(chunks):
                for c, (s0, s1) in zip(chunks, iv):
                    words += [(x, t + a0, t + a1, pi) for x, a0, a1 in spread(c, s0, s1)]
            else:
                s0, s1 = (iv[0][0], iv[-1][1]) if iv else (0, dur)
                words += [(x, t + a0, t + a1, pi) for x, a0, a1 in spread(toks, s0, s1)]
            audio.append(a); t += dur
            gap = GAP_PARA if si == len(tp) - 1 else GAP_SENT
            audio.append(np.zeros(int(gap * SR), np.float32)); t += gap
    audio = np.concatenate(audio[:-1])
    sf.write(out_wav, audio, SR)
    json.dump([dict(text=x.replace("_", " "), start=round(a, 3), end=round(b, 3), para=p) for x, a, b, p in words], open(out_json, "w"))
    print(json.dumps({"seconds": round(len(audio) / SR, 2), "words": len(words), "paragraphs": len(T)}))


if __name__ == "__main__":
    main(*sys.argv[1:5])
