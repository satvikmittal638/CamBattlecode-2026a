import json, sys, collections
import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupKFold, cross_val_score
BOSS = {'00contest', '01boss_battle', 'contest', 'stampede'}
rows = [json.loads(l) for l in open(sys.argv[1])]
E = [r for r in rows if r['k'] == 'eng' and r['map'] not in BOSS]
print('quiet turns w/ enemy<=7 (non-boss):', len(E), 'open rate', round(np.mean([r['open'] for r in E]), 3))
for d in range(1, 8):
    S = [r for r in E if r['e_d'] == d]
    if S: print(f'  dist {d}: n={len(S):5d} open {np.mean([r["open"] for r in S]):.3f} approach {np.mean([r["approach"] for r in S]):.3f} retreat {np.mean([r["retreat"] for r in S]):.3f}')
feats = ['hpf','shards','gems','ccReady','dmgReady','aoeReady','dashReady','myPow','alPow6','nA6','enPow8','nE8','alCcReady','dHome','subDiff','e_d','e_ranged','e_hpf','e_hp','e_shards','e_gems','e_stunned','e_recalling','e_tributing','e_eSup','e_eSupPow','e_ourNear','e_ourNearPow','e_eHome','e_bush','e_ePow']
X = np.array([[(-1 if r.get(f) is None else float(r[f])) for f in feats] for r in E]); grp = np.array([r['g'] for r in E])
X = np.column_stack([X, (X[:, feats.index('myPow')] + X[:, feats.index('alPow6')]) / (X[:, feats.index('enPow8')] + 0.1)]); F2 = feats + ['powRatio']
for lab in ['open', 'approach', 'retreat']:
    y = np.array([r[lab] for r in E])
    for depth in [3, 6]:
        clf = DecisionTreeClassifier(max_depth=depth, min_samples_leaf=100, class_weight='balanced')
        from sklearn.metrics import roc_auc_score
        aucs = []
        for tr, te in GroupKFold(5).split(X, y, grp):
            clf.fit(X[tr], y[tr]); aucs.append(roc_auc_score(y[te], clf.predict_proba(X[te])[:, 1]))
        print(f'{lab} depth {depth}: CV AUC {np.mean(aucs):.3f}')
    clf = DecisionTreeClassifier(max_depth=4, min_samples_leaf=150, class_weight='balanced').fit(X, y)
    print(f'--- tree for {lab} (positive rate {y.mean():.3f}) ---')
    print(export_text(clf, feature_names=F2, decimals=2, show_weights=False))
    imp = sorted(zip(clf.feature_importances_, F2), reverse=True)[:8]
    print('importance', [(f, round(v, 3)) for v, f in imp])
