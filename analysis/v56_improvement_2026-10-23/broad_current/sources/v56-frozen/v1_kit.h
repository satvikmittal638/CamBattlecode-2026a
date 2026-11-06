// Included inside mm, after enough(). Designs are immutable for this engine.
// Cache only the design: health, Focus, shields and cooldowns stay fresh.
static const bc::detail::champion_design& v1KitForType(int type) {
    static bc::detail::champion_design cache[13]{};
    static bool ready[13]{};
    if(type<0||type>=13)throw TurnAbort{};
    if(!ready[type]){
        bc::detail::check(bc::detail::sdk_champion_design(type,&cache[type]));
        ready[type]=true;
    }
    return cache[type];
}
static float v1DamageModifier(const bc::detail::ability_props& a) {
    switch(a.kind){
    case 2:return a.payload.damage.modifier;
    case 3:return a.payload.aoe_damage.modifier;
    case 4:return a.payload.cc.modifier;
    case 6:return a.payload.dash.modifier;
    default:return 0;
    }
}
static float v1DamageRange(const bc::detail::ability_props& a) {
    switch(a.kind){
    case 2:return a.payload.damage.range;
    case 3:return a.payload.aoe_damage.range;
    case 4:return a.payload.cc.range;
    case 6:return a.payload.dash.range;
    default:return 0;
    }
}
static float v1CycleCast(const bc::detail::champion_design& kit,float strength,float focus) {
    float damage=0;
    for(const auto& a:kit.definition.abilities){
        damage=std::max(damage,focus*v1DamageModifier(a));
        if(a.kind==1)damage=std::max(damage,strength);
    }
    return damage;
}
