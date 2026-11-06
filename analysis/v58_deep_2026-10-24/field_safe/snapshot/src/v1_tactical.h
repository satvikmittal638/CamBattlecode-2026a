// Current actions are enumerated legally. Turn-two responses are conservative
// estimates from personally visible state, not an exact adversarial game tree.
struct V1Body {
    unsigned id=0;bc::detail::champion_info info{};float shield=0,mitigation=1;
    unsigned bag=0;int cd[2]{8,8};bool stun=false;float heartDash=0,spell=0,spellRange=0;int spellSlot=-1,resetSlot=-1;
    vec2 position()const{return {info.x,info.y};}
};
static V1Body v1Body(unsigned id,const bc::detail::champion_info& info){
    V1Body b;b.id=id;b.info=info;
    bc::detail::buff_data buffs[3]{};unsigned count=0;
    bc::detail::check(bc::detail::sdk_champion_buff_data(id,buffs,3,&count));
    for(unsigned j=0;j<std::min(count,3u);++j){if(buffs[j].type==0)b.shield+=buffs[j].data.shield.value;if(buffs[j].type==1&&buffs[j].data.stun.duration>0)b.stun=true;}
    unsigned items[42]{};bc::detail::check(bc::detail::sdk_champion_items(id,items));
    if(items[13]||items[15]||items[17])b.mitigation=.9f;
    bc::detail::check(bc::detail::sdk_champion_gems(id,&b.bag));
    for(unsigned k=0;k<2;++k)bc::detail::check(bc::detail::sdk_champion_cooldown(id,k,&b.cd[k]));
    if(info.type==12)bc::detail::check(bc::detail::sdk_champion_ability_damage(id,1,&b.heartDash));
    const auto& kit=v1KitForType(info.type);
    for(int k=0;k<2;++k){
        const auto& a=kit.definition.abilities[k];
        if(a.kind>=2&&a.kind<=4){
            const float damage=info.focus*v1DamageModifier(a);
            if(damage>b.spell){b.spell=damage;b.spellRange=v1DamageRange(a);b.spellSlot=k;}
        }
        if(a.kind==1)b.resetSlot=k;
    }
    return b;
}
static bool v1Cast(unsigned slot,unsigned kind,unsigned id,vec2 p){
    std::int32_t result=0;bc::detail::check(bc::detail::sdk_cast(slot,kind,id,p.x,p.y,&result));return result!=0;
}
static bool v1Attack(unsigned id){bc::detail::check(bc::detail::sdk_attack(1,id));return true;}
static float v1Response(const V1Body& b,vec2 p,int tick,bool disabled=false){
    if(disabled || (tick==0&&b.stun))return 0;
    const auto& i=b.info;const int d=cheb(b.position(),p);const bool melee=i.attack_range==1;
    const float basic=d<=i.attack_range+(melee?1:0)?i.strength:0;float best=basic;
    auto ready=[&](int k){return b.cd[k]<=tick;};
    const int t=i.type;
    // Heart can walk, then dash two tiles and land a radius-one hit/stun.
    // The native amount includes its current missing-health damage bonus.
    if(t==12&&ready(1)&&d<=3+((i.state&8)?1:0))best=std::max(best,b.heartDash+i.strength*1.5f);
    if(b.spellSlot>=0&&ready(b.spellSlot)&&d<=b.spellRange)best=std::max(best,b.spell+(d<=i.attack_range?i.strength:0));
    const bool reset=b.resetSlot>=0;const int resetSlot=b.resetSlot;
    if(reset&&ready(resetSlot)){
        if(d<=i.attack_range+(melee?1:0))best=std::max(best,2*i.strength);
        else if(!melee&&d==i.attack_range+1)best=std::max(best,i.strength);
    }
    if((t==1||t==2||t==4||t==9)&&ready(1)&&d<=i.attack_range+2+(melee?1:0))best=std::max(best,i.strength);
    return best;
}

