// Immutable distances are learned without delaying a usable action: turns spent
// waiting (channel, capture, spawn heal) fill the altar and group fields, so
// altarDistance()/gdist() stop using Chebyshev distance on maps whose walls
// impose long detours.
void Bot::warmGeometry(){
    if(!inited||stale||heavyFieldUsed||!enough(82000))return;
    auto& me=bc::self();if(!me.is_alive())return;
    const auto pos=me.position();
    const bool waiting=me.is_recalling()||me.is_submitting_gems()||me.is_teleporting()||me.buffs().has_stun()
        ||(capturing&&target>=0&&target<static_cast<int>(groups.size())&&groups[target].tilesBB.is_set(pos))
        ||(ownSpawnBB.is_set(pos)&&me.health()<me.max_health()-.5f);
    if(!waiting)return;
    for(auto& altar:altars){
        if(altar.route&&altar.route->complete)continue;
        if(!altar.route)altar.route=newRoute(altar.approaches);
        expand(*altar.route);
        if(altar.route->complete&&PHASE2_LOG&& &altar==&altars.front())std::printf("geo_ready %d\n",round);
        if(altar.route->complete)for(auto& group:groups){group.bankDistance=-1;group.bankCursor=0;group.bankBest=UNR;}
        return;
    }
    // Fill the committed task first, then every reachable resource objective.
    // Never expose an uncomputed field as unreachable.
    if(target>=0&&target<static_cast<int>(groups.size())){
        auto& group=groups[target];
        if(!group.route||!group.route->complete){if(!group.route)group.route=newRoute(group.tiles);expand(*group.route);return;}
    }
    for(auto& group:groups){
        if(group.dOwn==UNR||group.monolith||(!group.gems&&!group.gold)||(group.route&&group.route->complete))continue;
        if(!group.route)group.route=newRoute(group.tiles);
        expand(*group.route);return;
    }
    groupGeometryReady=true;
}
