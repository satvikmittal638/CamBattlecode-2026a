import fs from 'node:fs';import path from 'node:path';import {dumpReplay,CHAMPION_TYPES,CAMP_TYPES} from '../../tools/replay_dump.mjs';
const D=path.dirname(new URL(import.meta.url).pathname),rows=JSON.parse(fs.readFileSync(D+'/platform/index.json'));const cases=[];
for(const [map,label,rounds] of [['01elk_arena','strong_r48_01',[29,32,35,45]],['02treasure_box','strong_r49_02',[11,17,24,30]],['01boss_battle','strong_r51_04',[50,150,300,500]],['00lanes','near_r102_03',[120,128,142,160]]]){
 const row=rows.find(x=>x.map===map&&x.label===label),frames=[];let mapInfo,last=-1;
 const d=await dumpReplay(path.join(D,'platform',row.file),{snapshots:'none',mapInfo:true,onStart(s){mapInfo=s.mapInfo;},onStep(st){if(st.round!==last){last=st.round;if(rounds.includes(last))frames.push({round:last,gems:st.submittedGems,champions:st.champions.map(c=>({id:c.entity.index,team:c.team,type:CHAMPION_TYPES[c.type],pos:c.position?[c.position.x,c.position.y]:null,hp:Math.round(c.health),maxHp:Math.round(c.maxHealth),alive:c.alive,gold:c.gold,gems:c.gems})),camps:st.camps.map(c=>({type:CAMP_TYPES[c.type],hp:c.health,pos:[c.position.x,c.position.y]}))});}}});
 const coords=a=>Array.from(a.entries()).filter(([i,v])=>v).map(([i])=>[i%mapInfo.width,Math.floor(i/mapInfo.width)]);
 for(const k of ['walls','holes','bushes'])mapInfo[k]=coords(mapInfo[k]);cases.push({...row,us:row.side==='b'?1:0,mapInfo,frames,events:d.events.filter(e=>rounds.some(r=>e.round>=r-3&&e.round<r))});
}
fs.writeFileSync(D+'/visual_frames.json',JSON.stringify(cases));
