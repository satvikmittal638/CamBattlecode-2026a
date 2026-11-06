void Bot::willowTurn(){
    progressKind=support;
    auto& me=bc::self();const auto pos=me.position();
    struct Patient{unsigned id;bc::detail::champion_info info;int slot;};std::vector<Patient> patients;
    bool need=false;
    for(auto p:bc::vision::champion_tiles(team::ally).positions()){
        unsigned id;bc::detail::champion_info i{};
        if(bc::detail::sdk_champion_at(p.x,p.y,&id)||bc::detail::sdk_champion(id,&i)||!(i.state&1)||static_cast<unsigned>(static_cast<bc::handle_champion_t>(me))==id)continue;
        int s=-1;for(int j=0;j<nAllies;++j)if(rosterHandles[j]==id)s=j;
        patients.push_back({id,i,s});need|=i.max_health-i.health>179;
    }
    supportNeeded=need;
    if(need){supportTask=-1;supportUntil=0;}
    if(!castThisTurn&&me.can_cast())for(auto ab:me.abilities())if(ab.is_heal()&&selfReady(ab)){
        int best=-1;float missing=179;
        for(int j=0;j<static_cast<int>(patients.size());++j){const auto& p=patients[j];const float deficit=p.info.max_health-p.info.health;
            if(cheb(pos,{p.info.x,p.info.y})<=4&&deficit>missing){missing=deficit;best=j;}}
        if(best>=0)try{
            auto& p=patients[best];auto ally=bc::vision::champion_at({p.info.x,p.info.y});
            if(ACT(ab.use(ally))){castThisTurn=true;lastSupportRound=round;p.info.health=std::min(p.info.max_health,p.info.health+3*me.focus());}
        }catch(const TurnAbort&){throw;}catch(...){}
        break;
    }
    if(supportUntil>round&&supportTask>=0&&groups[supportTask].state!=3){farm();return;}
    if(fightChampions())return;
    if(doTribute())return;
    if(answerHelp())return;
    int chosen=-1;float best=-1e9f;
    for(int j=0;j<static_cast<int>(patients.size());++j){const auto& p=patients[j];
        const float deficit=p.info.max_health-p.info.health;
        float value=deficit>179?30*deficit/std::max(1.0f,p.info.max_health):0;
        value+=(p.info.type==3?3:0)-cheb(pos,{p.info.x,p.info.y})*.25f;
        if(p.id==supportLeader && round<supportLeaderUntil && p.info.health<p.info.max_health*.85f)value+=10;
        if(value>best){best=value;chosen=j;}
    }
    if(chosen<0){farm();return;}
    if(supportLeader!=patients[chosen].id){supportLeader=patients[chosen].id;supportLeaderUntil=round+8;}
    const auto& leader=patients[chosen];const vec2 lp{leader.info.x,leader.info.y};
    int gid=leader.slot>=0?(shared[leader.slot]&63)-1:-1;
    if(gid>=static_cast<int>(groups.size()))gid=-1;
    target=gid;
    if(gid>=0&&attackCampsOf(gid))return;
    bc::bitboard near;near.draw_chebyshev(lp,3);
    bc::bitboard goals;
    if(gid>=0)for(auto p:(bc::vision::camp_tiles()&groups[gid].tilesBB).positions()){
        unsigned id;bc::detail::camp_state c{};
        if(!bc::detail::sdk_camp_at(p.x,p.y,&id)&&!bc::detail::sdk_camp(id,&c)&&c.health>0)goals.draw_chebyshev(p,me.attack_range());
    }
    goals&=near;
    if(!goals.is_empty()){
        if(!goals.is_set(pos))moveToward(goals,false);else yieldToAllies();
        return;
    }
    if(cheb(pos,lp)>2){bc::bitboard g;g.draw_chebyshev(lp,2);moveToward(g,false,true);}else yieldToAllies();
}
