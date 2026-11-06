#include <algorithm>
#include <cmath>
#include <iostream>
struct vec2 {int x,y;};
int cheb(vec2 a,vec2 b){return std::max(std::abs(a.x-b.x),std::abs(a.y-b.y));}
struct Info {int x=0,y=0,attack_range=3,state=1,type=3;float strength=30,focus=96;};
struct V1Body {Info info;int cd[2]{0,8};bool stun=false;float heartDash=0,spell=192,spellRange=4;int spellSlot=0,resetSlot=-1;vec2 position()const{return {info.x,info.y};}};
static float v1Response(const V1Body& b,vec2 p,int tick,bool disabled=false){
    if(disabled || (tick==0&&b.stun))return 0;
    const auto& i=b.info;const int d=cheb(b.position(),p);const bool melee=i.attack_range==1;
    const float basic=d<=i.attack_range+(melee?1:0)?i.strength:0;float best=basic;
    auto ready=[&](int k){return b.cd[k]<=tick;};
    const int t=i.type;
    // Heart can walk, then dash two tiles and land a radius-one hit/stun.
    // The native amount includes its current missing-health damage bonus.
    if(t==12&&ready(1)&&d<=3+((i.state&8)?1:0))best=std::max(best,b.heartDash+i.strength*1.5f);
    if(b.spellSlot>=0&&ready(b.spellSlot)&&d<=b.spellRange)best=std::max(best,b.spell+(d<=i.attack_range?i.strength:0));
    const bool reset=b.resetSlot>=0;const int resetSlot=b.resetSlot;
    if(reset&&ready(resetSlot)){
        if(d<=i.attack_range+(melee?1:0))best=std::max(best,2*i.strength);
        else if(!melee&&d==i.attack_range+1)best=std::max(best,i.strength);
    }
    if((t==1||t==2||t==4||t==9)&&ready(1)&&d<=i.attack_range+2+(melee?1:0))best=std::max(best,i.strength);
    return best;
}
int main(){
 V1Body cassi;cassi.info.x=3;float forecast=v1Response(cassi,{0,0},0)+v1Response(cassi,{0,0},1);
 std::cout<<"cassi_two_turn_forecast "<<forecast<<"\n";
 V1Body ryth;ryth.info={5,0,1,1,0,45,100};ryth.spell=100;ryth.spellRange=4;
 std::cout<<"ryth_distance5_forecast "<<v1Response(ryth,{0,0},0)<<"\n";
}
