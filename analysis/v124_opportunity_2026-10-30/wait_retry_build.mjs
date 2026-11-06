import fs from 'node:fs';import {api,sleep,ROOT} from '../../tools/bclib.mjs';
const D='analysis/v124_opportunity_2026-10-30',id='5e972af6-7b50-4071-8eb2-03349eda8f60',owner='codex-v124-scan-20261030';let last;
for(let i=0;i<240;i++){
 const lock=JSON.parse(fs.readFileSync(ROOT+'/.platform_lock/owner'));if(lock.owner!==owner)throw Error('lock lost');fs.writeFileSync(ROOT+'/.platform_lock/owner',JSON.stringify({owner,at:Date.now()}));
 const s=await api('GET','/submissions');const sub=s.submissions.find(x=>x.id===id);fs.writeFileSync(D+'/retry_build_state.json',JSON.stringify({at:new Date().toISOString(),sub,active:s.active,pinned:s.pinned},null,2));
 if(sub?.status!==last){console.log(new Date().toISOString(),sub?.status);last=sub?.status;}
 if(sub&&!['queued','building','pending','compiling'].includes(sub.status)){console.log('BUILD_FINISHED',sub.status);break;}
 await sleep(5000);
}
