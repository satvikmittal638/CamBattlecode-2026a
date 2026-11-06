// Fight behaviour: what a champion does when an enemy champion is near, by distance and hp.
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, cheb, mean, median } from './lib.mjs';
const dir=process.argv[2]||'top_replays/2_KratosMessi'; const N=+(process.argv[3]||30); const sideArg=process.argv[4];
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows;
if(fs.existsSync(path.join(dir,'index.json'))){rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0}));}
else { rows=[]; const sub=['a','b'].filter(s=>fs.existsSync(path.join(dir,s))); if(sub.length){ for(const s of sub) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); } else rows=fs.readdirSync(dir).filter(f=>f.endsWith('.repl26a')).map(f=>({file:f,path:path.join(dir,f),map:MAPS.find(mm=>f.startsWith(mm)),me:sideArg==='b'?1:0,createdAt:f})); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const tab={}; const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;};
const tgt={lowestHp:0,lowestHpFrac:0,closest:0,n:0,carrier:0}; const firstHit={km:0,enemy:0}; const gemsCarriedTarget=[];
const withGems={};
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const myIds=new Set(d.meta.finalChampions.filter(c=>c.team===me).map(c=>c.id));
  const snaps=d.snapshots; const snapBy=new Map(); for(const s of snaps) if(!snapBy.has(s.round)) snapBy.set(s.round,s);
  // actions per (id,round)
  const act=new Map();
  for(const e of d.events){ if(e.actor?.kind!==1) continue; const k=e.actor.index+':'+e.round; const a=act.get(k)||new Set();
    if(e.kind==='Attack') a.add(e.target?.kind==='champion'?'atkChamp':e.target?.kind==='camp'?'atkCamp':'atkOther');
    if(e.kind==='Cast ability'&&e.target?.kind==='champion'&&e.target.team!==(myIds.has(e.actor.index)?me:1-me)) a.add('castEnemy');
    if(e.kind==='Recall') a.add('recall'); if(e.kind==='Submit gems') a.add('trib');
    act.set(k,a);
    // target selection on champion attacks by KM
    if(myIds.has(e.actor.index)&&e.kind==='Attack'&&e.target?.kind==='champion'){
      const s=snapBy.get(e.round); const self=s?.champions.find(x=>x.id===e.actor.index); if(!self?.pos) continue;
      const range=['Cassi','Tavi','VesperVale','Stellar','Prism','Willow'].includes(self.type)?3:1;
      const inR=s.champions.filter(x=>x.team!==me&&x.alive&&x.pos&&cheb(x.pos,self.pos)<=range+1);
      if(inR.length>=2){ tgt.n++; const t=inR.find(x=>x.id===e.target.id); if(t){ if(t.hp===Math.min(...inR.map(x=>x.hp))) tgt.lowestHp++; if(t.hp/t.maxHp===Math.min(...inR.map(x=>x.hp/x.maxHp))) tgt.lowestHpFrac++; if(cheb(t.pos,self.pos)===Math.min(...inR.map(x=>cheb(x.pos,self.pos)))) tgt.closest++; if(t.gems===Math.max(...inR.map(x=>x.gems))&&t.gems>0) tgt.carrier++; } }
    }
  }
  for(let i=0;i<snaps.length-1;i++){
    const s=snaps[i], s2=snaps[i+1]; if(s2.round!==s.round+1) continue;
    for(const c of s.champions){
      if(!myIds.has(c.id)||!c.alive||!c.pos) continue;
      const ens=s.champions.filter(x=>x.team!==me&&x.alive&&x.pos);
      if(!ens.length) continue;
      const near=ens.reduce((a,b)=>cheb(a.pos,c.pos)<=cheb(b.pos,c.pos)?a:b); const dd=cheb(near.pos,c.pos);
      if(dd>8) continue;
      const c2=s2.champions.find(x=>x.id===c.id); const n2=s2.champions.find(x=>x.id===near.id);
      const a=act.get(c.id+':'+s.round)||new Set();
      let cls=a.has('atkChamp')||a.has('castEnemy')?'FIGHT':a.has('recall')?'recall':a.has('trib')?'trib':a.has('atkCamp')?'camp':'move';
      if(cls==='move'&&c2?.pos&&n2?.pos){ const d2=cheb(c2.pos,n2.pos); cls=d2<dd?'approach':d2>dd?'away':'hold'; }
      const ranged=['Cassi','Tavi'].includes(c.type);
      const db=dd<=1?'d1':dd===2?'d2':dd===3?'d3':dd<=5?'d4-5':'d6-8';
      const hb=c.hp/c.maxHp<0.4?'lowHP':'okHP';
      const adv=(c.hp>=near.hp)?'hpAdv':'hpDis';
      inc((tab[db+' '+hb]??={}),cls);
      inc((tab['ALL '+db+' '+adv]??={}),cls); inc((tab[(ranged?'R ':'M ')+db+' '+(c.hp/c.maxHp<0.4?'low':'ok')]??={}),cls); if(dd<=3){ const busy=(s.champions.some(o=>o.team===me&&o.id!==c.id&&o.alive&&o.pos&&cheb(o.pos,near.pos)<=2)); inc((tab['allyEngaged:'+busy+' '+(ranged?'R':'M')+db]??={}),cls);}
      if(c.gems>0) inc((withGems[db+' gems>0']??={}),cls); else inc((withGems[db+' gems=0']??={}),cls);
    }
  }
}
const pr=(t)=>{for(const [k,v] of Object.entries(t).sort()){const n=Object.values(v).reduce((a,b)=>a+b,0); console.log('  ',k.padEnd(20),String(n).padStart(5),Object.entries(v).sort((a,b)=>b[1]-a[1]).map(([a,b])=>`${a}:${(b/n*100).toFixed(0)}%`).join(' '));}};
console.log('actions when nearest enemy within 8:'); pr(tab); console.log('by carrying gems:'); pr(withGems);
console.log('target choice when >=2 enemies in range+1:', tgt);
