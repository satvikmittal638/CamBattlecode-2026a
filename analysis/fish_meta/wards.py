import json, sys, collections
import numpy as np
BOSS = {'00contest', '01boss_battle', 'contest', 'stampede'}
rows = [json.loads(l) for l in open(sys.argv[1])]
G = [r for r in rows if r['k'] == 'game' and r['map'] not in BOSS]
W = [r for r in rows if r['k'] == 'ward']
print('wards per game (all maps)', round(len(W) / len([r for r in rows if r['k'] == 'game']), 1))
print('by champion type per game:', {k: round(v / len([r for r in rows if r['k'] == 'game']), 1) for k, v in collections.Counter(w['ty'] for w in W).most_common()})
print('distance from self:', collections.Counter(w['wd'] for w in W).most_common(8))
print('in bush share', round(np.mean([w['bush'] for w in W]), 3))
print('with enemy visible within 8:', round(np.mean([w['nE'] > 0 for w in W]), 3))
print('ward distance to nearest altar', np.percentile([w['wdAltar'] for w in W], [10, 25, 50, 75, 90]))
print('ward distance to own spawn', np.percentile([w['wdHome'] for w in W], [10, 25, 50, 75, 90]))
print('placer hp frac', np.percentile([w['hpf'] for w in W], [10, 50, 90]))
print('round of wards', np.percentile([w['r'] for w in W], [5, 25, 50, 75, 95]))
# direction: relative offset relative to own spawn->enemy direction? use wx,wy distribution sign
print('offset dx,dy most common', collections.Counter((w['wx'], w['wy']) for w in W).most_common(12))
