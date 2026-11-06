import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const dir=import.meta.dirname,read=n=>JSON.parse(fs.readFileSync(dir+'/'+n+'.json'));
const plan=read('plan'),receipts=read('receipts'),idx=read('games/index'),metrics=read('metrics'),official=read('official_audit'),logs=read('log_audit');
assert.equal(receipts.length,100);assert.equal(new Set(receipts.map(r=>r.groupId)).size,100);assert.equal(new Set(receipts.map(r=>r.teamId)).size,100);
assert.equal(plan.samplingDesign,'distinct_opponents_all_100');assert.equal(plan.specs.length,100);
assert.equal(idx.length,500);assert.equal(new Set(idx.map(g=>g.matchId)).size,500);assert.equal(metrics.rows.length,500);assert.equal(new Set(metrics.rows.map(g=>g.matchId)).size,500);assert.equal(metrics.fail.length,0);assert.equal(metrics.exits,0);assert.equal(official.games,500);assert.equal(official.mismatches.length,0);assert.equal(logs.games,500);assert.equal(logs.summary.expectedBuildLabelGames,500);
const sides=new Map(),groups=new Map(receipts.map(r=>[r.groupId,r]));
for(const pool of ['near','half']){assert.equal(receipts.filter(r=>r.pool===pool).length,50);for(const side of ['a','b'])assert.equal(idx.filter(g=>g.pool===pool&&g.side===side).length,125);}
for(const g of idx){
 assert.equal(g.version,plan.version);const r=groups.get(g.groupId);assert(r);assert.equal(r.pool,g.pool);assert(fs.existsSync(dir+'/games/'+g.file));
 const s=plan.specs.find(s=>s.label===g.label),i=s.maps.indexOf(g.map);assert(i>=0);assert.equal(g.side,s.sides[i]);assert.equal(s.teamId,r.teamId);
 const z=sides.get(g.map)||{a:0,b:0};z[g.side]++;sides.set(g.map,z);
}
assert.equal(sides.size,40);for(const z of sides.values())assert.equal(z.a,z.b);
for(const r of receipts){const gs=idx.filter(g=>g.groupId===r.groupId);assert.equal(gs.length,5);assert.equal(new Set(gs.map(g=>g.map)).size,5);const d=read('groups/'+r.groupId);assert.equal(d.group.status,'finished');const me=d.group.sides.find(s=>s.teamId==='6b04505b-d16c-4196-b7c6-53a4688a32ca');assert.equal(me.version,plan.version);assert.equal(me.submissionId,plan.submissionId);assert(d.group.sides.some(s=>s.teamId===r.teamId));assert.equal(me.wins,gs.filter(g=>g.result==='win').length);}
for(const h of read('source_hashes')){assert(h.matchesSubmittedSource);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(dir+'/source/'+h.path)).digest('hex'),h.sha256);}
const journal=read('journal');assert.equal(journal.filter(r=>r.state==='pending').length,0);assert.equal(journal.filter(r=>r.state==='accepted').length,100);
const out={at:new Date().toISOString(),version:plan.version,submissionId:plan.submissionId,challenges:100,nearChallenges:50,halfChallenges:50,distinctOpponents:100,games:500,maps:40,allMapsSideBalanced:true,sourceVerified:true,allGroupsFinished:true,replayFailures:0,officialSummaryDiscrepancies:0,nativeSteps:metrics.rows.reduce((s,g)=>s+g.steps,0),logErrorGames:logs.summary.errorGames,ordinaryFuelLimitInputs:logs.summary.atLimit};
fs.writeFileSync(dir+'/FINAL_VERIFICATION.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));
