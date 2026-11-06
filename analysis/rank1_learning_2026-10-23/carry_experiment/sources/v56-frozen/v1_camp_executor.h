// All candidates are personally visible. Query each camp once during scoring;
// refresh the chosen live target after damage instead of attacking a dead handle.
bool Bot::attackCampsOf(int gid){
    stage="v1-camp-actions";auto& me=bc::self();
    if(!enough(42000))return false;
    const auto pos=me.position();const int range=me.attack_range();
    const float strength=me.strength(),focus=me.focus();
    if(!me.can_attack()&&(castThisTurn||!me.can_cast()))return false;
    const auto all=bc::vision::camp_tiles();bc::bitboard local;local.draw_chebyshev(pos,std::max(4,range+1));
    struct Seen{unsigned id;vec2 p;float hp,strength;bool target;};std::vector<Seen> seen;
    for(auto p:(all&local).positions()){
        if(!enough(32000))break;
        unsigned id;bc::detail::camp_state c{};
        if(bc::detail::sdk_camp_at(p.x,p.y,&id)||bc::detail::sdk_camp(id,&c)||c.health<=0)continue;
        seen.push_back({id,p,c.health,c.strength,gid<0||groups[gid].tilesBB.is_set(p)});
    }
    if(seen.empty())return false;
    const unsigned selfId=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    bool acted=false;
    auto cast=[&](int slot,unsigned kind,unsigned id,vec2 p){
        if(castThisTurn||!enough(23000)||!me.can_cast())return false;
        int used=0;const int code=bc::detail::sdk_cast(slot,kind,id,p.x,p.y,&used);
        if(code){++apiErrors;return false;}if(used){castThisTurn=acted=true;return true;}return false;
    };
    auto basic=[&](){
        if(!enough(22000)||!me.can_attack())return false;
        const auto basicPosition=me.position();
        int best=-1;float value=-1e9f;
        for(int j=0;j<static_cast<int>(seen.size());++j){auto& c=seen[j];
            if(!c.target||cheb(c.p,basicPosition)>range)continue;
            bc::detail::camp_state now{};if(bc::detail::sdk_camp(c.id,&now)||now.health<=0){c.hp=0;continue;}c.hp=now.health;
            float score=-c.hp;
            if(myType==bc::champion_type::vendetta&&c.hp<=strength)score=1000-c.hp;
            if(myType==bc::champion_type::varg){float useful=0;for(const auto& other:seen)if(cheb(other.p,c.p)<=1)useful+=std::min(other.hp,strength);score=useful-c.hp*.00001f;}
            if(score>value){value=score;best=j;}
            if(!enough(24000))break;
        }
        if(best<0||!enough(20000))return false;
        const int code=bc::detail::sdk_attack(static_cast<unsigned>(bc::detail::entity_kind::camp),seen[best].id);
        if(code){++apiErrors;return false;}attackedThisTurn=acted=true;return true;
    };
    // X_CAMPSTUN: stun the strongest armed camp in reach (a stunned camp does not hit back),
    // only while no enemy champion is within 7 tiles (the stun stays available for fights).
    bool stunCamps=false;
    if(X_CAMPSTUN&&myType!=bc::champion_type::ren){
        stunCamps=true;
        try{for(auto q:bc::vision::champion_tiles(team::enemy).positions())if(cheb(q,pos)<=7){stunCamps=false;break;}}catch(const TurnAbort&){throw;}catch(...){stunCamps=false;}
    }
    if(!castThisTurn&&me.can_cast())for(int k=0;k<2;++k){
        if(!enough(28000))break;
        int cd=8;bc::detail::ability_props a{};
        bc::detail::check(bc::detail::sdk_champion_cooldown(selfId,k,&cd));if(cd)continue;
        bc::detail::check(bc::detail::sdk_champion_ability_props(selfId,k,&a));
        if(movedThisTurn&&(a.attributes&1))continue;
        if(!(a.targets&bc::detail::ability_target_camps))continue;
        float reach=0;
        if(a.kind==2)reach=a.payload.damage.range;
        else if(a.kind==3)reach=a.payload.aoe_damage.range;
        else if(a.kind==4&&myType==bc::champion_type::ren)reach=a.payload.cc.range;
        else if(a.kind==4&&stunCamps)reach=a.payload.cc.range;
        else continue;
        const bool campStun=a.kind==4&&myType!=bc::champion_type::ren;
        const Seen* target=nullptr;
        for(const auto& c:seen)if(c.target&&c.hp>0&&cheb(pos,c.p)<=reach&&(!campStun||c.strength>0)&&(!target||(campStun?c.strength>target->strength:c.hp>target->hp)))target=&c;
        if(target&&cast(k,static_cast<unsigned>(bc::detail::entity_kind::camp),target->id,target->p))break;
    }
        // A damaging dash requires a different, legally reachable landing tile.
    // Never wake an excluded boss as collateral while clearing a regular camp.
    if(myType==bc::champion_type::heart_of_ruin&&!castThisTurn&&enough(42000)&&me.can_cast()){
        int cd=8;bc::detail::check(bc::detail::sdk_champion_cooldown(selfId,1,&cd));
        if(!cd){
            float amount=0;bc::detail::check(bc::detail::sdk_champion_ability_damage(selfId,1,&amount));
            const auto current=me.position();const auto blocked=blockedNow();const auto passable=blocked&~bc::map::holes();
            vec2 landing=current;float value=0;
            for(auto p:(passable.reachable_tiles(current,2)&~blocked).positions()){
                if(p==current)continue;float hit=0,exposure=0;bool collateral=false;
                for(const auto& c:seen){
                    const int d=cheb(p,c.p);
                    if(d<=1){if(c.target)hit+=std::min(c.hp,amount)+c.strength;else if(c.strength>0)collateral=true;}
                    else if(d<=5)exposure+=c.strength*2;
                }
                const float candidate=hit-exposure;
                if(!collateral&&candidate>value+1){value=candidate;landing=p;}
            }
            if(value>20&&landing!=current&&cast(1,0,0,landing)){movedThisTurn=true;previousTile=current;}
        }
    }

    basic();
    if(!castThisTurn&&attackedThisTurn&&enough(26000)&&me.can_cast()){
        for(int k=0;k<2;++k){
            int cd=8;bc::detail::ability_props a{};
            bc::detail::check(bc::detail::sdk_champion_cooldown(selfId,k,&cd));if(cd)continue;
            bc::detail::check(bc::detail::sdk_champion_ability_props(selfId,k,&a));
            if(a.kind==1){if(cast(k,0,0,me.position()))basic();break;}
        }
        if(!castThisTurn&&(myType==bc::champion_type::varg||myType==bc::champion_type::heart_of_ruin)&&enough(24000)){
            int cd=8;bc::detail::check(bc::detail::sdk_champion_cooldown(selfId,myType==bc::champion_type::heart_of_ruin?0:1,&cd));if(!cd)cast(myType==bc::champion_type::heart_of_ruin?0:1,0,0,me.position());
        }
    }
    return acted;
}
