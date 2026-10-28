"""Render a transparent reel.html overlay and composite it over a background video."""
import sys, subprocess
from playwright.sync_api import sync_playwright
html, bg, out = sys.argv[1:4]; FPS = 30
with sync_playwright() as p:
    b = p.chromium.launch(args=["--font-render-hinting=none"]); pg = b.new_page(viewport={"width": 1080, "height": 1920})
    pg.goto("file://" + html); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
    dur = float(pg.evaluate("window.DURATION")); n = int(round(dur * FPS))
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-i", bg, "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "png", "-i", "-",
                            "-filter_complex", "[0:v]fps=30,tpad=stop_mode=clone:stop_duration=2[b];[b][1:v]overlay=0:0:format=auto,format=yuv420p[v]",
                            "-map", "[v]", "-t", str(dur), "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-profile:v", "high", "-movflags", "+faststart", out],
                           stdin=subprocess.PIPE)
    for i in range(n):
        pg.evaluate(f"seek({i / FPS})"); enc.stdin.write(pg.screenshot(type="png", omit_background=True))
    enc.stdin.close(); enc.wait(); b.close()
print(out)
