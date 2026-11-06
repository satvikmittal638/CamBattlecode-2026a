import json,time,subprocess,sys
from pathlib import Path
SCRIPT=Path(__file__).resolve().parent;ROOT=SCRIPT.parents[1];D=Path(sys.argv[1]).resolve();last=-1
while True:
 try:n=len(json.loads((D/'platform/index.json').read_text()))
 except (FileNotFoundError,ValueError):n=0
 if n and n!=last:
  p=subprocess.run(['python3',str(SCRIPT/'shadow_all.py'),str(D/'platform/index.json'),str(D/'platform_shadow'),'v121-income-trace'],cwd=ROOT,capture_output=True,text=True)
  with (D/'shadow_runner.log').open('a') as f:f.write(p.stdout+p.stderr)
  if p.returncode:raise RuntimeError(p.stderr[-2500:])
  a=json.loads((D/'platform_shadow/summary.json').read_text());print('Behavioral shadow audit:',len(a),'games;',n,'downloaded',flush=True);last=n
  if n==100:break
 time.sleep(20)
