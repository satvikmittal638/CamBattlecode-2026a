// Do champions approach invaders (enemies in our half) more than other enemies?
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, cheb } from './lib.mjs';
const dir=process.argv[2]; const N=+(process.argv[3]||25); const opp=process.argv[4];
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows; if(fs.existsSync(dir+'/index.json')) rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0})); else { rows=[]; for(const s of ['a','b']) if(fs.existsSync(path.join(dir,s))) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); }
if(opp) rows=rows.filter(r=>(r.opponent||'').includes(opp));
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const t={}; const inc=(o,k)=>{o[k]=(o[k]||0)+1;};
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const own=m.spawnC[me], oth=m.spawnC[1-me];
  const atk=new Set(); for(const e of d.events) if(e.actor?.kind===1&&e.team===me&&(e.kind==='Attack'||e.kind==='Cast ability')&&e.target?.kind==='champion'&&e.target.team!==me) atk.add(e.actor.index+':'+e.round);
  for(let i=0;i<d.snapshots.length-1;i++){ const s=d.snapshots[i], s2=d.snapshots[i+1]; if(s2.round!==s.round+1) continue;
    for(const c of s.champions){ if(c.team!==me||!c.alive||!c.pos||c.hp<0.5*c.maxHp) continue;
      const ens=s.champions.filter(x=>x.team!==me&&x.alive&&x.pos); if(!ens.length) continue;
      const e=ens.reduce((a,b)=>cheb(a.pos,c.pos)<=cheb(b.pos,c.pos)?a:b); const dd=cheb(e.pos,c.pos); if(dd<4||dd>8) continue;
      const inv=cheb(e.pos,own)<cheb(e.pos,oth); const c2=s2.champions.find(x=>x.id===c.id), e2=s2.champions.find(x=>x.id===e.id); if(!c2?.pos||!e2?.pos) continue;
      const d2=cheb(c2.pos,e2.pos); const cls=atk.has(c.id+':'+s.round)?'fight':d2<dd?'closer':d2>dd?'further':'same';
      // did *I* move toward it? compare my new pos to enemy old pos
      const mine=cheb(c2.pos,e.pos)<dd?'Itoward':cheb(c2.pos,e.pos)>dd?'Iaway':'Istill';
      inc((t[(inv?'invader':'notInvader')+' d'+(dd<=5?'4-5':'6-8')]??={}),mine);
    }}
}
for(const [k,v] of Object.entries(t).sort()){const n=Object.values(v).reduce((a,b)=>a+b,0); console.log(k.padEnd(20),n,Object.entries(v).map(([a,b])=>`${a}:${(b/n*100).toFixed(0)}%`).join(' '));}
