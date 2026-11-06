import json,sys,math,random,collections
from pathlib import Path
base,cand,planfile=sys.argv[1:4]
def loadarms(labels):
 ds=[json.load(open(f'autoresearch/online_runs/{label}/results.json')) for label in labels.split(',')]
 assert len({d['version'] for d in ds})==1
 return {'version':ds[0]['version'],'games':[g for d in ds for g in d['games']],'wrongVersion':[g for d in ds for g in d['wrongVersion']]}
plan={'specs':[s for p in planfile.split(',') for s in json.load(open(p))['specs']]}
B=loadarms(base);C=loadarms(cand)
key=lambda g:(g['label'],g['map'],g['side']);bb={key(g):g for g in B['games']};targets={(s['label'],m):t for s in plan['specs'] for m,t in zip(s['maps'],s['target'])};pairs=[]
assert len(bb)==len(B['games'])==len(C['games'])
for c in C['games']:
 b=bb[key(c)];pairs.append({'key':key(c),'target':targets[c['label'],c['map']],'class':c['cls'],'pool':c['pool'],'map':c['map'],'baseline':b,'candidate':c,'delta':int(c['result']=='win')-int(b['result']=='win'),'margin':c['score']-c['oppScore']-b['score']+b['oppScore']})
def summary(rs):
 g=sum(r['delta']==1 for r in rs);l=sum(r['delta']==-1 for r in rs);n=g+l
 return {'n':len(rs),'bw':sum(r['baseline']['result']=='win' for r in rs),'cw':sum(r['candidate']['result']=='win' for r in rs),'gain':g,'loss':l,'net':g-l,'marginPerGame':sum(r['margin'] for r in rs)/len(rs),'descriptivePairedP':min(1,2*sum(math.comb(n,k) for k in range(min(g,l)+1))/2**n) if n else 1}
parts={'all':pairs,'target':[r for r in pairs if r['target']],'other':[r for r in pairs if not r['target']],'weak':[r for r in pairs if r['class']=='weak'],'strong':[r for r in pairs if r['class']=='strong'],'near':[r for r in pairs if r['pool']=='near'],'half':[r for r in pairs if r['pool']=='half']};stats={k:summary(v) for k,v in parts.items()}
pools={p:collections.defaultdict(int) for p in ['near','half']}
for r in pairs:pools[r['pool']][r['key'][0]]+=r['delta']
rng=random.Random(261101);samples=sorted(sum(sum(rng.choices(list(v.values()),k=len(v))) for v in pools.values())/len(pairs) for _ in range(10000))
audit={'wrongVersions':len(B['wrongVersion'])+len(C['wrongVersion']),'botErrors':sum(bool(g.get('botError')) for g in B['games']+C['games']),'unfinishedMatches':sum(g['status']!='finished' for g in B['games']+C['games'])}
out={'baseline':base,'candidate':cand,'versions':[B['version'],C['version']],'audit':audit,'stats':stats,'opponentBlock95WinRateDelta':[samples[250],samples[9749]],'byMap':{m:summary([r for r in pairs if r['map']==m]) for m in sorted({r['map'] for r in pairs})},'pairs':pairs}
if len(sys.argv)>4:Path(sys.argv[4]).write_text(json.dumps(out,indent=2))
print(json.dumps({k:v for k,v in out.items() if k not in ['pairs','byMap']},indent=2))
