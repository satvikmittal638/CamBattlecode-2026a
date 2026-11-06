from pathlib import Path
import subprocess,concurrent.futures,json,collections,re
ROOT=Path(__file__).resolve().parents[2];D=Path(__file__).resolve().parent;A=ROOT/'analysis/v114_fix_c100_2026-10-29/platform';rows=json.loads((A/'index.json').read_text())
exe=ROOT/'analysis/v58_deep_2026-10-24/harness/turnhost/target/release/turnhost'
spec=[('01boss_battle','strong_r51_04',7,500),('02treasure_box','strong_r49_02',5,150),('01elk_arena','strong_r48_01',5,150),('02guardians','strong_r56_09',7,300)]
def run(t):
 mp,label,start,end=t;r=next(r for r in rows if r['map']==mp and r['label']==label);file=D/(mp+'_income_probe.jsonl');cmd=[str(exe),'--engine',str(ROOT/'tools/engines/v2_0_0.wasm'),'--map',str(ROOT/'workspace/maps'/(mp.replace('_','-')+'.map26a')),'--replay',str(A/r['file']),'--bot',str(ROOT/'workspace/bots/v120-income-trace/.cambc/build-release/bot.wasm'),'--team',str(int(r['side']=='b')),'--live-from',str(start),'--to',str(end),'--log','1000','--out',str(file)]
 p=subprocess.run(cmd,capture_output=True,text=True);(D/(mp+'_probe.log')).write_text(p.stdout+p.stderr)
 data=[json.loads(l) for l in file.read_text().splitlines()];turns=[x for x in data if 'r' in x];counts=collections.Counter();
 for x in turns:
  m=re.search(r'decision \d+ \d+ (\S+)',x.get('log',''));counts[m.group(1) if m else 'none']+=1
 out={'map':mp,'stages':dict(counts),'final':data[-1],'errors':sum(bool(x.get('ended')) or 'API ' in x.get('log','') or 'error:' in x.get('log','') for x in turns),'moveTurns':sum(any(a.startswith('move ') for a in x.get('bot',[])) for x in turns),'attackTurns':sum(any(a.startswith('attack ') for a in x.get('bot',[])) for x in turns)};return out
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:out=list(pool.map(run,spec))
(D/'behavior_probe.json').write_text(json.dumps(out,indent=2))
for x in out:print(x,flush=True)
