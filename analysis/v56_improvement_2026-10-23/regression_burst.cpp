
#include <algorithm>
#include <cmath>
#include <cassert>
#include <iostream>
struct vec2{int x,y;};int cheb(vec2 a,vec2 b){return std::max(std::abs(a.x-b.x),std::abs(a.y-b.y));}
struct Ability{int kind=0,attributes=0;struct {struct{float range=0,modifier=0;}damage,cc;struct{float range=0,modifier=0;int radius=0;}aoe_damage;struct{int range=2;}dash;}payload;};
struct Kit{struct{Ability abilities[2];}definition;};Kit kits[13];
const Kit& v1KitForType(int t){return kits[t];}
float v1DamageRange(const Ability&a){return a.kind==2?a.payload.damage.range:a.kind==3?a.payload.aoe_damage.range:a.payload.cc.range;}
float v1DamageModifier(const Ability&a){return a.kind==2?a.payload.damage.modifier:a.kind==3?a.payload.aoe_damage.modifier:a.payload.cc.modifier;}
struct Info{int type=5,x=0,y=0,attack_range=3,state=8;float strength=30,focus=100;};
struct V1Body{Info info;float heartDash=0,spell=0,spellRange=0,slotDamage[2]{},slotRange[2]{};int cd[2]{8,8},spellSlot=-1,resetSlot=-1;bool stun=false;vec2 position()const{return{info.x,info.y};}};
bool X_FORECAST=true,X_LEGALBURST=true;
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

// Maximise over legal cast sequences instead of independently maximising each
// future turn. The same eight-turn-cooldown slot cannot fire on both turns.
// Positions and future walking remain estimates, not a hidden-state search.
static float v57ResponsePair(const V1Body& b,vec2 p,bool disabled=false){
    const int turns=(b.info.state&32)?1:2;
    if(!X_LEGALBURST){float value=v1Response(b,p,0,disabled);if(turns==2)value+=v1Response(b,p,1);return value;}
    const auto& i=b.info;const auto& kit=v1KitForType(i.type);const int d=cheb(b.position(),p);const bool melee=i.attack_range==1;
    auto action=[&](int slot,int tick){
        if(slot<0)return d<=i.attack_range+(melee?1:0)?i.strength:0.0f;
        if(b.cd[slot]>tick)return -1e9f;
        const auto& a=kit.definition.abilities[slot];const bool exclusive=a.attributes&1;
        const float basic=d<=i.attack_range+(melee&&!exclusive?1:0)?i.strength:0.0f;
        if(a.kind==1){
            if(d<=i.attack_range+(melee?1:0))return 2*i.strength;
            return !melee&&d==i.attack_range+1?i.strength:0.0f;
        }
        if(a.kind>=2&&a.kind<=4){
            const float reach=v1DamageRange(a)+(a.kind==3?a.payload.aoe_damage.radius:0);
            return basic+(d<=reach?i.focus*v1DamageModifier(a):0.0f);
        }
        if(a.kind==6){
            const int reach=i.attack_range+a.payload.dash.range+(melee?1:0);
            if(i.type==12)return d<=4?b.heartDash+i.strength:0.0f;
            return d<=reach?i.strength:0.0f;
        }
        return basic;
    };
    float best=0;
    for(int first=-1;first<2;++first){
        const bool skip=disabled||b.stun;
        if(skip&&first!=-1)continue;
        const float one=skip?0:action(first,0);if(one<0)continue;
        if(turns==1){best=std::max(best,one);continue;}
        for(int second=-1;second<2;++second){
            if(first>=0&&second==first)continue;
            const float two=action(second,1);if(two>=0)best=std::max(best,one+two);
        }
    }
    return best;
}

int main(){
 auto& kit=kits[5];kit.definition.abilities[0].kind=2;kit.definition.abilities[0].payload.damage={4,1.4};
 kit.definition.abilities[1].kind=3;kit.definition.abilities[1].payload.aoe_damage={4,.98,1};
 V1Body b;b.cd[0]=0;b.cd[1]=8;b.slotDamage[0]=140;b.slotRange[0]=4;
 const vec2 p{4,0};X_LEGALBURST=false;const float before=v57ResponsePair(b,p);X_LEGALBURST=true;const float after=v57ResponsePair(b,p);
 assert(std::abs(before-280)<.01&&std::abs(after-140)<.01);
 b.cd[1]=0;assert(std::abs(v57ResponsePair(b,p)-238)<.01);
 b.cd[0]=1;b.cd[1]=8;assert(std::abs(v57ResponsePair(b,p)-140)<.01);
 b.info.state|=32;b.cd[0]=0;b.cd[1]=0;assert(std::abs(v57ResponsePair(b,p)-140)<.01);
 std::cout<<"single ready spell: "<<before<<" -> "<<after<<"; independent slots, cooldown-one and one-turn horizon passed\n";
}
