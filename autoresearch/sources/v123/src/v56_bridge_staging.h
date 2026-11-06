// A legal dash from the current tile is not a complete traversal plan. Walk
// to a verified candidate launch region first, then revalidate the actual dash.
bool Bot::planBridge(const bc::bitboard& landings,const bc::bitboard& finalGoals,const bc::bitboard& blocked,vec2 pos){
    if(bridgeWalking||!enough(48000))return false;
    const auto& kit=v1KitForType(static_cast<int>(myType));int range=0;
    for(const auto& a:kit.definition.abilities)if(a.kind==6)range=a.payload.dash.range;
    if(range<=0||range>4||landings.is_empty())return false;
    const auto transit=blocked&~bc::map::holes();
    auto frontier=landings;
    for(int k=0;k<range;++k){
        if(!enough(30000))return false;
        // Reverse 8-neighbour reachability, with holes traversable but walls,
        // occupied tiles and reservations still blocked in transit.
        auto wide=frontier|frontier.shift_right(1)|frontier.shift_right(-1);
        frontier=(wide|wide.shift_up(1)|wide.shift_up(-1))&~transit;
    }
    if(bridgeFinalGoals!=finalGoals||round>=bridgeAvoidUntil)bridgeRejected.clear();
    auto launches=frontier&~blocked&~landings&~bridgeRejected;
    if(launches.is_empty()||launches.is_set(pos))return false;
    bridgeFinalGoals=finalGoals;bridgeWalkGoals=launches;
    bridgeFarRoute=std::move(moveRoute);bridgeWalking=true;bridgeSince=round;bridgeMisses=0;bridgeProgressRound=round;bridgeWalkBest=UNR;
    stage="bridge-plan-launch";return true;
}

// Called at the start of a subsequent ordinary route decision. It consumes
// no second whole-map search in the turn which discovers the disconnection.
bool Bot::finishBridge(const bc::bitboard& blocked,vec2 pos){
    if(!bridgeWalking||!bridgeFarRoute)return false;
    if(round-bridgeProgressRound>24){bridgeWalking=false;bridgeFarRoute.reset();return false;}
    if(!bridgeWalkGoals.is_set(pos))return false;
    const auto& kit=v1KitForType(static_cast<int>(myType));int slot=-1;
    for(int k=0;k<2;++k)if(kit.definition.abilities[k].kind==6){slot=k;break;}
    if(slot<0){bridgeWalking=false;return false;}
    int cd=8;const auto self=static_cast<unsigned>(static_cast<bc::handle_champion_t>(bc::self()));
    if(bc::detail::sdk_champion_cooldown(self,slot,&cd))return true;
    if(cd>0){stage="bridge-wait-cooldown";return true;}
    if(castThisTurn||!enough(50000)||!bc::self().can_cast()){stage="bridge-wait-action";return true;}
    // This uses current blockers and the native legal transit test. The old
    // far-side field only ranks legal landings; it cannot authorize a cast.
    if(bridgeDash(*bridgeFarRoute,blocked,pos)){
        previousTile=pos;movedThisTurn=true;bridgeWalking=false;bridgeFarRoute.reset();
        stage="bridge-staged-dash";return true;
    }
    if(++bridgeMisses>=2){bridgeRejected.set(pos);bridgeAvoidUntil=round+8;bridgeWalking=false;bridgeFarRoute.reset();stage="bridge-replan";}
    else stage="bridge-launch-blocked";
    return true;
}
