# Glowi content

Instagram content system for [@glowi.ai.app](https://www.instagram.com/glowi.ai.app/) — the Glowi iOS app ([App Store](https://apps.apple.com/app/id6781812145)).

- `content/<date>-<slug>/` — one post: `reel.html` (animated source) or `carousel.json`, plus the rendered `reel.mp4`/`cover.jpg` or `slide-NN.jpg` that gets published.
- `queue.json` — the schedule, captions and status (`draft` → `approved` → `published`). Only `approved` posts are published.
- `render.py`, `carousel.py`, `lib/` — the studio (Playwright + ffmpeg). `lib/music.py` synthesizes original background audio.
- `publish_lib.py` — publishes an approved post through the Composio Instagram connector.

Render locally: `pip install playwright numpy pillow && python -m playwright install chromium`, then
`python render.py reel content/<post>/reel.html --seed N` or `python carousel.py content/<post>/carousel.json`.
