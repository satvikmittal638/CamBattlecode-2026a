from pathlib import Path
import urllib.request,concurrent.futures,time,json,hashlib,re
D=Path(__file__).resolve().parent;O=Path('/private/tmp/rea-setup-review/hopper-compat-parts');O.mkdir(exist_ok=True);u='https://www.hopperapp.com/HopperWeb/downloads/Hopper-5.19.6-demo.dmg';total=34307781;chunk=1024*1024;start=time.time()
def get(i):
 a=i*chunk;b=min(total-1,a+chunk-1);p=O/str(i)
 if p.exists()and p.stat().st_size==b-a+1:return i
 for attempt in range(4):
  try:
   q=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0','Range':f'bytes={a}-{b}'})
   with urllib.request.urlopen(q,timeout=180)as r:
    assert r.status==206 and r.headers.get('Content-Range')==f'bytes {a}-{b}/{total}';data=r.read();assert len(data)==b-a+1
   p.write_bytes(data);return i
  except Exception:
   if attempt==3:raise
   time.sleep(2)
with concurrent.futures.ThreadPoolExecutor(max_workers=8)as ex:
 for n,i in enumerate(ex.map(get,range((total+chunk-1)//chunk)),1):
  actual=sum(p.stat().st_size for p in O.iterdir());progress={'version':'5.19.6','downloadedBytes':actual,'totalBytes':total,'percent':round(100*actual/total,1),'seconds':round(time.time()-start)};(D/'hopper-compat-progress.json').write_text(json.dumps(progress));print(json.dumps(progress),flush=True)
out=Path('/private/tmp/rea-setup-review/Hopper-5.19.6-demo.dmg')
with out.open('wb')as f:
 for i in range((total+chunk-1)//chunk):f.write((O/str(i)).read_bytes())
h=hashlib.sha256(out.read_bytes()).hexdigest();p=D/'hopper-legacy-cask.rb';expected=None
if p.exists():
 s=p.read_text();assert '5.19.6'in s;expected=re.search(r'sha256 "([0-9a-f]{64})"',s).group(1);assert h==expected
meta={'file':str(out),'version':'5.19.6','bytes':total,'sha256':h,'matchesPublishedChecksum':h==expected,'officialVendorSource':u,'publisherVerificationRequired':True};(D/'hopper-download-verified.json').write_text(json.dumps(meta,indent=2));print('Official compatibility installer ready',flush=True)
