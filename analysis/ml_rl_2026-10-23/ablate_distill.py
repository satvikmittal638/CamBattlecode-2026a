from pathlib import Path
import json,time,collections,subprocess
import numpy as np,joblib
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score,balanced_accuracy_score,f1_score
from sklearn.utils.class_weight import compute_sample_weight
p=Path(__file__).parent;meta=json.loads((p/'features.json').read_text());original=json.loads((p/'ml_results.json').read_text());B=len(meta['base']);rng=np.random.default_rng(20261023);report={'purpose':'Exploratory fixed-parameter history attribution and model compression, after the initial experiment. No retuning based on test scores; all variants reported.','tasks':{}}
def score(y,z):return {'accuracy':round(float(accuracy_score(y,z)),5),'balancedAccuracy':round(float(balanced_accuracy_score(y,z)),5),'macroF1':round(float(f1_score(y,z,labels=range(3 if task=='motion' else 8),average='macro',zero_division=0)),5),'n':len(y)}
def header(model,fn):
 tree=model.tree_;lines=['// Research model only; not enabled in v57. Input order: features.json base + history.','#pragma once',f'inline int {fn}(const float* x) {{']
 def rec(n,depth):
  pad='  '*depth
  if tree.children_left[n]<0:lines.append(pad+'return '+str(int(model.classes_[np.argmax(tree.value[n][0])]))+';');return
  feature=int(tree.feature[n]);th=float(tree.threshold[n]);lines.append(pad+f'if (x[{feature}] <= {th:.17g}) {{');rec(tree.children_left[n],depth+1);lines.append(pad+'} else {');rec(tree.children_right[n],depth+1);lines.append(pad+'}')
 rec(0,1);lines.append('}');return '\n'.join(lines)+'\n'
parity=[]
for task,file in [('motion','observer'),('action','expert')]:
 rows=[json.loads(x) for x in (p/(file+'.jsonl')).read_text().splitlines()];rows=[r for r in rows if r['task']==task];X=np.array([r['x'] for r in rows],dtype=np.float32);y=np.array([r['y'] for r in rows]);split=np.array([r['split'] for r in rows]);groups=np.array([r['g'] for r in rows]);train=np.flatnonzero(split=='train');bygame=collections.defaultdict(list)
 for i in train:bygame[groups[i]].append(i)
 selected=[]
 for g,inds in bygame.items():selected.extend(rng.choice(inds,min(2000,len(inds)),replace=False))
 train=np.array(sorted(selected));w=np.array([1/len(bygame[groups[i]]) for i in train]);w*=compute_sample_weight('balanced',y[train]);w/=w.mean();ev={s:np.flatnonzero(split==s) for s in ['validation','test','test_fish'] if np.any(split==s)};result={'ablations':{},'students':{}}
 if task=='motion':
  for name,cols in [('own_history_only',list(range(B))+list(range(B,B+4))),('enemy_history_only',list(range(B))+list(range(B+4,X.shape[1])))]:
   m=HistGradientBoostingClassifier(max_iter=100,max_leaf_nodes=15,min_samples_leaf=40,l2_regularization=2,learning_rate=.07,early_stopping=False,random_state=17);m.fit(X[train][:,cols],y[train],sample_weight=w);result['ablations'][name]={s:score(y[ii],m.predict(X[ii][:,cols])) for s,ii in ev.items()}
 teacher=joblib.load(p/(task+'_history_hist_boost.joblib'));teacher_labels=teacher['model'].predict(teacher['preprocess'].transform(X[train]));models={}
 for depth in [5,8]:
  m=DecisionTreeClassifier(max_depth=depth,min_samples_leaf=40,class_weight='balanced',random_state=17);m.fit(X[train],teacher_labels,sample_weight=np.array([1/len(bygame[groups[i]]) for i in train]));key='depth'+str(depth);models[key]=m;result['students'][key]={'nodes':m.tree_.node_count,'depth':m.tree_.max_depth,'scores':{s:score(y[ii],m.predict(X[ii])) for s,ii in ev.items()}};print(task,key,result['students'][key],flush=True)
 best=max(models,key=lambda key:result['students'][key]['scores']['validation']['macroF1']);m=models[best];result['selectedStudent']=best;(p/(task+'_student.h')).write_text(header(m,task+'_student_predict'));joblib.dump(m,p/(task+'_student.joblib'))
 ii=np.concatenate([v[:2000] for k,v in ev.items() if k!='validation']);pred=m.predict(X[ii]);parity.extend((task,int(pred[j]),X[i]) for j,i in enumerate(ii));report['tasks'][task]=result
# Cross-language validation on real held-out feature vectors.
cpp='#include <iostream>\n#include "motion_student.h"\n#include "action_student.h"\nint main(){int mode;float x['+str(B+len(meta['history']))+'];while(std::cin>>mode){for(float &v:x)if(!(std::cin>>v))return 2;std::cout<<(mode==0?motion_student_predict(x):action_student_predict(x))<<"\\n";}}\n';(p/'student_predict.cpp').write_text(cpp)
subprocess.run(['clang++','-O2','-std=c++17',str(p/'student_predict.cpp'),'-o',str(p/'student_predict')],check=True)
payload=''.join(str(0 if task=='motion' else 1)+' '+' '.join(format(float(v),'.9g') for v in x)+'\n' for task,_,x in parity)
r=subprocess.run([str(p/'student_predict')],input=payload,text=True,capture_output=True,check=True);actual=list(map(int,r.stdout.split()));expected=[v for _,v,_ in parity];assert actual==expected
report['cppParity']={'heldOutVectors':len(parity),'mismatches':0,'maxComparisonsPerPrediction':max(x['students'][x['selectedStudent']]['depth'] for x in report['tasks'].values()),'caveat':'Only inference code was cross-checked; full in-game feature extraction and Wasm fuel were not benchmarked.'};(p/'ablation_distillation.json').write_text(json.dumps(report,indent=2));print('C++ parity verified:',report['cppParity'],flush=True)
