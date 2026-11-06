import json, sys, collections
import numpy as np
BOSS = {'00contest', '01boss_battle', 'contest', 'stampede'}
rows = [json.loads(l) for l in open(sys.argv[1])]
T = [r for r in rows if r['k'] == 'tgt' and r['map'] not in BOSS]
print('target decisions with >=2 candidates:', len(T), 'by how', collections.Counter(r['how'] for r in T))
# simple rule accuracies
def acc(rule):
    return np.mean([max(range(len(r['cands'])), key=lambda i: rule(r['cands'][i], r)) == r['chosen'] for r in T])
rules = {
  'nearest': lambda c, r: -c['d'],
  'lowest hp': lambda c, r: -c['hp'],
  'lowest hp frac': lambda c, r: -c['hpf'],
  'most gems': lambda c, r: c['gems'],
  'already hit by us': lambda c, r: c['hitRecently'],
  'stunned': lambda c, r: c['stunned'],
  'lowest shards': lambda c, r: -c['shards'],
  'ranged': lambda c, r: c['ranged'],
  'least enemy support': lambda c, r: -c['eSup'],
}
for k, f in rules.items(): print(f'  {k:22s} {acc(f):.3f}')
print('  random', round(np.mean([1 / len(r['cands']) for r in T]), 3))
# conditional logit
feats = ['d', 'hp', 'hpf', 'gems', 'hitRecently', 'stunned', 'shards', 'ranged', 'eSup', 'recalling', 'tributing', 'bush', 'ePow']
import math
def fx(c): return [c['d'], c['hp'] / 1000, c['hpf'], math.log1p(c['gems']), c['hitRecently'], c['stunned'], c['shards'] / 10, c['ranged'], c['eSup'], c['recalling'], c['tributing'], c['bush'], c['ePow'] / 100]
data = [(np.array([fx(c) for c in r['cands']]), r['chosen'], r['g']) for r in T]
gs = sorted(set(d[2] for d in data)); test_g = set(gs[::5])
tr = [d for d in data if d[2] not in test_g]; te = [d for d in data if d[2] in test_g]
w = np.zeros(len(feats)); m = np.zeros_like(w); v = np.zeros_like(w)
for it in range(1, 801):
    g = np.zeros_like(w)
    for X, y, _ in tr:
        u = X @ w; p = np.exp(u - u.max()); p /= p.sum(); g += X[y] - p @ X
    g = g / len(tr) - 0.001 * w
    m = 0.9 * m + 0.1 * g; v = 0.999 * v + 0.001 * g * g
    w += 0.05 * (m / (1 - 0.9 ** it)) / (np.sqrt(v / (1 - 0.999 ** it)) + 1e-8)
ac = np.mean([np.argmax(X @ w) == y for X, y, _ in te])
print(f'\nconditional logit held-out acc {ac:.3f}')
for f, wk in zip(feats, w): print(f'  {f:12s} {wk:+.3f}')
