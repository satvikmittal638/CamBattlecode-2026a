from pathlib import Path
import json,time,collections,warnings
import numpy as np,joblib,sklearn
from sklearn.preprocessing import StandardScaler,OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score,balanced_accuracy_score,f1_score,confusion_matrix,log_loss
from sklearn.utils.class_weight import compute_sample_weight
p=Path(__file__).parent/'confirmation';meta=json.loads((p/'features.json').read_text());base=len(meta['base']);report={'sklearn':sklearn.__version__,'protocol':'PROTOCOL.json','tasks':{},'warnings':[]};rng=np.random.default_rng(20261023)

def metric(y,pred,prob,groups,K):
 out={'n':len(y),'games':len(set(groups)),'accuracy':float(accuracy_score(y,pred)),'balancedAccuracy':float(balanced_accuracy_score(y,pred)),'macroF1':float(f1_score(y,pred,labels=range(K),average='macro',zero_division=0)),'classCounts':np.bincount(y,minlength=K).tolist(),'confusion':confusion_matrix(y,pred,labels=range(K)).tolist()}
 if prob is not None:out.update(logLoss=float(log_loss(y,prob,labels=range(K))),brier=float(np.mean(np.sum((prob-np.eye(K)[y])**2,axis=1))))
 return out

def cluster_ci(y,a,b,teachers,K):
 # Resample entire opponent teams, not correlated frames.
 names=np.unique(teachers);cms=[]
 for t in names:
  ix=teachers==t;cms.append([confusion_matrix(y[ix],pred[ix],labels=range(K)) for pred in (a,b)])
 cms=np.asarray(cms);rr=np.random.default_rng(20261023);deltas=[]
 def f1(cm):
  den=cm.sum(0)+cm.sum(1);return np.mean(np.divide(2*np.diag(cm),den,out=np.zeros(K,dtype=float),where=den>0))
 for _ in range(2000):
  cm=cms[rr.integers(len(names),size=len(names))].sum(0);deltas.append(f1(cm[0])-f1(cm[1]))
 return {'teams':len(names),'pairedMacroF1Difference':float(f1(cms[:,0].sum(0))-f1(cms[:,1].sum(0))),'bootstrap95':np.quantile(deltas,[.025,.975]).tolist(),'resamples':2000}

for task,name,expected,K in [('motion','observer',400,3),('action','expert',220,8)]:
 start=time.time();coverage=[];rows=[]
 with (p/(name+'.jsonl')).open('w') as dest:
  for part in ['cached','extra']:
   for line in (p/(name+'_'+part+'.jsonl')).open():
    r=json.loads(line);dest.write(line)
    if r['task']=='coverage':coverage.append(r)
    elif r['task']==task:rows.append(r)
 assert len(coverage)==expected and len({r['g'] for r in coverage})==expected
 splits={s:{r['teacher'] for r in coverage if r['split']==s} for s in {r['split'] for r in coverage}}
 for a,aa in splits.items():
  for b,bb in splits.items():
   if a!=b:assert not aa&bb,(a,b)
 X=np.array([r['x'] for r in rows],dtype=np.float32);assert X.shape[1]==base+len(meta['history']) and np.isfinite(X).all()
 y=np.array([r['y'] for r in rows]);split=np.array([r['split'] for r in rows]);groups=np.array([r['g'] for r in rows]);teachers=np.array([r['teacher'] for r in rows]);prev=np.array([r['prev'] for r in rows]);del rows
 train=np.flatnonzero(split=='train');bygame=collections.defaultdict(list)
 for i in train:bygame[groups[i]].append(i)
 selected=[]
 for g,inds in bygame.items():selected.extend(rng.choice(inds,size=min(2000,len(inds)),replace=False))
 train=np.array(sorted(selected));weights=np.array([1/len(bygame[groups[i]]) for i in train]);weights*=compute_sample_weight('balanced',y[train]);weights/=weights.mean()
 evals={s:np.flatnonzero(split==s) for s in ['validation','test','test_initial','test_fish'] if np.any(split==s)}
 majority=int(np.bincount(y[train],minlength=K).argmax());prior=np.bincount(y[train],minlength=K)/len(train)
 result={'rows':len(y),'games':expected,'trainingRowsUsed':len(train),'trainingGames':len(set(groups[train])),'trainingTeachers':len(set(teachers[train])),'splitTeachers':{s:len(ts) for s,ts in splits.items()},'baselines':{},'models':{},'classes':meta['motion' if task=='motion' else 'actions']};preds={};baseline='previous_observed_motion' if task=='motion' else 'previous_own_action'
 for s,ix in evals.items():
  pers=np.where((prev[ix]>=0)&(prev[ix]<K),prev[ix],majority);preds[(baseline,s)]=pers
  result['baselines'][s]={baseline:metric(y[ix],pers,None,groups[ix],K),'training_majority':metric(y[ix],np.full(len(ix),majority),np.repeat(prior[None,:],len(ix),axis=0),groups[ix],K)}
 variants={'state':list(range(base)),'history':list(range(X.shape[1]))}
 if task=='motion':variants.update(own_history_only=list(range(base+4)),enemy_history_only=list(range(base))+list(range(base+4,X.shape[1])))
 for variant,cols in variants.items():
  t=time.time();pre=ColumnTransformer([('types',OneHotEncoder(handle_unknown='ignore',sparse_output=False),[0,1]),('numeric',StandardScaler(),list(range(2,len(cols))))],remainder='drop')
  xt=pre.fit_transform(X[train][:,cols]);model=HistGradientBoostingClassifier(max_iter=100,max_leaf_nodes=15,min_samples_leaf=40,l2_regularization=2,learning_rate=.07,early_stopping=False,random_state=17)
  with warnings.catch_warnings(record=True) as caught:
   warnings.simplefilter('always');model.fit(xt,y[train],sample_weight=weights)
  report['warnings'].extend({'task':task,'variant':variant,'warning':str(w.message)} for w in caught);values={}
  for s,ix in evals.items():
   raw=model.predict_proba(pre.transform(X[ix][:,cols]));prob=np.zeros((len(ix),K));prob[:,model.classes_.astype(int)]=raw;pred=np.argmax(prob,axis=1);preds[(variant,s)]=pred;values[s]=metric(y[ix],pred,prob,groups[ix],K)
  result['models'][variant]={'seconds':time.time()-t,'columns':cols,'scores':values};joblib.dump({'preprocess':pre,'model':model,'columns':cols,'featureNames':[(meta['base']+meta['history'])[i] for i in cols]},p/(task+'_'+variant+'.joblib'))
  print(task,variant,'new test',values['test'],'seconds',round(time.time()-t,1),flush=True)
 result['pairedTeamBootstrap']={}
 for opponent in ['state',baseline]+(['own_history_only','enemy_history_only'] if task=='motion' else []):
  ix=evals['test'];result['pairedTeamBootstrap']['history_vs_'+opponent]=cluster_ci(y[ix],preds[('history','test')],preds[(opponent,'test')],teachers[ix],K)
 result['seconds']=time.time()-start;report['tasks'][task]=result;(p/'results.json').write_text(json.dumps(report,indent=2))
 print('Completed',task,flush=True)
print('All confirmation experiments complete',flush=True)
