from pathlib import Path
import json,hashlib,datetime,collections
root=Path(__file__).resolve().parents[2];p=Path(__file__).parent
read=lambda f:json.loads(f.read_text())
base=root/'analysis/v57_eval_2026-10-23';idx=read(base/'games/index.json');receipts=read(base/'receipts.json');bygroup=collections.defaultdict(list)
for g in idx:bygroup[g['groupId']].append(g)
selected=sorted([r for r in receipts if r['pool']=='half'],key=lambda r:r['rank'])[:20]
ids=sorted([r['teamId'] for r in selected],key=lambda v:hashlib.sha256(('mlrl-fixed-v1|'+v).encode()).hexdigest())
assignment={v:('train' if i<14 else 'validation' if i<17 else 'test') for i,v in enumerate(ids)}
observer=[];expert=[]
for r in selected:
 # Focus on decisive defeats while retaining four different maps per opponent.
 games=sorted(bygroup[r['groupId']],key=lambda g:(g['score']-g['oppScore'],g['map']))[:4]
 for g in games:
  common={**g,'opponentId':r['teamId'],'teacherId':r['teamId'],'split':assignment[r['teamId']],'selectionRank':r['rank']}
  original=base/'games'/g['file']
  for rows,name,side,role in [(observer,'observer',g['side'],'observer'),(expert,'expert','b' if g['side']=='a' else 'a','expert')]:
   dest=p/('corpus_'+name);dest.mkdir(exist_ok=True)
   import os
   row={**common,'file':os.path.relpath(original,dest),'side':side,'learningRole':role}
   if role=='expert':row.update(result='win' if g['result']=='loss' else 'loss',score=g['oppScore'],oppScore=g['score'],myDraft=g['oppDraft'],oppDraft=g['myDraft'])
   rows.append(row)
fish=root/'analysis/rank1_learning_2026-10-23';fishid=read(fish/'team.json')['teamId']
for g in read(fish/'games/index.json'):
 import os
 expert.append({**g,'file':os.path.relpath(fish/'games'/g['file'],p/'corpus_expert'),'teacherId':fishid,'split':'test_fish','learningRole':'expert'})
for name,rows in [('observer',observer),('expert',expert)]:
 (p/('corpus_'+name)/'index.json').write_text(json.dumps(rows,indent=2))
assert len(observer)==80 and len(expert)==100
protocol={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceVersion':57,'sourceUnchanged':True,'scope':'Offline ML and cached local-game contextual-bandit experiments; no active bot changes/uploads.','selection':'Twenty strongest half-cohort opponents, four largest-deficit maps per opponent; intentionally heavy-loss-biased, not population-representative. Add20 current rank1 games as separate unseen-teacher imitation holdout.','observerGames':80,'expertGames':100,'opponentSplits':assignment,'splitSizes':dict(collections.Counter(assignment.values())),'features':'Personal API observations at own turn start only; IDs, source names, match outcomes, future actions and map names excluded from model features. History updates only from already observed frames.','MLTargets':['Next visible enemy approach / unchanged-distance / retreat, with and without observed history','Expert own-turn action category; behavioral imitation is not an optimal-action or win-rate claim.'],'MLModels':['Training-majority / persistence baselines','Regularized multinomial logistic regression','Extra trees','Histogram gradient boosting'],'evaluation':'Opponent-disjoint train/validation/test; rank1 teacher entirely separate. Report macro-F1, balanced accuracy, per-game accuracy and class prevalence. No random-frame split. No per-frame accuracy claim of strategy improvement.','RL':'Offline single-decision contextual bandit (REINFORCE) choosing v57 or Vesper-funnel at draft, from paired cached whole-game engine outcomes. Not multi-turn PPO. Group holdout maps and reserve opponent controllers. Compare fixed policies and random mixture.','deployment':'Any predictive gain requires a subsequent policy/in-engine trial; do not upload an offline accuracy result.'}
(p/'PROTOCOL.json').write_text(json.dumps(protocol,indent=2));print({'observer':len(observer),'expert':len(expert),'splits':protocol['splitSizes']})
