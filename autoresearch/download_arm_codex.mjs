import fs from 'node:fs';import path from 'node:path';import {bundle} from './platform_api.mjs';
const label=process.argv[2],dir='autoresearch/online_runs/'+label;
const d=JSON.parse(fs.readFileSync(dir+'/results.json')),rows=[];
fs.mkdirSync(dir+'/replays',{recursive:true});
let cursor=0;
await Promise.all([0,1,2].map(async()=>{
 while(cursor<d.games.length){const g=d.games[cursor++],file=path.resolve(dir+'/replays/'+g.map+'_'+g.matchId+'.repl26a');
  if(!fs.existsSync(file)){const b=await bundle(g.matchId);if(b[0]!==80||b[1]!==75)throw Error('Not a replay ZIP');fs.writeFileSync(file,b);}
  rows.push({...g,arm:label,file});
 }
}));
rows.sort((a,b)=>a.label.localeCompare(b.label)||a.map.localeCompare(b.map));
fs.writeFileSync(dir+'/index.json',JSON.stringify(rows,null,1));console.log(label,rows.length,'replays downloaded');
