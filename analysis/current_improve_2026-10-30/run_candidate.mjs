import fs from 'node:fs';import {spawn} from 'node:child_process';import {api,sleep,ROOT} from '../../tools/bclib.mjs';
const D=ROOT+'/analysis/current_improve_2026-10-30',P=D+'/paired_duo/candidate',sub=JSON.parse(fs.readFileSync(D+'/candidate_submission.json')),ID=sub.id,V=sub.version,OWNER='codex-v125-duo-20261030',U='6b04505b-d16c-4196-b7c6-53a4688a32ca';
let previous='';const deadline=Date.now()+20*60*1000;
function refresh(){const l=JSON.parse(fs.readFileSync(ROOT+'/.platform_lock/owner'));if(l.owner!==OWNER)throw Error('lock lost');fs.writeFileSync(ROOT+'/.platform_lock/owner',JSON.stringify({owner:OWNER,at:Date.now()}));}
while(Date.now()<deadline){
 refresh();const s=await api('GET','/submissions'),b=s.submissions.find(x=>x.id===ID);fs.writeFileSync(D+'/candidate_build_state.json',JSON.stringify({at:new Date().toISOString(),sub:b,active:s.active,selected:s.selected,pinned:s.pinned},null,2));
 if(s.selected?.id!==ID)throw Error('another session changed selected submission; no repeated override');
 if(['failed','error','cancelled'].includes(b?.status))throw Error('candidate build '+b.status);
 const key=[b?.status,s.active?.version,s.pinned].join(':');if(key!==previous){console.log('BUILD',key);previous=key;}
 if(s.active?.id===ID&&fs.existsSync(D+'/uploaded_verified.json')){
  const ready=await api('PUT','/submissions/active',{submissionId:ID});if(ready.active?.id!==ID||ready.selected?.id!==ID||!ready.pinned)throw Error('candidate activation failed');
  console.log('Source verified, candidate active/pinned; sending exact20');
  await new Promise((resolve,reject)=>{const p=spawn(process.execPath,[D+'/send_arm.mjs',P,ID,String(V)],{cwd:ROOT,stdio:'inherit'});p.on('exit',c=>c===0?resolve():reject(Error('sender exit '+c)));p.on('error',reject)});
  const ledger=fs.readFileSync(P+'/challenges.txt','utf8').trim().split('\n'),gs=ledger.map(l=>JSON.parse(fs.readFileSync(P+'/groups/'+l.split('\t').at(-1)+'.json'))),ms=gs.flatMap(g=>g.matches);
  if(gs.length!==20||ms.length!==100||ms.some(m=>m.status!=='finished'||m.errorCode||m.sides.find(s=>s.teamId===U)?.version!==V||m.sides.find(s=>s.teamId===U)?.botError))throw Error('candidate completion verification failed');
  const completion={groups:20,matches:100,version:V,wins:ms.filter(m=>m.sides.find(s=>s.teamId===U)?.result==='win').length,errors:0};fs.writeFileSync(P+'/completion.json',JSON.stringify(completion));console.log('VERIFIED',JSON.stringify(completion));
  let restored=await api('PUT','/submissions/active',{submissionId:'b86f3c88-dbff-4e8a-8c5b-a901cd3e44d9'});
  for(let i=0;i<180&&restored.active?.version!==125;i++){refresh();if(restored.selected?.version!==125)throw Error('restoration changed externally');await sleep(5000);restored=await api('GET','/submissions');}
  if(restored.active?.version!==125||restored.selected?.version!==125||!restored.pinned)throw Error('v125 restoration failed');
  fs.writeFileSync(D+'/restored_v125.json',JSON.stringify({at:new Date().toISOString(),active:restored.active,selected:restored.selected,pinned:restored.pinned},null,2));refresh();fs.rmSync(ROOT+'/.platform_lock',{recursive:true});fs.writeFileSync(D+'/lock_released.json',JSON.stringify({at:new Date().toISOString(),reason:'candidate100 complete, v125 restored per prior user instruction'}));console.log('v125 restored; LOCK RELEASED');process.exit(0);
 }
 await sleep(5000);
}
throw Error('candidate build timeout');
