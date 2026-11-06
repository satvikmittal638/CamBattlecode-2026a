// User explicitly authorized this 30-minute guard in the 30 October reply.
// Selected-version writes can cancel another account's pending build as a platform side effect.
// Never cancels/deletes match groups. Ready live bot remains available while selected bot builds.
import fs from 'node:fs';import {api,sleep,ROOT} from '../../tools/bclib.mjs';
const D='analysis/v124_opportunity_2026-10-30',ID='5e972af6-7b50-4071-8eb2-03349eda8f60',OWNER='codex-v124-scan-20261030';let last='';
const started=Date.now(),deadline=started+30*60*1000;
fs.writeFileSync(D+'/guard_authorization.json',JSON.stringify({started:new Date(started).toISOString(),deadline:new Date(deadline).toISOString(),authorization:'User: Authorize the 30-minute selection guard'},null,2));
for(;;){
 if(Date.now()>=deadline)throw Error('Selection guard timed out after30minutes');
 const l=JSON.parse(fs.readFileSync(ROOT+'/.platform_lock/owner'));if(l.owner!==OWNER)throw Error('lock lost');fs.writeFileSync(ROOT+'/.platform_lock/owner',JSON.stringify({owner:OWNER,at:Date.now()}));
 let s=await api('GET','/submissions');
 if(s.selected?.id!==ID){
  fs.appendFileSync(D+'/selection_overrides.jsonl',JSON.stringify({at:new Date().toISOString(),previousSelected:s.selected?.version,active:s.active?.version})+'\n');
  s=await api('PUT','/submissions/active',{submissionId:ID});console.log('Restored authorized selection126; live version',s.active?.version);
 }
 const sub=s.submissions.find(x=>x.id===ID);const state={at:new Date().toISOString(),sub,active:s.active,selected:s.selected,pinned:s.pinned};fs.writeFileSync(D+'/guard_state.json',JSON.stringify(state,null,2));
 const k=[sub?.status,s.active?.version,s.selected?.version,s.pinned].join(':');if(k!==last){console.log(state.at,k);last=k;}
 if(['failed','error'].includes(sub?.status))throw Error('candidate build failed');
 const f=D+'/paired_scan/candidate/completion.json';if(fs.existsSync(f)&&JSON.parse(fs.readFileSync(f)).matches===100){console.log('Candidate100 complete; guard ends.');break;}
 await sleep(Math.min(5000,Math.max(0,deadline-Date.now())));
}
