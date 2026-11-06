import fs from 'node:fs';import crypto from 'node:crypto';
import {BASE} from '../v57_eval_2026-10-23/http.mjs';import {cookieHeader} from '../../tools/bclib.mjs';
const dir=import.meta.dirname+'/docs_check';fs.mkdirSync(dir,{recursive:true});
const jar=new Map(cookieHeader().split('; ').filter(Boolean).map(c=>{const i=c.indexOf('=');return [c.slice(0,i),c.slice(i+1)];}));
const hdr=()=>({cookie:[...jar].map(([k,v])=>k+'='+v).join('; ')});
const a=await fetch(BASE+'/api/v1/game/access',{headers:hdr(),redirect:'manual',signal:AbortSignal.timeout(30000)});if(!a.ok)throw Error('access '+a.status);
for(const c of a.headers.getSetCookie()){const p=c.split(';')[0],i=p.indexOf('=');jar.set(p.slice(0,i),p.slice(i+1));}
const checks=[];for(const p of ['/api/v1/patch-notes','/service/assets/ChampionGrid-Cidqkhuk.js','/service/assets/docs-CraIq4_w.js']){const r=await fetch(BASE+p,{headers:hdr(),signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(p+' '+r.status);const b=Buffer.from(await r.arrayBuffer()),name=p.slice(1).replaceAll('/','_'),prior=import.meta.dirname+'/../prism_rank1_2026-10-23/docs_check/'+name;fs.writeFileSync(dir+'/'+name,b);checks.push({url:BASE+p,sha256:crypto.createHash('sha256').update(b).digest('hex'),sameAsPrior:Buffer.compare(b,fs.readFileSync(prior))===0});}
fs.copyFileSync(import.meta.dirname+'/../../docs/official/GameRules.md',dir+'/GameRules.md');
fs.writeFileSync(dir+'/verification.json',JSON.stringify({at:new Date().toISOString(),checks},null,2));console.log(checks);
