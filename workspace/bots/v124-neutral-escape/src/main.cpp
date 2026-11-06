#include <cambc.h>
#include <iostream>
#include <cstdio>
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
            if(draft)play_draft();else {
                constexpr bool PROVOKE=true;
                auto& me=cambc::self();const auto w=cambc::map::width();
                const bool window=(w==50&&r0>=103&&r0<=108)||(w==60&&r0>=329&&r0<=334);
                if(window){
                    // Deliberate experiment: both arms pause ordinary own actions,
                    // so subsequent health changes can expose the neutral response.
                    if(PROVOKE && w==50 && r0==103 && me.champion_name()==cambc::champion_type::marcella && me.position()==cambc::vec2{22,24}){
                        auto target=cambc::vision::camp_at({24,20});me.abilities()[1].use(target);std::puts("neutral-demo: wake two monoliths");
                    }
                    if(PROVOKE && w==60 && r0==329 && me.champion_name()==cambc::champion_type::vesper_vale && me.position()==cambc::vec2{29,26}){
                        auto target=cambc::vision::camp_at({32,27});if(me.ward_cooldown()==0)me.place_ward(me.position());me.attack(target);me.abilities()[1].use(cambc::vec2{27,24});std::puts("neutral-demo: wake monolith then dash");
                    }
                    if(w==60 && r0==330 && me.champion_name()==cambc::champion_type::vesper_vale && me.position()==cambc::vec2{27,24})me.move_absolute({26,23});
                    for(auto p:cambc::vision::champion_tiles(cambc::team::enemy).positions()){
                        auto e=cambc::vision::champion_at(p);
                        std::printf("enemy-health %d %u %d %d %.2f\n",static_cast<int>(r0),static_cast<unsigned>(static_cast<cambc::handle_champion_t>(e)),p.x,p.y,e.health());
                    }
                }else bot.play_turn();
            }
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

int main() {
    std::puts("build v124-neutral-demo");
    return runBaseline();
}
