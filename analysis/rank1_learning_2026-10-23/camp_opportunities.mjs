// Diagnose available melee basics omitted next to personally visible awake camps.
import fs from 'node:fs';import {dumpReplay,STEP_KINDS} from '../../tools/replay_dump.mjs';
const dir=import.meta.dirname,src=dir+'/../v57_eval_2026-10-23',idx=JSON.parse(fs.readFileSync(src+'/games/index.json')),ids=['9600c1d3-d770-4776-b572-fe9fa1a6771f','710c1222-492e-4c2c-ac47-4cdc8435ceb8','62f317cd-be9d-4fb7-b15e-b558a65892ab'],rows=[];
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
for(const id of ids){const g=idx.find(x=>x.matchId===id),us=g.side==='a'?0:1,acts=new Map(),out={matchId:id,map:g.map,checks:0,alreadyBasic:0,basicStillAvailableAfterAttack:0,healthyOmitted:0,castCampOmitted:0,examples:[]};let eng,game,info,persp;
 await dumpReplay(src+'/games/'+g.file,{snapshots:'none',mapInfo:true,onStart(x){eng=x.eng;game=x.game;info=eng.args+64;persp=eng.args+48;},onStep(st,ev,prev,pc){
 const a=st.step.actor.kind===1?st.champions.find(c=>c.entity.index===st.step.actor.index):null;if(!a||a.team!==us)return;
 const kind=STEP_KINDS[st.step.kind],id=a.entity.index,z=acts.get(id)||{basic:false,castCamp:false};
 if(kind==='Attack')z.basic=true;
 if(kind==='Cast ability'&&prev&&pc&&pc.some(c=>c.health>(st.camps.find(v=>v.entity.index===c.entity.index)?.health??c.health)))z.castCamp=true;
 if(kind!=='End turn'){acts.set(id,z);return;}acts.delete(id);
 if(!a.alive||!a.position)return;
 eng.view.setUint32(persp,us,true);eng.view.setUint32(persp+4,id,true);eng.check(eng.exp.Game_API_Champion_Get(game,persp,id,info));
 if(eng.view.getInt32(info+8,true)!==a.position.x||Math.abs(eng.view.getFloat32(info+16,true)-a.health)>.02)throw Error('Champion ABI mismatch');
 const state=eng.view.getInt32(info+40,true),range=eng.view.getInt32(info+36,true);if(range!==1)return;
 out.checks++;if(z.basic){out.alreadyBasic++;if(state&16)out.basicStillAvailableAfterAttack++;return;}
 if(!(state&16)||state&(2|4|4096)||a.health<a.maxHealth*.6)return;
 const seen=(p)=>{eng.check(eng.exp.Game_API_InVision(game,persp,p.x,p.y,eng.outBuf));return !!eng.view.getInt32(eng.outBuf,true);};
 if(st.champions.some(c=>c.team!==us&&c.alive&&c.position&&dist(c.position,a.position)<=6&&seen(c.position)))return;
 const camps=[];for(const c of st.camps)if(c.health>0&&dist(c.position,a.position)<=1&&seen(c.position)){eng.check(eng.exp.Game_API_Camp_GetState(game,persp,c.entity.index,eng.outBuf));if(eng.view.getInt32(eng.outBuf,true)===1)camps.push({id:c.entity.index,pos:c.position,hp:c.health});}
 if(!camps.length)return;out.healthyOmitted++;if(z.castCamp)out.castCampOmitted++;
 if(out.examples.length<12)out.examples.push({r:st.round,id,type:a.type,hp:a.health,maxHp:a.maxHealth,pos:a.position,castCamp:z.castCamp,camps});
 }});rows.push(out);
}
fs.writeFileSync(dir+'/camp_opportunities.json',JSON.stringify({definition:'Healthy melee ends its turn with a basic still available, no personally visible enemy within6, adjacent personally visible awake camp. Descriptive opportunity; target-group intent is not observable.',rows},null,2));console.log(JSON.stringify(rows,null,2));
