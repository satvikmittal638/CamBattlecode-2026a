import fs from 'node:fs';import path from 'node:path';import {traceReplay} from '../../tools/turn_trace.mjs';
const D='analysis/v114_fix_c100_2026-10-29',A='analysis/v114_review_2026-10-29/replays',rows=JSON.parse(fs.readFileSync(A+'/index.json'));
const out={};
for(const [map,id,start,end] of [['01elk_arena',7,24,40],['01broken_curve',4,1069,1100]]){
 const row=rows.find(x=>x.map===map),turns=[];
 await traceReplay(path.join(A,row.file),1,{withItems:false,onTurn:d=>{if(d.c===id&&d.r>=start&&d.r<=end)turns.push(d)}});out[map]=turns;
}
fs.writeFileSync(D+'/original_mechanism_cases.json',JSON.stringify(out));
