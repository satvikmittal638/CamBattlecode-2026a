// Called only after a completed dynamic walking field reports UNR.
// Export one field instead of issuing a host query for every dash landing.
bool Bot::bridgeDash(const Route& route,const bc::bitboard& blocked,vec2 pos){
    if(castThisTurn||!enough(48000))return false;
    const auto& kit=v1KitForType(static_cast<int>(myType));
    int slot=-1,range=0;
    for(int k=0;k<2;++k)if(kit.definition.abilities[k].kind==6){slot=k;range=kit.definition.abilities[k].payload.dash.range;break;}
    if(slot<0||range<=0||range>4)return false;
    auto& me=bc::self();int cd=8;
    const auto id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    if(bc::detail::sdk_champion_cooldown(id,slot,&cd)||cd||!me.can_cast()||!enough(40000))return false;
    const auto holes=bc::map::holes();
    const auto reach=((blocked&~holes).reachable_tiles(pos,range)&~blocked).positions();
    const auto distance=route.distance.export_linear_buffer();
    if(!enough(26000))return false;
    std::vector<std::pair<int,vec2>> options;
    for(auto p:reach){const int d=distance[idx(p)];if(d!=UNR&&d+1<UNR)options.push_back({d,p});}
    std::sort(options.begin(),options.end(),[](const auto& a,const auto& b){return a.first<b.first;});
    for(unsigned k=0;k<options.size()&&k<3&&enough(22000);++k){const auto p=options[k].second;
        try{
            if(capturing&&(target<0||target>=static_cast<int>(groups.size())||!groups[target].tilesBB.is_set(p)))releaseCapture();
            if(ACT(([&](){std::int32_t used=0;bc::detail::check(bc::detail::sdk_cast(slot,0,0,p.x,p.y,&used));return used!=0;})())){
                castThisTurn=true;return true;
            }
        }catch(const TurnAbort&){throw;}catch(...){}
    }
    return false;
}
