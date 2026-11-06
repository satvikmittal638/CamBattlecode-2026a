import fs from 'node:fs';import {get,US} from './http.mjs';
const dir=import.meta.dirname,read=n=>JSON.parse(fs.readFileSync(dir+'/'+n)),journal=read('journal.json'),receipts=read('receipts.json'),plan=read('plan.json');
for(const intent of journal.filter(i=>i.state==='pending')){
 const activity=await get('/match-groups?scope=all&team='+US);fs.writeFileSync(dir+'/reconcile_activity.json',JSON.stringify(activity,null,2));
 const candidates=activity.groups.filter(g=>Date.parse(g.createdAt)>=Date.parse(intent.at)-3000&&g.kind==='unranked'&&g.sides.some(s=>s.teamId===intent.body.teamId)&&!receipts.some(r=>r.groupId===g.id));
 console.log('pending',intent.label,intent.at,'candidates',candidates.map(x=>x.id));
 const s=plan.specs.find(s=>s.label===intent.label),matches=[];
 for(const g of candidates){const d=await get('/match-groups/'+g.id);fs.writeFileSync(dir+'/reconcile_'+g.id+'.json',JSON.stringify(d,null,2));console.log('candidate maps',JSON.stringify(d.matches.map(m=>({map:m.map,side:m.sides.find(x=>x.teamId===US)?.side}))));if(d.matches.length===5&&d.matches.every(m=>{const i=s.maps.indexOf(m.map);return i>=0&&m.sides.find(x=>x.teamId===US)?.side===s.sides[i];}))matches.push(g);}
 if(matches.length!==1)throw Error('Cannot uniquely reconcile pending challenge');
 const g=matches[0];intent.state='accepted';intent.groupId=g.id;intent.reconciled=true;receipts.push({...s,groupId:g.id,acceptedAt:g.createdAt,reconciled:true});
 fs.writeFileSync(dir+'/journal.json',JSON.stringify(journal,null,2));fs.writeFileSync(dir+'/receipts.json',JSON.stringify(receipts,null,2));fs.appendFileSync(dir+'/challenges.txt',`${s.label}\t${s.maps.join(',')}\t${s.sides.join(',')}\t${g.id}\n`);console.log('Recovered receipt',g.id);
}
