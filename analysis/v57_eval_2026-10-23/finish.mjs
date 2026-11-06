// Finish deterministic audits after both quota windows and all downloads.
import fs from 'node:fs';import {spawnSync} from 'node:child_process';import {get} from './http.mjs';
const dir=import.meta.dirname,sleep=ms=>new Promise(r=>setTimeout(r,ms)),read=n=>JSON.parse(fs.readFileSync(dir+'/'+n+'.json'));
function run(command,args){const r=spawnSync(command,args,{cwd:dir,encoding:'utf8',maxBuffer:1<<27});fs.appendFileSync(dir+'/finish.log',new Date().toISOString()+' '+command+' '+args.join(' ')+'\n'+(r.stdout||'')+(r.stderr||''));if(r.status!==0)throw Error(command+' '+args+' exited '+r.status);}
try{
 for(;;){
  let ready=false,status={};
  try{const m=read('metrics'),s=read('official_stats_status');status={decoded:m.rows.length,official:s.games};ready=m.rows.length===500&&!m.fail.length&&!m.exits&&s.games===500&&fs.existsSync(dir+'/sender_done.json');}catch{}
  fs.writeFileSync(dir+'/finish_status.json',JSON.stringify({at:new Date().toISOString(),...status,ready}));
  if(ready)break;await sleep(45000);
 }
 for(const f of ['platform_results','summarize','patterns','build_patterns','capture_patterns','audit_official'])run('node',[f+'.mjs']);
 run('python3',['log_audit.py']);run('node',['verify_complete.mjs']);
 run('node',['../v55_improvement_2026-10-23/audit_mechanics.mjs',dir]);
 const submissions=await get('/submissions'),q=await get('/challenges');
 fs.writeFileSync(dir+'/final_platform_snapshot.json',JSON.stringify({at:new Date().toISOString(),active:submissions.active,rank:q.requesterRank,evaluatedVersion:read('plan').version,evaluatedSubmissionId:read('plan').submissionId},null,2));
 run('python3',['make_report.py']);run('python3',['plot_results.py']);
 fs.writeFileSync(dir+'/FINISHED.json',JSON.stringify({at:new Date().toISOString(),version:read('plan').version,verified:true,challenges:100,games:500,report:'REPORT.md'},null,2));
 console.log('ALL 100 CHALLENGES / 500 GAMES VERIFIED; FINAL REPORT CREATED');
}catch(e){fs.writeFileSync(dir+'/finish_error.json',JSON.stringify({at:new Date().toISOString(),error:e.stack},null,2));throw e;}
