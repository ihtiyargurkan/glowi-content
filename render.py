#!/usr/bin/env python3
"""Glowi Studio renderer.

  python3 render.py reel     content/<post>/reel.html      [--music auto|none|path.wav] [--seed N]
  python3 render.py carousel content/<post>/carousel.html

Reel: the page defines window.DURATION and window.scene(t); each frame is seeked and captured
in headless Chromium, then encoded to H.264 1080x1920 30fps with an AAC track (Instagram API
can't add library music, so audio is baked in). Writes reel.mp4 + cover.jpg next to the HTML.
Carousel: every .slide element is captured to slide-01.jpg … (JPEG, as the API requires).
"""
import argparse, os, subprocess, sys, tempfile
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 30


def launch(p):
    exe = os.environ.get("CHROMIUM_PATH")
    kw = {"executable_path": exe} if exe else {}
    return p.chromium.launch(args=["--font-render-hinting=none", "--disable-lcd-text"], **kw)


def reel(html, music="auto", seed=1):
    out_dir = os.path.dirname(os.path.abspath(html))
    out = os.path.join(out_dir, "reel.mp4")
    with sync_playwright() as p:
        b = launch(p)
        pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        pg.goto("file://" + os.path.abspath(html))
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(300)
        dur = float(pg.evaluate("window.DURATION"))
        cover_t = float(pg.evaluate("window.COVER || 1.6"))
        n = int(round(dur * FPS))
        audio = []
        if music == "auto":
            wav = os.path.join(tempfile.mkdtemp(), "bed.wav")
            subprocess.run([sys.executable, os.path.join(HERE, "lib", "music.py"), wav, str(dur), str(seed)], check=True)
            audio = ["-i", wav]
        elif music not in ("none", None):
            audio = ["-i", music]
        if not audio:
            audio = ["-f", "lavfi", "-t", str(dur), "-i", "anullsrc=r=44100:cl=stereo"]
        enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS),
                                "-c:v", "mjpeg", "-i", "-", *audio, "-map", "0:v", "-map", "1:a", "-t", str(dur),
                                "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-crf", "17",
                                "-preset", "medium", "-c:a", "aac", "-b:a", "192k", "-ar", "44100",
                                "-movflags", "+faststart", out], stdin=subprocess.PIPE)
        for i in range(n):
            pg.evaluate(f"seek({i / FPS})")
            enc.stdin.write(pg.screenshot(type="jpeg", quality=93))
            if i % 90 == 0:
                print(f"  frame {i}/{n}", file=sys.stderr)
        enc.stdin.close(); enc.wait()
        pg.evaluate(f"seek({cover_t})")
        pg.screenshot(path=os.path.join(out_dir, "cover.jpg"), type="jpeg", quality=92)
        b.close()
    return out


def carousel(html):
    out_dir = os.path.dirname(os.path.abspath(html))
    with sync_playwright() as p:
        b = launch(p)
        pg = b.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
        pg.goto("file://" + os.path.abspath(html))
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(300)
        paths = []
        for i, el in enumerate(pg.query_selector_all(".slide"), 1):
            path = os.path.join(out_dir, f"slide-{i:02d}.jpg")
            el.screenshot(path=path, type="jpeg", quality=94)
            paths.append(path)
        b.close()
    return paths


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("kind", choices=["reel", "carousel"])
    ap.add_argument("html")
    ap.add_argument("--music", default="auto")
    ap.add_argument("--seed", type=int, default=1)
    a = ap.parse_args()
    print(reel(a.html, a.music, a.seed) if a.kind == "reel" else "\n".join(carousel(a.html)))
