from pathlib import Path
import json,hashlib,time,math
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.tree import DecisionTreeRegressor
p=Path(__file__).parent;root=p.resolve().parents[1];mp=json.loads((p/'map_features.json').read_text());mf={r['map']:r['features'] for r in mp['rows']};names=sorted(next(iter(mf.values())).keys())+['side_a'];records=[];source_hashes=[]
for folder in ['funnel_experiment','funnel_holdout','funnel_strong_holdout']:
 d=json.loads((root/'analysis/rank1_learning_2026-10-23'/folder/'results.json').read_text());assert not d['sourceChangedDuringTest'] and d['runnerExit']==0
 source_hashes.append({b:v['hash'] for b,v in d['exactSources'].items() if b in ['codex-v57-final','v58-funnel']})
 pairs={}
 for r in d['rows']:
  if r['variant'] not in ['base','v58-funnel']:continue
  assert not r['error'] if 'error' in r else True
  assert r['myFaults']==0
  k=(r['map'],r['opponent'],r['side']);pairs.setdefault(k,{})[r['variant']]=r
 for (m,o,side),a in pairs.items():
  assert set(a)=={'base','v58-funnel'}
  acts=[a['base'],a['v58-funnel']];reward=[float(r['win'])-.1*float(r['oppScore']-r['score']>=500)+.03*math.tanh((r['score']-r['oppScore'])/1000) for r in acts]
  records.append({'map':m,'opponent':o,'side':side,'features':[mf[m][n] for n in names[:-1]]+[int(side=='a')],'rewards':reward,'wins':[int(r['win']) for r in acts],'margins':[r['score']-r['oppScore'] for r in acts],'heavy':[int(r['oppScore']-r['score']>=500) for r in acts]})
assert len(records)==560
assert all(s==source_hashes[0] for s in source_hashes)
maps=sorted(mf,key=lambda m:hashlib.sha256(('mlrl-map-v1|'+m).encode()).hexdigest());map_split={m:('train' if i<24 else 'validation' if i<32 else 'test') for i,m in enumerate(maps)}
train_opp={'v56-frozen','codex-v57-final','v27'};val_opp={'mimic-shink','mimic-whim'};test_opp={'codex-v55','mimic-mite'}
sets={'train':[i for i,r in enumerate(records) if map_split[r['map']]=='train' and r['opponent'] in train_opp],'validation':[i for i,r in enumerate(records) if map_split[r['map']]=='validation' and r['opponent'] in val_opp],'test_new_maps_new_opponents':[i for i,r in enumerate(records) if map_split[r['map']]=='test' and r['opponent'] in test_opp],'test_new_maps_training_opponents':[i for i,r in enumerate(records) if map_split[r['map']]=='test' and r['opponent'] in train_opp],'test_new_opponents_all_maps':[i for i,r in enumerate(records) if r['opponent'] in test_opp]}
assert len(sets['train'])==144 and len(sets['validation'])==32 and len(sets['test_new_maps_new_opponents'])==32
protocol={'at':time.time(),'mapSplit':map_split,'trainOpponents':sorted(train_opp),'validationOpponents':sorted(val_opp),'testOpponents':sorted(test_opp),'stateFeatures':names,'reward':'win -0.1*(deficit>=500) +0.03*tanh(gem_margin/1000)','method':'Offline one-step contextual bandit, cached paired full-game engine rewards. REINFORCE samples an action and retrieves its recorded reward; action-independent mean-of-two counterfactual baseline reduces variance. No new engine games during optimization, no within-match RL.','trainingSeeds':[7,11,19,23,29],'trainingEpisodesPerSeed':30000,'selection':'Validation mean reward only, including fixed-policy baselines. Fixed features/hyperparameters; no test tuning.','historicalCaveat':'Game outcomes were collected in earlier bot experiments. These are model splits, not prospective new tournaments.'};(p/'bandit_protocol.json').write_text(json.dumps(protocol,indent=2))
X=np.array([r['features'] for r in records],float);rewards=np.array([r['rewards'] for r in records]);wins=np.array([r['wins'] for r in records]);margins=np.array([r['margins'] for r in records]);heavy=np.array([r['heavy'] for r in records]);tr=np.array(sets['train']);scaler=StandardScaler().fit(X[tr]);scaled=np.clip(scaler.transform(X),-5,5);xx=np.column_stack([np.ones(len(X)),scaled]);policies={'always_v57':np.zeros(len(X),int),'always_funnel':np.ones(len(X),int)};parameters={};curves={};t0=time.time()
for seed in protocol['trainingSeeds']:
 rng=np.random.default_rng(seed);theta=np.zeros(xx.shape[1]);curve=[]
 for t in range(30000):
  i=int(rng.choice(tr));prob=1/(1+math.exp(-float(np.clip(theta@xx[i],-20,20))));act=int(rng.random()<prob);reward=rewards[i,act];baseline=rewards[i].mean();grad=(reward-baseline)*(act-prob)*xx[i];grad[1:]-=.01*theta[1:];grad+=.01*math.log(max(1e-10,1-prob)/max(1e-10,prob))*prob*(1-prob)*xx[i];norm=np.linalg.norm(grad)
  if norm>5:grad*=5/norm
  theta+=.03/(1+t/10000)*grad
  if (t+1)%1000==0:
   choice=(xx@theta>=0).astype(int);a=np.array(sets['train']);v=np.array(sets['validation']);curve.append({'episodes':t+1,'trainReward':float(rewards[a,choice[a]].mean()),'validationReward':float(rewards[v,choice[v]].mean())})
 key='reinforce_seed'+str(seed);policies[key]=(xx@theta>=0).astype(int);parameters[key]=theta.tolist();curves[key]=curve
