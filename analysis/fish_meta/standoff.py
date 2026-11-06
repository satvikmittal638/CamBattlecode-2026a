import json, sys, collections
import numpy as np
rows = [json.loads(l) for l in open(sys.argv[1])]
F = [r for r in rows if r['eD'] <= 8]
# where do idle turns at eD 5-7 happen?
I = [r for r in F if r['label'] == 'idle' and 5 <= r['eD'] <= 7]
print('idle at eD 5-7:', len(I))
print(' dHome', np.percentile([r['dHome'] for r in I], [10, 50, 90]), ' dEnemyHome', np.percentile([r['dEnemyHome'] for r in I], [10, 50, 90]))
print(' canMove', np.mean([r['canMove'] for r in I]), ' canAtk', np.mean([r['canAtk'] for r in I]), ' hpf', np.median([r['hpf'] for r in I]))
print(' by type', collections.Counter(r['ty'] for r in I).most_common())
print(' nearest enemy type', collections.Counter(r['eTy'] for r in I).most_common())
print(' enemy channel', collections.Counter(r['eCh'] for r in I).most_common(5))
print(' map', collections.Counter(r['map'] for r in I).most_common(8))
print(' cD (nearest camp)', np.percentile([r['cD'] for r in I], [10, 50, 90]))
# is the enemy in its own spawn? approximate: enemy near its home if our dEnemyHome small
# 'idle' may be: canMove=0 (already moved/stunned) ...
# compare: per map share of eD<=8 turns
for m, c in collections.Counter(r['map'] for r in F).most_common(25):
    S = [r for r in F if r['map'] == m]
    print(f'  {m:24s} enemy<=8 turns {c:6d}  idle {np.mean([r["label"]=="idle" for r in S]):.2f}  hitChamp {np.mean([r["hitChamp"] for r in S]):.2f}  away {np.mean([r["label"]=="move_away" for r in S]):.2f}')
