// What does a champion do at low HP while a camp is hitting it?
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, groupAt, cheb, mean, median } from './lib.mjs';
const dir=process.argv[2]; const N=+(process.argv[3]||20);
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows;
if(fs.existsSync(path.join(dir,'index.json'))){rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0}));}
else { rows=[]; for(const s of ['a','b']) if(fs.existsSync(path.join(dir,s))) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;}; const t={}; const campHpLeft={};
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const snapBy=new Map(); for(const s of d.snapshots) if(!snapBy.has(s.round)) snapBy.set(s.round,s);
  const campHits=new Map(); for(const e of d.events) if(e.actor?.kind===2&&e.kind==='Attack'&&e.target?.kind==='champion') { const k=e.target.id+':'+e.round; campHits.set(k,(campHits.get(k)||0)+1); }
  const acts=new Map(); for(const e of d.events){ if(e.actor?.kind!==1) continue; const k=e.actor.index+':'+e.round; const a=acts.get(k)||[]; a.push(e); acts.set(k,a); }
  for(const s of d.snapshots){
    for(const c of s.champions){
      if(c.team!==me||!c.alive||!c.pos) continue;
      const hpf=c.hp/c.maxHp; if(hpf>=0.45) continue;
      if(!campHits.get(c.id+':'+s.round)) continue; // camp hits me this round
      const a=acts.get(c.id+':'+s.round)||[];
      const kinds=new Set(a.map(e=>e.kind==='Attack'?'atk-'+(e.target?.kind||''):e.kind));
      let cls=kinds.has('Recall')?'recall':kinds.has('atk-camp')?'keepAttacking':kinds.has('Move')?'move':kinds.has('Cast ability')?'cast':'none';
      const b=hpf<0.2?'<.20':hpf<0.33?'.20-.33':'.33-.45';
      inc((t[b]??={}),cls);
      if(cls==='keepAttacking'){ const tgt=a.find(e=>e.kind==='Attack'&&e.target?.kind==='camp'); const cp=s.camps.find(x=>x.id===tgt.target.id); if(cp) inc(campHpLeft,b+(cp.hp<300?' camp<300':cp.hp<800?' camp<800':' camp>=800')); }
    }
  }
}
for(const [k,v] of Object.entries(t).sort()){const n=Object.values(v).reduce((a,b)=>a+b,0); console.log(k,n,Object.entries(v).sort((a,b)=>b[1]-a[1]).map(([a,b])=>`${a}:${(b/n*100).toFixed(0)}%`).join(' '));}
console.log(campHpLeft);
