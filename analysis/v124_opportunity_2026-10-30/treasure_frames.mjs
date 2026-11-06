import fs from 'node:fs';import path from 'node:path';import {traceReplay} from './perspective_trace.mjs';
const D=path.dirname(new URL(import.meta.url).pathname),P=D+'/paired_scan/control';
const r=JSON.parse(fs.readFileSync(P+'/platform/index.json')).find(r=>r.label==='strong_r49_05'&&r.map==='02treasure_box');
let map;const frames=[];
await traceReplay(P+'/platform/'+r.file,1,{withItems:false,onObserve(t,s){
 if(t.t!=='Marcella'||![3,6,10,14].includes(t.r))return;
 const visible=[];for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++)if(!s.eng.exp.Game_API_InVision(s.game,s.persp,x,y,s.buf)&&s.eng.view.getUint32(s.buf,true))visible.push([x,y]);
 frames.push({map:'02treasure_box',matchId:r.matchId,us:1,observed:t,visible,info:map});
},onTurn(t){if(t.start){map=t.mapInfo;for(const k of ['walls','holes','bushes'])map[k]=Array.from(map[k].entries()).filter(([i,v])=>v).map(([i])=>[i%map.width,Math.floor(i/map.width)]);}}});
fs.writeFileSync(D+'/treasure_frames.json',JSON.stringify(frames));console.log('Saved',frames.length,'turn-start personal frames');