int Bot::tacticalFight(){
    auto& me=bc::self();const auto origin=me.position();
    bc::bitboard area;area.draw_chebyshev(origin,6);
    const auto visible=bc::vision::champion_tiles(team::enemy)&area;
    if(visible.is_empty()||!enough(60000))return -1;
    std::vector<V1Body> foes,mates;
    for(auto p:visible.positions()){
        if(!enough(44000))return -1;
        unsigned id;bc::detail::champion_info i{};
        if(!bc::detail::sdk_champion_at(p.x,p.y,&id)&&!bc::detail::sdk_champion(id,&i)&&(i.state&1))foes.push_back(v1Body(id,i));
    }
    if(foes.empty())return -1;
    for(auto p:bc::vision::champion_tiles(team::ally).positions()){
        if(!enough(38000))break;
        unsigned id;bc::detail::champion_info i{};
        if(!bc::detail::sdk_champion_at(p.x,p.y,&id)&&!bc::detail::sdk_champion(id,&i)&&(i.state&1)){
            // Helper value uses current positions/action availability only.
            V1Body b;b.id=id;b.info=i;mates.push_back(b);
        }
    }
    const unsigned selfId=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    bc::detail::champion_info selfInfo{};bc::detail::check(bc::detail::sdk_champion(selfId,&selfInfo));
    const auto own=v1Body(selfId,selfInfo);const float S=selfInfo.strength,F=selfInfo.focus;
    struct Spell{int slot,kind;float range,damage,shield;bool cc,exclusive;unsigned targets;};std::vector<Spell> spells;
    for(int k=0;k<2;++k)if(own.cd[k]==0&&(selfInfo.state&2048)&&!castThisTurn){
        bc::detail::ability_props a{};bc::detail::check(bc::detail::sdk_champion_ability_props(selfId,k,&a));
        Spell s{k,static_cast<int>(a.kind),0,0,0,a.kind==4,!!(a.attributes&1),a.targets};
        if(a.kind==2){s.range=a.payload.damage.range;s.damage=F*a.payload.damage.modifier;}
        if(a.kind==3){s.cc=a.payload.aoe_damage.duration>0;s.range=a.payload.aoe_damage.range;s.damage=F*a.payload.aoe_damage.modifier;}
        if(a.kind==4){s.range=a.payload.cc.range;s.damage=F*a.payload.cc.modifier;}
        if(a.kind==6)s.range=std::get<bc::ability_dash>(*me.abilities()[k].info()).range;
        if(a.kind==7)s.shield=F*a.payload.shield.modifier;
        if(a.kind)spells.push_back(s);
    }
    requestHelp(foes,mates);
    if(!enough(28000))return -1;
    auto blocked=blockedNow();const auto walking=blocked.reachable_tiles(origin,1).positions();
    const auto incoming=[&](vec2 p,const V1Body* target,bool cc,bool kill){
        float sum=0;
        for(const auto& f:foes){if(kill&&target&&(f.id==target->id||(target->info.type==3&&f.info.type==4)||(target->info.type==4&&f.info.type==3)))continue;
            const bool disabled=cc&&target&&f.id==target->id&&f.info.type!=7;
            sum+=v1Response(f,p,0,disabled);
            if(!(f.info.state&32))sum+=v1Response(f,p,1,false);
        }return sum*own.mitigation;
    };
    // X_TACTREACH: with no enemy within one step plus our longest reach no plan can hit anything.
    // Skip the enumeration: in standoffs it cost ~50k fuel a turn and starved routing/camp actions.
    int reach=selfInfo.attack_range;for(const auto& s:spells)if(s.kind>=2&&s.kind<=4)reach=std::max(reach,static_cast<int>(std::ceil(s.range)));
    int nearest=99;for(const auto& f:foes)nearest=std::min(nearest,cheb(origin,f.position()));
    const bool inReach=!X_TACTREACH||nearest<=reach+1||(selfInfo.type==12&&nearest<=3);
        // Heart's landing damage/control is part of the cast, not a second spell.
    if(inReach&&selfInfo.type==12&&own.cd[1]==0&&!castThisTurn&&(selfInfo.state&2048)&&enough(43000)){
        const auto passable=blocked&~bc::map::holes();vec2 landing=origin;float bestValue=0;
        for(auto p:(passable.reachable_tiles(origin,2)&~blocked).positions()){
            if(p==origin)continue;float hit=0,risk=0;bool touches=false;
            for(const auto& f:foes){
                const bool affected=cheb(p,f.position())<=1;
                const float damage=affected?std::max(0.0f,own.heartDash*f.mitigation-f.shield):0;
                const bool kill=damage>=f.info.health;
                if(affected){touches=true;hit+=std::min(f.info.health,damage)+(kill?120+f.bag*2:0);}
                if(!kill){const bool disabled=affected&&f.info.type!=7;risk+=v1Response(f,p,0,disabled);if(!(f.info.state&32))risk+=v1Response(f,p,1);}
                if(affected&&f.info.type==9)risk+=.2f*f.info.focus;
            }
            risk=std::max(0.0f,risk*own.mitigation-own.shield);
            if(!touches||risk>=selfInfo.health*.8f)continue;
            const float value=hit-risk*(own.bag?1.7f:1.1f);
            if(value>bestValue+10){bestValue=value;landing=p;}
        }
        if(landing!=origin&&enough(23000))try{
            if(ACT(v1Cast(1,0,0,landing))){
                castThisTurn=movedThisTurn=true;previousTile=origin;
                for(const auto& f:foes)if(cheb(f.position(),landing)<=1&&me.can_attack()){
                    bc::detail::champion_info now{};
                    if(!bc::detail::sdk_champion(f.id,&now)&&(now.state&1)&&bc::vision::champion_tiles(team::enemy).is_set({now.x,now.y})){
                        ACT(v1Attack(f.id));attackedThisTurn=true;break;
                    }
                }
                releaseCapture();stage="v36-heart-control";return 1;
            }
        }catch(const TurnAbort&){throw;}catch(...){}
    }

    struct Plan{const V1Body* target=nullptr;vec2 move;int spell=-1;bool reset=false;float value=0,damage=0;bool kill=false;};
    Plan best;best.move=origin;
    // X58_NOPLAN: the highest-value plan that deals damage without moving, even when its value is not positive.
    Plan trade;trade.move=origin;trade.value=-1e9f;
    std::vector<const V1Body*> choices;for(const auto& f:foes)choices.push_back(&f);
    std::sort(choices.begin(),choices.end(),[&](auto a,auto b){return a->info.health+a->shield-a->bag*2+cheb(origin,a->position())*30 < b->info.health+b->shield-b->bag*2+cheb(origin,b->position())*30;});
    if(choices.size()>2)choices.resize(2);
    if(!inReach)choices.clear();
    for(const auto* choice:choices){const auto& target=*choice;
        if(enemySpawnBB.is_set(target.position())&&target.info.health>S*2)continue;
        auto consider=[&](vec2 p,int sk,bool reset){
            if(!enough(42000))return;
            const bool move=p!=origin;const int d=cheb(p,target.position());
            const Spell* cast=sk>=0?&spells[sk]:nullptr;
            if(move&&!(selfInfo.state&8))return;
            if(move&&cast&&cast->exclusive)return;
            if(cast&&cast->kind>=2&&cast->kind<=4&&d>cast->range)return;
            bool basic=(selfInfo.state&16)&&d<=selfInfo.attack_range&&(!move||selfInfo.attack_range==1||reset);
            float raw=basic?S:0;int hits=basic?1:0;
            const bool cc=cast&&cast->cc;
            if(cast&&cast->damage>=0&&cast->kind>=2&&cast->kind<=4){raw+=cast->damage;++hits;}
            if(reset&&basic&&!move){raw+=S;++hits;}
            const float dealt=std::max(0.0f,raw*target.mitigation-target.shield);
            const bool kill=dealt>=target.info.health;
            float retaliation=target.info.type==9?hits*.2f*target.info.focus*own.mitigation:0;
            if((cast&&(cast->kind==3||(cast->kind==4&&(cast->targets&bc::detail::ability_target_ground)))) || (basic&&selfInfo.type==10))
                for(const auto& other:foes)if(other.id!=target.id&&other.info.type==9&&cheb(other.position(),target.position())<=1)retaliation+=.2f*other.info.focus*own.mitigation;
            float future=0;
            // A mobile unstunned target may leave ordinary attack range.
            const int nextD=d+(!cc&&!target.stun&&(target.info.state&8)?1:0);
            if(!kill&&nextD<=selfInfo.attack_range)future=S*target.mitigation;
            float danger=incoming(p,&target,cc,kill)+retaliation;
            const float extraShield=cast?cast->shield:0;
            danger=std::max(0.0f,danger-own.shield-extraShield);
            if(retaliation>=selfInfo.health+own.shield || (danger>=selfInfo.health*X_FIGHTRISK&&!kill))return;
            float support=0;
            for(const auto& a:mates)if(a.id!=selfId&&(a.info.state&16)&&!(a.info.state&(2|4|4096))&&cheb(a.position(),target.position())<=a.info.attack_range)support+=a.info.strength;
            float value=std::min(target.info.health,dealt+future*.5f)+std::min(dealt,support*.3f)-danger*(own.bag?1.7f:1.1f)-(move?8:0);
            if(kill)value+=120+target.bag*2;
            if(cc&&!target.stun&&target.info.type!=7)value+=v1Response(target,p,0)*.6f;
            if(cast&&cast->kind==3)for(const auto& f:foes)if(f.id!=target.id&&cheb(f.position(),target.position())<=1)value+=std::min(f.info.health,cast->damage*f.mitigation-f.shield);
            if(value>best.value+1)best={&target,p,sk,reset,value,dealt,kill};
            if(X58_NOPLAN&&!move&&dealt>0&&value>trade.value)trade={&target,p,sk,reset,value,dealt,kill};
        };
        consider(origin,-1,false);
        for(int k=0;k<static_cast<int>(spells.size());++k)if(spells[k].kind!=5&&spells[k].kind!=6)consider(origin,k,spells[k].kind==1);
        for(auto p:walking)if(p!=origin){
            if(!ranged)consider(p,-1,false);
            for(int k=0;k<static_cast<int>(spells.size());++k)if(!spells[k].exclusive&&spells[k].kind!=5&&spells[k].kind!=6)consider(p,k,spells[k].kind==1);
        }
    }
    if(!enough(23000))return -1;
    const float stayDanger=incoming(origin,nullptr,false,false)-own.shield;
    if(!best.target && stayDanger>selfInfo.health*X58_ESCAPERISK){
        if(X_MELEEHIT)meleeParting();
        vec2 escape=origin;float risk=stayDanger;
        for(auto p:walking){if(!enough(33000))break;const float r=incoming(p,nullptr,false,false);if(r<risk-1){risk=r;escape=p;}}
        bool acted=false;
        if(escape!=origin)try{if(ACT(me.move_absolute(escape))){movedThisTurn=acted=true;previousTile=origin;}}catch(const TurnAbort&){throw;}catch(...){}
        // After walking, enumerate a legal dash path. One cast is shared with
        // shields, resets and control; no incompatible second cast is added.
        for(const auto& s:spells)if(s.kind==6&&!castThisTurn&&me.can_cast()&&enough(20000)){
            const auto p=me.position();const auto occupied=blockedNow();const auto passable=occupied&~bc::map::holes();
            vec2 landing=p;float r0=incoming(p,nullptr,false,false);
            for(auto q:(passable.reachable_tiles(p,2)&~occupied).positions())if(cheb(p,q)<=s.range){if(!enough(25000))break;const float r=incoming(q,nullptr,false,false);if(r<r0-1){r0=r;landing=q;}}
            if(landing!=p)try{if(ACT(v1Cast(s.slot,0,0,landing))){castThisTurn=movedThisTurn=acted=true;}}catch(const TurnAbort&){throw;}catch(...){}
        }
        if(!castThisTurn&&me.can_cast()&&enough(19000))for(const auto& s:spells)if(s.kind==7){
            try{if(ACT(v1Cast(s.slot,0,0,me.position()))){castThisTurn=acted=true;}}catch(const TurnAbort&){throw;}catch(...){}
        }
        if(acted){releaseCapture();stage="v1-burst-escape";withdrewThisTurn=true;return 1;}
        return 0;
    }
    if(!best.target){
        for(const auto& f:foes)if(enemySpawnBB.is_set(f.position())&&f.info.health>S*2)return 0;
        for(const auto& f:foes)if(f.info.type==9&&.2f*f.info.focus*own.mitigation>=selfInfo.health+own.shield)return 0;
        // X58_NOPLAN: standing still in reach of enemies without acting takes damage for nothing.
        const bool holdingObjective=X58_NOPLANOBJ&&(capturing||(target>=0&&target<static_cast<int>(groups.size())&&groups[target].tilesBB.is_set(origin)));
        if(X58_NOPLAN&&stayDanger>0&&!holdingObjective&&selfInfo.health<selfInfo.max_health*X58_NOPLANHP){
            const bool canTrade=trade.target!=nullptr;
            if(canTrade&&(X58_NOPLAN==1||X58_NOPLAN==3))best=trade;
            else if(X58_NOPLAN>=2&&me.can_move()){
                vec2 step=origin;float risk=stayDanger;
                for(auto p:walking){if(!enough(30000))break;const float r=incoming(p,nullptr,false,false);if(r<risk-1){risk=r;step=p;}}
                if(step!=origin)try{if(ACT(me.move_absolute(step))){movedThisTurn=true;previousTile=origin;releaseCapture();stage="x58-noplan-step";withdrewThisTurn=true;return 1;}}catch(const TurnAbort&){throw;}catch(...){}
            }
        }
        if(!best.target)return -1;
    }
    const auto& target=*best.target;bool acted=false;
    // Source position is not a destination visibility test. A newly revealed
    // occupant may block a planned walk even when the old mask was clear.
    if(best.move!=origin&&(!me.can_move()||blockedNow().is_set(best.move)))return 0;
    if(best.move!=origin){try{if(!ACT(me.move_absolute(best.move)))return 0;movedThisTurn=acted=true;previousTile=origin;}catch(const TurnAbort&){throw;}catch(...){return 0;}}
    auto basic=[&](){bc::detail::champion_info now{};if(bc::detail::sdk_champion(target.id,&now)||!(now.state&1))return false;
        if(!me.can_attack()||cheb(me.position(),{now.x,now.y})>me.attack_range())return false;
        if(ACT(v1Attack(target.id))){attackedThisTurn=true;return true;}return false;};
    try{
        if(best.reset){
            if(!ranged||best.move==origin)acted=basic()||acted;
            const auto& s=spells[best.spell];if(ACT(v1Cast(s.slot,0,0,me.position()))){castThisTurn=acted=true;acted=basic()||acted;}
        }else{
            if(best.spell>=0){const auto& s=spells[best.spell];const unsigned kind=(s.targets&bc::detail::ability_target_enemies)?1:0;
                // A legal walk can hide a previously seen enemy behind terrain.
                // Shared or cached enemy coordinates cannot authorize a cast.
                const bool visible=s.kind==7||best.move==origin||bc::vision::champion_tiles(team::enemy).is_set(target.position());
                if(visible&&ACT(v1Cast(s.slot,kind,kind?target.id:0,s.kind==7?me.position():target.position())))castThisTurn=acted=true;
            }
            acted=basic()||acted;
        }
    }catch(const TurnAbort&){throw;}catch(...){}
    if(acted){releaseCapture();stage="v1-two-turn-fight";return 1;}
    return 0;
}
