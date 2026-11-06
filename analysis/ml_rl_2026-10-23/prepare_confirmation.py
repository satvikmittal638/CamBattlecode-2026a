from pathlib import Path
import json,hashlib,collections,os,shutil,datetime
p=Path(__file__).parent;root=p.resolve().parents[1];out=p/'confirmation';out.mkdir(exist_ok=True)
read=lambda f:json.loads(f.read_text())
initial=read(p/'PROTOCOL.json')['opponentSplits'];assign={k:('test_initial' if v=='test' else v) for k,v in initial.items()}
base=root/'analysis/v57_eval_2026-10-23';receipts=read(base/'receipts.json');idx=read(base/'games/index.json');bygroup=collections.defaultdict(list)
for g in idx:bygroup[g['groupId']].append(g)
for pool,train_n,val_n in [('half',20,5),('near',30,10)]:
 ids=sorted([r['teamId'] for r in receipts if r['pool']==pool and r['teamId'] not in initial],key=lambda v:hashlib.sha256(('mlrl-confirm-v1|'+v).encode()).hexdigest())
 for i,v in enumerate(ids):assign[v]='train' if i<train_n else 'validation' if i<train_n+val_n else 'test'
assert len(assign)==100
observer=[];expert=[]
for r in receipts:
 for g in sorted(bygroup[r['groupId']],key=lambda g:(g['score']-g['oppScore'],g['map']))[:4]:
  common={**g,'opponentId':r['teamId'],'teacherId':r['teamId'],'split':assign[r['teamId']],'selectionRank':r['rank']}
  for rows,name,side,role in [(observer,'observer',g['side'],'observer'),(expert,'expert','b' if g['side']=='a' else 'a','expert')]:
   if role=='expert' and r['pool']!='half':continue
   dest=out/('corpus_'+name);dest.mkdir(exist_ok=True);row={**common,'side':side,'learningRole':role,'file':os.path.relpath(base/'games'/g['file'],dest)}
   if role=='expert':row.update(result='win' if g['result']=='loss' else 'loss',score=g['oppScore'],oppScore=g['score'],myDraft=g['oppDraft'],oppDraft=g['myDraft'])
   rows.append(row)
fish=root/'analysis/rank1_learning_2026-10-23';fid=read(fish/'team.json')['teamId']
for g in read(fish/'games/index.json'):expert.append({**g,'file':os.path.relpath(fish/'games'/g['file'],out/'corpus_expert'),'teacherId':fid,'split':'test_fish','learningRole':'expert'})
for name,rows in [('observer',observer),('expert',expert)]:
 corpus=out/('corpus_'+name);(corpus/'index.json').write_text(json.dumps(rows,indent=2));old=[json.loads(x) for x in (p/(name+'.jsonl')).read_text().splitlines()];old_ids={r['g'] for r in old if r['task']=='coverage'};wanted={r['matchId']:r for r in rows};assert old_ids<=set(wanted)
 with (out/(name+'_cached.jsonl')).open('w') as f:
  for r in old:r['split']=wanted[r['g']]['split'];f.write(json.dumps(r,separators=(',',':'))+'\n')
 extra=out/('corpus_'+name+'_extra');extra.mkdir(exist_ok=True);extra_rows=[]
 for r in rows:
  if r['matchId'] not in old_ids:
   r={**r,'file':os.path.relpath(corpus/r['file'],extra)};extra_rows.append(r)
 (extra/'index.json').write_text(json.dumps(extra_rows,indent=2));print(name,'total',len(rows),'cached',len(old_ids),'new',len(extra_rows))
shutil.copyfile(p/'features.json',out/'features.json')
proto={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'opponentSplits':assign,'splitCounts':dict(collections.Counter(assign.values())),'purpose':'Confirmation after initial positive history result. Original test opponents remain held out. Newly reserved test opponents were not in the initial dataset.','observerGames':400,'expertGames':220,'model':'Freeze initial validation-selected histogram booster:100 iterations,15 leaves,min40 samples/leaf,l2=2,learning_rate=.07. Same preprocessing and weighting. No new algorithm/hyperparameter search.','ablations':['state','own_history_only','enemy_history_only','history'],'BC':'Expert actions use the50 stronger-cohort teachers; current rank1 is a separate never-trained teacher.','sampling':'Same four largest-deficit maps per opponent; deliberately biased toward heavy losses; no population-rate claim.'};(out/'PROTOCOL.json').write_text(json.dumps(proto,indent=2))
