import fs from 'node:fs';import path from 'node:path';import {api,get,sleep,US} from './http.mjs';
const dir=import.meta.dirname,root=path.resolve(dir,'../..'),plan=JSON.parse(fs.readFileSync(dir+'/plan.json')),lock=root+'/.platform_lock',owner='claude_v62s_c100';
const log=(...a)=>{const s=new Date().toISOString()+' '+a.join(' ');console.log(s);fs.appendFileSync(dir+'/run.log',s+'\n');};
const save=(name,v)=>{fs.writeFileSync(dir+'/'+name+'.tmp',JSON.stringify(v,null,2));fs.renameSync(dir+'/'+name+'.tmp',dir+'/'+name);};
// Remaining challenges use the opponent's exact bot from v62's group for the same plan entry (CLI 4.0.0 sourceGroupId).
const SRC=Object.fromEntries(JSON.parse(fs.readFileSync(dir+'/../v62_c100_2026-10-27/receipts.json')).map(r=>[r.label,r.groupId]));
const receipts=fs.existsSync(dir+'/receipts.json')?JSON.parse(fs.readFileSync(dir+'/receipts.json')):[];
const journal=fs.existsSync(dir+'/journal.json')?JSON.parse(fs.readFileSync(dir+'/journal.json')):[];
if(journal.some(x=>x.state==='pending'))throw Error('Unresolved POST intent; reconcile activity before resuming');
try{fs.mkdirSync(lock);}catch(e){if(e.code!=='EEXIST')throw e;const old=JSON.parse(fs.readFileSync(lock+'/owner'));if(old.owner!==owner&&Date.now()-old.at<25*60*1000)throw Error('Live platform lock '+old.owner);log('Replacing stale lock',JSON.stringify(old));}
const beat=()=>{const old=fs.existsSync(lock+'/owner')?JSON.parse(fs.readFileSync(lock+'/owner')):null;if(old&&old.owner!==owner&&Date.now()-old.at<25*60*1000)throw Error('Lock replaced by '+old.owner);fs.writeFileSync(lock+'/owner',JSON.stringify({owner,at:Date.now(),version:plan.version}));};
beat();const timer=setInterval(beat,30000);
let success=false;
try{
for(const s of plan.specs){if(receipts.some(r=>r.label===s.label))continue;
 let lastLog=0;
 for(;;){beat();const q=await get('/challenges');if(q.quota.used<q.quota.limit)break;if(Date.now()-lastLog>60000){log('Quota wait',JSON.stringify(q.quota),'accepted',receipts.length);lastLog=Date.now();}const delay=Date.parse(q.quota.resetsAt)-Date.now()+1500;await sleep(Math.max(2000,Math.min(Number.isFinite(delay)?delay:60000,60000)));}
 // User (27 Oct): keep our version live for the whole run - re-activate it if someone switched the bot, then send.
 const active=(await get('/submissions')).active;if(active?.id!==plan.submissionId){log('Active bot was v'+active?.version+': re-activating v'+plan.version);await api('PUT','/submissions/active',{submissionId:plan.submissionId});await sleep(3000);const now=(await get('/submissions')).active;if(now?.id!==plan.submissionId)throw Error('Re-activation failed (active v'+now?.version+')');}
 const byName=Object.fromEntries((await get('/challenges')).maps.map(m=>[m.name,m.id]));
 const body={teamId:s.teamId,sides:s.sides,mapIds:s.maps.map(n=>byName[n])};if(SRC[s.label])body.sourceGroupId=SRC[s.label];if(body.mapIds.some(x=>!x))throw Error('Map missing');
 const intent={label:s.label,at:new Date().toISOString(),state:'pending',body};journal.push(intent);save('journal.json',journal);
 let r;try{r=await api('POST','/challenges',body);}catch(e){intent.error=e.message;if([400,403,409,429].includes(e.status)){intent.state='rejected';save('journal.json',journal);}else save('journal.json',journal);throw e;}
 if(!r.groupId)throw Error('POST missing groupId; reconcile pending intent');
 intent.state='accepted';intent.groupId=r.groupId;save('journal.json',journal);
 receipts.push({...s,groupId:r.groupId,acceptedAt:new Date().toISOString()});save('receipts.json',receipts);
 fs.appendFileSync(dir+'/challenges.txt',`${s.label}\t${s.maps.join(',')}\t${s.sides.join(',')}\t${r.groupId}\n`);
 log('Accepted',receipts.length+'/'+plan.specs.length,s.label,s.opponent,r.groupId);await sleep(300);
}
if(receipts.length!==plan.specs.length||new Set(receipts.map(r=>r.groupId)).size!==plan.specs.length)throw Error('Wrong challenge count');
for(;;){const states={};for(let i=0;i<receipts.length;i+=10){await Promise.all(receipts.slice(i,i+10).map(async r=>{const d=await get('/match-groups/'+r.groupId);fs.mkdirSync(dir+'/groups',{recursive:true});save('groups/'+r.groupId+'.json',d);const me=d.group.sides.find(s=>s.teamId===US);if(me.version!==plan.version)throw Error('Group wrong version '+r.groupId);states[d.group.status]=(states[d.group.status]||0)+1;}));}log('Completion',JSON.stringify(states));save('completion.json',{at:new Date().toISOString(),states});if((states.finished||0)+(states.error||0)+(states.cancelled||0)===plan.specs.length)break;await sleep(30000);}
save('sender_done.json',{at:new Date().toISOString(),version:plan.version,count:plan.specs.length});success=true;
}catch(e){log('STOP',e.stack);save('sender_error.json',{at:new Date().toISOString(),error:e.stack});process.exitCode=1;}
finally{clearInterval(timer);const held=JSON.parse(fs.readFileSync(lock+'/owner'));if(held.owner===owner){if(success)fs.rmSync(lock,{recursive:true});else fs.writeFileSync(lock+'/owner',JSON.stringify({...held,at:0,stopped:true}));}}
