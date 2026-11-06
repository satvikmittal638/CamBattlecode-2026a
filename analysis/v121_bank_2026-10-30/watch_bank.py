from pathlib import Path
import sys,json,time,subprocess,concurrent.futures
D=Path(sys.argv[1]).resolve();S=Path(__file__).resolve().parent;last=-1
while True:
 try:n=len(json.loads((D/'platform/index.json').read_text()))
 except (FileNotFoundError,ValueError):n=0
 if n and n!=last:
  def run(i):
   p=subprocess.run(['node',str(S/'bank_audit.mjs'),str(D),str(i)],capture_output=True,text=True)
   if p.returncode:raise RuntimeError(p.stderr[-2000:])
  with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:list(ex.map(run,range(4)))
  done=sum(len(json.loads((D/f'bank_audit_{i}.json').read_text())) for i in range(4));print('Bank audits',done,'of',n,flush=True);last=n
  if done==100:break
 time.sleep(15)
