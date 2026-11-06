// Research only: causal per-observer/per-enemy motion history, reset each match.
// Predict next personally-visible observation; do not use omniscient enemy state.
const cheb=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const direction=(x,y)=>[Math.sign(x),Math.sign(y)].join(',');
export function init({row,start}){return{row,map:start.mapInfo,tracks:new Map(),totals:{labels:0,jumpsOrGaps:0,learnedUsed:0,stayExact:0,velocityExact:0,learnedExact:0,stayError:0,velocityError:0,learnedError:0},late:{labels:0,stayExact:0,velocityExact:0,learnedExact:0,stayError:0,velocityError:0,learnedError:0}};}
function legal(s,from,delta){const p={x:from.x+delta[0],y:from.y+delta[1]},m=s.map,i=p.y*m.width+p.x;return p.x>=0&&p.y>=0&&p.x<m.width&&p.y<m.height&&!m.walls[i]&&!m.holes[i]?p:from;}
export function turn(s,t){
 if(t.self.dead||t.self.x===undefined)return[];
 for(const e of t.en){
  const key=t.c+':'+e.c,now={x:e.x,y:e.y};let z=s.tracks.get(key);
  if(!z){z={last:null,r:-100,delta:[0,0],n:0,models:new Map(),pending:null};s.tracks.set(key,z);}
  const gap=t.r-z.r,dx=z.last?now.x-z.last.x:0,dy=z.last?now.y-z.last.y:0;
  const usable=z.last&&gap===1&&Math.max(Math.abs(dx),Math.abs(dy))<=3;
  if(z.pending&&usable){
   for(const counts of [s.totals,...z.n>=10?[s.late]:[]]){counts.labels++;for(const model of ['stay','velocity','learned']){const err=cheb(z.pending[model],now);counts[model+'Error']+=err;counts[model+'Exact']+=err===0;}}
   let table=z.models.get(z.pending.context);if(!table){table=new Map();z.models.set(z.pending.context,table);}const delta=[dx,dy].join(',');table.set(delta,(table.get(delta)||0)+1);z.n++;
  }else if(z.last)s.totals.jumpsOrGaps++;
  const prevDelta=usable?[dx,dy]:[0,0];
  const context=direction(...prevDelta)+'|'+(cheb(now,t.self)<=4?'near':'far')+'|'+(e.hp/e.mhp<.35?'low':'ok');
  const stationary=now,velocity=legal(s,now,prevDelta);let learned=velocity;
  const table=z.models.get(context),n=table?[...table.values()].reduce((a,b)=>a+b,0):0;
  if(n>=4){const mode=[...table].sort((a,b)=>b[1]-a[1])[0][0].split(',').map(Number);learned=legal(s,now,mode);s.totals.learnedUsed++;}
  // A currently observed channel is direct evidence of staying; use it in all
  // moving predictors so learning gets no artificial advantage from this rule.
  if(e.st&(2|4|4096))learned=now;
  const knownVelocity=(e.st&(2|4|4096))?now:velocity;
  z.pending={context,stay:stationary,velocity:knownVelocity,learned};z.last=now;z.r=t.r;z.delta=prevDelta;
 }
 return[];
}
export function end(s){return[{matchId:s.row.matchId,map:s.row.map,opponent:s.row.opponent,result:s.row.result,totals:s.totals,late:s.late}];}
