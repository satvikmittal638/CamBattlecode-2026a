import fs from 'node:fs';import {spawn} from 'node:child_process';import {api,ROOT,sleep} from '../../tools/bclib.mjs';
const D=ROOT+'/analysis/current_improve_2026-10-30',P=D+'/paired_recovery/control',ID='9e074ec9-3d2f-4a72-aa23-25cea8b62d75',U='6b04505b-d16c-4196-b7c6-53a4688a32ca',OWNER='codex-v125-duo-20261030';
const initial=await api('GET','/submissions');fs.writeFileSync(D+'/paired_recovery/pre_control_state.json',JSON.stringify(initial));
let selected=await api('PUT','/submissions/active',{submissionId:ID});
for(let i=0;i<180 && selected.active?.id!==ID;i++){if(selected.selected?.id!==ID)throw Error('external selection change');await sleep(5000);selected=await api('GET','/submissions');}
if(selected.active?.id!==ID||!selected.pinned)throw Error('v128 activation failed');
await new Promise((resolve,reject)=>{const p=spawn(process.execPath,[D+'/send_arm.mjs',P,ID,'128'],{cwd:ROOT,stdio:'inherit'});p.on('exit',c=>c===0?resolve():reject(Error('sender exit '+c)));p.on('error',reject)});
const ledger=fs.readFileSync(P+'/challenges.txt','utf8').trim().split('\n');const gs=ledger.map(l=>JSON.parse(fs.readFileSync(P+'/groups/'+l.split('\t').at(-1)+'.json'))),ms=gs.flatMap(g=>g.matches);
if(gs.length!==20||ms.length!==100||ms.some(m=>m.status!=='finished'||m.errorCode||m.sides.find(s=>s.teamId===U)?.version!==128||m.sides.find(s=>s.teamId===U)?.botError))throw Error('completion verification failed');
const completion={groups:20,matches:100,version:128,wins:ms.filter(m=>m.sides.find(s=>s.teamId===U)?.result==='win').length,errors:0};fs.writeFileSync(P+'/completion.json',JSON.stringify(completion));console.log('VERIFIED',JSON.stringify(completion));
if(JSON.parse(fs.readFileSync(ROOT+'/.platform_lock/owner')).owner!==OWNER)throw Error('lock lost');fs.rmSync(ROOT+'/.platform_lock',{recursive:true});console.log('Control unranked100 done; LOCK RELEASED');
