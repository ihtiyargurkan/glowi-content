"""Publish one queued Glowi post to Instagram from the Composio workbench.

Runs inside the Composio remote workbench, where `run_composio_tool` and `upload_local_file`
are preloaded. Usage in a cell:

    import sys; sys.path.insert(0, "/mnt/files/glowi-studio")
    import publish_lib as pl
    out = pl.publish(post_id, run_composio_tool, upload_local_file, dry_run=False)

Only posts with status "approved" are published. Renders first if the media is missing.
"""
import json, os, subprocess, sys, time

ROOT = "/mnt/files/glowi-studio"
QUEUE = os.path.join(ROOT, "queue.json")


def load():
    return json.load(open(QUEUE))


def save(q):
    json.dump(q, open(QUEUE, "w"), indent=2, ensure_ascii=False)


def render(post):
    d = os.path.join(ROOT, "content", post["id"])
    if post["type"] == "reel":
        if not os.path.exists(os.path.join(d, "reel.mp4")):
            subprocess.run([sys.executable, os.path.join(ROOT, "render.py"), "reel", os.path.join(d, "reel.html"),
                            "--seed", str(post.get("seed", 1))], check=True, cwd=ROOT)
        return [os.path.join(d, "reel.mp4"), os.path.join(d, "cover.jpg")]
    slides = sorted(f for f in os.listdir(d) if f.startswith("slide-") and f.endswith(".jpg")) if os.path.isdir(d) else []
    if not slides:
        subprocess.run([sys.executable, os.path.join(ROOT, "carousel.py"), os.path.join(d, "carousel.json")], check=True, cwd=ROOT)
        slides = sorted(f for f in os.listdir(d) if f.startswith("slide-") and f.endswith(".jpg"))
    return [os.path.join(d, f) for f in slides]


def _upload(upload_local_file, path):
    r, e = upload_local_file(path)
    if e:
        raise RuntimeError(f"upload failed {path}: {e}")
    data = r.get("data", r) if isinstance(r, dict) else r
    url = data.get("s3_url") or data.get("url")
    if not url:
        raise RuntimeError(f"no url for {path}: {r}")
    return url


def _call(run, slug, args):
    r, e = run(slug, args)
    if e:
        raise RuntimeError(f"{slug}: {e}")
    if isinstance(r, dict) and r.get("successful") is False:
        raise RuntimeError(f"{slug}: {r.get('error')}")
    return r.get("data", r)


def publish(post_id, run, upload_local_file, dry_run=True, ig_user_id="me"):
    q = load()
    post = next(p for p in q["posts"] if p["id"] == post_id)
    if post.get("status") == "published":
        return {"skipped": "already published", "permalink": post.get("permalink")}
    if post.get("status") != "approved" and not dry_run:
        return {"skipped": f"status is {post.get('status')}, needs approved"}
    files = render(post)
    urls = [_upload(upload_local_file, f) for f in files]
    if dry_run:
        return {"dry_run": True, "files": files, "urls": urls}
    if post["type"] == "reel":
        c = _call(run, "INSTAGRAM_POST_IG_USER_MEDIA", {"ig_user_id": ig_user_id, "media_type": "REELS",
                  "video_url": urls[0], "cover_url": urls[1], "caption": post["caption"], "share_to_feed": True})
    else:
        c = _call(run, "INSTAGRAM_CREATE_CAROUSEL_CONTAINER", {"ig_user_id": ig_user_id, "caption": post["caption"],
                  "child_image_urls": urls})
    creation_id = c.get("id") or c.get("creation_id")
    pub = _call(run, "INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH", {"ig_user_id": ig_user_id, "creation_id": creation_id,
                "max_wait_seconds": 180, "poll_interval_seconds": 5})
    media_id = pub.get("id")
    info = {}
    try:
        info = _call(run, "INSTAGRAM_GET_IG_MEDIA", {"ig_media_id": media_id, "fields": "id,permalink,timestamp"})
    except Exception as ex:  # permalink is a nice-to-have
        info = {"error": str(ex)}
    if post.get("first_comment"):
        try:
            _call(run, "INSTAGRAM_POST_IG_MEDIA_COMMENTS", {"ig_media_id": media_id, "message": post["first_comment"]})
        except Exception as ex:
            info["comment_error"] = str(ex)
    post.update(status="published", media_id=media_id, permalink=info.get("permalink"),
                published_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    save(q)
    return {"published": post_id, "media_id": media_id, "permalink": post.get("permalink"), "info": info}
