import fs from 'node:fs';import {dumpReplay,Engine,readMapInfo} from '../../tools/replay_dump.mjs';
const root=new URL('../..',import.meta.url).pathname,dir=import.meta.dirname;
for(const m of JSON.parse(fs.readFileSync(dir+'/playbooks/summary.json'))){const g=JSON.parse(fs.readFileSync(dir+'/playbooks/'+m.map+'.json'));let original;
 await dumpReplay(dir+'/fish_recent/games/'+g.file,{snapshots:'none',mapInfo:true,onStart(s){original=s.mapInfo;}});
 const eng=await Engine.create('v1_0_3'),bytes=fs.readFileSync(root+'/workspace/maps/'+m.map.replaceAll('_','-')+'.map26a'),p=eng.exp.Engine_Malloc(bytes.length);new Uint8Array(eng.exp.memory.buffer,p,bytes.length).set(bytes);eng.check(eng.exp.Game_FromMapFileBytes(p,bytes.length,eng.outBuf,0));const game=eng.outHandle,local=readMapInfo(eng,game,m.w,m.h),diff={};
 for(const key of ['walls','holes','bushes','altarGrid'])if(original[key]&&local[key])diff[key]=Array.from(original[key],(v,i)=>v===local[key][i]?null:[i%m.w,Math.floor(i/m.w),v,local[key][i]]).filter(Boolean);
 console.log(m.map,JSON.stringify(diff));
}
