import fs from 'node:fs';import {spawn} from 'node:child_process';import {api,sleep,ROOT} from '../../tools/bclib.mjs';
const D=ROOT+'/analysis/current_improve_2026-10-30',P=D+'/paired_recovery/candidate',sub=JSON.parse(fs.readFileSync(D+'/recovery_submission.json')),ID=sub.id,V=sub.version,OWNER='codex-v125-duo-20261030',U='6b04505b-d16c-4196-b7c6-53a4688a32ca';
const deadline=Date.now()+25*60*1000;let previous='';
function refresh(){const l=JSON.parse(fs.readFileSync(ROOT+'/.platform_lock/owner'));if(l.owner!==OWNER)throw Error('lock lost');fs.writeFileSync(ROOT+'/.platform_lock/owner',JSON.stringify({owner:OWNER,at:Date.now()}));}
while(Date.now()<deadline){
 refresh();const s=await api('GET','/submissions'),b=s.submissions.find(x=>x.id===ID);fs.writeFileSync(D+'/recovery_build_state.json',JSON.stringify({at:new Date().toISOString(),sub:b,active:s.active,selected:s.selected,pinned:s.pinned},null,2));
 if(s.selected?.id!==ID)throw Error('another session changed selected submission; no repeated override');
 if(['failed','error','cancelled'].includes(b?.status))throw Error('build '+b.status);
 const key=[b?.status,s.active?.version].join(':');if(key!==previous){console.log('BUILD',key);previous=key;}
 if(s.active?.id===ID && fs.existsSync(D+'/recovery_uploaded_verified.json')){
  const ready=await api('PUT','/submissions/active',{submissionId:ID});if(ready.active?.id!==ID||!ready.pinned)throw Error('activation failed');
  await new Promise((resolve,reject)=>{const p=spawn(process.execPath,[D+'/send_arm.mjs',P,ID,String(V)],{cwd:ROOT,stdio:'inherit'});p.on('exit',c=>c===0?resolve():reject(Error('sender exit '+c)));p.on('error',reject)});
  const lines=fs.readFileSync(P+'/challenges.txt','utf8').trim().split('\n'),gs=lines.map(l=>JSON.parse(fs.readFileSync(P+'/groups/'+l.split('\t').at(-1)+'.json'))),ms=gs.flatMap(g=>g.matches);
  if(gs.length!==20||ms.length!==100||ms.some(m=>m.status!=='finished'||m.errorCode||m.sides.find(s=>s.teamId===U)?.version!==V||m.sides.find(s=>s.teamId===U)?.botError))throw Error('completion verification failed');
  const out={groups:20,matches:100,version:V,wins:ms.filter(m=>m.sides.find(s=>s.teamId===U)?.result==='win').length,errors:0};fs.writeFileSync(P+'/completion.json',JSON.stringify(out));console.log('VERIFIED',JSON.stringify(out));
  refresh();fs.rmSync(ROOT+'/.platform_lock',{recursive:true});fs.writeFileSync(D+'/recovery_lock_released.json',JSON.stringify({at:new Date().toISOString(),reason:'candidate100 finished; latest user instruction is to select best after analysis'}));console.log('LOCK RELEASED; candidate remains provisionally active pending comparison');process.exit(0);
 }
 await sleep(5000);
}
throw Error('candidate build timeout');
