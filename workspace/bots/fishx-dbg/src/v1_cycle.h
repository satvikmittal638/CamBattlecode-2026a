// Bounded kill-order projection. Exact own kit values, approximate future uptime.
// This is an estimate, not a claim to simulate hidden positions or future actions.
int Bot::scoreTargets() {
    auto& me=bc::self();stage="v1-cycle";
    if(myType==bc::champion_type::willow && supportUntil>round && supportTask>=0 && supportTask<static_cast<int>(groups.size()) && groups[supportTask].state!=3 && !allyCapturing(supportTask))return supportTask;
    if(!enough(62000)){
        if(!stale&&target>=0&&target<static_cast<int>(groups.size())&&(groups[target].eligible||(groups[target].totalStr==0&&groups[target].gold>0&&!groups[target].monolith&&groups[target].dOwn!=UNR&&groups[target].dOwn<=groups[target].dEnemy+4))&&stalledUntil[target]<=round&&!allyCapturing(target))return target;
        return -1;
    }
    const unsigned selfId=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    bc::detail::champion_info own{};bc::detail::check(bc::detail::sdk_champion(selfId,&own));
    const vec2 pos{own.x,own.y};const float hp=own.health,strength=own.strength,F=own.focus;
    const int ownRange=own.attack_range;
    float spell=0;
    if(myType==bc::champion_type::cassi||myType==bc::champion_type::stellar)spell=2*F;
    else if(myType==bc::champion_type::prism)spell=1.5f*F;
    else if(myType==bc::champion_type::ren)spell=1.25f*F;
    else if(myType==bc::champion_type::tavi)spell=std::max(strength,2.2f*F);
    else if(myType==bc::champion_type::ryth)spell=std::max(strength,F);
    else spell=strength;
    const float md=std::max(1.0f,strength+spell/8);
    unsigned rawBag=0,items[42]{};bc::detail::check(bc::detail::sdk_champion_gems(selfId,&rawBag));bc::detail::check(bc::detail::sdk_champion_items(selfId,items));
    const int bag=rawBag;const bool jungle=items[25]||items[27]||items[29],durability=items[13]||items[15]||items[17];
    float shield=0;bc::detail::buff_data buffs[3]{};unsigned nBuffs=0;bc::detail::check(bc::detail::sdk_champion_buff_data(selfId,buffs,3,&nBuffs));
    for(unsigned j=0;j<std::min(3u,nBuffs);++j)if(buffs[j].type==0)shield+=buffs[j].data.shield.value;
    float readyShield=0,opening=0;
    if((own.state&2048)&&!castThisTurn)for(int k=0;k<2;++k){
        int cd=8;bc::detail::check(bc::detail::sdk_champion_cooldown(selfId,k,&cd));if(cd)continue;
        bc::detail::ability_props a{};bc::detail::check(bc::detail::sdk_champion_ability_props(selfId,k,&a));
        if(a.kind==1)opening=std::max(opening,strength);
        if(a.kind==2)opening=std::max(opening,F*a.payload.damage.modifier);
        if(a.kind==3)opening=std::max(opening,F*a.payload.aoe_damage.modifier);
        if(a.kind==4&&myType==bc::champion_type::ren)opening=std::max(opening,F*a.payload.cc.modifier);
        if(a.kind==7&&myType==bc::champion_type::varg)readyShield=std::max(readyShield,F*a.payload.shield.modifier);
    }
    struct Ally{unsigned id;bc::detail::champion_info info;};std::vector<Ally> allies;
    if(enough(45000))for(auto p:bc::vision::champion_tiles(team::ally).positions()){
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
    int dbgNoElig=0,dbgStall=0,dbgAlly=0,dbgUnr=0,dbgWait=0,dbgScored=0,dbgGold=0;bool dbgBudget=false;
    for(auto& g:groups){
        if(!enough(43000)){stage="v1-score-budget";dbgBudget=true;break;}
        // X_GOLDGROUPS: gold-only groups on our side compete in the main scoring (top teams farm
        // gold clusters heavily; gold buys the items that speed up clears and win fights).
        const bool goldOnly=X_GOLDGROUPS&&g.gems<=0&&g.gold>0&&!g.monolith&&g.dOwn!=UNR&&g.dOwn<=g.dEnemy+4;
        if(!goldOnly&&((!g.eligible&&!(g.id==bankGate&&g.state==2))||g.gems<=0)){++dbgNoElig;continue;}
        if(goldOnly)++dbgGold;
        if(stalledUntil[g.id]>round){++dbgStall;continue;}
        if(allyCapturing(g.id)){++dbgAlly;continue;}
        const int d=gdist(g,pos);if(d==UNR){++dbgUnr;continue;}
        const bool reward=g.state==2&&round-g.seenRound<15;
        const float remaining=reward?0:(g.state==1&&round-g.seenRound<30?g.hpLeft:g.totalHp);
        const float wait=g.state==3?std::max(0,g.respawnAt-round-d):0;if(wait>8){++dbgWait;continue;}
        ++dbgScored;
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
        const float rate=std::max(1.0f,md*(myType==bc::champion_type::varg?std::min(3,g.splashTargets):1)+help),ratio=observed?1:(g.totalHp>0?remaining/g.totalHp:0);
        float incoming=0,clear=0,aliveStrength=observed?0:g.totalStr,burst=opening;
        if(observed)for(auto m:order)aliveStrength+=m.second;
        for(const auto& member:order){
            const float h=member.first*ratio;const float applied=std::min(h,burst);burst=0;
            const float ticks=std::max(0.0f,std::ceil((h-applied)/rate));
            clear+=ticks;incoming+=ticks*std::max(0.0f,aliveStrength);aliveStrength-=member.second;
            if(ticks>0)incoming-=member.second;
        }
        incoming*=jungle?.7f:1;incoming*=durability?.9f:1;
        // Defensive opening and reset/damage opening are mutually exclusive.
        const float defenseOpening=incoming>hp*.8f?readyShield:0;
        if(defenseOpening>0){
            incoming=clear=0;aliveStrength=observed?0:g.totalStr;
            if(observed)for(auto m:order)aliveStrength+=m.second;
            for(auto m:order){const float ticks=std::ceil(m.first*ratio/rate);clear+=ticks;incoming+=ticks*std::max(0.0f,aliveStrength);aliveStrength-=m.second;if(ticks>0)incoming-=m.second;}
            incoming*=jungle?.7f:1;incoming*=durability?.9f:1;
        }
        incoming=std::max(0.0f,incoming);
        const float usable=hp+shield+std::min(defenseOpening,g.totalStr*5);
        // The projection excludes recurring shields/healing and tank rotation.
        // Reserve capital fallback for clears costing over five current HP pools;
        // ordinary survivability scoring remains unchanged. This is a heuristic.
        if(incoming<=usable*5.0f && wait<=2)safeGem=true;
        // Include delivery and countdown, amortized over the combined bag so a
        // batched route does not pay the entire altar journey for every camp.
        if(g.bankDistance<0){int distance=UNR;for(int a=0;a<static_cast<int>(altars.size());++a)distance=std::min<int>(distance,altarDistance(a,g.center));g.bankDistance=distance==UNR?20:distance;}
        const int altar=g.bankDistance;
        const float combined=bag+g.gems;
        const float bankCost=g.gems>0?(altar+std::ceil(combined/10.0f)+1)*g.gems/std::max(1.0f,combined):0;
        const float time=d+wait+clear+5+bankCost*.25f;
        float score=(g.gems+X_GOLDW*g.gold)/(time+8);
        if(incoming>usable*1.2f){const float q=std::max(.12f,usable/std::max(1.0f,incoming));score*=q*q;}
        if(claimed[g.id] && help==0)score*=.6f;
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
    if(best<0&&round%5==0)std::printf("cyclenone %d %d groups %d noElig %d gold %d stall %d ally %d unr %d wait %d scored %d budget %d safeGem %d pos %d,%d\n",round,static_cast<int>(myType),static_cast<int>(groups.size()),dbgNoElig,dbgGold,dbgStall,dbgAlly,dbgUnr,dbgWait,dbgScored,dbgBudget?1:0,safeGem?1:0,pos.x,pos.y);
    return best;
}

int Bot::chooseTarget(){
    const bool unchanged=!movedThisTurn&&!attackedThisTurn&&!castThisTurn&&!stale;
    const auto pos=bc::self().position();
    if(unchanged&&choiceRound==round&&choiceTarget==target&&choicePosition==pos&&choiceBlocked==blockedActions){stage="v1-cycle-cached";return choiceResult;}
    const int answer=scoreTargets();
    if(unchanged){choiceRound=round;choiceTarget=target;choicePosition=pos;choiceBlocked=blockedActions;choiceResult=answer;}
    return answer;
}
