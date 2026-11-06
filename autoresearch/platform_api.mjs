// Existing saved-session transport, with no browser login and no retry of writes.
import {cookieHeader,BASE,sleep} from '../tools/bclib.mjs';
export {sleep};
export async function api(method,path,body){
 const r=await fetch(BASE+'/api/v1'+path,{method,headers:{cookie:cookieHeader(),accept:'application/json',origin:BASE,referer:BASE+'/game/matches',...(body===undefined?{}:{'content-type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body),redirect:'manual',signal:AbortSignal.timeout(60000)});
 const t=await r.text();let j;try{j=JSON.parse(t);}catch{throw Error('Non-JSON platform response HTTP '+r.status+' '+method+' '+path);}
 if(!r.ok)throw Error('Platform HTTP '+r.status+' '+method+' '+path+': '+JSON.stringify(j).slice(0,250));
 return j;
}
let nextBundleRequest=0;
export async function bundle(id){
 let url=BASE+'/api/v1/matches/'+id+'/bundle';
 for(let i=0;i<90;i++){
  const slot=Math.max(Date.now(),nextBundleRequest);nextBundleRequest=slot+2200;await sleep(Math.max(0,slot-Date.now()));
  const r=await fetch(url,{headers:{cookie:cookieHeader(),accept:'application/json'},redirect:'manual',signal:AbortSignal.timeout(60000)});
  if(r.status===429){nextBundleRequest=Math.max(nextBundleRequest,Date.now()+30000);await sleep(30000);continue;}
  const loc=r.headers.get('location');
  if(r.status===303&&loc&&!loc.includes('/auth/')){
   const b=await fetch(new URL(loc,BASE),{signal:AbortSignal.timeout(60000)});if(!b.ok)throw Error('Bundle storage HTTP '+b.status);
   return Buffer.from(await b.arrayBuffer());
  }
  if(![200,202,409].includes(r.status))throw Error('Bundle HTTP '+r.status);
  const j=await r.json();
  if(j.status==='ready'&&j.url){const b=await fetch(j.url);if(!b.ok)throw Error('Bundle storage HTTP '+b.status);return Buffer.from(await b.arrayBuffer());}
  if(j.pollUrl)url=new URL(j.pollUrl,BASE).href;
  await sleep(Math.min(10000,Math.max(1000,(j.retryAfter??2)*1000)));
 }
 throw Error('Bundle timed out '+id);
}
