import {cookieHeader,BASE} from '../../tools/bclib.mjs';
export {BASE};
export const US='6b04505b-d16c-4196-b7c6-53a4688a32ca';
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function api(method,p,body){
 const r=await fetch(BASE+'/api/v1'+p,{method,headers:{cookie:cookieHeader(),accept:'application/json','content-type':'application/json',origin:BASE,referer:BASE+'/game/challenges'},body:body===undefined?undefined:JSON.stringify(body),redirect:'manual',signal:AbortSignal.timeout(45000)});
 const raw=await r.text();let d;try{d=JSON.parse(raw);}catch{d={message:raw.slice(0,300)};}
 if(!r.ok){const e=new Error(`${method} ${p}: ${r.status} ${JSON.stringify(d).slice(0,400)}`);e.status=r.status;e.data=d;throw e;}return d;
}
export async function get(p){for(let i=0;;i++){try{return await api('GET',p);}catch(e){if(i>=3||[401,403].includes(e.status))throw e;await sleep(2000*(i+1));}}}
export async function bundle(id){let url=BASE+'/api/v1/matches/'+id+'/bundle';for(let i=0;i<50;i++){
 const r=await fetch(url,{headers:new URL(url).origin===BASE?{cookie:cookieHeader()}: {},redirect:'manual',signal:AbortSignal.timeout(45000)});
 if(r.status===429){await r.text();await sleep(Math.max(15000,Math.min(60000,Number(r.headers.get('retry-after')||30)*1000)));continue;}
 if([301,302,303,307,308].includes(r.status)){url=new URL(r.headers.get('location'),url).href;continue;}
 if([401,403].includes(r.status))throw Error('Replay authorization failed '+r.status);
 if((r.headers.get('content-type')||'').includes('json')){const d=await r.json();if(d.url){url=new URL(d.url,url).href;continue;}if(d.pollUrl)url=new URL(d.pollUrl,BASE).href;if(d.status==='pending'||[202,409].includes(r.status)){await sleep(Math.min(10000,Math.max(1000,(d.retryAfter||2)*1000)));continue;}throw Error('Unexpected bundle '+JSON.stringify(d));}
 if(!r.ok)throw Error('Bundle '+r.status);const b=Buffer.from(await r.arrayBuffer());if(b[0]!==80||b[1]!==75)throw Error('Not a replay ZIP');return b;
 }throw Error('Bundle timeout '+id);}
