"""Procedural macro skin renderer (original, free, no AI): height map + albedo + lighting.

  python3 lib/skin.py <out_dir>   # writes clear.jpg, mark.jpg, scars.jpg, papule.jpg (1080x1100)
Features: mark (flat dark spot), papule (+head), dent, bump, blackhead. Edit the list in __main__ for new scenes."""
import numpy as np, sys
from PIL import Image
from scipy.ndimage import gaussian_filter, zoom
rng = np.random.default_rng(7)
def noise(h, w, scale, amp=1.0):
    s = max(2, int(max(h, w) / scale))
    n = rng.standard_normal((s, s))
    n = zoom(n, (h / s, w / s), order=3)[:h, :w]
    return amp * n / (n.std() + 1e-9)
def skin(h=1300, w=1080, tone=(0.80, 0.58, 0.48), features=()):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    H = noise(h, w, 300, 6.0) + noise(h, w, 80, 2.0) + noise(h, w, 8, .5)
    # pores
    n = int(h * w / 900)
    pz = np.zeros((h, w), np.float32)
    py, px = rng.integers(0, h, n), rng.integers(0, w, n)
    pz[py, px] = rng.uniform(.3, 1.0, n)
    H -= gaussian_filter(pz, 1.1) * 70
    # fine skin lines (cross-hatched micro relief)
    for ang in (0.5, 2.1):
        u = xx * np.cos(ang) + yy * np.sin(ang)
        H += .45 * np.abs(np.sin(u / 23 + noise(h, w, 90, 1.2)))
    alb = np.ones((h, w, 3), np.float32) * np.array(tone, np.float32)
    var = noise(h, w, 150, .03)[..., None] + noise(h, w, 30, .015)[..., None] + rng.standard_normal((h, w, 1)).astype(np.float32) * .012
    alb += var * np.array([1, .8, .7])
    redness = np.zeros((h, w), np.float32)
    for f in features:
        k, cx, cy, r = f["k"], f["x"], f["y"], f["r"]
        d = np.sqrt((xx - cx) ** 2 + ((yy - cy) * f.get("ar", 1)) ** 2)
        irr = noise(h, w, r / 1.5, .18)
        m = np.clip(1 - (d / r + irr) , 0, 1)
        m = gaussian_filter(m, r * .08)
        if k == "mark":  # flat post-inflammatory dark mark: color only
            mm = gaussian_filter(np.clip(1 - (d / r + .5 * irr), 0, 1), r * .12); alb *= (1 - .62 * mm[..., None] ** .8 * np.array([.7, .92, 1.0]))
        if k == "papule":  # inflamed pimple: raised + red, optional whitehead
            H += 420 * np.exp(-(d / r) ** 2 * 1.4)
            redness += np.clip(np.exp(-(d / (r * 1.5)) ** 2 * 2) * (1 + irr), 0, 1) * f.get("red", 1) * .8
            if f.get("head"):
                hm = np.clip(1.6 * np.exp(-(d / (r * .3)) ** 4), 0, 1); H += 60 * hm
                alb = alb * (1 - hm[..., None]) + hm[..., None] * np.array([.97, .93, .78])
        if k == "dent":  # atrophic scar
            H -= 380 * np.exp(-(d / r) ** 2 * 1.5)
            alb *= (1 - .06 * m[..., None])
        if k == "bump":  # raised scar
            H += 300 * np.exp(-(d / r) ** 2 * 1.5)
            alb = alb * (1 - .25 * m[..., None]) + .25 * m[..., None] * np.array([.86, .62, .58])
        if k == "blackhead":
            dm = np.exp(-(d / r) ** 2 * 3)
            H -= 10 * dm; alb *= (1 - .75 * dm[..., None])
    alb = alb * (1 - redness[..., None] * np.array([-.05, .45, .45]))
    # lighting from upper left
    H = gaussian_filter(H, 1.6)
    gy, gx = np.gradient(H)
    nrm = np.dstack([-gx * .28, -gy * .28, np.ones_like(H)]); nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)
    L = np.array([-.45, -.55, .7]); L /= np.linalg.norm(L)
    diff = np.clip((nrm * L).sum(2), 0, 1)
    V = np.array([0, 0, 1.]); Hv = (L + V) / np.linalg.norm(L + V)
    spec = np.clip((nrm * Hv).sum(2), 0, 1) ** 25 * .22
    sss = gaussian_filter(diff, 6)  # soft subsurface-ish
    shade = .4 + .5 * diff + .15 * sss
    img = alb * shade[..., None] + spec[..., None] * np.array([1, .95, .9])
    vig = 1 - .35 * (((xx - w / 2) / w) ** 2 + ((yy - h / 2) / h) ** 2) * 2
    img *= vig[..., None]
    return Image.fromarray((np.clip(img, 0, 1) ** (1 / 1.1) * 255).astype(np.uint8))
if __name__ == "__main__":
    import os
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for name, feats, sz in [("clear", [], (1100, 1080)),
                            ("mark", [dict(k="mark", x=540, y=560, r=200, ar=1.15)], (1100, 1080)),
                            ("scars", [dict(k="dent", x=300, y=560, r=130), dict(k="bump", x=780, y=560, r=120)], (1100, 1080)),
                            ("papule", [dict(k="papule", x=540, y=560, r=140, head=1)], (1100, 1080))]:
        rng = np.random.default_rng(7)
        globals()["rng"] = rng
        skin(*sz, features=feats).save(f"{out}/{name}.jpg", quality=90)
