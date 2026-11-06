from pathlib import Path
import subprocess,json,concurrent.futures,re
D=Path(__file__).resolve().parent;R=D.parents[1];P=R/'analysis/v121_bank_2026-10-30/paired_c2/control/platform';rows=json.loads((P/'index.json').read_text());E=R/'analysis/v58_deep_2026-10-24/harness/turnhost/target/release/turnhost'
S=[('01boss_battle','near_r114_09',103,108),('02cuts','strong_r53_04',329,334)]
def run(spec):
 mp,label,start,end,arm=spec;r=next(r for r in rows if r['map']==mp and r['label']==label);bot='v124-neutral-demo' if arm=='poke' else 'v124-neutral-control';out=D/f'{mp}_{arm}.jsonl'
 q=subprocess.run([str(E),'--engine',str(R/'tools/engines/v2_0_0.wasm'),'--map',str(R/'workspace/maps'/(mp.replace('_','-')+'.map26a')),'--replay',str(P/r['file']),'--bot',str(R/'workspace/bots'/bot/'.cambc/build-release/bot.wasm'),'--team',str(int(r['side']=='b')),'--live-from',str(start),'--to',str(end),'--log','1800','--out',str(out)],capture_output=True,text=True);(D/f'{mp}_{arm}.log').write_text(q.stdout+q.stderr)
 ts=[json.loads(l) for l in out.read_text().splitlines()];ts=[t for t in ts if 'r' in t];pre=[t for t in ts if t['mode']=='shadow'];obs=[]
 for t in ts:
  if t['mode']!='live':continue
  for m in re.finditer(r'enemy-health (\d+) (\d+) (-?\d+) (-?\d+) ([0-9.]+)',t.get('log','')):
   rr,c,x,y,hp=m.groups();obs.append(dict(r=int(rr),c=int(c),x=int(x),y=int(y),hp=float(hp),observer=t['id']))
 result=dict(map=mp,label=label,arm=arm,exit=q.returncode,preAgreement=sum(t['match'] for t in pre)/len(pre),preempted=sum(t.get('pre',False) for t in ts),faults=sum(bool(t.get('ended')) or 'error:' in t.get('log','') for t in ts),triggers=[dict(r=t['r'],c=t['id'],actions=t['bot']) for t in ts if 'neutral-demo:' in t.get('log','')],observations=obs,ourHealth=[{k:t[k] for k in ['r','id','type','hp','gems','pos']} for t in ts if t['mode']=='live']);return result
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:out=list(ex.map(run,[(*s,arm) for s in S for arm in ['control','poke']]))
(D/'neutral_probe.json').write_text(json.dumps(out))
for x in out:
 obs={(o['r'],o['c']):o for o in x['observations']};print(x['map'],x['arm'],'agreement',round(x['preAgreement'],4),'faults',x['faults'],'triggers',x['triggers']);print('visible enemy HP',[(r,c,o['hp']) for (r,c),o in sorted(obs.items())])
