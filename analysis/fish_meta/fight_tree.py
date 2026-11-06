import json, sys, collections
import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import GroupKFold, cross_val_score
rows = [json.loads(l) for l in open(sys.argv[1])]
F = [r for r in rows if r['eD'] <= 8]
print('turns with enemy within 8:', len(F), 'of', len(rows))
print('label dist (enemy<=8):', collections.Counter(r['label'] for r in F).most_common())
for d in [1,2,3,4,5,6,7,8]:
    S = [r for r in F if r['eD'] == d]
    c = collections.Counter(r['label'] for r in S); n = len(S)
    print(f' eD={d} n={n}: ' + ', '.join(f'{k} {v/n:.2f}' for k, v in c.most_common(6)))
# engage vs retreat
def cls(r):
    if r['hitChamp'] or r['label'] == 'move_toward': return 'engage'
    if r['label'] in ('move_away', 'recall'): return 'retreat'
    return 'other'
feats = ['hpf','ranged','shards','cd0','cd1','canAtk','canCast','nE3','nE5','nE8','ePow5','ePow8','nA3','nA6','aPow6','eD','eRanged','eHpf','eShards','eGems','eCh','minEHpf','gems','dHome','armedAwake5','r']
def vec(r):
    out = []
    for f in feats:
        v = r.get(f)
        out.append(-1 if v is None else float(v))
    return out
X = np.array([vec(r) for r in F]); y = np.array([cls(r) for r in F]); groups = np.array([r['g'] for r in F])
X = np.column_stack([X, (X[:, feats.index('aPow6')] / (X[:, feats.index('ePow8')] + 0.1))]); feats2 = feats + ['powRatio']
print('class balance', collections.Counter(y))
for depth in [3, 5, 8]:
    clf = DecisionTreeClassifier(max_depth=depth, min_samples_leaf=200)
    sc = cross_val_score(clf, X, y, cv=GroupKFold(5), groups=groups)
    print('depth', depth, 'cv acc', sc.mean().round(3))
clf = DecisionTreeClassifier(max_depth=4, min_samples_leaf=300).fit(X, y)
print(export_text(clf, feature_names=feats2, decimals=2))
imp = sorted(zip(clf.feature_importances_, feats2), reverse=True)[:10]
print('importance', [(f, round(v, 3)) for v, f in imp])
