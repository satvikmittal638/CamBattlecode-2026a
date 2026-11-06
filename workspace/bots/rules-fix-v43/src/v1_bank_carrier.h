// A rejected bank must not fall through to farming into the same control zone.
// Keep the ordinary combat/help decision first, then take an affordable escape.
[[gnu::noinline]] bool Bot::retreatBankCarrier(){
    auto& me=bc::self();
    if(me.gem_count()==0||!bankChannelThreat())return false;
    releaseCapture();target=-1;stage="bank-carrier-disengage";
    if(!me.can_move()||!enough(30000))return true;
    const auto origin=me.position();const auto threats=bc::vision::champion_tiles(team::enemy).positions();
    if(threats.empty())return false;
    const auto homes=ownSpawnBB.positions();const bool closed=bankGateClosed();
    auto score=[&](vec2 p){
        int separation=99;for(auto threat:threats)separation=std::min(separation,cheb(p,threat));
        long value=1000L*separation-heuristic(homes,p);
        if(closed)for(auto tile:groups[bankGate].tiles)if(cheb(p,tile)<=3){value-=100000;break;}
        return value;
    };
    const long current=score(origin);std::vector<std::pair<long,vec2>> options;
    for(auto p:blockedNow().reachable_tiles(origin,1).positions()){
        if(!enough(24000))break;
        if(p!=origin){const auto value=score(p);if(value>current)options.push_back({value,p});}
    }
    std::sort(options.begin(),options.end(),[](auto a,auto b){return a.first>b.first;});
    for(unsigned k=0;k<options.size()&&k<3&&enough(22000);++k){
        if(ACT(me.move_absolute(options[k].second))){previousTile=origin;movedThisTurn=true;return true;}
    }
    return true;
}
