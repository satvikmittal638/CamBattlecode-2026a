import fs from 'node:fs';import path from 'node:path';import {traceReplay} from '../../tools/turn_trace.mjs';
const D=path.dirname(new URL(import.meta.url).pathname),P=D+'/paired_c2/candidate';const rows=[0,1,2,3].flatMap(i=>JSON.parse(fs.readFileSync(P+`/bank_audit_${i}.json`))).filter(r=>r.cancels);const out=[];
for(const r of rows){const cs=r.events.filter(e=>e.k==='cancel').map(e=>({...e,map:r.map,label:r.label,matchId:r.matchId,samples:{}}));
 await traceReplay(path.join(P,'platform',r.file),+(r.side==='b'),{withItems:false,onTurn(t){if(t.start)return;for(const c of cs)if(t.c===c.c&&[1,3,5,10,20].includes(t.r-c.r))c.samples[t.r-c.r]={alive:!!(t.self.st&1),hp:t.self.hp,gems:t.self.gems,pos:[t.self.x,t.self.y],acts:t.acts.map(a=>a.k)};}});out.push(...cs);
}
const summary={cancels:out.length,ruleViolations:out.filter(x=>!x.rule).length};for(const k of [1,3,5,10,20]){const cs=out.filter(c=>c.samples[k]);summary['alive'+k]=[cs.filter(c=>c.samples[k].alive).length,cs.length];}
fs.writeFileSync(D+'/cancel_followup.json',JSON.stringify({summary,events:out}));console.log(summary);