for key,model in [('ridge_advantage',Ridge(alpha=10)),('tree_advantage',DecisionTreeRegressor(max_depth=3,min_samples_leaf=12,random_state=17))]:
 model.fit(scaled[tr],rewards[tr,1]-rewards[tr,0]);policies[key]=(model.predict(scaled)>0).astype(int)
def evaluate(choice,ii):
 ii=np.array(ii);a=choice[ii];return {'games':len(ii),'wins':int(wins[ii,a].sum()),'winRate':round(float(wins[ii,a].mean()),5),'meanGemMargin':round(float(margins[ii,a].mean()),3),'heavyLosses':int(heavy[ii,a].sum()),'meanReward':round(float(rewards[ii,a].mean()),6),'funnelSelections':int(a.sum())}
scores={k:{s:evaluate(c,ii) for s,ii in sets.items()} for k,c in policies.items()};selected=max(scores,key=lambda k:scores[k]['validation']['meanReward']);mixture={}
for s,ii in sets.items():
 mixture[s]={'games':len(ii),'expectedWins':float(wins[ii].mean(axis=1).sum()),'meanReward':float(rewards[ii].mean()),'expectedHeavyLosses':float(heavy[ii].mean(axis=1).sum())}
result={'protocol':protocol,'sourceHashesVerifiedEqual':True,'cachedPairedContexts':560,'sets':{s:{'games':len(ii),'maps':len({records[i]['map'] for i in ii}),'opponents':len({records[i]['opponent'] for i in ii})} for s,ii in sets.items()},'scores':scores,'selectedOnValidation':selected,'randomMixture':mixture,'reinforceParameters':parameters,'learningCurves':curves,'seconds':round(time.time()-t0,2),'policySelections':{k:[{'map':r['map'],'opponent':r['opponent'],'side':r['side'],'action':int(c[i])} for i,r in enumerate(records)] for k,c in policies.items()},'limitations':['One action chooses an existing complete bot strategy; this is not fine-grained multi-agent RL.','Training episodes resample144 cached contexts, not150000 fresh games.','Primary double holdout is only32 games; no platform or policy-deployment claim.']};(p/'bandit_results.json').write_text(json.dumps(result,indent=2));print('Selected',selected);print(json.dumps({k:{s:v for s,v in q.items() if s.startswith('test_')} for k,q in scores.items()},indent=2))
