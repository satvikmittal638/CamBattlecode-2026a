import json,glob,sys,statistics,collections
from pathlib import Path
root=Path('autoresearch')/sys.argv[1]
def at(runs,r):
 pos=0
 for x in runs:
  pos+=x['duration']
  if r<pos:return float(x['value'])
 return float(runs[-1]['value'])
out={}
for arm in sys.argv[2:]:
 bymap=collections.defaultdict(list)
 for p in (root/arm).glob('*.json'):
  if p.name in ['summary.json','results.json','economy.json']:continue
  d=json.load(open(p));team='teamA' if p.name.endswith('__a.json') else 'teamB';m=p.name.split('__')[0];vals={}
  for t in d['championTimelines']:
   if t['owner']['team']!=team:continue
   if t['metric'] in ['earnedGold','spentGold','deaths']:
    k=t['metric']+'300';vals[k]=vals.get(k,0)+at(t['runs'],300)
   if t['owner']['name']=='Marcella' and t['metric']=='earnedGold':vals['marcellaGold300']=at(t['runs'],300)
  vals['score300']=at(next(t for t in d['teamTimelines'] if t['owner']==team and t['metric']=='submittedGems')['runs'],300)
  first=[e['timestamp']['round'] for g in d['events'] if g['kind']=='gemSubmission' and g['owner']['team']==team and g['owner']['name']=='Marcella' for e in g['entries']]
  vals['marcellaFirstTribute']=min(first) if first else None
  bymap[m].append(vals)
 summary={m:{k:statistics.mean(x[k] for x in rs if x.get(k) is not None) for k in set().union(*(x.keys() for x in rs)) if any(x.get(k) is not None for x in rs)} for m,rs in bymap.items()}
 (root/arm/'economy.json').write_text(json.dumps(summary,indent=2));out[arm]=summary
print(json.dumps(out,indent=2))
