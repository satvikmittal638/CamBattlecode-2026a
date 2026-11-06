import fs from 'node:fs';import path from 'node:path';import {dumpReplay} from '../../tools/replay_dump.mjs';
const D=path.dirname(new URL(import.meta.url).pathname),out=[];
for(const arm of ['control','candidate']){
 const P=D+'/paired_duo/'+arm,index=JSON.parse(fs.readFileSync(P+'/platform/index.json'));
 for(const map of ['00corners','00swirl','02treasure_box','01boss_battle'])for(const pool of ['strong','near']){
  const row=index.find(r=>r.map===map&&r.label.startsWith(pool));if(!row)throw Error('missing probe case');const us=+(row.side==='b');let health300=null,defense=null,treasure=null;const shops=[];
  await dumpReplay(P+'/platform/'+row.file,{snapshots:'none',onStep(st,ev){
   const c=st.champions.find(c=>c.team===us&&c.type===3);if(!c)return;
   if(ev?.kind==='Shop'&&ev.actor?.index===c.entity.index){
    if(st.round<=500)shops.push({r:st.round,hp:c.health,max:c.maxHealth,items:ev.items});
    if(c.items[17]>0&&defense===null)defense=st.round;
    if(c.items[21]>0&&treasure===null)treasure=st.round;
   }
   if(st.round===300&&health300===null)health300={hp:c.health,max:c.maxHealth,alive:c.alive,defenseEmblems:c.items[17],treasureFocus:c.items[21],jungleFocus:c.items[27]};
  }});
  out.push({arm,label:row.label,map,defense,treasure,health300,shops});console.log(arm,map,pool,'firstDefense',defense,'firstTreasure',treasure,'hp300',health300?.max);
 }
}
fs.writeFileSync(D+'/item_probe.json',JSON.stringify(out, null, 1));
