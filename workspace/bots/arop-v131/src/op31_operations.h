// Six one-byte personal commitments plus the existing two-byte, expiring call.
// Purpose 3 is a scoring-operation invitation for ONE named helper. Positions
// remain advisory: only personal vision authorizes combat and lifecycle reads.
void Bot::updatePair(){
    if(partnerSlot<0||partnerSlot>=static_cast<int>(rosterHandles.size()))return;
    bc::detail::champion_info info{};
    if(!bc::detail::sdk_champion(rosterHandles[partnerSlot],&info)&&(info.state&1)){
        partnerPosition={info.x,info.y};partnerSeen=round;
    }
}
bool Bot::pairDestinationAllowed(vec2 to){
    if(OP_PAIR_COMMIT<1||myType!=bc::champion_type::issac||partnerSlot<0||partnerSeen<round-4||lowMode||progressKind==banking)return true;
    int leash=8;
    if(target>=0&&groups[target].totalStr>0)leash=2;
    if(!bc::vision::champion_tiles(team::enemy).is_empty())leash=3;
    const auto from=bc::self().position();
    return cheb(to,partnerPosition)<=leash||cheb(to,partnerPosition)<=cheb(from,partnerPosition);
}
bool Bot::pairedStaging(){
    if(OP_PAIR_COMMIT<1||myType!=bc::champion_type::issac||partnerSlot<0||lowMode||capturing||!enough(34000))return false;
    auto& me=bc::self();const auto pos=me.position();
    int leash=target>=0&&groups[target].totalStr>0?2:8;
    if(!bc::vision::champion_tiles(team::enemy).is_empty())leash=3;
    vec2 anchor=partnerPosition;
    if(partnerSeen<round-8){const int task=(shared[partnerSlot]&63)-1;if(task<0||task>=static_cast<int>(groups.size()))return false;anchor=groups[task].center;leash=3;}
    if(anchor.x<0||cheb(pos,anchor)<=leash)return false;
    bc::bitboard goals;goals.draw_chebyshev(anchor,leash);
    progressKind=support;if(moveToward(goals,false)){stage="op-duo-stage";return true;}return false;
}

bool Bot::announceAltar(const std::vector<V1Body>& foes){
    if(OP_ALTAR_SQUAD<1||altars.empty()||altars.size()>static_cast<unsigned>(OP_ALTAR_MAX)||nAllies<5||nAllies>6||round<OP_ALTAR_START||!enough(35000)||bankGateClosed())return false;
    int altar=-1;unsigned bag=11;
    for(const auto& f:foes)if(f.bag>bag)for(int a=0;a<static_cast<int>(altars.size());++a)if(cheb(f.position(),altars[a].pos)<=7){bag=f.bag;altar=a;}
    if(altar<0)return false;
    const int scale=std::max(1,(std::max(W,H)+15)/16);const auto p=altars[altar].pos;
    const auto call=v1Pack(p.x/scale,p.y/scale,6,3,round),current=shared[6]|(static_cast<unsigned>(shared[7])<<8);
    if(call!=current){std::array<std::byte,2> bytes{std::byte(call&255),std::byte(call>>8)};ACT(bc::shared_memory.write(6,std::span<const std::byte>(bytes)));shared[6]=call&255;shared[7]=call>>8;helpReader.published(call,round);}
    return true;
}

