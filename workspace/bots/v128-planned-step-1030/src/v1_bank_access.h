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
            if(blocker<0)blocker=gid;
            else if(blocker!=gid){
                // Several boss groups seal this altar together; clearing any one opens it. Prefer the reachable
                // group nearest our spawn.
                if(groups[gid].dOwn!=UNR&&(groups[blocker].dOwn==UNR||groups[gid].dOwn<groups[blocker].dOwn))blocker=gid;
            }
        }
        if(blocker<0){bankGate=-1;return;}
        if(groups[blocker].dOwn!=UNR&&groups[blocker].totalHp<cost){cost=groups[blocker].totalHp;gate=blocker;}
    }
    bankGate=gate;
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

// Gated-map winners farm normally, then burst the gate with their whole team late in the game (01boss_battle
// r700-750, 02guardians r1150-1250) and bank everything; v62's caster-only steal never banked (0/7).
bool Bot::gateAssault(){
    if(bankGate<0||!bankGateClosed()||lowMode||!enough(40000))return false;
    auto& me=bc::self();
    if(me.health()<.45f*me.max_health())return false;
    auto& g=groups[bankGate];g.eligible=true;
    const auto pos=me.position();const int reach=std::max(1,static_cast<int>(me.attack_range()));
    bool inReach=false;
    for(auto p:(bc::vision::camp_tiles()&g.tilesBB).positions())if(cheb(p,pos)<=reach){inReach=true;break;}
    releaseCapture();target=bankGate;progressKind=clearing;stage="gate-assault";
    if(inReach){attackCampsOf(bankGate);return true;}
    bc::bitboard goals;for(auto t:g.tiles)goals.draw_chebyshev(t,reach);goals&=~g.tilesBB;
    if(moveToward(goals,true)){if(!attackedThisTurn)attackCampsOf(bankGate);return true;}
    return false;
}

// Before round 600 a gated map is farmed normally; from then on the team attacks the gate together.
bool Bot::workBankGate(){ return bankGate>=0&&round>=600&&gateAssault(); }
