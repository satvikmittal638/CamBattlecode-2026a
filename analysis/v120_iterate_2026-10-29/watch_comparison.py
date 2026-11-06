import json,subprocess,time
from pathlib import Path
D=Path(__file__).resolve().parent;last=-1
while True:
 try:n=len(json.loads((D/'paired_c1/candidate/platform/index.json').read_text()))
 except (FileNotFoundError,ValueError):n=0
 if n and n!=last:
  p=subprocess.run(['python3',str(D/'compare_arms.py')],capture_output=True,text=True)
  if p.returncode:raise RuntimeError(p.stderr)
  x=json.loads((D/'paired_c1/comparison.json').read_text());print(n,'paired:',x['all']['baselineWins'],'->',x['all']['candidateWins'],'strong',x['strong']['baselineWins'],'->',x['strong']['candidateWins'],'near',x['near']['baselineWins'],'->',x['near']['candidateWins'],flush=True);last=n
  if n==100:break
 time.sleep(15)
