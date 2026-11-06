import fs from 'node:fs';import {spawn} from 'node:child_process';import {api,ROOT} from '../../tools/bclib.mjs';
const D=ROOT+'/analysis/current_improve_2026-10-30',P=D+'/paired_duo/control',ID='b86f3c88-dbff-4e8a-8c5b-a901cd3e44d9',U='6b04505b-d16c-4196-b7c6-53a4688a32ca',OWNER='codex-v125-duo-20261030';
const s=await api('GET','/submissions');if(s.active?.id!==ID||s.selected?.id!==ID)throw Error('active125 changed before control');
const selected=await api('PUT','/submissions/active',{submissionId:ID});if(selected.active?.id!==ID||!selected.pinned)throw Error('control activation failed');
await new Promise((resolve,reject)=>{const p=spawn(process.execPath,[D+'/send_arm.mjs',P,ID,'125'],{cwd:ROOT,stdio:'inherit'});p.on('exit',c=>c===0?resolve():reject(Error('sender exit '+c)));p.on('error',reject)});
const ledger=fs.readFileSync(P+'/challenges.txt','utf8').trim().split('\n');const gs=ledger.map(l=>JSON.parse(fs.readFileSync(P+'/groups/'+l.split('\t').at(-1)+'.json'))),ms=gs.flatMap(g=>g.matches);
if(gs.length!==20||ms.length!==100||ms.some(m=>m.status!=='finished'||m.errorCode||m.sides.find(s=>s.teamId===U)?.version!==125||m.sides.find(s=>s.teamId===U)?.botError))throw Error('completion verification failed');
const completion={groups:20,matches:100,version:125,wins:ms.filter(m=>m.sides.find(s=>s.teamId===U)?.result==='win').length,errors:0};fs.writeFileSync(P+'/completion.json',JSON.stringify(completion));console.log('VERIFIED',JSON.stringify(completion));
if(JSON.parse(fs.readFileSync(ROOT+'/.platform_lock/owner')).owner!==OWNER)throw Error('lock lost');fs.rmSync(ROOT+'/.platform_lock',{recursive:true});console.log('Control unranked100 done; LOCK RELEASED');
