void Bot::requestHelp(const std::vector<V1Body>& foes,const std::vector<V1Body>& mates){
    if(nAllies>6||foes.empty()||!enough(45000))return;
    auto& me=bc::self();const auto pos=me.position();
    const V1Body* foe=nullptr;float best=1e9f;
    for(const auto& e:foes){const float value=cheb(pos,e.position())*30+e.info.health*.1f-e.bag;if(value<best){best=value;foe=&e;}}
    if(!foe || cheb(pos,foe->position())>5 || enemySpawnBB.is_set(foe->position()))return;
    float danger=0;for(const auto& f:foes)danger+=v1Response(f,pos,0);
    const int purpose=danger>me.health()*.45f?2:foe->info.health>2*me.strength()?1:0;
    const auto anchor=purpose==2?pos:foe->position();
    int helper=-1;float utility=-1e9f;
    for(const auto& a:mates){
        if(!enough(35000))break;
        int s=-1;for(int j=0;j<nAllies;++j)if(rosterHandles[j]==a.id)s=j;
        if(s<0||s==slot||(shared[s]&0xC0)||a.info.health<a.info.max_health*.6f||(a.info.state&(2|4|4096)))continue;
        unsigned bag=0;if(bc::detail::sdk_champion_gems(a.id,&bag)||bag>=44)continue;
        const int eta=std::max(0,cheb(a.position(),anchor)-a.info.attack_range)+((a.info.state&32)?1:0);
        if(eta>5)continue;
        float value=a.info.strength,burst=0,healing=0;bool control=false;
        for(int k=0;k<2;++k){
            int cd=8;bc::detail::ability_props p{};
            if(bc::detail::sdk_champion_cooldown(a.id,k,&cd)||cd>eta||bc::detail::sdk_champion_ability_props(a.id,k,&p))continue;
            if(p.kind==1)burst=std::max(burst,a.info.strength);
            if(p.kind==2)burst=std::max(burst,a.info.focus*p.payload.damage.modifier);
            if(p.kind==3){burst=std::max(burst,a.info.focus*p.payload.aoe_damage.modifier);control|=p.payload.aoe_damage.duration>0;}
            if(p.kind==4){burst=std::max(burst,a.info.focus*p.payload.cc.modifier);control=true;}
            if(p.kind==5)healing=std::max(healing,a.info.focus*p.payload.heal.modifier);
        }
        value+=burst;
        if(purpose==1&&control)value+=100;
        if(purpose==2)value+=std::min(healing,me.max_health()-me.health());
        value-=eta*55;
        const int claim=(shared[s]&63)-1;
        if(claim>=0&&claim<static_cast<int>(groups.size()))value-=groups[claim].gems*.5f;
        if(value>utility){utility=value;helper=s;}
    }
    // bm1 (rl1 rally, brawl maps only): call every healthy ally within X_RALLYD (helper id 7) when we are not ahead
    // locally or are attacked in our own half. Online rl1 lifted kills/champ 1.15->1.81 and lone-approached net
    // -0.30->+0.33 but cost 31% of early gems everywhere; brawl maps (rank-50 winners ~2x early kills) need the fights.
    if(brawlMap){
        int nFoe=0,nMate=1;const unsigned selfId=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
        for(const auto& f:foes)if(cheb(pos,f.position())<=6)++nFoe;
        for(const auto& a:mates)if(a.id!=selfId&&cheb(pos,a.position())<=4)++nMate;
        const bool ownHalf=heuristic(ownSpawnBB.positions(),pos)<heuristic(enemySpawnBB.positions(),pos);
        if(nFoe>=nMate||(ownHalf&&purpose>=1)){helper=7;utility=1;}
    }
    if(helper<0||utility<=0)return;
    const unsigned current=shared[6]|(static_cast<unsigned>(shared[7])<<8);
    const int age=(round-static_cast<int>((current>>13)&7))&7;
    if(current&&age<=1&&static_cast<int>((current>>11)&3)>purpose)return;
    const int scale=std::max(1,(std::max(W,H)+15)/16);
    const auto packet=v1Pack(anchor.x/scale,anchor.y/scale,helper,purpose,round);if(!packet)return;
    std::array<std::byte,2> bytes{std::byte(packet&255),std::byte(packet>>8)};
    ACT(bc::shared_memory.write(6,std::span<const std::byte>(bytes)));
    shared[6]=packet&255;shared[7]=packet>>8;helpReader.published(packet,round);helpValid=true;myCall=packet;
}

bool Bot::answerHelp(){
    auto& me=bc::self();
    if(!helpValid||nAllies>6||lowMode||capturing||me.gem_count()>=44||me.health()<me.max_health()*.6f||!me.can_move())return false;
    if(partnerSlot>=0&&(shared[partnerSlot]&0x80))return false;
    const unsigned packet=shared[6]|(static_cast<unsigned>(shared[7])<<8);
    const int callee=static_cast<int>((packet>>8)&7);
    if((callee!=slot&&callee!=7)||packet==myCall)return false;
    const int scale=std::max(1,(std::max(W,H)+15)/16);
    const vec2 anchor{std::min(W-1,static_cast<int>(packet&15)*scale+scale/2),std::min(H-1,static_cast<int>((packet>>4)&15)*scale+scale/2)};
    const int d=cheb(me.position(),anchor);if(d<=2||d>(callee==7?X_RALLYD:12))return false;
    const int purpose=(packet>>11)&3;bc::bitboard goals;goals.draw_chebyshev(anchor,purpose>=2?2:me.attack_range());
    if(moveToward(goals,!ranged)){
        target=-1;releaseCapture();stage="v1-assigned-help";
        if(round-lastHelpLog>=8){lastHelpLog=round;std::printf("v1 helper %d purpose %d round %d\n",slot,purpose,round);}
        return true;
    }
    return false;
}
