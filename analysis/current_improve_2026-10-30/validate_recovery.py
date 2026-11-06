from pathlib import Path
import json,hashlib,collections
D=Path(__file__).resolve().parent;P=D/'paired_recovery';U='6b04505b-d16c-4196-b7c6-53a4688a32ca';out={}
for arm,ver in [('control',128),('candidate',129)]:
 A=P/arm;spec=json.loads((A/'specs.json').read_text());groups=[json.loads((A/'groups'/ (l.split('\t')[-1]+'.json')).read_text())for l in (A/'challenges.txt').read_text().strip().splitlines()];ms=[m for g in groups for m in g['matches']];idx=json.loads((A/'platform/index.json').read_text());metrics=sum((json.loads(f.read_text())for f in A.glob('metrics_?.json')),[]);visual=json.loads((A/'visual.json').read_text())
 assert len(groups)==20 and len(ms)==100 and len({m['id']for m in ms})==100
 assert all(m['status']=='finished'and not m.get('errorCode') and next(s for s in m['sides']if s['teamId']==U)['version']==ver and not next(s for s in m['sides']if s['teamId']==U).get('botError')for m in ms)
 assert len(idx)==len(metrics)==len(visual)==100
 assert set(r['matchId']for r in idx)==set(r['matchId']for r in metrics)==set(r['matchId']for r in visual)
 assert len({s['teamId']for s in spec})==20
 for pool in ['near','strong']:
  ss=[s for s in spec if s['pool']==pool];assert len(ss)==10;assert collections.Counter(x for s in ss for x in s['sides'])=={'a':25,'b':25}
 out[arm]={'version':ver,'groups':20,'matches':100,'replayMetrics':100,'visualExtractions':100,'wins':sum(r['result']=='win'for r in idx),'botErrors':0}
want=json.loads((D/'recovery_source_hashes.json').read_text());src=D/'recovery_uploaded/src';got={p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in src.iterdir()if p.is_file()};assert got==want
out['source']={'version':129,'uploadedHashMatches':22};(D/'recovery_validation.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
