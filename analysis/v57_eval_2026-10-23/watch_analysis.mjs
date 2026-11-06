import fs from 'node:fs';import {spawn} from 'node:child_process';
const dir=import.meta.dirname,sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function run(command,args){return new Promise((resolve,reject)=>{const child=spawn(command,args,{cwd:dir,stdio:['ignore','pipe','pipe']});let tail='';child.stdout.on('data',b=>{tail=(tail+b).slice(-1000);});child.stderr.on('data',b=>{tail=(tail+b).slice(-4000);});child.on('error',reject);child.on('exit',c=>c?reject(Error(command+' '+args+' '+tail)):resolve(tail));});}
for(;;){
 const n=JSON.parse(fs.readFileSync(dir+'/games/index.json')).length;
 const old=fs.existsSync(dir+'/metrics.json')?JSON.parse(fs.readFileSync(dir+'/metrics.json')).rows.length:0;
 if(n-old>=25||n===500&&old!==500){console.log(new Date().toISOString(),'Decoding incremental corpus',old,'->',n);console.log(await run('node',['analyze.mjs']));await run('node',['summarize.mjs']);await run('node',['patterns.mjs']);console.log(await run('python3',['log_audit.py']));}
 const count=fs.existsSync(dir+'/metrics.json')?JSON.parse(fs.readFileSync(dir+'/metrics.json')).rows.length:0;
 fs.writeFileSync(dir+'/analysis_status.json',JSON.stringify({at:new Date().toISOString(),collected:n,decoded:count}));
 if(n===500&&count===500){console.log('ALL 500 REPLAYS DECODED');break;}
 await sleep(45000);
}
