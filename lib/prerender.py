#!/usr/bin/env python3
"""Pre-render voiced reels so the daily publish run needs no TTS, pip install or model download.

  python3 lib/prerender.py                 # every approved reel with vo.json whose final.mp4 is missing/stale
  python3 lib/prerender.py content/<post>  # one post

Writes content/<post>/final.mp4 and final.sha256 (hash of vo.json + reel.mp4). Commit both.
If vo.json or reel.mp4 changes later, the stamp no longer matches and publish_lib falls back to rendering live.
"""
import os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import publish_lib as pl


def render(d):
    for s in ("vo.py", "vo_mix.py"):
        subprocess.run([sys.executable, os.path.join(ROOT, "lib", s), d], check=True)
    open(os.path.join(d, "final.sha256"), "w").write(pl.source_hash(d) + "\n")
    for f in os.listdir(d):
        if f.startswith("vo_") and f.endswith(".wav"):
            os.remove(os.path.join(d, f))
    print("rendered", d)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        dirs = sys.argv[1:]
    else:
        dirs = [os.path.join(ROOT, "content", p["id"]) for p in pl.queue()["posts"]
                if p["type"] == "reel" and p.get("status") == "approved"]
        dirs = [d for d in dirs if os.path.exists(os.path.join(d, "vo.json")) and not pl.prerendered(d)]
    for d in dirs:
        render(d)
