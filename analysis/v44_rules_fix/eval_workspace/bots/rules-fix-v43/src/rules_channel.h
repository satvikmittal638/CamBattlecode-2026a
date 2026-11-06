#pragma once
#include <cambc.h>
#include "rules_policy.h"

namespace rules_runtime {
// Public, personally visible information only. A reachable ready stun is a
// risk, not a prediction that the opponent sees us or will choose to cast.
template<class Enough> bool tribute_interrupt_risk(Enough enough) {
    namespace bc=cambc;
    auto& me=bc::self();
    if(me.champion_name()==bc::champion_type::marcella||me.gem_count()==0)return false;
    const auto pos=me.position();
    for(auto p:bc::vision::champion_tiles(bc::team::enemy).positions()) {
        if(!enough(28000))return false;
        unsigned id=0;bc::detail::champion_info foe{};
        if(bc::detail::sdk_champion_at(p.x,p.y,&id)||bc::detail::sdk_champion(id,&foe)||!(foe.state&1))continue;
        const int walking=(foe.state&8)?1:0;
        const int d=rules_policy::distance(pos.x,pos.y,p.x,p.y);
        // Marcella's already-enhanced basic attack can stun without a cast.
        if(foe.type==static_cast<int>(bc::champion_type::marcella)) {
            bc::detail::buff_data buffs[3]{};unsigned n=0;
            if(!bc::detail::sdk_champion_buff_data(id,buffs,3,&n))
                for(unsigned j=0;j<std::min(n,3u);++j)
                    if(buffs[j].type==2&&buffs[j].data.enhanced_attack.duration>0&&d<=foe.attack_range+walking)return true;
        }
        for(unsigned slot=0;slot<2;++slot) {
            if(!enough(25000))return false;
            int cd=0;bc::detail::ability_props a{};
            if(bc::detail::sdk_champion_cooldown(id,slot,&cd)||cd||bc::detail::sdk_champion_ability_props(id,slot,&a))continue;
            float range=0,radius=0;int duration=0;bool enhanced=false;
            if(a.kind==1)enhanced=a.payload.enhanced_attack!=0;
            if(a.kind==4){range=a.payload.cc.range;duration=a.payload.cc.duration;}
            if(a.kind==3){range=a.payload.aoe_damage.range;radius=a.payload.aoe_damage.radius;duration=a.payload.aoe_damage.duration;}
            if(a.kind==6){range=a.payload.dash.range;radius=a.payload.dash.radius;duration=a.payload.dash.duration;}
            const float reach=rules_policy::interrupt_reach(a.kind,range,radius,duration,enhanced,foe.attack_range,walking);
            if(reach>0&&d<=reach)return true;
        }
    }
    return false;
}
}
