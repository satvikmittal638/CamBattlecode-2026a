import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {api} from './platform_api.mjs';
const [version,out]=process.argv.slice(2),s=await api('GET','/submissions'),sub=s.submissions.find(x=>x.version===+version);
if(!sub)throw Error('Submission not in recent list: '+version);
const {files}=await api('GET',`/submissions/${sub.id}/files`),manifest=[];
for(const f of files){
 if(f.path.includes('..')||path.isAbsolute(f.path))throw Error('Invalid source path');
 const r=await api('GET',`/submissions/${sub.id}/file?path=${encodeURIComponent(f.path)}`),p=path.join(out,f.path);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,r.text??'');manifest.push({path:f.path,sha256:crypto.createHash('sha256').update(r.text??'').digest('hex')});
}
fs.writeFileSync(path.join(out,'submission.json'),JSON.stringify(sub,null,2));fs.writeFileSync(path.join(out,'source_manifest.json'),JSON.stringify(manifest,null,2));console.log('v'+version,files.length,'source files archived');
