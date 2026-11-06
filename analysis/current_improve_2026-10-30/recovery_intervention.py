from pathlib import Path
import json,subprocess
D=Path(__file__).resolve().parent;R=D.parents[1];P=D/'paired_duo/candidate/platform';idx=json.loads((P/'index.json').read_text());r=next(r for r in idx if r['map']=='00lanes'and r['opponent']=='DOOMSDAY');out=[]
for arm,bot in [('base','v125-cassi-guard-1030'),('recovery','v128-stall-recovery-1030')]:
 f=D/('recovery_live_'+arm+'.jsonl')
 q=subprocess.run([str(D/'harness/target/release/turnhost'),'--engine',str(R/'tools/engines/v2_0_0.wasm'),'--map',str(R/'workspace/maps/00lanes.map26a'),'--replay',str(P/r['file']),'--bot',str(R/'workspace/bots'/bot/'.cambc/build-release/bot.wasm'),'--team',str(int(r['side']=='b')),'--live-from','6','--to','300','--log','1400','--out',str(f)],cwd=D,capture_output=True,text=True)
 if q.returncode:raise RuntimeError(q.stderr[-2000:])
 a=[json.loads(l)for l in f.read_text().splitlines()];a=[t for t in a if'r'in t];pre=[t for t in a if t['mode']=='shadow'];live=[t for t in a if t['mode']=='live'];b=[s for t in live for s in t.get('bot',[])];x={'arm':arm,'exit':q.returncode,'preAgreement':sum(t.get('match',False)for t in pre)/len(pre),'preemptions':sum(t.get('pre',False)for t in a),'faults':sum(bool(t.get('ended'))or'error:'in t.get('log','')for t in a),'liveActions':len(b),'attacks':sum(s.startswith('attack')for s in b),'tributes':sum(s.startswith('submit')for s in b),'maxBag':max(t['gems']for t in live)};out.append(x);print(x,flush=True)
(D/'recovery_live_summary.json').write_text(json.dumps(out,indent=2))
