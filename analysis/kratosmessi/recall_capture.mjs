// How often is a recall started while standing on a capturable (reward) group tile?
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, groupAt, cheb, mean, median } from './lib.mjs';
const dir=process.argv[2]||'top_replays/2_KratosMessi'; const N=+(process.argv[3]||30); const sideArg=process.argv[4];
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows;
if(fs.existsSync(path.join(dir,'index.json'))){rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0}));}
else { rows=[]; for(const s of ['a','b']) if(fs.existsSync(path.join(dir,s))) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;}; const t={}; const hp={cap:[],other:[]}; const goldVal=[]; const capNoRecall={}; 
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const snapBy=new Map(); for(const s of d.snapshots) if(!snapBy.has(s.round)) snapBy.set(s.round,s);
  for(const e of d.events){
    if(e.kind!=='Recall'||e.team!==me||e.actor?.kind!==1) continue;
    const s=snapBy.get(e.round); const c=s?.champions.find(x=>x.id===e.actor.index); if(!c?.pos) continue;
    const g=groupAt(m,c.pos); const onReward=g>=0&&s.groups[g]?.rewardAvailable;
    const k=onReward?'onCaptureTile':'other'; inc(t,k); hp[onReward?'cap':'other'].push(c.hp/c.maxHp);
    if(onReward) goldVal.push(m.groups[g].gold+c.gold);
  }
  // captures where the capturer did NOT recall: gold after capture
  for(let i=1;i<d.snapshots.length;i++){ const a=d.snapshots[i-1], b=d.snapshots[i]; for(let g=0;g<b.groups.length;g++){ if(a.groups[g].rewardAvailable&&!b.groups[g].rewardAvailable&&a.groups[g].captureTeam===me){ const cap=a.champions.find(c=>c.team===me&&c.alive&&c.pos&&groupAt(m,c.pos)===g); if(!cap) continue; const rec=d.events.some(e=>e.kind==='Recall'&&e.actor?.kind===1&&e.actor.index===cap.id&&e.round>=b.round-6&&e.round<=b.round); const goldAfter=cap.gold+m.groups[g].gold; inc(capNoRecall,`${rec?'recall':'norecall'} goldAfter${goldAfter>=150?'>=150':'<150'} hp${cap.hp/cap.maxHp<0.5?'<.5':cap.hp/cap.maxHp<0.9?'<.9':'>=.9'}`); } } }
}
console.log(t,'hp median cap',median(hp.cap)?.toFixed(2),'other',median(hp.other)?.toFixed(2),'goldAfter median',median(goldVal));
console.log(Object.entries(capNoRecall).sort().map(([k,v])=>`${v} ${k}`).join('\n'));
