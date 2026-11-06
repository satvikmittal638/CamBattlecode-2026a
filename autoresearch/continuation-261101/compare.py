import json,collections,math,random
from pathlib import Path
P=Path('autoresearch/continuation-261101')
labels=['s19_baseline','s19_candidate','s20_candidate','s20_v114']
arms={a:json.load(open(f'autoresearch/online_runs/{a}/results.json')) for a in labels if Path(f'autoresearch/online_runs/{a}/results.json').exists()}
key=lambda g:(g['label'],g['map'],g['side'])
out={}
for base in ['s19_baseline','s19_candidate','s20_v114']:
 if base not in arms or 's20_candidate' not in arms:continue
 B={key(g):g for g in arms[base]['games']};pairs=[]
 for c in arms['s20_candidate']['games']:
  b=B[key(c)];pairs.append({'key':key(c),'pool':c['pool'],'class':c['cls'],'map':c['map'],'b':b,'c':c,'delta':int(c['result']=='win')-int(b['result']=='win'),'margin':c['score']-c['oppScore']-b['score']+b['oppScore']})
 def summary(rows):
  gains=sum(r['delta']==1 for r in rows);losses=sum(r['delta']==-1 for r in rows);n=gains+losses
  return {'n':len(rows),'baselineWins':sum(r['b']['result']=='win' for r in rows),'candidateWins':sum(r['c']['result']=='win' for r in rows),'gains':gains,'losses':losses,'net':gains-losses,'marginPerGame':sum(r['margin'] for r in rows)/len(rows),'descriptiveMcNemarP':min(1,2*sum(math.comb(n,k) for k in range(min(gains,losses)+1))/2**n) if n else 1}
 parts={'all':pairs,'incomeTarget':[r for r in pairs if r['map']=='adgato_gemcombat1'],'other':[r for r in pairs if r['map']!='adgato_gemcombat1'],'weak':[r for r in pairs if r['class']=='weak'],'strong':[r for r in pairs if r['class']=='strong'],'near':[r for r in pairs if r['pool']=='near'],'half':[r for r in pairs if r['pool']=='half']}
 result={k:summary(v) for k,v in parts.items()}
 # Resample opponent blocks within each rank pool, preserving the paired maps.
 pools={p:collections.defaultdict(int) for p in ['near','half']}
 for r in pairs:pools[r['pool']][r['key'][0]]+=r['delta']
 rng=random.Random(261101);samples=[]
 for _ in range(10000):samples.append(sum(sum(rng.choices(list(v.values()),k=len(v))) for v in pools.values())/len(pairs))
 samples.sort();result['opponentBlock95WinRateDelta']=[samples[250],samples[9749]]
 result['wrongVersions']=len(arms[base]['wrongVersion'])+len(arms['s20_candidate']['wrongVersion']);result['botErrors']=sum(bool(g.get('botError')) for g in arms[base]['games']+arms['s20_candidate']['games'])
 out[base]=result
(P/'comparison.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
