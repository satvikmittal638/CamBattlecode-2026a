// X_GOLDRICH: gem-equivalents per gold drop to X_GOLDW*X_GOLDRICHW once this champion owns X_GOLDRICH
// shards (gold_rush: 28 central gold clusters kept a fully itemised team off the edge gem camps).
static float v1GoldW=X_GOLDW;
// Observation can repeatedly leave 60k fuel: enough to act, but below the
// 68k full-planner admission threshold. A missing target must not become an
// absorbing state. This bounded pass leaves the route/action reserve intact.
int Bot::affordableTarget(){
    if(stale||!enough(40000))return -1;
    auto& me=bc::self();bc::detail::champion_info own{};
    const unsigned id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    if(bc::detail::sdk_champion(id,&own)||!(own.state&1))return -1;
    const vec2 pos{own.x,own.y};int best=-1;float value=-1;
    for(const auto& g:groups){
        if(!enough(38000))break;
        const bool gold=g.gems==0&&g.gold>0&&!g.monolith&&g.dOwn!=UNR&&g.dOwn<=g.dEnemy+4;
        // Eligibility already excludes unsupported Monoliths. Boss-only
        // layouts explicitly enable their sole camp-gem supply in init; do
        // not silently discard those same tasks when using the cheap scorer.
        if((!g.eligible&&!gold)||stalledUntil[g.id]>round||allyCapturing(g.id))continue;
        const int d=gdist(g,pos);if(d==UNR)continue;
        const int wait=g.state==3?std::max(0,g.respawnAt-round-d):0;if(wait>8)continue;
        const bool reward=g.state==2&&round-g.seenRound<15;
        const bool observed=g.state==1&&g.fullyObserved&&round-g.seenRound<2;
        const float hp=reward?0:(g.state==1&&round-g.seenRound<30?g.hpLeft:g.totalHp);
        const float dps=std::max(1.0f,own.strength+v1CycleCast(v1KitForType(own.type),own.strength,own.focus)/8);
        const float clear=std::ceil(hp/dps);
        const float exposure=clear*g.totalStr;
        const float q=exposure>own.health*1.2f?std::max(.12f,own.health/std::max(1.0f,exposure)):1;
        float score=(g.gems+v1GoldW*g.gold)*q*q/(d+wait+clear+13);
        bool claimed=false;for(int k=0;k<nAllies&&k<6;++k)if(k!=slot&&!(shared[k]&0x80)&&(shared[k]&63)==g.id+1)claimed=true;
        if(claimed)score*=.6f;
        if(g.id==target)score*=1.25f;
        if(score>value){value=score;best=g.id;}
    }
    stage="v41-affordable-task";return best;
}

// Our own item counts change only when shop() buys (which clears ownItemsKnown); cache what scoring needs.
void Bot::readOwnItems(){
    unsigned items[ITEM_TYPES]{};
    bc::detail::check(bc::detail::sdk_champion_items(static_cast<unsigned>(static_cast<bc::handle_champion_t>(bc::self())),items));
    ownJungle=items[25]||items[27]||items[29];ownDurability=items[13]||items[15]||items[17];
    ownShards=0;for(int i=0;i<ITEM_TYPES;++i)if(items[i])ownShards+=items[i]*((i&1)?((i/6)==1?6:5):1);
    ownItemsKnown=true;
}

