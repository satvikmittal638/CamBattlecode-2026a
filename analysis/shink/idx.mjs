// Summarise SHINK index.json: per-day counts, draft evolution, recent games by map.
import fs from 'node:fs';
const idx = JSON.parse(fs.readFileSync('top_replays/4_SHINK-AI-6500/index.json','utf8'));
idx.sort((a,b)=>a.createdAt<b.createdAt?1:-1);
const D=['Ryth','Vesper','Vendetta','C&I','Stellar','Prism','Marcella','Willow','Ren','Varg','Tavi'];
console.log('total', idx.length, 'range', idx.at(-1).createdAt, idx[0].createdAt);
const byHour={};
for(const r of idx){const d=r.createdAt.slice(0,13); const o=(byHour[d]??={n:0,w:0,ranked:0,drafts:{}}); o.n++; if(r.won)o.w++; if(r.kind==='ranked')o.ranked++; const k=r.myDraft.map(x=>D[x]).join(','); o.drafts[k]=(o.drafts[k]||0)+1;}
const mode=process.argv[2]||'hours';
if(mode==='hours'){for(const [h,o] of Object.entries(byHour)) console.log(h,`n=${o.n} w=${o.w} ranked=${o.ranked}`, Object.entries(o.drafts).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k,v])=>`${k}:${v}`).join(' | '));}
else {
const N=+process.argv[3]||60;
const rec=idx.slice(0,N);
const byMap={};
for(const r of rec){(byMap[r.map]??=[]).push(`${r.side}:${r.myDraft.map(x=>D[x]).join(',')} vs ${r.oppDraft.map(x=>D[x]).join(',')} ${r.won?'W':'L'} ${r.myGems}-${r.oppGems} r${r.rounds} ${r.opponent} ${r.kind} ${r.createdAt.slice(5,16)}`);}
for(const [m,a] of Object.entries(byMap)){console.log('==',m);a.forEach(x=>console.log('  ',x));}
}
