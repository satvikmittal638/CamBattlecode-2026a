import json, sys, collections
DR = ['Ryth','VesperVale','Vendetta','CassiAndIssac','Stellar','Prism','Marcella','Willow','Ren','Varg','Tavi','HeartOfRuin']
rows = []
for f in sys.argv[1:]:
    rows += json.load(open(f))
seen = set(); R = []
for r in rows:
    if r['matchId'] in seen: continue
    seen.add(r['matchId']); R.append(r)
print('matches', len(R))
name = lambda d: [DR[int(x)] for x in (d or [])]
bymap = collections.defaultdict(list)
for r in R: bymap[r['map']].append(r)
allc = collections.Counter(); first = collections.Counter(); size = collections.Counter()
for r in R:
    d = name(r['myDraft']); size[len(d)] += 1
    for x in d: allc[x] += 1
    if d: first[d[0]] += 1
print('team size', size, '\npick frequency', allc.most_common(), '\nfirst pick', first.most_common())
print('\nper map: most common Fish draft (count/n), side a/b win rates')
for m in sorted(bymap):
    S = bymap[m]
    c = collections.Counter(tuple(name(r['myDraft'])) for r in S)
    wr = sum(r['result'] == 'win' for r in S) / len(S)
    top = c.most_common(2)
    print(f'  {m:22s} n={len(S):3d} win {wr:.2f}  ' + ' | '.join(f'{"/".join(k)} ({v})' for k, v in top))
# does Fish's draft depend on the opponent's picks? compare pick orders where opp picked first (side a picks first?)
print('\nside vs first pick:')
for side in ['a', 'b']:
    S = [r for r in R if r['side'] == side]
    print(' side', side, len(S), collections.Counter(name(r['myDraft'])[0] for r in S if r['myDraft']).most_common(4))
# reaction: when opponent took Stellar/Ren/C&I, what did Fish pick instead?
print('\nFish picks when the opponent drafted X:')
for x in ['Stellar', 'Ren', 'CassiAndIssac', 'Varg', 'Ryth', 'Tavi']:
    S = [r for r in R if x in name(r['oppDraft'])]
    c = collections.Counter(p for r in S for p in name(r['myDraft']))
    print(f'  opp has {x:14s} n={len(S):4d}: ' + ', '.join(f'{k} {v/len(S):.2f}' for k, v in c.most_common(7)))
