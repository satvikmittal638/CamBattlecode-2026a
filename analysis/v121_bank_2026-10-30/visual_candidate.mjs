import fs from 'node:fs';import path from 'node:path';import {dumpReplay,CHAMPION_TYPES,CAMP_TYPES} from '../../tools/replay_dump.mjs';
const D=path.dirname(new URL(import.meta.url).pathname),P=path.resolve(D,'paired_c2/candidate/platform'),rows=JSON.parse(fs.readFileSync(P+'/index.json'));const cases=[];
for(const [label,rounds] of [['near_r112_07',[1038,1039,1041,1048]]]){
 const row=rows.find(x=>x.map==='01boss_battle'&&x.label===label),frames=[];let mapInfo,last=-1;
 const d=await dumpReplay(path.join(P,row.file),{snapshots:'none',mapInfo:true,onStart(s){mapInfo=s.mapInfo;},onStep(st){if(st.step.kind===3&&st.step.phase===14&&st.phase===10&&st.currentChampion===6&&st.round!==last){last=st.round;if(rounds.includes(last))frames.push({round:last,gems:st.submittedGems,champions:st.champions.map(c=>({id:c.entity.index,team:c.team,type:CHAMPION_TYPES[c.type],pos:c.position?[c.position.x,c.position.y]:null,hp:Math.round(c.health),maxHp:Math.round(c.maxHealth),alive:c.alive,gold:c.gold,gems:c.gems})),camps:st.camps.map(c=>({type:CAMP_TYPES[c.type],hp:c.health,pos:[c.position.x,c.position.y]}))});}}});
 const coords=a=>Array.from(a.entries()).filter(([i,v])=>v).map(([i])=>[i%mapInfo.width,Math.floor(i/mapInfo.width)]);
 for(const k of ['walls','holes','bushes'])mapInfo[k]=coords(mapInfo[k]);cases.push({...row,us:row.side==='b'?1:0,mapInfo,frames,frameTiming:'Vesper turn start',events:d.events.filter(e=>rounds.some(r=>e.round>=r-3&&e.round<r))});
}
fs.writeFileSync(D+'/candidate_visual_frames.json',JSON.stringify(cases));
