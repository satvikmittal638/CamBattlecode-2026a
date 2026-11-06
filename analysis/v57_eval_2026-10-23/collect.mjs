import fs from 'node:fs';import path from 'node:path';import {get,bundle,sleep,US} from './http.mjs';
const dir=import.meta.dirname,plan=JSON.parse(fs.readFileSync(dir+'/plan.json')),out=dir+'/games';fs.mkdirSync(out,{recursive:true});fs.mkdirSync(dir+'/groups',{recursive:true});
const index=fs.existsSync(out+'/index.json')?JSON.parse(fs.readFileSync(out+'/index.json')):[],have=new Set(index.map(x=>x.matchId));
const save=()=>{fs.writeFileSync(out+'/index.json.tmp',JSON.stringify(index,null,1));fs.renameSync(out+'/index.json.tmp',out+'/index.json');};const log=(...x)=>console.log(new Date().toISOString(),...x);
let lastCount=-1;
for(;;){
 const receipts=fs.existsSync(dir+'/receipts.json')?JSON.parse(fs.readFileSync(dir+'/receipts.json')):[];
 const states={};const tasks=[];
 for(let start=0;start<receipts.length;start+=8)await Promise.all(receipts.slice(start,start+8).map(async g=>{
  const f=dir+'/groups/'+g.groupId+'.json';let d=fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):null;if(!d||!['finished','error','cancelled'].includes(d.group.status)){d=await get('/match-groups/'+g.groupId);fs.writeFileSync(f,JSON.stringify(d,null,2));}
  states[d.group.status]=(states[d.group.status]||0)+1;
  for(const m of d.matches){if(m.status!=='finished'||have.has(m.id))continue;const me=m.sides.find(s=>s.teamId===US),opp=m.sides.find(s=>s.teamId!==US);
   if(me?.version!==plan.version)throw Error('Wrong version '+m.id);const rel=path.join(m.map,`${g.label}_${m.id}.repl26a`);
   tasks.push(async()=>{try{const target=out+'/'+rel;fs.mkdirSync(path.dirname(target),{recursive:true});if(!fs.existsSync(target))fs.writeFileSync(target,await bundle(m.id));index.push({matchId:m.id,groupId:g.groupId,label:g.label,pool:g.pool,opponentRank:g.rank,map:m.map,side:me.side,opponent:opp.teamName,result:me.result,score:me.score,oppScore:opp.score,myDraft:me.draft,oppDraft:opp.draft,version:me.version,rounds:m.rounds,endReason:m.endReason,kind:m.kind,createdAt:m.createdAt,file:rel,botError:me.botError,oppBotError:opp.botError});have.add(m.id);save();}catch(e){log('DOWNLOAD RETRY LATER',m.id,e.message);}});
  }
 }));
 let next=0;await Promise.all(Array.from({length:2},async()=>{while(next<tasks.length){const task=tasks[next++];await task();await sleep(1200);}}));
 if(index.length!==lastCount){log('Collected',index.length,'games from',receipts.length,'accepted groups',JSON.stringify(states));lastCount=index.length;}
 fs.writeFileSync(dir+'/collection_status.json',JSON.stringify({at:new Date().toISOString(),games:index.length,accepted:receipts.length,states}));
 if(receipts.length===100&&(states.finished||0)+(states.error||0)+(states.cancelled||0)===100&&index.length===500){log('DONE 500 unique replays');break;}
 if(fs.existsSync(dir+'/sender_error.json')){log('Sender stopped; collected available games');break;}
 await sleep(20000);
}
