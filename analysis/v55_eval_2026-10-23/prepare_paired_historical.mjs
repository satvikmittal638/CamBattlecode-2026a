import fs from 'node:fs';
const dir=import.meta.dirname,read=k=>JSON.parse(fs.readFileSync(dir+'/'+k+'.json'));
const q=read('challenges'),listing=read('submissions'),teams=read('ladder').teams,rank=q.requesterRank,version=listing.active.version;

const eligible=teams.filter(t=>t.hasBot&&t.teamId!==q.team.id);
const closest=center=>eligible.toSorted((a,b)=>Math.abs(a.rank-center)-Math.abs(b.rank-center)||a.rank-b.rank).slice(0,25).sort((a,b)=>a.rank-b.rank);
const pools={near:closest(rank),half:closest(rank/2)},maps=q.maps.map(m=>m.name).sort(),specs=[];
for(let i=0;i<25;i++)for(const pool of ['near','half'])for(let repeat=0;repeat<2;repeat++){
 const t=pools[pool][i],offset=pool==='near'?0:13;
 specs.push({label:`${pool}_r${t.rank}_p${repeat+1}`,pool,rank:t.rank,teamId:t.teamId,opponent:t.name,repeat,maps:Array.from({length:5},(_,j)=>maps[(i*5+j+offset)%maps.length]),sides:Array.from({length:5},(_,j)=>(i+j+repeat)%2?'b':'a')});
}
const plan={createdAt:new Date().toISOString(),version,submissionId:listing.active.id,rank,halfRank:rank/2,pools,maps,specs};
fs.writeFileSync(dir+'/plan.json',JSON.stringify(plan,null,2));
console.log(JSON.stringify({version,rank,halfRank:rank/2,pools:Object.fromEntries(Object.entries(pools).map(([k,v])=>[k,v.map(t=>({rank:t.rank,name:t.name}))])),challenges:specs.length,maps:maps.length},null,2));
