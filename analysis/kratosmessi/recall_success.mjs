import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, cheb, mean, median } from './lib.mjs';
const dir=process.argv[2]; const N=+(process.argv[3]||20);
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows;
if(fs.existsSync(path.join(dir,'index.json'))){rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0}));}
else { rows=[]; for(const s of ['a','b']) if(fs.existsSync(path.join(dir,s))) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;}; const t={}; const why={};
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const snapBy=new Map(); for(const s of d.snapshots) if(!snapBy.has(s.round)) snapBy.set(s.round,s);
  for(const e of d.events){
    if(e.kind!=='Recall'||e.team!==me||e.actor?.kind!==1) continue;
    let ok=false, died=false;
    for(let k=1;k<=8;k++){ const s=snapBy.get(e.round+k); const c=s?.champions.find(x=>x.id===e.actor.index); if(!c) continue; if(!c.alive){died=true;break;} if(c.pos&&cheb(c.pos,m.spawnC[me])<=2){ok=true;break;} }
    const s=snapBy.get(e.round); const c=s?.champions.find(x=>x.id===e.actor.index);
    const k=ok?'arrived':died?'died':'interrupted'; inc(t,k);
    if(!ok){ const hitByCamp=d.events.some(x=>x.actor?.kind===2&&x.kind==='Attack'&&x.round>e.round&&x.round<=e.round+5&&x.target?.id===e.actor.index); const hitByChamp=d.events.some(x=>x.actor?.kind===1&&x.kind==='Attack'&&x.round>=e.round&&x.round<=e.round+5&&x.target?.id===e.actor.index); inc(why,(hitByCamp?'camp ':'')+(hitByChamp?'champ':'')); }
  }
}
console.log(t, why);
