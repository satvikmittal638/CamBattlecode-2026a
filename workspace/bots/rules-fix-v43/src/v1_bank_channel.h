// Shared by both controllers, all maps and all stun-susceptible champions.
bool Bot::bankChannelThreat(){
    const auto pos=bc::self().position();
    if(channelThreatRound==round&&channelThreatPosition==pos)return channelThreatValue;
    if(!enough(34000))return false;
    channelThreatRound=round;channelThreatPosition=pos;
    channelThreatValue=rules_runtime::tribute_interrupt_risk([](unsigned reserve){return enough(reserve);});
    return channelThreatValue;
}
