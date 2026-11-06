// Camp target choice: rank of chosen group among live groups by path distance from the decision point.
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, groupAt, cheb, bfs, groupDist, mean, median } from './lib.mjs';
const dir=process.argv[2]||'top_replays/2_KratosMessi'; const N=+(process.argv[3]||30); const sideArg=process.argv[4];
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows;
if(fs.existsSync(path.join(dir,'index.json'))){rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0}));}
else { rows=[]; const sub=['a','b'].filter(s=>fs.existsSync(path.join(dir,s))); if(sub.length){ for(const s of sub) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); } else rows=fs.readdirSync(dir).filter(f=>f.endsWith('.repl26a')).map(f=>({file:f,path:path.join(dir,f),map:MAPS.find(mm=>f.startsWith(mm)),me:sideArg==='b'?1:0,createdAt:f})); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const rank={}; const ratio=[]; const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;}; const chosenType={}; const nearestType={}; const byTypeRank={};
const allyOn={}; const skipWhy={}; const scoreHits={};
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const myIds=d.meta.finalChampions.filter(c=>c.team===me).map(c=>c.id);
  const snapBy=new Map(); for(const s of d.snapshots) if(!snapBy.has(s.round)) snapBy.set(s.round,s);
  for(const id of myIds){
    let lastG=-2, decisionR=1, prevGems=0, prevPos=null;
    // decision markers from snapshots: gem gain, teleport (recall arrival/respawn)
    const markers=new Set([1]);
    for(const s of d.snapshots){const c=s.champions.find(x=>x.id===id); if(!c) continue; if(c.alive&&c.gems>prevGems) markers.add(s.round); if(c.pos&&prevPos&&cheb(c.pos,prevPos)>2) markers.add(s.round); if(c.alive&&c.gems<prevGems) markers.add(s.round); prevGems=c.gems; prevPos=c.pos;}
    const mk=[...markers].sort((a,b)=>a-b);
    for(const e of d.events){
      if(e.actor?.kind!==1||e.actor.index!==id||e.kind!=='Attack'||e.target?.kind!=='camp') continue;
      const g=groupAt(m,e.to); if(g<0) continue;
      if(g===lastG) continue; const prevG=lastG; lastG=g;
      // decision round: latest marker <= e.round
      let dr=1; for(const x of mk){ if(x<=e.round) dr=x; else break; }
      const s=snapBy.get(dr); const c=s?.champions.find(x=>x.id===id); if(!c||!c.pos) continue;
      const df=bfs(m,c.pos,me);
      const live=new Set(); for(const cp of s.camps){ if(cp.hp>0){const gg=groupAt(m,cp.pos); if(gg>=0) live.add(gg);} }
      if(!live.has(g)) live.add(g);
      const cand=[...live].filter(x=>m.groups[x].types!=='Monolith'&&!m.groups[x].types.includes('Monolith')).map(x=>({g:x,d:groupDist(m,df,x)})).filter(x=>x.d<1e9).sort((a,b)=>a.d-b.d);
      const idx=cand.findIndex(x=>x.g===g); const rk=idx<0?'notlive':idx>=3?'3+':String(idx);
      inc(rank,rk); if(idx>=0&&cand[0].d>0) ratio.push(cand[idx].d/Math.max(1,cand[0].d));
      inc(chosenType,m.groups[g].types); if(cand[0]) inc(nearestType,m.groups[cand[0].g].types);
      // value-based score: gems+gold/4 per (dist+clear)
      const val=(x)=>(m.groups[x.g].gems+m.groups[x.g].gold*0.25)/(x.d+10);
      const best=[...cand].sort((a,b)=>val(b)-val(a))[0]; inc(scoreHits, best&&best.g===g?'valBest':'valNot');
      // ally present near chosen group at decision time
      const allyNear=s.champions.some(o=>o.team===me&&o.id!==id&&o.alive&&o.pos&&m.groups[g].cells.some(cc=>cheb(o.pos,[cc.x,cc.y])<=3));
      inc(allyOn,(allyNear?'allyThere':'noAlly')+':'+rk);
      if(idx>=1){ const n0=cand[0]; const allyAtNearest=s.champions.some(o=>o.team===me&&o.id!==id&&o.alive&&o.pos&&m.groups[n0.g].cells.some(cc=>cheb(o.pos,[cc.x,cc.y])<=4)); const enemyAtNearest=s.champions.some(o=>o.team!==me&&o.alive&&o.pos&&m.groups[n0.g].cells.some(cc=>cheb(o.pos,[cc.x,cc.y])<=5)); const opp=m.groups[n0.g].dist[1-me]<m.groups[n0.g].dist[me]; inc(skipWhy,`${m.groups[n0.g].types}${allyAtNearest?' allyThere':''}${enemyAtNearest?' enemyThere':''}${opp?' oppSide':''} dd${Math.min(9,cand[idx].d-n0.d)}`); }
    }
  }
}
console.log('rank of chosen among live groups by path dist', rank);
console.log('dist ratio chosen/nearest median',median(ratio),'mean',mean(ratio).toFixed(2));
console.log('chosen types',chosenType); console.log('nearest types',nearestType);
console.log('value-score agreement',scoreHits); console.log('ally near chosen',allyOn);

console.log('skipped nearest reasons', Object.fromEntries(Object.entries(skipWhy).sort((a,b)=>b[1]-a[1]).slice(0,30)));
