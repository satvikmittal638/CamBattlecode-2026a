"""Describe the fresh control cohort; these are associations, not causal tests."""
import json
from pathlib import Path
from statistics import mean

D = Path(__file__).resolve().parent
P = D / 'paired_scan/control'
rows = sum([json.loads((P / f'metrics_{i}.json').read_text()) for i in range(4)], [])

def summarize(rs):
    out = {'games': len(rs), 'wins': sum(r['result'] == 'win' for r in rs)}
    if not rs:
        return out
    for side, key in [(0, 'ours'), (1, 'opponent')]:
        ts = [r['teams'][r['us'] if side == 0 else 1-r['us']] for r in rs]
        out[key] = {k: mean(t['checkpoints'].get('300', {}).get(k, 0) for t in ts)
                    for k in ['capGold', 'capGems', 'worth', 'equipment', 'deaths']}
        out[key]['move300'] = mean(t['activity300'].get('move', 0) for t in ts)
        out[key]['farm300'] = mean(t['activity300'].get('farm', 0) for t in ts)
    own_deaths = [d for r in rs for d in r['deaths'] if d['team'] == r['us']]
    out['deaths'] = len(own_deaths)
    out['earlyDeaths'] = sum(d['r'] <= 300 for d in own_deaths)
    out['isolatedDeaths'] = sum(d['allies'] == 0 and d['enemies'] > 0 for d in own_deaths)
    out['channelDeaths'] = sum(bool(d['channel']) for d in own_deaths)
    # The same dropped gems can be recovered and counted at another death.
    out['bagGemsAtDeath'] = sum(d['gems'] for d in own_deaths)
    out['lossesWithNoEarlyDeath'] = sum(r['result'] == 'loss' and r['teams'][r['us']]['checkpoints'].get('300', {}).get('deaths', 0) == 0 for r in rs)
    return out

out = {'all': summarize(rows), 'losses': summarize([r for r in rows if r['result'] == 'loss']),
       'maps': {m: summarize([r for r in rows if r['map'] == m]) for m in sorted({r['map'] for r in rows})}}
(D / 'control_diagnosis.json').write_text(json.dumps(out, indent=2))
for m in ['all', 'losses']:
    print(m, out[m])
for m, s in out['maps'].items():
    if s['games'] >= 10:
        print(m, json.dumps(s))

local = sum([json.loads((D / f'salvage_metrics/metrics_{i}.json').read_text()) for i in range(4)], [])
salvage = {}
for m in sorted({r['map'] for r in local}):
    salvage[m] = {}
    for label in sorted({r['label'] for r in local}):
        rs = [r for r in local if r['map'] == m and r['label'] == label]
        ts = [r['teams'][r['us']] for r in rs]
        salvage[m][label] = {'games': len(rs), 'wins': sum(r['result'] == 'win' for r in rs),
                              **{k: mean(t['checkpoints']['300'][k] for t in ts) for k in ['capGold', 'capGems', 'deaths']}}
(D / 'salvage_mechanism.json').write_text(json.dumps(salvage, indent=2))
