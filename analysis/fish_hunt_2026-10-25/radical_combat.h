// A fresh combat policy for the healer / stun-immune-frontline experiment.
// Team focus is advisory; every target still needs this champion's own vision.
bool Bot::fightChampions(){
    progressKind=combat;auto& me=bc::self();
    if(!enough(30000))return false;
    const auto origin=me.position();
    struct Foe{bc::champion unit;bc::detail::champion_info info;unsigned id,bag;};
    std::vector<Foe> enemies;std::vector<vec2> threats;
    for(auto e:safeChamps(team::enemy)){
        if(!enough(24000))break;
        unsigned id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(e)),bag=0;bc::detail::champion_info i{};
        if(bc::detail::sdk_champion(id,&i)||!(i.state&1)||i.health<=0||enemySpawnBB.is_set({i.x,i.y}))continue;
        if(cheb(origin,{i.x,i.y})>7)continue;
        bc::detail::sdk_champion_gems(id,&bag);enemies.push_back({e,i,id,bag});threats.push_back({i.x,i.y});
    }
    if(enemies.empty())return false;
    int friends=0,foes=0;
    for(auto a:safeChamps(team::ally))if(a!=me&&a.is_alive()&&!a.is_recalling()&&!a.is_submitting_gems()&&cheb(a.position(),origin)<=6&&a.health()>=a.max_health()*.4f)friends++;
    for(const auto& e:enemies)foes+=cheb(origin,{e.info.x,e.info.y})<=5;
    const float hp=me.health(),maxHp=me.max_health(),strength=me.strength();
    // Leave an unsupported swarm, but do not price every enemy as simultaneously
    // attacking us through a friendly frontline for two entire turns.
    if(foes>=friends+3&&hp<maxHp*.8f&&me.can_move()){
        combatWithdraw=true;releaseCapture();target=-1;choiceRound=-1;
        if(myType==bc::champion_type::varg&&!castThisTurn&&useShield())castThisTurn=true;
        moveAway(threats);stage="radical-outnumbered-escape";return true;
    }
    const unsigned packet=shared[6]|(static_cast<unsigned>(shared[7])<<8);
    const int age=(round-static_cast<int>((packet>>4)&2047))&2047;
    const int focus=(packet&0x8000)&&age<=2?static_cast<int>(packet&15)-1:-1;
    int selected=-1;float best=1e9f;
    for(int j=0;j<static_cast<int>(enemies.size());++j){
        const auto& e=enemies[j];const int d=cheb(origin,{e.info.x,e.info.y});
        float value=e.info.health-2.0f*e.bag+d*45;
        if(e.info.type==3||e.info.type==4)value-=180;
        if(static_cast<int>(e.id)==focus)value-=300;
        if(e.info.state&(2|4))value-=100;
        if(d<=me.attack_range()&&e.info.health<=strength)value-=600;
        if(value<best){best=value;selected=j;}
    }
    if(selected<0)return false;auto enemy=enemies[selected];
    auto position=[&](){bc::detail::champion_info now{};if(bc::detail::sdk_champion(enemy.id,&now)||!(now.state&1))return vec2{-999,-999};return vec2{now.x,now.y};};
    auto target=position();int distance=cheb(origin,target);
    if(enemy.id<15&&enough(18000)){
        const unsigned p=0x8000|((round&2047)<<4)|(enemy.id+1);
        std::array<std::byte,2> bytes{std::byte(p&255),std::byte(p>>8)};
        ACT(bc::shared_memory.write(6,std::span<const std::byte>(bytes)));
        shared[6]=p&255;shared[7]=p>>8;
    }
    // Willow keeps the heal anchor; she never pursues an enemy away from it.
    if(myType==bc::champion_type::willow&&distance>me.attack_range())return false;
    bool acted=false;
    if(distance<=4&&!movedThisTurn&&!castThisTurn)acted=castOnEnemy(enemy.unit);
    if(!ranged&&distance>1&&distance<=4&&hp>=maxHp*.5f&&(friends>0||foes<=1)&&me.can_move()){
        bc::bitboard goals;goals.draw_chebyshev(target,1);
        if(moveToward(goals,true))acted=true;
        target=position();distance=cheb(me.position(),target);
    }
    if(distance<=me.attack_range()&&me.can_attack()&&v60SafeOptionalHit(enemy.unit)){
        try{ACT(me.attack(enemy.unit));attackedThisTurn=acted=true;afterAttackReset(&enemy.unit);}
        catch(const TurnAbort&){throw;}catch(...){}
    }
    if(!castThisTurn&&enough(22000)){
        if(myType==bc::champion_type::varg){if(useShield())castThisTurn=acted=true;}
        else if(distance<=4)acted=castOnEnemy(enemy.unit)||acted;
    }
    // Close only with real support; otherwise keep the economic task instead
    // of letting a distant scout pull an isolated ranged farmer off its route.
    if(!acted&&ranged&&myType!=bc::champion_type::willow&&distance<=5&&distance>3&&friends>=1&&friends+1>=foes&&hp>=maxHp*.6f&&me.can_move()){
        bc::bitboard goals;goals.draw_chebyshev(target,3);
        acted=moveToward(goals,false);
    }
    if(acted){releaseCapture();stage="radical-shared-focus";}
    return acted;
}
