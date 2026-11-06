import json, sys, collections
import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
BOSS = {'00contest', '01boss_battle', 'contest', 'stampede'}
R = [json.loads(l) for l in open(sys.argv[1])]
R = [r for r in R if r['map'] not in BOSS]
print('free moments', len(R), collections.Counter(r['why'] for r in R))
for why in ['capture', 'home', 'respawn', 'tribute']:
    S = [r for r in R if r['why'] == why]
    c = collections.Counter(r['next'] for r in S)
    print(f'  after {why:8s} n={len(S):5d}: ' + ', '.join(f'{k} {v/len(S):.2f}' for k, v in c.most_common()))
C = [r for r in R if r['why'] == 'capture' and r['next'] in ('tribute', 'camp')]
print('\nafter capture: P(tribute next) by gems carried x altar distance')
gb = [0, 20, 40, 60, 90, 130, 10000]; db = [0, 5, 10, 15, 25, 100]
print('          ' + ''.join(f'{"d"+str(d):>8s}' for d in db[:-1]))
for i in range(len(gb) - 1):
    line = f'{gb[i]:>4}-{gb[i+1]:<5}'
    for j in range(len(db) - 1):
        S = [r for r in C if gb[i] <= r['gems'] < gb[i+1] and db[j] <= r['dAltar'] < db[j+1]]
        line += f'{(np.mean([r["next"]=="tribute" for r in S]) if len(S) >= 30 else float("nan")):8.2f}'
    print(line)
feats = ['gems', 'gold', 'hpf', 'dAltar', 'dHome', 'dCampVis', 'nE', 'allyGems', 'subDiff', 'r']
X = np.array([[float(r[f]) for f in feats] for r in C]); y = np.array([r['next'] == 'tribute' for r in C])
t = DecisionTreeClassifier(max_depth=3, min_samples_leaf=100).fit(X, y)
print(f'\ntree (accuracy {t.score(X, y):.3f}, base {max(y.mean(), 1-y.mean()):.3f})'); print(export_text(t, feature_names=feats, show_weights=True))
