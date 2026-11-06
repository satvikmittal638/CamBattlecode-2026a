// Keep the user's prioritized frozen experiment active until its games finish.
// Other uploads remain intact. Read the shared lock before changing selection.
import fs from 'node:fs';import path from 'node:path';import {get,api,sleep} from './http.mjs';
const dir=import.meta.dirname,plan=JSON.parse(fs.readFileSync(dir+'/plan.json')),lock=path.resolve(dir,'../../.platform_lock/owner'),owner='codex_v'+plan.version+'_100eval';
const log=s=>fs.appendFileSync(dir+'/activation_guard.log',new Date().toISOString()+' '+s+'\n');
for(;;){
 if(fs.existsSync(dir+'/sender_done.json')){log('All evaluation groups finished; guard stopped.');break;}
 if(!fs.existsSync(lock)||JSON.parse(fs.readFileSync(lock)).owner!==owner){log('Evaluation no longer owns the lock; guard stopped.');break;}
 try{
  const active=(await get('/submissions')).active;
  if(active?.id!==plan.submissionId){log('Restoring prioritized experiment after version '+active?.version);await api('PUT','/submissions/active',{submissionId:plan.submissionId});}
 }catch(e){log(e.message);}
 await sleep(20000);
}
