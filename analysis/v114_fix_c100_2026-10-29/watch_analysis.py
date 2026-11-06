import json,time,subprocess,concurrent.futures
from pathlib import Path
D=Path(__file__).resolve().parent;ROOT=D.parents[1];last=-1
while True:
 p=D/'platform/index.json'
 try:n=len(json.loads(p.read_text()))
 except (FileNotFoundError,ValueError):n=0
 if n and n!=last:
  def run(i):
   p=subprocess.run(['node',str(D/'analyze_platform.mjs'),'--part',str(i)],cwd=ROOT,capture_output=True,text=True)
   if p.returncode:raise RuntimeError(p.stderr[-2500:])
  with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:list(ex.map(run,range(4)))
  done=sum(len(json.loads((D/f'metrics_{i}.json').read_text())) for i in range(4));last=n
  print('Replay statistics processed',done,'of',n,'downloaded',flush=True)
  if done==100:break
 time.sleep(15)
