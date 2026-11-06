import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, groupAt, cheb } from './lib.mjs';
const [file, side, map] = process.argv.slice(2); const me = side==='b'?1:0;
const d=await dumpReplay(file,{snapshots:'round'}); const m=loadMap(map);
const snapBy=new Map(); for(const s of d.snapshots) if(!snapBy.has(s.round)) snapBy.set(s.round,s);
let n=0;
for(const e of d.events){
  if(e.kind!=='Recall'||e.team!==me||e.actor?.kind!==1) continue;
  const hits=d.events.filter(x=>x.actor?.kind===2&&x.kind==='Attack'&&x.round>e.round&&x.round<=e.round+5&&x.target?.id===e.actor.index);
  if(!hits.length) continue;
  const s=snapBy.get(e.round); const c=s.champions.find(x=>x.id===e.actor.index);
  const camp=s.camps.find(x=>x.id===hits[0].actor.index);
  const prevActs=d.events.filter(x=>x.actor?.kind===1&&x.actor.index===e.actor.index&&x.round>=e.round-2&&x.round<=e.round).map(x=>`r${x.round}:${x.kind}${x.target?'->'+x.target.type:''}${x.kind==='Move'?'('+x.to+')':''}`);
  const campHitBefore=d.events.some(x=>x.actor?.kind===2&&x.kind==='Attack'&&x.round>=e.round-2&&x.round<=e.round&&x.target?.id===e.actor.index);
  console.log(`r${e.round} ${c.type} hp${(c.hp/c.maxHp).toFixed(2)} gems${c.gems} gold${c.gold} pos${c.pos} camp ${camp?.type}@${camp?.pos} hp${camp?.hp} dist${camp?cheb(camp.pos,c.pos):'?'} campHitBefore:${campHitBefore} | ${prevActs.join(' ')}`);
  if(++n>14) break;
}
