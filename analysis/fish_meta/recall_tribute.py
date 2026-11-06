import json, sys, collections
import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import GroupKFold
from sklearn.metrics import roc_auc_score
BOSS = {'00contest', '01boss_battle', 'contest', 'stampede'}
rows = [json.loads(l) for l in open(sys.argv[1])]
rows = [r for r in rows if r['map'] not in BOSS]
def fit(name, R, feats, lab, depth=4, leaf=200):
    X = np.array([[(-1 if r.get(f) is None else float(r[f])) for f in feats] for r in R]); y = np.array([1 if lab(r) else 0 for r in R]); g = np.array([r['g'] for r in R])
    aucs = []
    for tr, te in GroupKFold(5).split(X, y, g):
        c = DecisionTreeClassifier(max_depth=6, min_samples_leaf=leaf, class_weight='balanced').fit(X[tr], y[tr]); aucs.append(roc_auc_score(y[te], c.predict_proba(X[te])[:, 1]))
    c = DecisionTreeClassifier(max_depth=depth, min_samples_leaf=leaf).fit(X, y)
    print(f'\n===== {name}: n={len(R)} positive rate {y.mean():.4f}  CV AUC(depth6) {np.mean(aucs):.3f}')
    # print tree with leaf probabilities
    print(export_text(c, feature_names=feats, decimals=2, show_weights=True))
    return c
calm = [r for r in rows if r['nE5'] == 0]
fit('RECALL (no enemy within 5)', calm, ['hpf', 'hp', 'gold', 'gems', 'shards', 'dHome', 'dAltar', 'nE8', 'r', 'cD', 'armedAwake5', 'subDiff'], lambda r: r['label'] == 'recall', depth=4, leaf=300)
near_altar = [r for r in rows if r['dAltar'] <= 2]
fit('TRIBUTE (within 2 of an altar)', near_altar, ['gems', 'hpf', 'nE5', 'nE8', 'dHome', 'gold', 'r', 'subDiff', 'cD'], lambda r: r['label'] == 'tribute', depth=4, leaf=100)
# rates by bins
def table(R, fx, fy, binsx, binsy, lab):
    print(f'\n{lab}: rate by {fx} (rows) x {fy} (cols)')
    print('            ' + ''.join(f'{str(b):>9s}' for b in binsy[:-1]))
    for i in range(len(binsx) - 1):
        line = f'{binsx[i]:>5}-{binsx[i+1]:<5} '
        for j in range(len(binsy) - 1):
            S = [r for r in R if binsx[i] <= r[fx] < binsx[i+1] and binsy[j] <= r[fy] < binsy[j+1]]
            line += f'{(np.mean([r["label"]=="recall" for r in S]) if len(S) > 50 else float("nan")):9.3f}'
        print(line)
table(calm, 'hpf', 'gold', [0, .2, .3, .4, .5, .6, .8, 1.01], [0, 60, 120, 180, 240, 330, 10000], 'recall rate')
