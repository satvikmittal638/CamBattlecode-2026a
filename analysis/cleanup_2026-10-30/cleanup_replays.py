"""Delete only old raw replays and identified native diagnostic traces; preserve summaries."""
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
from collections import Counter
import os,json,sys
R=Path(__file__).resolve().parents[2];D=Path(__file__).resolve().parent
CUTOFF=datetime(2026,10,29,tzinfo=ZoneInfo('Asia/Kolkata')).timestamp()
SKIP={'.git','.venv','.venv-analysis','node_modules','target','turnhost_vendor','vendor','sdk','.cambc','.auth','.aws','.codex','.agents'}
DATASETS={'ml','ml_rl_2026-10-23','fish_meta','meta_fm_2026-10-25'}
rows=[]
for base in ['analysis','local_eval','platform','workspace/replays']:
 for root,dirs,files in os.walk(R/base,followlinks=False):
  dirs[:]=[n for n in dirs if n not in SKIP and not(Path(root)/n).is_symlink()]
  for name in files:
   p=Path(root)/name
   if p.suffix not in {'.repl26a','.replay','.jsonl'}or p.is_symlink():continue
   st=p.stat()
   if st.st_mtime>=CUTOFF:continue
   rel=p.relative_to(R)
   if 'current_improve_2026-10-30'in rel.parts:continue
   if rel.parts[0]=='analysis'and rel.parts[1]in DATASETS:continue
   kind='raw_replay'
   if p.suffix=='.jsonl':
    if rel.parts[0]!='analysis'or rel.parts[1]in DATASETS:continue
    try:
     with p.open()as f:first=json.loads(f.readline())
    except (ValueError,UnicodeError):continue
    if not(isinstance(first,dict)and first.get('mode')in {'shadow','live'}and all(k in first for k in ['r','id','bot','fuel'])):continue
    kind='native_replay_trace'
   rows.append({'path':str(rel),'kind':kind,'bytes':st.st_size,'mtime_ns':st.st_mtime_ns,'inode':st.st_ino})
summary={'cutoff':'2026-10-29 00:00 Asia/Kolkata','files':len(rows),'bytes':sum(r['bytes']for r in rows),'byKind':dict(Counter(r['kind']for r in rows)),'protected':'All replays newer than cutoff, entire current_improve experiment, training datasets, source, reports, statistics, build caches.'}
(D/'plan.json').write_text(json.dumps(summary,indent=2))
with(D/'manifest.jsonl').open('w')as f:
 for r in rows:f.write(json.dumps(r)+'\n')
if '--apply'in sys.argv:
 removed=[];skipped=[];before=os.statvfs(R);free_before=before.f_bavail*before.f_frsize
 for r in rows:
  p=R/r['path'];st=p.stat()
  if(st.st_size,st.st_mtime_ns,st.st_ino)!=(r['bytes'],r['mtime_ns'],r['inode']):skipped.append(r['path']);continue
  p.unlink();removed.append(r)
 after=os.statvfs(R);summary.update({'removedFiles':len(removed),'removedBytes':sum(r['bytes']for r in removed),'skippedChanged':skipped,'freeBeforeBytes':free_before,'freeAfterBytes':after.f_bavail*after.f_frsize,'at':datetime.now(ZoneInfo('Asia/Kolkata')).isoformat()})
 (D/'result.json').write_text(json.dumps(summary,indent=2))
 with(R/'analysis/replay_cleanup.log').open('a')as f:f.write(f"{summary['at']} removed {len(removed)} old raw replay/native trace files ({summary['removedBytes']/2**30:.2f} GiB logical); recent v128/v129 comparisons, reports, statistics, source, training datasets preserved. Manifest analysis/cleanup_2026-10-30/manifest.jsonl\n")
print(json.dumps(summary,indent=2))
