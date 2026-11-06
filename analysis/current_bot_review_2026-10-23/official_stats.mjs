import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';import {get,sleep} from '../v57_eval_2026-10-23/http.mjs';
const dir=import.meta.dirname,out=dir+'/official_summaries';fs.mkdirSync(out,{recursive:true});
const decoder=fs.readFileSync(dir+'/../v57_eval_2026-10-23/docs_check/service_assets_summary.worker-B4mzss78.js','utf8');
async function decode(bytes){let output;const self={postMessage(x){output=x;}};const context=vm.createContext({self,crypto:crypto.webcrypto,TextDecoder,DataView,Uint8Array});vm.runInContext(decoder,context,{timeout:5000});await self.onmessage({data:bytes});if(output?.error)throw Error(output.error);if(!output?.json)throw Error('No decoder output');return JSON.parse(output.json);}
const selected=process.argv.slice(2),single=selected.length>0;
for(;;){let index=JSON.parse(fs.readFileSync(dir+'/summary_index.json'));if(single)index=index.filter(g=>selected.includes(g.matchId));let wrote=0;
 let next=0;
 await Promise.all(Array.from({length:2},async()=>{while(next<index.length){const g=index[next++];const target=out+'/'+g.matchId+'.json';if(fs.existsSync(target))continue;
  try{const meta=await get('/matches/'+g.matchId+'/summary');let r;for(let n=0;n<6;n++){r=await fetch(meta.url,{signal:AbortSignal.timeout(60000)});if(r.status!==429&&r.status<500)break;await r.text();await sleep(30000);}if(!r.ok)throw Error('Summary storage '+r.status);const bytes=new Uint8Array(await r.arrayBuffer());if(bytes.length!==meta.size||crypto.createHash('sha256').update(bytes).digest('hex')!==meta.sha256)throw Error('Summary outer checksum mismatch');const d=await decode(bytes);
  const us=g.side==='a'?'teamA':'teamB',team=d.teams.find(t=>t.team===us),opponent=d.teams.find(t=>t.team!==us);if(Number(team.submittedGems)!==g.score||Number(opponent.submittedGems)!==g.oppScore||d.match.outcome!==(g.result==='win'?us:opponent.team))throw Error('Official summary score/outcome mismatch');
  const events=d.events.filter(s=>['death','kill','assist','campClear','gemSubmission','gemCollection','gemLoss','botFault','fuelExhausted'].includes(s.kind));
  const compact={matchId:g.matchId,map:g.map,opponent:g.opponent,side:g.side,us,sha256:meta.sha256,bytes:bytes.length,match:d.match,roster:d.roster,teams:d.teams,champions:d.champions,diagnostics:d.diagnostics,events};fs.writeFileSync(target+'.tmp',JSON.stringify(compact));fs.renameSync(target+'.tmp',target);wrote++;if(wrote%10===0)console.log(new Date().toISOString(),'Official summaries added',wrote,'total',fs.readdirSync(out).length);await sleep(2000);
  }catch(e){console.log('SUMMARY RETRY LATER',g.matchId,e.message);if(single)throw e;await sleep(15000);}
 }}));
 const n=fs.readdirSync(out).filter(n=>n.endsWith('.json')).length;fs.writeFileSync(dir+'/official_stats_status.json',JSON.stringify({at:new Date().toISOString(),games:n}));console.log(new Date().toISOString(),'Official summaries',n);
 if(single||n===index.length)break;await sleep(45000);
}
