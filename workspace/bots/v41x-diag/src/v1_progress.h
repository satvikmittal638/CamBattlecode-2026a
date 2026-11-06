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
    if(!inited || stale || static_cast<int>(bc::round_number())!=frameRound || bc::fuel_remaining()<28000){
        dgWatch=!inited?"pf-noinit":stale?"pf-stale":static_cast<int>(bc::round_number())!=frameRound?"pf-round":"pf-fuel28";return;}
    if(bankGateClosed()&&target==bankGate&&gateFiring.is_set(bc::self().position())){quietTurns=0;dgWatch="pf-gate";return;}
    if(movedThisTurn||attackedThisTurn||castThisTurn){quietTurns=0;progressPosition={-1,-1};previousKind=progressKind;dgWatch="pf-acted";return;}
    auto& me=bc::self();bc::detail::champion_info info{};
    const unsigned id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    if(bc::detail::sdk_champion(id,&info)||!(info.state&1)){dgWatch="pf-dead";return;}
    const vec2 pos{info.x,info.y};
    // These waits have engine-defined progress. They must not be evicted.
    if((info.state&(2|4|4096)) || !(info.state&8) || (capturing && target>=0 && groups[target].tilesBB.is_set(pos)) || (ownSpawnBB.is_set(pos)&&info.health<info.max_health-.5f)){
        quietTurns=0;progressPosition=pos;
        dgWatch=(info.state&(2|4|4096))?"pf-wait-chan/stun":!(info.state&8)?"pf-wait-cantmove":(capturing&&target>=0&&groups[target].tilesBB.is_set(pos))?"pf-wait-capture":"pf-wait-spawnheal";
        return;
    }
    const float hp=target>=0?groups[target].hpLeft:-1;
    const bool campProgress=target==taskProgressTarget && progressCampHp>=0 && hp>=0 && hp<progressCampHp-.1f;
    if(progressKind!=previousKind || attackedThisTurn || castThisTurn || pos!=progressPosition || campProgress || target!=taskProgressTarget)quietTurns=0;
    else ++quietTurns;
    dgWatch=quietTurns==0?"pf-reset":"pf-quiet";
    previousKind=progressKind;progressPosition=pos;taskProgressTarget=target;progressCampHp=hp;
    if(quietTurns>=8&&progressKind==banking&&!lowMode&&me.gem_count()>0){
        const int failed=nearestAltar(pos);if(failed>=0&&altars.size()>1){bankAvoid=failed;bankAvoidUntil=round+24;}
        moveRoute.reset();quietTurns=0;stage="v1-bank-replan";dgWatch="pf-bankreplan";
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
            stalledUntil[target]=round+12;target=-1;stage="v1-task-expired";dgWatch="pf-expired";
        }else if(myType!=bc::champion_type::willow)dgWatch=target<0?"pf-q8-notarget":"pf-q8-state>=2";
        quietTurns=0;
    }
    if(!movedThisTurn && !attackedThisTurn && !castThisTurn && quietTurns>=2 && fallbackRequested){if(cheapStep(fallbackGoals))dgWatch="pf-cheapstep";}
}

void Bot::play_turn() {
    dgF0=static_cast<long>(bc::fuel_remaining());dgFK=dgFF=dgFC=dgFE=-1;
    dgFarm="-";dgRoute="-";dgWatch="-";dgScore="-";for(int& k:dgSkip)k=0;dgKnowBreak=-1;dgKnowScan=true;
    fallbackRequested=false;
    try{play_step();}catch(const TurnAbort&){progressFinish();diagCapture();diagFlush();throw;}
    progressFinish();
    diagCapture();
    diagFlush();
}

