from pathlib import Path
import subprocess,json,concurrent.futures,re,collections
D=Path(__file__).resolve().parent;R=D.parents[1];P=R/'analysis/v121_bank_2026-10-30/paired_c2/control/platform';rows=json.loads((D/'probe_index.json').read_text());exe=R/'analysis/v58_deep_2026-10-24/harness/turnhost/target/release/turnhost';O=D/'horizon';O.mkdir(exist_ok=True)
def run(r):
 f=O/(r['matchId']+'.jsonl');q=subprocess.run([str(exe),'--engine',str(R/'tools/engines/v2_0_0.wasm'),'--map',str(R/'workspace/maps'/(r['map'].replace('_','-')+'.map26a')),'--replay',str(P/r['file']),'--bot',str(R/'workspace/bots/v124-horizon-trace/.cambc/build-release/bot.wasm'),'--team',str(int(r['side']=='b')),'--to','600','--log','1400','--out',str(f)],capture_output=True,text=True)
 turns=[json.loads(l) for l in f.read_text().splitlines()];turns=[t for t in turns if 'r' in t];aud=[]
 for t in turns:
  for m in re.finditer(r'horizon (\d+) (\d+) (\d+) (\d+) (\d+) (\d+) (-?\d+) (\d+)',t.get('log','')):
   rr,ty,mode,total,visited,scored,best,mask=map(int,m.groups());aud.append(dict(r=rr,c=t['id'],mode=mode,total=total,visited=visited,scored=scored,best=best,mask=str(mask),pos=t['pos'],hp=t['hp'],fuel=t['fuel'],matched=t['match']))
 out={**r,'turns':len(turns),'agreement':sum(t.get('match',False) for t in turns)/len(turns),'preempted':sum(t.get('pre',False) for t in turns),'ended':sum(bool(t.get('ended')) for t in turns),'audits':aud,'exit':q.returncode}
 (O/(r['matchId']+'.json')).write_text(json.dumps(out));f.unlink();return out
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:out=list(ex.map(run,rows))
(D/'horizon_summary.json').write_text(json.dumps(out))
for r in out:
 a=[a for a in r['audits'] if a['visited']];print(r['map'],r['label'],'agreement',round(r['agreement'],4),'pre',r['preempted'],'audits',len(a),'incomplete',sum(a['visited']<a['total'] for a in a),'visitmean',round(sum(a['visited']/a['total'] for a in a)/max(1,len(a)),3),'scoredmean',round(sum(a['scored'] for a in a)/max(1,len(a)),1))