bool Bot::physicalCapturer(const Group& g){
    if(enough(37000)&&rawGroups[g.id].capture_state().state==bc::map::camp_group_capture_type::contested){
        const auto cost=[](int type){return type==1?100:type==7?80:type==3||type==4?60:30;};
        const auto own=std::make_pair(cost(static_cast<int>(myType)),static_cast<unsigned>(static_cast<bc::handle_champion_t>(bc::self())));
        for(auto a:safeChamps(team::ally)){
            if(!enough(30000))break;
            if(!a.is_alive()||!g.tilesBB.is_set(a.position())||a.health()<a.max_health()*.6f||a.is_recalling()||a.is_submitting_gems()||a.is_teleporting()||a.buffs().has_stun())continue;
            const auto id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(a));
            bool acknowledged=false;for(int s=0;s<nAllies&&s<6;++s)if(rosterHandles[s]==id&&(shared[s]&0xC0)==0x40&&(shared[s]&63)==g.id+1)acknowledged=true;
            if(acknowledged&&std::make_pair(cost(static_cast<int>(a.champion_name())),id)<own)return true;
        }
        return false;
    }
    const int p=preferredCapturer(g);
    if(p<0||p==slot||p>=static_cast<int>(rosterHandles.size())||(shared[p]&0x80)||(shared[p]&63)!=g.id+1||!enough(31000))return false;
    for(auto a:safeChamps(team::ally)){
        if(static_cast<unsigned>(static_cast<bc::handle_champion_t>(a))!=rosterHandles[p])continue;
        if(!a.is_alive()||!g.tilesBB.is_set(a.position())||a.health()<a.max_health()*.6f||a.is_recalling()||a.is_submitting_gems()||a.is_teleporting()||a.buffs().has_stun())return false;
        // An already present preferred owner must also acknowledge this task.
        return true;
    }
    return false;
}

bool Bot::captureExchange(Group& held){
    if(!enough(48000))return false;
    const auto pos=bc::self().position();const auto visible=bc::vision::visible_tiles();
    const auto enemies=bc::vision::champion_tiles(team::enemy);
    int alternative=-1;float best=OP_DENIAL_VALUE*(held.gems+OP_GOLD_WEIGHT*held.gold);
    for(const auto& g:groups){
        if(!enough(42000))break;
        if(g.id==held.id||g.state!=2||stalledUntil[g.id]>round||allyCapturing(g.id)||(visible&g.tilesBB).is_empty()||!(enemies&g.tilesBB).is_empty())continue;
        const int d=gdist(g,pos);if(d==UNR||d>8)continue;
        if(!std::holds_alternative<bc::map::camp_group_reward_available>(rawGroups[g.id].state()))continue;
        const float value=(g.gems+OP_GOLD_WEIGHT*g.gold)*8/(8+d);
        if(value>best){best=value;alternative=g.id;}
    }
    if(alternative<0){stage="op-denial-hold";return false;}
    const int old=target,since=captureSince,stall=stalledUntil[old];
    releaseCapture();target=alternative;stalledUntil[old]=round+16;choiceRound=-1;
    const bool moved=moveToward(groups[target].tilesBB,false);
    if(!moved&&bc::self().position()==pos){target=old;captureSince=since;capturing=true;stalledUntil[old]=stall;}
    stage=moved?"op-denial-exchange":"op-denial-deferred";return moved;
}

