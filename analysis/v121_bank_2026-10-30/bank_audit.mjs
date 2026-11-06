import fs from 'node:fs';import path from 'node:path';import {traceReplay} from '../../tools/turn_trace.mjs';
const D=path.resolve(process.argv[2]),part=+process.argv[3]||0,F=D+`/bank_audit_${part}.json`,out=fs.existsSync(F)?JSON.parse(fs.readFileSync(F)):[],have=new Set(out.map(x=>x.matchId));
const rows=JSON.parse(fs.readFileSync(D+'/platform/index.json')).filter((_,i)=>i%4===part).filter(x=>!have.has(x.matchId));
for(const row of rows){
 const us=+(row.side==='b'),prev=new Map(),interrupted=new Map(),events=[];let altars=[];
 const s={...row,tributeStarts:0,longStarts:0,channelTurns:0,channelDeaths:0,interrupted:0,restartsWhileThreatened:0,afterInterruptCombat:0,largeBankCombat:0,cancels:0,cancelRuleViolations:0,largeBagDeaths:0};
 await traceReplay(path.join(D,'platform',row.file),us,{withItems:false,onTurn(t){
  if(t.start){altars=t.mapInfo.altars;return;}
  const me=t.self,p=prev.get(t.c),alive=!!(me.st&1),channel=!!(me.st&4);
  const near=t.en.some(e=>Math.max(Math.abs(e.x-me.x),Math.abs(e.y-me.y))<=6);
  const combat=t.acts.some(a=>(a.k==='Attack'||a.k==='Cast ability')&&a.tk==='champion'&&a.tteam===1-us);
  if(p&&p.activeChannel&&!channel&&alive&&me.gems>0&&!p.cancel){s.interrupted++;interrupted.set(t.c,t.r);events.push({r:t.r,c:t.c,k:'interrupt',gems:me.gems,near});}
  if(p?.alive&&!alive){if(p.activeChannel)s.channelDeaths++;if(p.gems>=200)s.largeBagDeaths++;}
  const recent=t.r-(interrupted.get(t.c)??-1000)<=8;
  if(recent&&combat){s.afterInterruptCombat++;events.push({r:t.r,c:t.c,k:'recovery-fight',gems:me.gems});}
  const atBank=altars.some(a=>Math.max(Math.abs((a.x??a[0])-me.x),Math.abs((a.y??a[1])-me.y))<=3);
  if(alive&&me.gems>=200&&atBank&&near&&combat){s.largeBankCombat++;events.push({r:t.r,c:t.c,k:'large-bank-fight',gems:me.gems});}
  const started=t.acts.some(a=>a.k==='Submit gems'),cancel=t.acts.some(a=>a.k==='Cancel channel')&&channel;
  if(started){s.tributeStarts++;if(me.gems>=200)s.longStarts++;if(recent&&near)s.restartsWhileThreatened++;}
  if(channel)s.channelTurns++;
  if(cancel){
   const loss=p&&p.r===t.r-1?p.hp-me.hp:0;
   const rule=me.ch>2&&loss>=1&&me.hp<=3*loss&&t.en.length>0;
   s.cancels++;if(!rule)s.cancelRuleViolations++;
   events.push({r:t.r,c:t.c,k:'cancel',hp:me.hp,loss,remaining:me.ch,gems:me.gems,rule});
  }
  prev.set(t.c,{r:t.r,hp:me.hp,gems:me.gems,alive,activeChannel:(channel||started)&&!cancel,cancel});
 }});
 s.events=events;out.push(s);fs.writeFileSync(F,JSON.stringify(out));console.log(part,out.length,row.map);
}
