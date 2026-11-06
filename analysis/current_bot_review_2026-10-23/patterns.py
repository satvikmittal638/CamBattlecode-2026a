import json,collections,statistics,math
from pathlib import Path
p=Path(__file__).parent;root=p.parent.parent
read=lambda f:json.loads(Path(f).read_text());idx=read(p/'games/index.json');raw=read(p/'metrics.json');rows=raw['rows'];expected=sum(m['status']=='finished' for m in read(p/'matches.json'));assert len(rows)==len(idx)==expected and not raw['fail'] and not raw['exits'];byid={g['matchId']:g for g in idx}
normal=lambda g:g['map'].replace('-','_') not in ['00contest','01boss_battle']
avg=lambda xs:sum(xs)/len(xs) if xs else None
rnd=lambda x:round(x,3) if isinstance(x,(int,float)) else x

def stats(gs):
 if not gs:return {'games':0}
 result={'games':len(gs),'wins':sum(g['result']=='win' for g in gs),'meanMargin':avg([g['score']-g['oppScore'] for g in gs]),'medianMargin':statistics.median([g['score']-g['oppScore'] for g in gs]),'rounds':avg([g['rounds'] for g in gs]),'heavyLosses':sum(g['oppScore']-g['score']>=500 for g in gs),'endingAtLimit':sum(g['rounds']>=2000 for g in gs)}
 for t in [0,1]:
  deaths=[d for g in gs for d in g['deaths'] if d['team']==(g['us'] if t==0 else 1-g['us'])];den=max(1,len(deaths));m=[g['metrics'][t] for g in gs];c=[g['combat'][t] for g in gs]
  result['us' if t==0 else 'enemy']={'deaths':len(deaths)/len(gs),'outnumberedDeathPct':100*sum(d['enemies']>d['friends'] for d in deaths)/den,'isolatedDeathPct':100*sum(d['friends']==1 and d['enemies']>=2 for d in deaths)/den,'deathNoEnemyPct':100*sum(d['enemies']==0 for d in deaths)/den,'gemsAtDeath':sum(d['bag'] for d in deaths)/len(gs),'captures':avg([x['groupCaps'] for x in m]),'capturesPer100':100*sum(x['groupCaps'] for x in m)/sum(g['rounds'] for g in gs),'capturedGems':avg([x['capGems'] for x in m]),'capturedGems300':avg([sum(e['gems'] for e in g['captureEvents'] if e['team']==(g['us'] if t==0 else 1-g['us']) and e['r']<=300) for g in gs]),'captures300':avg([sum(1 for e in g['captureEvents'] if e['team']==(g['us'] if t==0 else 1-g['us']) and e['r']<=300) for g in gs]),'firstCapture':avg([min([e['r'] for e in g['captureEvents'] if e['team']==(g['us'] if t==0 else 1-g['us'])],default=g['rounds']) for g in gs]),'bankedGems':avg([g['score'] if t==0 else g['oppScore'] for g in gs]),'finalCarried':avg([x['finalBag'] for x in m]),'movesPerCapture':sum(x['moves'] for x in m)/max(1,sum(x['groupCaps'] for x in m)),'recalls':avg([len(x['recalls']) for x in m]),'submissions':avg([x['submitStarts'] for x in m]),'idlePct':100*sum(x['idleTurns'] for x in m)/max(1,sum(x['aliveTurns'] for x in m)),'championDamage':avg([x['damage'] for x in c]),'campDamageTaken':avg([x['campDamage'] for x in c]),'campDeaths':avg([x['campDeaths'] for x in c]),'outnumberedAttackPct':100*sum(x['outnumberedAttacks'] for x in c)/max(1,sum(x['attacks'] for x in c))}
 return result
