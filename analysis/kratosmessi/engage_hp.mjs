// HP fraction (and absolute) when starting to attack a new camp group, by camp type.
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, groupAt, cheb, mean, median } from './lib.mjs';
const dir=process.argv[2]; const N=+(process.argv[3]||20);
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows;
if(fs.existsSync(path.join(dir,'index.json'))){rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0}));}
else { rows=[]; for(const s of ['a','b']) if(fs.existsSync(path.join(dir,s))) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const by={}; const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;}; const solo={};
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const snapBy=new Map(); for(const s of d.snapshots) if(!snapBy.has(s.round)) snapBy.set(s.round,s);
  const last=new Map();
  for(const e of d.events){
    if(e.actor?.kind!==1||e.team!==me||e.kind!=='Attack'||e.target?.kind!=='camp') continue;
    const g=groupAt(m,e.to); if(g<0) continue; const L=last.get(e.actor.index);
    if(L&&L.g===g&&e.round-L.r<15){ L.r=e.round; continue; }
    last.set(e.actor.index,{g,r:e.round});
    const s=snapBy.get(e.round); const c=s?.champions.find(x=>x.id===e.actor.index); if(!c) continue;
    const t=m.groups[g].types; (by[t]??=[]).push(c.hp/c.maxHp);
    const allies=s.champions.filter(o=>o.team===me&&o.alive&&o.pos&&o.id!==c.id&&m.groups[g].cells.some(cc=>cheb(o.pos,[cc.x,cc.y])<=3)).length;
    inc(solo,t+(allies?' withAlly':' solo'));
  }
}
for(const [t,a] of Object.entries(by)) { const s=[...a].sort((x,y)=>x-y); console.log(t.padEnd(24),'n',a.length,'p10',s[Math.floor(a.length*0.1)].toFixed(2),'p25',s[Math.floor(a.length*0.25)].toFixed(2),'median',median(a).toFixed(2)); }
console.log(solo);
