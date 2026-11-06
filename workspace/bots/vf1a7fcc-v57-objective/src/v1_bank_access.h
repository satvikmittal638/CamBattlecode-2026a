// A deposit route can depend on removing a camp. Detect that dependency from
// immutable geometry, then attack only personally visible living targets.
void Bot::discoverBankGate(){
    if(bankTopologyReady||!inited)return;
    if(bankGateHint==-1){bankTopologyReady=true;return;}
    if(!enough(55000))return;
    bankTopologyReady=true;int gate=-1;float cost=1e30f;
    if(altars.empty())return;
    for(const auto& altar:altars){
        int blocker=-1;
        for(auto p:altar.approaches){
            const int gid=tileGroup[idx(p)];
            // Any unobstructed altar needs no global camp-clearing task.
            if(gid<0||!groups[gid].monolith){bankGate=-1;return;}
            if(blocker<0)blocker=gid;else if(blocker!=gid){bankGate=-1;return;}
        }
        if(blocker<0){bankGate=-1;return;}
        if(groups[blocker].dOwn!=UNR&&groups[blocker].totalHp<cost){cost=groups[blocker].totalHp;gate=blocker;}
    }
    bankGate=gate;if(gate<0)return;
    for(auto p:groups[gate].tiles)gateFiring.draw_chebyshev(p,4);
    for(auto p:groups[gate].tiles){bc::bitboard danger;danger.draw_chebyshev(p,3);gateFiring&=~danger;}
    gateFiring&=~staticBlocked;
}

bool Bot::bankGateClosed()const{
    if(bankGate<0)return false;
    const auto& gate=groups[bankGate];
    if(X_DYNAMICGATE){
        const auto visible=bc::vision::visible_tiles(),living=bc::vision::camp_tiles();
        for(const auto& altar:altars)for(auto p:altar.approaches)
            if(visible.is_set(p)&&!living.is_set(p))return false;
    }
    // Occupancy can delay actual respawn after the countdown reaches zero.
    // Fresh personal engine state outranks the predicted respawn deadline.
    if(gate.state==3&&gate.seenRound==round)return false;
    return groupAlive(gate);
}

bool Bot::removeBankLock(vec2 altar){
    // Locks can be placed on any altar, regardless of static boss gates.
    if(!enough(26000))return true;
    auto& me=bc::self();
    for(const auto& lock:bc::vision::altar_locks(team::enemy)){
        if(lock.position()!=altar)continue;
        if(me.can_attack()&&cheb(me.position(),altar)<=me.attack_range()){
            ACT(me.attack(lock));attackedThisTurn=true;stage="bank-unlock";
            return bc::vision::altar_lock_tiles(team::enemy).is_set(altar);
        }
        return true;
    }
    return false;
}

