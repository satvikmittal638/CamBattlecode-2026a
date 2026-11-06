
#include <algorithm>
#include <cmath>
#include <iostream>
#include <vector>
struct vec2{int x,y;};
int cheb(vec2 a,vec2 b){return std::max(std::abs(a.x-b.x),std::abs(a.y-b.y));}
struct Info{int type=6,x=0,y=0,attack_range=3,state=0;float strength=35,health=200;};
struct V1Body{Info info;float shield=0,heartDash=0,spell=0,spellRange=0,slotDamage[2]{},slotRange[2]{};int cd[2]{8,8},spellSlot=-1,resetSlot=-1;bool stun=false;vec2 position()const{return{info.x,info.y};}};
bool X_FORECAST=false,X_DECLINE=false;
static float v1Response(const V1Body& b,vec2 p,int tick,bool disabled=false){
    if(disabled || (tick==0&&b.stun))return 0;
    const auto& i=b.info;const int d=cheb(b.position(),p);const bool melee=i.attack_range==1;
    const float basic=d<=i.attack_range+(melee?1:0)?i.strength:0;float best=basic;
    auto ready=[&](int k){return b.cd[k]<=tick;};
    const int t=i.type;
    // Heart can walk, then dash two tiles and land a radius-one hit/stun.
    // The native amount includes its current missing-health damage bonus.
    if(t==12&&ready(1)&&d<=3+((i.state&8)?1:0))best=std::max(best,b.heartDash+i.strength*1.5f);
    if(X_FORECAST){
        for(int k=0;k<2;++k)if(ready(k)&&d<=b.slotRange[k])best=std::max(best,b.slotDamage[k]+(d<=i.attack_range?i.strength:0));
    }else if(b.spellSlot>=0&&ready(b.spellSlot)&&d<=b.spellRange)best=std::max(best,b.spell+(d<=i.attack_range?i.strength:0));
    const bool reset=b.resetSlot>=0;const int resetSlot=b.resetSlot;
    if(reset&&ready(resetSlot)){
        if(d<=i.attack_range+(melee?1:0))best=std::max(best,2*i.strength);
        else if(!melee&&d==i.attack_range+1)best=std::max(best,i.strength);
    }
    if((t==1||t==2||t==4||t==9)&&ready(1)&&d<=i.attack_range+2+(melee?1:0))best=std::max(best,i.strength);
    return best;
}

bool enough(int){return true;}void meleeParting(){}
int escapeTile(bool fixed){X_FORECAST=fixed;
 vec2 origin{0,0};std::vector<vec2> walking{{0,0},{1,0}},choices;V1Body own;own.shield=150;Info selfInfo;
 struct{void*target=nullptr;}best;constexpr float X_ESCAPERISK=.55f;constexpr bool X_MELEEHIT=false;
 const auto incoming=[](vec2 p,auto,bool,bool){return p.x==0?300.f:200.f;};
const float stayDanger=std::max(0.0f,incoming(origin,nullptr,false,false)-own.shield);
    // A fully evaluated rejected trade must not be retried by the old attack/chase fallback.
    const bool declined=X_DECLINE&&!choices.empty()&&stayDanger>0;
    if(!best.target && (stayDanger>selfInfo.health*X_ESCAPERISK||declined)){
        if(X_MELEEHIT)meleeParting();
        vec2 escape=origin;float risk=stayDanger;
        for(auto p:walking){if(!enough(33000))break;const float r=std::max(0.0f,incoming(p,nullptr,false,false)-(X_FORECAST?own.shield:0));if(r<risk-1){risk=r;escape=p;}}
        
 return escape.x;
 }return -1;
}
int main(){
 for(bool fixed:{false,true}){
  X_FORECAST=fixed;
  V1Body p;p.spell=150;p.spellRange=4;p.spellSlot=0;p.cd[0]=8;p.cd[1]=0;p.slotDamage[0]=150;p.slotRange[0]=4;p.slotDamage[1]=100;p.slotRange[1]=5;
  V1Body r;r.info.type=0;r.info.attack_range=1;r.spell=100;r.spellRange=4;r.spellSlot=0;r.cd[0]=0;r.slotDamage[0]=100;r.slotRange[0]=5;
  std::cout<<fixed<<" "<<v1Response(p,{4,0},0)<<" "<<v1Response(r,{5,0},0)<<" "<<escapeTile(fixed)<<"\n";
 }
}
