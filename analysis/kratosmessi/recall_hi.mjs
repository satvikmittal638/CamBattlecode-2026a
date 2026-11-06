import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, cheb, mean, median } from './lib.mjs';
const dir=process.argv[2]||'top_replays/2_KratosMessi';
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows']; let rows; if(fs.existsSync(dir+'/index.json')) rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0})); else { rows=[]; for(const s of ['a','b']) if(fs.existsSync(path.join(dir,s))) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,25);
const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;}; const t={}; const gold={}; const lowGoldHi=[];
let goldReach=0, goldReachRecall=0; const delay=[];
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const snapBy=new Map(); for(const s of d.snapshots) if(!snapBy.has(s.round)) snapBy.set(s.round,s);
  const myIds=d.meta.finalChampions.filter(c=>c.team===me).map(c=>c.id);
  for(const e of d.events){
    if(e.kind!=='Recall'||e.team!==me||e.actor?.kind!==1) continue;
    const s=snapBy.get(e.round); const c=s?.champions.find(x=>x.id===e.actor.index); if(!c) continue;
    if(c.hp/c.maxHp<0.45) continue;
    const prev=d.events.filter(x=>x.actor?.kind===1&&x.actor.index===e.actor.index&&x.round>=e.round-4&&x.round<=e.round).map(x=>x.kind==='Attack'?'atk'+(x.target?.kind||''):x.kind).filter(k=>k!=='Move'&&k!=='Recall');
    const s5=snapBy.get(e.round-6); const c5=s5?.champions.find(x=>x.id===e.actor.index);
    const gotGold=c5?c.gold-c5.gold:0;
    inc(t,`gold${c.gold>=150?'>=150':'<150'} gems${c.gems>0?'>0':'=0'} prevGoldGain:${gotGold>0} last:${[...new Set(prev)].join('/')||'-'}`);
    if(c.gold<150) lowGoldHi.push(`${c.type} r${e.round} hp${(c.hp/c.maxHp).toFixed(2)} gold${c.gold} gems${c.gems} dist${cheb(c.pos,m.spawnC[me])}`);
  }
  // when gold first reaches >=150 (alive, off-spawn), how long until recall?
  for(const id of myIds){ let prevG=0; for(const s of d.snapshots){ const c=s.champions.find(x=>x.id===id); if(!c||!c.alive) {prevG=c?.gold||0; continue;} if(c.gold>=150&&prevG<150){ goldReach++; const rec=d.events.find(x=>x.kind==='Recall'&&x.actor?.kind===1&&x.actor.index===id&&x.round>=s.round&&x.round<=s.round+40); const atSpawn=cheb(c.pos,m.spawnC[me])<=2; if(rec&&!atSpawn){goldReachRecall++; delay.push(rec.round-s.round);} } prevG=c.gold; } }
}
console.log(Object.entries(t).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k,v])=>v+' '+k).join('\n'));
console.log('lowgold hi-hp recalls sample'); lowGoldHi.slice(0,12).forEach(x=>console.log('  ',x));
console.log('gold reached 150:',goldReach,'recall within 40r:',goldReachRecall,'delay median',median(delay),'p25',[...delay].sort((a,b)=>a-b)[Math.floor(delay.length/4)],'p75',[...delay].sort((a,b)=>a-b)[Math.floor(delay.length*3/4)]);
