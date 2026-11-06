import fs from 'node:fs';import {get,US} from './http.mjs';
const dir=import.meta.dirname;
const paths={submissions:'/submissions',challenges:'/challenges',ladder:'/ladder?page=1&pageSize=100&category=all',activity:'/match-groups?scope=all&team='+US};
for(const [k,r]of await Promise.all(Object.entries(paths).map(async([k,p])=>[k,await get(p)]))){fs.writeFileSync(dir+'/'+k+'.json',JSON.stringify(r,null,2));if(k==='submissions')console.log(k,JSON.stringify({active:r.active,latest:r.submissions.slice(0,6)}));if(k==='challenges')console.log(k,JSON.stringify({...r,maps:r.maps?.length}));if(k==='ladder')console.log('our rank',JSON.stringify(r.teams?.find(t=>t.teamId===US)));if(k==='activity')console.log('recent activity',JSON.stringify(r.groups?.slice(0,5)));}
