import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {get} from '../v57_eval_2026-10-23/http.mjs';
const dir=import.meta.dirname,root=path.resolve(dir,'../..');
for(const label of process.argv.slice(2)){
 const out=dir+'/trials/'+label,s=JSON.parse(fs.readFileSync(out+'/submission.json')),bot=JSON.parse(fs.readFileSync(out+'/upload_intent.json')).bot,local=root+'/workspace/bots/'+bot+'/src',d=await get('/submissions/'+s.id+'/files');let next=0;const rows=[];
 await Promise.all(Array.from({length:4},async()=>{for(;;){const f=d.files[next++];if(!f)return;const r=await get('/submissions/'+s.id+'/file?path='+encodeURIComponent(f.path)),rel=f.path.replace(/^src\//,'');if(r.text!==fs.readFileSync(local+'/'+rel,'utf8'))throw Error('Source mismatch '+f.path);const dest=path.resolve(out+'/submitted_source',f.path);if(!dest.startsWith(out+'/submitted_source/'))throw Error('Invalid path');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,r.text);rows.push({path:f.path,sha256:crypto.createHash('sha256').update(r.text).digest('hex')});}}));
 fs.writeFileSync(out+'/source_verification.json',JSON.stringify({at:new Date().toISOString(),id:s.id,version:s.version,bot,files:rows.length,allMatch:true,rows},null,2));console.log('VERIFIED',label,s.version,rows.length);
}
