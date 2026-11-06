// Exact-count sender: one POST per intent, saved receipt, no automatic POST retries.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {api,BASE,ROOT,cookieHeader,sleep} from '../../tools/bclib.mjs';
const [outDir,submissionId,versionRaw]=process.argv.slice(2),version=Number(versionRaw);
const DIR=path.resolve(outDir),OWNER='codex-v124-scan-20261030';
if(!submissionId||!version)throw Error('submission ID and version required');
const specs=JSON.parse(fs.readFileSync(path.join(DIR,'specs.json')));
if(specs.length!==20||new Set(specs.map(s=>s.teamId)).size!==20||specs.some(s=>s.maps.length!==5||s.sides.length!==5))throw Error('bad exact-count plan');
const lock=path.join(ROOT,'.platform_lock','owner');
function refresh(){const l=JSON.parse(fs.readFileSync(lock));if(l.owner!==OWNER)throw Error('lock lost');fs.writeFileSync(lock,JSON.stringify({owner:OWNER,at:Date.now()}));}
const timer=setInterval(refresh,60000);
try{
 refresh();const opts=await api('GET','/challenges');const maps=Object.fromEntries(opts.maps.map(m=>[m.name,m.id]));
 fs.writeFileSync(path.join(DIR,'quota_at_send.json'),JSON.stringify(opts,null,2));
 for(let i=0;i<specs.length;i++){
  refresh();const s=specs[i],receipt=path.join(DIR,`receipt_${i}.json`),intent=path.join(DIR,`intent_${i}.json`);
  if(fs.existsSync(receipt))continue;
  if(fs.existsSync(intent))throw Error(`unresolved prior POST intent ${i}: reconcile before continuing`);
  const subs=await api('GET','/submissions');const active=typeof subs.active==='object'?subs.active.id:subs.active;
  if(active!==submissionId)throw Error('active submission changed');
  const body={teamId:s.teamId,sides:s.sides,mapIds:s.maps.map(n=>{if(!maps[n])throw Error('unknown '+n);return maps[n];})};
  fs.writeFileSync(intent,JSON.stringify({i,s,submissionId,version,body,at:new Date().toISOString()},null,2));
  const res=await fetch(BASE+'/api/v1/challenges',{method:'POST',headers:{cookie:cookieHeader(),accept:'application/json',origin:BASE,referer:BASE+'/game/matches','content-type':'application/json'},body:JSON.stringify(body),redirect:'manual',signal:AbortSignal.timeout(60000)});
  const raw=await res.text();let r;try{r=JSON.parse(raw)}catch{throw Error(`POST ${i}: HTTP ${res.status}; reconcile intent`)}
  fs.writeFileSync(receipt,JSON.stringify({status:res.status,result:r},null,2));
  if(!res.ok||!r.groupId)throw Error(`POST ${i}: HTTP ${res.status}: ${raw.slice(0,300)}`);
  const line=`${s.label}\t${s.maps.join(',')}\t${s.sides.join(',')}\t${r.groupId}`;
  fs.appendFileSync(path.join(DIR,'challenges.txt'),line+'\n');console.log(`${i+1}/20 ${line}`);
 }
 const lines=fs.readFileSync(path.join(DIR,'challenges.txt'),'utf8').trim().split('\n');
 if(lines.length!==20)throw Error('ledger count not 20');
 const pending=new Set(lines.map(l=>l.split('\t').at(-1)));
 fs.mkdirSync(path.join(DIR,'groups'),{recursive:true});
 while(pending.size){
  refresh();
  for(const id of [...pending]){
   const d=await api('GET',`/match-groups/${id}`);
   fs.writeFileSync(path.join(DIR,'groups',id+'.json'),JSON.stringify(d));
   if(['finished','error','cancelled'].includes(d.group.status)){
    pending.delete(id);const wrong=d.matches.flatMap(m=>m.sides||[]).filter(s=>s.teamId==='6b04505b-d16c-4196-b7c6-53a4688a32ca'&&s.version!==version);
    console.log(`completed ${20-pending.size}/20: ${id} ${d.group.status}, matches=${d.matches.length}, wrongVersion=${wrong.length}`);
    if(wrong.length)throw Error('unexpected bot version');
   }
  }
  if(pending.size)await sleep(15000);
 }
 console.log('EXACT20 groups complete; lock remains held for caller verification');
}finally{clearInterval(timer)}
