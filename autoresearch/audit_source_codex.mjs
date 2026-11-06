import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {api} from './platform_api.mjs';
const [v,bot,explicitId]=process.argv.slice(2),s=await api('GET','/submissions'),sub=s.submissions.find(x=>x.version===+v)??(explicitId?{id:explicitId,version:+v}:null);
if(!sub)throw Error('No submission '+v);
const dir='autoresearch/sources/v'+v,{files}=await api('GET',`/submissions/${sub.id}/files`),result=[];
for(const f of files){
 if(f.path.includes('..')||path.isAbsolute(f.path))throw Error('Invalid source path');
 const r=await api('GET',`/submissions/${sub.id}/file?path=${encodeURIComponent(f.path)}`),p=path.join(dir,f.path),own=path.join('workspace/bots',bot,f.path);
 fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,r.text??'');
 result.push({path:f.path,match:fs.existsSync(own)&&fs.readFileSync(own).equals(Buffer.from(r.text??'')),sha256:crypto.createHash('sha256').update(r.text??'').digest('hex')});
}
fs.writeFileSync(dir+'/source_audit.json',JSON.stringify(result,null,2));fs.writeFileSync(dir+'/submission.json',JSON.stringify(sub,null,2));
console.log(JSON.stringify({version:+v,files:result.length,mismatches:result.filter(x=>!x.match)}));
if(result.some(x=>!x.match))process.exitCode=1;
