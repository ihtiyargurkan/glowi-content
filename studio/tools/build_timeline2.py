# aligned.json (script text + whisper timing) -> src/timeline.json (caption lines, keywords, sentence = paragraph)
import json, sys
words = json.load(open(sys.argv[1]))
cfg = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
keys = set(cfg.get('keys', ['sun', 'UVB', 'burns', '80%', 'clouds', 'glass', 'deep', 'spring', 'snaps', 'repairs', '24%', 'sunscreen', 'Broad-spectrum', 'SPF 30+', 'Glowi', 'Fiber']))
keyfirst = set(cfg.get('keyfirst', ['uva', 'collagen', 'light']))
def to_punct(k):
    n = 0
    for w2 in words[k:]:
        n += 1
        if w2['text'][-1] in '.,?:!': return n
    return n
seen = set(); out = []; line = -1; cnt = 0
for k, w in enumerate(words):
    t = w['text']; bare = t.rstrip('.,?:!')
    key = bare in keys or (bare.lower() in keyfirst and bare.lower() not in seen)
    if bare.lower() in keyfirst: seen.add(bare.lower())
    if bare == 'sun' and k < len(words) - 15 and k > 5: key = key  # both 'sun' occurrences highlighted
    prev = words[k-1] if k else None
    newsent = not prev or prev['para'] != w['para']
    gap = w['start'] - prev['end'] if prev else 9
    if newsent or prev['text'][-1] in '.,?:' and not (cnt <= 1) or (cnt >= 4 and not to_punct(k) <= 2) or gap > 0.45:
        line += 1; cnt = 0
    out.append(dict(text=t, start=w['start'], end=w['end'], key=key, s=w['para'], line=line)); cnt += 1
n = max(w['s'] for w in out) + 1
sentences = [dict(start=min(w['start'] for w in out if w['s'] == i), end=max(w['end'] for w in out if w['s'] == i)) for i in range(n)]
json.dump(dict(words=out, sentences=sentences, voEnd=out[-1]['end']), open(sys.argv[2], 'w'), indent=1)
for i in range(line + 1): print(i, ' '.join(('[' + w['text'] + ']' if w['key'] else w['text']) for w in out if w['line'] == i))
