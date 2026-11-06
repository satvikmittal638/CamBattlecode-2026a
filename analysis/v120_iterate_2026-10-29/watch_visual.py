import json,time,subprocess,sys
from pathlib import Path
SCRIPT=Path(__file__).resolve().parent;ROOT=SCRIPT.parents[1];D=Path(sys.argv[1]).resolve();last=-1
while True:
 try:n=len(json.loads((D/'platform/index.json').read_text()))
 except (FileNotFoundError,ValueError):n=0
 if n and n!=last:
  p=subprocess.run(['node',str(ROOT/'analysis/v114_fix_c100_2026-10-29/mass_visual.mjs'),str(D/'platform/index.json'),str(D/'visual.json')],cwd=ROOT,capture_output=True,text=True)
  if p.returncode:raise RuntimeError(p.stderr)
  done=len(json.loads((D/'visual.json').read_text()));print('Visual cases extracted',done,flush=True);last=n
  if done==100:break
 time.sleep(10)
