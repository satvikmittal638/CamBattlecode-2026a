import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';
import {get,api,sleep,US} from '../v57_eval_2026-10-23/http.mjs';
const dir=import.meta.dirname,root=path.resolve(dir,'../..'),[label,bot]=process.argv.slice(2),FISH=JSON.parse(fs.readFileSync(import.meta.dirname+'/config.json')).targetId;if(!label)throw Error('trial label required');
const targetConfig=JSON.parse(fs.readFileSync(dir+'/config.json'));if(targetConfig.previousStage&&!JSON.parse(fs.readFileSync(path.resolve(dir,targetConfig.previousStage))).objectiveReached)throw Error('Previous opponent stage is not complete');
const out=dir+'/trials/'+label;if(fs.existsSync(out+'/abandoned.json'))throw Error('Abandoned experiment label; use its replacement');fs.mkdirSync(out+'/groups',{recursive:true});
const lock=root+'/.platform_lock',owner='mite_atlas_'+label;
try{fs.mkdirSync(lock);}catch(e){if(e.code!=='EEXIST')throw e;const old=JSON.parse(fs.readFileSync(lock+'/owner'));if(Date.now()-old.at<25*60000)throw Error('Platform lock held by '+old.owner);}
const beat=()=>fs.writeFileSync(lock+'/owner',JSON.stringify({owner,at:Date.now(),label}));beat();const lockTimer=setInterval(beat,30000);lockTimer.unref();
process.on('exit',()=>{clearInterval(lockTimer);if(fs.existsSync(lock+'/owner')&&JSON.parse(fs.readFileSync(lock+'/owner')).owner===owner)fs.rmSync(lock,{recursive:true});});
const save=(n,d)=>{fs.writeFileSync(out+'/'+n+'.tmp',JSON.stringify(d,null,2));fs.renameSync(out+'/'+n+'.tmp',out+'/'+n);},read=n=>JSON.parse(fs.readFileSync(out+'/'+n));
const log=(...s)=>console.log(new Date().toISOString(),label,...s);
let target;
if(fs.existsSync(out+'/submission.json'))target=read('submission.json');
else if(!bot){target=JSON.parse(fs.readFileSync(dir+'/baseline_submission.json'));save('submission.json',target);}
else{
 if(fs.existsSync(dir+'/selected.json'))save('reference_selection.json',JSON.parse(fs.readFileSync(dir+'/selected.json')));
 const before=await get('/submissions'),note='TARGET: '+targetConfig.targetName+' | '+label+' | 40-map / both-side overfit counter';save('before.json',before);
 if(fs.existsSync(out+'/upload_intent.json'))throw Error('Unreconciled upload intent; inspect before retrying');save('upload_intent.json',{at:new Date().toISOString(),bot,note});
 const exit=await new Promise((resolve,reject)=>{const c=spawn(root+'/.venv/bin/cambc',['submit',bot,'--note',note],{cwd:root+'/workspace',stdio:['ignore','pipe','pipe']});for(const k of ['stdout','stderr'])c[k].on('data',b=>{fs.appendFileSync(out+'/submit.log',b);process[k].write(b);});c.on('error',reject);c.on('close',resolve);});
 if(exit!==0)throw Error('Submission exit '+exit+'; reconcile upload');
 for(let n=0;n<240;n++){const s=await get('/submissions'),fresh=s.submissions.filter(s=>!before.submissions.some(b=>b.id===s.id)&&s.note===note);if(fresh.length>1)throw Error('Ambiguous upload');if(fresh[0]){target=fresh[0];save('submission.json',target);break;}await sleep(5000);}if(!target)throw Error('Upload not found');
}
let requested=false;
for(let n=0;;n++){
 const s=await get('/submissions'),t=s.submissions.find(x=>x.id===target.id);save('active_check.json',s);
 if(s.active?.id===target.id&&t.status==='active')break;
 if(['error','failed','build_failed','compile_error','cancelled'].includes(t.status))throw Error('Build failed: '+JSON.stringify(t));
 if(!requested&&!['queued','building','compiling','pending'].includes(t.status)){save('activation.json',await api('PUT','/submissions/active',{submissionId:target.id}));requested=true;}
 if(n>240)throw Error('Build/activation pending');if(n%6===0)log('Waiting for v'+target.version,t.status,'active',s.active?.version);await sleep(5000);
}
log('Active v'+target.version,target.id);
const defaultMaps=[['00lanes','00corners','00monolith','00fragment','01broken_curve'],['00elkring','00gem_fields','00rows','01concentrated_wealth','01hooks'],['00contest','01boss_battle','00stampede','00eight','01gold_rush']];
const planFile=process.argv[4];const customPlan=planFile?JSON.parse(fs.readFileSync(planFile)):null;const maps=customPlan?customPlan.map(p=>p.maps):defaultMaps;
let receipts=fs.existsSync(out+'/receipts.json')?read('receipts.json'):[];
for(let i=0;i<maps.length;i++){
 if(receipts.some(r=>r.i===i))continue;
 const intentFile=out+'/challenge_'+i+'_intent.json';if(fs.existsSync(intentFile))throw Error('Unreconciled challenge intent '+i);
 let q;for(;;){q=await get('/challenges');save('quota.json',q);if(q.quota.used<q.quota.limit)break;log('Waiting for challenge quota',q.quota.used+'/'+q.quota.limit,'reset',q.quota.resetsAt);await sleep(Math.min(30000,Math.max(3000,(Date.parse(q.quota.resetsAt)||Date.now()+30000)-Date.now()+500)));}if(!q.ready)throw Error('Challenges unavailable despite remaining quota');if((await get('/submissions')).active?.id!==target.id)throw Error('Active bot changed');
 const byName=Object.fromEntries(q.maps.map(m=>[m.name,m.id])),body={teamId:FISH,mapIds:maps[i].map(n=>byName[n]),sides:customPlan?customPlan[i].sides:maps[i].map((_,j)=>(i+j)%2?'b':'a')};if(body.mapIds.some(x=>!x))throw Error('Missing map');
 save('challenge_'+i+'_intent.json',{at:new Date().toISOString(),body,state:'pending'});
 const r=await api('POST','/challenges',body);if(!r.groupId)throw Error('No challenge ID');save('challenge_'+i+'_intent.json',{at:new Date().toISOString(),body,state:'accepted',response:r});receipts.push({i,maps:maps[i],sides:body.sides,groupId:r.groupId,submissionId:target.id,version:target.version});save('receipts.json',receipts);log('Challenge accepted',i+1,r.groupId);
}
for(let n=0;;n++){
 let done=0;for(const r of receipts){const d=await get('/match-groups/'+r.groupId);save('groups/'+r.groupId+'.json',d);const side=d.group.sides.find(s=>s.teamId===US);if(side.submissionId!==target.id||side.version!==target.version)throw Error('Wrong submission bound');if(d.group.status==='finished')done++;if(['error','cancelled'].includes(d.group.status))throw Error('Group failed');}
 if(done===receipts.length)break;if(n%4===0)log('Finished',done,'/',receipts.length);if(n>240)throw Error('Matches pending');await sleep(10000);
}
const rows=[];for(const r of receipts){const d=read('groups/'+r.groupId+'.json');for(const m of d.matches){const s=m.sides.find(x=>x.teamId===US),o=m.sides.find(x=>x.teamId!==US);if(m.status!=='finished')throw Error('Unfinished match');rows.push({matchId:m.id,groupId:r.groupId,createdAt:m.createdAt,map:m.map,side:s.side,result:s.result,score:s.score,oppScore:o.score,myDraft:s.draft,oppDraft:o.draft,opponent:o.teamName,opponentId:o.teamId,rounds:m.rounds,kind:d.group.kind,patchId:m.patchId,version:s.version,submissionId:s.submissionId,file:m.map+'/'+m.id+'.repl26a'});}}
save('matches.json',rows);const result={at:new Date().toISOString(),label,bot,target:{id:target.id,version:target.version},games:rows.length,wins:rows.filter(r=>r.result==='win').length,sets:receipts.map(r=>({id:r.groupId,wins:rows.filter(x=>x.groupId===r.groupId&&x.result==='win').length})),meanMargin:rows.reduce((s,r)=>s+r.score-r.oppScore,0)/rows.length,rows};save('result.json',result);log('RESULT',JSON.stringify({wins:result.wins,games:result.games,sets:result.sets,meanMargin:result.meanMargin}));
