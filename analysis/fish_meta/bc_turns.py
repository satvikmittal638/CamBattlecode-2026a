import json, sys, collections
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import GroupShuffleSplit
from sklearn.inspection import permutation_importance
BOSS = {'00contest', '01boss_battle', 'contest', 'stampede'}
rows = [json.loads(l) for l in open(sys.argv[1])]
rows = [r for r in rows if r['map'] not in BOSS]
def lab(r):
    l = r['label']
    if l in ('atk_champ', 'cast_champ'): return 'hit_champion'
    if l in ('atk_camp', 'cast_camp'): return 'hit_camp'
    if l.startswith('cast_self') or l in ('cast_ground', 'cast_ally', 'atk_other'): return 'other_cast'
    if l in ('move_toward', 'move_away', 'move_side', 'move', 'idle', 'recall', 'tribute'): return l
    return 'other'
TYPES = sorted(set(r['ty'] for r in rows))
feats = ['ranged', 'hp', 'hpf', 'mhp', 'str', 'foc', 'shards', 'gold', 'gems', 'cd0', 'cd1', 'canMove', 'canAtk', 'canCast', 'dHome', 'dEnemyHome', 'dAltar', 'nE3', 'nE5', 'nE8', 'ePow5', 'ePow8', 'nA3', 'nA6', 'aPow6', 'eD', 'eRanged', 'eHpf', 'eHp', 'eGems', 'eShards', 'eCh', 'minEHpf', 'cD', 'cHp', 'cAwake', 'armedAwake5', 'subDiff', 'r']
def vec(r): return [(-1 if r.get(f) is None else float(r[f])) for f in feats] + [TYPES.index(r['ty'])]
X = np.array([vec(r) for r in rows]); y = np.array([lab(r) for r in rows]); g = np.array([r['g'] for r in rows])
print('rows', len(rows), 'labels', collections.Counter(y).most_common())
tr, te = next(GroupShuffleSplit(1, test_size=0.2, random_state=0).split(X, y, g))
clf = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.1, max_leaf_nodes=63, categorical_features=[len(feats)]).fit(X[tr], y[tr])
acc = (clf.predict(X[te]) == y[te]).mean()
base = collections.Counter(y[te]).most_common(1)[0][1] / len(te)
print(f'held-out accuracy {acc:.3f} (majority baseline {base:.3f})')
from sklearn.metrics import classification_report
print(classification_report(y[te], clf.predict(X[te]), digits=2))
sub = np.random.RandomState(0).choice(te, size=min(15000, len(te)), replace=False)
pi = permutation_importance(clf, X[sub], y[sub], n_repeats=3, random_state=0)
names = feats + ['type']
print('permutation importance (top 15):', [(names[i], round(pi.importances_mean[i], 4)) for i in np.argsort(-pi.importances_mean)[:15]])
