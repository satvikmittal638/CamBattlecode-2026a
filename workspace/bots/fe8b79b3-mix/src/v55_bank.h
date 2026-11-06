// Same implementation is compiled into both strategy controllers.
bool Bot::removeBankLock(vec2 altar){
    if(!enough(28000))return true;
    auto& me=bc::self();
    for(const auto& lock:bc::vision::altar_locks(team::enemy)){
        if(lock.position()!=altar)continue;
        if(me.can_attack()&&cheb(me.position(),altar)<=me.attack_range()){
            ACT(me.attack(lock));attackedThisTurn=true;stage="bank-unlock";
            return bc::vision::altar_lock_tiles(team::enemy).is_set(altar);
        }
        if(me.can_move()&&enough(48000)){bc::bitboard approach;approach.draw_chebyshev(altar,me.attack_range());moveToward(approach,false);}
        return true;
    }
    return false;
}
bool Bot::startBank(vec2 altar){
    if(removeBankLock(altar))return true;
    if(lockedBank==altar&&round<lockedBankUntil){
        if(bc::self().can_move()&&enough(48000)){bc::bitboard approach;approach.draw_chebyshev(altar,1);moveToward(approach,false);}
        return true;
    }
    const bool started=ACT(([&](){const int code=bc::detail::sdk_submit_gems(altar.x,altar.y);
        if(code==static_cast<int>(bc::error_code::invalid_action_submit_gems_altar_locked)){
            lockedBank=altar;lockedBankUntil=round+8;stage="bank-lock-replan";return false;
        }
        bc::detail::check(code);return true;
    })());
    if(started){lockedBank={-1,-1};lockedBankUntil=0;}return true;
}
