"""Turns that the recording shows idle inside runs of >= 20 rounds (same champion): what the shadowed bot would do,
by stage tag and enemies in view.   python3 idle_runs.py <shadow dir> [examples-per-key]"""
import json, re, glob, collections, sys
d = sys.argv[1]; nex = int(sys.argv[2]) if len(sys.argv) > 2 else 3
st = collections.Counter(); ex = collections.defaultdict(list); tot = act = 0
for f in glob.glob(f'{d}/*.jsonl'):
    rows = [json.loads(l) for l in open(f)]
    by = collections.defaultdict(list)
    for t in rows: by[t['id']].append(t)
    for cid, ts in by.items():
        run = []
        for t in ts + [None]:
            if t is not None and t['alive'] and not [a for a in t['rep'] if not a.startswith('prio')]: run.append(t); continue
            if len(run) >= 20:
                for u in run:
                    tot += 1
                    acts = [a for a in u['bot'] if not a.startswith('prio')]
                    s = re.findall(r'decision \d+ \d+ (\S+)', u.get('log', '')); s = s[-1] if s else '?'
                    m = re.search(r'remaining (\d+)', u.get('log', ''))
                    ne = len(u['ctx']['enemies']); key = ('ACT ' if acts else 'idle ') + s + (' e3+' if ne >= 3 else f' e{ne}')
                    act += bool(acts); st[key] += 1
                    ex[key].append((f.split('/')[-1][:24], u['r'], u['type'], u['pos'], int(m.group(1)) if m else None, acts[:2], [e[:4] for e in u['ctx']['enemies']][:4]))
            run = []
print(f'{d}: recorded idle-run turns {tot}, would act {act}')
for k, n in st.most_common(14): print(f'  {n:5d} {k}')
for k, v in sorted(ex.items(), key=lambda kv: -len(kv[1]))[:6]:
    print('==', k); [print('    ', x) for x in v[:: max(1, len(v) // nex)][:nex]]
