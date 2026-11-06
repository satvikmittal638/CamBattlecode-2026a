// Audit start-of-turn observations only. No claim that an open tile guarantees survival.
import fs from 'node:fs';import path from 'node:path';import {traceReplay} from './perspective_trace.mjs';
const D=path.dirname(new URL(import.meta.url).pathname),arm=process.argv[2]||'control',P=D+'/paired_scan/'+arm;
const index=JSON.parse(fs.readFileSync(P+'/platform/index.json')).filter(r=>r.map==='02treasure_box');
const metrics=[0,1,2,3].flatMap(i=>JSON.parse(fs.readFileSync(P+`/metrics_${i}.json`)));
const out=[];const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
for(const r of index){let map,spawn;const us=+(r.side==='b'),events=[],last=new Map();let episodes=0,blockedEpisodes=0;
 const m=metrics.find(m=>m.matchId===r.matchId),deaths=m.deaths.filter(d=>d.team===us);
 await traceReplay(P+'/platform/'+r.file,us,{withItems:false,onTurn(t){
  if(t.start){map=t.mapInfo;spawn=map.spawn[us];return;}
  const me=t.self;
  if(t.r>300||!(me.st&1)||!(me.st&8)||(me.st&(2|4|4096))||me.hp>=me.mhp*.6)return;
  if(me.x>=spawn.minX&&me.x<=spawn.maxX&&me.y>=spawn.minY&&me.y<=spawn.maxY)return;
  if(!t.en.some(e=>dist(me,e)<=4))return;
  const entries=[];
  for(let y=spawn.minY;y<=spawn.maxY;y++)for(let x=spawn.minX;x<=spawn.maxX;x++)if(dist(me,{x,y})<=1&&!map.walls[y*map.width+x]&&!map.holes[y*map.width+x])entries.push({x,y});
  if(!entries.length)return;
  const occupied=entries.map(p=>({...p,ally:t.al.find(a=>a.x===p.x&&a.y===p.y)?.c??null}));
  const blocked=occupied.every(p=>p.ally!==null),key=t.c+':'+blocked,prev=last.get(key)??-100;last.set(key,t.r);
  const fresh=t.r-prev>1;if(fresh){episodes++;if(blocked)blockedEpisodes++;}
  events.push({r:t.r,c:t.c,type:t.t,hp:me.hp,mhp:me.mhp,pos:[me.x,me.y],entries:occupied,blocked,fresh,
   deathWithin3:deaths.some(d=>d.type===t.t&&d.r>=t.r&&d.r<=t.r+3),actions:t.acts});
 }});
 out.push({matchId:r.matchId,label:r.label,side:r.side,episodes,blockedEpisodes,events});console.log(r.label,'blocked',blockedEpisodes,'of',episodes);
}
fs.writeFileSync(D+`/spawn_access_${arm}.json`,JSON.stringify(out));
console.log('Total',JSON.stringify({games:out.length,episodes:out.reduce((n,r)=>n+r.episodes,0),blockedEpisodes:out.reduce((n,r)=>n+r.blockedEpisodes,0),blockedTurns:out.flatMap(r=>r.events).filter(e=>e.blocked).length,blockedTurnsNearDeath:out.flatMap(r=>r.events).filter(e=>e.blocked&&e.deathWithin3).length}));
