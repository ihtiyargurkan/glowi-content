# flag sentence boundaries where the voice doesn't breathe
import json, sys
d = json.load(open(sys.argv[1])); MIN = float(sys.argv[2]) if len(sys.argv) > 2 else 0.22
ws = [w for s in d['segments'] for w in s['words']]
bad = 0
for a, b in zip(ws, ws[1:]):
    gap = b['start'] - a['end']
    if a['word'].strip()[-1:] in '.?!' or (a['word'].strip()[-1:] == ',' and gap < 0.08):
        flag = gap < MIN if a['word'].strip()[-1:] in '.?!' else True
        if flag:
            bad += 1; print(f"SHORT {gap:.2f}s : ...{a['word'].strip()} | {b['word'].strip()}... @ {a['end']:.2f}")
print('issues:', bad)