bool Bot::scoringOperation(){
    auto& me=bc::self();
    if(lowMode||!me.is_alive()||!me.can_move()||!enough(48000))return false;
    const auto pos=me.position();
    // Receive an acknowledged, short-lived invitation; never count the caller
    // as a participant unless personally observed at a usable arrival time.
    const unsigned packet=shared[6]|(static_cast<unsigned>(shared[7])<<8);
    // Do not repeatedly re-plan an already productive farm operation. Calls
    // still receive prompt service; new invitations are scheduled sparsely.
    if(OP_ALTAR_SQUAD<1&&operationGroup<0&&!capturing&&(!helpValid||((packet>>11)&3)!=3)&&round%4!=slot%4)return false;
    if(helpValid&&nAllies<=6&&((packet>>11)&3)==3&&static_cast<int>((packet>>8)&7)==slot&&me.gem_count()<44&&me.health()>=me.max_health()*.65f){
        const int scale=std::max(1,(std::max(W,H)+15)/16);
        const vec2 anchor{std::min(W-1,static_cast<int>(packet&15)*scale+scale/2),std::min(H-1,static_cast<int>((packet>>4)&15)*scale+scale/2)};
        int goal=-1,distance=scale*2+2;
        for(const auto& g:groups){const int d=heuristic(g.tiles,anchor);if(d<distance&&(g.totalHp>=OP_HELP_HP||g.gold>=300)&&g.state<3&&g.dOwn!=UNR){distance=d;goal=g.id;}}
        if(goal>=0){
            operationGroup=goal;operationUntil=round+8;operationMode=groups[goal].state==2?2:1;operationAnchor=anchor;target=goal;choiceRound=-1;
            stage="op-help-accepted";
        }
    }
    if(operationGroup>=0&&operationUntil>=round&&groups[operationGroup].state==2&&operationMode==2){
        auto& g=groups[operationGroup];target=operationGroup;
        if(g.tilesBB.is_set(pos)){capturing=true;captureSince=round;stage="op-denial-relief";return true;}
        bc::bitboard near;near.draw_chebyshev(operationAnchor,2);near&=g.tilesBB;
        if(moveToward(near.is_empty()?g.tilesBB:near,true)){stage="op-denial-arrival";return true;}
    }else if(operationGroup>=0&&operationUntil>=round&&groups[operationGroup].state<2&&!allyCapturing(operationGroup)){
        target=operationGroup;choiceRound=-1;
        // The ordinary executor retains control of movement, attack and danger.
        // This invitation changes only the committed scoring task.
    }else{operationGroup=-1;operationMode=0;}

    // Invite the cheapest usable helper for a genuinely difficult current task.
    if(target>=0&&target<static_cast<int>(groups.size())&&nAllies<=6&&enough(62000)){
        const auto& g=groups[target];
        const bool denial=capturing&&g.state==2&&contestSince>=0&&round-contestSince>12;
        if((g.state<2&&g.totalHp>=OP_HELP_HP&&(g.gems>=80||g.gold>=300)&&gdist(g,pos)<=6&&!allyCapturing(g.id))||denial){
            int helper=-1;float best=-1e9f;
            for(auto a:safeChamps(team::ally)){
                if(!enough(50000))break;
                const auto id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(a));
                int s=-1;for(int j=0;j<nAllies;++j)if(rosterHandles[j]==id)s=j;
                if(s<0||s==slot||(shared[s]&0xC0)||!a.is_alive()||a.is_recalling()||a.is_submitting_gems()||a.is_teleporting()||a.health()<a.max_health()*.65f)continue;
                const int eta=std::max(0,static_cast<int>(gdist(g,a.position()))-a.attack_range());if(eta>6)continue;
                const int claim=(shared[s]&63)-1;
                if(claim==g.id)continue; // an existing participant needs no duplicate call
                float displaced=0;if(claim>=0&&claim<static_cast<int>(groups.size()))displaced=groups[claim].gems+OP_GOLD_WEIGHT*groups[claim].gold;
                float value=a.strength()+a.focus()*.1f-eta*18-displaced*.25f;
                if(denial){const int type=static_cast<int>(a.champion_name());value=120-eta*18-displaced*.2f-(type==1?90:type==7?70:type==3||type==4?50:10);}
                if(value>best){best=value;helper=s;}
            }
            if(helper>=0&&best>0){
                const int scale=std::max(1,(std::max(W,H)+15)/16);
                const auto anchor=denial?pos:g.center;
                const auto call=v1Pack(anchor.x/scale,anchor.y/scale,helper,3,round);
                // Do not replace a fresh emergency disengagement request.
                const int age=(round-static_cast<int>((packet>>13)&7))&7;
                if(!packet||age>1||((packet>>11)&3)!=2){
                    std::array<std::byte,2> bytes{std::byte(call&255),std::byte(call>>8)};
                    ACT(bc::shared_memory.write(6,std::span<const std::byte>(bytes)));
                    shared[6]=call&255;shared[7]=call>>8;helpReader.published(call,round);
                }
            }
        }
    }
    if(capturing)return false;
    if(OP_ALTAR_SQUAD<1||altars.empty()||altars.size()>static_cast<unsigned>(OP_ALTAR_MAX)||round<OP_ALTAR_START||bankGateClosed())return false;
    if(me.health()<me.max_health()*.7f||me.gem_count()>0||nAllies<5)return false;
    // Keep at least two miners. Combat roles precede income carriers; a linked
    // pair is selected together so this policy does not strand its other half.
    std::vector<std::pair<int,int>> roles;
    for(int j=0;j<nAllies;++j){
        int value=0;switch(slotType[j]){case 12:value=100;break;case 3:case 4:value=90;break;case 2:value=80;break;case 0:value=70;break;case 1:value=10;break;default:value=30;}
        roles.push_back({-value,j});
    }
    std::sort(roles.begin(),roles.end());const int guards=std::min(nAllies-std::max(1,static_cast<int>(OP_ALTAR_MINERS)),static_cast<int>(OP_ALTAR_SQUAD));
    int rank=-1;for(int k=0;k<guards;++k)if(roles[k].second==slot)rank=k;if(rank<0)return false;
    if(partnerSlot>=0){bool paired=false;for(int k=0;k<guards;++k)paired|=roles[k].second==partnerSlot;if(!paired)return false;}
    if(altarHold==-2&&round<altarHoldUntil)return false;
    int altar=-1;float best=-1e9f;
    for(int a=0;a<static_cast<int>(altars.size());++a){
        const auto p=altars[a].pos;const int d=altarDistance(a,pos);if(d==UNR)continue;
        float value=-d*.5f;
        for(const auto& g:groups)if(cheb(g.center,p)<=10)value+=g.gems/(3.0f+cheb(g.center,p));
        if(value>best){best=value;altar=a;}
    }
    if(altar<0)return false;
    const bool broadcast=helpValid&&((packet>>8)&7)==6&&((packet>>11)&3)==3;
    if(broadcast){
        const int scale=std::max(1,(std::max(W,H)+15)/16);
        const vec2 called{std::min(W-1,static_cast<int>(packet&15)*scale+scale/2),std::min(H-1,static_cast<int>((packet>>4)&15)*scale+scale/2)};
        int distance=scale*2+2;for(int a=0;a<static_cast<int>(altars.size());++a){const int d=cheb(called,altars[a].pos);if(d<distance){distance=d;altar=a;}}
    }
    const auto anchor=altars[altar].pos;
    bool traffic=false,enemyNear=false,valuableAlly=false;
    for(auto a:safeChamps(team::enemy))if(a.is_alive()&&cheb(a.position(),anchor)<=7){enemyNear=true;if(a.gem_count()>=12)traffic=true;}
    for(auto a:safeChamps(team::ally))if(a.is_alive()&&cheb(a.position(),anchor)<=6&&a.gem_count()>=30)valuableAlly=true;
    traffic|=enemyNear&&valuableAlly;
    if(!traffic&&!broadcast&&altarHold!=altar)return false;
    if(traffic&&nAllies<=6&&enough(34000)){
        const int scale=std::max(1,(std::max(W,H)+15)/16);
        const auto call=v1Pack(anchor.x/scale,anchor.y/scale,6,3,round);
        if(call!=packet){std::array<std::byte,2> bytes{std::byte(call&255),std::byte(call>>8)};ACT(bc::shared_memory.write(6,std::span<const std::byte>(bytes)));shared[6]=call&255;shared[7]=call>>8;helpReader.published(call,round);}
    }
    if(altarHold!=altar){altarHold=altar;altarHoldUntil=round+static_cast<int>(OP_ALTAR_COMMIT);}
    if(traffic)altarHoldUntil=round+static_cast<int>(OP_ALTAR_COMMIT);
    if(round>altarHoldUntil){altarHold=-2;altarHoldUntil=round+24;operationMode=0;return false;}
    // Station outside the tribute approaches and leave those tiles to miners.
    const int radius=ranged?3:2;bc::bitboard ring,inner;ring.draw_chebyshev(anchor,radius);inner.draw_chebyshev(anchor,1);ring&=~inner;ring&=~staticBlocked;
    auto candidates=ring.positions();if(candidates.empty())return false;
    const auto enemyTiles=enemySpawnBB.positions();const auto enemy=enemyTiles.empty()?vec2{W/2,H/2}:enemyTiles.front();
    std::sort(candidates.begin(),candidates.end(),[&](vec2 a,vec2 b){const int aa=cheb(a,enemy)*8+a.y*2+a.x,bb=cheb(b,enemy)*8+b.y*2+b.x;return aa<bb;});
    const auto station=candidates[std::min<int>(rank*2,candidates.size()-1)];
    operationMode=4;progressKind=support;target=-1;
    if(cheb(pos,station)<=1){stage="op-altar-watch";return true;}
    bc::bitboard goals;goals.draw_chebyshev(station,1);goals&=ring;
    if(moveToward(goals,true)){stage="op-altar-stage";return true;}
    return false;
}
