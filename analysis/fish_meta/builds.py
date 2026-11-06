import json, sys, collections
import numpy as np
ITEMS = 'Monster Shard of Strength.Monster Emblem of Strength.Monster Shard of Focus.Monster Emblem of Focus.Monster Shard of Health.Monster Emblem of Health.Power Shard of Strength.Power Emblem of Strength.Power Shard of Focus.Power Emblem of Focus.Power Shard of Health.Power Emblem of Health.Durability Shard of Strength.Durability Emblem of Strength.Durability Shard of Focus.Durability Emblem of Focus.Durability Shard of Health.Durability Emblem of Health.Treasure Shard of Strength.Treasure Emblem of Strength.Treasure Shard of Focus.Treasure Emblem of Focus.Treasure Shard of Health.Treasure Emblem of Health.Jungle Shard of Strength.Jungle Emblem of Strength.Jungle Shard of Focus.Jungle Emblem of Focus.Jungle Shard of Health.Jungle Emblem of Health.Home Shard of Strength.Home Emblem of Strength.Home Shard of Focus.Home Emblem of Focus.Home Shard of Health.Home Emblem of Health.Bruiser Shard of Strength.Bruiser Emblem of Strength.Bruiser Shard of Focus.Bruiser Emblem of Focus.Bruiser Shard of Health.Bruiser Emblem of Health'.split('.')
rows = [json.loads(l) for l in open(sys.argv[1])]
games = [r for r in rows if r['k'] == 'game']
boss = {'00contest', '01boss_battle', 'contest', 'stampede'}
S = [r for r in rows if r['k'] == 'shop']
# purchase sequence per (game, type): shard purchases in order, as family:stat; emblem creation implied
seqs = collections.defaultdict(list); timing = collections.defaultdict(list); cons = collections.Counter()
for r in S:
    for it, n in (r['items'] or {}).items():
        if it.startswith('consumable'):
            if n > 0: cons[(r['ty'], it)] += n
            continue
        if n > 0 and 'Shard' in it:
            fam, stat = it.split(' Shard of ')
            for _ in range(n): seqs[(r.get('g'), r['ty'], r['r'] // 1)].append(fam[:4] + ':' + stat[:3])
print('consumables bought (type, id):', cons.most_common(10))
# group by type over games: order of first 25 shards
bytype = collections.defaultdict(list)
# rebuild per game: need game id; ex_events lacks g -> use (round order) per type within file order
cur = collections.defaultdict(list)
gi = 0
order = []
for r in rows:
    if r['k'] == 'game': gi += 1; continue
    if r['k'] != 'shop': continue
    net = collections.Counter()
    for it, n in (r['items'] or {}).items():
        if it.startswith('consumable'): continue
        if ' Shard of ' in it: fam, stat = it.split(' Shard of '); net[f'{fam}:{stat}'] += n
        elif ' Emblem of ' in it: fam, stat = it.split(' Emblem of '); net[f'{fam}:{stat}'] += 5 * n
    for k, n in net.items():
        if n > 0: cur[(gi, r['ty'])] += [k] * n
for (g, ty), seq in cur.items(): bytype[ty].append(seq)
for ty, L in sorted(bytype.items(), key=lambda x: -len(x[1])):
    c = collections.Counter(tuple(s[:15]) for s in L)
    fams = collections.Counter(x for s in L for x in s)
    print(f'\n{ty}: {len(L)} champion-games; shards bought total/game {np.mean([len(s) for s in L]):.1f}')
    print('  shard mix:', ', '.join(f'{k} {v/len(L):.1f}' for k, v in fams.most_common(8)))
    for k, v in c.most_common(3):
        # compress runs
        out = []; prev = None; cnt = 0
        for x in k:
            if x == prev: cnt += 1
            else:
                if prev: out.append(f'{prev}x{cnt}')
                prev, cnt = x, 1
        if prev: out.append(f'{prev}x{cnt}')
        print(f'  [{v}] ' + ' > '.join(out))
# shopping context: gold before purchase, hp, alive or dead
print('\nshop events: dead share', np.mean([r['dead'] for r in S]).round(2), ' gold before median', np.median([r['gold'] for r in S if r['gold'] is not None]))
