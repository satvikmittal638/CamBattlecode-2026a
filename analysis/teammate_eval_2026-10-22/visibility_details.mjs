import fs from 'node:fs';import {dumpReplay,STEP_KINDS,CHAMPION_TYPES} from '../../tools/replay_dump.mjs';
const dir=import.meta.dirname,rows=JSON.parse(fs.readFileSync(dir+'/metrics.json')).rows;
const ids=process.argv.slice(2),chosen=ids.length?rows.filter(g=>ids.includes(g.matchId)):rows.filter(g=>g.result==='loss'&&!['00contest','01boss_battle'].includes(g.map)).sort((a,b)=>a.score-b.score).slice(0,12);
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y)),out=[];
for(const g of chosen){let eng,game,stride,persp;const last=new Map(),history=new Map(),contacts=[],deathWindows=[],counts=[{starts:0,visibleOutnumbered:0,visibleIsolated:0},{starts:0,visibleOutnumbered:0,visibleIsolated:0}];
 const r=await dumpReplay(dir+'/games/'+g.file,{snapshots:'none',onStart(x){eng=x.eng;game=x.game;eng.check(eng.exp.Game_GetBitboardMetadata(game,eng.outBuf));stride=eng.view.getUint32(eng.outBuf+16,true);persp=eng.args+48;},onStep(st,ev,prev){
 const kind=STEP_KINDS[st.step.kind],a=st.step.actor.kind===1?st.champions.find(c=>c.entity.index===st.step.actor.index):null;
 if(a&&['Move','Attack','Cast ability','Recall','Submit gems','Cancel channel'].includes(kind)){const v=history.get(a.entity.index)||[];v.push({r:st.round,kind,from:st.step.from,to:st.step.to,hp:a.health/a.maxHealth,target:ev?.target,ability:ev?.abilityType});if(v.length>10)v.shift();history.set(a.entity.index,v);}
 if(a&&prev&&kind==='Attack'&&ev?.target?.kind==='champion'&&ev.target.team!==a.team){
  if(st.round-(last.get(a.entity.index)??-1000)>10){
   eng.view.setUint32(persp,a.team,true);eng.view.setUint32(persp+4,a.entity.index,true);eng.check(eng.exp.Game_Visualiser_GetVisionBuffer(game,persp,eng.outBuf));const ptr=eng.view.getUint32(eng.outBuf,true);
   const seen=p=>{const word=(p.y>>3)*stride+(p.x>>3),bit=(p.y&7)*8+(p.x&7);return !!((eng.view.getUint8(ptr+word*8+(bit>>3))>>(bit&7))&1);};
   const b=prev.find(c=>c.entity.index===a.entity.index),near=prev.filter(c=>c.alive&&c.position&&dist(c.position,b.position)<=6),known=near.filter(c=>c.entity.index===a.entity.index||seen(c.position)),friends=known.filter(c=>c.team===a.team),enemies=known.filter(c=>c.team!==a.team);const z=counts[a.team];z.starts++;z.visibleOutnumbered+=enemies.length>friends.length;z.visibleIsolated+=friends.length===1&&enemies.length>=2;
   if(contacts.length<150)contacts.push({r:st.round,team:a.team,id:a.entity.index,type:CHAMPION_TYPES[a.type],hp:b.health/b.maxHealth,bag:b.gems,visibleFriends:friends.map(c=>CHAMPION_TYPES[c.type]),visibleEnemies:enemies.map(c=>CHAMPION_TYPES[c.type]),allFriends:near.filter(c=>c.team===a.team).length,allEnemies:near.filter(c=>c.team!==a.team).length,target:ev.target.type,recentActions:(history.get(a.entity.index)||[]).slice()});
  }last.set(a.entity.index,st.round);
 }
 if(prev)for(const c of st.champions){const b=prev.find(v=>v.entity.index===c.entity.index);if(b?.alive&&!c.alive&&deathWindows.length<100)deathWindows.push({r:st.round,team:c.team,id:c.entity.index,type:CHAMPION_TYPES[c.type],bag:b.gems,pos:b.position,recentActions:(history.get(c.entity.index)||[]).slice()});}
 }});
 if(r.meta.submittedGems[g.us]!==g.score||r.events.some(e=>e.error))throw Error('Validation failed');out.push({matchId:g.matchId,opponent:g.opponent,map:g.map,side:g.side,score:g.score,oppScore:g.oppScore,us:g.us,counts,contacts,deathWindows});console.log('Visibility audited',g.matchId,g.map,JSON.stringify(counts));
}
fs.writeFileSync(dir+'/visibility_details.json',JSON.stringify({method:'Personal champion vision mask immediately after each first basic attack on an enemy following >10 rounds without a basic attack on an enemy; count pre-attack living positions within Chebyshev 6. This is a sampled contact measure, not all engagements or proof of intent.',games:out},null,1));
