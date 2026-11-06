import fs from 'node:fs';import path from 'node:path';import {dumpReplay,STEP_KINDS} from '../../tools/replay_dump.mjs';
const dir=import.meta.dirname,old=path.resolve(dir,'../teammate_eval_2026-10-22'),index=JSON.parse(fs.readFileSync(old+'/games/index.json')),ids=['96f422b2-eebd-4628-ad1e-c172845d3428','67c8c5f3-13b8-4c72-be7e-f47265e1778d'],out=[];
for(const id of ids){const g=index.find(x=>x.matchId===id),us=g.side==='a'?0:1,turns=[],pending=new Map(),deaths=[];let eng,game,persp,info;
const result=await dumpReplay(old+'/games/'+g.file,{snapshots:'none',onStart(x){eng=x.eng;game=x.game;persp=eng.args+48;info=eng.args+64;},onStep(st,ev,prev){
 const kind=STEP_KINDS[st.step.kind],c=st.step.actor.kind===1?st.champions.find(x=>x.entity.index===st.step.actor.index):null;
 if(prev)for(const c of st.champions){const p=prev.find(x=>x.entity.index===c.entity.index);if(c.team===us&&c.type===12&&p?.alive&&!c.alive)deaths.push(st.round);}
 if(!c||c.team!==us||c.type!==12)return;
 if(kind==='Move'&&!pending.has(c.entity.index)&&c.alive&&c.health/c.maxHealth<.35&&!c.stunned){
  eng.view.setUint32(persp,c.team,true);eng.view.setUint32(persp+4,c.entity.index,true);eng.check(eng.exp.Game_API_Champion_Get(game,persp,c.entity.index,info));
  if(eng.view.getInt32(info+8,true)!==c.position.x||Math.abs(eng.view.getFloat32(info+16,true)-c.health)>.01)throw Error('Champion API ABI validation failed');
  const state=eng.view.getInt32(info+40,true);if(!(state&2048)||(state&(2|4|4096)))return;
  eng.check(eng.exp.Game_API_Champion_GetCooldown(game,persp,c.entity.index,0,eng.outBuf));const cd=eng.view.getInt32(eng.outBuf,true);if(cd!==0)return;
  eng.check(eng.exp.Game_API_Champion_GetAbilityShield(game,persp,c.entity.index,0,eng.outBuf));const shield=eng.view.getFloat32(eng.outBuf,true);
  pending.set(c.entity.index,{r:st.round,hp:c.health,maxHP:c.maxHealth,bag:c.gems,pos:c.position,shieldAvailable:shield,casts:[]});
 }
 if(kind==='Cast ability'&&pending.has(c.entity.index))pending.get(c.entity.index).casts.push(st.step.abilitySlot);
 if(kind==='End turn'&&pending.has(c.entity.index)){const p=pending.get(c.entity.index);if(p.r===st.round){p.endHP=c.health;turns.push(p);}pending.delete(c.entity.index);}
}});
if(result.meta.submittedGems[us]!==g.score)throw Error('Final replay mismatch');out.push({matchId:id,map:g.map,opponent:g.opponent,score:g.score,oppScore:g.oppScore,method:'Native champion API queried from own perspective immediately after a low-health movement step; coordinate and HP fields validated against replay state.',turns,deathRounds:deaths,availableUnusedTurns:turns.filter(t=>!t.casts.includes(0)).length});}
fs.writeFileSync(dir+'/recovery_evidence.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out.map(x=>({matchId:x.matchId,eligibleTurns:x.turns.length,availableUnused:x.availableUnusedTurns,examples:x.turns.slice(0,3),deaths:x.deathRounds}))));
