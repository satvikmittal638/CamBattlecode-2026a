#include <cambc.h>
#include <iostream>
#include "bot.h"
#include "draft.h"
#ifndef PHASE2_LOG
#define PHASE2_LOG 2
#endif
static int runBaseline() {
    Bot bot;
    while(true) {
        const bool draft=cambc::is_draft();
        const auto r0=cambc::round_number();
        const auto f0=cambc::fuel_remaining();
        try {
            if(draft)play_draft(); else bot.play_turn();
        } catch(const mm::TurnAbort&) {
        } catch(const std::exception& e) {
            std::cout<<"bot error: "<<e.what()<<" round "<<cambc::round_number()<<" at "<<bot.where()<<std::endl;
        } catch(...) { std::cout<<"bot error: unknown"<<std::endl; }
        if(!draft) {
            const auto r1=cambc::round_number();
            const auto remaining=cambc::fuel_remaining();
            if(r0!=r1){mm::invalidate_frame();std::cout<<"suspended "<<r0<<" "<<r1<<" "<<bot.where()<<std::endl;}
            if(PHASE2_LOG && (r1<=3 || r0!=r1 || mm::frame_aborted() || mm::frame_errors() || PHASE2_LOG>1))
                std::cout<<"decision "<<r1<<" "<<static_cast<int>(cambc::self().champion_name())<<" "<<bot.where()<<" goal "<<bot.goal()<<" draft "<<bot.draft_ready()<<" remaining "<<remaining<<" spent "<<(r0==r1&&f0>=remaining?f0-remaining:0)<<" yielded "<<mm::frame_aborted()<<" errors "<<mm::frame_errors()<<" blocked "<<mm::frame_blocked()<<std::endl;
        }
        cambc::end_turn();
    }
}

int runBoss();
int main() {
    if(cambc::is_draft()) {
        bool regular=false,boss=false;
        for(const auto& group:cambc::map::camp_groups())if(group.gem_value()>0) {
            bool monolith=false;for(const auto& camp:group.camps())monolith |= camp.is_monolith();
            if(monolith)boss=true;else regular=true;
        }
        if(boss && !regular)return runBoss();
    }else if(cambc::draft_memory.size()>19 && std::to_integer<unsigned char>(cambc::draft_memory[18])==0xB6 && std::to_integer<unsigned char>(cambc::draft_memory[19])==0x51) {
        return runBoss();
    }
    return runBaseline();
}
