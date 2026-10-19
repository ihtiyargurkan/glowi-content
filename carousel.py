#!/usr/bin/env python3
"""Build a Glowi carousel (1080x1350 JPEG slides) from a JSON spec, then render it.

  python3 carousel.py content/<post>/carousel.json

Slide kinds:
  cover   {title, sub?, kicker?}
  item    {n?, title, body, fix?, verdict?, chips?[2], icon?}
  steps   {title, items:[...]}            # the "screenshot this" summary
  big     {big, title, body?}             # one giant number/word
  cta     {title, body, action}
"""
import html, json, os, sys
from render import carousel as render_carousel

ICONS = {  # simple original glyphs drawn in CSS/SVG-free text so they stay crisp
    "drop": "💧", "sun": "☀︎", "clock": "⏱", "spark": "✦", "scale": "⚖", "shield": "⛨", "moon": "☾",
    "leaf": "❦", "check": "✓", "x": "✕",
}

CSS = """
.slide{display:flex;flex-direction:column;padding:96px 92px 110px}
.slide .bgc{position:absolute;border-radius:50%;filter:blur(80px)}
.top{display:flex;justify-content:space-between;font-weight:800;font-size:28px;letter-spacing:.16em;opacity:.7;position:relative}
.cover h1{font-family:Fraunces;font-weight:500;font-size:132px;line-height:.98;letter-spacing:-.03em;margin-top:150px;position:relative}
.cover h1 em{font-style:italic;color:var(--rose)}
.cover .sub{margin-top:54px;font-size:46px;font-weight:650;line-height:1.25;color:var(--ink-soft);position:relative;max-width:820px}
.kicker{display:inline-block;margin-top:70px;padding:16px 34px;border-radius:999px;background:var(--plum);color:var(--ivory);font-weight:800;font-size:34px;letter-spacing:.06em;position:relative;align-self:flex-start}
.swipe{position:absolute;right:92px;bottom:96px;font-weight:800;font-size:34px;letter-spacing:.1em}
.n{font-family:Fraunces;font-size:200px;line-height:.9;color:var(--rose);font-weight:400;margin-top:70px;position:relative}
.item h2{font-weight:850;font-size:84px;line-height:1.02;letter-spacing:-.03em;margin-top:24px;position:relative}
.item p{font-size:46px;line-height:1.32;font-weight:550;color:var(--ink-soft);margin-top:40px;position:relative}
.chips{display:flex;align-items:center;gap:26px;margin-top:56px;position:relative}
.chip{padding:22px 34px;border-radius:26px;background:var(--ivory);font-weight:800;font-size:40px;box-shadow:0 14px 40px rgba(75,46,57,.10)}
.vs{font-weight:900;font-size:46px;color:var(--rose)}
.fix{margin-top:auto;position:relative;background:var(--plum);color:var(--ivory);border-radius:36px;padding:38px 46px;font-size:44px;font-weight:700;line-height:1.25}
.fix b{color:var(--gold);letter-spacing:.08em;font-size:32px;display:block;margin-bottom:10px}
.stamp + h2{margin-top:300px}
.stamp{position:absolute;right:92px;top:185px;transform:rotate(-12deg);border:10px solid currentColor;border-radius:24px;padding:10px 34px;font-weight:900;font-size:82px;letter-spacing:.08em}
.stamp.myth{color:var(--alert)} .stamp.true{color:var(--sage)} .stamp.half{color:#C98A1E;font-size:64px}
.steps h2{font-family:Fraunces;font-weight:500;font-size:96px;line-height:1;margin-top:60px;position:relative}
.steps ul{list-style:none;margin-top:60px;position:relative}
.steps li{display:flex;gap:28px;align-items:flex-start;font-size:44px;font-weight:650;line-height:1.25;padding:26px 0;border-bottom:3px solid rgba(75,46,57,.1)}
.steps li span{flex:none;width:62px;height:62px;border-radius:50%;background:var(--plum);color:var(--ivory);display:flex;align-items:center;justify-content:center;font-weight:850;font-size:32px;margin-top:-2px}
.big .bignum{font-family:Fraunces;font-size:360px;line-height:.9;font-weight:400;margin-top:110px;position:relative;letter-spacing:-.04em}
.big h2{font-weight:850;font-size:80px;line-height:1.04;letter-spacing:-.03em;margin-top:40px;position:relative}
.big p{font-size:46px;line-height:1.3;font-weight:550;color:var(--ink-soft);margin-top:34px;position:relative}
.cta{background:var(--plum-deep)!important;color:var(--ivory)}
.cta h2{font-family:Fraunces;font-weight:500;font-size:110px;line-height:1;margin-top:150px;position:relative}
.cta h2 em{color:var(--gold);font-style:italic}
.cta p{font-size:48px;line-height:1.3;font-weight:550;opacity:.85;margin-top:50px;position:relative}
.cta .action{margin-top:auto;align-self:flex-start;background:var(--gold);color:var(--plum-deep);font-weight:850;font-size:44px;padding:28px 46px;border-radius:999px;position:relative}
"""


