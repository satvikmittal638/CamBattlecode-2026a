// A single optional basic must leave the attacker alive after immediate Ren
// retaliation. This is not an engagement evaluator or a multi-hit permission.
static bool v60SafeOptionalHit(const bc::champion& target){
    if(!enough(26000))return false;
    const auto& me=bc::self();
    bc::detail::champion_info victim{},own{};
    const auto targetId=static_cast<unsigned>(static_cast<bc::handle_champion_t>(target));
    const auto selfId=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    if(bc::detail::sdk_champion(targetId,&victim)||bc::detail::sdk_champion(selfId,&own))return false;
    float retaliation=victim.type==9?.2f*victim.focus:0;
    if(retaliation<=0)return true;
    unsigned items[84]{};bc::detail::buff_data buffs[3]{};unsigned n=0;
    if(bc::detail::sdk_champion_items(selfId,items)||bc::detail::sdk_champion_buff_data(selfId,buffs,3,&n))return false;
    if(items[13]||items[15]||items[17])retaliation*=.9f;
    float shield=0;for(unsigned k=0;k<std::min(n,3u);++k)if(buffs[k].type==0&&buffs[k].data.shield.duration>0)shield+=buffs[k].data.shield.value;
    return retaliation<own.health+shield-1;
}
