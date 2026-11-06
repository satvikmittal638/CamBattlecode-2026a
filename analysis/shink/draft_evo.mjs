// Draft per map over time (hour buckets) + win rate by opponent.
import fs from 'node:fs';
const idx = JSON.parse(fs.readFileSync('top_replays/4_SHINK-AI-6500/index.json','utf8'));
idx.sort((a,b)=>a.createdAt<b.createdAt?-1:1);
const D=['Ryth','Vesper','Vendetta','C&I','Stellar','Prism','Marcella','Willow','Ren','Varg','Tavi'];
const byMap={};
for(const r of idx){const k=r.myDraft.map(x=>D[x]).join(','); const m=(byMap[r.map]??={}); const h=r.createdAt.slice(11,13); (m[k]??=[]).push(h);}
for(const [m,o] of Object.entries(byMap)){console.log('==',m); for(const [k,hs] of Object.entries(o)) console.log('  ',k, hs.length, 'hours', [...new Set(hs)].join(','));}
const byOpp={};
for(const r of idx){const o=(byOpp[r.opponent]??={n:0,w:0,recentN:0,recentW:0}); o.n++; if(r.won)o.w++; if(r.createdAt>='2026-10-13T19'){o.recentN++; if(r.won)o.recentW++;}}
console.log(Object.entries(byOpp).sort((a,b)=>b[1].n-a[1].n).map(([k,o])=>`${k}: ${o.w}/${o.n} (since19h ${o.recentW}/${o.recentN})`).join('\n'));
