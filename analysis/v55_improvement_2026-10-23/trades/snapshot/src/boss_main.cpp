#include <cambc.h>
#include <iostream>
#include "boss/bot.h"
#include "boss/draft.h"
#ifndef PHASE2_LOG
#define PHASE2_LOG 1
#endif
int runBoss() {
    BossBot bot;
    while(true) {
        const bool draft=cambc::is_draft();
        const auto r0=cambc::round_number();
        const auto f0=cambc::fuel_remaining();
        try {
            if(draft)play_boss_draft(); else bot.play_turn();
        } catch(const boss::TurnAbort&) {
        } catch(const std::exception& e) {
            std::cout<<"bot error: "<<e.what()<<" round "<<cambc::round_number()<<" at "<<bot.where()<<std::endl;
        } catch(...) { std::cout<<"bot error: unknown"<<std::endl; }
        if(!draft) {
            const auto r1=cambc::round_number();
            const auto remaining=cambc::fuel_remaining();
            if(r0!=r1){boss::invalidate_frame();std::cout<<"suspended "<<r0<<" "<<r1<<" "<<bot.where()<<std::endl;}
            if(PHASE2_LOG && (r1<=3 || r0!=r1 || boss::frame_aborted() || boss::frame_errors() || PHASE2_LOG>1))
                std::cout<<"decision "<<r1<<" "<<static_cast<int>(cambc::self().champion_name())<<" "<<bot.where()<<" goal "<<bot.goal()<<" draft "<<bot.draft_ready()<<" remaining "<<remaining<<" spent "<<(r0==r1&&f0>=remaining?f0-remaining:0)<<" yielded "<<boss::frame_aborted()<<" errors "<<boss::frame_errors()<<" blocked "<<boss::frame_blocked()<<std::endl;
        }
        cambc::end_turn();
    }
}
