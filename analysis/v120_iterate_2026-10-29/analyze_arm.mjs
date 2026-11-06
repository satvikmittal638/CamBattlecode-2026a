// Task-specific aggregation through the existing replay decoder and official replay engine.
// No re-simulation and no bot source changes. Supports --part N for four disjoint chunks.
import fs from 'node:fs';
import path from 'node:path';
import {dumpReplay, CHAMPION_TYPES} from '../../tools/replay_dump.mjs';
const DIR=path.resolve(process.argv[2]);
const argv=process.argv.slice(3), part=argv.includes('--part')?+argv[argv.indexOf('--part')+1]:0;
const output=path.join(DIR,`metrics_${part}.json`);
const results=fs.existsSync(output)?JSON.parse(fs.readFileSync(output)):[];
const done=new Set(results.map(x=>x.matchId));
const rows=JSON.parse(fs.readFileSync(path.join(DIR,'platform','index.json'))).filter((_,i)=>i%4===part).filter(r=>!done.has(r.matchId));
const CK=[100,150,300,500,700,1000];
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const inc=(o,k,n=1)=>o[k]=(o[k]||0)+n;
const shardPrice=i=>i%2?(Math.floor(i/6)===12?750:150):30;

for(const row of rows){
 const us=row.side==='b'?1:0;
 let eng,game,buf,persp,map,groups=[],tileGroup,cur=null,round=-1,lastNative=new Map(),history=new Map(),activeChannels=new Map();
 const teams=[0,1].map(()=>({capGems:0,capGold:0,captures:0,gemCaptures:0,deaths:0,deathGems:0,kills:0,firstCapture:null,firstGemCapture:null,firstTribute:null,reach1000:null,checkpoints:{},activity:{},activity300:{},turns:0,deadTurns:0,aloneTurns:0,lowEpisodes:[],newFamilyPurchases:0}));
 const deaths=[],tributes=[],recalls=[],idleRuns=[],captures=[];const idle=new Map();
 const native=c=>{
  eng.view.setUint32(persp,c.team,true);eng.view.setUint32(persp+4,c.entity.index,true);
  eng.check(eng.exp.Game_API_Champion_Get(game,persp,c.entity.index,buf));
  const v=eng.view;
  const info={r:round,id:c.entity.index,team:c.team,type:CHAMPION_TYPES[c.type],hp:v.getFloat32(buf+16,true),max:v.getFloat32(buf+20,true),str:v.getFloat32(buf+24,true),focus:v.getFloat32(buf+28,true),state:v.getUint32(buf+40,true),channel:-1};
  if(info.state&(2|4|4096)){
   eng.check(eng.exp.Game_API_Champion_GetChannelTime(game,persp,c.entity.index,buf));info.channel=eng.view.getInt32(buf,true);
  }
  lastNative.set(c.entity.index,info);return info;
 };
 const flush=()=>{
  if(!cur)return;const t=teams[cur.team];t.turns++;if(!cur.alive)t.deadTurns++;
  let kind=!cur.alive?'dead':cur.fight?'fight':cur.farm?'farm':cur.channel?'channel':cur.stun?'stun':cur.move?'move':cur.capture?'capture':cur.rest?'spawnHeal':'idle';
  inc(t.activity,kind);if(cur.r<=300)inc(t.activity300,kind);
  if(cur.alive&&cur.allies===0)t.aloneTurns++;
  const old=idle.get(cur.id);
  if(kind==='idle'&&cur.r>=5){
   if(old&&old.r===cur.r-1&&old.x===cur.pos?.x&&old.y===cur.pos?.y){old.r=cur.r;old.n++;old.bag=Math.max(old.bag,cur.gems);}
   else{if(old&&old.n>=8)idleRuns.push(old);idle.set(cur.id,{id:cur.id,team:cur.team,type:cur.type,start:cur.r,r:cur.r,n:1,x:cur.pos?.x,y:cur.pos?.y,bag:cur.gems});}
  }else if(old){if(old.n>=8)idleRuns.push(old);idle.delete(cur.id);}
  const h=history.get(cur.id)||[];h.push({...cur,kind});if(h.length>12)h.shift();history.set(cur.id,h);cur=null;
 };
 const data=await dumpReplay(path.join(DIR,'platform',row.file),{snapshots:'none',mapInfo:true,onStart(s){
  ({eng,game,mapInfo:map}=s);buf=eng.exp.Engine_Malloc(8192);persp=eng.exp.Engine_Malloc(16);tileGroup=new Int32Array(map.width*map.height).fill(-1);
  eng.check(eng.exp.Game_API_Map_GetCampGroups(game,buf,500,buf+8000));
  const n=eng.view.getUint32(buf+8000,true),ids=Array.from({length:n},(_,i)=>eng.view.getUint32(buf+4*i,true));
  for(const id of ids){
   eng.check(eng.exp.Game_API_Map_CampGroup_Get(game,id,buf));const gems=eng.view.getUint32(buf,true),gold=eng.view.getUint32(buf+4,true);
   eng.check(eng.exp.Game_API_Map_CampGroup_GetCampInfo(game,id,buf,500,buf+8000));const n=eng.view.getUint32(buf+8000,true);
   const campIds=Array.from({length:n},(_,i)=>eng.view.getUint32(buf+4*i,true));
   const members=campIds.map(cid=>{eng.check(eng.exp.Game_API_Map_CampInfo_Get(game,cid,buf));return {x:eng.view.getInt32(buf,true),y:eng.view.getInt32(buf+4,true),type:eng.view.getInt32(buf+8,true)};});
   for(const p of members){if(p.x<0||p.x>=map.width||p.y<0||p.y>=map.height||p.type<0||p.type>5)throw Error('bad camp-info ABI');tileGroup[p.y*map.width+p.x]=id;}
   groups.push({id,gems,gold,members,monolith:members.some(p=>p.type===4)});
  }
 },onStep(st,ev,prev){
  if(st.round!==round){round=st.round;
   for(const t of [0,1]){
    const cs=st.champions.filter(c=>c.team===t),alive=cs.filter(c=>c.alive);
    const carried=alive.reduce((s,c)=>s+c.gems,0);
    if(teams[t].reach1000===null&&st.submittedGems[t]+carried>=1000)teams[t].reach1000=round;
    if(CK.includes(round))teams[t].checkpoints[round]={score:st.submittedGems[t],carried,worth:cs.reduce((s,c)=>s+c.gold+c.items.reduce((a,n,i)=>a+n*shardPrice(i),0),0),equipment:cs.reduce((s,c)=>s+c.items.reduce((a,n,i)=>a+n*shardPrice(i),0),0),unspent:cs.reduce((s,c)=>s+c.gold,0),capGems:teams[t].capGems,capGold:teams[t].capGold,deaths:teams[t].deaths,kills:teams[t].kills};
   }
  }
  // Authoritative channel/allowance state at actual champion turn start.
  if(st.step.kind===3&&st.step.phase===14&&st.phase===10){
   flush();const c=st.champions.find(c=>c.entity.index===st.currentChampion);if(c){
    const info=native(c),pos=c.position;
    const nearby=st.champions.filter(q=>q.entity.index!==c.entity.index&&q.alive&&q.position&&pos&&dist(q.position,pos)<=6);
    let capture=false,captureTimer=null,captureState=null;
    if(c.alive&&pos){const gid=tileGroup[pos.y*map.width+pos.x];if(gid>=0&&!eng.exp.Game_API_CampGroup_GetCaptureState(game,persp,gid,buf)){captureTimer=eng.view.getInt32(buf,true);captureState=eng.view.getInt32(buf+4,true);capture=[1,2,4].includes(captureState);}}
    const sp=map.spawn[c.team],rest=pos&&pos.x>=sp.minX&&pos.x<=sp.maxX&&pos.y>=sp.minY&&pos.y<=sp.maxY&&c.health<c.maxHealth-.5;
    cur={...info,pos:pos?{...pos}:null,gems:c.gems,gold:c.gold,alive:c.alive,stun:c.stunned,channel:!!(info.state&(2|4|4096)),capture,captureTimer,captureState,rest,allies:nearby.filter(q=>q.team===c.team).length,enemies:nearby.filter(q=>q.team!==c.team).length,acts:[]};
    if(info.state&(2|4|4096))activeChannels.set(c.entity.index,{...info,kind:info.state&4?'tribute':info.state&2?'recall':'teleport'});else activeChannels.delete(c.entity.index);
   }
  }
  if(prev)for(const c of st.champions){
   const b=prev.find(q=>q.entity.index===c.entity.index);if(!b)continue;const t=teams[c.team];
   if(c.kills>b.kills)t.kills+=c.kills-b.kills;
   if(b.alive&&!c.alive){
    t.deaths++;t.deathGems+=b.gems;
    const seq=[...(history.get(c.entity.index)||[])];if(cur?.id===c.entity.index)seq.push({...cur});
    const near=prev.filter(q=>q.entity.index!==c.entity.index&&q.alive&&q.position&&b.position&&dist(q.position,b.position)<=6);
    let killer='camp/other';for(const q of st.champions){const z=prev.find(z=>z.entity.index===q.entity.index);if(q.team!==c.team&&z&&q.kills>z.kills){killer=CHAMPION_TYPES[q.type];break;}}
    deaths.push({r:round,team:c.team,type:CHAMPION_TYPES[c.type],gems:b.gems,pos:b.position,killer,allies:near.filter(q=>q.team===c.team).length,enemies:near.filter(q=>q.team!==c.team).length,channel:activeChannels.get(c.entity.index)||null,lastTurns:seq.filter(x=>x.r>=round-8).map(x=>({r:x.r,hp:x.hp,max:x.max,state:x.state,channel:x.channel,kind:x.kind,pos:x.pos,acts:x.acts}))});
    activeChannels.delete(c.entity.index);
   }
   if(ev?.kind==='Capture'){
    const dg=Math.max(0,c.gems-b.gems),gold=Math.max(0,c.gold-b.gold);
    if(dg||gold){t.capGems+=dg;t.capGold+=gold;t.firstCapture??=round;if(dg)t.firstGemCapture??=round;captures.push({r:round,team:c.team,type:CHAMPION_TYPES[c.type],gems:dg,gold});}
   }
  }
  if(!ev||ev.actor?.kind!==1)return;
  const c=st.champions.find(c=>c.entity.index===ev.actor.index);if(!c)return;
  if(cur?.id===c.entity.index){
   if(ev.kind==='Move')cur.move=true;
   if(['Attack','Cast ability'].includes(ev.kind)&&ev.target?.kind==='camp')cur.farm=true;
   if(['Attack','Cast ability'].includes(ev.kind)&&ev.target?.kind==='champion'&&ev.target.team!==c.team)cur.fight=true;
   if(['Move','Attack','Cast ability','Recall','Submit gems','Cancel channel','Gems submitted'].includes(ev.kind))cur.acts.push({k:ev.kind,to:ev.to,target:ev.target?.type,slot:ev.slot});
  }
  if(ev.kind==='Shop')for(const [name,n]of Object.entries(ev.items||{}))if(n>0&&/^(Tribute|Capture|Prospector|Hunter|Skirmish|Greed|Collectors) /.test(name))teams[c.team].newFamilyPurchases+=n;
  if(ev.kind==='Gems submitted')teams[c.team].firstTribute??=round;
  if(['Recall','Submit gems','Cancel channel','Gems submitted','Move','Attack','Cast ability'].includes(ev.kind)){
   const info=native(c);if(info.state&(2|4|4096)){activeChannels.set(c.entity.index,{...info,kind:info.state&4?'tribute':info.state&2?'recall':'teleport'});if(cur?.id===c.entity.index)cur.channel=true;}else activeChannels.delete(c.entity.index);
   if(ev.kind==='Submit gems'&&(info.state&4))tributes.push({...info,gems:c.gems,pos:c.position,nearEnemies:st.champions.filter(q=>q.team!==c.team&&q.alive&&q.position&&c.position&&dist(q.position,c.position)<=6).length});
   if(ev.kind==='Recall'&&(info.state&2))recalls.push({...info,gems:c.gems,gold:c.gold,pos:c.position});
  }
 }});
 flush();for(const x of idle.values())if(x.n>=8)idleRuns.push(x);
 for(const t of [0,1]){teams[t].firstTribute??=data.events.find(e=>e.kind==='Gems submitted'&&e.team===t)?.round??null;teams[t].captures=captures.filter(c=>c.team===t).length;teams[t].gemCaptures=captures.filter(c=>c.team===t&&c.gems>0).length;}
 const final=data.meta.finalChampions;
 const result={...row,engine:data.meta.engineVersion,us,teams,deaths,tributes,recalls,idleRuns,groups:groups.map(g=>({id:g.id,gems:g.gems,gold:g.gold,monolith:g.monolith,size:g.members.length})),finalCarried:[0,1].map(t=>final.filter(c=>c.team===t&&c.alive).reduce((s,c)=>s+c.gems,0)),finalChampions:final};
 results.push(result);console.log(`part ${part}: ${results.length}/${rows.length} ${row.map}`);
}
fs.writeFileSync(path.join(DIR,`metrics_${part}.json`),JSON.stringify(results)+'\n');