// Bounded kill-order projection. Exact own kit values, approximate future uptime.
// This is an estimate, not a claim to simulate hidden positions or future actions.
int Bot::scoreTargets(){
    stage="mite-resource-cycle";
    if(stale||!enough(43000))return target;
    auto& me=bc::self();
    const unsigned selfId=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    bc::detail::champion_info own{};
    if(bc::detail::sdk_champion(selfId,&own)||!(own.state&1))return -1;
    if(!ownItemsKnown)readOwnItems();
    // The teacher invests in armed-camp efficiency first; gold has a larger
    // marginal value until Jungle completes, then capture/delivery dominates.
    v1GoldW=!ownJungle?1.1f:(ownShards<15?.30f:.12f);
    const vec2 pos{own.x,own.y};
    const auto& kit=v1KitForType(own.type);
    const float spell=v1CycleCast(kit,own.strength,own.focus);
    struct Ally{vec2 p;float dps;int gid;};std::vector<Ally> helpers;
    if(enough(65000))for(auto p:bc::vision::champion_tiles(team::ally).positions()){
        if(!enough(59000))break;
        unsigned id;bc::detail::champion_info info{};
        if(bc::detail::sdk_champion_at(p.x,p.y,&id)||id==selfId||bc::detail::sdk_champion(id,&info)||!(info.state&1)||info.health<info.max_health*.4f)continue;
        int slot=-1;for(int k=0;k<nAllies;++k)if(rosterHandles[k]==id)slot=k;
        if(slot<0||(shared[slot]&0xC0))continue;
        helpers.push_back({p,info.strength,(shared[slot]&63)-1});
    }
    int best=-1;float bestValue=-1;
    for(const auto& g:groups){
        if(!enough(40000))break;
        const bool gold=g.gold>0&&!g.monolith;
        const bool boss=g.monolith&&g.gems>0&&(g.eligible||(round>=X_MONOROUND&&ownShards>=X_MONOSHARDS));
        if((!g.eligible&&!gold&&!boss)||g.dOwn==UNR||stalledUntil[g.id]>round||allyCapturing(g.id))continue;
        const int distance=gdist(g,pos);if(distance==UNR)continue;
        const int wait=g.state==3?std::max(0,g.respawnAt-round-distance):0;
        if(wait>8)continue;
        const bool reward=g.state==2&&round-g.seenRound<15;
        const float remaining=reward?0:(g.state==1&&round-g.seenRound<30?g.hpLeft:g.totalHp);
        float rate=std::max(1.0f,own.strength+spell*(myType==bc::champion_type::heart_of_ruin?std::min(3,g.splashTargets):1)/8);
        int claimed=0;
        for(int k=0;k<nAllies&&k<6;++k)if(k!=slot&&!(shared[k]&0xC0)&&(shared[k]&63)==g.id+1)++claimed;
        for(const auto& ally:helpers)if(ally.gid==g.id&&cheb(ally.p,g.center)<=distance+own.attack_range+2)rate+=ally.dps;
        const float clear=std::ceil(remaining/rate);
        const float incoming=clear*g.totalStr*(ownJungle?.7f:1.f)*(ownDurability?.9f:1.f);
        const float reserve=own.health+((myType==bc::champion_type::heart_of_ruin)?own.focus:0);
        const float survival=incoming>reserve*1.2f?std::max(.1f,reserve/std::max(1.f,incoming)):1.f;
        // Static spawn geometry is a soft exposure cost. No hidden enemy
        // positions enter the decision.
        const float territory=1.f/(1.f+.035f*std::max(0,g.dOwn-g.dEnemy));
        float value=(g.gems+v1GoldW*g.gold)*survival*survival*territory/(distance+wait+clear+13);
        if(claimed&&g.totalStr==0)value*=.6f;
        else if(claimed&&remaining>own.health)value*=1.15f;
        if(g.id==target)value*=1.3f;
        if(g.id==target&&remaining<g.totalHp*.65f)value*=1.25f;
        if(value>bestValue){bestValue=value;best=g.id;}
    }
    return best;
}

int Bot::chooseTarget(){
    const bool unchanged=!movedThisTurn&&!attackedThisTurn&&!castThisTurn&&!stale;
    const auto pos=bc::self().position();
    if(unchanged&&choiceRound==round&&choiceTarget==target&&choicePosition==pos&&choiceBlocked==blockedActions){stage="v1-cycle-cached";return choiceResult;}
    // X_COMMITDIST: within this route distance of a still-valid target, keep it. Ally claims reshuffled scores and
    // champions ping-ponged between groups (59 steps per own capture vs procless 32, same straight distance).
    // Not on gated-altar maps (separate caster team and gate logic).
    if(bankGateHint<0&&!stale&&target>=0&&target<static_cast<int>(groups.size())){
        const auto& g=groups[target];
        const bool kind=g.eligible||(g.gems<=0&&g.gold>0&&!g.monolith);
        const bool live=g.state!=3||g.respawnAt-round<=4;
        if(kind&&live&&stalledUntil[target]<=round&&!allyCapturing(target)&&gdist(g,pos)<=X_COMMITDIST){stage="x-commit";return target;}
    }
    const int answer=scoreTargets();
    if(unchanged){choiceRound=round;choiceTarget=target;choicePosition=pos;choiceBlocked=blockedActions;choiceResult=answer;}
    return answer;
}
