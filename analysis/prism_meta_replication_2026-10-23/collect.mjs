import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {bundle} from '../v57_eval_2026-10-23/http.mjs';
const dir=import.meta.dirname,rows=JSON.parse(fs.readFileSync(dir+'/matches.json'));
const names=execFileSync('rg',['--files','analysis','-g','index.json'],{encoding:'utf8',maxBuffer:1<<24}).trim().split('\n');
const cache=new Map();for(const f of names){try{const a=JSON.parse(fs.readFileSync(f));if(!Array.isArray(a))continue;for(const g of a)if(g.matchId&&g.file){const p=path.resolve(path.dirname(f),g.file);if(fs.existsSync(p))cache.set(g.matchId,p);}}catch{}}
let next=0,count=0,reused=0;const errors=[],index=[];
fs.mkdirSync(dir+'/games',{recursive:true});
await Promise.all(Array.from({length:12},async()=>{for(;;){const g=rows[next++];if(!g)return;try{const f=dir+'/games/'+g.file;fs.mkdirSync(path.dirname(f),{recursive:true});if(!fs.existsSync(f)){if(cache.has(g.matchId)){fs.copyFileSync(cache.get(g.matchId),f);reused++;}else fs.writeFileSync(f,await bundle(g.matchId));}const b=fs.readFileSync(f);index.push({...g,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});count++;if(count%50===0){fs.writeFileSync(dir+'/games/index.json',JSON.stringify(index,null,2));console.log('REPLAYS',count,'/',rows.length,'reused',reused);}}catch(e){errors.push({id:g.matchId,error:e.message});console.log('ERROR',g.matchId,e.message);}}}));
index.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||a.matchId.localeCompare(b.matchId));
fs.writeFileSync(dir+'/games/index.json',JSON.stringify(index,null,2));fs.writeFileSync(dir+'/collection.json',JSON.stringify({at:new Date().toISOString(),requested:rows.length,count,reused,errors},null,2));
if(errors.length)throw Error('Incomplete collection');console.log('ALL COLLECTED',count);
