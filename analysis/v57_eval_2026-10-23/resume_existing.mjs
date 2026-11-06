// Resume build/source verification of the accepted upload. Never uploads again.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {get,api,sleep} from './http.mjs';
const dir=import.meta.dirname,root=path.resolve(dir,'../..'),lock=root+'/.platform_lock',candidate=JSON.parse(fs.readFileSync(dir+'/candidate.json')),submission=JSON.parse(fs.readFileSync(dir+'/submission.json'));
if(fs.existsSync(dir+'/submission_result.json')){console.log('Already verified; no action');process.exit(0);}
const tested=JSON.parse(fs.readFileSync(root+'/analysis/v56_improvement_2026-10-23/final_current/results.json'));
for(const [f,h]of Object.entries(tested.exactSources[candidate.bot].hash))if(crypto.createHash('sha256').update(fs.readFileSync(root+'/workspace/bots/'+candidate.bot+'/src/'+f)).digest('hex')!==h)throw Error('Candidate changed after validation');
if(fs.existsSync(lock+'/owner')){const old=JSON.parse(fs.readFileSync(lock+'/owner'));if(!old.stopped&&Date.now()-old.at<25*60*1000)throw Error('A live owner still holds the lock: '+old.owner);}
fs.mkdirSync(lock,{recursive:true});let owner='codex_majorfix_resume';const beat=()=>fs.writeFileSync(lock+'/owner',JSON.stringify({owner,at:Date.now(),version:submission.version}));beat();const timer=setInterval(beat,30000);
try{
 let target,logged=0;
 for(let i=0;i<90;i++){
  const listing=await get('/submissions');target=listing.submissions.find(s=>s.id===submission.id);if(!target)throw Error('Accepted upload missing');
  fs.writeFileSync(dir+'/submission.json',JSON.stringify(target,null,2));
  if(Date.now()-logged>60000){console.log(new Date().toISOString(),'Existing upload',target.version,target.status);logged=Date.now();}
  if(['active','inactive','ready','compiled'].includes(target.status))break;
  if(['error','failed','compile_error','build_failed'].includes(target.status))throw Error('Platform build failed');
  await sleep(10000);
 }
 if(!target||!['active','inactive','ready','compiled'].includes(target.status))throw Error('Existing upload still waiting on platform build queue');
 const {files}=await get('/submissions/'+target.id+'/files'),hashes=[];
 if(files.length!==Object.keys(tested.exactSources[candidate.bot].hash).length)throw Error('Uploaded file count mismatch');
 for(let i=0;i<files.length;i+=5)await Promise.all(files.slice(i,i+5).map(async f=>{
  const d=await get('/submissions/'+target.id+'/file?path='+encodeURIComponent(f.path)),dest=path.resolve(dir+'/source',f.path),local=path.resolve(root+'/workspace/bots/'+candidate.bot,f.path);
  if(!dest.startsWith(dir+'/source/'))throw Error('Unsafe file path');if(fs.readFileSync(local,'utf8')!==d.text)throw Error('Uploaded source mismatch');
  fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,d.text);hashes.push({path:f.path,sha256:crypto.createHash('sha256').update(d.text).digest('hex'),matchesSubmittedSource:true});
 }));
 fs.writeFileSync(dir+'/source_hashes.json',JSON.stringify(hashes,null,2));
 const current=(await get('/submissions')).active;
 if(current?.id!==target.id){fs.writeFileSync(dir+'/activation_previous.json',JSON.stringify(current,null,2));await api('PUT','/submissions/active',{submissionId:target.id});}
 if((await get('/submissions')).active?.id!==target.id)throw Error('Activation failed');
 fs.writeFileSync(dir+'/plan.json',JSON.stringify({version:target.version,submissionId:target.id}));
 fs.writeFileSync(dir+'/submission_result.json',JSON.stringify({at:new Date().toISOString(),version:target.version,submissionId:target.id,files:hashes.length,sourceVerified:true,active:true},null,2));
 const intent=JSON.parse(fs.readFileSync(dir+'/submission_intent.json'));fs.writeFileSync(dir+'/submission_intent.json',JSON.stringify({...intent,state:'accepted',submissionId:target.id},null,2));
 owner='codex_v'+target.version+'_100eval';beat();console.log('VERIFIED EXISTING UPLOAD',target.version,target.id,hashes.length,'files');
}catch(e){fs.writeFileSync(dir+'/resume_error.json',JSON.stringify({at:new Date().toISOString(),error:e.stack},null,2));fs.writeFileSync(lock+'/owner',JSON.stringify({owner,at:0,stopped:true}));throw e;}finally{clearInterval(timer);}
