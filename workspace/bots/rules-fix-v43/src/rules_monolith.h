// Included inside either bot namespace. Both use the same current-rule policy.
bool Bot::workMonolith(int gid,bc::bitboard& blind) {
    auto& me=bc::self();auto& g=groups[gid];
    if(!enough(34000))return false;
    const auto pos=me.position();
    const unsigned selfId=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    bc::detail::champion_info own{};
    if(bc::detail::sdk_champion(selfId,&own))return false;
    struct Spell { unsigned slot;bc::detail::ability_props props;float range;int cooldown; };
    std::vector<Spell> spells;int castRange=0;bool ready=false;
    for(unsigned k=0;k<2;++k) {
        int cd=0;bc::detail::ability_props a{};
        if(bc::detail::sdk_champion_cooldown(selfId,k,&cd)||bc::detail::sdk_champion_ability_props(selfId,k,&a))continue;
        float range=0,modifier=0;
        if(a.kind==2){range=a.payload.damage.range;modifier=a.payload.damage.modifier;}
        if(a.kind==3){range=a.payload.aoe_damage.range;modifier=a.payload.aoe_damage.modifier;}
        if(a.kind==4){range=a.payload.cc.range;modifier=a.payload.cc.modifier;}
        if(modifier<=0||range<=0||!(a.targets&(bc::detail::ability_target_camps|bc::detail::ability_target_ground)))continue;
        spells.push_back({k,a,range,cd});castRange=std::max(castRange,static_cast<int>(range));
        ready|=cd==0;
    }
    if(spells.empty())return false;
    unsigned items[42]{};if(bc::detail::sdk_champion_items(selfId,items))return false;
    float mitigation=1;
    if(items[25]||items[27]||items[29])mitigation*=.7f;
    if(items[13]||items[15]||items[17])mitigation*=.9f;
    float shield=0;bc::detail::buff_data buffs[3]{};unsigned n=0;
    if(!bc::detail::sdk_champion_buff_data(selfId,buffs,3,&n))
        for(unsigned j=0;j<std::min(n,3u);++j)if(buffs[j].type==0)shield+=buffs[j].data.shield.value;
    const auto pressure=[&](vec2 p){return rules_policy::pressure(g.threats,p.x,p.y)*mitigation;};
    const auto viable=[&](vec2 p){return rules_policy::can_commit(own.health,own.max_health,shield,pressure(p),rules_policy::exit_depth(g.threats,p.x,p.y));};
    bc::bitboard ring,safe,unsafe;
    for(auto p:g.tiles){bc::bitboard outer,inner;outer.draw_chebyshev(p,castRange);inner.draw_chebyshev(p,castRange-1);ring|=outer&~inner;}
    for(const auto& c:g.threats)if(c.strength>0){safe.draw_chebyshev({c.x,c.y},c.range+1);unsafe.draw_chebyshev({c.x,c.y},c.range);}
    safe&=~unsafe;safe&=~staticBlocked;ring&=~staticBlocked;ring&=~blind;
    // Full base camp pressure is deliberately retained for unseen group members.
    // The range-four spell ring is not a safe cooldown-waiting location.
    if(!ready||castThisTurn||!me.can_cast()||!viable(pos)) {
        stage="monolith-exit";
        if(pressure(pos)>0) { moveToward(safe,true);return true; }
        return true;
    }
    // Only enter casting positions for which there is HP for casting and exit.
    bc::bitboard affordable;
    for(auto p:ring.positions()){if(!enough(23500))break;if(viable(p))affordable.set(p,true);}
    if(affordable.is_empty()&&!enough(23500))return false;
    if(affordable.is_empty()) {
        if(pressure(pos)>0)moveToward(safe,true);
        else if(bc::vision::champion_tiles(team::enemy).is_empty()&&enough(26000)) {
            bool clear=true;
            for(const auto& c:safeCamps())if(c.is_awake()&&c.strength()>0&&cheb(pos,c.position())<=c.attack_range())clear=false;
            if(clear&&enough(22000))try{ACT(me.recall());}catch(const TurnAbort&){throw;}catch(...){}
        }
        stage="monolith-no-health-window";return true;
    }
    bool saw=false;
    for(auto tile:(bc::vision::camp_tiles()&g.tilesBB).positions()) {
        if(!enough(24000))break;
        unsigned id=0;bc::detail::camp_state c{};
        if(bc::detail::sdk_camp_at(tile.x,tile.y,&id)||bc::detail::sdk_camp(id,&c)||c.health<=0)continue;
        for(const auto& s:spells)if(!s.cooldown&&cheb(pos,tile)<=s.range) {
            saw=true;if(movedThisTurn&&(s.props.attributes&1))continue;
            int used=0;const unsigned kind=(s.props.targets&bc::detail::ability_target_camps)?2:0;
            try{if(ACT(([&](){bc::detail::check(bc::detail::sdk_cast(s.slot,kind,kind?id:0,tile.x,tile.y,&used));return used!=0;})())){castThisTurn=true;stage="monolith-cast-exposed";return true;}}catch(const TurnAbort&){throw;}catch(...){}
        }
    }
    if(affordable.is_set(pos)&&!saw){blind.set(pos,true);affordable.set(pos,false);}
    if(!affordable.is_empty())moveToward(affordable,false);
    stage="monolith-approach";return true;
}