def e(s):
    return html.escape(s or "").replace("*", "")


def rich(s):
    # *word* → <em>word</em>
    out, on = "", False
    for part in html.escape(s or "").split("*"):
        out += (f"<em>{part}</em>" if on else part); on = not on
    return out


def bg(i):
    pos = [("-160px", "-200px", "#ffffff"), ("auto", "-120px", "#E9B9C6")]
    a = f'<div class="bgc" style="width:760px;height:760px;left:{-200 + (i * 137) % 400}px;top:{-260 + (i * 91) % 300}px;background:#fff;opacity:.8"></div>'
    b = f'<div class="bgc" style="width:640px;height:640px;right:-240px;bottom:{-200 + (i * 73) % 260}px;background:#E9B9C6;opacity:.7"></div>'
    return a + b


def slide(s, i, total, handle):
    k = s["kind"]
    top = f'<div class="top"><span>{e(handle)}</span><span>{i}/{total}</span></div>'
    swipe = '<div class="swipe">SWIPE →</div>' if i < total and k in ("cover",) else ""
    if k == "cover":
        body = f'<h1>{rich(s["title"])}</h1>'
        if s.get("sub"): body += f'<div class="sub">{rich(s["sub"])}</div>'
        if s.get("kicker"): body += f'<div class="kicker">{e(s["kicker"])}</div>'
    elif k == "item":
        body = ""
        if s.get("verdict"):
            cls = {"MYTH": "myth", "TRUE": "true"}.get(s["verdict"], "half")
            body += f'<div class="stamp {cls}">{e(s["verdict"])}</div>'
        if s.get("n"): body += f'<div class="n">{e(str(s["n"]))}</div>'
        body += f'<h2>{rich(s["title"])}</h2>'
        if s.get("chips"):
            a, b = s["chips"]
            body += f'<div class="chips"><div class="chip">{e(a)}</div><div class="vs">{e(s.get("join","+"))}</div><div class="chip">{e(b)}</div></div>'
        body += f'<p>{rich(s["body"])}</p>'
        if s.get("fix"): body += f'<div class="fix"><b>{e(s.get("fix_label","DO THIS"))}</b>{rich(s["fix"])}</div>'
    elif k == "steps":
        lis = "".join(f'<li><span>{j}</span><div>{rich(x)}</div></li>' for j, x in enumerate(s["items"], 1))
        body = f'<h2>{rich(s["title"])}</h2><ul>{lis}</ul>'
    elif k == "big":
        body = f'<div class="bignum">{e(s["big"])}</div><h2>{rich(s["title"])}</h2>'
        if s.get("body"): body += f'<p>{rich(s["body"])}</p>'
        if s.get("fix"): body += f'<div class="fix"><b>{e(s.get("fix_label","DO THIS"))}</b>{rich(s["fix"])}</div>'
    elif k == "cta":
        body = f'<h2>{rich(s["title"])}</h2><p>{rich(s["body"])}</p><div class="action">{e(s["action"])}</div>'
    else:
        raise ValueError(k)
    cls = f"slide {k}"
    return f'<div class="{cls}">{bg(i) if k != "cta" else ""}{top}{body}{swipe}</div>'


def build(spec_path):
    spec = json.load(open(spec_path))
    out_dir = os.path.dirname(os.path.abspath(spec_path))
    rel = os.path.relpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "lib"), out_dir)
    slides = spec["slides"]
    handle = spec.get("handle", "GLOWI")
    body = "\n".join(slide(s, i, len(slides), handle) for i, s in enumerate(slides, 1))
    page = f"""<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="{rel}/base.css">
<style>{CSS}</style></head><body style="display:flex;flex-direction:column;gap:20px;width:1080px">{body}</body></html>"""
    path = os.path.join(out_dir, "carousel.html")
    open(path, "w").write(page)
    return render_carousel(path)


if __name__ == "__main__":
    print("\n".join(build(sys.argv[1])))
