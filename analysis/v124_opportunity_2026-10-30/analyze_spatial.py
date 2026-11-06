"""Paired resource distribution and action-time checks for the scan hypothesis."""
import json
from pathlib import Path
from collections import Counter
from statistics import mean

D = Path(__file__).resolve().parent
arms = {}
for arm in ['control', 'candidate']:
    p = D / 'paired_scan' / arm
    vs = json.loads((p / 'visual.json').read_text())
    ms = sum([json.loads((p / f'metrics_{i}.json').read_text()) for i in range(4)], [])
    mm = {r['matchId']: r for r in ms}
    assert len(vs) == len(ms) == 100
    rows = []
    for v in vs:
        m = mm[v['matchId']]
        caps = [c for c in v['caps'] if c['t'] == v['us'] and c['r'] <= 300]
        bands = Counter()
        for c in caps:
            # Lanes has resource strips near y=1/13/25; retain absolute map y.
            band = 'lower' if c['p'][1] < 10 else 'middle' if c['p'][1] < 20 else 'upper'
            bands[band + 'Captures'] += 1
            bands[band + 'Gems'] += c['g']
        own = m['teams'][m['us']]
        rows.append({'key': [v['label'], v['map'], v['side']], 'map': v['map'], 'result': v['result'],
                     'captureLocations300': len({tuple(c['p']) for c in caps}), 'captures300': len(caps),
                     'bands': dict(bands), 'activity300': own['activity300'],
                     'firstCapture': own['firstCapture'], 'checkpoint300': own['checkpoints'].get('300')})
    arms[arm] = rows

out = {}
for mp in sorted({r['map'] for r in arms['control']}):
    out[mp] = {}
    for arm, rows in arms.items():
        rs = [r for r in rows if r['map'] == mp]
        d = {k: mean(r[k] for r in rs) for k in ['captureLocations300', 'captures300']}
        d['games'] = len(rs)
        d['activity300'] = {k: mean(r['activity300'].get(k, 0) for r in rs)
                            for k in sorted({k for r in rs for k in r['activity300']})}
        if mp == '00lanes':
            d['bands'] = {k: mean(r['bands'].get(k, 0) for r in rs)
                          for k in ['lowerCaptures', 'middleCaptures', 'upperCaptures', 'lowerGems', 'middleGems', 'upperGems']}
        out[mp][arm] = d
(D / 'paired_scan/spatial_comparison.json').write_text(json.dumps(out, indent=2))
(D / 'paired_scan/spatial_rows.json').write_text(json.dumps(arms))
for mp in ['00lanes', '02treasure_box', '02cuts', '01elk_arena']:
    print(mp, json.dumps(out[mp]))
