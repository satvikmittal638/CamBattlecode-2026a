// Included inside mm. Fallback never assumes an unseen occupant is absent.
bool Bot::cheapStep(const bc::bitboard& goals) {
    if(stale || static_cast<int>(bc::round_number())!=frameRound || bc::fuel_remaining()<14000)return false;
    auto& me=bc::self();
    if(!me.can_move() || me.is_recalling() || me.is_submitting_gems() || me.is_teleporting())return false;
    // Tactical escape has its own threat model. Do not use a travel fallback
    // to approach a visible opponent after an aborted tactical calculation.
    if(!bc::vision::champion_tiles(team::enemy).is_empty())return false;
    auto blocked=blockedNow();auto roots=(goals&~blocked).positions();if(roots.empty())return false;
    const auto pos=me.position();if(goals.is_set(pos))return false;
    int before=heuristic(roots,pos),bestScore=before*16;vec2 best=pos;
    for(auto p:blocked.reachable_tiles(pos,1).positions()){
        const int d=heuristic(roots,p);if(d>=before || p==previousTile)continue;
        // Do not approach an armed camp in a low-HP emergency fallback.
        if(me.health()<me.max_health()*.4f && target>=0 && groups[target].totalStr>0)continue;
        const int score=d*16;if(score<bestScore){bestScore=score;best=p;}
    }
    if(best==pos || bc::fuel_remaining()<8000)return false;
    std::int32_t moved=0;const int code=bc::detail::sdk_move_to(best.x,best.y,&moved);
    if(static_cast<int>(bc::round_number())!=frameRound){invalidate_frame();return false;}
    if(code){++apiErrors;return false;}if(!moved){++blockedActions;return false;}
    previousTile=pos;movedThisTurn=true;stage="v1-reserve-step";return true;
}

void Bot::progressFinish() {
    if(!inited || stale || static_cast<int>(bc::round_number())!=frameRound || bc::fuel_remaining()<17000)return;
    if(bankGateClosed()&&target==bankGate&&gateFiring.is_set(bc::self().position())){quietTurns=0;return;}
    if(movedThisTurn||attackedThisTurn||castThisTurn){quietTurns=0;progressPosition={-1,-1};previousKind=progressKind;return;}
    auto& me=bc::self();if(!me.is_alive())return;
    const auto pos=me.position();
    // These waits have engine-defined progress. They must not be evicted.
    if(me.is_recalling() || me.is_submitting_gems() || me.is_teleporting() || me.buffs().has_stun() || (capturing && target>=0 && groups[target].tilesBB.is_set(pos)) || (onSpawn()&&me.health()<me.max_health()-.5f)){
        quietTurns=0;progressPosition=pos;return;
    }
    const float hp=target>=0?groups[target].hpLeft:-1;
    const bool campProgress=target==taskProgressTarget && progressCampHp>=0 && hp>=0 && hp<progressCampHp-.1f;
    if(progressKind!=previousKind || attackedThisTurn || castThisTurn || pos!=progressPosition || campProgress || target!=taskProgressTarget)quietTurns=0;
    else ++quietTurns;
    previousKind=progressKind;progressPosition=pos;taskProgressTarget=target;progressCampHp=hp;
    if(quietTurns>=8&&progressKind==banking&&!lowMode&&me.gem_count()>0){
        const int failed=nearestAltar(pos);if(failed>=0&&altars.size()>1){bankAvoid=failed;bankAvoidUntil=round+24;}
        moveRoute.reset();quietTurns=0;stage="v1-bank-replan";
    }
    if(quietTurns>=8 && !lowMode && progressKind!=combat){
        if(myType==bc::champion_type::willow && round-lastSupportRound>=8 && !supportNeeded && bc::vision::champion_tiles(team::enemy).is_empty()){
            int best=-1,distance=9;
            for(const auto& g:groups)if(g.totalStr==0 && (g.gems||g.gold) && g.state!=3 && !allyCapturing(g.id)){
                bool claimed=false;for(int k=0;k<nAllies&&k<6;++k)if(k!=slot&&(shared[k]&63)==g.id+1)claimed=true;
                if(claimed)continue;
                const int d=gdist(g,pos);if(d<distance){distance=d;best=g.id;}
            }
            if(best>=0){supportTask=best;supportUntil=round+32;target=best;fallbackGoals=groups[best].tilesBB;fallbackRequested=true;stage="v1-support-task";}
        }else if(target>=0 && groups[target].state<2){
            stalledUntil[target]=round+12;target=-1;stage="v1-task-expired";
        }
        quietTurns=0;
    }
    if(!movedThisTurn && !attackedThisTurn && !castThisTurn && (X_CHEAPNOW||quietTurns>=2) && fallbackRequested)cheapStep(fallbackGoals);
}

void Bot::play_turn() {
    fallbackRequested=false;
    try{play_step();}catch(const TurnAbort&){progressFinish();throw;}
    progressFinish();
}
