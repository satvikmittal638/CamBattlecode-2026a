#pragma once
#include <algorithm>
#include <cmath>
#include <vector>

namespace rules_policy {
struct CampThreat { int x, y, range; float strength; };
inline int distance(int ax,int ay,int bx,int by) { return std::max(std::abs(ax-bx),std::abs(ay-by)); }
inline float pressure(const std::vector<CampThreat>& camps,int x,int y) {
    float damage=0;
    for(const auto& c:camps)if(distance(x,y,c.x,c.y)<=c.range)damage+=c.strength;
    return damage;
}
inline int exit_depth(const std::vector<CampThreat>& camps,int x,int y) {
    int steps=0;
    for(const auto& c:camps)if(c.strength>0)steps=std::max(steps,c.range+1-distance(x,y,c.x,c.y));
    return steps;
}
// A cast can exclude walking. Budget the exit steps plus one attack phase,
// retaining the same 35% HP reserve used by emergency recovery. This is a
// conservative exposure estimate, not an assertion that terrain permits escape.
inline bool can_commit(float hp,float maxHp,float shield,float damage,int exitSteps) {
    return damage<=0 || hp+shield-damage*(std::max(0,exitSteps)+1)>=.35f*maxHp;
}
inline float interrupt_reach(unsigned kind,float range,float radius,int duration,
                             bool enhanced,int attackRange,int walking) {
    if(kind==1&&enhanced)return attackRange+walking;
    if(duration<=0)return 0;
    if(kind==4)return range;
    if(kind==3)return range+radius;
    if(kind==6)return range+radius+walking;
    return 0;
}
}
