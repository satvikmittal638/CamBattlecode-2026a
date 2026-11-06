import fs from 'node:fs';
const idx = JSON.parse(fs.readFileSync('top_replays/2_KratosMessi/index.json','utf8'));
idx.sort((a,b)=>a.createdAt<b.createdAt?1:-1);
const D=['Ryth','Vesper','Vendetta','C&I','Stellar','Prism','Marcella','Willow','Ren','Varg','Tavi'];
console.log('total', idx.length, 'range', idx.at(-1).createdAt, idx[0].createdAt);
const byDay={};
for(const r of idx){const d=r.createdAt.slice(0,10); const o=(byDay[d]??={n:0,w:0,ranked:0}); o.n++; if(r.won)o.w++; if(r.kind==='ranked')o.ranked++;}
console.log(byDay);
// recent 60 draft by map
const N=+process.argv[2]||60;
const rec=idx.slice(0,N);
const byMap={};
for(const r of rec){(byMap[r.map]??=[]).push(`${r.side}:${r.myDraft.map(x=>D[x]).join(',')} vs ${r.oppDraft.map(x=>D[x]).join(',')} ${r.won?'W':'L'} ${r.myGems}-${r.oppGems} r${r.rounds} ${r.opponent} ${r.kind} ${r.createdAt.slice(5,16)}`);}
for(const [m,a] of Object.entries(byMap)){console.log('==',m);a.forEach(x=>console.log('  ',x));}
