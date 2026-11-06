import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {dumpReplay,readReplayBytes} from '../tools/replay_dump.mjs';
const dir=process.argv[2],root=process.argv[3],arms=process.argv.slice(4);
const caseFile=process.env.AR_VISUAL_CASES;
const cases=caseFile?JSON.parse(fs.readFileSync(caseFile)):[['adgato-gemcombat1','arop-v123','b'],['adgato-gemcombat1','arop-v133','b'],['adgato-gemcombat2','arop-v133','a'],['adgato-gemcombat2','arop-v133','b']];
const graphFile='autoresearch/graph_routes_analysis/graphs.json',maps=fs.existsSync(graphFile)?new Map(JSON.parse(fs.readFileSync(graphFile)).rows.map(m=>[m.map,m])):new Map();
const tag=(geometry,groups)=>JSON.stringify([geometry.walls,geometry.holes,geometry.altars,geometry.spawn,groups.map(g=>[g.id,g.gems,g.gold,g.tiles])]);
fs.mkdirSync(dir,{recursive:true});const rows=[],cache=new Map(),STOP={};
for(const arm of arms){
 const run=JSON.parse(fs.readFileSync(path.join(root,arm,'results.json'))),files=fs.readdirSync(path.join(root,arm,'replays'));
 for(const [map,opp,side] of cases){
  const key=[map,opp,side].join('|'),r=run.results[key],stats=JSON.parse(fs.readFileSync(path.join(root,arm,key.replaceAll('|','__')+'.json'))),known=maps.get(map);
  const prefix=(side==='a'?run.bot+'-vs-'+opp:opp+'-vs-'+run.bot)+'-';const options=[];
  for(const name of files.filter(f=>f.startsWith(prefix))){
   const file=path.resolve(root,arm,'replays',name);let identity=cache.get(file);
   if(!identity){try{await dumpReplay(file,{snapshots:'none',mapInfo:true,onStart(s){
    const {eng:e,game:g,mapInfo:m}=s,buf=e.exp.Engine_Malloc(16384);e.check(e.exp.Game_API_Map_GetCampGroups(g,buf,500,buf+16000));const ids=Array.from({length:e.view.getUint32(buf+16000,true)},(_,i)=>e.view.getUint32(buf+4*i,true)),groups=[];
    for(const id of ids){e.check(e.exp.Game_API_Map_CampGroup_Get(g,id,buf));const gems=e.view.getUint32(buf,true),gold=e.view.getUint32(buf+4,true);e.check(e.exp.Game_API_Map_CampGroup_GetCampInfo(g,id,buf,500,buf+16000));const cs=Array.from({length:e.view.getUint32(buf+16000,true)},(_,i)=>e.view.getUint32(buf+4*i,true));const tiles=cs.map(cid=>{e.check(e.exp.Game_API_Map_CampInfo_Get(g,cid,buf));return [e.view.getInt32(buf,true),e.view.getInt32(buf+4,true)];});groups.push({id,gems,gold,tiles});}
    const coords=a=>Array.from(a).flatMap((v,i)=>v?[[i%s.width,Math.floor(i/s.width)]]:[]);identity={width:s.width,height:s.height,tag:tag({walls:coords(m.walls),holes:coords(m.holes),altars:m.altars,spawn:m.spawn},groups)};throw STOP;
   }});}catch(e){if(e!==STOP)throw e;}cache.set(file,identity);}
   if(identity.width===stats.match.width&&identity.height===stats.match.height&&(!known||identity.tag===tag(known.geometry,known.groups)))options.push(file);
  }
  if(options.length>1){const hashes=new Set(options.map(f=>crypto.createHash('sha256').update(readReplayBytes(f)).digest('hex')));if(hashes.size===1)options.splice(1);}
  if(options.length!==1)throw Error('Ambiguous local replay '+key+' '+options.length);
  rows.push({arm,label:map+'_'+opp+'_'+side,map:map.replaceAll('-','_'),side,result:r.win?'win':'loss',score:r.score,oppScore:r.opp_score,file:options[0],matchId:crypto.createHash('sha256').update(options[0]).digest('hex').slice(0,32)});
 }
}
fs.writeFileSync(path.join(dir,'index.json'),JSON.stringify(rows,null,1));console.log(rows.length,'local replay identities verified');
