// Personal-observation dataset. IDs/outcomes remain metadata, never model inputs.
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const rect=(p,r)=>Math.max(r.minX-p.x,0,p.x-r.maxX,r.minY-p.y,0,p.y-r.maxY);
const types=['Ryth','VesperVale','Vendetta','Cassi','Issac','Stellar','Prism','Marcella','Willow','Ren','Varg','Tavi','HeartOfRuin'];
const ranged=new Set(['VesperVale','Cassi','Stellar','Prism','Marcella','Willow','Tavi']);
const wealth=c=>Object.entries(c.items||{}).reduce((s,[k,v])=>s+v*((+k&1)?(Math.floor(+k/6)===1?6:5):1),0);
const power=c=>Math.max(0,c.hp)*(Math.max(0,c.str)+.6*Math.max(0,c.foc));
const round=x=>Number.isFinite(x)?Math.round(x*1000)/1000:-1;
export const BASE_NAMES=['my_type','enemy_type','round','my_hp_fraction','my_hp','my_max_hp','my_strength','my_focus','my_gold','my_gems','my_equipment','my_range','my_cd0','my_cd1','my_can_move','my_can_attack','my_can_cast','distance_home','distance_altar','distance_enemy','enemy_hp_fraction','enemy_hp','enemy_max_hp','enemy_strength','enemy_focus','enemy_gems','enemy_equipment','enemy_cd0','enemy_cd1','enemy_channel','enemy_range','enemy_distance_home','enemy_distance_altar','near_allies','near_enemies','allied_power','visible_enemy_power','enemy_support','our_support_near_enemy','camp_distance','camp_hp','camp_strength','awake_camp_strength5','score_difference','map_width','map_height','my_bush','enemy_bush'];
export const HISTORY_NAMES=['own_previous_action','own_last_dx','own_last_dy','own_hp_change','enemy_last_dx','enemy_last_dy','enemy_hp_change','enemy_observation_count','enemy_move_rate','enemy_approach_rate','enemy_retreat_rate','enemy_last_gap'];
export const ACTIONS=['fight','farm','bank','recall','shop','move','ability','idle'];
export function init({row,team,start}){return{row,team,mi:start.mapInfo,own:new Map(),enemies:new Map(),counts:{turns:0,rows:0,invalid:0,motionLabels:0,motionSkipped:0},shapeChecked:false};}
function features(s,t,e){const me=t.self,en=t.en,al=t.al,p={x:me.x,y:me.y},q=e?{x:e.x,y:e.y}:null,enemy=e||{};
 const allies=al.filter(a=>dist(p,a)<=6),foes=en.filter(a=>dist(p,a)<=8);
 const camps=t.cp.filter(c=>c.hp>0).sort((a,b)=>dist(p,a)-dist(p,b)),camp=camps[0];
 const nearAltar=p=>s.mi.altars.reduce((m,a)=>Math.min(m,dist(p,{x:a[0],y:a[1]})),99);
 const f=[types.indexOf(t.t),e?types.indexOf(e.t):-1,t.r,me.hp/me.mhp,me.hp,me.mhp,me.str,me.foc,me.gold,me.gems,wealth(me),me.rng,...(me.cd||[-1,-1]),!!(me.st&8),!!(me.st&16),!!(me.st&2048),rect(p,s.mi.spawn[s.team]),nearAltar(p),e?dist(p,q):99,e?e.hp/e.mhp:-1,enemy.hp??0,enemy.mhp??0,enemy.str??0,enemy.foc??0,enemy.gems??0,e?wealth(e):0,...(e?.cd||[-1,-1]),!!(enemy.st&(2|4|4096)),e?(ranged.has(e.t)?3:1):0,e?rect(q,s.mi.spawn[1-s.team]):99,e?nearAltar(q):99,allies.length,foes.length,power(me)+allies.reduce((v,c)=>v+power(c),0),foes.reduce((v,c)=>v+power(c),0),e?en.filter(c=>c.c!==e.c&&dist(c,q)<=6).length:0,e?[me,...al].filter(c=>dist(c,q)<=6).length:0,camp?dist(p,camp):99,camp?.hp??0,camp?.str??0,camps.filter(c=>c.awake===1&&dist(p,c)<=5).reduce((v,c)=>v+c.str,0),(t.sub?.[0]??0)-(t.sub?.[1]??0),s.mi.width,s.mi.height,s.mi.bushes[p.y*s.mi.width+p.x]?1:0,q&&s.mi.bushes[q.y*s.mi.width+q.x]?1:0];
 if(f.length!==BASE_NAMES.length)throw Error('Base schema mismatch '+f.length);return f.map(x=>round(Number(x)));
}
function history(s,t,e,z){const old=s.own.get(t.c),ownValid=old&&old.r===t.r-1;return[old?.label??-1,ownValid?t.self.x-old.x:0,ownValid?t.self.y-old.y:0,ownValid?(t.self.hp-old.hp)/Math.max(1,t.self.mhp):0,z?.dx??0,z?.dy??0,z?.dhp??0,Math.log1p(z?.n??0),z?.move??0,z?.approach??0,z?.retreat??0,z?.gap??99].map(round);}
function action(t,team){const acts=t.acts,hit=(kind,pred)=>acts.some(a=>['Attack','Cast ability'].includes(a.k)&&a.tk===kind&&pred(a));
 if(hit('champion',a=>a.tteam!==team))return 0;
 if(hit('camp',()=>true))return 1;
 if(acts.some(a=>a.k==='Submit gems'))return 2;
 if(acts.some(a=>a.k==='Recall'))return 3;
 if(acts.some(a=>a.k==='Shop'))return 4;
 if(acts.some(a=>a.k==='Move'||a.k==='Cast ability'&&a.ab==='Dash'))return 5;
 if(acts.some(a=>a.k==='Cast ability'))return 6;
 return 7;
}
function record(s,t,y,x,task,prev){s.counts.rows++;return{g:s.row.matchId,opponent:s.row.opponentId||s.row.opponent,teacher:s.row.teacherId,split:s.row.split,task,r:t.r,c:t.c,y,prev,x};}
export function turn(s,t){
 const me=t.self;if(me.dead||me.x<0||me.y<0||!(me.st&1)||!(me.mhp>0)||!(me.hp>0))return[];
 if(!s.shapeChecked){if(types.indexOf(t.t)!==types.indexOf(me.t)||!Array.isArray(me.cd)||me.cd.length!==2)throw Error('Personal champion observation mismatch');s.shapeChecked=true;}
 s.counts.turns++;const out=[],p={x:me.x,y:me.y},eligible=!(me.st&(2|4|4096));
 const nearest=t.en.filter(e=>e.hp>0&&e.x>=0).sort((a,b)=>dist(p,a)-dist(p,b))[0];
 for(const e of t.en){if(!(e.hp>0)||e.x<0)continue;const key=t.c+':'+e.c,z=s.enemies.get(key)||{r:-100,n:0,move:0,approach:0,retreat:0,pending:null};const now={x:e.x,y:e.y},gap=t.r-z.r,valid=z.pos&&gap===1&&dist(z.pos,now)<=3;
  if(z.pending){if(valid&&z.pending.emit){const d=dist(now,z.pending.observer)-dist(z.pos,z.pending.observer),y=d<0?0:d>0?2:1;out.push(record(s,{...t,r:z.pending.r},y,z.pending.x,'motion',z.pending.prev));s.counts.motionLabels++;}else if(z.pending.emit)s.counts.motionSkipped++;}
  z.gap=gap;z.dx=valid?e.x-z.pos.x:0;z.dy=valid?e.y-z.pos.y:0;z.dhp=valid?(e.hp-z.hp)/Math.max(1,e.mhp):0;
  if(valid){const d=dist(now,z.observer)-dist(z.pos,z.observer);z.n++;const rate=Math.min(.2,1/z.n);z.move+=(+(z.dx!==0||z.dy!==0)-z.move)*rate;z.approach+=(+(d<0)-z.approach)*rate;z.retreat+=(+(d>0)-z.retreat)*rate;}
  if(s.row.learningRole==='observer'){const emit=eligible&&nearest?.c===e.c&&dist(p,now)<=10&&(t.r+t.c)%2===0;z.pending={r:t.r,observer:p,x:emit?[...features(s,t,e),...history(s,t,e,z)]:null,emit,prev:valid?(dist(now,p)<dist(z.pos,p)?0:dist(now,p)>dist(z.pos,p)?2:1):1};}
  z.pos=now;z.hp=e.hp;z.r=t.r;z.observer=p;s.enemies.set(key,z);
 }
 const own=s.own.get(t.c),label=action(t,s.team);
 if(s.row.learningRole==='expert'&&eligible&&(nearest&&dist(p,nearest)<=7||(t.r+t.c)%3===0)){
  const z=nearest?s.enemies.get(t.c+':'+nearest.c):null;out.push(record(s,t,label,[...features(s,t,nearest),...history(s,t,nearest,z)],'action',own?.label??-1));
 }
 s.own.set(t.c,{r:t.r,x:me.x,y:me.y,hp:me.hp,label});return out;
}
export function end(s){return[{task:'coverage',g:s.row.matchId,split:s.row.split,teacher:s.row.teacherId,counts:s.counts}];}
