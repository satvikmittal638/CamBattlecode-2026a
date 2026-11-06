import json, sys, collections
import numpy as np
from sklearn.tree import DecisionTreeRegressor, export_text
SLOTS = {'Ren': ['Cc','Dash'], 'Issac': ['AttackReset','Dash'], 'Varg': ['AttackReset','Shield'], 'Ryth': ['AoeDamage','AttackReset'], 'Stellar': ['Damage','AoeDamage'], 'Cassi': ['Damage','Cc'], 'Tavi': ['AttackReset','Cc'], 'Prism': ['Cc','AoeDamage'], 'Vendetta': ['AttackReset','Dash']}
BOSS = {'00contest', '01boss_battle', 'contest', 'stampede'}
rows = [json.loads(l) for l in open(sys.argv[1])]
P = [r for r in rows if r['k'] == 'prio']
def ready(r, kind):
    sl = SLOTS.get(r['ty'], [])
    return int(any(sl[i] == kind and r.get('cd%d' % i) == 0 for i in range(len(sl))))
for r in P:
    r['ccR'] = ready(r, 'Cc'); r['dmgR'] = int(ready(r, 'Damage') or ready(r, 'AoeDamage')); r['typeIdx'] = sorted(SLOTS).index(r['ty']) if r['ty'] in SLOTS else -1
    r['ranged'] = int(r['ty'] in ('Stellar', 'Cassi', 'Prism', 'Tavi'))
feats = ['hpf', 'hp', 'gold', 'gems', 'shards', 'dHome', 'dAltar', 'dE', 'nE', 'nE4', 'nA', 'pow', 'ePow', 'ccR', 'dmgR', 'ranged', 'typeIdx', 'r']
X = np.array([[(-1 if r[f] is None else r[f]) for f in feats] for r in P], float); y = np.array([r['v'] for r in P], float)
for d in [3, 5, 8, 12, 16]:
    m = DecisionTreeRegressor(max_depth=d, min_samples_leaf=50).fit(X, y)
    print('depth', d, 'R2', round(m.score(X, y), 3))
m = DecisionTreeRegressor(max_depth=16, min_samples_leaf=50).fit(X, y)
print('importances', sorted([(round(v, 3), f) for v, f in zip(m.feature_importances_, feats)], reverse=True)[:10])
# hypothesis: v depends on dE strongly; inspect mean v by dE x hp bucket
print('\nmean priority by enemy distance (rows) and hp fraction (cols)')
hb = [0, .3, .5, .7, .9, 1.01]
print('       ' + ''.join(f'{h:>8}' for h in hb[:-1]))
for d in [1, 2, 3, 4, 5, 6, 7, 8, 99]:
    line = f'dE={d:<3}'
    for i in range(len(hb) - 1):
        S = [r['v'] for r in P if r['dE'] == d and hb[i] <= r['hpf'] < hb[i+1]]
        line += f'{(np.mean(S) if len(S) > 30 else float("nan")):8.2f}'
    print(line)
print('\nno enemy visible: mean priority by gems carried')
for g0, g1 in [(0, 1), (1, 20), (20, 50), (50, 100), (100, 1000)]:
    S = [r['v'] for r in P if r['dE'] == 99 and g0 <= r['gems'] < g1]
    print(f'  gems {g0}-{g1}: n={len(S)} mean {np.mean(S):.2f}  dist {collections.Counter(S).most_common(5)}')
