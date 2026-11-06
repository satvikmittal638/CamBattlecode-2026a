import fs from 'node:fs';
import {get} from '../v57_eval_2026-10-23/http.mjs';
const dir=import.meta.dirname,T='38e6d8c4-1608-44f5-956b-08390f564336';
fs.mkdirSync(dir+'/pages',{recursive:true});
const cutoff=new Date().toISOString();
const ladder=await get('/ladder?page=1&pageSize=100&category=all');
fs.writeFileSync(dir+'/ladder.json',JSON.stringify(ladder,null,2));
const team=ladder.teams.find(t=>t.teamId===T);
fs.writeFileSync(dir+'/team.json',JSON.stringify({at:cutoff,...team},null,2));
const all=[];
for(const kind of ['ranked','unranked']){
 let cursor=null,seen=new Set(),page=0,groups=[];
 for(;;){
  const p=await get('/match-groups?scope=all&team='+T+'&kind='+kind+(cursor?'&before='+encodeURIComponent(cursor):''));
  fs.writeFileSync(dir+'/pages/'+kind+'_'+String(page).padStart(3,'0')+'.json',JSON.stringify(p));
  for(const g of p.groups)if(g.createdAt<=cutoff&&!seen.has(g.id)){seen.add(g.id);groups.push(g);}
  console.log('CENSUS',kind,++page,groups.length,p.groups.at(-1)?.createdAt,p.more);
  if(!p.more)break;
  const next=p.next??(p.groups.at(-1)?.createdAt+'_'+p.groups.at(-1)?.id);
  if(!next||next===cursor||page>300)throw Error('Invalid pagination');
  cursor=next;
 }
 all.push(...groups);
}
fs.writeFileSync(dir+'/census.json',JSON.stringify({cutoff,target:T,groups:all},null,2));
console.log('DONE',JSON.stringify({team,groups:all.length,kinds:Object.fromEntries(['ranked','unranked'].map(k=>[k,all.filter(g=>g.kind===k).length]))}));
