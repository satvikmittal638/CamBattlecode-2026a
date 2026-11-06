import fs from 'node:fs';import {ITEM_NAMES} from '../../tools/replay_dump.mjs';
const dir=import.meta.dirname,{rows}=JSON.parse(fs.readFileSync(dir+'/metrics.json'));
function profile(games,t){const players=new Map(),drafts=new Map(),orders=new Map(),firstGems=[];
 for(const g of games){const team=t?1-g.us:g.us;const key=(t?g.oppDraft:g.myDraft).toSorted((a,b)=>+a-+b).join(',');drafts.set(key,(drafts.get(key)||0)+1);
 const byChamp=new Map();for(const s of g.shops.filter(s=>s.team===team)){let c=byChamp.get(s.id)||{type:s.type,emblems:[]};for(const d of s.delta)if(d.item%2===1)for(let i=0;i<d.count;i++)c.emblems.push({r:s.r,name:ITEM_NAMES[d.item]});byChamp.set(s.id,c);}
 for(const c of byChamp.values()){const k=c.type+'|'+c.emblems.slice(0,3).map(d=>d.name).join(' > ');orders.set(k,(orders.get(k)||0)+1);players.set(c.type,(players.get(c.type)||0)+1);}
 const first=g.captureEvents.find(c=>c.team===team&&c.gems>0);if(first)firstGems.push(first.r);
 }
 return {games:games.length,drafts:[...drafts].sort((a,b)=>b[1]-a[1]),firstGemCaptureMean:firstGems.reduce((s,x)=>s+x,0)/Math.max(1,firstGems.length),championsWithShops:Object.fromEntries(players),emblemOrders:[...orders].sort((a,b)=>b[1]-a[1]).map(([order,count])=>({order,count}))};
}
const normal=rows.filter(g=>!['00contest','01boss_battle'].includes(g.map));
const out={ours:profile(normal,0),opponentsInLosses:profile(normal.filter(g=>g.result==='loss'),1),byOpponent:{}};
for(const opp of [...new Set(rows.map(g=>g.opponent))]){const gs=normal.filter(g=>g.opponent===opp);out.byOpponent[opp]={games:gs.length,ourWins:gs.filter(g=>g.result==='win').length,ours:profile(gs,0),theirs:profile(gs,1)};}
fs.writeFileSync(dir+'/build_patterns.json',JSON.stringify(out,null,2));console.log('Profiled',rows.length,'games');
