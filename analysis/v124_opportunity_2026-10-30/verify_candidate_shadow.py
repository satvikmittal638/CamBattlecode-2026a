"""Check source/action fidelity; shadow playback is not a strength evaluation."""
from pathlib import Path
import subprocess,json,concurrent.futures
D=Path(__file__).resolve().parent;R=D.parents[1];P=D/'paired_scan/candidate/platform';O=D/'candidate_shadow';O.mkdir(exist_ok=True)
index=json.loads((P/'index.json').read_text());rows=[]
for mp in ['00lanes','02treasure_box','02cuts','01elk_arena']:
    for pool in ['strong','near']:
        rows.append(next(r for r in index if r['map']==mp and r['label'].startswith(pool)))
def run(r):
    f=O/(r['matchId']+'.jsonl')
    q=subprocess.run([str(R/'analysis/v58_deep_2026-10-24/harness/turnhost/target/release/turnhost'),
      '--engine',str(R/'tools/engines/v2_0_0.wasm'),'--map',str(R/'workspace/maps'/(r['map'].replace('_','-')+'.map26a')),
      '--replay',str(P/r['file']),'--bot',str(R/'workspace/bots/v124-partition/.cambc/build-release/bot.wasm'),
      '--team',str(int(r['side']=='b')),'--to','600','--log','1400','--out',str(f)],capture_output=True,text=True)
    if q.returncode:raise RuntimeError(q.stderr[-2000:])
    turns=[json.loads(l)for l in f.read_text().splitlines()];turns=[t for t in turns if 'r'in t]
    result={**r,'turns':len(turns),'agreement':sum(t.get('match',False)for t in turns)/len(turns),
            'preempted':sum(t.get('pre',False)for t in turns),'faults':sum(bool(t.get('ended'))or 'error:'in t.get('log','')for t in turns)}
    (O/(r['matchId']+'.json')).write_text(json.dumps(result));f.unlink();return result
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as ex:out=list(ex.map(run,rows))
(D/'candidate_shadow_summary.json').write_text(json.dumps(out,indent=2))
for r in out:print(r['map'],r['label'],'agreement',r['agreement'],'preempted',r['preempted'],'faults',r['faults'])
