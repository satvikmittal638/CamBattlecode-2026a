// Gap between a group's respawn and its next capture (by us / by opp), and whether a champion waited at it.
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, groupAt, cheb, mean, median } from './lib.mjs';
const dir=process.argv[2]||'top_replays/2_KratosMessi'; const N=+(process.argv[3]||20); const sideArg=process.argv[4];
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows;
if(fs.existsSync(path.join(dir,'index.json'))){rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0}));}
else { rows=[]; const sub=['a','b'].filter(s=>fs.existsSync(path.join(dir,s))); if(sub.length){ for(const s of sub) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); } else rows=fs.readdirSync(dir).filter(f=>f.endsWith('.repl26a')).map(f=>({file:f,path:path.join(dir,f),map:MAPS.find(mm=>f.startsWith(mm)),me:sideArg==='b'?1:0,createdAt:f})); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const gaps=[]; const waiting={yes:0,no:0}; const idleAtSpawnFrac=[]; const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;}; const act={};
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const snaps=d.snapshots;
  // group alive bitmap per snapshot
  const aliveG=(s)=>{const a=new Set(); for(const c of s.camps) if(c.hp>0){const g=groupAt(m,c.pos); if(g>=0)a.add(g);} return a;};
  let prevA=aliveG(snaps[0]); const respawnAt={};
  let prevGroups=snaps[0].groups;
  for(let i=1;i<snaps.length;i++){
    const s=snaps[i]; const a=aliveG(s);
    for(const g of a) if(!prevA.has(g)){ respawnAt[g]=s.round; // was anyone of ours waiting within 2 tiles?
      const w=s.champions.some(c=>c.team===me&&c.alive&&c.pos&&m.groups[g].cells.some(cc=>cheb(c.pos,[cc.x,cc.y])<=2)); if(m.groups[g].dist[me]<m.groups[g].dist[1-me]) waiting[w?'yes':'no']++; }
    for(let g=0;g<s.groups.length;g++){ const A=prevGroups[g], B=s.groups[g]; if(A.rewardAvailable&&!B.rewardAvailable&&A.captureTeam===me&&respawnAt[g]!==undefined){ gaps.push(s.round-respawnAt[g]); delete respawnAt[g]; } }
    prevA=a; prevGroups=s.groups;
  }
}
console.log('respawn->our capture gap: median',median(gaps),'mean',mean(gaps).toFixed(1),'p25',[...gaps].sort((a,b)=>a-b)[Math.floor(gaps.length/4)],'p75',[...gaps].sort((a,b)=>a-b)[Math.floor(gaps.length*3/4)],'n',gaps.length);
console.log('own-side group respawn with our champion within 2 (waiting):',waiting);
