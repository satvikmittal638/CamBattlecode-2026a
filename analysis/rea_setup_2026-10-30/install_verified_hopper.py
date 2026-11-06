from pathlib import Path
import json,subprocess,hashlib,tempfile,os,plistlib,shutil
R=Path(__file__).resolve().parent;meta=json.loads((R/'hopper-download-verified.json').read_text());archive=Path(meta['file']);assert hashlib.sha256(archive.read_bytes()).hexdigest()==meta['sha256']
appdir=Path('/Users/dmitt/Applications');appdir.mkdir(exist_ok=True);dst=appdir/'Hopper Disassembler.app';assert not dst.exists(),'Refusing to overwrite an existing application'
tmp=Path(tempfile.mkdtemp(prefix='rea-hopper-verified-',dir='/private/tmp'));mount=tmp/'mounted';mount.mkdir();mounted=False;stage=None;logs=[]
def run(args):
 q=subprocess.run(args,capture_output=True,text=True,timeout=180);logs.append({'command':args[0],'exit':q.returncode,'output':(q.stdout+q.stderr)[-2500:]});
 if q.returncode:raise RuntimeError((q.stdout+q.stderr)[-2500:])
 return q.stdout
requirement='= identifier "com.cryptic-apps.hopper-web-4" and anchor apple generic and certificate leaf[subject.OU] = "2AMA2753NF"'
try:
 run(['hdiutil','attach','-readonly','-nobrowse','-mountpoint',str(mount),str(archive)]);mounted=True;candidates=list(mount.glob('Hopper Disassembler*.app'));assert len(candidates)==1;src=candidates[0]
 run(['codesign','--verify','--deep','--strict',str(src)]);run(['codesign','--verify','--strict','-R',requirement,str(src)])
 info=plistlib.loads((src/'Contents/Info.plist').read_bytes());assert info['CFBundleIdentifier']=='com.cryptic-apps.hopper-web-4';assert info['CFBundleShortVersionString'].startswith(meta.get('version','6.6.1'))
 stage=Path(tempfile.mkdtemp(prefix='.rea-hopper-stage-',dir=appdir));staged=stage/dst.name;run(['ditto',str(src),str(staged)]);run(['codesign','--verify','--deep','--strict',str(staged)]);assert not dst.exists();os.rename(staged,dst)
 out={'installed':True,'version':info['CFBundleShortVersionString'],'app':str(dst),'launcher':str(dst/'Contents/MacOS/hopper'),'sha256':meta['sha256'],'checksumVerified':meta.get('matchesPublishedChecksum',False),'publisherVerified':True,'publisherTeam':'2AMA2753NF'};assert Path(out['launcher']).is_file();(R/'hopper-install.json').write_text(json.dumps(out,indent=2));print(json.dumps(out),flush=True)
finally:
 if mounted:run(['hdiutil','detach',str(mount)])
 if stage and stage.exists():shutil.rmtree(stage)
 shutil.rmtree(tmp);(R/'hopper-install-commands.json').write_text(json.dumps(logs,indent=2))
