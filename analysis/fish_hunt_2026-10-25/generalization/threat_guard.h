// Guard the ranged economy before a risky action consumes ordinary movement.
// Inputs are personal observations only; no map IDs or recorded trajectories.
bool Bot::metaThreatGuard(){
    if(!ranged||onSpawn()||!enough(42000))return false;
    auto& me=bc::self();const auto origin=me.position();
    const unsigned selfId=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    bc::detail::champion_info own{};if(bc::detail::sdk_champion(selfId,&own))return false;
    struct Friend{vec2 p;bc::detail::champion_info info;};std::vector<Friend> friends;
    std::vector<V1Body> foes;int nearest=99;
    for(auto p:bc::vision::champion_tiles(team::enemy).positions()){
        const int d=cheb(origin,p);if(d>6||enemySpawnBB.is_set(p))continue;
        if(!enough(34000))break;unsigned id;bc::detail::champion_info info{};
        if(!bc::detail::sdk_champion_at(p.x,p.y,&id)&&!bc::detail::sdk_champion(id,&info)&&(info.state&1)){
            foes.push_back(v1Body(id,info));nearest=std::min(nearest,d);
        }
    }
    if(foes.empty())return false;
    for(auto p:bc::vision::champion_tiles(team::ally).positions()){
        if(cheb(origin,p)>6||!enough(30000))continue;unsigned id;bc::detail::champion_info info{};
        if(!bc::detail::sdk_champion_at(p.x,p.y,&id)&&id!=selfId&&!bc::detail::sdk_champion(id,&info)&&(info.state&1)&&!(info.state&(4|4096)))friends.push_back({p,info});
    }
    auto dps=[](const bc::detail::champion_info& x){return x.strength+v1CycleCast(v1KitForType(x.type),x.strength,x.focus)/8;};
    float ours=own.health*dps(own),theirs=0;
    for(const auto& a:friends){int d=99;for(const auto& f:foes)d=std::min(d,cheb(a.p,f.position()));if(d<=6)ours+=a.info.health*dps(a.info)*std::max(.25f,(7-cheb(a.p,origin))/6.0f);}
    for(const auto& f:foes)theirs+=(f.info.health+f.shield)*dps(f.info)*std::max(.35f,(8-cheb(origin,f.position()))/6.0f);
    const auto ownKit=v1KitForType(own.type);unsigned bag=0;bc::detail::sdk_champion_gems(selfId,&bag);
    // A lethal, personally legal hit may change the local fight immediately.
    for(const auto& f:foes){
        const int d=cheb(origin,f.position());float burst=d<=own.attack_range&&me.can_attack()?own.strength:0,spell=0;
        for(int k=0;k<2;++k){int cd=8;bc::detail::sdk_champion_cooldown(selfId,k,&cd);if(cd||!me.can_cast())continue;const auto& a=ownKit.definition.abilities[k];
            if(a.kind>=2&&a.kind<=4&&d<=v1DamageRange(a))spell=std::max(spell,own.focus*v1DamageModifier(a));
            if(a.kind==1&&d<=own.attack_range)spell=std::max(spell,own.strength);
        }
        if((burst+spell)*f.mitigation>=f.info.health+f.shield&&!(f.info.type==9&&.2f*f.info.focus>=own.health))return false;
    }
    auto risk=[&](vec2 p){float value=0;for(const auto& f:foes){float share=1;for(const auto& a:friends)if(cheb(a.p,f.position())<cheb(p,f.position())&&a.info.health>a.info.max_health*.4f){share=.5f;break;}value+=v60Sequence(f,p)*share;}return value;};
    const float danger=risk(origin),ratio=ours/std::max(1.0f,theirs);
    const bool capital=myType==bc::champion_type::prism||bag>=45;
    const bool badFight=ratio<(capital?.72f:.5f)&&nearest<=6;
    const bool urgent=danger>own.health*(capital?.42f:.62f);
    if(!badFight&&!urgent)return false;
    combatWithdraw=true;releaseCapture();if(target>=0&&target<static_cast<int>(groups.size()))stalledUntil[target]=round+12;target=-1;choiceRound=-1;
    auto value=[&](vec2 p){int separation=99,ally=12;for(const auto& f:foes)separation=std::min(separation,cheb(p,f.position()));for(const auto& a:friends)ally=std::min(ally,cheb(p,a.p));return -risk(p)*10+separation*100-ally*4;};
    bool moved=false;
    // Vesper can spend a dash before an ordinary escape step.
    if(me.can_cast()&&!castThisTurn&&v1HasDash(own.type)&&enough(30000)){
        for(auto ab:me.abilities())if(ab.is_dash()&&selfReady(ab)){
            const auto blocked=blockedNow();const auto passable=blocked&~bc::map::holes();vec2 best=origin;float score=value(origin);
            for(auto p:(passable.reachable_tiles(origin,2)&~blocked).positions()){if(!enough(23000))break;const float v=value(p);if(v>score+30){score=v;best=p;}}
            if(best!=origin)try{if(ACT(ab.use(best))){castThisTurn=true;moved=true;}}catch(const TurnAbort&){throw;}catch(...){}
            break;
        }
    }
    if(me.can_move()&&enough(22000)){
        const auto pos=me.position(),blocked=blockedNow();vec2 best=pos;float score=value(pos);
        for(auto p:blocked.reachable_tiles(pos,1).positions()){if(p==pos)continue;const float v=value(p);if(v>score+1){score=v;best=p;}}
        if(best!=pos)try{if(ACT(me.move_absolute(best))){previousTile=pos;movedThisTurn=true;moved=true;}}catch(const TurnAbort&){throw;}catch(...){}
    }
    stage=moved?"meta-preemptive-kite":"meta-threat-hold";
    return true;
}
