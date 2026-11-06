# Native behavioral audit of recorded candidate matches. No platform mutations.
import json,subprocess,concurrent.futures,re,sys
from pathlib import Path
D=Path(__file__).resolve().parent;ROOT=D.parents[1]
index=Path(sys.argv[1]);out=Path(sys.argv[2]);bot=sys.argv[3] if len(sys.argv)>3 else 'v114-remedy-trace'
rows=json.loads(index.read_text());out.mkdir(parents=True,exist_ok=True)
# Audit all losses and a small winning reference sample; retain compact mechanism turns.
rows=[r for r in rows if not (out/(r['matchId']+'.summary.json')).exists()]
exe=ROOT/'analysis/v58_deep_2026-10-24/harness/turnhost/target/release/turnhost'
def run(r):
 slug=r['matchId'];file=out/(slug+'.jsonl');mp=r['map'].replace('_','-')
 cmd=[str(exe),'--engine',str(ROOT/'tools/engines/v2_0_0.wasm'),'--map',str(ROOT/'workspace/maps'/(mp+'.map26a')),'--replay',str(index.parent/r['file']),'--bot',str(ROOT/'workspace/bots'/bot/'.cambc/build-release/bot.wasm'),'--team',str(int(r['side']=='b')),'--to','2000','--log','700','--out',str(file)]
 p=subprocess.run(cmd,capture_output=True,text=True);data=[];counts={};n=match=ended=pre=retry=0
 for l in file.open():
  x=json.loads(l)
  if 'r' not in x:continue
  n+=1;match+=x.get('match',False);ended+=bool(x.get('ended'));pre+=x.get('pre',False)
  m=re.search(r'decision \d+ \d+ (\S+)',x.get('log',''));stage=m.group(1) if m else 'no-log';counts[stage]=counts.get(stage,0)+1
  blocked=any(a.startswith('blocked move') for a in x.get('bot',[]));moved=any(a.startswith('move ') for a in x.get('bot',[]))
  if blocked and moved:retry+=1
  if stage.startswith('repair-') or (blocked and moved) or x.get('ended') or 'error:' in x.get('log',''):data.append(x)
 compact={**r,'turns':n,'matched':match,'matchFraction':match/n if n else 0,'ended':ended,'preempted':pre,'blockedThenMoved':retry,'stages':counts,'mechanismTurns':data,'runnerExit':p.returncode,'runnerTail':p.stderr[-500:]}
 (out/(slug+'.summary.json')).write_text(json.dumps(compact));file.unlink()
 return compact
res=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
 for x in ex.map(run,rows):
  res.append(x);print(x['map'],x['result'],round(x['matchFraction'],3),x['stages'].get('repair-focus-escape',0),'focus escapes,',x['blockedThenMoved'],'retry moves',flush=True)
res=[json.loads(p.read_text()) for p in sorted(out.glob('*.summary.json'))]
(out/'summary.json').write_text(json.dumps(res))
