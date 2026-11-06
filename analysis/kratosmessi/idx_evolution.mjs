import fs from 'node:fs';
const idx = JSON.parse(fs.readFileSync('top_replays/2_KratosMessi/index.json','utf8'));
idx.sort((a,b)=>a.createdAt<b.createdAt?-1:1);
const D=['Ryth','Vesper','Vendetta','C&I','Stellar','Prism','Marcella','Willow','Ren','Varg','Tavi'];
// per hour: draft strings (5-champ), win rate, avg rounds
const byHour={};
for(const r of idx){const h=r.createdAt.slice(11,13); const o=(byHour[h]??={n:0,w:0,drafts:{},rounds:0,gd:0}); o.n++; if(r.won)o.w++; o.rounds+=r.rounds; o.gd+=r.myGems-r.oppGems; const k=r.myDraft.map(x=>D[x]).join(','); o.drafts[k]=(o.drafts[k]||0)+1;}
for(const [h,o] of Object.entries(byHour)) console.log(h, o.n, 'wr',(o.w/o.n).toFixed(2),'rounds',(o.rounds/o.n).toFixed(0),'gd',(o.gd/o.n).toFixed(0), JSON.stringify(Object.entries(o.drafts).sort((a,b)=>b[1]-a[1]).slice(0,4)));
// opponents
const opp={}; for(const r of idx){const o=(opp[r.opponent]??={n:0,w:0,ranked:0}); o.n++; if(r.won)o.w++; if(r.kind==='ranked')o.ranked++;}
console.log(Object.entries(opp).sort((a,b)=>b[1].n-a[1].n).map(([k,v])=>`${k}:${v.w}/${v.n}(r${v.ranked})`).join('  '));
// groups count distinct
const groups=new Set(idx.map(r=>r.groupId)); console.log('groups',groups.size);
