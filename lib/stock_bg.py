"""Build the stock-footage background track for a reel from a JSON spec (zoompan per scene, concat)."""
import json, subprocess, sys, os
spec = json.load(open(sys.argv[1])); src = sys.argv[2]; out = sys.argv[3]
parts = []
for k, s in enumerate(spec["scenes"]):
    dur = s["dur"]; fr = int(round(dur * 30)); z0, z1 = s.get("z", [1, 1.08]); cx, cy = s.get("c", [540, 960])
    spd = s.get("speed", 1.0)
    vf = (f"setpts={1/spd}*PTS,fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
          f"scale=2160:3840,zoompan=z='{z0}+({z1}-{z0})*on/{fr}':x='{cx*2}-iw/zoom/2':y='{cy*2}-ih/zoom/2':d=1:s=1080x1920:fps=30,"
          f"eq=brightness={s.get('b',0)}:saturation={s.get('sat',1.0)}")
    p = f"/tmp/bg_{k}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(s.get("ss", 0)), "-i", os.path.join(src, f"{s['clip']}.mp4"), "-an",
                    "-vf", vf, "-frames:v", str(fr), "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-pix_fmt", "yuv420p", p], check=True)
    parts.append(p)
open("/tmp/bg_list.txt", "w").write("".join(f"file '{p}'\n" for p in parts))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "/tmp/bg_list.txt", "-c", "copy", out], check=True)
print(out)
