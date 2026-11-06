import fs from 'node:fs';import {api} from './platform_api.mjs';
const [out='autoresearch/online_plan_s21.json',prefix='s21',...excludes]=process.argv.slice(2);
const split=JSON.parse(fs.readFileSync('autoresearch/map_split.json')),opts=await api('GET','/challenges'),rank=opts.requesterRank;
const used=new Set(['6b04505b-d16c-4196-b7c6-53a4688a32ca']);
for(const file of ['autoresearch/online_plan.json','autoresearch/online_plan2.json','autoresearch/online_plan_s19.json',...excludes])if(fs.existsSync(file))for(const s of JSON.parse(fs.readFileSync(file)).specs)used.add(s.teamId);
let teams=[];for(let p=1;p<=3;p++){const page=await api('GET',`/ladder?page=${p}&pageSize=100&category=all`);teams.push(...page.teams);}
const pick=c=>{const t=teams.filter(t=>t.hasBot!==false&&!used.has(t.teamId)).sort((a,b)=>Math.abs(a.rank-c)-Math.abs(b.rank-c)||a.rank-b.rank).slice(0,5);for(const x of t)used.add(x.teamId);return t;};
const near=pick(rank),half=pick(rank/2),available=new Set(opts.maps.map(m=>m.name));
// Independent opponent confirmation; Gem3 had 3/8 exact-v114 scout wins, so classify it weak.
const targets=['adgato_gemcombat3','adgato_gemcombat2'];
const isWeak=m=>m==='adgato_gemcombat3'||split.weak.some(r=>r.map===m);
const weak=split.weak.map(r=>r.map).filter(m=>!targets.includes(m)&&available.has(m)),strong=split.strong.map(r=>r.map).filter(m=>!targets.includes(m)&&available.has(m));
let wi=0,si=0;
const specs=[...near.map(t=>['near',t]),...half.map(t=>['half',t])].map(([pool,t],i)=>{
 const nStrong=i%2?2:1,maps=[targets[0]];
 while(maps.length<5-nStrong)maps.push(weak[wi++%weak.length]);
 maps.push(targets[1]);if(nStrong===2)maps.push(strong[si++%strong.length]);
 let other=0;const sides=maps.map(m=>targets.includes(m)?(i%2?'b':'a'):(i%2?(other++<2?'a':'b'):(other++===0?'a':'b')));
 for(const m of maps)if(!available.has(m))throw Error('Unavailable map '+m);
 return {label:`${prefix}_${pool}_r${t.rank}_${i+1}`,pool,rank:t.rank,teamId:t.teamId,opponent:t.name,maps,sides,cls:maps.map(m=>isWeak(m)?'weak':'strong'),target:maps.map(m=>targets.includes(m))};
});
const plan={createdAt:new Date().toISOString(),rank,design:'50 games per arm;25 near/25 half;35 weak/15 strong;20 target/30 other;Gem3 weak from v114 scout3/8, Gem2 historical strong;target sides5/5 each;new opponents;pin between arms',specs};
fs.writeFileSync(out,JSON.stringify(plan,null,1));
console.log(JSON.stringify({out,rank,teams:specs.map(s=>[s.pool,s.rank,s.opponent]),weak:specs.flatMap(s=>s.cls).filter(c=>c==='weak').length,sideA:specs.flatMap(s=>s.sides).filter(c=>c==='a').length,targets:specs.flatMap(s=>s.target).filter(Boolean).length}));
