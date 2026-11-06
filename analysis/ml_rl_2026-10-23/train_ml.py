from pathlib import Path
import json,time,collections,hashlib,os,warnings
import numpy as np,sklearn,scipy
from sklearn.preprocessing import StandardScaler,OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import ExtraTreesClassifier,HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score,balanced_accuracy_score,f1_score,confusion_matrix,log_loss
from sklearn.utils.class_weight import compute_sample_weight
import joblib
p=Path(__file__).parent;meta=json.loads((p/'features.json').read_text());report={'versions':{'sklearn':sklearn.__version__,'numpy':np.__version__,'scipy':scipy.__version__},'tasks':{},'warnings':[]};rng=np.random.default_rng(20261023)

def load(name,task,expected):
 rows=[];coverage=[]
 for line in (p/(name+'.jsonl')).open():
  r=json.loads(line)
  if r['task']=='coverage':coverage.append(r)
  elif r['task']==task:rows.append(r)
 assert len(coverage)==expected and len({r['g'] for r in coverage})==expected
 assert all(len(r['x'])==len(meta['base'])+len(meta['history']) for r in rows)
 assert all(np.isfinite(r['x']).all() for r in rows)
 splits={s:{r['teacher'] for r in coverage if r['split']==s} for s in {r['split'] for r in coverage}}
 for a,aa in splits.items():
  for b,bb in splits.items():
   if a!=b:assert not aa.intersection(bb),(a,b)
 return rows,coverage

def metric(y,pred,prob,groups,K):
 gam=collections.defaultdict(list)
 for a,b,g in zip(y,pred,groups):gam[g].append(a==b)
 out={'n':len(y),'games':len(gam),'accuracy':round(float(accuracy_score(y,pred)),5),'balancedAccuracy':round(float(balanced_accuracy_score(y,pred)),5),'macroF1':round(float(f1_score(y,pred,labels=range(K),average='macro',zero_division=0)),5),'meanGameAccuracy':round(float(np.mean([np.mean(v) for v in gam.values()])),5),'classCounts':np.bincount(y,minlength=K).tolist(),'confusion':confusion_matrix(y,pred,labels=range(K)).tolist()}
 if prob is not None:
  out['logLoss']=round(float(log_loss(y,prob,labels=range(K))),5);out['brier']=round(float(np.mean(np.sum((prob-np.eye(K)[y])**2,axis=1))),5)
 return out

for task,name,expected,K in [('motion','observer',80,3),('action','expert',100,8)]:
 t0=time.time();rows,coverage=load(name,task,expected);X=np.array([r['x'] for r in rows],dtype=np.float32);y=np.array([r['y'] for r in rows]);split=np.array([r['split'] for r in rows]);groups=np.array([r['g'] for r in rows]);prev=np.array([r['prev'] for r in rows]);teachers=np.array([r['teacher'] for r in rows]);assert set(y)<=set(range(K))
 train=np.flatnonzero(split=='train');bygame=collections.defaultdict(list)
 for i in train:bygame[groups[i]].append(i)
 selected=[]
 for g,inds in bygame.items():selected.extend(rng.choice(inds,size=min(2000,len(inds)),replace=False))
 train=np.array(sorted(selected));weights=np.array([1/len(bygame[groups[i]]) for i in train]);weights*=compute_sample_weight('balanced',y[train]);weights/=weights.mean()
 evals={s:np.flatnonzero(split==s) for s in ['validation','test','test_fish'] if np.any(split==s)};majority=int(np.bincount(y[train],minlength=K).argmax());prior=np.bincount(y[train],minlength=K)/len(train)
 result={'rows':len(rows),'trainingRowsUsed':len(train),'trainingGames':len(set(groups[train])),'trainingTeachers':len(set(teachers[train])),'classes':meta['motion'] if task=='motion' else meta['actions'],'selection':'Choose model per feature set by validation macro-F1 only; report all test scores. Models and hyperparameters fixed before training. Training weighting balances action classes and games; training capped at2000 examples/game.','baselines':{},'models':{},'selected':{}}
 for s,inds in evals.items():
  prob=np.repeat(prior[None,:],len(inds),axis=0);pers=np.where((prev[inds]>=0)&(prev[inds]<K),prev[inds],majority)
  result['baselines'][s]={'training_majority':metric(y[inds],np.full(len(inds),majority),prob,groups[inds],K),'previous_observed_motion' if task=='motion' else 'previous_own_action':metric(y[inds],pers,None,groups[inds],K)}
 for variant,dim in [('state',len(meta['base'])),('history',X.shape[1])]:
  preprocess=ColumnTransformer([('types',OneHotEncoder(handle_unknown='ignore',sparse_output=False),[0,1]),('numeric',StandardScaler(),list(range(2,dim)))],remainder='drop')
  xt=preprocess.fit_transform(X[train,:dim]);xe={s:preprocess.transform(X[inds,:dim]) for s,inds in evals.items()}
  models={'logistic':LogisticRegression(C=.15,max_iter=500,tol=.0005),'extra_trees':ExtraTreesClassifier(n_estimators=160,max_depth=14,min_samples_leaf=15,max_features=.8,n_jobs=4,random_state=17),'hist_boost':HistGradientBoostingClassifier(max_iter=100,max_leaf_nodes=15,min_samples_leaf=40,l2_regularization=2,learning_rate=.07,early_stopping=False,random_state=17)}
  for model_name,model in models.items():
   start=time.time()
   with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter('always');model.fit(xt,y[train],sample_weight=weights)
   key=variant+'_'+model_name;values={}
   for s,inds in evals.items():
    raw=model.predict_proba(xe[s]);prob=np.zeros((len(inds),K));prob[:,model.classes_.astype(int)]=raw;pred=np.argmax(prob,axis=1);values[s]=metric(y[inds],pred,prob,groups[inds],K)
   result['models'][key]={'seconds':round(time.time()-start,2),'features':dim,'scores':values};report['warnings'].extend({'task':task,'model':key,'warning':str(w.message)} for w in caught)
   joblib.dump({'preprocess':preprocess,'model':model,'featureNames':(meta['base']+meta['history'])[:dim]},p/(task+'_'+key+'.joblib'))
   print(task,key,'validation F1',values['validation']['macroF1'],'test F1',values['test']['macroF1'],flush=True)
  keys=[k for k in result['models'] if k.startswith(variant+'_')];result['selected'][variant]=max(keys,key=lambda k:result['models'][k]['scores']['validation']['macroF1'])
 result['seconds']=round(time.time()-t0,2);report['tasks'][task]=result;(p/'ml_results.json').write_text(json.dumps(report,indent=2))
print('All supervised experiments complete',flush=True)
