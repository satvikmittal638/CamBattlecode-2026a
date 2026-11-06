// Run only the downloaded handbook's pure data/Markdown export expressions in
// an isolated Node VM. No imports, DOM, browser, network, or filesystem in VM.
import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';
const dir=import.meta.dirname;
const champion=fs.readFileSync(dir+'/http/service_assets_ChampionGrid-Cidqkhuk.js','utf8');
const docs=fs.readFileSync(dir+'/http/service_assets_docs-CraIq4_w.js','utf8');
function expr(source,marker){let start=source.indexOf(marker)+marker.length;if(start<marker.length)throw Error(marker);const opens={'[':']','{':'}','(':')'},stack=[];let quote=null,escaped=false;for(let i=start;i<source.length;i++){const c=source[i];if(quote){if(escaped){escaped=false;continue;}if(c==='\\'){escaped=true;continue;}if(c===quote)quote=null;continue;}if(['"',"'",'`'].includes(c)){quote=c;continue;}if(opens[c])stack.push(opens[c]);else if(stack.length&&c===stack.at(-1)){stack.pop();if(!stack.length)return source.slice(start,i+1);}}throw Error('Unclosed '+marker);}
const context=vm.createContext({});
let end=champion.indexOf(',C=`/service/assets/');
vm.runInContext(champion.slice(champion.indexOf('var te='),end)+';this.data={pages:S,helpers:{d,a,o,s,c,l,u,ie,ne,re,te,g,h,v,_}};',context,{timeout:1000});
const h=context.data.helpers;
const dctx=vm.createContext({d:h.d,f:context.data.pages,p:h.s,m:h._,h:h.ie,g:h.l,_:h.a,v:h.o,y:()=>null,x:h.te,C:h.g,w:h.ne,T:h.v,E:h.h,O:h.c,k:h.u,A:h.re});
for(const m of docs.matchAll(/([A-Za-z_$][\w$]*)=`(\/service\/assets\/[^`]+)`/g))dctx[m[1]]=m[2];
// Unselected guide/API pages are not part of the GameRules export.
for(const name of ['Ce','de','me','z','we','xe','ye'])dctx[name]=()=>({id:'unselected-'+name,group:'Unselected',sections:[]});
const definitions='var N='+expr(docs,'N=')+';var Ee=x.shared,De=x.draft.toLocaleString("en-GB");var Oe='+expr(docs,'Oe=')+';var Ae='+expr(docs,'Ae=')+';var Me='+expr(docs,'Me=')+';';
const formatters=docs.slice(docs.indexOf('var Re='),docs.indexOf('function Ue('));
try{vm.runInContext(definitions+formatters+';this.markdown=He([...Ae.find(e=>e.title==="Game rules").ids.map(id=>Oe.find(e=>e.id===id)),...Oe.filter(e=>e.group==="Champions")]);',dctx,{timeout:1000});}catch(e){console.error(e.message);process.exit(1);}
const old=fs.readFileSync(dir+'/../docs_2026-10-22/official/GameRules.md','utf8'),live=dctx.markdown;
fs.mkdirSync(dir+'/docs_live/official',{recursive:true});fs.writeFileSync(dir+'/docs_live/official/GameRules.md',live);
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const result={checkedAt:new Date().toISOString(),method:'HTTP GET assets and isolated pure Markdown exporter; no browser',identical:old===live,oldSha256:digest(old),liveSha256:digest(live),oldBytes:Buffer.byteLength(old),liveBytes:Buffer.byteLength(live)};
fs.writeFileSync(dir+'/rules_comparison.json',JSON.stringify(result,null,2));console.log(result);
