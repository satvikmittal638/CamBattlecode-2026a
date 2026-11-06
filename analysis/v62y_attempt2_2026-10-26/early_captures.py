"""Early economy on a map: every gem collection (official summaries, both attempts) in the first R rounds, by team,
with its position, so we can see which camps the opponent takes that we do not.  python3 early_captures.py <map> [R]"""
import collections, glob, json, sys
mp, R = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 250
for d in ('v62_attempt1_2026-10-26', 'v62y_attempt2_2026-10-26'):
    idx = {g['matchId']: g for g in json.load(open(f'{d}/games/index.json'))}
    for mid, g in idx.items():
        if g['map'] != mp: continue
        s = json.load(open(f'{d}/official_summaries/{mid}.json')); ours = 'teamA' if g['side'] == 'a' else 'teamB'
        ev = []
        for e in s['events']:
            if e['kind'] != 'gemCollection': continue
            who = 'us' if e['owner'].get('team') == ours else 'them'
            for x in e['entries']:
                r = x['timestamp']['round']
                if r <= R: ev.append((r, who, int(x.get('value') or 0), (x['x'], x['y']), e['owner']['name'][:6]))
        ev.sort()
        tot = collections.Counter(); 
        for r, who, v, p, n in ev: tot[who] += v
        print(f"{d[:3]} {g['side']} {g['result']:4s} {g['score']}-{g['oppScore']} | by r{R}: us {tot['us']} them {tot['them']}")
        print('   ' + ' '.join(f"{r}:{'U' if who == 'us' else 'T'}{v}@{p[0]},{p[1]}" for r, who, v, p, n in ev[:22]))
