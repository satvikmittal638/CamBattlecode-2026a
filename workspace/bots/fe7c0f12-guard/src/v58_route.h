// Routing may not create a new known one-action lethal exposure. Combat and
// emergency escape keep their own plans; only travel goals use this mask.
bc::bitboard Bot::lethalRouteTiles(vec2 origin){
    bc::bitboard unsafe;
    const auto visible=bc::vision::champion_tiles(team::enemy);
    if(visible.is_empty())return unsafe;
    if(routeShotRound!=round){
        routeShots.clear();routeShotRound=-1;
        const auto id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(bc::self()));
        bc::detail::champion_info own{};unsigned items[42]{};
        if(bc::detail::sdk_champion(id,&own)||bc::detail::sdk_champion_items(id,items))throw TurnAbort{};
        routeMitigation=(items[13]||items[15]||items[17])?.9f:1.0f;
        routeEffectiveHp=own.health;
        bc::detail::buff_data buffs[3]{};unsigned count=0;
        if(bc::detail::sdk_champion_buff_data(id,buffs,3,&count))throw TurnAbort{};
        for(unsigned j=0;j<std::min(3u,count);++j)if(buffs[j].type==0)routeEffectiveHp+=buffs[j].data.shield.value;
        if(!enough(25000))throw TurnAbort{};
        for(auto p:visible.positions()){
            if(!enough(23000))throw TurnAbort{};
            unsigned foe=0;bc::detail::champion_info i{};
            if(bc::detail::sdk_champion_at(p.x,p.y,&foe)||bc::detail::sdk_champion(foe,&i)||!(i.state&1))continue;
            const float bonus=i.type==12?1.0f+.5f*(1-i.health/std::max(1.0f,i.max_health)):1.0f;
            routeShots.push_back({p,i.strength*bonus,i.attack_range+(i.attack_range==1?1:0)});
            const auto& kit=v1KitForType(i.type);
            for(int k=0;k<2;++k){
                const auto& a=kit.definition.abilities[k];
                if(a.kind<1||a.kind>6||a.kind==5)continue;
                int cd=8;if(bc::detail::sdk_champion_cooldown(foe,k,&cd)||cd)continue;
                float damage=0;int reach=0;
                if(a.kind==1){damage=2*i.strength*bonus;reach=i.attack_range+(i.attack_range==1?1:0);}
                if(a.kind>=2&&a.kind<=4){damage=i.focus*v1DamageModifier(a)*bonus;reach=static_cast<int>(v1DamageRange(a))+(a.kind==3?a.payload.aoe_damage.radius:0)+(!(a.attributes&1)?1:0);}
                if(a.kind==6){
                    if(i.type==12){damage=i.focus*a.payload.dash.modifier*bonus;reach=a.payload.dash.range+2;}
                    else{damage=i.strength*bonus;reach=i.attack_range+a.payload.dash.range+(i.attack_range==1?1:0);}
                }
                if(damage>0&&reach>0)routeShots.push_back({p,damage,reach});
            }
        }
        if(!enough(20000))throw TurnAbort{};
        routeShotRound=round;
    }
    for(const auto& shot:routeShots){
        const int d=std::max(std::abs(origin.x-shot.p.x),std::abs(origin.y-shot.p.y));
        // If already exposed, this mask must not imprison an escaping unit.
        if(d>shot.range&&shot.damage*routeMitigation>=routeEffectiveHp)unsafe.draw_chebyshev(shot.p,shot.range);
    }
    unsafe.set(origin,false);
    return unsafe;
}
