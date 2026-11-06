#include <cambc.h>
#include <iostream>
#include <cstdio>
#include "bot.h"
#include "draft.h"
#ifndef PHASE2_LOG
#define PHASE2_LOG 1
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
            if(r0!=r1)mm::invalidate_frame();
            // C++ stream formatting after the last action can itself exhaust
            // fuel. Use one bounded printf with the already known type ID.
            // Official native events remain the authoritative fuel count.
            if(remaining>=10000){
                if(r0!=r1)std::printf("suspended %d %d %s\n",static_cast<int>(r0),static_cast<int>(r1),bot.where());
                if(PHASE2_LOG&&(r1<=3||r0!=r1||mm::frame_aborted()||mm::frame_errors()||PHASE2_LOG>1))
                    std::printf("decision %d %d %s goal %d draft %d remaining %llu spent %llu yielded %d errors %d blocked %d\n",static_cast<int>(r1),bot.type_id(),bot.where(),bot.goal(),bot.draft_ready(),static_cast<unsigned long long>(remaining),static_cast<unsigned long long>(r0==r1&&f0>=remaining?f0-remaining:0),mm::frame_aborted(),mm::frame_errors(),mm::frame_blocked());
            }else if(mm::frame_errors()){
                std::printf("decision %d errors %d\n",static_cast<int>(r1),mm::frame_errors());
            }
        }
        cambc::end_turn();
    }
}

int runBoss();
int main() {
    std::puts("build codex-loss-fixes-2026-10-23");
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
