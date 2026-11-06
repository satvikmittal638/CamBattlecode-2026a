import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {get,api,US} from '../v57_eval_2026-10-23/http.mjs';
const dir=import.meta.dirname,root=path.resolve(dir,'../..'),FISH='1890540d-1ffc-4847-adbf-d0d08772f268';
const save=(n,d)=>{fs.mkdirSync(path.dirname(dir+'/'+n),{recursive:true});fs.writeFileSync(dir+'/'+n,JSON.stringify(d,null,2));};
const s=await get('/submissions'),base=s.submissions.find(x=>x.version===62);if(!base)throw Error('v62 missing');
if(s.active?.id!==base.id){save('rollback_intent.json',{at:new Date().toISOString(),previous:s.active,target:base});save('rollback_response.json',await api('PUT','/submissions/active',{submissionId:base.id}));}
save('baseline_submission.json',base);save('rollback_state.json',await get('/submissions'));
const f=await get('/submissions/'+base.id+'/files'),hashes=[];let c=0;
await Promise.all(Array.from({length:4},async()=>{for(;;){const x=f.files[c++];if(!x)return;const r=await get('/submissions/'+base.id+'/file?path='+encodeURIComponent(x.path)),dest=path.resolve(dir+'/v62_source',x.path);if(!dest.startsWith(dir+'/v62_source/'))throw Error('bad source path');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,r.text);hashes.push({path:x.path,sha256:crypto.createHash('sha256').update(r.text).digest('hex')});}}));save('v62_source/hashes.json',hashes);
for(const [n,p]of [['fish_ranked','/match-groups?scope=all&team='+FISH+'&kind=ranked'],['fish_unranked','/match-groups?scope=all&team='+FISH+'&kind=unranked'],['our_recent','/match-groups?scope=all&team='+US]])save(n+'.json',await get(p));
console.log('V62 downloaded',hashes.length,'active',s.active?.version,'Fish histories saved');
