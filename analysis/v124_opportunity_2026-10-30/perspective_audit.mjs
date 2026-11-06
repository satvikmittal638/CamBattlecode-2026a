import fs from 'node:fs';import path from 'node:path';import {traceReplay} from './perspective_trace.mjs';
const D=path.dirname(new URL(import.meta.url).pathname),P=path.resolve(D,'../v121_bank_2026-10-30/paired_c2/control/platform'),part=+process.argv[2]||0,F=D+`/perspective_${part}.json`;
const out=fs.existsSync(F)?JSON.parse(fs.readFileSync(F)):[],have=new Set(out.map(r=>r.matchId)),rows=JSON.parse(fs.readFileSync(P+'/index.json')).filter((_,i)=>i%4===part).filter(r=>!have.has(r.matchId));
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
function field(map,spawn,enemy){const W=map.width,H=map.height,q=[],ds=new Int32Array(W*H).fill(65535),block=(x,y)=>map.walls[y*W+x]||map.holes[y*W+x]||map.altars.some(p=>p[0]===x&&p[1]===y)||(enemy&&x>=enemy.minX&&x<=enemy.maxX&&y>=enemy.minY&&y<=enemy.maxY);
 for(let y=spawn.minY;y<=spawn.maxY;y++)for(let x=spawn.minX;x<=spawn.maxX;x++){ds[y*W+x]=0;q.push([x,y]);}
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const a=x+dx,b=y+dy;if(a<0||a>=W||b<0||b>=H||ds[b*W+a]!==65535||block(a,b))continue;ds[b*W+a]=ds[y*W+x]+1;q.push([a,b]);}}
 return ds;}
for(const row of rows){const us=+(row.side==='b');let eng,game,buf,persp,map,groups,byCamp=new Map(),last=new Map();const examples=[],counts={turns:0,healthyActive:0,heistTurns:0,heistEpisodes:0,denialTurns:0,denialEpisodes:0,weaponTurns:0,weaponEpisodes:0,unusedWeaponTurns:0};const perGroup={};
 const episode=(key,r)=>{const old=last.get(key)??-100;last.set(key,r);return r-old>3;};
 await traceReplay(path.join(P,row.file),us,{withItems:false,onTurn(t){
 if(t.start){({eng,game,mapInfo:map}=t);buf=eng.exp.Engine_Malloc(8192);persp=eng.exp.Engine_Malloc(16);const own=field(map,map.spawn[us],map.spawn[1-us]),enemy=field(map,map.spawn[1-us],null);groups=[];
 eng.check(eng.exp.Game_API_Map_GetCampGroups(game,buf,500,buf+8000));const n=eng.view.getUint32(buf+8000,true),ids=Array.from({length:n},(_,i)=>eng.view.getUint32(buf+4*i,true));
 for(const id of ids){eng.check(eng.exp.Game_API_Map_CampGroup_Get(game,id,buf));const gems=eng.view.getUint32(buf,true),gold=eng.view.getUint32(buf+4,true);eng.check(eng.exp.Game_API_Map_CampGroup_GetCampInfo(game,id,buf,500,buf+8000));const n=eng.view.getUint32(buf+8000,true),cis=Array.from({length:n},(_,i)=>eng.view.getUint32(buf+4*i,true)),members=[];
 for(const cid of cis){eng.check(eng.exp.Game_API_Map_CampInfo_Get(game,cid,buf));members.push({x:eng.view.getInt32(buf,true),y:eng.view.getInt32(buf+4,true),type:eng.view.getInt32(buf+8,true)});}
 const dOwn=Math.min(...members.map(p=>own[p.y*map.width+p.x])),dEnemy=Math.min(...members.map(p=>enemy[p.y*map.width+p.x])),monolith=members.some(m=>m.type===4);groups.push({id,gems,gold,members,dOwn,dEnemy,monolith,eligible:gems>0&&!monolith&&dOwn!==65535&&dOwn<=dEnemy+4});
 }
 return;
 }
 counts.turns++;const me=t.self;if(!(me.st&1)||(me.st&(2|4|4096))||me.hp<.6*me.mhp)return;counts.healthyActive++;
 eng.view.setUint32(persp,us,true);eng.view.setUint32(persp+4,t.c,true);
 const vis=p=>!eng.exp.Game_API_InVision(game,persp,p.x,p.y,buf)&&eng.view.getUint32(buf,true)!==0;
 const cp=t.cp.map(c=>({...c,group:groups.find(g=>g.members.some(p=>p.x===c.x&&p.y===c.y))?.id}));
 for(const g of groups){
  const d=Math.min(...g.members.map(p=>dist(me,p)));if(t.gs[g.id]!==2||g.eligible||g.gems<=0||d>8||me.gems>=100||!(me.st&8))continue;
  const onRegion=c=>g.members.some(p=>p.x===c.x&&p.y===c.y),occupied=t.en.some(onRegion);const emptyEntries=g.members.filter(p=>!t.en.some(e=>e.x===p.x&&e.y===p.y)&&!t.al.some(a=>a.x===p.x&&a.y===p.y));
  const kind=occupied?'denial':'heist';if(occupied&&!emptyEntries.some(p=>dist(me,p)<=1))continue;
  if(!occupied&&t.en.some(e=>g.members.some(p=>dist(e,p)<=3)))continue;
  counts[kind+'Turns']++;const fresh=episode(`${kind}:${t.c}:${g.id}`,t.r);if(fresh)counts[kind+'Episodes']++;
  perGroup[g.id]??={heist:0,denial:0,weapon:0};perGroup[g.id][kind]++;
  if(fresh&&examples.filter(e=>e.kind===kind).length<4)examples.push({kind,r:t.r,c:t.c,t:t.t,self:me,al:t.al,en:t.en,camps:cp,group:g});
 }
 if(!(me.st&16)||me.gems>0)return;
 for(const c of cp){if(c.awake!==0||c.str<=0||dist(me,c)>me.rng)continue;const g=groups[c.group];if(!g||!g.members.every(vis))continue;
  const living=cp.filter(m=>m.group===g.id&&m.str>0),own=[me,...t.al],reach=m=>m.ty==='Monolith'?5:m.ty==='Wolf'?3:4;
  // Every living member that could hit an ally must prefer a visible enemy by at least two tiles.
  let damage=0,safe=true;for(const m of living){const da=Math.min(...own.map(a=>dist(a,m))),de=Math.min(99,...t.en.map(e=>dist(e,m)));if(da<=reach(m)&&de+2>da)safe=false;if(de<=reach(m))damage+=m.str;}
  if(!safe||damage===0)continue;
  counts.weaponTurns++;const fresh=episode(`weapon:${t.c}:${g.id}`,t.r);if(fresh)counts.weaponEpisodes++;
  const attacked=t.acts.some(a=>a.k==='Attack'&&a.tk==='camp'&&living.some(m=>m.id===a.tid));if(!attacked)counts.unusedWeaponTurns++;
  perGroup[g.id]??={heist:0,denial:0,weapon:0};perGroup[g.id].weapon++;
  if(fresh&&examples.filter(e=>e.kind==='weapon').length<4)examples.push({kind:'weapon',r:t.r,c:t.c,t:t.t,self:me,al:t.al,en:t.en,camps:cp,group:g,damage,recorded:t.acts});
 }
 }});
 out.push({...row,us,counts,perGroup,groups,examples});fs.writeFileSync(F,JSON.stringify(out));console.log(part,out.length,row.map,counts.heistEpisodes,counts.weaponEpisodes);
}
