from pathlib import Path
import json,subprocess,concurrent.futures,collections,re,sys
R=Path(__file__).resolve().parents[2];D=Path(__file__).resolve().parent
P=R/'analysis/v120_iterate_2026-10-29/paired_c1/candidate/platform'
rows=json.loads((P/'index.json').read_text())
exe=R/'analysis/v58_deep_2026-10-24/harness/turnhost/target/release/turnhost'
bot=sys.argv[1] if len(sys.argv)>1 else 'v122-bank-trace'
labelSuffix='_base' if bot=='v121-income-trace' else ''
spec=[('01boss_battle','near_r115_04',730,2000),('01boss_battle','strong_r54_01',731,2000)]
def run(t):
 mp,label,start,end=t;r=next(r for r in rows if r['map']==mp and r['label']==label)
 f=D/(label+labelSuffix+'_live.jsonl')
 cmd=[str(exe),'--engine',str(R/'tools/engines/v2_0_0.wasm'),'--map',str(R/'workspace/maps'/(mp.replace('_','-')+'.map26a')),'--replay',str(P/r['file']),'--bot',str(R/'workspace/bots'/bot/'.cambc/build-release/bot.wasm'),'--team',str(int(r['side']=='b')),'--live-from',str(start),'--to',str(end),'--log','1000','--out',str(f)]
 q=subprocess.run(cmd,capture_output=True,text=True);(D/(label+labelSuffix+'_live.log')).write_text(q.stdout+q.stderr)
 data=[json.loads(x) for x in f.read_text().splitlines()];ts=[x for x in data if 'r' in x];stages=collections.Counter()
 for x in ts:
  m=re.search(r'decision \d+ \d+ (\S+)',x.get('log',''));stages[m.group(1) if m else 'none']+=1
 return {'case':label,'exit':q.returncode,'final':data[-1],'stages':dict(stages),'errors':sum(bool(x.get('ended')) or 'API ' in x.get('log','') or 'error:' in x.get('log','') for x in ts)}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
 out=list(ex.map(run,spec))
(D/('probe_summary'+labelSuffix+'.json')).write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
