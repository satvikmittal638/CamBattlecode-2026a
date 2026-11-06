import fs from 'node:fs';import path from 'node:path';import {dumpReplay} from '../../tools/replay_dump.mjs';
const A='analysis/v114_fix_c100_2026-10-29/platform',rows=JSON.parse(fs.readFileSync(A+'/index.json')),result=[];
for(const name of ['01boss_battle','02guardians']){
 const r=rows.find(r=>r.map===name);let rec;
 try{await dumpReplay(path.join(A,r.file),{snapshots:'none',mapInfo:true,onStart({eng,game,mapInfo:m}){
  const b=eng.exp.Engine_Malloc(8192),view=eng.view;eng.check(eng.exp.Game_API_Map_GetCampGroups(game,b,500,b+8000));const ids=Array.from({length:view.getUint32(b+8000,true)},(_,i)=>view.getUint32(b+i*4,true));const boss=[];
  for(const id of ids){eng.check(eng.exp.Game_API_Map_CampGroup_GetCampInfo(game,id,b,500,b+8000));const cids=Array.from({length:view.getUint32(b+8000,true)},(_,i)=>view.getUint32(b+i*4,true));const members=cids.map(id=>{eng.check(eng.exp.Game_API_Map_CampInfo_Get(game,id,b));return {x:view.getInt32(b,true),y:view.getInt32(b+4,true),type:view.getInt32(b+8,true)}});if(members.some(c=>c.type===4))boss.push(...members);}
  const blocked=new Uint8Array(m.width*m.height);for(let i=0;i<blocked.length;i++)blocked[i]=m.walls[i]||m.holes[i];for(const p of [...boss,...m.altars.map(([x,y])=>({x,y}))])blocked[p.y*m.width+p.x]=1;
  const seen=new Set(),q=[];const spawn=m.spawn[0],en=m.spawn[1];for(let x=spawn.minX;x<=spawn.maxX;x++)for(let y=spawn.minY;y<=spawn.maxY;y++){q.push([x,y]);seen.add(y*m.width+x)}
  let connected=false;for(let i=0;i<q.length;i++){const [x,y]=q[i];if(x>=en.minX&&x<=en.maxX&&y>=en.minY&&y<=en.maxY){connected=true;break}for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const xx=x+dx,yy=y+dy,k=yy*m.width+xx;if(xx<0||yy<0||xx>=m.width||yy>=m.height||blocked[k]||seen.has(k))continue;seen.add(k);q.push([xx,yy]);}}
  rec={map:name,bossTiles:boss.length,walkDisconnectedWithBossGroupsBlocked:!connected};throw Error('done');
 }});}catch(e){if(e.message!=='done')throw e}result.push(rec);console.log(rec);
}
fs.writeFileSync('analysis/v120_iterate_2026-10-29/gate_geometry.json',JSON.stringify(result,null,2));
