import json,csv,statistics as S,math
from pathlib import Path
D=Path(__file__).resolve().parent
rows=sum((json.loads((D/f'metrics_{i}.json').read_text()) for i in range(4)),[])
rows.sort(key=lambda x:(x.get('label',''),x['map']))
plan={x['label']:x for x in json.loads((D/'specs.json').read_text())}
for r in rows:
 r['pool']=plan[r['label']]['pool'];r['opponentRankAtPlanning']=plan[r['label']]['rank']
(D/'metrics.json').write_text(json.dumps(rows))
def mean(a):return round(S.mean(a),3) if a else None
def summary(a):
 out={'games':len(a),'wins':sum(r['result']=='win' for r in a)}
 if not a:return out
 out['meanMargin']=mean([r['score']-r['oppScore'] for r in a]);out['meanRounds']=mean([r['rounds'] for r in a]);out['errors']=sum(r.get('endReason')=='error' for r in a)
 for key in ['capGems','capGold','deaths','deathGems','kills','captures','newFamilyPurchases']:
  out[key]=[mean([r['teams'][r['us']^t][key] for r in a]) for t in [0,1]]
 for key in ['worth','equipment','capGems','capGold','deaths','kills','unspent']:
  out[key+'300']=[mean([r['teams'][r['us']^t]['checkpoints']['300'][key] for r in a if '300' in r['teams'][r['us']^t]['checkpoints']]) for t in [0,1]]
 out['carriedAtEnd']=[mean([r['finalCarried'][r['us']^t] for r in a]) for t in [0,1]]
 out['deadTurnFraction']=[mean([r['teams'][r['us']^t]['deadTurns']/r['teams'][r['us']^t]['turns'] for r in a]) for t in [0,1]]
 deaths=[d for r in a for d in r['deaths'] if d['team']==r['us']]
 out['deathContexts']={'n':len(deaths),'alone':sum(d['allies']==0 for d in deaths),'outnumbered':sum(d['enemies']>d['allies']+1 for d in deaths),'channel':sum(bool(d['channel']) for d in deaths),'zeroBag':sum(d['gems']==0 for d in deaths),'lowFor2Turns':sum(sum(x['hp']<x['max']*.35 for x in d['lastTurns'])>=2 for d in deaths)}
 out['idleRunsAtLeast20']=[{'map':r['map'],'label':r.get('label'),'id':x['id'],'start':x['start'],'n':x['n'],'bag':x['bag']} for r in a for x in r['idleRuns'] if x['team']==r['us'] and x['n']>=20]
 return out
archive=json.loads((D.parent/'v114_loss_patterns_2026-10-29/metrics.json').read_text())
out={'trial':{k:summary(a) for k,a in [('all',rows),('loss',[r for r in rows if r['result']!='win']),('win',[r for r in rows if r['result']=='win']),('strong',[r for r in rows if r['pool']=='strong']),('near',[r for r in rows if r['pool']=='near']),('a',[r for r in rows if r['side']=='a']),('b',[r for r in rows if r['side']=='b'])]},'archive':{k:summary(a) for k,a in [('all',archive),('loss',[r for r in archive if r['result']!='win'])]}}
out['perOpponent']=[{'label':l,'opponent':plan[l]['opponent'],'pool':plan[l]['pool'],'rank':plan[l]['rank'],**summary([r for r in rows if r['label']==l])} for l in plan]
out['diagnosticMaps']={m:summary([r for r in rows if r['map']==m]) for m in json.loads((D/'plan.json').read_text())['diagnosticMaps']}
(D/'summary.json').write_text(json.dumps(out,indent=2))
fields=['label','pool','opponent','opponentRankAtPlanning','map','side','result','score','oppScore','rounds','deaths','oppDeaths','capGems','oppCapGems','capGold','oppCapGold','deathGems','carriedAtEnd','worth300','oppWorth300','equipment300','oppEquipment300']
with (D/'matches.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
 for r in rows:
  t=r['teams'][r['us']];e=r['teams'][1-r['us']];c=t['checkpoints'].get('300',{});ec=e['checkpoints'].get('300',{})
  w.writerow({**{k:r.get(k) for k in fields[:10]},'deaths':t['deaths'],'oppDeaths':e['deaths'],'capGems':t['capGems'],'oppCapGems':e['capGems'],'capGold':t['capGold'],'oppCapGold':e['capGold'],'deathGems':t['deathGems'],'carriedAtEnd':r['finalCarried'][r['us']],'worth300':c.get('worth'),'oppWorth300':ec.get('worth'),'equipment300':c.get('equipment'),'oppEquipment300':ec.get('equipment')})
for k in out['trial']:
 s=out['trial'][k];print(k,s['wins'],s['games'],'margin',s.get('meanMargin'),'deaths',s.get('deaths'),'capGems',s.get('capGems'),'equipment300',s.get('equipment300'))
