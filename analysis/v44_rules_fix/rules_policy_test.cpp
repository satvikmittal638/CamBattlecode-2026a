#include "../../workspace/bots/rules-fix-v43/src/rules_policy.h"
#include <cassert>
#include <iostream>
int main() {
    using namespace rules_policy;
    const std::vector<CampThreat> boss{{0,0,5,200}};
    assert(pressure(boss,4,0)==200); // Original false-safe position.
    assert(pressure(boss,5,5)==200); // Chebyshev range includes diagonals.
    assert(pressure(boss,6,0)==0);
    assert(exit_depth(boss,4,0)==2);
    assert(exit_depth(boss,6,0)==0);
    assert(pressure({{0,0,3,20},{0,0,4,60}},4,0)==60); // Per-camp ranges.
    assert(!can_commit(600,1275,0,180,2));
    assert(can_commit(1275,1275,0,180,2));
    assert(!can_commit(400,1000,0,200,2));
    assert(can_commit(400,1000,600,200,2));
    assert(interrupt_reach(2,4,0,0,false,3,1)==0); // Ordinary damage does not cancel tribute.
    assert(interrupt_reach(4,4,0,1,false,3,1)==4);
    assert(interrupt_reach(3,4,1,1,false,1,1)==5);
    assert(interrupt_reach(6,2,1,1,false,1,0)==3);
    assert(interrupt_reach(6,2,1,1,false,1,1)==4);
    assert(interrupt_reach(6,2,1,0,false,1,1)==0); // Non-stunning dash.
    assert(interrupt_reach(1,0,0,0,true,1,1)==2);
    assert(interrupt_reach(1,0,0,0,false,3,1)==0); // Ordinary reset.
    std::cout << "18 rules-policy boundary checks passed\n";
}
