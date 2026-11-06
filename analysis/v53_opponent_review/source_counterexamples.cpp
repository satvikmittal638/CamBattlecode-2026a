
#include <algorithm>
#include <cmath>
#include <iostream>
#include <vector>
struct vec2 {int x,y;};
int cheb(vec2 a,vec2 b){return std::max(std::abs(a.x-b.x),std::abs(a.y-b.y));}
struct Info {int type=6,x=0,y=0,attack_range=3,state=0;float strength=35,health=200;};
struct V1Body {Info info;float shield=0,heartDash=0,spell=0,spellRange=0;int cd[2]{8,8},spellSlot=-1,resetSlot=-1;bool stun=false;vec2 position()const{return {info.x,info.y};}};
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

bool enough(int){return true;}void meleeParting(){}
int main(){
 V1Body prism;prism.spell=150;prism.spellRange=4;prism.spellSlot=0;prism.cd[0]=8;prism.cd[1]=0;
 const float predicted=v1Response(prism,{4,0},0);
 std::cout << "{\"prism\":{\"v53PredictedDamage\":"<<predicted<<",\"readyAoeDamage\":100},";
 V1Body ryth;ryth.info.type=0;ryth.info.attack_range=1;ryth.spell=100;ryth.spellRange=4;ryth.spellSlot=0;ryth.cd[0]=0;ryth.cd[1]=8;ryth.resetSlot=1;
 std::cout << "\"aoeReach\":{\"v53PredictedDamage\":"<<v1Response(ryth,{5,0},0)<<",\"legalAoeDamage\":100},";
 vec2 origin{0,0};std::vector<vec2> walking{{0,0},{1,0}};V1Body own;own.shield=150;Info selfInfo;selfInfo.health=200;
 struct {void* target=nullptr;} best;
 constexpr float X_ESCAPERISK=.55f;constexpr bool X_MELEEHIT=false;
 const auto incoming=[](vec2 p,auto,bool,bool){return p.x==0?300.f:200.f;};
 const float stayDanger=incoming(origin,nullptr,false,false)-own.shield;
    if(!best.target && stayDanger>selfInfo.health*X_ESCAPERISK){
        if(X_MELEEHIT)meleeParting();
        vec2 escape=origin;float risk=stayDanger;
        for(auto p:walking){if(!enough(33000))break;const float r=incoming(p,nullptr,false,false);if(r<risk-1){risk=r;escape=p;}}
        
 std::cout << "\"escape\":{\"chosenTile\":"<<escape.x<<",\"saferTile\":1,\"stayHpDamage\":150,\"moveHpDamage\":50}}\n";
 }
}
