from pathlib import Path
import hashlib,json,datetime
p=Path(__file__).parent;root=p.parent.parent
rows=json.loads((root/'analysis/v57_eval_2026-10-23/source_hashes.json').read_text());checked=[]
for row in rows:
 path=root/'workspace/bots/codex-v57-final'/row['path'];sha=hashlib.sha256(path.read_bytes()).hexdigest();assert sha==row['sha256'],str(path);checked.append({'path':str(path.relative_to(root)),'sha256':sha})
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'v57SourceFilesUnchanged':len(checked),'v57SourceHashes':checked,'modelsDeployed':False,'newPlatformChallenges':0,'checks':[]}
for stem,expected in [('observer',400),('expert',220)]:
 log=(p/'confirmation'/(stem+'_extract.log')).read_text();assert log.rstrip().endswith('errors 0')
 coverage=[];counts={};n=0
 with (p/'confirmation'/(stem+'.jsonl')).open() as f:
  for line in f:
   r=json.loads(line)
   if r['task']=='coverage':coverage.append(r);continue
   n+=1;counts[r['split']]=counts.get(r['split'],0)+1
 assert len(coverage)==expected and len({r['g'] for r in coverage})==expected
 result['checks'].append({'dataset':stem,'coverage':len(coverage),'examples':n,'splits':counts,'nativeDecodeErrors':0})
result['files']={str(f.relative_to(p)):hashlib.sha256(f.read_bytes()).hexdigest() for f in [p/'extract.mjs',p/'train_confirm.py',p/'train_bandit.py',p/'confirmation/PROTOCOL.json',p/'confirmation/results.json',p/'bandit_results.json',p/'docs_verification.json']}
(p/'VERIFICATION.json').write_text(json.dumps(result,indent=2));print(json.dumps({k:v for k,v in result.items() if k not in ['v57SourceHashes','files']},indent=2))
