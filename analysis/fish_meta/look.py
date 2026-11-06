import json, sys, collections
import numpy as np
rows = [json.loads(l) for l in open(sys.argv[1])]
by = collections.defaultdict(list)
for r in rows: by[r['k']].append(r)
g = by['game']
print('games', len(g), 'win', sum(x['result']=='win' for x in g), 'avg rounds', np.mean([x['rounds'] for x in g]))
# priority values
P = by['prio']
vals = collections.Counter(p['v'] for p in P)
print('priority values (top):', vals.most_common(25))
# relation of priority with features
import itertools
for f in ['hpf','nE','dE','gems','gold','shards','dHome','cd0','cd1']:
    xs = np.array([p[f] if p[f] is not None else -1 for p in P], float); ys = np.array([p['v'] for p in P], float)
    if xs.std() > 0: print(f'  corr(prio,{f}) = {np.corrcoef(xs,ys)[0,1]:.3f}')
print('priority by type:', {t: round(float(np.mean([p['v'] for p in P if p['ty']==t])),2) for t in set(p['ty'] for p in P)})
R = by['recall']
print('\nrecalls/game', len(R)/len(g))
for f in ['hpf','gold','gems','nE','dE','dHome','shards']:
    a = np.array([r[f] for r in R], float); print(f'  recall {f}: mean {a.mean():.2f} q10 {np.quantile(a,.1):.2f} q50 {np.median(a):.2f} q90 {np.quantile(a,.9):.2f}')
T = by['tribute']
print('\ntributes/game', len(T)/len(g))
for f in ['gems','allyGems','dAltar','nE','hpf','r']:
    a = np.array([r[f] for r in T], float); print(f'  tribute {f}: mean {a.mean():.2f} q10 {np.quantile(a,.1):.2f} q50 {np.median(a):.2f} q90 {np.quantile(a,.9):.2f}')
W = by['ward']
print('\nwards/game', len(W)/len(g), 'ward dist from self', collections.Counter(w['wd'] for w in W).most_common(6), 'in bush', np.mean([w['bush'] for w in W]))
