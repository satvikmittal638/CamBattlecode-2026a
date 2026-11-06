from pathlib import Path
import subprocess,json
D=Path(__file__).resolve().parent;R=D.parents[1];P=D/'exact_final';P.mkdir(exist_ok=True);rows=[];lines=[]
for arm,bot in [('base','v121-income'),('partition','v124-partition')]:
 for opp in ['v114','fish62_f84','tm30_f84']:
  for mp in ['00lanes','02treasure-box','02cuts','01elk-arena']:
   for side in ['a','b']:
    p=P/arm/opp/mp;p.mkdir(parents=True,exist_ok=True);a,b=(bot,opp) if side=='a' else (opp,bot);repl=p/(side+'.repl26a');stats=p/(side+'.json');lines.append(f'{R/"workspace/bots"/a} {R/"workspace/bots"/b} {R/"workspace/maps"/(mp+".map26a")} {repl} --statistics {stats} --json');rows.append(dict(arm=arm,opponent=opp,map=mp,side=side,replay=str(repl),stats=str(stats)))
(P/'manifest.txt').write_text('\n'.join(lines)+'\n');q=subprocess.run([str(R/'.venv/bin/cambc'),'run-batch',str(P/'manifest.txt'),'--jobs','6','--release','--fuel-quantum','100000','--log-limit','0','--timeout','120','--color','never'],cwd=R/'workspace',capture_output=True,text=True);(P/'runner.log').write_text(q.stdout+q.stderr)
for r in rows:
 x=json.loads(Path(r['stats']).read_text());me='teamA' if r['side']=='a' else 'teamB';r['win']=x['match']['outcome']==me;r['faults']=x['diagnostics'].get('botFaults',{}).get(me,0);r['rounds']=x['match']['roundsStarted'];r['score']=next(t['submittedGems'] for t in x['teams'] if t['team']==me)
(P/'results.json').write_text(json.dumps(dict(runnerExit=q.returncode,rows=rows),indent=1))
for arm in ['base','partition']:
 rs=[r for r in rows if r['arm']==arm];print(arm,sum(r['win'] for r in rs),'/',len(rs),'faults',sum(r['faults'] for r in rs))
