// Included inside mm. Engine metadata defines costs, combination sizes and item identity.
void Bot::shop() {
    auto& me=bc::self();
    if(!enough(30000)||me.gold_count()<30)return;
    if(me.is_alive()&&!onSpawn()&&myType!=bc::champion_type::tavi)return;
    using Family=bc::item_family;using Stat=bc::item_stat;
    const bool focus=myType==bc::champion_type::marcella||myType==bc::champion_type::heart_of_ruin||myType==bc::champion_type::willow||myType==bc::champion_type::prism||myType==bc::champion_type::tavi;
    const bool healthScale=myType==bc::champion_type::ryth;
    const Stat damage=focus?Stat::focus:Stat::strength;
    const Stat farmStat=healthScale?Stat::health:damage;
    struct Step{Family family;Stat stat;unsigned ingredients;};
    const Step core[]={
        {Family::jungle,farmStat,5},
        {Family::bruiser,Stat::health,5},
        {Family::monster,farmStat,5},
        {Family::durability,Stat::health,5},
        {Family::capture,damage,5},
        {Family::collectors,damage,5},
        {Family::treasure,damage,5},
        {Family::tribute,damage,5}
    };
    try{
        auto counts=me.item_count();unsigned calls=0;
        // A successful buy must reduce real gold. Never update an imagined inventory.
        auto buyTo=[&](Family family,Stat stat,unsigned targetCount)->bool{
            if(!enough(27000)||calls>=24)return false;
            const auto shard=bc::get_item_enum(family,stat);
            const auto info=shard.info();
            if(!info.purchasable||!info.cost||!info.combine_count||!info.result)return false;
            const auto emblem=*info.result;
            unsigned have=counts[shard]+info.combine_count*counts[emblem];
            while(have<targetCount){
                if(!enough(27000)||calls>=24)return false;
                const unsigned before=me.gold_count();
                const unsigned n=std::min({targetCount-have,before/info.cost,info.combine_count-counts[shard]%info.combine_count});
                if(!n||!me.can_buy(shard,n))return false;
                ++calls;ACT(me.buy(shard,n));
                ownItemsKnown=false;
                const unsigned after=me.gold_count();
                counts=me.item_count();
                const unsigned next=counts[shard]+info.combine_count*counts[emblem];
                if(after>=before||next<=have)return false;
                have=next;
            }
            return true;
        };
        for(const auto& step:core)if(!buyTo(step.family,step.stat,step.ingredients))return;
        const auto amount=[&](Family family,Stat stat){const auto shard=bc::get_item_enum(family,stat);const auto meta=shard.info();return counts[shard]+meta.combine_count*counts[*meta.result];};
        while(calls<24&&me.gold_count()>=30&&enough(29000)){
            if(true){
                const int type=static_cast<int>(myType);const auto& design=v1KitForType(type);const auto& stats=design.base_stats;
                bc::detail::champion_info current{};bc::detail::check(bc::detail::sdk_champion(static_cast<unsigned>(static_cast<bc::handle_champion_t>(me)),&current));
                const float hp=current.max_health,str=current.strength,foc=current.focus;
                const float shield=type==12?1.5f:type==10?2.5f:0;
                const float effective=hp+shield*foc;
                const auto dps=[&](float s,float f){
                    float cycle=0;
                    for(const auto& a:design.definition.abilities){
                        // Both slots can be used in an eight-turn stationary
                        // clear, on distinct turns. Never count two casts now.
                        if(a.kind==1)cycle+=s;
                        else if(a.kind>=2&&a.kind<=4||a.kind==6&&type==12)cycle+=f*v1DamageModifier(a);
                    }
                    return std::max(1.0f,s+cycle/8);
                };
                const float before=dps(str,foc);float best=-1;Family family=Family::bruiser;Stat chosen=damage;unsigned target=0;
                for(auto fam:{Family::bruiser,Family::power,Family::greed})for(auto stat:{damage,Stat::health}){
                    const auto shard=bc::get_item_enum(fam,stat);const auto meta=shard.info();
                    const auto emblem=bc::get_item_enum(fam,stat,false);const auto bonus=emblem.info();
                    const unsigned have=counts[shard],need=meta.combine_count-have;
                    if(fam==Family::greed&&me.gold_count()<need*meta.cost)continue;
                    const float extraH=(bonus.health_points-static_cast<int>(have)*meta.health_points)*stats.health_growth,extraS=(bonus.strength_points-static_cast<int>(have)*meta.strength_points)*stats.strength_growth,extraF=(bonus.focus_points-static_cast<int>(have)*meta.focus_points)*stats.focus_growth;
                    const float healthStrength=type==0?.01f*extraH:0;
                    const float value=(1.1*std::log1p((extraH+shield*extraF)/std::max(1.0f,effective))+std::log(dps(str+extraS+healthStrength,foc+extraF)/before))/std::max(1u,need);
                    if(value>best){best=value;family=fam;chosen=stat;target=amount(fam,stat)+need;}
                }
                if(target==0||!buyTo(family,chosen,target))return;
                continue;
            }
        }
    }catch(const TurnAbort&){throw;}catch(...){return;}
}
