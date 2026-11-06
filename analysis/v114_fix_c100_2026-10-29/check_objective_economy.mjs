import fs from 'node:fs';import path from 'node:path';import {dumpReplay} from '../../tools/replay_dump.mjs';
const D=path.dirname(new URL(import.meta.url).pathname),ROOT=path.resolve(D,'../..'),rows=JSON.parse(fs.readFileSync(D+'/objective_check/results.json')).rows.filter(r=>['01boss-battle','02guardians'].includes(r.map));const out=[];
for(const r of rows){let ck,cap=[{gems:0,gold:0},{gems:0,gold:0}],deaths=[0,0];const us=r.side==='b'?1:0;
 await dumpReplay(path.join(ROOT,r.replay),{snapshots:'none',onStep(st,ev,prev){if(prev&&st.round<=300)for(const c of st.champions){const p=prev.find(p=>p.entity.index===c.entity.index);if(!p)continue;if(p.alive&&!c.alive)deaths[c.team]++;if(ev?.kind==='Capture'){cap[c.team].gems+=Math.max(0,c.gems-p.gems);cap[c.team].gold+=Math.max(0,c.gold-p.gold);}}
 if(st.round===300&&!ck)ck={cap:JSON.parse(JSON.stringify(cap)),deaths:deaths.slice(),worth:[0,1].map(t=>st.champions.filter(c=>c.team===t).reduce((s,c)=>s+c.gold+c.items.reduce((z,n,i)=>z+n*(i%2?(Math.floor(i/6)===12?750:150):30),0),0))};}});
 out.push({...r,us,checkpoint:ck});
}
fs.writeFileSync(D+'/objective_economy.json',JSON.stringify(out));
for(const map of ['01boss-battle','02guardians'])for(const variant of ['base','commit']){const a=out.filter(r=>r.map===map&&r.variant===variant);const mean=fn=>a.reduce((s,r)=>s+fn(r),0)/a.length;console.log(JSON.stringify({map,variant,n:a.length,capGold300:mean(r=>r.checkpoint.cap[r.us].gold),capGems300:mean(r=>r.checkpoint.cap[r.us].gems),worth300:mean(r=>r.checkpoint.worth[r.us]),deaths300:mean(r=>r.checkpoint.deaths[r.us])}));}
