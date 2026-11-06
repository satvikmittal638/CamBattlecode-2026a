"""Fix-acceptance audit with an a priori split (user rule: improve the targeted games, degrade nothing else).
Games are paired by spec (label, map, side) with a baseline run; each map is classified by v62's usual deaths on it
in the 500-game baseline (excluding the paired game itself): combat maps (>= 12) vs other maps.
  python3 audit_map.py <candidate dir> <baseline dir> [label]"""
import json, collections, sys, os
cand, base = sys.argv[1], sys.argv[2]; label = sys.argv[3] if len(sys.argv) > 3 else os.path.basename(os.path.abspath(cand))
V62 = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'v62_c100_2026-10-27')
def met(d, g):
    s = json.load(open(f"{d}/official_summaries/{g['matchId']}.json")); us = 'teamA' if g['side'] == 'a' else 'teamB'; m = collections.Counter()
    for c in s['champions']:
        side = 'us' if c['team'] == us else 'them'
        for k in ('deaths', 'kills', 'submittedGems', 'earnedGold'): m[side + k] += float(c['metrics'][k])
    for e in s['events']:
        if e['kind'] == 'gemCollection': m[('us' if e['owner'].get('team') == us else 'them') + 'caps'] += len(e['entries'])
    m['win'] = g['result'] == 'win'; m['margin'] = g['score'] - g['oppScore']; return m
key = lambda g: (g['label'], g['map'], g['side'])
v62 = {key(g): g for g in json.load(open(f'{V62}/games/index.json'))}
v62d = {k: met(V62, g)['usdeaths'] for k, g in v62.items()}
B = {key(g): g for g in json.load(open(f'{base}/games/index.json'))}
groups = collections.defaultdict(list)
for g in json.load(open(f'{cand}/games/index.json')):
    k = key(g)
    if k not in B: continue
    others = [v for kk, v in v62d.items() if kk[1] == g['map'] and kk != k]
    groups['combat maps' if sum(others) / len(others) >= 12 else 'other maps'].append((met(base, B[k]), met(cand, g)))
for grp in ('combat maps', 'other maps'):
    ps = groups[grp]; n = len(ps)
    if not n: continue
    f = lambda key, i: sum(p[i][key] for p in ps) / n
    up = sum(p[1]['win'] and not p[0]['win'] for p in ps); dn = sum(p[0]['win'] and not p[1]['win'] for p in ps)
    print(f"{label} {grp:11s} {n:3d} games | wins {sum(p[0]['win'] for p in ps)} -> {sum(p[1]['win'] for p in ps)} (+{up}/-{dn}) | margin {f('margin',0):+.0f} -> {f('margin',1):+.0f} | deaths {f('usdeaths',0):.1f} -> {f('usdeaths',1):.1f} | kills {f('uskills',0):.1f} -> {f('uskills',1):.1f} | caps {f('uscaps',0):.0f} -> {f('uscaps',1):.0f} | tributed {f('ussubmittedGems',0):.0f} -> {f('ussubmittedGems',1):.0f} | gold {f('usearnedGold',0):.0f} -> {f('usearnedGold',1):.0f} | opp tributed {f('themsubmittedGems',0):.0f} -> {f('themsubmittedGems',1):.0f}")
