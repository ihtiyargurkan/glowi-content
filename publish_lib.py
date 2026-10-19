"""Publish one queued Glowi post to Instagram from the Composio remote workbench.

Inside a workbench cell (where run_composio_tool and upload_local_file are preloaded):

    import subprocess, sys
    subprocess.run("rm -rf /home/user/glowi-content && git clone -q --depth 1 "
                   "https://github.com/ihtiyargurkan/glowi-content /home/user/glowi-content", shell=True, check=True)
    sys.path.insert(0, "/home/user/glowi-content"); import publish_lib as pl
    print(pl.publish(pl.today_post_id(), run_composio_tool, upload_local_file))

Only posts whose status is "approved" are published. Reels with a vo.json get their voiceover
generated (Kokoro) and mixed first. The returned dict says what to write back to queue.json.
"""
import datetime, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
IST = datetime.timezone(datetime.timedelta(hours=3))


def queue():
    return json.load(open(os.path.join(ROOT, "queue.json")))


def today_post_id(day=None):
    day = day or datetime.datetime.now(IST).date().isoformat()
    for p in queue()["posts"]:
        if p["date"] == day and p.get("status") == "approved":
            return p["id"]
    return None


def _sh(cmd):
    subprocess.run(cmd, shell=True, check=True, cwd=ROOT)


def prepare(post):
    d = os.path.join(ROOT, "content", post["id"])
    if post["type"] == "reel":
        if os.path.exists(os.path.join(d, "vo.json")):
            _sh(f"{sys.executable} -c 'import kokoro_onnx' 2>/dev/null || pip install -q kokoro-onnx soundfile")
            _sh(f"{sys.executable} lib/vo.py {d} && {sys.executable} lib/vo_mix.py {d}")
            return [os.path.join(d, "final.mp4")]
        return [os.path.join(d, "reel.mp4")]
    return [os.path.join(d, f) for f in sorted(os.listdir(d)) if f.startswith("slide-") and f.endswith(".jpg")]


def _file_ref(upload_local_file, path, mimetype):
    r, e = upload_local_file(path)
    if e: raise RuntimeError(f"upload {path}: {e}")
    data = r.get("data", r)
    return {"name": os.path.basename(path), "mimetype": mimetype, "s3key": data["s3key"]}


def _call(run, slug, args):
    r, e = run(slug, args)
    if e: raise RuntimeError(f"{slug}: {e}")
    data = r.get("data", r)
    return data.get("data", data) if isinstance(data, dict) and "data" in data and isinstance(data["data"], dict) else data


def publish(post_id, run, upload_local_file, dry_run=False):
    if not post_id:
        return {"skipped": "no approved post for today"}
    post = next(p for p in queue()["posts"] if p["id"] == post_id)
    if post.get("status") != "approved":
        return {"skipped": f"{post_id} status is {post.get('status')}"}
    files = prepare(post)
    if dry_run:
        return {"dry_run": True, "files": files}
    if post["type"] == "reel":
        ref = _file_ref(upload_local_file, files[0], "video/mp4")
        c = _call(run, "INSTAGRAM_POST_IG_USER_MEDIA", {"ig_user_id": "me", "media_type": "REELS", "share_to_feed": True,
                  "video_file": ref, "caption": post["caption"], "thumb_offset": int(post.get("cover_ms", 1800))})
    else:
        refs = [_file_ref(upload_local_file, f, "image/jpeg") for f in files]
        c = _call(run, "INSTAGRAM_CREATE_CAROUSEL_CONTAINER", {"ig_user_id": "me", "caption": post["caption"],
                  "child_image_files": refs})
    creation_id = c.get("id")
    pub = _call(run, "INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH", {"ig_user_id": "me", "creation_id": creation_id,
                "max_wait_seconds": 240, "poll_interval_seconds": 5})
    media_id = pub.get("id")
    info = _call(run, "INSTAGRAM_GET_IG_MEDIA", {"ig_media_id": media_id, "fields": "id,permalink,timestamp"})
    if post.get("first_comment"):
        try:
            _call(run, "INSTAGRAM_POST_IG_MEDIA_COMMENTS", {"ig_media_id": media_id, "message": post["first_comment"]})
        except Exception as ex:
            info["comment_error"] = str(ex)
    return {"published": post_id, "media_id": media_id, "permalink": info.get("permalink"),
            "timestamp": info.get("timestamp"), "comment_error": info.get("comment_error")}
