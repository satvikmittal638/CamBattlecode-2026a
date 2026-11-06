import fs from 'node:fs';
const dir=import.meta.dirname,{rows}=JSON.parse(fs.readFileSync(dir+'/metrics.json')),byId=new Map(rows.map(g=>[g.matchId,g])),files=fs.readdirSync(dir+'/official_summaries').filter(n=>n.endsWith('.json')),out=[],mismatches=[];
const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
for(const file of files){const d=JSON.parse(fs.readFileSync(dir+'/official_summaries/'+file)),g=byId.get(d.matchId);if(!g)continue;const stats=[];
 for(let t=0;t<2;t++){const team=t===0?d.us:d.us==='teamA'?'teamB':'teamA',cs=d.champions.filter(c=>c.team===team),streams=d.events.filter(e=>e.owner.team===team),events=kind=>streams.filter(s=>s.kind===kind).flatMap(s=>s.entries),caps=new Map();
  for(const e of events('gemCollection').filter(e=>e.context==='campGroup')){const key=e.timestamp.round+'|'+e.target.id;const c=caps.get(key)||{gems:0,recipients:0};c.gems+=Number(e.value);c.recipients++;caps.set(key,c);}
  const metricKeys=['earnedGold','spentGold','saleRefunds','kills','deaths','monsterDamageDone','monsterDamageTaken','championDamageDone','championDamageTaken','healingDone','healingReceived','shieldingDone'];
  const z={...Object.fromEntries(metricKeys.map(k=>[k,sum(cs,c=>Number(c.metrics[k]))])),groupCaps:caps.size,gemGroupCaps:[...caps.values()].filter(c=>c.gems>0).length,capGems:sum([...caps.values()],c=>c.gems),rewardReceipts:sum([...caps.values()],c=>c.recipients),bankEvents:events('gemSubmission').length,bank:sum(events('gemSubmission'),e=>Number(e.value)),campDeaths:events('death').filter(e=>/\(2\)$/.test(e.context)||e.context==='camp').length,championDeaths:events('death').filter(e=>/\(1\)$/.test(e.context)||e.context==='champion').length,fuelExhausted:events('fuelExhausted').length,botFaults:d.diagnostics.botFaults[team]};
  const expected={deaths:g.deaths.filter(x=>x.team===(t?1-g.us:g.us)).length,groupCaps:g.metrics[t].groupCaps,gemGroupCaps:g.metrics[t].gemGroupCaps,capGems:g.metrics[t].capGems,rewardReceipts:g.metrics[t].caps,bank:t?g.oppScore:g.score};
  for(const[k,v]of Object.entries(expected))if(z[k]!==v)mismatches.push({matchId:g.matchId,side:t?'opponent':'us',field:k,replay:v,official:z[k]});
  stats.push(z);
 }
 out.push({matchId:g.matchId,map:g.map,pool:g.pool,opponent:g.opponent,result:g.result,rounds:g.rounds,diagnostics:d.diagnostics,stats});
}
function aggregate(gs){return {games:gs.length,us:Object.fromEntries(Object.keys(gs[0]?.stats[0]||{}).map(k=>[k,sum(gs,g=>g.stats[0][k])/Math.max(1,gs.length)])),opponent:Object.fromEntries(Object.keys(gs[0]?.stats[1]||{}).map(k=>[k,sum(gs,g=>g.stats[1][k])/Math.max(1,gs.length)]))};}
const normalLoss=out.filter(g=>g.result==='loss'&&!['00contest','01boss_battle'].includes(g.map)),summary={all:aggregate(out),normalLoss:aggregate(normalLoss),wins:aggregate(out.filter(g=>g.result==='win')),boss:aggregate(out.filter(g=>g.map==='00contest')),gate:aggregate(out.filter(g=>g.map==='01boss_battle'))};
fs.writeFileSync(dir+'/official_audit.json',JSON.stringify({games:out.length,mismatches,summary,rows:out},null,1));
console.log(JSON.stringify({games:out.length,mismatches:mismatches.slice(0,10),normalLoss:summary.normalLoss},null,2));if(mismatches.length)process.exitCode=1;
