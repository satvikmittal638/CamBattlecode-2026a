from pathlib import Path
import json,statistics as S,random,csv
D=Path(__file__).resolve().parent/'paired_c1';US='6b04505b-d16c-4196-b7c6-53a4688a32ca'
def rows(arm):
 p=D/arm;spec=json.loads((p/'specs.json').read_text());bylabel={x['label']:x for x in spec};a=json.loads((p/'platform/index.json').read_text())
 metrics=sum((json.loads(f.read_text()) for f in p.glob('metrics_?.json')),[]);mm={r['matchId']:r for r in metrics}
 for r in a:r['pool']=bylabel[r['label']]['pool'];r['rank']=bylabel[r['label']]['rank'];r['metric']=mm.get(r['matchId'])
 return a
A=rows('control');B=rows('candidate');key=lambda r:(r['label'],r['map'],r['side']);aa={key(r):r for r in A};bb={key(r):r for r in B};pairs=[]
for k in aa.keys()&bb.keys():
 a,b=aa[k],bb[k];pairs.append({'key':k,'pool':a['pool'],'opponent':a['opponent'],'rank':a['rank'],'baselineWin':a['result']=='win','candidateWin':b['result']=='win','delta':int(b['result']=='win')-int(a['result']=='win'),'marginDelta':(b['score']-b['oppScore'])-(a['score']-a['oppScore']),'a':a,'b':b})
pairs.sort(key=lambda p:p['key'])
def means(a):
 out={'n':len(a),'baselineWins':sum(p['baselineWin'] for p in a),'candidateWins':sum(p['candidateWin'] for p in a),'gains':sum(p['delta']==1 for p in a),'losses':sum(p['delta']==-1 for p in a),'meanMarginDelta':S.mean(p['marginDelta'] for p in a) if a else None}
 out['netWins']=out['candidateWins']-out['baselineWins']
 for mk in ['deaths','capGems','capGold','deathGems','kills','captures']:
  out[mk]=[S.mean(p[arm]['metric']['teams'][p[arm]['metric']['us']][mk] for p in a if p[arm]['metric']) if any(p[arm]['metric'] for p in a) else None for arm in ['a','b']]
 for mk in ['worth','equipment','capGold','capGems','deaths']:
  out[mk+'300']=[S.mean(p[arm]['metric']['teams'][p[arm]['metric']['us']]['checkpoints']['300'][mk] for p in a if p[arm]['metric'] and '300' in p[arm]['metric']['teams'][p[arm]['metric']['us']]['checkpoints']) if any(p[arm]['metric'] and '300' in p[arm]['metric']['teams'][p[arm]['metric']['us']]['checkpoints'] for p in a) else None for arm in ['a','b']]
 return out
summary={'pairedGames':len(pairs),'all':means(pairs),'strong':means([p for p in pairs if p['pool']=='strong']),'near':means([p for p in pairs if p['pool']=='near']),'maps':{m:means([p for p in pairs if p['key'][1]==m]) for m in sorted({p['key'][1] for p in pairs})},'opponents':{l:means([p for p in pairs if p['key'][0]==l]) for l in sorted({p['key'][0] for p in pairs})}}
clusters=list(summary['opponents']);rng=random.Random(121);samples=[]
if len(pairs)==100:
 for _ in range(10000):samples.append(sum(summary['opponents'][rng.choice(clusters)]['netWins'] for _ in clusters))
 samples.sort();summary['clusterBootstrapNetWins95']=[samples[250],samples[9749]]
(D/'comparison.json').write_text(json.dumps(summary,indent=2));(D/'pairs.json').write_text(json.dumps(pairs))
with (D/'paired_matches.csv').open('w') as f:
 w=csv.writer(f);w.writerow(['label','map','side','pool','opponent','baselineWin','candidateWin','winDelta','marginDelta','baselineScore','baselineOppScore','candidateScore','candidateOppScore'])
 for p in pairs:w.writerow([*p['key'],p['pool'],p['opponent'],p['baselineWin'],p['candidateWin'],p['delta'],p['marginDelta'],p['a']['score'],p['a']['oppScore'],p['b']['score'],p['b']['oppScore']])
print({k:summary[k] for k in ['pairedGames','all','strong','near']});print('cluster CI',summary.get('clusterBootstrapNetWins95'))
