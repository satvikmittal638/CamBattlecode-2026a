import fs from 'node:fs';
import path from 'node:path';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {dumpReplay,STEP_KINDS,CHAMPION_TYPES} from '../../tools/replay_dump.mjs';
const root=path.resolve(import.meta.dirname,'../..');
const indexPath=path.join(import.meta.dirname,'games/index.json');
const outDir=import.meta.dirname;
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const inside=(p,r)=>p&&p.x>=r.minX&&p.x<=r.maxX&&p.y>=r.minY&&p.y<=r.maxY;
const campAt=(arr,id)=>arr[id]?.entity.index===id?arr[id]:arr.find(v=>v.entity.index===id);
const metric=()=>({groupCaps:0,gemGroupCaps:0,caps:0,gemCaps:0,capGems:0,capGold:0,moves:0,attackChampion:0,attackCamp:0,casts:0,recalls:[],recallsOutside:[],recoveryArrivals:0,submitStarts:0,bankEvents:0,turns:0,aliveTurns:0,lowTurns:0,stunTurns:0,spawnTurns:0,walkTurns:0,farmTurns:0,fightTurns:0,channelTurns:0,idleTurns:0,intervalRounds:[],checkpoints:{},potentialWinRounds:0,nativeErrors:0});
async function analyze(g){
 const us=g.side==='a'?0:1, m=[metric(),metric()];let map,last,lastR=-1;const histories=new Map(),actions=new Map(),lastCap=new Map(),pending=new Map(),episodes=[],deaths=[],monolith={},bankTimeline=[],captureEvents=[];const combat=[{attacks:0,lowAttacks:0,outnumberedAttacks:0,contactStarts:0,lowStarts:0,outnumberedStarts:0,damage:0,damagingCasts:0,campDamage:0,campDeaths:0},{attacks:0,lowAttacks:0,outnumberedAttacks:0,contactStarts:0,lowStarts:0,outnumberedStarts:0,damage:0,damagingCasts:0,campDamage:0,campDeaths:0}],lastFight=new Map(),contacts=[],shops=[];let steps=0,comps=null,campGroup=new Map(),tileGroup=new Map(),clearAt=new Map(),hitAt=new Map();
 const result=await dumpReplay(path.join(path.dirname(indexPath),g.file),{snapshots:'none',mapInfo:true,onStart(x){map=x.mapInfo;const a={...map.spawn[0],maxX:map.spawn[0].maxX-1,maxY:map.spawn[0].maxY-1},fx=v=>map.width-1-v,fy=v=>map.height-1-v;const mirrorX=map.symmetry!=='vertical',mirrorY=map.symmetry!=='horizontal';map.spawn=[a,{minX:mirrorX?fx(a.maxX):a.minX,maxX:mirrorX?fx(a.minX):a.maxX,minY:mirrorY?fy(a.maxY):a.minY,maxY:mirrorY?fy(a.minY):a.maxY}];},onStep(st,ev,prev,prevCamps){
  steps++;last=st;
  if(!comps&&st.camps.length){comps=[];const assigned=new Set();for(const c of st.camps){if(assigned.has(c.entity.index))continue;const members=[c.entity.index],gid=comps.length;assigned.add(c.entity.index);for(let i=0;i<members.length;i++){const p=st.camps.find(v=>v.entity.index===members[i]).position;for(const v of st.camps)if(!assigned.has(v.entity.index)&&Math.abs(v.position.x-p.x)+Math.abs(v.position.y-p.y)===1){assigned.add(v.entity.index);members.push(v.entity.index);}}const types={};for(const id of members){const v=st.camps.find(v=>v.entity.index===id);campGroup.set(id,gid);tileGroup.set(v.position.x+','+v.position.y,gid);types[v.type]=(types[v.type]||0)+1;}comps.push({members,types});}}
  if(prevCamps)for(const c of st.camps){const b=campAt(prevCamps,c.entity.index),gid=campGroup.get(c.entity.index);if(b&&c.health<b.health&&!hitAt.has(gid))hitAt.set(gid,st.round);if(b&&b.health>0&&c.health<=0&&comps[gid].members.every(id=>campAt(st.camps,id)?.health<=0))clearAt.set(gid,st.round);if(b&&b.health<=0&&c.health>0){clearAt.delete(gid);hitAt.delete(gid);}}
const kind=STEP_KINDS[st.step.kind],a=st.champions.find(c=>c.entity.index===st.step.actor.index&&st.step.actor.kind===1);
  if(st.round!==lastR){lastR=st.round;
   for(let t=0;t<2;t++){
    const cs=st.champions.filter(c=>c.team===t),bag=cs.filter(c=>c.alive).reduce((s,c)=>s+c.gems,0);
    if(st.submittedGems[t]<1000&&st.submittedGems[t]+bag>=1000)m[t].potentialWinRounds++;
    if([100,300,500,600,900,1000,1500].includes(st.round))m[t].checkpoints[st.round]={bank:st.submittedGems[t],bag,gold:cs.reduce((s,c)=>s+c.gold,0),shards:cs.reduce((s,c)=>s+c.items.reduce((v,n,i)=>v+n*((i%2)?(Math.floor(i/6)===1?6:5):1),0),0)};
   }
   for(const c of st.champions){const id=c.entity.index;let h=histories.get(id)||[];h.push({r:st.round,hp:c.health/max(c.maxHealth),pos:c.position,alive:c.alive,gems:c.gems,stun:c.stunned});if(h.length>8)h.shift();histories.set(id,h);
    let ep=pending.get(id);
    if(ep){if(!c.alive){ep.end='death';ep.endRound=st.round;episodes.push(ep);pending.delete(id);}else if(inside(c.position,map.spawn[c.team])||c.health/c.maxHealth>=.6){ep.end=inside(c.position,map.spawn[c.team])?'spawn':'heal';ep.endRound=st.round;episodes.push(ep);pending.delete(id);}}
    if(!pending.has(id)&&c.alive&&c.position&&!inside(c.position,map.spawn[c.team])&&c.health/c.maxHealth<.35){pending.set(id,{id,type:CHAMPION_TYPES[c.type],team:c.team,start:st.round,hp:c.health/c.maxHealth,bag:c.gems,recalls:0,moves:0,attacks:0});}
   }
  }
  if(prev)for(const c of st.champions){const b=prev.find(v=>v.entity.index===c.entity.index);if(!b)continue;
   if(b.alive&&c.alive&&c.position&&b.position&&!inside(b.position,map.spawn[c.team])&&inside(c.position,map.spawn[c.team])&&dist(b.position,c.position)>2)m[c.team].recoveryArrivals++;
   if(b.alive&&!c.alive){const killer=st.champions.find(k=>k.team!==c.team&&k.kills>(prev.find(v=>v.entity.index===k.entity.index)?.kills??k.kills));const nearby=prev.filter(v=>v.alive&&v.position&&b.position&&dist(v.position,b.position)<=6);const hist=histories.get(c.entity.index)||[];
    deaths.push({r:st.round,id:c.entity.index,type:CHAMPION_TYPES[c.type],team:c.team,bag:b.gems,hpBefore:b.health/max(b.maxHealth),pos:b.position,killer:killer?CHAMPION_TYPES[killer.type]:null,friends:nearby.filter(v=>v.team===c.team).length,enemies:nearby.filter(v=>v.team!==c.team).length,history:hist.map(h=>({...h}))});
    const ep=pending.get(c.entity.index);if(ep){ep.end='death';ep.endRound=st.round;episodes.push(ep);pending.delete(c.entity.index);}
   }
   if(kind==='Capture'){const dg=Math.max(0,c.gems-b.gems),gold=Math.max(0,c.gold-b.gold);if(dg||gold){const t=m[c.team];t.caps++;if(dg)t.gemCaps++;t.capGems+=dg;t.capGold+=gold;const prior=lastCap.get(c.entity.index);if(prior){t.intervalRounds.push(st.round-prior.r);}lastCap.set(c.entity.index,{r:st.round,moves:t.moves});}}
  }
  if(kind==='Capture'&&prev){for(let t=0;t<2;t++){const rewards=st.champions.map(c=>{const b=prev.find(v=>v.entity.index===c.entity.index);return {c,gems:b?Math.max(0,c.gems-b.gems):0,gold:b?Math.max(0,c.gold-b.gold):0};}).filter(v=>v.c.team===t&&(v.gems||v.gold));if(rewards.length){m[t].groupCaps++;const gems=rewards.reduce((s,v)=>s+v.gems,0),gold=rewards.reduce((s,v)=>s+v.gold,0);if(gems)m[t].gemGroupCaps++;const p=rewards[0].c.position,gid=tileGroup.get(p.x+','+p.y);captureEvents.push({r:st.round,team:t,gid,types:comps[gid]?.types,gems,gold,recipients:rewards.length,wait:clearAt.has(gid)?st.round-clearAt.get(gid):null,clear:hitAt.has(gid)&&clearAt.has(gid)?clearAt.get(gid)-hitAt.get(gid):null});hitAt.delete(gid);clearAt.delete(gid);}}}
  if(prevCamps)for(const c of st.camps)if(c.type===4){const k=c.entity.index,b=prevCamps.find(v=>v.entity.index===k);const z=monolith[k]??={pos:c.position,minHp:c.health,deaths:[],respawns:[]};z.minHp=Math.min(z.minHp,c.health);if(b&&b.health>0&&c.health<=0)z.deaths.push(st.round);if(b&&b.health<=0&&c.health>0)z.respawns.push(st.round);}
  if(kind==='Gems submitted')bankTimeline.push({r:st.round,bank:st.submittedGems.slice(),id:a?.entity.index,team:a?.team});
  if(kind==='Bot error'){if(a)m[a.team].nativeErrors++;else m[st.team<2?st.team:us].nativeErrors++;}
  if(prev&&kind==='Attack'&&st.step.actor.kind===2){for(const c of st.champions){const b=prev.find(v=>v.entity.index===c.entity.index);if(b&&b.health>c.health){combat[c.team].campDamage+=b.health-c.health;if(b.alive&&!c.alive)combat[c.team].campDeaths++;}}}
  if(a&&prev){const b=prev.find(c=>c.entity.index===a.entity.index)??a;
   if(kind==='Shop'){const delta=a.items.flatMap((n,i)=>n>b.items[i]?[{item:i,count:n-b.items[i]}]:[]);if(delta.length)shops.push({r:st.round,id:a.entity.index,type:CHAMPION_TYPES[a.type],team:a.team,delta});}
   if(['Attack','Cast ability'].includes(kind)){const damage=st.champions.filter(c=>c.team!==a.team).reduce((s,c)=>s+Math.max(0,(prev.find(v=>v.entity.index===c.entity.index)?.health??c.health)-c.health),0);combat[a.team].damage+=damage;if(kind==='Cast ability'&&damage>0)combat[a.team].damagingCasts++;}
   if(kind==='Attack'&&ev?.target?.kind==='champion'&&ev.target.team!==a.team){const v=combat[a.team],ns=prev.filter(c=>c.alive&&c.position&&b.position&&dist(c.position,b.position)<=6),friends=ns.filter(c=>c.team===a.team).length,enemies=ns.length-friends,hp=b.health/max(b.maxHealth);v.attacks++;if(hp<.35)v.lowAttacks++;if(enemies>friends)v.outnumberedAttacks++;if(st.round-(lastFight.get(a.entity.index)??-1000)>10){v.contactStarts++;if(hp<.35)v.lowStarts++;if(enemies>friends)v.outnumberedStarts++;if(contacts.length<200)contacts.push({r:st.round,team:a.team,type:CHAMPION_TYPES[a.type],hp,friends,enemies,bag:b.gems,target:ev.target.type});}lastFight.set(a.entity.index,st.round);}
  }
  if(!a)return;const t=m[a.team],id=a.entity.index,act=actions.get(id)||new Set();
  if(['Move','Attack','Cast ability','Recall','Submit gems','Teleport channel','Shop','Consumable','Cancel channel'].includes(kind))act.add(kind);
  const ep=pending.get(id);
  if(kind==='Move'){t.moves++;if(ep)ep.moves++;}
  if(kind==='Cast ability')t.casts++;
  if(kind==='Attack'){if(ev?.target?.kind==='champion')t.attackChampion++;if(ev?.target?.kind==='camp')t.attackCamp++;if(ep)ep.attacks++;}
  if(kind==='Recall'){if(!inside(a.position,map.spawn[a.team]))t.recallsOutside.push({r:st.round,hp:a.health/max(a.maxHealth),gold:a.gold,bag:a.gems});t.recalls.push({r:st.round,hp:a.health/max(a.maxHealth),gold:a.gold,bag:a.gems});if(ep)ep.recalls++;}
  if(kind==='Submit gems')t.submitStarts++;
  if(kind==='Gems submitted')t.bankEvents++;
  if(kind==='End turn'){
   t.turns++;if(a.alive){t.aliveTurns++;if(a.health/max(a.maxHealth)<.35)t.lowTurns++;if(a.stunned)t.stunTurns++;if(inside(a.position,map.spawn[a.team]))t.spawnTurns++;if(act.has('Move'))t.walkTurns++;if(act.has('Attack')){const enemies=st.champions.some(c=>c.team!==a.team&&c.alive&&c.position&&a.position&&dist(c.position,a.position)<=3);if(enemies)t.fightTurns++;else t.farmTurns++;}if(act.has('Recall')||act.has('Submit gems')||act.has('Teleport channel'))t.channelTurns++;if(act.size===0)t.idleTurns++;}
   actions.delete(id);
  }else actions.set(id,act);
 }});
 for(const ep of pending.values()){ep.end='censored';ep.endRound=last.round;episodes.push(ep);}
 for(let t=0;t<2;t++){m[t].finalBag=last.champions.filter(c=>c.team===t&&c.alive).reduce((s,c)=>s+c.gems,0);m[t].finalGold=last.champions.filter(c=>c.team===t).reduce((s,c)=>s+c.gold,0);}
 const scores=result.meta.submittedGems;const win=result.meta.outcome===(us===0?'teamA':'teamB');
 if(scores[us]!==g.score||scores[1-us]!==g.oppScore||last.round!==g.rounds||win!==(g.result==='win'))throw new Error('index/final state mismatch '+g.matchId);
 const errors=result.events.filter(e=>e.error);if(errors.length)throw new Error(JSON.stringify(errors));
 return {...g,us,steps,engine:result.meta.engineVersion,metrics:[m[us],m[1-us]],combat:[combat[us],combat[1-us]],contacts,shops,deaths,episodes,monolith,bankTimeline,captureEvents,final:result.meta.finalChampions};
}
function max(x){return Math.max(1,x);}
if(!isMainThread){for(const g of workerData){try{parentPort.postMessage({ok:true,row:await analyze(g)});}catch(e){parentPort.postMessage({ok:false,id:g.matchId,error:e.stack});}}}
else{
 const idx=JSON.parse(fs.readFileSync(indexPath));const prior=fs.existsSync(path.join(outDir,'metrics.json'))?JSON.parse(fs.readFileSync(path.join(outDir,'metrics.json'))).rows:[];const wanted=new Set(idx.map(x=>x.matchId)),rows=prior.filter(x=>wanted.has(x.matchId)),done=new Set(rows.map(x=>x.matchId)),todo=idx.filter(x=>!done.has(x.matchId)),fail=[];let exits=0;
 await Promise.all(Array.from({length:5},(_,j)=>new Promise(resolve=>{const w=new Worker(new URL(import.meta.url),{workerData:todo.filter((_,i)=>i%5===j)});w.on('message',x=>{if(x.ok){rows.push(x.row);if(rows.length%25===0)console.log('decoded',rows.length);}else{fail.push(x);console.log('FAIL',x.id,x.error);}});w.on('error',e=>fail.push({error:e.stack}));w.on('exit',code=>{if(code)exits++;resolve();});})));
 fs.writeFileSync(path.join(outDir,'metrics.json'),JSON.stringify({rows,fail,exits}));
 if(rows.length!==idx.length||new Set(rows.map(x=>x.matchId)).size!==idx.length||fail.length||exits)throw new Error('Incomplete corpus');
 console.log('SUCCESS:',rows.length,'replay final states validated; no decoding failures.');
}
