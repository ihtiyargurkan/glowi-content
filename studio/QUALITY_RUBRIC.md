# Glowi reel quality gate

Gurkan's rule: **no compromise on quality.** A reel only goes into queue.json (even as a draft) if it passes
this gate. Fewer videos is fine; a weak video is not. The bar is the five hand-made reels in `studio/examples/`
(`reference_sheet.jpg` = one frame every 1.5 s of each finished video).

## How the gate runs
1. Render half-res stills every 1.5 s (`tools/stills.mjs`) and the first 3 s every 0.5 s (the hook), then
   `tools/sheet.py` contact sheets.
2. A **separate reviewer agent** (not the agent that built the video) gets: the new contact sheets, two
   `reference_sheet.jpg` files, the display script, the sources list and this rubric. It scores every criterion
   1–5 and lists concrete fixes with timestamps. It must be strict: 5 = as good as the references.
3. Pass = **every criterion ≥ 4** and no hard fail. Otherwise fix and re-review (max 3 rounds). Still failing →
   drop the video, do not commit it, and say why in the report.

## Criteria (1–5)
1. **Hook (0–2 s):** frame 0 already shows a strong, topic-specific image with motion; the question lands in the captions by ~1.5 s; it is about the viewer's own skin.
2. **Visual richness:** every frame has a designed scene (depth, glow/bokeh, layered elements) like the references; no flat or empty frames, no frame that is only text on a plain background, no scene that sits empty for >1 s.
3. **Metaphor clarity:** each mechanism is shown as a physical metaphor a viewer understands on mute (springs, bricks and mortar, beams, glands…), and the visual changes exactly when the voice says the key word.
4. **Continuity and motion:** constant gentle camera motion; zoom-through transitions; the last scene loops back to the opening image before the end card.
5. **Legibility and layout:** nothing overlaps the caption band (y 230–420 px) or the watermark (top right); on-screen labels are short, in Poppins, readable at phone size; key visuals sit in the middle 60% of the frame.
6. **Brand consistency:** Glowi palette (plum/blush, gold light, one accent colour), Glowi watermark visible until the end card, the standard end card (logo, scan ring, "Know your skin, every day.", "AI SKIN SCAN · DAILY ROUTINE").
7. **Accuracy and honesty:** every number on screen and in the caption comes from a source opened during this run, cited (author + year) on screen; charts not drawn from real data say "illustrative"; no cure/treat/diagnose wording; myths are corrected honestly even when the popular answer is more exciting.
8. **Audio:** voice clearly audible over the bed, pauses between all sentences, no clipped or distorted sound, master at about -14 LUFS, true peak under -1 dBTP; on-screen numbers match what the voice says.

## Hard fails (any one = not publishable)
Caption/visual overlap · empty or broken frame · wrong or uncited number · misspelled brand · missing end card or watermark · two sentences run together · video shorter than 40 s or longer than 60 s.
