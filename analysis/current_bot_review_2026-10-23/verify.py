from pathlib import Path
import json,hashlib,collections,datetime
p=Path(__file__).parent;root=p.parent.parent;read=lambda f:json.loads(Path(f).read_text());idx=read(p/'games/index.json');native=read(p/'metrics.json');rows=native['rows'];byid={g['matchId']:g for g in rows};matches=read(p/'matches.json');finished={m['id'] for m in matches if m['status']=='finished'};assert set(byid)==finished=={g['matchId'] for g in idx};assert not native['fail'] and not native['exits'];faults=collections.Counter();official=[];flow=[]
for g in idx:
 d=read(p/'official_summaries'/(g['matchId']+'.json'));scores={t['team']:int(t['submittedGems']) for t in d['teams']};us='teamA' if g['side']=='a' else 'teamB';op='teamB' if us=='teamA' else 'teamA';assert scores[us]==g['score'] and scores[op]==g['oppScore'];assert d['match']['outcome']==(us if g['result']=='win' else op);assert d['match']['roundsStarted']==g['rounds'];assert d['diagnostics']['detailedCaptureComplete'];faults['ours']+=d['diagnostics']['botFaults'][us];faults['enemy']+=d['diagnostics']['botFaults'][op]
 for t in [0,1]:
  n=byid[g['matchId']];team=n['us'] if t==0 else 1-n['us'];stolen=sum(z['bag'] for z in n['deaths'] if z['team']!=team and z['killer'] is not None);lost=sum(z['bag'] for z in n['deaths'] if z['team']==team);residual=n['metrics'][t]['capGems']+stolen-lost-(g['score'] if t==0 else g['oppScore'])-n['metrics'][t]['finalBag'];
  if abs(residual)>.01:flow.append({'matchId':g['matchId'],'team':team,'residual':residual})
 own=[c for c in d['champions'] if c['team']==us];enemy=[c for c in d['champions'] if c['team']==op];z={'matchId':g['matchId']}
 for label,cs in [('us',own),('enemy',enemy)]:z[label]={k:sum(float(c['metrics'].get(k,0)) for c in cs) for k in ['earnedGold','spentGold','gold','gems','collectedGems','submittedGems','kills','deaths','monsterDamageDone','monsterDamageTaken','championDamageDone','championDamageTaken','shieldingDone']}
 official.append(z)
# Immutable copies: actual downloaded source, original source snapshots and test inputs.
for f in read(p/'source_hashes.json'):assert hashlib.sha256((p/'source'/f['path']).read_bytes()).hexdigest()==f['sha256']
protocol=read(p/'local/PROTOCOL.json');sourceChanges=[]
for bot,hashes in protocol['hashes'].items():
 src=root/'workspace/bots'/('review-20261023-'+bot)/'src'
 for f,h in hashes.items():
  if hashlib.sha256((src/f).read_bytes()).hexdigest()!=h:sourceChanges.append(bot+'/'+f)
assert not sourceChanges
local=read(p/'local/results.json');assert len(local['rows'])==280 and local['runnerExit']==0 and all(not g.get('error') for g in local['rows']);assert len({g['key'] for g in local['rows']})==280
assert all(g['engine']=='1.0.3' for g in local['rows'])
a={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cutoff':read(p/'review_cutoff.json'),'completedGames':len(idx),'uniqueGames':len(set(byid)),'uniqueOpponents':len({g['opponentId'] for g in idx}),'maps':len({g['map'] for g in idx}),'nativeSteps':sum(g['steps'] for g in rows),'officialSummariesVerified':len(official),'officialFaults':dict(faults),'nativeDecodeFailures':0,'officialOutcomeScoreRoundDiscrepancies':0,'gemFlowResiduals':flow,'downloadedSourceFilesUnchanged':len(read(p/'source_hashes.json')),'localGames':len(local['rows']),'localSourceChanges':sourceChanges,'newSubmissions':0,'newChallenges':0,'rulesSourcesUnchanged':all(r['sameAsPrior'] for r in read(p/'docs_verification.json'))};(p/'VERIFICATION.json').write_text(json.dumps(a,indent=2));(p/'official_aggregates.json').write_text(json.dumps(official,indent=2));print(json.dumps(a,indent=2))
