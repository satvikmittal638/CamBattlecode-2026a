import fs from 'node:fs';import path from 'node:path';import {dumpReplay} from '../../tools/replay_dump.mjs';
const D=path.dirname(new URL(import.meta.url).pathname),shadows=JSON.parse(fs.readFileSync(D+'/platform_shadow/summary.json')).filter(r=>r.matchFraction>=.98&&!r.ended&&!r.preempted);
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));const out=[];
for(const row of shadows){
 const cases=new Map(row.mechanismTurns.filter(x=>x.match&&x.log.includes('repair-focus-escape')).map(x=>[`${x.r}:${x.id}`,x]));if(!cases.size)continue;
 let eng,game,buf,persp,cur=null;const turns=[];
 const flush=()=>{if(cur){turns.push(cur);cur=null;}};
 await dumpReplay(path.join(D,'platform',row.file),{snapshots:'none',mapInfo:true,onStart(s){eng=s.eng;game=s.game;buf=eng.exp.Engine_Malloc(1024);persp=eng.exp.Engine_Malloc(16);},onStep(st,ev){
  if(st.step.kind===3&&st.step.phase===14&&st.phase===10){flush();const c=st.champions.find(x=>x.entity.index===st.currentChampion);if(!c||c.team!==(row.side==='b'?1:0))return;
   const key=`${st.round}:${c.entity.index}`;if(!cases.has(key))return;
   eng.view.setUint32(persp,c.team,true);eng.view.setUint32(persp+4,c.entity.index,true);
   const foes=[];for(const e of st.champions){if(!e.alive||e.team===c.team||!e.position)continue;
    if(eng.exp.Game_API_InVision(game,persp,e.position.x,e.position.y,buf)||!eng.view.getUint32(buf,true))continue;
    if(eng.exp.Game_API_Champion_Get(game,persp,e.entity.index,buf))continue;
    foes.push({p:e.position,s:eng.view.getFloat32(buf+24,true),r:eng.view.getInt32(buf+36,true)});
   }
   cur={r:st.round,id:c.entity.index,origin:{...c.position},end:{...c.position},hp:c.health,max:c.maxHealth,gems:c.gems,foes,acts:[]};
  }
  if(cur&&ev?.actor?.index===cur.id&&ev.actor.kind===1){const c=st.champions.find(x=>x.entity.index===cur.id);if(c?.position)cur.end={...c.position};cur.acts.push(ev.kind);}
 }});flush();
 for(const t of turns){const risk=p=>t.foes.filter(f=>dist(f.p,p)<=f.r).reduce((s,f)=>s+f.s,0);t.beforeBasic=risk(t.origin);t.afterBasic=risk(t.end);t.moved=dist(t.origin,t.end)>0;delete t.foes;}
 out.push({...row,mechanismTurns:undefined,stages:undefined,focusEffects:turns});
 console.log(row.map,turns.length,'focus turns');
}
fs.writeFileSync(D+'/focus_effects.json',JSON.stringify(out));
const all=out.flatMap(x=>x.focusEffects),m=all.filter(t=>t.moved),withExposure=m.filter(t=>t.beforeBasic>0);console.log(JSON.stringify({focusTurns:all.length,moveTurns:m.length,withCurrentBasicExposure:withExposure.length,reduced:withExposure.filter(t=>t.afterBasic<t.beforeBasic).length,equal:withExposure.filter(t=>t.afterBasic===t.beforeBasic).length,increased:withExposure.filter(t=>t.afterBasic>t.beforeBasic).length,beforeTotal:withExposure.reduce((s,t)=>s+t.beforeBasic,0),afterTotal:withExposure.reduce((s,t)=>s+t.afterBasic,0)}));
