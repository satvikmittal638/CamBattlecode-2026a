// Read the sender's group receipts; fetch bundles four at a time. Never posts challenges.
import fs from 'node:fs';import path from 'node:path';import {fetchBundle,sleep} from '../../tools/bclib.mjs';
const P=path.resolve(process.argv[2]),U='6b04505b-d16c-4196-b7c6-53a4688a32ca';fs.mkdirSync(P+'/platform',{recursive:true});
const I=P+'/platform/index.json',out=fs.existsSync(I)?JSON.parse(fs.readFileSync(I)):[],have=new Set(out.map(r=>r.matchId)),deadline=Date.now()+40*60*1000;
while(Date.now()<deadline){
 const ledger=fs.existsSync(P+'/challenges.txt')?fs.readFileSync(P+'/challenges.txt','utf8').trim().split('\n').filter(Boolean):[];
 const jobs=[];for(const line of ledger){const [label,...rest]=line.split('\t'),id=rest.at(-1);let g;try{g=JSON.parse(fs.readFileSync(P+'/groups/'+id+'.json'))}catch{continue}
  if(g.group.status!=='finished')continue;
  for(const m of g.matches)if(m.status==='finished'&&!have.has(m.id))jobs.push({m,label,groupId:id});
 }
 let cursor=0;const downloaded=new Map();
 await Promise.all(Array.from({length:Math.min(4,jobs.length)},async()=>{while(cursor<jobs.length){const {m,label,groupId}=jobs[cursor++],me=m.sides.find(s=>s.teamId===U),opp=m.sides.find(s=>s.teamId!==U);const file=path.join(m.map,label+'_'+m.id+'.repl26a');fs.mkdirSync(path.dirname(P+'/platform/'+file),{recursive:true});fs.writeFileSync(P+'/platform/'+file,await fetchBundle(m.id));downloaded.set(m.id,{matchId:m.id,groupId,label,map:m.map,side:me.side,opponent:opp.teamName,result:me.result,score:me.score,oppScore:opp.score,myDraft:me.draft,oppDraft:opp.draft,version:me.version,rounds:m.rounds,endReason:m.endReason,kind:m.kind,createdAt:m.createdAt,file});}}));
 for(const {m} of jobs)if(downloaded.has(m.id)){out.push(downloaded.get(m.id));have.add(m.id)}
 if(jobs.length){fs.writeFileSync(I,JSON.stringify(out,null,1));console.log('Downloaded',out.length,'of100');}
 if(out.length===100){fs.writeFileSync(P+'/collection_complete.json',JSON.stringify({matches:100,at:new Date().toISOString()}));break;}
 await sleep(5000);
}
if(out.length!==100)throw Error('collection timed out');
