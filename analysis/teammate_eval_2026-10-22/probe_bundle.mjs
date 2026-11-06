import fs from 'node:fs';import {cookieHeader,BASE} from '../../tools/bclib.mjs';
const dir=import.meta.dirname,idx=JSON.parse(fs.readFileSync(dir+'/games/index.json')),all=JSON.parse(fs.readFileSync(dir+'/platform_results.json')).games,have=new Set(idx.map(g=>g.matchId)),g=all.find(g=>!have.has(g.matchId));
if(!g){console.log('All bundles collected');process.exit(0);}
const r=await fetch(BASE+'/api/v1/matches/'+g.matchId+'/bundle',{headers:{cookie:cookieHeader(),accept:'application/json'},redirect:'manual',signal:AbortSignal.timeout(20000)});let body={};if((r.headers.get('content-type')||'').includes('json')){const d=await r.json();body={status:d.status,error:d.error,retryAfter:d.retryAfter,hasUrl:!!d.url};}
console.log(JSON.stringify({matchId:g.matchId,status:r.status,contentType:r.headers.get('content-type'),retryAfter:r.headers.get('retry-after'),hasRedirect:r.headers.has('location'),body}));
