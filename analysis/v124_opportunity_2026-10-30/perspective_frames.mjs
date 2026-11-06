import fs from 'node:fs';import path from 'node:path';import {traceReplay} from './perspective_trace.mjs';
const D=path.dirname(new URL(import.meta.url).pathname),P=path.resolve(D,'../v121_bank_2026-10-30/paired_c2/control/platform'),rows=[0,1,2,3].flatMap(i=>JSON.parse(fs.readFileSync(D+`/perspective2_${i}.json`))),out=[];
for(const spec of [['01boss_battle','near_r114_09','weapon',103,8],['02cuts','strong_r53_04','weapon',329,1],['00fragment','near_r114_09','heist',143,null]]){
 const [mp,label,kind,round,id]=spec,r=rows.find(r=>r.map===mp&&r.label===label),e=r.examples.find(e=>e.kind===kind&&e.r===round&&(id===null||e.c===id));let map;
 await traceReplay(path.join(P,r.file),r.us,{withItems:false,onObserve(t,s){if(t.r!==round||t.c!==e.c)return;const visible=[];for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++)if(!s.eng.exp.Game_API_InVision(s.game,s.persp,x,y,s.buf)&&s.eng.view.getUint32(s.buf,true))visible.push([x,y]);out.push({...e,map:mp,label,us:r.us,matchId:r.matchId,observed:t,visible,info:map});},onTurn(t){if(t.start){map=t.mapInfo;for(const k of ['walls','holes','bushes'])map[k]=Array.from(map[k].entries()).filter(([i,v])=>v).map(([i])=>[i%map.width,Math.floor(i/map.width)]);}}});
}
fs.writeFileSync(D+'/perspective_frames.json',JSON.stringify(out));console.log('Saved',out.length,'exact turn-start personal views');
