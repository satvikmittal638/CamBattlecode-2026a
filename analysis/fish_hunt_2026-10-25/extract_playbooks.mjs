import fs from 'node:fs';
import {dumpReplay,STEP_KINDS} from '../../tools/replay_dump.mjs';
const dir=import.meta.dirname,src=dir+'/fish_recent',out=dir+'/playbooks';fs.mkdirSync(out,{recursive:true});
const games=JSON.parse(fs.readFileSync(src+'/matches.json')).filter(g=>g.result==='loss'&&g.side==='b');
const summary=[];
for(const g of games){
 const team=0,actions=[],turns=[];let map,eng,game,b,ng;
 const result=await dumpReplay(src+'/games/'+g.file,{snapshots:'none',mapInfo:true,onStart(s){({mapInfo:map,eng,game}=s);b=eng.exp.Engine_Malloc(64);},onStep(st,ev,prev){
  if(ng===undefined&&st.camps.length){const ids=new Set();for(const c of st.camps){eng.check(eng.exp.Game_API_Map_CampInfo_GetGroup(game,c.entity.index,b));ids.add(eng.view.getUint32(b,true));}ng=ids.size;}
  const step=st.step,c=st.champions.find(c=>c.entity.index===step.actor.index);
  if(step.kind===3&&step.phase===14&&st.phase===10){const a=st.champions.find(c=>c.entity.index===st.currentChampion);if(a?.team===team&&a.alive&&a.position)turns.push({r:st.round,t:a.type,x:a.position.x,y:a.position.y,hp:a.health,g:a.gems,gold:a.gold});}
  if(step.actor.kind!==1||c?.team!==team)return;
  const kind=step.kind,a={r:st.round,t:c.type,k:kind,x:step.to.x,y:step.to.y,s:step.abilitySlot??0,v:0};
  if(kind===9)a.v=step.priority;
  if(kind===13||kind===25){const before=prev?.find(b=>b.entity.index===c.entity.index);if(!before)throw Error('No prior shop');
   for(let i=0;i<42;i+=2){const count=c.items[i]-before.items[i]+5*(c.items[i+1]-before.items[i+1]);if(count)actions.push({...a,k:count>0?13:25,s:i,v:Math.abs(count)});}
   for(let i=0;i<4;i++){const count=c.consumables[i]-before.consumables[i];if(count>0)actions.push({...a,k:30,s:i,v:count});}
   return;
  }
  if([4,5,6,9,11,12,14,16,20,21,23].includes(kind))actions.push(a);
 }});
 const row={...g,team,width:map.width,height:map.height,groups:ng,symmetry:map.symmetry,spawn:map.spawn[0],draft:result.meta.draft[0],turns,actions};
 fs.writeFileSync(out+'/'+g.map+'.json',JSON.stringify(row));summary.push({map:g.map,source:g.matchId,side:'a',w:map.width,h:map.height,groups:ng,draft:g.oppDraft.map(Number),rounds:result.meta.finalRound,score:g.oppScore,enemyScore:g.score,actions:actions.length,turns:turns.length,counts:Object.fromEntries([...new Set(actions.map(a=>a.k))].map(k=>[STEP_KINDS[k]??k,actions.filter(a=>a.k===k).length]))});
 console.log(JSON.stringify(summary.at(-1)));
}
fs.writeFileSync(out+'/summary.json',JSON.stringify(summary,null,2));
