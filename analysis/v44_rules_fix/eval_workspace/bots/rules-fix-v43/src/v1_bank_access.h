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
    // Casting envelope only; workMonolith models actual camp range and exit risk.
    for(auto p:groups[gate].tiles)gateFiring.draw_chebyshev(p,4);
    for(auto p:groups[gate].tiles){bc::bitboard danger;danger.draw_chebyshev(p,3);gateFiring&=~danger;}
    gateFiring&=~staticBlocked;
}

bool Bot::bankGateClosed()const{
    if(bankGate<0)return false;
    const auto& gate=groups[bankGate];
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
    if(!bankGateClosed()||capturing||lowMode||round<gateRetryAt||!enough(34000))return false;
    if(X_GATESTEAL){const auto& g=groups[bankGate];const float hp=(g.state==1&&round-g.seenRound<30)?g.hpLeft:g.totalHp;if(g.totalHp<=0||hp>X_STEALFRAC*g.totalHp)return false;}
    auto& me=bc::self();
    unsigned items[42]{};const unsigned id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    if(bc::detail::sdk_champion_items(id,items))return false;
    const unsigned focusCapital=items[26]+5*items[27]+items[14]+5*items[15]+items[8]+5*items[9];
    if(focusCapital<5)return false;
    const bool handled=workMonolith(bankGate,gateBlind);
    if(handled){releaseCapture();target=bankGate;progressKind=clearing;}
    return handled;
}
