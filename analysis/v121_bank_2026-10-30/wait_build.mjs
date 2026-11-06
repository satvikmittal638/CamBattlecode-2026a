import fs from 'node:fs';import {api,sleep,ROOT} from '../../tools/bclib.mjs';
const D='analysis/v121_bank_2026-10-30',id='8b42ce5f-bd1c-40df-81f0-ad039e458881',owner='codex-v122-paired-20261030';let last;
for(let i=0;i<240;i++){
 const lock=JSON.parse(fs.readFileSync(ROOT+'/.platform_lock/owner'));if(lock.owner!==owner)throw Error('lock lost');fs.writeFileSync(ROOT+'/.platform_lock/owner',JSON.stringify({owner,at:Date.now()}));
 const s=await api('GET','/submissions');const sub=s.submissions.find(x=>x.id===id);fs.writeFileSync(D+'/build_state.json',JSON.stringify({at:new Date().toISOString(),sub,active:s.active,pinned:s.pinned},null,2));
 if(sub?.status!==last){console.log(new Date().toISOString(),sub?.status);last=sub?.status;}
 if(sub&&!['queued','building','pending','compiling'].includes(sub.status)){console.log('BUILD_FINISHED',sub.status);break;}
 await sleep(5000);
}
