// State-reactive behavioral reconstruction. No replay action tables or private
// opponent state are used. See analysis/mite_reconstruction_2026-10-30/policy_notes.md.
#include "bot.h"
#include <cstdio>
#include "policy.h"
#include <algorithm>
#include <cmath>
#include <optional>
#include <variant>
static bool fuel(int amount=18000){return bc::fuel_remaining()>amount;}
int Model::distance(bc::vec2 a,bc::vec2 b)const{return std::max(std::abs(a.x-b.x),std::abs(a.y-b.y));}
void Model::refreshSelf(){bc::detail::check(bc::detail::sdk_champion(selfId,&self));}
void Model::init(){
 if(!setup){
  W=bc::map::width();H=bc::map::height();selfId=static_cast<unsigned>(static_cast<bc::handle_champion_t>(bc::self()));refreshSelf();type=self.type;
  bc::detail::check(bc::detail::sdk_champion_design(type,&kit));
  spawn=bc::map::spawn_region(bc::team::ally);enemySpawn=bc::map::spawn_region(bc::team::enemy);bushes=bc::map::bushes();blockedStatic=bc::map::walls()|bc::map::holes()|bc::map::altars()|enemySpawn;
  altars=bc::map::altars().positions();rawGroups=bc::map::camp_groups();tileGroup.assign(W*H,-1);
  auto roster=bc::champions(bc::team::ally);std::vector<std::pair<unsigned,int>> handles;
  for(auto c:roster)handles.push_back({static_cast<unsigned>(static_cast<bc::handle_champion_t>(c)),static_cast<int>(c.champion_name())});
  std::sort(handles.begin(),handles.end());for(int i=0;i<static_cast<int>(handles.size());++i){allyTypes.push_back(handles[i].second);if(handles[i].first==selfId)slot=i;}
  setup=true;
 }
 auto byte=[](int k){return std::to_integer<unsigned char>(bc::draft_memory[k]);};auto word=[&](int k){return byte(k)|(byte(k+1)<<8);};
 const bool metadata=bc::draft_memory.size()>=1024&&byte(0)=='M'&&byte(1)=='R'&&word(4)==static_cast<int>(rawGroups.size());
 while(initCursor<static_cast<int>(rawGroups.size())&&fuel(65000)){
  const auto rg=rawGroups[initCursor];CampGoal g{rg};g.tiles=rg.spawn_tiles();g.positions=g.tiles.positions();g.gold=rg.gold_value();g.gems=rg.gem_value();g.respawn=rg.max_respawn_timer();long x=0,y=0;
  for(auto p:g.positions){x+=p.x;y+=p.y;tileGroup[p.y*W+p.x]=initCursor;}g.center={int(x/std::max<std::size_t>(1,g.positions.size())),int(y/std::max<std::size_t>(1,g.positions.size()))};
  for(auto c:rg.camps()){auto s=c.base_stats();g.hp+=s.base_health;g.hpLeft+=s.base_health;g.damage+=s.base_strength;g.boss|=c.is_monolith();}
  if(metadata&&initCursor<250){g.home=word(16+4*initCursor);g.enemy=word(18+4*initCursor);}else{g.home=65535;g.enemy=65535;for(auto p:spawn.positions())g.home=std::min(g.home,distance(p,g.center));for(auto p:enemySpawn.positions())g.enemy=std::min(g.enemy,distance(p,g.center));}
  groups.push_back(std::move(g));++initCursor;
 }
 ready=initCursor==static_cast<int>(rawGroups.size());
 if(ready&&altarFields.size()<altars.size()&&fuel(60000)){bc::bitboard roots,visited;roots.draw_chebyshev(altars[altarFields.size()],1);roots&=~blockedStatic;bc::distance_field f;f.compute(blockedStatic,roots,visited);altarFields.push_back(std::move(f));}
 if(ready&&gate==-1){bc::bitboard allBoss;for(const auto& g:groups)if(g.boss)allBoss|=g.tiles;for(auto altar:altars){bc::bitboard approach;approach.draw_chebyshev(altar,1);approach&=~blockedStatic;if(approach.is_empty()||!(approach&~allBoss).is_empty())continue;for(int i=0;i<int(groups.size());++i)if(groups[i].boss&&!(groups[i].tiles&approach).is_empty()&&(gate<0||groups[i].home<groups[gate].home))gate=i;}}

}
void Model::sense(){
 allies.clear();enemies.clear();camps.clear();refreshSelf();bc::detail::check(bc::detail::sdk_champion_items(selfId,items));bc::detail::check(bc::detail::sdk_champion_gems(selfId,&gems));bc::detail::check(bc::detail::sdk_champion_gold(selfId,&gold));
 for(int i=0;i<2;++i)bc::detail::check(bc::detail::sdk_champion_cooldown(selfId,i,&cooldown[i]));
 for(auto side:{bc::team::ally,bc::team::enemy})for(auto p:bc::vision::champion_tiles(side).positions()){
  if(!fuel(48000))break;unsigned id=0;bc::detail::champion_info s{};if(bc::detail::sdk_champion_at(p.x,p.y,&id)||id==selfId||bc::detail::sdk_champion(id,&s)||s.health<=0)continue;unsigned bag=0;bc::detail::sdk_champion_gems(id,&bag);SeenUnit c{id,p,s.health,s.max_health,s.strength,s.attack_range,s.type,int(bag)};(side==bc::team::ally?allies:enemies).push_back(c);
 }
 auto vision=bc::vision::visible_tiles();
 for(int i=0;i<static_cast<int>(groups.size());++i){if(!fuel(42000))break;auto& g=groups[i];if((g.tiles&vision).is_empty())continue;try{auto s=g.group.state();g.seen=round;if(std::holds_alternative<bc::map::camp_group_alive>(s))g.state=1;else if(std::holds_alternative<bc::map::camp_group_reward_available>(s))g.state=2;else{g.state=3;g.until=round+std::get<bc::map::camp_group_respawning>(s).timer;}}catch(...) {}}
 bc::bitboard local;local.draw_chebyshev({self.x,self.y},8);
 for(auto p:(bc::vision::camp_tiles()&local).positions()){
  if(!fuel(36000))break;unsigned id;bc::detail::camp_state c{};if(bc::detail::sdk_camp_at(p.x,p.y,&id)||bc::detail::sdk_camp(id,&c)||c.health<=0)continue;camps.push_back({id,p,c.health,c.strength,tileGroup[p.y*W+p.x]});
 }
 for(auto& g:groups){if(g.seen!=round||g.state!=1)continue;float hp=0;bool observed=false;for(const auto& c:camps)if(c.group==int(&g-groups.data())){hp+=c.hp;observed=true;}if(observed)g.hpLeft=hp;}
 if(slot<8){for(int i=0;i<8;++i)shared[i]=bc::shared_memory[i];}
}
void Model::claim(bool capture){
 if(slot>=8)return;const std::uint8_t value=target>=0&&target<127?std::uint8_t(target+1)|(capture?128:0):0;if(shared[slot]!=value){bc::shared_memory[slot]=value;shared[slot]=value;}
}
bc::bitboard Model::blockers()const{auto b=blockedStatic|bc::vision::champion_tiles()|bc::vision::camp_tiles()|bc::vision::teleport_tiles();b.set({self.x,self.y},false);return b;}
bool Model::cast(int k,unsigned kind,unsigned id,bc::vec2 p){
 if(casted||cooldown[k]||!fuel(10000)||!bc::self().can_cast())return false;int used=0;const int code=bc::detail::sdk_cast(k,kind,id,p.x,p.y,&used);if(code||!used)return false;casted=true;refreshSelf();return true;
}
bool Model::move(const bc::bitboard& roots,bool dash,bool flee){
 if(!fuel(24000)||!bc::self().can_move())return false;const bc::vec2 pos{self.x,self.y};auto blocked=blockers();auto goals=roots&~blocked;if(goals.is_empty()||goals.is_set(pos))return false;
 bc::distance_field f;bc::bitboard visited;f.compute(blocked&~goals,goals,visited);if(!fuel(12000))return false;const int here=f.get(pos);if(here==65535)return false;
 bc::vec2 best=pos;int score=1000000000;for(auto p:blocked.reachable_tiles(pos,1).positions()){int d=f.get(p);if(d>=here)continue;int s=d*100+(bushes.is_set(p)?0:1);if(flee)for(const auto& e:enemies)s+=std::max(0,e.range+2-distance(e.pos,p))*40;if(s<score){score=s;best=p;}}
 bool acted=false;if(best!=pos){int used=0;if(!bc::detail::sdk_move_to(best.x,best.y,&used)&&used){moved=true;acted=true;refreshSelf();}}
 if(dash&&!casted&&fuel(16000))for(int k=0;k<2;++k){auto a=kit.definition.abilities[k];if(a.kind!=6||cooldown[k])continue;auto reachable=(blocked&~bc::map::holes()).reachable_tiles({self.x,self.y},static_cast<unsigned short>(a.payload.dash.range))&~blocked;bc::vec2 dest{self.x,self.y};int bd=f.get(dest);for(auto p:reachable.positions()){int d=f.get(p);if(d+1<bd){bd=d;dest=p;}}if(dest!=bc::vec2{self.x,self.y}&&cast(k,0,0,dest)){moved=acted=true;}break;}
 return acted;
}
void Model::shop(){
 int allowed=0;if(bc::detail::sdk_champion_can_shop(selfId,0,&allowed)||!allowed)return;
 // Fresh evidence: Jungle first. Defensive follow-up is conditional on contact,
 // economy follow-up is conditional on having farmed without contact.
 const bool focus=type==3||type==5||type==6||type==7||type==11||type==12;
 const int stat=focus?1:0;
 struct Item{int family,stat,count;};std::vector<Item> plan{{4,stat,5}};
 if(contactSeen){plan.push_back({6,2,5});plan.push_back({0,type==12?2:stat,5});plan.push_back({2,2,5});}
 else{plan.push_back({0,type==12?2:stat,5});plan.push_back({10,stat,5});plan.push_back({3,stat,5});plan.push_back({6,2,5});}
 plan.push_back({6,type==11?0:stat,5});plan.push_back({1,stat,10000});
 bc::detail::sdk_champion_items(selfId,items);bc::detail::sdk_champion_gold(selfId,&gold);
 for(auto item:plan){int i=item.family*6+item.stat*2;int count=items[i]+5*items[i+1];int need=item.count-count;if(need<=0)continue;int n=std::min<int>(need,gold/30);if(n<=0)break;int take=std::min<int>(n,5-items[i]);if(take<=0)take=1;if(bc::detail::sdk_buy_item(i,take))break;bc::detail::sdk_champion_gold(selfId,&gold);bc::detail::sdk_champion_items(selfId,items);if(gold<30||!fuel(20000))break;}
 refreshSelf();
}
void Model::ward(){
 if(!fuel(20000))return;auto& me=bc::self();if(me.ward_cooldown())return;auto choices=me.ward_placement_tiles();bc::vec2 pos{self.x,self.y},best=pos;int score=-100000;
 for(auto p:choices.positions()){int s=distance(pos,p)*3+(bushes.is_set(p)?2:0);if(!enemies.empty()){int ed=100;for(const auto& e:enemies)ed=std::min(ed,distance(p,e.pos));s-=ed*5;}else if(target>=0)s-=distance(p,groups[target].center);if(s>score){score=s;best=p;}}
 if(score>-100000){int used=0;bc::detail::sdk_place_ward(best.x,best.y,&used);}
}
bool Model::healthyHome(){return spawn.is_set({self.x,self.y})&&self.health<self.max_health-.5f;}
bool Model::retreat(){
 if(self.health>=self.max_health*policy::recallHp)return false;
 int near=99;for(auto& e:enemies)near=std::min(near,distance(e.pos,{self.x,self.y}));
 if(near>6){if(!bc::detail::sdk_recall())recallHold=true;return true;}
 move(spawn,true,true);if(!casted)for(int k=0;k<2;++k)if(kit.definition.abilities[k].kind==7&&cast(k,0,0,{-1,-1}))break;
 if(!moved)attack(true);return true;
}
bool Model::offensive(bool champion,int group){
 if(casted||!fuel(13000)||!bc::self().can_cast())return false;const bc::vec2 pos{self.x,self.y};
 for(int k=0;k<2;++k){const auto a=kit.definition.abilities[k];if(cooldown[k]||(moved&&(a.attributes&1)))continue;
  const bool damaging=a.kind==2||a.kind==3||a.kind==4;if(!damaging)continue;
  if(champion?!(a.targets&bc::detail::ability_target_enemies):!(a.targets&bc::detail::ability_target_camps))continue;
  float reach=a.kind==2?a.payload.damage.range:a.kind==3?a.payload.aoe_damage.range:a.payload.cc.range;
  unsigned id=0;bc::vec2 dest=pos;float best=-1e9;
  if(champion){for(const auto& e:enemies){if(distance(e.pos,pos)>reach)continue;float score=-e.hp+e.gems*2;if(score>best){best=score;id=e.id;dest=e.pos;}}}
  else{for(const auto& c:camps){if((group>=0&&c.group!=group)||distance(c.pos,pos)>reach)continue;float score=c.hp;if(a.kind==4&&a.payload.cc.modifier<=0)score=c.strength*100;if(score>best){best=score;id=c.id;dest=c.pos;}}}
  if(best>-1e9){unsigned kind=champion?1:2;if(cast(k,kind,id,{-1,-1}))return true;}
 }
 return false;
}
bool Model::attack(bool champion,int group){
 if(!fuel(11000)||!bc::self().can_attack())return false;unsigned id=0;float best=-1e9;const bc::vec2 pos{self.x,self.y};
 if(champion){for(auto& e:enemies)if(distance(e.pos,pos)<=self.attack_range){bc::detail::champion_info now{};if(bc::detail::sdk_champion(e.id,&now)||now.health<=0)continue;float score=-now.health+e.gems*2;if(score>best){best=score;id=e.id;}}}
 else{for(auto& c:camps)if((group<0||c.group==group)&&distance(c.pos,pos)<=self.attack_range){bc::detail::camp_state now{};if(bc::detail::sdk_camp(c.id,&now)||now.health<=0)continue;float score=-now.health;if(type==10){score=0;for(auto& other:camps)if(distance(other.pos,c.pos)<=1)score+=std::min(other.hp,self.strength);}if(score>best){best=score;id=c.id;}}}
 if(best<=-1e9)return false;if(bc::detail::sdk_attack(champion?1:2,id))return false;attacked=true;refreshSelf();return true;
}
void Model::resetAttack(bool champion,int group){
 if(!attacked||casted||!fuel(14000))return;for(int k=0;k<2;++k)if(kit.definition.abilities[k].kind==1&&!cooldown[k]){if(cast(k,0,0,{-1,-1}))attack(champion,group);return;}
}
bool Model::fight(){
 if(enemies.empty())return false;const bc::vec2 pos{self.x,self.y};float friendly=self.health,enemyHp=0;int near=99;bc::vec2 enemyPos=pos;
 for(auto& a:allies)if(distance(a.pos,pos)<=4)friendly+=a.hp;for(auto& e:enemies)if(distance(e.pos,pos)<=6){enemyHp+=e.hp;if(distance(e.pos,pos)<near){near=distance(e.pos,pos);enemyPos=e.pos;}}
 if(near>7)return false;contactSeen=true;const float share=friendly/std::max(1.f,friendly+enemyHp);
 if(share<policy::escapeShare&&near<=4){move(spawn,true,true);offensive(true);attack(true);return true;}
 if(near<=self.attack_range){offensive(true);attack(true);resetAttack(true,-1);if(!casted)for(int k=0;k<2;++k)if(kit.definition.abilities[k].kind==7&&cast(k,0,0,{-1,-1}))break;return attacked||casted;}
 if(offensive(true))return true;
 if(near<=5&&share>=.48f){bc::bitboard goals;goals.draw_chebyshev(enemyPos,self.attack_range);move(goals,true);if(self.attack_range<=1){offensive(true);attack(true);resetAttack(true,-1);}return moved||attacked||casted;}
 return false;
}
int Model::nearestAltar(bc::vec2 pos)const{int best=-1,bd=65535;for(int i=0;i<int(altars.size());++i){int d=altarFields.size()==altars.size()?int(altarFields[i].get(pos)):distance(pos,altars[i]);if(d<bd){bd=d;best=i;}}return best;}
int Model::choose(){
 // A task is an obligation to finish useful work. Replan after capture/respawn,
 // a confirmed allied capturer, or sustained failure to act, never just because
 // another full-health camp briefly outranks the partially cleared target.
 if(target>=0&&target<int(groups.size())&&groups[target].state!=3&&stuck<12){bool owned=false;for(int s=0;s<int(allyTypes.size())&&s<8;++s)if(s!=slot&&(shared[s]&128)&&(shared[s]&127)==target+1)owned=true;if(!owned)return target;}
 float best=-1;int chosen=-1;const bc::vec2 pos{self.x,self.y};
 std::vector<std::pair<int,int>> nearest;for(int i=0;i<int(groups.size());++i)if(!groups[i].boss&&groups[i].home!=65535)nearest.push_back({distance(pos,groups[i].center),i});
 std::sort(nearest.begin(),nearest.end());if(nearest.size()>20)nearest.resize(20);
 for(auto [d,i]:nearest){if(!fuel(28000))break;const auto& g=groups[i];float wait=g.state==3?std::max(0,g.until-round-d):0;float hp=g.state==2?0:(round-g.seen<10?g.hpLeft:g.hp);
  float alliesDps=0;int claims=0;bool captured=false;for(int s=0;s<int(allyTypes.size())&&s<8;++s){if(s==slot)continue;if((shared[s]&127)==i+1){claims++;alliesDps+=60;captured|=shared[s]&128;}}if(captured)continue;
  float ownDamage=self.strength*1.2f+((type==7||type==12||type==11)?self.focus*.2f:0.f);float clear=hp/std::max(20.f,ownDamage+alliesDps);float score=(g.gems+policy::goldWeight*g.gold)/(8+d+clear+wait+5);
  if(g.home>g.enemy+6)score*=.65f;if(claims)score*=policy::claimPenalty;
  if(clear*g.damage>self.health*2.5f)score*=.25f;if(i==lastGoal&&stuck>=12)score*=.01f;
  if(score>best){best=score;chosen=i;}
 }
 return chosen;
}
bool Model::bank(){
 if(!gems||altars.empty()||(gate>=0&&groups[gate].state!=3))return false;const bc::vec2 pos{self.x,self.y};int a=nearestAltar(pos);if(a<0)return false;int d=altarFields.size()==altars.size()?int(altarFields[a].get(pos)):distance(pos,altars[a]);
 bool blockedByBoss=false;bc::bitboard approaches;approaches.draw_chebyshev(altars[a],1);approaches&=~blockedStatic;
 for(const auto& c:camps)if(c.strength>0&&approaches.is_set(c.pos)&&c.group>=0&&groups[c.group].boss)blockedByBoss=true;
 if(blockedByBoss&&gems<200&&round<600)return false;
 if(d>1&&gems<policy::bankBag){int t=choose();if(t>=0&&distance(groups[t].center,pos)<=d+2)return false;}
 if(d<=1){if(!bc::detail::sdk_submit_gems(altars[a].x,altars[a].y)){wasBanking=true;return true;}return false;}
 return move(approaches,true);
}
void Model::farm(){
 const bc::vec2 pos{self.x,self.y};target=choose();if(target<0)return;auto& g=groups[target];
 if(g.state==2){
  if(g.tiles.is_set(pos)){claim(true);captureGoal=target;recallHold=gold+g.gold>=150&&gems==0;if(recallHold&&!bc::self().is_recalling())bc::detail::sdk_recall();return;}
  move(g.tiles,true);if(g.tiles.is_set({self.x,self.y})){captureGoal=target;claim(true);recallHold=gold+g.gold>=150&&gems==0;if(recallHold)bc::detail::sdk_recall();}return;
 }
 std::printf("F r%d t%d gid%d state%d rem%.0f base%.0f pos%d,%d c%d gold%d gems%d hp%.0f fuel%d\n",round,type,target,g.state,g.hpLeft,g.hp,self.x,self.y,int(camps.size()),gold,gems,self.health,int(bc::fuel_remaining()));
 claim(false);if(g.state==3&&g.until>round+2){bc::bitboard outside;outside.draw_chebyshev(g.center,std::max(2,int(g.positions.size())));outside&=~g.tiles;move(outside,false);return;}
 offensive(false,target);attack(false,target);resetAttack(false,target);
 if(!attacked&&!casted){bc::bitboard goals;for(auto& c:camps)if(c.group==target)goals.draw_chebyshev(c.pos,self.attack_range);if(goals.is_empty())for(auto p:g.positions)goals.draw_chebyshev(p,self.attack_range);goals&=~g.tiles;if(move(goals,true)&&self.attack_range<=1){offensive(false,target);attack(false,target);resetAttack(false,target);}}
 if(!casted&&attacked)for(int k=0;k<2;++k)if(kit.definition.abilities[k].kind==7&&cast(k,0,0,{-1,-1}))break;
}
void Model::turn(){
 round=bc::round_number();moved=attacked=casted=false;if(!ready||altarFields.size()<altars.size())init();if(!setup||groups.empty())return;
 if(!bc::self().is_alive()){shop();target=-1;claim();recallHold=false;return;}
 sense();if(!ready)return;std::printf("T r%d t%d pos%d,%d hp%.0f target%d fuel%d\n",round,type,self.x,self.y,self.health,target,int(bc::fuel_remaining()));
 if(bc::self().is_submitting_gems()||bc::self().is_teleporting())return;
 if(bc::self().is_recalling()){if(recallHold&&((captureGoal>=0&&groups[captureGoal].state==2)||self.health<self.max_health*policy::recallHp))return;bc::detail::sdk_cancel_channel();refreshSelf();}
 recallHold=false;shop();if(healthyHome())return;
 const bc::vec2 pos{self.x,self.y};if(lastRound==round-1&&lastPosition==pos&&lastGoal==target)++stuck;else stuck=0;lastRound=round;lastPosition=pos;lastGoal=target;
 if(retreat()){claim();return;}
 if(!fight())if(!gateWork())if(!bank())farm();if(moved||attacked||casted)stuck=0;ward();
 int near=99;for(auto& e:enemies)near=std::min(near,distance(e.pos,{self.x,self.y}));int priority=near<99?100-near:1000+int(self.health/50);if(attacked&&near<99)priority+=2000;bc::detail::sdk_set_priority(priority);
 claim(captureGoal==target&&target>=0&&groups[target].tiles.is_set({self.x,self.y}));
 if(!bc::self().is_submitting_gems()&&!bc::self().is_recalling())bc::detail::sdk_recall();
}

bool Model::gateWork(){
 if(gate<0||groups[gate].state==3)return false;
 // The observed late gate assault is a readiness transition, not a fixed clock.
 // Each champion publishes its own bag readiness in the two spare shared bytes.
 if(gems>=200&&slot<6)bc::shared_memory[6]=std::uint8_t(static_cast<std::uint8_t>(bc::shared_memory[6])|(1u<<slot));
 int readyMask=static_cast<std::uint8_t>(bc::shared_memory[6]);int count=0;for(int i=0;i<6;++i)count+=(readyMask>>i)&1;
 gateReady=gateReady||count>=std::min(3,int(allyTypes.size()))||gems>=500;
 if(!gateReady)return false;target=gate;auto& g=groups[gate];
 offensive(false,gate);attack(false,gate);resetAttack(false,gate);
 if(!attacked&&!casted){bc::bitboard roots;for(const auto& c:camps)if(c.group==gate)roots.draw_chebyshev(c.pos,self.attack_range);if(roots.is_empty())for(auto p:g.positions)roots.draw_chebyshev(p,self.attack_range);roots&=~g.tiles;move(roots,true);if(self.attack_range<=1){offensive(false,gate);attack(false,gate);resetAttack(false,gate);}}
 return true;
}
