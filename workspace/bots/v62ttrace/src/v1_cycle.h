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
int Bot::scoreTargets() {
    auto& me=bc::self();stage="v1-cycle";
    if(myType==bc::champion_type::willow && supportUntil>round && supportTask>=0 && supportTask<static_cast<int>(groups.size()) && groups[supportTask].state!=3 && !allyCapturing(supportTask))return supportTask;
    if(!enough(68000)){
        if(!stale&&target>=0&&target<static_cast<int>(groups.size())&&(groups[target].eligible||(groups[target].totalStr==0&&groups[target].gold>0&&!groups[target].monolith&&groups[target].dOwn!=UNR&&groups[target].dOwn<=groups[target].dEnemy+4))&&stalledUntil[target]<=round&&!allyCapturing(target))return target;
        return affordableTarget();
    }
    const unsigned selfId=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    bc::detail::champion_info own{};bc::detail::check(bc::detail::sdk_champion(selfId,&own));
    const vec2 pos{own.x,own.y};const float hp=own.health,strength=own.strength,F=own.focus;
    const int ownRange=own.attack_range;
    const auto& kit=v1KitForType(own.type);
    const float spell=v1CycleCast(kit,strength,F);
    const float md=std::max(1.0f,strength+spell/8);
    if(!enough(57000))return target;
    if(!ownItemsKnown)readOwnItems();
    const bool jungle=ownJungle,durability=ownDurability;
    v1GoldW=X_GOLDW*(ownShards>=X_GOLDRICH?X_GOLDRICHW:1.0f);
    float shield=0;bc::detail::buff_data buffs[3]{};unsigned nBuffs=0;bc::detail::check(bc::detail::sdk_champion_buff_data(selfId,buffs,3,&nBuffs));
    for(unsigned j=0;j<std::min(3u,nBuffs);++j)if(buffs[j].type==0)shield+=buffs[j].data.shield.value;
    if(!enough(47000))return affordableTarget();
    struct Ally{unsigned id;bc::detail::champion_info info;};std::vector<Ally> allies;
    if(enough(45000))for(auto p:bc::vision::champion_tiles(team::ally).positions()){
        if(!enough(49000))break;
        unsigned id;bc::detail::champion_info info{};
        if(!bc::detail::sdk_champion_at(p.x,p.y,&id)&&!bc::detail::sdk_champion(id,&info)&&(info.state&1))allies.push_back({id,info});
    }
    std::vector<int> claimed(groups.size(),0);for(int i=0;i<nAllies&&i<6;++i)if(i!=slot && !(shared[i]&0x80)){const int g=(shared[i]&63)-1;if(g>=0&&g<static_cast<int>(groups.size()))++claimed[g];}
    struct Arrival{float dps;int eta;bool partner;};
    std::vector<std::vector<Arrival>> arrivals(groups.size());
    for(const auto& a:allies){
        if(a.id==selfId)continue;
        int as=-1;for(int j=0;j<nAllies;++j)if(rosterHandles[j]==a.id)as=j;
        if(as<0||(shared[as]&0xC0))continue;
        const int gid=(shared[as]&63)-1;if(gid<0||gid>=static_cast<int>(groups.size()))continue;
        const auto& i=a.info;
        if((i.state&(2|4|4096))||i.health<i.max_health*.35f)continue;
        const int eta=std::max(0,static_cast<int>(gdist(groups[gid],{i.x,i.y}))-i.attack_range-(i.attack_range==1?1:0));
        arrivals[gid].push_back({i.strength,eta,as==partnerSlot});
    }
    int best=-1;float bestScore=-1;bool safeGem=false;
    for(auto& g:groups){
        if(!enough(43000)){stage="v1-score-budget";break;}
        // Gold-only groups on our side compete in the main scoring (top teams farm
        // gold clusters heavily; gold buys the items that speed up clears and win fights).
        const bool goldOnly=g.gems<=0&&g.gold>0&&!g.monolith&&g.dOwn!=UNR&&g.dOwn<=g.dEnemy+4;
        if(!goldOnly&&((!g.eligible&&!(g.id==bankGate&&g.state==2))||g.gems<=0))continue;
        if(stalledUntil[g.id]>round||allyCapturing(g.id))continue;
        const int d=gdist(g,pos);if(d==UNR)continue;
        const bool reward=g.state==2&&round-g.seenRound<15;
        const float remaining=reward?0:(g.state==1&&round-g.seenRound<30?g.hpLeft:g.totalHp);
        const float wait=g.state==3?std::max(0,g.respawnAt-round-d):0;if(wait>8)continue;
        // Solve two bounded arrival-adjusted estimates. A commitment has no
        // immediate DPS, but can contribute after a personally observed ETA.
        const int ownEta=std::max(0,d-ownRange-(ranged?0:1));
        bool partnerComing=false;float help=0,guess=remaining/std::max(1.0f,md);
        for(const auto& a:arrivals[g.id])if(a.eta<=ownEta+2)partnerComing|=a.partner;
        for(int k=0;k<2;++k){
            help=0;
            for(const auto& a:arrivals[g.id])if(a.eta<=ownEta+2)help+=a.dps*std::max(0.0f,guess-std::max(0,a.eta-ownEta))/std::max(1.0f,guess);
            guess=remaining/std::max(1.0f,md+help);
        }
        const bool observed=g.state==1&&g.fullyObserved&&round-g.seenRound<2;
        const auto& order=observed?g.liveOrder:g.clearOrder;
        const float rate=std::max(1.0f,(myType==bc::champion_type::heart_of_ruin?strength+spell*std::min(3,g.splashTargets)/8:md*(myType==bc::champion_type::varg?std::min(3,g.splashTargets):1))+help),ratio=observed?1:(g.totalHp>0?remaining/g.totalHp:0);
        float incoming=0,clear=0,aliveStrength=observed?0:g.totalStr;
        if(observed)for(auto m:order)aliveStrength+=m.second;
        for(const auto& member:order){
            const float ticks=std::ceil(member.first*ratio/rate);
            clear+=ticks;incoming+=ticks*std::max(0.0f,aliveStrength);aliveStrength-=member.second;
            if(ticks>0)incoming-=member.second;
        }
        incoming*=jungle?.7f:1;incoming*=durability?.9f:1;
        incoming=std::max(0.0f,incoming);
        const float usable=hp+shield;
        // The projection excludes recurring shields/healing and tank rotation.
        // Reserve capital fallback for clears costing over five current HP pools;
        // ordinary survivability scoring remains unchanged. This is a heuristic.
        if(incoming<=usable*5.0f && wait<=2)safeGem=true;
        // Include the altar trip and tribute countdown for this camp's gems alone. v62 never amortised it over the
        // carried bag (its item overflow zeroed the bag here), and that is the scoring its results were built on:
        // amortising made champions batch distant camps with big bags (02famine 5/7 -> 1/7, 00gem_fields 3/7 -> 0/7).
        if(g.bankDistance<0){
            for(;g.bankCursor<static_cast<int>(altars.size())&&enough(49000);++g.bankCursor)
                g.bankBest=std::min<int>(g.bankBest,altarDistance(g.bankCursor,g.center));
            if(g.bankCursor==static_cast<int>(altars.size()))g.bankDistance=g.bankBest==UNR?20:g.bankBest;
        }
        const int altar=g.bankDistance>=0?g.bankDistance:(g.bankBest==UNR?20:g.bankBest);
        const float bankCost=g.gems>0?altar+std::ceil(g.gems/10.0f)+1:0;
        const float time=d+wait+clear+5+bankCost*.25f;
        float score=(g.gems+v1GoldW*g.gold)/(time+8);
        if(incoming>usable*1.2f){const float q=std::max(.12f,usable/std::max(1.0f,incoming));score*=q*q;}
        if(g.totalHp>=X_PACKMINHP){ if(claimed[g.id]==1)score*=1.6f; else if(claimed[g.id]==2)score*=1.2f; else if(claimed[g.id]>=3)score*=.6f; }
        else if(claimed[g.id] && help==0)score*=.6f;
        if(partnerComing && g.totalStr*remaining/std::max(1.0f,md)>hp*.65f)score*=1.3f;
        if(g.id==target)score*=1.25f;
        if(g.id==target&&remaining<g.totalHp*.65f&&incoming<usable*.8f)score*=1.12f;
        if(score>bestScore){bestScore=score;best=g.id;}
    }
    if(!safeGem)for(auto& g:groups){
        if(!enough(41000))break;
        if(g.gems>0||g.gold<=0||g.totalStr>0||g.monolith||g.dOwn==UNR||g.dOwn>g.dEnemy+4||stalledUntil[g.id]>round||allyCapturing(g.id))continue;
        const int d=gdist(g,pos);if(d==UNR)continue;
        const int wait=g.state==3?std::max(0,g.respawnAt-round-d):0;if(wait>8)continue;
        const float remaining=g.state==2?0:(g.state==1&&round-g.seenRound<30?g.hpLeft:g.totalHp);
        float score=.15f*g.gold/(d+wait+std::ceil(remaining/md)+13);
        if(claimed[g.id])score*=.6f;if(g.id==target)score*=1.25f;
        if(score>bestScore){bestScore=score;best=g.id;}
    }
    return best>=0?best:affordableTarget();
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
