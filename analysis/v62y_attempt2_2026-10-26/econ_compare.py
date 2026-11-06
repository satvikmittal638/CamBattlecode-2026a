"""Opening economy per variant of a field_eval run: gems collected by r150/r200/r300 (us, them), number of rich
captures (>= 12 gems in one collection) by r250, wins, gem margin, deaths by r300; paired flips vs 'base'.
    python3 econ_compare.py fe_econ"""
import collections, json, sys
rows = json.load(open(sys.argv[1] + '/results.json'))['rows']
def econ(r):
    s = json.load(open('../../' + r['stats'])); ours = 'teamA' if r['side'] == 'a' else 'teamB'
    o = collections.Counter()
    for e in s['events']:
        me = e.get('owner', {}).get('team') == ours
        for x in e.get('entries', []):
            rd = x['timestamp']['round']
            if e['kind'] == 'gemCollection':
                v = int(x.get('value') or 0)
                for R in (150, 200, 300):
                    if rd <= R: o[('us' if me else 'them') + str(R)] += v
                if rd <= 250 and v >= 12: o['rich_us' if me else 'rich_them'] += 1
            if e['kind'] == 'death' and rd <= 300: o['dead_us' if me else 'dead_them'] += 1
    return o
V = collections.defaultdict(list)
for r in rows: V[r['variant']].append((r, econ(r)))
keys = ['us150', 'them150', 'us200', 'them200', 'us300', 'them300', 'rich_us', 'rich_them', 'dead_us', 'dead_them']
base = {(r['opponent'], r['map'], r['side']): r for r, _ in V.get('base', [])}
for v, xs in V.items():
    n = len(xs); w = sum(r['win'] for r, _ in xs); m = sum(r['score'] - r['oppScore'] for r, _ in xs) / n
    tot = {k: sum(e[k] for _, e in xs) / n for k in keys}
    up = dn = 0
    for r, _ in xs:
        b = base.get((r['opponent'], r['map'], r['side']))
        if b and v != 'base': up += r['win'] and not b['win']; dn += b['win'] and not r['win']
    print(f"{v:8s} wins {w}/{n} margin {m:+.0f} | " + ' '.join(f"{k} {tot[k]:.1f}" for k in keys) + (f" | vs base +{up} -{dn}" if v != 'base' else ''))
by = collections.defaultdict(lambda: collections.defaultdict(list))
for v, xs in V.items():
    for r, e in xs: by[r['map']][v].append((r['win'], e['us200'] - e['them200']))
print('per map: wins / mean (us200 - them200)')
for mp, d in sorted(by.items()):
    print(f"  {mp:22s} " + '  '.join(f"{v} {sum(a for a, _ in x)}/{len(x)} {sum(b for _, b in x)/len(x):+.0f}" for v, x in d.items()))
