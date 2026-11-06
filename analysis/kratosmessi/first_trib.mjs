import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, cheb, median } from './lib.mjs';
const dir=process.argv[2]; const N=+(process.argv[3]||40);
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows; if(fs.existsSync(dir+'/index.json')) rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0})); else { rows=[]; for(const s of ['a','b']) if(fs.existsSync(path.join(dir,s))) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const by={};
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'none'}); const me=r.me;
  const subs=d.events.filter(e=>e.kind==='Submit gems'&&e.team===me);
  const fc=d.events.find(e=>e.kind==='Capture'); 
  (by[r.map]??=[]).push(`${subs[0]?.round}:${subs[0]?.gemsCarried}(${subs[0]?.champ})`);
}
for(const [k,v] of Object.entries(by).sort()) console.log(k.padEnd(10),v.slice(0,8).join(' '));
