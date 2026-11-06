// Wait for the authorized candidate to be live, then run the exact saved plan.
import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {api,sleep,ROOT} from '../../tools/bclib.mjs';
const D=ROOT+'/analysis/v124_opportunity_2026-10-30',P=D+'/paired_scan/candidate';
const ID='5e972af6-7b50-4071-8eb2-03349eda8f60',US='6b04505b-d16c-4196-b7c6-53a4688a32ca',OWNER='codex-v124-scan-20261030';
const auth=JSON.parse(fs.readFileSync(D+'/guard_authorization.json'));
while(Date.now()<Date.parse(auth.deadline)){
 const s=await api('GET','/submissions');const b=s.submissions.find(x=>x.id===ID);
 if(['failed','error'].includes(b?.status))throw Error('build failed');
 if(s.selected?.id===ID&&s.active?.id===ID&&b?.status==='active'){
  const ready=await api('PUT','/submissions/active',{submissionId:ID});
  if(ready.active?.id!==ID||ready.selected?.id!==ID||!ready.pinned)throw Error('activation verification failed');
  fs.writeFileSync(D+'/candidate_ready.json',JSON.stringify({at:new Date().toISOString(),...ready},null,2));
  console.log('Candidate126 built, live, pinned; starting exact20 challenges');
  await new Promise((resolve,reject)=>{const p=spawn(process.execPath,[D+'/send_arm.mjs',P,ID,'126'],{cwd:ROOT,stdio:'inherit'});p.on('exit',code=>code===0?resolve():reject(Error('sender exit '+code)));p.on('error',reject)});
  const ledger=fs.readFileSync(P+'/challenges.txt','utf8').trim().split('\n');
  const gs=ledger.map(l=>JSON.parse(fs.readFileSync(P+'/groups/'+l.split('\t').at(-1)+'.json')));
  const matches=gs.flatMap(g=>g.matches);
  const errors=matches.filter(m=>m.status!=='finished'||m.errorCode||m.sides.find(s=>s.teamId===US)?.version!==126);
  if(gs.length!==20||matches.length!==100||errors.length)throw Error('candidate completion verification failed: '+errors.length);
  const completion={groups:gs.length,matches:matches.length,version:126,wins:matches.filter(m=>m.sides.find(s=>s.teamId===US)?.result==='win').length,errors:0};
  fs.writeFileSync(P+'/completion.json',JSON.stringify(completion));console.log('VERIFIED',JSON.stringify(completion));
  // The guard notices completion before it can write another selection.
  const stopped=()=>fs.readFileSync(D+'/selection_guard.log','utf8').includes('Candidate100 complete; guard ends.');
  for(let i=0;i<30&&!stopped();i++)await sleep(1000);
  if(!stopped())throw Error('guard did not confirm stop; caller must stop it before restoring v125');
  fs.writeFileSync(D+'/guard_stopped.json',JSON.stringify({at:new Date().toISOString(),reason:'completion observed in guard log'}));
  const restoreId='b86f3c88-dbff-4e8a-8c5b-a901cd3e44d9';
  let restored=await api('PUT','/submissions/active',{submissionId:restoreId});
  for(let i=0;i<180&&restored.active?.id!==restoreId;i++){
   if(restored.selected?.id!==restoreId)throw Error('restore selection changed; caller must reconcile before unlock');
   await sleep(5000);restored=await api('GET','/submissions');
  }
  if(restored.active?.id!==restoreId||restored.selected?.id!==restoreId||!restored.pinned)throw Error('v125 restore verification failed');
  fs.writeFileSync(D+'/restored_v125.json',JSON.stringify({at:new Date().toISOString(),...restored},null,2));console.log('v125 restored, active and pinned');
  const l=JSON.parse(fs.readFileSync(ROOT+'/.platform_lock/owner'));
  if(l.owner!==OWNER)throw Error('lock changed before release');
  fs.rmSync(ROOT+'/.platform_lock',{recursive:true});
  fs.writeFileSync(D+'/lock_released.json',JSON.stringify({at:new Date().toISOString(),reason:'100 unranked matches complete; guard stopped; v125 restored as requested'}));
  console.log('LOCK RELEASED after unranked completion');process.exit(0);
 }
 await sleep(5000);
}
throw Error('candidate not live within guard window');
