from pathlib import Path
import json,statistics,collections
p=Path(__file__).parent;d=json.loads((p/'native.json').read_text());rows=d['rows'];turns=[];data=[]
for r in rows:
 us=r['us'];roles=[z for z in r['roles'] if z['team']==us];enemy=[z for z in r['roles'] if z['team']!=us];pr=next(z for z in roles if z['type']=='Prism');ts=r['prismTurns'];turns+=ts
 q={k:r[k] for k in ['matchId','cohort','opponent','opponentRank','map','result','score','oppScore','rounds','file']};q.update(prismGems=pr['gemsCaptured'],prismGold=pr['goldCaptured'],prismBanked=pr['gemsBanked'],prismDeaths=pr['deaths'],prismLost=pr['gemsLost'],prismMaxBag=max((t['bag'] for t in ts),default=0),prismMaxFocus=max((t['focus'] for t in ts),default=0),prismAllyWithin5=sum(t['nearestAlly']<=5 for t in ts)/max(1,len(ts)),teamGems=sum(z['gemsCaptured'] for z in roles),enemyGems=sum(z['gemsCaptured'] for z in enemy),teamDeaths=sum(z['deaths'] for z in roles),enemyDeaths=sum(z['deaths'] for z in enemy),teamLost=sum(z['gemsLost'] for z in roles),finalBag=sum(c['gems'] for c in r['final'] if c['team']==us and c['alive']),earlyGems=(r['checkpoints'].get('300') or {}).get('teamGemsCaptured'),nativeErrors=r.get('botErrors',0))
 data.append(q)
cohorts={}
for c in sorted({r['cohort'] for r in rows}):
 rs=[r for r in data if r['cohort']==c];cohorts[c]={'games':len(rs),'wins':sum(r['result']=='win' for r in rs),'prismGemsMean':statistics.mean(r['prismGems'] for r in rs),'prismDeathsMean':statistics.mean(r['prismDeaths'] for r in rs),'prismMaxBagMedian':statistics.median(r['prismMaxBag'] for r in rs),'prismMaxFocusMedian':statistics.median(r['prismMaxFocus'] for r in rs)}
heavy=[r for r in data if r['oppScore']-r['score']>=500];wins=[r for r in data if r['result']=='win'];losing=[r for r in data if r['result']=='loss']
def avg(rs,key):return statistics.mean(r[key] for r in rs) if rs else 0
out={'games':len(rows),'steps':sum(r['steps'] for r in rows),'decodeErrors':d['errors'],'nativeBotErrorsBothTeams':sum(r.get('botErrors',0) for r in rows),'prismTurns':len(turns),'focusFormulaMaxResidual':max((abs(t['focusResidual']) for t in turns),default=0),'prismGemShare':sum(r['prismGems'] for r in data)/max(1,sum(r['teamGems'] for r in data)),'prismAllyWithin5Fraction':sum(t['nearestAlly']<=5 for t in turns)/max(1,len(turns)),'cohorts':cohorts,'outcomePatterns':{},'rows':data}
for label,rs in [('wins',wins),('losses',losing),('heavyLosses',heavy)]:out['outcomePatterns'][label]={'games':len(rs),'prismGems':avg(rs,'prismGems'),'prismDeaths':avg(rs,'prismDeaths'),'teamDeaths':avg(rs,'teamDeaths'),'enemyDeaths':avg(rs,'enemyDeaths'),'teamCaptured':avg(rs,'teamGems'),'enemyCaptured':avg(rs,'enemyGems'),'finalBag':avg(rs,'finalBag')}
(p/'live_metrics.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({k:v for k,v in out.items() if k!='rows'},indent=2))
