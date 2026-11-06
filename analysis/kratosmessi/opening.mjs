// Opening: per champion, first 3 camp groups attacked (with round) and capture order; aggregated per map.
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, groupAt, groupNear, cheb } from './lib.mjs';
const dir=process.argv[2]||'top_replays/2_KratosMessi'; const N=+(process.argv[3]||60); const sideArg=process.argv[4];
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows;
if(fs.existsSync(path.join(dir,'index.json'))){rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0}));}
else { rows=[]; const sub=['a','b'].filter(s=>fs.existsSync(path.join(dir,s))); if(sub.length){ for(const s of sub) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); } else rows=fs.readdirSync(dir).filter(f=>f.endsWith('.repl26a')).map(f=>({file:f,path:path.join(dir,f),map:MAPS.find(mm=>f.startsWith(mm)),me:sideArg==='b'?1:0,createdAt:f})); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const byMap={};
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const myIds=d.meta.finalChampions.filter(c=>c.team===me).map(c=>c.id); const typeOf=Object.fromEntries(d.meta.finalChampions.map(c=>[c.id,c.type]));
  const parts=[];
  for(const id of myIds){
    const seq=[]; let last=-2;
    for(const e of d.events){ if(e.round>120) break; if(e.actor?.kind===1&&e.actor.index===id&&e.kind==='Attack'&&e.target?.kind==='camp'){const g=groupAt(m,e.to); if(g!==last){ seq.push(`${m.groups[g]?.types.replace(/Cluster/g,'')[0]}${m.groups[g]?m.groups[g].dist[me].toFixed(0):'?'}@${e.round}`); last=g;} } }
    parts.push(`${typeOf[id].slice(0,3)}:${seq.slice(0,4).join('>')}`);
  }
  (byMap[r.map]??=[]).push(`${r.side} ${parts.join(' | ')}`);
}
for(const [k,v] of Object.entries(byMap)){ console.log('==',k); v.slice(0,5).forEach(x=>console.log('  ',x)); }
