import fs from 'node:fs';import path from 'node:path';import {dumpReplay,CHAMPION_TYPES} from '../../tools/replay_dump.mjs';
const D=path.dirname(new URL(import.meta.url).pathname),P=process.argv[3]?path.resolve(process.argv[3],'platform'):D+'/baseline/platform',part=+(process.argv[2]||0),prefix=process.argv[4]||'duo',F=D+`/${prefix}_${part}.json`;
const rows=JSON.parse(fs.readFileSync(P+'/index.json')).filter((_,i)=>i%4===part),out=fs.existsSync(F)?JSON.parse(fs.readFileSync(F)):[],done=new Set(out.map(r=>r.matchId));
const dist=(a,b)=>a&&b?Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y)):null;
for(const row of rows.filter(r=>!done.has(r.matchId))){const us=+(row.side==='b'),deaths=[],locks=[],purchases=[],proximity={turns:0,near:0,distanceSum:0,earlyTurns:0,earlyNear:0},pairCaptures={gold:0,gems:0};let map;
 await dumpReplay(P+'/'+row.file,{snapshots:'none',mapInfo:true,onStart(s){map=s.mapInfo},onStep(st,ev,prev){
  if(ev?.team===us&&ev.kind==='Place altar lock')locks.push({r:st.round,c:ev.actor.index,to:ev.to});
  if(ev?.team===us&&ev.kind==='Shop'&&ev.items?.consumable2>0)purchases.push({r:st.round,c:ev.actor.index,n:ev.items.consumable2});
  if(st.step.kind===3&&st.step.phase===14&&st.phase===10){
   const duo=st.champions.filter(c=>c.team===us&&(c.type===3||c.type===4));
   if(duo.length===2&&duo.every(c=>c.alive&&c.position)&&duo.some(c=>c.entity.index===st.currentChampion)){
    const d=dist(duo[0].position,duo[1].position);proximity.turns++;proximity.distanceSum+=d;if(d<=5)proximity.near++;
    if(st.round<=300){proximity.earlyTurns++;if(d<=5)proximity.earlyNear++;}
   }
  }
  if(!prev)return;const duo=prev.filter(c=>c.team===us&&(c.type===3||c.type===4));
  if(ev?.kind==='Capture')for(const b of duo){const c=st.champions.find(c=>c.entity.index===b.entity.index);if(c){pairCaptures.gold+=Math.max(0,c.gold-b.gold);pairCaptures.gems+=Math.max(0,c.gems-b.gems);}}
  if(duo.length!==2||!duo.every(c=>c.alive)||!duo.some(b=>!st.champions.find(c=>c.entity.index===b.entity.index)?.alive))return;
  const target=duo.find(c=>ev?.target?.kind==='champion'&&ev.target.id===c.entity.index),partner=target?duo.find(c=>c!==target):null;
  const direct=ev?.kind==='Attack'||(ev?.kind==='Cast ability'&&ev.abilityType==='Damage');
  deaths.push({r:st.round,event:ev,identifiedTarget:target?CHAMPION_TYPES[target.type]:null,direct,
   bodies:duo.map(c=>({id:c.entity.index,type:CHAMPION_TYPES[c.type],hp:c.health,mhp:c.maxHealth,gems:c.gems,pos:c.position})),
   partnerHpFraction:partner?partner.health/partner.maxHealth:null,distance:dist(duo[0].position,duo[1].position),
   targetOnSpawn:target?.position?(()=>{const p=target.position,s=map.spawn[us];return p.x>=s.minX&&p.x<=s.maxX&&p.y>=s.minY&&p.y<=s.maxY})():null});
 }});
 out.push({...row,deaths,locks,purchases,proximity,pairCaptures});fs.writeFileSync(F,JSON.stringify(out));console.log(part,out.length,row.map,'linked deaths',deaths.length);
}
