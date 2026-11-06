from pathlib import Path
import hashlib,json,subprocess,time,sys

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
WS=OUT/'eval_workspace'
CLI=OUT/'venv/bin/cambc'
BOTS={'base':'rules-control-v43','fix':'rules-fix-v43'}
OPPS=['tm30','v27','edge']
MAPS=sorted(p.stem for p in (WS/'maps').glob('*.map26a'))
DEST=OUT/'field1'
assert not DEST.exists(),'Refusing to replace an experiment'
DEST.mkdir()
def hashes(name):
    src=WS/'bots'/name/'src'
    return {str(p.relative_to(src)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(src.rglob('*')) if p.is_file()}
frozen={b:hashes(b) for b in list(BOTS.values())+OPPS}
(DEST/'source_hashes.json').write_text(json.dumps(frozen,indent=2)+'\n')
plan={'engineRequired':'1.0.2','variants':BOTS,'opponents':OPPS,'maps':MAPS,'sides':['a','b'],'fuel':100000,'release':True,'groups':0,'expectedGames':len(BOTS)*len(OPPS)*len(MAPS)*2,
      'acceptance':'All matches finish on engine 1.0.2; zero candidate faults and source changes; review paired outcomes before submission.'}
(DEST/'plan.json').write_text(json.dumps(plan,indent=2)+'\n')
print(json.dumps(plan),flush=True)
for b in list(BOTS.values())+OPPS:
    r=subprocess.run([str(CLI),'build',b,'--release'],cwd=WS,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
    (DEST/(b+'.build.log')).write_text(r.stdout)
    assert r.returncode==0,(b,r.stdout[-2000:])
rows=[];lines=[]
for variant,bot in BOTS.items():
    for opp in OPPS:
        for name in MAPS:
            for side in ['a','b']:
                folder=DEST/'games'/variant/opp/name;folder.mkdir(parents=True,exist_ok=True)
                replay=folder/(side+'.repl26a');stats=folder/(side+'.json')
                a,b=(bot,opp) if side=='a' else (opp,bot)
                lines.append(f'{WS/"bots"/a} {WS/"bots"/b} {WS/"maps"/(name+".map26a")} {replay} --statistics {stats} --json')
                rows.append({'variant':variant,'opponent':opp,'map':name,'side':side,'stats':str(stats.relative_to(ROOT)),'replay':str(replay.relative_to(ROOT))})
manifest=DEST/'matches.txt';manifest.write_text('\n'.join(lines)+'\n')
started=time.time()
with (DEST/'runner.log').open('w') as log:
    run=subprocess.run([str(CLI),'run-batch',str(manifest),'--release','--jobs','5','--fuel-quantum','100000','--log-limit','0','--timeout','300','--color','never'],cwd=WS,stdout=log,stderr=subprocess.STDOUT)
errors=[]
for row in rows:
    p=ROOT/row['stats']
    if not p.exists():errors.append('Missing '+str(p));continue
    d=json.loads(p.read_text());me='teamA' if row['side']=='a' else 'teamB';them='teamB' if me=='teamA' else 'teamA'
    teams={t['team']:t for t in d['teams']}
    row.update(engine=d['match']['engineVersion'],outcome=d['match']['outcome'],rounds=d['match']['roundsStarted'],win=d['match']['outcome']==me,score=int(teams[me]['submittedGems']),oppScore=int(teams[them]['submittedGems']),faults=d['diagnostics']['botFaults'][me],oppFaults=d['diagnostics']['botFaults'][them],codes=d['diagnostics']['codes'])
    if row['engine']!='1.0.2' or row['outcome'] not in ['teamA','teamB'] or row['faults']:errors.append(str(row))
assert frozen=={b:hashes(b) for b in frozen},'Source changed during run'
summary={}
for v in BOTS:
    rs=[r for r in rows if r['variant']==v and 'win'in r]
    summary[v]={'games':len(rs),'wins':sum(r['win'] for r in rs),'faults':sum(r['faults'] for r in rs),'byOpponent':{o:sum(r['win'] for r in rs if r['opponent']==o) for o in OPPS}}
paired={}
for r in rows:
    if 'win'in r:paired.setdefault((r['opponent'],r['map'],r['side']),{})[r['variant']]=r
flips=[]
for key,p in paired.items():
    if 'base'in p and 'fix'in p and p['base']['win']!=p['fix']['win']:flips.append({'key':key,'gained':p['fix']['win'],'base':[p['base']['score'],p['base']['oppScore']],'fix':[p['fix']['score'],p['fix']['oppScore']]})
result={'plan':plan,'runnerExit':run.returncode,'seconds':round(time.time()-started),'summary':summary,'gained':sum(f['gained'] for f in flips),'lost':sum(not f['gained'] for f in flips),'flips':flips,'errors':errors,'rows':rows}
(DEST/'results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['rows','plan','flips']},indent=2),flush=True)
sys.exit(1 if errors or run.returncode else 0)
