// Glowi Studio — deterministic animation helpers.
// A reel defines window.DURATION and window.scene(t). The renderer calls seek(t) per frame.
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const E = {
  out: p => 1 - Math.pow(1 - clamp(p), 3),
  inOut: p => { p = clamp(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
  back: p => { p = clamp(p); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
  elastic: p => { p = clamp(p); if (p === 0 || p === 1) return p; return Math.pow(2, -10 * p) * Math.sin((p * 10 - .75) * (2 * Math.PI / 3)) + 1; },
};
// progress of a window [start, start+dur] with easing
const pr = (t, start, dur, ease = E.out) => ease((t - start) / dur);
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// split an element's text into word spans once (keeps <br>)
function splitWords(el) {
  if (el.dataset.split) return $$(`#${el.id} .w`);
  const html = el.innerHTML.split(/(<br\s*\/?>)/i).map(chunk =>
    /<br/i.test(chunk) ? chunk : chunk.split(/(\s+)/).map(w => w.trim() ? `<span class="w">${w}</span>` : w).join("")
  ).join("");
  el.innerHTML = html; el.dataset.split = 1;
  return Array.from(el.querySelectorAll(".w"));
}
// words pop in one by one from `start`, `gap` seconds apart
function words(el, t, start, gap = .11, rise = 40) {
  const ws = splitWords(el);
  ws.forEach((w, i) => {
    const p = pr(t, start + i * gap, .28, E.back);
    w.style.opacity = clamp((t - start - i * gap) / .1);
    w.style.transform = `translateY(${(1 - p) * rise}px) scale(${.7 + .3 * p})`;
  });
}
function show(el, t, start, dur = .35, dy = 60, ease = E.out) {
  const p = pr(t, start, dur, ease);
  el.style.opacity = clamp((t - start) / (dur * .6));
  el.style.transform = `translateY(${(1 - p) * dy}px)`;
  return p;
}
function hide(el, t, start, dur = .25) {
  if (t >= start) el.style.opacity = 1 - clamp((t - start) / dur);
}
// visibility window helper: element visible only in [a, b)
function win(el, t, a, b) { el.style.display = (t >= a && t < b) ? "" : "none"; }
// number racing to a target
function count(el, t, start, dur, to, decimals = 0, suffix = "") {
  const p = pr(t, start, dur, E.out);
  el.textContent = (to * p).toFixed(p >= 1 ? decimals : decimals) + suffix;
  return p;
}
// drifting blobs
function drift(t) {
  $$(".blob").forEach((b, i) => {
    const s = 1 + i * .37;
    b.style.transform = `translate(${Math.sin(t * .5 * s + i) * 120}px, ${Math.cos(t * .4 * s + i * 2) * 140}px) scale(${1 + .08 * Math.sin(t * .7 + i)})`;
  });
}
// a white flash cut used between beats
function flash(el, t, beats) {
  let o = 0;
  [].concat(beats).forEach(at => { const d = t - at; if (at > 0 && d >= 0 && d < .16) o = (1 - d / .16) * .55; });
  el.style.opacity = o;
}
window.seek = t => { drift(t); window.scene(t); };
