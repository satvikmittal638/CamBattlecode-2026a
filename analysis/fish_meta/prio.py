import json, sys, collections
import numpy as np
from sklearn.tree import DecisionTreeRegressor, export_text
rows = [json.loads(l) for l in open(sys.argv[1])]
P = [r for r in rows if r['k'] == 'prio']
feats = ['hpf','hp','gold','gems','shards','dHome','dAltar','dE','nE','nE4','nA','pow','ePow','cd0','cd1','r']
X = np.array([[(-1 if r[f] is None else r[f]) for f in feats] for r in P], float); y = np.array([r['v'] for r in P], float)
for d in [2, 4, 6, 10]:
    m = DecisionTreeRegressor(max_depth=d, min_samples_leaf=100).fit(X, y)
    print('depth', d, 'R2', round(m.score(X, y), 3))
m = DecisionTreeRegressor(max_depth=4, min_samples_leaf=200).fit(X, y)
print(export_text(m, feature_names=feats, decimals=2))
# priority vs distance to nearest enemy, vs nE
for d in [1, 2, 3, 4, 5, 6, 8, 10, 15, 99]:
    S = [r['v'] for r in P if r['dE'] == d]
    if S: print(f'dE={d:3d} n={len(S):5d} mean prio {np.mean(S):6.2f}  median {np.median(S)}')
