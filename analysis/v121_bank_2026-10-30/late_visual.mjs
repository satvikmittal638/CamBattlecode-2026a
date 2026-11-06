// Extract broad replay trajectories with the existing decoder. Reusable for the platform trial.
import fs from 'node:fs';import path from 'node:path';
import {dumpReplay,CHAMPION_TYPES} from '../../tools/replay_dump.mjs';
const [indexFile,outFile]=process.argv.slice(2),root=path.dirname(indexFile);
const out=fs.existsSync(outFile)?JSON.parse(fs.readFileSync(outFile)):[];const done=new Set(out.map(x=>x.matchId));
const rows=JSON.parse(fs.readFileSync(indexFile)).filter(r=>!done.has(r.matchId));
for(const row of rows){let map;const rounds=[],deaths=[],caps=[],bank=[];let last=-1,oldBank='';
 const d=await dumpReplay(path.join(root,row.file),{snapshots:'none',mapInfo:true,onStart:s=>map=s.mapInfo,onStep(st,ev,prev){
  if(st.round!==last){last=st.round;if(st.round>=600&&st.round<=1400&&st.round%5===0)rounds.push({r:st.round,ch:st.champions.map(c=>({id:c.entity.index,t:c.team,type:CHAMPION_TYPES[c.type],p:c.position?[c.position.x,c.position.y]:null,hp:c.health,mhp:c.maxHealth,alive:c.alive,gems:c.gems}))});}
  const bk=st.submittedGems.join(',');if(bk!==oldBank){bank.push({r:st.round,s:st.submittedGems});oldBank=bk;}
  if(prev)for(const c of st.champions){const b=prev.find(b=>b.entity.index===c.entity.index);if(!b)continue;
   if(b.alive&&!c.alive)deaths.push({r:st.round,t:c.team,p:[b.position.x,b.position.y],g:b.gems});
   if(ev?.kind==='Capture'&&(c.gems>b.gems||c.gold>b.gold))caps.push({r:st.round,t:c.team,p:[c.position.x,c.position.y],g:Math.max(0,c.gems-b.gems)});
  }
 }});
 const coords=a=>Array.from(a.entries()).filter(([i,v])=>v).map(([i])=>[i%map.width,Math.floor(i/map.width)]);
 out.push({...row,us:row.side==='b'?1:0,info:{width:map.width,height:map.height,spawn:map.spawn,altars:map.altars,walls:coords(map.walls),holes:coords(map.holes)},rounds,deaths,caps,bank,round:d.meta.finalRound});
 if(out.length%10===0)console.log('visual extraction',out.length,'/',rows.length);
}
fs.writeFileSync(outFile,JSON.stringify(out)+'\n');console.log('saved',out.length,'visual cases');