sets={'all':rows,'ranked':[g for g in rows if g['kind']=='ranked'],'unranked':[g for g in rows if g['kind']=='unranked'],'normal':[g for g in rows if normal(g)],'normalWins':[g for g in rows if normal(g) and g['result']=='win'],'normalLosses':[g for g in rows if normal(g) and g['result']=='loss'],'heavyNormalLosses':[g for g in rows if normal(g) and g['oppScore']-g['score']>=500],'closeNormalLosses':[g for g in rows if normal(g) and g['result']=='loss' and g['oppScore']-g['score']<200]}
losses=sets['normalLosses'];deaths=lambda g,t:sum(d['team']==(g['us'] if t==0 else 1-g['us']) for d in g['deaths'])
categories={'economicWithoutLargeDeathGap':[g['matchId'] for g in losses if g['metrics'][0]['groupCaps']<.75*g['metrics'][1]['groupCaps'] and deaths(g,0)<deaths(g,1)+5],'lostWithFewerDeaths':[g['matchId'] for g in losses if deaths(g,0)<deaths(g,1)],'deathGap5plus':[g['matchId'] for g in losses if deaths(g,0)>=deaths(g,1)+5],'winningBagHeld50rounds':[g['matchId'] for g in rows if g['result']=='loss' and g['metrics'][0]['potentialWinRounds']>=50]}
worst=sorted(rows,key=lambda g:g['score']-g['oppScore']);best=sorted(rows,key=lambda g:g['score']-g['oppScore'],reverse=True)
compact=lambda g:{k:g[k] for k in ['matchId','map','opponent','kind','result','score','oppScore','rounds','side']}
result={'coverage':{'games':len(rows),'nativeSteps':sum(g['steps'] for g in rows),'nativeDecodeFailures':len(raw['fail']),'workerFailures':raw['exits'],'engines':sorted(set(g['engine'] for g in rows))},'sets':{k:stats(gs) for k,gs in sets.items()},'maps':{k:stats([g for g in rows if g['map']==k]) for k in sorted(set(g['map'] for g in rows))},'opponents':{k:stats([g for g in rows if g['opponent']==k]) for k in sorted(set(g['opponent'] for g in rows))},'categories':categories,'worstGames':[compact(g) for g in worst[:12]],'bestGames':[compact(g) for g in best[:8]],'historical':{}}
# Compare prior evaluation corpora descriptively, plus exact opponent/map/side overlaps.
for ver,folder in [('v54','teammate_eval_2026-10-22'),('v55','v55_eval_2026-10-23'),('v57','v57_eval_2026-10-23')]:
 f=root/'analysis'/folder/'metrics.json'
 if not f.exists():continue
 old=read(f)['rows'];lookup=collections.defaultdict(list)
 for g in old:lookup[(g['opponent'],g['map'],g['side'])].append(g)
 matched=[(g,lookup[(g['opponent'],g['map'],g['side'])]) for g in rows if lookup[(g['opponent'],g['map'],g['side'])]]
 def paired():
  if not matched:return {'contexts':0}
  return {'contexts':len(matched),'opponents':len({g['opponent'] for g,o in matched}),'v58MeanWin':avg([g['result']=='win' for g,o in matched]),'oldMeanWin':avg([avg([x['result']=='win' for x in o]) for g,o in matched]),'v58MeanMargin':avg([g['score']-g['oppScore'] for g,o in matched]),'oldMeanMargin':avg([avg([x['score']-x['oppScore'] for x in o]) for g,o in matched]),'ids':[g['matchId'] for g,o in matched]}
 result['historical'][ver]={'all':stats(old),'normalWins':stats([g for g in old if normal(g) and g['result']=='win']),'normalLosses':stats([g for g in old if normal(g) and g['result']=='loss']),'exactOpponentMapSideOverlap':paired(),'caveat':'Different opponent mixes and upload times; public opponent bot versions are hidden. This is descriptive, not a controlled causal improvement estimate.'}
 del old,lookup
# Historical activity is complete across all3425 groups; group side carries our version.
act=read(p/'activity.json');groupsBy=collections.defaultdict(list)
for g in act['groups']:
 s=next((s for s in g['sides'] if s['teamId']=='6b04505b-d16c-4196-b7c6-53a4688a32ca'),None)
 if s and s.get('version') in [53,54,55,56,57,58] and g['status']=='finished':groupsBy[(s['version'],g['kind'])].append((g,s))
result['activityVersionSummary']=[{'version':v,'kind':k,'groups':len(gs),'groupWins':sum(g.get('winnerTeamId')=='6b04505b-d16c-4196-b7c6-53a4688a32ca' for g,s in gs),'gameWins':sum(s['wins'] for g,s in gs),'games':sum(g['gameCount'] for g,s in gs)} for (v,k),gs in sorted(groupsBy.items())]
(p/'patterns.json').write_text(json.dumps(result,indent=2));print(json.dumps({'coverage':result['coverage'],'sets':result['sets'],'categories':{k:len(v) for k,v in categories.items()},'worstGames':result['worstGames'][:4],'historicalOverlaps':{k:v['exactOpponentMapSideOverlap'] for k,v in result['historical'].items()}},indent=2))
