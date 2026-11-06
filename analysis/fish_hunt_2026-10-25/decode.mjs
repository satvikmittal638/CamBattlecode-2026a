import fs from 'node:fs';import zlib from 'node:zlib';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {dumpReplay,CHAMPION_TYPES,STEP_KINDS,ITEM_NAMES} from '../../tools/replay_dump.mjs';
const dir=process.env.FISH_DATASET??import.meta.dirname,D=(a,b)=>a&&b?Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y)):999;
const nap=ms=>new Promise(r=>setTimeout(r,ms));
async function one(g){
 const us=g.side==='a'?0:1;let eng,game,buf,persp,map,last,steps=0,lastBank=[0,0],lastRound=-1,cur=null;
 const roles={},banking=[],deaths=[],captures=[],casts=[],recalls=[],wards=[],priorities=[],checkpoints={},turns=[],groups={},campGroup={},cycles={};
 const pStats={turns:0,nearAlly5:0,maxBag:0,maxFocus:0,maxFocusError:0,nearTypes:{},aliveRounds:0};
 const role=c=>roles[c.entity.index]??={id:c.entity.index,type:CHAMPION_TYPES[c.type],team:c.team,gemsCaptured:0,goldCaptured:0,gemsStolen:0,gemsBanked:0,gemsLost:0,kills:0,deaths:0,campDamage:0,enemyDamage:0,bankAttempts:[],buys:[],casts:[0,0],wards:0,recalls:0,botErrors:0};
 const V=()=>eng.view,U=o=>V().getUint32(buf+o,true),I=o=>V().getInt32(buf+o,true),F=o=>V().getFloat32(buf+o,true);
 const query=(fn,...a)=>eng.exp[fn](game,persp,...a,buf)===0?I(0):null;
 const info=id=>{if(eng.exp.Game_API_Champion_Get(game,persp,id,buf)!==0)return null;return {id,team:I(0),type:I(4),x:I(8),y:I(12),hp:F(16),mhp:F(20),str:F(24),focus:F(28),range:I(36),state:U(40)};};
 function finish(){if(!cur)return;turns.push(cur);cur=null;}
 function observe(st,c){
  V().setUint32(persp,us,true);V().setUint32(persp+4,c.entity.index,true);
  const me=info(c.entity.index);if(!me)return null;
  const cd=[0,1].map(s=>query('Game_API_Champion_GetCooldown',c.entity.index,s));
  const channel=query('Game_API_Champion_GetChannelTime',c.entity.index)??-1,priority=query('Game_API_Champion_GetPriority',c.entity.index,0);
  const allies=[],enemies=[];
  for(const a of st.champions){if(a.entity.index===c.entity.index||!a.alive||!a.position)continue;
   // Even offline feature extraction queries the observing champion's personal vision.
   if(eng.exp.Game_API_InVision(game,persp,a.position.x,a.position.y,buf)!==0||U(0)===0)continue;
   const ci=info(a.entity.index);if(!ci)continue;(ci.team===us?allies:enemies).push(ci);
  }
  const visCamps=[];
  for(const cp of st.camps){if(!(cp.health>0))continue;
   if(eng.exp.Game_API_InVision(game,persp,cp.position.x,cp.position.y,buf)!==0||U(0)===0)continue;
   visCamps.push({id:cp.entity.index,type:cp.type,pos:cp.position,hp:cp.health,d:D(c.position,cp.position)});
  }
  const nearest=arr=>arr.length?Math.min(...arr.map(x=>D(c.position,x))):99;
  const spawn=map.spawn[us],homeD=Math.max(0,spawn.minX-c.position.x,c.position.x-spawn.maxX,spawn.minY-c.position.y,c.position.y-spawn.maxY);
  const altarD=map.altars.length?Math.min(...map.altars.map(([x,y])=>D(c.position,{x,y}))):99;
  const shard=(stat)=>c.items.reduce((s,n,i)=>s+(Math.floor((i%6)/2)===stat?n*(i%2?(Math.floor(i/6)===1?6:5):1):0)+(Math.floor(i/6)===6&&i%2&&Math.floor((i%6)/2)!==stat?n:0),0);
  const rec={r:st.round,c:c.entity.index,t:c.type,x:c.position.x,y:c.position.y,hp:+me.hp.toFixed(3),mhp:me.mhp,hpf:+(me.hp/me.mhp).toFixed(5),gold:c.gold,bag:c.gems,focus:me.focus,str:me.str,state:me.state,stun:+c.stunned,cd0:cd[0],cd1:cd[1],channel,priority,homeD,altarD,bank:st.submittedGems[us],enemyBank:st.submittedGems[1-us],focusShards:shard(1),healthShards:shard(2),allies:allies.length,allyD:nearest(allies),enemies:enemies.length,enemyD:nearest(enemies),enemyMinHp:enemies.length?Math.min(...enemies.map(a=>a.hp)):99999,enemy4:enemies.filter(a=>D(c.position,a)<=4).length,camps:visCamps.length,campD:visCamps.length?Math.min(...visCamps.map(a=>a.d)):99,camps3:visCamps.filter(a=>a.d<=3).length,camps4:visCamps.filter(a=>a.d<=4).length,campMinHp:visCamps.length?Math.min(...visCamps.map(a=>a.hp)):99999,acts:[]};
  // Public static camp tiles and API-observed group state; no hidden live camps enter features.
  let readyD=99,readyGems=0;
  for(const gr of Object.values(groups)){if(eng.exp.Game_API_CampGroup_GetState(game,persp,gr.id,buf)!==0||U(0)!==2)continue;const d=Math.min(...gr.tiles.map(p=>D(c.position,p)));if(d<readyD){readyD=d;readyGems=gr.gems;}}
  rec.rewardD=readyD;rec.rewardGems=readyGems;
  for(const type of [0,1,2,6,7,12])rec['ally'+type+'D']=nearest(allies.filter(a=>a.type===type));
  if(c.type===6){pStats.turns++;pStats.maxBag=Math.max(pStats.maxBag,c.gems);pStats.maxFocus=Math.max(pStats.maxFocus,me.focus);pStats.maxFocusError=Math.max(pStats.maxFocusError,Math.abs(me.focus-(80+8*rec.focusShards+1.5*c.gems)));const offline=st.champions.filter(a=>a.team===us&&a.alive&&a.position&&a.entity.index!==c.entity.index);if(offline.some(a=>D(c.position,a.position)<=5))pStats.nearAlly5++;for(const a of offline)if(D(c.position,a.position)<=5)pStats.nearTypes[CHAMPION_TYPES[a.type]]=(pStats.nearTypes[CHAMPION_TYPES[a.type]]??0)+1;}
  return rec;
 }
 const res=await dumpReplay(dir+'/games/'+g.file,{snapshots:'none',mapInfo:true,onStart(s){eng=s.eng;game=s.game;map=s.mapInfo;buf=eng.exp.Engine_Malloc(8192);persp=eng.exp.Engine_Malloc(16);},onStep(st,ev,prev,pc){
  steps++;last=st;const kind=STEP_KINDS[st.step.kind],actor=st.step.actor.kind===1?st.champions.find(c=>c.entity.index===st.step.actor.index):null;
  if(!Object.keys(groups).length&&st.camps.length){for(const cp of st.camps){eng.check(eng.exp.Game_API_Map_CampInfo_GetGroup(game,cp.entity.index,buf));const id=U(0);campGroup[cp.entity.index]=id;if(!groups[id]){eng.check(eng.exp.Game_API_Map_CampGroup_Get(game,id,buf));groups[id]={id,gems:U(0),gold:U(4),tiles:[],types:[]};}groups[id].tiles.push(cp.position);groups[id].types.push(cp.type);}}
  let receipts=[];
  for(const c of st.champions){const z=role(c),b=prev?.find(a=>a.entity.index===c.entity.index);if(!b)continue;z.kills+=Math.max(0,c.kills-b.kills);
   if(b.alive&&!c.alive){z.deaths++;z.gemsLost+=b.gems;deaths.push({r:st.round,id:c.entity.index,type:z.type,team:c.team,bag:b.gems,killer:actor?CHAMPION_TYPES[actor.type]:null,pos:b.position});}
   const dg=c.gems-b.gems,dc=c.gold-b.gold;
   if(kind==='Capture'&&(dg>0||dc>0)){z.gemsCaptured+=Math.max(0,dg);z.goldCaptured+=Math.max(0,dc);receipts.push({id:c.entity.index,type:z.type,team:c.team,gems:Math.max(0,dg),gold:Math.max(0,dc),pos:c.position});}
   else if(dg>0&&['Attack','Cast ability'].includes(kind))z.gemsStolen+=dg;
  }
  if(receipts.length){const gr=Object.values(groups).find(gr=>receipts.some(r=>gr.tiles.some(p=>D(p,r.pos)===0))),cy=gr?cycles[gr.id]:null;captures.push({r:st.round,group:gr?.id,groupGems:gr?.gems,groupGold:gr?.gold,types:gr?.types,receipts,damage:cy??{},near:st.champions.filter(c=>c.alive&&c.position&&gr?.tiles.some(p=>D(c.position,p)<=5)).map(c=>({id:c.entity.index,type:CHAMPION_TYPES[c.type],team:c.team,d:Math.min(...gr.tiles.map(p=>D(p,c.position)))}))});if(gr)cycles[gr.id]={};}
  if(actor){const z=role(actor),b=prev?.find(a=>a.entity.index===actor.entity.index);
   if(kind==='Bot error')z.botErrors++;
   if(kind==='Shop'&&b){for(let i=0;i<actor.items.length;i++)if(actor.items[i]>b.items[i])z.buys.push({r:st.round,item:ITEM_NAMES[i],i,count:actor.items[i]-b.items[i],goldAfter:actor.gold});}
   if(kind==='Submit gems')z.bankAttempts.push({r:st.round,bag:actor.gems,hp:actor.health,maxHp:actor.maxHealth,pos:actor.position,bank:st.submittedGems[actor.team],enemyBank:st.submittedGems[1-actor.team]});
   if(kind==='Recall'){z.recalls++;recalls.push({r:st.round,id:actor.entity.index,type:z.type,team:actor.team,hp:actor.health,maxHp:actor.maxHealth,gold:actor.gold,bag:actor.gems,pos:actor.position});}
   if(kind==='Place ward'){z.wards++;wards.push({r:st.round,id:actor.entity.index,team:actor.team,type:z.type,from:st.step.from,to:st.step.to});}
   if(kind==='Set priority'&&actor.team===us)priorities.push({r:st.round,id:actor.entity.index,type:z.type,value:st.step.priority});
   if(prev&&['Attack','Cast ability'].includes(kind)){
    let campDamage=0,enemyDamage=0;const damaged=[];
    for(const cp of pc??[]){const delta=Math.max(0,cp.health-(st.camps.find(a=>a.entity.index===cp.entity.index)?.health??cp.health));if(delta>0){campDamage+=delta;const id=campGroup[cp.entity.index];cycles[id]??={};cycles[id][actor.entity.index]??={type:z.type,team:actor.team,damage:0};cycles[id][actor.entity.index].damage+=delta;damaged.push({id:cp.entity.index,type:cp.type,dmg:delta});}}
    for(const cp of prev.filter(a=>a.team!==actor.team))enemyDamage+=Math.max(0,cp.health-(st.champions.find(a=>a.entity.index===cp.entity.index)?.health??cp.health));
    z.campDamage+=campDamage;z.enemyDamage+=enemyDamage;
    if(kind==='Cast ability'){z.casts[st.step.abilitySlot]++;casts.push({r:st.round,id:actor.entity.index,type:z.type,team:actor.team,slot:st.step.abilitySlot,bag:actor.gems,campDamage,enemyDamage,target:ev?.target??null,to:st.step.to,from:st.step.from,damaged});}
   }
  }
  for(let t=0;t<2;t++)if(st.submittedGems[t]>lastBank[t]){const amount=st.submittedGems[t]-lastBank[t],old=(prev??[]).find(b=>b.team===t&&b.gems>0&&st.champions.some(c=>c.entity.index===b.entity.index&&c.gems<b.gems));if(old)role(old).gemsBanked+=amount;banking.push({r:st.round,id:old?.entity.index,type:old?CHAMPION_TYPES[old.type]:'UNATTRIBUTED',team:t,amount,bankBefore:lastBank[t]});}lastBank=st.submittedGems.slice();
  if(st.round!==lastRound){lastRound=st.round;if([100,200,300,500,900,1200,1600,1900].includes(st.round))checkpoints[st.round]={bank:st.submittedGems.slice(),gemsCaptured:[0,1].map(t=>Object.values(roles).filter(z=>z.team===t).reduce((s,z)=>s+z.gemsCaptured,0)),deaths:[0,1].map(t=>Object.values(roles).filter(z=>z.team===t).reduce((s,z)=>s+z.deaths,0)),bags:st.champions.map(c=>({type:CHAMPION_TYPES[c.type],team:c.team,bag:c.gems,hp:c.health,mhp:c.maxHealth,pos:c.position}))};}
  if(st.step.kind===3&&st.step.phase===14&&st.phase===10){finish();const c=st.champions.find(c=>c.entity.index===st.currentChampion);if(c?.team===us&&c.alive&&c.position)cur=observe(st,c);return;}
  if(cur&&ev&&ev.actor?.kind===1&&ev.actor.index===cur.c&&!['End turn'].includes(ev.kind)){
   const a={k:ev.kind};if(['Move','Attack','Cast ability','Place ward','Submit gems','Place altar lock'].includes(ev.kind))a.to=ev.to;if(ev.target)a.target=ev.target;if(ev.kind==='Cast ability'){a.slot=ev.slot;a.ability=ev.abilityType;}if(ev.kind==='Set priority')a.priority=ev.priority;if(ev.items)a.items=ev.items;cur.acts.push(a);
  }
 }});finish();
 if(res.events.some(e=>e.error)||res.meta.submittedGems[us]!==g.score||res.meta.submittedGems[1-us]!==g.oppScore||res.meta.finalRound!==g.rounds||res.meta.outcome!==(g.result==='win'?(us===0?'teamA':'teamB'):(us===0?'teamB':'teamA')))throw Error('native validation failed');
 const r={...g,us,steps,engine:res.meta.engineVersion,mapInfo:{width:map.width,height:map.height,symmetry:map.symmetry,spawn:map.spawn,altars:map.altars,walls:Object.values(map.walls).reduce((s,n)=>s+n,0),bushes:Object.values(map.bushes).reduce((s,n)=>s+n,0)},groups:Object.values(groups),roles:Object.values(roles),prism:pStats,banking,deaths,captures,casts,recalls,wards,priorities,checkpoints,final:res.meta.finalChampions,turnCount:turns.length};
 const own=r.roles.filter(z=>z.team===us),pc=own.find(z=>z.type==='Prism'),pf=r.final.find(z=>z.team===us&&z.type==='Prism');
 r.prismConservation=pc?pc.gemsCaptured+pc.gemsStolen-pc.gemsBanked-pc.gemsLost-(pf?.gems??0):null;
 fs.writeFileSync(dir+'/turns/'+g.matchId+'.jsonl.gz',zlib.gzipSync(turns.map(x=>JSON.stringify(x)).join('\n')+'\n',{level:3}));
 fs.writeFileSync(dir+'/native/'+g.matchId+'.json',JSON.stringify(r));
 return {id:g.matchId,steps,turns:turns.length,focusError:pStats.maxFocusError,conservation:r.prismConservation};
}
if(!isMainThread){for(const g of workerData){try{let n=0;while(!fs.existsSync(dir+'/games/'+g.file)){if(n++>1600)throw Error('Replay download timeout');await nap(1500);}parentPort.postMessage({row:await one(g)});}catch(e){parentPort.postMessage({id:g.matchId,error:e.stack});}}}
else{
 for(const n of ['native','turns'])fs.mkdirSync(dir+'/'+n,{recursive:true});
 const idx=JSON.parse(fs.readFileSync(dir+'/matches.json')),limit=Number(process.env.PRISM_LIMIT??idx.length),jobs=idx.slice(0,limit).filter(g=>!fs.existsSync(dir+'/native/'+g.matchId+'.json'));let n=limit-jobs.length,steps=0;const errors=[];
 await Promise.all(Array.from({length:4},(_,j)=>new Promise(resolve=>{const w=new Worker(new URL(import.meta.url),{workerData:jobs.filter((_,i)=>i%4===j)});w.on('message',x=>{if(x.error){errors.push(x);console.log('ERROR',x.id,x.error);}else{n++;steps+=x.row.steps;if(n%25===0)console.log('NATIVE',n,'/',limit,'newSteps',steps);}});w.on('error',e=>errors.push({error:e.stack}));w.on('exit',code=>{if(code)errors.push({workerExit:code});resolve();});})));fs.writeFileSync(dir+'/native_run.json',JSON.stringify({at:new Date().toISOString(),requested:limit,completed:n,newSteps:steps,errors},null,2));if(errors.length||n!==limit)throw Error('Incomplete native analysis');console.log('ALL VALIDATED',n);
}
