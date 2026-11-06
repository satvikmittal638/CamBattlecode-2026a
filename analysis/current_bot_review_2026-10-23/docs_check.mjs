// Read-only website access. Uses HTTP GET only; no browser or automatic login.
import fs from 'node:fs';
import path from 'node:path';
import {cookieHeader,BASE} from '../../tools/bclib.mjs';
const output=path.join(import.meta.dirname,'docs_check');fs.mkdirSync(output,{recursive:true});
const jar=new Map(cookieHeader().split('; ').filter(Boolean).map(c=>{const i=c.indexOf('=');return [c.slice(0,i),c.slice(i+1)];}));
// This is the site's normal documented frontend access check. Keep returned
// asset-access cookies in memory only; never run the browser login helper.
const access=await fetch(BASE+'/api/v1/game/access',{headers:{cookie:[...jar].map(([k,v])=>k+'='+v).join('; ')},redirect:'manual',signal:AbortSignal.timeout(30000)});
if(!access.ok)throw new Error('Normal game access check returned '+access.status);
for(const c of access.headers.getSetCookie()){const p=c.split(';')[0],i=p.indexOf('=');jar.set(p.slice(0,i),p.slice(i+1));}
for(const pathname of process.argv.slice(2)){
 if(!pathname.startsWith('/')||pathname.startsWith('//'))throw new Error('Expected same-origin path');
 const r=await fetch(BASE+pathname,{headers:{cookie:[...jar].map(([k,v])=>k+'='+v).join('; '),referer:BASE+'/game/docs/agents',accept:'*/*'},signal:AbortSignal.timeout(30000),redirect:'follow'});
 const bytes=Buffer.from(await r.arrayBuffer());const name=pathname.split('/').filter(Boolean).join('_').replace(/[^A-Za-z0-9_.-]/g,'_');
 fs.writeFileSync(path.join(output,name),bytes);
 console.log(JSON.stringify({path:pathname,status:r.status,bytes:bytes.length,type:r.headers.get('content-type'),file:name}));
}
