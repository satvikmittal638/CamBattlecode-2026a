from pathlib import Path
import json,sys,gzip
p=Path(sys.argv[1]);out={}
for variant in sorted((p/'games').iterdir()):
 if not variant.is_dir():continue
 a={k:{'games':0,'wins':0,'deaths':0,'earnedGold':0,'bank':0,'fuelExhaustions':0,'captures':0,'rounds':0} for k in ['all','normal','special']}
 for f in variant.rglob('*.json'):
  d=json.loads(gzip.decompress(f.with_suffix('.json.gz').read_bytes()) if f.with_suffix('.json.gz').exists() else f.read_text());me='teamA' if f.stem=='a' else 'teamB';kind='special' if f.parent.name in ['00contest','01boss-battle'] else 'normal'
  cs=[c for c in d['champions'] if c['team']==me];fuel=0;captures=set()
  for e in d['events']:
   if e['owner']['team']!=me:continue
   if e['kind']=='fuelExhausted':fuel+=len(e['entries'])
   if e['kind'] in ['gemCollection','goldCollection']:
    for q in e['entries']:
     if q.get('context')=='campGroup':captures.add((q['timestamp']['round'],q['target']['id']))
  for k in ['all',kind]:
   z=a[k];z['games']+=1;z['wins']+=d['match']['outcome']==me;z['rounds']+=d['match']['roundsStarted'];z['fuelExhaustions']+=fuel;z['captures']+=len(captures)
   for metric in ['deaths','earnedGold','submittedGems']:z['bank' if metric=='submittedGems' else metric]+=sum(float(c['metrics'][metric]) for c in cs)
 for z in a.values():
  n=max(1,z['games']);z['capturesPer100Rounds']=round(z['captures']*100/max(1,z['rounds']),3)
  for k in ['deaths','earnedGold','bank']:z[k]=round(z[k]/n,3)
 out[variant.name]=a
(p/'behavior_metrics.json').write_text(json.dumps(out,indent=2));print(json.dumps(out))
