// Tribute decision model: after a gem gain, compare altar distance vs nearest live camp distance.
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, groupAt, cheb, mean, median } from './lib.mjs';
const dir=process.argv[2]||'top_replays/2_KratosMessi';
const N=+(process.argv[3]||40); const sideArg=process.argv[4];
const MAPS=['collision','corners','elkring','expanse','interlock','lanes','monolith','packs','rows'];
let rows;
if(fs.existsSync(path.join(dir,'index.json'))){rows=JSON.parse(fs.readFileSync(dir+'/index.json','utf8')).map(r=>({...r,path:path.join(dir,'replays',r.file),me:r.side==='b'?1:0}));}
else { rows=[]; const sub=['a','b'].filter(s=>fs.existsSync(path.join(dir,s))); if(sub.length){ for(const s of sub) for(const f of fs.readdirSync(path.join(dir,s)).filter(f=>f.endsWith('.repl26a'))) rows.push({file:f,path:path.join(dir,s,f),map:MAPS.find(mm=>f.startsWith(mm)),me:s==='b'?1:0,createdAt:f}); } else rows=fs.readdirSync(dir).filter(f=>f.endsWith('.repl26a')).map(f=>({file:f,path:path.join(dir,f),map:MAPS.find(mm=>f.startsWith(mm)),me:sideArg==='b'?1:0,createdAt:f})); }
rows.sort((a,b)=>a.createdAt<b.createdAt?1:-1); rows=rows.slice(0,N);
const feats=[]; const altarChoice={nearest:0,other:0};
for(const r of rows){
  const d=await dumpReplay(r.path,{snapshots:'round'}); const m=loadMap(r.map); const me=r.me;
  const myIds=d.meta.finalChampions.filter(c=>c.team===me).map(c=>c.id);
  for(const id of myIds){
    const evs=d.events.filter(e=>e.actor?.kind===1&&e.actor.index===id);
    let prev=0;
    for(const s of d.snapshots){
      const c=s.champions.find(x=>x.id===id); if(!c) continue;
      if(c.alive&&c.gems>prev){
        const nxt=evs.find(e=>e.round>=s.round&&((e.kind==='Attack'&&e.target?.kind==='camp')||e.kind==='Submit gems'||e.kind==='Recall'));
        const cls=!nxt?'none':nxt.kind==='Submit gems'?'trib':nxt.kind==='Recall'?'recall':'camp';
        // live groups: any camp hp>0 in group
        const live=new Set(); for(const cp of s.camps){ if(cp.hp>0){const g=groupAt(m,cp.pos); if(g>=0) live.add(g);} }
        let cd=1e9, cg=-1; for(const g of live){ for(const cell of m.groups[g].cells){const dd=cheb([cell.x,cell.y],c.pos); if(dd<cd){cd=dd;cg=g;}} }
        // skip groups being fought by enemies? ignore
        let ad=1e9, ai=-1; m.altars.forEach((a,i)=>{const dd=cheb(a,c.pos); if(dd<ad){ad=dd;ai=i;}});
        const own=cheb(c.pos,m.spawnC[me]);
        feats.push({gems:c.gems,ad,cd,cls,own,map:r.map,campGems:cg>=0?m.groups[cg].gems:0});
        if(cls==='trib'){ const used=nxt.to; const ui=m.altars.findIndex(a=>a[0]===used[0]&&a[1]===used[1]); if(ui===ai) altarChoice.nearest++; else altarChoice.other++; }
      }
      prev=c.gems;
    }
  }
}
const tab=(keyf)=>{const t={}; for(const f of feats){ if(f.cls==='none') continue; const k=keyf(f); (t[k]??={n:0,trib:0}); t[k].n++; if(f.cls==='trib') t[k].trib++; } for(const [k,v] of Object.entries(t).sort()) console.log('  ',k.padEnd(28),String(v.n).padStart(4),(v.trib/v.n*100).toFixed(0)+'%'); };
console.log('n',feats.length,'altar choice',altarChoice);
console.log('by gems x (altarDist - campDist):');
tab(f=>{const g=f.gems<30?'g<30':f.gems<45?'g30-44':f.gems<70?'g45-69':'g70+'; const x=f.ad-f.cd; const b=x<=-5?'alt much closer':x<=0?'alt closer':x<=5?'camp closer':'camp much closer'; return g+' '+b;});
console.log('by gems x ratio gems/ad vs campGems/cd:');
tab(f=>{const g=f.gems<30?'g<30':f.gems<45?'g30-44':'g45+'; const a=f.gems/Math.max(1,f.ad), c=f.campGems/Math.max(1,f.cd); return g+' '+(a>c?'altVal>':'campVal>');});
console.log("fine gems x altar dist");
tab(f=>{const g=f.gems<30?"g<30":f.gems<40?"g30-39":f.gems<45?"g40-44":"g45+"; const a=f.ad<=8?"ad<=8":f.ad<=14?"ad9-14":"ad15+"; return g+" "+a;});
console.log("x");
tab(f=>{const g=f.gems<30?'g<30':f.gems<45?'g30-44':'g45+'; return g+' ad'+String(Math.min(30,Math.floor(f.ad/3)*3)).padStart(2,'0');});
