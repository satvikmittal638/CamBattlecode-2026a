from pathlib import Path
from urllib.parse import urlsplit,unquote
import json,hashlib,zipfile,re
p=Path(__file__).parent.resolve();load=lambda n:json.loads((p/n).read_text());target=load('submission_result.json');idx=load('games/index.json');native=load('native.json');rows=native['rows'];matches=load('matches.json');receipts=load('receipts.json');assert len(idx)==len(rows)==len(matches)==125;assert len({r['matchId'] for r in rows})==125;assert len(receipts)==len({r['teamId'] for r in receipts})==25;assert not native['errors'];assert all(r['version']==59 and '5' in r['myDraft'] for r in idx)
lookup={r['matchId']:r for r in matches}
for row in rows:
 assert all(row[k]==lookup[row['matchId']][k] for k in ['score','oppScore','result','rounds','side','map'])
 assert row['botErrors']==0
 pr=next(z for z in row['roles'] if z['team']==row['us'] and z['type']=='Prism');end=next(c for c in row['final'] if c['team']==row['us'] and c['type']=='Prism');assert pr['gemsCaptured']+pr['gemsStolen']-pr['gemsLost']==pr['gemsBanked']+end['gems']
 assert all(t['focusResidual']==0 for t in row['prismTurns'])
 with zipfile.ZipFile(p/'games'/row['file']) as z:assert z.testzip() is None
for row in load('submitted_source_hashes.json'):
 assert hashlib.sha256((p/'submitted_source'/row['path']).read_bytes()).hexdigest()==row['sha256']
 rel=row['path'].removeprefix('src/');assert (p/'submitted_source'/row['path']).read_bytes()==(p.parents[1]/'workspace/bots/prism-tempo/src'/rel).read_bytes()
local=0
for phase in ['development','refinement','holdout','tempo','validation']:
 r=load(phase+'/results.json');assert r['exit']==0 and not r['changed'];assert all(not x.get('error') and x['myFaults']==0 for x in r['rows']);local+=len(r['rows'])
assert local==1080
links=0
for link in re.findall(r'!?\[[^\]\n]*\]\(([^)]+)\)',(p/'README.md').read_text()):
 u=urlsplit(link)
 if not u.scheme:assert (p/unquote(u.path)).exists(),link;links+=1
out={'status':'passed','upload':target,'matchedPlatformMetadataGames':125,'uniqueOpponents':25,'sourceFilesVerified':len(load('submitted_source_hashes.json')),'allReplaysArchiveCRCChecked':125,'nativeSteps':sum(r['steps'] for r in rows),'nativeBotErrorsBothTeams':0,'prismGemConservationPassed':125,'prismFocusFormulaPassedTurns':sum(len(r['prismTurns']) for r in rows),'localGames':local,'localBotFaults':0,'newUploads':1,'acceptedChallenges':25,'relativeReadmeLinksChecked':links,'fuelAndLogs':load('log_audit.json')['summary']}
if (p/'restoration.json').exists():out['restoredActiveVersion']=load('restoration.json')['active']['version'];assert out['restoredActiveVersion']==58
(p/'VERIFICATION.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k not in ['upload','fuelAndLogs']},indent=2))
