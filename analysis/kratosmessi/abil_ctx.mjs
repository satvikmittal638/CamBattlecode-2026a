// Ability usage context + shop sequences.
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, cheb, mean, median } from './lib.mjs';
const dir=process.argv[2]||'top_replays/2_KratosMessi'; const N=+(process.argv[3]||30); const sideArg=process.argv[4];
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows;
if(fs.existsSync(path.join(dir,'index.json'))){rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0}));}
else { rows=[]; const sub=['a','b'].filter(s=>fs.existsSync(path.join(dir,s))); if(sub.length){ for(const s of sub) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); } else rows=fs.readdirSync(dir).filter(f=>f.endsWith('.repl26a')).map(f=>({file:f,path:path.join(dir,f),map:MAPS.find(mm=>f.startsWith(mm)),me:sideArg==='b'?1:0,createdAt:f})); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;}; const ctx={}; const seqs={}; const shopRounds={}; const lockCtx=[];
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const myIds=new Set(d.meta.finalChampions.filter(c=>c.team===me).map(c=>c.id)); const typeOf=Object.fromEntries(d.meta.finalChampions.map(c=>[c.id,c.type]));
  const snapBy=new Map(); for(const s of d.snapshots) if(!snapBy.has(s.round)) snapBy.set(s.round,s);
  const byKey=new Map(); for(const e of d.events){ if(e.actor?.kind!==1) continue; const k=e.actor.index+':'+e.round; (byKey.get(k)||byKey.set(k,[]).get(k)).push(e); }
  for(const e of d.events){
    if(e.actor?.kind!==1||!myIds.has(e.actor.index)) continue;
    const t=typeOf[e.actor.index];
    if(e.kind==='Cast ability'){
      const same=byKey.get(e.actor.index+':'+e.round)||[]; const i=same.indexOf(e);
      const before=same.slice(0,i), after=same.slice(i+1);
      const s=snapBy.get(e.round); const c=s?.champions.find(x=>x.id===e.actor.index);
      const enemyNear=c?.pos&&s.champions.some(x=>x.team!==me&&x.alive&&x.pos&&cheb(x.pos,c.pos)<=4);
      const atkB=before.find(x=>x.kind==='Attack'), atkA=after.find(x=>x.kind==='Attack'), mvA=after.find(x=>x.kind==='Move'), mvB=before.find(x=>x.kind==='Move');
      let k=`${t}:${e.abilityType}`;
      if(e.abilityType==='AttackReset') k+=` atkBefore:${!!atkB} atkAfter:${atkA?.target?.kind||'none'}`;
      else if(e.abilityType==='Dash') k+=` enemyNear:${!!enemyNear} moveBefore:${!!mvB} atkAfter:${atkA?.target?.kind||'none'}`;
      else if(e.abilityType==='Shield') k+=` enemyNear:${!!enemyNear} hp:${c?(c.hp/c.maxHp<0.5?'<50':c.hp/c.maxHp<0.9?'50-90':'>90'):'?'} fighting:${[...before,...after].find(x=>x.kind==='Attack')?.target?.kind||'none'}`;
      else k+=` ->${e.target?.kind==='champion'?(e.target.team===me?'ally':'enemy'):e.target?.kind||'tile'}${e.target?.kind==='camp'?':'+e.target.type:''}`;
      inc(ctx,k);
    }
    if(e.kind==='Shop'){
      for(const [it,n] of Object.entries(e.items||{})){ if(n<=0) continue; const mm=it.match(/^(\w+) Shard of (\w+)$/); const key=mm?`${mm[1][0]}${mm[1][1]}:${mm[2][0]}`:it.match(/Emblem/)?null:'Lock'; if(!key) continue; const sq=(seqs[t]??={}); const id=r.file+e.actor.index; (sq[id]??=[]); for(let j=0;j<n;j++) sq[id].push(key); }
      const em=Object.entries(e.items||{}).find(([it,n])=>n>0&&it.includes('Emblem')); if(em){ const mm=em[0].match(/^(\w+) Emblem of (\w+)$/); const sq=(seqs[t]??={}); const id=r.file+e.actor.index; (sq[id]??=[]); const k=`${mm[1][0]}${mm[1][1]}:${mm[2][0]}`; const cur=sq[id].filter(x=>x===k).length; for(let j=cur%5;j<5;j++) sq[id].push(k); }
    }
    if(e.kind==='Place altar lock'){ const s=snapBy.get(e.round); const enemyTrib=d.events.some(x=>x.kind==='Submit gems'&&x.team!==me&&x.round>=e.round-6&&x.round<=e.round&&cheb(x.to,e.to)===0); lockCtx.push(`${t} r${e.round} enemyTributingThatAltar:${enemyTrib}`); }
  }
}
console.log(Object.entries(ctx).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${String(v).padStart(5)} ${k}`).join('\n'));
for(const [t,sq] of Object.entries(seqs)){ const c={}; for(const s of Object.values(sq)){ const comp=[]; for(const x of s){ if(comp.length&&comp.at(-1)[0]===x) comp.at(-1)[1]++; else comp.push([x,1]); } inc(c,comp.slice(0,8).map(([a,b])=>`${a}x${b}`).join(' ')); } console.log('==',t); Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,6).forEach(([k,v])=>console.log('  ',v,k)); }
console.log('altar lock placements:', lockCtx.length); lockCtx.slice(0,20).forEach(x=>console.log('  ',x));
