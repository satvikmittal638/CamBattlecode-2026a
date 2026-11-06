// In the mandatory-gate scenario, a stationary tribute should not bypass
// response to a personally visible ready interrupt. This is a risk estimate,
// not knowledge that the enemy personally sees us or will choose that spell.
bool Bot::bankChannelThreat(){
    if(bankGate<0||(myType!=bc::champion_type::cassi&&myType!=bc::champion_type::issac))return false;
    const auto pos=bc::self().position();
    // A previously evaluated risk does not disappear as planning uses fuel.
    if(channelThreatRound==round&&channelThreatPosition==pos)return channelThreatValue;
    if(!enough(34000))return false;
    channelThreatRound=round;channelThreatPosition=pos;channelThreatValue=false;
    bc::bitboard area;area.draw_chebyshev(pos,5);
    for(auto p:(bc::vision::champion_tiles(team::enemy)&area).positions()){
        if(!enough(26000))return false;
        unsigned id;bc::detail::champion_info foe{};
        if(bc::detail::sdk_champion_at(p.x,p.y,&id)||bc::detail::sdk_champion(id,&foe)||!(foe.state&1))continue;
        for(int slot=0;slot<2;++slot){
            int cd=8;bc::detail::ability_props spell{};
            if(bc::detail::sdk_champion_cooldown(id,slot,&cd)||cd||bc::detail::sdk_champion_ability_props(id,slot,&spell))continue;
            float range=0;
            if(spell.kind==4)range=spell.payload.cc.range;
            if(spell.kind==3&&spell.payload.aoe_damage.duration>0)range=spell.payload.aoe_damage.range+spell.payload.aoe_damage.radius;
            if(range>0&&cheb(pos,p)<=range){channelThreatValue=true;return true;}
        }
    }
    return false;
}
