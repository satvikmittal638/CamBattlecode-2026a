import json,time,subprocess
from pathlib import Path
D=Path(__file__).resolve().parent;ROOT=D.parents[1];last=-1
while True:
 try:n=len(json.loads((D/'platform/index.json').read_text()))
 except (FileNotFoundError,ValueError):n=0
 if n and n!=last:
  p=subprocess.run(['python3',str(D/'shadow_trial.py'),str(D/'platform/index.json'),str(D/'platform_shadow')],cwd=ROOT,capture_output=True,text=True)
  with (D/'shadow_runner.log').open('a') as f:f.write(p.stdout+p.stderr)
  if p.returncode:raise RuntimeError(p.stderr[-2500:])
  a=json.loads((D/'platform_shadow/summary.json').read_text());print('Behavioral shadow audit:',len(a),'games;',n,'downloaded',flush=True);last=n
  if n==100:break
 time.sleep(20)
