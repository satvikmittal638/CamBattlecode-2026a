// Fine-grained recall trigger analysis
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, groupAt, cheb, mean, median } from './lib.mjs';
const dir='top_replays/2_KratosMessi';
let rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0}));
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,+(process.argv[2]||40));
const bins={}; const ctx={}; const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;};
const lowByChamp={}; const enemyVis={};
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const snapBy=new Map(); for(const s of d.snapshots) if(!snapBy.has(s.round)) snapBy.set(s.round,s);
  for(const e of d.events){
    if(e.kind!=='Recall'||e.team!==me||e.actor?.kind!==1) continue;
    const s=snapBy.get(e.round); const c=s?.champions.find(x=>x.id===e.actor.index); if(!c) continue;
    const hpf=c.hp/c.maxHp; const b=(Math.floor(hpf*20)/20).toFixed(2); inc(bins,b);
    // context: attacking a camp in last 3 rounds? enemy champ within 8?
    const recentAtk=d.events.filter(x=>x.actor?.kind===1&&x.actor.index===e.actor.index&&x.kind==='Attack'&&x.round>=e.round-3&&x.round<=e.round);
    const campAtk=recentAtk.some(x=>x.target?.kind==='camp'), chAtk=recentAtk.some(x=>x.target?.kind==='champion');
    const enemyNear=s.champions.some(x=>x.team!==me&&x.alive&&x.pos&&cheb(x.pos,c.pos)<=8);
    // camp hit me in last 3 rounds?
    const campHit=d.events.some(x=>x.actor?.kind===2&&x.kind==='Attack'&&x.round>=e.round-3&&x.round<=e.round&&x.target?.id===e.actor.index);
    if(hpf<0.5){ inc(ctx,(campAtk?'campAtk ':'')+(chAtk?'champAtk ':'')+(enemyNear?'enemyNear ':'')+(campHit?'campHit':'')); (lowByChamp[c.type]??=[]).push(hpf); }
    // did they continue fighting a camp that was nearly dead? camp hp
  }
}
console.log('recall hpf bins (all)'); console.log(Object.entries(bins).sort().map(([k,v])=>`${k}:${v}`).join(' '));
console.log('low-hp recall context', ctx);
for(const [k,v] of Object.entries(lowByChamp)) console.log(k, 'n',v.length,'median',median(v).toFixed(2),'p75',[...v].sort()[Math.floor(v.length*0.75)].toFixed(2),'max',Math.max(...v).toFixed(2));