void Bot::diagCapture(){
    dgRound=round;dgType=static_cast<int>(myType);dgStage=stage;dgFE=static_cast<long>(bc::fuel_remaining());
    dgTgt=target;dgCap=capturing;dgLow=lowMode;dgHeavy=heavyFieldUsed;dgQT=quietTurns;dgPK=static_cast<int>(progressKind);
    dgShared=slot<8?shared[slot]:0;dgAct=(movedThisTurn?1:0)|(attackedThisTurn?2:0)|(castThisTurn?4:0);
    dgAlly=target>=0&&allyCapturing(target);dgStall=target>=0?stalledUntil[target]-round:0;
    dgTgtBelief=target>=0?groups[target].state:-1;dgTgtRa=target>=0?groups[target].respawnAt-round:0;
    dgTgtEngine=-9;dgNearG=-1;dgNearD=99;dgNearBelief=-1;dgNearEngine=-9;dgPosX=dgPosY=-1;dgBits=0;
    if(bc::fuel_remaining()<4000)return;
    unsigned sid=0;bc::detail::champion_info ci{};
    sid=static_cast<unsigned>(static_cast<bc::handle_champion_t>(bc::self()));
    if(bc::detail::sdk_champion(sid,&ci)||!(ci.state&1))return;
    const vec2 pos{ci.x,ci.y};dgPosX=pos.x;dgPosY=pos.y;dgBits=ci.state;
    // raw engine state: 0 unknown/not in vision, 1 alive, 2 reward available, 3 respawning; -1 = call error
    auto engineState=[&](int gi){std::uint32_t st=0;if(bc::detail::sdk_camp_group_state(static_cast<std::uint32_t>(static_cast<bc::handle_camp_group_t>(rawGroups[gi])),&st))return -1;return static_cast<int>(st);};
    if(target>=0)dgTgtEngine=engineState(target);
    for(const auto& g:groups){int d=99;for(auto t:g.tiles)d=std::min(d,cheb(t,pos));if(d<dgNearD){dgNearD=d;dgNearG=g.id;}}
    if(dgNearG>=0){dgNearBelief=groups[dgNearG].state;dgNearEngine=engineState(dgNearG);}
}
// Cheap end-of-turn emitter: manual formatting into a static buffer, one fwrite+fflush, only when
// >=12000 fuel remains (all actions of the turn are already issued). Skips are counted.
static char dgBuf[720];static int dgLen=0;static long dgSkipped=0,dgLastCost=-1;
static void dgS(const char* s){while(*s&&dgLen<700)dgBuf[dgLen++]=*s++;}
static void dgI(long v){char t[24];int n=0;const bool neg=v<0;unsigned long u=neg?0UL-static_cast<unsigned long>(v):static_cast<unsigned long>(v);do{t[n++]=static_cast<char>('0'+u%10);u/=10;}while(u);if(neg)t[n++]='-';while(n&&dgLen<700)dgBuf[dgLen++]=t[--n];}
static void dgKV(const char* k,long v){dgS(k);dgI(v);}
static void dgKS(const char* k,const char* v){dgS(k);dgS(v?v:"?");}
void Bot::diagFlush(){
    if(dgRound<0)return;
    if(bc::fuel_remaining()<12000){++dgSkipped;dgRound=-1;return;}
    const long before=static_cast<long>(bc::fuel_remaining());dgLen=0;
    dgKV("dg ",dgRound);dgKV(" ",dgType);dgKS(" st=",dgStage);dgKS(" fb=",dgFarm);dgKS(" rt=",dgRoute);dgKS(" wd=",dgWatch);dgKS(" sc=",dgScore);
    dgS(" sk=");for(int k=0;k<7;++k){if(k)dgS("/");dgI(dgSkip[k]);}
    dgKV(" tg=",dgTgt);dgKV(" bs=",dgTgtBelief);dgKV(" ra=",dgTgtRa);dgKV(" hostEs=",dgTgtEngine);dgKV(" cap=",dgCap);dgKV(" ally=",dgAlly);dgKV(" sh=",dgShared);
    dgKV(" stl=",dgStall);dgKV(" pk=",dgPK);dgKV(" low=",dgLow);dgKV(" qt=",dgQT);dgKV(" hv=",dgHeavy);dgKV(" act=",dgAct);dgKV(" kn=",dgKnowScan);dgKV("/",dgKnowBreak);
    dgKV(" f=",dgF0);dgKV("/",dgFK);dgKV("/",dgFF);dgKV("/",dgFC);dgKV("/",dgFE);
    dgKV(" hostNear=",dgNearG);dgKV(":",dgNearD);dgKV(":",dgNearBelief);dgKV(":",dgNearEngine);dgKV(" pos=",dgPosX);dgKV(",",dgPosY);dgKV(" bits=",dgBits);
    dgKV(" skip=",dgSkipped);dgKV(" emitcost=",dgLastCost);dgS("\n");
    std::fwrite(dgBuf,1,static_cast<std::size_t>(dgLen),stdout);std::fflush(stdout);
    dgLastCost=before-static_cast<long>(bc::fuel_remaining());dgRound=-1;
}

