// General state-based policies inferred from public winning trajectories.
void Bot::metaAfterTurn(){
    if(stale||!inited||!enough(18000))return;
    auto& me=bc::self();if(!me.is_alive()||me.buffs().has_stun()||me.is_recalling()||me.is_submitting_gems()||me.is_teleporting())return;
    // Deny enemy banking whenever an owned lock can be placed for free after work.
    if(me.consumables()[bc::consumable_type::altar_lock].count()>0){
        const auto pos=me.position();
        for(const auto& a:altars)if(cheb(pos,a.pos)<=2){
            bc::detail::altar_lock_info lock{};
            const int code=bc::detail::sdk_altar_lock(a.pos.x,a.pos.y,bc::detail::absolute_team(team::ally),&lock);
            if(code==static_cast<int>(bc::error_code::api_not_found)||code==static_cast<int>(bc::error_code::api_not_in_vision)){
                try{ACT(me.consumables()[bc::consumable_type::altar_lock].use(a.pos));}catch(const TurnAbort&){throw;}catch(...){}
            }
            break;
        }
    }
    // Queue recovery after this turn's useful actions; cancel on the next turn
    // if there is no reason to finish it. Never vacate an unfinished capture.
    if(!capturing&&!lowMode&&!onSpawn()&&enough(15000)){
        try{ACT(me.recall());speculativeRecall=true;}catch(const TurnAbort&){throw;}catch(...){}
    }
}
