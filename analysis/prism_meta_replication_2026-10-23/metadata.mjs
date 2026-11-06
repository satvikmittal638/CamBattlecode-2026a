import fs from 'node:fs';
import {get} from '../v57_eval_2026-10-23/http.mjs';
const dir=import.meta.dirname,T='38e6d8c4-1608-44f5-956b-08390f564336';
fs.mkdirSync(dir+'/groups',{recursive:true});
const pages=fs.readdirSync(dir+'/pages').filter(f=>f.startsWith('ranked_')).sort();
let headers=pages.flatMap(f=>JSON.parse(fs.readFileSync(dir+'/pages/'+f)).groups),mode=process.argv[2]??'ranked';
if(mode==='unranked'){
 const cs=JSON.parse(fs.readFileSync(dir+'/census.json')),u=cs.groups.filter(g=>g.kind==='unranked'&&g.status==='finished');
 // First recent set for every opponent, plus regular time samples throughout history.
 const chosen=new Map(),op=new Set();
 for(const g of u){const id=g.sides.find(s=>s.teamId!==T)?.teamId;if(!op.has(id)){op.add(id);chosen.set(g.id,g);}}
 for(let i=0;i<100;i++){const g=u[Math.floor(i*(u.length-1)/99)];if(g)chosen.set(g.id,g);}
 headers=[...chosen.values()];
}
let cursor=0,done=0;const errors=[];
await Promise.all(Array.from({length:4},async()=>{for(;;){const g=headers[cursor++];if(!g)return;const f=dir+'/groups/'+g.id+'.json';try{if(!fs.existsSync(f))fs.writeFileSync(f,JSON.stringify(await get('/match-groups/'+g.id)));if(++done%25===0)console.log('DETAILS',mode,done,'/',headers.length);}catch(e){errors.push({id:g.id,error:e.message});}}}));
const rows=[];for(const f of fs.readdirSync(dir+'/groups')){const d=JSON.parse(fs.readFileSync(dir+'/groups/'+f)),g=d.group;if(!g||!Array.isArray(d.matches))continue;for(const m of d.matches)if(m.status==='finished'){const s=m.sides.find(s=>s.teamId===T),o=m.sides.find(s=>s.teamId!==T);if(!s||!o)continue;rows.push({matchId:m.id,groupId:g.id,createdAt:m.createdAt,map:m.map,side:s.side,result:s.result,score:s.score,oppScore:o.score,myDraft:s.draft,oppDraft:o.draft,opponent:o.teamName,opponentId:o.teamId,rounds:m.rounds,kind:g.kind,patchId:m.patchId,file:m.map+'/'+m.id+'.repl26a'});}}
rows.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||a.matchId.localeCompare(b.matchId));
fs.writeFileSync(dir+'/matches.json',JSON.stringify(rows,null,2));fs.writeFileSync(dir+'/metadata_'+mode+'.json',JSON.stringify({at:new Date().toISOString(),requested:headers.length,done,errors,totalMatches:rows.length},null,2));
console.log('DONE',rows.length,errors);
