from pathlib import Path
import time,subprocess,os,json
D=Path(__file__).resolve().parent;end=time.time()+3600
while not(D/'hopper-download-verified.json').exists():
 if time.time()>end:raise RuntimeError('Hopper download did not finish within one hour')
 time.sleep(5)
q=subprocess.run(['python3',str(D/'install_verified_hopper.py')],cwd=D.parents[1],capture_output=True,text=True);(D/'hopper-manual-install.log').write_text(q.stdout+q.stderr)
if q.returncode:raise RuntimeError('Verified Hopper installation failed; see hopper-manual-install.log')
h=json.loads((D/'hopper-install.json').read_text());env={**os.environ,'PATH':'/Users/dmitt/.local/share/rea/node-v22.23.4-darwin-arm64/bin:'+os.environ['PATH'],'npm_config_cache':'/Users/dmitt/.local/share/rea/npm-cache','HOPPER_LAUNCHER_PATH':h['launcher']}
for stem,args in [('setup-connected',['setup','--client','codex','--yes','--json']),('doctor-full',['doctor','--client','codex','--provider','hopper','--skill','--json'])]:
 with(D/(stem+'.json')).open('w')as out,(D/(stem+'.log')).open('w')as err:q=subprocess.run(['npx','--yes','rea-agents@6.8.0',*args],env=env,stdout=out,stderr=err,timeout=300)
 print(stem,'exit',q.returncode,flush=True)
(D/'hopper-finish-complete.json').write_text(json.dumps({'finished':True,'atEpoch':time.time()}));print('Hopper installed and verification recorded',flush=True)