bool Bot::workBankGate(){
    if(X_GATEOBJECTIVE)return false; // the coordinated camp executor handles the gate
    if(!bankGateClosed()||capturing||lowMode||round<gateRetryAt||!enough(32000))return false;
    // X_GATESTEAL: grinding a 20000-HP gate hands its capture to whoever arrives last (ranked/unranked
    // boss_battle losses: we made ~190 of ~194 monolith hits, the enemy took every reward). Only
    // finish a gate already observed at or below X_STEALFRAC of its health.
    if(X_GATESTEAL&&!X_BOSSCLEAR){const auto& g=groups[bankGate];const float hp=(g.state==1&&round-g.seenRound<30)?g.hpLeft:g.totalHp;if(g.totalHp<=0||hp>X_STEALFRAC*g.totalHp)return false;}
    auto& me=bc::self();stage="bank-access";
    if(X_DYNAMICGATE){
        // Dead front monsters must stop excluding the next firing position.
        // Unseen monsters remain possible blockers; only personal observation
        // is allowed to remove one from the geometry.
        const auto visible=bc::vision::visible_tiles(),living=bc::vision::camp_tiles();
        bc::bitboard firing,near;
        for(auto p:groups[bankGate].tiles)if(!visible.is_set(p)||living.is_set(p)){
            firing.draw_chebyshev(p,4);near.draw_chebyshev(p,3);
        }
        gateFiring=firing&~near&~staticBlocked;
    }
    // An already staged spell does not need another large route-search
    // allowance. Contact evaluation can leave enough for this cheap action.
    const auto pos=me.position();
    if(!gateFiring.is_set(pos)&&!enough(58000))return false;
    // A blocked deposit must not also prevent converting earned gold to stats.
    // Recall only outside every visible awake camp's actual attack range.
    if(enough(52000)&&!onSpawn()&&me.gold_count()>=150&&round-lastGateShop>=24&&bc::vision::champion_tiles(team::enemy).is_empty()){
        bool safe=true;const auto pos=me.position();
        for(const auto& c:safeCamps())if(c.strength()>0&&c.is_awake()&&cheb(c.position(),pos)<=c.attack_range())safe=false;
        const auto flags=me.state();
        if(safe&&!flags.contains(bc::champion_state::recall_started)&&enough(26000)){
            try{ACT(me.recall());lastGateShop=round;releaseCapture();return true;}catch(const TurnAbort&){throw;}catch(...){}
        }
    }
    if(!enough(26000))return false;
    const unsigned selfId=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    struct Spell{int slot,cd;bc::detail::ability_props props;};std::vector<Spell> spells;
    for(int k=0;k<2;++k){
        bc::detail::ability_props p{};int cd=8;
        if(bc::detail::sdk_champion_ability_props(selfId,k,&p)||bc::detail::sdk_champion_cooldown(selfId,k,&cd))continue;
        const float range=p.kind==2?p.payload.damage.range:p.kind==3?p.payload.aoe_damage.range:p.kind==4&&p.payload.cc.modifier>0?p.payload.cc.range:0;
        if(range>=4&&(p.targets&(bc::detail::ability_target_camps|bc::detail::ability_target_ground)))spells.push_back({k,cd,p});
    }
    // Noncasters keep farming while the assigned safe spellcasters open access.
    if(spells.empty()||gateFiring.is_empty())return false;
    unsigned items[42]{};if(bc::detail::sdk_champion_items(selfId,items))return false;
    const unsigned focusCapital=items[26]+5*items[27]+items[14]+5*items[15]+items[8]+5*items[9];
    if(focusCapital<5)return false;
    releaseCapture();target=bankGate;progressKind=clearing;
    const auto destinations=gateFiring&~gateBlind;
    if(destinations.is_empty()){gateBlind.clear();gateRetryAt=round+8;target=-1;return false;}
    if(!destinations.is_set(pos)){
        if(moveToward(destinations,false)){gateRouteFailures=0;return true;}
        if(++gateRouteFailures>=3){gateRetryAt=round+8;gateRouteFailures=0;target=-1;return false;}
        return true;
    }
    gateRouteFailures=0;
    const auto all=bc::vision::camp_tiles()&groups[bankGate].tilesBB;
    bool seesTarget=false;
    for(auto p:all.positions())if(cheb(pos,p)<=4){
        unsigned id;bc::detail::camp_state camp{};
        if(!bc::detail::sdk_camp_at(p.x,p.y,&id)&&!bc::detail::sdk_camp(id,&camp)&&camp.health>0){seesTarget=true;break;}
    }
    if(!seesTarget){
        // Geometric spell range does not imply personal sight through terrain.
        // Remember an observed blind landing and seek another firing tile.
        gateBlind.set(pos);const auto alternative=gateFiring&~gateBlind;
        if(!alternative.is_empty()&&moveToward(alternative,false))return true;
        gateRetryAt=round+8;target=-1;return false;
    }
    if(!castThisTurn&&me.can_cast())for(const auto& s:spells){
        if(s.cd||!enough(22000)||(movedThisTurn&&(s.props.attributes&1)))continue;
        unsigned selected=0;vec2 tile;float best=X_DYNAMICGATE?1e30f:-1;bool found=false;
        for(auto p:all.positions()){
            if(cheb(pos,p)>4)continue;unsigned id;bc::detail::camp_state c{};
            if(bc::detail::sdk_camp_at(p.x,p.y,&id)||bc::detail::sdk_camp(id,&c)||c.health<=0)continue;
            if(X_DYNAMICGATE?c.health<best:c.health>best){best=c.health;selected=id;tile=p;found=true;}
        }
        if(!found)continue;
        int used=0;const unsigned kind=(s.props.targets&bc::detail::ability_target_camps)?2:0;
        try{if(ACT(([&](){bc::detail::check(bc::detail::sdk_cast(s.slot,kind,kind?selected:0,tile.x,tile.y,&used));return used!=0;})())){castThisTurn=true;stage="bank-gate-cast";return true;}}catch(const TurnAbort&){throw;}catch(...){}
    }
    // The next independently cooling spell is available within eight turns.
    // This safe, bounded wait is part of clearing, not a travel deadlock.
    stage="bank-gate-cooldown";return true;
}
