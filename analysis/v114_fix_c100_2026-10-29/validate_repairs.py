from pathlib import Path
import subprocess, concurrent.futures, json
base=Path(__file__).resolve().parents[2];out=Path(__file__).resolve().parent
h=base/'analysis/v58_deep_2026-10-24/harness/turnhost/target/release/turnhost';bot=base/'workspace/bots/v114-remedy-trace/.cambc/build-release/bot.wasm'
archive=base/'analysis/v114_review_2026-10-29/replays';rows=json.loads((archive/'index.json').read_text())
def run(t):
 name,start,end,label=t
 row=next(x for x in rows if x['map']==name);replay=archive/row['file']
 cmd=[str(h),'--engine',str(base/'tools/engines/v2_0_0.wasm'),'--map',str(base/'workspace/maps'/ (name.replace('_','-')+'.map26a')),'--replay',str(replay),'--bot',str(bot),'--team','1','--to',str(end),'--log','1200','--out',str(out/(label+'.jsonl'))]
 if start:cmd+=['--live-from',str(start)]
 p=subprocess.run(cmd,capture_output=True,text=True);(out/(label+'.runner.log')).write_text(p.stdout+p.stderr);return label,p.returncode,(p.stdout+p.stderr)[-500:]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
 for x in ex.map(run,[('00lanes',None,220,'lanes_final_shadow'),('01broken_curve',1069,1110,'broken_final_live'),('02stalactites',85,120,'stal_final_live'),('01elk_arena',24,45,'elk_retry_live')]):print(x,flush=True)
