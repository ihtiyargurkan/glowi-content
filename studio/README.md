# Glowi studio — AI Video Editor reels

Since 2026-11-03 every daily Glowi post is a ~45–55 s English explainer reel made with this studio
(Remotion + Kokoro). Style rules: `STYLE_GUIDE.md`. Five finished examples: `examples/` (uva, water, sleep,
oily, sugar — read at least two `scenes.tsx` files before writing a new one).

Structure of every video: hook question → bust the common belief → mechanism as physical metaphors
(2–3 scenes) → one real number from a cited study → simple fix → loop back to the opening image → Glowi end card.
Captions, the Glowi watermark (top right) and the end card come from `src/Main.tsx` / `src/Captions.tsx`;
you only write the scenes.

## Make one video (works in the cloud container; no Mac, no Whisper)

```bash
W=/tmp/reel-<id> && rm -rf $W && cp -r studio $W && cd $W
npm install --silent
pip install -q --break-system-packages kokoro-onnx soundfile numpy    # first time only
# 1. scripts (same paragraphs + same sentence count in both files)
#    tools/script_display.txt : what captions show (UVA, SPF 30+, 80%, Glowi)
#    tools/script_tts.txt     : what Kokoro reads (U-V-A, S-P-F thirty, eighty percent, "Glowee")
#    tools/keys.json          : {"keys": [...words to highlight...], "keyfirst": [...highlight first time only...]}
#    tools/bed.json           : {"brightSentence": n, "boundSentences": [...scene-change paragraphs...], "chimes": ["<number word>"], "ticks": []}
# 2. voiceover + word timing (each sentence synthesised separately → guaranteed pauses)
python3 tools/tts_cloud.py tools/script_tts.txt tools/script_display.txt tools/vo_raw.wav tools/aligned.json
python3 tools/hook_boost.py tools/vo_raw.wav tools/aligned.json 1.0 6.0 1.0   # Gurkan (2026-11-09): hook line louder (+6 dB), brighter (+1 st); NOT faster (normal speed)
python3 tools/build_timeline2.py tools/aligned.json src/timeline.json tools/keys.json   # prints caption lines
ffmpeg -loglevel error -y -i tools/vo_raw.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 public/vo.wav
python3 tools/make_bed.py                       # ambient bed + transition sfx + chimes → public/bed.wav
# 3. write src/scenes.tsx (export SCENES and bounds, see the bottom of the current file), then
npx tsc -p .
COMP=GlowiReel node tools/stills.mjs 30 120 300 ...     # half-res stills into out/stills/
python3 tools/sheet.py out/sheet.jpg 30 120 300 ...     # contact sheet — LOOK at it, fix overlaps/empty frames
# 4. render + master
CHROME=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux*/chrome 2>/dev/null | head -1)
npx remotion render GlowiReel out/raw.mp4 --browser-executable=$CHROME --concurrency=2 --crf=18 --log=error
ffmpeg -loglevel error -y -i out/raw.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.0:LRA=11" -ar 48000 -c:a aac -b:a 192k -movflags +faststart out/reel.mp4
```
`tools/stills.mjs` finds Chrome under /opt/pw-browsers (or uses $CHROME). Full render of ~50 s takes ~8–12 min on 2 cores — run it in the background.

Then copy `out/reel.mp4` → `content/<id>/reel.mp4`, extract `cover.jpg` at `cover_ms`, and keep the sources in
`content/<id>/source/` (scenes.tsx, script_display.txt, script_tts.txt, keys.json, bed.json, timeline.json).
Never commit node_modules, out/ or wav files.

## Realistic skin (Gurkan, 2026-11-09)
Whenever the skin itself is shown, use `src/realskin.tsx` instead of flat blocks: `SkinSection` (cellular cross-section with
rete ridges, capillary loops, collagen, vessel with red blood cells, optional follicles + oil glands, melanocytes/melanin),
`SkinMacro` (textured close-up of the surface: mottling, pores, fine lines, blotchy redness, irregular spots) and
`RealPlane` (perspective skin floor with micro-relief instead of the tile grid of `SkinPlane`). Save realskin.tsx in
`content/<id>/source/` with scenes.tsx.

## Scene-transition sound (Gurkan, 2026-11-11)
Every scene change uses `public/sfx/transition.mp3` (cinematic flashback transition), not a synthesized whoosh.
`tools/make_bed.py` places its loudest moment on the zoom-through midpoint (scene bound − 0.18 s), about 2 dB
under the voice (`transitionGain` 0.24 in bed.json overrides). Use it in every new video.

## Gotchas learned the hard way
- Never let two sentences run together (Gurkan noticed "UV. UVB" glued). tts_cloud.py synthesises each sentence alone.
- Abbreviations are hyphenated for TTS; the brand is spelled "Glowee" for TTS, "Glowi" on screen.
- Big numbers: write them out in script_tts.txt ("six hundred"), digits in script_display.txt.
- Every cue('word') used in scenes.tsx must exist in script_display.txt (punctuation is ignored, case-insensitive).
- Keep text off the top 230–420 px band while captions are on screen; keep key visuals in the middle 60% (Instagram UI covers the bottom ~300 px and the right edge).
- A scene that starts empty for >1 s looks broken: start drawing at the sentence start, not at a later word.
- Charts drawn from study results must say "illustrative" unless the numbers are the study's real data.
