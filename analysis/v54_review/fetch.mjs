// Download existing team submissions through GET requests only. No browser,
// automatic login, upload, activation, or match creation.
import fs from 'node:fs';import path from 'node:path';
import {cookieHeader,BASE} from '../../tools/bclib.mjs';
const root=import.meta.dirname;
async function get(p){const r=await fetch(BASE+'/api/v1'+p,{method:'GET',headers:{cookie:cookieHeader(),accept:'application/json',referer:BASE+'/game/submissions'},redirect:'manual',signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('GET '+p+' returned '+r.status+'; automatic login is disabled');return r.json();}
const listing=await get('/submissions');fs.writeFileSync(root+'/submissions.json',JSON.stringify(listing,null,2));
console.log('Active version:',listing.active?.version??null);
for(const version of [53,54]){const s=listing.submissions.find(x=>x.version===version);if(!s)throw Error('Version not found: '+version);const dir=path.join(root,'v'+version);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/submission.json',JSON.stringify(s,null,2));const {files}=await get('/submissions/'+s.id+'/files');fs.writeFileSync(dir+'/files.json',JSON.stringify(files,null,2));for(let start=0;start<files.length;start+=5){await Promise.all(files.slice(start,start+5).map(async f=>{const target=path.resolve(dir,f.path);if(!target.startsWith(dir+path.sep))throw Error('Unexpected source path');const r=await get('/submissions/'+s.id+'/file?path='+encodeURIComponent(f.path));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,r.text??'');}));}console.log('Downloaded version',version,'files',files.length);}
