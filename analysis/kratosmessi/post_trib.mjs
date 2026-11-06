// After a tribute lands: recall or not, by gold and distance to spawn.
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, cheb } from './lib.mjs';
const dir=process.argv[2]; const N=+(process.argv[3]||25);
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows; if(fs.existsSync(dir+'/index.json')) rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0})); else { rows=[]; for(const s of ['a','b']) if(fs.existsSync(path.join(dir,s))) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const t={}; const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;};
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const snapBy=new Map(); for(const s of d.snapshots) if(!snapBy.has(s.round)) snapBy.set(s.round,s);
  for(const e of d.events){
    if(e.kind!=='Gems submitted'||e.team!==me||e.actor?.kind!==1) continue;
    const s=snapBy.get(e.round+1)||snapBy.get(e.round); const c=s?.champions.find(x=>x.id===e.actor.index); if(!c?.pos) continue;
    const rec=d.events.some(x=>x.kind==='Recall'&&x.actor?.kind===1&&x.actor.index===e.actor.index&&x.round>=e.round&&x.round<=e.round+2);
    const ds=cheb(c.pos,m.spawnC[me]);
    const k=`gold${c.gold>=300?'300+':c.gold>=150?'150-299':c.gold>=90?'90-149':'<90'} dist${ds<12?'<12':ds<20?'12-19':'20+'}`;
    (t[k]??={n:0,rec:0}); t[k].n++; if(rec) t[k].rec++;
  }
}
for(const [k,v] of Object.entries(t).sort()) console.log(k.padEnd(24),String(v.n).padStart(4),(v.rec/v.n*100).toFixed(0)+'%');
